import { useState } from 'react';
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
