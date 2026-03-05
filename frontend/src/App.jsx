import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Layers
import PublicLayer from './layers/PublicLayer';
import UserLayer from './layers/UserLayer';
import LoginLayer from './layers/LoginLayer';

// Pages
import Play from './pages/Play';
import About from './pages/About';
import Contact from './pages/Contact';
import Ranking from './pages/Ranking';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminLogin from './pages/AdminLogin';
import ChooseAvatar from './pages/ChooseAvatar';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

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

  // Check if user is logged in from localStorage on app start
  useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Background Music */}
        <audio
          ref={audioRef}
          src="/backgroundmusic.mp3"
          preload="auto"
        />
        
        {/* Music Control Button */}
        <button
          onClick={toggleMusic}
          className="fixed top-4 left-4 z-[9999] bg-white/90 hover:bg-white backdrop-blur-md rounded-full p-3 shadow-lg transition-all duration-200"
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
        >
          {isMusicPlaying ? (
            <svg className="w-6 h-6 text-banana-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-banana-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

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
              <Route index element={<Play isLoggedIn={isLoggedIn} user={user} />} />
              <Route path="play" element={<Play isLoggedIn={isLoggedIn} user={user} />} />
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

        {/* Toast notifications - Cute style */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              color: '#166534',
              border: '3px solid #86efac',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: "'Comic Neue', cursive",
              padding: '16px 20px',
              boxShadow: '0 10px 25px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(34, 197, 94, 0.15)',
              backdropFilter: 'blur(10px)',
              minHeight: '65px',
              minWidth: '320px',
              maxWidth: '90vw',
              width: 'auto',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: 'white',
              },
              style: {
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                border: '3px solid #22c55e',
                animation: 'bounce-in 0.6s ease-out',
                minWidth: '320px',
                maxWidth: '90vw',
              },
            },
            error: {
              iconTheme: {
                primary: '#f472b6',
                secondary: 'white',
              },
              style: {
                background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
                border: '3px solid #f472b6',
                color: '#be185d',
                animation: 'shake 0.5s ease-in-out',
                minWidth: '320px',
                maxWidth: '90vw',
              },
            },
            loading: {
              iconTheme: {
                primary: '#fbbf24',
                secondary: 'white',
              },
              style: {
                background: 'linear-gradient(135deg, #fef3c7 0%, #dcfce7 100%)',
                border: '3px solid #fbbf24',
                color: '#92400e',
                animation: 'bounce-in 0.6s ease-out',
                minWidth: '320px',
                maxWidth: '90vw',
              },
            },
          }}
          containerStyle={{
            top: 'auto',
            bottom: '20px',
            right: '20px',
            left: 'auto',
          }}
        />
      </div>
    </Router>
  );
}

export default App;
