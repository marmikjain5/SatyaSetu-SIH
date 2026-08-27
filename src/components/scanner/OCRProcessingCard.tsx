import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Cpu, Layers, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useScanStore } from '../../store/scanStore';
import { cn } from '../../lib/utils';

export const OCRProcessingCard: React.FC = () => {
  const { isProcessing, currentScan, currentProgress, currentStatusMessage } = useScanStore();

  if (!isProcessing && !currentScan) return null;

  const isComplete = currentScan?.status === 'completed';
  const isError = currentScan?.status === 'error';
  const confidence = currentScan?.confidence ?? 0;

  const confidenceVariant =
    confidence >= 80 ? 'success' : confidence >= 50 ? 'warning' : 'danger';

  // Parse pass info from status message (e.g., "Pass 2/6: Adaptive Threshold")
  const passMatch = currentStatusMessage.match(/Pass (\d+)\/(\d+)/);
  const currentPass = passMatch ? parseInt(passMatch[1]) : 0;
  const totalPasses = passMatch ? parseInt(passMatch[2]) : 0;

  // Count detected declarations from extraction
  const extractedData = currentScan?.extractedData;
  const totalDeclarationsCount = extractedData?.declarations
    ? Object.keys(extractedData.declarations).length
    : 14;

  const detectedDeclarationsCount = extractedData?.declarations
    ? Object.values(extractedData.declarations).filter((d) => d.value && d.value.trim().length > 0).length
    : 0;

  const compliantCount = extractedData?.declarations
    ? Object.values(extractedData.declarations).filter((d) => d.validationStatus === 'compliant').length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Cpu className="h-4 w-4 text-slate-700" />
          <span>Legal Metrology Extraction Engine</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <Badge variant="primary" size="sm" dot>
              Running Pipeline
            </Badge>
          )}
          {isComplete && (
            <Badge variant="success" size="sm">
              Extraction Complete
            </Badge>
          )}
          {isError && (
            <Badge variant="danger" size="sm">
              Failed
            </Badge>
          )}
          {isProcessing && totalPasses > 0 && (
            <Badge variant="neutral" size="sm">
              <Layers className="h-3 w-3" />
              Pass {currentPass}/{totalPasses}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Current file info */}
        {currentScan && (
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
              <img
                src={currentScan.imageDataUrl}
                alt={currentScan.imageName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentScan.imageName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{currentScan.timestamp}</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
              {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              {isError && <AlertCircle className="h-3.5 w-3.5 text-red-600" />}
              <span>{currentStatusMessage || 'Initializing engine...'}</span>
            </span>
            <span className="font-mono font-bold text-slate-800">{currentProgress}%</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300 ease-out',
                isError
                  ? 'bg-red-500'
                  : isComplete
                  ? 'bg-emerald-500'
                  : 'bg-blue-600'
              )}
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          {/* Multi-pass progress dots */}
          {isProcessing && totalPasses > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              {Array.from({ length: totalPasses }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i < currentPass
                      ? 'bg-blue-600'
                      : i === currentPass - 1
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-slate-200'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Compliance & Confidence Summary Card */}
        {isComplete && confidence > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Overall Compliance & Extraction Score
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {confidence}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{compliantCount} Compliant</span>
              </Badge>
              <Badge variant="neutral" size="sm">
                {detectedDeclarationsCount}/{totalDeclarationsCount} Declarations
              </Badge>
              <Badge variant={confidenceVariant} size="lg">
                {confidence >= 80 ? 'High Confidence' : confidence >= 50 ? 'Moderate' : 'Low'}
              </Badge>
            </div>
          </div>
        )}

        {/* Pass Confidence Breakdown Bar */}
        {isComplete && extractedData?.ocrPassResults && extractedData.ocrPassResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Optical Pass Confidence Breakdown
            </p>
            <div className="flex items-end gap-1.5 h-10">
              {extractedData.ocrPassResults.map((pass) => (
                <div
                  key={pass.name}
                  className="flex-1 flex flex-col items-center gap-0.5"
                  title={`${pass.description}: ${pass.confidence}%`}
                >
                  <div
                    className={cn(
                      'w-full rounded-t transition-all',
                      pass.confidence >= 80
                        ? 'bg-emerald-500'
                        : pass.confidence >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-400'
                    )}
                    style={{ height: `${Math.max(4, (pass.confidence / 100) * 32)}px` }}
                  />
                  <span className="text-[8px] text-slate-400 font-mono truncate w-full text-center">
                    {pass.confidence > 0 ? `${pass.confidence}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error display */}
        {isError && currentScan?.errorMessage && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 font-medium">{currentScan.errorMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
