import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertOctagon,
  ExternalLink,
  Download,
  ClipboardList,
  Calendar,
  BadgeCheck,
  X,
  ChevronRight,
  Factory,
  Tag,
  Siren,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Manufacturer, Violation } from '../../types/compliance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface Props {
  manufacturer: Manufacturer | null;
  violations: Violation[];
  isOpen: boolean;
  onClose: () => void;
  onScheduleInspection?: (manufacturer: Manufacturer) => void;
}

const RISK_COLORS = {
  Critical: { badge: 'danger' as const,  ring: 'border-red-300 bg-red-50',     text: 'text-red-700',    bar: 'bg-red-600' },
  High:     { badge: 'warning' as const, ring: 'border-amber-300 bg-amber-50', text: 'text-amber-700',  bar: 'bg-amber-500' },
  Moderate: { badge: 'secondary' as const, ring: 'border-yellow-300 bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-400' },
  Low:      { badge: 'success' as const, ring: 'border-green-300 bg-green-50', text: 'text-green-700',  bar: 'bg-green-500' },
};

const SEVERITY_BADGE: Record<string, 'danger' | 'warning' | 'secondary' | 'success'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'secondary',
  low: 'success',
};

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-red-100 text-red-700 border-red-200',
  'Notice Issued': 'bg-amber-100 text-amber-700 border-amber-200',
  'Hearing Scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
  'Resolved': 'bg-green-100 text-green-700 border-green-200',
};

