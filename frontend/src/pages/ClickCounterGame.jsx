import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import toast from 'react-hot-toast';
import { Clock, MousePointerClick } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import CheckpointWinReward from '../components/ui/CheckpointWinReward';
import GameStartOverlay from '../components/ui/GameStartOverlay';
import { playerAPI } from '../utils/api';
import {
  clearUnusedExtraLife,
  getPlayerProgress,
  getInitialGameTime,
  getReplayGameTime,
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
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../translations';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getEggStage(clicks, target) {
  const progress = target > 0 ? clicks / target : 0;

  if (clicks >= target) {
    return {
      shellScale: 0,
      shellGlow: '0 0 0 rgba(250, 204, 21, 0)',
      shellFilter: 'brightness(1.05)',
      aura: 'radial-gradient(circle, rgba(255,244,186,0.98) 0%, rgba(253,224,71,0.62) 40%, rgba(251,146,60,0) 72%)',
      crackOpacity: 0,
      crackCount: 0,
      particles: 14,
      label: 'hatched',
    };
  }

  if (progress >= 0.66) {
    return {
      shellScale: 1.08,
      shellGlow: '0 0 42px rgba(251, 191, 36, 0.6), 0 0 84px rgba(249, 115, 22, 0.25)',
      shellFilter: 'brightness(1.08) saturate(1.14)',
      aura: 'radial-gradient(circle, rgba(255,247,196,0.95) 0%, rgba(253,224,71,0.5) 42%, rgba(251,146,60,0) 74%)',
      crackOpacity: 0.95,
      crackCount: 5,
      particles: 10,
      label: 'charged',
    };
  }

  if (progress >= 0.33) {
    return {
      shellScale: 1.02,
      shellGlow: '0 0 26px rgba(253, 224, 71, 0.42)',
      shellFilter: 'brightness(1.03)',
      aura: 'radial-gradient(circle, rgba(255,251,235,0.96) 0%, rgba(254,240,138,0.34) 45%, rgba(255,255,255,0) 72%)',
      crackOpacity: 0.7,
      crackCount: 3,
      particles: 6,
      label: 'glowing',
    };
  }

  return {
    shellScale: 1,
    shellGlow: '0 14px 30px rgba(120, 113, 108, 0.14)',
    shellFilter: 'brightness(1)',
    aura: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.28) 46%, rgba(255,255,255,0) 72%)',
    crackOpacity: 0.38,
    crackCount: 1,
    particles: 0,
    label: 'simple',
  };
}

