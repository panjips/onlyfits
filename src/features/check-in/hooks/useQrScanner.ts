import { useCallback, useRef, useState } from "react";
import { 
  startQrScanner, 
  stopQrScanner, 
  checkCameraPermission,
  type CameraPermissionStatus 
} from "../utils/qrScanner";

export type ScannerStatus = 
  | "idle" 
  | "requesting-permission"
  | "scanning" 
  | "permission-denied" 
  | "error";

interface UseQrScannerReturn {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  isScanning: boolean;
  result: string | null;
  status: ScannerStatus;
  error: string | null;
  permissionStatus: CameraPermissionStatus;
  checkPermission: () => Promise<CameraPermissionStatus>;
}

export function useQrScanner(): UseQrScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>("unknown");
  
  const isStartingRef = useRef(false);
  const isScanningRef = useRef(false);

  const checkPermission = useCallback(async (): Promise<CameraPermissionStatus> => {
    const permission = await checkCameraPermission();
    setPermissionStatus(permission);
    return permission;
  }, []);

  const stop = useCallback(async () => {
    try {
      await stopQrScanner();
    } catch (err) {
      console.error("Failed to stop scanner", err);
    } finally {
      setIsScanning(false);
      setStatus("idle");
      isScanningRef.current = false;
    }
  }, []);

  const start = useCallback(async () => {
    // Prevent double-starts
    if (isScanningRef.current || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;
    setError(null);
    setStatus("requesting-permission");

    try {
      await startQrScanner({
        elementId: "qr-reader",
        onSuccess: (decodedText) => {
          setResult(decodedText);
          // Use stopQrScanner directly to avoid closure issues
          stopQrScanner().then(() => {
            setIsScanning(false);
            setStatus("idle");
            isScanningRef.current = false;
          });
        },
        onError: () => {},
      });

      setIsScanning(true);
      setStatus("scanning");
      setPermissionStatus("granted");
      isScanningRef.current = true;
    } catch (err) {
      console.error("Failed to start scanner:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      
      if (errorMessage.includes("permission") || errorMessage.includes("denied")) {
        setStatus("permission-denied");
        setPermissionStatus("denied");
      } else {
        setStatus("error");
      }
      
      setIsScanning(false);
      isScanningRef.current = false;
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  return {
    start,
    stop,
    isScanning,
    result,
    status,
    error,
    permissionStatus,
    checkPermission,
  };
}
