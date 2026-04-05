import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock, Goal } from 'lucide-react';
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

const DIRECTIONS = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getInitialPlayer(rows, cols) {
  return { row: rows - 1, col: Math.floor(cols / 2) };
}

function buildLanes(rows, cols) {
  return Array.from({ length: rows - 2 }, (_, index) => {
    const row = index + 1;
    const direction = index % 2 === 0 ? 1 : -1;
    const spacing = 2 + (index % 2);
    const carCount = Math.max(2, Math.floor(cols / spacing) - 1);
    const offset = (index * 2) % cols;

    return {
      row,
      direction,
      cars: Array.from({ length: carCount }, (_, carIndex) =>
        (offset + (carIndex * spacing)) % cols
      ),
    };
  });
}

function shiftColumn(col, direction, cols) {
  return (col + direction + cols) % cols;
}

function hasCollision(player, lanes) {
  const lane = lanes.find((entry) => entry.row === player.row);
  return lane ? lane.cars.includes(player.col) : false;
}

export default function CrossRoadGame() {
  const { timeLimit, rows, cols, moveInterval } = getMiniGameConfig('crossRoad', getSessionDifficulty());

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 13;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;
  const initialPlayer = getInitialPlayer(rows, cols);

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(timeLimit, 'cross-road', location.key)
  );
  const [player, setPlayer] = useState(initialPlayer);
  const [lanes, setLanes] = useState(() => buildLanes(rows, cols));
  const [steps, setSteps] = useState(0);
  const [statusText, setStatusText] = useState('Cross the road and reach the goal row at the top.');
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [flash, setFlash] = useState(null);
  const playerRef = useRef(initialPlayer);
  const lossHandledRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm) return;

    if (timeLeft <= 0) {
      void handleLoss('Time is up.');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showBackConfirm, showLose, showWin, timeLeft]);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm || busy) return undefined;

    const interval = setInterval(() => {
      setLanes((currentLanes) => {
        const nextLanes = currentLanes.map((lane) => ({
          ...lane,
          cars: lane.cars.map((car) => shiftColumn(car, lane.direction, cols)),
        }));

        if (hasCollision(playerRef.current, nextLanes)) {
          void handleLoss('A car hit you.');
        }

        return nextLanes;
      });
    }, moveInterval);

    return () => clearInterval(interval);
  }, [busy, cols, moveInterval, showBackConfirm, showLose, showWin]);

  const registerLifeLoss = async () => {
    try {
      return await registerCheckpointLifeLoss(playerSessionId);
    } catch (error) {
      toast.error(error.message);
      return INITIAL_LOSE_STATE;
    }
  };

  const handleLoss = async (message) => {
    if (lossHandledRef.current) return;
    lossHandledRef.current = true;
    setBusy(true);
    setStatusText(message);
    setFlash('bad');
    window.setTimeout(() => setFlash(null), 240);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleMove = (direction) => {
    if (busy || showWin || showLose || showBackConfirm) return;

    const offset = DIRECTIONS[direction];
    const nextPlayer = {
      row: Math.max(0, Math.min(rows - 1, player.row + offset.row)),
      col: Math.max(0, Math.min(cols - 1, player.col + offset.col)),
    };

    if (nextPlayer.row === player.row && nextPlayer.col === player.col) return;

    setPlayer(nextPlayer);
    setSteps((value) => value + 1);

    if (nextPlayer.row === 0) {
      setStatusText('You reached the goal!');
      setFlash('good');
      window.setTimeout(() => setFlash(null), 240);
      setShowWin(true);
      return;
    }

    if (hasCollision(nextPlayer, lanes)) {
      void handleLoss('A car hit you.');
      return;
    }

    setStatusText('Keep moving. Watch the traffic lanes.');
  };

  const handleRetry = () => {
    const resetPlayer = getInitialPlayer(rows, cols);
    setTimeLeft(getReplayGameTime(timeLimit));
    setPlayer(resetPlayer);
    playerRef.current = resetPlayer;
    setLanes(buildLanes(rows, cols));
    setSteps(0);
    setStatusText('Cross the road and reach the goal row at the top.');
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setFlash(null);
    lossHandledRef.current = false;
  };

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const handleBackExit = async () => {
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
    const resultId = `cross-road-win-${Date.now()}`;
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
            <Goal size={20} />
            Cross Road
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Dodge the traffic and reach the top row.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
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
            <p className="text-xs font-semibold" style={{ color: '#047857' }}>
              Goal
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#047857' }}>
              Row {player.row}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#9333EA' }}>
              Steps
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#7E22CE' }}>
              {steps}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {statusText}
          </p>
        </Card>

        <div
          className="grid gap-1 rounded-[30px] border p-3"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            background: flash === 'bad'
              ? 'linear-gradient(180deg, #FEE2E2 0%, #FDE68A 100%)'
              : flash === 'good'
                ? 'linear-gradient(180deg, #DCFCE7 0%, #BBF7D0 100%)'
                : 'linear-gradient(180deg, #DCFCE7 0%, #FEF3C7 100%)',
            borderColor: '#A7F3D0',
            boxShadow: '0 18px 30px rgba(21,128,61,0.14)',
          }}
        >
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const lane = lanes.find((entry) => entry.row === row);
              const isRoad = !!lane;
              const hasCar = lane?.cars.includes(col);
              const isPlayer = player.row === row && player.col === col;
              const isGoal = row === 0;

              return (
                <div
                  key={`${row}-${col}`}
                  className="relative flex aspect-square items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: isGoal
                      ? '#22C55E'
                      : isRoad
                        ? '#94A3B8'
                        : '#86EFAC',
                  }}
                >
                  {hasCar && (
                    <div
                      className="flex h-[72%] w-[86%] items-center justify-center rounded-lg text-[10px] font-black"
                      style={{ backgroundColor: '#DC2626', color: 'white' }}
                    >
                      CAR
                    </div>
                  )}
                  {isPlayer && (
                    <div
                      className="absolute flex h-[70%] w-[70%] items-center justify-center rounded-full text-xs font-black"
                      style={{ backgroundColor: '#1D4ED8', color: 'white', border: '3px solid white' }}
                    >
                      U
                    </div>
                  )}
                  {isGoal && !hasCar && !isPlayer && (
                    <span className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#052E16' }}>
                      GO
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Card>
          <p className="text-sm font-bold text-center mb-3" style={{ color: 'var(--color-text)' }}>
            Move controls
          </p>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => handleMove('up')}
              className="h-14 w-14 rounded-2xl text-white"
              style={{ backgroundColor: '#16A34A', boxShadow: '0 10px 20px rgba(22,163,74,0.24)' }}
            >
              <ArrowUp className="mx-auto" size={22} />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMove('left')}
                className="h-14 w-14 rounded-2xl text-white"
                style={{ backgroundColor: '#16A34A', boxShadow: '0 10px 20px rgba(22,163,74,0.24)' }}
              >
                <ArrowLeft className="mx-auto" size={22} />
              </button>
              <button
                type="button"
                onClick={() => handleMove('down')}
                className="h-14 w-14 rounded-2xl text-white"
                style={{ backgroundColor: '#F59E0B', boxShadow: '0 10px 20px rgba(245,158,11,0.24)' }}
              >
                <ArrowDown className="mx-auto" size={22} />
              </button>
              <button
                type="button"
                onClick={() => handleMove('right')}
                className="h-14 w-14 rounded-2xl text-white"
                style={{ backgroundColor: '#16A34A', boxShadow: '0 10px 20px rgba(22,163,74,0.24)' }}
              >
                <ArrowRight className="mx-auto" size={22} />
              </button>
            </div>
          </div>
        </Card>

        <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
          Back
        </Button>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title="Road crossed!"
            message={`You reached the top in ${steps} steps and earned ${earnedCoins} coins from the time left.`}
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
              Cross road failed
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
