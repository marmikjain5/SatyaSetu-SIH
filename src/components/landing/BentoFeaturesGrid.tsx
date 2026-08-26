import React from 'react';
import { motion } from 'framer-motion';
import {
  Scan,
  Cpu,
  BookOpenCheck,
  MessageSquareWarning,
  FileCheck2,
  Share2,
  TrendingDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const BentoFeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Next-Gen Regulatory Intelligence Stack
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every layer designed to withstand legal scrutiny, scale across millions of consumer transactions, and empower statutory enforcement.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Card 1: OCR Engine (Large 2 Col) */}
          <div className="md:col-span-2 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                  <Scan className="h-5 w-5" />
                </div>
                <Badge variant="primary" size="sm">
                  Neural Vision v3.4
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900">High-Precision OCR Engine</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Optical character recognition tailored for reflective, curved, and distorted consumer packaging surfaces. Accurately identifies 1.5mm micro-print MRP, dates, and FSSAI codes across 22 scheduled Indian languages.
              </p>
            </div>

            <div className="mt-6 p-3.5 bg-white rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>// OCR Field Extraction Stream</span>
                <span className="text-emerald-600">CONF: 99.4%</span>
              </div>
              <div className="text-slate-800">
                <span className="text-blue-600">MRP_INCL_ALL_TAXES:</span> ₹4,999.00 (Found Dual Sticker)
              </div>
              <div className="text-slate-800">
                <span className="text-blue-600">NET_QUANTITY:</span> 2000g (Declared) / 1840g (Calculated)
              </div>
            </div>
          </div>

          {/* Card 2: Rule Engine */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                  <Cpu className="h-5 w-5" />
                </div>
                <Badge variant="secondary" size="sm">
                  Rule Matrix
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Rule Engine</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Hot-swappable statutory rules based on Legal Metrology Act, 2009 and Packaged Commodities Rules 2011.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              34 Statutory Rules Active
            </div>
          </div>

          {/* Card 3: RAG Regulatory Intelligence */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                  <BookOpenCheck className="h-5 w-5" />
                </div>
                <Badge variant="primary" size="sm">
                  RAG LLM
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">RAG Regulatory Intelligence</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Retrieval-Augmented Generation across central gazette notifications, high court precedents, and CCPA advisory orders.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              Indexed 10,000+ Legal Orders
            </div>
          </div>

          {/* Card 4: Complaint Management */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                  <MessageSquareWarning className="h-5 w-5" />
                </div>
                <Badge variant="warning" size="sm">
                  NLP Triage
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">Complaint Management</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Automated sentiment analysis, evidence deduplication, and direct routing to zonal enforcement officers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              NCH 1915 Sync Active
            </div>
          </div>

          {/* Card 5: Notice Generation (Large 2 Col) */}
          <div className="md:col-span-2 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <Badge variant="danger" size="sm">
                  1-Click SCN
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automated Legal Notice (SCN) Generator</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Generates legally binding Show Cause Notices complete with Section 36 penalty clauses, embedded high-resolution optical evidence, and statutory reply timelines for company directors.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-700 font-medium">Standard SCN Template: Section 36(1) LM Act</span>
              <span className="text-emerald-700 font-mono font-semibold">Ready for E-Sign</span>
            </div>
          </div>

          {/* Card 6: Network Analysis */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <Badge variant="secondary" size="sm">
                  Graph DB
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">Network Analysis</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Uncovers multi-brand shell networks operating across disparate e-commerce seller IDs using shared GSTIN and bank records.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              Cross-Platform Graphing
            </div>
          </div>

          {/* Card 7: Company Risk Ranking */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <Badge variant="danger" size="sm">
                  Risk Tiering
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">Company Risk Ranking</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Algorithmic risk tiering based on recurrence index, complaint volume, and severity of misleading advertising claims.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              1,200+ Flagged Entities
            </div>
          </div>

          {/* Card 8: Consumer Verification */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="success" size="sm">
                  Citizen Tool
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900">Consumer Verification</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Public API & portal for 1.4B citizens to verify genuine packaging claims, valid MRPs, and official country of origin before purchasing.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              Instant Public Access
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
