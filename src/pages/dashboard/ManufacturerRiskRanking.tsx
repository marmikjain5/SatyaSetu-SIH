import React, { useState } from 'react';
import {
  Building2,
  Search,
  AlertOctagon,
  ShieldCheck,
  Network,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { Manufacturer } from '../../types/compliance';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ManufacturerRiskRanking: React.FC = () => {
  const { manufacturers } = useComplianceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');

  const tiers = ['All', 'Critical', 'High', 'Moderate', 'Low'];

  const filteredManufacturers = manufacturers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTier = selectedTier === 'All' || m.riskTier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 w-fit">
            <Building2 className="h-3.5 w-3.5" />
            <span>Corporate Entity Resolution & Repeat-Offender Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Manufacturer & Seller Risk Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated corporate graphing to unmask multi-brand shell networks and assign algorithmic risk ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Export Risk Dossier</span>
          </Button>
        </div>
      </div>

      {/* Top Tiers Breakdown Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Critical Tier (&gt;80)</span>
          <div className="text-2xl font-bold text-red-600 font-mono mt-1">
            {manufacturers.filter((m) => m.riskTier === 'Critical').length} Entities
          </div>
          <span className="text-[11px] text-red-700 font-medium">Flagged for Zonal Raid</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">High Risk (60-80)</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {manufacturers.filter((m) => m.riskTier === 'High').length} Entities
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Enhanced Auditing Active</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Repeat Offender Rate</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {Math.round(
              (manufacturers.filter((m) => m.repeatOffenderFlag).length / manufacturers.length) * 100
            )}
            %
          </div>
          <span className="text-[11px] text-slate-500">Cross-Platform Recurrence</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Total SCN Notices</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {manufacturers.reduce((acc, m) => acc + m.noticesIssued, 0)} Notices
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Sec 36 Enforcement</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <Input
                placeholder="Search Manufacturer Legal Name, CIN, GSTIN, Associated Brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="text-xs"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {tiers.map((t) => (
                  <option key={t} value={t}>
                    Risk Tier: {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manufacturers Cards / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredManufacturers.map((mfg) => (
          <Card key={mfg.id} className="p-6 space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      mfg.riskTier === 'Critical'
                        ? 'danger'
                        : mfg.riskTier === 'High'
                        ? 'warning'
                        : mfg.riskTier === 'Moderate'
                        ? 'secondary'
                        : 'success'
                    }
                    size="sm"
                    className="font-bold font-mono"
                  >
                    {mfg.riskTier.toUpperCase()} RISK ({mfg.riskScore}/100)
                  </Badge>
                  {mfg.repeatOffenderFlag && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">
                      Repeat Offender
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2 tracking-tight">{mfg.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  CIN: {mfg.cin} • GSTIN: {mfg.gstin}
                </p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">Scanned SKUs</div>
                <div className="text-lg font-bold text-slate-900">{mfg.totalProductsScanned}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{mfg.registeredAddress}</p>

            {/* Brands and Categories */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Brands:</span>
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
                  <span className="text-slate-400 font-medium">Top Infractions:</span>
                  <div className="flex flex-wrap gap-1">
                    {mfg.topOffenseTypes.map((offense, i) => (
                      <span key={i} className="text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-medium">
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
                Active Violations: <strong className="text-red-700">{mfg.activeViolations}</strong> • SCN Notices:{' '}
                <strong className="text-slate-900">{mfg.noticesIssued}</strong>
              </span>

              <span className="text-[11px] text-slate-400">Audited: {mfg.lastAuditDate}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