export default function ClickCounterGame() {
  const { t } = useLanguage();

  const { timeLimit: CLICK_TIME_LIMIT, goal: TARGET_CLICKS } =
    getMiniGameConfig('clickCounter', getSessionDifficulty());

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 7;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(CLICK_TIME_LIMIT, 'click-counter', location.key)
  );
  const [clicks, setClicks] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [pressed, setPressed] = useState(false);
  const [isHatching, setIsHatching] = useState(false);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);
  const hatchTimeoutRef = useRef(null);
  const earnedCoins = Math.max(0, timeLeft * 2);
  const eggStage = getEggStage(clicks, TARGET_CLICKS);
  const isHatched = clicks >= TARGET_CLICKS;

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
    if (hasStarted && clicks >= TARGET_CLICKS) {
      outcomeLockedRef.current = true;
      setIsHatching(true);
      hatchTimeoutRef.current = window.setTimeout(() => {
        setShowWin(true);
        setIsHatching(false);
        hatchTimeoutRef.current = null;
      }, 1200);
    }
  }, [clicks, TARGET_CLICKS, hasStarted]);

  useEffect(() => () => {
    if (hatchTimeoutRef.current) {
      window.clearTimeout(hatchTimeoutRef.current);
    }
  }, []);

  const handleTap = () => {
    if (!hasStarted || busy || showWin || showLose || isHatching) return;

    setClicks((value) => value + 1);
    setPressed(true);
    setTimeout(() => setPressed(false), 120);
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    setTimeLeft(getReplayGameTime(CLICK_TIME_LIMIT));
    setClicks(0);
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setPressed(false);
    setIsHatching(false);
    lossHandledRef.current = false;
    if (hatchTimeoutRef.current) {
      window.clearTimeout(hatchTimeoutRef.current);
      hatchTimeoutRef.current = null;
    }
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
    const resultId = `click-counter-win-${Date.now()}`;
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
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t.clickRushTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted ? t.clickRushRunningInstruction : t.clickRushReadyInstruction}
          </p>
        </div>

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
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <MousePointerClick size={14} />
              {t.clickRushClicksLabel}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {clicks}/{TARGET_CLICKS}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {hasStarted ? t.clickRushStatusTitleRunning : t.clickRushStatusTitleReady}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted
              ? translate(t.clickRushStatusDescRunning, { goal: TARGET_CLICKS })
              : translate(t.clickRushStatusDescReady, { goal: TARGET_CLICKS })}
          </p>
        </Card>

        <div className="relative">
        <button
          type="button"
          onClick={handleTap}
          disabled={!hasStarted || busy || showWin || showLose}
          className="relative w-full overflow-hidden rounded-[34px] px-4 py-6 text-center transition-transform disabled:cursor-not-allowed"
          style={{
            background: pressed
              ? 'radial-gradient(circle at 50% 24%, rgba(255,252,230,0.98) 0%, rgba(254,240,138,0.82) 34%, rgba(251,191,36,0.44) 55%, rgba(120,53,15,0.18) 100%)'
              : 'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.98) 0%, rgba(255,248,220,0.96) 26%, rgba(254,240,138,0.62) 50%, rgba(251,146,60,0.24) 100%)',
            boxShadow: pressed
              ? 'inset 0 12px 24px rgba(146,64,14,0.18), 0 10px 24px rgba(245,158,11,0.18)'
              : '0 18px 34px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.72)',
            transform: pressed ? 'scale(0.985)' : 'scale(1)',
            opacity: !hasStarted || busy || showWin || showLose ? 0.72 : 1,
            border: '1px solid rgba(217, 119, 6, 0.18)',
          }}
        >
          <style>{`
            @keyframes click-rush-egg-float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-6px) rotate(1.5deg); }
            }

            @keyframes click-rush-egg-wobble {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-5deg); }
              75% { transform: rotate(5deg); }
            }

            @keyframes click-rush-particle-burst {
              0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translate(var(--particle-x), var(--particle-y)) scale(1); opacity: 0; }
            }

            @keyframes click-rush-lightning {
              0%, 100% { opacity: 0.18; transform: scaleY(0.92); }
              50% { opacity: 0.95; transform: scaleY(1.08); }
            }
          `}</style>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 20% 16%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 24%), radial-gradient(circle at 80% 20%, rgba(255,247,196,0.7) 0%, rgba(255,247,196,0) 18%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 55%)',
            }}
          />

          <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-3">
            <div className="absolute inset-x-0 top-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] sm:text-xs">
              <span style={{ color: '#B45309' }}>{t.clickRushTapButton}</span>
              <span style={{ color: '#FB923C' }}>{clicks}/{TARGET_CLICKS}</span>
            </div>

            <div
              className="relative flex h-52 w-full items-center justify-center"
              style={{ perspective: '900px' }}
            >
              <div
                className="pointer-events-none absolute h-44 w-44 rounded-full blur-2xl"
                style={{
                  background: eggStage.aura,
                  transform: pressed ? 'scale(1.08)' : 'scale(1)',
                }}
              />

              {Array.from({ length: eggStage.particles }, (_, index) => {
                const angle = (index / Math.max(eggStage.particles, 1)) * Math.PI * 2;
                const radius = 26 + (index % 4) * 10;
                return (
                  <span
                    key={`particle-${index}`}
                    className="pointer-events-none absolute h-3 w-3 rounded-full"
                    style={{
                      background: index % 2 === 0 ? '#FACC15' : '#FB923C',
                      boxShadow: '0 0 16px rgba(250, 204, 21, 0.75)',
                      '--particle-x': `${Math.cos(angle) * radius}px`,
                      '--particle-y': `${Math.sin(angle) * radius}px`,
                      animation: 'click-rush-particle-burst 1s ease-out infinite',
                      animationDelay: `${index * 70}ms`,
                    }}
                  />
                );
              })}

              {eggStage.label === 'charged' && (
                <>
                  <span
                    className="pointer-events-none absolute left-[28%] top-[24%] h-20 w-[10px]"
                    style={{
                      clipPath: 'polygon(40% 0, 100% 0, 58% 44%, 100% 44%, 24% 100%, 40% 58%, 0 58%)',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,204,21,0.9) 100%)',
                      filter: 'drop-shadow(0 0 10px rgba(250,204,21,0.8))',
                      animation: 'click-rush-lightning 0.8s ease-in-out infinite',
                    }}
                  />
                  <span
                    className="pointer-events-none absolute right-[30%] top-[20%] h-16 w-[8px]"
                    style={{
                      clipPath: 'polygon(48% 0, 100% 0, 64% 40%, 100% 40%, 22% 100%, 38% 56%, 0 56%)',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(147,197,253,0.92) 100%)',
                      filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.9))',
                      animation: 'click-rush-lightning 0.7s ease-in-out infinite 90ms',
                    }}
                  />
                </>
              )}

              {!isHatched ? (
                <div
                  className="relative flex h-44 w-36 items-center justify-center"
                  style={{
                    transform: `scale(${eggStage.shellScale}) ${pressed ? 'rotate(1deg)' : 'rotate(0deg)'}`,
                    animation:
                      eggStage.label === 'charged'
                        ? 'click-rush-egg-wobble 0.45s ease-in-out infinite'
                        : 'click-rush-egg-float 2.5s ease-in-out infinite',
                    filter: eggStage.shellFilter,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[50%_50%_46%_46%/58%_58%_42%_42%]"
                    style={{
                      background:
                        'linear-gradient(180deg, #FFFDF6 0%, #FDE68A 36%, #F59E0B 100%)',
                      boxShadow: eggStage.shellGlow,
                      border: '2px solid rgba(180, 83, 9, 0.18)',
                    }}
                  />
                  <div
                    className="absolute left-[22%] top-[18%] h-16 w-10 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.08) 100%)',
                      transform: 'rotate(-18deg)',
                    }}
                  />
                  {Array.from({ length: eggStage.crackCount }, (_, index) => (
                    <span
                      key={`crack-${index}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${34 + index * 8}%`,
                        top: `${35 + (index % 2) * 11}%`,
                        width: index % 2 === 0 ? 4 : 3,
                        height: 30 - index * 3,
                        background: 'linear-gradient(180deg, rgba(146,64,14,0.92) 0%, rgba(120,53,15,0.38) 100%)',
                        transform: `rotate(${index % 2 === 0 ? -18 : 18}deg)`,
                        opacity: eggStage.crackOpacity,
                      }}
                    />
                  ))}
                  <div
                    className="absolute bottom-4 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full blur-md"
                    style={{ background: 'rgba(120, 53, 15, 0.16)' }}
                  />
                </div>
              ) : (
                <div className="relative flex h-44 w-44 items-center justify-center">
                  <span className="absolute bottom-3 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-[rgba(120,53,15,0.14)] blur-md" />
                  <span className="absolute bottom-11 left-[22%] text-4xl rotate-[-18deg]">🥚</span>
                  <span className="absolute bottom-8 right-[20%] text-4xl rotate-[16deg]">🥚</span>
                  <span className="text-[84px] leading-none drop-shadow-[0_12px_22px_rgba(249,115,22,0.26)]">🐣</span>
                </div>
              )}
            </div>

            <div className="max-w-[15rem] text-center">
              <p className="text-base font-black uppercase tracking-[0.16em]" style={{ color: '#9A3412' }}>
                {isHatched ? 'Egg hatched!' : `Egg form: ${eggStage.label}`}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5" style={{ color: '#7C2D12' }}>
                {isHatched
                  ? isHatching
                    ? 'The chicken is hatching...'
                    : 'The chicken has hatched. Your final tap opened the egg.'
                  : 'Keep tapping the egg to wake its next evolution.'}
              </p>
            </div>
          </div>
        </button>
        <GameStartOverlay
          show={!hasStarted}
          onStart={() => setHasStarted(true)}
          title={t.clickRushTitle}
          description={t.clickRushReadyInstruction}
          startLabel={t.start}
          disabled={busy}
        />
        </div>

        <Card>
          <p className="text-sm font-bold">{t.clickRushHowToWinTitle}</p>
          <p className="text-xs mt-1">
            {translate(t.clickRushHowToWinDesc, { goal: TARGET_CLICKS })}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)}>
            {t.back}
          </Button>
          <div />
        </div>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title={t.clickRushWinTitle}
            message={translate(t.clickRushWinMessage, { clicks, coins: earnedCoins })}
          />
          <CheckpointShopPanel
            earnedCoins={earnedCoins}
            grantCoins={showWin}
            isOpen={showWin}
            checkpoint={checkpoint}
          />
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
            warningMessage={loseState.needsLifePurchase ? t.whackLoseWarning : ''}
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
