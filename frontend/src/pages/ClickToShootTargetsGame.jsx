import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Crosshair } from 'lucide-react';
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

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getRandomTarget() {
  const size = Math.floor(Math.random() * 36) + 68;
  const halfSizePercent = size / 6.8;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    x: Math.min(100 - halfSizePercent, Math.max(halfSizePercent, Math.floor(Math.random() * 100))),
    y: Math.min(100 - halfSizePercent, Math.max(halfSizePercent, Math.floor(Math.random() * 100))),
    size,
    hue: Math.floor(Math.random() * 120) + 10,
  };
}

export default function ClickToShootTargetsGame() {
  const { t } = useLanguage();
  const { timeLimit, goal } = getMiniGameConfig('clickToShootTargets', getSessionDifficulty());

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 10;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(timeLimit, 'click-to-shoot-targets', location.key)
  );
  const [hits, setHits] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [target, setTarget] = useState(() => getRandomTarget());
  const [flash, setFlash] = useState(null);
  const [hitBurst, setHitBurst] = useState(null);
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
    if (hasStarted && hits >= goal) {
      outcomeLockedRef.current = true;
      setShowWin(true);
    }
  }, [goal, hits, hasStarted]);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm) return undefined;

    const mover = setInterval(() => {
      setTarget(getRandomTarget());
    }, 900);

    return () => clearInterval(mover);
  }, [showBackConfirm, showLose, showWin, hasStarted]);

  const handleTargetHit = () => {
    if (!hasStarted || busy || showWin || showLose) return;

    const burst = {
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: target.x,
      y: target.y,
      size: target.size,
      hue: target.hue,
    };

    setHits((value) => value + 1);
    setHitBurst(burst);
    setFlash('hit');
    setTarget(getRandomTarget());
    window.setTimeout(() => setFlash(null), 160);
    window.setTimeout(() => setHitBurst(null), 320);
  };

  const handleArenaMiss = (event) => {
    if (event.target !== event.currentTarget || !hasStarted || busy || showWin || showLose) return;

    setFlash('miss');
    window.setTimeout(() => setFlash(null), 180);
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    setTimeLeft(getReplayGameTime(timeLimit));
    setHits(0);
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setTarget(getRandomTarget());
    setFlash(null);
    setHitBurst(null);
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
    const resultId = `click-to-shoot-targets-win-${Date.now()}`;
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
        <style>{`
          @keyframes target-hit-ring {
            0% {
              opacity: 0.95;
              transform: scale(0.7);
            }
            100% {
              opacity: 0;
              transform: scale(1.55);
            }
          }

          @keyframes target-hit-score {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.9);
            }
            20% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translateY(-18px) scale(1.08);
            }
          }
        `}</style>

        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            {translate(t.checkpointLabel, { checkpoint })}
          </p>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Crosshair size={20} />
            {t.targetShooterTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted ? t.targetShooterRunningInstruction : t.targetShooterReadyInstruction}
          </p>
        </div>

        {!hasStarted && (
          <Button variant="green" onClick={() => setHasStarted(true)} disabled={busy}>
            {t.start}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-3">
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
            <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
              {t.targetShooterHitLabel}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#166534' }}>
              {hits}/{goal}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {hasStarted ? t.targetShooterModeTitle : t.targetShooterReadyStatus}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted
              ? translate(t.targetShooterModeDesc, { goal })
              : translate(t.targetShooterReadyDesc, { goal })}
          </p>
        </Card>

        <div
          role="button"
          tabIndex={0}
          onClick={handleArenaMiss}
          onKeyDown={() => {}}
          className="relative overflow-hidden rounded-[32px] border"
          style={{
            height: 340,
            borderColor: flash === 'miss' ? '#EF4444' : '#BFDBFE',
            background: flash === 'miss'
              ? 'radial-gradient(circle at center, rgba(254,202,202,0.9) 0%, rgba(191,219,254,0.75) 52%, rgba(224,242,254,0.95) 100%)'
              : 'radial-gradient(circle at center, rgba(255,255,255,0.98) 0%, rgba(219,234,254,0.92) 48%, rgba(224,242,254,0.98) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 18px 34px rgba(37,99,235,0.14)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {hitBurst && (
            <>
              <div
                key={`${hitBurst.key}-ring`}
                className="pointer-events-none absolute rounded-full border-4"
                style={{
                  width: hitBurst.size,
                  height: hitBurst.size,
                  left: `calc(${hitBurst.x}% - ${hitBurst.size / 2}px)`,
                  top: `calc(${hitBurst.y}% - ${hitBurst.size / 2}px)`,
                  borderColor: `hsla(${hitBurst.hue} 95% 48% / 0.9)`,
                  boxShadow: `0 0 24px hsla(${hitBurst.hue} 100% 50% / 0.55)`,
                  animation: 'target-hit-ring 320ms ease-out forwards',
                }}
              />
              <div
                key={`${hitBurst.key}-score`}
                className="pointer-events-none absolute font-black text-xl"
                style={{
                  left: `calc(${hitBurst.x}% - 16px)`,
                  top: `calc(${hitBurst.y}% - ${hitBurst.size / 2}px - 18px)`,
                  color: '#166534',
                  textShadow: '0 8px 18px rgba(22,101,52,0.22)',
                  animation: 'target-hit-score 320ms ease-out forwards',
                }}
              >
                +1
              </div>
            </>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleTargetHit();
            }}
            disabled={!hasStarted || busy || showWin || showLose}
            className="absolute rounded-full transition-[left,top,transform] duration-300 ease-out"
            style={{
              width: target.size,
              height: target.size,
              left: `calc(${target.x}% - ${target.size / 2}px)`,
              top: `calc(${target.y}% - ${target.size / 2}px)`,
              transform: flash === 'hit' ? 'scale(0.9)' : 'scale(1)',
              background: `radial-gradient(circle, white 0 18%, #111827 18% 26%, white 26% 42%, hsl(${target.hue} 90% 54%) 42% 64%, #111827 64% 72%, white 72% 100%)`,
              boxShadow: '0 16px 24px rgba(15,23,42,0.2)',
            }}
          />
        </div>

        <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
          {t.back}
        </Button>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title={t.targetShooterWinTitle}
            message={translate(t.targetShooterWinMessage, { hits, coins: earnedCoins })}
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