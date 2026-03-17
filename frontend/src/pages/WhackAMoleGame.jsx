import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Target, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import { playerAPI, sessionAPI } from '../utils/api';
import { getInitialGameTime, getReplayGameTime } from '../utils/checkpointShop';

const GAME_TIME_LIMIT = 20;
const WINNING_SCORE = 2;
const HOLE_COUNT = 9;
const ACTIVE_ANIMAL_COUNT = 3;
const PLAYER_PROGRESS_KEY = 'playerGameProgress';
const DEFAULT_LIFE = 3;
const DEFAULT_COINS = 0;
const ANIMALS = [
  { key: 'mouse', emoji: '🐭', label: 'Mouse' },
  { key: 'bird', emoji: '🐦', label: 'Bird' },
  { key: 'frog', emoji: '🐸', label: 'Frog' },
  { key: 'rabbit', emoji: '🐰', label: 'Rabbit' },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function applyLossToStoredProgress() {
  const raw = localStorage.getItem(PLAYER_PROGRESS_KEY);
  const progress = raw ? JSON.parse(raw) : { completed: 0, current: 1, life: DEFAULT_LIFE, coins: DEFAULT_COINS };
  const nextLife = (progress.life ?? DEFAULT_LIFE) - 1;

  if (nextLife > 0) {
    const updated = { ...progress, life: nextLife };
    localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(updated));
    return { remainingLives: nextLife, resetToStart: false };
  }

  const reset = { completed: 0, current: 1, life: DEFAULT_LIFE, coins: DEFAULT_COINS };
  localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(reset));
  return { remainingLives: 0, resetToStart: true };
}

