import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { preferences } from '../services/preferences';
import { auth } from '../services/auth';
import type { Theme } from '../types/theme';

export type { Theme };

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getOsTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getOsTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadThemeFromDb() {
      const session = auth.getSession();
      if (!session?.authenticated) return;

      const dbTheme = await preferences.getTheme();
      if (!cancelled && dbTheme) {
        setThemeState(dbTheme);
      }
    }

    loadThemeFromDb();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (auth.getSession()?.authenticated) {
      preferences.setTheme(t).catch(() => {});
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'light',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
}
