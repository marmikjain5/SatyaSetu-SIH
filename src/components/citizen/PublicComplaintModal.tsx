import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Product, PlatformType, Complaint } from '../../types/compliance';
import { useComplianceStore } from '../../store/complianceStore';
import { useAuthStore } from '../../store/authStore';
import {
  AlertTriangle,
  Send,
  Building2,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Shield,
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
  const { addComplaint } = useComplianceStore();

  const [formData, setFormData] = useState({
    consumerName: user?.name || 'Ananya Verma',
    consumerEmail: user?.email || 'consumer@demo.gov.in',
    consumerPhone: '+91 98200 12345',
    productName: '',
    brand: '',
    platform: 'Amazon' as PlatformType,
    orderNumber: 'OD-2025-CITIZEN-001',
    category: 'Price Gouging / MRP Violation' as Complaint['category'],
    description: '',
    priority: 'Urgent' as Complaint['priority'],
    sentimentScore: 0.9,
    aiMatchedRule: 'Legal Metrology (Packaged Commodities) Rules 2011 - Rule 18(2)',
    evidenceUrls: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'],
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketIdGenerated, setTicketIdGenerated] = useState('');

  useEffect(() => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        consumerName: user?.name || prev.consumerName,
        consumerEmail: user?.email || prev.consumerEmail,
        productName: product.title,
        brand: product.brand,
        platform: product.platform,
        description: `Discrepancy noticed on ${product.title} (MRP: ₹${product.mrp}, Net Qty: ${product.netWeight}, FSSAI: ${product.fssaiLicenseNumber || 'N/A'}): The packaged unit received did not comply with statutory declaration standards.`,
      }));
    }
  }, [product, user]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `NCH-GRV-2025-${Math.floor(10000 + Math.random() * 90000)}`;
    addComplaint({
      ...formData,
      productName: product.title,
      brand: product.brand,
      platform: product.platform,
      consumerName: formData.consumerName,
      consumerEmail: formData.consumerEmail,
      consumerPhone: formData.consumerPhone,
      orderNumber: formData.orderNumber,
      category: formData.category,
      description: formData.description,
      priority: formData.priority,
      sentimentScore: 0.92,
      aiMatchedRule: formData.aiMatchedRule,
      evidenceUrls: formData.evidenceUrls,
    });
    setTicketIdGenerated(ticketId);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Citizen Vigilance: File Product Discrepancy Grievance"
      subtitle={`National Consumer Helpline & CCPA Automated Ingestion Pipeline`}
      maxWidth="2xl"
    >
      {isSuccess ? (
        <div className="py-6 px-2 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Grievance Lodged Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your grievance has been auto-triaged and linked to the Central Consumer Protection Authority (CCPA) and Zonal Legal Metrology Inspectorate.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto font-mono text-xs">
            <span className="text-slate-400 uppercase text-[10px] block">Grievance Tracking Docket Number</span>
            <span className="text-base font-bold text-blue-700 block mt-1">{ticketIdGenerated || 'NCH-GRV-2025-88192'}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Dispatched for AI Statutory Assessment</span>
          </div>

          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleClose} className="px-6">
              Done & Return to Directory
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          {/* Target Product Summary Box */}
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

          {/* Citizen Details */}
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

          {/* Category & Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Discrepancy Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as Complaint['category'] })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option>Price Gouging / MRP Violation</option>
                <option>Misleading Ad / Claim</option>
                <option>Substandard / Expiry Issue</option>
                <option>Missing Country of Origin</option>
                <option>Dark Patterns / Fake Discount</option>
              </select>
            </div>

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
              Detailed Description of Non-Compliance Observed
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the packaging disparity, price overcharge, undeclared ingredients, or misleading claim observed..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Authenticated Session: <strong>{formData.consumerEmail}</strong>
            </span>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="gap-1.5 bg-red-600 hover:bg-red-700 text-white border-red-700">
                <Send className="h-3.5 w-3.5" />
                <span>Submit Grievance to CCPA</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
