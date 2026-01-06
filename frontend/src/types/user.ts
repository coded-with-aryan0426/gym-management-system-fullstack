/**
 * User-related type definitions
 */

export interface User {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarId?: string;
    status: string;
    createdAt: string;
    roles: Role[];
    // Social auth fields
    googleId?: string;
    facebookId?: string;
    phoneNumber?: string;
    authProvider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
}

export interface Role {
    roleId: number;
    roleName: string;
}

export interface UserGymRole {
    id: number;
    userId: number;
    gymId: number;
    gymName: string;
    role: 'OWNER' | 'ADMIN' | 'TRAINER' | 'MEMBER';
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REVOKED';
    assignedAt: string;
    expiresAt?: string;
}

export interface Member extends User {
    membershipStatus?: string;
    membershipExpiry?: string;
    trainerId?: number;
    trainerName?: string;
}

export interface Staff extends User {
    staffRole?: string;
    gymId?: number;
    gymName?: string;
}

export interface Trainer extends User {
    specialization?: string;
    customerCount?: number;
    customers?: User[];
}

export interface AuthResponse {
    token: string;
    user: User;
    message?: string;
    otpSent?: boolean;
    email?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface OtpVerifyRequest {
    target: string;
    code: string;
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
}

// DTO used by MembersContext
export interface MemberDTO {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    phone?: string;
    status: string;
    createdAt?: string;
    joinDate?: string;
    startDate?: string;
    planName?: string;
    planDuration?: string;
    membershipStatus?: string;
    membershipExpiry?: string;
    trainerId?: number;
    trainerName?: string;
    avatarId?: string;
    roles?: Role[];
}

// DTOs for API operations
export interface CreateUserDto {
    username: string;
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    roles?: string[];
}

export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    phone?: string;
    status?: string;
    avatarId?: string;
}

// Summary view for lists
export interface UserSummary {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    status: string;
    avatarId?: string;
}

