import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────
const CW = 375, CH = 375;
const PLAT_H   = 100;
const HERO_DIST = 10;
const PAD_X    = 100;
const PERFECT  = 10;
const HELPER_TOLERANCE = 18; // extra px forgiven with Bridge Buddy
const BG_MULT  = 0.2;
const H1_BASE = 100, H1_AMP = 10, H1_STR = 1;
const H2_BASE = 70,  H2_AMP = 20, H2_STR = 0.5;
const SPD_STRETCH = 4, SPD_TURN = 4, SPD_WALK = 4, SPD_TRANS = 2, SPD_FALL = 2;
const HERO_W = 40;

// ── Pure helpers ───────────────────────────────────────────────
const sin  = (deg) => Math.sin((deg / 180) * Math.PI);
const last = (a)   => a[a.length - 1];

// ── Cute perfect sound (Web Audio API synth) ───────────────────
function playPerfectSound() {
  try {
    const AudioCtx = window.AudioContext || window['webkitAudioContext'];
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Two cute ascending chirps: C5 → E5 → G5 → C6
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.start(t);
      osc.stop(t + 0.2);
    });

    // Close context after sounds finish
    setTimeout(() => ctx.close(), 800);
  } catch {
    // ignore if audio not supported
  }
}

function playBuddySound() {
  try {
    const AudioCtx = window.AudioContext || window['webkitAudioContext'];
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    // Soft whoosh: descending then rising tone
    [[440, 520], [380, 480]].forEach(([start, end], i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(start, t);
      osc.frequency.linearRampToValueAtTime(end, t + 0.2);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.28);
    });
    setTimeout(() => ctx.close(), 700);
  } catch { /* ignore */ }
}

function mkPlatform(platforms) {
  const p = last(platforms);
  platforms.push({
    x: p.x + p.w + 40 + Math.floor(Math.random() * 160),
    w: 20 + Math.floor(Math.random() * 80),
  });
}

function mkTree(trees) {
  const lastX = trees.length ? last(trees).x : 0;
  const cols  = ['#6D8821', '#8FAC34', '#98B333'];
  trees.push({ x: lastX + 30 + Math.floor(Math.random() * 120), color: cols[Math.floor(Math.random() * 3)] });
}

function hillY(sceneOffset, wx, h, base, amp, stretch) {
  return sin((sceneOffset * BG_MULT + wx) * stretch) * amp + (h - base);
}

function drawFrame(ctx, g, w, h, heroImg) {
  ctx.clearRect(0, 0, w, h);

  // Sky
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#BBD691'); grad.addColorStop(1, '#FEF1E1');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

  // Hills
  for (const [base, amp, stretch, color] of [
    [H1_BASE, H1_AMP, H1_STR, '#95C629'],
    [H2_BASE, H2_AMP, H2_STR, '#659F1C'],
  ]) {
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let i = 0; i <= w; i++) ctx.lineTo(i, hillY(g.sceneOffset, i, h, base, amp, stretch));
    ctx.lineTo(w, h); ctx.fillStyle = color; ctx.fill();
  }

  // Trees
  g.trees.forEach(({ x, color }) => {
    ctx.save();
    ctx.translate((-g.sceneOffset * BG_MULT + x) * H1_STR, sin(x) * H1_AMP + (h - H1_BASE));
    ctx.fillStyle = '#7D833C'; ctx.fillRect(-1, -5, 2, 5);
    ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(0, -30); ctx.lineTo(5, -5);
    ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  });

  ctx.save();
  ctx.translate((w - CW) / 2 - g.sceneOffset, (h - CH) / 2);

  // Platforms
  g.platforms.forEach(({ x, w: pw }) => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, CH - PLAT_H, pw, PLAT_H + (h - CH) / 2);
    if (last(g.sticks).x < x) {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(x + pw / 2 - PERFECT / 2, CH - PLAT_H, PERFECT, PERFECT);
    }
  });

  // Hero
  if (heroImg?.complete && heroImg.naturalWidth > 0) {
    const heroH = HERO_W * (heroImg.naturalHeight / heroImg.naturalWidth);
    ctx.drawImage(heroImg, g.heroX - HERO_W / 2 - 10, g.heroY + CH - PLAT_H - heroH, HERO_W, heroH);
  }

  // Sticks
  g.sticks.forEach(({ x, length, rotation }) => {
    ctx.save();
    ctx.translate(x, CH - PLAT_H);
    ctx.rotate((Math.PI / 180) * rotation);
    ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = '#1a1a2e';
    ctx.moveTo(0, 0); ctx.lineTo(0, -length); ctx.stroke();
    ctx.restore();
  });

  // Buddy bridge — white dashed gap fill
  if (g.buddyBridge) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(g.buddyBridge.from, CH - PLAT_H);
    ctx.lineTo(g.buddyBridge.to, CH - PLAT_H);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function initState(lives = 1, x3score = false, helper = false) {
  const platforms = [{ x: 50, w: 50 }];
  for (let i = 0; i < 4; i++) mkPlatform(platforms);
  const trees = [];
  for (let i = 0; i < 10; i++) mkTree(trees);
  return {
    phase: 'waiting',
    lastTimestamp: undefined,
    heroX: platforms[0].x + platforms[0].w - HERO_DIST,
    heroY: 0,
    sceneOffset: 0,
    platforms,
    sticks: [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }],
    trees,
    score: 0,
    lives,
    x3score,
    helper,
    currentPlatformIdx: 0,
  };
}

