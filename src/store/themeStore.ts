import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  theme: 'dark' | 'light';
  toggleTheme: (coords?: { clientX: number; clientY: number }) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyThemeToDOM = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Initial DOM sync on script execution
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme());
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: getInitialTheme(),
  theme: getInitialTheme() ? 'dark' : 'light',

  setTheme: (theme: 'dark' | 'light') => {
    const isDark = theme === 'dark';
    applyThemeToDOM(isDark);
    set({ isDark, theme });
  },

  toggleTheme: (coords) => {
    const currentIsDark = get().isDark;
    const nextIsDark = !currentIsDark;

    const doc = typeof document !== 'undefined' ? (document as unknown as {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> };
    }) : undefined;

    const canAnimate =
      doc &&
      typeof doc.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      coords;

    if (!canAnimate || !doc?.startViewTransition) {
      applyThemeToDOM(nextIsDark);
      set({ isDark: nextIsDark, theme: nextIsDark ? 'dark' : 'light' });
      return;
    }

    const { clientX: x, clientY: y } = coords;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      applyThemeToDOM(nextIsDark);
      set({ isDark: nextIsDark, theme: nextIsDark ? 'dark' : 'light' });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: nextIsDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: nextIsDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        }
      );
    });
  },
}));
