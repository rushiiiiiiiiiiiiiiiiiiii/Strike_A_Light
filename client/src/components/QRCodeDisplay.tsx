import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

interface QRCodeDisplayProps {
  data: {
    id: string;
    name: string;
    type: 'individual' | 'student';
    assignedPlays?: number;
  };
}

const QRCodeDisplay = ({ data }: QRCodeDisplayProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: data.id,
          name: data.name,
          type: data.type,
          assignedPlays: data.assignedPlays || 0,
          timestamp: Date.now(),
        });
        
        const url = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#00D4FF',
            light: '#1A1B23',
          },
        });
        
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [data]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `strike-a-light-${data.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Strike A Light QR Code',
          text: `QR Code for ${data.name}`,
          url: qrCodeUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-card border-primary/20 glow-effect">
      <CardHeader className="text-center">
        <CardTitle className="font-orbitron text-primary">
          Strike A Light QR Code
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Scan this code on the gaming machine
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {qrCodeUrl && (
            <div className="p-4 bg-background rounded-lg border border-primary/30">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 animate-glow-pulse"
              />
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2">
          <p className="font-orbitron text-lg text-primary">{data.name}</p>
          <p className="text-sm text-muted-foreground">ID: {data.id}</p>
          {data.assignedPlays && (
            <p className="text-sm text-secondary">
              Assigned Plays: {data.assignedPlays}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          {navigator.share && (
            <Button 
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;