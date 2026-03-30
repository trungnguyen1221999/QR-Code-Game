import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, Camera, Trophy, LogOut, ScanLine, Clock } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';
import Card from '../components/ui/Card';

const TOTAL_SECONDS = 30 * 60;
const TOTAL_CHECKPOINTS = 6;
const DEFAULT_COINS = 0;

function getLivesForDifficulty(difficulty) {
  if (difficulty === 'easy')   return Infinity;
  if (difficulty === 'normal') return 5;
  return 3; // hard
}
const PLAYER_PROGRESS_KEY = 'playerGameProgress';

function getCheckpointRoute(checkpoint) {
  // if (checkpoint === 1) return '/memory-game';
  if (checkpoint === 1) return '/tower-builder';
  if (checkpoint === 2) return '/whack-a-mole';
  if (checkpoint === 3) return '/combined-word-quiz';
  if (checkpoint === 4) return '/memory-game';
  if (checkpoint === 5) return '/puzzle-game';
  if (checkpoint === 6) return '/simon-game';
  return '/memory-game';
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getRemainingSessionSeconds(expiresAt, fallback = TOTAL_SECONDS) {
  if (!expiresAt) return fallback;

  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
  );

  return Number.isFinite(remainingSeconds) ? remainingSeconds : fallback;
}

function readSavedProgress(defaultLife) {
  const raw = localStorage.getItem(PLAYER_PROGRESS_KEY);
  if (!raw) {
    return {
      hasSavedProgress: false,
      completed: 0,
      current: 1,
      life: defaultLife,
      coins: DEFAULT_COINS,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      hasSavedProgress: true,
      completed: parsed.completed ?? 0,
      current: parsed.current ?? 1,
      life: parsed.life ?? defaultLife,
      coins: parsed.coins ?? DEFAULT_COINS,
    };
  } catch {
    return {
      hasSavedProgress: false,
      completed: 0,
      current: 1,
      life: defaultLife,
      coins: DEFAULT_COINS,
    };
  }
}

function saveProgress(progress) {
  localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(progress));
}

function clearProgress() {
  localStorage.removeItem(PLAYER_PROGRESS_KEY);
}

function ScanningOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <style>{`
        @keyframes scan-line { 0%{top:5%} 50%{top:90%} 100%{top:5%} }
        .scan-line-full { position:absolute; left:0; right:0; height:3px; background:#22C55E; animation: scan-line 1.8s linear infinite; box-shadow: 0 0 12px #22C55E, 0 0 24px #22C55E; }
        @keyframes pulse-corner { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .corner-pulse { animation: pulse-corner 1.2s ease-in-out infinite; }
      `}</style>

      <p className="text-white text-lg font-bold tracking-wide">Point at QR code</p>

      {/* Large viewfinder */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ width: '84vw', maxWidth: 340, height: '84vw', maxHeight: 340, border: '2px solid rgba(255,255,255,0.3)' }}>
        {/* Dark corners overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
        <div className="scan-line-full" />
        {/* Corner accents */}
        <div className="corner-pulse absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: '#22C55E' }} />
        <div className="corner-pulse absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: '#22C55E' }} />
        <div className="corner-pulse absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: '#22C55E' }} />
        <div className="corner-pulse absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: '#22C55E' }} />
      </div>

      <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>Scanning... please wait</p>
    </div>
  );
}

export default function PlayerGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const player = JSON.parse(localStorage.getItem('player') || 'null');
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  const DEFAULT_LIFE = getLivesForDifficulty(session?.difficulty);
  const initialProgress = readSavedProgress(DEFAULT_LIFE);
  const shouldSkipProgressRefresh = !!(location.state?.justCompleted || location.state?.wrongAnswer);

  const [timeLeft, setTimeLeft] = useState(() => getRemainingSessionSeconds(session?.expiresAt, TOTAL_SECONDS));
  const [showExitPopup, setShowExitPopup] = useState(false);
