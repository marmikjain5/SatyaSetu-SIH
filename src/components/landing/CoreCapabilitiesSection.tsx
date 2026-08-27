import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const CoreCapabilitiesSection: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector<HTMLElement>('[data-carousel-card]')?.offsetWidth || 340;
    const gap = 20;
    const targetScroll = index * (cardWidth + gap);
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(capabilities.length - 1, activeIndex + 1);
    scrollToIndex(nextIdx);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector<HTMLElement>('[data-carousel-card]')?.offsetWidth || 340;
    const gap = 20;
    const newIdx = Math.round(container.scrollLeft / (cardWidth + gap));
    if (newIdx !== activeIndex && newIdx >= 0 && newIdx < capabilities.length) {
      setActiveIndex(newIdx);
    }
  };

  return (
    <section id="capabilities" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Precision Regulatory Automation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Core Capabilities
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Intelligence. Automation. Enforcement.
          </p>
        </div>

        {/* Carousel Container with Side Nav Buttons */}
        <div className="relative group px-1 sm:px-10">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous capabilities"
            className={`absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 transition-all ${
              activeIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:scale-95'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            disabled={activeIndex >= capabilities.length - 1}
            aria-label="Next capabilities"
            className={`absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 transition-all ${
              activeIndex >= capabilities.length - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:scale-95'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {capabilities.map((item) => {
              const Icon = item.icon;
              const isHovered = activeCard === item.id;
              return (
                <div
                  key={item.id}
                  data-carousel-card
                  onMouseEnter={() => setActiveCard(item.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  className={`snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[350px] bg-white rounded-2xl border p-6 transition-all duration-200 flex flex-col justify-between ${
                    isHovered
                      ? 'border-blue-500 shadow-card-hover -translate-y-1'
                      : 'border-slate-200 shadow-subtle'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-600">
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

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
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
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {capabilities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  activeIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
