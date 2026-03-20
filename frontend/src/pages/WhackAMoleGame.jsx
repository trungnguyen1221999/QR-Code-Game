import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Target, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import { playerAPI } from '../utils/api';
import {
  applyLossToStoredProgress,
  clearUnusedExtraLife,
  getPlayerProgress,
  getInitialGameTime,
  getReplayGameTime,
  resetProgressToCheckpointOne,
} from '../utils/checkpointShop';
import Card from '../components/ui/card';

const GAME_TIME_LIMIT = 300;
const WINNING_SCORE = 2;
const HOLE_COUNT = 9;
const ACTIVE_ANIMAL_COUNT = 3;
const ANIMAL_SPAWN_INTERVAL = 1300;
const HIT_EFFECT_DURATION = 200; //550
const HAMMER_RELEASE_DELAY = 50; //140
const HAMMER_SIZE = 80;
const ANIMALS = [
  {
    key: 'cat',
    label: 'Cat',
    image: '/whack-a-mole/cat.png',
    shell: '#FFF1D6',
    rim: '#F59E0B',
    accent: '#B45309',
  },
  {
    key: 'bird',
    label: 'Bird',
    image: '/whack-a-mole/bird.png',
    shell: '#E0F2FE',
    rim: '#38BDF8',
    accent: '#0369A1',
  },
  {
    key: 'frog',
    label: 'Frog',
    image: '/whack-a-mole/frog.png',
    shell: '#DCFCE7',
    rim: '#4ADE80',
    accent: '#15803D',
  },
  {
    key: 'rabbit',
    label: 'Rabbit',
    image: '/whack-a-mole/rabbit.png',
    shell: '#FCE7F3',
    rim: '#F472B6',
    accent: '#BE185D',
  },
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

function removeKey(source, keyToRemove) {
  const next = { ...source };
  delete next[keyToRemove];
  return next;
}

export default function WhackAMoleGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 2;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

  const holes = useMemo(() => Array.from({ length: HOLE_COUNT }, (_, index) => index), []);
  const boardRef = useRef(null);
  const effectTimeoutsRef = useRef([]);
  const hammerTimeoutRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(() => getInitialGameTime(GAME_TIME_LIMIT, 'whack-a-mole', location.key));
  const [score, setScore] = useState(0);
  const [targetAnimalKey, setTargetAnimalKey] = useState(() => pickRandom(ANIMALS).key);
  const [activeAnimals, setActiveAnimals] = useState({});
  const [hitAnimals, setHitAnimals] = useState({});
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loseState, setLoseState] = useState({ remainingLives: null, needsLifePurchase: false });
  const [hammerState, setHammerState] = useState({
    x: 0,
    y: 0,
    visible: false,
    striking: false,
  });
  const hasEndedRef = useRef(false);
  const lossHandledRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

  const clearVisualTimeouts = () => {
    effectTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    effectTimeoutsRef.current = [];

    if (hammerTimeoutRef.current) {
      clearTimeout(hammerTimeoutRef.current);
      hammerTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearVisualTimeouts(), []);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm) return;
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
  }, [showBackConfirm, showLose, showWin, timeLeft]);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm) return;

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
    const interval = setInterval(spawnRound, ANIMAL_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [holes, showBackConfirm, showLose, showWin, targetAnimalKey]);

  useEffect(() => {
    if (hasEndedRef.current || score < WINNING_SCORE) return;
    hasEndedRef.current = true;
    setShowWin(true);
    setActiveAnimals({});
  }, [score]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 600);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const updateHammerPosition = (clientX, clientY) => {
    setHammerState((current) => ({
      ...current,
      x: clientX,
      y: clientY,
      visible: true,
    }));
  };

  const triggerHammerStrike = () => {
    setHammerState((current) => ({
      ...current,
      visible: true,
      striking: true,
    }));

    if (hammerTimeoutRef.current) {
      clearTimeout(hammerTimeoutRef.current);
    }

    hammerTimeoutRef.current = setTimeout(() => {
      setHammerState((current) => ({
        ...current,
        striking: false,
      }));
      hammerTimeoutRef.current = null;
    }, HAMMER_RELEASE_DELAY);
  };

  const registerHitEffect = (holeIndex, animalKey, isCorrect) => {
    const effectId = `${holeIndex}-${Date.now()}`;

    setHitAnimals((current) => ({
      ...current,
      [holeIndex]: {
        id: effectId,
        animalKey,
        isCorrect,
      },
    }));

    const timeoutId = setTimeout(() => {
      setHitAnimals((current) => {
        if (current[holeIndex]?.id !== effectId) return current;
        return removeKey(current, holeIndex);
      });
    }, HIT_EFFECT_DURATION);

    effectTimeoutsRef.current.push(timeoutId);
  };

  const handleWhack = (holeIndex, event) => {
    if (busy || showWin || showLose) return;

    const animalKey = activeAnimals[holeIndex];
    if (!animalKey) return;

    if (event) {
      updateHammerPosition(event.clientX, event.clientY);
    }

    triggerHammerStrike();

    const isCorrect = animalKey === targetAnimalKey;

    if (isCorrect) {
      setScore((value) => value + 1);
      setFeedback({ type: 'good', text: '+1 Great hit!' });
    } else {
      setScore((value) => Math.max(0, value - 1));
      setFeedback({ type: 'bad', text: '-1 Wrong animal' });
    }

    registerHitEffect(holeIndex, animalKey, isCorrect);
    setActiveAnimals((current) => removeKey(current, holeIndex));
  };

  const resetGame = () => {
    clearVisualTimeouts();
    setTimeLeft(getReplayGameTime(GAME_TIME_LIMIT));
    setScore(0);
    setTargetAnimalKey(pickRandom(ANIMALS).key);
    setActiveAnimals({});
    setHitAnimals({});
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setFeedback(null);
    setLoseState({ remainingLives: null, needsLifePurchase: false });
    setHammerState({
      x: 0,
      y: 0,
      visible: false,
      striking: false,
    });
    hasEndedRef.current = false;
    lossHandledRef.current = false;
  };

  const handleLoseShopPurchase = (result) => {
    if (result.item?.id !== 'life') return;

    setLoseState({
      remainingLives: result.progress?.life ?? 1,
      needsLifePurchase: false,
    });
  };

  const handleLoseExit = () => {
    if (loseState.needsLifePurchase) {
      resetProgressToCheckpointOne();
    } else {
      clearUnusedExtraLife();
    }

    navigate('/game');
  };

  const handleLosePrimaryAction = () => {
    if (loseState.needsLifePurchase) {
      resetProgressToCheckpointOne();
      navigate('/game');
      return;
    }

    resetGame();
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
    setBusy(true);
    const summary = await registerLifeLoss();
    if (summary.needsLifePurchase) {
      resetProgressToCheckpointOne();
    }
    navigate('/game');
  };

  const currentLives = getPlayerProgress().life ?? 0;
  const backWillResetToStart = currentLives <= 1;

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `whack-win-${Date.now()}`;

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

  const targetAnimal = ANIMALS.find((animal) => animal.key === targetAnimalKey) ?? ANIMALS[0];

  return (
    <PageLayout>
      <style>{`
        @keyframes whack-dizzy-wobble {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(0.98); }
          50% { transform: rotate(8deg) scale(0.95); }
          75% { transform: rotate(-6deg) scale(0.98); }
          100% { transform: rotate(0deg) scale(1); }
        }

        @keyframes whack-dizzy-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .whack-dizzy-animal {
          animation: whack-dizzy-wobble 0.55s ease-out;
        }

        .whack-dizzy-ring {
          animation: whack-dizzy-spin 0.8s linear infinite;
        }
      `}</style>

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

        <div className="grid grid-cols-2 gap-3">
          <Card>
            
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14}/>
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <Target size={14} />
              Score
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {score}/{WINNING_SCORE}
            </p>
          </Card>
        </div>
      <Card style={{ backgroundColor: targetAnimal.shell }}>
            <p className="font-semibold" style={{ color: targetAnimal.accent }}>
              Hit this animal 
            </p>
            <div className="mt-1 flex items-center justify-center">
                <img src={targetAnimal.image} alt={targetAnimal.label} className="w-20 object-contain" />
                <p className='text-primary text-2xl font-bold'>{targetAnimal.label}</p>
            </div>
          </Card>
        <div
          ref={boardRef}
          className="relative select-none"
          onMouseMove={(event) => updateHammerPosition(event.clientX, event.clientY)}
          onMouseEnter={(event) => updateHammerPosition(event.clientX, event.clientY)}
          onMouseLeave={() => {
            setHammerState((current) => ({
              ...current,
              visible: false,
              striking: false,
            }));
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            updateHammerPosition(touch.clientX, touch.clientY);
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            updateHammerPosition(touch.clientX, touch.clientY);
          }}
          onTouchEnd={() => {
            setHammerState((current) => ({
              ...current,
              visible: false,
              striking: false,
            }));
          }}
        >
          <div
            className="rounded-[28px] p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #C7F9CC 0%, #A7F3D0 18%, #BBF7D0 32%, #FDE68A 100%)',
              border: '1px solid #A7F3D0',
              cursor: 'none',
            }}
          >
            <div
              className="absolute inset-x-4 top-3 h-10 rounded-full opacity-70"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)' }}
            />

            <div className="grid grid-cols-3 gap-3 relative z-10">
              {holes.map((holeIndex) => {
                const activeAnimalKey = activeAnimals[holeIndex];
                const hitAnimal = hitAnimals[holeIndex];
                const visibleAnimalKey = activeAnimalKey || hitAnimal?.animalKey;
                const visibleAnimal = ANIMALS.find((animal) => animal.key === visibleAnimalKey);
                const isVisible = !!visibleAnimal;
                const isDizzy = !!hitAnimal;

                return (
                  <button
                    key={holeIndex}
                    type="button"
                    onClick={(event) => handleWhack(holeIndex, event)}
                    onMouseMove={(event) => updateHammerPosition(event.clientX, event.clientY)}
                    disabled={busy || showWin || showLose || !activeAnimalKey}
                    className="aspect-square rounded-[32px] border-[5px] relative overflow-hidden"
                    style={{
                      borderColor: '#7C3AED',
                      background: 'radial-gradient(circle at 50% 36%, #7C3AED 0%, #5B21B6 48%, #3B0764 100%)',
                      boxShadow: 'inset 0 10px 18px rgba(255,255,255,0.18), inset 0 -16px 22px rgba(0,0,0,0.24)',
                      cursor: 'none',
                    }}
                  >
                    <div
                      className="absolute inset-x-4 bottom-4 h-7 rounded-full"
                      style={{ background: 'radial-gradient(circle at 50% 48%, #2E1065 0%, #1E1B4B 70%, #0F172A 100%)' }}
                    />

                    <div
                      className="absolute inset-x-1 bottom-2 rounded-[30px] transition-all duration-300 flex items-end justify-center"
                      style={{
                        height: isVisible ? '86%' : '0%',
                        background: visibleAnimal
                          ? `linear-gradient(180deg, ${visibleAnimal.shell} 0%, #FFFFFF 100%)`
                          : '#FDE68A',
                        border: isVisible ? `4px solid ${visibleAnimal.rim}` : '0 solid transparent',
                        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
                        opacity: isVisible ? 1 : 0,
                      }}
                    >
                      <div
                        className="absolute inset-x-4 bottom-0 h-4 rounded-t-full"
                        style={{ backgroundColor: visibleAnimal?.rim || '#B45309', opacity: 0.3 }}
                      />

                      {visibleAnimal && (
                        <div className="relative w-full h-full flex items-end justify-center overflow-hidden px-1">
                          <img
                            src={visibleAnimal.image}
                            alt={visibleAnimal.label}
                            className={`w-full h-full object-contain ${isDizzy ? 'whack-dizzy-animal' : ''}`}
                            style={{
                              filter: isDizzy ? 'saturate(0.7) brightness(0.95)' : 'none',
                            }}
                          />

                          {isDizzy && (
                            <>
                              <div className="whack-dizzy-ring absolute inset-3 rounded-full border-2 border-dashed border-yellow-300 opacity-90" />
                              <div className="absolute -top-1 left-4 h-3 w-3 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
                              <div className="absolute top-0 right-5 h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]" />
                              <div className="absolute top-5 right-1 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                              <div
                                className="absolute bottom-2 rounded-full px-2 py-0.5 text-[10px] font-black"
                                style={{
                                  backgroundColor: hitAnimal.isCorrect ? '#DCFCE7' : '#FEE2E2',
                                  color: hitAnimal.isCorrect ? '#166534' : '#B91C1C',
                                }}
                              >
                                {hitAnimal.isCorrect ? 'BONK' : 'MISS'}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {hammerState.visible && !showWin && !showLose && !showBackConfirm && (
            <div
              className="pointer-events-none fixed z-50 transition-transform duration-75"
              style={{
                left: hammerState.x,
                top: hammerState.y,
                transform: `translate(-50%, -50%) rotate(${hammerState.striking ? '28deg' : '-26deg'}) scale(${hammerState.striking ? 0.94 : 1})`,
                transformOrigin: 'center center',
                filter: 'drop-shadow(0 10px 12px rgba(15, 23, 42, 0.3))',
              }}
            >
              <img
                src="/whack-a-mole/hammer.png"
                alt="Hammer"
                className="block select-none"
                style={{ width: HAMMER_SIZE, height: HAMMER_SIZE, objectFit: 'contain' }}
              />
            </div>
          )}
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

        <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
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
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} />
          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            Continue
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">!</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Time is up
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {loseState.needsLifePurchase
                ? 'No lives left. Buy an extra life now to keep your current checkpoint.'
                : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
            </p>
          </div>
          <CheckpointShopPanel
            isOpen={showLose}
            warningMessage={
              loseState.needsLifePurchase
                ? 'If you will not buy life from store now, you need to start again from checkpoint 1.'
                : ''
            }
            onPurchase={handleLoseShopPurchase}
          />
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="red"
              onClick={handleLosePrimaryAction}
              disabled={busy}
            >
              {loseState.needsLifePurchase ? 'Checkpoint 1' : 'Play again'}
            </Button>
            <Button variant="green" onClick={handleLoseExit} disabled={busy}>
              Exit game
            </Button>
          </div>
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
              {backWillResetToStart
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
    </PageLayout>
  );
}
