/**
 * Performance Monitoring Service - Stage 5: Observability
 *
 * Tracks and reports performance metrics:
 * - Component render times
 * - API request latencies
 * - Cache hit rates
 * - Page load metrics
 */

// Metric types
interface RenderMetric {
    component: string;
    duration: number;
    timestamp: number;
}

interface ApiMetric {
    endpoint: string;
    method: string;
    duration: number;
    status: number;
    cached: boolean;
    timestamp: number;
}

interface CacheMetric {
    queryKey: string;
    hit: boolean;
    timestamp: number;
}

interface PageLoadMetric {
    page: string;
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    ttfb: number; // Time to First Byte
    timestamp: number;
}

interface PerformanceReport {
    period: { start: number; end: number };
    renders: {
        count: number;
        avgDuration: number;
        p95Duration: number;
        slowest: RenderMetric[];
    };
    api: {
        count: number;
        avgLatency: number;
        p95Latency: number;
        errorRate: number;
        cachedRate: number;
        slowest: ApiMetric[];
    };
    cache: {
        hitRate: number;
        missCount: number;
        hitCount: number;
    };
    pageLoads: {
        avgFcp: number;
        avgLcp: number;
        avgTtfb: number;
    };
}

// Performance budgets (from PLAN.md)
const BUDGETS = {
    FCP: 1000, // First Contentful Paint < 1s
    LCP: 2500, // Largest Contentful Paint < 2.5s
    TTFB: 200, // Time to First Byte < 200ms
    API_LATENCY: 200, // API calls < 200ms
    RENDER_TIME: 16, // Component render < 16ms (60fps)
    CACHE_HIT_RATE: 0.7, // 70% cache hit rate
};

