/**
 * Cache-First Rendering Service
 * Stage 3.5: UX Illusion Layer
 * 
 * Returns cached data instantly (even if stale) then updates in background.
 * Makes app feel instant even with slow network.
 * 
 * Pattern: Cache → Render → Background Fetch → Silent Update
 */

import { indexedDBStore } from './indexedDBStore';
import api from './api';
import { QueryClient } from '@tanstack/react-query';

interface CacheFirstOptions {
  maxStaleTime?: number; // Max age of cache to show (default: 5 minutes)
  showStaleIndicator?: boolean; // Show UI indicator that data is stale
  backgroundRefresh?: boolean; // Fetch fresh data in background (default: true)
}

interface CacheFirstResult<T> {
  data: T | null;
  isStale: boolean;
  isCached: boolean;
  refresh: () => Promise<void>;
}

class CacheFirstService {
  private queryClient: QueryClient | null = null;

  /**
   * Set React Query client for cache integration
   */
  setQueryClient(client: QueryClient): void {
    this.queryClient = client;
  }

  /**
   * Get data cache-first (instant return)
   * Returns cached data immediately, fetches fresh data in background
   */
  async getCacheFirst<T>(
    entityType: 'members' | 'trainers' | 'classes',
    id?: number,
    options: CacheFirstOptions = {}
  ): Promise<CacheFirstResult<T>> {
    const {
      maxStaleTime = 5 * 60 * 1000, // 5 minutes default
      backgroundRefresh = true,
    } = options;

    // 1. Try to get from IndexedDB (instant)
    let cachedData: T | null = null;
    let isStale = false;

    try {
      if (id) {
        cachedData = await indexedDBStore.get(entityType, id);
      } else {
        const all = await indexedDBStore.getAll(entityType);
        cachedData = all as T;
      }

      // Check if data is stale
      if (cachedData) {
        const updatedAt = Array.isArray(cachedData)
          ? Math.max(...(cachedData as any[]).map((item: any) => item.updatedAt || 0))
          : (cachedData as any).updatedAt || 0;

        const age = Date.now() - updatedAt;
        isStale = age > maxStaleTime;
      }
    } catch (error) {
      console.error('[CacheFirst] Failed to read from cache:', error);
    }

    // 2. If we have cached data, return it immediately
    if (cachedData) {
      console.log(`[CacheFirst] Returning cached ${entityType}${id ? `/${id}` : ''} (${isStale ? 'stale' : 'fresh'})`);

      // 3. Background refresh if enabled and data is stale
      if (backgroundRefresh && isStale) {
        this.backgroundRefresh(entityType, id);
      }

      return {
        data: cachedData,
        isStale,
        isCached: true,
        refresh: () => this.forceRefresh(entityType, id),
      };
    }

    // 4. No cache, fetch from server (blocking)
    console.log(`[CacheFirst] No cache for ${entityType}${id ? `/${id}` : ''}, fetching from server`);
    
    try {
      const freshData = await this.fetchFromServer<T>(entityType, id);
      
      // Cache the fresh data
      if (freshData) {
        await this.cacheData(entityType, freshData);
      }

      return {
        data: freshData,
        isStale: false,
        isCached: false,
        refresh: () => this.forceRefresh(entityType, id),
      };
    } catch (error) {
      console.error('[CacheFirst] Failed to fetch from server:', error);
      return {
        data: null,
        isStale: false,
        isCached: false,
        refresh: () => this.forceRefresh(entityType, id),
      };
    }
  }

  /**
   * Background refresh (silent update)
   */
  private async backgroundRefresh(
    entityType: 'members' | 'trainers' | 'classes',
    id?: number
  ): Promise<void> {
    console.log(`[CacheFirst] Background refreshing ${entityType}${id ? `/${id}` : ''}`);

    try {
      const freshData = await this.fetchFromServer(entityType, id);

      if (freshData) {
        // Update cache silently
        await this.cacheData(entityType, freshData);

        // Update React Query cache if available
        if (this.queryClient) {
          const queryKey = id ? [entityType, id] : [entityType];
          this.queryClient.setQueryData(queryKey, freshData);
        }

        // Emit update event for UI
        window.dispatchEvent(new CustomEvent('cache-updated', {
          detail: { entityType, id, data: freshData }
        }));

        console.log(`[CacheFirst] Background refresh complete for ${entityType}${id ? `/${id}` : ''}`);
      }
    } catch (error) {
      console.error('[CacheFirst] Background refresh failed:', error);
    }
  }

  /**
   * Force refresh (user-triggered)
   */
  private async forceRefresh(
    entityType: 'members' | 'trainers' | 'classes',
    id?: number
  ): Promise<void> {
    console.log(`[CacheFirst] Force refreshing ${entityType}${id ? `/${id}` : ''}`);
    return this.backgroundRefresh(entityType, id);
  }

  /**
   * Fetch from server
   */
  private async fetchFromServer<T>(
    entityType: 'members' | 'trainers' | 'classes',
    id?: number
  ): Promise<T | null> {
    try {
      const endpoint = id ? `/${entityType}/${id}` : `/${entityType}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`[CacheFirst] Server fetch failed for ${entityType}:`, error);
      return null;
    }
  }

  /**
   * Cache data to IndexedDB
   */
  private async cacheData(
    entityType: 'members' | 'trainers' | 'classes',
    data: any
  ): Promise<void> {
    try {
      if (Array.isArray(data)) {
        await indexedDBStore.putMany(entityType, data);
      } else {
        await indexedDBStore.put(entityType, data);
      }
    } catch (error) {
      console.error('[CacheFirst] Failed to cache data:', error);
    }
  }

  /**
   * Preload data into cache (for route prefetching)
   */
  async preload(
    entityType: 'members' | 'trainers' | 'classes',
    id?: number
  ): Promise<void> {
    console.log(`[CacheFirst] Preloading ${entityType}${id ? `/${id}` : ''}`);
    
    const freshData = await this.fetchFromServer(entityType, id);
    if (freshData) {
      await this.cacheData(entityType, freshData);
    }
  }

  /**
   * Clear cache for entity type
   */
  async clearCache(entityType: 'members' | 'trainers' | 'classes'): Promise<void> {
    // This would need a more specific method in indexedDBStore
    console.log(`[CacheFirst] Clearing cache for ${entityType}`);
    
    // For now, we just invalidate in React Query
    if (this.queryClient) {
      this.queryClient.invalidateQueries({ queryKey: [entityType] });
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    size: number;
    quota: number;
    usage: string;
  }> {
    const { usage, quota } = await indexedDBStore.getSize();
    const usagePercent = quota > 0 ? ((usage / quota) * 100).toFixed(2) : '0';

    return {
      size: usage,
      quota: quota,
      usage: `${usagePercent}%`,
    };
  }
}

// Export singleton instance
export const cacheFirstService = new CacheFirstService();
