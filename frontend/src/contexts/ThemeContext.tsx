"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    resolvedTheme: ResolvedTheme;
    setThemeMode: (mode: ThemeMode) => void;
    isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'athlon-theme-mode';

// Get system preference
const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
};

// Resolve theme based on mode
const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
    if (mode === 'system') {
        return getSystemTheme();
    }
    return mode;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
            if (saved && ['system', 'light', 'dark'].includes(saved)) {
                return saved;
            }
        }
        // Default to dark mode
        return 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
            if (saved && ['system', 'light', 'dark'].includes(saved)) {
                return resolveTheme(saved);
            }
        }
        return 'dark';
    });

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(`theme-${resolvedTheme}`);
        root.setAttribute('data-theme', resolvedTheme);

        // Also apply to body for compatibility
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(resolvedTheme === 'light' ? 'light-mode' : 'dark-mode');
    }, [resolvedTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (themeMode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = () => {
            setResolvedTheme(getSystemTheme());
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themeMode]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        setResolvedTheme(resolveTheme(mode));
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    };

    return (
        <ThemeContext.Provider value={{
            themeMode,
            resolvedTheme,
            setThemeMode,
            isDarkMode: resolvedTheme === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
