import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  ShieldCheck,
  FileText,
  ArrowRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onRequestDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const features = [
    {
      id: 1,
      title: 'SMART SCANNING',
      description:
        'AI-powered OCR extracts product information, declarations and text instantly from any label or package.',
      icon: (
        <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all duration-300">
          <Scan className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          <span className="absolute text-[9px] font-black tracking-tighter text-blue-700 dark:text-blue-300 font-mono">
            AI
          </span>
        </div>
      ),
      tag: 'OCR Engine',
    },
    {
      id: 2,
      title: 'RULE VALIDATION',
      description:
        'Extracted data is validated against Legal Metrology Rules, 2011 to detect violations, warnings and missing declarations.',
      icon: (
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all duration-300">
          <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      ),
      tag: 'Rule 6(1) Metrology',
    },
    {
      id: 3,
      title: 'READABILITY ANALYSIS',
      description:
        'Checks font size, visibility and clarity to ensure labels are readable, transparent and consumer friendly.',
      icon: (
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all duration-300">
          <span className="text-2xl font-bold font-serif text-blue-600 dark:text-blue-400 tracking-tight">
            Aa
          </span>
        </div>
      ),
      tag: 'Clarity & Fonts',
    },
    {
      id: 4,
      title: 'COMPLIANCE REPORTS',
      description:
        'Generates inspection-grade reports with evidence, recommendations and export options (PDF / DOCX).',
      icon: (
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all duration-300">
          <div className="relative">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[8px] font-extrabold px-1 rounded shadow-xs">
              PDF
            </span>
          </div>
        </div>
      ),
      tag: 'Legal Evidence',
    },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white pt-14 pb-24 scroll-mt-24 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 selection:bg-blue-500/20"
    >
      {/* --- Overhead Dramatic Spotlight Effect (Dual Mode Adaptive) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl pointer-events-none flex flex-col items-center z-0">
        {/* The physical light source capsule */}
        <div className="h-1.5 w-44 sm:w-64 bg-slate-900/80 dark:bg-white rounded-full shadow-[0_0_30px_8px_rgba(37,99,235,0.35)] dark:shadow-[0_0_40px_12px_rgba(255,255,255,0.8),0_0_80px_25px_rgba(37,99,235,0.4)] z-10" />

        {/* Downward Conic / Radial Spotlight Beam */}
        <div
          className="w-[340px] sm:w-[580px] md:w-[750px] h-[340px] sm:h-[460px] opacity-30 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen transition-opacity"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(37,99,235,0.35) 0%, rgba(59,130,246,0.15) 35%, rgba(0,0,0,0) 80%)',
          }}
        />
      </div>

      {/* Background Subtle Ambient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* --- Header & Title Hierarchy --- */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-6">
          {/* Pre-title Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <span className="text-xs sm:text-[13px] font-semibold tracking-[0.25em] text-blue-700 dark:text-blue-400 uppercase font-mono bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-4 py-1.5 rounded-full shadow-xs">
              About Our Prototype
            </span>
          </motion.div>

          {/* Main Brand Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-[0.2em] sm:tracking-[0.28em] uppercase drop-shadow-[0_0_25px_rgba(37,99,235,0.15)] dark:drop-shadow-[0_0_35px_rgba(59,130,246,0.3)]"
          >
            SATYADRISHTI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 tracking-wide"
          >
            AI-Powered Legal Metrology Compliance Platform
          </motion.p>

          {/* Mission Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto pt-1 font-normal"
          >
            SatyaDrishti is an intelligent compliance assistant that helps enforcement
            officials, businesses and consumers ensure transparency, accuracy and trust
            in every product.
          </motion.p>
        </div>

        {/* --- 4 Pillar Feature Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-16 pb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 * idx }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 p-7 flex flex-col items-center text-center shadow-subtle dark:shadow-card hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-card-hover dark:hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.2)] transition-all duration-300"
            >
              {/* Subtle top card glow accent on hover */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-500 to-transparent transition-all duration-500 rounded-t-2xl" />

              {/* Icon */}
              <div className="mb-6 flex justify-center">{feature.icon}</div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase">
                {feature.title}
              </h3>

              {/* Theme Blue Divider Line */}
              <div className="w-12 h-[2px] bg-blue-600 dark:bg-blue-500 my-3 rounded-full group-hover:w-16 transition-all duration-300" />

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* --- Bottom Mission Banner --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center pt-4 space-y-2"
        >
          <div className="flex items-center justify-center gap-4 text-xs font-bold tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase font-mono">
            <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-blue-500/80" />
            <span>Transparency. Compliance. Trust.</span>
            <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-blue-500/80" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal tracking-wide">
            Building a fairer marketplace for everyone.
          </p>

          {/* Quick CTA Actions */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md hover:shadow-blue-500/25 transition-all"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Explore Public Product Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              to="/about#capabilities"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition-all"
            >
              <span>Explore Core Capabilities</span>
              <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
