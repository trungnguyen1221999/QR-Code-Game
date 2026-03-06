import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Users, LogOut, Crown, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getHostFromLocal, removeHostFromLocal } from '../lib/localHost';
import { predefinedAvatars } from '@/data/avatarData';
import hostApi from '../api/hostApi';
import userApi from '../api/userApi';
import { saveHostToLocal } from '../lib/localHost';
import { useRefetch } from '../context/RefetchContext';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [host, setHost] = useState(getHostFromLocal());
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [approvedPlayers, setApprovedPlayers] = useState([]);
  const [rejectedPlayers, setRejectedPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSubmittingAvatar, setIsSubmittingAvatar] = useState(false);
  const [onlineUserCount, setOnlineUserCount] = useState(0);
  const { needRefetch, setNeedRefetch } = useRefetch();
  // Fetch online user count
  const fetchOnlineUserCount = async () => {
    try {
      const res = await userApi.getOnlineUserCount();
      setOnlineUserCount(res.data.onlineUserCount || 0);
    } catch (error) {
      setOnlineUserCount(0);
    }
  };


  useEffect(() => {
    if (!host) {
      navigate('/host-login');
    }
  }, [host, navigate]);

  // Fetch all players
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const [pending, approved, rejected] = await Promise.all([
        hostApi.getPendingPlayers(),
        hostApi.getApprovedPlayers(),
        hostApi.getRejectedPlayers(),
      ]);
      setPendingPlayers(pending.data || []);
      setApprovedPlayers(approved.data || []);
      setRejectedPlayers(rejected.data || []);
    } catch (error) {
      toast.error('Failed to fetch players');
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Fetch on mount + poll every 5 seconds
  useEffect(() => {
    if (!host) return;
    fetchPlayers();
    fetchOnlineUserCount();
    const interval = setInterval(() => {
      fetchPlayers();
      fetchOnlineUserCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [host]);

  // Refetch when needRefetch becomes true
  useEffect(() => {
    if (needRefetch && host) {
      fetchPlayers();
      setNeedRefetch(false);
    }
  }, [needRefetch]);

  // Approve player
  const handleApprove = async (userId) => {
    try {
      await hostApi.approvePlayer(userId);
      toast.success('Player approved!');
      fetchPlayers();
    } catch (error) {
      toast.error('Failed to approve player');
    }
  };

  // Reject player
  const handleReject = async (userId) => {
    try {
      await hostApi.rejectPlayer(userId);
      toast.success('Player rejected');
      fetchPlayers();
    } catch (error) {
      toast.error('Failed to reject player');
    }
  };

  // Save avatar
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast.error('Please choose an avatar');
      return;
    }
    setIsSubmittingAvatar(true);
    try {
      const res = await hostApi.update(host._id, { avatar: selectedAvatar.path });
      const updatedHost = res.data.host || res.data;
      saveHostToLocal(updatedHost);
      setHost(updatedHost);
      window.dispatchEvent(new Event('hostUpdated'));
      toast.success('Avatar saved!');
    } catch (error) {
      toast.error('Failed to save avatar');
    } finally {
      setIsSubmittingAvatar(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await hostApi.logout();
    } catch (error) {
      // still logout locally even if API fails
    }
    removeHostFromLocal();
    navigate('/host-login');
  };

  if (!host) return null;

  return (
    <div
      className="min-h-screen p-4"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6 pt-4">

        {/* Host Info Header */}
        <Card style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(31,38,135,0.2)" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {host.avatar ? (
                    <img src={host.avatar} alt="avatar" className="w-16 h-16 rounded-full border-3 border-green-400 object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-3 border-green-400">
                      <Crown size={28} className="text-green-600" />
                    </div>
                  )}
                  <span className="absolute -top-2 -right-2 text-xl">👑</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-green-700" style={{ fontFamily: "'Comic Neue', cursive" }}>
                    {host.name}
                  </h1>
                  <p className="text-gray-600 text-sm">@{host.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-700 font-semibold text-xs flex items-center"><Users size={14} className="mr-1" />Online: {onlineUserCount}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Choose Avatar */}
        <Card style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(31,38,135,0.2)" }}>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Comic Neue', cursive" }}>
              👑 Host Avatar
            </h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {predefinedAvatars.map((avatar) => (
                <button
                  key={avatar.path}
                  type="button"
                  className={`rounded-full border-3 p-1 transition-all duration-200 ${selectedAvatar === avatar ? 'border-green-500 scale-110 shadow-lg' : 'border-gray-200 hover:border-green-300'}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img src={avatar.path} alt={avatar.name} className="w-14 h-14 object-cover rounded-full" />
                </button>
              ))}
            </div>
            <Button variant="banana" className="w-full" onClick={handleSaveAvatar} disabled={isSubmittingAvatar}>
              {isSubmittingAvatar ? 'Saving...' : 'Save Avatar'}
            </Button>
          </CardContent>
        </Card>

        {/* Pending Players */}
        <Card style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(31,38,135,0.2)" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2" style={{ fontFamily: "'Comic Neue', cursive" }}>
                <Users size={22} /> Pending Players ({pendingPlayers.length})
              </h2>
              <Button variant="outline" size="sm" onClick={fetchPlayers} disabled={loadingPlayers}>
                {loadingPlayers ? '...' : '🔄 Refresh'}
              </Button>
            </div>
            {pendingPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending players</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pendingPlayers.map((player) => (
                  <div key={player._id} className="flex flex-col items-center bg-orange-50 rounded-xl p-3 border border-orange-200 gap-2">
                    <div className="flex items-center gap-2">
                      {player.avatar ? (
                        <img src={player.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-orange-300" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-base">🎮</div>
                      )}
                      <div>
                        <p className="font-bold text-xs">{player.name}</p>
                        <p className="text-gray-500 text-[10px]">@{player.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1 text-xs" onClick={() => handleApprove(player._id)}>
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 flex-1 text-xs" onClick={() => handleReject(player._id)}>
                        <XCircle size={14} className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Players */}
        <Card style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(31,38,135,0.2)" }}>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2" style={{ fontFamily: "'Comic Neue', cursive" }}>
              <UserCheck size={22} /> Approved Players ({approvedPlayers.length})
            </h2>
            {approvedPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No approved players yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {approvedPlayers.map((player) => (
                  <div key={player._id} className="flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-200">
                    {player.avatar ? (
                      <img src={player.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-green-300" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">🎮</div>
                    )}
                    <div>
                      <p className="font-bold text-xs">{player.name}</p>
                      <p className="text-gray-500 text-[10px]">@{player.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejected Players */}
        <Card style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px 0 rgba(31,38,135,0.2)" }}>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2" style={{ fontFamily: "'Comic Neue', cursive" }}>
              <XCircle size={22} /> Rejected Players ({rejectedPlayers.length})
            </h2>
            {rejectedPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No rejected players</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {rejectedPlayers.map((player) => (
                  <div key={player._id} className="flex items-center justify-between bg-red-50 rounded-xl p-3 border border-red-200">
                    <div className="flex items-center gap-2">
                      {player.avatar ? (
                        <img src={player.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-red-300" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm">🎮</div>
                      )}
                      <div>
                        <p className="font-bold text-xs">{player.name}</p>
                        <p className="text-gray-500 text-[10px]">@{player.username}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleApprove(player._id)}>
                      <CheckCircle size={14} className="mr-1" /> Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostDashboard;
