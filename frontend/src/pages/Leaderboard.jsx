import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import LeaderboardList, { rankPlayers } from '../components/LeaderboardList';
import { sessionAPI } from '../utils/api';

const PODIUM_CONFIG = {
  1: { podiumH: 72, avatarSize: 64, badge: '🥇', color: '#F59E0B', ringColor: '#FCD34D' },
  2: { podiumH: 52, avatarSize: 54, badge: '🥈', color: '#6B7280', ringColor: '#9CA3AF' },
  3: { podiumH: 40, avatarSize: 50, badge: '🥉', color: '#CD7C2F', ringColor: '#D97706' },
};

function PodiumSlot({ player, config }) {
  if (!player) return <div className="flex-1" />;
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="relative mb-1">
        <img src={player.avatar || '/avatar/avatar1.png'} alt={player.username || player.name}
          style={{ width: config.avatarSize, height: config.avatarSize, borderRadius: '50%',
            objectFit: 'cover', border: `3px solid ${config.ringColor}`,
            boxShadow: '0 0 0 2px white, 0 4px 12px rgba(0,0,0,0.15)' }} />
        <span className="absolute -bottom-1 -right-1" style={{ fontSize: 18 }}>{config.badge}</span>
      </div>
      <p className="text-xs font-bold text-center mb-1.5 leading-tight"
        style={{ color: 'var(--color-text)', maxWidth: 72 }}>
        {player.username || player.name}
      </p>
      <div className="px-2.5 py-0.5 rounded-full mb-2 text-xs font-bold text-white"
        style={{ backgroundColor: config.color }}>
        {player.score}
      </div>
      <div className="w-full rounded-t-xl flex items-center justify-center"
        style={{ height: config.podiumH,
          background: `linear-gradient(180deg, ${config.ringColor}CC 0%, ${config.color}AA 100%)`,
          borderTop: `3px solid ${config.ringColor}` }}>
        <span className="text-2xl font-black text-white">{player.rank}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const timeUp    = location.state?.timeUp ?? false;
  const session   = JSON.parse(localStorage.getItem('session') || 'null');
  const sessionId = session?.id || session?._id;

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!sessionId) return;
    sessionAPI.getPlayers(sessionId)
      .then(data => setPlayers(data))
      .catch(() => {});
  }, [sessionId]);

  const ranked  = rankPlayers(players);
  const top3    = [2, 1, 3].map(r => ranked.find(p => p.rank === r && p.score > 0));
  const listAll = ranked; // show all players in the list below

  return (
    <PageLayout back={timeUp ? undefined : -1}>
      <div className="pt-6 flex flex-col gap-5 pb-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <Trophy size={22} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
            {timeUp ? 'Final Leaderboard' : 'Leaderboard'}
          </h2>
        </div>

        {/* Podium — only if at least 1 finished player */}
        {ranked.some(p => p.score > 0) && (
          <div className="flex items-end gap-1.5 px-1">
            {[2, 1, 3].map(rank => (
              <PodiumSlot key={rank} player={top3.find(p => p?.rank === rank)} config={PODIUM_CONFIG[rank]} />
            ))}
          </div>
        )}

        {/* Full ranked list */}
        {listAll.length > 0
          ? <LeaderboardList players={players} />
          : <p className="text-center text-sm py-8" style={{ color: 'var(--color-subtext)' }}>Loading...</p>
        }

        {timeUp && <Button onClick={() => navigate('/')}>Done</Button>}

      </div>
    </PageLayout>
  );
}
