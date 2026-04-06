import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import useBlockBack from '../hooks/useBlockBack';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import Card from '../components/ui/Card';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import CheckpointWinReward from '../components/ui/CheckpointWinReward';
import { playerAPI } from '../utils/api';
import {
  clearUnusedExtraLife,
  getInitialGameTime,
  getPlayerProgress,
  getReplayGameTime,
} from '../utils/checkpointShop';
import {
  applyLosePurchase,
  handleCheckpointLoseExit,
  handleCheckpointLosePrimaryAction,
  INITIAL_LOSE_STATE,
  registerCheckpointLifeLoss,
} from '../utils/checkpointLoseFlow';
import { getMiniGameConfig, getSessionDifficulty } from '../utils/constantMiniGame';

const SHAPES = [
  { id: 'circle', label: 'Bird', color: '#EF4444', image: '/images/animals/bird.png' },
  { id: 'square', label: 'Deer', color: '#3B82F6', image: '/images/animals/deer.png' },
  { id: 'triangle', label: 'Fox', color: '#22C55E', image: '/images/animals/fox.png' },
  { id: 'diamond', label: 'Owl', color: '#F59E0B', image: '/images/animals/owl.png' },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getRandomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

function renderShape(shape, size = 68) {
  return (
    <img
      src={shape.image}
      alt={shape.label}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: 'drop-shadow(0 16px 20px rgba(15,23,42,0.18))',
      }}
    />
  );
}

