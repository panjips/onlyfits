import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { QrCode, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { memberQrQuery } from "../api";

export const BannerWelcome = () => {
  const [showQR, setShowQR] = useState(false);

  const {
    data: qrData,
    isLoading: isQrLoading,
    isError: isQrError,
    error: qrError,
    refetch: refetchQr,
  } = useQuery({
    ...memberQrQuery,
    gcTime: 0,
    staleTime: 0,
    enabled: showQR, 
  });

  const handleOpenQR = () => {
    setShowQR(true);
  };

  const handleCloseQR = () => {
    setShowQR(false);
  };

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-lightsecondary rounded-lg p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center gap-3 sm:gap-4 z-10">
        <div className="relative shrink-0">
          <img
            src={"/profile/user-2.webp"}
            alt="user-img"
            width={48}
            height={48}
            className="rounded-xl border-2 border-white/20 shadow-lg sm:w-14 sm:h-14"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex flex-col gap-0.5">
          <h5 className="card-title text-lg sm:text-xl font-bold">
            Welcome back! John 👋
          </h5>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Ready to track your fitness journey?
          </p>
        </div>
      </div>

      {/* Button group */}
      <div className="flex gap-2 sm:gap-3 items-center z-10">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none bg-white/80 hover:bg-white border-white/30 text-primary hover:text-primary shadow-sm"
          onClick={handleOpenQR}
        >
          <QrCode className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">QR Code</span>
        </Button>
        <Button
          asChild
          size="sm"
          className="flex-1 sm:flex-none shadow-sm bg-primary hover:bg-primary/90"
        >
          <Link to="/analyze">
            <TrendingUp className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Full Analysis</span>
          </Link>
        </Button>
      </div>

      {/* Background decorative elements */}
      <div className="hidden sm:block absolute right-0 top-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>
      <div className="hidden sm:block absolute -right-8 -bottom-4 z-0 pointer-events-none opacity-60">
        <img
          src={"/backgrounds/dumbbell.webp"}
          alt="support-img"
          width={120}
          height={120}
          className="transform rotate-12"
        />
      </div>
      <div className="hidden sm:block absolute right-8 top-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
      <div className="hidden sm:block absolute right-16 bottom-8 w-1 h-1 bg-primary/50 rounded-full animate-pulse delay-300"></div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h4 className="mb-2 font-bold text-xl text-gray-900">
                Member QR Code
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Scan this code for quick check-in
              </p>

              {/* QR Code Display */}
              <div className="w-48 h-48 flex items-center justify-center rounded-xl mx-auto mb-6 border bg-white p-3">
                {isQrLoading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-xs">Loading QR Code...</p>
                  </div>
                ) : isQrError ? (
                  <div className="flex flex-col items-center gap-2 text-red-500">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-xs text-center">
                      {qrError instanceof Error
                        ? qrError.message
                        : "Failed to load QR"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchQr()}
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                ) : qrData?.token ? (
                  <QRCode
                    value={qrData.token}
                    size={168}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox="0 0 256 256"
                    level="M"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <QrCode className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-xs">No QR data available</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleCloseQR}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
