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
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../translations';

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

function getLanePattern(difficulty) {
  if (difficulty === 'easy') {
    return ['goal', 'road', 'safe', 'road', 'safe', 'road', 'start'];
  }

  return ['goal', 'road', 'road', 'safe', 'road', 'safe', 'road', 'start'];
}

function getBandType(row, rows, lanePattern) {
  return lanePattern[row] ?? (row === rows - 1 ? 'start' : 'safe');
}

function buildLanes(rows, cols, lanePattern) {
  return Array.from({ length: rows }, (_, row) => {
    const bandType = getBandType(row, rows, lanePattern);
    if (bandType !== 'road') {
      return { row, bandType, direction: 0, cars: [] };
    }

    const roadRowsBefore = Array.from({ length: row }, (_, index) => getBandType(index, rows, lanePattern))
        .filter((bandType) => bandType === 'road').length;
    const roadIndex = Math.max(0, roadRowsBefore);
    const direction = roadIndex % 2 === 0 ? 1 : -1;
    const spacing = 2 + (roadIndex % 2);
    const carCount = Math.max(2, Math.floor(cols / spacing) - 1);
    const offset = (roadIndex * 2) % cols;

    return {
      row,
      bandType,
      direction,
      cars: Array.from({ length: carCount }, (_, carIndex) =>
        (offset + (carIndex * spacing)) % cols
      ),
    };
  }).filter(Boolean);
}

function shiftColumn(col, direction, cols) {
  return (col + direction + cols) % cols;
}

function hasCollision(player, lanes) {
  const lane = lanes.find((entry) => entry.row === player.row);
  return lane?.bandType === 'road' ? lane.cars.includes(player.col) : false;
}

