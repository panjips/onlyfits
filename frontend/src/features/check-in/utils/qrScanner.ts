import { Html5Qrcode } from "html5-qrcode";
import type { Html5QrcodeError, Html5QrcodeResult } from "html5-qrcode/esm/core";

let html5QrCode: Html5Qrcode | null = null;

export type CameraPermissionStatus = "granted" | "denied" | "prompt" | "unknown";

interface StartQrScannerParams {
  elementId: string;
  onSuccess: (decodedText: string, result: Html5QrcodeResult) => void;
  onError: (errorMessage: string, error: Html5QrcodeError) => void;
  fps?: number;
  qrbox?: number;
  cameraId?: string;
}

/**
 * Check current camera permission status
 */
export const checkCameraPermission = async (): Promise<CameraPermissionStatus> => {
  try {
    // Check if permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName });
      return result.state as CameraPermissionStatus;
    }
    return "unknown";
  } catch {
    // Some browsers don't support querying camera permission
    return "unknown";
  }
};

/**
 * Request camera permission from user
 * Returns true if permission granted, false otherwise
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
      return false;
    }

    // Request camera access with a timeout race condition
    // This prevents hanging if the browser ignores the request
    const streamPromise = navigator.mediaDevices.getUserMedia({ 
      video: true 
    });
    
    // Create a timeout promise
    const timeoutPromise = new Promise<MediaStream>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 10000);
    });

    // Race the permission request against the timeout
    const stream = await Promise.race([streamPromise, timeoutPromise]);
    
    // Stop all tracks immediately - we just needed to request permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.warn("Camera permission request failed:", error);
    return false;
  }
};

/**
 * Get list of available cameras
 */
export const getCameras = async () => {
  try {
    return await Html5Qrcode.getCameras();
  } catch (error) {
    // Quietly fail
    return [];
  }
};

export const startQrScanner = async ({
  elementId,
  onSuccess,
  onError,
  fps = 10,
  qrbox = 250,
  cameraId,
}: StartQrScannerParams) => {
  // Stop any existing scanner first
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
      }
      await html5QrCode.clear();
    } catch (e) {
      // Ignore errors during cleanup
    }
    html5QrCode = null;
  }

  // Request camera permission first
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    throw new Error("Camera permission denied");
  }

  // Create new instance
  html5QrCode = new Html5Qrcode(elementId);

  try {
    await html5QrCode.start(
      cameraId || { facingMode: "environment" },
      { fps, qrbox },
      onSuccess,
      onError
    );
  } catch (startError) {
    console.error("Failed to start camera scan:", startError);
    html5QrCode = null;
    throw startError;
  }
};

export const stopQrScanner = async () => {
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
      }
      await html5QrCode.clear();
    } catch (e) {
      console.warn("Error stopping scanner:", e);
    } finally {
      html5QrCode = null;
    }
  }
};

export const isQrScannerRunning = () => {
  return html5QrCode?.isScanning ?? false;
};
