import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Info, Phone, Trophy, User, LogOut, Menu, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useMutation } from '@tanstack/react-query';
import userApi from '../api/userApi';
import hostApi from '../api/hostApi';
import { removeUserFromLocal } from '../lib/localUser';
import { getHostFromLocal, removeHostFromLocal } from '../lib/localHost';

const Header = ({ isLoggedIn, user, onLogout, mobileNavOpen, setMobileNavOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [host, setHost] = useState(getHostFromLocal());

  // Re-check host from localStorage when route changes
  useEffect(() => {
    setHost(getHostFromLocal());
  }, [location.pathname]);

  const isHost = !!host;
  const isUser = isLoggedIn && user;

  // Determine who to display
  const displayAvatar = isHost ? host.avatar : user?.avatar;
  const displayName = isHost ? host.name : user?.name;

  const userLogoutMutation = useMutation({
    mutationFn: () => userApi.logout(),
    onSuccess: () => {
      removeUserFromLocal();
      onLogout();
      toast.success('Logged out successfully!');
      navigate('/auth/login');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || 'Logout failed!');
    }
  });

  const hostLogoutMutation = useMutation({
    mutationFn: () => hostApi.logout(),
    onSuccess: () => {
      removeHostFromLocal();
      setHost(null);
      toast.success('Host logged out!');
      navigate('/host-login');
    },
    onError: () => {
      // still logout locally
      removeHostFromLocal();
      setHost(null);
      navigate('/host-login');
    }
  });

  const handleLogout = () => {
    if (isHost) {
      hostLogoutMutation.mutate();
    } else {
      userLogoutMutation.mutate();
    }
  };

  // mobileNavOpen and setMobileNavOpen are now controlled by App
  // const [mobileNavOpen, setMobileNavOpen] = useState(false);

  let navItems = [
    { path: '/', label: 'Play', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
    { path: '/ranking', label: 'Ranking', icon: Trophy }
  ];
  if (isUser || isHost) {
    navItems = [
      ...navItems,
      { path: '/logout', label: 'Logout', icon: LogOut, isLogout: true }
    ];
  }

  return (
    <header 
      className="shadow-cute border-b-2 border-white border-opacity-30"
      style={{
        backgroundImage: "url(/header.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        zIndex: 9999,
        position: 'relative'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-wiggle">
            <div className="w-10 h-10 bg-cute-gradient rounded-cute flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h1 className="text-3xl font-black text-black" style={{ fontFamily: "'Comic Neue', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>QR Game</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map(({ path, label, icon: Icon, isLogout }) => (
              isLogout ? (
                <button
                  key="logout-desktop"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-cute transition-all duration-300 hover:bg-cute-pink text-black font-bold text-lg"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ) : (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-cute transition-all duration-300 hover:bg-cute-pink ${
                    location.pathname === path 
                      ? 'bg-cute-pink text-black font-black text-lg' 
                      : 'text-black font-bold text-lg hover:text-gray-800'
                  }`}
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              )
            ))}
          </nav>

          {/* User/Host Actions */}
          <div className="flex items-center space-x-4">
            {(isHost || isUser) ? (
              <div className="flex items-center space-x-3">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="avatar"
                    className={`w-10 h-10 rounded-full border-2 object-cover ${
                      isHost ? 'border-green-500' : 'border-banana-green-400'
                    }`}
                  />
                ) : isHost ? (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500">
                    <Crown size={20} className="text-green-600" />
                  </div>
                ) : (
                  <User size={32} className="text-banana-green-400" />
                )}
                <div className="flex flex-col">
                  <span className="font-black text-lg leading-tight" style={{ fontFamily: "'Comic Neue', cursive", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                    {displayName}
                  </span>
                  {isHost && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 rounded-full w-fit">HOST</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {location.pathname === '/auth/login' ? (
                  <Link to="/auth/signup">
                    <Button variant="cute-pink">Sign Up</Button>
                  </Link>
                ) : location.pathname === '/auth/signup' ? (
                  <Link to="/auth/login">
                    <Button variant="banana">Login</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth/login">
                      <Button variant="banana">Login</Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button variant="cute-pink">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger and nav overlay */}
          <div className="md:hidden flex items-center">
            <button
              className="text-black font-bold p-2 focus:outline-none"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label="Toggle navigation menu"
            >
               <Menu size={28} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;