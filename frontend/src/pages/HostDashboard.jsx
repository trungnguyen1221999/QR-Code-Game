import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Play, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { sessionAPI } from '../utils/api';

export default function HostDashboard({ onLogout }) {
  const navigate = useNavigate();
  const host = JSON.parse(localStorage.getItem('host') || 'null');
  const session = JSON.parse(localStorage.getItem('session') || 'null');

  const [copied, setCopied] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [players, setPlayers] = useState([]);
  const [starting, setStarting] = useState(false);

  const sessionId = session?.id || session?._id;

  // Poll players every 2s
  useEffect(() => {
    if (!sessionId) return;

    const fetchPlayers = async () => {
      try {
        const data = await sessionAPI.getPlayers(sessionId);
        setPlayers(Array.isArray(data) ? data : []);
      } catch {
        // silently ignore polling errors
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleLogout = () => {
    onLogout?.();
    toast.success('Logged out');
    navigate('/host-login');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(session?.code ?? '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const updated = await sessionAPI.start(sessionId);
      localStorage.setItem('session', JSON.stringify(updated));
      navigate('/host-game', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setStarting(false);
    }
  };

  const handleExit = async () => {
    try {
      await sessionAPI.finish(sessionId);
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
            <button
              onClick={handleLogout}
              className="p-2 rounded-full"
              style={{ backgroundColor: '#FEE2E2' }}
              title="Logout"
            >
              <LogOut size={16} style={{ color: 'var(--color-red)' }} />
            </button>
          </div>
        </div>

        {/* Waiting room title */}
        <div>
          <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
            {session?.name || 'Waiting Room'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-subtext)' }}>
            Waiting for players to join...
          </p>
        </div>

        {/* Game code */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-2"
          style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>Game code</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-3xl font-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            {session?.code || '------'}
            {copied
              ? <Check size={20} style={{ color: 'var(--color-green)' }} />
              : <Copy size={20} style={{ color: 'var(--color-primary)' }} />
            }
          </button>
          <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
            Share this code with other players.
          </p>
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
              No players yet. Share the code!
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
              {players.map(p => (
                <div key={p._id} className="flex items-center gap-3 px-3 py-2.5"
                  style={{ backgroundColor: '#FEF9F5' }}>
                  <img
                    src={p.userId?.avatar || '/avatar/avatar1.png'}
                    alt={p.userId?.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
                    {p.userId?.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Game settings */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Game Settings:</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>• {session?.gameOrder?.length || 6} QR Checkpoints to discover</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
            • Total play time is {session?.totalTime || 30} minutes.
          </p>
        </div>

        {/* Actions */}
        <Button variant="green" onClick={() => setShowStartPopup(true)}>
          <Play size={16} /> Start game
        </Button>
        <Button variant="red" onClick={() => setShowExitPopup(true)}>
          <X size={16} /> Exit game
        </Button>

      </div>

      {/* Start game confirmation popup */}
      <Popup open={showStartPopup} onClose={() => setShowStartPopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#DCFCE7' }}>
            <Play size={28} style={{ color: 'var(--color-green)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Start game now?
          </h3>
          <div className="w-full rounded-xl p-3 flex flex-col gap-1" style={{ backgroundColor: 'var(--color-info-bg)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-subtext)' }}>Players joined</span>
              <span className="font-bold" style={{ color: 'var(--color-text)' }}>{players.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-subtext)' }}>Game time</span>
              <span className="font-bold" style={{ color: 'var(--color-text)' }}>{session?.totalTime || 30} minutes</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" disabled={starting} onClick={handleStart}>
              {starting ? 'Starting...' : 'Confirm'}
            </Button>
            <Button variant="red" onClick={() => setShowStartPopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

      {/* Exit confirmation popup */}
      <Popup open={showExitPopup} onClose={() => setShowExitPopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}>
            <X size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Are you sure to end game?
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" onClick={handleExit}>Confirm</Button>
            <Button variant="red" onClick={() => setShowExitPopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
