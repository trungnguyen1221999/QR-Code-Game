import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleDot, Clock } from 'lucide-react';
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
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../translations';

const SHAPES = [
  { id: 'circle', label: 'Circle', glyph: '●', color: '#EF4444' },
  { id: 'square', label: 'Square', glyph: '■', color: '#3B82F6' },
  { id: 'triangle', label: 'Triangle', glyph: '▲', color: '#22C55E' },
  { id: 'diamond', label: 'Diamond', glyph: '◆', color: '#F59E0B' },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildRound() {
  const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    target,
    options: shuffle(SHAPES),
  };
}

export default function ShapeMatcherGame() {
  const { t } = useLanguage();
  const { timeLimit, goal } = getMiniGameConfig('shapeMatcher', getSessionDifficulty());

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 12;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;
  const initialRound = buildRound();

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(timeLimit, 'shape-matcher', location.key)
  );
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(initialRound.target);
  const [options, setOptions] = useState(initialRound.options);
  const [feedback, setFeedback] = useState(t.shapeMatcherReadyInstruction);
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [pressedShape, setPressedShape] = useState(null);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm) return;

    if (timeLeft <= 0) {
      void handleLoss();
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

  const advanceRound = () => {
    const next = buildRound();
    setRound((value) => value + 1);
    setTarget(next.target);
    setOptions(next.options);
  };

  const handleChoice = (shape) => {
    if (!hasStarted || busy || showWin || showLose) return;

    setPressedShape(shape.id);
    window.setTimeout(() => setPressedShape(null), 140);

    if (shape.id === target.id) {
      setScore((value) => value + 1);
      setFeedback(translate(t.shapeMatcherNiceFeedback, { shape: target.label.toLowerCase() }));
    } else {
      setScore((value) => Math.max(0, value - 1));
      setFeedback(translate(t.shapeMatcherMissFeedback, { shape: target.label.toLowerCase() }));
    }

    advanceRound();
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    const next = buildRound();
    setTimeLeft(getReplayGameTime(timeLimit));
    setScore(0);
    setRound(1);
    setTarget(next.target);
    setOptions(next.options);
    setFeedback(t.shapeMatcherReadyInstruction);
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setPressedShape(null);
    lossHandledRef.current = false;
  };

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const registerLifeLoss = async () => {
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

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
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

  const currentLives = getPlayerProgress().life ?? 0;
  const backWillResetToStart = currentLives <= 1;

  return (
    <PageLayout>
      <div className="pt-5 pb-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            {translate(t.checkpointLabel, { checkpoint })}
          </p>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <CircleDot size={20} />
            {t.shapeMatcherTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted ? t.shapeMatcherRunningInstruction : t.shapeMatcherReadyInstruction}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              {t.timeLeft}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#9333EA' }}>
              {t.shapeMatcherScore}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#7E22CE' }}>
              {score}/{goal}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
              {t.shapeMatcherRound}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {round}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--color-subtext)' }}>
            {t.shapeMatcherTargetShape}
          </p>
          <p
            className="mt-3 text-6xl font-black"
            style={{
              color: hasStarted ? target.color : '#94A3B8',
              textShadow: '0 10px 24px rgba(0,0,0,0.12)',
            }}
          >
            {hasStarted ? target.glyph : '?'}
          </p>
          <p className="text-sm mt-2 font-bold" style={{ color: 'var(--color-text)' }}>
            {hasStarted ? target.label : t.shapeMatcherHiddenUntilStart}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {options.map((shape) => (
            <button
              key={shape.id}
              type="button"
              onClick={() => handleChoice(shape)}
              disabled={!hasStarted || busy || showWin || showLose}
              className="rounded-3xl px-4 py-6 font-extrabold transition-transform"
              style={{
                background: hasStarted
                  ? `linear-gradient(160deg, ${shape.color} 0%, rgba(17,24,39,0.9) 190%)`
                  : 'linear-gradient(160deg, #CBD5E1 0%, #94A3B8 190%)',
                boxShadow: pressedShape === shape.id
                  ? 'inset 0 8px 18px rgba(0,0,0,0.22)'
                  : '0 14px 24px rgba(15,23,42,0.18)',
                transform: pressedShape === shape.id ? 'scale(0.97)' : 'scale(1)',
                color: 'white',
                opacity: hasStarted ? 1 : 0.6,
              }}
            >
              <span className="block text-5xl leading-none">{hasStarted ? shape.glyph : '?'}</span>
              <span className="block mt-2 text-sm uppercase tracking-[0.14em]">
                {hasStarted ? shape.label : t.shapeMatcherLocked}
              </span>
            </button>
          ))}
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {feedback}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
            {t.back}
          </Button>
          {!hasStarted ? (
            <Button variant="green" onClick={() => setHasStarted(true)} disabled={busy}>
              {t.start}
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
            title={t.shapeMatcherWinTitle}
            message={translate(t.shapeMatcherWinMessage, { score, coins: earnedCoins })}
          />
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} checkpoint={checkpoint} />
          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            {t.continue}
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">⏰</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {t.whackLoseTitle}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {loseState.needsLifePurchase
                ? t.whackLoseNoLives
                : translate(t.whackLoseWithLives, { lives: loseState.remainingLives ?? 0 })}
            </p>
          </div>
          <CheckpointShopPanel
            isOpen={showLose}
            checkpoint={checkpoint}
            warningMessage={
              loseState.needsLifePurchase
                ? t.whackLoseWarning
                : ''
            }
            onPurchase={handleLoseShopPurchase}
          />
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="red" onClick={handleLosePrimaryAction} disabled={busy}>
              {loseState.needsLifePurchase ? t.whackCheckpointReset : t.whackPlayAgain}
            </Button>
            <Button variant="green" onClick={handleLoseExit} disabled={busy}>
              {t.whackExitGame}
            </Button>
          </div>
        </div>
      </Popup>

      <Popup open={showBackConfirm} onClose={() => setShowBackConfirm(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">!</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {t.whackLeaveTitle}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {!hasStarted
                ? t.whackLeaveNotStarted
                : backWillResetToStart
                ? t.whackLeaveLastLife
                : t.whackLeaveNormal}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="red" onClick={handleBackExit} disabled={busy}>
              {t.confirm}
            </Button>
            <Button variant="green" onClick={() => setShowBackConfirm(false)} disabled={busy}>
              {t.cancel}
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}