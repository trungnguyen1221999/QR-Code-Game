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
          </Route>

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

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--banana-green-50)',
              color: 'var(--banana-green-800)',
              border: '2px solid var(--banana-green-200)',
              borderRadius: '20px',
              fontWeight: '500'
            },
            success: {
              iconTheme: {
                primary: 'var(--banana-green-500)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--cute-pink-400)',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
