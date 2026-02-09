import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import QrScanner from "../components/qr-scanner";
import { CheckInLog } from "../components/check-in-log";
import { scannerMutation, type ScannerResponse } from "../api";
import { useSessionActivities } from "../hooks";
import { useUser } from "@/provider/user-provider";
import type { BaseResponse } from "@/lib/apitool/response";

export function ScannerPage() {
  const { user } = useUser();
  const branchId = user?.branchId;

  const { entries, isLoading, invalidateActivities } = useSessionActivities({
    branchId,
  });

  const { mutate: scanToken } = useMutation({
    ...scannerMutation,
    onSuccess: (data) => {
      scannerMutation.onSuccess(data);
      // Refresh the session activities after a successful scan
      invalidateActivities();
    },
    onError: (error: AxiosError<BaseResponse<ScannerResponse>>) => {
      scannerMutation.onError(error);
    },
  });

  const handleScan = useCallback(
    (result: string) => {
      // Parse the QR code result - this is the token from the QR code
      const token = result.trim();

      if (!token) {
        return;
      }

      // Post the token to the scanner endpoint
      scanToken({ token });
    },
    [scanToken],
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left Side - QR Scanner */}
      <div className="lg:w-1/2 xl:w-2/5">
        <div className="border border-ld rounded-lg overflow-hidden h-full min-h-[500px] bg-card">
          <QrScanner onScan={handleScan} />
        </div>
      </div>

      {/* Right Side - Check-in Log */}
      <div className="lg:w-1/2 xl:w-3/5 flex-1">
        <div className="border border-ld rounded-lg overflow-hidden h-full min-h-[500px] bg-card">
          <CheckInLog entries={entries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default ScannerPage;
