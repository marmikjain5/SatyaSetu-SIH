import React from 'react';
import {
  MapPin,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  ArrowUpRight,
  Thermometer,
  Droplets,
  Bug,
  SprayCan,
  HardHat,
  Wrench,
  Trash2,
  Camera,
  Eye,
  Activity,
} from 'lucide-react';
import { Factory, HygieneViolation, HygieneInspection, HygieneAlert, HygieneParameter } from '../../types/hygiene';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface FactoryDetailModalProps {
  factory: Factory | null;
  violations: HygieneViolation[];
  inspections: HygieneInspection[];
  alerts: HygieneAlert[];
  isOpen: boolean;
  onClose: () => void;
  onResolveViolation: (id: string) => void;
  onAcknowledgeAlert: (id: string) => void;
}

const statusBadge = {
  compliant: { label: 'Compliant', variant: 'success' as const },
  warning: { label: 'Warning', variant: 'warning' as const },
  critical: { label: 'Critical', variant: 'danger' as const },
  'under-review': { label: 'Under Review', variant: 'primary' as const },
};

const paramIcons: Record<string, React.ElementType> = {
  'Temperature': Thermometer,
  'Humidity': Droplets,
  'Pest Activity': Bug,
  'Surface Cleanliness': SprayCan,
  'Worker Hygiene': HardHat,
  'Equipment Sanitation': Wrench,
  'Waste Management': Trash2,
};

function getStatusColor(status: HygieneParameter['status']): string {
  return status === 'normal' ? 'text-emerald-700' : status === 'warning' ? 'text-amber-700' : 'text-red-700';
}

function formatThreshold(param: HygieneParameter): string {
  if (param.minThreshold !== undefined && param.maxThreshold !== undefined) {
    return `${param.minThreshold}–${param.maxThreshold} ${param.unit}`;
  }
  if (param.maxThreshold !== undefined) return `≤${param.maxThreshold} ${param.unit}`;
  if (param.minThreshold !== undefined) return `≥${param.minThreshold} ${param.unit}`;
  return '—';
}

export const FactoryDetailModal: React.FC<FactoryDetailModalProps> = ({
  factory,
  violations,
  inspections,
  alerts,
  isOpen,
  onClose,
  onResolveViolation,
  onAcknowledgeAlert,
}) => {
  if (!factory) return null;

  const st = statusBadge[factory.complianceStatus];
  const openViolations = violations.filter((v) => v.status === 'open');
  const unackAlerts = alerts.filter((a) => !a.acknowledged);
  const recentInspections = [...inspections].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={factory.name}
      subtitle={`${factory.category} · ${factory.registrationNumber}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* ── Factory Info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{factory.location}, {factory.city}, {factory.state}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>FSSAI: {factory.fssaiLicense}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Last Inspection: {factory.lastInspection}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <ClipboardCheck className="h-4 w-4 text-slate-400" />
              <span>{factory.totalInspections} inspections · {factory.inspectionPassRate}% pass rate</span>
            </div>
          </div>

          {/* Score Ring */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={factory.overallScore >= 80 ? '#10b981' : factory.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(factory.overallScore / 100) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn(
                  'text-2xl font-bold',
                  factory.overallScore >= 80 ? 'text-emerald-700' : factory.overallScore >= 60 ? 'text-amber-700' : 'text-red-700'
                )}>
                  {factory.overallScore}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Score</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Badge variant={st.variant} size="lg" dot>{st.label}</Badge>
              <div className="text-xs text-slate-500">{factory.activeAlerts} active alert{factory.activeAlerts !== 1 ? 's' : ''}</div>
              <div className="text-xs text-slate-500">{openViolations.length} open violation{openViolations.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {/* ── Zone Breakdown ── */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Zone Breakdown
          </h4>
          <div className="space-y-3">
            {factory.zones.map((zone) => {
              const zSt = statusBadge[zone.status];
              return (
                <div key={zone.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{zone.name}</span>
                      <Badge variant={zSt.variant} size="sm">{zSt.label}</Badge>
                    </div>
                    <span className={cn(
                      'text-sm font-bold',
                      zone.score >= 80 ? 'text-emerald-700' : zone.score >= 60 ? 'text-amber-700' : 'text-red-700'
                    )}>
                      {zone.score}/100
                    </span>
                  </div>
                  {/* Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {zone.parameters.map((param) => {
                      const Icon = paramIcons[param.name] || Thermometer;
                      return (
                        <div key={param.id} className="flex items-center gap-2 text-xs">
                          <Icon className={cn('h-3 w-3 shrink-0', getStatusColor(param.status))} />
                          <span className="text-slate-600 truncate">{param.name}</span>
                          <span className={cn('font-bold ml-auto tabular-nums', getStatusColor(param.status))}>
                            {param.value}{param.unit.startsWith('/') ? '' : ' '}{param.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Active Violations ── */}
        {openViolations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Active Violations
              <Badge variant="danger" size="sm">{openViolations.length}</Badge>
            </h4>
            <div className="space-y-2">
              {openViolations.map((v) => (
                <div key={v.id} className="p-3 rounded-lg border border-red-200 bg-red-50/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-900">{v.title}</span>
                        <Badge
                          variant={v.severity === 'critical' ? 'danger' : v.severity === 'high' ? 'warning' : 'primary'}
                          size="sm"
                        >
                          {v.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600">{v.zoneName} · {v.actualValue} (threshold: {v.threshold})</p>
                    </div>
                    <Button variant="success" size="sm" className="text-[11px] shrink-0" onClick={() => onResolveViolation(v.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Unacknowledged Alerts ── */}
        {unackAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Unacknowledged Alerts
              <Badge variant="warning" size="sm">{unackAlerts.length}</Badge>
            </h4>
            <div className="space-y-2">
              {unackAlerts.slice(0, 4).map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-900">{a.message}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.zoneName} · {a.timestamp}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[11px] shrink-0" onClick={() => onAcknowledgeAlert(a.id)}>
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Inspections ── */}
        {recentInspections.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Recent Inspections
            </h4>
            <div className="space-y-2">
              {recentInspections.map((ins) => (
                <div key={ins.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center',
                      ins.result === 'pass' ? 'bg-emerald-100 text-emerald-600' :
                      ins.result === 'fail' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    )}>
                      {ins.result === 'pass' ? <CheckCircle2 className="h-4 w-4" /> :
                       ins.result === 'fail' ? <AlertTriangle className="h-4 w-4" /> :
                       <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-900">{ins.date}</div>
                      <div className="text-[11px] text-slate-500">{ins.inspector} · Score: {ins.score}/100 · {ins.findingsCount} findings</div>
                    </div>
                  </div>
                  <Badge
                    variant={ins.result === 'pass' ? 'success' : ins.result === 'fail' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {ins.result === 'conditional-pass' ? 'Conditional' : ins.result.charAt(0).toUpperCase() + ins.result.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
