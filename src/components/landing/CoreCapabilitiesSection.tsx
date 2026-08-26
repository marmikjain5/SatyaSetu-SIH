import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScanText,
  ShieldCheck,
  Award,
  AlertOctagon,
  Network,
  Cpu,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const CoreCapabilitiesSection: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const capabilities = [
    {
      id: 1,
      title: 'OCR Intelligence',
      subtitle: 'Multi-Lingual High-Precision Computer Vision',
      description:
        'Extracts MRP, net quantity, batch codes, manufacturing date, and statutory contact details from non-standard curved packaging images with 99.1% optical accuracy.',
      icon: ScanText,
      badge: 'Vision AI v3',
      metrics: ['22 Indian Languages Supported', '1.5mm Font Detection', 'Curved Surface Rectification'],
      tag: 'Legal Metrology R.7',
    },
    {
      id: 2,
      title: 'Compliance Verification',
      subtitle: 'Statutory Act & Schedule Validation Matrix',
      description:
        'Cross-checks physical package OCR against Legal Metrology (Packaged Commodities) Rules 2011, FSSAI Section 23, and E-Commerce Marketplace declarations.',
      icon: ShieldCheck,
      badge: 'Automated SCN',
      metrics: ['Unit Sale Price (USP) Calculation', 'Dual-MRP Detection', 'Origin Cross-Check'],
      tag: 'Section 36 Compliance',
    },
    {
      id: 3,
      title: 'Consumer Trust Scoring',
      subtitle: 'Transparent Algorithmic Index (0-100)',
      description:
        'Generates dynamic trust ratings for products and brand sellers based on historical violation ledger, consumer grievance sentiment, and listing accuracy.',
      icon: Award,
      badge: 'Real-Time Index',
      metrics: ['Weighted Violation Multipliers', 'Consumer Return Corroboration', 'Transparent Score Breakdown'],
      tag: 'Consumer Portal Ready',
    },
    {
      id: 4,
      title: 'Misleading Claim Detection',
      subtitle: 'NLP & LLM Regulatory Verification Engine',
      description:
        'Identifies exaggerated efficacy claims, fake endorsements, and prohibited statements under the Drugs & Magic Remedies Act and CCPA 2022 Guidelines.',
      icon: AlertOctagon,
      badge: 'RAG Regulatory',
      metrics: ['Clinical Evidence Verification', 'Deceptive Discount Detection', 'Dark Pattern Recognition'],
      tag: 'CCPA Act Sec 2(28)',
    },
    {
      id: 5,
      title: 'Repeat-Offender Analysis',
      subtitle: 'Entity Resolution & Corporate Graphing',
      description:
        'Unmasks multi-brand shell entities, uncovers common CIN/GSTIN networks, and flags chronic non-compliant manufacturing clusters for targeted zonal raids.',
      icon: Network,
      badge: 'Graph Intelligence',
      metrics: ['Cross-Platform Seller Tracking', 'GSTIN & CIN Entity Resolution', 'Escalated Penalty Tiering'],
      tag: 'Zonal Enforcement',
    },
    {
      id: 6,
      title: 'Dynamic Rule Intelligence',
      subtitle: 'Adaptive Policy & Gazette Rule Configuration',
      description:
        'Empowers CCPA administrators to update statutory penalty thresholds, add new gazette amendments, and deploy instantaneous rules without codebase modification.',
      icon: Cpu,
      badge: 'Zero-Downtime Engine',
      metrics: ['Custom Regex & Semantic Rules', 'Dynamic Fine Estimators', 'Instantaneous Crawler Deployment'],
      tag: 'Gazette Hot-Reload',
    },
  ];

  return (
    <section id="capabilities" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Core Intelligence Stack
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Precision Regulatory Automation
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Engineered specifically to solve enforcement challenges for consumer protection authorities and legal metrology departments.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              CCPA & LEGAL METROLOGY v4.2 COMPLIANT
            </span>
          </div>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = activeCard === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                onMouseEnter={() => setActiveCard(item.id)}
                onMouseLeave={() => setActiveCard(null)}
                className={`bg-white rounded-xl border p-6 transition-all duration-200 flex flex-col justify-between ${
                  isHovered
                    ? 'border-blue-500 shadow-card-hover -translate-y-1'
                    : 'border-slate-200/90 shadow-subtle'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                      {item.badge}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-4 tracking-tight flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowUpRight
                      className={`h-4 w-4 transition-transform text-slate-400 ${
                        isHovered ? 'translate-x-0.5 -translate-y-0.5 text-blue-600' : ''
                      }`}
                    />
                  </h3>
                  <p className="text-xs font-medium text-blue-600 mt-0.5">{item.subtitle}</p>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="space-y-1.5">
                    {item.metrics.map((metric) => (
                      <div key={metric} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Statutory Reference:</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