export default function WhackAMoleGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 2;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const holes = useMemo(() => Array.from({ length: HOLE_COUNT }, (_, index) => index), []);
  const [timeLeft, setTimeLeft] = useState(() => getInitialGameTime(GAME_TIME_LIMIT, 'whack-a-mole', location.key));
  const [score, setScore] = useState(0);
  const [targetAnimalKey, setTargetAnimalKey] = useState(() => pickRandom(ANIMALS).key);
  const [activeAnimals, setActiveAnimals] = useState({});
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loseState, setLoseState] = useState({ remainingLives: null, resetToStart: false });
  const hasEndedRef = useRef(false);
  const lossHandledRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    if (showWin || showLose) return;
    if (timeLeft <= 0) {
      hasEndedRef.current = true;
      setActiveAnimals({});
      void handleLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showLose, showWin, timeLeft]);

  useEffect(() => {
    if (showWin || showLose) return;

    const spawnRound = () => {
      const selectedHoles = shuffle(holes).slice(0, ACTIVE_ANIMAL_COUNT);
      const distractors = shuffle(ANIMALS.filter((animal) => animal.key !== targetAnimalKey));

      const nextActiveAnimals = {
        [selectedHoles[0]]: targetAnimalKey,
      };

      selectedHoles.slice(1).forEach((holeIndex, index) => {
        nextActiveAnimals[holeIndex] = distractors[index % distractors.length].key;
      });

      setActiveAnimals(nextActiveAnimals);
    };

    spawnRound();
    const interval = setInterval(spawnRound, 900);
    return () => clearInterval(interval);
  }, [holes, showLose, showWin, targetAnimalKey]);

  useEffect(() => {
    if (hasEndedRef.current || score < WINNING_SCORE) return;
    hasEndedRef.current = true;
    setShowWin(true);
    setActiveAnimals({});
  }, [score]);

  const handleWhack = (holeIndex) => {
    if (busy || showWin || showLose) return;
    const animalKey = activeAnimals[holeIndex];
    if (!animalKey) return;

    if (animalKey === targetAnimalKey) {
      setScore((value) => value + 1);
      setFeedback({ type: 'good', text: '+1 Great hit!' });
    } else {
      setScore((value) => Math.max(0, value - 1));
      setFeedback({ type: 'bad', text: '-1 Wrong animal' });
    }

    setActiveAnimals((current) => {
      const next = { ...current };
      delete next[holeIndex];
      return next;
    });
  };

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 600);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const resetGame = () => {
    setTimeLeft(getReplayGameTime(GAME_TIME_LIMIT));
    setScore(0);
    setTargetAnimalKey(pickRandom(ANIMALS).key);
    setActiveAnimals({});
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setFeedback(null);
    setLoseState({ remainingLives: null, resetToStart: false });
    hasEndedRef.current = false;
    lossHandledRef.current = false;
  };

  const registerLifeLoss = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const summary = applyLossToStoredProgress();

    try {
      if (playerSessionId) {
        await playerAPI.loseLife(playerSessionId);
      }
    } catch (error) {
      toast.error(error.message);
    }

    return summary;
  };

  const handleLoss = async () => {
    if (lossHandledRef.current) return;
    lossHandledRef.current = true;
    setBusy(true);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleBackExit = async () => {
    if (busy || showWin || showLose) return;
    setBusy(true);
    await registerLifeLoss();
    navigate('/game');
  };

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `whack-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId && sessionId) {
        const sessionData = await sessionAPI.getById(sessionId);
        const checkpoints = Array.isArray(sessionData?.checkpointIds) ? sessionData.checkpointIds : [];
        const matchedCheckpoint = checkpoints.find((entry) => entry.level === checkpoint);

        if (matchedCheckpoint?._id) {
          await playerAPI.checkpoint(playerSessionId, {
            checkpointId: matchedCheckpoint._id,
            scoreEarned: earnedCoins,
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
          rewardCoins: 0,
          resultId,
        },
      });
    }
  };

  const targetAnimal = ANIMALS.find((animal) => animal.key === targetAnimalKey) ?? ANIMALS[0];

  return (
    <PageLayout>
      <div className="pt-5 pb-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpoint}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Whack-A-Mole
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Your target animal is random for this game. Hit only that animal to gain points and avoid the wrong one.
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
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <Target size={14} />
              Score
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {score}/{WINNING_SCORE}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#DCFCE7' }}>
            <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
              Hit this animal
            </p>
            <p className="text-lg font-bold mt-1 flex items-center gap-2" style={{ color: '#166534' }}>
              <span>{targetAnimal.emoji}</span>
              <span>{targetAnimal.label}</span>
            </p>
          </div>
        </div>

        <div className="rounded-3xl p-4" style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-3 gap-3">
            {holes.map((holeIndex) => {
              const animalKey = activeAnimals[holeIndex];
              const activeAnimal = ANIMALS.find((animal) => animal.key === animalKey);
              const isActive = !!activeAnimal;

              return (
                <button
                  key={holeIndex}
                  type="button"
                  onClick={() => handleWhack(holeIndex)}
                  disabled={busy || showWin || showLose}
                  className="aspect-square rounded-full border-4 relative overflow-hidden"
                  style={{
                    borderColor: '#92400E',
                    background: 'radial-gradient(circle at 50% 45%, #A16207 0%, #78350F 55%, #451A03 100%)',
                  }}
                >
                  <div
                    className="absolute inset-x-3 bottom-3 rounded-t-full transition-all duration-150 flex items-center justify-center text-4xl"
                    style={{
                      height: isActive ? '68%' : '0%',
                      backgroundColor: '#FDE68A',
                      border: isActive ? '4px solid #B45309' : '0 solid transparent',
                      transform: isActive ? 'translateY(0)' : 'translateY(100%)',
                      opacity: isActive ? 1 : 0,
                    }}
                  >
                    <span role="img" aria-label={activeAnimal?.label || 'animal'}>
                      {activeAnimal?.emoji || ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {feedback && (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-bold text-center"
            style={{
              backgroundColor: feedback.type === 'good' ? '#DCFCE7' : '#FEE2E2',
              color: feedback.type === 'good' ? '#166534' : '#B91C1C',
            }}
          >
            {feedback.text}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Watch the target animal card, then tap only that animal. Correct hits give +1, wrong hits give -1.
          </p>
        </div>

        <Button variant="red" onClick={handleBackExit} disabled={busy}>
          Back
        </Button>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <Trophy size={28} style={{ color: '#16A34A' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Nice job!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              You reached the target score and earned {earnedCoins} coins.
            </p>
          </div>
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} />
          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            Continue
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">⏰</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Time is up
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {loseState.resetToStart
                ? 'No lives left. You will return to checkpoint 1.'
                : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
            </p>
          </div>
          <CheckpointShopPanel />
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="red"
              onClick={loseState.resetToStart ? () => navigate('/game') : resetGame}
              disabled={busy}
            >
              {loseState.resetToStart ? 'Checkpoint 1' : 'Play again'}
            </Button>
            <Button variant="green" onClick={() => navigate('/game')} disabled={busy}>
              Exit game
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}
