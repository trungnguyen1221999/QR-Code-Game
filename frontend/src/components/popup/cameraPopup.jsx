import React from 'react';
import { Camera, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Overlayer from './Overlayer';
import Heading from '@/components/ui/Heading';

const CameraPopup = ({ setIsScanning, isOpen = true }) => {
  return (
    <Overlayer isOpen={isOpen} onClose={() => setIsScanning(false)}>
      <Card variant="glass" className="w-full max-w-md">
        <CardContent variant="glass">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Heading icon={Camera} align="left">
              Camera Scanner
            </Heading>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-red-500 hover:bg-red-100"
              onClick={() => setIsScanning(false)}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Camera Preview Area */}
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4 flex-col gap-4">
            <img 
              src="/capy.gif" 
              alt="Camera preview" 
              className="w-32 object-cover rounded-lg" 
            />
            <div className="text-center">
              <p className="text-lg font-bold text-banana-green-600 font-cute-text">
                Let's scan some QR!"
              </p>
              <p className="text-sm text-gray-600 mt-1">
                🌿 Ready for challenge? 🌿
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="banana"
              className="flex-1"
              onClick={() => {
                console.log('Scanning...');
              }}
            >
              <Camera size={18} className="mr-2" />
              Scan QR Code
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsScanning(false)}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </Overlayer>
  );
};

export default CameraPopup;