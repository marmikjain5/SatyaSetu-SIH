import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  UserCheck,
  Scale,
  Calendar,
  Layers,
  FileCheck,
  Eye,
  Type,
  FileCode,
  Building,
  Edit3,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useReportStore } from '../../store/reportStore';
import { reportService } from '../../lib/reportService';
import { exportReportToPdf, exportReportToDocx, downloadReportAsPdf } from '../../lib/reportExporter';
import type { ComplianceInspectionReport, ReportGenerationOptions } from '../../types/report';
import { cn } from '../../lib/utils';

interface ComplianceReportModalProps {
  report: ComplianceInspectionReport;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate?: (options: Partial<ReportGenerationOptions>) => void;
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onRegenerate,
}) => {
  const { addReport } = useReportStore();
  const [activeTab, setActiveTab] = useState<'report' | 'customize'>('report');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Inspector customization state
  const [inspectorName, setInspectorName] = useState(report.coverPage.inspectorName);
  const [inspectorDesignation, setInspectorDesignation] = useState(report.coverPage.inspectorDesignation);
  const [inspectorBadge, setInspectorBadge] = useState(report.coverPage.inspectorBadge);
  const [department, setDepartment] = useState(report.coverPage.department);
  const [jurisdiction, setJurisdiction] = useState(report.coverPage.jurisdiction);
  const [customRemarks, setCustomRemarks] = useState(report.verdict.summaryRemarks);
  const [deadlineDays, setDeadlineDays] = useState(15);

  if (!isOpen) return null;

  const { coverPage, productInfo, ruleValidation, readabilityAnalysis, evidence, recommendations, verdict, digitalSignature } = report;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    addReport(report);
    await downloadReportAsPdf(report);
    setIsExporting(false);
  };

  const handlePrint = () => {
    addReport(report);
    exportReportToPdf(report);
  };

  const handleDownloadDocx = () => {
    setIsExporting(true);
    addReport(report);
    exportReportToDocx(report);
    setTimeout(() => setIsExporting(false), 500);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(digitalSignature.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleApplyCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRegenerate) {
      onRegenerate({
        inspectorName,
        inspectorDesignation,
        inspectorBadge,
        department,
        jurisdiction,
        customRemarks,
        actionDeadlineDays: deadlineDays,
      });
      setActiveTab('report');
    }
  };

  const statusBadge = {
    compliant: {
      label: 'COMPLIANT',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
      icon: CheckCircle2,
    },
    warning: {
      label: 'NEEDS ATTENTION',
      bg: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
      icon: AlertTriangle,
    },
    'non-compliant': {
      label: 'NON-COMPLIANT',
      bg: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80',
      icon: XCircle,
    },
  }[coverPage.overallStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* ─── Modal Header ────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono tracking-widest text-blue-700 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
                  OFFICIAL STATUTORY INSPECTION RECORD
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {report.reportId}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Compliance Inspection Report Generator
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 rounded-lg p-0.5 mr-2">
              <button
                onClick={() => setActiveTab('report')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
                  activeTab === 'report'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                Full Report Preview
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1',
                  activeTab === 'customize'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                <Edit3 className="h-3 w-3" />
                <span>Inspector Sign-Off</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadDocx}
              disabled={isExporting}
              className="text-xs h-8 gap-1.5 border-slate-300 dark:border-slate-700"
            >
              <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Download DOCX</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="text-xs h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isExporting}
              className="text-xs h-8 gap-1.5 border-slate-300 dark:border-slate-700"
              title="Open Browser Print Dialog"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ─── Modal Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'customize' ? (
            /* ── Inspector Customization Form ───────────────────── */
            <form onSubmit={handleApplyCustomization} className="max-w-2xl mx-auto space-y-5 py-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
                <UserCheck className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-bold">Inspector Authentication &amp; Customization</h4>
                  <p className="mt-0.5 text-blue-700 dark:text-blue-400">
                    Modify inspecting officer credentials, legal department jurisdiction, and enforcement directives before exporting the official document.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Inspecting Officer Name
                  </label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Inspector Badge / ID Number
                  </label>
                  <input
                    type="text"
                    value={inspectorBadge}
                    onChange={(e) => setInspectorBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={inspectorDesignation}
                    onChange={(e) => setInspectorDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Enforcement Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Department / Authority
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspector Findings &amp; Summary Remarks
                </label>
                <textarea
                  rows={3}
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('report')}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Update &amp; Re-generate Report
                </Button>
              </div>
            </form>
          ) : (
            /* ── Official Printable Report View ─────────────────── */
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-8 shadow-sm space-y-6 text-slate-900 dark:text-slate-100">
              {/* Government Header Banner */}
              <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 text-center space-y-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono">
                  <span>GOVERNMENT OF INDIA</span>
                  <span>•</span>
                  <span>MINISTRY OF CONSUMER AFFAIRS</span>
                </div>
                <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
                  Statutory Packaged Commodity Inspection Report
                </h1>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Under Legal Metrology (Packaged Commodities) Rules, 2011 &amp; FSSAI Packaging Standards
                </p>
              </div>

              {/* Identification Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500">REPORT ID: </span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{coverPage.reportId}</span>
                </div>
                <div>
                  <span className="text-slate-500">INSPECTION DATE: </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{coverPage.formattedDate}</span>
                </div>
              </div>

              {/* Status & Verdict Hero Banner */}
              <div className={cn('p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4', statusBadge.bg)}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      FINAL STATUTORY VERDICT
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      RISK TIER: {coverPage.riskTier}
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight uppercase flex items-center gap-2">
                    {React.createElement(statusBadge.icon, { className: 'h-5 w-5' })}
                    <span>{verdict.verdictTitle}</span>
                  </h3>
                  <p className="text-xs max-w-xl opacity-90">
                    {verdict.summaryRemarks}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center min-w-[120px] shrink-0 shadow-2xs">
                  <span className="text-3xl font-black font-mono block leading-none text-slate-900 dark:text-slate-100">
                    {coverPage.complianceScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mt-1">
                    Compliance Score
                  </span>
                </div>
              </div>

              {/* Section 1: Inspector & Product Identity */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>1. Inspection Authority &amp; Packaging Identity</span>
                  <span className="font-mono text-[10px] text-slate-400">SEC-01</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      Inspecting Officer
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {coverPage.inspectorName} ({coverPage.inspectorBadge})
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {coverPage.inspectorDesignation}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {coverPage.department} • {coverPage.jurisdiction}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      Commodity Identity
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {productInfo.productName}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Manufacturer: {productInfo.manufacturer}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Location: {productInfo.address}
                    </p>
                  </div>
                </div>

                {/* Statutory Declarations Matrix */}
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5">Statutory Field</th>
                        <th className="p-2.5">Extracted Value</th>
                        <th className="p-2.5">Statutory Field</th>
                        <th className="p-2.5">Extracted Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">MRP (Incl. taxes)</td>
                        <td className="p-2 font-bold">{productInfo.mrp}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Net Quantity</td>
                        <td className="p-2 font-bold">{productInfo.netQuantity}</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Mfg / Packing Date</td>
                        <td className="p-2">{productInfo.manufacturingDate || productInfo.packingDate}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Expiry Date</td>
                        <td className="p-2">{productInfo.expiryDate}</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Batch / Lot No.</td>
                        <td className="p-2">{productInfo.batchNumber}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Country of Origin</td>
                        <td className="p-2">{productInfo.countryOfOrigin}</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">FSSAI License</td>
                        <td className="p-2">{productInfo.fssaiLicense}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Barcode / GTIN</td>
                        <td className="p-2">{productInfo.barcode}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Rule Validation Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>2. Legal Metrology Rule Validation Matrix</span>
                  <span className="font-mono text-[10px] text-slate-400">SEC-02</span>
                </h4>

                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5 w-[16%]">Rule Code</th>
                        <th className="p-2.5 w-[34%]">Statutory Rule Title</th>
                        <th className="p-2.5 w-[28%]">Extracted Evidence</th>
                        <th className="p-2.5 w-[12%]">Status</th>
                        <th className="p-2.5 w-[10%]">Penalty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ruleValidation.auditTrail.slice(0, 8).map((entry) => (
                        <tr key={entry.ruleId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-2 font-mono font-bold text-slate-700 dark:text-slate-300">{entry.ruleCode}</td>
                          <td className="p-2">
                            <span className="font-bold block text-slate-900 dark:text-slate-100">{entry.ruleName}</span>
                            <span className="text-[10px] text-slate-500">{entry.section}</span>
                          </td>
                          <td className="p-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                            {entry.evidence || 'Missing from label'}
                          </td>
                          <td className="p-2">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono',
                                entry.status === 'pass'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : entry.status === 'fail'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              )}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {entry.status === 'fail' ? `₹${(entry.penaltyRange?.maxFine || 25000).toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span>Violations: <strong className="text-red-600">{ruleValidation.violationCount}</strong> | Warnings: <strong className="text-amber-600">{ruleValidation.warningCount}</strong></span>
                  <span>Estimated Compounding Penalty: <strong className="text-slate-900 dark:text-slate-100">{verdict.statutoryPenaltyEstimate}</strong></span>
                </div>
              </div>

              {/* Section 3: Readability & Font Size */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>3. Optical Font Size &amp; Readability (Rule 9 &amp; Sched. II)</span>
                  <span className="font-mono text-[10px] text-slate-400">SEC-03</span>
                </h4>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Avg Font Height</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                      {readabilityAnalysis.summary.avgFontSizePt} pt
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ≈ {((readabilityAnalysis.summary.avgFontSizePt * 25.4) / 72).toFixed(1)} mm
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Contrast Ratio</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                      {readabilityAnalysis.summary.avgContrastRatio}:1
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      WCAG 2.1 Standard
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Readability Score</span>
                    <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {readabilityAnalysis.summary.overallScore}/100
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {readabilityAnalysis.flaggedRegions.length} Flagged Defects
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Physical Evidence Thumbnail */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>4. Physical Packaging Evidence Snapshot</span>
                  <span className="font-mono text-[10px] text-slate-400">SEC-04</span>
                </h4>

                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-3 border border-slate-300 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <img
                    src={evidence.imageDataUrl}
                    alt="Packaging Evidence"
                    className="max-h-56 w-auto rounded-lg shadow-sm object-contain"
                  />
                  <span className="text-[10px] font-mono text-slate-500 mt-2">
                    Evidence Record • {evidence.mappedBoundingBoxesCount} Statutory Bounding Boxes Mapped
                  </span>
                </div>
              </div>

              {/* Section 5: Directives & Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>5. Enforcement Directives &amp; Corrective Actions</span>
                  <span className="font-mono text-[10px] text-slate-400">SEC-05</span>
                </h4>

                <ul className="text-xs space-y-1.5 list-disc pl-5 text-slate-700 dark:text-slate-300">
                  {recommendations.correctiveActions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                  {recommendations.legalEnforcementSteps.map((l, i) => (
                    <li key={i}><strong className="text-slate-900 dark:text-slate-100">Statutory Notice:</strong> {l}</li>
                  ))}
                </ul>

                <p className="text-xs font-bold text-red-600 dark:text-red-400 pt-1">
                  Enforcement Deadline: {verdict.recommendedActionDeadline} (Under Rule 24 Guidelines)
                </p>
              </div>

              {/* Digital Signature Stamp Block */}
              <div className="border-2 border-slate-900 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Cryptographically Signed &amp; Timestamped
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Inspecting Officer:</strong> {digitalSignature.signedBy} ({digitalSignature.badgeNumber})
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Cert ID: {digitalSignature.certificateId} • {digitalSignature.timestamp}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-sm">
                      SHA-256: {digitalSignature.sha256Hash}
                    </span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHash ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="h-16 w-16 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-300 text-[9px] font-black leading-tight text-center shrink-0">
                  <span>✓ e-Sign</span>
                  <span>VERIFIED</span>
                  <span className="text-[7px] font-mono opacity-80">CCA-GOV</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
