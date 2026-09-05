import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Save,
  Plus,
  Lock,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

export const SettingsRegulatoryRules: React.FC = () => {
  const { rules, toggleRule } = useComplianceStore();
  const { user } = useAuthStore();
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSaveAll = () => {
    setSaveStatus(true);
    setTimeout(() => {
      setSaveStatus(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 w-fit">
            <Sliders className="h-3.5 w-3.5 text-blue-600" />
            <span>Gazette Dynamic Hot-Reload Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Regulatory Rule Engine & Policy Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage active statutory rules, compound penalty limits, and automatic SCN issuance thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm" className="font-mono text-xs px-2.5 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            <span>Real-Time Engine Sync</span>
          </Badge>
        </div>
      </div>

      {/* Admin Privilege Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
              Authenticated Role: {user?.designation || 'CCPA Administrator'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Rule toggles take immediate effect across all live web crawlers and OCR validation pipelines.
            </div>
          </div>
        </div>
        <Badge variant="primary" size="sm" className="hidden sm:inline-flex font-mono text-[10px]">
          CCPA GAUSS-4.2
        </Badge>
      </div>

      {/* Rules Table / Cards */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Active Statutory Rules & Penalty Schedules ({rules.length})</span>
            </CardTitle>
            <CardDescription>
              Toggle rules on/off or modify fine parameters in real-time across the compliance ingestion engine.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="divide-y divide-slate-100 text-xs">
          {rules.map((rule) => (
            <div key={rule.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-2xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-700 font-bold text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {rule.code}
                  </span>
                  <Badge variant={rule.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {rule.severity.toUpperCase()}
                  </Badge>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-mono text-[11px]">{rule.category}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm tracking-tight">{rule.title}</h4>
                <p className="text-slate-600 leading-relaxed">{rule.description}</p>
                <div className="text-[11px] text-slate-400 font-mono">Act: {rule.act}</div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 font-mono">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Penalty Range</div>
                  <div className="font-bold text-slate-800">
                    {formatCurrency(rule.minFine)} - {formatCurrency(rule.maxFine)}
                  </div>
                  {rule.imprisonmentMonths && (
                    <div className="text-[10px] text-red-600">Up to {rule.imprisonmentMonths}M imprisonment</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rule.isActive ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      rule.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
