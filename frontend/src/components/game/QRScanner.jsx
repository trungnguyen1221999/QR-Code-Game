import { useState, useRef } from 'react';
import { Camera, ScanLine, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera for QR scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast.error('Cannot access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    if (onClose) onClose();
  };

  // Mock QR code detection (in real app, use a QR code library like jsQR)
  const mockScanQR = () => {
    const mockQRCodes = [
      'CHECKPOINT_001', 'CHECKPOINT_002', 'CHECKPOINT_003',
      'CHECKPOINT_004', 'CHECKPOINT_005', 'CHECKPOINT_006',
      'FINAL_GAME'
    ];
    
    const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    
    setTimeout(() => {
      onScanSuccess(randomQR);
      stopScanning();
      toast.success(`QR Code detected: ${randomQR}`);
    }, 2000); // Simulate 2 second delay
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-banana-green-dark flex items-center space-x-2">
            <ScanLine size={24} />
            <span>QR Scanner</span>
          </h2>
          <Button onClick={stopScanning} variant="ghost" size="sm">
            <X size={20} />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative mb-6">
          {!isScanning ? (
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Ready to scan QR codes</p>
                <Button onClick={startScanning} className="btn-banana">
                  <Camera size={18} className="mr-2" />
                  Start Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-xl"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-4 border-banana-green-400 rounded-xl">
                <div className="absolute inset-4 border-2 border-dashed border-white opacity-75 rounded-lg">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white text-center">
                      <ScanLine size={32} className="mx-auto mb-2 animate-bounce-cute" />
                      <p className="text-sm font-semibold">Align QR code within frame</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {isScanning && (
            <Button 
              onClick={mockScanQR} 
              className="btn-banana w-full"
            >
              🎯 Mock Scan QR Code
            </Button>
          )}
          
          <Button 
            onClick={stopScanning} 
            variant="outline"
            className="w-full border-banana-green-300"
          >
            Cancel
          </Button>
        </div>

        {hasPermission === false && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Camera access denied. Please enable camera permissions and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;