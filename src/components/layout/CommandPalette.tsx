import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  ShieldAlert,
  Building2,
  MessageSquareWarning,
  FileText,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplianceStore } from '../../store/complianceStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { products, violations, manufacturers, complaints, setSelectedProduct, setSelectedViolation } =
    useComplianceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or direct listener
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  );

  const filteredViolations = violations.filter(
    (v) =>
      v.caseNumber.toLowerCase().includes(query.toLowerCase()) ||
      v.productName.toLowerCase().includes(query.toLowerCase()) ||
      v.ruleCode.toLowerCase().includes(query.toLowerCase())
  );

  const filteredManufacturers = manufacturers.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.gstin.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectProduct = (product: typeof products[0]) => {
    setSelectedProduct(product);
    navigate('/dashboard/products');
    onClose();
  };

  const handleSelectViolation = (violation: typeof violations[0]) => {
    setSelectedViolation(violation);
    navigate('/dashboard/violations');
    onClose();
  };

  const handleSelectManufacturer = () => {
    navigate('/dashboard/manufacturers');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Omnibar Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across SKUs, Case Numbers, Barcodes, Manufacturers, Rules..."
              className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results Container */}
          <div className="max-h-96 overflow-y-auto p-3 text-xs space-y-4">
            {/* Quick Navigation suggestions */}
            {!query && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Quick Modules
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      navigate('/dashboard/products');
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-slate-800 text-left"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Package className="h-4 w-4 text-blue-600" /> Products Live Crawler
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/dashboard/violations');
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-slate-800 text-left"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <ShieldAlert className="h-4 w-4 text-red-600" /> Violations Ledger
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Products matches */}
            {filteredProducts.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Products ({filteredProducts.length})
                </span>
                {filteredProducts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="font-semibold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.brand} • {p.platform} • SKU: {p.sku}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        p.complianceScore >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {p.complianceScore}/100
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Violations matches */}
            {filteredViolations.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Violations & Enforcement ({filteredViolations.length})
                </span>
                {filteredViolations.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelectViolation(v)}
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-semibold text-slate-900">{v.caseNumber}</div>
                        <div className="text-[11px] text-slate-500">{v.productName}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold">
                      {v.ruleCode}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Manufacturers matches */}
            {filteredManufacturers.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Manufacturers ({filteredManufacturers.length})
                </span>
                {filteredManufacturers.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    onClick={handleSelectManufacturer}
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">GSTIN: {m.gstin}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Risk: {m.riskScore}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Navigation: [Enter] to select • [Esc] to dismiss</span>
            <span>Ctrl + K</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
