import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { getHostFromLocal, removeHostFromLocal } from '../lib/localHost';
import hostApi from '../api/hostApi';

export default function MobileNavPanel({
  navItems,
  onClose,
  onLogout,
  isOpen,
  isClosing
}) {
  const navigate = useNavigate();

  const handleSmartLogout = async () => {
    const host = getHostFromLocal();
    if (host) {
      // Host logout
      try {
        await hostApi.logout();
      } catch (e) { /* still logout locally */ }
      removeHostFromLocal();
      toast.success('Host logged out!');
      navigate('/host-login');
    } else {
      // User logout via App's onLogout
      onLogout();
    }
  };

  // Get the first nav item and its icon
  const firstNavItem = navItems[0];
  const FirstIcon = firstNavItem?.icon;

  return (
    <div
      className={`w-2/3 max-w-xs bg-white shadow-lg h-full p-6 flex flex-col gap-6 z-10010 fixed right-0 top-0 transition-transform duration-400 ${
        isOpen && !isClosing
          ? 'animate-slide-in-right'
          : 'animate-slide-out-right'
      }`}
      style={{
        background: `url('/menubg.png') center center / cover no-repeat, white`,
        backgroundColor: 'white',
        opacity: 1
      }}
    >
      <nav className="flex flex-col gap-4">
        {/* First nav item */}
        {navItems.length > 0 && (
          firstNavItem.isLogout ? (
            <button
              key="logout"
              onClick={() => { onClose(); handleSmartLogout(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-cute text-lg font-bold text-black hover:bg-cute-pink/60 transition"
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              {FirstIcon && <FirstIcon size={22} />}
              <span>{firstNavItem.label}</span>
            </button>
          ) : (
            <Link
              key={firstNavItem.path}
              to={firstNavItem.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-cute text-lg font-bold ${window.location.pathname === firstNavItem.path ? 'bg-cute-pink/80 text-black' : 'text-black hover:bg-cute-pink/40'} transition`}
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              {FirstIcon && <FirstIcon size={22} />}
              <span>{firstNavItem.label}</span>
            </Link>
          )
        )}
        {/* Render the rest of nav items */}
        {navItems.slice(1).map(({ path, label, icon: Icon, isLogout }) => (
          isLogout ? (
            <button
              key="logout"
              onClick={() => { onClose(); handleSmartLogout(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-cute text-lg font-bold text-black hover:bg-cute-pink/60 transition"
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ) : (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-cute text-lg font-bold ${window.location.pathname === path ? 'bg-cute-pink/80 text-black' : 'text-black hover:bg-cute-pink/40'} transition`}
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          )
        ))}
        {/* X button at the bottom */}
        <div onClick={onClose} className="flex justify-center mt-6 w-full bg-red-500 p-2">
            <X size={28} color="black" />
        </div>
      </nav>
    </div>
  );
}
