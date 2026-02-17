/**
 * UNIFIED PROFILE API SERVICE
 * Replaces separate member and admin profile update APIs
 * Ensures consistent data synchronization across all roles
 */

import type { MemberProfileDTO, MemberProfileUpdateDTO } from '../types/member';
import { apiClient } from './api';
import ProfileCacheManager from './profileCacheManager';

class UnifiedProfileApiService {
  private static instance: UnifiedProfileApiService;
  private cacheManager = ProfileCacheManager;

  static getInstance(): UnifiedProfileApiService {
    if (!UnifiedProfileApiService.instance) {
      UnifiedProfileApiService.instance = new UnifiedProfileApiService();
    }
    return UnifiedProfileApiService.instance;
  }

  /**
   * UNIFIED PROFILE UPDATE
   * Single endpoint for all user profile updates regardless of role
   */
  async updateProfile(userId: string, updateData: MemberProfileUpdateDTO): Promise<MemberProfileDTO> {
    try {
      // Optimistic update: update cache immediately
      const currentProfile = this.cacheManager.getProfile(userId);
      if (currentProfile) {
        const optimisticProfile = {
          ...currentProfile,
          ...updateData,
          isOptimistic: true
        };
        this.cacheManager.setProfile(userId, optimisticProfile);
      }

      // Make API call
      const response = await apiClient.put<MemberProfileDTO>(`/profiles/${userId}`, updateData);
      const updatedProfile = response.data;

      // Update cache with server response
      this.cacheManager.setProfile(userId, updatedProfile);

      // Invalidate related caches
      this.invalidateRelatedCaches(userId);

      return updatedProfile;
    } catch (error) {
      // Revert optimistic update on error
      this.cacheManager.invalidateProfile(userId);
      throw error;
    }
  }

  /**
   * UNIFIED PROFILE FETCH
   * Get profile with intelligent caching
   */
  async getProfile(userId: string): Promise<MemberProfileDTO> {
    // Check cache first
    const cachedProfile = this.cacheManager.getProfile(userId);
    if (cachedProfile && !cachedProfile.isOptimistic) {
      return cachedProfile;
    }

    // Fetch from API if cache miss or stale
    const response = await apiClient.get<MemberProfileDTO>(`/profiles/${userId}`);
    const profile = response.data;

    // Update cache
    this.cacheManager.setProfile(userId, profile);

    return profile;
  }

  /**
   * BATCH PROFILE FETCH
   * Get multiple profiles efficiently
   */
  async getProfiles(userIds: string[]): Promise<MemberProfileDTO[]> {
    const profiles: MemberProfileDTO[] = [];
    const missingIds: string[] = [];

    // Check cache for each ID
    userIds.forEach(userId => {
      const cached = this.cacheManager.getProfile(userId);
      if (cached && !cached.isOptimistic) {
        profiles.push(cached);
      } else {
        missingIds.push(userId);
      }
    });

    // Fetch missing profiles
    if (missingIds.length > 0) {
      // For now, fetch individually - could be optimized with batch endpoint
      const missingProfiles = await Promise.all(
        missingIds.map(id => this.getProfile(id))
      );
      profiles.push(...missingProfiles);
    }

    return profiles;
  }

  /**
   * PROFILE INVALIDATION
   * Force refresh of profile data
   */
  async invalidateProfile(userId: string): Promise<void> {
    this.cacheManager.invalidateProfile(userId);
    
    // Optionally refetch immediately
    try {
      await this.getProfile(userId);
    } catch (error) {
      console.error('Failed to refetch profile after invalidation:', error);
    }
  }

  /**
   * BULK INVALIDATION
   * Invalidate multiple profiles
   */
  async invalidateProfiles(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map(id => this.invalidateProfile(id)));
  }

  /**
   * SUBSCRIBE TO PROFILE UPDATES
   * Real-time updates for specific user
   */
  subscribeToProfileUpdates(userId: string, callback: (profile: MemberProfileDTO) => void): () => void {
    return this.cacheManager.subscribe(userId, (data) => {
      if (data && !data.isOptimistic) {
        callback(data);
      }
    });
  }

  /**
   * GET CACHE STATISTICS
   */
  getCacheStats() {
    return this.cacheManager.getCacheStats();
  }

  /**
   * CLEANUP EXPIRED CACHE ENTRIES
   */
  cleanupExpiredCache() {
    this.cacheManager.cleanupExpired();
  }

  /**
   * Invalidate related caches (memberships, stats, etc.)
   */
  private invalidateRelatedCaches(userId: string): void {
    // Invalidate membership cache
    this.cacheManager.invalidateProfile(`membership_${userId}`);
    
    // Invalidate stats cache
    this.cacheManager.invalidateProfile(`stats_${userId}`);
    
    // Invalidate achievement cache
    this.cacheManager.invalidateProfile(`achievements_${userId}`);
  }

  /**
   * CONFLICT DETECTION
   * Check for concurrent updates
   */
  private detectConflict(userId: string, serverVersion: number): boolean {
    const cached = this.cacheManager.getProfile(userId);
    if (!cached || !cached.version) return false;
    
    return serverVersion < cached.version;
  }

  /**
   * RESOLVE CONFLICT
   * Handle version conflicts
   */
  private resolveConflict(localProfile: any, serverProfile: any): any {
    // Simple last-write-wins for now
    // Could be enhanced with field-level conflict resolution
    return {
      ...serverProfile,
      lastModified: new Date().toISOString(),
      conflictResolved: true
    };
  }
}

export default UnifiedProfileApiService.getInstance();