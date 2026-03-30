/**
 * Prefetch Service - Stage 2 Data Loading Optimization
 * 
 * Provides intelligent prefetching for navigation:
 * - Route-based prefetch definitions
 * - Hover intent detection
 * - Priority-based loading
 * - Memory cache integration
 */

import { queryClient } from './queryClient';
import api from './api';

// Route to prefetch data mapping
interface PrefetchConfig {
    queryKey: string[];
    queryFn: () => Promise<unknown>;
    priority: 'critical' | 'high' | 'medium' | 'low';
    staleTime?: number;
}

const ROUTE_PREFETCH_MAP: Record<string, PrefetchConfig[]> = {
    '/dashboard': [
        {
            queryKey: ['members', 'stats'],
            queryFn: () => api.getMembersPaginated(0, 1),
            priority: 'critical',
            staleTime: 60 * 1000,
        },
    ],
    '/members': [
        {
            queryKey: ['members', 'list', { page: 0, size: 20 }],
            queryFn: () => api.getMembersPaginated(0, 20),
            priority: 'high',
            staleTime: 2 * 60 * 1000,
        },
    ],
    '/trainers': [
        {
            queryKey: ['trainers', 'list', { page: 0, size: 20 }],
            queryFn: () => api.getTrainersPaginated(0, 20),
            priority: 'high',
            staleTime: 2 * 60 * 1000,
        },
    ],
    '/classes': [
        {
            queryKey: ['classes', 'available'],
            queryFn: () => api.getAvailableClasses?.() ?? Promise.resolve([]),
            priority: 'medium',
            staleTime: 60 * 1000,
        },
    ],
    '/financials': [
        {
            queryKey: ['transactions', 'list'],
            queryFn: () => api.getTransactions(),
            priority: 'medium',
            staleTime: 60 * 1000,
        },
    ],
};

/**
 * Prefetch data for a specific route
 */
export async function prefetchRoute(route: string): Promise<void> {
    const configs = ROUTE_PREFETCH_MAP[route];
    if (!configs) return;

    // Sort by priority
    const sorted = [...configs].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Prefetch in priority order
    await Promise.all(
        sorted.map(config =>
            queryClient.prefetchQuery({
                queryKey: config.queryKey,
                queryFn: config.queryFn,
                staleTime: config.staleTime,
            })
        )
    );
}

/**
 * Prefetch on link hover - call this when user hovers over navigation
 */
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

export function prefetchOnHover(route: string): void {
    // Debounce to prevent excessive prefetching
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
    }

    hoverTimeout = setTimeout(() => {
        prefetchRoute(route);
    }, 100); // 100ms delay to avoid prefetching on quick mouse movements
}

export function cancelPrefetch(): void {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
}

/**
 * Prefetch adjacent pages for pagination
 */
export function prefetchAdjacentPages(
    queryKeyBase: string[],
    currentPage: number,
    size: number,
    totalPages: number,
    fetchFn: (page: number, size: number) => Promise<unknown>
): void {
    // Prefetch next page if exists
    if (currentPage < totalPages - 1) {
        const nextPage = currentPage + 1;
        queryClient.prefetchQuery({
            queryKey: [...queryKeyBase, { page: nextPage, size }],
            queryFn: () => fetchFn(nextPage, size),
            staleTime: 2 * 60 * 1000,
        });
    }

    // Prefetch previous page if exists and not in cache
    if (currentPage > 0) {
        const prevPage = currentPage - 1;
        const cached = queryClient.getQueryData([...queryKeyBase, { page: prevPage, size }]);
        if (!cached) {
            queryClient.prefetchQuery({
                queryKey: [...queryKeyBase, { page: prevPage, size }],
                queryFn: () => fetchFn(prevPage, size),
                staleTime: 2 * 60 * 1000,
            });
        }
    }
}

/**
 * Critical path data preloader
 * Call this on app startup for essential data
 */
export async function preloadCriticalData(): Promise<void> {
    // These are loaded in parallel for fastest startup
    const criticalQueries = [
        // Feature flags - needed for conditional rendering
        {
            queryKey: ['features'],
            queryFn: () => api.getFeatureFlags?.() ?? Promise.resolve({}),
            staleTime: 5 * 60 * 1000,
        },
    ];

    await Promise.all(
        criticalQueries.map(config =>
            queryClient.prefetchQuery(config)
        )
    );
}

/**
 * Memory cache for hot data (beyond React Query)
 * Use for data accessed multiple times per second
 */
class HotCache {
    private cache = new Map<string, { data: unknown; timestamp: number }>();
    private readonly TTL = 30 * 1000; // 30 seconds

    get<T>(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Check TTL
        if (Date.now() - entry.timestamp > this.TTL) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T): void {
        this.cache.set(key, { data, timestamp: Date.now() });

        // Prevent memory leak - limit cache size
        if (this.cache.size > 100) {
            const oldest = this.cache.keys().next().value;
            if (oldest) this.cache.delete(oldest);
        }
    }

    invalidate(keyPattern?: string): void {
        if (!keyPattern) {
            this.cache.clear();
            return;
        }

        for (const key of this.cache.keys()) {
            if (key.includes(keyPattern)) {
                this.cache.delete(key);
            }
        }
    }
}

export const hotCache = new HotCache();

/**
 * Request deduplication manager
 * Prevents duplicate in-flight requests
 */
class RequestDeduplicator {
    private pending = new Map<string, Promise<unknown>>();

    async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
        // If request is already in flight, return existing promise
        const existing = this.pending.get(key);
        if (existing) {
            return existing as Promise<T>;
        }

        // Start new request
        const promise = fn().finally(() => {
            this.pending.delete(key);
        });

        this.pending.set(key, promise);
        return promise;
    }
}

export const requestDeduplicator = new RequestDeduplicator();

export default {
    prefetchRoute,
    prefetchOnHover,
    cancelPrefetch,
    prefetchAdjacentPages,
    preloadCriticalData,
    hotCache,
    requestDeduplicator,
};
