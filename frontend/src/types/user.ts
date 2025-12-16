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
  createdAt?: string;
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
  roles?: Role[];
  packageId?: number;
}
