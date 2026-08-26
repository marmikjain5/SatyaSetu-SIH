import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  Scan,
  AlertTriangle,
  FileCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ScanItem {
  id: string;
  name: string;
  brand: string;
  platform: string;
  category: string;
  status: 'Violation' | 'Compliant' | 'Warning';
  score: number;
  ocrConfidence: number;
  highlight: string;
  ruleCode: string;
  penalty: string;
}

const STREAM_DATA: ScanItem[] = [
  {
    id: 'PRD-01',
    name: 'OptiMax Pure Whey 2kg',
    brand: 'NutriPro Labs',
    platform: 'Amazon.in',
    category: 'Nutraceuticals',
    status: 'Violation',
    score: 42,
    ocrConfidence: 98.4,
    highlight: 'Weight shortfall: 1.84kg vs 2.0kg declared (8% deviation)',
    ruleCode: 'Legal Metrology R.6(1)(e)',
    penalty: '₹50,000 SCN',
  },
  {
    id: 'PRD-02',
    name: 'AuraSound ANC Gen 3',
    brand: 'AuraTech Global',
    platform: 'Flipkart',
    category: 'Electronics',
    status: 'Violation',
    score: 31,
    ocrConfidence: 99.2,
    highlight: 'Origin Obfuscation: Declared India, Barcode confirms PRC',
    ruleCode: 'CCPA E-Com Rule 5(3)',
    penalty: '₹1,00,000 SCN',
  },
  {
    id: 'PRD-03',
    name: 'FarmPure Mustard Oil 1L',
    brand: 'FarmPure Organics',
    platform: 'Blinkit',
    category: 'FMCG Groceries',
    status: 'Compliant',
    score: 96,
    ocrConfidence: 99.8,
    highlight: 'All 7 mandatory declarations verified & compliant',
    ruleCode: 'Legal Metrology Compliant',
    penalty: 'Clean Record',
  },
  {
    id: 'PRD-04',
    name: '24K Saffron Night Serum',
    brand: 'VedaHerbals Luxe',
    platform: 'Zepto',
    category: 'Cosmetics',
    status: 'Warning',
    score: 58,
    ocrConfidence: 94.6,
    highlight: 'Prohibited claim: "Permanent wrinkle removal in 7 days"',
    ruleCode: 'Drugs & Magic Remedies Sec 3',
    penalty: 'Flagged for Review',
  },
];

export const LiveComplianceWidget: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % STREAM_DATA.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeItem = STREAM_DATA[currentIndex];

  return (
    <div className="relative rounded-2xl border border-slate-700/80 bg-[#0F172A] text-slate-100 shadow-2xl overflow-hidden">
      {/* Top OS-style Bar */}
      <div className="px-4 py-3 bg-[#1E293B] border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-300 ml-2 font-medium">
            satya-engine://live-inspector
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE OCR STREAM
          </span>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="p-5">
        {/* Scanner Metric Header */}
        <div className="grid grid-cols-3 gap-3 mb-4 font-mono text-xs">
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">SCAN INGESTION</span>
            <span className="text-slate-200 font-semibold text-sm">482 SKU/min</span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">OCR CONFIDENCE</span>
            <span className="text-blue-400 font-semibold text-sm">99.1% High Res</span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">AUTO-SCN DISPATCH</span>
            <span className="text-emerald-400 font-semibold text-sm">Active (Sec 36)</span>
          </div>
        </div>

        {/* Live Active Inspection Card with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 relative overflow-hidden"
          >
            {/* Ambient Scan line animation */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">{activeItem.platform}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{activeItem.category}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{activeItem.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Brand: {activeItem.brand}</p>
              </div>

              {/* Compliance Score Pill */}
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Trust Score</div>
                <div
                  className={`text-xl font-bold font-mono ${
                    activeItem.score >= 80
                      ? 'text-emerald-400'
                      : activeItem.score >= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {activeItem.score}/100
                </div>
              </div>
            </div>

            {/* Finding Highlight */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-start gap-2.5">
                {activeItem.status === 'Violation' ? (
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                ) : activeItem.status === 'Warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="text-slate-300 font-medium">{activeItem.highlight}</span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {activeItem.ruleCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        activeItem.status === 'Violation'
                          ? 'bg-red-950/80 text-red-400 border border-red-800'
                          : activeItem.status === 'Warning'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {activeItem.penalty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OCR Pipeline Status Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Scan className="h-3.5 w-3.5 text-blue-400" />
                <span>OCR Extracted: 18 Key Attributes</span>
              </div>
              <span className="text-blue-400">{activeItem.ocrConfidence}% Match</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live Crawler Ticker List */}
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Regulatory Ingestions</span>
            <span className="text-slate-500">Auto-updating</span>
          </div>
          <div className="space-y-1.5">
            {STREAM_DATA.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  idx === currentIndex
                    ? 'bg-blue-950/60 border border-blue-800/80 text-white'
                    : 'bg-slate-900/50 border border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-slate-500">#{item.id}</span>
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={item.status === 'Violation' ? 'danger' : item.status === 'Warning' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
