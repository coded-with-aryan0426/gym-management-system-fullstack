export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  primaryRole: string;
  isFirstLogin: boolean;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface UserContext {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  primaryRole: string;
  rolesByGym: Record<number, string[]>;
  activeGymId?: number;
  isFirstLogin: boolean;
}

export interface GymContext {
  gymId: number;
  gymName: string;
  userRoles: string[];
  permissions: string[];
}

export interface PermissionCheck {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasRoleInGym: (gymId: number, role: string) => boolean;
}
