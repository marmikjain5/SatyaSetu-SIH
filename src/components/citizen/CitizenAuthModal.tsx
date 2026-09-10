import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import {
  UserCheck,
  Shield,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  Wallet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CitizenAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const CitizenAuthModal: React.FC<CitizenAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Citizen Verification Required to Lodge Grievance',
  subtitle = 'To prevent spam and ensure official CCPA processing, please verify your citizen identity.',
}) => {
  const { login } = useAuthStore();
  const [method, setMethod] = useState<'quick' | 'otp'>('quick');
  const [mobileOrEmail, setMobileOrEmail] = useState('citizen.consumer@gmail.com');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleQuickLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      login('consumer@demo.gov.in', 'consumer');
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 400);
  };

  const handleOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpSent) {
      if (!mobileOrEmail.trim()) {
        setError('Please enter a valid Mobile Number or Email.');
        return;
      }
      setOtpSent(true);
      return;
    }

    if (otp !== '123456' && otp.length < 4) {
      setError('Please enter a valid 6-digit OTP (Demo OTP is 123456).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login(mobileOrEmail.includes('@') ? mobileOrEmail : `${mobileOrEmail}@citizen.in`, 'consumer');
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 450);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="md"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMethod('quick');
              setError('');
            }}
            className={`py-2 px-3 rounded-lg font-semibold transition-all ${
              method === 'quick'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1-Click Demo Citizen
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod('otp');
              setError('');
            }}
            className={`py-2 px-3 rounded-lg font-semibold transition-all ${
              method === 'otp'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mobile / Email OTP
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Quick Demo Flow */}
        {method === 'quick' && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Verified Citizen Account</div>
                <p className="text-[11px] text-slate-500">
                  Instant demo session as Ananya Verma (Citizen Vigilance Rep)
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleQuickLogin}
              isLoading={isSubmitting}
              className="w-full gap-2 justify-center shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span>Continue as Verified Citizen</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Mobile / OTP Flow */}
        {method === 'otp' && (
          <form onSubmit={handleOtpLogin} className="space-y-3.5">
            <div>
              <Input
                label="Mobile Number or Email"
                placeholder="Enter 10-digit mobile or email..."
                value={mobileOrEmail}
                onChange={(e) => setMobileOrEmail(e.target.value)}
                icon={<Phone className="h-4 w-4" />}
                required
              />
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit OTP (Demo: 123456)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-center font-mono text-base tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[10px] text-emerald-600 mt-1 block">
                  ✓ Mock OTP dispatched to {mobileOrEmail}
                </span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full gap-2 justify-center"
            >
              <span>{otpSent ? 'Verify OTP & Proceed to Grievance' : 'Send One-Time Password'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
          Protected under National Consumer Helpline (NCH 1915) Data Privacy Standards
        </div>
      </div>
    </Modal>
  );
};
