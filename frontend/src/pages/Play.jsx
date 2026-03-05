import { useState } from 'react';
import toast from 'react-hot-toast';
import CheckpointBar from '../components/game/CheckpointBar';
import RealTimeRanking from '../components/game/RealTimeRanking';
import QRScanner from '../components/game/QRScanner';
import Score from '../components/game/Score';
import MiniGame from '../components/popup/minigames/MiniGame';

const PlayPage = () => {
  const [gameData, setGameData] = useState({
    currentCheckpoint: 1,
    isScanning: false,
    showMiniGame: false
  });

  // User data for ranking
  const currentUser = {
    id: 1,
    name: 'Bạn',
    avatar: 'avatar1.png',
    checkpoint: gameData.currentCheckpoint,
    score: gameData.currentCheckpoint * 100
  };

  // Handle QR scan success
  const handleQRScanSuccess = (qrData) => {
    console.log('QR Scanned:', qrData);
    
    // Close scanner and show mini game
    setGameData(prev => ({
      ...prev, 
      isScanning: false,
      showMiniGame: true
    }));
    
    toast.success('QR Code detected! Starting mini game...', {
      duration: 2000,
      position: 'top-center',
    });
  };


  return (
    <>
      {/* Score component - Fixed position, highest z-index */}
      <Score 
        score={currentUser.score} 
        stars={Math.floor(gameData.currentCheckpoint / 2)} 
      />
      
      <div 
        className="min-h-screen bg-no-repeat md:bg-repeat bg-cover bg-center" 
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}playbg.png), url(./playbg.png), url(/playbg.png)`,
        }}
      >
      <div className="relative min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Checkpoint Progress */}
            <CheckpointBar
              currentCheckpoint={gameData.currentCheckpoint}
            />
            {/* QR Scanner */}
            <QRScanner onQRScanSuccess={handleQRScanSuccess} />
            {/* Live Rankings - Mobile Optimized */}
            <RealTimeRanking 
              currentUser={currentUser}
              isLive={false}
            />

          </div>
        </div>
      </div>
    </div>

      {/* Mini Game Popup */}
      {gameData.showMiniGame && (
        <MiniGame 
          isOpen={gameData.showMiniGame}
          onClose={() => setGameData(prev => ({...prev, showMiniGame: false}))}
        />
      )}
    </>
  );
};

export default PlayPage;