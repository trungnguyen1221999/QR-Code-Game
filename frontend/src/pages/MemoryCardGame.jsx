import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import CheckpointWinReward from '../components/ui/CheckpointWinReward';
import GameStartOverlay from '../components/ui/GameStartOverlay';
import { playerAPI } from '../utils/api';
import {
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
  registerCheckpointLifeLoss,
} from '../utils/checkpointLoseFlow';
import Card from '../components/ui/Card';
import { getMiniGameConfig, getSessionDifficulty } from '../utils/constantMiniGame';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../translations';

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
  const { t } = useLanguage();
  const { timeLimit: MEMORY_TIME_LIMIT } = getMiniGameConfig('memory', getSessionDifficulty());
  useBlockBack();
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 1;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

  const [cards, setCards] = useState(() => shuffleCards());
  const [flippedIds, setFlippedIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => getInitialGameTime(MEMORY_TIME_LIMIT, 'memory', location.key));
  const [busy, setBusy] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const resolvingRef = useRef(false);
  const lossHandledRef = useRef(false);
  const outcomeLockedRef = useRef(false);
  const earnedCoins = Math.max(0, timeLeft * 2);

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
  }, [showBackConfirm, showLose, showWin, timeLeft, hasStarted]);

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
    if (hasStarted && cards.length > 0 && cards.every((card) => card.matched)) {
      outcomeLockedRef.current = true;
      setShowWin(true);
    }
  }, [cards, hasStarted]);

  const handleCardClick = (cardId) => {
    if (!hasStarted || busy || showWin || showLose || resolvingRef.current) return;

    const card = cards.find((entry) => entry.id === cardId);
    if (!card || card.matched || flippedIds.includes(cardId) || flippedIds.length === 2) return;

    setFlippedIds((current) => [...current, cardId]);
  };

  const handleRetry = () => {
    outcomeLockedRef.current = false;
    setHasStarted(false);
    setCards(shuffleCards());
    setFlippedIds([]);
    setTimeLeft(getReplayGameTime(MEMORY_TIME_LIMIT));
    setShowLose(false);
    setShowWin(false);
    setLoseState(INITIAL_LOSE_STATE);
    resolvingRef.current = false;
    lossHandledRef.current = false;
  };

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const playerSessionId = playerSession?._id || playerSession?.id;

  const handleLoseExit = () => handleCheckpointLoseExit(loseState, navigate, playerSessionId);

  const handleLosePrimaryAction = () =>
    handleCheckpointLosePrimaryAction(loseState, navigate, handleRetry, playerSessionId);

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
            {translate(t.checkpointLabel, { checkpoint })}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t.memoryMatchTitle}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {hasStarted ? t.memoryMatchRunningInstruction : t.memoryMatchReadyInstruction}
          </p>
        </div>

          <Card>
           <div className='flex justify-between items-center' > 
              <p className="text font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
                <Clock size={16} />
                {t.timeLeft}
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
                {formatTime(timeLeft)}
              </p>
           </div>
          </Card>

         

        <div className="relative rounded-2xl">
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card) => {
              const isOpen = card.matched || flippedIds.includes(card.id);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  disabled={!hasStarted || busy || card.matched}
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
          <GameStartOverlay
            show={!hasStarted}
            onStart={() => setHasStarted(true)}
            title={t.memoryMatchTitle}
            description={t.memoryMatchReadyInstruction}
            startLabel={t.start}
            disabled={busy}
          />
        </div>

        <Card>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {t.memoryMatchHowToWinTitle}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            {t.memoryMatchHowToWinDesc}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
            {t.back}
          </Button>
          <div />
        </div>
      </div>

      <Popup open={showWin} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckpointWinReward
            checkpoint={checkpoint}
            title={t.memoryMatchWinTitle}
            message={translate(t.memoryMatchWinMessage, { coins: earnedCoins })}
          />
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} checkpoint={checkpoint} />
          <Button variant="green" onClick={handleBackToGame} disabled={busy}>
            {t.continue}
          </Button>
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
            <Button
              variant="red"
              onClick={handleLosePrimaryAction}
              disabled={busy}
            >
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
