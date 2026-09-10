import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShieldAlert, Building2, MessageSquareText, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { SciFiCard } from '../ui/SciFiCard';

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
    <section id="stats" className="py-16 lg:py-20 bg-white dark:bg-[#0B0F19] border-y border-slate-200/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Description & Action */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Platform at a Glance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
              National Scale Intelligence at a Glance
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Continuous automated monitoring across India's digital commerce and packaged retail ecosystem.
            </p>
            <div className="pt-2">
              <a href="#preview">
                <Button variant="outline" size="sm" className="font-semibold gap-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-600 hover:text-blue-600 shadow-xs">
                  <span>View Live Metrics</span>
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: 2x2 Metric Cards Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                  >
                    <SciFiCard className="p-5 sm:p-6 min-h-[195px] justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-2xs">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            <TrendingUp className="h-3 w-3" />
                            {stat.growth}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="text-3xl font-extrabold tracking-tight scifi-card-text font-sans">
                            {stat.count}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{stat.label}</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.sublabel}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>Standard:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{stat.highlight}</span>
                      </div>
                    </SciFiCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
