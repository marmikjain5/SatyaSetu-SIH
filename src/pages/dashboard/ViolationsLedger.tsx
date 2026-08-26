import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  FileCheck2,
  AlertTriangle,
  Gavel,
  ChevronRight,
  Download,
  Building,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { Violation, ViolationSeverity } from '../../types/compliance';
import { LegalNoticeModal } from './LegalNoticeModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';

export const ViolationsLedger: React.FC = () => {
  const { violations, selectedViolation, setSelectedViolation, issueNotice, resolveViolation } =
    useComplianceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [activeNoticeViolation, setActiveNoticeViolation] = useState<Violation | null>(null);

  const severities = ['All', 'critical', 'high', 'medium', 'low'];
  const statuses = ['All', 'Open', 'Notice Issued', 'Hearing Scheduled', 'Resolved'];

  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      v.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ruleCode.toLowerCase().includes(searchQuery.toLowerCase());

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
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 w-fit">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Statutory Enforcement Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Violations & Enforcement Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically logged infractions under Legal Metrology Act, 2009 and CCPA 2019.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Export Gazette Docket</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Total Flagged Cases</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{filteredViolations.length} Cases</div>
          <span className="text-[11px] text-red-600 font-medium">
            {filteredViolations.filter((v) => v.severity === 'critical').length} Critical Priority
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Estimated Penalties Under Sec 36</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(totalPenalties)}
          </div>
          <span className="text-[11px] text-slate-500">Subject to Adjudication</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Notices Issued</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {filteredViolations.filter((v) => v.status === 'Notice Issued' || v.noticeId).length} Dispatched
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% E-Delivery Verified</span>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <Input
                placeholder="Search Case File #, Product, Brand, Rule Code..."
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
                  <option key={sev} value={sev}>
                    Severity: {sev}
                  </option>
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
                  <option key={stat} value={stat}>
                    Status: {stat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Active Enforcement Docket ({filteredViolations.length})</span>
          </CardTitle>
          <span className="text-xs font-mono text-slate-500">Legal Metrology & CCPA Joint Roster</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Case File & Product</th>
                <th className="px-3 py-3">Rule & Act</th>
                <th className="px-3 py-3">Optical Evidence Finding</th>
                <th className="px-3 py-3">Severity</th>
                <th className="px-3 py-3">Fine Est.</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.map((violation) => (
                <tr
                  key={violation.id}
                  onClick={() => handleOpenNotice(violation)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="font-mono text-blue-700 font-bold text-[11px]">
                        {violation.caseNumber}
                      </div>
                      <div className="font-semibold text-slate-900 mt-0.5 line-clamp-1">
                        {violation.productName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {violation.manufacturer} • {violation.platform}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="font-mono font-bold text-slate-800 text-[11px]">
                      {violation.ruleCode}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {violation.section}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="max-w-xs">
                      <span className="font-medium text-slate-800 line-clamp-2">
                        {violation.evidence.extractedValue}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        violation.severity === 'critical'
                          ? 'danger'
                          : violation.severity === 'high'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                      className="uppercase font-bold text-[10px]"
                    >
                      {violation.severity}
                    </Badge>
                  </td>

                  <td className="px-3 py-3 font-mono font-bold text-slate-800">
                    {formatCurrency(violation.penaltyEstimate)}
                  </td>

                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        violation.status === 'Resolved'
                          ? 'success'
                          : violation.status === 'Notice Issued'
                          ? 'primary'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {violation.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button
                      variant={violation.status === 'Notice Issued' ? 'outline' : 'danger'}
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={(e) => handleOpenNotice(violation, e)}
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      <span>{violation.status === 'Notice Issued' ? 'View SCN' : 'Issue SCN'}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
