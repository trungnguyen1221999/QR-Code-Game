import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, Camera, Trophy, LogOut, ScanLine, Clock, X } from 'lucide-react';
import QrScanner from 'qr-scanner';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';
import Card from '../components/ui/Card';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

const TOTAL_SECONDS = 30 * 60;

function getTotalCheckpoints() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const len = session?.gameOrder?.length;
    return (len && len > 0) ? len : 13;
  } catch {
    return 13;
  }
}
const DEFAULT_COINS = 0;

function getLivesForDifficulty(difficulty) {
  if (difficulty === 'easy') return Infinity;
  if (difficulty === 'normal') return 5;
  return 3; // hard
}
const PLAYER_PROGRESS_KEY = 'playerGameProgress';

const DEFAULT_GAME_ORDER = [
  '/tower-builder',
  '/whack-a-mole',
  '/combined-word-quiz',
  '/memory-game',
  '/puzzle-game',
  '/simon-game',
  '/click-counter-game',
  '/random-color-clicker',
  '/snake-game',
  '/click-to-shoot-targets',
  '/maze-game',
  '/shape-matcher',
  '/cross-road-game',
];

function getCheckpointRoute(checkpoint) {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const order = session?.gameOrder?.length > 0 ? session.gameOrder : DEFAULT_GAME_ORDER;
    return order[checkpoint - 1] ?? DEFAULT_GAME_ORDER[checkpoint - 1] ?? '/memory-game';
  } catch {
    return DEFAULT_GAME_ORDER[checkpoint - 1] ?? '/memory-game';
  }
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
      completedList: [],
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const rawLife = parsed.life;
    const life = rawLife === 'inf' ? Infinity : (rawLife ?? defaultLife);
    return {
      hasSavedProgress: true,
      completed: parsed.completed ?? 0,
      current: parsed.current ?? 1,
      life,
      coins: parsed.coins ?? DEFAULT_COINS,
      completedList: parsed.completedList ?? [],
    };
  } catch {
    return {
      hasSavedProgress: false,
      completed: 0,
      current: 1,
      life: defaultLife,
      coins: DEFAULT_COINS,
      completedList: [],
    };
  }
}

function saveProgress(progress) {
  const toSave = { ...progress, life: progress.life === Infinity ? 'inf' : progress.life };
  localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(toSave));
}

function clearProgress() {
  localStorage.removeItem(PLAYER_PROGRESS_KEY);
}

function ScanningOverlay({ videoRef, onCancel, t }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
    >
      <style>{`
        @keyframes scan-line { 0%{top:5%} 50%{top:90%} 100%{top:5%} }
        .scan-line-full { position:absolute; left:0; right:0; height:3px; background:#22C55E; animation: scan-line 1.8s linear infinite; box-shadow: 0 0 12px #22C55E, 0 0 24px #22C55E; }
        @keyframes pulse-corner { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .corner-pulse { animation: pulse-corner 1.2s ease-in-out infinite; }
      `}</style>

      <p className="text-white text-lg font-bold tracking-wide">{t.pointAtQrCode}</p>

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: '84vw',
          maxWidth: 340,
          height: '84vw',
          maxHeight: 340,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <div className="scan-line-full" />
        <div
          className="corner-pulse absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg"
          style={{ borderColor: '#22C55E' }}
        />
        <div
          className="corner-pulse absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg"
          style={{ borderColor: '#22C55E' }}
        />
        <div
          className="corner-pulse absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg"
          style={{ borderColor: '#22C55E' }}
        />
        <div
          className="corner-pulse absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg"
          style={{ borderColor: '#22C55E' }}
        />
      </div>

      <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>
        {t.scanningPleaseWait}
      </p>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
      >
        <X size={14} /> {t.cancel}
      </button>
    </div>
  );
}

