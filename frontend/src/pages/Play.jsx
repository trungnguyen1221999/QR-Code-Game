import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CheckpointBar from '../components/game/CheckpointBar';
import RealTimeRanking from '../components/game/RealTimeRanking';
import QRScanner from '../components/game/QRScanner';
import Score from '../components/game/Score';
import MiniGame from '../components/popup/minigames/MiniGame';
import SneakGame from '../components/popup/minigames/SneakGame';
import FinalPopupShop from '../components/popup/shop/FinalPopupShop';

const PlayPage = ({ mobileNavOpen }) => {
  const [gameData, setGameData] = useState({
    currentCheckpoint: 1,
    isScanning: false,
    showMiniGame: false
  });
  const [showScore, setShowScore] = useState(true);
  const [showSneak, setShowSneak] = useState(false);
  const [showFinalShop, setShowFinalShop] = useState(false);
  const [sneakLength, setSneakLength] = useState(10);
  const [sneakSpeed, setSneakSpeed] = useState(120);

  useEffect(() => {
    if (mobileNavOpen) {
      setShowScore(false);
    } else {
      // Delay showing score for 1s after menu closes
      const timer = setTimeout(() => setShowScore(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [mobileNavOpen]);

  // User data for ranking
  const currentUser = {
    id: 1,
    name: 'Bạn',
    avatar: '/avatar/avatar1.png',
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
      {showScore && (
        <Score 
          score={currentUser.score} 
          stars={Math.floor(gameData.currentCheckpoint / 2)} 
        />
      )}
      
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
      {/* Button to test FinalPopupShop */}
      <button
        className="fixed bottom-6 right-6 z-[10040] bg-cute-pink text-white px-4 py-2 rounded-full shadow-lg hover:bg-pink-600 transition"
        onClick={() => setShowFinalShop(true)}
      >
        Test Sneak Game
      </button>
      {showFinalShop && (
        <FinalPopupShop
          isOpen={showFinalShop}
          onClose={() => {
            setShowFinalShop(false);
            setShowSneak(true);
          }}
          onPurchase={item => {
            // Optionally handle purchase event
          }}
          // Pass a callback to get the latest length and speed
          getStats={(length, speed) => {
            setSneakLength(length);
            setSneakSpeed(speed);
          }}
        />
      )}
      {showSneak && (
        <SneakGame
          avatar={currentUser.avatar}
          onClose={() => setShowSneak(false)}
          length={sneakLength}
          speed={sneakSpeed}
        />
      )}
    </>
  );
};

export default PlayPage;