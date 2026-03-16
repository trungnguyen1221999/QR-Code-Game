import { useEffect, useMemo, useRef, useState } from 'react';
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
const SNAP_DISTANCE = 90;

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

function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function PuzzlePlacementGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 4;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const boardRef = useRef(null);
  const slotRefs = useRef([]);

  const [selectedImage, setSelectedImage] = useState(() => pickRandomImage());
  const [placedPieces, setPlacedPieces] = useState(Array(TOTAL_PIECES).fill(null));
  const [trayPieces, setTrayPieces] = useState(() => shuffleArray(createPieces()));
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [shakeSlotIndex, setShakeSlotIndex] = useState(null);

  const [timeLeft, setTimeLeft] = useState(PUZZLE_TIME_LIMIT);
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);

  const completedCount = useMemo(
    () => placedPieces.filter(Boolean).length,
    [placedPieces]
  );

  const selectedPiece = trayPieces.find((piece) => piece.id === selectedPieceId) || null;

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
    const isComplete = placedPieces.every(
      (piece, index) => piece && piece.correctIndex === index
    );

    if (isComplete) {
      setShowWin(true);
    }
  }, [placedPieces]);

  useEffect(() => {
    if (shakeSlotIndex === null) return;
    const timeout = setTimeout(() => setShakeSlotIndex(null), 300);
    return () => clearTimeout(timeout);
  }, [shakeSlotIndex]);

  const findNearestEmptySlot = (point) => {
    const candidates = placedPieces
      .map((piece, index) => ({ piece, index }))
      .filter((entry) => !entry.piece)
      .map((entry) => {
        const el = slotRefs.current[entry.index];
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        return {
          index: entry.index,
          distance: getDistance(point, center),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);

    if (!candidates.length) return null;
    if (candidates[0].distance > SNAP_DISTANCE) return null;

    return candidates[0].index;
  };

  const placePieceIntoSlot = (piece, slotIndex) => {
    if (!piece) return false;
    if (placedPieces[slotIndex]) return false;

    if (piece.correctIndex !== slotIndex) {
      setShakeSlotIndex(slotIndex);
      toast.error('That piece does not fit there');
      return false;
    }

    setPlacedPieces((current) => {
      const next = [...current];
      next[slotIndex] = piece;
      return next;
    });

    setTrayPieces((current) => current.filter((entry) => entry.id !== piece.id));
    setSelectedPieceId(null);
    return true;
  };

  const handleSlotClick = (slotIndex) => {
    if (busy || showWin || showLose) return;
    if (!selectedPiece) return;
    placePieceIntoSlot(selectedPiece, slotIndex);
  };

  const startPointerDrag = (event, piece) => {
    if (busy || showWin || showLose) return;

    const startX = event.clientX;
    const startY = event.clientY;

    setSelectedPieceId(piece.id);
    setDragState({
      pieceId: piece.id,
      piece,
      x: startX,
      y: startY,
      offsetX: 0,
      offsetY: 0,
      width: 96,
      height: 96,
    });

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const movePointerDrag = (event) => {
    if (!dragState) return;

    setDragState((current) => {
      if (!current) return current;
      return {
        ...current,
        x: event.clientX,
        y: event.clientY,
      };
    });
  };

  const endPointerDrag = (event) => {
    if (!dragState) return;

    const dropPoint = { x: event.clientX, y: event.clientY };
    const nearestSlot = findNearestEmptySlot(dropPoint);

    if (nearestSlot !== null) {
      placePieceIntoSlot(dragState.piece, nearestSlot);
    }

    setDragState(null);
  };

  const handleRetry = () => {
    setSelectedImage(pickRandomImage());
    setPlacedPieces(Array(TOTAL_PIECES).fill(null));
    setTrayPieces(shuffleArray(createPieces()));
    setSelectedPieceId(null);
    setDragState(null);
    setShakeSlotIndex(null);
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
      <style>{`
        @keyframes puzzle-shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
      `}</style>

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
            Drag the shuffled pieces into the correct slots. On mobile, pieces snap to the nearest slot.
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
              {selectedPiece ? 'Ready' : 'None'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-3xl p-4"
            style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Placement Area
            </p>

            <div
              ref={boardRef}
              className="grid grid-cols-3 gap-2 relative rounded-2xl p-2 overflow-hidden"
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.58)',
                  pointerEvents: 'none',
                }}
              />

              {placedPieces.map((piece, slotIndex) => (
                <div
                  key={`slot-${slotIndex}`}
                  ref={(el) => {
                    slotRefs.current[slotIndex] = el;
                  }}
                  onClick={() => handleSlotClick(slotIndex)}
                  className="aspect-square rounded-2xl flex items-center justify-center relative z-10 transition-transform"
                  style={{
                    border: piece ? '2px solid #22C55E' : '2px dashed rgba(156,163,175,0.95)',
                    backgroundColor: piece ? '#FFFFFF' : 'rgba(255,255,255,0.18)',
                    boxShadow: !piece && selectedPiece ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                    animation: shakeSlotIndex === slotIndex ? 'puzzle-shake 0.3s ease' : 'none',
                  }}
                >
                  {piece ? (
                    <div
                      className="w-full h-full rounded-xl"
                      style={getPieceStyle(piece.correctIndex, selectedImage)}
                    />
                  ) : (
                    <span className="text-[10px] font-semibold" style={{ color: 'rgba(75,85,99,0.65)' }}>
                      Drop here
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
              Puzzle Pieces
            </p>

            <div className="grid grid-cols-3 gap-2">
              {trayPieces.map((piece) => {
                const isSelected = selectedPieceId === piece.id;

                return (
                  <button
                    key={piece.id}
                    type="button"
                    onPointerDown={(event) => startPointerDrag(event, piece)}
                    onPointerMove={movePointerDrag}
                    onPointerUp={endPointerDrag}
                    onPointerCancel={() => setDragState(null)}
                    onClick={() =>
                      setSelectedPieceId((current) => (current === piece.id ? null : piece.id))
                    }
                    className="aspect-square rounded-2xl touch-none select-none"
                    style={{
                      ...getPieceStyle(piece.correctIndex, selectedImage),
                      border: isSelected ? '3px solid #22C55E' : '2px solid #C07020',
                      transform: isSelected ? 'scale(1.03)' : 'none',
                      boxShadow: isSelected ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none',
                      opacity: dragState?.pieceId === piece.id ? 0.35 : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Drag each piece from the tray toward the board. It will snap to the nearest empty slot.
            The faded image helps you see the correct place. You can also tap a piece and then tap a slot.
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

      {dragState && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: dragState.x - 48,
            top: dragState.y - 48,
            width: 96,
            height: 96,
            borderRadius: '16px',
            border: '3px solid #22C55E',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            transform: 'scale(1.06)',
            ...getPieceStyle(dragState.piece.correctIndex, selectedImage),
          }}
        />
      )}

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