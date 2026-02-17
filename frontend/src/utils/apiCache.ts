/**
 * Simple API response caching utility for performance optimization.
 * Implements stale-while-revalidate pattern for commonly fetched data.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    // Return data even if stale (stale-while-revalidate pattern)
    return entry.data;
  }

  /**
   * Check if cached data is still fresh (not expired)
   */
  isFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }

  /**
   * Check if we should revalidate (data exists but is stale)
   */
  shouldRevalidate(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() >= entry.expiresAt;
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache keys for debugging
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton cache instance
export const apiCache = new ApiCache();

// Cache key generators
export const cacheKeys = {
  users: (role?: string) => `users:${role ?? 'all'}`,
  user: (id: number) => `user:${id}`,
  stats: () => 'stats',
  settings: () => 'settings',
  packages: (activeOnly: boolean) => `packages:${activeOnly}`,
  sessions: () => 'sessions',
  classes: () => 'classes',
};

export default apiCache;
