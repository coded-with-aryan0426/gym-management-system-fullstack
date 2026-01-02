import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';
export type ThemeMode = 'system' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  resolvedTheme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeMode: 'dark',
  resolvedTheme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-theme-mode') as ThemeMode | null;
      if (stored) return stored;
    }
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    if (themeMode === 'system') {
      return getSystemTheme();
    }
    return themeMode as Theme;
  });

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setThemeModeState(newMode);
    localStorage.setItem('app-theme-mode', newMode);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeMode(newTheme);
  }, [setThemeMode]);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
  }, [resolvedTheme, setThemeMode]);

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (themeMode === 'system') {
        setResolvedTheme(getSystemTheme());
      } else {
        setResolvedTheme(themeMode as Theme);
      }
    };

    updateResolvedTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${resolvedTheme}`);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ 
      theme: resolvedTheme, 
      themeMode, 
      resolvedTheme, 
      toggleTheme, 
      setTheme, 
      setThemeMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
