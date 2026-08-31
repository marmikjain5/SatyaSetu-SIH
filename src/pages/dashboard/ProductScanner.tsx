import React, { useState } from 'react';
import {
  ScanLine,
  Images,
  BarChart3,
  Activity,
  Clock,
  Play,
  Trash2,
  FileText,
  History,
  Download,
  FileCheck,
} from 'lucide-react';
import { useScanStore } from '../../store/scanStore';
import { useReportStore } from '../../store/reportStore';
import { reportService } from '../../lib/reportService';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/scanner/ImageUploader';
import { ImagePreviewPanel } from '../../components/scanner/ImagePreviewPanel';
import { OCRProcessingCard } from '../../components/scanner/OCRProcessingCard';
import { OCRResultsPanel } from '../../components/scanner/OCRResultsPanel';
import { ComplianceResultsPanel } from '../../components/scanner/ComplianceResultsPanel';
import { ReadabilityAnalysisPanel } from '../../components/scanner/ReadabilityAnalysisPanel';
import { ScanCorrelationCard } from '../../components/scanner/ScanCorrelationCard';
import { RuleAuditView } from '../../components/scanner/RuleAuditView';
import { RecommendationsCard } from '../../components/scanner/RecommendationsCard';
import { ScanHistoryTable } from '../../components/scanner/ScanHistoryTable';
import { ComplianceReportModal } from '../../components/scanner/ComplianceReportModal';
import { ReportHistoryModal } from '../../components/scanner/ReportHistoryModal';
import type { ComplianceInspectionReport, ReportGenerationOptions } from '../../types/report';

export const ProductScanner: React.FC = () => {
  const {
    scans,
    currentScan,
    uploadedImages,
    isProcessing,
    startScan,
    clearImages,
    validationResults,
    readabilityResults,
  } = useScanStore();

  const { reports, addReport } = useReportStore();

  const [activeReport, setActiveReport] = useState<ComplianceInspectionReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleGenerateReport = (options?: Partial<ReportGenerationOptions>) => {
    if (!currentScan || !currentScan.extractedData) return;

    const valResult = validationResults[currentScan.id];
    const readResult = readabilityResults[currentScan.id] || currentScan.readabilityResult;

    const report = reportService.generateComplianceReport(
      currentScan,
      valResult,
      readResult,
      options
    );

    addReport(report);
    setActiveReport(report);
    setIsReportModalOpen(true);
  };

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

        {/* Top Header Report Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs gap-1.5 border-slate-200"
          >
            <History className="h-3.5 w-3.5 text-slate-600" />
            <span>Report Archive</span>
            {reports.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {reports.length}
              </span>
            )}
          </Button>

          {currentScan?.status === 'completed' && currentScan?.extractedData && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerateReport()}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Generate Compliance Report</span>
            </Button>
          )}
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

      {/* Feature 4: Font Size & Optical Readability Analysis Panel */}
      {currentScan?.status === 'completed' && <ReadabilityAnalysisPanel />}

      {/* RAG Discrepancy Mapping & Complaint Verification Panel */}
      {currentScan?.status === 'completed' && <ScanCorrelationCard />}

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

      {/* Feature 5: Compliance Inspection Report Modal */}
      {activeReport && (
        <ComplianceReportModal
          report={activeReport}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onRegenerate={(opts) => handleGenerateReport(opts)}
        />
      )}

      {/* Feature 5: Compliance Reports History Modal */}
      <ReportHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectReport={(report) => {
          setActiveReport(report);
          setIsHistoryModalOpen(false);
          setIsReportModalOpen(true);
        }}
      />
    </div>
  );
};
