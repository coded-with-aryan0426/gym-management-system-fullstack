// User-related type definitions
export interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roles?: Role[];
  role?: string; // Legacy support
  // Frontend transient fields
  plan?: string | { name: string };
  status?: string;
}

export interface MemberDTO {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  planName: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface Role {
  roleId: number;
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
  address?: string;
  roles?: Role[];
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  roles?: Role[];
  packageId?: number;
}
