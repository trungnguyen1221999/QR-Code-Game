import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Play, X } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';

const MOCK_PLAYERS = [
  { id: 1, name: 'Shun',  emoji: '🐻' },
  { id: 2, name: 'Trung', emoji: '🐼' },
  { id: 3, name: 'Yan',   emoji: '🦊' },
];

const GAME_CODE = 'HYE7654';
const HOST_NAME = 'Elsa';

export default function HostDashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(GAME_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>Waiting Room</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-subtext)' }}>
              Waiting for players to join...
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#FEF3E2' }}>
            <Users size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              {MOCK_PLAYERS.length}
            </span>
          </div>
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
            {GAME_CODE}
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
                Players ({MOCK_PLAYERS.length})
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              Host : <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{HOST_NAME}</span>
            </span>
          </div>

          <div className="flex flex-col divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
            {MOCK_PLAYERS.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5"
                style={{ backgroundColor: '#FEF9F5' }}>
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
                  {p.name}
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

        {/* Actions */}
        <Button variant="green" onClick={() => navigate('/host-game')}>
          <Play size={16} /> Start game
        </Button>
        <Button variant="red" onClick={() => setShowExitPopup(true)}>
          <X size={16} /> Exit game
        </Button>

      </div>

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
            <Button variant="green" onClick={() => navigate('/')}>Confirm</Button>
            <Button variant="red" onClick={() => setShowExitPopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
