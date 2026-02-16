import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    staleWhileRevalidate?: boolean;
}

class ProgressCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private listeners: Map<string, Set<() => void>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    set<T>(key: string, data: T, options?: CacheOptions): void {
        const ttl = options?.ttl || this.defaultTTL;
        const now = Date.now();
        
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl
        });
        
        this.notifyListeners(key);
    }

    get<T>(key: string, options?: CacheOptions): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) return null;
        
        const now = Date.now();
        const isExpired = now > entry.expiresAt;
        
        if (isExpired) {
            if (options?.staleWhileRevalidate) {
                return entry.data;
            }
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;
        
        const now = Date.now();
        if (now > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
        this.notifyListeners(key);
    }

    invalidatePattern(pattern: RegExp): void {
        const keysToDelete: string[] = [];
        
        this.cache.forEach((_, key) => {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.notifyListeners(key);
        });
    }

    clear(): void {
        const keys = Array.from(this.cache.keys());
        this.cache.clear();
        keys.forEach(key => this.notifyListeners(key));
    }

    subscribe(key: string, listener: () => void): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        
        this.listeners.get(key)!.add(listener);
        
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    private notifyListeners(key: string): void {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener());
        }
    }

    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
export const progressCache = new ProgressCache();

// React hook for cached data fetching
export function useCachedProgressData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: {
        ttl?: number;
        staleWhileRevalidate?: boolean;
        dependencies?: any[];
    }
) {
    const [data, setData] = useState<T | null>(() => 
        progressCache.get<T>(key, { staleWhileRevalidate: options?.staleWhileRevalidate })
    );
    const [loading, setLoading] = useState(!progressCache.has(key));
    const [error, setError] = useState<Error | null>(null);
    const [isStale, setIsStale] = useState(false);
    const fetchRef = useRef(fetchFn);

    useEffect(() => {
        fetchRef.current = fetchFn;
    }, [fetchFn]);

    const fetchData = useCallback(async (isBackground = false) => {
        if (!isBackground) {
            setLoading(true);
        }
        setError(null);
        
        try {
            const result = await fetchRef.current();
            progressCache.set(key, result, { 
                ttl: options?.ttl,
                staleWhileRevalidate: options?.staleWhileRevalidate 
            });
            setData(result);
            setIsStale(false);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(error);
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    }, [key, options?.ttl, options?.staleWhileRevalidate]);

    useEffect(() => {
        const cachedData = progressCache.get<T>(key, { staleWhileRevalidate: true });
        
        if (cachedData) {
            setData(cachedData);
            
            // Check if cache is stale and revalidate in background
            if (!progressCache.has(key)) {
                setIsStale(true);
                fetchData(true);
            }
        } else {
            fetchData();
        }
    }, [key, ...(options?.dependencies || [])]);

    // Subscribe to cache changes
    useEffect(() => {
        const unsubscribe = progressCache.subscribe(key, () => {
            const newData = progressCache.get<T>(key);
            if (newData) {
                setData(newData);
            }
        });
        
        return unsubscribe;
    }, [key]);

    const refetch = useCallback(() => {
        progressCache.invalidate(key);
        return fetchData();
    }, [key, fetchData]);

    return { 
        data, 
        loading, 
        error, 
        isStale,
        refetch 
    };
}

// Auto-refresh hook
export function useAutoRefresh<T>(
    key: string,
    fetchFn: () => Promise<T>,
    interval: number = 30000 // 30 seconds default
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const result = await fetchFn();
            setData(result);
            progressCache.set(key, result);
            setError(null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn]);

    useEffect(() => {
        fetchData();
        
        // Set up auto-refresh
        intervalRef.current = setInterval(fetchData, interval);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData, interval]);

    return { data, loading, error, refetch: fetchData };
}

export default progressCache;