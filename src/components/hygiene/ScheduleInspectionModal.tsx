import React, { useState } from 'react';
import {
  UserCheck,
  Send,
  CheckCircle2,
  MapPin,
  Building2,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { Factory } from '../../types/hygiene';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sendSurpriseInspectionNoticeEmail, SendEmailResult } from '../../services/gmailService';
import { useHygieneStore } from '../../store/hygieneStore';

interface ScheduleInspectionModalProps {
  factory: Factory | null;
  isOpen: boolean;
  onClose: () => void;
}

interface InspectorContact {
  id: string;
  name: string;
  role: string;
  zone: string;
  email: string;
  badge: string;
  isConnected: boolean; // Only Inspector Vivek Sharma is live connected
}

const INSPECTORS: InspectorContact[] = [
  {
    id: 'vivek',
    name: 'Inspector Vivek Sharma & Team',
    role: 'Lead Regulatory & Enforcement Officer',
    zone: 'National Hygiene Surveillance Cell',
    email: 'vivek.sharma.inspect@satyadrishti.gov.in',
    badge: 'OFF-IND-901',
    isConnected: true,
  },
  {
    id: 'marmik',
    name: 'Inspector Marmik Jain & Team',
    role: 'Senior Regional Compliance Inspector',
    zone: 'North Zone Industrial Cell',
    email: 'marmik.jain.inspect@satyadrishti.gov.in',
    badge: 'OFF-IND-902',
    isConnected: false,
  },
  {
    id: 'krish',
    name: 'Inspector Krish Jain & Team',
    role: 'Senior Regional Compliance Inspector',
    zone: 'South Zone Industrial Cell',
    email: 'krish.jain.inspect@satyadrishti.gov.in',
    badge: 'OFF-IND-903',
    isConnected: false,
  },
];

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  factory,
  isOpen,
  onClose,
}) => {
  const { addInspection } = useHygieneStore();

  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('vivek');
  const [priority, setPriority] = useState<string>('Immediate / Surprise Audit');
  const [notes, setNotes] = useState<string>(
    'Execute unannounced surprise physical inspection. Audit production line hygiene, worker PPE compliance, and zone telemetry accuracy.'
  );
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<SendEmailResult | null>(null);

  if (!factory) return null;

  const selectedInspector = INSPECTORS.find((i) => i.id === selectedInspectorId) || INSPECTORS[0];

  const handleDispatch = async () => {
    setIsDispatching(true);
    setDispatchResult(null);

    const openViolationsCount = factory.zones.reduce((acc, z) => acc + z.activeIssues, 0);

    const result = await sendSurpriseInspectionNoticeEmail({
      factoryId: factory.id,
      factoryName: factory.name,
      registrationNumber: factory.registrationNumber,
      fssaiLicense: factory.fssaiLicense,
      location: factory.location,
      city: factory.city,
      state: factory.state,
      category: factory.category,
      overallScore: factory.overallScore,
      complianceStatus: factory.complianceStatus,
      activeAlerts: factory.activeAlerts,
      openViolationsCount: openViolationsCount,
      assignedOfficer: selectedInspector.name,
      officerEmail: selectedInspector.email,
      priority: priority,
      directiveNotes: notes,
    });

    setIsDispatching(false);
    setDispatchResult(result);

    if (result.success) {
      // Add a scheduled inspection entry to hygiene store
      const todayStr = new Date().toISOString().split('T')[0];
      addInspection({
        id: `INSP-SCH-${Date.now()}`,
        factoryId: factory.id,
        inspector: selectedInspector.name,
        inspectorBadge: selectedInspector.badge,
        date: `${todayStr} (Scheduled)`,
        score: factory.overallScore,
        result: 'conditional-pass',
        findingsCount: factory.activeAlerts,
        criticalCount: factory.complianceStatus === 'critical' ? 2 : 0,
        findings: [
          `Surprise Inspection Directive issued: ${priority}`,
          `Target facility: ${factory.name} (${factory.location})`,
        ],
        evidence: [],
        notes: `Surprise Audit Ordered by CCPA Authority. Directive Ref: ${result.messageId || 'PND-9921'}. ${notes}`,
      });
    }
  };

  const handleResetAndClose = () => {
    setDispatchResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Schedule Surprise Factory Inspection"
      subtitle="Dispatch statutory surprise audit order via Gmail API"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* ── Factory Summary Banner ── */}
        <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-900 text-base">{factory.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                {factory.city}, {factory.state}
              </span>
              <span>Reg: {factory.registrationNumber}</span>
              <span>FSSAI: {factory.fssaiLicense}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Compliance Score</div>
              <span
                className={`text-lg font-bold ${
                  factory.overallScore >= 80
                    ? 'text-emerald-600'
                    : factory.overallScore >= 60
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {factory.overallScore}/100
              </span>
            </div>
            <Badge
              variant={
                factory.complianceStatus === 'compliant'
                  ? 'success'
                  : factory.complianceStatus === 'warning'
                  ? 'warning'
                  : 'danger'
              }
              size="md"
            >
              {factory.complianceStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        {dispatchResult ? (
          /* ── Dispatch Success State ── */
          <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Surprise Inspection Directive Dispatched Successfully!
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  Official statutory surprise inspection order has been generated and transmitted to{' '}
                  <strong className="underline">{dispatchResult.recipient}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-lg border border-emerald-200 text-xs space-y-1 font-mono text-slate-700">
              <div>
                <span className="text-slate-400">Mode:</span>{' '}
                <Badge variant={dispatchResult.mode === 'LIVE_GMAIL_API' ? 'success' : 'primary'} size="sm">
                  {dispatchResult.mode}
                </Badge>
              </div>
              {dispatchResult.messageId && (
                <div>
                  <span className="text-slate-400">Gmail Message ID:</span> {dispatchResult.messageId}
                </div>
              )}
              <div>
                <span className="text-slate-400">Assigned Team:</span> {selectedInspector.name}
              </div>
              <div>
                <span className="text-slate-400">Target Facility:</span> {factory.name} ({factory.city})
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" onClick={handleResetAndClose}>
                Done & View History
              </Button>
            </div>
          </div>
        ) : (
          /* ── Form State ── */
          <div className="space-y-6">
            {/* Inspector Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Select Inspector / Regulatory Team:
              </label>
              <div className="space-y-2.5">
                {INSPECTORS.map((inspector) => {
                  const isSelected = selectedInspectorId === inspector.id;
                  return (
                    <div
                      key={inspector.id}
                      onClick={() => setSelectedInspectorId(inspector.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{inspector.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {inspector.role} · {inspector.zone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <input
                          type="radio"
                          name="inspector"
                          checked={isSelected}
                          onChange={() => setSelectedInspectorId(inspector.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Directive Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Inspection Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Immediate / Surprise Audit">Immediate / Surprise Audit (ASAP)</option>
                  <option value="High Priority (Within 24 Hours)">High Priority (Within 24 Hours)</option>
                  <option value="Scheduled Audit (Next 3 Days)">Scheduled Audit (Next 3 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dispatch Recipient Email Preview
                </label>
                <div className="text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 truncate font-mono">
                  {import.meta.env.VITE_GMAIL_RECIPIENT_OVERRIDE || selectedInspector.email}
                </div>
              </div>
            </div>

            {/* Directive Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Directives & Inspection Scope Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter custom surprise audit instructions for the inspector team..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Dispatches a formatted statutory directive email to the assigned officer with complete factory telemetry, score breakdown, and hygiene violation alerts.
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
              <Button variant="outline" onClick={handleResetAndClose} disabled={isDispatching}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDispatch}
                disabled={isDispatching}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isDispatching ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    Dispatching Email...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Dispatch Surprise Inspection Order
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
