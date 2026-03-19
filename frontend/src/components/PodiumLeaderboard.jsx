import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { rankPlayers } from './LeaderboardList';

const PODIUM = {
  1: { h: 68, size: 60, badge: '🥇', color: '#F59E0B', ring: '#FCD34D' },
  2: { h: 48, size: 52, badge: '🥈', color: '#6B7280', ring: '#9CA3AF' },
  3: { h: 36, size: 48, badge: '🥉', color: '#CD7C2F', ring: '#D97706' },
};

const TOTAL_CHECKPOINTS = 6;

function ScoreOrProgress({ player }) {
  if (player.score > 0) {
    return (
      <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
        {player.score}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}>
      📍 {player.currentCheckpointIndex ?? 0}/{TOTAL_CHECKPOINTS}
    </span>
  );
}

export default function PodiumLeaderboard({ players = [], highlightName }) {
  const [open, setOpen] = useState(false);
  const ranked = rankPlayers(players);
  const top3   = [2, 1, 3].map(r => ranked.find(p => p.rank === r));
  const rest   = ranked.filter(p => p.rank > 3);

  if (ranked.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <style>{`
          @keyframes spin-cw  { to { transform: rotate(360deg) } }
          @keyframes spin-ccw { to { transform: rotate(-360deg) } }
          .gear-cw  { animation: spin-cw  2s linear infinite; display:inline-block }
          .gear-ccw { animation: spin-ccw 2s linear infinite; display:inline-block }
        `}</style>
        <div>
          <span className="gear-cw text-5xl" style={{ color: 'var(--color-primary)' }}>⚙️</span>
          <span className="gear-ccw text-3xl -ml-2" style={{ color: 'var(--color-primary)' }}>⚙️</span>
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-subtext)' }}>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}>

      {/* Podium */}
      <div className="flex items-end gap-1.5 mb-2">
        {[2, 1, 3].map(rank => {
          const p = top3.find(x => x?.rank === rank);
          const cfg = PODIUM[rank];
          if (!p) return <div key={rank} className="flex-1" />;
          const isMe = (p.username || p.name) === highlightName;
          return (
            <div key={rank} className="flex-1 flex flex-col items-center">
              <div className="relative mb-1">
                <img src={p.avatar || '/avatar/avatar1.png'} alt={p.username || p.name}
                  style={{ width: cfg.size, height: cfg.size, borderRadius: '50%', objectFit: 'cover',
                    border: `3px solid ${isMe ? '#22C55E' : cfg.ring}`,
                    boxShadow: isMe ? '0 0 0 2px #86EFAC' : '0 0 0 2px white' }} />
                <span className="absolute -bottom-1 -right-1" style={{ fontSize: 16 }}>{cfg.badge}</span>
              </div>
              <p className="text-xs font-bold text-center mb-1 leading-tight"
                style={{ color: 'var(--color-text)', maxWidth: 68 }}>
                {p.username || p.name}
              </p>
              {p.score > 0 ? (
                <div className="px-2 py-0.5 rounded-full mb-2 text-xs font-bold text-white"
                  style={{ backgroundColor: cfg.color }}>{p.score}</div>
              ) : (
                <div className="px-2 py-0.5 rounded-full mb-2 text-xs font-bold"
                  style={{ backgroundColor: '#FEF3E2', color: cfg.color }}>
                  {p.currentCheckpointIndex ?? 0}/{TOTAL_CHECKPOINTS}
                </div>
              )}
              <div className="w-full rounded-t-xl flex items-center justify-center"
                style={{ height: cfg.h,
                  background: `linear-gradient(180deg, ${cfg.ring}BB 0%, ${cfg.color}99 100%)`,
                  borderTop: `3px solid ${cfg.ring}` }}>
                <span className="text-xl font-black text-white">{rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle button */}
      {rest.length > 0 && (
        <button onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold"
          style={{ color: 'var(--color-subtext)', backgroundColor: '#F9F5F0' }}>
          {open ? 'Show less' : `Show all (${ranked.length})`}
          <ChevronDown size={14} style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }} />
        </button>
      )}

      {/* Rest of players */}
      <div style={{
        maxHeight: open ? `${rest.length * 56}px` : '0px',
        overflow: 'hidden',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div className="flex flex-col gap-1 mt-3">
          {rest.map(p => {
            const isMe = (p.username || p.name) === highlightName;
            return (
              <div key={p._id || p.id || p.name}
                className="flex items-center gap-3 px-2 py-2 rounded-xl"
                style={{ backgroundColor: isMe ? '#F0FDF4' : '#F9F5F0',
                  border: isMe ? '1.5px solid #86EFAC' : '1.5px solid transparent' }}>
                <span className="w-6 text-center text-sm font-bold"
                  style={{ color: 'var(--color-subtext)' }}>{p.rank}</span>
                <img src={p.avatar || '/avatar/avatar1.png'} alt={p.username || p.name}
                  className="w-8 h-8 rounded-full object-cover" />
                <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {p.username || p.name}
                </span>
                <ScoreOrProgress player={p} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
