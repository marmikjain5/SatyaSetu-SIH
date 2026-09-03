import React from 'react';
import {
  Scan,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import loopVideo from '../ui/loop.mp4';

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
        <div className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-300 shrink-0">
          <Scan className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="absolute text-[8px] font-black tracking-tighter text-blue-700 dark:text-blue-300 font-mono">
            AI
          </span>
        </div>
      ),
    },
    {
      id: 2,
      title: 'RULE VALIDATION',
      description:
        'Extracted data is validated against Legal Metrology Rules, 2011 to detect violations, warnings and missing declarations.',
      icon: (
        <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-300 shrink-0">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      ),
    },
    {
      id: 3,
      title: 'READABILITY ANALYSIS',
      description:
        'Checks font size, visibility and clarity to ensure labels are readable, transparent and consumer friendly.',
      icon: (
        <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-300 shrink-0">
          <span className="text-lg font-bold font-serif text-blue-600 dark:text-blue-400 tracking-tight">
            Aa
          </span>
        </div>
      ),
    },
    {
      id: 4,
      title: 'COMPLIANCE REPORTS',
      description:
        'Generates inspection-grade reports with evidence, recommendations and export options (PDF / DOCX).',
      icon: (
        <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-300 shrink-0">
          <div className="relative">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[7px] font-extrabold px-0.5 rounded shadow-xs">
              PDF
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white pt-10 pb-16 lg:pt-14 lg:pb-20 scroll-mt-24 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300"
    >
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* ====== LEFT COLUMN: Looping Inspection Video (Clean, Uncut Content) ====== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient glow behind video */}
            <div className="absolute -inset-4 bg-blue-500/15 dark:bg-blue-500/20 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl overflow-hidden border border-slate-300/80 dark:border-slate-700/70 shadow-2xl shadow-blue-900/15 dark:shadow-blue-950/40 bg-slate-950 aspect-[16/10]">
              <video
                src={loopVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-[112%] h-[112%] max-w-none object-cover -mt-[1%] -ml-[1%]"
              />

              {/* Seamless dark corner overlay completely concealing the corner watermark */}
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-slate-950 pointer-events-none z-20 rounded-br-2xl" />
            </div>
          </motion.div>

          {/* ====== RIGHT COLUMN: SATYADRISHTI & 4 Cards ====== */}
          <div className="lg:col-span-7 space-y-5 text-left relative">
            {/* --- Spotlight Beam Positioned Directly Over SATYADRISHTI --- */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-0">
              <div className="h-1.5 w-44 sm:w-64 bg-slate-900/80 dark:bg-white rounded-full shadow-[0_0_35px_10px_rgba(37,99,235,0.4)] dark:shadow-[0_0_45px_14px_rgba(255,255,255,0.9),0_0_90px_28px_rgba(37,99,235,0.45)] z-10" />
              <div
                className="w-[320px] sm:w-[500px] h-[300px] sm:h-[400px] opacity-35 dark:opacity-45 mix-blend-multiply dark:mix-blend-screen"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(37,99,235,0.4) 0%, rgba(59,130,246,0.18) 40%, rgba(0,0,0,0) 80%)',
                }}
              />
            </div>

            {/* Main Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-[0.2em] sm:tracking-[0.25em] uppercase drop-shadow-[0_0_25px_rgba(37,99,235,0.15)] dark:drop-shadow-[0_0_35px_rgba(59,130,246,0.3)] leading-tight relative z-10"
            >
              SATYADRISHTI
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 tracking-wide relative z-10"
            >
              AI-Powered Legal Metrology Compliance Platform
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-normal relative z-10"
            >
              SatyaDrishti is an intelligent compliance assistant that helps enforcement
              officials, businesses and consumers ensure transparency, accuracy and trust
              in every product.
            </motion.p>

            {/* 4 Feature Cards (2x2 Grid) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 relative z-10"
            >
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="group relative rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 p-4 flex flex-col items-start text-left shadow-xs hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-card transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {feature.icon}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase">
                        {feature.title}
                      </h3>
                      <div className="w-8 h-[2px] bg-blue-600 dark:bg-blue-500 mt-1 rounded-full group-hover:w-12 transition-all duration-300" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Bottom Tagline & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="pt-2 space-y-3 relative z-10"
            >
              <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase font-mono">
                <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-blue-500/80" />
                <span>Transparency. Compliance. Trust.</span>
                <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-blue-500/80" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Building a fairer marketplace for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
