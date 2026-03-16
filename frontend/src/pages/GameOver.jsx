import { useNavigate } from 'react-router-dom';

const MOCK_RANK = 9;
const MOCK_TOTAL = 12;
const GAME_DURATION = '30 min';

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

const STAR_COLORS = { 1: '#FBBF24', 2: '#6366F1', 3: '#EF4444' };

function RankBadge({ rank }) {
  if (rank <= 3) return <span className="text-xl" style={{ color: STAR_COLORS[rank] }}>★</span>;
  return <span className="text-sm font-bold" style={{ color: 'white' }}>{rank}</span>;
}

export default function GameOver() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center relative" style={{
      backgroundImage: 'url(/forest2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(240, 255, 230, 0.1)' }} />
      <div className="w-full max-w-sm flex flex-col pb-24 relative z-10">

        {/* Top section */}
        <div className="flex flex-col items-center gap-2 pt-8 pb-5 px-5">
          <span className="text-6xl">🏆</span>
          <div className="flex gap-1 text-2xl">⭐⭐⭐</div>
          <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>Game is ended.</h2>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>You are in #{MOCK_RANK} place</p>
        </div>

        {/* Rank card */}
        <div className="mx-5 rounded-2xl p-5 mb-5" style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-xs text-center mb-1" style={{ color: 'var(--color-subtext)' }}>Your rank</p>
          <p className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--color-primary)' }}>
            #{MOCK_RANK}
          </p>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Total players</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{MOCK_TOTAL}</p>
            </div>
            <div className="w-px" style={{ backgroundColor: '#E8C99A' }} />
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Game durations</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{GAME_DURATION}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="px-5">
          <p className="text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>Final leaderboard</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#4AADE8' }}>
            {/* Header */}
            <div className="flex items-center px-4 py-2.5 gap-2">
              <span className="w-10 text-xs font-bold text-white">Rank</span>
              <span className="flex-1 text-xs font-bold text-white">Name</span>
              <span className="text-xs font-bold text-white">Score</span>
            </div>
            {/* Rows */}
            <div className="flex flex-col gap-1 px-2 pb-3">
              {MOCK_PLAYERS.map(p => {
                const isZero = p.score === 0;
                return (
                  <div key={p.rank}
                    className="flex items-center px-3 py-2 rounded-xl gap-2"
                    style={{ backgroundColor: isZero ? '#FEF9F5' : 'rgba(255,255,255,0.18)' }}>
                    <div className="w-10 flex items-center justify-center">
                      <RankBadge rank={p.rank} />
                    </div>
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1 text-sm font-semibold"
                      style={{ color: isZero ? 'var(--color-text)' : 'white' }}>
                      {p.name}
                    </span>
                    <span className="text-sm font-bold"
                      style={{ color: isZero ? '#EF4444' : 'white' }}>
                      {p.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Fixed Done button */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-3 z-20"
        style={{ backgroundColor: 'rgba(242, 249, 236, 0.92)', backdropFilter: 'blur(8px)' }}>
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-2xl text-white font-bold text-base cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
