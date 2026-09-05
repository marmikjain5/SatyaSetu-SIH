import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Activity, Terminal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AnimatedThemeToggler } from '../ui/AnimatedThemeToggler';
import { useAuthStore } from '../../store/authStore';

interface LandingNavbarProps {
  onRequestDemo: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onRequestDemo }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const isDirectoryActive = location.pathname === '/directory';
  const isAboutActive = (location.pathname === '/' || location.pathname === '/about') && (!location.hash || location.hash === '#about');
  const isCapabilitiesActive = location.hash === '#capabilities';
  const isWorkflowActive = location.hash === '#workflow';

  const handleNavClick = (targetId: string) => {
    if (location.pathname === '/' || location.pathname === '/about') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-lg bg-[#0F172A] border border-slate-800 flex items-center justify-center text-blue-500 shadow-sm group-hover:border-blue-600 transition-colors">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                Satya<span className="text-blue-600">Drishti</span>
              </span>
              <Badge variant="primary" size="sm" className="hidden sm:inline-flex text-[10px]">
                GOV-INTEL
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold -mt-0.5">
              Consumer Protection & Compliance
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 text-sm font-medium">
          <Link
            to="/#about"
            onClick={() => handleNavClick('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAboutActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            About Platform
          </Link>

          <Link
            to="/directory"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isDirectoryActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Product Directory</span>
          </Link>

          <Link
            to="/#capabilities"
            onClick={() => handleNavClick('capabilities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isCapabilitiesActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Core Capabilities
          </Link>

          <Link
            to="/#workflow"
            onClick={() => handleNavClick('workflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isWorkflowActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Enforcement Flow
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <Link to="/directory" className="sm:hidden">
            <Button variant="outline" size="sm" className="text-xs">
              Directory
            </Button>
          </Link>

          <AnimatedThemeToggler />

          <Button variant="outline" size="sm" onClick={onRequestDemo} className="hidden sm:inline-flex gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            <span>Request Demo</span>
          </Button>

          {isAuthenticated && user ? (
            <Link to={user.role === 'consumer' ? '/dashboard/complaints' : '/dashboard'}>
              <Button
                variant="primary"
                size="sm"
                className={`gap-2 ${user.role === 'consumer' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white' : ''}`}
              >
                <span>{user.role === 'consumer' ? 'Consumer Grievances' : `Dashboard (${user.role})`}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm" className="gap-2 text-xs font-semibold">
                <Terminal className="h-3.5 w-3.5 text-blue-300" />
                <span>Portal Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
