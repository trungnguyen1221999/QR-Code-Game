import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import { playerAPI } from '../utils/api';


// ── Constants ──────────────────────────────────────────────────
const CW = 375, CH = 375;
const PLAT_H   = 100;
const HERO_DIST = 10;
const PAD_X    = 100;
const PERFECT  = 10;
const HELPER_TOLERANCE = 18;
const SPD_STRETCH = 4, SPD_TURN = 4, SPD_WALK = 4, SPD_TRANS = 2, SPD_FALL = 2;
const HERO_W = 40;
const WIN_CHECKPOINTS = 20;

// ── Visual configs ─────────────────────────────────────────────
const CLOUD_CONFIG = [
  { base: 0.05, yRatio: 0.06, r: 50, speed: 28 },
  { base: 0.30, yRatio: 0.11, r: 37, speed: 18 },
  { base: 0.54, yRatio: 0.04, r: 60, speed: 23 },
  { base: 0.74, yRatio: 0.09, r: 44, speed: 31 },
  { base: 0.88, yRatio: 0.14, r: 34, speed: 21 },
  { base: 0.18, yRatio: 0.17, r: 30, speed: 27 },
];

const CROC_CONFIG = [
  { base: 0.10, speed: 22, flip: false },
  { base: 0.38, speed: 16, flip: true  },
  { base: 0.63, speed: 26, flip: false },
  { base: 0.82, speed: 19, flip: true  },
];


// ── Pure helpers ───────────────────────────────────────────────
const last = (a) => a[a.length - 1];

// ── Cute perfect sound ─────────────────────────────────────────
function playPerfectSound() {
  try {
    const AudioCtx = window.AudioContext || window['webkitAudioContext'];
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.2);
    });
    setTimeout(() => ctx.close(), 800);
  } catch { /* ignore */ }
}

