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
    phoneNumber?: string;
    status: string;
    createdAt?: string;
    joinDate?: string;
    startDate?: string;
    endDate?: string;
    planName?: string;
    planDuration?: string;
    membershipStatus?: string;
    membershipExpiry?: string;
    trainerId?: number;
    trainerName?: string;
    avatarId?: string;
    roles?: Role[];
    // Phase 1 additions
    paymentStatus?: 'paid' | 'unpaid' | 'overdue' | 'partial';
    lastPaymentDate?: string;
    amountDue?: number;
    lastCheckInDate?: string;
    lastCheckInTime?: string;
    // Phase 2 additions
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    healthNotes?: string;
    fitnessGoals?: string;
    address?: string;
    dateOfBirth?: string;
    height?: number;
    weight?: number;
}

// Transaction type for payment history
export interface MemberTransaction {
    transactionId: number;
    userId: number;
    amount: number;
    type: string;
    category?: string;
    description?: string;
    status: string;
    referenceNumber?: string;
    dateTime: string;
    createdAt?: string;
    createdBy?: string;
}

// Check-in type for attendance history
export interface MemberCheckIn {
    checkInId: number;
    userId?: number;
    checkInTime: string;
    checkOutTime?: string;
    status: string;
}

// Member note type
export interface MemberNote {
    noteId?: number;
    userId: number;
    content: string;
    author?: string;
    createdAt: string;
    pinned?: boolean;
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
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    healthNotes?: string;
    fitnessGoals?: string;
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

export interface TrainerPerformance {
    trainerId: number;
    clientCount: number;
    monthlyRevenue: number;
    completedSessions: number;
    totalHours: number;
}
