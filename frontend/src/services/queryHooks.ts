import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import api from './api';
import type { MemberDTO } from '../types/user';
import type { PageResponse } from '../types/api';

/**
 * React Query hooks for optimized data fetching
 * Provides automatic caching, deduplication, and background refetching
 * 
 * REPLACES: MembersContext, TrainerContext (Stage 1 optimization)
 */

// ==========================================
// MEMBER HOOKS (CONTEXT REPLACEMENT)
// ==========================================

export interface MembersParams {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    plan?: string;
}

/**
 * Hook for fetching paginated members with caching
 * REPLACES: MembersContext.members + MembersContext.loading
 */
export function useMembers(params: MembersParams = {}, options?: Partial<UseQueryOptions>) {
    const { page = 0, size = 20, search = '', status, plan } = params;
    
    return useQuery({
        queryKey: ['members', 'list', { page, size, search, status, plan }],
        queryFn: () => api.getMembersPaginated(page, size, search, status, plan),
        staleTime: 2 * 60 * 1000, // 2 minutes
        placeholderData: (previousData) => previousData, // Keep old data while fetching
        ...options,
    });
}

/**
 * Hook for member stats - computed from paginated data or separate endpoint
 * REPLACES: MembersContext.stats
 */
export function useMemberStats(options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['members', 'stats'],
        queryFn: async () => {
            // Fetch first page to get total counts
            const data = await api.getMembersPaginated(0, 1);
            // If backend provides stats endpoint, use that instead
            return {
                total: data.totalElements || 0,
                // These would ideally come from a dedicated stats endpoint
                active: 0,
                inactive: 0,
                todaysJoins: 0,
                expiringSoon: 0,
                newThisMonth: 0,
            };
        },
        staleTime: 60 * 1000, // 1 minute
        ...options,
    });
}

/**
 * Combined hook that provides MembersContext-compatible interface
 * Use this for gradual migration from context to hooks
 */
export function useMembersData(params: MembersParams = {}) {
    const { data, isLoading, refetch } = useMembers(params);
    
    const members = useMemo(() => {
        if (!data) return [];
        // Handle both paginated and array responses
        return Array.isArray(data) ? data : (data as PageResponse<MemberDTO>).content || [];
    }, [data]);
    
    const stats = useMemo(() => {
        const total = members.length;
        const active = members.filter((m: MemberDTO) => 
            (m.status || '').toUpperCase() === 'ACTIVE'
        ).length;
        const inactive = total - active;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysJoins = members.filter((m: MemberDTO) => {
            const dateStr = m.joinDate || m.createdAt || m.startDate;
            if (!dateStr) return false;
            try {
                const d = new Date(dateStr);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            } catch { return false; }
        }).length;
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        let expiringSoon = 0;
        let newThisMonth = 0;
        
        members.forEach((m: MemberDTO) => {
            // Check expiry
            const mAny = m as any;
            let expiryMs: number | null = null;
            if (mAny.endDateTime) {
                expiryMs = new Date(mAny.endDateTime).getTime() - now.getTime();
            } else if (m.endDate) {
                expiryMs = new Date(m.endDate).getTime() - now.getTime();
            }
            if (expiryMs !== null) {
                const daysUntilExpiry = expiryMs / (1000 * 60 * 60 * 24);
                if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
                    expiringSoon++;
                }
            }
            
            // Check new this month
            const dateStr = m.startDate || m.joinDate || (m as any).createdAt;
            if (dateStr && new Date(dateStr) >= monthStart) {
                newThisMonth++;
            }
        });
        
        return { total, active, inactive, todaysJoins, expiringSoon, newThisMonth };
    }, [members]);
    
    const refreshMembers = useCallback(async () => {
        await refetch();
    }, [refetch]);
    
    return {
        members,
        loading: isLoading,
        stats,
        refreshMembers,
        // Additional data from paginated response
        totalElements: (data as PageResponse<MemberDTO>)?.totalElements,
        totalPages: (data as PageResponse<MemberDTO>)?.totalPages,
    };
}

/**
 * Hook for fetching a single member
 */
export function useMember(memberId: number | null, options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['members', 'detail', memberId],
        queryFn: () => memberId ? api.getUserById(memberId) : Promise.resolve(null),
        enabled: !!memberId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}

/**
 * Hook for fetching member stats
 */
export function useMemberStats(options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['members', 'stats'],
        queryFn: () => api.getMemberStats(),
        staleTime: 60 * 1000, // 1 minute
        ...options,
    });
}

// ==========================================
// TRAINER HOOKS (CONTEXT REPLACEMENT)
// ==========================================

export interface TrainersParams {
    page?: number;
    size?: number;
    search?: string;
}

/**
 * Hook for fetching paginated trainers
 * REPLACES: TrainerContext.trainers + TrainerContext.loading
 */
