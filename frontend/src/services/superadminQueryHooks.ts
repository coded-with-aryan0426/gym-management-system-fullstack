import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { superAdminApi } from './superAdminApi';
import type {
  SuperAdminDashboardData,
  SuperAdminGym,
  SuperAdminGymDeepDive,
  SuperAdminUser,
  SuperAdminFeatureFlag,
  SuperAdminDatabaseHealth,
  SuperAdminRevenueData,
  SuperAdminAnalyticsData,
  SuperAdminAuditLogEntry,
  SuperAdminError
} from './superAdminApi';

export type {
  SuperAdminDashboardData,
  SuperAdminGym,
  SuperAdminGymDeepDive,
  SuperAdminUser,
  SuperAdminFeatureFlag,
  SuperAdminDatabaseHealth,
  SuperAdminRevenueData,
  SuperAdminAnalyticsData,
  SuperAdminAuditLogEntry,
  SuperAdminError
};

const STALE_TIMES = {
  DASHBOARD: 60 * 1000,
  DIRECT_LIST: 0,
  FEATURE_FLAGS: 5 * 60 * 1000,
  DEEP_DIVE: 30 * 1000,
  TELEMETRY: 15 * 1000,
} as const;

export interface UseSuperAdminDashboardOptions {
  enabled?: boolean;
}

export function useSuperAdminDashboard(options: UseSuperAdminDashboardOptions = {}) {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: ['superadmin', 'dashboard'],
    queryFn: () => superAdminApi.getDashboard(),
    enabled,
    staleTime: STALE_TIMES.DASHBOARD,
    refetchInterval: STALE_TIMES.DASHBOARD,
  });
}

export function useSuperAdminGyms(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'gyms'],
    queryFn: () => superAdminApi.getGyms(),
    staleTime: STALE_TIMES.DIRECT_LIST,
    ...options,
  });
}

export function useSuperAdminGymDeepDive(gymId: number | null, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'gym', gymId, 'deep-dive'],
    queryFn: () => gymId ? superAdminApi.getGymDeepDive(gymId) : Promise.resolve(null),
    enabled: !!gymId,
    staleTime: STALE_TIMES.DEEP_DIVE,
    ...options,
  });
}

export function useSuperAdminUsers(search?: string, role?: string, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'users', { search, role }],
    queryFn: () => superAdminApi.getUsers(search, role),
    staleTime: STALE_TIMES.DIRECT_LIST,
    ...options,
  });
}

export function useSuperAdminUserTelemetry(userId: number | null, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'user', userId, 'telemetry'],
    queryFn: () => userId ? superAdminApi.getUserTelemetry(userId) : Promise.resolve(null),
    enabled: !!userId,
    staleTime: STALE_TIMES.TELEMETRY,
    ...options,
  });
}

export function useSuperAdminFeatureFlags(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'feature-flags'],
    queryFn: () => superAdminApi.getFeatureFlags(),
    staleTime: STALE_TIMES.FEATURE_FLAGS,
    refetchInterval: STALE_TIMES.FEATURE_FLAGS,
    ...options,
  });
}

export function useSuperAdminUpdateFeatureFlag(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, updates }: { key: string; updates: { enabled?: boolean; rolloutPercentage?: number } }) =>
      superAdminApi.updateFeatureFlag(key, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'feature-flags'] });
    },
    ...options,
  });
}

export function useSuperAdminErrors(limit = 100, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'errors', { limit }],
    queryFn: () => superAdminApi.getErrors(limit),
    staleTime: STALE_TIMES.DIRECT_LIST,
    refetchInterval: 30 * 1000,
    ...options,
  });
}

export function useSuperAdminRevenue(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'revenue'],
    queryFn: () => superAdminApi.getRevenue(),
    staleTime: STALE_TIMES.DASHBOARD,
    refetchInterval: STALE_TIMES.DASHBOARD,
    ...options,
  });
}

export function useSuperAdminAnalytics(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'analytics'],
    queryFn: () => superAdminApi.getAnalytics(),
    staleTime: STALE_TIMES.DASHBOARD,
    refetchInterval: STALE_TIMES.DASHBOARD,
    ...options,
  });
}

export function useSuperAdminDatabaseHealth(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'database-health'],
    queryFn: () => superAdminApi.getDatabaseHealth(),
    staleTime: STALE_TIMES.DASHBOARD,
    refetchInterval: STALE_TIMES.DASHBOARD,
    ...options,
  });
}

export function useSuperAdminAuditLogs(limit = 100, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'audit-logs', { limit }],
    queryFn: () => superAdminApi.getAuditLogs(limit),
    staleTime: STALE_TIMES.DIRECT_LIST,
    ...options,
  });
}

export function useSuperAdminBetaFeedback(filterObject: Record<string, any> = {}, page = 0, size = 20, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'beta-feedback', { filterObject, page, size }],
    queryFn: () => superAdminApi.getBetaFeedback(filterObject, page, size),
    staleTime: STALE_TIMES.DIRECT_LIST,
    ...options,
  });
}

export function useSuperAdminBetaFeedbackStats(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'beta-feedback-stats'],
    queryFn: () => superAdminApi.getBetaFeedbackStats(),
    staleTime: STALE_TIMES.DASHBOARD,
    refetchInterval: STALE_TIMES.DASHBOARD,
    ...options,
  });
}

export function useSuperAdminInfiniteFeedback(filterObject: Record<string, any> = {}, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: ['superadmin', 'beta-feedback-infinite', { filterObject }],
    queryFn: ({ pageParam = 0 }) => superAdminApi.getBetaFeedback(filterObject, pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return nextPage < (lastPage.totalPages || 1) ? nextPage : undefined;
    },
    staleTime: STALE_TIMES.DIRECT_LIST,
  });
}

export function useSuperAdminSuspendGym(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gymId, reason }: { gymId: number; reason?: string }) =>
      superAdminApi.suspendGym(gymId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'gyms'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'dashboard'] });
    },
    ...options,
  });
}

export function useSuperAdminActivateGym(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gymId: number) => superAdminApi.activateGym(gymId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'gyms'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'dashboard'] });
    },
    ...options,
  });
}

export function useSuperAdminBanUser(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason?: string }) =>
      superAdminApi.banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'dashboard'] });
    },
    ...options,
  });
}

export function useSuperAdminUnbanUser(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => superAdminApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'dashboard'] });
    },
    ...options,
  });
}
