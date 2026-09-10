import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  FileWarning,
  IndianRupee,
  Cpu,
} from 'lucide-react';
import loopVideo from '../ui/loop.mp4';

const stats = [
  {
    value: '6903+',
    label: 'MRP Violation Cases',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20 hover:border-red-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
  {
    value: '948+',
    label: 'Notices Issued',
    icon: FileWarning,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20 hover:border-amber-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  {
    value: '₹1.03 Cr',
    label: 'Recovered Through Enforcement',
    icon: IndianRupee,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  {
    value: '24/7',
    label: 'AI Compliance Monitoring',
    icon: Cpu,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    glowColor: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const ComplianceChallengeSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#020617] text-white py-20 lg:py-28 border-y border-slate-800/60"
    >
      {/* --- Overhead Spotlight --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0">
        <div
          className="w-[500px] sm:w-[700px] h-[400px] sm:h-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(59,130,246,0.35) 0%, rgba(37,99,235,0.12) 40%, transparent 80%)',
          }}
        />
      </div>

      {/* --- Subtle Dot Grid --- */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ====== LEFT: Video ====== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            {/* Ambient glow behind video */}
            <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-blue-900/20 aspect-[4/3] lg:aspect-[16/11]">
              <video
                src={loopVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover scale-[1.10] transform origin-center"
              />

              {/* Subtle overlay gradient at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#020617]/90 via-[#020617]/30 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* ====== RIGHT: Content ====== */}
          <div className="space-y-8">
            {/* Pre-label */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0}
            >
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.3em] text-blue-400 uppercase font-mono bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-full">
                The Compliance Challenge
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={1}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-[1.15] tracking-tight">
                Millions of Products.{' '}
                <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400">
                  Thousands of Violations.
                </span>{' '}
                <br />
                One Mission.
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={2}
              className="text-sm sm:text-[15px] text-slate-400 leading-relaxed max-w-xl"
            >
              Every year thousands of packaged commodity violations are reported across India. 
              Missing declarations, incorrect MRP information, misleading labels, and compliance 
              failures continue to impact consumers and challenge enforcement agencies.
            </motion.p>

            {/* Stats 2x2 Grid */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={3}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`relative group rounded-xl border ${stat.borderColor} bg-slate-900/60 backdrop-blur-sm p-4 sm:p-5 transition-all duration-300 ${stat.glowColor} cursor-default`}
                  >
                    {/* Top accent line */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-400/60 to-transparent transition-all duration-500 rounded-t-xl" />

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Bottom Insight Quote */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={4}
              className="relative rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-2.5"
            >
              {/* Left accent border */}
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-blue-500 to-blue-600/40" />

              <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed pl-4 italic">
                Manual inspection alone cannot keep pace with the growing scale of packaged 
                commodity compliance challenges.
              </p>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed pl-4 font-medium">
                SatyaDrishti combines OCR, AI, and Legal Metrology intelligence to assist 
                inspectors in identifying violations faster and more accurately.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceChallengeSection;
