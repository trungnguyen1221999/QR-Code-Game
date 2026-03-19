// Ranking logic:
//  1. Has score (finished final game): sort by score DESC
//  2. No score: sort by currentCheckpointIndex DESC, tiebreak lastCheckpointAt ASC
//     Progress shown as X/6

const TOTAL_CHECKPOINTS = 6;

export function rankPlayers(players = []) {
  const withScore = players.filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);
  const noScore = players.filter(p => !p.score || p.score <= 0)
    .sort((a, b) =>
      (b.currentCheckpointIndex ?? 0) - (a.currentCheckpointIndex ?? 0) ||
      new Date(a.lastCheckpointAt ?? 0) - new Date(b.lastCheckpointAt ?? 0)
    );
  return [...withScore, ...noScore].map((p, i) => ({ ...p, rank: i + 1 }));
}

function RankBadge({ rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  if (medals[rank]) return <span className="text-xl">{medals[rank]}</span>;
  return <span className="text-sm font-bold text-white">{rank}</span>;
}

export function PlayerRow({ player, highlight }) {
  const hasScore = player.score > 0;
  const bg = highlight
    ? 'rgba(255,255,255,0.26)'
    : hasScore
      ? 'rgba(255,255,255,0.15)'
      : 'rgba(0,0,0,0.12)';

  return (
    <div className="flex items-center px-3 py-2.5 rounded-xl gap-2"
      style={{ backgroundColor: bg }}>
      <div className="w-10 flex items-center justify-center">
        <RankBadge rank={player.rank} />
      </div>
      <img src={player.avatar || '/avatar/avatar1.png'} alt={player.username || player.name}
        className="w-8 h-8 rounded-full object-cover shrink-0" />
      <span className="flex-1 text-sm font-semibold text-white truncate">
        {player.username || player.name}
      </span>
      {hasScore ? (
        <span className="text-sm font-bold text-white">{player.score}</span>
      ) : (
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#FCD34D' }}>
            📍 {player.currentCheckpointIndex ?? 0}/{TOTAL_CHECKPOINTS}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>In progress</span>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardList({ players, highlightName }) {
  const ranked = rankPlayers(players);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#4AADE8' }}>
      <div className="flex items-center px-4 py-2.5 gap-2">
        <span className="w-10 text-xs font-bold text-white">Rank</span>
        <span className="w-8" />
        <span className="flex-1 text-xs font-bold text-white">Name</span>
        <span className="text-xs font-bold text-white">Score</span>
      </div>
      <div className="flex flex-col gap-1 px-2 pb-3">
        {ranked.map(p => (
          <PlayerRow
            key={p._id || p.id || p.name}
            player={p}
            highlight={(p.username || p.name) === highlightName}
          />
        ))}
      </div>
    </div>
  );
}
