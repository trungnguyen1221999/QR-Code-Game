import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

const TOTAL_SECONDS = 10 * 60; // 10 min

const MOCK_PLAYERS = [
  { rank: 1, name: 'Shun',  avatar: '/avatar/avatar1.png', score: 2000 },
  { rank: 2, name: 'Trung', avatar: '/avatar/avatar2.png', score: 1800 },
  { rank: 3, name: 'Yan',   avatar: '/avatar/avatar3.png', score: 1750 },
  { rank: 4, name: 'Helen', avatar: '/avatar/avatar4.png', score: 1510 },
];

const STAR_COLORS = { 1: '#FBBF24', 2: '#6366F1', 3: '#EF4444' };

function RankBadge({ rank }) {
  if (rank <= 3) return <span className="text-xl" style={{ color: STAR_COLORS[rank] }}>★</span>;
  return <span className="text-sm font-bold text-white">{rank}</span>;
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function LiveLeaderboard() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (timeLeft <= 0) { navigate('/champion'); return; }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  return (
    <div className="min-h-screen flex justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm flex flex-col px-5 pt-8 pb-12 gap-5">

        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Leaderboard in progress...
          </h2>
        </div>

        {/* Gears animation */}
        <div className="flex justify-center">
          <style>{`
            @keyframes spin-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
            @keyframes spin-ccw { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
            .gear-cw  { animation: spin-cw  2s linear infinite; display:inline-block; }
            .gear-ccw { animation: spin-ccw 2s linear infinite; display:inline-block; }
          `}</style>
          <span className="gear-cw  text-5xl" style={{ color: 'var(--color-primary)' }}>⚙️</span>
          <span className="gear-ccw text-3xl -ml-2 mt-4" style={{ color: 'var(--color-primary)' }}>⚙️</span>
        </div>

        {/* Timer */}
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Time left :{' '}
          <span className="font-bold" style={{ color: '#EF4444' }}>{formatTime(timeLeft)}</span>
        </p>

        {/* Leaderboard table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#4AADE8' }}>
          <div className="flex items-center px-4 py-2.5 gap-2">
            <span className="w-12 text-xs font-bold text-white">Rank</span>
            <span className="flex-1 text-xs font-bold text-white">Name</span>
            <span className="text-xs font-bold text-white">Score</span>
          </div>
          <div className="flex flex-col gap-1 px-2 pb-3">
            {MOCK_PLAYERS.map(p => (
              <div key={p.rank}
                className="flex items-center px-3 py-2 rounded-xl gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <div className="w-10 flex items-center justify-center">
                  <RankBadge rank={p.rank} />
                </div>
                <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="flex-1 text-sm font-semibold text-white">{p.name}</span>
                <span className="text-sm font-bold text-white">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note box */}
        <div className="rounded-xl p-4 flex gap-3"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <Info size={16} style={{ color: '#3B82F6', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>Note</p>
            <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
              Current ranking of players who has completed the game. Rank can be changed when total playing time is end!
            </p>
          </div>
        </div>

        {/* If time up button (test) */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/champion')}
            className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: '#E5E7EB', color: 'var(--color-text)' }}>
            if time up
          </button>
        </div>

      </div>
    </div>
  );
}
