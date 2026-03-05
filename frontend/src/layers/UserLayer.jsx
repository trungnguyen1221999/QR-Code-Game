import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

const UserLayer = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayer;