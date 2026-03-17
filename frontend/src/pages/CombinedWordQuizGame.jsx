import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, HelpCircle, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import Input from '../components/ui/Input';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
import { playerAPI, sessionAPI } from '../utils/api';
import { getInitialGameTime, getReplayGameTime } from '../utils/checkpointShop';

const QUIZ_TIME_LIMIT = 70;
const PASS_SCORE = 2;
const TOTAL_QUESTIONS = 10;
const PLAYER_PROGRESS_KEY = 'playerGameProgress';
const DEFAULT_LIFE = 3;
const DEFAULT_COINS = 0;

const QUESTION_BANK = [
  { id: 'sunglasses', pictures: ['☀️', '🕶️'], answer: 'sunglasses', hint: 'Something you wear on a sunny day' },
  { id: 'starfish', pictures: ['⭐', '🐟'], answer: 'starfish', hint: 'A sea animal with five arms' },
  { id: 'snowman', pictures: ['❄️', '👨'], answer: 'snowman', hint: 'Built during winter' },
  { id: 'fireman', pictures: ['🔥', '👨'], answer: 'fireman', hint: 'Comes to help stop fires' },
  { id: 'bookworm', pictures: ['📚', '🪱'], answer: 'bookworm', hint: 'A person who loves reading' },
  { id: 'rainbow', pictures: ['🌧️', '🏹'], answer: 'rainbow', hint: 'Colorful sky after rain' },
  { id: 'cupcake', pictures: ['🥤', '🍰'], answer: 'cupcake', hint: 'A small sweet dessert' },
  { id: 'football', pictures: ['🦶', '⚽'], answer: 'football', hint: 'A sport played with a ball' },
  { id: 'seahorse', pictures: ['🌊', '🐴'], answer: 'seahorse', hint: 'A tiny ocean creature' },
  { id: 'mailbox', pictures: ['✉️', '📦'], answer: 'mailbox', hint: 'Letters go here' },
  { id: 'sunflower', pictures: ['☀️', '🌼'], answer: 'sunflower', hint: 'A tall yellow flower' },
  { id: 'moonlight', pictures: ['🌙', '💡'], answer: 'moonlight', hint: 'Glow from the night sky' },
  { id: 'toothbrush', pictures: ['🦷', '🪥'], answer: 'toothbrush', hint: 'Used every morning and night' },
  { id: 'handbag', pictures: ['✋', '👜'], answer: 'handbag', hint: 'You carry it with you' },
  { id: 'raincoat', pictures: ['🌧️', '🧥'], answer: 'raincoat', hint: 'You wear it in wet weather' },
  { id: 'basketball', pictures: ['🧺', '🏀'], answer: 'basketball', hint: 'A sport with hoops' },
  { id: 'firefly', pictures: ['🔥', '🪰'], answer: 'firefly', hint: 'A glowing insect at night' },
  { id: 'ladybug', pictures: ['👩', '🐞'], answer: 'ladybug', hint: 'A tiny spotted insect' },
  { id: 'cupboard', pictures: ['☕', '🪵'], answer: 'cupboard', hint: 'A kitchen storage place' },
  { id: 'bedroom', pictures: ['🛏️', '🏠'], answer: 'bedroom', hint: 'A place where you sleep' },
  { id: 'notebook', pictures: ['📝', '📚'], answer: 'notebook', hint: 'Used for writing things down' },
  { id: 'pancake', pictures: ['🍳', '🍰'], answer: 'pancake', hint: 'A flat breakfast favorite' },
  { id: 'starfruit', pictures: ['⭐', '🍎'], answer: 'starfruit', hint: 'A tropical fruit with a fun shape' },
  { id: 'doghouse', pictures: ['🐶', '🏠'], answer: 'doghouse', hint: 'A little home for a pet' },
  { id: 'jellyfish', pictures: ['🍇', '🐟'], answer: 'jellyfish', hint: 'A soft ocean creature' },
  { id: 'lighthouse', pictures: ['💡', '🏠'], answer: 'lighthouse', hint: 'Guides ships near the coast' },
  { id: 'mailman', pictures: ['✉️', '👨'], answer: 'mailman', hint: 'Brings letters to your home' },
  { id: 'fishbowl', pictures: ['🐟', '🥣'], answer: 'fishbowl', hint: 'A round home for a pet fish' },
  { id: 'teapot', pictures: ['🫖', '🍲'], answer: 'teapot', hint: 'Used to pour hot tea' },
  { id: 'blueberry', pictures: ['🔵', '🍓'], answer: 'blueberry', hint: 'A small blue fruit' },
  { id: 'earring', pictures: ['👂', '💍'], answer: 'earring', hint: 'Jewelry you wear on one side of your head' },
  { id: 'keyboard', pictures: ['🔑', '📋'], answer: 'keyboard', hint: 'You type on it' },
  { id: 'strawberry', pictures: ['🥤', '🍓'], answer: 'strawberry', hint: 'A sweet red berry' },
  { id: 'houseplant', pictures: ['🏠', '🪴'], answer: 'houseplant', hint: 'A green decoration indoors' },
  { id: 'butterfly', pictures: ['🧈', '🪰'], answer: 'butterfly', hint: 'A colorful winged insect' },
  { id: 'sunrise', pictures: ['☀️', '⬆️'], answer: 'sunrise', hint: 'The start of a new day' },
  { id: 'watermelon', pictures: ['💧', '🍈'], answer: 'watermelon', hint: 'A big juicy summer fruit' },
  { id: 'bookcase', pictures: ['📚', '🧳'], answer: 'bookcase', hint: 'Furniture for storing books' },
  { id: 'sandwich', pictures: ['🏖️', '🥪'], answer: 'sandwich', hint: 'A meal between slices of bread' },
  { id: 'headphones', pictures: ['😀', '🎧'], answer: 'headphones', hint: 'You wear them to listen to music' },
  { id: 'cowboy', pictures: ['🐄', '👦'], answer: 'cowboy', hint: 'Famous for riding horses and wearing hats' },
  { id: 'newspaper', pictures: ['🆕', '📰'], answer: 'newspaper', hint: 'Printed daily news' },
];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function normalizeAnswer(value) {
  return value.toLowerCase().replace(/\s+/g, '');
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

export default function CombinedWordQuizGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 3;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [questions, setQuestions] = useState(() => shuffle(QUESTION_BANK).slice(0, TOTAL_QUESTIONS));
  const [timeLeft, setTimeLeft] = useState(() => getInitialGameTime(QUIZ_TIME_LIMIT, 'combined-word-quiz', location.key));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submittedIds, setSubmittedIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [loseState, setLoseState] = useState({ remainingLives: null, resetToStart: false });
  const earnedCoins = Math.max(0, timeLeft * 2);

  const currentQuestion = questions[currentIndex];
  const remainingQuestions = TOTAL_QUESTIONS - submittedIds.length;
  const canStillPass = score + remainingQuestions >= PASS_SCORE;

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
    if (showWin || showLose) return;
    if (score >= PASS_SCORE) {
      setShowWin(true);
      return;
    }
    if (submittedIds.length >= TOTAL_QUESTIONS || !canStillPass) {
      void handleLoss();
    }
  }, [canStillPass, score, showLose, showWin, submittedIds.length]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 1000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const moveToNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setAnswer('');
    }
  };

  const resetGame = () => {
    setQuestions(shuffle(QUESTION_BANK).slice(0, TOTAL_QUESTIONS));
    setTimeLeft(getReplayGameTime(QUIZ_TIME_LIMIT));
    setCurrentIndex(0);
    setScore(0);
    setAnswer('');
    setFeedback(null);
    setSubmittedIds([]);
    setBusy(false);
    setShowWin(false);
    setShowLose(false);
    setLoseState({ remainingLives: null, resetToStart: false });
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
    if (busy || showLose) return;
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

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !answer.trim()) return;
    if (submittedIds.includes(currentQuestion.id)) return;

    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(currentQuestion.answer);

    setSubmittedIds((value) => [...value, currentQuestion.id]);

    if (isCorrect) {
      setScore((value) => value + 1);
      setFeedback({ type: 'good', text: `Correct! ${currentQuestion.answer}` });
    } else {
      setFeedback({ type: 'bad', text: `Wrong! Correct answer: ${currentQuestion.answer}` });
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 500);
  };

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const sessionId = session?._id || session?.id;
    const resultId = `quiz-win-${Date.now()}`;

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
            Combined word quiz
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Solve picture-word combinations. Get at least {PASS_SCORE} correct out of {TOTAL_QUESTIONS} before time runs out.
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
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <Trophy size={14} />
              Score
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {score}/{PASS_SCORE}
            </p>
          </div>

          <div className="rounded-2xl p-3" style={{ backgroundColor: '#ECFCCB' }}>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#3F6212' }}>
              <HelpCircle size={14} />
              Question
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#365314' }}>
              {Math.min(currentIndex + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
            </p>
          </div>
        </div>

        {currentQuestion && (
          <div className="rounded-3xl p-5" style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-center gap-4 text-5xl mb-4">
              {currentQuestion.pictures.map((picture, index) => (
                <div
                  key={`${currentQuestion.id}-${index}`}
                  className="h-20 w-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#FEF3E2' }}
                >
                  {picture}
                </div>
              ))}
            </div>

            <p className="text-sm text-center mb-4" style={{ color: 'var(--color-subtext)' }}>
              Hint: {currentQuestion.hint}
            </p>

            <Input
              label="Your answer"
              placeholder="Type the combined word"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
          </div>
        )}

        {feedback && (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-bold text-center"
            style={{
              backgroundColor: feedback.type === 'good' ? '#DCFCE7' : '#FEE2E2',
              color: feedback.type === 'good' ? '#166534' : '#B91C1C',
            }}
          >
            {feedback.text}
          </div>
        )}

        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            How to win
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Combine the picture clues into one word. You need at least {PASS_SCORE} correct answers to clear checkpoint 3.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={handleBackExit} disabled={busy}>
            Back
          </Button>
          <Button variant="green" onClick={handleSubmitAnswer} disabled={!answer.trim() || showWin || showLose}>
            Submit answer
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
              Quiz cleared!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              You reached the pass grade and earned {earnedCoins} coins.
            </p>
          </div>
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} />
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
              Quiz over
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {loseState.resetToStart
                ? 'No lives left. You will return to checkpoint 1.'
                : `One life was removed. ${loseState.remainingLives ?? 0} lives left.`}
            </p>
          </div>
          <CheckpointShopPanel />
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="red"
              onClick={loseState.resetToStart ? () => navigate('/game') : resetGame}
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
