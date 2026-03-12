import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';

const MOCK_PLAYERS = [
  { id: 1, name: 'Shun',  avatar: '/avatar/avatar1.png', status: 'In game' },
  { id: 2, name: 'Trung', avatar: '/avatar/avatar2.png', status: 'Done' },
  { id: 3, name: 'Yan',   avatar: '/avatar/avatar3.png', status: 'Done' },
];

const HOST_NAME = 'Elsa';
const TOTAL_SECONDS = 20 * 60; // 20 minutes

function formatTime(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function HostGameInProgress() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [showEndPopup, setShowEndPopup] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/leaderboard', { state: { timeUp: true } });
      return;
    }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const completedCount = MOCK_PLAYERS.filter(p => p.status === 'Done').length;

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>Game in progress...</h2>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#FEF3E2' }}>
            <Users size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              {MOCK_PLAYERS.length}
            </span>
          </div>
        </div>

        {/* Timer box */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-2"
          style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>Time left</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {formatTime(timeLeft)}
          </p>
          <div className="flex w-full justify-around mt-1">
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>Completed players</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{completedCount}</p>
            </div>
            <div className="w-px" style={{ backgroundColor: '#E8C99A' }} />
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>Players in game</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {MOCK_PLAYERS.length - completedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Players list */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                Players ({MOCK_PLAYERS.length})
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              Host : <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{HOST_NAME}</span>
            </span>
          </div>
          <div className="flex flex-col divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
            {MOCK_PLAYERS.map(p => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2.5"
                style={{ backgroundColor: '#FEF9F5' }}>
                <div className="flex items-center gap-3">
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.name}</span>
                </div>
                <span className="text-xs font-semibold"
                  style={{ color: p.status === 'Done' ? 'var(--color-green)' : 'var(--color-primary)' }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Game settings */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Game Settings:</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>• 6 QR Checkpoints to discover</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>• Total play time is 30 minutes.</p>
        </div>

        {/* Leaderboard shortcut */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex-1 rounded-xl p-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-info-bg)' }}>
            <Trophy size={32} style={{ color: 'var(--color-primary)' }} />
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex-1 rounded-xl py-4 text-sm font-semibold"
            style={{ backgroundColor: '#E5E7EB', color: 'var(--color-text)' }}>
            When time up
          </button>
        </div>

        {/* End game */}
        <Button variant="red" onClick={() => setShowEndPopup(true)}>
          <X size={16} /> End game
        </Button>

      </div>

      {/* End game confirmation popup */}
      <Popup open={showEndPopup} onClose={() => setShowEndPopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}>
            <X size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Are you sure to end game?
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" onClick={() => navigate('/')}>Confirm</Button>
            <Button variant="red" onClick={() => setShowEndPopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
