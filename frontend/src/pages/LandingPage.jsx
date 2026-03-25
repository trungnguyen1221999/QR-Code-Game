import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gamepad2, LayoutGrid, LogOut, RotateCcw, X, ChevronDown, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import { sessionAPI, userAPI } from '../utils/api';
import Card from '../components/ui/Card';


const PODIUM = {
  1: { h: 68, size: 60, badge: '🥇', color: '#F59E0B', ring: '#FCD34D' },
  2: { h: 48, size: 52, badge: '🥈', color: '#6B7280', ring: '#9CA3AF' },
  3: { h: 36, size: 48, badge: '🥉', color: '#CD7C2F', ring: '#D97706' },
};

export default function LandingPage({ onLogout }) {
  const navigate = useNavigate();
  const host = JSON.parse(localStorage.getItem('host') || 'null');
  const [playerSession] = useState(() => JSON.parse(localStorage.getItem('playerSession') || 'null'));
  const [player] = useState(() => JSON.parse(localStorage.getItem('player') || 'null'));
  const [inGame, setInGame] = useState(!!playerSession);
  const [howToOpen, setHowToOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    userAPI.leaderboard().then(data => {
      const lb = data.map((u, i) => ({
        rank: i + 1,
        name: u.name || u.username,
        avatar: u.avatar || `/avatar/avatar${(i % 4) + 1}.png`,
        score: u.totalScore ?? 0,
        checkpoint: u.currentCheckpointIndex ?? 0,
      }));
      setLeaderboard(lb);
    }).catch(() => {});
  }, []);

  // Hide rejoin banner if host already ended the game
  useEffect(() => {
    if (!playerSession) return;
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const sessionId = session?.id || session?._id;
    if (!sessionId) return;
    sessionAPI.getById(sessionId).then(data => {
      const expired = data.expiresAt && new Date() > new Date(data.expiresAt);
      if (data.status === 'finished' || data.status === 'waiting' || expired) {
        localStorage.removeItem('playerSession');
        localStorage.removeItem('session');
        setInGame(false);
      }
    }).catch(() => {
      // Can't reach server or session not found → clear banner
      localStorage.removeItem('playerSession');
      localStorage.removeItem('session');
      setInGame(false);
    });
  }, []);

  const handleLogout = () => {
    onLogout?.();
    toast.success('Logged out');
  };

  const handleExitGame = () => {
    localStorage.removeItem('playerSession');
    localStorage.removeItem('session');
    setInGame(false);
  };

  return (
    <PageLayout>
      {/* Host greeting bar (if logged in) */}
      {host && (
        <div className="flex items-center justify-between pt-4 pb-1">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Logged in as Host</p>
            <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              👋 Hello, {host.name || host.username}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}

      {/* Mascot + Title */}
      <div className="flex flex-col items-center gap-2 pt-2 pb-6">
        <img src="/capy.gif" alt="Capybara mascot" style={{ height: '100px', objectFit: 'contain' }} />
        <h1 className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>The prophecy of Mystery X</h1>
        <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>Find QR codes. Play games. Win!</p>
      </div>

      <div className="flex flex-col gap-5">

        {/* Rejoin banner (if player has an active session) */}
        {inGame && player && (
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ backgroundColor: '#F0FDF4', border: '2px solid #86EFAC' }}>
            <div className="flex items-center gap-2.5">
              <img
                src={player.avatar || '/avatar/avatar1.png'}
                alt={player.username}
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: '2px solid var(--color-green)' }}
              />
              <div>
                <p className="font-bold text-sm" style={{ color: '#15803D' }}>
                  👋 Welcome back, {player.username}!
                </p>
                <p className="text-xs" style={{ color: '#16A34A' }}>You have an ongoing game.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/game')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                <RotateCcw size={14} /> Continue game
              </button>
              <button
                onClick={handleExitGame}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
              >
                <X size={14} /> Exit
              </button>
            </div>
          </div>
        )}

        {/* Host game */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <User size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg" style={{ color: 'var(--color-text)' }}>Host game</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Create a new game and invite players to join.
          </p>
          <Button onClick={() => navigate(host ? '/host-setup' : '/host-login')}>Create game</Button>
        </Card>

        {/* Join game */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Gamepad2 size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg" style={{ color: 'var(--color-text)' }}>Join game</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Enter a game code and join your friends.
          </p>
          <Button onClick={() => navigate('/join')}>Join game</Button>
        </Card>

        {/* All Time Ranking */}
        <Card>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg" style={{ color: 'var(--color-text)' }}>All Time Ranking</h2>
          </div>

          {/* Podium top 3 */}
          <div className="flex items-end gap-1.5">
            {[2, 1, 3].map(rank => {
              const p = leaderboard.find(x => x.rank === rank);
              const cfg = PODIUM[rank];
              if (!p) return null;
              return (
                <div key={rank} className="flex-1 flex flex-col items-center">
                  <div className="relative mb-1">
                    <img src={p.avatar} alt={p.name}
                      style={{ width: cfg.size, height: cfg.size, borderRadius: '50%', objectFit: 'cover',
                        border: `3px solid ${cfg.ring}`, boxShadow: `0 0 0 2px white` }} />
                    <span className="absolute -bottom-1 -right-1" style={{ fontSize: 16 }}>{cfg.badge}</span>
                  </div>
                  <p className="text-xs font-bold text-center mb-1 leading-tight"
                    style={{ color: 'var(--color-text)', maxWidth: 68 }}>{p.name}</p>
                  <div className="px-2 py-0.5 rounded-full mb-2 text-xs font-bold text-white"
                    style={{ backgroundColor: cfg.color }}>
                    {p.score > 0 ? p.score : p.checkpoint > 0 ? `CP${p.checkpoint}` : 0}
                  </div>
                  <div className="w-full rounded-t-xl flex items-center justify-center"
                    style={{ height: cfg.h, background: `linear-gradient(180deg, ${cfg.ring}BB 0%, ${cfg.color}99 100%)`,
                      borderTop: `3px solid ${cfg.ring}` }}>
                    <span className="text-xl font-black text-white">{rank}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expand button */}
          <button onClick={() => setLbOpen(v => !v)}
            className="w-full flex items-center justify-center gap-1 mt-3 font-semibold text-xs text-primary"
    >
            {lbOpen ? 'Show less' : 'Show all'}
            <ChevronDown size={14} style={{
              transform: lbOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }} />
          </button>

          {/* Rest of players */}
          <div style={{
            maxHeight: lbOpen ? '400px' : '0px',
            overflow: 'hidden',
            opacity: lbOpen ? 1 : 0,
            transition: 'max-height 0.35s ease, opacity 0.25s ease',
          }}>
            <div className="flex flex-col gap-1 mt-3">
              {leaderboard.filter(p => p.rank > 3).map(p => (
                <div key={p.rank} className="flex items-center gap-3 px-2 py-2 rounded-xl"
                  style={{ backgroundColor: '#F9F5F0' }}>
                  <span className="w-6 text-center text-sm font-bold"
                    style={{ color: 'var(--color-subtext)' }}>{p.rank}</span>
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{p.name}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    {p.score > 0 ? p.score : p.checkpoint > 0 ? `CP${p.checkpoint}` : 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* How to play */}
        <Card>
          <button
            onClick={() => setHowToOpen(v => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid size={22} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-lg" style={{ color: 'var(--color-text)' }}>How to play?</h2>
            </div>
            <ChevronDown size={18} style={{
              color: 'var(--color-subtext)',
              transform: howToOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }} />
          </button>
          <div style={{
            maxHeight: howToOpen ? '400px' : '0px',
            overflow: 'hidden',
            opacity: howToOpen ? 1 : 0,
            transition: 'max-height 0.35s ease, opacity 0.25s ease',
          }}>
            <div className="flex flex-col gap-5 mt-5">
              {[
                { num: 1, color: 'var(--color-orange)', title: 'Scan QR Checkpoints', desc: 'Find and scan 6 QR codes at different locations.' },
                { num: 2, color: 'var(--color-green)',  title: 'Complete Mini Games',  desc: 'Play 5 unique mini games and earn scores.' },
                { num: 3, color: 'var(--color-blue)',   title: 'Shop for Power-ups',   desc: 'Use your scores to buy hints, time boosts, and more.' },
              ].map(({ num, color, title, desc }) => (
                <div key={num} className="flex items-start gap-4">
                  <span className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: color }}>
                    {num}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </PageLayout>
  );
}
