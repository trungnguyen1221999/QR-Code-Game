import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import { playerAPI } from '../utils/api';
import {
  applyLossToStoredProgress,
  clearUnusedExtraLife,
  getPlayerProgress,
  getInitialGameTime,
  getReplayGameTime,
  resetProgressToCheckpointOne,
} from '../utils/checkpointShop';
import Card from '../components/ui/card';

const MEMORY_TIME_LIMIT = 300;
const CARD_EMOJIS = ['🐼', '🦊', '🐸', '🐵', '🐧', '🐯'];
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

export default function MemoryCardGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 1;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

  const [cards, setCards] = useState(() => shuffleCards());
  const [flippedIds, setFlippedIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => getInitialGameTime(MEMORY_TIME_LIMIT, 'memory', location.key));
  const [busy, setBusy] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState({ remainingLives: null, needsLifePurchase: false });
  const resolvingRef = useRef(false);
  const lossHandledRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

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
  };

  const handleRetry = () => {
    setCards(shuffleCards());
    setFlippedIds([]);
    setTimeLeft(getReplayGameTime(MEMORY_TIME_LIMIT));
    setShowLose(false);
    setShowWin(false);
    setLoseState({ remainingLives: null, needsLifePurchase: false });
    resolvingRef.current = false;
    lossHandledRef.current = false;
  };

  const handleLoseShopPurchase = (result) => {
    if (result.item?.id !== 'life') return;

    setLoseState({
      remainingLives: result.progress?.life ?? 1,
      needsLifePurchase: false,
    });
  };

  const handleLoseExit = () => {
    if (loseState.needsLifePurchase) {
      resetProgressToCheckpointOne();
    } else {
      clearUnusedExtraLife();
    }

    navigate('/game');
  };

  const handleLosePrimaryAction = () => {
    if (loseState.needsLifePurchase) {
      resetProgressToCheckpointOne();
      navigate('/game');
      return;
    }

    handleRetry();
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
    setBusy(true);
    const summary = await registerLifeLoss();
    if (summary.needsLifePurchase) {
      resetProgressToCheckpointOne();
    }
    navigate('/game');
  };

  const currentLives = getPlayerProgress().life ?? 0;
  const backWillResetToStart = currentLives <= 1;

  const handleBackToGame = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `memory-win-${Date.now()}`;

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

          <Card>
           <div className='flex justify-between items-center' > 
              <p className="text font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
                <Clock size={16} />
                Time left
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
                {formatTime(timeLeft)}
              </p>
           </div>
          </Card>

         

        <div className="rounded-2xl">
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

        <Card>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Tap two cards to reveal them. If they match, they stay open. Match all 6 pairs before time runs out.
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
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
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} />
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
              {loseState.needsLifePurchase
                ? 'No lives left. Buy an extra life now to keep your current checkpoint.'
                : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
            </p>
          </div>
          <CheckpointShopPanel
            isOpen={showLose}
            warningMessage={
              loseState.needsLifePurchase
                ? 'If you will not buy life from store now, you need to start again from checkpoint 1.'
                : ''
            }
            onPurchase={handleLoseShopPurchase}
          />
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="red"
              onClick={handleLosePrimaryAction}
              disabled={busy}
            >
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
