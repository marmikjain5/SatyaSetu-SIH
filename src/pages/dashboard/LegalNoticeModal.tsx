import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Violation } from '../../types/compliance';
import { formatCurrency } from '../../lib/utils';
import {
  FileCheck2,
  Printer,
  Download,
  Send,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Building,
  Loader2,
} from 'lucide-react';

interface LegalNoticeModalProps {
  violation: Violation | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (violationId: string) => void;
}

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({
  violation,
  isOpen,
  onClose,
  onDispatch,
}) => {
  const [isDispatched, setIsDispatched] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const noticePaperRef = useRef<HTMLDivElement>(null);

  if (!violation) return null;

  const noticeReference = violation.noticeId || `SCN-2025-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleDownloadPdf = async () => {
    if (!noticePaperRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = noticePaperRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // A4 dimensions: 210mm x 297mm
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 10, 15, imgWidth, Math.min(imgHeight, 267));
      pdf.save(`${noticeReference}_Show_Cause_Notice.pdf`);
    } catch (err) {
      console.error('Error generating Notice PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDispatchNotice = () => {
    setIsDispatched(true);
    setTimeout(() => {
      onDispatch(violation.id);
    }, 400);
  };

  const handleReset = () => {
    setIsDispatched(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Show Cause Notice (SCN) Drafting Suite"
      subtitle={`Statutory Notice under ${violation.actName}`}
      maxWidth="3xl"
    >
      {isDispatched ? (
        <div className="py-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Show Cause Notice Officially Dispatched</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Statutory Notice Reference <strong className="text-slate-900 font-mono">{noticeReference}</strong> has been transmitted to registered corporate email of{' '}
            <strong className="text-slate-900">{violation.manufacturer}</strong> and copied to Zonal Metrology Directorate.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Button variant="primary" size="md" onClick={handleReset}>
              Return to Ledger
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-xs">
          {/* Statutory Formal Notice Preview Paper */}
          <div ref={noticePaperRef} className="p-6 bg-slate-50 rounded-xl border border-slate-300 font-mono text-slate-800 space-y-4 relative shadow-inner">
            {/* Gov Crest Header */}
            <div className="text-center pb-4 border-b border-slate-300 space-y-1">
              <div className="font-bold text-sm tracking-wide uppercase text-slate-900">
                CENTRAL CONSUMER PROTECTION AUTHORITY (CCPA)
              </div>
              <div className="text-[11px] text-slate-600">
                Ministry of Consumer Affairs, Food & Public Distribution • Govt. of India
              </div>
              <div className="text-[10px] text-slate-500">
                Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
              </div>
            </div>

            {/* Notice Metadata */}
            <div className="flex justify-between items-start text-[11px]">
              <div>
                <div>
                  <strong>NOTICE REF:</strong> {noticeReference}
                </div>
                <div>
                  <strong>CASE FILE:</strong> {violation.caseNumber}
                </div>
                <div>
                  <strong>DATE:</strong> 26 February 2025
                </div>
              </div>
              <div className="text-right">
                <Badge variant="danger" size="sm">
                  STATUTORY SUMMONS
                </Badge>
                <div className="text-[10px] text-slate-500 mt-1">Reply Mandated in 15 Days</div>
              </div>
            </div>

            {/* Notice Addressee */}
            <div className="pt-2 text-[11px] space-y-0.5">
              <div className="font-bold">TO:</div>
              <div>The Principal Officer / Managing Director</div>
              <div className="font-semibold text-slate-900">{violation.manufacturer}</div>
              <div className="text-slate-600">Product / Brand: {violation.productName} ({violation.brand})</div>
              <div className="text-slate-600">E-Commerce Marketplace: {violation.platform}</div>
            </div>

            {/* Notice Body */}
            <div className="pt-3 space-y-2 text-[11px] leading-relaxed text-slate-800">
              <p className="font-bold uppercase tracking-wide">
                SUBJECT: SHOW CAUSE NOTICE UNDER SECTION 36 OF LEGAL METROLOGY ACT, 2009 & SECTION 89 OF CONSUMER PROTECTION ACT, 2019
              </p>

              <p>
                1. WHEREAS, automated optical inspection and algorithmic audit conducted by the National Compliance Intelligence System has uncovered prima facie non-compliance in respect of the pre-packaged commodity marketed by your entity.
              </p>

              <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-1">
                <div>
                  <strong className="text-red-700">SPECIFIC CONTRAVENTION:</strong> {violation.description}
                </div>
                <div>
                  <strong>STATUTORY CLAUSE:</strong> {violation.section} ({violation.actName})
                </div>
                <div>
                  <strong>OPTICAL EVIDENCE RECORD:</strong> {violation.evidence.extractedValue}
                </div>
                <div>
                  <strong>PRESCRIBED STANDARD:</strong> {violation.evidence.expectedStandard}
                </div>
              </div>

              <p>
                2. NOW THEREFORE, you are hereby called upon to SHOW CAUSE in writing within fifteen (15) days of receipt of this notice as to why penal proceedings under Section 36(1) / Section 89, involving a compoundable fine of up to{' '}
                <strong className="text-slate-900">{formatCurrency(violation.penaltyEstimate)}</strong> and prosecution, should not be initiated against your company and its designated directors.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-[11px]">
              <div>
                <div className="text-[10px] text-slate-500">DIGITALLY SIGNED & VERIFIED BY:</div>
                <div className="font-bold text-slate-900">{violation.assignedOfficer}</div>
                <div className="text-slate-500">Authorized Regulatory Officer, CCPA</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Shield className="h-3 w-3" />
                  E-GOV CRYPTO SIGNATURE VALID
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Notice</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={handleDownloadPdf}
                isLoading={isGeneratingPdf}
                disabled={isGeneratingPdf}
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="gap-2 font-semibold"
                onClick={handleDispatchNotice}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Authorize & Dispatch SCN</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
