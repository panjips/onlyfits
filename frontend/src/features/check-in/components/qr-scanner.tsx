import { useEffect } from "react";
import { useQrScanner } from "../hooks/useQrScanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  ScanLine,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface QrScannerProps {
  onScan?: (result: string) => void;
  className?: string;
}

export default function QrScanner({ onScan, className = "" }: QrScannerProps) {
  const { start, stop, isScanning, result, status, error } = useQrScanner();

  // Handle scan result
  useEffect(() => {
    if (result && onScan) {
      onScan(result);
    }
  }, [result, onScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleToggle = async () => {
    if (isScanning) {
      await stop();
    } else {
      await start();
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "scanning":
        return (
          <Badge variant="lightSuccess" className="text-xs">
            Scanning
          </Badge>
        );
      case "requesting-permission":
        return (
          <Badge variant="lightWarning" className="text-xs">
            Requesting Access
          </Badge>
        );
      case "permission-denied":
        return (
          <Badge variant="lightError" className="text-xs">
            Permission Denied
          </Badge>
        );
      case "error":
        return (
          <Badge variant="lightError" className="text-xs">
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="gray" className="text-xs">
            Stopped
          </Badge>
        );
    }
  };

  const renderPlaceholder = () => {
    if (status === "requesting-permission") {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-xl">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-16 h-16 opacity-50 animate-spin" />
            <span className="text-sm font-medium">
              Requesting Camera Access...
            </span>
            <span className="text-xs text-center px-4">
              Please allow camera access when prompted
            </span>
          </div>
        </div>
      );
    }

    if (status === "permission-denied") {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-lighterror/30 rounded-xl">
          <div className="flex flex-col items-center gap-3 text-error">
            <ShieldAlert className="w-16 h-16 opacity-70" />
            <span className="text-sm font-medium">Camera Access Denied</span>
            <span className="text-xs text-center px-4 text-muted-foreground">
              Please enable camera permissions in your browser settings
            </span>
          </div>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-lighterror/30 rounded-xl">
          <div className="flex flex-col items-center gap-3 text-error">
            <CameraOff className="w-16 h-16 opacity-70" />
            <span className="text-sm font-medium">Scanner Error</span>
            <span className="text-xs text-center px-4 text-muted-foreground max-w-[200px]">
              {error || "An error occurred while accessing the camera"}
            </span>
          </div>
        </div>
      );
    }

    // Default idle state
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-xl">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Camera className="w-16 h-16 opacity-50" />
          <span className="text-sm font-medium">Camera Off</span>
          <span className="text-xs text-center px-4">
            Click the button below to start scanning
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ScanLine className="w-4 h-4" />
          QR Scanner
        </h3>
        {getStatusBadge()}
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* QR Reader Container */}
        <div className="relative w-full max-w-[350px] aspect-square mb-6">
          {/* Scanning Frame */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/10">
            <div
              id="qr-reader"
              className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>video]:rounded-xl"
            />

            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

            {/* Scanning Animation */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div
                  className="absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent animate-pulse"
                  style={{
                    animation: "scanLine 2s linear infinite",
                    top: "50%",
                  }}
                />
              </div>
            )}

            {/* Placeholder when not scanning */}
            {!isScanning && renderPlaceholder()}
          </div>
        </div>

        {/* Control Button */}
        <Button
          onClick={handleToggle}
          size="lg"
          variant={isScanning ? "destructive" : "default"}
          className="min-w-[180px] gap-2"
          disabled={status === "requesting-permission"}
        >
          {status === "requesting-permission" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Requesting Access...
            </>
          ) : isScanning ? (
            <>
              <CameraOff className="w-5 h-5" />
              Stop Scanner
            </>
          ) : status === "permission-denied" ? (
            <>
              <Camera className="w-5 h-5" />
              Try Again
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Start Scanner
            </>
          )}
        </Button>
      </div>

      {/* Add scanning animation keyframes */}
      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-150px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
