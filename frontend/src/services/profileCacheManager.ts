import { useState, useEffect } from 'react';
/**
 * UNIFIED PROFILE CACHE MANAGER
  * Handles cache invalidation and synchronization across all components
    * Ensures data consistency between Member and Admin views
      */

class ProfileCacheManager {
  private static instance: ProfileCacheManager;
  private cache: Map<string, { data: any; timestamp: number; version: number }> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly VERSION_KEY = 'profile_cache_version';
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    this.initializeBroadcastChannel();
  }

  static getInstance(): ProfileCacheManager {
    if (!ProfileCacheManager.instance) {
      ProfileCacheManager.instance = new ProfileCacheManager();
    }
    return ProfileCacheManager.instance;
  }

  /**
   * Initialize cross-tab communication for cache synchronization
   */
  private initializeBroadcastChannel(): void {
    try {
      this.broadcastChannel = new BroadcastChannel('profile_cache_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'PROFILE_UPDATED') {
          this.invalidateLocalCache(event.data.userId);
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage');
      this.setupLocalStorageFallback();
    }
  }

  /**
   * Fallback for browsers without BroadcastChannel
   */
  private setupLocalStorageFallback(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'profile_cache_invalidate' && event.newValue) {
        const data = JSON.parse(event.newValue);
        this.invalidateLocalCache(data.userId);
      }
    });
  }

  /**
   * Get cached profile data
   */
  getProfile(userId: string): any | null {
    const cacheKey = `profile_${userId}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Set profile data in cache
   */
  setProfile(userId: string, data: any, version: number = 1): void {
    const cacheKey = `profile_${userId}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      version
    });

    // Notify subscribers
    this.notifySubscribers(userId, data);
  }

  /**
   * Invalidate profile cache (called after updates)
   */
  invalidateProfile(userId: string): void {
    const cacheKey = `profile_${userId}`;
    this.cache.delete(cacheKey);

    // Broadcast to other tabs
    this.broadcastUpdate(userId);

    // Notify subscribers with null to indicate invalidation
    this.notifySubscribers(userId, null);
  }

  /**
   * Invalidate all profile caches
   */
  invalidateAllProfiles(): void {
    this.cache.clear();

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'ALL_PROFILES_INVALIDATED',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Subscribe to profile updates
   */
  subscribe(userId: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }

    this.subscribers.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(userId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a profile update
   */
  private notifySubscribers(userId: string, data: any): void {
    const callbacks = this.subscribers.get(userId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in profile update callback:', error);
        }
      });
    }
  }

  /**
   * Broadcast update to other browser tabs
   */
  private broadcastUpdate(userId: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PROFILE_UPDATED',
        userId,
        timestamp: Date.now()
      });
    } else {
      // Fallback to localStorage
      localStorage.setItem('profile_cache_invalidate', JSON.stringify({
        userId,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Check if cache is valid for a specific user
   */
  isCacheValid(userId: string): boolean {
    const cacheKey = `profile_${userId}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) return false;

    return Date.now() - cached.timestamp <= this.CACHE_TTL;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate local cache without broadcasting (used by sync listeners)
   */
  private invalidateLocalCache(userId: string): void {
    const cacheKey = `profile_${userId}`;
    this.cache.delete(cacheKey);
    // Notify subscribers with null to indicate invalidation
    this.notifySubscribers(userId, null);
  }
}

/**
 * React Hook for profile cache management
 */
export function useProfileCache(userId: string | null) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cacheManager = ProfileCacheManager.getInstance();

  useEffect(() => {
    if (!userId) return;

    // Check cache first
    const cached = cacheManager.getProfile(userId);
    if (cached) {
      setProfile(cached);
      setIsLoading(false);
    }

    // Subscribe to updates
    const unsubscribe = cacheManager.subscribe(userId, (newData) => {
      if (newData === null) {
        // Cache was invalidated, refetch
        setIsLoading(true);
      } else {
        setProfile(newData);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const updateProfile = (newProfile: any) => {
    if (!userId) return;
    cacheManager.setProfile(userId, newProfile);
  };

  const invalidateProfile = () => {
    if (!userId) return;
    cacheManager.invalidateProfile(userId);
  };

  return {
    profile,
    isLoading,
    updateProfile,
    invalidateProfile
  };
}

export default ProfileCacheManager.getInstance();