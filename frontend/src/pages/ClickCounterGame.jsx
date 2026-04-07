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
    if (hasStarted && clicks >= TARGET_CLICKS) {
      outcomeLockedRef.current = true;
      setShowWin(true);
    }
  }, [clicks, TARGET_CLICKS, hasStarted]);

  const handleTap = () => {
    if (!hasStarted || busy || showWin || showLose) return;

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

        <button
          type="button"
          onClick={handleTap}
          disabled={!hasStarted || busy || showWin || showLose}
          className="w-full rounded-[32px] py-12 px-6 text-white font-extrabold text-2xl transition-transform"
        >
          {t.clickRushTapButton}
        </button>

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
          {!hasStarted ? (
            <Button variant="green" onClick={() => setHasStarted(true)}>
              {t.start}
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <CheckpointWinReward
          checkpoint={checkpoint}
          title={t.clickRushWinTitle}
          message={translate(t.clickRushWinMessage, { clicks, coins: earnedCoins })}
        />
      </Popup>
    </PageLayout>
  );
}