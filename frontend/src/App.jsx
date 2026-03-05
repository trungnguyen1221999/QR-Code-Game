
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ToastApp from './components/ToastApp';
import MusicControlButton from './components/MusicControlButton';
import { Home, Info, Phone, Trophy, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './App.css';
import Overlayer from './components/popup/Overlayer';
import Header from './components/Header';
import LoginLayer from './layers/LoginLayer';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ChooseAvatar from './pages/ChooseAvatar';
import AdminLogin from './pages/AdminLogin';
import UserLayer from './layers/UserLayer';
import Play from './pages/Play';
import About from './pages/About';
import Contact from './pages/Contact';
import Ranking from './pages/Ranking';
import MobileNavPanel from './components/MobileNavPanel';

function App() {

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isNavPanelVisible, setIsNavPanelVisible] = useState(false);
  const [isNavClosing, setIsNavClosing] = useState(false);
  const audioRef = useRef(null);

  // Nav items for mobile nav panel
  const navItems = [
    { path: '/', label: 'Play', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
    { path: '/ranking', label: 'Ranking', icon: Trophy },
    ...(isLoggedIn ? [{ path: '/logout', label: 'Logout', icon: LogOut, isLogout: true }] : [])
  ];

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  // Music control functions
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  // Initialize audio and user data
  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }

    // Initialize background music
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      audioRef.current.loop = true; // Loop the music
      
      // Auto-play after user interaction
      const playMusic = () => {
        if (audioRef.current && !isMusicPlaying) {
          audioRef.current.play()
            .then(() => setIsMusicPlaying(true))
            .catch(err => console.log('Audio play failed:', err));
        }
      };

      // Add click listener for auto-play
      document.addEventListener('click', playMusic, { once: true });
      
      return () => {
        document.removeEventListener('click', playMusic);
      };
    }
  }, []);

  // Handle nav panel mount/unmount for animation
  useEffect(() => {
    if (mobileNavOpen) {
      setIsNavPanelVisible(true);
      setIsNavClosing(false);
    } else if (isNavPanelVisible) {
      setIsNavClosing(true);
      // Wait for animation to finish before unmounting
      const timeout = setTimeout(() => {
        setIsNavPanelVisible(false);
        setIsNavClosing(false);
      }, 400); // match animation duration
      return () => clearTimeout(timeout);
    }
  }, [mobileNavOpen]);

  return (
    <Router>
      <div className="App">
        {/* Global Overlayer for mobile nav */}
        <Overlayer isOpen={mobileNavOpen || isNavPanelVisible} onClose={() => setMobileNavOpen(false)} closeOnOverlayClick={true}>
          {isNavPanelVisible && (
            <MobileNavPanel
              navItems={navItems}
              onClose={() => setMobileNavOpen(false)}
              onLogout={handleLogout}
              isOpen={mobileNavOpen}
              isClosing={isNavClosing}
            />
          )}
        </Overlayer>
        {/* Background Music */}
        <audio
          ref={audioRef}
          src="/backgroundmusic.mp3"
          preload="auto"
        />
        
        {/* Music Control Button */}
        <MusicControlButton isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic} />

        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />
        <Routes>
          {/* Login Layer - for authentication pages */}
          <Route path="/auth" element={<LoginLayer onLogin={handleLogin} />}>
            <Route path="login" element={<Login onLogin={handleLogin} />} />
            <Route path="signup" element={<SignUp onLogin={handleLogin} />} />
            <Route path="choose-avatar" element={<ChooseAvatar onLogin={handleLogin} />} />
          </Route>

          {/* Admin Login - standalone route */}
          <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />

          {/* Redirect /login and /signup to auth routes */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

          {/* Protected Routes - require login */}
          {isLoggedIn ? (
            <Route path="/" element={<UserLayer user={user} onLogout={handleLogout} />}>
              <Route index element={<Play isLoggedIn={isLoggedIn} user={user} mobileNavOpen={mobileNavOpen} />} />
              <Route path="play" element={<Play isLoggedIn={isLoggedIn} user={user} mobileNavOpen={mobileNavOpen} />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="ranking" element={<Ranking />} />
            </Route>
          ) : (
            // Redirect unauthenticated users to login
            <Route path="/*" element={<Navigate to="/auth/login" replace />} />
          )}

          {/* Catch all route */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/auth/login"} replace />} />
        </Routes>

        <ToastApp />
      </div>
    </Router>
  );
}

export default App;
