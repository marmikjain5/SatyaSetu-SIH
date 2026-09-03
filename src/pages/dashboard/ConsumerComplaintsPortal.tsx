import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  Eye,
  ShieldCheck,
  Building2,
  Scale,
  Layers,
  FileSearch,
  UserCheck,
  HelpCircle,
  XCircle,
  Award,
  Upload,
  Link2,
  Trash2,
  Loader2,
  Image as ImageIcon,
  FileCheck2,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import {
  Complaint,
  PlatformType,
  OfficerActionType,
  EvidenceTag,
} from '../../types/compliance';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { buildEvidenceBackedComplaintCase } from '../../lib/complaintCaseCorrelator';
import { ProcessedEvidenceInput } from '../../lib/complaintOcrPipeline';
import { cn } from '../../lib/utils';

export const ConsumerComplaintsPortal: React.FC = () => {
  const { complaints, addFullComplaint, updateOfficerDecision } = useComplianceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Active Tab inside Officer Case Dossier Modal
  const [dossierTab, setDossierTab] = useState<'correlation' | 'evidence' | 'rag' | 'actions' | 'audit'>('correlation');
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState<number>(0);
  const [showAnnotatedCopy, setShowAnnotatedCopy] = useState<boolean>(true);

  // Officer Action Form State
  const [officerActionType, setOfficerActionType] = useState<OfficerActionType>('ACCEPT_INVESTIGATION');
  const [officerNotes, setOfficerNotes] = useState('');
  const [assignedInspector, setAssignedInspector] = useState('Inspector Rajesh Varma (Zonal Metrology)');

  // New Grievance Form State
  const [newComplaintData, setNewComplaintData] = useState({
    consumerName: 'Rajesh Khanna',
    consumerEmail: 'rajesh.khanna@gmail.com',
    consumerPhone: '+91 98200 12345',
    productName: 'NutriPro Gold 100% Whey 1kg',
    brand: 'NutriPro Labs',
    platform: 'Amazon' as PlatformType,
    productUrl: '',
    orderNumber: 'OD-991-00214-99',
    description: 'The packet says MRP ₹1,999 but the shop charged me ₹2,499 on bill invoice. Also sticker was overprinted on printed MRP.',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; tag: EvidenceTag; previewUrl: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatusText, setSubmissionStatusText] = useState('');

  const statuses = [
    'All',
    'New',
    'Needs Review',
    'Triaged',
    'Investigation',
    'Notice Dispatched',
    'Assigned for Inspection',
    'More Info Requested',
    'Insufficient Evidence',
    'Rejected',
    'Resolved',
  ];

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consumerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.aiMatchedRule && c.aiMatchedRule.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedStatus === 'Needs Review') {
      return matchesSearch && c.needsReview;
    }

    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newItems = files.map((file, idx) => ({
      file,
      tag: (idx === 0 ? 'Product Packaging' : idx === 1 ? 'Receipt / Invoice' : 'Product Label / PDP') as EvidenceTag,
      previewUrl: URL.createObjectURL(file),
    }));
    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionProgress(10);
    setSubmissionStatusText('Ingesting Evidence & Running Multi-Pass OCR Pipeline...');

    try {
      const evidenceInputs: ProcessedEvidenceInput[] = uploadedFiles.map((f) => ({
        fileOrUrl: f.file,
        fileName: f.file.name,
        tag: f.tag,
      }));

      const fullCase = await buildEvidenceBackedComplaintCase(
        {
          consumerName: newComplaintData.consumerName,
          consumerEmail: newComplaintData.consumerEmail,
          consumerPhone: newComplaintData.consumerPhone,
          productName: newComplaintData.productName,
          brand: newComplaintData.brand,
          platform: newComplaintData.platform,
          productUrl: newComplaintData.productUrl,
          orderNumber: newComplaintData.orderNumber,
          description: newComplaintData.description,
          evidenceInputs,
        },
        (pct, msg) => {
          setSubmissionProgress(pct);
          setSubmissionStatusText(msg);
        }
      );

      addFullComplaint(fullCase);
      setIsSubmitModalOpen(false);
      setUploadedFiles([]);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfficerDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    updateOfficerDecision(
      selectedComplaint.id,
      officerActionType,
      officerNotes || 'Action recorded by Government Reviewing Officer.',
      'Inspector Rajesh Varma',
      assignedInspector
    );

    // Refresh selected complaint in modal
    const updated = complaints.find((c) => c.id === selectedComplaint.id);
    if (updated) {
      setSelectedComplaint({
        ...updated,
        status: (selectedComplaint.status as any),
      });
    }
    setOfficerNotes('');
  };

  const needsReviewCount = complaints.filter((c) => c.needsReview).length;
  const inInvestigationCount = complaints.filter((c) => c.status === 'Investigation' || c.status === 'Notice Dispatched').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-2 lg:max-w-[70%]">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium text-slate-300 bg-slate-800 border border-slate-700 tracking-wide">
            National Metrology &amp; Consumer Protection Review Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            Consumer Complaints &amp; Officer Dossier Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Multi-evidence OCR extraction, deterministic classification, hybrid Regulatory RAG provenance &amp; officer decision workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-2xs"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Lodge New Grievance Dossier</span>
          </Button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Total Complaints Filed
          </span>
          <div className="text-2xl font-bold text-white font-mono my-1.5">
            {complaints.length} Cases
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Auto-Triaged via Deterministic OCR
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Needs Human Review
          </span>
          <div className="text-2xl font-bold text-white font-mono my-1.5">
            {needsReviewCount} Pending
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Confidence &lt; 60% Triage Threshold
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Under Active Investigation
          </span>
          <div className="text-2xl font-bold text-white font-mono my-1.5">
            {inInvestigationCount} Docketed
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Show-Cause Notices Issued
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Resolved &amp; Recovered
          </span>
          <div className="text-2xl font-bold text-white font-mono my-1.5">
            {resolvedCount} Cases
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Officer Verified Determinations
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <Input
              placeholder="Search Ticket ID, Citizen, Product, Brand, Category, or Rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4 text-slate-400" />}
              className="text-xs bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none font-medium"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">
                  Filter Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Ingestion Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 text-white overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">
            Grievance Dossier Stream ({filteredComplaints.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Government Officer Adjudication Queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Ticket &amp; Complainant</th>
                <th className="px-3 py-3">Product &amp; Platform</th>
                <th className="px-3 py-3">Classification &amp; Confidence</th>
                <th className="px-3 py-3">Discrepancy / Overcharge</th>
                <th className="px-3 py-3">Regulatory RAG Provenance</th>
                <th className="px-3 py-3">Officer Status</th>
                <th className="px-4 py-3 text-right">Inspect Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredComplaints.map((cmp) => {
                const confScore = cmp.classificationResult?.confidenceScore || Math.round(cmp.sentimentScore * 100);
                const isOvercharged = cmp.extractedEvidenceSummary?.priceOverchargeAmount;

                return (
                  <tr
                    key={cmp.id}
                    onClick={() => {
                      setSelectedComplaint(cmp);
                      setDossierTab('correlation');
                    }}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-blue-400 font-bold">{cmp.ticketId}</div>
                      <div className="font-semibold text-white mt-0.5">{cmp.consumerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cmp.submittedAt}</div>
                    </td>

                    <td className="px-3 py-3.5 max-w-xs">
                      <div className="font-medium text-slate-200 line-clamp-1">{cmp.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {cmp.brand} • {cmp.platform} {cmp.orderNumber ? `(Order: ${cmp.orderNumber})` : ''}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-200 line-clamp-1">{cmp.category}</div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                        <span className="text-slate-500">Confidence:</span>
                        <span className="font-bold text-slate-200">{confScore}%</span>
                        {cmp.needsReview && (
                          <span className="text-amber-400 font-medium ml-1">
                            Needs Review
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      {isOvercharged ? (
                        <div className="font-mono">
                          <div className="text-rose-400 font-semibold text-xs">
                            +₹{isOvercharged} Overcharge
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            Pkg ₹{cmp.extractedEvidenceSummary?.declaredMrp} vs Bill ₹{cmp.extractedEvidenceSummary?.receiptPrice}
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-slate-400">
                          <div className="text-slate-500 text-xs mb-0.5">–</div>
                          <div className="text-[11px]">
                            {cmp.evidenceImages?.length || 1} Evidence Image(s)
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3.5 max-w-xs">
                      <div className="text-[11px] text-slate-300 font-medium line-clamp-1">
                        {cmp.aiMatchedRule}
                      </div>
                      <span className="text-[10px] text-blue-400 font-mono block mt-0.5">
                        Active Rule Version Mapped
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-transparent',
                          cmp.status === 'New' || cmp.needsReview
                            ? 'text-amber-400 border border-amber-800/60'
                            : 'text-slate-300 border border-slate-700/80'
                        )}
                      >
                        {cmp.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-semibold hover:text-blue-300">
                        <span>Inspect Case</span>
                        <span className="text-sm leading-none">›</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Government Officer Case Dossier Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Government Officer Review Dossier: ${selectedComplaint.ticketId}`}
          subtitle={`Case Dossier lodged by ${selectedComplaint.consumerName} (${selectedComplaint.consumerEmail})`}
          maxWidth="4xl"
          theme="dark"
        >
          <div className="space-y-4 text-xs">
            {/* Top Overview Strip */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:pr-3 sm:border-r sm:border-slate-800/80">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">
                  Product Title
                </span>
                <span className="font-bold text-white line-clamp-1 mt-0.5 text-xs">
                  {selectedComplaint.productName}
                </span>
              </div>
              <div className="sm:px-3 sm:border-r sm:border-slate-800/80">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">
                  Brand &amp; Platform
                </span>
                <span className="font-bold text-white mt-0.5 text-xs">
                  {selectedComplaint.brand} ({selectedComplaint.platform})
                </span>
              </div>
              <div className="sm:px-3 sm:border-r sm:border-slate-800/80">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">
                  Current Status
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider mt-1 bg-transparent',
                    selectedComplaint.status === 'New' || selectedComplaint.needsReview
                      ? 'text-amber-400 border border-amber-800/60'
                      : selectedComplaint.status === 'Resolved'
                      ? 'text-emerald-400 border border-emerald-800/60'
                      : 'text-slate-300 border border-slate-700/80'
                  )}
                >
                  {selectedComplaint.status}
                </span>
              </div>
              <div className="sm:pl-3">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">
                  Assigned Officer
                </span>
                <span
                  className="font-bold text-blue-400 mt-0.5 text-xs block truncate"
                  title={selectedComplaint.assignedOfficer || 'Pending Assignment'}
                >
                  {selectedComplaint.assignedOfficer || 'Pending Assignment'}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-800 flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setDossierTab('correlation')}
                className={cn(
                  'pb-2.5 pt-1 text-xs inline-flex items-center gap-1.5 whitespace-nowrap -mb-px border-b-2 font-medium transition-colors',
                  dossierTab === 'correlation'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <Scale className={cn('h-3.5 w-3.5', dossierTab === 'correlation' ? 'text-blue-400' : 'text-slate-500')} />
                <span>4-Way Case Correlation</span>
              </button>

              <button
                onClick={() => setDossierTab('evidence')}
                className={cn(
                  'pb-2.5 pt-1 text-xs inline-flex items-center gap-1.5 whitespace-nowrap -mb-px border-b-2 font-medium transition-colors',
                  dossierTab === 'evidence'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <ImageIcon className={cn('h-3.5 w-3.5', dossierTab === 'evidence' ? 'text-blue-400' : 'text-slate-500')} />
                <span>Evidence &amp; OCR Image Inspector ({selectedComplaint.evidenceImages?.length || 1})</span>
              </button>

              <button
                onClick={() => setDossierTab('rag')}
                className={cn(
                  'pb-2.5 pt-1 text-xs inline-flex items-center gap-1.5 whitespace-nowrap -mb-px border-b-2 font-medium transition-colors',
                  dossierTab === 'rag'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <FileSearch className={cn('h-3.5 w-3.5', dossierTab === 'rag' ? 'text-blue-400' : 'text-slate-500')} />
                <span>Regulatory RAG Provenance</span>
              </button>

              <button
                onClick={() => setDossierTab('actions')}
                className={cn(
                  'pb-2.5 pt-1 text-xs inline-flex items-center gap-1.5 whitespace-nowrap -mb-px border-b-2 font-medium transition-colors',
                  dossierTab === 'actions'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <UserCheck className={cn('h-3.5 w-3.5', dossierTab === 'actions' ? 'text-blue-400' : 'text-slate-500')} />
                <span>Officer Action &amp; Decision</span>
              </button>

              <button
                onClick={() => setDossierTab('audit')}
                className={cn(
                  'pb-2.5 pt-1 text-xs inline-flex items-center gap-1.5 whitespace-nowrap -mb-px border-b-2 font-medium transition-colors',
                  dossierTab === 'audit'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <Clock className={cn('h-3.5 w-3.5', dossierTab === 'audit' ? 'text-blue-400' : 'text-slate-500')} />
                <span>Audit Timeline ({selectedComplaint.officerDecisionHistory?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: 4-WAY CASE CORRELATION */}
            {dossierTab === 'correlation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section 1: Complainant Statement */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] font-mono tracking-wider">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <span>1. Complainant Free-Text Allegation</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs leading-relaxed italic">
                      "{selectedComplaint.description}"
                    </div>
                  </div>

                  {/* Section 2: Deterministic OCR Extraction */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[11px] font-mono tracking-wider">
                      <FileCheck2 className="h-3.5 w-3.5 text-blue-400" />
                      <span>2. OCR &amp; Evidence Extraction Finding</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1.5 font-mono text-xs text-slate-300">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-slate-400">Packaging MRP:</span>
                        <strong className="text-white">
                          {selectedComplaint.extractedEvidenceSummary?.declaredMrp || 'Extracted from OCR'}
                        </strong>
                      </div>
                      {selectedComplaint.extractedEvidenceSummary?.receiptPrice && (
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-slate-400">Receipt Store Price:</span>
                          <strong className="text-white">
                            {selectedComplaint.extractedEvidenceSummary.receiptPrice}
                          </strong>
                        </div>
                      )}
                      {selectedComplaint.extractedEvidenceSummary?.priceOverchargeAmount && (
                        <div className="pt-1.5 border-t border-slate-800">
                          <div className="text-rose-400 font-bold text-xs">
                            +₹{selectedComplaint.extractedEvidenceSummary.priceOverchargeAmount} Overcharge
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Pkg ₹{selectedComplaint.extractedEvidenceSummary?.declaredMrp} vs Bill ₹{selectedComplaint.extractedEvidenceSummary?.receiptPrice}
                          </div>
                        </div>
                      )}
                      <div className="pt-1 border-t border-slate-800/80 flex items-baseline justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 font-sans">Manufacturer:</span>
                        <strong
                          className="text-slate-200 truncate"
                          title={selectedComplaint.extractedEvidenceSummary?.manufacturer || 'Detected on label'}
                        >
                          {selectedComplaint.extractedEvidenceSummary?.manufacturer || 'Detected on label'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Regulatory RAG Context */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[11px] font-mono tracking-wider">
                      <Scale className="h-3.5 w-3.5 text-blue-400" />
                      <span>3. Regulatory RAG Mapped Context</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-2 text-xs">
                      <div className="font-bold text-white text-xs">
                        {selectedComplaint.aiMatchedRule}
                      </div>
                      <div className="text-[11px] text-slate-300 italic leading-relaxed">
                        "{selectedComplaint.regulatoryMappingResult?.matchedRules?.[0]?.verbatimClause ||
                          'Rule mandates accurate statutory declaration and prohibits selling above MRP.'}"
                      </div>
                      <span className="text-[10px] text-blue-400 font-mono block pt-1 border-t border-slate-800">
                        Active Rule Version: #{selectedComplaint.regulatoryMappingResult?.matchedRules?.[0]?.activeVersion || 1}
                      </span>
                    </div>
                  </div>

                  {/* Section 4: Verification Status */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] font-mono tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>4. Human Officer Verification Status</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1.5 text-xs">
                      <div className="font-bold text-emerald-400 text-xs inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>
                          {selectedComplaint.caseCorrelationSummary?.verificationStatus || selectedComplaint.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Automated systems provide OCR evidence &amp; regulatory context. Final legal determination requires officer decision.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Packaging Label Discrepancies Discovered by Scanner */}
                {selectedComplaint.scannerDetectedDiscrepancies && selectedComplaint.scannerDetectedDiscrepancies.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                        Additional Label Discrepancies Discovered by Scanner ({selectedComplaint.scannerDetectedDiscrepancies.length} Unseen Issues)
                      </h4>
                      <span className="text-[10px] font-mono text-blue-400 border border-blue-800/60 bg-blue-950/60 px-2 py-0.5 rounded">
                        RAG Mapped
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedComplaint.scannerDetectedDiscrepancies.map((disc, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-900 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{disc.ruleName}</span>
                            <span className="font-mono text-blue-400 text-[10px]">{disc.ruleCode}</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{disc.ruleDescription}</p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-800 font-mono">
                            <span>OCR Evidence: <strong className="text-slate-300">{disc.evidence}</strong></span>
                            <span>RAG Section: <strong className="text-slate-300">{disc.ragMapping?.section || 'Legal Metrology Rules'}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EVIDENCE & OCR IMAGE INSPECTOR */}
            {dossierTab === 'evidence' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {/* Image Selectors */}
                  <div className="flex gap-2">
                    {(selectedComplaint.evidenceImages || []).map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setSelectedEvidenceIndex(idx)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          selectedEvidenceIndex === idx
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white'
                        )}
                      >
                        Evidence #{idx + 1}: {img.tag}
                      </button>
                    ))}
                    {(!selectedComplaint.evidenceImages || selectedComplaint.evidenceImages.length === 0) && (
                      <span className="text-xs font-semibold text-slate-400">Packaging Evidence Image</span>
                    )}
                  </div>

                  {/* Toggle Bounding Box Overlay */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">View Mode:</span>
                    <button
                      onClick={() => setShowAnnotatedCopy(!showAnnotatedCopy)}
                      className={cn(
                        'px-2.5 py-1 rounded border font-semibold text-[10px] transition-colors',
                        showAnnotatedCopy
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      )}
                    >
                      {showAnnotatedCopy ? '✓ Annotated Copy (Bounding Boxes)' : 'Original Clean Image'}
                    </button>
                  </div>
                </div>

                {/* Evidence Image Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7 bg-slate-950 rounded-xl p-3 flex items-center justify-center min-h-[300px] border border-slate-800">
                    {selectedComplaint.evidenceImages?.[selectedEvidenceIndex] ? (
                      <img
                        src={
                          showAnnotatedCopy
                            ? selectedComplaint.evidenceImages[selectedEvidenceIndex].annotatedUrl ||
                              selectedComplaint.evidenceImages[selectedEvidenceIndex].originalUrl
                            : selectedComplaint.evidenceImages[selectedEvidenceIndex].originalUrl
                        }
                        alt="Evidence"
                        className="max-h-[380px] w-auto object-contain rounded border border-slate-800 shadow-lg"
                      />
                    ) : (
                      <img
                        src={selectedComplaint.evidenceUrls?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'}
                        alt="Default Evidence"
                        className="max-h-[380px] w-auto object-contain rounded border border-slate-800"
                      />
                    )}
                  </div>

                  {/* OCR Extractions List */}
                  <div className="md:col-span-5 space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-mono">
                      Extracted Statutory Parameters
                    </h4>

                    <div className="space-y-2 text-[11px] font-mono">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Declared Packaging MRP</span>
                        <span className="font-bold text-white">
                          {selectedComplaint.extractedEvidenceSummary?.declaredMrp || '₹3,499.00'}
                        </span>
                      </div>

                      {selectedComplaint.extractedEvidenceSummary?.receiptPrice && (
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Receipt Charged Price</span>
                          <span className="font-bold text-rose-400">
                            {selectedComplaint.extractedEvidenceSummary.receiptPrice}
                          </span>
                        </div>
                      )}

                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Net Quantity</span>
                        <span className="font-bold text-white">
                          {selectedComplaint.extractedEvidenceSummary?.netQuantity || '2 kg'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Manufacturer Address</span>
                        <span className="font-medium text-slate-300 text-[10px] leading-tight block mt-0.5">
                          {selectedComplaint.extractedEvidenceSummary?.manufacturer || 'NutriPro Labs Pvt Ltd'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REGULATORY RAG PROVENANCE */}
            {dossierTab === 'rag' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-200 uppercase text-[10px] block font-mono">
                    Regulatory RAG Engine &amp; Rule Versioning Provenance
                  </span>
                  <p className="text-xs text-slate-400">
                    Active statutory rules retrieved via SatyaDrishti Regulatory RAG. All rule versions are resolved against active gazette notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  {(selectedComplaint.regulatoryMappingResult?.matchedRules || []).map((rule, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-400 text-xs">{rule.ruleCode}</span>
                        <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                          Active Rule Version #{rule.activeVersion}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-xs">{rule.title}</h4>
                      <div className="text-[11px] font-medium text-slate-400">{rule.section}</div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                        "{rule.verbatimClause}"
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                        <div>Gazette: <strong className="text-slate-200">{rule.officialGazetteRef}</strong></div>
                        <div>Effective Date: <strong className="text-slate-200">{rule.effectiveDate}</strong></div>
                        <div>Max Penalty: <strong className="text-slate-200">₹{rule.penalties.maxFine.toLocaleString()}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: OFFICER ACTION & DECISION FORM */}
            {dossierTab === 'actions' && (
              <form onSubmit={handleOfficerDecisionSubmit} className="space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 text-white">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                    Record Formal Government Officer Determination
                  </h4>
                  <p className="text-xs text-slate-400">
                    Select the statutory action to take on this complaint case docket.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Statutory Action
                    </label>
                    <select
                      value={officerActionType}
                      onChange={(e) => setOfficerActionType(e.target.value as OfficerActionType)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none font-semibold"
                    >
                      <option value="ACCEPT_INVESTIGATION" className="bg-slate-900">Accept for Formal Investigation</option>
                      <option value="ASSIGN_INSPECTION" className="bg-slate-900">Assign Zonal Officer for On-Site Inspection</option>
                      <option value="REQUEST_INFO" className="bg-slate-900">Request More Information from Complainant</option>
                      <option value="INSUFFICIENT_EVIDENCE" className="bg-slate-900">Mark as Insufficient Evidence</option>
                      <option value="REJECT" className="bg-slate-900">Reject / Dismiss Complaint</option>
                      <option value="RESOLVE" className="bg-slate-900">Resolve Complaint &amp; Recover Penalty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Assigned Inspector / Officer Name
                    </label>
                    <Input
                      value={assignedInspector}
                      onChange={(e) => setAssignedInspector(e.target.value)}
                      className="text-xs bg-slate-900 border-slate-800 text-white focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Officer Decision Rationale &amp; Investigation Notes
                  </label>
                  <textarea
                    rows={4}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter formal justification, instructions for zonal inspection team, or notice details..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none leading-relaxed placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button variant="primary" size="sm" type="submit" className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                    <UserCheck className="h-4 w-4" />
                    <span>Submit Formal Decision</span>
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 5: AUDIT TIMELINE */}
            {dossierTab === 'audit' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
                  Timestamped Officer Decision Audit History
                </h4>

                <div className="space-y-2">
                  {(selectedComplaint.officerDecisionHistory || []).map((rec) => (
                    <div key={rec.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-blue-400">{rec.actionLabel}</span>
                        <span className="text-slate-500">{rec.timestamp}</span>
                      </div>
                      <div className="text-slate-200 font-semibold">{rec.officerName}</div>
                      <p className="text-slate-400 font-sans text-xs italic">"{rec.notes}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Grievance Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Citizen Vigilance: Lodge Packaging / MRP Grievance Dossier"
        subtitle="Multi-Evidence Processing, Deterministic Classification & Regulatory RAG Ingestion"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Consumer Full Name"
              value={newComplaintData.consumerName}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, consumerName: e.target.value })}
              required
            />
            <Input
              label="Consumer Email"
              type="email"
              value={newComplaintData.consumerEmail}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, consumerEmail: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Product Title"
              value={newComplaintData.productName}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, productName: e.target.value })}
              required
            />
            <Input
              label="Brand / Manufacturer"
              value={newComplaintData.brand}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, brand: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-Commerce Platform
              </label>
              <select
                value={newComplaintData.platform}
                onChange={(e) =>
                  setNewComplaintData({ ...newComplaintData, platform: e.target.value as PlatformType })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
              >
                <option>Amazon</option>
                <option>Flipkart</option>
                <option>Blinkit</option>
                <option>Zepto</option>
                <option>Meesho</option>
                <option>Direct</option>
              </select>
            </div>

            <Input
              label="Product Listing URL (Optional)"
              placeholder="https://amazon.in/dp/..."
              value={newComplaintData.productUrl}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, productUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Grievance Description & Discrepancy Statement
            </label>
            <textarea
              rows={3}
              value={newComplaintData.description}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Multi Evidence Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Evidence Images (Packaging, Store Bill, Invoice)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedFiles.map((f, i) => (
                  <span key={i} className="bg-slate-100 text-slate-800 text-[10px] font-mono px-2 py-1 rounded border border-slate-200">
                    {f.file.name} ({f.tag})
                  </span>
                ))}
              </div>
            )}
          </div>

          {isSubmitting && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs font-mono text-blue-800 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>{submissionStatusText} ({submissionProgress}%)</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5 bg-blue-700 hover:bg-blue-800">
              <Send className="h-3.5 w-3.5" />
              <span>Process & Submit Dossier</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
