import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';

const MOCK_PLAYERS = [
  { rank: 1, name: 'Shun',    avatar: '/avatar/avatar1.png', score: 2000 },
  { rank: 2, name: 'Trung',   avatar: '/avatar/avatar2.png', score: 1800 },
  { rank: 3, name: 'Yan',     avatar: '/avatar/avatar3.png', score: 1750 },
  { rank: 4, name: 'Helen',   avatar: '/avatar/avatar4.png', score: 1510 },
  { rank: 5, name: 'Stev',    avatar: '/avatar/avatar1.png', score: 1510 },
  { rank: 6, name: 'Micheal', avatar: '/avatar/avatar2.png', score: 1501 },
  { rank: 7, name: 'Mar',     avatar: '/avatar/avatar3.png', score: 0    },
  { rank: 8, name: 'Kaung',   avatar: '/avatar/avatar4.png', score: 0    },
];

const STAR_COLORS = {
  1: '#FBBF24', // gold
  2: '#9CA3AF', // silver
  3: '#EF4444', // bronze-red
};

function RankCell({ rank }) {
  if (rank <= 3) {
    return (
      <span className="text-lg" style={{ color: STAR_COLORS[rank] }}>★</span>
    );
  }
  return <span className="text-sm font-semibold text-white">{rank}</span>;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeUp = location.state?.timeUp ?? false;

  return (
    <PageLayout back={timeUp ? undefined : -1}>
      <div className="pt-6 flex flex-col gap-4 pb-4">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
              {timeUp ? 'Final Leaderboard' : 'Leaderboard in progress...'}
            </h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Current ranking of players who has completed the game. Rank can be changed when total playing time is end!
          </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#4AADE8' }}>
          {/* Table header */}
          <div className="flex items-center px-4 py-2.5">
            <span className="w-10 text-xs font-bold text-white">Rank</span>
            <span className="flex-1 text-xs font-bold text-white">Name</span>
            <span className="text-xs font-bold text-white">Score</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-1 px-2 pb-3">
            {MOCK_PLAYERS.map((p) => {
              const isZero = p.score === 0;
              return (
                <div
                  key={p.rank}
                  className="flex items-center px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: isZero ? '#FEF9F5' : 'rgba(255,255,255,0.15)' }}
                >
                  <div className="w-10 flex items-center justify-center">
                    <RankCell rank={p.rank} />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-semibold"
                      style={{ color: isZero ? 'var(--color-text)' : 'white' }}>
                      {p.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold"
                    style={{ color: isZero ? 'var(--color-subtext)' : 'white' }}>
                    {p.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {timeUp && <Button onClick={() => navigate('/')}>Done</Button>}

      </div>
    </PageLayout>
  );
}
