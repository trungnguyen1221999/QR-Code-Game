import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Copy, Check, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import GameSettingsCard from '../components/ui/GameSettingsCard';
import { sessionAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

function formatTime(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function statusLabel(status, t) {
  if (status === 'finished') return t.done;
  if (status === 'eliminated') return t.out;
  return t.inGame;
}

function statusColor(status) {
  if (status === 'finished') return 'var(--color-green)';
  if (status === 'eliminated') return 'var(--color-red)';
  return 'var(--color-primary)';
}

export default function HostGameInProgress({ onLogout }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const host = JSON.parse(localStorage.getItem('host') || 'null');
  const localSession = JSON.parse(localStorage.getItem('session') || 'null');
  const sessionId = localSession?.id || localSession?._id;

  const [sessionData, setSessionData] = useState(localSession);
  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);
  const [timeUpCountdown, setTimeUpCountdown] = useState(5);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionData?.code ?? '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch fresh session data (to always get the code)
  useEffect(() => {
    if (!sessionId) return;
    sessionAPI.getById(sessionId).then((s) => setSessionData(s)).catch(() => {});
  }, [sessionId]);

  // Poll players every 3s
  useEffect(() => {
    if (!sessionId) return;
    const fetchPlayers = async () => {
      try {
        const data = await sessionAPI.getPlayers(sessionId);
        setPlayers(Array.isArray(data) ? data : []);
      } catch {
        /* silently ignore */
      }
    };
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Countdown based on sessionData.expiresAt
  useEffect(() => {
    const expiresAt = sessionData?.expiresAt ? new Date(sessionData.expiresAt) : null;
    if (!expiresAt) {
      setTimeLeft((sessionData?.totalTime || 30) * 60);
      return;
    }

    const tick = () => {
      const secs = Math.max(0, Math.round((expiresAt - new Date()) / 1000));
      setTimeLeft(secs);
      if (secs <= 0) setShowTimeUpPopup(true);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [sessionData?.expiresAt]);

  const completedCount = players.filter((p) => p.status === 'finished').length;
  const inGameCount = players.filter((p) => p.status === 'active').length;

  // 5s countdown after time up popup appears
  useEffect(() => {
    if (!showTimeUpPopup) return;
    setTimeUpCountdown(5);
    const timer = setInterval(() => {
      setTimeUpCountdown((v) => {
        if (v <= 1) {
          clearInterval(timer);
          navigate('/leaderboard', { state: { timeUp: true, sessionId } });
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showTimeUpPopup]);

  const handleEnd = async () => {
    try {
      await sessionAPI.finish(sessionId);
    } catch {
      // ignore
    }
    navigate('/leaderboard', { state: { timeUp: true, sessionId } });
    localStorage.removeItem('session');
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
              {t.loggedInAsHost}
            </p>
            <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              {translate(t.helloUser, { name: host?.name || host?.username || '' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#FEF3E2' }}>
              <Users size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                {players.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl flex items-center gap-0.5" style={{ color: 'var(--color-text)' }}>
            {t.gameInProgress}
            <style>{`
              @keyframes dot-blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
              .dot1{animation:dot-blink 1.4s infinite 0s}
              .dot2{animation:dot-blink 1.4s infinite 0.2s}
              .dot3{animation:dot-blink 1.4s infinite 0.4s}
            `}</style>
            <span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
          </h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-bold text-lg tracking-widest px-3 py-1 rounded-xl"
            style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}
          >
            {sessionData?.code || '------'}
            {copied
              ? <Check size={16} style={{ color: 'var(--color-green)' }} />
              : <Copy size={16} />
            }
          </button>
        </div>

        {/* Timer box */}
        <Card className="rounded-2xl p-5 flex flex-col items-center gap-2"
        >
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{t.timeLeft}</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
          </p>
          <div className="flex w-full justify-around mt-1">
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>{t.completed}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{completedCount}</p>
            </div>
            <div className="w-px" style={{ backgroundColor: '#E8C99A' }} />
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>{t.inGame}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{inGameCount}</p>
            </div>
          </div>
        </Card>

        {/* Live Ranking by checkpoint */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              {t.liveRanking}
            </span>
            <span className="ml-auto text-xs" style={{ color: 'var(--color-subtext)' }}>
              {t.byCheckpoint}
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-subtext)' }}>
              {t.noPlayersYet}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {[...players]
                .sort((a, b) => {
                  const ca = a.checkpointsCompleted ?? 0;
                  const cb = b.checkpointsCompleted ?? 0;
                  if (cb !== ca) return cb - ca;
                  // tie-break: who finished their last checkpoint earlier
                  return (a.lastCheckpointAt ? new Date(a.lastCheckpointAt) : Infinity)
                       - (b.lastCheckpointAt ? new Date(b.lastCheckpointAt) : Infinity);
                })
                .map((p, i) => {
                  const cp = p.checkpointsCompleted ?? 0;
                  const total = sessionData?.gameOrder?.length || 6;
                  const done = p.status === 'finished';
                  const out  = p.status === 'eliminated';
                  return (
                    <div key={p._id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: done ? '#F0FDF4' : out ? '#FEF2F2' : '#FEF9F5' }}>
                      {/* Rank */}
                      <span className="text-sm font-black w-5 text-center"
                        style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#6B7280' : i === 2 ? '#CD7C2F' : 'var(--color-subtext)' }}>
                        {i + 1}
                      </span>
                      {/* Avatar */}
                      <img src={p.userId?.avatar || '/avatar/avatar1.png'}
                        alt={p.userId?.username}
                        className="w-8 h-8 rounded-full object-cover shrink-0" />
                      {/* Name + checkpoint dots */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate"
                          style={{ color: 'var(--color-text)' }}>
                          {p.userId?.username}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: total }).map((_, di) => (
                            <div key={di}
                              className="rounded-full"
                              style={{
                                width: 8, height: 8,
                                backgroundColor: di < cp
                                  ? (done ? 'var(--color-green)' : 'var(--color-primary)')
                                  : '#E5E7EB',
                              }} />
                          ))}
                        </div>
                      </div>
                      {/* Status + cp count */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold" style={{ color: statusColor(p.status) }}>
                          {statusLabel(p.status, t)}
                        </span>
                        <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
                          {cp}/{total}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <GameSettingsCard session={sessionData} />

        {/* End game */}
        <Button variant="red" onClick={() => setShowEndPopup(true)}>
          <X size={16} /> {t.endGame}
        </Button>

      </div>

      {/* Time up popup */}
      <Popup open={showTimeUpPopup} onClose={() => {}} showClose={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="text-5xl">⏰</span>
          <h3 className="text-xl font-bold text-center" style={{ color: 'var(--color-text)' }}>
            {t.timesUp}
          </h3>
          <p className="text-sm text-center" style={{ color: 'var(--color-subtext)' }}>
            {t.redirectingToLeaderboardIn}
          </p>
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-2xl font-black"
            style={{ backgroundColor: '#FEF3E2', color: 'var(--color-primary)' }}>
            {timeUpCountdown}
          </div>
        </div>
      </Popup>

      {/* End game confirmation popup */}
      <Popup open={showEndPopup} onClose={() => setShowEndPopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}>
            <X size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            {t.areYouSureEndGame}
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" onClick={handleEnd}>{t.confirm}</Button>
            <Button variant="red" onClick={() => setShowEndPopup(false)}>{t.cancel}</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}