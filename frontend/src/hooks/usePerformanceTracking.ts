/**
 * usePerformanceTracking Hook - Stage 5: Observability
 *
 * Hooks for tracking component performance metrics.
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../services/performanceMonitor';

/**
 * Track render time for a component
 */
export function useRenderTracking(componentName: string): void {
    const renderStart = useRef(performance.now());

    // Capture start time on each render
    renderStart.current = performance.now();

    useEffect(() => {
        // Measure time from render start to commit
        const duration = performance.now() - renderStart.current;
        performanceMonitor.trackRender(componentName, duration);
    });
}

/**
 * Track API call performance
 */
export function useApiTracking() {
    const trackApiCall = useCallback(
        async <T>(
            endpoint: string,
            method: string,
            apiFn: () => Promise<T>,
            cached = false
        ): Promise<T> => {
            const start = performance.now();
            let status = 200;

            try {
                const result = await apiFn();
                return result;
            } catch (error: any) {
                status = error?.response?.status || 500;
                throw error;
            } finally {
                const duration = performance.now() - start;
                performanceMonitor.trackApi(endpoint, method, duration, status, cached);
            }
        },
        []
    );

    return { trackApiCall };
}

/**
 * Track page load metrics
 */
export function usePageLoadTracking(pageName: string): void {
    useEffect(() => {
        // Wait for page to fully render
        const measurePageLoad = () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paint = performance.getEntriesByType('paint');

            const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
            const lcp = (window as any).__lastLCP || 0;
            const ttfb = navigation?.responseStart - navigation?.requestStart || 0;

            performanceMonitor.trackPageLoad(pageName, fcp, lcp, ttfb);
        };

        // Measure after a short delay to allow paint entries to populate
        const timeout = setTimeout(measurePageLoad, 1000);

        return () => clearTimeout(timeout);
    }, [pageName]);
}

/**
 * Get performance report
 */
export function usePerformanceReport(periodMinutes = 5) {
    return performanceMonitor.generateReport(periodMinutes);
}

/**
 * HOC for tracking component render time
 */
export function withRenderTracking<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName: string
): React.FC<P> {
    const TrackedComponent: React.FC<P> = (props) => {
        useRenderTracking(componentName);
        return <WrappedComponent {...props} />;
    };

    TrackedComponent.displayName = `withRenderTracking(${componentName})`;
    return TrackedComponent;
}

export default {
    useRenderTracking,
    useApiTracking,
    usePageLoadTracking,
    usePerformanceReport,
    withRenderTracking,
};
