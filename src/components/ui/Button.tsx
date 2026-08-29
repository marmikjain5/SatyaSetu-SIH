import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // 3D tactile pressable base styles inspired by box-button design
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold select-none cursor-pointer ' +
      'transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ' +
      'rounded-xl border border-b-[3.5px] active:border-b-[1px] active:translate-y-[2.5px] ' +
      'disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0 disabled:active:border-b-[3.5px]';

    const variants = {
      primary:
        'bg-blue-600 text-white border-blue-500 border-b-blue-800 hover:bg-blue-500 shadow-sm shadow-blue-900/10 ' +
        'dark:bg-blue-600 dark:text-white dark:border-blue-500 dark:border-b-blue-900 dark:hover:bg-blue-500 ' +
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',

      secondary:
        'bg-slate-100 text-slate-800 border-slate-200 border-b-slate-300 hover:bg-slate-200 ' +
        'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:border-b-slate-900 dark:hover:bg-slate-700 ' +
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',

      outline:
        'bg-white text-slate-800 border-slate-300 border-b-slate-400 hover:bg-slate-50 hover:border-slate-400 ' +
        'dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:border-b-slate-950 dark:hover:bg-slate-800 ' +
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',

      danger:
        'bg-red-600 text-white border-red-500 border-b-red-800 hover:bg-red-500 shadow-sm ' +
        'dark:bg-red-600 dark:text-white dark:border-red-500 dark:border-b-red-900 dark:hover:bg-red-500 ' +
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',

      success:
        'bg-emerald-600 text-white border-emerald-500 border-b-emerald-800 hover:bg-emerald-500 shadow-sm ' +
        'dark:bg-emerald-600 dark:text-white dark:border-emerald-500 dark:border-b-emerald-900 dark:hover:bg-emerald-500 ' +
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',

      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent border-b-transparent active:translate-y-[1px] ' +
        'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9.5 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-sm sm:text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-inherit">
          {isLoading && (
            <svg
              className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
