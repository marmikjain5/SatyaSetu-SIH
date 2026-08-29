import React from 'react';
import { MapPin, Calendar, ChevronRight, Search } from 'lucide-react';
import { Factory, HygieneStatus } from '../../types/hygiene';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface FactoryListProps {
  factories: Factory[];
  searchQuery: string;
  statusFilter: HygieneStatus | 'all';
  onSelectFactory: (factory: Factory) => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: HygieneStatus | 'all') => void;
}

const statusConfig: Record<HygieneStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' }> = {
  compliant: { label: 'Compliant', variant: 'success' },
  warning: { label: 'Warning', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
  'under-review': { label: 'Under Review', variant: 'primary' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-red-700';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export const FactoryList: React.FC<FactoryListProps> = ({
  factories,
  searchQuery,
  statusFilter,
  onSelectFactory,
  onSearchChange,
  onStatusFilterChange,
}) => {
  const filtered = factories.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.complianceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Factory Overview</CardTitle>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search factories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 w-48"
            />
          </div>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as HygieneStatus | 'all')}
            className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="under-review">Under Review</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No factories match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((factory) => {
              const cfg = statusConfig[factory.complianceStatus];
              return (
                <div
                  key={factory.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => onSelectFactory(factory)}
                >
                  {/* Score Ring */}
                  <div className="shrink-0 relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      <circle
                        cx="24" cy="24" r="20" fill="none"
                        stroke={factory.overallScore >= 80 ? '#10b981' : factory.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(factory.overallScore / 100) * 125.6} 125.6`}
                      />
                    </svg>
                    <span className={cn('absolute inset-0 flex items-center justify-center text-xs font-bold', getScoreColor(factory.overallScore))}>
                      {factory.overallScore}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">{factory.name}</span>
                      <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {factory.city}, {factory.state}
                      </span>
                      <span>{factory.category}</span>
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-xs">
                        <div
                          className={cn('h-full rounded-full transition-all', getScoreBarColor(factory.overallScore))}
                          style={{ width: `${factory.overallScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{factory.overallScore}/100</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-6 text-xs text-slate-600 shrink-0">
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{factory.activeAlerts}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{factory.zones.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Zones</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="font-medium">{factory.lastInspection}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">Last Inspected</div>
                    </div>
                  </div>

                  {/* Action */}
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-50 group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
