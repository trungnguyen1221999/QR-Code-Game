import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { playerAPI, sessionAPI } from '../utils/api';

const MEMORY_TIME_LIMIT = 30;
const CARD_EMOJIS = ['🐼', '🦊', '🐸', '🐵', '🐧', '🐯'];
const PLAYER_PROGRESS_KEY = 'playerGameProgress';
const DEFAULT_LIFE = 3;
const DEFAULT_COINS = 0;

function shuffleCards() {
  return [...CARD_EMOJIS, ...CARD_EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: `${emoji}-${index}`,
      emoji,
      matched: false,
    }));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function applyLossToStoredProgress() {
  const raw = localStorage.getItem(PLAYER_PROGRESS_KEY);
  const progress = raw ? JSON.parse(raw) : { completed: 0, current: 1, life: DEFAULT_LIFE, coins: DEFAULT_COINS };
  const nextLife = (progress.life ?? DEFAULT_LIFE) - 1;

  if (nextLife > 0) {
    const updated = { ...progress, life: nextLife };
    localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(updated));
    return { remainingLives: nextLife, resetToStart: false };
  }

  const reset = { completed: 0, current: 1, life: DEFAULT_LIFE, coins: DEFAULT_COINS };
  localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(reset));
  return { remainingLives: 0, resetToStart: true };
}

export default function MemoryCardGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 1;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [cards, setCards] = useState(() => shuffleCards());
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MEMORY_TIME_LIMIT);
  const [busy, setBusy] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [loseState, setLoseState] = useState({ remainingLives: null, resetToStart: false });
  const resolvingRef = useRef(false);
  const lossHandledRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

  useEffect(() => {
    if (showWin || showLose) return;
    if (timeLeft <= 0) {
      void handleLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showLose, showWin, timeLeft]);

  useEffect(() => {
    if (flippedIds.length !== 2 || resolvingRef.current) return;

    resolvingRef.current = true;
    const [firstId, secondId] = flippedIds;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);

    if (!firstCard || !secondCard) {
      setFlippedIds([]);
      resolvingRef.current = false;
      return;
    }

    const isMatch = firstCard.emoji === secondCard.emoji;
    const timeout = setTimeout(() => {
      if (isMatch) {
        setCards((currentCards) =>
          currentCards.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card
          )
        );
      }

      setFlippedIds([]);
      resolvingRef.current = false;
    }, isMatch ? 300 : 800);

    return () => clearTimeout(timeout);
  }, [cards, flippedIds]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.matched)) {
      setShowWin(true);
    }
  }, [cards]);

  const handleCardClick = (cardId) => {
    if (busy || showWin || showLose || resolvingRef.current) return;

    const card = cards.find((entry) => entry.id === cardId);
    if (!card || card.matched || flippedIds.includes(cardId) || flippedIds.length === 2) return;

    setFlippedIds((current) => [...current, cardId]);
    setMoves((value) => value + 1);
  };

  const handleRetry = () => {
    setCards(shuffleCards());
    setFlippedIds([]);
    setMoves(0);
    setTimeLeft(MEMORY_TIME_LIMIT);
    setShowLose(false);
    setShowWin(false);
    setLoseState({ remainingLives: null, resetToStart: false });
    resolvingRef.current = false;
    lossHandledRef.current = false;
  };

  const registerLifeLoss = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const summary = applyLossToStoredProgress();

    try {
      if (playerSessionId) {
        await playerAPI.loseLife(playerSessionId);
      }
    } catch (error) {
      toast.error(error.message);
    }

    return summary;
  };

  const handleLoss = async () => {
    if (lossHandledRef.current) return;
    lossHandledRef.current = true;
    setBusy(true);

    const summary = await registerLifeLoss();
    setLoseState(summary);
    setBusy(false);
    setShowLose(true);
  };

  const handleBackExit = async () => {
    if (busy || showWin || showLose) return;
    setBusy(true);
    await registerLifeLoss();
    navigate('/game');
  };

  const handleBackToGame = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `memory-win-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId && sessionId) {
        const sessionData = await sessionAPI.getById(sessionId);
        const checkpoints = Array.isArray(sessionData?.checkpointIds) ? sessionData.checkpointIds : [];
        const matchedCheckpoint = checkpoints.find((entry) => entry.level === checkpoint);

        if (matchedCheckpoint?._id) {
          await playerAPI.checkpoint(playerSessionId, {
            checkpointId: matchedCheckpoint._id,
            scoreEarned: earnedCoins,
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
          rewardCoins: earnedCoins,
          resultId,
        },
      });
    }
  };

  const handleTimeoutContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `memory-timeout-${Date.now()}`;

    setBusy(true);

    try {
      if (playerSessionId) {
        await playerAPI.loseLife(playerSessionId);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      navigate('/game', { state: { wrongAnswer: true, resultId } });
    }
  };

  return (
    <PageLayout>
      <div className="pt-5 pb-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpoint}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Memory card game
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Match every pair before the 2-minute timer ends.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
              Moves
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {moves}
            </p>
          </div>
        </div>

        <div className="rounded-3xl p-4" style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card) => {
              const isOpen = card.matched || flippedIds.includes(card.id);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  disabled={busy || card.matched}
                  className="aspect-square rounded-2xl border-2 text-3xl font-bold transition-transform disabled:opacity-100"
                  style={{
                    borderColor: isOpen ? '#22C55E' : '#F59E0B',
                    backgroundColor: isOpen ? '#DCFCE7' : '#FEF3C7',
                    color: '#1F2937',
                    transform: isOpen ? 'rotateY(180deg)' : 'none',
                  }}
                >
                  <span style={{ opacity: isOpen ? 1 : 0.18 }}>
                    {isOpen ? card.emoji : '?'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Tap two cards to reveal them. If they match, they stay open. Match all 6 pairs before time runs out.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={handleBackExit} disabled={busy}>
            Back
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
              You win!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              All cards are matched. You earned {earnedCoins} coins from the time left.
            </p>
          </div>
          <Button variant="green" onClick={handleBackToGame} disabled={busy}>
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
              {loseState.resetToStart
                ? 'No lives left. You will return to checkpoint 1.'
                : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="red"
              onClick={loseState.resetToStart ? () => navigate('/game') : handleRetry}
              disabled={busy}
            >
              {loseState.resetToStart ? 'Checkpoint 1' : 'Play again'}
            </Button>
            <Button variant="green" onClick={() => navigate('/game')} disabled={busy}>
              Exit game
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}