export default function CrossRoadGame() {
  const { t } = useLanguage();
  const difficulty = getSessionDifficulty();
  const { timeLimit, cols, moveInterval } = getMiniGameConfig('crossRoad', difficulty);
  const lanePattern = getLanePattern(difficulty);
  const rows = lanePattern.length;

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
  const [lanes, setLanes] = useState(() => buildLanes(rows, cols, lanePattern));
  const [steps, setSteps] = useState(0);
  const [statusText, setStatusText] = useState(t.crossRoadRunnerIntroStatus);
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [flash, setFlash] = useState(null);
  const playerRef = useRef(initialPlayer);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm) return;

    if (timeLeft <= 0) {
      void handleLoss(t.crossRoadRunnerTimeUpStatus);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showBackConfirm, showLose, showWin, timeLeft, hasStarted, t.crossRoadRunnerTimeUpStatus]);

  useEffect(() => {
    if (!hasStarted || showWin || showLose || showBackConfirm || busy) return undefined;

    const interval = setInterval(() => {
      setLanes((currentLanes) => {
        const nextLanes = currentLanes.map((lane) => ({
          ...lane,
          cars: lane.bandType === 'road'
            ? lane.cars.map((car) => shiftColumn(car, lane.direction, cols))
            : lane.cars,
        }));

        if (hasCollision(playerRef.current, nextLanes)) {
          void handleLoss(t.crossRoadRunnerHitStatus);
        }

        return nextLanes;
      });
    }, moveInterval);

    return () => clearInterval(interval);
  }, [busy, cols, moveInterval, showBackConfirm, showLose, showWin, hasStarted, t.crossRoadRunnerHitStatus]);

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
    setStatusText(message);
    setFlash('bad');
    window.setTimeout(() => setFlash(null), 240);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleMove = (direction) => {
    if (!hasStarted || busy || showWin || showLose || showBackConfirm) return;

    const offset = DIRECTIONS[direction];
    const nextPlayer = {
      row: Math.max(0, Math.min(rows - 1, player.row + offset.row)),
      col: Math.max(0, Math.min(cols - 1, player.col + offset.col)),
    };

    if (nextPlayer.row === player.row && nextPlayer.col === player.col) return;

    setPlayer(nextPlayer);
    setSteps((value) => value + 1);

    if (nextPlayer.row === 0) {
      setStatusText(t.crossRoadRunnerGoalReachedStatus);
      setFlash('good');
      window.setTimeout(() => setFlash(null), 240);
      outcomeLockedRef.current = true;
      setShowWin(true);
      return;
    }

    if (hasCollision(nextPlayer, lanes)) {
      void handleLoss(t.crossRoadRunnerHitStatus);
      return;
    }

    const bandType = getBandType(nextPlayer.row, rows, lanePattern);
    setStatusText(
      bandType === 'safe'
        ? t.crossRoadRunnerSafeStatus
        : t.crossRoadRunnerTrafficStatus
    );
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    const resetPlayer = getInitialPlayer(rows, cols);
    setTimeLeft(getReplayGameTime(timeLimit));
    setPlayer(resetPlayer);
    playerRef.current = resetPlayer;
    setLanes(buildLanes(rows, cols, lanePattern));
    setSteps(0);
    setStatusText(t.crossRoadRunnerIntroStatus);
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
            {translate(t.checkpointLabel, { checkpoint })}
          </p>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Goal size={20} />
            {t.crossRoadRunnerTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted ? t.crossRoadRunnerRunningInstruction : t.crossRoadRunnerReadyInstruction}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              {t.crossRoadRunnerTime}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#047857' }}>
              {t.crossRoadRunnerGoal}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#047857' }}>
              {player.row === 0 ? t.crossRoadRunnerGoalReached : t.crossRoadRunnerGoalTopRow}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#9333EA' }}>
              {t.crossRoadRunnerSteps}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#7E22CE' }}>
              {steps}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {hasStarted ? statusText : t.crossRoadRunnerReadyStatus}
          </p>
        </Card>

        <div
          className="grid gap-1 rounded-[30px] border p-3"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            background: flash === 'bad'
              ? 'linear-gradient(180deg, #FEE2E2 0%, #FED7AA 100%)'
              : flash === 'good'
                ? 'linear-gradient(180deg, #DCFCE7 0%, #BBF7D0 100%)'
                : 'linear-gradient(180deg, #E0F2FE 0%, #DCFCE7 100%)',
            borderColor: '#86EFAC',
            boxShadow: '0 18px 30px rgba(21,128,61,0.14)',
          }}
        >
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const lane = lanes.find((entry) => entry.row === row);
              const bandType = lane?.bandType ?? getBandType(row, rows, lanePattern);
              const isRoad = bandType === 'road';
              const hasCar = lane?.cars.includes(col);
              const isPlayer = player.row === row && player.col === col;

              return (
                <div
                  key={`${row}-${col}`}
                  className="relative flex aspect-square items-center justify-center rounded-xl"
                  style={{
                    background: bandType === 'road'
                      ? 'linear-gradient(180deg, #94A3B8 0%, #64748B 100%)'
                      : bandType === 'goal'
                        ? 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)'
                        : bandType === 'start'
                          ? 'linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)'
                          : 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)',
                  }}
                >
                  {!isRoad && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-40"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 20% 25%, rgba(255,255,255,0.18) 0 10%, transparent 11%), radial-gradient(circle at 75% 70%, rgba(22,163,74,0.22) 0 9%, transparent 10%)',
                      }}
                    />
                  )}
                  {hasCar && (
                    <div
                      className="flex h-[72%] w-[86%] items-center justify-center rounded-lg text-[10px] font-black"
                      style={{
                        background: 'linear-gradient(160deg, #EF4444 0%, #B91C1C 100%)',
                        color: 'white',
                        boxShadow: '0 8px 14px rgba(127,29,29,0.26)',
                      }}
                    >
                      {t.crossRoadRunnerCarLabel}
                    </div>
                  )}
                  {isPlayer && (
                    <div
                      className="absolute flex h-[70%] w-[70%] items-center justify-center rounded-full text-xs font-black"
                      style={{
                        background: 'linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)',
                        color: 'white',
                        border: '3px solid white',
                        boxShadow: '0 8px 14px rgba(37,99,235,0.24)',
                      }}
                    >
                      {t.crossRoadRunnerPlayerLabel}
                    </div>
                  )}
                  {bandType === 'goal' && !hasCar && !isPlayer && (
                    <span className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#052E16' }}>
                      {t.crossRoadRunnerGoalLabel}
                    </span>
                  )}
                  {bandType === 'safe' && !hasCar && !isPlayer && (
                    <span className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#052E16' }}>
                      {t.crossRoadRunnerSafeLabel}
                    </span>
                  )}
                  {bandType === 'start' && !hasCar && !isPlayer && (
                    <span className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#14532D' }}>
                      {t.crossRoadRunnerStartLabel}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Card>
          <p className="text-sm font-bold text-center mb-3" style={{ color: 'var(--color-text)' }}>
            {t.crossRoadRunnerControlsTitle}
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

        <div className="grid grid-cols-2 gap-2">
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
            title={t.crossRoadRunnerWinTitle}
            message={translate(t.crossRoadRunnerWinMessage, { steps, coins: earnedCoins })}
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
              {t.crossRoadRunnerLoseTitle}
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
