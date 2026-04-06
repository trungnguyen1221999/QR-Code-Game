import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Gamepad2, Trophy } from 'lucide-react';
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

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function SnakeGame() {
  const { timeLimit, goal } = getMiniGameConfig('snake', getSessionDifficulty());

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 9;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;
  const iframeRef = useRef(null);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(timeLimit, 'snake', location.key)
  );
  const [score, setScore] = useState(0);
  const [statusText, setStatusText] = useState('Tap the game area and use arrow keys to control the snake.');
  const [iframeKey, setIframeKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm) return;

    if (timeLeft <= 0) {
      void handleLoss('Time is up');
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
    if (showWin || showLose || showBackConfirm) {
      outcomeLockedRef.current = true;
      iframeRef.current?.contentWindow?.postMessage({ type: 'snake-control', action: 'freeze' }, '*');
    }
  }, [showBackConfirm, showLose, showWin]);

  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.source !== 'snake-game') return;

      if (data.event === 'reset') {
        setScore(data.score ?? 0);
        setStatusText(hasStarted ? 'Press any arrow key inside the snake game to start.' : 'Press Start when you are ready to play snake.');
        lossHandledRef.current = false;
        return;
      }

      if (data.event === 'start') {
        setStatusText('Collect apples and avoid walls or your own tail.');
        return;
      }

      if (data.event === 'score') {
        setScore(data.score ?? 0);
        setStatusText(`Great! Current snake score: ${data.score ?? 0}`);
        return;
      }

      if (data.event === 'gameover') {
        if (outcomeLockedRef.current) return;
        setStatusText(data.message || 'Game over');
        void handleLoss(data.message || 'Game over');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [hasStarted]);

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      iframeRef.current?.contentWindow?.focus?.();
    }, 300);

    return () => clearTimeout(focusTimer);
  }, [iframeKey]);

  const registerLifeLoss = async () => {
    try {
      return await registerCheckpointLifeLoss(playerSessionId);
    } catch (error) {
      toast.error(error.message);
      return INITIAL_LOSE_STATE;
    }
  };

  const handleLoss = async (message) => {
    if (lossHandledRef.current || outcomeLockedRef.current) return;
    lossHandledRef.current = true;
    outcomeLockedRef.current = true;
    setBusy(true);
    if (message) setStatusText(message);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    setTimeLeft(getReplayGameTime(timeLimit));
    setScore(0);
    setStatusText('Tap the game area and use arrow keys to control the snake.');
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    lossHandledRef.current = false;
    setIframeKey((value) => value + 1);
  };

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

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
    const resultId = `snake-win-${Date.now()}`;
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
            Checkpoint {checkpoint}
          </p>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Gamepad2 size={20} />
            Snake Game
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted
              ? `Reach ${goal} apples before time runs out. Use arrow keys after tapping the game area.`
              : `Press Start when you are ready to reach ${goal} apples.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <Trophy size={14} />
              Score
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {score}/{goal}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#047857' }}>
              Lives
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#047857' }}>
              {currentLives === Infinity ? '∞' : currentLives}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {hasStarted ? statusText : 'Press Start to load the snake game.'}
          </p>
        </Card>

        <div
          className="overflow-hidden rounded-[28px] border"
          style={{
            background: 'linear-gradient(180deg, #fecaca 0%, #fb7185 100%)',
            borderColor: 'rgba(190,24,93,0.18)',
            boxShadow: '0 18px 30px rgba(225, 29, 72, 0.16)',
          }}
        >
          {hasStarted ? (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="Snake Game"
              src="/snake-game/index.html"
              className="block w-full border-0"
              style={{ height: 460, backgroundColor: 'transparent' }}
            />
          ) : (
            <div className="flex h-[460px] items-center justify-center text-center px-6" style={{ color: 'var(--color-text)' }}>
              Press Start to load the checkpoint game.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
            Back
          </Button>
          {!hasStarted ? (
            <Button
              variant="green"
              onClick={() => {
                setHasStarted(true);
                setIframeKey((value) => value + 1);
                setStatusText('Tap the game area and use arrow keys to control the snake.');
              }}
              disabled={busy}
            >
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
            title="Snake cleared!"
            message={`You collected ${score} apples and earned ${earnedCoins} coins from the time left.`}
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
              Snake game over
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
