import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Trophy, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { sessionAPI } from '../utils/api';

function formatTime(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function statusLabel(status) {
  if (status === 'finished') return 'Done';
  if (status === 'eliminated') return 'Out';
  return 'In game';
}

function statusColor(status) {
  if (status === 'finished') return 'var(--color-green)';
  if (status === 'eliminated') return 'var(--color-red)';
  return 'var(--color-primary)';
}

export default function HostGameInProgress({ onLogout }) {
  const navigate = useNavigate();
  const host = JSON.parse(localStorage.getItem('host') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(session?.code ?? '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Poll players every 2s
  useEffect(() => {
    if (!session?._id) return;

    const fetchPlayers = async () => {
      try {
        const data = await sessionAPI.getPlayers(session._id);
        setPlayers(Array.isArray(data) ? data : []);
      } catch {
        // silently ignore
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, [session?._id]);

  // Countdown based on session.expiresAt
  useEffect(() => {
    const expiresAt = session?.expiresAt ? new Date(session.expiresAt) : null;
    if (!expiresAt) {
      // Fallback: use totalTime from session
      setTimeLeft((session?.totalTime || 30) * 60);
      return;
    }

    const tick = () => {
      const secs = Math.max(0, Math.round((expiresAt - new Date()) / 1000));
      setTimeLeft(secs);
      if (secs <= 0) navigate('/leaderboard', { state: { timeUp: true } });
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session?.expiresAt]);

  const completedCount = players.filter(p => p.status === 'finished').length;
  const inGameCount = players.filter(p => p.status === 'active').length;

  const handleEnd = async () => {
    try {
      await sessionAPI.finish(session._id);
    } catch {
      // ignore
    }
    localStorage.removeItem('session');
    navigate('/');
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Logged in as Host</p>
            <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              👋 Hello, {host?.name || host?.username}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#FEF3E2' }}>
              <Users size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                {players.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>Game in progress...</h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-bold text-lg tracking-widest px-3 py-1 rounded-xl"
            style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}
          >
            {session?.code || '------'}
            {copied
              ? <Check size={16} style={{ color: 'var(--color-green)' }} />
              : <Copy size={16} />
            }
          </button>
        </div>

        {/* Timer box */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-2"
          style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>Time left</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
          </p>
          <div className="flex w-full justify-around mt-1">
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>Completed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{completedCount}</p>
            </div>
            <div className="w-px" style={{ backgroundColor: '#E8C99A' }} />
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>In game</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{inGameCount}</p>
            </div>
          </div>
        </div>

        {/* Players list */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                Players ({players.length})
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              Host : <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                {host?.name || host?.username}
              </span>
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-subtext)' }}>
              No players yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
              {players.map(p => (
                <div key={p._id} className="flex items-center justify-between px-3 py-2.5"
                  style={{ backgroundColor: '#FEF9F5' }}>
                  <div className="flex items-center gap-3">
                    <img
                      src={p.userId?.avatar || '/avatar/avatar1.png'}
                      alt={p.userId?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {p.userId?.username}
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: statusColor(p.status) }}>
                    {statusLabel(p.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Game settings */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Game Settings:</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>• 6 QR Checkpoints to discover</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
            • Total play time is {session?.totalTime || 30} minutes.
          </p>
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
            <Button variant="green" onClick={handleEnd}>Confirm</Button>
            <Button variant="red" onClick={() => setShowEndPopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
