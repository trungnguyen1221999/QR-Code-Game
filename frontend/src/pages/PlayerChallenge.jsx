import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useBlockBack from '../hooks/useBlockBack';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';

const QUESTIONS = [
  {
    id: 1,
    question: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    answer: 2,
    hint: 'It\'s not the largest city!',
  },
  {
    id: 2,
    question: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    answer: 1,
    hint: 'Think of a honeycomb cell.',
  },
  {
    id: 3,
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Jupiter', 'Saturn', 'Mars'],
    answer: 3,
    hint: 'It\'s the 4th planet from the Sun.',
  },
  {
    id: 4,
    question: 'What is 12 × 8?',
    options: ['88', '96', '104', '92'],
    answer: 1,
    hint: 'Think: 12 × 8 = 10×8 + 2×8',
  },
  {
    id: 5,
    question: 'Which ocean is the largest?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3,
    hint: 'It covers more than 30% of Earth\'s surface.',
  },
  {
    id: 6,
    question: 'What gas do plants absorb from the air?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    answer: 2,
    hint: 'It\'s what we breathe out.',
  },
];

function getTotalCheckpoints() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const len = session?.gameOrder?.length;
    return (len && len > 0) ? len : 13;
  } catch {
    return 13;
  }
}

export default function PlayerChallenge() {
  useBlockBack();
  const navigate = useNavigate();
  const location = useLocation();
  const checkpointIndex = location.state?.checkpoint ?? 3;
  const initialTime = location.state?.timeLeft ?? 0;
  const q = QUESTIONS[(checkpointIndex - 1) % QUESTIONS.length];
  const totalCheckpoints = getTotalCheckpoints();
  const isFinalCheckpoint = checkpointIndex >= totalCheckpoints;

  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [showFinalCheckpointPopup, setShowFinalCheckpointPopup] = useState(false);

  useEffect(() => {
    if (initialTime <= 0) return; // no timer passed, skip
    if (timeLeft <= 0) {
      setShowTimeUp(true);
      return;
    }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const isCorrect = selected === q.answer;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const handleContinue = () => {
    if (isCorrect) {
      if (isFinalCheckpoint) {
        setShowFinalCheckpointPopup(true);
        return;
      }
      navigate('/shop', { state: { checkpoint: checkpointIndex, coins: 200 } });
    } else {
      navigate('/game', { state: { wrongAnswer: true } });
    }
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4 pb-4">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            Checkpoint {checkpointIndex}
          </p>
          <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>Challenge!</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Answer correctly to complete this checkpoint
          </p>
        </div>

        {/* Question card */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            let bg = 'white';
            let border = '#E5E7EB';
            let textColor = 'var(--color-text)';

            if (submitted) {
              if (i === q.answer) { bg = '#DCFCE7'; border = '#22C55E'; textColor = '#16A34A'; }
              else if (i === selected) { bg = '#FEE2E2'; border = '#DC2626'; textColor = '#DC2626'; }
            } else if (selected === i) {
              bg = '#FEF3E2'; border = 'var(--color-primary)'; textColor = 'var(--color-primary)';
            }

            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => setSelected(i)}
                className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold border-2 transition-all cursor-pointer disabled:cursor-default"
                style={{ backgroundColor: bg, borderColor: border, color: textColor }}
              >
                <span className="mr-2 font-bold">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {!submitted && (
          <button
            onClick={() => setShowHint(v => !v)}
            className="flex items-center gap-2 text-sm cursor-pointer"
            style={{ color: 'var(--color-subtext)' }}
          >
            <Lightbulb size={16} style={{ color: '#FBBF24' }} />
            {showHint ? q.hint : 'Show hint'}
          </button>
        )}

        {/* Result */}
        {submitted && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2' }}>
            {isCorrect
              ? <CheckCircle size={28} style={{ color: '#16A34A' }} />
              : <XCircle size={28} style={{ color: '#DC2626' }} />
            }
            <div>
              <p className="font-bold text-sm" style={{ color: isCorrect ? '#16A34A' : '#DC2626' }}>
                {isCorrect ? 'Correct! +50 coins 🪙' : 'Wrong answer! -1 life ❤️'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)' }}>
                {isCorrect ? 'Checkpoint unlocked!' : `Correct answer: ${['A','B','C','D'][q.answer]}. ${q.options[q.answer]}`}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {!submitted
          ? <Button variant="green" onClick={handleSubmit} disabled={selected === null}>
              Submit answer
            </Button>
          : <Button variant="green" onClick={handleContinue}>
              Continue →
            </Button>
        }

      </div>

      {/* Time up popup */}
      <Popup open={showTimeUp} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-5xl">⏰</span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Time up!</h3>
          <p className="text-sm font-bold text-center" style={{ color: 'var(--color-red)' }}>
            You cannot continue the checkpoint anymore.
          </p>
          <Button onClick={() => navigate('/game-over')}>
            Got it
          </Button>
        </div>
      </Popup>

      <Popup open={showFinalCheckpointPopup} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <img
            src="/beforeFinalGame.png"
            alt="All checkpoints cleared"
            className="w-36 h-36 object-contain"
          />
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>
            All checkpoints cleared! Get ready for the final challenge.
          </p>
          <Button
            variant="green"
            onClick={() => navigate('/game', { state: { justCompleted: checkpointIndex, rewardCoins: 50 } })}
          >
            Continue
          </Button>
        </div>
      </Popup>

    </PageLayout>
  );
}
