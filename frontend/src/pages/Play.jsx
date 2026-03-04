import { useState } from 'react';
import toast from 'react-hot-toast';
import CheckpointBar from '../components/game/CheckpointBar';
import RealTimeRanking from '../components/game/RealTimeRanking';

const PlayPage = () => {
  const [gameData, setGameData] = useState({
    currentCheckpoint: 1,
    isScanning: false
  });

  // User data for ranking
  const currentUser = {
    id: 1,
    name: 'Bạn',
    avatar: 'avatar1.png',
    checkpoint: gameData.currentCheckpoint,
    score: gameData.currentCheckpoint * 100
  };


  return (
    <div 
      className="min-h-screen bg-no-repeat md:bg-repeat bg-cover bg-center" 
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}playbg.png), url(./playbg.png), url(/playbg.png)`,
        backgroundColor: '#2d1b69'
      }}
    >
      <div className="relative min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Checkpoint Progress */}
            <CheckpointBar
              currentCheckpoint={gameData.currentCheckpoint}
            />

            {/* Live Rankings - Mobile Optimized */}
            <RealTimeRanking 
              currentUser={currentUser}
              isLive={false}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayPage;