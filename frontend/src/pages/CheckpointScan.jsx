import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayerProgress } from '../utils/checkpointShop';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
          <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>Loading...</p>
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
              Not in a game
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              You need to join a game first before scanning checkpoints.
            </p>
            <Button variant="green" onClick={() => navigate('/join')}>
              Join a game
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
              Already completed!
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              {gameMode === 'random'
                ? `You already completed Checkpoint ${checkpointNum}. Find another QR code to scan.`
                : `You already passed Checkpoint ${checkpointNum}. Please move to Checkpoint ${current}.`}
            </p>
            <Button variant="green" onClick={() => navigate('/game')}>
              Back to game
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
              Wrong checkpoint!
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              This is Checkpoint {checkpointNum}, but you need{' '}
              <strong>Checkpoint {current}</strong>. Find the right QR code and scan it.
            </p>
            <Button variant="green" onClick={() => navigate('/game')}>
              Back to game
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return null;
}
