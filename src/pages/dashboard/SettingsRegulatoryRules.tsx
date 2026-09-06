import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/utils';

export const SettingsRegulatoryRules: React.FC = () => {
  const { rules, toggleRule } = useComplianceStore();
  const { user } = useAuthStore();
  const [saveStatus, setSaveStatus] = useState(false);
  const [resetStatus, setResetStatus] = useState(false);

  const handleSaveAll = () => {
    setSaveStatus(true);
    setTimeout(() => {
      setSaveStatus(false);
    }, 2500);
  };

  const handleResetDefaults = () => {
    setResetStatus(true);
    setTimeout(() => {
      setResetStatus(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage application preferences, compliance configuration, notifications, and account settings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>{resetStatus ? 'Defaults Restored' : 'Reset Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {saveStatus ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span>Configuration Applied!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Rule Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Authenticated Administrative Context Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 shrink-0 mt-0.5">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Authenticated Role: {user?.designation || 'CCPA Administrator'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Officer: <span className="font-semibold text-slate-700">{user?.name || 'Authorized Officer'}</span> • Department: <span className="text-slate-700">{user?.department || 'Legal Metrology & Consumer Affairs'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Rules and thresholds updated here take immediate effect across all live web crawlers, OCR verification engines, and automated show-cause notice generators.
              </div>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-mono font-medium">
              CCPA GAUSS-4.2
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Statutory Rules & Penalty Schedules Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Active Statutory Rules & Penalty Schedules ({rules.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Toggle statutory compliance rules on/off or modify fine parameters without restarting core ingestion nodes.
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {rules.map((rule) => (
            <div key={rule.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="max-w-2xl space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-blue-700 font-bold text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {rule.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                      rule.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rule.severity.toUpperCase()}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-mono text-[11px]">{rule.category}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm tracking-tight">{rule.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{rule.description}</p>
                <div className="text-[11px] text-slate-400 font-mono">Statutory Act: {rule.act}</div>
              </div>

              {/* Controls */}
              <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between md:items-end lg:items-center gap-4 shrink-0 font-mono">
                <div className="text-left md:text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Penalty Range</div>
                  <div className="font-bold text-slate-900 text-xs">
                    {formatCurrency(rule.minFine)} – {formatCurrency(rule.maxFine)}
                  </div>
                  {rule.imprisonmentMonths && (
                    <div className="text-[10px] text-rose-600 font-medium">
                      Up to {rule.imprisonmentMonths}M imprisonment
                    </div>
                  )}
                </div>

                {/* Clean Switch Toggle */}
                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                    rule.isActive ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={rule.isActive}
                  aria-label={`Toggle ${rule.title}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      rule.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Audit & Compliance System Telemetry Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Audit & Compliance System Telemetry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger tracking automated actions, OCR verifications, and crawler synchronization.
            </p>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Live Ledger
          </span>
        </div>

        <div className="p-4 sm:p-5 font-mono text-xs space-y-2 text-slate-600">
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-slate-700">
              [2025-02-26 10:14:02 IST] Automated SCN #SCN-2025-0441 queued for Apex BioNutra Formulations
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit shrink-0">
              SUCCESS
            </span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-slate-700">
              [2025-02-26 09:45:11 IST] Barcode OCR verified for Flipkart SKU #SKU-FLP-ELEC-442 (Origin PRC)
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 w-fit shrink-0">
              VERIFIED
            </span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-slate-700">
              [2025-02-26 08:00:00 IST] Daily catalog crawler synchronization initialized across 6 platforms
            </span>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit shrink-0">
              SYNC_OK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

