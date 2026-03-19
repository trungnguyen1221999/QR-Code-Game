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

// Podium order: 2nd (left), 1st (center, tallest), 3rd (right)
const PODIUM_ORDER = [2, 1, 3];

const PODIUM_CONFIG = {
  1: { podiumH: 72, avatarSize: 64, badge: '🥇', color: '#F59E0B', ringColor: '#FCD34D', label: '1st' },
  2: { podiumH: 52, avatarSize: 54, badge: '🥈', color: '#6B7280', ringColor: '#9CA3AF', label: '2nd' },
  3: { podiumH: 40, avatarSize: 50, badge: '🥉', color: '#CD7C2F', ringColor: '#D97706', label: '3rd' },
};

function PodiumSlot({ player, config }) {
  if (!player) return <div className="flex-1" />;
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Avatar */}
      <div className="relative mb-1">
        <img
          src={player.avatar}
          alt={player.name}
          style={{
            width: config.avatarSize,
            height: config.avatarSize,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `3px solid ${config.ringColor}`,
            boxShadow: `0 0 0 2px white, 0 4px 12px rgba(0,0,0,0.15)`,
          }}
        />
        <span
          className="absolute -bottom-1 -right-1 text-base leading-none"
          style={{ fontSize: 18 }}
        >
          {config.badge}
        </span>
      </div>

      {/* Name */}
      <p className="text-xs font-bold text-center mb-1.5 leading-tight"
        style={{ color: 'var(--color-text)', maxWidth: 72 }}>
        {player.name}
      </p>

      {/* Score pill */}
      <div className="px-2.5 py-0.5 rounded-full mb-2 text-xs font-bold text-white"
        style={{ backgroundColor: config.color }}>
        {player.score}
      </div>

      {/* Podium block */}
      <div
        className="w-full rounded-t-xl flex items-center justify-center"
        style={{
          height: config.podiumH,
          background: `linear-gradient(180deg, ${config.ringColor}CC 0%, ${config.color}AA 100%)`,
          borderTop: `3px solid ${config.ringColor}`,
        }}
      >
        <span className="text-2xl font-black"
          style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {player.rank}
        </span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeUp = location.state?.timeUp ?? false;

  const top3 = PODIUM_ORDER.map(r => MOCK_PLAYERS.find(p => p.rank === r));
  const rest = MOCK_PLAYERS.filter(p => p.rank > 3);

  return (
    <PageLayout back={timeUp ? undefined : -1}>
      <div className="pt-6 flex flex-col gap-5 pb-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <Trophy size={22} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
            {timeUp ? 'Final Leaderboard' : 'Leaderboard in progress...'}
          </h2>
        </div>

        {/* Podium */}
        <div className="flex items-end gap-1.5 px-1">
          {top3.map((player, i) => {
            const rank = PODIUM_ORDER[i];
            return (
              <PodiumSlot key={rank} player={player} config={PODIUM_CONFIG[rank]} />
            );
          })}
        </div>

        {/* Rest of players */}
        {rest.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#4AADE8' }}>
            <div className="flex items-center px-4 py-2.5 gap-2">
              <span className="w-10 text-xs font-bold text-white">Rank</span>
              <span className="flex-1 text-xs font-bold text-white">Name</span>
              <span className="text-xs font-bold text-white">Score</span>
            </div>
            <div className="flex flex-col gap-1 px-2 pb-3">
              {rest.map(p => {
                const isZero = p.score === 0;
                return (
                  <div key={p.rank}
                    className="flex items-center px-3 py-2.5 rounded-xl gap-2"
                    style={{ backgroundColor: isZero ? '#FEF9F5' : 'rgba(255,255,255,0.15)' }}>
                    <div className="w-10 flex items-center justify-center">
                      <span className="text-sm font-bold"
                        style={{ color: isZero ? 'var(--color-text)' : 'white' }}>
                        {p.rank}
                      </span>
                    </div>
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1 text-sm font-semibold"
                      style={{ color: isZero ? 'var(--color-text)' : 'white' }}>
                      {p.name}
                    </span>
                    <span className="text-sm font-bold"
                      style={{ color: isZero ? 'var(--color-subtext)' : 'white' }}>
                      {p.score || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {timeUp && <Button onClick={() => navigate('/')}>Done</Button>}

      </div>
    </PageLayout>
  );
}
