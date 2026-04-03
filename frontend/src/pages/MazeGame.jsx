import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock, Map } from 'lucide-react';
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
  up: { dr: -1, dc: 0, wall: 'top' },
  right: { dr: 0, dc: 1, wall: 'right' },
  down: { dr: 1, dc: 0, wall: 'bottom' },
  left: { dr: 0, dc: -1, wall: 'left' },
};

const OPPOSITE_WALL = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function cellKey(cell) {
  return `${cell.row}-${cell.col}`;
}

function sameCell(a, b) {
  return a.row === b.row && a.col === b.col;
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createMaze(size) {
  const cells = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ({
      row,
      col,
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false,
    }))
  );

  const stack = [cells[0][0]];
  cells[0][0].visited = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    const unvisitedNeighbors = shuffle([
      { row: current.row - 1, col: current.col, wall: 'top' },
      { row: current.row, col: current.col + 1, wall: 'right' },
      { row: current.row + 1, col: current.col, wall: 'bottom' },
      { row: current.row, col: current.col - 1, wall: 'left' },
    ]).filter(({ row, col }) =>
      row >= 0 && row < size && col >= 0 && col < size && !cells[row][col].visited
    );

    if (unvisitedNeighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = unvisitedNeighbors[0];
    const neighbor = cells[next.row][next.col];
    current[next.wall] = false;
    neighbor[OPPOSITE_WALL[next.wall]] = false;
    neighbor.visited = true;
    stack.push(neighbor);
  }

  return cells.map((row) => row.map(({ visited, ...cell }) => cell));
}

function canMove(maze, position, direction) {
  const rule = DIRECTIONS[direction];
  if (!rule) return false;

  const cell = maze[position.row]?.[position.col];
  if (!cell || cell[rule.wall]) return false;

  const nextRow = position.row + rule.dr;
  const nextCol = position.col + rule.dc;

  return nextRow >= 0
    && nextRow < maze.length
    && nextCol >= 0
    && nextCol < maze[0].length;
}

function nextCell(position, direction) {
  const rule = DIRECTIONS[direction];
  return {
    row: position.row + rule.dr,
    col: position.col + rule.dc,
  };
}

function pickEnemyPositions(maze, exit, enemyCount) {
  const size = maze.length;
  const candidates = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const candidate = { row, col };
      const distanceFromStart = row + col;
      const distanceFromExit = Math.abs(exit.row - row) + Math.abs(exit.col - col);

      if ((row === 0 && col === 0) || sameCell(candidate, exit)) continue;
      if (distanceFromStart < 3 || distanceFromExit < 2) continue;

      candidates.push(candidate);
    }
  }

  return shuffle(candidates).slice(0, enemyCount);
}

function moveEnemyRandomly(maze, enemy) {
  const options = shuffle(Object.keys(DIRECTIONS)).filter((direction) => canMove(maze, enemy, direction));
  if (options.length === 0) return enemy;
  return nextCell(enemy, options[0]);
}

function getMazeStatus(difficulty, enemyCount) {
  if (difficulty === 'easy') {
    return 'No enemies in easy mode. Find the exit before the timer ends.';
  }

  return `Watch out for ${enemyCount} wandering ${enemyCount === 1 ? 'enemy' : 'enemies'} while you hunt for the exit.`;
}

