import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaderboardList, { rankPlayers } from '../components/LeaderboardList';
import { sessionAPI } from '../utils/api';

function formatDuration(startedAt, endedAt) {
  if (!startedAt) return '—';
  const ms = new Date(endedAt || Date.now()) - new Date(startedAt);
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function GameOver() {
  const navigate = useNavigate();
  const session  = JSON.parse(localStorage.getItem('session') || 'null');
  const player   = JSON.parse(localStorage.getItem('player')  || 'null');
  const sessionId = session?.id || session?._id;

  const [players,     setPlayers]     = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    Promise.all([
      sessionAPI.getPlayers(sessionId).catch(() => []),
      sessionAPI.getById(sessionId).catch(() => null),
    ]).then(([ps, s]) => {
      setPlayers(ps);
      setSessionData(s);
      setLoading(false);
    });
  }, [sessionId]);

  const ranked   = rankPlayers(players);
  const myName   = player?.username || player?.name;
  const me       = ranked.find(p => (p.username || p.name) === myName);
  const myRank   = me?.rank ?? '—';
  const total    = ranked.length;
  const duration = formatDuration(sessionData?.startedAt, sessionData?.endedAt);

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
          {myRank !== '—' && (
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>You are in #{myRank} place</p>
          )}
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
              <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {loading ? '…' : total}
              </p>
            </div>
            <div className="w-px" style={{ backgroundColor: '#E8C99A' }} />
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Game duration</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {loading ? '…' : duration}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="px-5">
          <p className="text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>Final leaderboard</p>
          {loading
            ? <p className="text-center text-sm py-8" style={{ color: 'var(--color-subtext)' }}>Loading...</p>
            : <LeaderboardList players={players} highlightName={myName} />
          }
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
