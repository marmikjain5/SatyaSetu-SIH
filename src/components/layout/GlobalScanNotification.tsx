import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Scan,
  ArrowRight,
  X,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useScanStore } from '../../store/scanStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export const GlobalScanNotification: React.FC = () => {
  const {
    isProcessing,
    currentProgress,
    currentStatusMessage,
    currentScan,
    hasUnviewedCompletion,
    clearUnviewedCompletion,
  } = useScanStore();

  const location = useLocation();
  const navigate = useNavigate();

  const isScannerPage = location.pathname === '/dashboard/scanner';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If scan completed and user is currently on the scanner page, dismiss the toast automatically
  React.useEffect(() => {
    if (isScannerPage && hasUnviewedCompletion) {
      clearUnviewedCompletion();
    }
  }, [isScannerPage, hasUnviewedCompletion, clearUnviewedCompletion]);

  // Don't render if nothing is processing and no unviewed completion
  if (!isProcessing && (!hasUnviewedCompletion || isScannerPage)) {
    return null;
  }

  const handleOpenScanner = () => {
    clearUnviewedCompletion();
    navigate('/dashboard/scanner');
  };

  // ─── 1. Ongoing Background Scan Widget ──────────────────────────────
  if (isProcessing) {
    const isMultiAngle = (currentScan?.angles?.length || 0) > 1 || currentScan?.isMultiAngle;

    // Collapsed Mini-Pill State
    if (isCollapsed) {
      return (
        <aside
          aria-label="Background Scan Progress (Minimized)"
          className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-blue-500/40 bg-slate-900/95 text-white pl-3.5 pr-2 py-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 hover:border-blue-400 transition-all">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            </div>

            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2 text-left cursor-pointer hover:opacity-90"
              title="Click to expand scan details"
            >
              <span className="text-xs font-semibold text-white tracking-tight">
                {isMultiAngle ? 'Multi-Angle Scan' : 'Scanning'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-600/60 text-cyan-200 font-bold">
                {currentProgress}%
              </span>
            </button>

            <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Expand details"
                aria-label="Expand scan notification"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              {!isScannerPage && (
                <button
                  onClick={handleOpenScanner}
                  className="p-1 rounded-full text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
                  title="Open Scanner page"
                  aria-label="Open Scanner"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </aside>
      );
    }

    // Expanded Full Card State
    return (
      <aside
        aria-label="Background Scan Progress"
        className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      >
        <div className="rounded-2xl border border-blue-500/30 bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-3">
            {/* Left Icon with animated pulse */}
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shrink-0">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 animate-ping" />
            </div>

            {/* Middle Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Scan className="h-3.5 w-3.5 text-blue-400" />
                    {isMultiAngle ? 'Multi-Angle Scan Running' : 'Product Scan Running'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                    {currentProgress}%
                  </span>
                </div>

                {/* Collapse / Minimize Button */}
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                  title="Collapse notification"
                  aria-label="Collapse scan notification"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 truncate mt-1 leading-snug">
                {currentStatusMessage || 'Processing packaging declarations...'}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(5, currentProgress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 pt-0.5">
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Running in background</span>
                  <span>•</span>
                  <span>Feel free to navigate</span>
                </p>

                {!isScannerPage && (
                  <button
                    onClick={handleOpenScanner}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    <span>View Scanner</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ─── 2. Completed Background Scan Notification Toast ────────────────
  if (hasUnviewedCompletion && !isScannerPage && currentScan?.status === 'completed') {
    const isMultiAngle = currentScan.isMultiAngle || (currentScan.angles?.length || 0) > 1;
    const anglesCount = currentScan.angles?.length || 1;
    const confidence = currentScan.confidence || 0;

    return (
      <aside
        aria-label="Scan Completed Notification"
        className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      >
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-xl ring-1 ring-emerald-500/20">
          <div className="flex items-start gap-3">
            {/* Success Icon */}
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {isMultiAngle ? 'Multi-Angle Scan Complete' : 'Product Scan Complete'}
                  </span>
                  <Badge variant="success" size="sm" className="text-[10px] px-1.5 py-0">
                    {confidence}% Score
                  </Badge>
                </div>
                <button
                  onClick={clearUnviewedCompletion}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs font-semibold text-emerald-300 truncate mt-1">
                {currentScan.imageName}
              </p>

              <p className="text-[11px] text-slate-300 mt-0.5">
                {isMultiAngle
                  ? `Consolidated ${anglesCount} photo angles into master compliance audit.`
                  : 'Statutory declarations verified against Legal Metrology Rules.'}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenScanner}
                  className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>View Audit Results</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearUnviewedCompletion}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};