export const ManufacturerDossierModal: React.FC<Props> = ({
  manufacturer,
  violations,
  isOpen,
  onClose,
  onScheduleInspection,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'violations' | 'actions'>('overview');
  const navigate = useNavigate();

  if (!isOpen || !manufacturer) return null;

  const mfg = manufacturer;
  const rc = RISK_COLORS[mfg.riskTier];

  // Violations linked to this manufacturer (by name match or brands match)
  const linkedViolations = violations.filter((v) => {
    const mfgFirst = mfg.name.toLowerCase().split(' ')[0];
    const mfgFull = mfg.name.toLowerCase();
    const vMfg = v.manufacturer?.toLowerCase() || '';
    const vMkt = v.marketedBy?.toLowerCase() || '';
    const vBrand = v.brand?.toLowerCase() || '';

    const matchesMfg = vMfg.includes(mfgFirst) || mfgFull.includes(vMfg);
    const matchesMkt = vMkt.includes(mfgFirst) || mfgFull.includes(vMkt);
    const matchesBrand = mfg.brands.some((b) => {
      const bLow = b.toLowerCase();
      return vBrand.includes(bLow) || vMfg.includes(bLow) || vMkt.includes(bLow);
    });

    return matchesMfg || matchesMkt || matchesBrand;
  });
  const displayViolations = linkedViolations.length > 0 ? linkedViolations : violations.slice(0, 2);

  const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${mfg.coordinates.lat},${mfg.coordinates.lng}`;
  const GOOGLE_EARTH_URL = `https://earth.google.com/web/@${mfg.coordinates.lat},${mfg.coordinates.lng},500a,1000d,35y,0h,0t,0r`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80000]"
            onClick={onClose}
          />

          {/* Drawer / Modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[80001] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`px-6 pt-5 pb-4 border-b border-slate-200 ${rc.ring} border-l-4`} style={{ borderLeftColor: mfg.riskTier === 'Critical' ? '#dc2626' : mfg.riskTier === 'High' ? '#d97706' : mfg.riskTier === 'Moderate' ? '#ca8a04' : '#16a34a' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Badge variant={rc.badge} size="sm" className="font-mono font-bold text-[10px]">
                      {mfg.riskTier.toUpperCase()} RISK · {mfg.riskScore}/100
                    </Badge>
                    {mfg.repeatOffenderFlag && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">
                        ⚠ Repeat Offender
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {mfg.facilityType}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                    {mfg.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    CIN: {mfg.cin}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onScheduleInspection && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold shrink-0"
                      onClick={() => {
                        onScheduleInspection(mfg);
                      }}
                      title="Schedule surprise inspection notice & dispatch email to enforcement team"
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                      Schedule Inspection
                    </Button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Risk Score Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-500 font-medium uppercase tracking-wider">Algorithmic Risk Score</span>
                  <span className={`font-mono font-bold ${rc.text}`}>{mfg.riskScore} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${rc.bar}`}
                    style={{ width: `${mfg.riskScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 gap-1 pt-1">
              {(['overview', 'violations', 'actions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2.5 text-xs font-semibold capitalize border-b-2 -mb-px transition-colors',
                    activeTab === tab
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab === 'violations' ? `Violations (${mfg.activeViolations})` : tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <>
                  {/* Registration Details */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entity Registration</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400 mb-0.5">CIN</div>
                        <div className="font-mono font-semibold text-slate-900">{mfg.cin}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-0.5">GSTIN (Karnataka)</div>
                        <div className="font-mono font-semibold text-slate-900">{mfg.gstin}</div>
                      </div>
                      {mfg.fssaiLicenseNo && (
                        <div>
                          <div className="text-slate-400 mb-0.5">FSSAI License No.</div>
                          <div className="font-mono font-semibold text-slate-900">{mfg.fssaiLicenseNo}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-slate-400 mb-0.5">Last Audit</div>
                        <div className="font-semibold text-slate-900">{mfg.lastAuditDate}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-slate-400 text-xs mb-1">Registered / Factory Address</div>
                      <div className="flex items-start gap-2 text-xs text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{mfg.registeredAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                        <Factory className="h-3 w-3" />
                        <span>{mfg.facilityType} · {mfg.zone}</span>
                      </div>
                      <div className="flex gap-2 mt-2.5">
                        <a
                          href={GOOGLE_MAPS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> Google Maps
                        </a>
                        <a
                          href={GOOGLE_EARTH_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> Google Earth
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'SCN Notices Issued', value: mfg.noticesIssued, color: 'text-amber-700' },
                      { label: 'Products Scanned', value: mfg.totalProductsScanned, color: 'text-slate-900' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                        <div className={`text-2xl font-extrabold font-mono ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Associated Brands & Products</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {mfg.brands.map((b) => (
                        <span key={b} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200">
                          {b}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Primary Category: <span className="font-semibold text-slate-700">{mfg.primaryCategory}</span>
                    </div>
                  </div>

                  {/* Top Offense Types */}
                  {mfg.topOffenseTypes.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Top Offense Types</h3>
                      <div className="space-y-1.5">
                        {mfg.topOffenseTypes.map((offense, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <AlertOctagon className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{offense}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── VIOLATIONS TAB ── */}
              {activeTab === 'violations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Logged infractions for <strong className="text-slate-800">{mfg.name}</strong>
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/dashboard/violations?entity=${encodeURIComponent(mfg.name.split(' ')[0])}`);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      Open in Violations Ledger <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  {displayViolations.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-green-400" />
                      <p className="text-sm font-medium">No violations on record</p>
                    </div>
                  ) : (
                    displayViolations.map((v) => (
                      <div key={v.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded border', STATUS_COLORS[v.status] || 'bg-slate-100 text-slate-600 border-slate-200')}>
                                {v.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{v.productName}</h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{v.ruleCode} · {v.section}</p>
                          </div>
                          <div className="text-right font-mono flex-shrink-0">
                            <div className="text-[10px] text-slate-400">Penalty Est.</div>
                            <div className="text-sm font-bold text-red-700">₹{v.penaltyEstimate.toLocaleString('en-IN')}</div>
                          </div>
                        </div>

                        {/* Attribution: Manufacturer vs Brand / Marketed By */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1">
                            <Factory className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-400">Mfg:</span>
                            <span className="font-medium text-slate-800">{v.manufacturer}</span>
                          </div>
                          {v.marketedBy && v.marketedBy !== v.manufacturer && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-400">Marketed by:</span>
                              <span className="font-medium text-slate-800">{v.marketedBy}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{v.description}</p>
                        <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 text-xs border border-slate-100">
                          <div><span className="text-slate-400 font-medium uppercase text-[10px]">Finding: </span><span className="text-slate-700 font-medium">{v.evidence?.extractedValue}</span></div>
                          <div><span className="text-slate-400 font-medium uppercase text-[10px]">Standard: </span><span className="text-slate-600">{v.evidence?.expectedStandard}</span></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Case: {v.caseNumber}</span>
                          <span>Detected: {v.detectedAt}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── ACTIONS TAB ── */}
              {activeTab === 'actions' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Inspector enforcement actions for <span className="font-semibold text-slate-700">{mfg.name}</span>. All actions are logged to the violation ledger.</p>

                  {[
                    {
                      icon: FileText,
                      label: 'Issue Show Cause Notice (SCN)',
                      desc: `Serve statutory notice under Section 36, Legal Metrology Act 2009. ${mfg.activeViolations} active violations qualify.`,
                      color: 'bg-red-600 hover:bg-red-700',
                      disabled: mfg.activeViolations === 0,
                    },
                    {
                      icon: Siren,
                      label: 'Schedule Facility Raid / Inspection',
                      desc: `Order surprise inspection at ${mfg.zone}. Coordinates: ${mfg.coordinates.lat.toFixed(4)}°N, ${mfg.coordinates.lng.toFixed(4)}°E.`,
                      color: 'bg-amber-600 hover:bg-amber-700',
                      disabled: false,
                    },
                    {
                      icon: Download,
                      label: 'Export Compliance Dossier (PDF)',
                      desc: 'Generate complete enforcement dossier with violations, evidence, penalty estimates, and notice history.',
                      color: 'bg-blue-600 hover:bg-blue-700',
                      disabled: false,
                    },
                    {
                      icon: ClipboardList,
                      label: 'Add to Watch List',
                      desc: 'Flag entity for enhanced monthly monitoring and automated risk re-scoring.',
                      color: 'bg-slate-700 hover:bg-slate-800',
                      disabled: false,
                    },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        disabled={action.disabled}
                        onClick={() => {
                          if (action.label.includes('Schedule') && onScheduleInspection) {
                            onScheduleInspection(mfg);
                          } else {
                            alert(`Action triggered: ${action.label}\n\n(This is a demo — in production this would log to the enforcement ledger.)`);
                          }
                        }}
                        className={cn(
                          'w-full flex items-start gap-3 p-4 rounded-xl text-white text-left transition-all',
                          action.disabled ? 'opacity-40 cursor-not-allowed bg-slate-400' : action.color
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold">{action.label}</div>
                          <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{action.desc}</div>
                        </div>
                        {!action.disabled && <ChevronRight className="h-4 w-4 flex-shrink-0 ml-auto mt-0.5 opacity-70" />}
                      </button>
                    );
                  })}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                    <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                      <BadgeCheck className="h-3.5 w-3.5" /> Inspector on Record
                    </div>
                    <div>Arjun Nair · Senior LM Inspector (Bengaluru City – Zone 1 / BBMP) · Badge: LM-BLR-4001</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