export default function MazeGame() {
  const difficulty = getSessionDifficulty();
  const { timeLimit, size, enemies, enemySpeed } = getMiniGameConfig('maze', difficulty);

  useBlockBack();

  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 11;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const playerSessionId = playerSession?._id || playerSession?.id;
  const lossHandledRef = useRef(false);
  const hitReasonRef = useRef('Time is up');

  const buildState = () => {
    const nextMaze = createMaze(size);
    const exit = { row: size - 1, col: size - 1 };
    return {
      maze: nextMaze,
      player: { row: 0, col: 0 },
      exit,
      enemiesState: pickEnemyPositions(nextMaze, exit, enemies),
    };
  };

  const initialState = buildState();

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(timeLimit, 'maze', location.key)
  );
  const [maze, setMaze] = useState(initialState.maze);
  const [player, setPlayer] = useState(initialState.player);
  const [exit, setExit] = useState(initialState.exit);
  const [enemyPositions, setEnemyPositions] = useState(initialState.enemiesState);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const [statusText, setStatusText] = useState(() => getMazeStatus(difficulty, enemies));
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm) return;

    if (timeLeft <= 0) {
      hitReasonRef.current = 'Time is up';
      void handleLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showBackConfirm, showLose, showWin, timeLeft]);

  useEffect(() => {
    if (showWin || showLose || showBackConfirm || enemies === 0) return undefined;

    const interval = setInterval(() => {
      setEnemyPositions((currentEnemies) => {
        const movedEnemies = currentEnemies.map((enemy, index) => {
          let moved = moveEnemyRandomly(maze, enemy);

          const duplicate = currentEnemies.some(
            (otherEnemy, otherIndex) => otherIndex !== index && sameCell(otherEnemy, moved)
          );

          if (duplicate || sameCell(moved, exit)) {
            moved = enemy;
          }

          return moved;
        });

        if (movedEnemies.some((enemy) => sameCell(enemy, player))) {
          hitReasonRef.current = 'A maze enemy caught you';
          void handleLoss();
        }

        return movedEnemies;
      });
    }, enemySpeed);

    return () => clearInterval(interval);
  }, [enemies, enemySpeed, exit, maze, player, showBackConfirm, showLose, showWin]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showWin || showLose || showBackConfirm) return;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleMove('up');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleMove('right');
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleMove('down');
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleMove('left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, enemyPositions, showBackConfirm, showLose, showWin]);

  const registerLifeLoss = async () => {
    try {
      return await registerCheckpointLifeLoss(playerSessionId);
    } catch (error) {
      toast.error(error.message);
      return INITIAL_LOSE_STATE;
    }
  };

  const handleLoss = async () => {
    if (lossHandledRef.current) return;
    lossHandledRef.current = true;
    setBusy(true);
    setStatusText(hitReasonRef.current);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleMove = (direction) => {
    if (busy || showWin || showLose || showBackConfirm) return;
    if (!canMove(maze, player, direction)) return;

    const nextPlayer = nextCell(player, direction);
    setPlayer(nextPlayer);
    setMoves((value) => value + 1);

    if (sameCell(nextPlayer, exit)) {
      setStatusText('Exit reached!');
      setShowWin(true);
      return;
    }

    if (enemyPositions.some((enemy) => sameCell(enemy, nextPlayer))) {
      hitReasonRef.current = 'A maze enemy caught you';
      void handleLoss();
      return;
    }

    setStatusText(sameCell(nextPlayer, exit) ? 'Exit reached!' : 'Keep moving. The exit is glowing.');
  };

  const handleRetry = () => {
    const nextState = buildState();
    setTimeLeft(getReplayGameTime(timeLimit));
    setMaze(nextState.maze);
    setPlayer(nextState.player);
    setExit(nextState.exit);
    setEnemyPositions(nextState.enemiesState);
    setMoves(0);
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    setStatusText(getMazeStatus(difficulty, enemies));
    hitReasonRef.current = 'Time is up';
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
    const resultId = `maze-win-${Date.now()}`;
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
            <Map size={20} />
            Maze Game
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Move one cell at a time to reach the glowing exit.
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
            <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
              Exit
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#166534' }}>
              {player.row === exit.row && player.col === exit.col ? 'Found' : 'Ahead'}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold" style={{ color: '#9333EA' }}>
              Moves
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#7E22CE' }}>
              {moves}
            </p>
          </Card>
        </div>

        <Card className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {statusText}
          </p>
        </Card>

        <div
          className="grid gap-0 overflow-hidden rounded-[28px] border p-2"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
            borderColor: '#93C5FD',
            boxShadow: '0 18px 30px rgba(59,130,246,0.16)',
          }}
        >
          {maze.flat().map((cell) => {
            const isPlayer = sameCell(cell, player);
            const isExit = sameCell(cell, exit);
            const isEnemy = enemyPositions.some((enemy) => sameCell(enemy, cell));

            return (
              <div
                key={cellKey(cell)}
                className="relative flex aspect-square items-center justify-center"
                style={{
                  backgroundColor: isPlayer
                    ? '#2563EB'
                    : isEnemy
                      ? '#F97316'
                      : isExit
                        ? '#34D399'
                        : 'rgba(255,255,255,0.86)',
                  borderTop: cell.top ? '4px solid #1F2937' : '4px solid transparent',
                  borderRight: cell.right ? '4px solid #1F2937' : '4px solid transparent',
                  borderBottom: cell.bottom ? '4px solid #1F2937' : '4px solid transparent',
                  borderLeft: cell.left ? '4px solid #1F2937' : '4px solid transparent',
                  boxShadow: isExit ? 'inset 0 0 24px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                {isExit && !isPlayer && (
                  <span className="text-[10px] font-black tracking-[0.18em]" style={{ color: '#064E3B' }}>
                    EXIT
                  </span>
                )}
                {isEnemy && (
                  <span className="text-lg" aria-hidden="true">
                    !
                  </span>
                )}
                {isPlayer && (
                  <span className="text-lg font-black" style={{ color: 'white' }}>
                    P
                  </span>
                )}
              </div>
            );
          })}
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
              style={{ backgroundColor: '#2563EB', boxShadow: '0 10px 20px rgba(37,99,235,0.24)' }}
            >
              <ArrowUp className="mx-auto" size={22} />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMove('left')}
                className="h-14 w-14 rounded-2xl text-white"
                style={{ backgroundColor: '#2563EB', boxShadow: '0 10px 20px rgba(37,99,235,0.24)' }}
              >
                <ArrowLeft className="mx-auto" size={22} />
              </button>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xs font-black"
                style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
              >
                GO
              </div>
              <button
                type="button"
                onClick={() => handleMove('right')}
                className="h-14 w-14 rounded-2xl text-white"
                style={{ backgroundColor: '#2563EB', boxShadow: '0 10px 20px rgba(37,99,235,0.24)' }}
              >
                <ArrowRight className="mx-auto" size={22} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleMove('down')}
              className="h-14 w-14 rounded-2xl text-white"
              style={{ backgroundColor: '#2563EB', boxShadow: '0 10px 20px rgba(37,99,235,0.24)' }}
            >
              <ArrowDown className="mx-auto" size={22} />
            </button>
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
            title="Maze escaped!"
            message={`You found the exit in ${moves} moves and earned ${earnedCoins} coins from the time left.`}
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
              Maze run failed
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
