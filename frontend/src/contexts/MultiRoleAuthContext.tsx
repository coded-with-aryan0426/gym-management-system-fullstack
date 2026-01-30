import * as React from 'react';
import type { ReactNode } from 'react';
const { createContext, useContext, useReducer, useEffect } = React;

// Temporarily define AuthResponse interface to avoid import issues
interface AuthResponse {
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

// Types for multi-role authentication
export interface UserRole {
  role: string;
  gymId?: number;
  gymName?: string;
  permissions: string[];
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

export interface AuthState {
  isAuthenticated: boolean;
  user: UserContext | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  switchGymContext: (gymId: number) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasRoleInGym: (gymId: number, role: string) => boolean;
  getAccessibleGyms: () => Array<{ id: number; name: string; userRoles: string[] }>;
}

// Permission-based navigation items
export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon?: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  category?: string;
  order?: number;
  badge?: string | number;
  children?: NavItem[];
}

// Icons for navigation items (as strings to avoid JSX issues)
const navigationIcons = {
  dashboard: 'dashboard',
  members: 'members',
  trainers: 'trainers',
  sessions: 'sessions',
  billing: 'billing',
  analytics: 'analytics',
  equipment: 'equipment',
  settings: 'settings',
  reports: 'reports',
  staff: 'staff',
  notifications: 'notifications'
};

// Navigation configuration based on permissions
export const NAVIGATION_CONFIG: NavItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: navigationIcons.dashboard,
    requiredRoles: ['OWNER', 'ADMIN', 'TRAINER', 'MEMBER'],
    category: 'main',
    order: 1
  },
  {
    id: 'members',
    path: '/members',
    label: 'Members',
    icon: navigationIcons.members,
    requiredPermissions: ['MEMBER_VIEW'],
    category: 'main',
    order: 2
  },
  {
    id: 'member-management',
    path: '/members/manage',
    label: 'Member Management',
    icon: navigationIcons.members,
    requiredPermissions: ['MEMBER_CREATE', 'MEMBER_UPDATE', 'MEMBER_DELETE'],
    category: 'management',
    order: 3,
    children: [
      {
        id: 'member-registration',
        path: '/members/register',
        label: 'Register Member',
        icon: navigationIcons.members,
        requiredPermissions: ['MEMBER_CREATE'],
        order: 1
      },
      {
        id: 'membership-plans',
        path: '/members/plans',
        label: 'Membership Plans',
        icon: navigationIcons.billing,
        requiredPermissions: ['MEMBER_MANAGE_MEMBERSHIP'],
        order: 2
      }
    ]
  },
  {
    id: 'trainers',
    path: '/trainers',
    label: 'Trainers',
    icon: navigationIcons.trainers,
    requiredPermissions: ['TRAINER_VIEW'],
    category: 'staff',
    order: 4
  },
  {
    id: 'trainer-management',
    path: '/trainers/manage',
    label: 'Trainer Management',
    icon: navigationIcons.trainers,
    requiredPermissions: ['TRAINER_CREATE', 'TRAINER_UPDATE', 'TRAINER_DELETE'],
    category: 'staff',
    order: 5,
    children: [
      {
        id: 'trainer-assignments',
        path: '/trainers/assignments',
        label: 'Client Assignments',
        icon: navigationIcons.trainers,
        requiredPermissions: ['TRAINER_ASSIGN_CUSTOMERS'],
        order: 1
      }
    ]
  },
  {
    id: 'pt-sessions',
    path: '/pt-sessions',
    label: 'PT Sessions',
    icon: navigationIcons.sessions,
    requiredPermissions: ['SESSION_VIEW'],
    category: 'training',
    order: 6
  },
  {
    id: 'session-management',
    path: '/pt-sessions/manage',
    label: 'Session Management',
    icon: navigationIcons.sessions,
    requiredPermissions: ['SESSION_CREATE', 'SESSION_UPDATE', 'SESSION_DELETE'],
    category: 'training',
    order: 7,
    children: [
      {
        id: 'my-sessions',
        path: '/pt-sessions/my',
        label: 'My Sessions',
        icon: navigationIcons.sessions,
        requiredPermissions: ['SESSION_MANAGE_OWN'],
        order: 1
      },
      {
        id: 'schedule-session',
        path: '/pt-sessions/schedule',
        label: 'Schedule Session',
        icon: navigationIcons.sessions,
        requiredPermissions: ['SESSION_CREATE'],
        order: 2
      }
    ]
  },
  {
    id: 'staff',
    path: '/staff',
    label: 'Staff',
    icon: navigationIcons.staff,
    requiredPermissions: ['STAFF_VIEW'],
    category: 'staff',
    order: 8
  },
  {
    id: 'staff-management',
    path: '/staff/manage',
    label: 'Staff Management',
    icon: navigationIcons.staff,
    requiredPermissions: ['STAFF_CREATE', 'STAFF_UPDATE', 'STAFF_DELETE'],
    category: 'staff',
    order: 9,
    children: [
      {
        id: 'staff-schedules',
        path: '/staff/schedules',
        label: 'Staff Schedules',
        icon: navigationIcons.sessions,
        requiredPermissions: ['STAFF_MANAGE_SHIFTS'],
        order: 1
      },
      {
        id: 'performance',
        path: '/staff/performance',
        label: 'Performance',
        icon: navigationIcons.analytics,
        requiredPermissions: ['PERFORMANCE_VIEW'],
        order: 2
      }
    ]
  },
  {
    id: 'billing',
    path: '/billing',
    label: 'Billing',
    icon: navigationIcons.billing,
    requiredPermissions: ['BILLING_VIEW'],
    category: 'financial',
    order: 10
  },
  {
    id: 'financial-management',
    path: '/billing/manage',
    label: 'Financial Management',
    icon: navigationIcons.billing,
    requiredPermissions: ['BILLING_MANAGE', 'PAYMENTS_PROCESS', 'REFUNDS_PROCESS'],
    category: 'financial',
    order: 11,
    children: [
      {
        id: 'payments',
        path: '/billing/payments',
        label: 'Payments',
        icon: navigationIcons.billing,
        requiredPermissions: ['PAYMENTS_PROCESS'],
        order: 1
      },
      {
        id: 'refunds',
        path: '/billing/refunds',
        label: 'Refunds',
        icon: navigationIcons.billing,
        requiredPermissions: ['REFUNDS_PROCESS'],
        order: 2
      }
    ]
  },
  {
    id: 'analytics',
    path: '/analytics',
    label: 'Analytics',
    icon: navigationIcons.analytics,
    requiredPermissions: ['ANALYTICS_VIEW'],
    category: 'reports',
    order: 12
  },
  {
    id: 'reports',
    path: '/reports',
    label: 'Reports',
    icon: navigationIcons.reports,
    requiredPermissions: ['REPORTS_GENERATE'],
    category: 'reports',
    order: 13
  },
  {
    id: 'equipment',
    path: '/equipment',
    label: 'Equipment',
    icon: navigationIcons.equipment,
    requiredPermissions: ['EQUIPMENT_VIEW'],
    category: 'facilities',
    order: 14
  },
  {
    id: 'equipment-management',
    path: '/equipment/manage',
    label: 'Equipment Management',
    icon: navigationIcons.equipment,
    requiredPermissions: ['EQUIPMENT_CREATE', 'EQUIPMENT_UPDATE', 'EQUIPMENT_DELETE'],
    category: 'facilities',
    order: 15,
    children: [
      {
        id: 'maintenance',
        path: '/equipment/maintenance',
        label: 'Maintenance',
        icon: navigationIcons.equipment,
        requiredPermissions: ['EQUIPMENT_MAINTENANCE'],
        order: 1
      }
    ]
  }
];

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserContext; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: { user: UserContext; token: string } }
  | { type: 'SWITCH_GYM'; payload: { activeGymId: number; user: UserContext } }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'SWITCH_GYM':
      return {
        ...state,
        user: { ...action.payload.user, activeGymId: action.payload.activeGymId },
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const MultiRoleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('authUser');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem('authToken', state.token);
      localStorage.setItem('authUser', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }, [state.token, state.user]);

  const login = async (credentials: { username: string; password: string }) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const authData: AuthResponse = await response.json();

      const userContext: UserContext = {
        userId: authData.userId,
        username: authData.username,
        fullName: authData.fullName,
        email: authData.email,
        roles: authData.roles,
        permissions: authData.permissions,
        primaryRole: authData.primaryRole,
        rolesByGym: {}, // Would be populated from API
        isFirstLogin: authData.isFirstLogin,
      };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userContext, token: authData.token },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async () => {
    if (!state.token) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const authData: AuthResponse = await response.json();

      const userContext: UserContext = {
        userId: authData.userId,
        username: authData.username,
        fullName: authData.fullName,
        email: authData.email,
        roles: authData.roles,
        permissions: authData.permissions,
        primaryRole: authData.primaryRole,
        rolesByGym: state.user?.rolesByGym || {},
        isFirstLogin: authData.isFirstLogin,
      };

      dispatch({
        type: 'REFRESH_TOKEN',
        payload: { user: userContext, token: authData.token },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const switchGymContext = async (gymId: number) => {
    if (!state.token) return;

    try {
      const response = await fetch(`/api/auth/switch-gym/${gymId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gym switch failed');
      }

      const authData: AuthResponse = await response.json();

      const userContext: UserContext = {
        userId: authData.userId,
        username: authData.username,
        fullName: authData.fullName,
        email: authData.email,
        roles: authData.roles,
        permissions: authData.permissions,
        primaryRole: authData.primaryRole,
        rolesByGym: state.user?.rolesByGym || {},
        isFirstLogin: authData.isFirstLogin,
      };

      dispatch({
        type: 'SWITCH_GYM',
        payload: { activeGymId: gymId, user: userContext },
      });
    } catch (error) {
      console.error('Gym switch failed:', error);
      throw error;
    }
  };

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!state.user?.permissions) return false;
    return permissions.some(permission => state.user!.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!state.user?.permissions) return false;
    return permissions.every(permission => state.user!.permissions.includes(permission));
  };

  // Role checking methods
  const hasRole = (role: string): boolean => {
    return state.user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!state.user?.roles) return false;
    return roles.some(role => state.user!.roles.includes(role));
  };

  const hasRoleInGym = (gymId: number, role: string): boolean => {
    const gymRoles = state.user?.rolesByGym[gymId];
    return gymRoles?.includes(role) || false;
  };

  const getAccessibleGyms = () => {
    // This would be populated from the API
    return [];
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    switchGymContext,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasRoleInGym,
    getAccessibleGyms,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

// Hook
export const useMultiRoleAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMultiRoleAuth must be used within a MultiRoleAuthProvider');
  }
  return context;
};

// Navigation hook
export const usePermissionBasedNavigation = () => {
  const { hasPermission, hasAnyPermission, hasRole, hasAnyRole } = useMultiRoleAuth();

  const getFilteredNavigation = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => {
        // Check role requirements
        if (item.requiredRoles && !hasAnyRole(item.requiredRoles)) {
          return false;
        }

        // Check permission requirements
        if (item.requiredPermissions && !hasAnyPermission(item.requiredPermissions)) {
          return false;
        }

        return true;
      })
      .map(item => ({
        ...item,
        children: item.children ? getFilteredNavigation(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getNavigationByCategory = () => {
    const filtered = getFilteredNavigation(NAVIGATION_CONFIG);
    const categories = filtered.reduce((acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, NavItem[]>);

    return categories;
  };

  return {
    getFilteredNavigation,
    getNavigationByCategory,
    hasPermission,
    hasRole,
  };
};
