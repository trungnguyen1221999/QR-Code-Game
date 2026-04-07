import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import toast from 'react-hot-toast';
import { Clock, Puzzle } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import CheckpointWinReward from '../components/ui/CheckpointWinReward';
import { playerAPI } from '../utils/api';
import {
  clearUnusedExtraLife,
  getInitialGameTime,
  getReplayGameTime,
  getPlayerProgress,
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

const GRID_SIZE = 3;
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;
const COINS_PER_SECOND = 2;
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
  const { t } = useLanguage();
  const { timeLimit: PUZZLE_TIME_LIMIT } = getMiniGameConfig('puzzle', getSessionDifficulty());
  useBlockBack();
  const navigate = useNavigate();
  const location = useLocation();

  const checkpoint = location.state?.checkpoint ?? 5;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

  const slotRefs = useRef([]);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);

  const [selectedImage, setSelectedImage] = useState(() => pickRandomImage());
  const [placedPieces, setPlacedPieces] = useState(Array(TOTAL_PIECES).fill(null));
  const [trayPieces, setTrayPieces] = useState(() => shuffleArray(createPieces()));
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [shakeSlotIndex, setShakeSlotIndex] = useState(null);

  const [timeLeft, setTimeLeft] = useState(() =>
    getInitialGameTime(PUZZLE_TIME_LIMIT, 'puzzle', location.key)
  );
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);

  const earnedCoins = Math.max(0, timeLeft * COINS_PER_SECOND);

  const completedCount = useMemo(
    () => placedPieces.filter(Boolean).length,
    [placedPieces]
  );

  const selectedPiece = trayPieces.find((piece) => piece.id === selectedPieceId) || null;

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
  }, [showBackConfirm, showWin, showLose, timeLeft, hasStarted]);

  useEffect(() => {
    const isComplete = placedPieces.every(
      (piece, index) => piece && piece.correctIndex === index
    );

    if (hasStarted && isComplete) {
      outcomeLockedRef.current = true;
      setShowWin(true);
    }
  }, [placedPieces, hasStarted]);

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
      toast.error(t.puzzlePlacementWrongSpot);
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
    if (!hasStarted || busy || showWin || showLose) return;
    if (!selectedPiece) return;
    placePieceIntoSlot(selectedPiece, slotIndex);
  };

  const startPointerDrag = (event, piece) => {
    if (!hasStarted || busy || showWin || showLose) return;

    setSelectedPieceId(piece.id);
    setDragState({
      pieceId: piece.id,
      piece,
      x: event.clientX,
      y: event.clientY,
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
    outcomeLockedRef.current = false;
    setHasStarted(false);
    setSelectedImage(pickRandomImage());
    setPlacedPieces(Array(TOTAL_PIECES).fill(null));
    setTrayPieces(shuffleArray(createPieces()));
    setSelectedPieceId(null);
    setDragState(null);
    setShakeSlotIndex(null);
    setTimeLeft(getReplayGameTime(PUZZLE_TIME_LIMIT));
    setShowWin(false);
    setShowLose(false);
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
    lossHandledRef.current = false;
  };

  const registerLifeLoss = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
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

  const currentLives = getPlayerProgress().life ?? 0;
  const backWillResetToStart = currentLives <= 1;

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const playerSessionId = playerSession?._id || playerSession?.id;

  const handleLosePrimaryAction = () =>
    handleCheckpointLosePrimaryAction(loseState, navigate, handleRetry, playerSessionId);

  const handleLoseExit = () => handleCheckpointLoseExit(loseState, navigate, playerSessionId);

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `puzzle-placement-win-${Date.now()}`;

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

      <div className="pt-4 pb-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            {translate(t.checkpointLabel, { checkpoint })}
          </p>
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Puzzle size={18} />
            {t.puzzlePlacementTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted ? t.puzzlePlacementRunningInstruction : t.puzzlePlacementReadyInstruction}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Card>
            <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={12} />
              {t.timeLeft}
            </p>
            <p className="text-base font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-[11px] font-semibold" style={{ color: '#C2410C' }}>
              {t.puzzlePlacementPlaced}
            </p>
            <p className="text-base font-bold mt-1" style={{ color: '#9A3412' }}>
              {completedCount}/{TOTAL_PIECES}
            </p>
          </Card>

        
        </div>

       

          <div
            className="grid grid-cols-3 gap-[2px] relative rounded-2xl p-1 overflow-hidden"
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
                className="aspect-square rounded-md flex items-center justify-center relative z-10 transition-transform"
                style={{
                  border: piece ? '1.5px solid #22C55E' : '1.5px dashed rgba(156,163,175,0.95)',
                  backgroundColor: piece ? '#FFFFFF' : 'rgba(255,255,255,0.18)',
                  boxShadow: !piece && selectedPiece ? '0 0 0 2px rgba(34,197,94,0.12)' : 'none',
                  animation: shakeSlotIndex === slotIndex ? 'puzzle-shake 0.3s ease' : 'none',
                }}
              >
                {piece ? (
                  <div
                    className="w-full h-full rounded-[4px]"
                    style={getPieceStyle(piece.correctIndex, selectedImage)}
                  />
                ) : null}
              </div>
            ))}
          </div>

        <Card>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {t.puzzlePlacementPiecesTitle}
          </p>

          <div
            className="grid grid-cols-5 gap-1 items-center"
            style={{ minHeight: 92 }}
          >
            {trayPieces.map((piece) => {
              const isSelected = selectedPieceId === piece.id;
              const isDragging = dragState?.pieceId === piece.id;

              return (
                <button
                  key={piece.id}
                  type="button"
                  onPointerDown={(event) => startPointerDrag(event, piece)}
                  onPointerMove={movePointerDrag}
                  onPointerUp={endPointerDrag}
                  onPointerCancel={() => setDragState(null)}
                  onClick={() => {
                    if (!hasStarted || busy || showWin || showLose) return;
                    setSelectedPieceId((current) => (current === piece.id ? null : piece.id));
                  }}
                  className="touch-none select-none"
                  style={{
                    ...getPieceStyle(piece.correctIndex, selectedImage),
                    width: isSelected ? 56 : 46,
                    height: isSelected ? 56 : 46,
                    justifySelf: 'center',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #22C55E' : '1.5px solid #C07020',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(34,197,94,0.15)' : 'none',
                    opacity: isDragging ? 0.25 : 1,
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="red"
            onClick={() => setShowBackConfirm(true)}
            disabled={busy || showWin || showLose}
          >
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

      {dragState && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: dragState.x - 34,
            top: dragState.y - 34,
            width: 68,
            height: 68,
            borderRadius: '10px',
            border: '2px solid #22C55E',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            transform: 'scale(1.06)',
            ...getPieceStyle(dragState.piece.correctIndex, selectedImage),
          }}
        />
      )}

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title={t.puzzlePlacementWinTitle}
            message={translate(t.puzzlePlacementWinMessage, { coins: earnedCoins })}
          />

          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} checkpoint={checkpoint} />

          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            {t.continue}
          </Button>
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
    </PageLayout>
  );
}