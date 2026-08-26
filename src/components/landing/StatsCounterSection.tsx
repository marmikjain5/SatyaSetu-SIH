import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShieldAlert, Building2, MessageSquareText, TrendingUp } from 'lucide-react';

export const StatsCounterSection: React.FC = () => {
  const stats = [
    {
      label: 'Products Analyzed',
      count: '2.4M+',
      sublabel: 'Across 6 Major E-Com Marketplaces',
      growth: '+14% MoM',
      icon: Package,
      highlight: '99.1% OCR Precision',
    },
    {
      label: 'Violations Detected',
      count: '48K+',
      sublabel: 'Legal Metrology & CCPA Infractions',
      growth: '₹4.2 Cr SCN Issued',
      icon: ShieldAlert,
      highlight: 'Automated Evidence Dossiers',
    },
    {
      label: 'High-Risk Manufacturers',
      count: '1,200+',
      sublabel: 'Categorized in Repeat-Offender Index',
      growth: '38 Zonal Audits',
      icon: Building2,
      highlight: 'Entity Network Graphing',
    },
    {
      label: 'Consumer Complaints',
      count: '320K+',
      sublabel: 'Triaged via Natural Language Pipeline',
      growth: '6.4 Day Resolution',
      icon: MessageSquareText,
      highlight: 'Real-Time Grievance Linkage',
    },
  ];

  return (
    <section id="stats" className="py-16 bg-white border-y border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Real-Time Compliance Telemetry
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
            National Scale Intelligence at a Glance
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Continuous automated monitoring across India's digital commerce and packaged retail ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <TrendingUp className="h-3 w-3" />
                    {stat.growth}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                    {stat.count}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{stat.label}</div>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.sublabel}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Standard:</span>
                  <span className="text-slate-700 font-medium">{stat.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
