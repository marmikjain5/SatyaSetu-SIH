import React, { useState } from 'react';
import {
  Factory as FactoryIcon,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { useHygieneStore } from '../../store/hygieneStore';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { HygieneOverviewCards } from '../../components/hygiene/HygieneOverviewCards';
import { FactoryList } from '../../components/hygiene/FactoryList';
import { ZoneMonitoringGrid } from '../../components/hygiene/ZoneMonitoringGrid';
import { HygieneAlertsFeed } from '../../components/hygiene/HygieneAlertsFeed';
import { ViolationsTable } from '../../components/hygiene/ViolationsTable';
import { InspectionHistory } from '../../components/hygiene/InspectionHistory';
import { HygieneTrendChart } from '../../components/hygiene/HygieneTrendChart';
import { FactoryDetailModal } from './FactoryDetailModal';
import { FactoryImageInspection } from '../../components/hygiene/FactoryImageInspection';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'vision', label: 'AI Vision Inspection' },
  { id: 'zones', label: 'Zone Monitoring' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'alerts', label: 'Alerts & Violations' },
];

export const FactoryHygieneMonitoring: React.FC = () => {
  const {
    factories,
    alerts,
    violations,
    inspections,
    trends,
    selectedFactory,
    searchQuery,
    statusFilter,
    selectFactory,
    clearSelection,
    setSearchQuery,
    setStatusFilter,
    acknowledgeAlert,
    resolveViolation,
    escalateViolation,
    getFactoryAlerts,
    getFactoryViolations,
    getFactoryInspections,
  } = useHygieneStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Compute tab counts
  const unackAlertCount = alerts.filter((a) => !a.acknowledged).length;
  const openViolationCount = violations.filter((v) => v.status === 'open').length;

  const tabsWithCounts = TABS.map((tab) => ({
    ...tab,
    count: tab.id === 'alerts' ? unackAlertCount + openViolationCount : undefined,
  }));

  // When a factory is selected from the list, open the detail modal
  const handleSelectFactory = (factory: typeof factories[0]) => {
    selectFactory(factory);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  // Data for factory detail modal
  const factoryAlerts = selectedFactory ? getFactoryAlerts(selectedFactory.id) : [];
  const factoryViolations = selectedFactory ? getFactoryViolations(selectedFactory.id) : [];
  const factoryInspections = selectedFactory ? getFactoryInspections(selectedFactory.id) : [];

  // Zone monitoring: if a factory is selected via zone tab, show its zones
  const [zoneViewFactoryId, setZoneViewFactoryId] = useState<string | null>(null);
  const zoneViewFactory = zoneViewFactoryId ? factories.find((f) => f.id === zoneViewFactoryId) : null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Hygiene Compliance Module</span>
            </div>
            <Badge variant="primary" size="sm" dot className="animate-pulse">
              <Radio className="h-3 w-3 mr-0.5" />
              Prototype Telemetry
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Factory Hygiene Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Monitoring and inspection dashboard for factory hygiene compliance. Sensor telemetry data is simulated for prototype demonstration. Visual assessments reflect sample inspection records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            <FactoryIcon className="h-3 w-3 mr-1" />
            {factories.length} Facilities
          </Badge>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <HygieneOverviewCards />

      {/* ── Tabs ── */}
      <Tabs
        tabs={tabsWithCounts}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="segmented"
      />

      {/* ── Tab Content ── */}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <FactoryList
            factories={factories}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSelectFactory={handleSelectFactory}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
          />
          <HygieneTrendChart trends={trends} />
        </div>
      )}

      {/* AI Vision Inspection Tab */}
      {activeTab === 'vision' && (
        <FactoryImageInspection />
      )}

      {/* Zone Monitoring Tab */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          {/* Factory selector for zone view */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Select Facility:</span>
            {factories.map((f) => (
              <Button
                key={f.id}
                variant={zoneViewFactoryId === f.id ? 'primary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setZoneViewFactoryId(f.id)}
              >
                {f.name.length > 25 ? f.name.slice(0, 25) + '…' : f.name}
                <Badge
                  variant={f.complianceStatus === 'compliant' ? 'success' : f.complianceStatus === 'warning' ? 'warning' : 'danger'}
                  size="sm"
                  className="ml-1.5"
                >
                  {f.overallScore}
                </Badge>
              </Button>
            ))}
          </div>

          {zoneViewFactory ? (
            <ZoneMonitoringGrid zones={zoneViewFactory.zones} />
          ) : (
            <div className="p-12 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              Select a facility above to view zone-level monitoring data.
            </div>
          )}
        </div>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <InspectionHistory inspections={inspections} />
      )}

      {/* Alerts & Violations Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <HygieneAlertsFeed
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
          />
          <ViolationsTable
            violations={violations}
            onResolve={resolveViolation}
            onEscalate={escalateViolation}
          />
        </div>
      )}

      {/* ── Factory Detail Modal ── */}
      <FactoryDetailModal
        factory={selectedFactory}
        violations={factoryViolations}
        inspections={factoryInspections}
        alerts={factoryAlerts}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onResolveViolation={resolveViolation}
        onAcknowledgeAlert={acknowledgeAlert}
      />
    </div>
  );
};
