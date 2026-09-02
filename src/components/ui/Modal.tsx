import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
  theme?: 'light' | 'dark';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  className,
  theme = 'light',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'relative w-full rounded-xl overflow-hidden z-10 my-8 shadow-2xl transition-colors',
              isDark
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-900 shadow-modal',
              maxWidthClasses[maxWidth],
              className
            )}
          >
            {/* Header */}
            <div
              className={cn(
                'px-6 py-4 border-b flex items-center justify-between',
                isDark
                  ? 'border-slate-800 bg-slate-950/80'
                  : 'border-slate-200/80 bg-slate-50/50'
              )}
            >
              <div>
                <h3
                  className={cn(
                    'text-base font-bold tracking-tight',
                    isDark ? 'text-white' : 'text-slate-900 font-semibold'
                  )}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className={cn(
                  'rounded-lg p-1.5 transition-colors',
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                )}
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div
              className={cn(
                'max-h-[calc(85vh-8rem)] overflow-y-auto p-5 sm:p-6 scrollbar-thin',
                isDark ? 'bg-slate-900 text-white' : 'bg-white'
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