class PerformanceMonitorService {
    private renderMetrics: RenderMetric[] = [];
    private apiMetrics: ApiMetric[] = [];
    private cacheMetrics: CacheMetric[] = [];
    private pageLoadMetrics: PageLoadMetric[] = [];
    private readonly maxMetrics = 1000;
    private reportInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Observe Web Vitals if available
        this.observeWebVitals();
    }

    /**
     * Start periodic performance reporting (for development)
     */
    startReporting(intervalMs = 60000): void {
        if (this.reportInterval) return;

        this.reportInterval = setInterval(() => {
            const report = this.generateReport();
            this.logReport(report);
        }, intervalMs);

        console.log('[PerfMon] Started periodic reporting');
    }

    /**
     * Stop periodic reporting
     */
    stopReporting(): void {
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
    }

    /**
     * Track a component render
     */
    trackRender(component: string, duration: number): void {
        this.renderMetrics.push({
            component,
            duration,
            timestamp: Date.now(),
        });

        // Trim old metrics
        if (this.renderMetrics.length > this.maxMetrics) {
            this.renderMetrics = this.renderMetrics.slice(-this.maxMetrics);
        }

        // Log slow renders in dev
        if (import.meta.env.DEV && duration > BUDGETS.RENDER_TIME * 2) {
            console.warn(`[PerfMon] Slow render: ${component} took ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Track an API request
     */
    trackApi(endpoint: string, method: string, duration: number, status: number, cached = false): void {
        this.apiMetrics.push({
            endpoint,
            method,
            duration,
            status,
            cached,
            timestamp: Date.now(),
        });

        // Trim old metrics
        if (this.apiMetrics.length > this.maxMetrics) {
            this.apiMetrics = this.apiMetrics.slice(-this.maxMetrics);
        }

        // Log slow requests in dev
        if (import.meta.env.DEV && duration > BUDGETS.API_LATENCY * 2) {
            console.warn(`[PerfMon] Slow API: ${method} ${endpoint} took ${duration.toFixed(0)}ms`);
        }
    }

    /**
     * Track a cache hit/miss
     */
    trackCacheAccess(queryKey: string, hit: boolean): void {
        this.cacheMetrics.push({
            queryKey,
            hit,
            timestamp: Date.now(),
        });

        // Trim old metrics
        if (this.cacheMetrics.length > this.maxMetrics) {
            this.cacheMetrics = this.cacheMetrics.slice(-this.maxMetrics);
        }
    }

    /**
     * Track page load metrics
     */
    trackPageLoad(page: string, fcp: number, lcp: number, ttfb: number): void {
        this.pageLoadMetrics.push({
            page,
            fcp,
            lcp,
            ttfb,
            timestamp: Date.now(),
        });

        // Trim old metrics
        if (this.pageLoadMetrics.length > this.maxMetrics) {
            this.pageLoadMetrics = this.pageLoadMetrics.slice(-this.maxMetrics);
        }

        // Log budget violations in dev
        if (import.meta.env.DEV) {
            if (fcp > BUDGETS.FCP) {
                console.warn(`[PerfMon] FCP budget exceeded: ${page} = ${fcp.toFixed(0)}ms (budget: ${BUDGETS.FCP}ms)`);
            }
            if (lcp > BUDGETS.LCP) {
                console.warn(`[PerfMon] LCP budget exceeded: ${page} = ${lcp.toFixed(0)}ms (budget: ${BUDGETS.LCP}ms)`);
            }
        }
    }

    /**
     * Observe Web Vitals using PerformanceObserver
     */
    private observeWebVitals(): void {
        if (typeof window === 'undefined' || !window.PerformanceObserver) {
            return;
        }

        // Observe LCP
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;
                if (lastEntry) {
                    const lcp = lastEntry.startTime;
                    // Will be combined with page tracking
                    (window as any).__lastLCP = lcp;
                }
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            // LCP not supported
        }

        // Observe FCP
        try {
            const fcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        (window as any).__lastFCP = entry.startTime;
                    }
                }
            });
            fcpObserver.observe({ type: 'paint', buffered: true });
        } catch (e) {
            // FCP not supported
        }
    }

    /**
     * Generate a performance report
     */
    generateReport(periodMinutes = 5): PerformanceReport {
        const now = Date.now();
        const periodStart = now - periodMinutes * 60 * 1000;

        // Filter to period
        const recentRenders = this.renderMetrics.filter(m => m.timestamp >= periodStart);
        const recentApi = this.apiMetrics.filter(m => m.timestamp >= periodStart);
        const recentCache = this.cacheMetrics.filter(m => m.timestamp >= periodStart);
        const recentPageLoads = this.pageLoadMetrics.filter(m => m.timestamp >= periodStart);

        // Calculate render stats
        const renderDurations = recentRenders.map(r => r.duration).sort((a, b) => a - b);
        const p95Index = Math.floor(renderDurations.length * 0.95);

        // Calculate API stats
        const apiDurations = recentApi.map(a => a.duration).sort((a, b) => a - b);
        const apiP95Index = Math.floor(apiDurations.length * 0.95);
        const errors = recentApi.filter(a => a.status >= 400).length;
        const cached = recentApi.filter(a => a.cached).length;

        // Calculate cache stats
        const hits = recentCache.filter(c => c.hit).length;

        // Calculate page load stats
        const avgFcp = recentPageLoads.length > 0
            ? recentPageLoads.reduce((sum, p) => sum + p.fcp, 0) / recentPageLoads.length
            : 0;
        const avgLcp = recentPageLoads.length > 0
            ? recentPageLoads.reduce((sum, p) => sum + p.lcp, 0) / recentPageLoads.length
            : 0;
        const avgTtfb = recentPageLoads.length > 0
            ? recentPageLoads.reduce((sum, p) => sum + p.ttfb, 0) / recentPageLoads.length
            : 0;

        return {
            period: { start: periodStart, end: now },
            renders: {
                count: recentRenders.length,
                avgDuration: renderDurations.length > 0
                    ? renderDurations.reduce((a, b) => a + b, 0) / renderDurations.length
                    : 0,
                p95Duration: renderDurations[p95Index] || 0,
                slowest: [...recentRenders].sort((a, b) => b.duration - a.duration).slice(0, 5),
            },
            api: {
                count: recentApi.length,
                avgLatency: apiDurations.length > 0
                    ? apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length
                    : 0,
                p95Latency: apiDurations[apiP95Index] || 0,
                errorRate: recentApi.length > 0 ? errors / recentApi.length : 0,
                cachedRate: recentApi.length > 0 ? cached / recentApi.length : 0,
                slowest: [...recentApi].sort((a, b) => b.duration - a.duration).slice(0, 5),
            },
            cache: {
                hitRate: recentCache.length > 0 ? hits / recentCache.length : 0,
                hitCount: hits,
                missCount: recentCache.length - hits,
            },
            pageLoads: {
                avgFcp,
                avgLcp,
                avgTtfb,
            },
        };
    }

    /**
     * Log a formatted report to console
     */
    private logReport(report: PerformanceReport): void {
        const budgetStatus = (value: number, budget: number) =>
            value <= budget ? '✅' : '⚠️';

        console.group('[PerfMon] Performance Report');
        console.log(`Period: ${new Date(report.period.start).toLocaleTimeString()} - ${new Date(report.period.end).toLocaleTimeString()}`);

        console.group('Renders');
        console.log(`Count: ${report.renders.count}`);
        console.log(`Avg: ${report.renders.avgDuration.toFixed(2)}ms ${budgetStatus(report.renders.avgDuration, BUDGETS.RENDER_TIME)}`);
        console.log(`P95: ${report.renders.p95Duration.toFixed(2)}ms`);
        if (report.renders.slowest.length > 0) {
            console.log('Slowest:', report.renders.slowest.map(r => `${r.component}: ${r.duration.toFixed(2)}ms`));
        }
        console.groupEnd();

        console.group('API');
        console.log(`Count: ${report.api.count}`);
        console.log(`Avg Latency: ${report.api.avgLatency.toFixed(0)}ms ${budgetStatus(report.api.avgLatency, BUDGETS.API_LATENCY)}`);
        console.log(`P95 Latency: ${report.api.p95Latency.toFixed(0)}ms`);
        console.log(`Error Rate: ${(report.api.errorRate * 100).toFixed(1)}%`);
        console.log(`Cached Rate: ${(report.api.cachedRate * 100).toFixed(1)}%`);
        console.groupEnd();

        console.group('Cache');
        console.log(`Hit Rate: ${(report.cache.hitRate * 100).toFixed(1)}% ${budgetStatus(1 - report.cache.hitRate, 1 - BUDGETS.CACHE_HIT_RATE)}`);
        console.log(`Hits: ${report.cache.hitCount}, Misses: ${report.cache.missCount}`);
        console.groupEnd();

        console.group('Page Loads');
        console.log(`Avg FCP: ${report.pageLoads.avgFcp.toFixed(0)}ms ${budgetStatus(report.pageLoads.avgFcp, BUDGETS.FCP)}`);
        console.log(`Avg LCP: ${report.pageLoads.avgLcp.toFixed(0)}ms ${budgetStatus(report.pageLoads.avgLcp, BUDGETS.LCP)}`);
        console.log(`Avg TTFB: ${report.pageLoads.avgTtfb.toFixed(0)}ms ${budgetStatus(report.pageLoads.avgTtfb, BUDGETS.TTFB)}`);
        console.groupEnd();

        console.groupEnd();
    }

    /**
     * Get current metrics (for external reporting)
     */
    getMetrics(): {
        renders: RenderMetric[];
        api: ApiMetric[];
        cache: CacheMetric[];
        pageLoads: PageLoadMetric[];
    } {
        return {
            renders: [...this.renderMetrics],
            api: [...this.apiMetrics],
            cache: [...this.cacheMetrics],
            pageLoads: [...this.pageLoadMetrics],
        };
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.renderMetrics = [];
        this.apiMetrics = [];
        this.cacheMetrics = [];
        this.pageLoadMetrics = [];
    }

    /**
     * Get performance budgets
     */
    getBudgets(): typeof BUDGETS {
        return { ...BUDGETS };
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService();

// Start reporting in development
if (import.meta.env.DEV) {
    performanceMonitor.startReporting(60000); // Report every minute
}

export default performanceMonitor;
