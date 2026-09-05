import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ShieldAlert,
  Building2,
  MessageSquareWarning,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Scan,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Gavel,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useComplianceStore } from '../../store/complianceStore';
import {
  COMPLIANCE_TRENDS,
  CATEGORY_RISK_METRICS,
  STATE_COMPLIANCE_METRICS,
  NATIONAL_STATS,
} from '../../data/mockComplianceData';
import { formatCurrency, formatNumber } from '../../lib/utils';

export const OverviewDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { products, violations, setSelectedProduct, setSelectedViolation } = useComplianceStore();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState<'3M' | '6M' | 'All'>('6M');
  const [zoneFilter, setZoneFilter] = useState<string>('All');

  const filteredTrends =
    timeRange === '3M'
      ? COMPLIANCE_TRENDS.slice(-3)
      : timeRange === '6M'
      ? COMPLIANCE_TRENDS.slice(-6)
      : COMPLIANCE_TRENDS;

  const filteredStates = STATE_COMPLIANCE_METRICS.filter((s) => {
    if (zoneFilter === 'High Risk') return s.riskScore >= 60;
    if (zoneFilter === 'Compliant') return s.compliancePercentage >= 85;
    if (zoneFilter !== 'All') return s.code === zoneFilter || s.state === zoneFilter;
    return true;
  });

  const handleInspectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      navigate('/dashboard/products');
    }
  };

  const handleInspectViolation = (violationId: string) => {
    const violation = violations.find((v) => v.id === violationId);
    if (violation) {
      setSelectedViolation(violation);
      navigate('/dashboard/violations');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {user?.department || 'CCPA Regulatory Intelligence'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">
              National Metrology Grid v4.8
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'admin'
              ? 'Authorized to issue statutory Show Cause Notices under Section 36 & review gazette rules.'
              : user?.role === 'inspector'
              ? 'Assigned to North-Zone Field Inspections & optical packaging evidence verification.'
              : 'Registered citizen representative for national product vigilance & grievance tracking.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/dashboard/products">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Scan className="h-3.5 w-3.5 text-blue-600" />
              <span>Scan Catalog</span>
            </Button>
          </Link>

          <Link to="/dashboard/violations">
            <Button variant="primary" size="sm" className="text-xs gap-1.5">
              <Gavel className="h-3.5 w-3.5 text-blue-400" />
              <span>Enforcement Ledger</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Products Analyzed"
          value={formatNumber(NATIONAL_STATS.productsAnalyzed)}
          change="+14.2%"
          trend="up"
          trendLabel="vs last month"
          icon={Package}
          variant="accent"
        />
        <StatCard
          title="Violations Flagged"
          value={formatNumber(NATIONAL_STATS.violationsDetected)}
          change="+8.1%"
          trend="up"
          trendLabel="Critical: 1,420"
          icon={ShieldAlert}
          variant="danger"
        />
        <StatCard
          title="High-Risk Manufacturers"
          value={formatNumber(NATIONAL_STATS.highRiskManufacturers)}
          change="-2.4%"
          trend="down"
          trendLabel="In Repeat Registry"
          icon={Building2}
          variant="warning"
        />
        <StatCard
          title="Citizen Complaints"
          value={formatNumber(NATIONAL_STATS.consumerComplaints)}
          change="6.4 Days"
          trend="neutral"
          trendLabel="Avg Resolution SLA"
          icon={MessageSquareWarning}
          variant="success"
        />
      </div>

      {/* Main Charts & Live Ticker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: National Compliance Ingestion Area Chart */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>National Product Compliance &amp; Violation Trajectory</span>
                </CardTitle>
                <CardDescription>
                  Monthly telemetry of automated SKU scans vs confirmed Legal Metrology &amp; CCPA violations.
                </CardDescription>
              </div>

              {/* Dynamic Time Range Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {(['3M', '6M', 'All'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono transition-all ${
                      timeRange === range
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {range === 'All' ? 'Full Year' : `Last ${range}`}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scanned"
                    name="Scanned SKUs"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScanned)"
                  />
                  <Area
                    type="monotone"
                    dataKey="violations"
                    name="Violations Detected"
                    stroke="#DC2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViolations)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right: Category Risk Distribution Bar Chart */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Category Risk Matrix</span>
                </CardTitle>
                <CardDescription>Violation rate by commodity group</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CATEGORY_RISK_METRICS}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#475569"
                    fontSize={10}
                    width={80}
                    tickFormatter={(v) => v.split(' ')[0]}
                  />
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
                  <Bar dataKey="violationRate" radius={[0, 4, 4, 0]}>
                    {CATEGORY_RISK_METRICS.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.riskLevel === 'Critical'
                            ? '#DC2626'
                            : entry.riskLevel === 'High'
                            ? '#EA580C'
                            : entry.riskLevel === 'Medium'
                            ? '#2563EB'
                            : '#16A34A'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Priority Cases & State-Wise Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Cases Ledger Preview */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <span>High-Priority Enforcement Queue</span>
                </CardTitle>
                <CardDescription>
                  Urgent statutory notices requiring officer authorization or hearing.
                </CardDescription>
              </div>
              <Link to="/dashboard/violations">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                  View All ({violations.length}) →
                </Button>
              </Link>
            </CardHeader>

            <div className="divide-y divide-slate-100 text-xs">
              {violations.slice(0, 4).map((violation) => (
                <div
                  key={violation.id}
                  onClick={() => handleInspectViolation(violation.id)}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        violation.severity === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {violation.platform.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{violation.productName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {violation.caseNumber} • {violation.ruleCode}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-slate-800 font-mono">
                        {formatCurrency(violation.penaltyEstimate)}
                      </div>
                      <div className="text-[10px] text-slate-400">Est. Section 36 Penalty</div>
                    </div>
                    <StatusBadge status={violation.status} />
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* State-Wise Enforcement Matrix */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>
                  <Building2 className="h-4 w-4 text-slate-700" />
                  <span>State Zonal Compliance Matrix</span>
                </CardTitle>
                <CardDescription>Zonal Legal Metrology inspection performance</CardDescription>
              </div>

              {/* Dynamic Zone Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="All">All Zones ({STATE_COMPLIANCE_METRICS.length})</option>
                  <option value="High Risk">High Risk (Risk &gt; 60)</option>
                  <option value="Compliant">High Compliance (&ge; 85%)</option>
                  {STATE_COMPLIANCE_METRICS.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.state} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">State / Zone</th>
                    <th className="px-3 py-2.5">Active Cases</th>
                    <th className="px-3 py-2.5">Compliance</th>
                    <th className="px-4 py-2.5 text-right">Risk Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStates.map((state) => (
                    <tr key={state.code} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-4 bg-slate-200 text-slate-700 rounded text-[10px] font-mono flex items-center justify-center font-bold">
                          {state.code}
                        </span>
                        <span>{state.state}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-700">{formatNumber(state.activeCases)}</td>
                      <td className="px-3 py-3 font-mono">
                        <span
                          className={
                            state.compliancePercentage >= 85
                              ? 'text-emerald-700 font-semibold'
                              : 'text-amber-700 font-semibold'
                          }
                        >
                          {state.compliancePercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            state.riskScore >= 70
                              ? 'bg-red-50 text-red-700'
                              : state.riskScore >= 40
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {state.riskScore}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStates.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        No states matching the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
