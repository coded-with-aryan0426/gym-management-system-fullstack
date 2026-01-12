/**
 * Trainer API Service
 * Dedicated API layer for all trainer-related operations
 * 
 * SECURITY: Trainer identity is derived from JWT token (Authorization header)
 * The backend extracts trainerId from the authenticated user context.
 * NO trainerId is passed from frontend to prevent unauthorized access.
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
}

export interface ProfileUpdateData {
    fullName?: string;
    phoneNumber?: string;
    avatarId?: string;
    bio?: string;
    specializations?: string[];
}

// Standardized API Response shape
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
}

// ============ Response Handler ============

/**
 * Normalizes API responses to standard shape
 * Handles both legacy direct responses and new standardized format
 */
function normalizeResponse<T>(response: unknown): T {
    // Check if response follows standard shape
    if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        'data' in response
    ) {
        const standardResponse = response as ApiResponse<T>;
        if (!standardResponse.success) {
            throw new Error(standardResponse.message || 'API request failed');
        }
        return standardResponse.data as T;
    }
    // Legacy response - return directly
    return response as T;
}

/**
 * Unwraps array data from both direct arrays and paginated responses
 * Handles: T[], { items: T[] }, and ApiResponse<{ items: T[] }>
 */
function unwrapArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        // Check for paginated response
        if (Array.isArray(obj.items)) {
            return obj.items as T[];
        }
        // Check for standard ApiResponse with paginated data
        if (obj.data && typeof obj.data === 'object') {
            const innerData = obj.data as Record<string, unknown>;
            if (Array.isArray(innerData.items)) {
                return innerData.items as T[];
            }
            if (Array.isArray(obj.data)) {
                return obj.data as T[];
            }
        }
    }
    // Fallback - return empty array to prevent crashes
    console.warn('unwrapArray: unexpected data shape', data);
    return [];
}

// ============ API Functions ============

/**
 * Trainer API - All endpoints use JWT for authentication
 * Backend extracts trainer identity from the authenticated user
 */
const trainerApi = {
    /**
     * Get trainer dashboard overview
     * @returns Dashboard data for the authenticated trainer
     */
    async getDashboard(): Promise<TrainerDashboardData> {
        const response = await apiClient.get<TrainerDashboardData | ApiResponse<TrainerDashboardData>>(
            '/trainer/dashboard'
        );
        return normalizeResponse<TrainerDashboardData>(response.data);
    },

    /**
     * Get trainer's own profile
     * Identity derived from JWT - no trainerId needed
     */
    async getProfile(): Promise<TrainerProfile> {
        const response = await apiClient.get<TrainerProfile | ApiResponse<TrainerProfile>>(
            '/trainer/profile'
        );
        return normalizeResponse<TrainerProfile>(response.data);
    },

    /**
     * Update trainer's own profile
     * Backend validates ownership via JWT
     */
    async updateProfile(data: ProfileUpdateData): Promise<TrainerProfile> {
        const response = await apiClient.put<TrainerProfile | ApiResponse<TrainerProfile>>(
            '/trainer/profile',
            data
        );
        return normalizeResponse<TrainerProfile>(response.data);
    },

    /**
     * Get members assigned to authenticated trainer (simple array, for Dashboard)
     * Handles both legacy array response and new paginated response
     */
    async getMyMembers(): Promise<TrainerMember[]> {
        const response = await apiClient.get<unknown>('/trainer/my-members');
        // Handle paginated response: extract items array
        return unwrapArray<TrainerMember>(response.data);
    },

    /**
     * Get trainer's schedule (PT sessions)
     * Backend filters by authenticated trainer
     */
    async getSchedule(startDate?: string, endDate?: string): Promise<TrainerSession[]> {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await apiClient.get<TrainerSession[] | ApiResponse<TrainerSession[]>>(
            '/trainer/schedule',
            { params }
        );
        return normalizeResponse<TrainerSession[]>(response.data);
    },

    /**
     * Get progress notes for a specific member
     * Backend validates trainer has access to this member
     */
    async getMemberNotes(memberId: number): Promise<ProgressNote[]> {
        const response = await apiClient.get<ProgressNote[] | ApiResponse<ProgressNote[]>>(
            `/trainer/members/${memberId}/notes`
        );
        return normalizeResponse<ProgressNote[]>(response.data);
    },

    /**
     * Add a progress note for a member
     * Backend validates trainer-member relationship
     */
    async addMemberNote(memberId: number, note: string): Promise<ProgressNote> {
        const response = await apiClient.post<ProgressNote | ApiResponse<ProgressNote>>(
            `/trainer/members/${memberId}/notes`,
            { note }
        );
        return normalizeResponse<ProgressNote>(response.data);
    },

    /**
     * Get all progress notes by authenticated trainer
     */
    async getAllNotes(): Promise<ProgressNote[]> {
        const response = await apiClient.get<ProgressNote[] | ApiResponse<ProgressNote[]>>(
            '/trainer/notes'
        );
        return normalizeResponse<ProgressNote[]>(response.data);
    },

    /**
     * Get paginated members assigned to authenticated trainer
     * Supports search, filtering, and pagination (server-side)
     */
    async getMyMembersPaginated(params: MemberSearchParams = {}): Promise<PagedMemberResponse> {
        const queryParams = new URLSearchParams();

        if (params.page !== undefined) queryParams.set('page', String(params.page));
        if (params.size !== undefined) queryParams.set('size', String(params.size));
        if (params.q) queryParams.set('q', params.q);
        if (params.status && params.status !== 'all') queryParams.set('status', params.status);
        if (params.sort) queryParams.set('sort', params.sort);

        const response = await apiClient.get<PagedMemberResponse | ApiResponse<PagedMemberResponse>>(
            `/trainer/my-members?${queryParams.toString()}`
        );
        return normalizeResponse<PagedMemberResponse>(response.data);
    },
};

// ============ Pagination Types ============

export interface MemberSearchParams {
    page?: number;
    size?: number;
    q?: string;          // Search query (name/email)
    status?: 'active' | 'inactive' | 'at-risk' | 'all';
    sort?: string;       // e.g. 'lastVisit:desc'
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

export default trainerApi;
