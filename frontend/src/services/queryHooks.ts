import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api from './api';

/**
 * React Query hooks for optimized data fetching
 * Provides automatic caching, deduplication, and background refetching
 */

// ==========================================
// MEMBER HOOKS
// ==========================================

export interface MembersParams {
    page?: number;
    size?: number;
    search?: string;
}

/**
 * Hook for fetching paginated members with caching
 */
export function useMembers(params: MembersParams = {}, options?: Partial<UseQueryOptions>) {
    const { page = 0, size = 20, search = '' } = params;
    
    return useQuery({
        queryKey: ['members', 'list', { page, size, search }],
        queryFn: () => api.getMembersPaginated(page, size, search),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
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
// TRAINER HOOKS
// ==========================================

export interface TrainersParams {
    page?: number;
    size?: number;
    search?: string;
}

/**
 * Hook for fetching trainers
 */
export function useTrainers(params: TrainersParams = {}, options?: Partial<UseQueryOptions>) {
    const { page = 0, size = 20, search = '' } = params;
    
    return useQuery({
        queryKey: ['trainers', 'list', { page, size, search }],
        queryFn: () => api.getTrainers(),
        staleTime: 2 * 60 * 1000,
        ...options,
    });
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
