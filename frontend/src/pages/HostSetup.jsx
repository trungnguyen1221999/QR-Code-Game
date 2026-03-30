import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Clock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { sessionAPI } from '../utils/api';

export default function HostSetup({ onLogout }) {
  const navigate = useNavigate();
  const host = JSON.parse(localStorage.getItem('host'));
  const [gameName, setGameName] = useState('');
  const [time, setTime] = useState(30);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    onLogout?.();
    toast.success('Logged out');
    navigate('/host-login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast.error('Please enter a game name');
      return;
    }
    if (!host) {
      toast.error('Not logged in');
      navigate('/host-login');
      return;
    }
    setLoading(true);
    try {
      const session = await sessionAPI.create({
        hostId: host._id,
        name: gameName.trim(),
        totalTime: time,
        difficulty,
      });
      localStorage.setItem('session', JSON.stringify(session));
      navigate('/host-dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout back="/">
      <div className="pt-4 pb-8">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Host greeting + logout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Logged in as Host</p>
                <p className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                  👋 Hello, {host?.name || host?.username}!
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>Host game setup</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
                Configure your game settings and get ready to start.
              </p>
            </div>

            {/* Game name */}
            <Input
              label="Game name"
              icon={<Gamepad2 size={14} />}
              placeholder="Enter game name"
              value={gameName}
              onChange={e => setGameName(e.target.value)}
            />

            {/* Total game time slider */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                Total game time : <span className="font-bold ml-1">{time} minutes</span>
              </label>
              <input
                type="range"
                min={15}
                max={120}
                step={5}
                value={time}
                onChange={e => setTime(Number(e.target.value))}
                className="w-full accent-orange-600"
              />
              <div className="flex justify-between text-xs" style={{ color: 'var(--color-subtext)' }}>
                <span>15 mins</span>
                <span>120 mins</span>
              </div>
            </div>

            {/* Game structure info */}
            <div className="rounded-xl p-4 flex flex-col gap-1" style={{ backgroundColor: 'var(--color-info-bg)' }}>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-text)' }}>Game Structure:</p>
              {[
                '6 QR Checkpoints to discover',
                '3 Mini games',
                '3 Quiz',
                '1 Final game',
              ].map(item => (
                <p key={item} className="text-sm" style={{ color: 'var(--color-subtext)' }}>• {item}</p>
              ))}
            </div>

            {/* Game Level */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                🎯 Game Level
              </label>
              {[
                { value: 'easy',   label: 'Easy',   desc: 'Unlimited lives 🌈 — players never lose progress. Perfect for a fun, stress-free adventure!', emoji: '🧸' },
                { value: 'normal', label: 'Normal', desc: 'Start with 5 lives 💛 — if all lives are lost, restart from checkpoint 1. Mini-games have lower goals and more forgiving time limits.', emoji: '🐼' },
                { value: 'hard',   label: 'Hard',   desc: 'Start with 3 lives 🔥 — if all lives are lost, restart from checkpoint 1. Mini-games are stricter and time moves faster. For the bravest capybaras only!', emoji: '🐻' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className="flex items-start gap-3 rounded-xl p-3 text-left transition-all"
                  style={{
                    border: difficulty === opt.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                    backgroundColor: difficulty === opt.value ? 'var(--color-info-bg)' : 'transparent',
                  }}
                >
                  <div className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ border: '2px solid var(--color-primary)', backgroundColor: difficulty === opt.value ? 'var(--color-primary)' : 'transparent' }}>
                    {difficulty === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{opt.emoji} {opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create game'}</Button>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
