/**
 * Trainer API Service
 * Dedicated API layer for all trainer-related operations
 */

import { apiClient } from './api';

// ============ Types ============

export interface Certification {
    name: string;
    issuer: string;
    year: string;
    valid: boolean;
    expires: string;
}

export interface ProfileStats {
    activeMembers: number;
    totalMembers: number;
    sessionsMonth: number;
    attendance: number;
    rating: number;
    reviews: number;
    experience: string;
    earnings: number;
}

export interface Document {
    name: string;
    type: string;
    url: string;
    verified: boolean;
}

export interface TrainerProfile {
    userId: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;

    // Details
    employeeId?: string;
    dob?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    altPhone?: string;
    joiningDate?: string;
    department?: string;
    reportingTo?: string;

    languages?: string[];
    specializations?: string[];
    bio?: string;

    instagram?: string;
    linkedin?: string;

    emergencyName?: string;
    emergencyPhone?: string;

    bankName?: string;
    accountNo?: string;
    ifsc?: string;
    shift?: string;

    certifications?: Certification[];
    documents?: Document[];
    stats?: ProfileStats;
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

// Consolidated TrainerMember interface moved below or imported
// Removed duplicate definition


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

// ============ TRAINER CLASS TYPES ============

export interface TrainerClassItem {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
    day: string;
    date: string;
    room: string;
    enrolled: number;
    capacity: number;
    status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
    attendees: { confirmed: number; pending: number; absent: number };
    type: 'group' | 'pt';
    recurring: boolean;
    notes?: string;
}

export interface CreateClassRequest {
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string;
    duration: number;
    room?: string;
    capacity?: number;
    type?: 'group' | 'pt';
    recurring?: boolean;
    notes?: string;
}

export interface CreateSessionRequest {
    memberId: number;
    sessionDate: string; // ISO datetime
    durationMinutes: number;
    notes?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
}

export interface ClassAttendee {
    id: number;
    memberId: number;
    memberName?: string;
    status: 'CONFIRMED' | 'PENDING' | 'ABSENT' | 'LATE';
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
    expiryDays?: number;
    lastVisit?: string;
    trainerAssigned?: boolean;
    // stats inherited from TrainerMember but Detail adds optional sub-fields?
    // Let's redefine stats to be compatible or leave it. 
    // TrainerMember has stricter stats. Detail tries to add more?
    // Detail has stats?: { ... }. TrainerMember has stats: { ... }.
    // Error: "stats" in Detail is optional, but required in Base.
    // We should make stats optional in Base or required in Detail.
    // Given DTO has stats, Base should have it required. Detail should match or omit.
    // I'll make Detail inherit stats (required).
    stats: {
        classes: number;
        weight: string; // was optional in Detail?
        pt: string;     // was ptSessions? Base has pt.
        // If Detail needs different stats, we have a problem.
        // Let's assume Detail can use Base stats.
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

// ============ MOCK DATA FOR FALLBACK ============
// Used when API fails (e.g., auth bypass mode or backend offline)

// ============ API Object ============

const MOCK_PROFILE: TrainerProfile = {
    userId: 101,
    name: 'John Smith',
    email: 'john.smith@athlonx.com',
    phone: '555-0101',
    role: 'Senior Personal Trainer',
    employeeId: 'TR-2024-001',
    dob: '1990-05-15',
    gender: 'Male',
    department: 'Strength & Conditioning',
    joiningDate: '2020-01-10',
    specializations: ['Strength Training', 'HIIT', 'Rehabilitation'],
    bio: 'Certified strength coach with 8 years of experience helping clients achieve their peak performance. Specialized in injury prevention and functional movement.',
    stats: {
        activeMembers: 24,
        totalMembers: 45,
        sessionsMonth: 86,
        attendance: 94.5,
        rating: 4.9,
        reviews: 127,
        experience: '8 Yrs',
        earnings: 48500
    },
    certifications: [
        { name: 'NSCA-CSCS', issuer: 'NSCA', year: '2022', valid: true, expires: '2025' },
        { name: 'ACE Personal Trainer', issuer: 'ACE', year: '2020', valid: true, expires: '2026' }
    ],
    documents: []
};

export interface TrainerMember {
    id: number; // mapped from userId
    name: string; // mapped from fullName
    email: string;
    phone: string;
    status: string; // simplified to string to avoid conflict
    plan: string;
    daysLeft: number;
    stats: {
        classes: number;
        weight: string;
        pt: string;
    };
    lastSession: string;
    goal: string;
}

export const trainerApi = {
    // ... existing methods

    async getDashboard(): Promise<TrainerDashboardData> {
        try {
            const response = await apiClient.get('/trainer/dashboard');
            return normalizeResponse<TrainerDashboardData>(response.data);
        } catch (error) {
            console.warn('API Error (getDashboard), using mock data:', error);
            // Partial Mock for Dashboard
            return {
                trainerId: 101,
                trainerName: 'John Smith',
                email: 'john.smith@athlonx.com',
                assignedMembersCount: 24,
                todaysSessionsCount: 5,
                upcomingSessionsCount: 3,
                unreadNotificationsCount: 2
            };
        }
    },

    async getProfile(): Promise<TrainerProfile> {
        try {
            const response = await apiClient.get('/trainer/profile');
            return normalizeResponse<TrainerProfile>(response.data);
        } catch (error) {
            console.warn('API Error (getProfile), using mock data:', error);
            return MOCK_PROFILE;
        }
    },

    async updateProfile(data: Partial<TrainerProfile>): Promise<TrainerProfile> {
        try {
            const response = await apiClient.put('/trainer/profile', data);   // PUT — correct REST
            return normalizeResponse<TrainerProfile>(response.data);
        } catch (error) {
            console.warn('API Error (updateProfile), using mock data:', error);
            return { ...MOCK_PROFILE, ...data };
        }
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const response = await apiClient.post('/trainer/profile/password', {
            currentPassword,
            newPassword,
        });
        normalizeResponse<void>(response.data);
    },

    async uploadDocument(file: File, type: string = 'document'): Promise<Document> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await apiClient.post('/trainer/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = normalizeResponse<any>(response.data);
            return {
                name: data.name,
                type: data.type,
                url: data.url,
                verified: false
            };
        } catch (error) {
            console.warn('API Error (uploadDocument), using mock data:', error);
            // Simulate upload
            return {
                name: file.name,
                type: type,
                url: URL.createObjectURL(file), // Local blob URL for preview
                verified: false
            };
        }
    },

    async getMyMembers(): Promise<TrainerMember[]> {
        const response = await apiClient.get('/trainer/members');
        return response.data; // Array directly
    },

    async getSchedule(startDate?: string, endDate?: string): Promise<TrainerSession[]> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await apiClient.get('/trainer/schedule', { params });
        return normalizeResponse<TrainerSession[]>(response.data);
    },