function playBuddySound() {
  try {
    const AudioCtx = window.AudioContext || window['webkitAudioContext'];
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [[440, 520], [380, 480]].forEach(([start, end], i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
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
  platforms.push({ x: p.x + p.w + 40 + Math.floor(Math.random() * 160), w: 20 + Math.floor(Math.random() * 80) });
}

function mkTree(trees) {
  const lastX = trees.length ? last(trees).x : 0;
  const cols = ['#6D8821', '#8FAC34', '#98B333'];
  trees.push({ x: lastX + 30 + Math.floor(Math.random() * 120), color: cols[Math.floor(Math.random() * 3)] });
}

function drawFrame(ctx, g, w, h, heroImg, crocImg) {
  const t = Date.now() / 1000;
  ctx.clearRect(0, 0, w, h);

  // ── Sky (light blue) ──────────────────────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(0.6, '#B8E0F5');
  skyGrad.addColorStop(1, '#D8EFF8');
  ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h);

  // ── Clouds (drift right → left, time-based) ───────────────────
  CLOUD_CONFIG.forEach(({ base, yRatio, r, speed }) => {
    const totalW = w + r * 5;
    const cx = ((base * w - t * speed) % totalW + totalW) % totalW - r * 2;
    const cy = yRatio * h + r * 0.6;
    ctx.beginPath();
    ctx.arc(cx,           cy + r * 0.4, r,          0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy,           r * 0.78,   0, Math.PI * 2);
    ctx.arc(cx - r * 0.6, cy + r * 0.2, r * 0.65,  0, Math.PI * 2);
    ctx.arc(cx + r * 1.3, cy + r * 0.3, r * 0.55,  0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.93)';
    ctx.fill();
  });

  // ── World transform ───────────────────────────────────────────
  ctx.save();
  ctx.translate((w - CW) / 2 - g.sceneOffset, (h - CH) / 2);

  // ── Platforms (stone texture) ─────────────────────────────────
  g.platforms.forEach(({ x, w: pw, isFinal }) => {
    const platY = CH - PLAT_H;
    const platH = PLAT_H + (h - CH) / 2 + 30;

    // Base fill
    ctx.fillStyle = '#4D3833';
    ctx.fillRect(x, platY, pw, platH);

    // Horizontal stone block lines (every 18px)
    ctx.lineWidth = 1;
    for (let ly = platY + 18; ly < platY + platH; ly += 18) {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + pw, ly); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(x, ly + 1); ctx.lineTo(x + pw, ly + 1); ctx.stroke();
    }

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, platY, pw, 2);
    // Left shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x, platY, 2, platH);
    // Right edge
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + pw - 2, platY, 2, platH);

    // Perfect zone marker
    if (last(g.sticks).x < x) {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(x + pw / 2 - PERFECT / 2, CH - PLAT_H, PERFECT, PERFECT);
    }

    // Finish line flag
    if (isFinal) {
      const px = x + pw / 2, py = CH - PLAT_H;
      ctx.fillStyle = '#374151'; ctx.fillRect(px - 1, py - 55, 2, 55);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath(); ctx.moveTo(px + 1, py - 55); ctx.lineTo(px + 22, py - 46); ctx.lineTo(px + 1, py - 37); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1a1a2e'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('FINISH', px + 10, py - 58); ctx.textAlign = 'left';
    }
  });

  // ── Hero ──────────────────────────────────────────────────────
  if (heroImg?.complete && heroImg.naturalWidth > 0) {
    const heroH = HERO_W * (heroImg.naturalHeight / heroImg.naturalWidth);
    ctx.drawImage(heroImg, g.heroX - HERO_W / 2 - 10, g.heroY + CH - PLAT_H - heroH, HERO_W, heroH);
  }

  // ── Sticks ────────────────────────────────────────────────────
  g.sticks.forEach(({ x, length, rotation }) => {
    ctx.save();
    ctx.translate(x, CH - PLAT_H);
    ctx.rotate((Math.PI / 180) * rotation);
    ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = '#92400E';
    ctx.moveTo(0, 0); ctx.lineTo(0, -length); ctx.stroke();
    ctx.restore();
  });

  // ── Buddy bridge ──────────────────────────────────────────────
  if (g.buddyBridge) {
    ctx.save();
    ctx.setLineDash([5, 4]); ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(g.buddyBridge.from, CH - PLAT_H);
    ctx.lineTo(g.buddyBridge.to,   CH - PLAT_H);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  // ── Water (drawn over everything — covers column bases) ───────
  const waterY = Math.floor((h + CH) / 2) + 90;

  const wg = ctx.createLinearGradient(0, waterY, 0, h);
  wg.addColorStop(0,    '#2BACE2');
  wg.addColorStop(0.25, '#1490C8');
  wg.addColorStop(0.7,  '#0E6FA0');
  wg.addColorStop(1,    '#095A80');
  ctx.fillStyle = wg; ctx.fillRect(0, waterY, w, h - waterY);

  // Water surface wave
  ctx.beginPath(); ctx.moveTo(0, waterY);
  for (let i = 0; i <= w; i++) {
    ctx.lineTo(i, waterY + Math.sin(i * 0.04 + t * 1.6) * 4 + Math.sin(i * 0.09 - t * 0.8) * 2);
  }
  ctx.lineTo(w, waterY - 6); ctx.lineTo(0, waterY - 6);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();

  // Ripple lines
  for (let row = 0; row < 3; row++) {
    const ry = waterY + 18 + row * 18;
    ctx.beginPath();
    for (let i = 0; i <= w; i++) {
      const wy = ry + Math.sin(i * 0.06 + t * (1.2 - row * 0.3)) * 3;
      if (i === 0) ctx.moveTo(0, wy); else ctx.lineTo(i, wy);
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.14 - row * 0.03})`;
    ctx.lineWidth = 1.2; ctx.stroke();
  }

  // ── Crocodiles (croc.png: mouth left, tail right → native = moves left) ──
  if (crocImg?.complete && crocImg.naturalWidth > 0) {
    const crocW = 90;
    const crocH = crocW * (crocImg.naturalHeight / crocImg.naturalWidth);
    const cy = waterY - crocH * 0.65;
    CROC_CONFIG.forEach(({ base, speed, flip }) => {
      const totalW = w + crocW * 2;
      const cx = flip
        ? ((base * w + t * speed) % totalW + totalW) % totalW - crocW
        : ((base * w - t * speed) % totalW + totalW) % totalW - crocW;
      ctx.save();
      if (flip) {
        ctx.translate(cx + crocW / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(crocImg, -crocW / 2, cy, crocW, crocH);
      } else {
        ctx.drawImage(crocImg, cx, cy, crocW, crocH);
      }
      ctx.restore();
    });
  }
}

function initState(lives = 1, buddyCount = 0) {
  const platforms = [{ x: 50, w: 50 }];
  for (let i = 0; i < 45; i++) mkPlatform(platforms);
  platforms[WIN_CHECKPOINTS].isFinal = true;
  const trees = [];
  for (let i = 0; i < 10; i++) mkTree(trees);
  return {
    phase: 'waiting',
    lastTimestamp: undefined,
    heroX: platforms[0].x + platforms[0].w - HERO_DIST,
    heroY: 0,
    sceneOffset: 0,
    platforms, sticks: [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }],
    trees, lives, buddyCount,
    currentPlatformIdx: 0,
    buddyBridge: null,
    buddyUsed: false,
  };
}

// ── Component ──────────────────────────────────────────────────
export default function FinalChallenge() {
  useBlockBack();
  const navigate = useNavigate();
  const location = useLocation();

  const initLives = location.state?.lives      ?? 1;
  const initBuddy = location.state?.buddyCount ?? 0;

  const canvasRef  = useRef(null);
  const gRef       = useRef(initState(initLives, initBuddy));
  const rafRef     = useRef(null);
  const bgRafRef   = useRef(null);
  const heroImgRef = useRef(null);
  const reptileRef = useRef(null);
  const scoreRef   = useRef(0);

  const [lives, setLives]               = useState(initLives);
  const [buddyCount, setBuddyCount]     = useState(initBuddy);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [score, setScore]               = useState(0);
  const [scorePopup, setScorePopup]     = useState(null);
  const [scoreVisible, setScoreVisible] = useState(false);
  const [showIntro, setShowIntro]       = useState(true);
  const [perfectMsg, setPerfectMsg]     = useState(false);
  const [rewardMsg, setRewardMsg]       = useState(null);
  const [lostLife, setLostLife]         = useState(false);
  const [showBuddy, setShowBuddy]       = useState(false);
  const [gameOver, setGameOver]         = useState(false);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawFrame(c.getContext('2d'), gRef.current, c.width, c.height, heroImgRef.current, reptileRef.current);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => redraw();
    img.src = '/games/finalGame/finalgamecapybara.png';
    heroImgRef.current = img;
  }, [redraw]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => { reptileRef.current = img; redraw(); };
    img.src = '/croc.png';
  }, [redraw]);

  const platformHit = useCallback(() => {
    const g = gRef.current;
    const stick = last(g.sticks);
    if (stick.rotation !== 90) return [undefined, false, false];
    const farX = stick.x + stick.length;
    const tol  = g.buddyCount > 0 ? HELPER_TOLERANCE : 0;
    const hit  = g.platforms.find(p => p.x - tol < farX && farX < p.x + p.w);
    const perfect     = !!hit && Math.abs(farX - (hit.x + hit.w / 2)) < PERFECT / 2;
    const buddyHelped = !!hit && g.buddyCount > 0 && farX < hit.x;
    return [hit, perfect, buddyHelped];
  }, []);

  const restoreAfterFall = useCallback(() => {
    const g = gRef.current;
    g.lives -= 1; setLives(g.lives);
    if (g.lives <= 0) {
      setGameOver(true);
      const ps = JSON.parse(localStorage.getItem('playerSession') || 'null');
      const psId = ps?.id || ps?._id;
      if (psId) playerAPI.finish(psId, { score: scoreRef.current }).catch(() => {});
      return;
    }
    setLostLife(true);
    const curPlat = g.platforms[g.currentPlatformIdx];
    g.sticks.pop();
    g.sticks.push({ x: curPlat.x + curPlat.w, length: 0, rotation: 0 });
    g.heroX = curPlat.x + curPlat.w - HERO_DIST;
    g.heroY = 0; g.phase = 'waiting'; g.lastTimestamp = undefined;
    redraw();
    setTimeout(() => setLostLife(false), 800);
  }, [redraw]);

  const animate = useCallback((ts) => {
    const g = gRef.current;
    const c = canvasRef.current;
    if (!g.lastTimestamp) { g.lastTimestamp = ts; rafRef.current = requestAnimationFrame(animate); return; }
    const dt = ts - g.lastTimestamp;

    switch (g.phase) {
      case 'waiting': return;
      case 'stretching': last(g.sticks).length += dt / SPD_STRETCH; break;
      case 'turning': {
        last(g.sticks).rotation += dt / SPD_TURN;
        if (last(g.sticks).rotation > 90) {
          last(g.sticks).rotation = 90;
          const [hit, perfect, buddyHelped] = platformHit();
          if (hit) {
            // ── Score ──────────────────────────────────────────
            const hitIdx = g.platforms.indexOf(hit);
            const cols = Math.max(1, hitIdx - g.currentPlatformIdx);
            const basePoints = cols * 10 + Math.max(0, cols - 1) * 25;
            const points = perfect ? basePoints * 2 : basePoints;
            scoreRef.current += points; setScore(scoreRef.current);
            const praise = cols >= 5 ? '🔥 LEGENDARY!' : cols === 4 ? '🤩 Incredible!' : cols === 3 ? '😲 Amazing!' : cols === 2 ? '👏 Good job!' : null;
            setScorePopup({ total: `+${points}`, base: cols, extra: cols - 1, praise, doubled: perfect }); setScoreVisible(true);
            setTimeout(() => setScoreVisible(false), 1800);
            setTimeout(() => setScorePopup(null), 2000);

            if (perfect) {
              let reward = null;
              if (Math.random() < 0.20) {
                if (Math.random() < 0.5) { g.lives += 1; setLives(g.lives); reward = '+1 ❤️ Extra Life!'; }
                else { g.buddyCount += 1; setBuddyCount(g.buddyCount); reward = '+1 🌉 Buddy Save!'; }
              }
              setPerfectMsg(true); setTimeout(() => setPerfectMsg(false), 1200); playPerfectSound();
              if (reward) { setRewardMsg(reward); setTimeout(() => setRewardMsg(null), 2000); }
            }
            if (buddyHelped) {
              // Defer decrement to transitioning — decrementing here breaks platformHit tol during walking
              g.buddyUsed = true;
              const farX = last(g.sticks).x + last(g.sticks).length;
              g.buddyBridge = { from: farX, to: hit.x };
              setShowBuddy(true); setTimeout(() => setShowBuddy(false), 1500); playBuddySound();
            }
            mkPlatform(g.platforms); mkTree(g.trees); mkTree(g.trees);
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
          setCurrentIdx(g.currentPlatformIdx);
          g.sticks.push({ x: hit.x + hit.w, length: 0, rotation: 0 });
          g.buddyBridge = null;
          if (g.buddyUsed) { g.buddyUsed = false; g.buddyCount -= 1; setBuddyCount(g.buddyCount); }
          if (g.currentPlatformIdx >= WIN_CHECKPOINTS) {
            cancelAnimationFrame(rafRef.current); redraw();
            // Submit score + finishedAt to backend
            const ps = JSON.parse(localStorage.getItem('playerSession') || 'null');
            const psId = ps?.id || ps?._id;
            if (psId) {
              playerAPI.finish(psId, { score: scoreRef.current, finishedAt: new Date().toISOString() }).catch(() => {});
            }
            navigate('/final-win', { replace: true });
            return;
          }
          g.phase = 'waiting';
        }
        break;
      }
      case 'falling': {
        if (last(g.sticks).rotation < 180) last(g.sticks).rotation += dt / SPD_TURN;
        g.heroY += dt / SPD_FALL;
        const h = c?.height || window.innerHeight;
        if (g.heroY > PLAT_H + 100 + (h - CH) / 2) { restoreAfterFall(); return; }
        break;
      }
      default: return;
    }

    redraw(); g.lastTimestamp = ts;
    rafRef.current = requestAnimationFrame(animate);
  }, [platformHit, redraw, restoreAfterFall]);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    gRef.current = initState(initLives, initBuddy);
    scoreRef.current = 0;
    setLives(initLives); setBuddyCount(initBuddy); setCurrentIdx(0); setScore(0); setScorePopup(null); setScoreVisible(false);
    setShowIntro(true); setPerfectMsg(false); setLostLife(false);
    setShowBuddy(false); setGameOver(false);
    redraw();
  }, [redraw, initLives, initBuddy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; redraw(); };
    resize(); startGame();

    // Background loop — keeps clouds & water animating during waiting phase
    const bgLoop = () => {
      bgRafRef.current = requestAnimationFrame(bgLoop);
      if (gRef.current.phase === 'waiting') redraw();
    };
    bgRafRef.current = requestAnimationFrame(bgLoop);

    const onDown = (e) => {
      if (e.target !== canvas) return;
      const g = gRef.current;
      if (g.phase === 'waiting') {
        g.lastTimestamp = undefined; setShowIntro(false);
        g.phase = 'stretching'; rafRef.current = requestAnimationFrame(animate);
      }
    };
    const onUp = () => { if (gRef.current.phase === 'stretching') gRef.current.phase = 'turning'; };

    window.addEventListener('mousedown',  onDown);
    window.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);
    window.addEventListener('resize',     resize);

    return () => {
      if (rafRef.current)   cancelAnimationFrame(rafRef.current);
      if (bgRafRef.current) cancelAnimationFrame(bgRafRef.current);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('touchend',   onUp);
      window.removeEventListener('resize',     resize);
    };
  }, [animate, redraw, startGame]);

  const goToLeaderboard = useCallback(() => navigate('/live-leaderboard'), [navigate]);

  return (
    <div className="fixed inset-0 select-none" style={{ cursor: 'pointer', touchAction: 'none' }}>
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Lives + Score */}
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <div className="text-xl tracking-wide">
          {lives === Infinity ? '❤️ ∞' : '❤️'.repeat(Math.max(0, lives))}
        </div>
        <div className="text-sm font-black px-3 py-1 rounded-full w-fit"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#FFD700' }}>
          ⭐ {score}
        </div>
      </div>

      {/* Column progress */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
        <div className="text-sm font-black px-3 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}>
          🏁 {currentIdx} / {WIN_CHECKPOINTS}
        </div>
        {buddyCount > 0 && (
          <div className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff' }}>
            🌉 {buddyCount}
          </div>
        )}
      </div>

      {/* Intro hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: showIntro ? 1 : 0, transition: 'opacity 2s' }}>
        <p className="text-sm font-bold text-center w-48 leading-relaxed" style={{ color: '#1a1a2e' }}>
          Tap &amp; hold to stretch the stick
        </p>
      </div>

      {/* Perfect message */}
      <div className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
        style={{ top: '20%', opacity: perfectMsg ? 1 : 0, transition: 'opacity 1.2s' }}>
        {perfectMsg && <p className="text-2xl font-black" style={{ color: '#E8730A' }}>PERFECT!</p>}
      </div>

      {/* Score popup */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none"
        style={{ paddingBottom: 120, opacity: scoreVisible ? 1 : 0, transition: 'opacity 0.5s ease-out' }}>
        {scorePopup && (<>
          {scorePopup.base > 1 && (
            <div className="flex flex-wrap justify-center gap-1 px-2 max-w-xs">
              {Array(scorePopup.base).fill(null).map((_, i) => (
                <span key={`b${i}`} className="text-base font-black px-2 py-0.5"
                  style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>+10</span>
              ))}
              {Array(scorePopup.extra).fill(null).map((_, i) => (
                <span key={`e${i}`} className="text-base font-black px-2 py-0.5"
                  style={{ color: '#FF6B35', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>+25🔥</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black px-4 py-1 rounded-xl"
              style={{ color: '#FFD700', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
              {scorePopup.total}
            </p>
            {scorePopup.doubled && (
              <span className="text-sm font-black px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: '#E8730A', color: '#fff' }}>x2</span>
            )}
          </div>
          {scorePopup.praise && (
            <p className="text-lg font-black px-4 py-1 rounded-xl"
              style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              {scorePopup.praise}
            </p>
          )}
        </>)}
      </div>

      {/* Reward bonus message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingTop: 80, opacity: rewardMsg ? 1 : 0, transition: 'opacity 0.4s' }}>
        {rewardMsg && (
          <p className="text-lg font-black px-4 py-2 rounded-2xl"
            style={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {rewardMsg}
          </p>
        )}
      </div>

      {/* Buddy helped overlay */}
      <div className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
        style={{ bottom: '25%', opacity: showBuddy ? 1 : 0, transition: 'opacity 1s' }}>
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
          <p className="text-2xl font-black text-white">You failed to meet the prophecy of Tapio</p>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); goToLeaderboard(); }}
            className="w-48 py-3 rounded-2xl font-bold text-white text-base"
            style={{ backgroundColor: '#22C55E' }}>
            See leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
