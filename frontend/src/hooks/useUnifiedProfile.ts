/**
 * UNIFIED PROFILE HOOK
 * React hook for consistent profile data management across all components
 * Replaces individual profile fetching and update logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MemberProfileDTO, MemberProfileUpdateDTO } from '../types/member';
import UnifiedProfileApiService from '../services/unifiedProfileApiService';
import ProfileCacheManager from '../services/profileCacheManager';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface UseUnifiedProfileOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  optimisticUpdates?: boolean;
  onUpdateSuccess?: (profile: MemberProfileDTO) => void;
  onUpdateError?: (error: Error) => void;
}

interface UseUnifiedProfileReturn {
  profile: MemberProfileDTO | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  updateProfile: (updateData: MemberProfileUpdateDTO) => Promise<void>;
  refreshProfile: () => Promise<void>;
  invalidateProfile: () => void;
  cacheStats: { size: number; keys: string[] };
}

export function useUnifiedProfile(
  userId: string | null,
  options: UseUnifiedProfileOptions = {}
): UseUnifiedProfileReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    optimisticUpdates = true,
    onUpdateSuccess,
    onUpdateError
  } = options;

  const [profile, setProfile] = useState<MemberProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] as string[] });

  const { user: currentUser } = useAuth();
  const refreshIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheManager = ProfileCacheManager;
  const apiService = UnifiedProfileApiService;

  /**
   * Fetch profile data
   */
  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await apiService.getProfile(userId);
      setProfile(profileData);
      setCacheStats(apiService.getCacheStats());
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, apiService]);

  /**
   * Update profile with optimistic updates
   */
  const updateProfile = useCallback(async (updateData: MemberProfileUpdateDTO) => {
    if (!userId) return;

    setIsUpdating(true);
    setError(null);

    try {
      // Optimistic update
      if (optimisticUpdates && profile) {
        const optimisticProfile = {
          ...profile,
          ...updateData,
          isOptimistic: true
        };
        setProfile(optimisticProfile);
      }

      // API update
      const updatedProfile = await apiService.updateProfile(userId, updateData);

      // Update local state
      setProfile(updatedProfile);
      setCacheStats(apiService.getCacheStats());

      // Success callback
      onUpdateSuccess?.(updatedProfile);

      // Show success toast
      toast.success('Profile updated successfully');

    } catch (err) {
      const error = err as Error;
      setError(error);

      // Revert optimistic update
      if (optimisticUpdates) {
        await fetchProfile(); // Refetch to ensure consistency
      }

      // Error callback
      onUpdateError?.(error);

      // Show error toast
      toast.error(error.message || 'Failed to update profile');

      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [userId, profile, optimisticUpdates, apiService, fetchProfile, onUpdateSuccess, onUpdateError]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  /**
   * Invalidate profile cache
   */
  const invalidateProfile = useCallback(() => {
    if (!userId) return;

    apiService.invalidateProfile(userId);
    setProfile(null);
    setCacheStats(apiService.getCacheStats());
  }, [userId, apiService]);

  /**
   * Subscribe to real-time profile updates
   */
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = apiService.subscribeToProfileUpdates(userId, (updatedProfile) => {
      setProfile(updatedProfile);
      setCacheStats(apiService.getCacheStats());

      // Show notification if updated by someone else
      if (updatedProfile && currentUser && String(updatedProfile.userId) !== String(currentUser.id)) {
        toast('Profile was updated by another user');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, apiService, currentUser]);

  /**
   * Auto-refresh profile data
   */
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      fetchProfile();
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, userId, fetchProfile]);

  /**
   * Initial profile fetch
   */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    refreshProfile,
    invalidateProfile,
    cacheStats
  };
}

/**
 * Hook for managing multiple profiles (e.g., admin member list)
 */
export function useUnifiedProfiles(
  userIds: string[],
  options: UseUnifiedProfileOptions = {}
) {
  const [profiles, setProfiles] = useState<Map<string, MemberProfileDTO>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const apiService = UnifiedProfileApiService;

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileData = await apiService.getProfiles(userIds);
      const profileMap = new Map<string, MemberProfileDTO>();

      profileData.forEach(profile => {
        profileMap.set(profile.userId.toString(), profile);
      });

      setProfiles(profileMap);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to fetch profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userIds, apiService]);

  const updateProfileInList = useCallback((userId: string, updateData: MemberProfileUpdateDTO) => {
    apiService.updateProfile(userId, updateData).then(updatedProfile => {
      setProfiles(prev => new Map(prev).set(userId, updatedProfile));
    }).catch(error => {
      console.error('Failed to update profile:', error);
    });
  }, [apiService]);

  const refreshProfiles = useCallback(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    isLoading,
    error,
    updateProfile: updateProfileInList,
    refreshProfiles
  };
}

export default useUnifiedProfile;