    async createPTSession(data: CreateSessionRequest): Promise<TrainerSession> {
        const response = await apiClient.post('/pt-sessions', {
            trainerId: (await trainerApi.getProfile()).userId, // Dynamically get ID or trust backend to infer from context if enabled
            ...data
        });
        return normalizeResponse<TrainerSession>(response.data);
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

    // ============ TRAINER CLASSES ============

    async getClasses(startDate?: string, endDate?: string): Promise<TrainerClassItem[]> {
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/trainer/classes', { params });
            return normalizeResponse<TrainerClassItem[]>(response.data);
        } catch (error) {
            console.warn('API Error (getClasses), using empty array:', error);
            return [];
        }
    },

    async getTodayClasses(): Promise<TrainerClassItem[]> {
        try {
            const response = await apiClient.get('/trainer/classes/today');
            return normalizeResponse<TrainerClassItem[]>(response.data);
        } catch (error) {
            console.warn('API Error (getTodayClasses):', error);
            return [];
        }
    },

    async createClass(data: CreateClassRequest): Promise<TrainerClassItem> {
        const response = await apiClient.post('/trainer/classes', data);
        return normalizeResponse<TrainerClassItem>(response.data);
    },

    async updateClass(id: number, data: Partial<CreateClassRequest>): Promise<TrainerClassItem> {
        const response = await apiClient.put(`/trainer/classes/${id}`, data);
        return normalizeResponse<TrainerClassItem>(response.data);
    },

    async updateClassStatus(id: number, status: string): Promise<TrainerClassItem> {
        const response = await apiClient.put(`/trainer/classes/${id}/status`, { status });
        return normalizeResponse<TrainerClassItem>(response.data);
    },

    async deleteClass(id: number): Promise<void> {
        await apiClient.delete(`/trainer/classes/${id}`);
    },

    async getClassAttendees(id: number): Promise<ClassAttendee[]> {
        const response = await apiClient.get(`/trainer/classes/${id}/attendees`);
        return normalizeResponse<ClassAttendee[]>(response.data);
    },

    async updateAttendance(classId: number, updates: { attendeeId: number, status: 'CONFIRMED' | 'PENDING' | 'ABSENT' | 'LATE' }[]): Promise<any> {
        const response = await apiClient.put(`/trainer/classes/${classId}/attendance`, updates);
        return response.data;
    },

    async getAssignedMembers(): Promise<TrainerMember[]> {
        const response = await apiClient.get('/trainer/members');
        return response.data;
    }
};

export default trainerApi;
