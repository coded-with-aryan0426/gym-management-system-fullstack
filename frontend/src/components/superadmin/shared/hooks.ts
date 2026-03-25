/**
 * Custom hooks for SuperAdmin components
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// useResponsive - Detect screen size and breakpoints
// ============================================================================

export interface BreakpointState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeDesktop: boolean;
    width: number;
}

export const useResponsive = (): BreakpointState => {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return useMemo(() => ({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLargeDesktop: width >= 1440,
        width
    }), [width]);
};

// ============================================================================
// useDebounce - Debounce value changes
// ============================================================================

export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ============================================================================
// useLocalStorage - Persist state in localStorage
// ============================================================================

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T) => {
        try {
            setStoredValue(value);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}

// ============================================================================
// useToggle - Simple boolean toggle hook
// ============================================================================

export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue(v => !v), []);
    return [value, toggle, setValue];
}

// ============================================================================
// usePrevious - Get previous value of a state
// ============================================================================

export function usePrevious<T>(value: T): T | undefined {
    const [current, setCurrent] = useState<T>(value);
    const [previous, setPrevious] = useState<T | undefined>(undefined);

    useEffect(() => {
        if (value !== current) {
            setPrevious(current);
            setCurrent(value);
        }
    }, [value, current]);

    return previous;
}

// ============================================================================
// useAsync - Handle async operations with loading/error states
// ============================================================================

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const data = await asyncFunction();
            setState({ data, loading: false, error: null });
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error });
        }
    }, [asyncFunction]);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { ...state, execute, reset };
}

// ============================================================================
// useClickOutside - Detect clicks outside an element
// ============================================================================

export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: () => void
): React.RefObject<T> {
    const ref = React.useRef<T>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [callback]);

    return ref;
}

// ============================================================================
// useKeyPress - Detect key press events
// ============================================================================

export function useKeyPress(targetKey: string, callback: () => void): void {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                callback();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [targetKey, callback]);
}

// ============================================================================
// useTheme - Get current theme (dark/light)
// ============================================================================

export type Theme = 'dark' | 'light' | 'superadmin';

export function useTheme(): Theme {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof document !== 'undefined') {
            const attr = document.documentElement.getAttribute('data-theme');
            if (attr === 'superadmin') return 'superadmin';
            return document.documentElement.classList.contains('theme-light') ? 'light' : 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const attr = document.documentElement.getAttribute('data-theme');
            if (attr === 'superadmin') {
                setTheme('superadmin');
            } else {
                setTheme(document.documentElement.classList.contains('theme-light') ? 'light' : 'dark');
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });

        return () => observer.disconnect();
    }, []);

    return theme;
}

// ============================================================================
// useChartResize - Handle chart responsiveness
// ============================================================================

export function useChartResize(containerRef: React.RefObject<HTMLElement>) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [containerRef]);

    return dimensions;
}
