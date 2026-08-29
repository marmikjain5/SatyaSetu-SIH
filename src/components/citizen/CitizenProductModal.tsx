import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Product } from '../../types/compliance';
import { formatCurrency } from '../../lib/utils';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  PhoneCall,
  Mail,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Activity,
  Heart,
  HelpCircle,
  Info,
} from 'lucide-react';

interface CitizenProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onReportDiscrepancy: (product: Product) => void;
}

export const CitizenProductModal: React.FC<CitizenProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onReportDiscrepancy,
}) => {
  const [copiedLicense, setCopiedLicense] = useState(false);

  if (!product) return null;

  const handleCopyLicense = () => {
    if (product.fssaiLicenseNumber) {
      navigator.clipboard.writeText(product.fssaiLicenseNumber);
      setCopiedLicense(true);
      setTimeout(() => setCopiedLicense(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.title}
      subtitle={`Statutory Public Inspection Dossier • Verified for Legal Metrology & FSSAI Standards`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Banner Strip: FSSAI License, Status, & Verification Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FSSAI Card */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>FSSAI / Regulatory License</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-950 text-sm">
                {product.fssaiLicenseNumber || 'Registered Food Business'}
              </span>
              {product.fssaiLicenseNumber && (
                <button
                  type="button"
                  onClick={handleCopyLicense}
                  className="p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200/50 rounded transition-colors"
                  title="Copy License Number"
                >
                  {copiedLicense ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Food Safety & Standards Authority of India Registration
            </p>
          </div>

          {/* Pricing & Net Quantity Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Statutory MRP & Unit Pricing
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(product.mrp)}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                ({product.netWeight})
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
              <span>Unit Sale Price (USP):</span>
              <strong className="font-mono text-blue-700">{product.unitSalePrice || 'Compliant with Rule 6'}</strong>
            </div>
          </div>

          {/* Compliance & Trust Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Label Compliance Assessment
            </span>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant={
                  product.status === 'compliant'
                    ? 'success'
                    : product.status === 'notice-issued'
                    ? 'danger'
                    : 'warning'
                }
                size="md"
                className="uppercase font-bold"
              >
                {product.status.replace('-', ' ')}
              </Badge>
              <span className="font-mono text-slate-500 text-xs">
                Score: <strong className="text-slate-900">{product.complianceScore}/100</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Legal Metrology (Packaged Commodities) Rules 2011 Verified
            </p>
          </div>
        </div>

        {/* Product Visual & Key Declarations */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Product Visual & Verification Badges */}
          <div className="md:col-span-5 space-y-4">
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800">
                {product.platform} Marketplace
              </div>
            </div>

            {/* Manufacturer Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Manufacturer & Packer Entity</span>
              </span>
              <div>
                <div className="font-bold text-slate-900 text-xs">{product.manufacturer}</div>
                <p className="text-[11px] text-slate-600 mt-1 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{product.manufacturerAddress || 'Industrial Area, India'}</span>
                </p>
                {product.packerAddress && (
                  <p className="text-[11px] text-slate-500 mt-1 border-t border-slate-200/60 pt-1.5">
                    <strong>Packer:</strong> {product.packerAddress}
                  </p>
                )}
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Country of Origin: <strong className="text-slate-800">{product.countryOfOrigin}</strong>
                </div>
              </div>
            </div>

            {/* Customer Care Hotline Box */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                <span>Official Consumer Care & Grievance</span>
              </span>
              <div className="space-y-1.5 text-xs">
                {product.customerCarePhone && (
                  <a
                    href={`tel:${product.customerCarePhone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 text-blue-800 hover:text-blue-950 font-semibold transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                    <span>{product.customerCarePhone}</span>
                    <span className="text-[10px] bg-blue-200/70 px-1.5 py-0.2 rounded font-normal">Toll-Free / Direct</span>
                  </a>
                )}
                {product.customerCareEmail && (
                  <a
                    href={`mailto:${product.customerCareEmail}`}
                    className="flex items-center gap-2 text-blue-800 hover:text-blue-950 font-semibold transition-colors truncate"
                  >
                    <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{product.customerCareEmail}</span>
                  </a>
                )}
              </div>
              <p className="text-[10px] text-blue-600 pt-1">
                Mandatory under Consumer Protection (E-Commerce) Rules 2020
              </p>
            </div>
          </div>

          {/* Right: Ingredient List & Nutritional Facts Sheet */}
          <div className="md:col-span-7 space-y-5">
            {/* Ingredients Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Statutory Ingredient List (As Declared)</span>
                </span>
                {product.dietaryType && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {product.dietaryType}
                  </span>
                )}
              </div>

              {product.ingredientsList && product.ingredientsList.length > 0 ? (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {product.ingredientsList.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-slate-400 select-none">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Allergen Warning Strip */}
                  {product.allergenInfo && product.allergenInfo.length > 0 && (
                    <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                      <strong className="block font-bold text-amber-950 mb-0.5">Allergen Declarations:</strong>
                      <span>{product.allergenInfo.join(' • ')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-[11px]">
                  General consumer good / Non-food formulation details declared in conformity with Legal Metrology Act.
                </div>
              )}
            </div>

            {/* Nutritional Facts Sheet */}
            {product.nutritionalInfo && (
              <div>
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Nutritional Fact Sheet ({product.nutritionalInfo.perUnit || 'Per 100g / Serving'})</span>
                </span>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 font-mono">
                      <tr>
                        <th className="px-3.5 py-2">Nutritional Parameter</th>
                        <th className="px-3.5 py-2 text-right">Declared Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="px-3.5 py-2 font-sans font-semibold text-slate-900">Energy (Calories)</td>
                        <td className="px-3.5 py-2 text-right font-bold text-slate-900">{product.nutritionalInfo.energyKcal}</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-sans text-slate-700">Protein</td>
                        <td className="px-3.5 py-2 text-right text-slate-800">{product.nutritionalInfo.protein}</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-sans text-slate-700">Carbohydrates</td>
                        <td className="px-3.5 py-2 text-right text-slate-800">{product.nutritionalInfo.carbohydrates}</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-sans text-slate-500 pl-6">- Total Sugars</td>
                        <td className="px-3.5 py-2 text-right text-slate-600">{product.nutritionalInfo.totalSugars}</td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="px-3.5 py-2 font-sans font-medium text-amber-900 pl-6">- Added Sugars</td>
                        <td className="px-3.5 py-2 text-right font-bold text-amber-900">{product.nutritionalInfo.addedSugars}</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-sans text-slate-700">Total Fat</td>
                        <td className="px-3.5 py-2 text-right text-slate-800">{product.nutritionalInfo.totalFat}</td>
                      </tr>
                      {product.nutritionalInfo.saturatedFat && (
                        <tr>
                          <td className="px-3.5 py-2 font-sans text-slate-500 pl-6">- Saturated Fat</td>
                          <td className="px-3.5 py-2 text-right text-slate-600">{product.nutritionalInfo.saturatedFat}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-3.5 py-2 font-sans text-slate-700">Sodium (Salt)</td>
                        <td className="px-3.5 py-2 text-right text-slate-800">{product.nutritionalInfo.sodium}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-2 bg-slate-50 text-[10px] text-slate-400 font-sans border-t border-slate-100 flex items-center justify-between">
                    <span>Serving Size: {product.nutritionalInfo.servingSize || '100 g'}</span>
                    <span>Standard Reference: FSSAI Labelling Reg. 2020</span>
                  </div>
                </div>
              </div>
            )}

            {/* Claims & Label Audit Notes */}
            {product.claims && product.claims.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                  <span>Marketing Claims & Regulatory Validation</span>
                </span>
                <div className="space-y-2">
                  {product.claims.map((claim, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                        claim.isMisleading
                          ? 'bg-red-50/70 border-red-200 text-red-950'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div>
                        <div className="font-bold">"{claim.text}"</div>
                        {claim.reason && (
                          <div className="text-[11px] text-red-700 mt-1">{claim.reason}</div>
                        )}
                      </div>
                      <Badge variant={claim.isMisleading ? 'danger' : 'success'} size="sm">
                        {claim.isMisleading ? 'Flagged Misleading' : 'Substantiated'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>Public transparency data provided in compliance with National Consumer Protection Guidelines.</span>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onReportDiscrepancy(product);
              }}
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Report Label Discrepancy / File Complaint</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
