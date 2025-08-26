import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer } from "lucide-react";

interface QRCodeDisplayProps {
  data: {
    name: string;
    type: "individual" | "student";
    assignedPlays: number;
    amountPaid?: number;
    token: string; // ✅ Added token
  };
}

const QRCodeDisplay = ({ data }: QRCodeDisplayProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Encode token in QR
        const qrData = JSON.stringify({ token: data.token });

        const url = await QRCode.toDataURL(qrData, {
          width: 600,
          margin: 2,
          color: {
            dark: "#000000", // ✅ Black
            light: "#FFFFFF", // ✅ White
          },
        });

        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [data]);

  // Download QR
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `strike-a-light-${data.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.png`;
    link.click();
  };

  // Share QR
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Strike A Light QR Code",
          text: `QR Code for ${data.name}`,
          url: qrCodeUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(qrCodeUrl);
        alert("QR Code link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        alert("Sharing not supported on this device.");
      }
    }
  };

  // Print QR
  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
            }
            img { max-width: 250px; }
            .info { margin-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-gradient-card border-primary/20 glow-effect">
      <CardHeader className="text-center">
        <CardTitle className="font-orbitron text-primary text-lg sm:text-xl">
          Strike A Light QR Code
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Scan this code on the gaming machine
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div ref={printRef} className="flex flex-col items-center">
          {qrCodeUrl && (
            <div className="p-4 bg-white rounded-lg border border-primary/30">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-56 sm:w-64 h-auto"
              />
            </div>
          )}
          <div className="text-center space-y-1 mt-3">
            <p className="font-orbitron text-lg text-primary">{data.name}</p>
            <p className="text-sm text-secondary">
              Plays: <span className="font-bold">{data.assignedPlays}</span>
            </p>
            {data.amountPaid !== undefined && (
              <p className="text-xs text-muted-foreground">
                Paid: ₹{data.amountPaid}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
