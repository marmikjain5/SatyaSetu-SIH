import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  AlertOctagon,
  LayoutList,
  Map,
  Columns2,
  Download,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { Manufacturer } from '../../types/compliance';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ManufacturerSatelliteMap } from '../../components/maps/ManufacturerSatelliteMap';
import { ManufacturerDossierModal } from './ManufacturerDossierModal';

type ViewMode = 'split' | 'map' | 'grid';

const RISK_CONFIG = {
  Critical: { badge: 'danger'    as const, barColor: 'bg-red-600'    },
  High:     { badge: 'warning'   as const, barColor: 'bg-amber-500'  },
  Moderate: { badge: 'secondary' as const, barColor: 'bg-yellow-400' },
  Low:      { badge: 'success'   as const, barColor: 'bg-green-500'  },
};

export const ManufacturerRiskRanking: React.FC = () => {
  const { manufacturers, violations } = useComplianceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedMfg, setSelectedMfg] = useState<Manufacturer | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

  const tiers = ['All', 'Critical', 'High', 'Moderate', 'Low'];

  const filteredManufacturers = manufacturers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTier = selectedTier === 'All' || m.riskTier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleSelectMfg = useCallback((mfg: Manufacturer) => {
    setSelectedMfg(mfg);
    setDossierOpen(true);
  }, []);

  const handleCardClick = (mfg: Manufacturer) => {
    setSelectedMfg(mfg);
    // In split mode, also pan the map
    if (viewMode === 'split' && selectedMfg?.id === mfg.id) {
      setDossierOpen(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manufacturer & Seller Risk Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Satellite map + corporate graph to track facility locations and statutory risk ratings across Bengaluru's industrial corridors.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 text-xs font-semibold">
          {([
            { mode: 'split' as ViewMode, icon: Columns2, label: 'Split' },
            { mode: 'map'   as ViewMode, icon: Map,      label: 'Map'   },
            { mode: 'grid'  as ViewMode, icon: LayoutList, label: 'List' },
          ] as const).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                viewMode === mode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical Tier (>80)', value: manufacturers.filter((m) => m.riskTier === 'Critical').length, note: 'Flagged for Zonal Raid', color: 'text-red-600' },
          { label: 'High Risk (60–80)',   value: manufacturers.filter((m) => m.riskTier === 'High').length,     note: 'Enhanced Auditing',      color: 'text-amber-600' },
          { label: 'Repeat Offender Rate', value: `${Math.round((manufacturers.filter((m) => m.repeatOffenderFlag).length / Math.max(manufacturers.length, 1)) * 100)}%`, note: 'Cross-Platform Recurrence', color: 'text-slate-900' },
          { label: 'Total SCN Notices',  value: manufacturers.reduce((a, m) => a + m.noticesIssued, 0),       note: 'Sec 36 Enforcement',     color: 'text-slate-900' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 uppercase">{stat.label}</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</div>
            <span className="text-[11px] text-slate-500">{stat.note}</span>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <Input
                placeholder="Search Manufacturer Name, CIN, GSTIN, Zone, Brand..."
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
                  <option key={t} value={t}>Risk Tier: {t}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Main Content ── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Satellite Map */}
          <div className="h-[520px]">
            <ManufacturerSatelliteMap
              manufacturers={filteredManufacturers}
              selectedId={selectedMfg?.id ?? null}
              onSelect={handleSelectMfg}
            />
          </div>

          {/* Manufacturer List */}
          <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {filteredManufacturers.map((mfg) => (
              <MfgCard
                key={mfg.id}
                mfg={mfg}
                isSelected={selectedMfg?.id === mfg.id}
                onClick={handleCardClick}
                onOpenDossier={handleSelectMfg}
              />
            ))}
          </div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="h-[620px]">
          <ManufacturerSatelliteMap
            manufacturers={filteredManufacturers}
            selectedId={selectedMfg?.id ?? null}
            onSelect={handleSelectMfg}
          />
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredManufacturers.map((mfg) => (
            <MfgCard
              key={mfg.id}
              mfg={mfg}
              isSelected={selectedMfg?.id === mfg.id}
              onClick={handleCardClick}
              onOpenDossier={handleSelectMfg}
            />
          ))}
        </div>
      )}

      {filteredManufacturers.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No manufacturers match your filters.</p>
        </div>
      )}

      {/* ── Dossier Modal ── */}
      <ManufacturerDossierModal
        manufacturer={selectedMfg}
        violations={violations}
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
      />
    </div>
  );
};

/* ─── Manufacturer Card Sub-Component ──────────────────────────────────── */
interface MfgCardProps {
  mfg: Manufacturer;
  isSelected: boolean;
  onClick: (mfg: Manufacturer) => void;
  onOpenDossier: (mfg: Manufacturer) => void;
}

const MfgCard: React.FC<MfgCardProps> = ({ mfg, isSelected, onClick, onOpenDossier }) => {
  const navigate = useNavigate();
  const rc = RISK_CONFIG[mfg.riskTier];

  const handleViolationsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to violations ledger filtered by manufacturer name (first word for robust matching)
    navigate(`/dashboard/violations?entity=${encodeURIComponent(mfg.name.split(' ')[0])}`);
  };

  return (
    <div
      onClick={() => onClick(mfg)}
      className={`bg-white rounded-xl border p-4 space-y-3 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={rc.badge} size="sm" className="font-bold font-mono text-[9px]">
              {mfg.riskTier.toUpperCase()} ({mfg.riskScore}/100)
            </Badge>
            {mfg.repeatOffenderFlag && (
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase">
                Repeat Offender
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-tight">{mfg.name}</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {mfg.cin} · {mfg.gstin}
          </p>
        </div>
        <div className="text-right font-mono flex-shrink-0">
          <div className="text-[10px] text-slate-400">SKUs Scanned</div>
          <div className="text-base font-bold text-slate-900">{mfg.totalProductsScanned}</div>
        </div>
      </div>

      {/* Risk bar */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${rc.barColor}`} style={{ width: `${mfg.riskScore}%` }} />
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{mfg.registeredAddress}</p>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
        <span>📍 {mfg.zone}</span>
        <span className="text-slate-300">·</span>
        <span>{mfg.facilityType}</span>
      </div>

      {/* Brands */}
      <div className="flex flex-wrap gap-1">
        {mfg.brands.slice(0, 4).map((b) => (
          <span key={b} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200">
            {b}
          </span>
        ))}
        {mfg.brands.length > 4 && (
          <span className="text-[10px] text-slate-400">+{mfg.brands.length - 4} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleViolationsClick}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
            title="View filtered violations in enforcement ledger"
          >
            <ShieldAlert className="h-3 w-3 text-red-600" />
            <span>Violations: <strong>{mfg.activeViolations}</strong> ↗</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            SCN: <strong className="text-slate-700">{mfg.noticesIssued}</strong>
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDossier(mfg); }}
          className="flex items-center gap-1 text-[10px] text-blue-700 font-semibold hover:text-blue-900 transition-colors"
        >
          Full Dossier <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
