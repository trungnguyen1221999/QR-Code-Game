import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const CheckpointBar = ({ currentCheckpoint = 0 }) => {
  const [progress, setProgress] = useState(0);
  const maxCheckpoints = 7; // Fixed number of checkpoints

  useEffect(() => {
    // Calculate progress percentage
    const progressPercent = (currentCheckpoint / maxCheckpoints) * 100;
    setProgress(progressPercent);
  }, [currentCheckpoint]);

  return (
    <Card className="p-0" style={{ 
      background: "rgba(255, 255, 255, 0.6)", 
      backdropFilter: "blur(10px)", 
      border: "none",
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    }}>
      <CardContent className="p-0">
        <div className="w-full bg-transparent rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-banana-green-dark flex items-center space-x-2">
              <Target size={24} />
              <span>Your Journey</span>
            </h3>
            <div className="text-sm text-banana-green">
              {currentCheckpoint} / {maxCheckpoints}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-banana-green-400 to-banana-green-600 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckpointBar;