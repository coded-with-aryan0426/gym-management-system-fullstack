import type { User, Role } from './user';

export interface MemberProfileDTO {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    profilePictureUrl?: string;
    roles: Role[];
    status: string;
    joinDate: string;
    membershipStatus?: string;
    membershipPlan?: string;
    membershipExpiry?: string;
    lastVisit?: string;
    attendanceCount?: number;
    isOptimistic?: boolean;
    version?: number;
    lastModified?: string;
}

export interface MemberProfileUpdateDTO {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    profilePictureUrl?: string;
}
