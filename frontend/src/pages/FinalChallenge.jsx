import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';

export default function FinalChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const powerUps = location.state?.powerUps ?? [];

  const [playing, setPlaying] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  const handleStart = () => {
    setPlaying(true);
    // Mock: after 3s show victory popup
    setTimeout(() => {
      setPlaying(false);
      setShowVictory(true);
    }, 3000);
  };

  return (
    <PageLayout back={-1}>
      <div className="pt-6 flex flex-col gap-5 pb-4">

        {/* Card */}
        <div className="rounded-2xl p-6 flex flex-col items-center gap-4 bg-white">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Final Challenge</h2>

          <span className="text-6xl">⚔️</span>

          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Slice the fruits, avoid the bombs!
          </p>

          {powerUps.length > 0 && (
            <div className="w-full">
              <p className="text-sm font-bold text-center mb-2" style={{ color: 'var(--color-red)' }}>
                Your Power-Ups:
              </p>
              <div className="flex flex-col items-center gap-1">
                {powerUps.map(p => (
                  <p key={p.id} className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {p.emoji} {p.label}
                  </p>
                ))}
              </div>
            </div>
          )}

          {powerUps.length === 0 && (
            <p className="text-xs text-center" style={{ color: 'var(--color-subtext)' }}>
              No power-ups purchased
            </p>
          )}
        </div>

        <Button variant="green" onClick={handleStart} disabled={playing}>
          ▶ {playing ? 'Playing...' : 'Start game'}
        </Button>

      </div>

      {/* Victory popup */}
      <Popup open={showVictory} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="text-5xl">🏆</div>
          <div className="flex gap-1 text-xl">⭐⭐⭐</div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Victory!{'\n'}Final game passed!
          </h3>
          <Button onClick={() => navigate('/live-leaderboard')}>Got it</Button>
        </div>
      </Popup>

    </PageLayout>
  );
}
