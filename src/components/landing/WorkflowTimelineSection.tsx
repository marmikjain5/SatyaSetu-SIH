import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  PackageSearch,
  ScanEye,
  AlertTriangle,
  Gavel,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const WorkflowTimelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0); // Stage 01: Consumer Encounter

  const steps = [
    {
      id: 0,
      phase: 'Stage 01',
      title: 'Consumer Encounter',
      actor: 'Public Citizen / Buyer',
      icon: Users,
      summary: 'Consumer scans barcode or encounters misleading e-commerce claim/dual-MRP pricing.',
      details: [
        'Instant mobile barcode & packaging image capture',
        'Citizen grievance submission via National Consumer Helpline integration',
        'Transparent trust rating verification in < 1 second',
      ],
      tag: 'Citizen Engagement',
    },
    {
      id: 1,
      phase: 'Stage 02',
      title: 'Product Ingestion',
      actor: 'Automated Web Crawlers',
      icon: PackageSearch,
      summary: 'High-speed ingestion pipelines scrape millions of SKUs from Amazon, Flipkart, Blinkit & Meesho.',
      details: [
        'Continuous synchronization of pricing, images, and declared origin',
        'Daily catalog delta extraction across 6 marketplaces',
        'Automated product metadata normalization',
      ],
      tag: 'Big Data Pipeline',
    },
    {
      id: 2,
      phase: 'Stage 03',
      title: 'Compliance Monitoring',
      actor: 'AI Regulatory Engine',
      icon: ScanEye,
      summary: 'Multi-lingual OCR extracts label text and cross-references against Legal Metrology Rules 2011.',
      details: [
        'Font height & Unit Sale Price (USP) compliance checking',
        'Net weight shortfall vs maximum permissible error schedule',
        'RAG regulatory lookup on unsubstantiated health claims',
      ],
      tag: 'Statutory Verification',
    },
    {
      id: 3,
      phase: 'Stage 04',
      title: 'Violation Detection',
      actor: 'Algorithmic Enforcement Ledger',
      icon: AlertTriangle,
      summary: 'Instantaneous case creation with tamper-proof cryptographic evidence hashes.',
      details: [
        'Automated penalty estimation under Legal Metrology Act Sec 36',
        'Manufacturer repeat-offender risk scoring adjustment',
        'Evidence package compilation with OCR side-by-side snapshot',
      ],
      tag: 'Cryptographic Ledger',
    },
    {
      id: 4,
      phase: 'Stage 05',
      title: 'Regulatory Action',
      actor: 'CCPA & Legal Metrology Inspectors',
      icon: Gavel,
      summary: 'Automated Show Cause Notice (SCN) generation and one-click dispatch to verified company CIN/GSTIN.',
      details: [
        'Legally formatted Section 36 & Section 89 notice templates',
        'Direct integration with MCA21 registered corporate emails',
        'Zonal inspection tasking & hearing schedule tracking',
      ],
      tag: 'Notice Dispatch',
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-white dark:bg-[#0B0F19] border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            End-to-End Governance Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Why It Matters: The Enforcement Chain
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            How SatyaDrishti connects the consumer’s palm directly to statutory regulatory action in minutes, not months.
          </p>
        </div>

        {/* Interactive Step Navigator Bar with Flanking Left / Right Arrows */}
        <div className="flex items-center gap-2 sm:gap-4 mb-10">
          {/* Left Arrow */}
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            aria-label="Previous enforcement stage"
            className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 transition-all ${
              activeStep === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 active:scale-95'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* 5 Stages Tabs */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCurrent = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-3 rounded-lg text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-white dark:bg-blue-600/20 shadow-card border border-blue-500/80 text-slate-900 dark:text-white ring-1 ring-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold ${
                        isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {step.phase}
                    </span>
                    <Icon
                      className={`h-4 w-4 ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
                    />
                  </div>
                  <div className="text-xs font-bold truncate">{step.title}</div>
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={activeStep === steps.length - 1}
            aria-label="Next enforcement stage"
            className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 transition-all ${
              activeStep === steps.length - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 active:scale-95'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Active Stage Detailed Breakdown Box */}
        {(() => {
          const current = steps[activeStep];
          const CurrentIcon = current.icon;
          return (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#F8FAFC] dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-subtle"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-600 text-white shadow-xs">
                      <CurrentIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {current.phase}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Actor: {current.actor}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{current.title}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{current.summary}</p>

                  <div className="pt-3 space-y-2">
                    {current.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">System Output</span>
                    <Badge variant="primary" size="sm">
                      {current.tag}
                    </Badge>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Execution Latency</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">&lt; 450 ms (Cloud Engine)</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Regulatory Confidence</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">99.4% Multi-Pass AI</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <button
                      onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-slate-400 dark:text-slate-500 font-mono">
                      Step {activeStep + 1} of {steps.length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </section>
  );
};