// ── Component ──────────────────────────────────────────────────
export default function FinalChallenge() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const initLives   = location.state?.lives   ?? 1;
  const initX3Score = location.state?.x3score ?? false;
  const initHelper  = location.state?.helper  ?? false;

  const canvasRef  = useRef(null);
  const gRef       = useRef(initState(initLives, initX3Score, initHelper));
  const rafRef     = useRef(null);
  const heroImgRef = useRef(null);

  const [score, setScore]             = useState(0);
  const [lives, setLives]             = useState(initLives);
  const [showIntro, setShowIntro]     = useState(true);
  const [perfectMsg, setPerfectMsg]   = useState(null); // null | 'double' | 'triple'
  const [lostLife, setLostLife]       = useState(false);
  const [showBuddy, setShowBuddy]     = useState(false);
  const [gameOver, setGameOver]       = useState(false);
  const [finalScore, setFinalScore]   = useState(0);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawFrame(c.getContext('2d'), gRef.current, c.width, c.height, heroImgRef.current);
  }, []);

  // Preload hero image — redraw once loaded so hero shows immediately
  useEffect(() => {
    const img = new Image();
    img.onload = () => redraw();
    img.src = '/games/finalGame/finalgamecapybara.png';
    heroImgRef.current = img;
  }, [redraw]);

  const platformHit = useCallback(() => {
    const g    = gRef.current;
    const stick = last(g.sticks);
    if (stick.rotation !== 90) return [undefined, false];
    const farX = stick.x + stick.length;
    const tol  = g.helper ? HELPER_TOLERANCE : 0;
    const hit  = g.platforms.find(p => p.x - tol < farX && farX < p.x + p.w);
    const perfect     = !!hit && Math.abs(farX - (hit.x + hit.w / 2)) < PERFECT / 2;
    const buddyHelped = !!hit && g.helper && farX < hit.x; // landed short, buddy bridged the gap
    return [hit, perfect, buddyHelped];
  }, []);

  const restoreAfterFall = useCallback(() => {
    const g = gRef.current;
    g.lives -= 1;
    setLives(g.lives);

    if (g.lives <= 0) {
      setFinalScore(g.score);
      setGameOver(true);
      return;
    }

    // Flash red then restore position
    setLostLife(true);
    const curPlat = g.platforms[g.currentPlatformIdx];
    g.sticks.pop();
    g.sticks.push({ x: curPlat.x + curPlat.w, length: 0, rotation: 0 });
    g.heroX = curPlat.x + curPlat.w - HERO_DIST;
    g.heroY = 0;
    g.phase = 'waiting';
    g.lastTimestamp = undefined;
    redraw();
    setTimeout(() => setLostLife(false), 800);
  }, [redraw]);

  const animate = useCallback((ts) => {
    const g = gRef.current;
    const c = canvasRef.current;

    if (!g.lastTimestamp) {
      g.lastTimestamp = ts;
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    const dt = ts - g.lastTimestamp;

    switch (g.phase) {
      case 'waiting': return;

      case 'stretching':
        last(g.sticks).length += dt / SPD_STRETCH;
        break;

      case 'turning': {
        last(g.sticks).rotation += dt / SPD_TURN;
        if (last(g.sticks).rotation > 90) {
          last(g.sticks).rotation = 90;
          const [hit, perfect, buddyHelped] = platformHit();
          if (hit) {
            const multiplier = perfect ? (g.x3score ? 3 : 2) : 1;
            g.score += multiplier;
            setScore(g.score);
            if (perfect) {
              setPerfectMsg(g.x3score ? 'triple' : 'double');
              setTimeout(() => setPerfectMsg(null), 1200);
              playPerfectSound();
            }
            if (buddyHelped) {
              const farX = last(g.sticks).x + last(g.sticks).length;
              g.buddyBridge = { from: farX, to: hit.x };
              setShowBuddy(true);
              setTimeout(() => { setShowBuddy(false); }, 1500);
              playBuddySound();
            }
            mkPlatform(g.platforms);
            mkTree(g.trees);
            mkTree(g.trees);
          }
          g.phase = 'walking';
        }
        break;
      }

      case 'walking': {
        g.heroX += dt / SPD_WALK;
        const [hit] = platformHit();
        if (hit) {
          const maxX = hit.x + hit.w - HERO_DIST;
          if (g.heroX > maxX) { g.heroX = maxX; g.phase = 'transitioning'; }
        } else {
          const maxX = last(g.sticks).x + last(g.sticks).length + HERO_W;
          if (g.heroX > maxX) { g.heroX = maxX; g.phase = 'falling'; }
        }
        break;
      }

      case 'transitioning': {
        g.sceneOffset += dt / SPD_TRANS;
        const [hit] = platformHit();
        if (hit && g.sceneOffset > hit.x + hit.w - PAD_X) {
          g.currentPlatformIdx = g.platforms.indexOf(hit);
          g.sticks.push({ x: hit.x + hit.w, length: 0, rotation: 0 });
          g.buddyBridge = null;
          g.phase = 'waiting';
        }
        break;
      }

      case 'falling': {
        if (last(g.sticks).rotation < 180)
          last(g.sticks).rotation += dt / SPD_TURN;
        g.heroY += dt / SPD_FALL;
        const h = c?.height || window.innerHeight;
        if (g.heroY > PLAT_H + 100 + (h - CH) / 2) {
          restoreAfterFall();
          return;
        }
        break;
      }

      default: return;
    }

    redraw();
    g.lastTimestamp = ts;
    rafRef.current = requestAnimationFrame(animate);
  }, [platformHit, redraw, restoreAfterFall]);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    gRef.current = initState(initLives, initX3Score, initHelper);
    setScore(0);
    setLives(initLives);
    setShowIntro(true);
    setPerfectMsg(null);
    setLostLife(false);
    setShowBuddy(false);
    setGameOver(false);
    redraw();
  }, [redraw, initLives, initX3Score, initHelper]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; redraw(); };
    resize();
    startGame();

    const onDown = (e) => {
      if (e.target !== canvas) return;
      const g = gRef.current;
      if (g.phase === 'waiting') {
        g.lastTimestamp = undefined;
        setShowIntro(false);
        g.phase = 'stretching';
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    const onUp = () => { if (gRef.current.phase === 'stretching') gRef.current.phase = 'turning'; };

    window.addEventListener('mousedown',  onDown);
    window.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);
    window.addEventListener('resize',     resize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('touchend',   onUp);
      window.removeEventListener('resize',     resize);
    };
  }, [animate, redraw, startGame]);

  // Hearts string
  const heartsDisplay = Array.from({ length: initLives }, (_, i) => i < lives ? '❤️' : '🖤').join('');

  return (
    <div className="fixed inset-0 select-none" style={{ cursor: 'pointer', touchAction: 'none' }}>
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Score */}
      <div className="absolute top-6 right-6 text-3xl font-black" style={{ color: '#1a1a2e' }}>
        {score}
      </div>

      {/* Lives */}
      <div className="absolute top-6 left-6 text-xl tracking-wide">
        {heartsDisplay}
      </div>

      {/* Intro hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: showIntro ? 1 : 0, transition: 'opacity 2s' }}>
        <p className="text-sm font-bold text-center w-48 leading-relaxed" style={{ color: '#1a1a2e' }}>
          Tap &amp; hold to stretch the stick
        </p>
      </div>

      {/* Perfect message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none"
        style={{ opacity: perfectMsg ? 1 : 0, transition: 'opacity 1.2s' }}>
        <p className="text-2xl font-black" style={{ color: '#E8730A' }}>PERFECT!</p>
        <p className="text-lg font-black" style={{ color: '#E8730A' }}>
          {perfectMsg === 'triple' ? 'TRIPLE SCORE!' : 'DOUBLE SCORE!'}
        </p>
      </div>

      {/* Buddy helped overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none"
        style={{ opacity: showBuddy ? 1 : 0, transition: 'opacity 1s' }}>
        <p className="text-xl font-black" style={{ color: 'red', textShadow: '0 0 8px rgba(255,255,255,0.8)' }}>
          🌉 Buddy saves you!
        </p>
      </div>

      {/* Lost life flash */}
      {lostLife && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(239,68,68,0.25)' }}>
          <p className="text-5xl">💔</p>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <p className="text-5xl">💀</p>
          <p className="text-2xl font-black text-white">Game Over</p>
          <p className="text-4xl font-black" style={{ color: '#FCD34D' }}>{finalScore}</p>
          <p className="text-sm text-white opacity-70">points</p>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); navigate('/live-leaderboard', { state: { finalScore } }); }}
            className="w-48 py-3 rounded-2xl font-bold text-white text-base"
            style={{ backgroundColor: '#22C55E' }}
          >
            See leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
