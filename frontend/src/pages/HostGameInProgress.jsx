import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Copy, Check, MapPin, Timer } from 'lucide-react';
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

  const MOCK_PLAYERS = [
    { _id: '1', userId: { username: 'Shun', avatar: '/avatar/avatar1.png' }, status: 'finished', checkpointsCompleted: 6, lastCheckpointAt: '2024-01-01T10:05:00Z' },
    { _id: '2', userId: { username: 'Trung', avatar: '/avatar/avatar2.png' }, status: 'active', checkpointsCompleted: 4, lastCheckpointAt: '2024-01-01T10:12:00Z' },
    { _id: '3', userId: { username: 'Yan', avatar: '/avatar/avatar3.png' }, status: 'active', checkpointsCompleted: 4, lastCheckpointAt: '2024-01-01T10:15:00Z' },
    { _id: '4', userId: { username: 'Helen', avatar: '/avatar/avatar4.png' }, status: 'eliminated', checkpointsCompleted: 2, lastCheckpointAt: '2024-01-01T10:08:00Z' },
    { _id: '5', userId: { username: 'Stev', avatar: '/avatar/avatar1.png' }, status: 'active', checkpointsCompleted: 1, lastCheckpointAt: null },
  ];

  const [players] = useState(MOCK_PLAYERS);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);
  const [timeUpCountdown, setTimeUpCountdown] = useState(5);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(session?.code ?? '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // TODO: re-enable when ready
  // useEffect(() => {
  //   if (!session?._id) return;
  //   const fetchPlayers = async () => {
  //     try {
  //       const data = await sessionAPI.getPlayers(session._id);
  //       setPlayers(Array.isArray(data) ? data : []);
  //     } catch { /* silently ignore */ }
  //   };
  //   fetchPlayers();
  //   const interval = setInterval(fetchPlayers, 2000);
  //   return () => clearInterval(interval);
  // }, [session?._id]);

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
      if (secs <= 0) setShowTimeUpPopup(true);
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session?.expiresAt]);

  const completedCount = players.filter(p => p.status === 'finished').length;
  const inGameCount = players.filter(p => p.status === 'active').length;

  // 5s countdown after time up popup appears
  useEffect(() => {
    if (!showTimeUpPopup) return;
    setTimeUpCountdown(5);
    const t = setInterval(() => {
      setTimeUpCountdown(v => {
        if (v <= 1) {
          clearInterval(t);
          navigate('/leaderboard', { state: { timeUp: true } });
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showTimeUpPopup]);

  const handleTimeUp = () => {
    setShowTimeUpPopup(true);
  };

  const handleEnd = async () => {
    const sessionId = session?.id || session?._id;
    try {
      await sessionAPI.finish(sessionId);
    } catch {
      // ignore
    }
    localStorage.removeItem('session');
    navigate('/leaderboard', { state: { timeUp: true } });
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
          <div className="flex items-center gap-2 w-full justify-between">
            <p className="text-sm" style={{ color: 'var(--color-primary)' }}>Time left</p>
            <button
              onClick={handleTimeUp}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
            >
              <Timer size={12} /> Test: Time Up
            </button>
          </div>
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

        {/* Live Ranking by checkpoint */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              Live Ranking
            </span>
            <span className="ml-auto text-xs" style={{ color: 'var(--color-subtext)' }}>
              by checkpoint
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-subtext)' }}>
              No players yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {[...players]
                .sort((a, b) => {
                  const ca = a.checkpointsCompleted ?? 0;
                  const cb = b.checkpointsCompleted ?? 0;
                  if (cb !== ca) return cb - ca;
                  // tie-break: who finished their last checkpoint earlier
                  return (a.lastCheckpointAt ? new Date(a.lastCheckpointAt) : Infinity)
                       - (b.lastCheckpointAt ? new Date(b.lastCheckpointAt) : Infinity);
                })
                .map((p, i) => {
                  const cp = p.checkpointsCompleted ?? 0;
                  const total = 6;
                  const done = p.status === 'finished';
                  const out  = p.status === 'eliminated';
                  return (
                    <div key={p._id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: done ? '#F0FDF4' : out ? '#FEF2F2' : '#FEF9F5' }}>
                      {/* Rank */}
                      <span className="text-sm font-black w-5 text-center"
                        style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#6B7280' : i === 2 ? '#CD7C2F' : 'var(--color-subtext)' }}>
                        {i + 1}
                      </span>
                      {/* Avatar */}
                      <img src={p.userId?.avatar || '/avatar/avatar1.png'}
                        alt={p.userId?.username}
                        className="w-8 h-8 rounded-full object-cover shrink-0" />
                      {/* Name + checkpoint dots */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate"
                          style={{ color: 'var(--color-text)' }}>
                          {p.userId?.username}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: total }).map((_, di) => (
                            <div key={di}
                              className="rounded-full"
                              style={{
                                width: 8, height: 8,
                                backgroundColor: di < cp
                                  ? (done ? 'var(--color-green)' : 'var(--color-primary)')
                                  : '#E5E7EB',
                              }} />
                          ))}
                        </div>
                      </div>
                      {/* Status + cp count */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold" style={{ color: statusColor(p.status) }}>
                          {statusLabel(p.status)}
                        </span>
                        <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
                          {cp}/{total}
                        </p>
                      </div>
                    </div>
                  );
                })}
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

        {/* End game */}
        <Button variant="red" onClick={() => setShowEndPopup(true)}>
          <X size={16} /> End game
        </Button>

      </div>

      {/* Time up popup */}
      <Popup open={showTimeUpPopup} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="text-5xl">⏰</span>
          <h3 className="text-xl font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Time's up!
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            Redirecting to leaderboard in
          </p>
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-2xl font-black"
            style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}>
            {timeUpCountdown}
          </div>
        </div>
      </Popup>

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
