import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import HostLogin from './pages/HostLogin';
import HostSignUp from './pages/HostSignUp';
import HostDashboard from './pages/HostDashboard';
import HostSetup from './pages/HostSetup';
import HostGameInProgress from './pages/HostGameInProgress';
import Leaderboard from './pages/Leaderboard';
import JoinGame from './pages/JoinGame';
import WaitingRoom from './pages/WaitingRoom';
import PlayerGame from './pages/PlayerGame';
import PlayerChallenge from './pages/PlayerChallenge';
import PlayerShop from './pages/PlayerShop';
import MemoryCardGame from './pages/MemoryCardGame';
import WhackAMoleGame from './pages/WhackAMoleGame';
import CombinedWordQuizGame from './pages/CombinedWordQuizGame';
import GameOver from './pages/GameOver';
import FinalShop from './pages/FinalShop';
import FinalChallenge from './pages/FinalChallenge';
import LiveLeaderboard from './pages/LiveLeaderboard';
import Champion from './pages/Champion';
import AvatarSelect from './pages/AvatarSelect';
import BackgroundMusic from './components/BackgroundMusic';

function App() {
  const [player, setPlayer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('host'));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => { localStorage.removeItem('host'); localStorage.removeItem('session'); setIsLoggedIn(false); };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onLogout={handleLogout} />} />
        <Route path="/host-login" element={<HostLogin onLogin={handleLogin} />} />
        <Route path="/host-signup" element={<HostSignUp onLogin={handleLogin} />} />
        <Route path="/host-setup" element={<HostSetup onLogout={handleLogout} />} />
        <Route path="/host-dashboard" element={<HostDashboard onLogout={handleLogout} />} />
        <Route path="/host-game" element={<HostGameInProgress onLogout={handleLogout} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/join" element={<JoinGame onJoin={setPlayer} />} />
        <Route path="/select-avatar" element={<AvatarSelect />} />
        <Route path="/waiting-room" element={<WaitingRoom player={player} />} />
        <Route path="/game" element={<PlayerGame />} />
        <Route path="/memory-game" element={<MemoryCardGame />} />
        <Route path="/whack-a-mole" element={<WhackAMoleGame />} />
        <Route path="/combined-word-quiz" element={<CombinedWordQuizGame />} />
        <Route path="/challenge" element={<PlayerChallenge />} />
        <Route path="/shop" element={<PlayerShop />} />
        <Route path="/game-over" element={<GameOver />} />
        <Route path="/final-shop" element={<FinalShop />} />
        <Route path="/final-challenge" element={<FinalChallenge />} />
        <Route path="/live-leaderboard" element={<LiveLeaderboard />} />
        <Route path="/champion" element={<Champion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BackgroundMusic />
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;
