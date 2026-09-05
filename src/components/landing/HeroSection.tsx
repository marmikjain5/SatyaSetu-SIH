import React from 'react';
import { motion } from 'framer-motion';
import loopVideo from '../ui/loop.mp4';


export const HeroSection: React.FC = () => {
  const highlights = [
    {
      title: 'Precision OCR & Vision',
      desc: 'Instantly reads micro-print, multilingual text, and statutory declarations from any packaging angle.',
    },
    {
      title: 'Automated Rule Validation',
      desc: 'Cross-checks declarations in real-time against the Legal Metrology (Packaged Commodities) Rules, 2011.',
    },
    {
      title: 'Inspection-Ready Intelligence',
      desc: 'Generates evidentiary audit trails, penalty estimations, and exportable regulatory dossiers.',
    },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-white pt-10 pb-16 lg:pt-14 lg:pb-24 scroll-mt-24 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300"
    >
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* ====== LEFT COLUMN: Looping Inspection Video ====== */}
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

              {/* Subtle dark overlay for contrast */}
              <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />

              {/* Seamless dark corner overlay completely concealing the corner watermark */}
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-slate-950 pointer-events-none z-20 rounded-br-2xl" />
            </div>
          </motion.div>

          {/* ====== RIGHT COLUMN: Attractive Typographic Product Story ====== */}
          <div className="lg:col-span-7 space-y-6 text-left relative">
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative z-10"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-[0.2em] sm:tracking-[0.25em] uppercase drop-shadow-[0_0_25px_rgba(37,99,235,0.15)] dark:drop-shadow-[0_0_35px_rgba(59,130,246,0.3)] leading-tight">
                SATYADRISHTI
              </h1>

              <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 tracking-wide mt-1.5">
                AI-Powered Legal Metrology Compliance Platform
              </p>
            </motion.div>

            {/* Hero Hook / Narrative (Attractive & Clean Typography) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-3 relative z-10"
            >
              <p className="text-lg sm:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300 leading-snug">
                Autonomous Intelligence for Statutory Packaging Verification.
              </p>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                SatyaDrishti bridges cutting-edge optical recognition with statutory Indian consumer laws.
                By converting physical label images into structured, verifiable intelligence, it empowers
                inspectors, brands, and citizens to uncover violations with unparalleled accuracy and speed.
              </p>
            </motion.div>

            {/* Typographic Highlights (No Cards, Pure Elegant Flow) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3 pt-2 relative z-10"
            >
              {highlights.map((item, idx) => (
                <div key={idx} className="text-left space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Mission Quote & Bottom Motto */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-3 space-y-3 relative z-10 border-t border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase font-mono">
                <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-blue-500/80" />
                <span>Transparency. Compliance. Trust.</span>
                <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-blue-500/80" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Building a fairer, compliant marketplace for 1.4 billion consumers.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
