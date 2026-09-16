import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Play, Square, RefreshCw, X, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface LiveFactoryVideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, videoUrl: string, snapshotDataUrl: string) => void;
  onReset: () => void;
  recordedVideoUrl: string | null;
  isAnalyzing: boolean;
  onRunAssessment: () => void;
  analysisStatus: string;
}

export const LiveFactoryVideoRecorder: React.FC<LiveFactoryVideoRecorderProps> = ({
  onVideoRecorded,
  onReset,
  recordedVideoUrl,
  isAnalyzing,
  onRunAssessment,
  analysisStatus,
}) => {
  const [recorderState, setRecorderState] = useState<'idle' | 'preview' | 'recording'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showTunnelHelp, setShowTunnelHelp] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Stop camera tracks helper
  const stopCameraTracks = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
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
    setRecorderState('idle');
    setRecordingTime(0);
    setIsInitializing(false);
  }, []);

  // Cleanup on unmount or when analysis starts
  useEffect(() => {
    return () => {
      stopCameraTracks();
    };
  }, [stopCameraTracks]);

  useEffect(() => {
    if (isAnalyzing) {
      stopCameraTracks();
    }
  }, [isAnalyzing, stopCameraTracks]);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);

    // 1. Insecure context detection
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError('Camera requires a secure connection. Open SatyaDrishti using HTTPS on your phone.');
      setIsInitializing(false);
      setRecorderState('idle');
      return;
    }

    // 2. Browser mediaDevices check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera access unavailable. Mobile browsers require HTTPS for camera access. Open SatyaDrishti using an HTTPS tunnel or localhost.'
      );
      setIsInitializing(false);
      setRecorderState('idle');
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
      setRecorderState('preview');
      setIsInitializing(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      setIsInitializing(false);
      setRecorderState('idle');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser to record factory video.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Camera access unavailable: ${err.message || 'Unknown error'}. Mobile browsers require HTTPS.`);
      }
    }
  };

  const handleStartRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    try {
      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? { mimeType: 'video/webm;codecs=vp9' }
        : MediaRecorder.isTypeSupported('video/webm')
        ? { mimeType: 'video/webm' }
        : MediaRecorder.isTypeSupported('video/mp4')
        ? { mimeType: 'video/mp4' }
        : undefined;

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);

        // Take snapshot frame for hygiene assessment image evidence
        let snapshotDataUrl = '';
        if (videoRef.current) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 1280;
            canvas.height = videoRef.current.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            }
          } catch {
            // fallback
          }
        }

        // Stop all camera tracks immediately after recording
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        onVideoRecorded(blob, videoUrl, snapshotDataUrl || videoUrl);
      };

      mediaRecorder.start(250); // Slice every 250ms
      setRecorderState('recording');
      setRecordingTime(0);

      // Start recording timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setCameraError(`Failed to initialize video recording: ${err.message}`);
      stopCameraTracks();
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecorderState('idle');
  };

  const handleCancel = () => {
    stopCameraTracks();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* State 1: Recorded Video Preview with Action Buttons */}
        {recordedVideoUrl ? (
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md max-h-[460px] flex items-center justify-center">
              <video
                src={recordedVideoUrl}
                controls
                className="w-full max-h-[460px] object-contain rounded-2xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
                Live factory video recording ready for AI hygiene verification.
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto text-xs min-h-[44px] px-4"
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Re-record Video
                </Button>

                <Button
                  variant="primary"
                  onClick={onRunAssessment}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 min-h-[44px] px-6 min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{analysisStatus || 'Analyzing Video...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Run Hygiene Assessment</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : recorderState === 'idle' ? (
          /* State 2: Initial Idle State — ONE Action [ Record Live Video ] */
          <div className="flex flex-col items-center justify-center text-center p-5 sm:p-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Video className="h-7 w-7" />
            </div>

            <div className="max-w-md space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Factory Hygiene Proof
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Record a short walkthrough of your production/storage area.
              </p>
            </div>

            {/* ONE Primary Action Button */}
            <div className="pt-1 w-full sm:w-auto">
              <Button
                variant="primary"
                onClick={handleStartCamera}
                disabled={isInitializing}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 shadow-md text-xs sm:text-sm gap-2 min-h-[44px] justify-center rounded-xl"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Requesting Camera...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    <span>Record Video</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Camera access requires HTTPS on mobile.
            </p>
          </div>
        ) : (
          /* State 3: Live Camera Viewfinder & Recording */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg aspect-video min-h-[240px] max-h-[50vh] flex items-center justify-center mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Overlay */}
              <div className="absolute inset-4 sm:inset-8 pointer-events-none border border-white/20 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-indigo-400"></div>
                </div>
                <div className="text-center px-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] sm:text-[11px] font-mono text-white/90">
                    Scan Factory Floor, Machinery & Storage Areas
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="w-5 h-5 border-b-2 border-r-2 border-indigo-400"></div>
                </div>
              </div>

              {/* Live / Recording Indicator + Timer */}
              {recorderState === 'recording' ? (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-md animate-pulse">
                  <span className="h-2.5 w-2.5 rounded-full bg-white"></span>
                  <span>REC {formatTimer(recordingTime)}</span>
                </div>
              ) : (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Camera Ready</span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {recorderState === 'preview' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="text-xs gap-1.5 min-h-[44px] px-5"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleStartRecording}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 min-h-[44px] px-6 shadow-md"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Start Recording</span>
                  </Button>
                </>
              )}

              {recorderState === 'recording' && (
                <Button
                  variant="primary"
                  onClick={handleStopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 min-h-[48px] px-8 shadow-lg animate-pulse"
                >
                  <Square className="h-4 w-4 fill-white" />
                  <span>Stop Recording ({formatTimer(recordingTime)})</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Camera Error Alert — Shown only after failure */}
        {cameraError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 p-3.5 text-xs text-red-700 dark:text-red-300 space-y-2 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-0.5">
                <div className="font-bold">Camera access unavailable</div>
                <div className="leading-relaxed">Mobile browsers require HTTPS for camera access. Use an HTTPS deployment/tunnel to continue.</div>
              </div>
            </div>

            {/* Collapsible HTTPS Tunneling Helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTunnelHelp(!showTunnelHelp)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                <span>How to enable camera (HTTPS Tunnel)</span>
                {showTunnelHelp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showTunnelHelp && (
                <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-900/40 text-[11px] space-y-2 text-slate-700 dark:text-slate-300 font-sans">
                  <p>
                    Mobile browsers mandate a secure connection (HTTPS) for hardware video stream recording:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded font-mono text-[10px] space-y-1 text-slate-800 dark:text-slate-200">
                    <div># Option A: Cloudflare Tunnel</div>
                    <div className="text-blue-600 dark:text-blue-400 font-bold">cloudflared tunnel --url http://localhost:3000</div>
                    <div className="pt-1"># Option B: ngrok</div>
                    <div className="text-blue-600 dark:text-blue-400 font-bold">ngrok http 3000</div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                    Open the generated HTTPS link on your phone to record live factory proof.
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
