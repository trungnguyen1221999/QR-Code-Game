import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Hash } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function JoinGame({ onJoin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', gameCode: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.gameCode.trim()) return;
    onJoin({ username: form.username });
    navigate('/waiting-room');
  };

  return (
    <PageLayout back="/">
      <div className="pt-4 pb-8">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Join game</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
                Enter the game code provided by the host
              </p>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full flex items-center justify-center border-2 text-2xl"
                style={{ backgroundColor: '#FEF3E2', borderColor: '#F5E1C8' }}>
                🐾
              </div>
            </div>

            <Input
              label="Your name"
              icon={<User size={14} />}
              placeholder="Enter your name"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />

            <Input
              label="Game code"
              icon={<Hash size={14} />}
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={form.gameCode}
              onChange={e => setForm({ ...form, gameCode: e.target.value })}
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

            <Button type="submit" variant="green">Join</Button>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
