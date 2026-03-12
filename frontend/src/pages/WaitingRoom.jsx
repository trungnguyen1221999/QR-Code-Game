import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';

const MOCK_PLAYERS = [
  { id: 1, name: 'Shun',  emoji: '🐻' },
  { id: 2, name: 'Trung', emoji: '🐼' },
  { id: 3, name: 'Yan',   emoji: '🦊' },
  { id: 4, name: 'Helen', emoji: '🐺' },
  { id: 5, name: 'Stev',  emoji: '🐯' },
];

const DOT_COLORS = ['#F97316','#FB923C','#FCD34D','#EF4444','#F97316','#FB923C','#FCD34D','#EF4444','#F97316','#FB923C'];

function Spinner() {
  return (
    <div className="flex justify-center my-5">
      <style>{`@keyframes spin-ring { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
      <div className="relative h-14 w-14" style={{ animation: 'spin-ring 1.2s linear infinite' }}>
        {DOT_COLORS.map((color, i) => {
          const rad = (i / DOT_COLORS.length) * 2 * Math.PI;
          const x = 50 + 38 * Math.sin(rad);
          const y = 50 - 38 * Math.cos(rad);
          return (
            <div key={i} className="absolute rounded-full" style={{
              width: 6, height: 6,
              left: `${x}%`, top: `${y}%`,
              transform: 'translate(-50%,-50%)',
              backgroundColor: color,
              opacity: 0.2 + (i / DOT_COLORS.length) * 0.8,
            }} />
          );
        })}
      </div>
    </div>
  );
}

export default function WaitingRoom() {
  const navigate = useNavigate();
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setApproved(true);
      setTimeout(() => navigate('/game'), 1000);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageLayout>
      <div className="pt-6">
        <Card>

          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Waiting host ...</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Waiting the host to start the game
          </p>

          <Spinner />

          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>Players</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            {MOCK_PLAYERS.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div className="h-14 w-14 rounded-full flex items-center justify-center border-2 text-2xl"
                  style={{ backgroundColor: '#FEF3E2', borderColor: '#F5E1C8' }}>
                  {p.emoji}
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          {approved && (
            <div className="flex justify-end mb-3">
              <div className="text-xs font-semibold px-3 py-2 rounded-lg text-center leading-tight"
                style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                Host<br />approved ✓
              </div>
            </div>
          )}

          <Button variant="red" onClick={() => setShowLeavePopup(true)}>
            <X size={16} /> Leave game
          </Button>

        </Card>
      </div>

      <Popup open={showLeavePopup} onClose={() => setShowLeavePopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}>
            <LogOut size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Are you sure to leave the game?
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" onClick={() => navigate('/')}>Confirm</Button>
            <Button variant="red" onClick={() => setShowLeavePopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
