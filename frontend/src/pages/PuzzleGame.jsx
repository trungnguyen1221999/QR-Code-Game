import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, RotateCcw, Trophy, Puzzle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';

const GRID_SIZE = 3;
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;
const PUZZLE_TIME_LIMIT = 120;
const PUZZLE_REWARD = 100;

const PUZZLE_IMAGES = [
  '/puzzle/puzzle1.png',
  '/puzzle/puzzle2.png',
  '/puzzle/puzzle3.png',
  '/puzzle/puzzle4.png',
  '/puzzle/puzzle5.png',
];

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

function pickRandomImage() {
  return PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];
}

function createPieces() {
  return Array.from({ length: TOTAL_PIECES }, (_, index) => ({
    id: `piece-${index}`,
    correctIndex: index,
  }));
}

function getPieceStyle(pieceIndex, imageUrl) {
  const row = Math.floor(pieceIndex / GRID_SIZE);
  const col = pieceIndex % GRID_SIZE;

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
    backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${(row / (GRID_SIZE - 1)) * 100}%`,
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#fff',
  };
}

export default function PuzzlePlacementGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 4;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [selectedImage, setSelectedImage] = useState(() => pickRandomImage());
  const [placedPieces, setPlacedPieces] = useState(Array(TOTAL_PIECES).fill(null));
  const [trayPieces, setTrayPieces] = useState(() => shuffleArray(createPieces()));
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT);
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);

  const completedCount = useMemo(
    () => placedPieces.filter(Boolean).length,
    [placedPieces]
  );

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
    if (placedPieces.every((piece, index) => piece && piece.correctIndex === index)) {
      setShowWin(true);
    }
  }, [placedPieces]);

  const selectedPiece = trayPieces.find((piece) => piece.id === selectedPieceId) || null;

  const handleDragStart = (pieceId) => {
    if (busy || showWin || showLose) return;
    setSelectedPieceId(pieceId);
  };

  const handleDropOnSlot = (slotIndex) => {
    if (busy || showWin || showLose) return;
    if (placedPieces[slotIndex]) return;
    if (!selectedPiece) return;

    if (selectedPiece.correctIndex !== slotIndex) {
      toast.error('Wrong position');
      return;
    }

    setPlacedPieces((current) => {
      const next = [...current];
      next[slotIndex] = selectedPiece;
      return next;
    });

    setTrayPieces((current) => current.filter((piece) => piece.id !== selectedPiece.id));
    setSelectedPieceId(null);
  };

  const handleSlotClick = (slotIndex) => {
    if (!selectedPiece) return;
    handleDropOnSlot(slotIndex);
  };

  const handleTrayPieceClick = (pieceId) => {
    if (busy || showWin || showLose) return;

    setSelectedPieceId((current) => (current === pieceId ? null : pieceId));
  };

  const handleRetry = () => {
    setSelectedImage(pickRandomImage());
    setPlacedPieces(Array(TOTAL_PIECES).fill(null));
    setTrayPieces(shuffleArray(createPieces()));
    setSelectedPieceId(null);
    setTimeLeft(PUZZLE_TIME_LIMIT);
    setShowWin(false);
    setShowLose(false);
  };

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `puzzle-placement-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId && sessionId) {
        const sessionData = await sessionAPI.getById(sessionId);
        const checkpoints = Array.isArray(sessionData?.checkpointIds)
          ? sessionData.checkpointIds
          : [];

        const matchedCheckpoint = checkpoints.find((entry) => entry.level === checkpoint);

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
    const resultId = `puzzle-placement-timeout-${Date.now()}`;

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
            Piece Placement Puzzle
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Drag each piece into the correct slot. You can also tap a piece, then tap its target slot.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3" style={{ backgroundColor: '#EFF6FF' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              Time left
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#FEF3E2' }}>
            <p className="text-xs font-semibold" style={{ color: '#C2410C' }}>
              Placed
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {completedCount}/{TOTAL_PIECES}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#DCFCE7' }}>
            <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
              Selected
            </p>
            <p className="text-sm font-bold mt-1" style={{ color: '#166534' }}>
              {selectedPiece ? '1 piece ready' : 'None'}
            </p>
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Board
          </p>

          <div className="grid grid-cols-3 gap-2">
            {placedPieces.map((piece, slotIndex) => (
              <div
                key={`slot-${slotIndex}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnSlot(slotIndex)}
                onClick={() => handleSlotClick(slotIndex)}
                className="aspect-square rounded-2xl flex items-center justify-center"
                style={{
                  border: piece ? '2px solid #22C55E' : '2px dashed #D1D5DB',
                  backgroundColor: piece ? '#FFFFFF' : '#F9FAFB',
                  boxShadow: !piece && selectedPiece ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                }}
              >
                {piece ? (
                  <div
                    className="w-full h-full rounded-xl"
                    style={getPieceStyle(piece.correctIndex, selectedImage)}
                  />
                ) : (
                  <span className="text-[10px] font-semibold" style={{ color: '#9CA3AF' }}>
                    Slot {slotIndex + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Pieces
          </p>

          <div className="grid grid-cols-3 gap-2">
            {trayPieces.map((piece) => {
              const isSelected = selectedPieceId === piece.id;

              return (
                <button
                  key={piece.id}
                  type="button"
                  draggable
                  onDragStart={() => handleDragStart(piece.id)}
                  onClick={() => handleTrayPieceClick(piece.id)}
                  className="aspect-square rounded-2xl"
                  style={{
                    ...getPieceStyle(piece.correctIndex, selectedImage),
                    border: isSelected ? '3px solid #22C55E' : '2px solid #C07020',
                    transform: isSelected ? 'scale(1.03)' : 'none',
                    boxShadow: isSelected ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Drag a piece to the correct slot. On phones, you can also tap a piece first, then tap the matching slot.
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
              Puzzle completed!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              All pieces are in the correct place.
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