import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import LeaderboardList from '../components/LeaderboardList';
import { sessionAPI } from '../utils/api';

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LiveLeaderboard() {
  const navigate = useNavigate();
  const session  = JSON.parse(localStorage.getItem('session') || 'null');
  const player   = JSON.parse(localStorage.getItem('player')  || 'null');
  const sessionId = session?.id || session?._id;

  const [players,  setPlayers]  = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  // Poll players every 5s
  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      try {
        const data = await sessionAPI.getPlayers(sessionId);
        setPlayers(data);
      } catch { /* ignore */ }
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
        if (s.status === 'finished') navigate('/champion');
      } catch { /* ignore */ }
    };
    check();
    const iv = setInterval(check, 3000);
    return () => clearInterval(iv);
  }, [sessionId, navigate]);

  // Local countdown
  useEffect(() => {
    if (timeLeft == null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

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
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              Leaderboard
            </h2>
          </div>
          {timeLeft != null && (
            <span className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: timeLeft < 60 ? '#FEE2E2' : '#EFF6FF', color: timeLeft < 60 ? '#EF4444' : '#3B82F6' }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>

        {/* Player list */}
        {players.length > 0
          ? <LeaderboardList players={players} highlightName={player?.username} />
          : (
            <div className="flex flex-col items-center gap-4 pt-12">
              <style>{`
                @keyframes spin-cw  { to { transform: rotate(360deg) } }
                @keyframes spin-ccw { to { transform: rotate(-360deg) } }
                .gear-cw  { animation: spin-cw  2s linear infinite; display:inline-block }
                .gear-ccw { animation: spin-ccw 2s linear infinite; display:inline-block }
              `}</style>
              <div>
                <span className="gear-cw  text-5xl" style={{ color: 'var(--color-primary)' }}>⚙️</span>
                <span className="gear-ccw text-3xl -ml-2 mt-4" style={{ color: 'var(--color-primary)' }}>⚙️</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-subtext)' }}>Loading results...</p>
            </div>
          )
        }

        {/* Note */}
        <div className="rounded-xl p-4 flex gap-3"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <Info size={16} style={{ color: '#3B82F6', flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
            Finished players rank by score. Unfinished players rank by checkpoints reached.
          </p>
        </div>

        {/* Dev shortcut */}
        <div className="flex justify-end">
          <button onClick={() => navigate('/champion')}
            className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: '#E5E7EB', color: 'var(--color-text)' }}>
            if time up
          </button>
        </div>

      </div>
    </div>
  );
}
