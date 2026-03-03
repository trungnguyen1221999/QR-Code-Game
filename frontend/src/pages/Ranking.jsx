import { useState } from 'react';
import { Trophy, Medal, Crown, Star, Users, Calendar } from 'lucide-react';

const Ranking = () => {
  const [activeTab, setActiveTab] = useState('weekly');

  // Mock data cho ranking
  const rankingData = {
    weekly: [
      { rank: 1, name: 'NguyenVanA', score: 2450, avatar: '👑', change: '+3' },
      { rank: 2, name: 'TranThiB', score: 2380, avatar: '🎯', change: '+1' },
      { rank: 3, name: 'LeVanC', score: 2320, avatar: '🚀', change: '-1' },
      { rank: 4, name: 'PhamThiD', score: 2280, avatar: '⭐', change: '+2' },
      { rank: 5, name: 'HoangVanE', score: 2240, avatar: '🎮', change: '0' },
      { rank: 6, name: 'VuThiF', score: 2200, avatar: '🌟', change: '-2' },
      { rank: 7, name: 'DangVanG', score: 2160, avatar: '🔥', change: '+1' },
      { rank: 8, name: 'BuiThiH', score: 2120, avatar: '💫', change: '-1' }
    ],
    monthly: [
      { rank: 1, name: 'TranThiB', score: 9850, avatar: '🎯', change: '+2' },
      { rank: 2, name: 'NguyenVanA', score: 9720, avatar: '👑', change: '-1' },
      { rank: 3, name: 'PhamThiD', score: 9680, avatar: '⭐', change: '+5' },
      { rank: 4, name: 'LeVanC', score: 9540, avatar: '🚀', change: '0' },
      { rank: 5, name: 'VuThiF', score: 9420, avatar: '🌟', change: '+3' }
    ],
    alltime: [
      { rank: 1, name: 'NguyenVanA', score: 45600, avatar: '👑', change: '0' },
      { rank: 2, name: 'TranThiB', score: 42800, avatar: '🎯', change: '+1' },
      { rank: 3, name: 'LeVanC', score: 39200, avatar: '🚀', change: '-1' },
      { rank: 4, name: 'PhamThiD', score: 37500, avatar: '⭐', change: '+2' },
      { rank: 5, name: 'HoangVanE', score: 35800, avatar: '🎮', change: '0' }
    ]
  };

  const tabs = [
    { id: 'weekly', label: 'This Week', icon: Calendar },
    { id: 'monthly', label: 'This Month', icon: Users },
    { id: 'alltime', label: 'All Time', icon: Crown }
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={24} className="text-yellow-500" />;
      case 2: return <Medal size={24} className="text-gray-400" />;
      case 3: return <Trophy size={24} className="text-amber-600" />;
      default: return <Star size={16} className="text-banana-green-400" />;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-banana-gradient';
    }
  };

  return (
    <div className="min-h-screen bg-banana-gradient py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-bounce-cute mb-6">
            <span className="text-6xl">🏆</span>
          </div>
          <h1 className="text-5xl font-bold text-banana-green-dark mb-6 text-shadow-cute">
            Leaderboard
          </h1>
          <p className="text-xl text-banana-green max-w-3xl mx-auto">
            Check your rank and compete with top players!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card-cute text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-banana-green-dark">1,234</div>
            <div className="text-sm text-banana-green">Total Players</div>
          </div>
          <div className="card-cute text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-banana-green-dark">456</div>
            <div className="text-sm text-banana-green">Online Now</div>
          </div>
          <div className="card-cute text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-banana-green-dark">2,580</div>
            <div className="text-sm text-banana-green">Highest Score This Week</div>
          </div>
          <div className="card-cute text-center">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-2xl font-bold text-banana-green-dark">89</div>
            <div className="text-sm text-banana-green">Challenges Completed</div>
          </div>
        </div>

        {/* Ranking Tabs */}
        <div className="card-cute mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-cute transition-all duration-300 ${
                  activeTab === id
                    ? 'btn-banana shadow-cute-lg transform scale-105'
                    : 'glass-banana hover:bg-cute-pink'
                }`}
              >
                <Icon size={18} />
                <span className="font-semibold">{label}</span>
              </button>
            ))}
          </div>

          {/* Top 3 Podium */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center text-banana-green-dark mb-6">
              🏆 Top 3 {activeTab === 'weekly' ? 'This Week' : activeTab === 'monthly' ? 'This Month' : 'All Time'}
            </h3>
            
            <div className="flex justify-center items-end space-x-4 mb-8">
              {rankingData[activeTab].slice(0, 3).map((player, index) => {
                const positions = [1, 0, 2]; // Second place in middle, first on left, third on right
                const actualIndex = positions[index];
                const actualPlayer = rankingData[activeTab][actualIndex];
                const heights = ['h-32', 'h-40', 'h-28'];
                
                return (
                  <div
                    key={actualPlayer.rank}
                    className={`card-cute ${getRankBadge(actualPlayer.rank)} text-center text-white ${heights[index]} flex flex-col justify-end p-4 hover-wiggle`}
                  >
                    <div className="text-4xl mb-2">{actualPlayer.avatar}</div>
                    <div className="text-lg font-bold">{actualPlayer.name}</div>
                    <div className="text-sm opacity-90">{actualPlayer.score.toLocaleString()} pts</div>
                    <div className="flex items-center justify-center mt-2">
                      {getRankIcon(actualPlayer.rank)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Ranking List */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-banana-green-dark mb-4 flex items-center space-x-2">
              <Trophy size={24} />
              <span>Full Leaderboard</span>
            </h3>
            
            {rankingData[activeTab].map((player) => (
              <div
                key={`${activeTab}-${player.rank}`}
                className={`flex items-center justify-between p-4 rounded-cute transition-all duration-300 hover:scale-102 ${
                  player.rank <= 3
                    ? `${getRankBadge(player.rank)} text-white shadow-cute-lg`
                    : 'glass-banana hover:bg-cute-pink'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20">
                    {getRankIcon(player.rank)}
                  </div>
                  
                  <div className="text-3xl">{player.avatar}</div>
                  
                  <div>
                    <div className="font-bold text-lg">{player.name}</div>
                    <div className="text-sm opacity-80">
                      Hạng #{player.rank}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold">
                    {player.score.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-80">điểm</div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`text-sm font-semibold px-2 py-1 rounded ${
                    player.change.startsWith('+')
                      ? 'bg-green-100 text-green-700'
                      : player.change.startsWith('-')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {player.change !== '0' ? player.change : '−'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Rank (Mock) */}
        <div className="card-cute text-center glass-banana">
          <h3 className="text-xl font-bold text-banana-green-dark mb-4">
            Your Rank
          </h3>
          <div className="flex items-center justify-center space-x-6">
            <div>
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-bold text-banana-green-dark">You</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-banana-green-dark">#42</div>
              <div className="text-banana-green">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-banana-green-dark">1,850</div>
              <div className="text-banana-green">Points</div>
            </div>
          </div>
          <button className="btn-banana mt-4 inline-flex items-center space-x-2">
            <span>Play to Rank Up</span>
            <Trophy size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ranking;