import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayerProgress } from '../utils/checkpointShop';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

const DEFAULT_GAME_ORDER = [
  '/tower-builder',
  '/whack-a-mole',
  '/combined-word-quiz',
  '/memory-game',
  '/puzzle-game',
  '/simon-game',
  '/click-counter-game',
  '/random-color-clicker',
  '/snake-game',
];

function getCheckpointRoute(checkpoint) {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const order = session?.gameOrder?.length > 0 ? session.gameOrder : DEFAULT_GAME_ORDER;
    return order[checkpoint - 1] ?? DEFAULT_GAME_ORDER[checkpoint - 1] ?? '/memory-game';
  } catch {
    return DEFAULT_GAME_ORDER[checkpoint - 1] ?? '/memory-game';
  }
}

export default function CheckpointScan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const checkpointNum = parseInt(id, 10);

  const [status, setStatus] = useState('checking'); // checking | ok | done | wrong | noSession

  useEffect(() => {
    const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
    const session = JSON.parse(localStorage.getItem('session') || 'null');

    if (!playerSession || !session) {
      setStatus('noSession');
      return;
    }

    if (isNaN(checkpointNum) || checkpointNum < 1) {
      setStatus('wrong');
      return;
    }

    const progress = getPlayerProgress();
    const gameMode = session?.gameMode || 'ordered';
    const totalCheckpoints = session?.gameOrder?.length || DEFAULT_GAME_ORDER.length;

    if (gameMode === 'random') {
      if (checkpointNum > totalCheckpoints) {
        setStatus('wrong');
        return;
      }
      const completedList = progress.completedList ?? [];
      if (completedList.includes(checkpointNum)) {
        setStatus('done');
        return;
      }
      navigate(getCheckpointRoute(checkpointNum), {
        replace: true,
        state: { checkpoint: checkpointNum },
      });
      return;
    }

    // Ordered mode
    const current = progress.current ?? 1;
    if (checkpointNum < current) {
      setStatus('done');
      return;
    }
    if (checkpointNum > current) {
      setStatus('wrong');
      return;
    }

    // Correct checkpoint — navigate immediately
    navigate(getCheckpointRoute(checkpointNum), {
      replace: true,
      state: { checkpoint: checkpointNum },
    });
  }, [checkpointNum]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = getPlayerProgress();
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  const gameMode = session?.gameMode || 'ordered';
  const current = progress.current ?? 1;

  if (status === 'checking') {
    return (
      <PageLayout>
        <div className="pt-20 flex flex-col items-center gap-4">
          <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{t.loading}</p>
        </div>
      </PageLayout>
    );
  }

  if (status === 'noSession') {
    return (
      <PageLayout>
        <div className="pt-10 flex flex-col gap-4">
          <Card className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🔒</span>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {t.notInGame}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              {t.joinGameBeforeScanning}
            </p>
            <Button variant="green" onClick={() => navigate('/join')}>
              {t.joinAGame}
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (status === 'done') {
    return (
      <PageLayout>
        <div className="pt-10 flex flex-col gap-4">
          <Card className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">✅</span>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {t.alreadyCompleted}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              {gameMode === 'random'
                ? translate(t.alreadyCompletedRandom, { checkpoint: checkpointNum })
                : translate(t.alreadyCompletedOrdered, {
                    checkpoint: checkpointNum,
                    current,
                  })}
            </p>
            <Button variant="green" onClick={() => navigate('/game')}>
              {t.backToGame}
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (status === 'wrong') {
    return (
      <PageLayout>
        <div className="pt-10 flex flex-col gap-4">
          <Card className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">⚠️</span>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {t.wrongCheckpoint}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              {translate(t.wrongCheckpointMessage, {
                checkpoint: checkpointNum,
                current,
              })}
            </p>
            <Button variant="green" onClick={() => navigate('/game')}>
              {t.backToGame}
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return null;
}