import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import CheckpointWinReward from '../components/ui/CheckpointWinReward';
import { playerAPI } from '../utils/api';
import {
  applyLossToStoredProgress,
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
} from '../utils/checkpointLoseFlow';
import Card from '../components/ui/Card';
import { getMiniGameConfig, getSessionDifficulty } from '../utils/constantMiniGame';
const CANVAS_ID = 'tower-original-canvas';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getCanvasSize() {
  if (typeof window === 'undefined') {
    return { width: 320, height: 480 };
  }

  const width = Math.min(window.innerWidth - 48, 360);
  return { width, height: Math.round(width * 1.5) };
}

function ensureTowerScript() {
  if (window.TowerGame) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-tower-original="1"]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = '/tower-original/tower-main.js';
    script.async = true;
    script.dataset.towerOriginal = '1';
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function safelyTogglePause(game, shouldPause, pausedRef) {
  if (!game) return;

  if (shouldPause && !pausedRef.current) {
    game.togglePaused();
    pausedRef.current = true;
    return;
  }

  if (!shouldPause && pausedRef.current) {
    game.togglePaused();
    pausedRef.current = false;
  }
}

export default function TowerBuilderGame() {
  const { timeLimit: GAME_TIME_LIMIT, goal: TARGET_FLOORS } = getMiniGameConfig('tower', getSessionDifficulty());
  useBlockBack();
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 4;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

  const [canvasSize, setCanvasSize] = useState(() => getCanvasSize());
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => getInitialGameTime(GAME_TIME_LIMIT, 'tower-builder', location.key));
  const [floors, setFloors] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const earnedCoins = Math.max(0, timeLeft * 2);
  const towerGameRef = useRef(null);
  const endedRef = useRef(false);
  const pausedByOverlayRef = useRef(false);
  const initializingRef = useRef(false);
  const resetTimeOnNextInitRef = useRef(false);
  const activeGameInstanceRef = useRef(0);
  const busyRef = useRef(false);
  const showLoseRef = useRef(false);
  const canvasDomId = `${CANVAS_ID}-${canvasVersion}`;

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    showLoseRef.current = showLose;
  }, [showLose]);

  useEffect(() => {
    const handleResize = () => setCanvasSize(getCanvasSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm) return;
    if (timeLeft <= 0) {
      void handleLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showBackConfirm, showLose, showWin, timeLeft]);

  useEffect(() => {
    const shouldPause = showWin || showLose || showBackConfirm;
    safelyTogglePause(towerGameRef.current, shouldPause, pausedByOverlayRef);
  }, [showBackConfirm, showLose, showWin]);

  useEffect(() => {
    return () => {
      if (towerGameRef.current?.pauseBgm) {
        towerGameRef.current.pauseBgm();
      }
    };
  }, []);

  const stopGame = (gameOverride = null) => {
    const game = gameOverride ?? towerGameRef.current;
    if (!game) return;

    game.setVariable?.('GAME_START_NOW', false);
    if (pausedByOverlayRef.current) {
      pausedByOverlayRef.current = false;
    } else if (!game.paused) {
      game.togglePaused();
      pausedByOverlayRef.current = true;
    }
    game.pauseBgm?.();
  };

  const registerLifeLoss = () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const summary = applyLossToStoredProgress();
    if (playerSessionId) {
      playerAPI.loseLife(playerSessionId).catch((error) => {
        toast.error(error.message);
      });
    }
    return summary;
  };

  const handleLoss = (instanceId = activeGameInstanceRef.current) => {
    if (instanceId !== activeGameInstanceRef.current) return;
    if (busyRef.current || showLoseRef.current) return;
    endedRef.current = true;
    stopGame();
    const summary = registerLifeLoss();
    setLoseState(summary);
    setShowLose(true);
  };

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const initializeGame = async (resetTime = false, remountCanvas = false) => {
    if (remountCanvas) {
      stopGame();
      towerGameRef.current = null;
      activeGameInstanceRef.current += 1;
      resetTimeOnNextInitRef.current = resetTime;
      setCanvasVersion((v) => v + 1);
      return;
    }

    if (initializingRef.current) return;
    initializingRef.current = true;
    const shouldResetTime = resetTime || resetTimeOnNextInitRef.current;
    resetTimeOnNextInitRef.current = false;
    endedRef.current = false;
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setFloors(0);
    setBusy(false);
    if (shouldResetTime) {
      setTimeLeft(getReplayGameTime(GAME_TIME_LIMIT));
    }

    try {
      await ensureTowerScript();

      if (towerGameRef.current?.pauseBgm) {
        towerGameRef.current.pauseBgm();
      }

      const instanceId = activeGameInstanceRef.current;

      const game = window.TowerGame({
        width: canvasSize.width,
        height: canvasSize.height,
        canvasId: canvasDomId,
        soundOn: false,
        setGameSuccess: (successCount) => {
          if (instanceId !== activeGameInstanceRef.current) return;
          setFloors(successCount);
          if (successCount >= TARGET_FLOORS && !endedRef.current) {
            endedRef.current = true;
            stopGame(game);
            setShowWin(true);
          }
        },
        setGameFailed: (failedCount) => {
          if (instanceId !== activeGameInstanceRef.current) return;
          if (failedCount >= 3 && !endedRef.current) {
            handleLoss(instanceId);
          }
        },
      });

      towerGameRef.current = game;
      pausedByOverlayRef.current = false;

      game.load(() => {
        game.init();
        game.start();
      });
    } catch (error) {
      toast.error('Failed to load tower builder game');
    } finally {
      initializingRef.current = false;
    }
  };

  useEffect(() => {
    void initializeGame(false);
  }, [canvasDomId, canvasSize.height, canvasSize.width]);

  const playerSessionId = playerSession?._id || playerSession?.id;

  const handleLoseExit = () => handleCheckpointLoseExit(loseState, navigate, playerSessionId);

  const handleLosePrimaryAction = () =>
    handleCheckpointLosePrimaryAction(loseState, navigate, () => {
      void initializeGame(true, true);
    }, playerSessionId);

  const handleBackExit = () => {
    setBusy(true);
    const summary = registerLifeLoss();
    if (summary.needsLifePurchase) {
      handleCheckpointLoseExit({ needsLifePurchase: true }, navigate, playerSessionId);
      return;
    }
    navigate('/game');
  };

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `tower-win-${Date.now()}`;

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
          rewardCoins: earnedCoins,
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
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Tower builder
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Stack {TARGET_FLOORS} floors with the original crane-drop tower game before time runs out.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-2xl p-3">
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card className="rounded-2xl p-3" >
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
              Floors
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {floors}/{TARGET_FLOORS}
            </p>
          </Card>
        </div>

        <div
          className="rounded-3xl  flex flex-col items-center"
        >
          <canvas
            key={canvasDomId}
            id={canvasDomId}
            className="rounded-2xl"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              maxWidth: '100%',
              display: 'block',
              backgroundColor: '#E5E7EB',
            }}
          />
        </div>

        <Card className="rounded-2xl p-4">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Tap the game area to release the hanging block. Build {TARGET_FLOORS} successful floors to clear checkpoint 1.
          </p>
        </Card>

        <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
          Back
        </Button>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title="Tower completed!"
            message="You cleared the tower game!"
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
              Tower failed
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
