import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  Send,
  ShieldCheck,
  Scale,
  FileSearch,
  UserCheck,
  Trash2,
  Loader2,
  Image as ImageIcon,
  FileCheck2,
  Languages,
  Wand2,
  MapPin,
  FileText,
  X as XIcon,
  Info,
  Store,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import {
  Complaint,
  OfficerActionType,
  EvidenceTag,
  SupportedLanguage,
  ShopLocation,
} from '../../types/compliance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { buildEvidenceBackedComplaintCase } from '../../lib/complaintCaseCorrelator';
import { ProcessedEvidenceInput } from '../../lib/complaintOcrPipeline';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { transliterateText } from '../../lib/indicTransliteration';
import { cn } from '../../lib/utils';
import { ShopSearchInput } from '../../components/citizen/ShopSearchInput';

export const ConsumerComplaintsPortal: React.FC = () => {
  const { user } = useAuthStore();
  const isConsumer = user?.role === 'consumer';
  const { language, setLanguage, t } = useLanguageStore();
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
    consumerName: user?.name || 'Ananya Verma',
    consumerEmail: user?.email || 'consumer@demo.gov.in',
    productName: '',
    brand: '',
    platform: 'Direct' as string,
    productUrl: '',
    description: 'The packet says MRP ₹1,999 but the shop charged me ₹2,499 on bill invoice. Also sticker was overprinted on printed MRP.',
  });

  // Shop location selected via Google Maps Places Autocomplete
  const [shopLocation, setShopLocation] = useState<ShopLocation | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; tag: EvidenceTag; previewUrl: string; isImage: boolean }[]>([]);
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
    const existingCount = uploadedFiles.length;
    const newItems = files.map((file, idx) => {
      const pos = existingCount + idx;
      const isImage = file.type.startsWith('image/');
      return {
        file,
        tag: (pos === 0 ? 'Product Packaging' : pos === 1 ? 'Receipt / Invoice' : 'General Evidence') as EvidenceTag,
        previewUrl: isImage ? URL.createObjectURL(file) : '',
        isImage,
      };
    });
    setUploadedFiles((prev) => [...prev, ...newItems]);
    // Reset file input so same file can be re-added if removed
    e.target.value = '';
  };

  const handleRemoveFile = (idx: number) => {
    setUploadedFiles((prev) => {
      const copy = [...prev];
      if (copy[idx].previewUrl) URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      // Re-tag remaining files
      return copy.map((f, i) => ({
        ...f,
        tag: (i === 0 ? 'Product Packaging' : i === 1 ? 'Receipt / Invoice' : 'General Evidence') as EvidenceTag,
      }));
    });
  };

  const handleTransliterate = () => {
    if (!newComplaintData.description) return;
    const converted = transliterateText(newComplaintData.description, language);
    setNewComplaintData((prev) => ({ ...prev, description: converted }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComplaintData.description.trim().length < 30) {
      alert('Please describe your issue in at least 30 characters.');
      return;
    }
    setIsSubmitting(true);
    setSubmissionProgress(10);
    setSubmissionStatusText(t('submittingBtn'));

    try {
      const evidenceInputs: ProcessedEvidenceInput[] = uploadedFiles.map((f) => ({
        fileOrUrl: f.file,
        fileName: f.file.name,
        tag: f.tag,
      }));

      const fullCase = await buildEvidenceBackedComplaintCase(
        {
          language,
          consumerName: newComplaintData.consumerName,
          consumerEmail: newComplaintData.consumerEmail,
          description: newComplaintData.description,
          evidenceInputs,
          shopLocation: shopLocation ?? undefined,
          productName: newComplaintData.productName || shopLocation?.name || 'Physical Retail Purchase',
          brand: newComplaintData.brand || undefined,
          platform: (newComplaintData.platform || 'Direct') as any,
          productUrl: newComplaintData.productUrl || undefined,
        },
        (pct, msg) => {
          setSubmissionProgress(pct);
          setSubmissionStatusText(msg);
        }
      );

      addFullComplaint(fullCase);
      setIsSubmitModalOpen(false);
      setUploadedFiles([]);
      setShopLocation(null);
      setNewComplaintData(prev => ({
        ...prev,
        productName: '',
        brand: '',
        platform: 'Direct',
        productUrl: '',
        description: '',
      }));
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
  const isInspector = user?.role === 'inspector';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Multilingual Language Selector Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Languages className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{t('selectLanguage')}:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिन्दी' },
            { code: 'kn', label: 'ಕನ್ನಡ' },
            { code: 'ta', label: 'தமிழ்' },
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code as SupportedLanguage)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === lang.code
                  ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className={`rounded-xl border p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs ${
        isConsumer
          ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 border-emerald-200 text-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 dark:border-emerald-800/60 dark:text-white'
          : isInspector
          ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-200 text-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 dark:border-amber-800/60 dark:text-white'
          : 'bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white'
      }`}>
        <div className="space-y-2 lg:max-w-[70%]">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {isConsumer
              ? t('portalTitle')
              : isInspector
              ? 'Assigned Grievance & Field Investigation Docket'
              : 'National Grievance Adjudication & Dossier Stream'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isConsumer
              ? t('portalSubtitle')
              : isInspector
              ? 'Review consumer packaging & pricing grievances routed to your jurisdiction for physical retail verification and evidence collection.'
              : 'Central CCPA Directorate console for triaging consumer complaints, validating evidence-backed OCR correlations, and dispatching statutory Section 36 Show Cause Notices.'}
          </p>
        </div>

        {!isInspector && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              className={`text-xs gap-1.5 font-semibold px-4 py-2.5 rounded-lg shadow-2xs ${
                isConsumer
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              onClick={() => setIsSubmitModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>
                {isConsumer
                  ? t('lodgeGrievanceBtn')
                  : 'Ingest / Simulate Grievance Case'}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('metricsTotalRegistered')}
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono my-1.5">
            {complaints.length}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('metricsTotalSub')}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('metricsUnderReview')}
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono my-1.5">
            {needsReviewCount}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('metricsReviewSub')}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('metricsActiveNotice')}
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono my-1.5">
            {inInvestigationCount}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('metricsNoticeSub')}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t('metricsResolved')}
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono my-1.5">
            {resolvedCount}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('metricsResolvedSub')}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4 text-slate-400" />}
              className="text-xs bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 dark:bg-slate-950/60 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none font-medium dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {t('filterByStatus')}: {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Ingestion Table */}
      <div className="rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {isConsumer
              ? `My Grievance Submissions (${filteredComplaints.length})`
              : isInspector
              ? `Assigned Zonal Inquiries (${filteredComplaints.length})`
              : `Grievance Dossier Stream (${filteredComplaints.length})`}
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {isConsumer
              ? 'Citizen Grievance Status & Resolution Ledger'
              : isInspector
              ? 'Zonal Field Inspection & Evidence Queue'
              : 'Government Officer Adjudication Queue'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/60 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-blue-600 dark:text-blue-400 font-bold">{cmp.ticketId}</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{cmp.consumerName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{cmp.submittedAt}</div>
                    </td>

                    <td className="px-3 py-3.5 max-w-xs">
                      {cmp.shopLocation ? (
                        <>
                          <div className="font-medium text-slate-700 dark:text-slate-200 line-clamp-1 flex items-center gap-1">
                            <Store className="h-3 w-3 text-blue-400 shrink-0" />
                            {cmp.shopLocation.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono line-clamp-1">
                            {cmp.shopLocation.address.split(',').slice(0, 2).join(',')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{cmp.productName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {cmp.brand} • {cmp.platform}
                          </div>
                        </>
                      )}
                    </td>

                    <td className="px-3 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{cmp.category}</div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                        <span className="text-slate-400 dark:text-slate-500">Confidence:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{confScore}%</span>
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
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            Pkg ₹{cmp.extractedEvidenceSummary?.declaredMrp} vs Bill ₹{cmp.extractedEvidenceSummary?.receiptPrice}
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-slate-500 dark:text-slate-400">
                          <div className="text-slate-500 text-xs mb-0.5">–</div>
                          <div className="text-[11px]">
                            {cmp.evidenceImages?.length || 1} Evidence Image(s)
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3.5 max-w-xs">
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                        {cmp.aiMatchedRule}
                      </div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block mt-0.5">
                        Active Rule Version Mapped
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-transparent',
                          cmp.status === 'New' || cmp.needsReview
                            ? 'text-amber-600 border border-amber-300 dark:text-amber-400 dark:border-amber-800/60'
                            : 'text-slate-600 border border-slate-300 dark:text-slate-300 dark:border-slate-700/80'
                        )}
                      >
                        {cmp.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300">
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
                  {selectedComplaint.shopLocation ? 'Shop / Store' : 'Product Title'}
                </span>
                <span className="font-bold text-white line-clamp-1 mt-0.5 text-xs flex items-center gap-1">
                  {selectedComplaint.shopLocation ? (
                    <><Store className="h-3 w-3 text-blue-400 shrink-0" />{selectedComplaint.shopLocation.name}</>
                  ) : selectedComplaint.productName}
                </span>
                {selectedComplaint.shopLocation && (
                  <a
                    href={selectedComplaint.shopLocation.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 hover:underline mt-0.5 block font-mono"
                  >
                    📍 View on Maps
                  </a>
                )}
              </div>
              <div className="sm:px-3 sm:border-r sm:border-slate-800/80">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">
                  {selectedComplaint.shopLocation ? 'Shop Address' : 'Brand & Platform'}
                </span>
                <span className="font-bold text-white mt-0.5 text-xs block leading-tight line-clamp-2">
                  {selectedComplaint.shopLocation
                    ? selectedComplaint.shopLocation.address
                    : `${selectedComplaint.brand} (${selectedComplaint.platform})`
                  }
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

              {!isConsumer && (
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
              )}

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
                <span>{isConsumer ? 'Official Case Timeline' : 'Audit Timeline'} ({selectedComplaint.officerDecisionHistory?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: 4-WAY CASE CORRELATION */}
            {dossierTab === 'correlation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section 1: Complainant Statement */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between text-amber-400 font-bold uppercase text-[11px] font-mono tracking-wider">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        <span>1. Complainant Free-Text Allegation</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] bg-blue-950 text-blue-400 border-blue-800 uppercase">
                        Language: {selectedComplaint.language ? selectedComplaint.language.toUpperCase() : 'EN'}
                      </Badge>
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
        title={t('newGrievanceTitle')}
        subtitle={t('newGrievanceSubtitle')}
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">

          {/* ── Step 1: Consumer Identity ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Identity</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label={t('consumerNameLabel')}
                value={newComplaintData.consumerName}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, consumerName: e.target.value })}
                required
              />
              <Input
                label={t('emailLabel')}
                type="email"
                value={newComplaintData.consumerEmail}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, consumerEmail: e.target.value })}
                required
              />
            </div>
          </div>

          {/* ── Step 2: Shop / Store Location (Google Maps) ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shop / Store Where You Purchased</span>
            </div>
            <ShopSearchInput
              value={shopLocation}
              onChange={setShopLocation}
            />
            {!shopLocation && (
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Info className="h-3 w-3 mt-0.5 shrink-0 text-blue-400" />
                <span>Search for the physical shop/store where you purchased the product. This helps the inspector locate the shop for on-site verification.</span>
              </div>
            )}
          </div>

          {/* ── Step 3: Product Details ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <Input
                label="Product Title"
                placeholder="e.g. NutriPro Whey Protein 1kg"
                value={newComplaintData.productName}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, productName: e.target.value })}
              />
              <Input
                label="Brand / Manufacturer"
                placeholder="e.g. NutriPro Labs"
                value={newComplaintData.brand}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, brand: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  E-Commerce Platform
                </label>
                <select
                  value={newComplaintData.platform}
                  onChange={(e) => setNewComplaintData({ ...newComplaintData, platform: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="Direct">Direct / In-Store</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Blinkit">Blinkit</option>
                  <option value="Zepto">Zepto</option>
                  <option value="Meesho">Meesho</option>
                  <option value="Nykaa">Nykaa</option>
                  <option value="BigBasket">BigBasket</option>
                </select>
              </div>
              <Input
                label="Product Listing URL"
                placeholder="https://amazon.in/dp/... (optional)"
                value={newComplaintData.productUrl}
                onChange={(e) => setNewComplaintData({ ...newComplaintData, productUrl: e.target.value })}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">4</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Describe Your Grievance</span>
              <span className="text-rose-500 text-xs font-bold ml-0.5">*</span>
              {language !== 'en' && (
                <button
                  type="button"
                  onClick={handleTransliterate}
                  className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 dark:text-blue-400 px-2 py-0.5 rounded transition-colors"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>{t('transliterateBtn')}</span>
                </button>
              )}
            </div>
            <textarea
              rows={7}
              value={newComplaintData.description}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, description: e.target.value })}
              placeholder={`Describe your issue in detail. For example:
• The MRP printed on the packet says ₹199, but the shop charged me ₹250.
• A new price sticker was pasted over the original printed MRP.
• The shop refused to give a bill/invoice on request.
• The product packaging appeared tampered, re-sealed, or re-labelled.
• The net quantity on the pack does not match what was actually inside.
• The manufacturing/expiry date was missing or smudged on the label.`}
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all resize-none"
              required
              minLength={30}
            />
            <div className="mt-1.5 flex items-center justify-between">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {t('transliterationHelp')}
              </div>
              <div className={`text-[10px] font-mono font-semibold ${
                newComplaintData.description.length < 30
                  ? 'text-rose-400'
                  : newComplaintData.description.length < 100
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}>
                {newComplaintData.description.length} chars
                {newComplaintData.description.length < 30 && ` (min 30)`}
              </div>
            </div>
          </div>

          {/* ── Step 5: Evidence Upload ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">5</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('evidenceHeader')}</span>
            </div>

            {/* Drop zone */}
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/20 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 transition-colors">
                <ImageIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Upload product images, bill/invoice photos</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG, HEIC, PDF supported • Multiple files allowed</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* File list with thumbnails */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    {/* Thumbnail or icon */}
                    {f.isImage && f.previewUrl ? (
                      <img
                        src={f.previewUrl}
                        alt={f.file.name}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-amber-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-700 dark:text-slate-200 text-xs truncate">{f.file.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                          {f.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(f.file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                      aria-label="Remove file"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Processing Notice */}
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/20 flex items-start gap-2.5">
            <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px]">✨</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">AI-Assisted Complaint Processing</p>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5 leading-relaxed">
                On submission, your grievance will be automatically classified, severity assessed, OCR-extracted from evidence images, matched to regulatory rules (CCPA / Legal Metrology Act), and an inspector-ready dossier will be generated.
              </p>
            </div>
          </div>

          {isSubmitting && (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-mono text-blue-800 dark:text-blue-300">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="font-semibold">{submissionStatusText}</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${submissionProgress}%` }}
                />
              </div>
              <div className="text-right text-[10px] mt-1 text-blue-500">{submissionProgress}%</div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitModalOpen(false)}>
              {t('cancelBtn')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || newComplaintData.description.trim().length < 30}
              className={`gap-1.5 text-white font-semibold ${
                isSubmitting || newComplaintData.description.trim().length < 30
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Processing...' : t('submitComplaintBtn')}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
