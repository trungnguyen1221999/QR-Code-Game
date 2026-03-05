import { useState, useEffect } from 'react';
import { Crown, Trophy, Medal } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/Heading";

const RealTimeRanking = ({ currentUser }) => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for testing
  const mockRankings = [
    { 
      id: 1, 
      username: 'DragonSlayer99', 
      avatar: '/avatar/king.png', 
      checkpoint: 6, 
      totalCheckpoints: 7
    },
    { 
      id: 2, 
      username: 'NinjaCode', 
      avatar: '/avatar/stealth.png', 
      checkpoint: 5, 
      totalCheckpoints: 7
    },
    { 
      id: 3, 
      username: 'ChillMaster', 
      avatar: '/avatar/chill.png', 
      checkpoint: 4, 
      totalCheckpoints: 7
    },
    { 
      id: 4, 
      username: 'ProGamer2024', 
      avatar: '/avatar/gamer.png', 
      checkpoint: 3, 
      totalCheckpoints: 7
    },
    { 
      id: 5, 
      username: 'You', 
      avatar: currentUser?.avatar || '/avatar/chill.png', 
      checkpoint: currentUser?.checkpoint || 2, 
      totalCheckpoints: 7,
      isCurrentUser: true 
    }
  ];

  useEffect(() => {
    // Simple data loading
    const sortedRankings = mockRankings.sort((a, b) => {
      return b.checkpoint - a.checkpoint;
    });
    setRankings(sortedRankings);
    setIsLoading(false);
  }, [currentUser]);

  const getProgressBarColor = (rank) => {
    switch(rank) {
      case 1: return 'bg-red-500'; // Đỏ - cao nhất
      case 2: return 'bg-yellow-500'; // Vàng
      case 3: return 'bg-orange-500'; // Cam
      case 4: return 'bg-purple-500'; // Tím
      default: return 'bg-green-500'; // Xanh lá cây
    }
  };

  const getProgressPercentage = (checkpoint, totalCheckpoints) => {
    return ((checkpoint) / totalCheckpoints) * 100;
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={20} />;
      case 3: return <Medal className="text-orange-500" size={20} />;
      default: return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getLastUpdateText = (lastUpdate) => {
    const now = new Date().getTime();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent variant="glass">
          <div className="text-center text-gray-500">Loading rankings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" style={{backgroundColor: 'rgba(234, 178, 8, 0.493)'}}>
      <CardContent variant="glass">
        {/* Header */}
        <Heading icon={Trophy} align="center">
          Live Rankings
        </Heading>

        {/* Rankings List */}
        <div className="space-y-3">
        {rankings.map((player, index) => {
          const rank = index + 1;
          const progressPercentage = getProgressPercentage(player.checkpoint, player.totalCheckpoints);
          
          return (
            <div
              key={player.id}
              className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                player.isCurrentUser
                  ? 'bg-banana-green-50 border-banana-green-400'
                  : rank <= 3
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="space-y-2">
                {/* Rank only */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 flex justify-center">
                    {getRankIcon(rank)}
                  </div>
                </div>
                
                {/* Progress Bar with Avatar and Name */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(rank)}`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  {/* Name above avatar at same position */}
                  <div 
                    className="absolute -top-6 transform -translate-x-1/2"
                    style={{ left: `${Math.min(progressPercentage, 95)}%` }}
                  >
                    <h4 className={`font-semibold text-xs text-center whitespace-nowrap ${
                      player.isCurrentUser ? 'text-banana-green-dark' : 'text-gray-800'
                    }`}>
                      {player.username}
                      {player.isCurrentUser && <div className="text-banana-green-600 text-[10px]">(You)</div>}
                    </h4>
                  </div>
                  {/* Avatar positioned at the end of progress */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${Math.min(progressPercentage, 95)}%` }}
                  >
                    <img
                      src={player.avatar}
                      alt={player.username}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeRanking;