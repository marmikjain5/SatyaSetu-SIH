import React from 'react';
import { Product } from '../../types/compliance';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { useLanguageStore } from '../../store/languageStore';
import {
  AlertTriangle,
  FileText,
  PhoneCall,
  Building2,
} from 'lucide-react';

interface CitizenProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onReportDiscrepancy: (product: Product) => void;
}

export const CitizenProductCard: React.FC<CitizenProductCardProps> = ({
  product,
  onViewDetails,
  onReportDiscrepancy,
}) => {
  const { t } = useLanguageStore();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Banner / Image (Badges removed per user request) */}
      <div>
        <div className="relative h-56 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.manufacturer}</span>
            </p>
          </div>

          {/* Pricing & Net Qty Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-sans">{t('mrpInclTaxes')}</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold text-slate-900">{formatCurrency(product.mrp)}</span>
                {product.listedPrice < product.mrp && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(product.listedPrice)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block font-sans">{t('netQtyUsp')}</span>
              <span className="text-xs font-bold text-slate-700 block">{product.netWeight}</span>
              {product.unitSalePrice && (
                <span className="text-[10px] text-blue-600 block">{product.unitSalePrice}</span>
              )}
            </div>
          </div>

          {/* Statutory Highlights Pill Strip */}
          <div className="space-y-1.5 text-xs">
            {product.fssaiLicenseNumber && (
              <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono">
                <span className="text-slate-500 font-sans">{t('fssaiLic')}</span>
                <span className="font-semibold text-slate-800">{product.fssaiLicenseNumber}</span>
              </div>
            )}

            {product.ingredientsList && product.ingredientsList.length > 0 && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">{t('ingredientsDecl')}</span>
                <span className="line-clamp-2 text-slate-500">
                  {product.ingredientsList.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Customer Care Hotline */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <span className="font-medium flex items-center gap-1 text-slate-600">
              <PhoneCall className="h-3 w-3 text-blue-500" />
              <span>{product.customerCarePhone || product.customerCareContact.split('|')[0]}</span>
            </span>
            <span className="text-[10px] text-slate-400">Origin: {product.countryOfOrigin.split('(')[0]}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(product)}
          className="text-xs font-semibold gap-1 justify-center"
        >
          <FileText className="h-3.5 w-3.5 text-blue-600" />
          <span>{t('statutoryDetails')}</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onReportDiscrepancy(product)}
          className="text-xs font-semibold gap-1 justify-center bg-red-600 hover:bg-red-700 text-white border-red-700"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{t('fileGrievance')}</span>
        </Button>
      </div>
    </div>
  );
};
