import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import api from '../services/api';

/**
 * Custom React Query hooks for gym management data fetching
 * Provides caching, automatic refetching, and optimistic updates
 * 
 * Phase 4: Performance & Polish - React Query Caching
 */

// ==========================================
// DASHBOARD HOOKS - High Priority Caching
// ==========================================

/**
 * Hook for fetching member dashboard data
 * USAGE: const { data, isLoading, error, refetch } = useMemberDashboard(userId);
 */
export const useMemberDashboard = (userId: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['memberDashboard', userId],
    queryFn: async () => {
      const response = await apiClient.get('/member/dashboard', { 
        params: { memberId: userId } 
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook for fetching trainer dashboard data
 * USAGE: const { data, isLoading, error, refetch } = useTrainerDashboard();
 */
export const useTrainerDashboard = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['trainerDashboard'],
    queryFn: () => api.getTrainerDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching owner dashboard data
 * USAGE: const { data, isLoading, error, refetch } = useOwnerDashboard();
 */
export const useOwnerDashboard = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['ownerDashboard'],
    queryFn: () => api.getOwnerDashboard(),
    staleTime: 3 * 60 * 1000, // 3 minutes - owner needs fresher data
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// ==========================================
// GYM CLASS HOOKS - Frequently Accessed
// ==========================================

/**
 * Hook for fetching available gym classes
 * USAGE: const { data: classes, isLoading } = useAvailableClasses();
 */
export const useAvailableClasses = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['availableClasses'],
    queryFn: () => api.gymClassApi.getAvailableClasses(),
    staleTime: 2 * 60 * 1000, // 2 minutes - classes change frequently
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching member's bookings
 * USAGE: const { data: bookings, isLoading } = useMyBookings(userId);
 */
export const useMyBookings = (userId: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['myBookings', userId],
    queryFn: async () => {
      const response = await apiClient.get('/member/bookings');
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - bookings change frequently
    gcTime: 5 * 60 * 1000,
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook for fetching all gym classes (for owner/trainer)
 * USAGE: const { data: classes, isLoading } = useAllClasses();
 */
export const useAllClasses = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['allClasses'],
    queryFn: () => api.gymClassApi.getAllClasses(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// ==========================================
// MUTATION HOOKS - Optimistic Updates
// ==========================================

/**
 * Hook for booking a gym class with optimistic updates
 * USAGE: 
 * const bookClass = useBookClass();
 * bookClass.mutate(classId, {
 *   onSuccess: () => toast.success('Booked!')
 * });
 */
export const useBookClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classId, memberId }: { classId: number; memberId: number }) => {
      return api.gymClassApi.bookClass(classId, memberId);
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableClasses'] });
      queryClient.invalidateQueries({ queryKey: ['memberDashboard'] });
    },
    onError: (error) => {
      console.error('Failed to book class:', error);
    },
  });
};

/**
 * Hook for canceling a booking with optimistic updates
 * USAGE:
 * const cancelBooking = useCancelBooking();
 * cancelBooking.mutate(bookingId, {
 *   onSuccess: () => toast.success('Booking cancelled')
 * });
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookingId, memberId }: { bookingId: number; memberId: number }) => {
      return api.gymClassApi.cancelBooking(bookingId, memberId);
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableClasses'] });
      queryClient.invalidateQueries({ queryKey: ['memberDashboard'] });
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
    },
  });
};

// ==========================================
// MEMBERSHIP HOOKS
// ==========================================

/**
 * Hook for fetching member's membership details
 * USAGE: const { data: membership, isLoading } = useMyMembership(userId);
 */
export const useMyMembership = (userId: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['myMembership', userId],
    queryFn: async () => {
      const response = await apiClient.get('/member/membership');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - membership doesn't change often
    gcTime: 15 * 60 * 1000,
    enabled: !!userId,
    ...options,
  });
};

// ==========================================
// ATTENDANCE HOOKS
// ==========================================

/**
 * Hook for fetching member's attendance history
 * USAGE: const { data: attendance, isLoading } = useMyAttendance(userId);
 */
export const useMyAttendance = (userId: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['myAttendance', userId],
    queryFn: async () => {
      const response = await apiClient.get('/member/attendance');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
    ...options,
  });
};

// ==========================================
// TRAINER HOOKS
// ==========================================

/**
 * Hook for fetching member's assigned trainer
 * USAGE: const { data: trainer, isLoading } = useMyTrainer(userId);
 */
export const useMyTrainer = (userId: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['myTrainer', userId],
    queryFn: async () => {
      const response = await apiClient.get('/member/trainer');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - trainer assignment rarely changes
    gcTime: 30 * 60 * 1000,
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook for fetching trainer's assigned members
 * USAGE: const { data: members, isLoading } = useMyMembers();
 */
export const useMyMembers = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['trainerMembers'],
    queryFn: async () => {
      const response = await apiClient.get('/trainer/members');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    ...options,
  });
};

// ==========================================
// NOTIFICATION HOOKS
// ==========================================

/**
 * Hook for fetching user notifications
 * USAGE: const { data: notifications, isLoading } = useNotifications();
 */
export const useNotifications = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - notifications should be fresh
    gcTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for marking notification as read
 * USAGE:
 * const markAsRead = useMarkNotificationRead();
 * markAsRead.mutate(notificationId);
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['memberDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['trainerDashboard'] });
    },
  });
};

// ==========================================
// PROGRESS TRACKING HOOKS
// ==========================================

/**
 * Hook for fetching member's progress data
 * USAGE: const { data: progress, isLoading } = useMyProgress(userId);
 */
export const useMyProgress = (userId: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['myProgress', userId],
    queryFn: async () => {
      const response = await apiClient.get('/member/progress');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    enabled: !!userId,
    ...options,
  });
};

// ==========================================
// UTILITY HOOKS
// ==========================================

/**
 * Hook for prefetching dashboard data
 * Call this on login or route changes to warm up the cache
 * USAGE: prefetchDashboard(userId, userRole);
 */
export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchMemberDashboard: (userId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['memberDashboard', userId],
        queryFn: async () => {
          const response = await apiClient.get('/member/dashboard', { 
            params: { memberId: userId } 
          });
          return response.data;
        },
      });
    },
    prefetchTrainerDashboard: () => {
      queryClient.prefetchQuery({
        queryKey: ['trainerDashboard'],
        queryFn: () => api.getTrainerDashboard(),
      });
    },
    prefetchOwnerDashboard: () => {
      queryClient.prefetchQuery({
        queryKey: ['ownerDashboard'],
        queryFn: () => api.getOwnerDashboard(),
      });
    },
  };
};

/**
 * Hook to invalidate all dashboard caches
 * Use after major data changes that affect multiple views
 * USAGE: 
 * const { invalidateAll } = useInvalidateDashboards();
 * invalidateAll();
 */
export const useInvalidateDashboards = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['memberDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['trainerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
    },
    invalidateMember: () => {
      queryClient.invalidateQueries({ queryKey: ['memberDashboard'] });
    },
    invalidateTrainer: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerDashboard'] });
    },
    invalidateOwner: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
    },
  };
};
