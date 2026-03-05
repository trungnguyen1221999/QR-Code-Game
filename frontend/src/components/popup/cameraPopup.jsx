import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Overlayer from './Overlayer';
import Heading from '@/components/ui/Heading';
import QrScanner from 'qr-scanner';
import toast from 'react-hot-toast';

const CameraPopup = ({ setIsScanning, isOpen = true }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanningState] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      if (qrScannerRef.current) {
        await qrScannerRef.current.start();
        return;
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          toast.success(`QR Code: ${result.data}`, {
            duration: 3000,
            position: 'top-center',
          });
          
          // Handle QR code result here
          handleQRResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setIsScanningState(true);
    } catch (error) {
      console.error('Camera error:', error);
      setHasCamera(false);
      toast.error('Cannot access camera. Please check permissions.');
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      setIsScanningState(false);
    }
  };

  const handleQRResult = (data) => {
    // Process QR code data here
    console.log('Processing QR data:', data);
    
    // Close scanner after successful scan
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  const handleClose = () => {
    stopScanner();
    setIsScanning(false);
  };
  return (
    <Overlayer isOpen={isOpen} onClose={handleClose}>
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
              onClick={handleClose}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Camera Preview Area */}
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4 overflow-hidden">
            {hasCamera ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                playsInline
                muted
              />
            ) : (
              <div className="text-center flex flex-col items-center">
                <img 
                  src="/capy.gif" 
                  alt="Camera preview" 
                  className="w-32 object-cover rounded-lg mb-4" 
                />
                <div className="text-center">
                  <p className="text-lg font-bold text-red-500 font-cute-text">
                    "Camera not available!"
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    🚫 Please allow camera access 🚫
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="banana"
              className="flex-1"
              onClick={isScanning ? stopScanner : startScanner}
              disabled={!hasCamera}
            >
              <Camera size={18} className="mr-2" />
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleClose}
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