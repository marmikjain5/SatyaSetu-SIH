import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScanStore } from '../../store/scanStore';

export const LiveProductCapture: React.FC = () => {
  const { addImages, isProcessing, uploadedImages } = useScanStore();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop all camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsInitializing(false);
  }, []);

  // Cleanup on unmount or when analysis starts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (isProcessing) {
      stopCamera();
    }
  }, [isProcessing, stopCamera]);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera API is not supported or requires a secure context (HTTPS or localhost). If testing on a mobile device over HTTP, please enable insecure origins in browser flags or use HTTPS.'
      );
      setIsInitializing(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsInitializing(false);

      // Attach stream to video after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      setIsInitializing(false);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser to take a live photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Unable to access camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const fileName = `product-live-capture-${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          addImages([file]);
        }
        // Stop all camera tracks immediately after capture
        stopCamera();
      },
      'image/jpeg',
      0.95
    );
  };

  const handleCancel = () => {
    stopCamera();
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!isCameraActive ? (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Camera className="h-7 w-7" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Product Capture
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Take a live photo of your product packaging for declaration verification.
              </p>
            </div>

            {/* ONE Primary Action Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={handleStartCamera}
                disabled={isInitializing || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 shadow-sm text-xs gap-2"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Requesting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Take Live Photo</span>
                  </>
                )}
              </Button>
            </div>

            {uploadedImages.length > 0 && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                ✓ {uploadedImages.length} live {uploadedImages.length === 1 ? 'photo' : 'photos'} captured and ready for verification
              </div>
            )}
          </div>
        ) : (
          /* Live Camera Viewfinder */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg aspect-video max-h-[460px] flex items-center justify-center mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Overlay */}
              <div className="absolute inset-8 pointer-events-none border border-white/30 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-indigo-400"></div>
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-mono text-white/90">
                    Align Product Packaging Label
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="w-5 h-5 border-b-2 border-r-2 border-indigo-400"></div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                <span>Live Feed</span>
              </div>
            </div>

            {/* Camera Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs gap-1.5"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleCapturePhoto}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 px-6 py-2 shadow-md"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Photo</span>
              </Button>
            </div>
          </div>
        )}

        {/* Camera Error Alert */}
        {cameraError && (
          <div className="flex items-start gap-2.5 mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <div className="font-semibold">Camera Access Notice</div>
              <div className="mt-0.5">{cameraError}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
