// User-related type definitions
export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  password?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  roles: Role[];
  plan?: MembershipPlan;
  status?: 'ACTIVE' | 'EXPIRED';
  createdAt: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Role {
  roleId: number;
  roleName: 'OWNER' | 'TRAINER' | 'STAFF' | 'CUSTOMER';
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
