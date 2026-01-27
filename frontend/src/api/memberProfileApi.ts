import { apiClient } from '../services/api';

export interface MemberStats {
    totalWorkouts: number;
    currentStreak: number;
    memberLevel: string;
    joinedDate: string | null;
}

export interface MembershipInfo {
    membershipId: number;
    planName: string;
    planType: string | null;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    status: string;
}

export interface Achievement {
    id: number;
    type: string;
    name: string;
    description: string | null;
    earnedAt: string;
}

export interface MemberProfileData {
    userId: number;
    fullName: string;
    email: string;
    phone: string | null;
    avatarId: string | null;
    status: string;
    createdAt: string;
    dateOfBirth: string | null;
    gender: string | null;
    bloodType: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    healthNotes: string | null;
    fitnessGoals: string[];
    height: number | null;
    weight: number | null;
    bodyFat: number | null;
    twoFactorEnabled: boolean;
    stats: MemberStats;
    membership: MembershipInfo | null;
    achievements: Achievement[];
}

export interface MemberProfileUpdate {
    fullName?: string;
    phone?: string;
    avatarId?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    healthNotes?: string;
    fitnessGoals?: string[];
    height?: number;
    weight?: number;
    bodyFat?: number;
}

export const memberProfileApi = {
    getProfile: async (memberId: number): Promise<MemberProfileData> => {
        const response = await apiClient.get<MemberProfileData>('/member/profile', {
            params: { memberId }
        });
        return response.data;
    },

    updateProfile: async (memberId: number, data: MemberProfileUpdate): Promise<MemberProfileData> => {
        const response = await apiClient.put<MemberProfileData>('/member/profile', data, {
            params: { memberId }
        });
        return response.data;
    }
};

export type { MemberProfileData as MemberProfile };