export default function ShapeMatcherDropGame() {
  const { timeLimit, goal, fallDuration } = getMiniGameConfig('shapeMatcher', getSessionDifficulty());

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 12;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;
  const progress = getPlayerProgress();

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(timeLimit, 'shape-matcher', location.key)
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(progress.life ?? 0);
  const [feedback, setFeedback] = useState('Press Start when you are ready to catch matching shapes.');
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [fallingShape, setFallingShape] = useState(() => getRandomShape());
  const [fallingShapeSpawn, setFallingShapeSpawn] = useState(0);
  const [containerIndex, setContainerIndex] = useState(0);
  const [fallProgress, setFallProgress] = useState(0);
  const [hitFlash, setHitFlash] = useState(null);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);
  const resolvingRef = useRef(false);
  const dragStartRef = useRef(null);
  const fallingShapeRef = useRef(fallingShape);
  const earnedCoins = Math.max(0, timeLeft * 2);

  const containerShape = SHAPES[containerIndex];
  const containerShapeRef = useRef(containerShape);

  useEffect(() => {
    fallingShapeRef.current = fallingShape;
  }, [fallingShape]);

  useEffect(() => {
    containerShapeRef.current = containerShape;
  }, [containerShape]);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm) return;

    if (timeLeft <= 0) {
      void handleTimeoutLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showBackConfirm, showLose, showWin, timeLeft, hasStarted]);

  useEffect(() => {
    if (hasStarted && score >= goal) {
      outcomeLockedRef.current = true;
      setShowWin(true);
    }
  }, [goal, score, hasStarted]);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm || busy) return undefined;

    const step = 100 / ((fallDuration * 1000) / 60);
    const interval = setInterval(() => {
      setFallProgress((value) => {
        const nextValue = value + step;
        if (nextValue >= 100) {
          window.clearInterval(interval);
          void resolveCatch();
          return 100;
        }
        return nextValue;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [busy, fallDuration, fallingShapeSpawn, showBackConfirm, showLose, showWin, hasStarted]);

  const rotateContainer = (direction = 1) => {
    if (!hasStarted || busy || showWin || showLose) return;
    setContainerIndex((value) => (value + direction + SHAPES.length) % SHAPES.length);
  };

  const spawnNextShape = () => {
    setFallingShape(getRandomShape());
    setFallingShapeSpawn((value) => value + 1);
    setFallProgress(0);
    resolvingRef.current = false;
  };

  const registerLifeLoss = async () => {
    try {
      return await registerCheckpointLifeLoss(playerSessionId);
    } catch (error) {
      toast.error(error.message);
      return INITIAL_LOSE_STATE;
    }
  };

  const handleTimeoutLoss = async () => {
    if (lossHandledRef.current || outcomeLockedRef.current) return;
    lossHandledRef.current = true;
    outcomeLockedRef.current = true;
    setBusy(true);
    setFeedback('Time is up.');

    const summary = await registerLifeLoss();
    setLives(summary.remainingLives);
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const resolveCatch = async () => {
    if (resolvingRef.current || showWin || showLose) return;
    resolvingRef.current = true;

    const activeContainerShape = containerShapeRef.current;
    const activeFallingShape = fallingShapeRef.current;
    const matched = activeContainerShape.id === activeFallingShape.id;

    if (matched) {
      setScore((value) => value + 1);
      setFeedback(`Perfect catch! ${activeFallingShape.label} matched.`);
      setHitFlash('good');
      window.setTimeout(() => setHitFlash(null), 220);
      spawnNextShape();
      return;
    }

    setFeedback(`Wrong catch. ${activeFallingShape.label} did not fit the ${activeContainerShape.label.toLowerCase()} catcher.`);
    setHitFlash('bad');
    window.setTimeout(() => setHitFlash(null), 240);
    setBusy(true);

    const summary = await registerLifeLoss();
    setLives(summary.remainingLives);

    if (summary.needsLifePurchase) {
      lossHandledRef.current = true;
      setLoseState(summary);
      setBusy(false);
      setShowLose(true);
      return;
    }

    setLoseState(summary);
    setBusy(false);
    spawnNextShape();
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    setTimeLeft(getReplayGameTime(timeLimit));
    setScore(0);
    setLives(getPlayerProgress().life ?? 0);
    setFeedback('Press Start when you are ready to catch matching shapes.');
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setFallingShape(getRandomShape());
    setFallingShapeSpawn((value) => value + 1);
    setContainerIndex(0);
    setFallProgress(0);
    setHitFlash(null);
    lossHandledRef.current = false;
    resolvingRef.current = false;
  };

  const handleLoseShopPurchase = (result) => {
    applyLosePurchase(result, setLoseState);
    if (result.item?.id === 'life') {
      setLives(result.progress?.life ?? 1);
    }
  };

  const handleBackExit = async () => {
    if (!hasStarted) {
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

  const handleLosePrimaryAction = () =>
    handleCheckpointLosePrimaryAction(loseState, navigate, handleRetry, playerSessionId);

  const handleLoseExit = () => handleCheckpointLoseExit(loseState, navigate, playerSessionId);

  const handleWinContinue = async () => {
    const resultId = `shape-matcher-win-${Date.now()}`;
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

  const currentLives = lives ?? 0;
  const backWillResetToStart = currentLives <= 1;

  return (
    <PageLayout>
      <div className="pt-5 pb-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpoint}
          </p>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <RotateCw size={20} />
            Shape Matcher
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted
              ? 'Rotate the catcher so the falling shape lands in the matching container.'
              : 'Press Start when you are ready to catch matching shapes.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              Time
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#9333EA' }}>
              Score
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#7E22CE' }}>
              {score}/{goal}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {feedback}
          </p>
        </Card>

        <div
          className="relative overflow-hidden rounded-[30px] border px-4 pt-4 pb-4"
          style={{
            minHeight: 500,
            borderColor: hitFlash === 'bad' ? '#FCA5A5' : '#BFDBFE',
            backgroundImage: `${
              hitFlash === 'bad'
                ? 'linear-gradient(180deg, rgba(254,226,226,0.78) 0%, rgba(219,234,254,0.62) 100%)'
                : hitFlash === 'good'
                  ? 'linear-gradient(180deg, rgba(220,252,231,0.74) 0%, rgba(219,234,254,0.6) 100%)'
                  : 'linear-gradient(180deg, rgba(239,246,255,0.56) 0%, rgba(219,234,254,0.5) 100%)'
            }, linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(15,23,42,0.04) 100%), url('/forest2.png')`,
            backgroundSize: 'cover, cover, cover',
            backgroundPosition: 'center, center, center',
            backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
            boxShadow: '0 18px 30px rgba(37,99,235,0.14)',
          }}
        >
          <div
            className="absolute left-0 right-0 top-0 h-full"
            style={{
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px)',
              backgroundSize: '100% 44px',
            }}
          />

          <div
            className="absolute left-1/2 -translate-x-1/2 transition-[top] duration-75 linear z-10"
            style={{
              top: `calc(${Math.min(fallProgress, 82)}% - 30px)`,
              opacity: hasStarted ? 1 : 0.45,
            }}
          >
            <div style={{ opacity: hasStarted ? 1 : 0.45 }}>
              {renderShape(fallingShape)}
            </div>
          </div>

          <div className="absolute left-4 right-4 bottom-28 z-20">
            <div className="flex items-end justify-center gap-3">
              {SHAPES.map((shape, index) => {
                const isActive = index === containerIndex;
                return (
                  <div
                    key={shape.id}
                    className="flex flex-1 flex-col items-center justify-center rounded-[26px] border px-2 py-3 transition-all"
                    style={{
                      minHeight: 108,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.66)',
                      borderColor: isActive ? shape.color : 'rgba(148,163,184,0.35)',
                      boxShadow: isActive
                        ? `0 16px 26px ${shape.color}33, inset 0 1px 0 rgba(255,255,255,0.75)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.55)',
                      transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                    }}
                  >
                    <div
                      style={{
                        opacity: hasStarted ? 0.85 : 0.5,
                        filter: 'grayscale(1)',
                      }}
                    >
                      {renderShape(shape, 42)}
                    </div>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#334155' }}>
                      {shape.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute left-4 right-4 bottom-4 z-30">
            <button
              type="button"
              onPointerDown={(event) => {
                if (!hasStarted || busy || showWin || showLose) return;
                dragStartRef.current = event.clientX;
              }}
              onPointerUp={(event) => {
                if (!hasStarted || busy || showWin || showLose) return;
                const start = dragStartRef.current;
                if (start == null) {
                  rotateContainer(1);
                  return;
                }

                const delta = event.clientX - start;
                dragStartRef.current = null;

                if (Math.abs(delta) < 18) {
                  rotateContainer(1);
                  return;
                }

                rotateContainer(delta > 0 ? 1 : -1);
              }}
              disabled={!hasStarted || busy || showWin || showLose}
              className="mx-auto flex min-h-[74px] w-full max-w-[260px] items-center justify-center gap-3 rounded-[28px] px-5 py-4 text-white"
              style={{
                background: hasStarted
                  ? `linear-gradient(160deg, ${containerShape.color} 0%, rgba(15,23,42,0.9) 180%)`
                  : 'linear-gradient(160deg, #94A3B8 0%, rgba(15,23,42,0.9) 180%)',
                boxShadow: '0 18px 30px rgba(15,23,42,0.18)',
                opacity: hasStarted ? 1 : 0.7,
              }}
            >
              <RotateCw size={20} />
              <span className="text-sm font-bold uppercase tracking-[0.16em]">
                {hasStarted ? 'Tap / Drag to Rotate' : 'Locked Until Start'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
            Back
          </Button>
          {!hasStarted ? (
            <Button variant="green" onClick={() => setHasStarted(true)} disabled={busy}>
              Start
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title="Shape master!"
            message={`You caught ${score} matching shapes and earned ${earnedCoins} coins from the time left.`}
          />
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} checkpoint={checkpoint} />
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
              Shape matcher failed
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {loseState.needsLifePurchase
                ? 'No lives left. Buy an extra life now to keep your current checkpoint.'
                : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
            </p>
          </div>
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

      <Popup open={showBackConfirm} onClose={() => setShowBackConfirm(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">!</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Leave this game?
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {!hasStarted
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
    </PageLayout>
  );
}