const [showHostEndedPopup, setShowHostEndedPopup] = useState(false);
  const [hostEndedCountdown, setHostEndedCountdown] = useState(5);
  const [scanning, setScanning] = useState(false);
  const introKey = `introPlayed_${session?.id || session?._id}`;

  // Redirect to intro page if not yet played
  useEffect(() => {
    if (!sessionStorage.getItem(introKey)) {
      navigate('/intro', { replace: true });
    }
  }, []);

  // Track completed checkpoints; accept update from challenge page
  const [completed, setCompleted] = useState(initialProgress.completed);
  const [current, setCurrent] = useState(initialProgress.current);
  const [life, setLife] = useState(initialProgress.life);
  const [coins, setCoins] = useState(initialProgress.coins);

  useEffect(() => {
    saveProgress({ completed, current, life, coins });
  }, [coins, completed, current, life]);

  useEffect(() => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;

    const loadProgress = async () => {
      try {
        const [playerSessionData, sessionData] = await Promise.all([
          playerSessionId ? playerAPI.getById(playerSessionId) : Promise.resolve(null),
          sessionId ? sessionAPI.getById(sessionId) : Promise.resolve(null),
        ]);

        if (!shouldSkipProgressRefresh && playerSessionData && !initialProgress.hasSavedProgress) {
          const completedCount = playerSessionData.currentCheckpointIndex ?? 0;
          setCompleted(completedCount);
          setCurrent(Math.min(completedCount + 1, TOTAL_CHECKPOINTS + 1));
          setLife(DEFAULT_LIFE === Infinity ? Infinity : (playerSessionData.lives ?? DEFAULT_LIFE));
          setCoins(playerSessionData.money ?? DEFAULT_COINS);
        }

        const expiresAt = sessionData?.expiresAt || session?.expiresAt;
        setTimeLeft(getRemainingSessionSeconds(expiresAt, TOTAL_SECONDS));
      } catch {
        setTimeLeft((currentValue) => {
          if (currentValue !== TOTAL_SECONDS) return currentValue;
          return getRemainingSessionSeconds(session?.expiresAt, TOTAL_SECONDS);
        });
      }
    };

    loadProgress();
  }, [
    initialProgress.hasSavedProgress,
    playerSession?._id,
    playerSession?.id,
    session?._id,
    session?.id,
    session?.expiresAt,
    shouldSkipProgressRefresh,
  ]);

  // Apply result coming back from challenge page
  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.resultId) {
      const processedKey = `player-game-result:${state.resultId}`;
      if (sessionStorage.getItem(processedKey)) return;
      sessionStorage.setItem(processedKey, '1');
    }
    if (state.justCompleted) {
      setCompleted((value) => {
        const nextCompleted = state.completedCheckpoint ?? (value + 1);
        return Math.min(Math.max(value, nextCompleted), TOTAL_CHECKPOINTS);
      });
      setCurrent((value) => {
        const nextCurrent = state.nextCheckpoint ?? (value + 1);
        return Math.min(Math.max(value, nextCurrent), TOTAL_CHECKPOINTS + 1);
      });
      setCoins(v => v + (state.rewardCoins ?? 50));
    }
    if (state.wrongAnswer && DEFAULT_LIFE !== Infinity) {
      const nextLife = life - 1;
      if (nextLife > 0) {
        setLife(nextLife);
      } else {
        setLife(DEFAULT_LIFE);
        setCompleted(0);
        setCurrent(1);
        setCoins(DEFAULT_COINS);
        clearProgress();
      }
    }
  }, [life]);

  // Poll session status — detect if host ended the game early
  useEffect(() => {
    const sessionId = session?.id || session?._id;
    if (!sessionId || showHostEndedPopup) return;
    const interval = setInterval(async () => {
      try {
        const data = await sessionAPI.getById(sessionId);
        if (data.status === 'finished') setShowHostEndedPopup(true);
      } catch { /* ignore */ }
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.id, session?._id, showHostEndedPopup]);

  // 5s countdown after host-ended popup
  useEffect(() => {
    if (!showHostEndedPopup) return;
    setHostEndedCountdown(5);
    const t = setInterval(() => {
      setHostEndedCountdown(v => {
        if (v <= 1) {
          clearInterval(t);
          clearProgress();
          localStorage.removeItem('playerSession');
          localStorage.removeItem('session');
          navigate('/');
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showHostEndedPopup]);

  useEffect(() => {
    if (timeLeft <= 0) { navigate('/game-over'); return; }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const progress = completed / TOTAL_CHECKPOINTS;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      navigate(getCheckpointRoute(current), { state: { checkpoint: current } });
    }, 3000);
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4 pb-4">

        {/* Player greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={player?.avatar || '/avatar/avatar1.png'}
              alt={player?.username}
              className="rounded-full object-cover"
              style={{ width: 52, height: 52, border: '2px solid var(--color-primary)' }}
            />
            <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              👋 Hello, {player?.username}!
            </p>
          </div>
          <button
            onClick={() => setShowExitPopup(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <QrCode size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>QR checkpoint</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Scan QR code to unlock the next challenge
          </p>
        </div>

        {/* Progress */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Your progress</span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              {completed}/{TOTAL_CHECKPOINTS} completed
            </span>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: '#E5E7EB' }}>
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${progress * 100}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
          {completed < TOTAL_CHECKPOINTS && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-subtext)' }}>
              Current checkpoint: <span className="font-bold" style={{ color: 'var(--color-text)' }}>{current}</span>
            </p>
          )}
        </Card>

        {completed >= TOTAL_CHECKPOINTS ? (
          <>
            {/* Final game banner */}
            <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
              You have completed {TOTAL_CHECKPOINTS} checkpoints. Ready to make the final challenge.
            </p>
            <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end h-100">
              <img src="/games/finalGame/finalgamecapybara.png" alt="Final game" className="h-60 object-cover" />
              <Button className='mt-10' style={{ backgroundColor: 'var(--color-green)' }}
                onClick={() => navigate('/final-shop', { state: { coins } })}
              >
                ▶ Play final game
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* QR Scanner area */}
            <Card className="relative rounded-2xl flex flex-col items-center justify-center gap-3"
              style={{ minHeight: 260 }}>
              <Camera size={64} style={{ color: '#9CA3AF' }} />
              <p className="text-base font-semibold" style={{ color: '#6B7280' }}>Camera / QR scanner</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Tap "Scan QR" to start</p>
              {scanning && <ScanningOverlay />}
            </Card>

            {/* Scan button */}
            <Button variant="green" onClick={handleScan} disabled={scanning}>
              <ScanLine size={16} /> {scanning ? 'Scanning...' : 'Scan QR'}
            </Button>
          </>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Time left', value: formatTime(timeLeft), color: '#3B82F6', icon: <Clock size={14} /> },
            { label: 'Life',      value: DEFAULT_LIFE === Infinity ? '❤️ ∞' : `❤️ ${life}`, color: '#DC2626', icon: null },
            { label: 'Coins',     value: `🪙 ${coins}`,        color: '#CA8A04', icon: null },
          ].map(({ label, value, color, icon }) => (
            <Card key={label} className="rounded-xl py-4 px-2 flex flex-col items-center gap-1.5">
              <span className="text-sm font-semibold" style={{ color }}>{label}</span>
              <div className="flex items-center gap-1">
                {icon && <span style={{ color }}>{icon}</span>}
                <span className="text-base font-bold" style={{ color }}>{value}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Trophy shortcut */}
        <Button
          onClick={() => navigate('/leaderboard')}
          >
          <Trophy size={25}  />
        </Button>



      </div>

      {/* Sign out confirmation popup */}
      <Popup open={showExitPopup} onClose={() => setShowExitPopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}>
            <LogOut size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Are you sure you want to sign out?
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" onClick={() => {
              clearProgress();
              localStorage.clear();
              navigate('/');
            }}>Confirm</Button>
            <Button variant="red" onClick={() => setShowExitPopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

      {/* Host ended game popup */}
      <Popup open={showHostEndedPopup} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="text-5xl">🏁</span>
          <h3 className="text-xl font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Host has ended the game
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            Returning to home in
          </p>
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-2xl font-black"
            style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}>
            {hostEndedCountdown}
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
