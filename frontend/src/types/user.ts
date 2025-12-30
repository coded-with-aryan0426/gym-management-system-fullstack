// User-related type definitions
export interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  roles?: Role[];
  role?: string; // Legacy support
  // Frontend transient fields
  plan?: string | { name: string };
  status?: string;
  joinDate?: string;
  leavingDate?: string; // When staff left the gym
  createdAt?: string;
  membershipDaysRemaining?: number; // Calculated field for display
  avatarId?: string | null; // Persistent avatar selection
}

export interface MemberDTO {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  planName: string
  planDuration: string
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  joinDate?: string;
}

export interface Role {
  roleId: number;
  roleName?: string;
}

export interface MembershipPlan {
  id: number;
  packageId?: number;
  name: 'Gold Plan' | 'Silver Plan' | 'Platinum Plan';
  price: number;
  expiryDate?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  fullName: string;
  password: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  roles?: Role[];
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  password?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  avatarId?: string | null; // Persistent avatar selection
  roles?: Role[];
  packageId?: number;
  status?: string; // Active, On Leave, Inactive, Left
  joinDate?: string; // YYYY-MM-DD format
  leavingDate?: string; // YYYY-MM-DD format (when staff left)
}