export function useTrainers(params: TrainersParams = {}, options?: Partial<UseQueryOptions>) {
    const { page = 0, size = 20, search = '' } = params;
    
    return useQuery({
        queryKey: ['trainers', 'list', { page, size, search }],
        queryFn: () => api.getTrainersPaginated(page, size, search),
        staleTime: 2 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        ...options,
    });
}

/**
 * Combined hook that provides TrainerContext-compatible interface
 * Use this for gradual migration from context to hooks
 */
export function useTrainersData(params: TrainersParams = {}) {
    const { data, isLoading, refetch } = useTrainers(params);
    
    const trainers = useMemo(() => {
        if (!data) return [];
        return Array.isArray(data) ? data : (data as any).content || [];
    }, [data]);
    
    const stats = useMemo(() => {
        const total = trainers.length;
        const active = trainers.filter((t: any) => {
            const status = (t.status || 'active').toLowerCase();
            return status === 'active';
        }).length;
        const inactive = total - active;
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = trainers.filter((t: any) => {
            if (!t.createdAt) return false;
            const joinDate = new Date(t.createdAt);
            return joinDate >= monthStart;
        }).length;
        
        return { total, active, inactive, newThisMonth, assignedToday: active };
    }, [trainers]);
    
    const refreshTrainers = useCallback(async () => {
        await refetch();
    }, [refetch]);
    
    return {
        trainers,
        loading: isLoading,
        stats,
        refreshTrainers,
        totalElements: (data as any)?.totalElements,
        totalPages: (data as any)?.totalPages,
    };
}

/**
 * Hook for fetching a single trainer
 */
export function useTrainer(trainerId: number | null, options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['trainers', 'detail', trainerId],
        queryFn: () => trainerId ? api.getUserById(trainerId) : Promise.resolve(null),
        enabled: !!trainerId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

// ==========================================
// SESSION HOOKS
// ==========================================

export interface SessionsParams {
    trainerId?: number;
    memberId?: number;
    startDate?: string;
    endDate?: string;
}

/**
 * Hook for fetching PT sessions
 */
export function useSessions(params: SessionsParams = {}, options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['sessions', 'list', params],
        queryFn: () => api.getPTSessions(),
        staleTime: 60 * 1000, // 1 minute - sessions change frequently
        ...options,
    });
}

/**
 * Hook for fetching sessions by trainer
 */
export function useTrainerSessions(trainerId: number | null, options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['sessions', 'trainer', trainerId],
        queryFn: () => trainerId ? api.getSessionsByTrainer(trainerId) : Promise.resolve([]),
        enabled: !!trainerId,
        staleTime: 60 * 1000,
        ...options,
    });
}

// ==========================================
// ANALYTICS HOOKS  
// ==========================================

/**
 * Hook for fetching dashboard analytics
 */
export function useDashboardAnalytics(options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => api.getAnalyticsDashboard(),
        staleTime: 30 * 1000, // 30 seconds - dashboard should be fairly fresh
        ...options,
    });
}

/**
 * Hook for fetching PT revenue analytics
 */
export function usePTRevenueAnalytics(options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['analytics', 'pt-revenue'],
        queryFn: () => api.getPTRevenueAnalytics(),
        staleTime: 60 * 1000,
        ...options,
    });
}

// ==========================================
// TRANSACTION HOOKS
// ==========================================

export interface TransactionsParams {
    page?: number;
    size?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Hook for fetching transactions with pagination
 */
export function useTransactions(params: TransactionsParams = {}, options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['transactions', 'list', params],
        queryFn: () => api.getTransactions(),
        staleTime: 60 * 1000,
        ...options,
    });
}

// ==========================================
// MUTATION HOOKS
// ==========================================

/**
 * Hook for creating a member
 */
export function useCreateMember(options?: UseMutationOptions) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => api.createMember(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
        ...options,
    });
}

/**
 * Hook for updating a member
 */
export function useUpdateMember(options?: UseMutationOptions) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ memberId, data }: { memberId: number; data: any }) => 
            api.updateMember(memberId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['members', 'detail', variables.memberId] });
        },
        ...options,
    });
}

/**
 * Hook for creating a session
 */
export function useCreateSession(options?: UseMutationOptions) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => api.createPTSession(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
        ...options,
    });
}

/**
 * Hook for updating a session
 */
export function useUpdateSession(options?: UseMutationOptions) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: number; data: any }) => 
            api.updatePTSession(sessionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
        ...options,
    });
}

// ==========================================
// USER PROFILE HOOKS
// ==========================================

/**
 * Hook for fetching current user profile
 */
export function useCurrentUser(options?: Partial<UseQueryOptions>) {
    return useQuery({
        queryKey: ['user', 'current'],
        queryFn: () => api.getCurrentUser(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile(options?: UseMutationOptions) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => api.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
        },
        ...options,
    });
}
