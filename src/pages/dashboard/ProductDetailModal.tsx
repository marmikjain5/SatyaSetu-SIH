import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types/compliance';
import { formatCurrency } from '../../lib/utils';
import {
  Scan,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  Layers,
  FileCheck2,
  Cpu,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueNotice: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onIssueNotice,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.title}
      subtitle={`SKU: ${product.sku} • Scanned on ${product.platform} • OCR Match: ${product.ocrConfidence}%`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs">
        {/* Top Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Compliance Status</span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={product.status} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Trust Score: <strong className="text-slate-900 font-bold">{product.complianceScore}/100</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Price & Net Quantity</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatCurrency(product.listedPrice)}
              </span>
              <span className="text-slate-400 line-through text-xs font-mono">
                {formatCurrency(product.mrp)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">{product.netWeight}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Manufacturer Entity</span>
            <div className="mt-1 font-bold text-slate-900 truncate">{product.manufacturer}</div>
            <p className="text-[11px] text-slate-500 mt-1">Origin: {product.countryOfOrigin}</p>
          </div>
        </div>

        {/* OCR Image & Extracted Text Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Packaging Image with Mock OCR Bounding Boxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Packaging Optical Capture (Live Feed)
              </span>
              <span className="font-mono text-blue-600 text-[10px]">99.1% Confidence</span>
            </div>
            <div className="relative rounded-xl border border-slate-300 bg-slate-900 overflow-hidden h-64 flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Scanned via Legal Metrology Ingestion Engine • {product.lastScanned}
            </p>
          </div>

          {/* Extracted Statutory Declarations Checklist */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Legal Metrology Rules 2011 Checklist
            </span>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">1. Maximum Retail Price (MRP)</div>
                  <div className="text-[11px] text-slate-500">Must include all taxes in INR</div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">2. Unit Sale Price (USP)</div>
                  <div className="text-[11px] text-slate-500">Per gram/ml calculation</div>
                </div>
                {product.missingMandatoryFields.some((f) => f.includes('Unit Sale Price')) ? (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">3. Net Weight & Tolerance</div>
                  <div className="text-[11px] text-slate-500">Within Maximum Permissible Error</div>
                </div>
                {product.netWeight.includes('Found:') ? (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">4. Country of Origin & Importer</div>
                  <div className="text-[11px] text-slate-500">Prominent declaration on packaging</div>
                </div>
                {product.countryOfOrigin.includes('PRC') || product.countryOfOrigin.includes('falsely') ? (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Declarations Breakdown: FSSAI, Ingredients & Nutrition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
          {/* Ingredients & Manufacturer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Declared Ingredients & Additives</span>
              </span>
              {product.fssaiLicenseNumber && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  FSSAI: {product.fssaiLicenseNumber}
                </span>
              )}
            </div>

            {product.ingredientsList && product.ingredientsList.length > 0 ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                {product.ingredientsList.map((ing, i) => (
                  <div key={i} className="text-[11px] flex items-start gap-1.5">
                    <span className="text-slate-400 font-mono">•</span>
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                Standard industrial/non-food consumer declaration.
              </div>
            )}

            {/* Customer Care Contact */}
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-950 font-mono">
              <span className="text-[10px] text-blue-700 block uppercase font-sans font-bold">Official Grievance Contact:</span>
              <span className="font-semibold">{product.customerCareContact}</span>
            </div>
          </div>

          {/* Nutrition Table */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Declared Nutritional Facts ({product.nutritionalInfo?.perUnit || 'Per 100g'})
            </span>
            {product.nutritionalInfo ? (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-3 py-1.5 text-slate-900 font-sans">Energy</td>
                      <td className="px-3 py-1.5 text-right text-slate-900">{product.nutritionalInfo.energyKcal}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 text-slate-700 font-sans">Protein</td>
                      <td className="px-3 py-1.5 text-right">{product.nutritionalInfo.protein}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 text-slate-700 font-sans">Carbohydrates</td>
                      <td className="px-3 py-1.5 text-right">{product.nutritionalInfo.carbohydrates}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 text-slate-500 font-sans pl-5">- Added Sugars</td>
                      <td className="px-3 py-1.5 text-right text-amber-700 font-bold">{product.nutritionalInfo.addedSugars}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 text-slate-700 font-sans">Total Fat</td>
                      <td className="px-3 py-1.5 text-right">{product.nutritionalInfo.totalFat}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 text-slate-700 font-sans">Sodium</td>
                      <td className="px-3 py-1.5 text-right">{product.nutritionalInfo.sodium}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                Non-food consumer appliance / garment. Nutritional declarations exempt under FSSR 2011.
              </div>
            )}
          </div>
        </div>

        {/* Claim Analysis NLP Findings */}
        {product.claims && product.claims.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              AI Claim Verification (CCPA & FSSAI Analysis)
            </span>
            <div className="space-y-2">
              {product.claims.map((claim, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-4 ${
                    claim.isMisleading
                      ? 'bg-red-50/70 border-red-200 text-red-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div>
                    <div className="font-bold">Claim: "{claim.text}"</div>
                    {claim.reason && (
                      <div className="text-[11px] text-red-700 mt-1 font-medium">{claim.reason}</div>
                    )}
                  </div>
                  <Badge variant={claim.isMisleading ? 'danger' : 'success'} size="sm">
                    {claim.isMisleading ? 'Misleading' : 'Substantiated'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statutory Acts Violated */}
        {product.regulatoryActs.length > 0 && (
          <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-1.5">
              Governing Statutory Acts & Sections:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
              {product.regulatoryActs.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium"
          >
            <span>View on {product.platform} Marketplace</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            {product.status !== 'compliant' && (
              <Button
                variant="danger"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  onIssueNotice(product.id);
                  onClose();
                }}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Issue Section 36 SCN Notice</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
