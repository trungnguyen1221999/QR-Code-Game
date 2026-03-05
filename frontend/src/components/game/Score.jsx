import React from 'react';
import { Coins } from 'lucide-react';

const Score = ({ score = 0, stars = 0 }) => {
  return (
    <div className="fixed top-20 right-4 z-[9998] flex items-center gap-4">
      {/* Score */}
      <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <Coins className="text-yellow-500" size={35} />
          <span className="font-bold text-red-500 font-cute-text text-xl">
            {score.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Score;