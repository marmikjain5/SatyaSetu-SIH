import React from 'react';
import {
  ScanLine,
  Images,
  BarChart3,
  Activity,
  Clock,
  Play,
  Trash2,
} from 'lucide-react';
import { useScanStore } from '../../store/scanStore';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/scanner/ImageUploader';
import { ImagePreviewPanel } from '../../components/scanner/ImagePreviewPanel';
import { OCRProcessingCard } from '../../components/scanner/OCRProcessingCard';
import { OCRResultsPanel } from '../../components/scanner/OCRResultsPanel';
import { ComplianceResultsPanel } from '../../components/scanner/ComplianceResultsPanel';
import { RuleAuditView } from '../../components/scanner/RuleAuditView';
import { RecommendationsCard } from '../../components/scanner/RecommendationsCard';
import { ScanHistoryTable } from '../../components/scanner/ScanHistoryTable';

export const ProductScanner: React.FC = () => {
  const {
    scans,
    currentScan,
    uploadedImages,
    isProcessing,
    startScan,
    clearImages,
  } = useScanStore();

  const totalScans = scans.length;
  const completedScans = scans.filter((s) => s.status === 'completed');
  const avgConfidence =
    completedScans.length > 0
      ? Math.round(
          completedScans.reduce((sum, s) => sum + s.confidence, 0) / completedScans.length * 10
        ) / 10
      : 0;
  const lastScanTime = scans[0]?.timestamp || 'Never';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 w-fit">
            <ScanLine className="h-3.5 w-3.5" />
            <span>OCR Label Scanning Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Product Scanner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan product packaging &amp; labels using optical character recognition for Legal Metrology compliance verification.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans"
          value={totalScans}
          icon={BarChart3}
          variant="accent"
          description="All-time processed"
        />
        <StatCard
          title="Avg Confidence"
          value={avgConfidence > 0 ? `${avgConfidence}%` : '—'}
          icon={Activity}
          variant={avgConfidence >= 90 ? 'success' : avgConfidence >= 70 ? 'warning' : 'default'}
          description="Across completed scans"
        />
        <StatCard
          title="Images Queued"
          value={uploadedImages.length}
          icon={Images}
          variant="default"
          description="Ready for processing"
        />
        <StatCard
          title="Last Scan"
          value={lastScanTime === 'Never' ? '—' : lastScanTime.split(',')[0] || '—'}
          icon={Clock}
          variant="default"
          description={lastScanTime === 'Never' ? 'No scans yet' : lastScanTime}
        />
      </div>

      {/* Upload Section */}
      <ImageUploader />

      {/* Image Previews + Actions */}
      <ImagePreviewPanel />

      {/* Action Bar */}
      {uploadedImages.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-subtle px-5 py-3.5">
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{uploadedImages.length}</span>{' '}
            {uploadedImages.length === 1 ? 'image' : 'images'} ready for OCR processing
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearImages}
              disabled={isProcessing}
              className="text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={startScan}
              isLoading={isProcessing}
              disabled={isProcessing}
              className="text-xs gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isProcessing ? 'Scanning...' : 'Start Scan'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Processing Status */}
      <OCRProcessingCard />

      {/* Side-by-Side: Statutory Declarations (Left) & Compliance Validation (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        {/* OCR Extraction Results */}
        <OCRResultsPanel />

        {/* Compliance Validation Results */}
        <ComplianceResultsPanel />
      </div>

      {/* Two-Column: Rule Audit Trail (Left ~75%) & Recommendations (Right ~25%) */}
      {currentScan?.status === 'completed' && currentScan?.extractedData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 xl:col-span-9 h-full">
            <RuleAuditView />
          </div>
          <div className="lg:col-span-4 xl:col-span-3 h-full">
            <RecommendationsCard />
          </div>
        </div>
      )}

      {/* Scan History */}
      <ScanHistoryTable />
    </div>
  );
};
