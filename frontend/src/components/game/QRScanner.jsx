import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import CameraPopup from '../popup/cameraPopup';
import Heading from '@/components/ui/Heading';
import { useState } from 'react';

const QRScanner = ({ onQRScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <>
      <Card variant="glass" style={{backgroundColor: 'rgba(0, 194, 65, 0.63)'}}>
        <CardContent variant="glass">
          {/* Header */}
          <div className="flex items-center justify-between gap-6">
            <Heading icon={ScanLine} align="center">
              QR Scanner
            </Heading>
            <Button onClick={() => setIsScanning(true)} variant="banana" size="sm" className="btn-cute-pink">
              Scan QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
      {isScanning && (
        <CameraPopup 
          setIsScanning={setIsScanning} 
          onQRScanSuccess={onQRScanSuccess}
        />
      )}
    </>
  );
};

export default QRScanner;