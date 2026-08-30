import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Product, PlatformType, EvidenceTag, Complaint } from '../../types/compliance';
import { useComplianceStore } from '../../store/complianceStore';
import { useAuthStore } from '../../store/authStore';
import { buildEvidenceBackedComplaintCase } from '../../lib/complaintCaseCorrelator';
import { ProcessedEvidenceInput } from '../../lib/complaintOcrPipeline';
import {
  AlertTriangle,
  Send,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Sparkles,
  Shield,
  Trash2,
  Link2,
} from 'lucide-react';

interface PublicComplaintModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicComplaintModal: React.FC<PublicComplaintModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { addFullComplaint } = useComplianceStore();

  const [formData, setFormData] = useState({
    consumerName: user?.name || 'Ananya Verma',
    consumerEmail: user?.email || 'consumer@demo.gov.in',
    consumerPhone: '+91 98200 12345',
    productName: '',
    brand: '',
    platform: 'Amazon' as PlatformType,
    productUrl: '',
    orderNumber: 'OD-2026-CITIZEN-001',
    description: '',
  });

  const [uploadedEvidence, setUploadedEvidence] = useState<{
    file: File;
    previewUrl: string;
    tag: EvidenceTag;
  }[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatusText, setProcessingStatusText] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        consumerName: user?.name || prev.consumerName,
        consumerEmail: user?.email || prev.consumerEmail,
        productName: product.title,
        brand: product.brand,
        platform: product.platform,
        productUrl: product.productUrl || '',
        description: `Discrepancy noticed on ${product.title} (MRP: ₹${product.mrp}, Net Qty: ${product.netWeight}, FSSAI: ${product.fssaiLicenseNumber || 'N/A'}): The packaged unit received did not comply with statutory declaration standards. Printed MRP on packaging vs billed store amount discrepancy noticed.`,
      }));
    }
  }, [product, user]);

  if (!product) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newItems = files.map((file, idx) => {
      const defaultTag: EvidenceTag =
        idx === 0
          ? 'Product Packaging'
          : idx === 1
          ? 'Receipt / Invoice'
          : 'Product Label / PDP';

      return {
        file,
        previewUrl: URL.createObjectURL(file),
        tag: defaultTag,
      };
    });

    setUploadedEvidence((prev) => [...prev, ...newItems]);
  };

  const removeEvidence = (index: number) => {
    setUploadedEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEvidenceTag = (index: number, newTag: EvidenceTag) => {
    setUploadedEvidence((prev) =>
      prev.map((item, i) => (i === index ? { ...item, tag: newTag } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingProgress(5);
    setProcessingStatusText('Initializing Multi-Evidence Processing Pipeline...');

    try {
      const evidenceInputs: ProcessedEvidenceInput[] = uploadedEvidence.map((item) => ({
        fileOrUrl: item.file,
        fileName: item.file.name,
        tag: item.tag,
      }));

      // Fallback if no file uploaded: use product image as packaging evidence
      if (evidenceInputs.length === 0 && product.imageUrl) {
        evidenceInputs.push({
          fileOrUrl: product.imageUrl,
          fileName: 'product_catalog_image.jpg',
          tag: 'Product Packaging',
        });
      }

      const complaintDossier = await buildEvidenceBackedComplaintCase(
        {
          consumerName: formData.consumerName,
          consumerEmail: formData.consumerEmail,
          consumerPhone: formData.consumerPhone,
          productName: product.title,
          brand: product.brand,
          platform: product.platform,
          productUrl: formData.productUrl || product.productUrl,
          orderNumber: formData.orderNumber,
          description: formData.description,
          evidenceInputs,
        },
        (progressPercent, statusMsg) => {
          setProcessingProgress(progressPercent);
          setProcessingStatusText(statusMsg);
        }
      );

      addFullComplaint(complaintDossier);
      setCreatedComplaint(complaintDossier);
      setIsSuccess(true);
    } catch (err) {
      console.error('Complaint processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setCreatedComplaint(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Citizen Vigilance: File Product Discrepancy Grievance"
      subtitle="Multi-Evidence Packaging Inspection, Deterministic Classification & Regulatory RAG Pipeline"
      maxWidth="2xl"
    >
      {isProcessing ? (
        <div className="py-12 px-4 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              Processing Multi-Evidence Complaint Dossier...
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
              {processingStatusText}
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 max-w-md mx-auto overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto text-[10px] font-mono text-slate-400">
            <div className={processingProgress >= 20 ? 'text-blue-700 font-bold' : ''}>1. Multi-OCR</div>
            <div className={processingProgress >= 50 ? 'text-blue-700 font-bold' : ''}>2. Extraction</div>
            <div className={processingProgress >= 75 ? 'text-blue-700 font-bold' : ''}>3. Deterministic Class</div>
            <div className={processingProgress >= 90 ? 'text-blue-700 font-bold' : ''}>4. Regulatory RAG</div>
          </div>
        </div>
      ) : isSuccess && createdComplaint ? (
        <div className="py-6 px-2 text-center space-y-5">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Evidence-Backed Grievance Lodged Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your complaint dossier has been assembled with multi-evidence OCR, deterministic issue classification, and active Regulatory RAG context, and dispatched to the officer review queue.
            </p>
          </div>

          {/* Docket Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Docket Number</span>
              <span className="font-mono font-bold text-blue-700">{createdComplaint.ticketId}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Deterministic Issue</span>
                <span className="font-semibold text-slate-900">{createdComplaint.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Classification Confidence</span>
                <span className="font-mono font-bold text-emerald-700">
                  {createdComplaint.classificationResult?.confidenceScore}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 block text-[10px]">Mapped Regulatory Reference</span>
              <span className="font-medium text-slate-800 line-clamp-1">
                {createdComplaint.aiMatchedRule}
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-center gap-3">
            <Button variant="primary" size="md" onClick={handleClose} className="px-6">
              Done & Return to Directory
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          {/* Target Product Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Product</span>
              <span className="font-bold text-slate-900 block text-xs">{product.title}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {product.brand} • FSSAI: {product.fssaiLicenseNumber || 'N/A'} • Platform: {product.platform}
              </span>
            </div>
            <Badge variant="primary" size="sm" className="font-mono text-[10px]">
              MRP ₹{product.mrp}
            </Badge>
          </div>

          {/* Complainant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Complainant Name"
              value={formData.consumerName}
              onChange={(e) => setFormData({ ...formData, consumerName: e.target.value })}
              required
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.consumerEmail}
              onChange={(e) => setFormData({ ...formData, consumerEmail: e.target.value })}
              required
            />
            <Input
              label="Mobile Number"
              value={formData.consumerPhone}
              onChange={(e) => setFormData({ ...formData, consumerPhone: e.target.value })}
              required
            />
          </div>

          {/* Product URL & Order Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Product Listing URL (Optional)"
              placeholder="https://ecommerce.com/product/..."
              value={formData.productUrl}
              onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
              icon={<Link2 className="h-3.5 w-3.5 text-slate-400" />}
            />
            <Input
              label="Order / Invoice Number (Optional)"
              placeholder="e.g. OD-9921-4412"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            />
          </div>

          {/* Grievance Statement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Free-Text Complaint Description & Discrepancy Statement
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue in your own words (e.g. 'The packet says ₹50 but shop charged me ₹60 on bill', 'MRP is missing', 'Net weight is short')..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Multi-Evidence Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Evidence Images (Packaging, Label, Invoice, Receipt, PDP Screenshot)
              </label>
              <span className="text-[10px] text-slate-400">Multiple files supported</span>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 text-center hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                id="evidence-file-input"
                className="hidden"
              />
              <label htmlFor="evidence-file-input" className="cursor-pointer space-y-1 block">
                <Upload className="h-5 w-5 text-blue-600 mx-auto" />
                <span className="text-xs font-semibold text-blue-700 block">
                  Click to select evidence images or drop files here
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Original images will be preserved untouched for officer review
                </span>
              </label>
            </div>

            {/* Uploaded Evidence Grid */}
            {uploadedEvidence.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {uploadedEvidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200"
                  >
                    <img
                      src={item.previewUrl}
                      alt="Evidence preview"
                      className="h-12 w-12 object-cover rounded-md border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-slate-800 truncate block">
                        {item.file.name}
                      </span>
                      <select
                        value={item.tag}
                        onChange={(e) => updateEvidenceTag(idx, e.target.value as EvidenceTag)}
                        className="mt-1 text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="Product Packaging">Product Packaging</option>
                        <option value="Product Label / PDP">Product Label / PDP</option>
                        <option value="Receipt / Invoice">Receipt / Invoice</option>
                        <option value="E-Commerce Screenshot">E-Commerce Screenshot</option>
                        <option value="General Evidence">General Evidence</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidence(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Deterministic Classifier + Regulatory RAG Engine
            </span>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="gap-1.5 bg-red-600 hover:bg-red-700 text-white border-red-700"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Grievance to CCPA Queue</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
