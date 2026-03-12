import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Clock } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function HostSetup() {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState('');
  const [time, setTime] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/host-dashboard');
  };

  return (
    <PageLayout back="/host-login">
      <div className="pt-4 pb-8">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
                '1 Final game (Fruit Slicer)',
                'Time-based coin system',
              ].map(item => (
                <p key={item} className="text-sm" style={{ color: 'var(--color-subtext)' }}>• {item}</p>
              ))}
            </div>

            <Button type="submit">Create game</Button>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
