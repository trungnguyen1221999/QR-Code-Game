import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { sessionAPI, playerAPI } from '../utils/api';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  const playerSession = JSON.parse(localStorage.getItem('playerSession') || 'null');
  const player = JSON.parse(localStorage.getItem('player') || 'null');

  const [players, setPlayers] = useState([]);
  const [showLeavePopup, setShowLeavePopup] = useState(false);

  // Poll players list + check if game started
  useEffect(() => {
    if (!session?.id && !session?._id) return;
    const sessionId = session._id || session.id;
    const psId = playerSession?._id || playerSession?.id;

    const poll = async () => {
      try {
        const [playersData, psData] = await Promise.all([
          sessionAPI.getPlayers(sessionId),
          psId ? playerAPI.getById(psId) : Promise.resolve(null),
        ]);

        setPlayers(Array.isArray(playersData) ? playersData : []);

        // Navigate to game when host starts
        if (psData?.status === 'active') {
          navigate('/game');
        }
      } catch {
        // silently ignore polling errors
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLeave = () => {
    localStorage.removeItem('player');
    localStorage.removeItem('playerSession');
    localStorage.removeItem('session');
    navigate('/');
  };

  return (
    <PageLayout>
      <div className="pt-4 flex flex-col gap-4">

        {/* Player greeting */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>Joined as Player</p>
            <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              👋 Hello, {player?.username}!
            </p>
          </div>
          <button
            onClick={() => setShowLeavePopup(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
          >
            <LogOut size={13} />
            Leave
          </button>
        </div>

        <Card>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Waiting host ...</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            Waiting the host to start the game
          </p>

          {/* Waiting GIF */}
          <div className="flex justify-center my-5">
            <img src="/waiting.gif" alt="Waiting..." style={{ height: '80px', objectFit: 'contain' }} />
          </div>

          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Players ({players.length})
          </h3>
          <div className="flex flex-wrap gap-4 mb-4">
            {players.map(p => {
              const username = p.userId?.username || '?';
              const avatar = p.userId?.avatar || '/avatar/avatar1.png';
              const isMe = username === player?.username;
              return (
                <div key={p._id} className="flex flex-col items-center gap-1">
                  <div
                    className="h-14 w-14 rounded-full overflow-hidden border-2"
                    style={{
                      backgroundColor: '#FEF3E2',
                      borderColor: isMe ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    <img src={avatar} alt={username} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {username}{isMe ? ' (You)' : ''}
                  </span>
                </div>
              );
            })}
          </div>

        </Card>
      </div>

      <Popup open={showLeavePopup} onClose={() => setShowLeavePopup(false)} showClose={false}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}>
            <LogOut size={28} style={{ color: 'var(--color-red)' }} />
          </div>
          <h3 className="text-lg font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Are you sure to leave the game?
          </h3>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="green" onClick={handleLeave}>Confirm</Button>
            <Button variant="red" onClick={() => setShowLeavePopup(false)}>Cancel</Button>
          </div>
        </div>
      </Popup>

    </PageLayout>
  );
}
