import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Play, Square, RefreshCw, X, AlertCircle, Sparkles } from 'lucide-react';
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
        setCameraError(`Unable to access camera: ${err.message || 'Unknown error'}`);
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
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Live factory video recording ready for AI hygiene verification.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Re-record Video
                </Button>

                <Button
                  variant="primary"
                  onClick={onRunAssessment}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 min-w-[200px]"
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
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Video className="h-7 w-7" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Factory Hygiene Inspection
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Record a live video of your factory floor, production area or storage zone for hygiene assessment.
              </p>
            </div>

            {/* ONE Primary Action Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={handleStartCamera}
                disabled={isInitializing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 shadow-sm text-xs gap-2"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Requesting Camera...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    <span>Record Live Video</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* State 3: Live Camera Viewfinder & Recording */
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
              <div className="absolute inset-8 pointer-events-none border border-white/20 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-indigo-400"></div>
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-mono text-white/90">
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
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-md animate-pulse">
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
                    size="sm"
                    onClick={handleCancel}
                    className="text-xs gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleStartRecording}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 px-6 py-2 shadow-md"
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
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 px-8 py-2.5 shadow-lg animate-pulse"
                >
                  <Square className="h-4 w-4 fill-white" />
                  <span>Stop Recording ({formatTimer(recordingTime)})</span>
                </Button>
              )}
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
