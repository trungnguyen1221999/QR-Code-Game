import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gamepad2, LayoutGrid, LogOut, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function LandingPage({ onLogout }) {
  const navigate = useNavigate();
  const host = JSON.parse(localStorage.getItem('host') || 'null');
  const [playerSession] = useState(() => JSON.parse(localStorage.getItem('playerSession') || 'null'));
  const [player] = useState(() => JSON.parse(localStorage.getItem('player') || 'null'));
  const [inGame, setInGame] = useState(!!playerSession);

  const handleLogout = () => {
    onLogout?.();
    toast.success('Logged out');
  };

  const handleExitGame = () => {
    localStorage.removeItem('player');
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
        <h1 className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>Capy Quest</h1>
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
        <Card style={{ border: '2px solid var(--color-border)' }}>
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
        <Card style={{ border: '2px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <Gamepad2 size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg" style={{ color: 'var(--color-text)' }}>Join game</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Enter a game code and join your friends.
          </p>
          <Button onClick={() => navigate('/join')}>Join game</Button>
        </Card>

        {/* How to play */}
        <Card style={{ border: '2px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-5">
            <LayoutGrid size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg" style={{ color: 'var(--color-text)' }}>How to play?</h2>
          </div>
          <div className="flex flex-col gap-5">
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
        </Card>

      </div>
    </PageLayout>
  );
}
