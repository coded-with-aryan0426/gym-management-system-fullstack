// Enhanced Search Service with Real-Time Capabilities and Debouncing

import type { 
  SearchOptions, 
  SearchResult, 
  Observable 
} from '../types/modalEnhancement';
import type { User } from '../types/user';
import { enhancedApi } from './enhancedApi';

interface SearchCache {
  query: string;
  filters: Record<string, any>;
  results: SearchResult<User>;
  timestamp: Date;
  expiresAt: Date;
}

interface SearchSubscription {
  id: string;
  options: SearchOptions;
  callback: (results: SearchResult<User>) => void;
  lastResults?: SearchResult<User>;
}

export class SearchService {
  private cache: Map<string, SearchCache> = new Map();
  private subscriptions: Map<string, SearchSubscription> = new Map();
  private debounceTimeouts: Map<string, number> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private debounceDelay = 300; // 300ms

  // Real-time search with debouncing
  async searchWithDebounce(
    options: SearchOptions,
    callback: (results: SearchResult<User>) => void,
    debounceMs: number = this.debounceDelay
  ): Promise<string> {
    const subscriptionId = this.generateSubscriptionId();
    const cacheKey = this.getCacheKey(options);
    
    // Clear existing timeout for this subscription
    const existingTimeout = this.debounceTimeouts.get(subscriptionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Create subscription
    const subscription: SearchSubscription = {
      id: subscriptionId,
      options,
      callback
    };
    this.subscriptions.set(subscriptionId, subscription);
    
    // Check cache first
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      callback(cachedResult.results);
      subscription.lastResults = cachedResult.results;
    }
    
    // Set debounced search
    const timeout = setTimeout(async () => {
      try {
        const results = await this.performSearch(options);
        
        // Update cache
        this.setCachedResult(cacheKey, options, results);
        
        // Update subscription
        subscription.lastResults = results;
        callback(results);
        
        // Clean up timeout
        this.debounceTimeouts.delete(subscriptionId);
      } catch (error) {
        console.error('[SearchService] Search failed:', error);
        callback({
          items: [],
          total: 0,
          hasMore: false
        });
      }
    }, debounceMs);
    
    this.debounceTimeouts.set(subscriptionId, timeout);
    
    return subscriptionId;
  }

  // Immediate search (no debouncing)
  async search(options: SearchOptions): Promise<SearchResult<User>> {
    const cacheKey = this.getCacheKey(options);
    
    // Check cache first
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult.results;
    }
    
    // Perform search
    const results = await this.performSearch(options);
    
    // Update cache
    this.setCachedResult(cacheKey, options, results);
    
