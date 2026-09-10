import React, { useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../store/themeStore';

export interface AnimatedThemeTogglerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  showLabel?: boolean;
}

export function AnimatedThemeToggler({
  className,
  showLabel = false,
  ...props
}: AnimatedThemeTogglerProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (!clientX && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    toggleTheme({ clientX, clientY });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 rounded-xl p-2 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer select-none',
        'border border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 backdrop-blur-md',
        'dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      {...props}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {/* Sun Icon (Visible in Light Mode) */}
        <Sun className="h-4 w-4 rotate-0 scale-100 text-amber-500 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:rotate-45" />

        {/* Moon Icon (Visible in Dark Mode) */}
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-blue-400 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:-rotate-12" />
      </div>

      {showLabel && (
        <span className="text-[11px] font-medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default AnimatedThemeToggler;
