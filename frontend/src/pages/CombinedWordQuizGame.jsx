import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Target, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import Input from '../components/ui/Input';
import CheckpointShopPanel from '../components/ui/CheckpointShopPanel';
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
import Card from '../components/ui/card';

const QUIZ_TIME_LIMIT = 300;
const PASS_SCORE = 7;
const TOTAL_QUESTIONS = 10;

const COPY = {
  checkpoint: 'Checkpoint',
  title: 'Combined word quiz',
  subtitle: `Solve picture-word combinations. Get at least ${PASS_SCORE} correct out of ${TOTAL_QUESTIONS} before time runs out.`,
  timeLeft: 'Time left',
  score: 'Score',
  question: 'Question',
  hint: 'Hint',
  answerLabel: 'Your answer',
  answerPlaceholder: 'Type the combined word',
  howToWin: 'How to win',
  howToWinText: `Combine the picture clues into one word. You need at least ${PASS_SCORE} correct answers to clear checkpoint 3.`,
  back: 'Back',
  submit: 'Submit answer',
  correct: (answer) => `Correct! ${answer}`,
  wrong: (answer) => `Wrong! Correct answer: ${answer}`,
  winTitle: 'Quiz cleared!',
  winText: (coins) => `You reached the pass grade and earned ${coins} coins.`,
  loseTitle: 'Quiz over',
  loseNoLife: 'No lives left. Buy an extra life now to keep your current checkpoint.',
  loseHasLife: (lives) => `One life was removed. ${lives} lives left.`,
  backTitle: 'Leave this game?',
  backText: 'If you go back now, one life will be lost.',
  backResetText: 'If you go back now, one life will be lost and you will need to start again from checkpoint 1.',
  confirm: 'Confirm',
  cancel: 'Cancel',
  continue: 'Continue',
  exitGame: 'Exit game',
  playAgain: 'Play again',
};

