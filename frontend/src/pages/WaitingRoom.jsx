import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import userApi from '../api/userApi';

const WaitingRoom = ({ user }) => {
  const navigate = useNavigate();

  // Join waiting room on mount, leave on unmount
  useEffect(() => {
    if (user?._id) {
      userApi.joinWaitingRoom(user._id).catch(() => {});
    }
    return () => {
      if (user?._id) {
        userApi.leaveWaitingRoom(user._id).catch(() => {});
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
    if (user?.role === 'host') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="h-screen bg-banana-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md p-3">
        <Card className="overflow-hidden" style={{ background: "#fcf0e4", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)" }}>
          <CardContent className="p-8 flex flex-col items-center">
            <img src="/waiting.gif" alt="Waiting" className="w-69 mb-4" />
            <h2 className="text-2xl font-bold text-banana-green-dark mb-2">
              Waiting for Host Approval
              <span className="inline-block animate-pulse-loading ml-1">...</span>
            </h2>
         
            <p className="text-banana-green text-lg mb-4">Please wait while the host approves your participation.</p>
            <div className="flex items-center space-x-2">
              <span className="animate-spin inline-block w-8 h-8 border-4 border-black border-t-transparent rounded-full"></span>
              <span>Waiting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaitingRoom;