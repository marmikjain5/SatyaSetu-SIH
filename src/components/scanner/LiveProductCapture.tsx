import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles, Upload, Package, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScanStore } from '../../store/scanStore';
import { SAMPLE_PACKAGE_OPTIONS, SamplePackageOption } from '../../data/mockScans';

export const LiveProductCapture: React.FC = () => {
  const { addImages, isProcessing, uploadedImages, loadSampleImage } = useScanStore();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        'Camera API is not supported or requires HTTPS. You can also browse/upload label files directly below or select a sample package.'
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
        setCameraError('Camera permission was denied. You can browse/upload label files or choose a sample package below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can browse/upload files below.');
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

  const handleSelectSample = async (sample: SamplePackageOption) => {
    setLoadingSampleId(sample.id);
    try {
      await loadSampleImage(sample.imagePath, `${sample.id}.jpg`);
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addImages(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {!isCameraActive ? (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Camera className="h-7 w-7" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Product Packaging Verification
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Take a live photo or upload packaging labels to verify mandatory Legal Metrology & FSSAI statutory declarations.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3 flex-wrap justify-center">
              <Button
                variant="primary"
                onClick={handleStartCamera}
                disabled={isInitializing || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 shadow-sm text-xs gap-2"
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-xs gap-2 px-5 py-2.5 font-medium"
              >
                <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span>Upload Packaging File</span>
              </Button>
            </div>

            {uploadedImages.length > 0 && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{uploadedImages.length} {uploadedImages.length === 1 ? 'label' : 'labels'} queued and ready for declaration verification</span>
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
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <div className="font-semibold">Camera Notice</div>
              <div className="mt-0.5">{cameraError}</div>
            </div>
          </div>
        )}

        {/* Quick Sample Packaging Declarations */}
        {!isCameraActive && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Or Test With Sample Manufacturer Declaration Packs</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">1-Click Load</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SAMPLE_PACKAGE_OPTIONS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  disabled={isProcessing || loadingSampleId === sample.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs text-left transition-all group disabled:opacity-50"
                >
                  <img
                    src={sample.imagePath}
                    alt={sample.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 transition-colors">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {sample.category}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-1 font-semibold flex items-center gap-1">
                      {loadingSampleId === sample.id ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <span>Load Sample Pack →</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

