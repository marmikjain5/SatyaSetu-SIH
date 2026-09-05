import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Scale,
  UserCheck,
  Factory,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuthStore, DEMO_PORTAL_CONFIGS } from '../store/authStore';
import { UserRole } from '../types/auth';
import { GridPattern } from '../components/ui/GridPattern';
import { AnimatedThemeToggler } from '../components/ui/AnimatedThemeToggler';
import { cn } from '../lib/utils';

type PortalTab = 'consumer' | 'inspector' | 'manufacturer' | 'admin';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuthStore();

  const [activePortal, setActivePortal] = useState<PortalTab>('consumer');
  const [email, setEmail] = useState(DEMO_PORTAL_CONFIGS.consumer.demoEmail);
  const [password, setPassword] = useState(DEMO_PORTAL_CONFIGS.consumer.demoPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize portal from query param (e.g. /login?portal=consumer or ?role=inspector)
  useEffect(() => {
    const portalParam = searchParams.get('portal') || searchParams.get('role');
    if (portalParam && ['consumer', 'inspector', 'manufacturer', 'admin'].includes(portalParam)) {
      handlePortalChange(portalParam as PortalTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'consumer') {
        navigate('/dashboard/complaints');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handlePortalChange = (portalId: PortalTab) => {
    setActivePortal(portalId);
    setError('');
    const config = DEMO_PORTAL_CONFIGS[portalId];
    setEmail(config.demoEmail);
    setPassword(config.demoPassword);
  };

  const detectRole = (emailInput: string): UserRole => {
    const lower = emailInput.toLowerCase();
    if (lower.includes('admin')) return 'admin';
    if (lower.includes('inspect')) return 'inspector';
    if (lower.includes('manuf') || lower.includes('mfg')) return 'manufacturer';
    return 'consumer';
  };

  const handleSubmit = (e?: React.FormEvent, directRole?: PortalTab) => {
    if (e) e.preventDefault();
    setError('');

    const targetPortal = directRole || activePortal;
    const targetEmail = directRole ? DEMO_PORTAL_CONFIGS[directRole].demoEmail : email;
    const targetPassword = directRole ? DEMO_PORTAL_CONFIGS[directRole].demoPassword : password;

    if (!targetEmail.trim()) {
      setError('Please provide an email address.');
      return;
    }
    if (!targetPassword.trim()) {
      setError('Please provide a password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Mock validation against demo credentials
      if (targetEmail === 'admin@demo.gov.in' && targetPassword !== 'admin123') {
        setError('Invalid password for Admin. Correct demo password is: admin123');
        setIsLoading(false);
        return;
      }
      if (targetEmail === 'inspector@demo.gov.in' && targetPassword !== 'inspect123') {
        setError('Invalid password for Inspector. Correct demo password is: inspect123');
        setIsLoading(false);
        return;
      }
      if (targetEmail === 'manufacturer@demo.gov.in' && targetPassword !== 'manuf123') {
        setError('Invalid password for Manufacturer. Correct demo password is: manuf123');
        setIsLoading(false);
        return;
      }
      if (targetEmail === 'consumer@demo.gov.in' && targetPassword !== 'consumer123') {
        setError('Invalid password for Consumer. Correct demo password is: consumer123');
        setIsLoading(false);
        return;
      }

      const role = detectRole(targetEmail);
      login(targetEmail, role);
      setIsLoading(false);

      // Dedicated redirection: Consumers only go to Complaints Portal
      if (role === 'consumer') {
        navigate('/dashboard/complaints');
      } else {
        navigate('/dashboard');
      }
    }, 400);
  };

  const currentConfig = DEMO_PORTAL_CONFIGS[activePortal];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Texture Pattern */}
      <GridPattern
        width={40}
        height={40}
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [3, 8],
          [18, 6],
          [22, 12],
          [2, 16],
        ]}
        className={cn(
          "[mask-image:radial-gradient(750px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-20%] h-[180%] skew-y-12 fill-blue-600/[0.05] stroke-slate-900/[0.05] dark:fill-blue-500/[0.08] dark:stroke-white/[0.05]"
        )}
      />

      {/* Navigation Header */}
      <div className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
          >
            ← Public Home
          </Link>
          <Link
            to="/directory"
            className="hidden sm:inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 inline-flex items-center gap-1.5 bg-blue-50/90 dark:bg-blue-950/40 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 shadow-xs transition-colors"
          >
            <span>Public Catalog (No Login)</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 pt-8 sm:pt-4">
        {/* National Emblem & Branding */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-blue-500 shadow-card">
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <h2 className="mt-3 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Satya<span className="text-blue-600 dark:text-blue-400">Drishti</span> Access Gateways
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Central Consumer Protection Authority & Legal Metrology National Verification Grid
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-3 sm:px-0 relative z-10">
        {/* 1. SEPARATED PORTAL SELECTOR TABS */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {/* Consumer Tab */}
            <button
              type="button"
              onClick={() => handlePortalChange('consumer')}
              className={cn(
                'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all text-xs font-semibold gap-1 relative',
                activePortal === 'consumer'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" />
                <span>Consumer</span>
              </div>
              <span className={cn(
                'text-[10px] font-normal leading-none',
                activePortal === 'consumer' ? 'text-emerald-100 font-medium' : 'text-slate-400'
              )}>
                Grievance Only
              </span>
            </button>

            {/* Inspector Tab */}
            <button
              type="button"
              onClick={() => handlePortalChange('inspector')}
              className={cn(
                'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all text-xs font-semibold gap-1 relative',
                activePortal === 'inspector'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Scale className="h-4 w-4" />
                <span>Inspector</span>
              </div>
              <span className={cn(
                'text-[10px] font-normal leading-none',
                activePortal === 'inspector' ? 'text-amber-100 font-medium' : 'text-slate-400'
              )}>
                Field Metrology
              </span>
            </button>

            {/* Manufacturer Tab */}
            <button
              type="button"
              onClick={() => handlePortalChange('manufacturer')}
              className={cn(
                'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all text-xs font-semibold gap-1 relative',
                activePortal === 'manufacturer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Factory className="h-4 w-4" />
                <span>Manufacturer</span>
              </div>
              <span className={cn(
                'text-[10px] font-normal leading-none',
                activePortal === 'manufacturer' ? 'text-indigo-100 font-medium' : 'text-slate-400'
              )}>
                FMCG Brands
              </span>
            </button>

            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => handlePortalChange('admin')}
              className={cn(
                'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all text-xs font-semibold gap-1 relative',
                activePortal === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>CCPA Admin</span>
              </div>
              <span className={cn(
                'text-[10px] font-normal leading-none',
                activePortal === 'admin' ? 'text-blue-100 font-medium' : 'text-slate-400'
              )}>
                Directorate
              </span>
            </button>
          </div>
        </div>

        {/* Portal Authentication Card */}
        <div className="bg-white dark:bg-slate-900 py-6 px-6 sm:px-8 shadow-card rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          {/* Active Portal Header Banner */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Active Authentication Gateway
              </span>
              <Badge variant={currentConfig.badgeVariant} size="sm" className="font-bold text-[10px] uppercase">
                {currentConfig.badgeLabel}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {activePortal === 'consumer' && <UserCheck className="h-5 w-5 text-emerald-600" />}
              {activePortal === 'inspector' && <Scale className="h-5 w-5 text-amber-600" />}
              {activePortal === 'manufacturer' && <Factory className="h-5 w-5 text-indigo-600" />}
              {activePortal === 'admin' && <Building2 className="h-5 w-5 text-blue-600" />}
              <span>{currentConfig.name}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentConfig.tagline}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
            <div>
              <Input
                label="Government / Portal Email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Access Key / Password
              </label>
              <div className="relative rounded-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Portal-Specific Features List */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Permitted Features in this Portal:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {currentConfig.allowedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={cn(
                'w-full font-semibold gap-2 shadow-sm',
                activePortal === 'consumer'
                  ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
                  : activePortal === 'inspector'
                  ? 'bg-amber-600 hover:bg-amber-700 border-amber-600'
                  : activePortal === 'manufacturer'
                  ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-600'
              )}
              isLoading={isLoading}
            >
              <span>
                {activePortal === 'consumer'
                  ? 'Enter Consumer Grievance Portal'
                  : activePortal === 'inspector'
                  ? 'Enter Inspector Enforcement Gateway'
                  : activePortal === 'manufacturer'
                  ? 'Enter Manufacturer Compliance Cell'
                  : 'Enter Central CCPA Directorate'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Footnote */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <span>NIC / CERT-In Certified Regulatory Environment</span>
            <span>•</span>
            <span>Smart India Hackathon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
