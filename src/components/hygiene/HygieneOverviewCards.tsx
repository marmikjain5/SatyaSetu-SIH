import React from 'react';
import { Factory, ShieldCheck, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { FACTORY_HYGIENE_STATS } from '../../data/mockHygieneData';

export const HygieneOverviewCards: React.FC = () => {
  const stats = FACTORY_HYGIENE_STATS;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Factories Monitored"
        value={stats.totalFactories}
        icon={Factory}
        variant="accent"
        description={`${stats.compliantFactories} compliant, ${stats.criticalFactories} critical`}
      />
      <StatCard
        title="Overall Hygiene Score"
        value={`${stats.averageScore}/100`}
        icon={ShieldCheck}
        variant={stats.averageScore >= 80 ? 'success' : stats.averageScore >= 60 ? 'warning' : 'danger'}
        change={stats.averageScore >= 75 ? '+2.4%' : '-3.1%'}
        trend={stats.averageScore >= 75 ? 'up' : 'down'}
        trendLabel="vs last month"
      />
      <StatCard
        title="Active Alerts"
        value={stats.activeAlerts}
        icon={AlertTriangle}
        variant={stats.activeAlerts > 4 ? 'danger' : 'warning'}
        description="Unacknowledged alerts"
      />
      <StatCard
        title="Inspections This Month"
        value={stats.inspectionsThisMonth}
        icon={ClipboardCheck}
        variant="default"
        description="Across all facilities"
      />
    </div>
  );
};
