import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { playerAPI } from '../utils/api';

const DEFAULT_AVATAR = '/avatar/avatar1.png';

export default function JoinGame({ onJoin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const existingPlayer = JSON.parse(localStorage.getItem('player') || 'null');
  const [form, setForm] = useState({ username: existingPlayer?.username || '', gameCode: '' });
  const [loading, setLoading] = useState(false);
  const avatar = existingPlayer?.avatar || location.state?.avatar || DEFAULT_AVATAR;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) { toast.error('Please enter your name'); return; }
    if (!form.gameCode.trim()) { toast.error('Please enter the game code'); return; }

    setLoading(true);
    try {
      const data = await playerAPI.join({
        username: form.username.trim(),
        code: form.gameCode.trim(),
        avatar,
      });
      localStorage.setItem('player', JSON.stringify(data.user));
      localStorage.setItem('playerSession', JSON.stringify(data.playerSession));
      localStorage.setItem('session', JSON.stringify(data.session));
      localStorage.removeItem('playerGameProgress');
      localStorage.removeItem('playerGamePowerups');
      onJoin?.(data.user);
      navigate(`/${data.redirect || 'waiting-room'}`);
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {existingPlayer ? (
              <p className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                👋 Hello, {existingPlayer.username}!
              </p>
            ) : (
              /* Guest — pick avatar + enter name */
              <>
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/select-avatar', { state: { current: avatar } })}
                    className="relative"
                  >
                    <img
                      src={avatar}
                      alt="Your avatar"
                      className="rounded-full object-cover"
                      style={{ width: 80, height: 80, border: '3px solid var(--color-primary)' }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/select-avatar', { state: { current: avatar } })}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-primary)' }}
                  >
                    Change avatar
                  </button>
                </div>
                <Input
                  label="Your name"
                  icon={<User size={14} />}
                  placeholder="Enter your name"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
              </>
            )}

            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Join game</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
                Enter the game code provided by the host
              </p>
            </div>

            <Input
              label="Game code"
              icon={<Hash size={14} />}
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={form.gameCode}
              onChange={e => setForm({ ...form, gameCode: e.target.value.toUpperCase() })}
            />

            {/* What to Expect */}
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-info-bg)' }}>
              <p className="font-bold text-sm mb-2" style={{ color: 'var(--color-text)' }}>What to Expect:</p>
              <ul className="text-xs space-y-1 list-disc list-inside" style={{ color: 'var(--color-subtext)' }}>
                <li>Wait in the lobby until the host starts</li>
                <li>Complete 6 checkpoints of exciting challenges</li>
                <li>Compete against other players</li>
                <li>Earn coins and buy power-ups</li>
                <li>Aim for the top of the leaderboard!</li>
              </ul>
            </div>

            <Button type="submit" variant="green" disabled={loading}>
              {loading ? 'Joining...' : 'Join'}
            </Button>
                {/* Signup GIF */}
            <div className="flex justify-center">
              <img src="/join.gif" alt="Sign Up" style={{ height: '180px', objectFit: 'contain' }} />
            </div>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