const QUESTION_BANK = [
  { id: 'aurinkolasit', pictures: ['☀️', '🕶️'], answer: 'aurinkolasit', hint: 'Jotain, jota kaytat aurinkoisena paivana' },
  { id: 'meritahti', pictures: ['⭐', '🐟'], answer: 'meritahti', hint: 'Merielain, jolla on viisi sakaraa' },
  { id: 'lumimies', pictures: ['❄️', '👨'], answer: 'lumimies', hint: 'Rakennetaan talvella' },
  { id: 'palomies', pictures: ['🔥', '👨'], answer: 'palomies', hint: 'Tulee auttamaan tulipaloissa' },
  { id: 'kirjatoukka', pictures: ['📚', '🪱'], answer: 'kirjatoukka', hint: 'Henkilo, joka rakastaa lukemista' },
  { id: 'sateenkaari', pictures: ['🌧️', '🏹'], answer: 'sateenkaari', hint: 'Varikas ilmio sateen jalkeen' },
  { id: 'kuppikakku', pictures: ['☕', '🍰'], answer: 'kuppikakku', hint: 'Pieni makea jalkiruoka' },
  { id: 'jalkapallo', pictures: ['🦶', '⚽'], answer: 'jalkapallo', hint: 'Pallolla pelattava urheilulaji' },
  { id: 'merihevonen', pictures: ['🌊', '🐴'], answer: 'merihevonen', hint: 'Pieni merielain' },
  { id: 'postilaatikko', pictures: ['✉️', '📦'], answer: 'postilaatikko', hint: 'Kirjeet tulevat tanne' },
  { id: 'auringonkukka', pictures: ['☀️', '🌼'], answer: 'auringonkukka', hint: 'Korkea keltainen kukka' },
  { id: 'hammasharja', pictures: ['🦷', '🪥'], answer: 'hammasharja', hint: 'Kaytetaan joka aamu ja ilta' },
  { id: 'kasilaukku', pictures: ['✋', '👝'], answer: 'kasilaukku', hint: 'Kannat sita mukanasi' },
  { id: 'sadetakki', pictures: ['🌧️', '🧥'], answer: 'sadetakki', hint: 'Pidat sita sateella' },
  { id: 'koripallo', pictures: ['🧺', '🏀'], answer: 'koripallo', hint: 'Urheilulaji, jossa on koreja' },
  { id: 'makuuhuone', pictures: ['🛏️', '🏠'], answer: 'makuuhuone', hint: 'Huone, jossa nukut' },
  { id: 'muistikirja', pictures: ['📝', '📚'], answer: 'muistikirja', hint: 'Kaytetaan muistiinpanoihin' },
  { id: 'pannukakku', pictures: ['🍳', '🍰'], answer: 'pannukakku', hint: 'Littea aamiaisherkku' },
  { id: 'koirankoppi', pictures: ['🐶', '🏠'], answer: 'koirankoppi', hint: 'Pieni koti lemmikille' },
  { id: 'majakka', pictures: ['💡', '🏠'], answer: 'majakka', hint: 'Ohjaa laivoja rannikon lahella' },
  { id: 'postimies', pictures: ['✉️', '👨'], answer: 'postimies', hint: 'Tuo kirjeet kotiisi' },
  { id: 'teekannu', pictures: ['🫖', '🍲'], answer: 'teekannu', hint: 'Silla kaadetaan kuumaa teeta' },
  { id: 'korvakoru', pictures: ['👂', '💍'], answer: 'korvakoru', hint: 'Koru, jota pidetaan korvassa' },
  { id: 'nappaimisto', pictures: ['🔑', '📋'], answer: 'nappaimisto', hint: 'Silla kirjoitetaan' },
  { id: 'koiranruoka', pictures: ['🐶', '🍖'], answer: 'koiranruoka', hint: 'Anna tämä koirallesi, kun se on nälkäinen.' },
  { id: 'auringonnousu', pictures: ['☀️', '⬆️'], answer: 'auringonnousu', hint: 'Uuden paivan alku' },
  { id: 'vesimeloni', pictures: ['💧', '🍈'], answer: 'vesimeloni', hint: 'Iso mehukas kesahedelma' },
  { id: 'kirjahylly', pictures: ['📚', '🧳'], answer: 'kirjahylly', hint: 'Huonekalu kirjojen sailytykseen' },
  { id: 'voileipa', pictures: ['🧈', '🥪'], answer: 'voileipa', hint: 'Ateria leipapalojen valissa' },
  { id: 'mansikkahillo', pictures: ['🍓', '🫙'], answer: 'mansikkahillo', hint: 'Makea hillo, joka on tehty mansikoista' },
  { id: 'omenamehu', pictures: ['🍎', '🧃'], answer: 'omenamehu', hint: 'Makea mehu, joka on tehty omenoista' },
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
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

export default function CombinedWordQuizGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkpoint = location.state?.checkpoint ?? 3;
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');

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
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [loseState, setLoseState] = useState(INITIAL_LOSE_STATE);
  const earnedCoins = Math.max(0, timeLeft * 2);

  const currentQuestion = questions[currentIndex];
  const remainingQuestions = TOTAL_QUESTIONS - submittedIds.length;
  const canStillPass = score + remainingQuestions >= PASS_SCORE;

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
    setShowBackConfirm(false);
    setLoseState(INITIAL_LOSE_STATE);
  };

  const handleLoseShopPurchase = (result) => applyLosePurchase(result, setLoseState);

  const playerSessionId = playerSession?.id;

  const handleLoseExit = () => handleCheckpointLoseExit(loseState, navigate, playerSessionId);

  const handleLosePrimaryAction = () =>
    handleCheckpointLosePrimaryAction(loseState, navigate, resetGame, playerSessionId);

  const registerLifeLoss = async () => {
    const playerSessionId = playerSession?.id;

    try {
      return await registerCheckpointLifeLoss(playerSessionId);
    } catch (error) {
      toast.error(error.message);
      return INITIAL_LOSE_STATE;
    }
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

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !answer.trim()) return;
    if (submittedIds.includes(currentQuestion.id)) return;

    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(currentQuestion.answer);

    setSubmittedIds((value) => [...value, currentQuestion.id]);

    if (isCorrect) {
      setScore((value) => value + 1);
      setFeedback({ type: 'good', text: COPY.correct(currentQuestion.answer) });
    } else {
      setFeedback({ type: 'bad', text: COPY.wrong(currentQuestion.answer) });
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 500);
  };

  const handleWinContinue = async () => {
    const playerSessionId = playerSession?._id || playerSession?.id;
    const resultId = `quiz-win-${Date.now()}`;

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
            {COPY.checkpoint} {checkpoint}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {COPY.title}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {COPY.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563EB' }}>
              <Clock size={14} />
              {COPY.timeLeft}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#1D4ED8' }}>
              {formatTime(timeLeft)}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C2410C' }}>
              <Target size={14} />
              {COPY.score}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: '#9A3412' }}>
              {score}/{PASS_SCORE}
            </p>
          </Card>
        </div>

        {currentQuestion && (
          <Card>
            {/* Question counter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{COPY.question}</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ECFCCB', color: '#365314' }}>
                {Math.min(currentIndex + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 text-5xl mb-4">
              {currentQuestion.pictures.map((picture, index) => (
                <div
                  key={`${currentQuestion.id}-${index}`}                >
                  {picture}
                </div>
              ))}
            </div>


            <Input
              label={COPY.answerLabel}
              placeholder={COPY.answerPlaceholder}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
          </Card>
        )}

        {feedback && (
          <Card
            style={{
              backgroundColor: feedback.type === 'good' ? '#DCFCE7' : '#FEE2E2',
              color: feedback.type === 'good' ? '#166534' : '#B91C1C',
            }}
          >
            {feedback.text}
          </Card>
        )}

        <Card>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {COPY.howToWin}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            {COPY.howToWinText}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="red" onClick={() => setShowBackConfirm(true)} disabled={busy || showWin || showLose}>
            {COPY.back}
          </Button>
          <Button variant="green" onClick={handleSubmitAnswer} disabled={!answer.trim() || showWin || showLose}>
            {COPY.submit}
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
              {COPY.winTitle}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {COPY.winText(earnedCoins)}
            </p>
          </div>
          <CheckpointShopPanel earnedCoins={earnedCoins} grantCoins={showWin} isOpen={showWin} checkpoint={checkpoint} />
          <Button variant="green" onClick={handleWinContinue} disabled={busy}>
            {COPY.continue}
          </Button>
        </div>
      </Popup>

      <Popup open={showLose} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">⏰</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {COPY.loseTitle}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {loseState.needsLifePurchase
                ? COPY.loseNoLife
                : COPY.loseHasLife(loseState.remainingLives ?? 0)}
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
              {loseState.needsLifePurchase ? 'Checkpoint 1' : COPY.playAgain}
            </Button>
            <Button variant="green" onClick={handleLoseExit} disabled={busy}>
              {COPY.exitGame}
            </Button>
          </div>
        </div>
      </Popup>

      <Popup open={showBackConfirm} onClose={() => setShowBackConfirm(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">!</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {COPY.backTitle}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
              {backWillResetToStart ? COPY.backResetText : COPY.backText}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="red" onClick={handleBackExit} disabled={busy}>
              {COPY.confirm}
            </Button>
            <Button variant="green" onClick={() => setShowBackConfirm(false)} disabled={busy}>
              {COPY.cancel}
            </Button>
          </div>
        </div>
      </Popup>
    </PageLayout>
  );
}
