import React from 'react';
import { Shield, Lock, FileText, Globe, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1: Platform identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Satya<span className="text-blue-500">Drishti</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              AI-Powered National Consumer Protection, Legal Metrology Enforcement, & E-Commerce Compliance Intelligence Platform. Built to uphold market integrity, detect deceptive packaging, and protect consumer rights at scale.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 font-mono">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>256-Bit Encrypted Gov Data</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                <span>CCPA & Legal Metrology Certified</span>
              </div>
            </div>
          </div>

          {/* Col 2: Regulatory Acts */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Regulatory Coverage
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors">Legal Metrology Act, 2009</li>
              <li className="hover:text-white transition-colors">Packaged Commodities Rules 2011</li>
              <li className="hover:text-white transition-colors">Consumer Protection Act, 2019</li>
              <li className="hover:text-white transition-colors">E-Commerce Rules, 2020</li>
              <li className="hover:text-white transition-colors">FSSAI Packaging Regulations 2018</li>
              <li className="hover:text-white transition-colors">Drugs & Magic Remedies Act 1954</li>
            </ul>
          </div>

          {/* Col 3: Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  OCR Label Inspector
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Marketplace Web Crawlers
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Automated SCN Notice Generator
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Manufacturer Risk Matrix
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Consumer Grievance NLP
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Authorized Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/directory" className="hover:text-white transition-colors text-blue-400">
                  Public Citizen Product Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Platform & AI Engine
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors text-blue-400">
                  Directorate General Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors text-blue-400">
                  Zonal Inspector Workstation
                </Link>
              </li>
              <li className="hover:text-white transition-colors">National Consumer Helpline (1915)</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 SatyaDrishti Compliance Intelligence System. Smart India Hackathon Enterprise Edition.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> India Data Residency
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> ISO 27001 / CERT-In Aligned
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
