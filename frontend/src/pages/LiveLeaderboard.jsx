import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PodiumLeaderboard from '../components/PodiumLeaderboard';
import { sessionAPI } from '../utils/api';

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LiveLeaderboard() {
  const navigate  = useNavigate();
  const session   = JSON.parse(localStorage.getItem('session') || 'null');
  const player    = JSON.parse(localStorage.getItem('player')  || 'null');
  const sessionId = session?.id || session?._id;

  const [players,  setPlayers]  = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

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
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Leaderboard</h2>
          </div>
          {timeLeft != null && (
            <span className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: timeLeft < 60 ? '#FEE2E2' : '#EFF6FF',
                       color: timeLeft < 60 ? '#EF4444' : '#3B82F6' }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <PodiumLeaderboard players={players} highlightName={player?.username} />

      </div>
    </div>
  );
}
