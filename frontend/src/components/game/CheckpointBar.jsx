import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/Heading";

const CheckpointBar = ({ currentCheckpoint = 0 }) => {
  const [progress, setProgress] = useState(0);
  const maxCheckpoints = 7; // Fixed number of checkpoints

  useEffect(() => {
    // Calculate progress percentage
    const progressPercent = (currentCheckpoint / maxCheckpoints) * 100;
    setProgress(progressPercent);
  }, [currentCheckpoint]);

  return (
    <Card style={{backgroundColor: 'rgba(255, 12, 4, 0.582)'}}>
      <CardContent variant="glass">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Heading icon={Target} align="left">
              Your Journey
            </Heading>
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
       
      </CardContent>
    </Card>
  );
};

export default CheckpointBar;