    return results;
  }

  // Cancel search subscription
  cancelSearch(subscriptionId: string): void {
    const timeout = this.debounceTimeouts.get(subscriptionId);
    if (timeout) {
      clearTimeout(timeout);
      this.debounceTimeouts.delete(subscriptionId);
    }
    
    this.subscriptions.delete(subscriptionId);
  }

  // Real-time search observable
  createSearchObservable(options: SearchOptions): Observable<SearchResult<User>> {
    return {
      subscribe: (observer: (value: SearchResult<User>) => void) => {
        const subscriptionId = this.searchWithDebounce(options, observer);
        
        return {
          unsubscribe: () => {
            subscriptionId.then(id => this.cancelSearch(id));
          }
        };
      }
    };
  }

  // Perform the actual search
  private async performSearch(options: SearchOptions): Promise<SearchResult<User>> {
    try {
      console.log('[SearchService] Performing search:', options);
      
      // Use enhanced API for search
      const results = await enhancedApi.searchUsersEnhanced(options);
      
      // Apply additional client-side filtering if needed
      const filteredResults = this.applyClientSideFilters(results, options);
      
      return filteredResults;
    } catch (error) {
      console.error('[SearchService] Search failed:', error);
      throw error;
    }
  }

  // Apply additional client-side filters
  private applyClientSideFilters(
    results: SearchResult<User>, 
    options: SearchOptions
  ): SearchResult<User> {
    let filteredItems = [...results.items];
    
    // Apply exclude IDs filter
    if (options.excludeIds && options.excludeIds.length > 0) {
      filteredItems = filteredItems.filter(user => 
        !options.excludeIds!.includes(user.userId)
      );
    }
    
    // Apply additional filters
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredItems = filteredItems.filter(user => {
          const userValue = (user as any)[key];
          
          if (typeof value === 'string') {
            return userValue?.toString().toLowerCase().includes(value.toLowerCase());
          }
          
          return userValue === value;
        });
      }
    });
    
    return {
      items: filteredItems,
      total: filteredItems.length,
      hasMore: false // For simplicity, not implementing pagination
    };
  }

  // Cache management
  private getCacheKey(options: SearchOptions): string {
    const { query, filters, excludeIds, sortBy, sortOrder } = options;
    return JSON.stringify({
      query: query.toLowerCase().trim(),
      filters,
      excludeIds: excludeIds?.sort(),
      sortBy,
      sortOrder
    });
  }

  private getCachedResult(cacheKey: string): SearchCache | null {
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiresAt > new Date()) {
      return cached;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private setCachedResult(
    cacheKey: string, 
    options: SearchOptions, 
    results: SearchResult<User>
  ): void {
    const cached: SearchCache = {
      query: options.query,
      filters: options.filters,
      results,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.cacheTimeout)
    };
    
    this.cache.set(cacheKey, cached);
  }

  // Utility methods
  private generateSubscriptionId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cache invalidation
  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('[SearchService] All cache cleared');
      return;
    }
    
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`[SearchService] Cache invalidated for pattern: ${pattern}`);
  }

  // Update search results for active subscriptions
  updateActiveSearches(updatedUser: User): void {
    this.subscriptions.forEach(subscription => {
      const { options, callback, lastResults } = subscription;
      
      if (lastResults && this.shouldUpdateResults(updatedUser, options, lastResults)) {
        // Re-run search for this subscription
        this.performSearch(options)
          .then(results => {
            subscription.lastResults = results;
            callback(results);
          })
          .catch(error => {
            console.error('[SearchService] Failed to update search results:', error);
          });
      }
    });
  }

  private shouldUpdateResults(
    updatedUser: User, 
    options: SearchOptions, 
    lastResults: SearchResult<User>
  ): boolean {
    // Check if the updated user was in the last results
    const wasInResults = lastResults.items.some(user => user.userId === updatedUser.userId);
    
    // Check if the updated user matches the search criteria
    const matchesSearch = this.userMatchesSearch(updatedUser, options);
    
    // Update if user was in results or now matches search
    return wasInResults || matchesSearch;
  }

  private userMatchesSearch(user: User, options: SearchOptions): boolean {
    const { query, filters } = options;
    
    // Check query match
    if (query.trim()) {
      const searchText = query.toLowerCase();
      const userText = `${user.fullName} ${user.email}`.toLowerCase();
      if (!userText.includes(searchText)) {
        return false;
      }
    }
    
    // Check filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        const userValue = (user as any)[key];
        if (userValue !== value) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Cleanup
  cleanup(): void {
    // Clear all timeouts
    this.debounceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.debounceTimeouts.clear();
    
    // Clear subscriptions
    this.subscriptions.clear();
    
    // Clear cache
    this.cache.clear();
    
    console.log('[SearchService] Cleanup completed');
  }

  // Get search statistics
  getStats(): {
    cacheSize: number;
    activeSubscriptions: number;
    pendingSearches: number;
  } {
    return {
      cacheSize: this.cache.size,
      activeSubscriptions: this.subscriptions.size,
      pendingSearches: this.debounceTimeouts.size
    };
  }
}

// Singleton instance
export const searchService = new SearchService();