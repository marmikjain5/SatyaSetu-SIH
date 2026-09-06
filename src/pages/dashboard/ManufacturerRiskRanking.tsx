import React, { useState } from 'react';
import {
  Search,
  Download,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';

export const ManufacturerRiskRanking: React.FC = () => {
  const { manufacturers } = useComplianceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'risk' | 'violations' | 'skus'>('risk');

  const tiers = ['All', 'Critical', 'High', 'Moderate', 'Low'];

  const filteredManufacturers = manufacturers
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.brands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTier = selectedTier === 'All' || m.riskTier === selectedTier;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      if (sortBy === 'violations') return b.activeViolations - a.activeViolations;
      if (sortBy === 'skus') return b.totalProductsScanned - a.totalProductsScanned;
      return b.riskScore - a.riskScore;
    });

  return (
    <div className="space-y-6">
      {/* 1. Page Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 w-fit">
            Corporate Entity Resolution & Repeat-Offender Registry
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Manufacturer & Seller Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated corporate graphing to unmask multi-brand shell networks and assign algorithmic risk ratings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-white" />
            <span>Export Risk Dossier</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (4 Identical White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Tier */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Critical Tier (&gt;80)
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono my-1">
            {manufacturers.filter((m) => m.riskTier === 'Critical').length} Entities
          </div>
          <span className="text-[11px] text-rose-700 font-medium">Flagged for Zonal Raid</span>
        </div>

        {/* High Risk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            High Risk (60–80)
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono my-1">
            {manufacturers.filter((m) => m.riskTier === 'High').length} Entities
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Enhanced Auditing Active</span>
        </div>

        {/* Repeat Offender Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Repeat Offender Rate
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono my-1">
            {Math.round(
              (manufacturers.filter((m) => m.repeatOffenderFlag).length / manufacturers.length) * 100
            )}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Cross-Platform Recurrence</span>
        </div>

        {/* Total SCN Notices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Total SCN Notices
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono my-1">
            {manufacturers.reduce((acc, m) => acc + m.noticesIssued, 0)} Notices
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Sec 36 Enforcement</span>
        </div>
      </div>

      {/* 3. Search + Filter Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Manufacturer Legal Name, CIN, GSTIN, Associated Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  Risk Tier: {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Manufacturer List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Manufacturers & Sellers ({filteredManufacturers.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic risk profiles and compliance history
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'risk' | 'violations' | 'skus')}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-sans"
          >
            <option value="risk">Risk Score (High to Low)</option>
            <option value="violations">Active Violations (High to Low)</option>
            <option value="skus">Scanned SKUs (High to Low)</option>
          </select>
        </div>
      </div>

      {/* 5. Manufacturer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredManufacturers.map((mfg) => (
          <div
            key={mfg.id}
            className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                      mfg.riskTier === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : mfg.riskTier === 'High'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : mfg.riskTier === 'Moderate'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {mfg.riskTier.toUpperCase()} RISK ({mfg.riskScore}/100)
                  </span>
                  {mfg.repeatOffenderFlag && (
                    <span className="text-[10px] font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
                      Repeat Offender
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 tracking-tight truncate">
                  {mfg.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  CIN: {mfg.cin} • GSTIN: {mfg.gstin}
                </p>
              </div>

              <div className="text-right font-mono shrink-0">
                <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                  Scanned SKUs
                </div>
                <div className="text-xl font-bold text-slate-900">{mfg.totalProductsScanned}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{mfg.registeredAddress}</p>

            {/* Brands and Categories */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium shrink-0">Brands:</span>
                <div className="flex flex-wrap gap-1">
                  {mfg.brands.map((b) => (
                    <span
                      key={b}
                      className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium border border-slate-200"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {mfg.topOffenseTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Top Infractions:</span>
                  <div className="flex flex-wrap gap-1">
                    {mfg.topOffenseTypes.map((offense, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-rose-700 bg-rose-50/70 px-2 py-0.5 rounded border border-rose-200 font-medium"
                      >
                        {offense}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                Active Violations: <strong className="text-rose-700 font-bold">{mfg.activeViolations}</strong> • SCN Notices:{' '}
                <strong className="text-slate-900 font-bold">{mfg.noticesIssued}</strong>
              </span>

              <span className="text-[11px] text-slate-400 font-mono">Audited: {mfg.lastAuditDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

