import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Download, Sparkles, TrendingUp, ShieldCheck, Scale, AlertOctagon } from 'lucide-react';
import {
  COMPLIANCE_TRENDS,
  CATEGORY_RISK_METRICS,
  PLATFORM_COMPLIANCE_METRICS,
  STATE_COMPLIANCE_METRICS,
  NATIONAL_STATS,
} from '../../data/mockComplianceData';
import { formatNumber, formatCurrency } from '../../lib/utils';

export const AnalyticsIntelligence: React.FC = () => {
  const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 w-fit">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>National Regulatory Analytics Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Compliance & Enforcement Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregate telemetry, marketplace compliance distribution, and zonal enforcement timelines.
          </p>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-slate-500 uppercase text-[10px]">National OCR Precision</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-sans">{NATIONAL_STATS.ocrAccuracyRate}%</div>
          <span className="text-slate-400 text-[11px]">Multi-Pass Optical Validation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-slate-500 uppercase text-[10px]">Total Penalties Assessed</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">
            {formatCurrency(NATIONAL_STATS.penaltyCollected)}
          </div>
          <span className="text-emerald-600 font-medium text-[11px]">Section 36 Recoveries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-slate-500 uppercase text-[10px]">Active SCN Notices</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-sans">
            {formatNumber(NATIONAL_STATS.activeNotices)}
          </div>
          <span className="text-slate-400 text-[11px]">Awaiting Company Reply</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-slate-500 uppercase text-[10px]">Resolution Turnaround</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-sans">
            {NATIONAL_STATS.averageResolutionDays} Days
          </div>
          <span className="text-emerald-700 font-medium text-[11px]">Down from 28 Days</span>
        </div>
      </div>

      {/* Row 1: Enforcement Volume Over Time (Recharts Line/Bar Combo) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Scale className="h-4 w-4 text-blue-600" />
              <span>Enforcement Lifecycle: Violations vs SCN Notices vs Resolutions</span>
            </CardTitle>
            <CardDescription>Monthly volume of cases processed by the regulatory intelligence engine</CardDescription>
          </div>
          <Badge variant="primary" size="sm">
            National Pipeline
          </Badge>
        </CardHeader>

        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPLIANCE_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="violations" name="Violations Detected" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="notices" name="SCN Notices Issued" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Cases Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 2: Marketplace Platform Compliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Marketplace Compliance Rates</span>
                </CardTitle>
                <CardDescription>Verified compliance scores across top digital commerce platforms</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={PLATFORM_COMPLIANCE_METRICS}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={10} unit="%" />
                  <YAxis type="category" dataKey="platform" stroke="#475569" fontSize={10} width={90} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Compliance Rate']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="complianceRate" fill="#2563EB" radius={[0, 4, 4, 0]}>
                    {PLATFORM_COMPLIANCE_METRICS.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.complianceRate >= 90 ? '#10B981' : entry.complianceRate >= 75 ? '#2563EB' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>
                  <AlertOctagon className="h-4 w-4 text-red-600" />
                  <span>Commodity Risk Distribution</span>
                </CardTitle>
                <CardDescription>Proportion of non-compliance across consumer goods verticals</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_RISK_METRICS}
                    dataKey="violationRate"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {CATEGORY_RISK_METRICS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Violation Rate']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
