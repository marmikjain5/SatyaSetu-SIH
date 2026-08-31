import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Calendar,
  Layers,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useReportStore } from '../../store/reportStore';
import { exportReportToPdf, exportReportToDocx, downloadReportAsPdf } from '../../lib/reportExporter';
import type { ComplianceInspectionReport } from '../../types/report';
import { cn } from '../../lib/utils';

interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: ComplianceInspectionReport) => void;
}

export const ReportHistoryModal: React.FC<ReportHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectReport,
}) => {
  const { reports, deleteReport, clearAllReports, searchQuery, setSearchQuery, selectedStatusFilter, setStatusFilter } = useReportStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredReports = reports.filter((r) => {
    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchId = r.reportId.toLowerCase().includes(q);
      const matchProd = r.coverPage.productName.toLowerCase().includes(q);
      const matchMfr = r.coverPage.brandOrManufacturer.toLowerCase().includes(q);
      const matchInsp = r.coverPage.inspectorName.toLowerCase().includes(q);
      if (!matchId && !matchProd && !matchMfr && !matchInsp) return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'all') {
      if (r.coverPage.overallStatus !== selectedStatusFilter) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Compliance Reports History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Archived Legal Metrology inspection reports with cryptographic verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {reports.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllReports}
                className="text-xs h-8 text-red-600 hover:text-red-700 border-red-200 dark:border-red-900/60"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear Archive
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'compliant', 'non-compliant', 'warning'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg border transition-colors capitalize',
                  selectedStatusFilter === status
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                )}
              >
                {status === 'all' ? `All (${reports.length})` : status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, product, inspector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Report List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-slate-400 opacity-40" />
              <p className="text-sm font-semibold">No Compliance Reports Found</p>
              <p className="text-xs max-w-md mx-auto">
                Generate inspection reports from any completed packaging scan using the "Generate Compliance Report" action.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const statusCfg = {
                compliant: {
                  label: 'Compliant',
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
                  icon: CheckCircle2,
                },
                warning: {
                  label: 'Needs Attention',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
                  icon: AlertTriangle,
                },
                'non-compliant': {
                  label: 'Non-Compliant',
                  badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80',
                  icon: XCircle,
                },
              }[report.coverPage.overallStatus];

              return (
                <div
                  key={report.reportId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                        {report.reportId}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 font-mono',
                          statusCfg.badge
                        )}
                      >
                        {React.createElement(statusCfg.icon, { className: 'h-3 w-3' })}
                        <span>{statusCfg.label}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Score: {report.coverPage.complianceScore}/100
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {report.coverPage.productName}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Inspector: {report.coverPage.inspectorName} ({report.coverPage.inspectorBadge}) • {report.coverPage.formattedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectReport(report)}
                      className="text-xs h-7 gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReportToDocx(report)}
                      className="text-xs h-7 gap-1"
                      title="Download Word Document"
                    >
                      <Download className="h-3 w-3" />
                      <span>DOCX</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={async () => {
                        setDownloadingId(report.reportId);
                        await downloadReportAsPdf(report);
                        setDownloadingId(null);
                      }}
                      disabled={downloadingId === report.reportId}
                      className="text-xs h-7 gap-1 bg-blue-600 hover:bg-blue-700"
                      title="Direct Download PDF File"
                    >
                      <Download className="h-3 w-3" />
                      <span>{downloadingId === report.reportId ? 'PDF...' : 'PDF'}</span>
                    </Button>

                    <button
                      onClick={() => deleteReport(report.reportId)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
