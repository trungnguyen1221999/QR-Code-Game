import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, RotateCcw, Trophy, Puzzle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';

const PUZZLE_TIME_LIMIT = 90;
const PUZZLE_REWARD = 100;
const GRID_SIZE = 3;

const PUZZLE_IMAGES = [
  '/puzzle/puzzle1.png',
  '/puzzle/puzzle2.png',
  '/puzzle/puzzle3.png',
  '/puzzle/puzzle4.png',
  '/puzzle/puzzle5.png',
];

const SOLVED_TILES = ['0', '1', '2', '3', '4', '5', '6', '7', 'blank'];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function countInversions(arr) {
  const nums = arr.filter((item) => item !== 'blank').map(Number);
  let inversions = 0;

  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      if (nums[i] > nums[j]) inversions += 1;
    }
  }

  return inversions;
}

function isSolvable(arr) {
  return countInversions(arr) % 2 === 0;
}

function generateShuffledPuzzle() {
  let shuffled = shuffleArray(SOLVED_TILES);

  while (
    !isSolvable(shuffled) ||
    shuffled.every((tile, index) => tile === SOLVED_TILES[index])
  ) {
    shuffled = shuffleArray(SOLVED_TILES);
  }

  return shuffled;
}

function areAdjacent(indexA, indexB) {
  const rowA = Math.floor(indexA / GRID_SIZE);
  const colA = indexA % GRID_SIZE;
  const rowB = Math.floor(indexB / GRID_SIZE);
  const colB = indexB % GRID_SIZE;

  return (
    (rowA === rowB && Math.abs(colA - colB) === 1) ||
    (colA === colB && Math.abs(rowA - rowB) === 1)
  );
}

function pickRandomImage() {
  return PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];
}

function getTileBackgroundStyle(tile, imageUrl) {
  if (tile === 'blank') {
    return {
      backgroundColor: '#F3F4F6',
      border: '2px dashed #D1D5DB',
    };
  }

  const tileIndex = Number(tile);
  const row = Math.floor(tileIndex / GRID_SIZE);
  const col = tileIndex % GRID_SIZE;

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
    backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${(row / (GRID_SIZE - 1)) * 100}%`,
    backgroundRepeat: 'no-repeat',
    border: '2px solid #C07020',
    backgroundColor: '#FFFFFF',
  };
}

export default function PuzzleGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 4;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [selectedImage, setSelectedImage] = useState(() => pickRandomImage());
  const [tiles, setTiles] = useState(() => generateShuffledPuzzle());
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT);
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);

  const blankIndex = useMemo(() => tiles.indexOf('blank'), [tiles]);

  useEffect(() => {
    if (showWin || showLose) return;

    if (timeLeft <= 0) {
      setShowLose(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showWin, showLose, timeLeft]);

  useEffect(() => {
    const solved = tiles.every((tile, index) => tile === SOLVED_TILES[index]);
    if (solved) {
      setShowWin(true);
    }
  }, [tiles]);

  const handleTileClick = (index) => {
    if (busy || showWin || showLose) return;
    if (!areAdjacent(index, blankIndex)) return;

    const nextTiles = [...tiles];
    [nextTiles[index], nextTiles[blankIndex]] = [nextTiles[blankIndex], nextTiles[index]];
    setTiles(nextTiles);
    setMoves((value) => value + 1);
  };

  const handleRetry = () => {
    setSelectedImage(pickRandomImage());
    setTiles(generateShuffledPuzzle());
    setMoves(0);
    setTimeLeft(PUZZLE_TIME_LIMIT);
    setShowWin(false);
    setShowLose(false);
  };

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `puzzle-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId && sessionId) {
        const sessionData = await sessionAPI.getById(sessionId);
        const checkpoints = Array.isArray(sessionData?.checkpointIds)
          ? sessionData.checkpointIds
          : [];

        const matchedCheckpoint = checkpoints.find(
          (entry) => entry.level === checkpoint
        );

        if (matchedCheckpoint?._id) {
          await playerAPI.checkpoint(playerSessionId, {
            checkpointId: matchedCheckpoint._id,
            scoreEarned: PUZZLE_REWARD,
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', {
        state: {
          justCompleted: true,
          completedCheckpoint: checkpoint,
          nextCheckpoint: checkpoint + 1,
          rewardCoins: PUZZLE_REWARD,
          resultId,
        },
      });
    }
  };

  const handleLoseContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `puzzle-timeout-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId) {
        await playerAPI.loseLife(playerSessionId);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', {
        state: {
          wrongAnswer: true,
          resultId,
        },
      });
    }
  };

  return (
    <PageLayout>
      <div className="pt-5 pb-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpoint}
          </p>
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Puzzle size={20} />
            Slide Puzzle
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Rearrange the image by moving tiles into the empty space before time runs out.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3" style={{ backgroundColor: '#EFF6FF' }}>
            <p
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: '#2563EB' }}
            >
              <Clock size={14} />
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#FEF3E2' }}>
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
              Moves
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {moves}
            </p>
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((tile, index) => {
              const movable = areAdjacent(index, blankIndex) && tile !== 'blank';

              return (
                <button
                  key={`${tile}-${index}`}
                  type="button"
                  onClick={() => handleTileClick(index)}
                  disabled={busy || tile === 'blank'}
                  className="aspect-square rounded-2xl transition-transform"
                  style={{
                    ...getTileBackgroundStyle(tile, selectedImage),
                    boxShadow: movable ? '0 0 0 3px rgba(34,197,94,0.18)' : 'none',
                    transform: movable ? 'scale(1.01)' : 'none',
                  }}
                >
                  {tile === 'blank' ? (
                    <span className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
                      Empty
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}
          >
            Tap a tile next to the empty space to move it. Complete the full picture before time ends.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => navigate('/game')}>
            Back
          </Button>
          <Button variant="green" onClick={handleRetry}>
            <RotateCcw size={16} /> Restart
          </Button>
        </div>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <Trophy size={28} style={{ color: '#16A34A' }} />
          </div>

          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Puzzle solved!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              Great job. Your checkpoint will move forward.
            </p>
          </div>

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
              Time is up
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              You did not finish the puzzle in time. One life will be removed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="red" onClick={handleRetry} disabled={busy}>
              Retry
            </Button>
            <Button variant="green" onClick={handleLoseContinue} disabled={busy}>
              Continue
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}