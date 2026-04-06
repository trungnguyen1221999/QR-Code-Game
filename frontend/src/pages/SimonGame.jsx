import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import toast from 'react-hot-toast';
import { Clock, Play, Volume2 } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import CheckpointWinReward from '../components/ui/CheckpointWinReward';
import { playerAPI } from '../utils/api';
import {
  addCoinsToProgress,
  clearUnusedExtraLife,
  getInitialGameTime,
  getReplayGameTime,
  getPlayerProgress,
} from '../utils/checkpointShop';
import {
  applyLosePurchase,
  handleCheckpointLoseExit,
  handleCheckpointLosePrimaryAction,
  INITIAL_LOSE_STATE,
  registerCheckpointLifeLoss,
} from '../utils/checkpointLoseFlow';
import Card from '../components/ui/Card';
import { getMiniGameConfig, getSessionDifficulty } from '../utils/constantMiniGame';

const COINS_PER_SECOND = 2;

const COLORS = [
  {
    id: 'green',
    label: 'Owl',
    animal: 'owl',
    image: '/images/animals/owl.png',
    base: '#22C55E',
    glow: '#86EFAC',
    freq: 329.63,
  },
  {
    id: 'red',
    label: 'Fox',
    animal: 'fox',
    image: '/images/animals/fox.png',
    base: '#EF4444',
    glow: '#FCA5A5',
    freq: 261.63,
  },
  {
    id: 'yellow',
    label: 'Bird',
    animal: 'bird',
    image: '/images/animals/bird.png',
    base: '#EAB308',
    glow: '#FDE047',
    freq: 392.0,
  },
  {
    id: 'blue',
    label: 'Deer',
    animal: 'deer',
    image: '/images/animals/deer.png',
    base: '#3B82F6',
    glow: '#93C5FD',
    freq: 493.88,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function SimonGame() {
  const { timeLimit: SIMON_TIME_LIMIT, goal: SIMON_TARGET_ROUND } = getMiniGameConfig('simon', getSessionDifficulty());
  useBlockBack();
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 6;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [backEnabled, setBackEnabled] = useState(false);
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState('Press Start to begin.');
  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(SIMON_TIME_LIMIT, 'simon', location.key)
  );
  const [flashWrong, setFlashWrong] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [showLose, setShowLose] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);

  const audioContextRef = useRef(null);
  const mountedRef = useRef(true);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);
  const soundsRef = useRef({
    green: typeof Audio !== 'undefined' ? new Audio('/sounds/owl.mp3') : null,
    red: typeof Audio !== 'undefined' ? new Audio('/sounds/fox.mp3') : null,
    yellow: typeof Audio !== 'undefined' ? new Audio('/sounds/bird.mp3') : null,
    blue: typeof Audio !== 'undefined' ? new Audio('/sounds/deer.mp3') : null,
    wrong: typeof Audio !== 'undefined' ? new Audio('/sounds/wrong.mp3') : null,
  });

  const targetRound = SIMON_TARGET_ROUND;
  const earnedCoins = Math.max(0, timeLeft * COINS_PER_SECOND);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || showWin || showLose || showBackConfirm) return;
    if (timeLeft <= 0) {
      void handleLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showBackConfirm, showWin, showLose, timeLeft]);

  const canPlayerInput =
    gameStarted && !isPlayingSequence && sequence.length > 0 && !showWin && !showLose;

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioCtx();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playTone = (frequency, duration = 220, type = 'sine', volume = 0.05) => {
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration / 1000 + 0.02);
  };

  const playColorSound = (colorId) => {
    const sound = soundsRef.current[colorId];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => { });
      return;
    }

    const color = COLORS.find((item) => item.id === colorId);
    if (color) {
      playTone(color.freq, 180);
    }
  };

  const playWrongSound = async () => {
    const sound = soundsRef.current.wrong;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => { });
      return;
    }

    playTone(180, 160, 'sawtooth', 0.05);
    await sleep(120);
    playTone(110, 260, 'square', 0.05);
  };

  const buildNextSequence = (current) => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
    return [...current, nextColor];
  };

  const flashButton = async (colorId, duration = 420) => {
    setActiveButton(colorId);
    playColorSound(colorId);

    await sleep(duration);

    if (mountedRef.current) {
      setActiveButton(null);
    }
  };

  const playSequence = async (nextSequence) => {
    setIsPlayingSequence(true);
    setStatus('Watch the pattern carefully...');
    await sleep(500);

    for (const colorId of nextSequence) {
      await flashButton(colorId, 420);
      await sleep(180);
    }

    if (!mountedRef.current) return;

    setPlayerSequence([]);
    setIsPlayingSequence(false);
    setStatus('Now repeat the pattern in the same order.');
  };

  const startGame = async () => {
    outcomeLockedRef.current = false;
    const firstSequence = buildNextSequence([]);
    setSequence(firstSequence);
    setPlayerSequence([]);
    setRound(1);
    setTimeLeft(SIMON_TIME_LIMIT);
    setGameStarted(true);
    setBackEnabled(true);
    setShowLose(false);
    setShowWin(false);
    setLoseState(INITIAL_LOSE_STATE);
    lossHandledRef.current = false;
    setFlashWrong(false);
    setStatus('Watch the pattern carefully...');
    await playSequence(firstSequence);
  };

  const handleReset = () => {
    outcomeLockedRef.current = false;
    setSequence([]);
    setPlayerSequence([]);
    setActiveButton(null);
    setIsPlayingSequence(false);
    setGameStarted(false);
    setBackEnabled(false);
    setRound(0);
    setTimeLeft(getReplayGameTime(SIMON_TIME_LIMIT));
    setFlashWrong(false);
    setStatus('Press Start to begin.');
    setShowLose(false);
    setShowWin(false);
    setLoseState(INITIAL_LOSE_STATE);
    lossHandledRef.current = false;
  };

  const registerLifeLoss = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    try {
      return await registerCheckpointLifeLoss(playerSessionId);
    } catch (error) {
      toast.error(error.message);
      return INITIAL_LOSE_STATE;
    }
  };

  const handleLoss = async () => {
    if (lossHandledRef.current || outcomeLockedRef.current) return;
    lossHandledRef.current = true;
    outcomeLockedRef.current = true;
    setBusy(true);
    setGameStarted(false);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleBackExit = async () => {
    if (!gameStarted) {
      navigate('/game');
      return;
    }
    setBusy(true);
    const summary = await registerLifeLoss();

    if (summary.needsLifePurchase) {
      handleCheckpointLoseExit({ needsLifePurchase: true }, navigate, playerSessionId);
      return;
    }

    navigate('/game');
  };

  const currentLives = getPlayerProgress().life ?? 0;
  const backWillResetToStart = currentLives <= 1;

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const playerSessionId = playerSession?._id || playerSession?.id;

  const handleLosePrimaryAction = () =>
    handleCheckpointLosePrimaryAction(loseState, navigate, handleReset, playerSessionId);

  const handleLoseExit = () => handleCheckpointLoseExit(loseState, navigate, playerSessionId);

  const handleWrongInput = async () => {
    setStatus('Wrong pattern!');
    setFlashWrong(true);
    await playWrongSound();
    await sleep(450);

    if (!mountedRef.current) return;

    setFlashWrong(false);
    await handleLoss();
  };

  const handleButtonClick = async (colorId) => {
    if (!canPlayerInput) return;

    playColorSound(colorId);

    setActiveButton(colorId);
    setTimeout(() => {
      if (mountedRef.current) {
        setActiveButton((current) => (current === colorId ? null : current));
      }
    }, 180);

    const nextPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(nextPlayerSequence);

    const currentIndex = nextPlayerSequence.length - 1;
    if (sequence[currentIndex] !== colorId) {
      await handleWrongInput();
      return;
    }

    if (nextPlayerSequence.length === sequence.length) {
      if (round >= targetRound) {
        setGameStarted(false);
        outcomeLockedRef.current = true;
        addCoinsToProgress(Math.max(0, timeLeft * COINS_PER_SECOND));
        setShowWin(true);
        setStatus('Great job! You completed the Simon game.');
        return;
      }

      const nextSequence = buildNextSequence(sequence);
      setStatus('Correct! Next round...');
      setRound((prev) => prev + 1);
      setSequence(nextSequence);

      await sleep(700);

      if (!mountedRef.current) return;
      await playSequence(nextSequence);
    }
  };
  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `quiz-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId) {
        await playerAPI.checkpoint(playerSessionId, { level: checkpoint, scoreEarned: earnedCoins });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      clearUnusedExtraLife();
      navigate('/game', {
        state: {
          justCompleted: true,
          completedCheckpoint: checkpoint,
          nextCheckpoint: checkpoint + 1,
          rewardCoins: 0,
          resultId,
        },
      });
    }
  };
  return (
    <PageLayout className="pb-6">
      <div
        className="pt-5 flex flex-col gap-4 transition-colors duration-300"
        style={{ minHeight: '100vh' }}
      >
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpoint}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Simon memory game
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Watch the pattern, remember it, and repeat it in the exact order.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card >
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
              Round
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {round}/{targetRound}
            </p>
          </Card>

      
        </div>

        <Card
          className="text-center"
          style={{ backgroundColor: flashWrong ? '#FEE2E2' : '' }}
        >
          <p className="text-sm font-semibold" style={{ color: flashWrong ? '#DC2626' : 'var(--color-text)' }}>
            {status}
          </p>
        </Card>

        <div
          className="rounded-2xl"
          style={{
            backgroundColor: flashWrong ? '#FCA5A5' : '',
            transition: 'background-color 0.25s ease',
          }}
        >
          <div className="grid grid-cols-2 gap-3">
           {COLORS.map((color) => {
  const isActive = activeButton === color.id;

  return (
    <button
      key={color.id}
      type="button"
      onClick={() => handleButtonClick(color.id)}
      disabled={!canPlayerInput}
      className="relative aspect-square overflow-hidden rounded-[28px] border-4 transition-all disabled:cursor-not-allowed"
      style={{
        borderColor: 'rgba(255,255,255,0.25)',
        background: isActive
          ? `radial-gradient(circle at center, ${color.glow} 0%, ${color.base} 80%)`
          : color.base,
        transform: isActive ? 'scale(0.96)' : 'scale(1)',
        boxShadow: isActive
          ? `0 0 0 4px rgba(255,255,255,0.18), 0 0 30px 8px ${color.glow}`
          : 'inset 0 -10px 18px rgba(0,0,0,0.22)',
      }}
      aria-label={color.label}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, rgba(255,255,255,0.10), rgba(0,0,0,0.12))`,
        }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        <img
          src={color.image}
          alt={color.label}
          className="max-h-[68%] max-w-[68%] object-contain select-none pointer-events-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]"
          draggable={false}
        />
      </div>

      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow"
        style={{
          backgroundColor: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {color.label}
      </div>
    </button>
  );
})}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={startGame} disabled={gameStarted || isPlayingSequence || busy}>
            <Play size={16} />
            Start
          </Button>

          {backEnabled ? (
            <Button
              key="back-enabled"
              variant="red"
              onClick={() => setShowBackConfirm(true)}
              disabled={busy || showWin || showLose}
            >
              Back
            </Button>
          ) : (
            <button
              key="back-disabled"
              type="button"
              disabled
              className="w-full rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{
                backgroundColor: '#D1D5DB',
                border: '1px solid #D1D5DB',
                color: '#6B7280',
                cursor: 'not-allowed',
                opacity: 1,
              }}
            >
              Back
            </button>
          )}
        </div>

        <Card
          onClick={() => setShowHowToPlay(true)}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              How to play
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
            Tap to view instructions and game rules.
          </p>
        </Card>
      </div>

      <Popup open={showHowToPlay} onClose={() => setShowHowToPlay(false)} title="How to play">
        <div className="flex flex-col gap-3">
          <div className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.7' }}>
            <p>1. Press <span className="font-bold" style={{ color: 'var(--color-text)' }}>Start</span>.</p>
            <p>2. Watch the glowing buttons carefully.</p>
            <p>3. Repeat the pattern in the same order.</p>
            <p>4. Each round adds one more step.</p>
            <p>5. Wrong pattern = lose the game and one life.</p>
            <p>6. Reach round {targetRound} to win this checkpoint.</p>
          </div>

          <Button onClick={() => setShowHowToPlay(false)}>Got it</Button>
        </div>
      </Popup>

      <Popup open={showBackConfirm} onClose={() => setShowBackConfirm(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">!</span>

          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Leave this game?
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {!gameStarted
                ? 'You have not started this checkpoint yet. Leave without losing a life?'
                : backWillResetToStart
                ? 'If you go back now, one life will be lost and you will need to start again from checkpoint 1.'
                : 'If you go back now, one life will be lost.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="red" onClick={handleBackExit} disabled={busy}>
              Confirm
            </Button>
            <Button variant="green" onClick={() => setShowBackConfirm(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      </Popup>
      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title="You win"
            message={`You completed the Simon game and earned ${earnedCoins} coins from the time left.`}
          />
          <CheckpointShopPanel
            earnedCoins={earnedCoins}
            grantCoins={showWin}
            isOpen={showWin}
            checkpoint={checkpoint}
          />
          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            Continue
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => { }} showClose={false}>
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-5xl">❌</span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            Game over
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            {loseState.needsLifePurchase
              ? 'No lives left. Buy an extra life now to keep your current checkpoint.'
              : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
          </p>
          <CheckpointShopPanel
            isOpen={showLose}
            checkpoint={checkpoint}
            warningMessage={
              loseState.needsLifePurchase
                ? 'If you will not buy life from store now, you need to start again from checkpoint 1.'
                : ''
            }
            onPurchase={handleLoseShopPurchase}
          />
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="red" onClick={handleLosePrimaryAction} disabled={busy}>
              {loseState.needsLifePurchase ? 'Checkpoint 1' : 'Play again'}
            </Button>
            <Button variant="green" onClick={handleLoseExit} disabled={busy}>
              Exit game
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}
