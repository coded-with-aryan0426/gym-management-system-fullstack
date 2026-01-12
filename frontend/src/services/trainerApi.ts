/**
 * Trainer API Service
 * Dedicated API layer for all trainer-related operations
 */

import { apiClient } from './api';

// ============ Types ============

export interface TrainerProfile {
    userId: number;
    fullName: string;
    email: string;
    phone: string | null;
    phoneNumber: string | null;
    avatarId: string | null;
    status: string;
    createdAt: string;
    role?: string;
    department?: string;
    employeeId?: string;
    specializations?: string[];
    bio?: string;
}

export interface TrainerDashboardData {
    trainerId: number;
    trainerName: string;
    email: string;
    assignedMembersCount: number;
    todaysSessionsCount: number;
    upcomingSessionsCount: number;
    unreadNotificationsCount: number;
}

export interface TrainerMember {
    userId: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatarId: string | null;
    createdAt: string;
    status?: string;
}

export interface TrainerSession {
    sessionId: number;
    trainer?: { userId: number; fullName?: string };
    member?: { userId: number; fullName?: string; email?: string };
    sessionDate: string; // ISO datetime from backend
    durationMinutes: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | string;
    progressNotes?: string;
    workoutPlan?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
}

export interface ProgressNote {
    id: number;
    trainerId: number;
    memberId: number;
    note: string;
    createdAt: string;
    category?: string;
    mood?: string;
    sessionType?: string;
    highlights?: string;
    concerns?: string;
    stats?: string;
    tags?: string;
    attachments?: string;
    followUp?: string;
    private?: boolean;
}

export interface ProfileUpdateData {
    fullName?: string;
    phoneNumber?: string;
    avatarId?: string;
    bio?: string;
    specializations?: string[];
}

export interface MemberSearchParams {
    page?: number;
    size?: number;
    q?: string;
    status?: 'active' | 'inactive' | 'at-risk' | 'all';
    sort?: string;
}

export interface PagedMemberResponse {
    items: TrainerMemberDetail[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface TrainerMemberDetail extends TrainerMember {
    plan?: string;
    expiryDays?: number;
    lastVisit?: string;
    goal?: string;
    trainerAssigned?: boolean;
    stats?: {
        classes: number;
        weight?: string;
        ptSessions?: string;
    };
}

// Standardized API Response shape
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
}

// ============ Response Handlers ============

function normalizeResponse<T>(response: any): T {
    if (response && typeof response === 'object' && 'success' in response) {
        if (!response.success) {
            throw new Error(response.message || 'API request failed');
        }
        // If data is null/undefined, return a safe default based on expected type
        if (response.data === undefined || response.data === null) {
            return {} as T;
        }
        return response.data as T;
    }
    return response as T;
}

function unwrapArray<T>(data: any): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    if (typeof data === 'object') {
        // Standard ApiResponse structure
        if ('success' in data) {
            if (!data.success) return [];
            const innerData = data.data;
            if (!innerData) return [];
            if (Array.isArray(innerData)) return innerData;
            if (Array.isArray(innerData.items)) return innerData.items;
            return [];
        }

        // Direct wrappers
        if (Array.isArray(data.items)) return data.items;
        if (data.data && Array.isArray(data.data.items)) return data.data.items;
        if (data.data && Array.isArray(data.data)) return data.data;
    }
    return [];
}

// ============ API Object ============

export const trainerApi = {
    async getDashboard(): Promise<TrainerDashboardData> {
        const response = await apiClient.get('/trainer/dashboard');
        return normalizeResponse<TrainerDashboardData>(response.data);
    },

    async getProfile(): Promise<TrainerProfile> {
        const response = await apiClient.get('/trainer/profile');
        return normalizeResponse<TrainerProfile>(response.data);
    },

    async updateProfile(data: ProfileUpdateData): Promise<TrainerProfile> {
        const response = await apiClient.put('/trainer/profile', data);
        return normalizeResponse<TrainerProfile>(response.data);
    },

    async getMyMembers(): Promise<TrainerMember[]> {
        const response = await apiClient.get('/trainer/my-members');
        return unwrapArray<TrainerMember>(response.data);
    },

    async getSchedule(startDate?: string, endDate?: string): Promise<TrainerSession[]> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await apiClient.get('/trainer/schedule', { params });
        return normalizeResponse<TrainerSession[]>(response.data);
    },

    async getMemberNotes(memberId: number): Promise<ProgressNote[]> {
        const response = await apiClient.get(`/trainer/members/${memberId}/notes`);
        return normalizeResponse<ProgressNote[]>(response.data);
    },

    async addMemberNote(memberId: number, note: string): Promise<ProgressNote> {
        const response = await apiClient.post(`/trainer/members/${memberId}/notes`, { note });
        return normalizeResponse<ProgressNote>(response.data);
    },

    async getAllNotes(): Promise<ProgressNote[]> {
        const response = await apiClient.get('/trainer/notes');
        return normalizeResponse<ProgressNote[]>(response.data);
    },

    async getMyMembersPaginated(params: MemberSearchParams = {}): Promise<PagedMemberResponse> {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.set('page', String(params.page));
        if (params.size !== undefined) queryParams.set('size', String(params.size));
        if (params.q) queryParams.set('q', params.q);
        if (params.status && params.status !== 'all') queryParams.set('status', params.status);
        if (params.sort) queryParams.set('sort', params.sort);

        const response = await apiClient.get(`/trainer/my-members?${queryParams.toString()}`);
        return normalizeResponse<PagedMemberResponse>(response.data);
    },
};

export default trainerApi;
