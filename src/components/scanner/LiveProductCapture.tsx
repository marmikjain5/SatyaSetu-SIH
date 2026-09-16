import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, AlertCircle, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScanStore } from '../../store/scanStore';

export const LiveProductCapture: React.FC = () => {
  const { addImages, isProcessing, uploadedImages } = useScanStore();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showTunnelHelp, setShowTunnelHelp] = useState(false);

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

    // 1. Insecure context detection (e.g. phone accessing http://192.168.x.x:3000)
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError('Camera requires a secure connection. Open SatyaDrishti using HTTPS on your phone.');
      setIsInitializing(false);
      return;
    }

    // 2. Browser API support check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera API is unavailable. Mobile browsers require HTTPS for camera hardware access. Open SatyaDrishti using HTTPS on your phone.'
      );
      setIsInitializing(false);
      return;
    }

    try {
      // Rear camera preference for inspecting product packaging
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

      // Attach stream to video element
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
        setCameraError(
          'Camera permission was denied. Please allow camera permissions in your browser site settings to capture product packaging declarations.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please connect an external camera or open on a mobile phone.');
      } else {
        setCameraError(
          `Unable to access camera: ${err.message || 'Unknown device error'}. Mobile browsers require HTTPS for camera access.`
        );
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
        // Stop camera tracks immediately after capture to release hardware
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
    <Card className="border-indigo-200/80 dark:border-indigo-900/60 shadow-sm overflow-hidden">
      <CardContent className="p-3 sm:p-6 space-y-4">
        {!isCameraActive ? (
          /* Idle State: Dedicated Live Camera trigger ONLY (Mobile-First) */
          <div className="flex flex-col items-center justify-center text-center p-5 sm:p-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Camera className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="max-w-md space-y-1 px-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Live Product Packaging
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Capture the mandatory declaration panel.
              </p>
            </div>

            {/* Primary Action Button — Strictly Live Camera */}
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="primary"
                onClick={handleStartCamera}
                disabled={isInitializing || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-xs sm:text-sm gap-2 w-full sm:w-auto min-h-[44px] justify-center"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Requesting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Start Camera</span>
                  </>
                )}
              </Button>
            </div>

            {/* Small note on mobile HTTPS requirement */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Camera access requires HTTPS on mobile.
            </p>

            {uploadedImages.length > 0 && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  {uploadedImages.length} {uploadedImages.length === 1 ? 'live photo' : 'live photos'} queued for verification
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Live Camera Viewfinder (Mobile-First responsive viewfinder) */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl w-full min-h-[260px] max-h-[55vh] flex items-center justify-center mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover min-h-[260px] max-h-[55vh]"
              />

              {/* Viewfinder Target Framing Overlay */}
              <div className="absolute inset-4 sm:inset-8 pointer-events-none border border-white/30 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-indigo-400"></div>
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[11px] font-mono text-white/95">
                    Align Statutory Declaration Panel
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-indigo-400"></div>
                </div>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                <span>Live Feed</span>
              </div>
            </div>

            {/* Minimal UI: Large thumb-friendly capture trigger + cancel */}
            <div className="flex items-center justify-center gap-6 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Cancel Camera"
                aria-label="Cancel live capture"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 64px Thumb-friendly circular capture trigger */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-lg ring-4 ring-indigo-300 dark:ring-indigo-900/60 transition-all focus:outline-none"
                title="Capture Photo"
                aria-label="Capture photo of packaging"
              >
                <Camera className="h-7 w-7" />
              </button>
            </div>
          </div>
        )}

        {/* Camera Error / Permission Notice — Shown ONLY after initialization fails */}
        {cameraError && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3.5 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="space-y-0.5">
                <div className="font-bold">Camera Access Notice</div>
                <div className="leading-relaxed">{cameraError}</div>
              </div>
            </div>

            {/* Collapsible HTTPS Tunneling Helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTunnelHelp(!showTunnelHelp)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                <span>How to enable camera on mobile (HTTPS)</span>
                {showTunnelHelp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showTunnelHelp && (
                <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900/40 text-[11px] space-y-2 text-slate-700 dark:text-slate-300 font-sans">
                  <p>
                    Mobile browsers strictly require an <strong>HTTPS connection</strong> to access hardware sensors. Use a quick tunnel on your development computer:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded font-mono text-[10px] space-y-1 text-slate-800 dark:text-slate-200">
                    <div># Option A: Cloudflare Tunnel (Free, instant)</div>
                    <div className="text-blue-600 dark:text-blue-400 font-bold">cloudflared tunnel --url http://localhost:3000</div>
                    <div className="pt-1"># Option B: ngrok</div>
                    <div className="text-blue-600 dark:text-blue-400 font-bold">ngrok http 3000</div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                    Then open the generated <span className="font-mono">https://...</span> URL on your phone's browser.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