export default function PlayerGame() {
  const TOTAL_CHECKPOINTS = getTotalCheckpoints();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const player = JSON.parse(localStorage.getItem('player') || 'null');
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  const DEFAULT_LIFE = getLivesForDifficulty(session?.difficulty);
  const GAME_MODE = session?.gameMode || 'ordered';
  const initialProgress = readSavedProgress(DEFAULT_LIFE);
  const shouldSkipProgressRefresh = !!(location.state?.justCompleted || location.state?.wrongAnswer);

  const [timeLeft, setTimeLeft] = useState(() =>
    getRemainingSessionSeconds(session?.expiresAt, TOTAL_SECONDS)
  );
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showHostEndedPopup, setShowHostEndedPopup] = useState(false);
  const [hostEndedCountdown, setHostEndedCountdown] = useState(5);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const lastQrDataRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const introKey = `introPlayed_${session?.id || session?._id}`;

  useEffect(() => {
    if (!sessionStorage.getItem(introKey)) {
      navigate('/intro', { replace: true });
    }
  }, []);

  const [completed, setCompleted] = useState(initialProgress.completed);
  const [current, setCurrent] = useState(initialProgress.current);
  const [life, setLife] = useState(initialProgress.life);
  const [coins, setCoins] = useState(initialProgress.coins);
  const [completedList, setCompletedList] = useState(initialProgress.completedList);

  useEffect(() => {
    saveProgress({ completed, current, life, coins, completedList });
  }, [coins, completed, current, life, completedList]);

  useEffect(() => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;

    const loadProgress = async () => {
      try {
        const [playerSessionData, sessionData] = await Promise.all([
          playerSessionId ? playerAPI.getById(playerSessionId) : Promise.resolve(null),
          sessionId ? sessionAPI.getById(sessionId) : Promise.resolve(null),
        ]);

        if (playerSessionData?.finishedAt) {
          localStorage.setItem('gameCompleted', 'true');
          navigate('/live-leaderboard', { replace: true });
          return;
        }

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

  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.resultId) {
      const processedKey = `player-game-result:${state.resultId}`;
      if (sessionStorage.getItem(processedKey)) return;
      sessionStorage.setItem(processedKey, '1');
    }
    if (state.justCompleted) {
      if (GAME_MODE === 'random') {
        const pending = parseInt(sessionStorage.getItem('pendingCheckpoint') || '0', 10) || undefined;
        const cp = state.completedCheckpoint ?? pending;
        sessionStorage.removeItem('pendingCheckpoint');
        if (cp) setCompletedList((prev) => (prev.includes(cp) ? prev : [...prev, cp]));
        setCompleted((prev) => Math.min(prev + 1, TOTAL_CHECKPOINTS));
      } else {
        setCompleted((value) => {
          const nextCompleted = state.completedCheckpoint ?? value + 1;
          return Math.min(Math.max(value, nextCompleted), TOTAL_CHECKPOINTS);
        });
        setCurrent((value) => {
          const nextCurrent = state.nextCheckpoint ?? value + 1;
          return Math.min(Math.max(value, nextCurrent), TOTAL_CHECKPOINTS + 1);
        });
      }
      setCoins((v) => v + (state.rewardCoins ?? 50));
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

  useEffect(() => {
    const sessionId = session?.id || session?._id;
    if (!sessionId || showHostEndedPopup) return;
    const interval = setInterval(async () => {
      try {
        const data = await sessionAPI.getById(sessionId);
        if (data.status === 'finished') setShowHostEndedPopup(true);
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.id, session?._id, showHostEndedPopup]);

  useEffect(() => {
    if (!showHostEndedPopup) return;
    setHostEndedCountdown(5);
    const timer = setInterval(() => {
      setHostEndedCountdown((v) => {
        if (v <= 1) {
          clearInterval(timer);
          clearProgress();
          localStorage.removeItem('playerSession');
          localStorage.removeItem('session');
          navigate('/');
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showHostEndedPopup]);

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/game-over');
      return;
    }
    const timer = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const progress = completed / TOTAL_CHECKPOINTS;

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    const start = async () => {
      await new Promise((r) => setTimeout(r, 50));
      if (cancelled || !videoRef.current) return;

      try {
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (cancelled) return;
            const data = result?.data ?? '';
            const now = Date.now();
            if (now - lastScanTimeRef.current < 1000) return;
            lastScanTimeRef.current = now;

            if (data === lastQrDataRef.current) return;
            lastQrDataRef.current = data;
            setTimeout(() => {
              lastQrDataRef.current = null;
            }, 5000);

            const match = data.match(/\/checkpoint\/(\d+)/) || data.match(/^CHECKPOINT:(\d+)$/);

            if (!match) {
              toast.error(t.invalidQrCode);
              return;
            }

            const scannedNum = parseInt(match[1], 10);

            if (GAME_MODE === 'random') {
              if (completedList.includes(scannedNum)) {
                toast.error(
                  translate(t.checkpointAlreadyCompletedTryAnother, { checkpoint: scannedNum })
                );
                return;
              }
              if (scannedNum < 1 || scannedNum > TOTAL_CHECKPOINTS) {
                return;
              }
              sessionStorage.setItem('pendingCheckpoint', String(scannedNum));
              stopScanner();
              cancelled = true;
              setScanning(false);
              navigate(getCheckpointRoute(scannedNum), { state: { checkpoint: scannedNum } });
              return;
            }

            if (scannedNum < current) {
              toast.error(
                translate(t.checkpointAlreadyCompletedMoveTo, {
                  checkpoint: scannedNum,
                  current,
                })
              );
              return;
            }

            if (scannedNum !== current) {
              toast.error(translate(t.wrongCheckpointNeed, { current }));
              return;
            }

            stopScanner();
            cancelled = true;
            setScanning(false);
            navigate(getCheckpointRoute(current), { state: { checkpoint: current } });
          },
          { returnDetailedScanResult: true }
        );

        qrScannerRef.current = scanner;
        await scanner.start();
      } catch {
        if (!cancelled) {
          setScanning(false);
          toast.error(t.couldNotAccessCamera);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [scanning]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopScanner(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScan = () => setScanning(true);
  const handleCancelScan = () => {
    stopScanner();
    setScanning(false);
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={player?.avatar || '/avatar/avatar1.png'}
              alt={player?.username}
              className="rounded-full object-cover"
              style={{ width: 52, height: 52, border: '2px solid var(--color-primary)' }}
            />
            <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              {translate(t.helloUser, { name: player?.username || '' })}
            </p>
          </div>
          <button
            onClick={() => setShowExitPopup(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
          >
            <LogOut size={13} />
            {t.signOut}
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <QrCode size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
              {t.qrCheckpoint}
            </h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            {t.scanQrToUnlockNextChallenge}
          </p>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {t.yourProgress}
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              {translate(t.completedProgress, { completed, total: TOTAL_CHECKPOINTS })}
            </span>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: '#E5E7EB' }}>
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${progress * 100}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
          {completed < TOTAL_CHECKPOINTS && GAME_MODE === 'ordered' && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-subtext)' }}>
              {t.currentCheckpoint}{' '}
              <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                {current}
              </span>
            </p>
          )}
          {completed < TOTAL_CHECKPOINTS && GAME_MODE === 'random' && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-subtext)' }}>
              {t.scanAnyRemainingCheckpointQr}
            </p>
          )}
        </Card>

        {completed >= TOTAL_CHECKPOINTS ? (
          <>
            <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
              {translate(t.readyForFinalChallenge, { total: TOTAL_CHECKPOINTS })}
            </p>
            <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end h-100">
              <img
                src="/games/finalGame/finalgamecapybara.png"
                alt={t.finalGameAlt}
                className="h-60 object-cover"
              />
              <Button
                className="mt-10"
                style={{ backgroundColor: 'var(--color-green)' }}
                onClick={() => navigate('/final-shop', { state: { coins } })}
              >
                {t.playFinalGame}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card
              className="relative rounded-2xl flex flex-col items-center justify-center gap-3"
              style={{ minHeight: 260 }}
            >
              <Camera size={64} style={{ color: '#9CA3AF' }} />
              <p className="text-base font-semibold" style={{ color: '#6B7280' }}>
                {t.cameraQrScanner}
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {t.tapScanQrToStart}
              </p>
              {scanning && <ScanningOverlay videoRef={videoRef} onCancel={handleCancelScan} t={t} />}
            </Card>

            <Button variant="green" onClick={handleScan} disabled={scanning}>
              <ScanLine size={16} /> {scanning ? t.scanning : t.scanQr}
            </Button>
          </>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t.timeLeft, value: formatTime(timeLeft), color: '#3B82F6', icon: <Clock size={14} /> },
            { label: t.life, value: DEFAULT_LIFE === Infinity ? '❤️ ∞' : `❤️ ${life}`, color: '#DC2626', icon: null },
            { label: t.coins, value: `🪙 ${coins}`, color: '#CA8A04', icon: null },
          ].map(({ label, value, color, icon }) => (
            <Card key={label} className="rounded-xl py-4 px-2 flex flex-col items-center gap-1.5">
              <span className="text-sm font-semibold" style={{ color }}>
                {label}
              </span>
              <div className="flex items-center gap-1">
                {icon && <span style={{ color }}>{icon}</span>}
                <span className="text-base font-bold" style={{ color }}>
                  {value}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={() => navigate('/leaderboard')}>
          <Trophy size={25} />
        </Button>
      </div>

      <Popup open={showExitPopup} onClose={() => setShowExitPopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <LogOut size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            {t.areYouSureSignOut}
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="green"
              onClick={() => {
                clearProgress();
                localStorage.clear();
                navigate('/');
              }}
            >
              {t.confirm}
            </Button>
            <Button variant="red" onClick={() => setShowExitPopup(false)}>
              {t.cancel}
            </Button>
          </div>
        </div>
      </Popup>

      <Popup open={showHostEndedPopup} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="text-5xl">🏁</span>
          <h3 className="text-xl font-bold text-center" style={{ color: 'var(--color-text)' }}>
            {t.hostEndedGame}
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            {t.returningHomeIn}
          </p>
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-2xl font-black"
            style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}
          >
            {hostEndedCountdown}
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}