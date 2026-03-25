import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PodiumLeaderboard from '../components/PodiumLeaderboard';
import { rankPlayers } from '../components/LeaderboardList';
import { sessionAPI } from '../utils/api';

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const STAR_COLORS = { 1: '#FBBF24', 2: '#6366F1', 3: '#EF4444' };

function RankBadge({ rank }) {
  if (rank <= 3) return <span className="text-xl" style={{ color: STAR_COLORS[rank] }}>★</span>;
  return <span className="text-sm font-bold text-white">{rank}</span>;
}

export default function LiveLeaderboard() {
  const navigate  = useNavigate();
  const session   = JSON.parse(localStorage.getItem('session') || 'null');
  const player    = JSON.parse(localStorage.getItem('player')  || 'null');
  const sessionId = session?.id || session?._id;

  const [players,  setPlayers]  = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [finished, setFinished] = useState(false);

  // Poll players every 5s
  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      try { setPlayers(await sessionAPI.getPlayers(sessionId)); } catch { /* ignore */ }
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [sessionId]);

  // Poll session for timeLeft + finished status
  useEffect(() => {
    if (!sessionId) return;
    const check = async () => {
      try {
        const s = await sessionAPI.getById(sessionId);
        if (s.timeLeft != null) setTimeLeft(s.timeLeft);
        if (s.status === 'finished') setFinished(true);
      } catch { /* ignore */ }
    };
    check();
    const iv = setInterval(check, 3000);
    return () => clearInterval(iv);
  }, [sessionId]);

  // Local countdown
  useEffect(() => {
    if (timeLeft == null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const ranked = rankPlayers(players);
  const me     = ranked.find(p => (p.username || p.name) === player?.username);
  const myRank = me?.rank ?? '—';

  // ── Final leaderboard (Champion) view ───────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex justify-center relative" style={{
        backgroundImage: 'url(/forest2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(240,255,230,0.1)' }} />
        <div className="w-full max-w-sm flex flex-col pb-28 relative z-10">

          {/* Top section */}
          <div className="flex flex-col items-center gap-2 pt-8 pb-5 px-5">
            <span className="text-6xl">
              {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎉'}
            </span>
            <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>Game completed</h2>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>You finished in #{myRank} place</p>
            <p className="text-2xl font-bold text-center mt-1" style={{ color: 'var(--color-primary)' }}>
              🎉 Congratulations
            </p>
            <p className="text-2xl font-bold text-center" style={{ color: 'var(--color-primary)' }}>
              Champion! 🎉
            </p>
          </div>

          {/* Rank card */}
          <div className="mx-5 rounded-2xl p-5 mb-5" style={{ backgroundColor: '#FEF3E2' }}>
            <p className="text-xs text-center mb-1" style={{ color: 'var(--color-subtext)' }}>Your rank</p>
            <p className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--color-primary)' }}>
              #{myRank}
            </p>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Total players</p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{ranked.length || '—'}</p>
              </div>
              <div className="w-px" style={{ backgroundColor: '#E8C99A' }} />
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Your score</p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{me?.score ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Final leaderboard list */}
          <div className="px-5">
            <p className="text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>Final leaderboard</p>
            {ranked.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: 'var(--color-subtext)' }}>Loading...</p>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#4AADE8' }}>
                <div className="flex items-center px-4 py-2.5 gap-2">
                  <span className="w-10 text-xs font-bold text-white">Rank</span>
                  <span className="flex-1 text-xs font-bold text-white">Name</span>
                  <span className="text-xs font-bold text-white">Score</span>
                </div>
                <div className="flex flex-col gap-1 px-2 pb-3">
                  {ranked.map((p) => {
                    const isMe = (p.username || p.name) === player?.username;
                    return (
                      <div key={p._id || p.id || p.name}
                        className="flex items-center px-3 py-2 rounded-xl gap-2"
                        style={{
                          backgroundColor: isMe ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.18)',
                          border: isMe ? '1.5px solid #86EFAC' : '1.5px solid transparent',
                        }}>
                        <div className="w-10 flex items-center justify-center">
                          <RankBadge rank={p.rank} />
                        </div>
                        <img src={p.avatar || '/avatar/avatar1.png'} alt={p.username || p.name}
                          className="w-8 h-8 rounded-full object-cover" />
                        <span className="flex-1 text-sm font-semibold text-white">{p.username || p.name}</span>
                        <span className="text-sm font-bold text-white">{p.score ?? 0}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Done button */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-3 z-20"
          style={{ backgroundColor: 'rgba(242,249,236,0.92)', backdropFilter: 'blur(8px)' }}>
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

  // ── Live leaderboard view ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex justify-center relative" style={{
      backgroundImage: 'url(/forest2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(240,255,230,0.1)' }} />
      <div className="w-full max-w-sm flex flex-col px-5 pt-8 pb-12 gap-5 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Leaderboard</h2>
          </div>
          {timeLeft != null && (
            <span className="text-sm font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: timeLeft < 60 ? '#FEE2E2' : '#EFF6FF',
                color: timeLeft < 60 ? '#EF4444' : '#3B82F6',
              }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <PodiumLeaderboard players={players} highlightName={player?.username} />

      </div>
    </div>
  );
}
