import { Outlet } from 'react-router-dom';

const LoginLayer = ({ onLogin }) => {
  return (
    <div className="min-h-screen">
      <Outlet context={{ onLogin }} />
    </div>
  );
};

export default LoginLayer;