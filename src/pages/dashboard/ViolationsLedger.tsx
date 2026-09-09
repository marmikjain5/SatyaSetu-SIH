import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  FileCheck2,
  Building2,
  Tag,
  Factory,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useComplianceStore } from '../../store/complianceStore';
import { Violation } from '../../types/compliance';
import { LegalNoticeModal } from './LegalNoticeModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const ViolationsLedger: React.FC = () => {
  const { violations, setSelectedViolation, issueNotice } = useComplianceStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [activeNoticeViolation, setActiveNoticeViolation] = useState<Violation | null>(null);

  // Support ?entity=<name> query param from manufacturer card links
  const entityFilter = searchParams.get('entity') || '';
  useEffect(() => {
    if (entityFilter) {
      setSearchQuery(entityFilter);
    }
  }, [entityFilter]);

  const severities = ['All', 'critical', 'high', 'medium', 'low'];
  const statuses = ['All', 'Open', 'Notice Issued', 'Hearing Scheduled', 'Resolved'];

  const filteredViolations = violations.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.caseNumber.toLowerCase().includes(q) ||
      v.productName.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.manufacturer.toLowerCase().includes(q) ||
      (v.marketedBy?.toLowerCase().includes(q) ?? false) ||
      v.ruleCode.toLowerCase().includes(q);

    const matchesSeverity = selectedSeverity === 'All' || v.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalPenalties = filteredViolations.reduce((acc, v) => acc + v.penaltyEstimate, 0);

  const handleOpenNotice = (violation: Violation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveNoticeViolation(violation);
    setSelectedViolation(violation);
    setIsNoticeModalOpen(true);
  };

  const handleNoticeDispatched = (violationId: string) => {
    issueNotice(violationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Violations & Enforcement Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Infractions logged under Legal Metrology Act 2009, Packaged Commodities Rules 2011 & FSSAI Labelling Regulations 2020.
            {entityFilter && (
              <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                Filtered: {entityFilter}
                <button
                  onClick={() => navigate('/dashboard/violations')}
                  className="ml-1.5 text-blue-400 hover:text-blue-700"
                >✕</button>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Total Cases</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{filteredViolations.length}</div>
          <span className="text-[11px] text-red-600 font-medium">
            {filteredViolations.filter((v) => v.severity === 'critical').length} Critical Priority
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Estimated Penalties</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(totalPenalties)}
          </div>
          <span className="text-[11px] text-slate-500">Subject to Adjudication</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Notices Issued</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {filteredViolations.filter((v) => v.status === 'Notice Issued' || v.noticeId).length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Dispatched</span>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <Input
                placeholder="Search by Product, Manufacturer, Brand, Case #, Rule Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="text-xs"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none capitalize"
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev}>Severity: {sev}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {statuses.map((stat) => (
                  <option key={stat} value={stat}>Status: {stat}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <div className="space-y-3">
        {filteredViolations.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No violations match your filters.</p>
          </div>
        )}

        {filteredViolations.map((violation) => (
          <Card
            key={violation.id}
            className="cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
            onClick={() => handleOpenNotice(violation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">

                  {/* ── Product Name (PRIMARY IDENTIFIER) ── */}
                  <div>
                    <p className="text-[10px] font-mono text-blue-600 font-semibold mb-0.5">
                      {violation.caseNumber}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {violation.productName}
                    </h3>
                  </div>

                  {/* ── Responsible Parties ── */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    {/* Manufacturer */}
                    <div className="flex items-center gap-1">
                      <Factory className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400">Manufactured by:</span>
                      <span className="font-semibold text-slate-700">{violation.manufacturer}</span>
                    </div>
                    {/* Marketed by / Brand (only if different from manufacturer) */}
                    {violation.marketedBy && violation.marketedBy !== violation.manufacturer ? (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-400">Marketed by:</span>
                        <span className="font-semibold text-slate-700">{violation.marketedBy}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-400">Brand:</span>
                        <span className="font-semibold text-slate-700">{violation.brand}</span>
                      </div>
                    )}
                    {/* Platform */}
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400">Channel:</span>
                      <span className="font-semibold text-slate-700">{violation.platform}</span>
                    </div>
                  </div>

                  {/* ── Rule & Description ── */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-bold text-slate-700">
                      {violation.ruleCode} · {violation.section}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {violation.description}
                    </p>
                  </div>

                  {/* ── Evidence Finding ── */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Finding: </span>
                    <span className="text-slate-700">{violation.evidence.extractedValue}</span>
                  </div>
                </div>

                {/* ── Right Column: badges + action ── */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={violation.status} />
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Est. Penalty</div>
                    <div className="text-sm font-bold font-mono text-red-700">
                      {formatCurrency(violation.penaltyEstimate)}
                    </div>
                  </div>
                  <Button
                    variant={violation.status === 'Notice Issued' ? 'outline' : 'danger'}
                    size="sm"
                    className="h-7 text-xs gap-1.5 mt-1"
                    onClick={(e) => handleOpenNotice(violation, e)}
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>{violation.status === 'Notice Issued' ? 'View SCN' : 'Issue SCN'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SCN Notice Modal */}
      <LegalNoticeModal
        violation={activeNoticeViolation}
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onDispatch={handleNoticeDispatched}
      />
    </div>
  );
};
