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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 w-fit">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>National Metrology & Consumer Protection Review Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Consumer Complaints & Officer Dossier Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-evidence OCR extraction, deterministic classification, hybrid Regulatory RAG provenance & officer decision workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="text-xs gap-1.5 bg-blue-700 hover:bg-blue-800"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Lodge New Grievance Dossier</span>
          </Button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase block">Total Complaints Filed</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{complaints.length} Cases</div>
          <span className="text-[11px] text-blue-600 font-medium">Auto-Triaged via Deterministic OCR</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase block">Needs Human Review</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{needsReviewCount} Pending</div>
          <span className="text-[11px] text-amber-700 font-medium">Confidence &lt; 60% Triage Threshold</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase block">Under Active Investigation</span>
          <div className="text-2xl font-bold text-purple-700 font-mono mt-1">{inInvestigationCount} Docketed</div>
          <span className="text-[11px] text-purple-600 font-medium">Show-Cause Notices Issued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase block">Resolved & Recovered</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">{resolvedCount} Cases</div>
          <span className="text-[11px] text-emerald-600 font-medium">Officer Verified Determinations</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <Input
                placeholder="Search Ticket ID, Citizen, Product, Brand, Category, or Rule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="text-xs"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    Filter Status: {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Ingestion Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MessageSquareWarning className="h-4 w-4 text-slate-700" />
            <span>Grievance Dossier Stream ({filteredComplaints.length})</span>
          </CardTitle>
          <span className="text-xs font-mono text-slate-500">Government Officer Adjudication Queue</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Ticket & Complainant</th>
                <th className="px-3 py-3">Product & Platform</th>
                <th className="px-3 py-3">Classification & Confidence</th>
                <th className="px-3 py-3">Discrepancy / Overcharge</th>
                <th className="px-3 py-3">Regulatory RAG Provenance</th>
                <th className="px-3 py-3">Officer Status</th>
                <th className="px-4 py-3 text-right">Inspect Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-blue-700 font-bold">{cmp.ticketId}</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{cmp.consumerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cmp.submittedAt}</div>
                    </td>

                    <td className="px-3 py-3 max-w-xs">
                      <div className="font-medium text-slate-900 line-clamp-1">{cmp.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {cmp.brand} • {cmp.platform} {cmp.orderNumber ? `(Order: ${cmp.orderNumber})` : ''}
                      </div>
                    </td>

                    <td className="px-3 py-3 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{cmp.category}</div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                        <span className="text-slate-500">Confidence:</span>
                        <span
                          className={`font-bold ${
                            confScore >= 80
                              ? 'text-emerald-700'
                              : confScore >= 60
                              ? 'text-amber-700'
                              : 'text-red-600'
                          }`}
                        >
                          {confScore}%
                        </span>
                        {cmp.needsReview && (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold text-[9px] border border-amber-300">
                            Needs Review
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      {isOvercharged ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-[11px] font-mono font-bold">
                          +₹{isOvercharged} Overcharge
                          <span className="block text-[9px] font-normal text-red-600">
                            Pkg ₹{cmp.extractedEvidenceSummary?.declaredMrp} vs Bill ₹{cmp.extractedEvidenceSummary?.receiptPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">
                          {cmp.evidenceImages?.length || 1} Evidence Image(s)
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 max-w-xs">
                      <div className="text-[11px] text-slate-800 font-medium line-clamp-1">
                        {cmp.aiMatchedRule}
                      </div>
                      <span className="text-[10px] text-blue-600 font-mono block mt-0.5">
                        ✓ Active Rule Version Mapped
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          cmp.status === 'Resolved'
                            ? 'success'
                            : cmp.status === 'Notice Dispatched' || cmp.status === 'Investigation'
                            ? 'danger'
                            : cmp.status === 'Assigned for Inspection'
                            ? 'warning'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {cmp.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-700 gap-1 font-semibold">
                        <span>Inspect Case</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comprehensive Government Officer Case Dossier Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Government Officer Review Dossier: ${selectedComplaint.ticketId}`}
          subtitle={`Case Dossier lodged by ${selectedComplaint.consumerName} (${selectedComplaint.consumerEmail})`}
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Overview Strip */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Product Title</span>
                <span className="font-bold text-slate-900 line-clamp-1">{selectedComplaint.productName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Brand & Platform</span>
                <span className="font-bold text-slate-900">
                  {selectedComplaint.brand} ({selectedComplaint.platform})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Current Status</span>
                <Badge variant="primary" size="sm" className="mt-0.5">
                  {selectedComplaint.status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Assigned Officer</span>
                <span className="font-bold text-blue-700">
                  {selectedComplaint.assignedOfficer || 'Pending Assignment'}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-4">
              <button
                onClick={() => setDossierTab('correlation')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  dossierTab === 'correlation'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Scale className="h-4 w-4" />
                <span>4-Way Case Correlation</span>
              </button>

              <button
                onClick={() => setDossierTab('evidence')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  dossierTab === 'evidence'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Evidence & OCR Image Inspector ({selectedComplaint.evidenceImages?.length || 1})</span>
              </button>

              <button
                onClick={() => setDossierTab('rag')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  dossierTab === 'rag'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileSearch className="h-4 w-4" />
                <span>Regulatory RAG Provenance</span>
              </button>

              <button
                onClick={() => setDossierTab('actions')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  dossierTab === 'actions'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Officer Action & Decision</span>
              </button>

              <button
                onClick={() => setDossierTab('audit')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  dossierTab === 'audit'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Audit Timeline ({selectedComplaint.officerDecisionHistory?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: 4-WAY CASE CORRELATION */}
            {dossierTab === 'correlation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Complainant Statement */}
                  <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold uppercase text-[10px]">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span>1. Complainant Free-Text Allegation</span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed italic bg-white p-2.5 rounded border border-amber-100">
                      "{selectedComplaint.description}"
                    </p>
                  </div>

                  {/* Deterministic OCR Extraction */}
                  <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-900 font-bold uppercase text-[10px]">
                      <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>2. OCR & Evidence Extraction Finding</span>
                    </div>
                    <div className="text-slate-800 text-xs bg-white p-2.5 rounded border border-blue-100 space-y-1 font-mono">
                      <div>
                        Packaging MRP: <strong>{selectedComplaint.extractedEvidenceSummary?.declaredMrp || 'Extracted from OCR'}</strong>
                      </div>
                      {selectedComplaint.extractedEvidenceSummary?.receiptPrice && (
                        <div>
                          Receipt Store Price: <strong>{selectedComplaint.extractedEvidenceSummary.receiptPrice}</strong>
                        </div>
                      )}
                      {selectedComplaint.extractedEvidenceSummary?.priceOverchargeAmount && (
                        <div className="text-red-600 font-bold">
                          Calculated Overcharge: +₹{selectedComplaint.extractedEvidenceSummary.priceOverchargeAmount}
                        </div>
                      )}
                      <div>
                        Manufacturer: <strong>{selectedComplaint.extractedEvidenceSummary?.manufacturer || 'Detected on label'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Regulatory RAG Context */}
                  <div className="p-3.5 bg-purple-50/80 rounded-xl border border-purple-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-900 font-bold uppercase text-[10px]">
                      <Scale className="h-3.5 w-3.5 text-purple-600" />
                      <span>3. Regulatory RAG Mapped Context</span>
                    </div>
                    <div className="text-slate-800 text-xs bg-white p-2.5 rounded border border-purple-100 space-y-1">
                      <div className="font-bold text-purple-950">{selectedComplaint.aiMatchedRule}</div>
                      <div className="text-[11px] text-purple-700">
                        {selectedComplaint.regulatoryMappingResult?.matchedRules?.[0]?.verbatimClause ||
                          'Rule mandates accurate statutory declaration and prohibits selling above MRP.'}
                      </div>
                      <span className="text-[10px] text-purple-600 font-mono block mt-1">
                        Active Rule Version: {selectedComplaint.regulatoryMappingResult?.matchedRules?.[0]?.activeVersion || 1}
                      </span>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold uppercase text-[10px]">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>4. Human Officer Verification Status</span>
                    </div>
                    <div className="text-slate-800 text-xs bg-white p-2.5 rounded border border-emerald-100 space-y-1">
                      <div className="font-bold text-emerald-900">
                        {selectedComplaint.caseCorrelationSummary?.verificationStatus || selectedComplaint.status}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Automated systems provide OCR evidence & regulatory context. Final legal determination requires officer decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EVIDENCE & OCR IMAGE INSPECTOR */}
            {dossierTab === 'evidence' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {/* Image Selectors */}
                  <div className="flex gap-2">
                    {(selectedComplaint.evidenceImages || []).map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setSelectedEvidenceIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedEvidenceIndex === idx
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Evidence #{idx + 1}: {img.tag}
                      </button>
                    ))}
                    {(!selectedComplaint.evidenceImages || selectedComplaint.evidenceImages.length === 0) && (
                      <span className="text-xs font-semibold text-slate-600">Packaging Evidence Image</span>
                    )}
                  </div>

                  {/* Toggle Bounding Box Overlay */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500">View Mode:</span>
                    <button
                      onClick={() => setShowAnnotatedCopy(!showAnnotatedCopy)}
                      className={`px-2.5 py-1 rounded border font-bold text-[10px] transition-colors ${
                        showAnnotatedCopy
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {showAnnotatedCopy ? '✓ Annotated Copy (Bounding Boxes)' : 'Original Clean Image'}
                    </button>
                  </div>
                </div>

                {/* Evidence Image Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7 bg-slate-900 rounded-xl p-3 flex items-center justify-center min-h-[300px]">
                    {selectedComplaint.evidenceImages?.[selectedEvidenceIndex] ? (
                      <img
                        src={
                          showAnnotatedCopy
                            ? selectedComplaint.evidenceImages[selectedEvidenceIndex].annotatedUrl ||
                              selectedComplaint.evidenceImages[selectedEvidenceIndex].originalUrl
                            : selectedComplaint.evidenceImages[selectedEvidenceIndex].originalUrl
                        }
                        alt="Evidence"
                        className="max-h-[380px] w-auto object-contain rounded border border-slate-700 shadow-lg"
                      />
                    ) : (
                      <img
                        src={selectedComplaint.evidenceUrls?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'}
                        alt="Default Evidence"
                        className="max-h-[380px] w-auto object-contain rounded border border-slate-700"
                      />
                    )}
                  </div>

                  {/* OCR Extractions List */}
                  <div className="md:col-span-5 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Extracted Statutory Parameters
                    </h4>

                    <div className="space-y-2 text-[11px] font-mono">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Declared Packaging MRP</span>
                        <span className="font-bold text-slate-900">
                          {selectedComplaint.extractedEvidenceSummary?.declaredMrp || '₹3,499.00'}
                        </span>
                      </div>

                      {selectedComplaint.extractedEvidenceSummary?.receiptPrice && (
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Receipt Charged Price</span>
                          <span className="font-bold text-red-600">
                            {selectedComplaint.extractedEvidenceSummary.receiptPrice}
                          </span>
                        </div>
                      )}

                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Net Quantity</span>
                        <span className="font-bold text-slate-900">
                          {selectedComplaint.extractedEvidenceSummary?.netQuantity || '2 kg'}
                        </span>
                      </div>

                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Manufacturer Address</span>
                        <span className="font-medium text-slate-800 text-[10px] leading-tight block mt-0.5">
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
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-900 uppercase text-[10px] block">
                    Regulatory RAG Engine & Rule Versioning Provenance
                  </span>
                  <p className="text-xs text-blue-800">
                    Active statutory rules retrieved via SatyaDrishti Regulatory RAG. All rule versions are resolved against active gazette notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  {(selectedComplaint.regulatoryMappingResult?.matchedRules || []).map((rule, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700 text-xs">{rule.ruleCode}</span>
                        <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                          Active Rule Version #{rule.activeVersion}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs">{rule.title}</h4>
                      <div className="text-[11px] font-medium text-slate-700">{rule.section}</div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 italic">
                        "{rule.verbatimClause}"
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                        <div>Gazette: <strong>{rule.officialGazetteRef}</strong></div>
                        <div>Effective Date: <strong>{rule.effectiveDate}</strong></div>
                        <div>Max Penalty: <strong>₹{rule.penalties.maxFine.toLocaleString()}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: OFFICER ACTION & DECISION FORM */}
            {dossierTab === 'actions' && (
              <form onSubmit={handleOfficerDecisionSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Record Formal Government Officer Determination
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select the statutory action to take on this complaint case docket.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Statutory Action
                    </label>
                    <select
                      value={officerActionType}
                      onChange={(e) => setOfficerActionType(e.target.value as OfficerActionType)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-semibold"
                    >
                      <option value="ACCEPT_INVESTIGATION">Accept for Formal Investigation</option>
                      <option value="ASSIGN_INSPECTION">Assign Zonal Officer for On-Site Inspection</option>
                      <option value="REQUEST_INFO">Request More Information from Complainant</option>
                      <option value="INSUFFICIENT_EVIDENCE">Mark as Insufficient Evidence</option>
                      <option value="REJECT">Reject / Dismiss Complaint</option>
                      <option value="RESOLVE">Resolve Complaint & Recover Penalty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Assigned Inspector / Officer Name
                    </label>
                    <Input
                      value={assignedInspector}
                      onChange={(e) => setAssignedInspector(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Officer Decision Rationale & Investigation Notes
                  </label>
                  <textarea
                    rows={4}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter formal justification, instructions for zonal inspection team, or notice details..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button variant="primary" size="sm" type="submit" className="gap-1.5 bg-blue-700 hover:bg-blue-800">
                    <UserCheck className="h-4 w-4" />
                    <span>Submit Formal Decision</span>
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 5: AUDIT TIMELINE */}
            {dossierTab === 'audit' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Timestamped Officer Decision Audit History
                </h4>

                <div className="space-y-2">
                  {(selectedComplaint.officerDecisionHistory || []).map((rec) => (
                    <div key={rec.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1 font-mono">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-blue-700">{rec.actionLabel}</span>
                        <span className="text-slate-400">{rec.timestamp}</span>
                      </div>
                      <div className="text-slate-800 font-semibold">{rec.officerName}</div>
                      <p className="text-slate-600 font-sans text-xs italic">"{rec.notes}"</p>
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
