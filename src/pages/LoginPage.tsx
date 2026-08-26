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
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('admin@demo.gov.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Read URL param if passed (e.g. /login?role=inspector)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'inspector') {
      setEmail('inspector@demo.gov.in');
      setPassword('inspect123');
    } else if (roleParam === 'consumer') {
      setEmail('consumer@demo.gov.in');
      setPassword('consumer123');
    } else if (roleParam === 'admin') {
      setEmail('admin@demo.gov.in');
      setPassword('admin123');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const detectRole = (emailInput: string): UserRole => {
    const lower = emailInput.toLowerCase();
    if (lower.includes('admin')) return 'admin';
    if (lower.includes('inspect')) return 'inspector';
    return 'consumer';
  };

  const currentDetectedRole = detectRole(email);

  const handleQuickFill = (role: 'admin' | 'inspector' | 'consumer') => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@demo.gov.in');
      setPassword('admin123');
    } else if (role === 'inspector') {
      setEmail('inspector@demo.gov.in');
      setPassword('inspect123');
    } else {
      setEmail('consumer@demo.gov.in');
      setPassword('consumer123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please provide a password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Mock validation
      if (email === 'admin@demo.gov.in' && password !== 'admin123') {
        setError('Invalid password for Admin. Correct demo password is: admin123');
        setIsLoading(false);
        return;
      }
      if (email === 'inspector@demo.gov.in' && password !== 'inspect123') {
        setError('Invalid password for Inspector. Correct demo password is: inspect123');
        setIsLoading(false);
        return;
      }
      if (email === 'consumer@demo.gov.in' && password !== 'consumer123') {
        setError('Invalid password for Consumer. Correct demo password is: consumer123');
        setIsLoading(false);
        return;
      }

      const role = detectRole(email);
      login(email, role);
      setIsLoading(false);
      navigate('/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-grid-pattern relative">
      {/* Back to Home Link */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
        >
          ← Return to Public Overview
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem & Branding */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-blue-500 shadow-card">
            <Shield className="h-7 w-7 text-blue-500" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Satya<span className="text-blue-600">Drishti</span> Compliance Suite
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          National Consumer Protection & Legal Metrology Intelligence Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-slate-200 space-y-6">
          {/* Quick Demo Credentials Switcher */}
          <div>
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Demo Role (1-Click Auto-Fill):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  email === 'admin@demo.gov.in'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Directorate</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('inspector')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  email === 'inspector@demo.gov.in'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Inspector</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Zonal Officer</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('consumer')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  email === 'consumer@demo.gov.in'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Consumer</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Citizen Rep</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
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
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Auto-detected role banner */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Auto-Detected Role:</span>
              <Badge
                variant={
                  currentDetectedRole === 'admin'
                    ? 'primary'
                    : currentDetectedRole === 'inspector'
                    ? 'warning'
                    : 'success'
                }
                size="sm"
                className="uppercase font-bold"
              >
                {currentDetectedRole} Access
              </Badge>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold gap-2 shadow-sm"
              isLoading={isLoading}
            >
              <span>Authenticate & Enter Platform</span>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </Button>
          </form>

          {/* Footnote */}
          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            <span>NIC / CERT-In Certified Regulatory Environment • Smart India Hackathon</span>
          </div>
        </div>
      </div>
    </div>
  );
};
