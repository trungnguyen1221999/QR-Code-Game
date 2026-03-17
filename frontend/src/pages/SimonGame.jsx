import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Play, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';

const SIMON_TIME_LIMIT = 60;
const SIMON_REWARD = 50;

const COLORS = [
  { id: 'green', label: 'Green', base: '#22C55E', glow: '#86EFAC', freq: 329.63 },
  { id: 'red', label: 'Red', base: '#EF4444', glow: '#FCA5A5', freq: 261.63 },
  { id: 'yellow', label: 'Yellow', base: '#EAB308', glow: '#FDE047', freq: 392.0 },
  { id: 'blue', label: 'Blue', base: '#3B82F6', glow: '#93C5FD', freq: 493.88 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function SimonGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 3;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [status, setStatus] = useState('Press Start to begin.');
  const [timeLeft, setTimeLeft] = useState(SIMON_TIME_LIMIT);
  const [flashWrong, setFlashWrong] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [showLose, setShowLose] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [busy, setBusy] = useState(false);

  const audioContextRef = useRef(null);
  const mountedRef = useRef(true);

  const targetRound = useMemo(() => 5, []);

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
    if (!gameStarted || showWin || showLose) return;
    if (timeLeft <= 0) {
      setShowLose(true);
      setGameStarted(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showWin, showLose, timeLeft]);

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

  const playWrongSound = async () => {
    playTone(180, 160, 'sawtooth', 0.05);
    await sleep(120);
    playTone(110, 260, 'square', 0.05);
  };

  const buildNextSequence = (current) => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
    return [...current, nextColor];
  };

  const flashButton = async (colorId, duration = 420) => {
    const color = COLORS.find((item) => item.id === colorId);
    setActiveButton(colorId);

    if (color) {
      playTone(color.freq, Math.max(150, duration - 60));
    }

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
    const firstSequence = buildNextSequence([]);
    setSequence(firstSequence);
    setPlayerSequence([]);
    setRound(1);
    setTimeLeft(SIMON_TIME_LIMIT);
    setGameStarted(true);
    setShowLose(false);
    setShowWin(false);
    setFlashWrong(false);
    setStatus('Watch the pattern carefully...');
    await playSequence(firstSequence);
  };

  const handleReset = () => {
    setSequence([]);
    setPlayerSequence([]);
    setActiveButton(null);
    setIsPlayingSequence(false);
    setGameStarted(false);
    setRound(0);
    setTimeLeft(SIMON_TIME_LIMIT);
    setFlashWrong(false);
    setStatus('Press Start to begin.');
    setShowLose(false);
    setShowWin(false);
  };

  const handleWrongInput = async () => {
    setBestScore((prev) => Math.max(prev, round));
    setStatus('Wrong pattern!');
    setFlashWrong(true);
    await playWrongSound();
    await sleep(450);

    if (!mountedRef.current) return;

    setFlashWrong(false);
    setGameStarted(false);
    setShowLose(true);
  };

  const handleButtonClick = async (colorId) => {
    if (!canPlayerInput) return;

    const color = COLORS.find((item) => item.id === colorId);
    if (color) {
      playTone(color.freq, 180);
    }

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
        setBestScore((prev) => Math.max(prev, round));
        setGameStarted(false);
        setShowWin(true);
        setStatus('Great job! You completed the Simon game.');
        return;
      }

      const nextSequence = buildNextSequence(sequence);
      setBestScore((prev) => Math.max(prev, round));
      setStatus('Correct! Next round...');
      setRound((prev) => prev + 1);
      setSequence(nextSequence);

      await sleep(700);

      if (!mountedRef.current) return;
      await playSequence(nextSequence);
    }
  };

  const handleBackToGame = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `simon-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId && sessionId) {
        const sessionData = await sessionAPI.getById(sessionId);
        const checkpoints = Array.isArray(sessionData?.checkpointIds) ? sessionData.checkpointIds : [];
        const matchedCheckpoint = checkpoints.find((entry) => entry.level === checkpoint);

        if (matchedCheckpoint?._id) {
          await playerAPI.checkpoint(playerSessionId, {
            checkpointId: matchedCheckpoint._id,
            scoreEarned: SIMON_REWARD,
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', {
        state: {
          justCompleted: true,
          completedCheckpoint: checkpoint,
          nextCheckpoint: checkpoint + 1,
          rewardCoins: SIMON_REWARD,
          resultId,
        },
      });
    }
  };

  const handleLoseContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `simon-lose-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId) {
        await playerAPI.loseLife(playerSessionId);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', { state: { wrongAnswer: true, resultId } });
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

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3" style={{ backgroundColor: '#EFF6FF' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#FEF3E2' }}>
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
              Round
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {round}/{targetRound}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#F0FDF4' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#15803D' }}>
              <Trophy size={14} />
              Best
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#166534' }}>
              {bestScore}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-3 text-center"
          style={{
            backgroundColor: flashWrong ? '#FEE2E2' : '#FFFFFF',
            border: `1px solid ${flashWrong ? '#FCA5A5' : 'var(--color-border)'}`,
          }}
        >
          <p className="text-sm font-semibold" style={{ color: flashWrong ? '#DC2626' : 'var(--color-text)' }}>
            {status}
          </p>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            backgroundColor: flashWrong ? '#FCA5A5' : '#111827',
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
                  className="aspect-square rounded-[28px] border-4 transition-all disabled:cursor-not-allowed"
                  style={{
                    borderColor: 'rgba(255,255,255,0.25)',
                    backgroundColor: isActive ? color.glow : color.base,
                    transform: isActive ? 'scale(0.96)' : 'scale(1)',
                    boxShadow: isActive
                      ? `0 0 0 4px rgba(255,255,255,0.18), 0 0 30px 8px ${color.glow}`
                      : 'inset 0 -10px 18px rgba(0,0,0,0.22)',
                  }}
                  aria-label={color.label}
                />
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={startGame} disabled={gameStarted || isPlayingSequence}>
            <Play size={16} />
            Start
          </Button>

          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setShowHowToPlay(true)}
          className="rounded-2xl p-4 text-left"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={16} style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              How to play
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
            Tap to view instructions and game rules.
          </p>
        </button>
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

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-5xl">🎉</span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            You win!
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            You completed the Simon pattern challenge and earned {SIMON_REWARD} coins.
          </p>
          <Button onClick={handleBackToGame} disabled={busy}>
            Back to game
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-5xl">❌</span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            Wrong pattern
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            The sequence was not correct. You will lose one life and return to the main game.
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleLoseContinue} disabled={busy}>
              Continue
            </Button>
            <Button variant="ghost" onClick={handleReset} disabled={busy}>
              Try again here
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}