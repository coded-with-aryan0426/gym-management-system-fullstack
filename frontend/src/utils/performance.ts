import { debounce as lodashDebounce, throttle as lodashThrottle } from 'lodash';
import { useCallback, useRef, useEffect } from 'react';

/**
 * Performance utilities for optimizing API calls and user interactions
 */

// ==========================================
// DEBOUNCE UTILITIES
// ==========================================

/**
 * Standard debounce timings (in milliseconds)
 */
export const DEBOUNCE_TIMES = {
    /** For search inputs - waits for user to stop typing */
    SEARCH: 300,
    /** For filter changes - slightly faster response */
    FILTER: 200,
    /** For form validation - near-instant feedback */
    VALIDATION: 150,
    /** For autosave - longer delay to batch changes */
    AUTOSAVE: 1000,
    /** For window resize - prevent excessive calculations */
    RESIZE: 250,
    /** For scroll events - smooth but responsive */
    SCROLL: 100,
} as const;

/**
 * Standard throttle timings (in milliseconds)
 */
export const THROTTLE_TIMES = {
    /** For API calls - prevent flooding */
    API: 1000,
    /** For analytics tracking */
    ANALYTICS: 2000,
    /** For scroll position updates */
    SCROLL: 100,
    /** For mouse move tracking */
    MOUSE: 50,
} as const;

/**
 * Creates a debounced version of a function
 * @param fn The function to debounce
 * @param wait Wait time in milliseconds (default: 300ms)
 * @param options Lodash debounce options
 */
export function createDebounce<T extends (...args: any[]) => any>(
    fn: T,
    wait: number = DEBOUNCE_TIMES.SEARCH,
    options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
) {
    return lodashDebounce(fn, wait, options);
}

/**
 * Creates a throttled version of a function
 * @param fn The function to throttle
 * @param wait Wait time in milliseconds (default: 1000ms)
 * @param options Lodash throttle options
 */
export function createThrottle<T extends (...args: any[]) => any>(
    fn: T,
    wait: number = THROTTLE_TIMES.API,
    options?: { leading?: boolean; trailing?: boolean }
) {
    return lodashThrottle(fn, wait, options);
}

// ==========================================
// REACT HOOKS
// ==========================================

/**
 * React hook for debounced callbacks
 * Automatically handles cleanup on unmount
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => fetchResults(query),
 *   300
 * );
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = DEBOUNCE_TIMES.SEARCH,
    deps: React.DependencyList = []
) {
    const callbackRef = useRef(callback);
    
    // Update ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedFn = useRef(
        lodashDebounce((...args: Parameters<T>) => {
            callbackRef.current(...args);
        }, delay)
    );

    // Cleanup on unmount
    useEffect(() => {
        const fn = debouncedFn.current;
        return () => {
            fn.cancel();
        };
    }, []);

    // Recreate debounced function if delay changes
    useEffect(() => {
        debouncedFn.current.cancel();
        debouncedFn.current = lodashDebounce((...args: Parameters<T>) => {
            callbackRef.current(...args);
        }, delay);
        
        return () => {
            debouncedFn.current.cancel();
        };
    }, [delay, ...deps]);

    return useCallback((...args: Parameters<T>) => {
        debouncedFn.current(...args);
    }, []);
}

/**
 * React hook for throttled callbacks
 * 
 * @example
 * const throttledScroll = useThrottledCallback(
 *   () => trackScrollPosition(),
 *   100
 * );
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = THROTTLE_TIMES.SCROLL,
    deps: React.DependencyList = []
) {
    const callbackRef = useRef(callback);
    
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const throttledFn = useRef(
        lodashThrottle((...args: Parameters<T>) => {
            callbackRef.current(...args);
        }, delay)
    );

    useEffect(() => {
        const fn = throttledFn.current;
        return () => {
            fn.cancel();
        };
    }, []);

    useEffect(() => {
        throttledFn.current.cancel();
        throttledFn.current = lodashThrottle((...args: Parameters<T>) => {
            callbackRef.current(...args);
        }, delay);
        
        return () => {
            throttledFn.current.cancel();
        };
    }, [delay, ...deps]);

    return useCallback((...args: Parameters<T>) => {
        throttledFn.current(...args);
    }, []);
}

/**
 * Hook for debounced state value
 * Returns the debounced version of a value
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 * 
 * useEffect(() => {
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebouncedValue<T>(value: T, delay: number = DEBOUNCE_TIMES.SEARCH): T {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
}

// Need to import React for useState
import React from 'react';

// ==========================================
// REQUEST DEDUPLICATION
// ==========================================

const pendingRequests = new Map<string, Promise<any>>();

/**
 * Deduplicates concurrent identical requests
 * If the same request is made while one is pending, returns the pending promise
 * 
 * @example
 * const data = await deduplicateRequest(
 *   'members-list',
 *   () => api.getMembers()
 * );
 */
export async function deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
): Promise<T> {
    // Check if there's already a pending request
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key) as Promise<T>;
    }

    // Create and store the promise
    const promise = requestFn().finally(() => {
        pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
}

/**
 * Batches multiple calls into a single request
 * Useful for fetching multiple items by ID
 */
export function createBatchedFetcher<TInput, TOutput>(
    batchFn: (inputs: TInput[]) => Promise<TOutput[]>,
    options: {
        maxBatchSize?: number;
        maxWaitTime?: number;
    } = {}
) {
    const { maxBatchSize = 50, maxWaitTime = 50 } = options;
    
    let batch: TInput[] = [];
    let resolvers: ((value: TOutput) => void)[] = [];
    let timeout: NodeJS.Timeout | null = null;

    const executeBatch = async () => {
        const currentBatch = batch;
        const currentResolvers = resolvers;
        batch = [];
        resolvers = [];
        timeout = null;

        try {
            const results = await batchFn(currentBatch);
            results.forEach((result, index) => {
                currentResolvers[index]?.(result);
            });
        } catch (error) {
            currentResolvers.forEach(resolve => resolve(undefined as any));
        }
    };

    return (input: TInput): Promise<TOutput> => {
        return new Promise((resolve) => {
            batch.push(input);
            resolvers.push(resolve);

            if (batch.length >= maxBatchSize) {
                if (timeout) clearTimeout(timeout);
                executeBatch();
            } else if (!timeout) {
                timeout = setTimeout(executeBatch, maxWaitTime);
            }
        });
    };
}
