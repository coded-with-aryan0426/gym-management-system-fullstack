import * as React from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

const { createContext, useContext, useState, useEffect, useCallback } = React;

// Permission types matching backend
export type Permission = 
  // User Management
  | 'USER_VIEW' | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_ASSIGN_ROLES'
  // Gym Management
  | 'GYM_VIEW' | 'GYM_CREATE' | 'GYM_UPDATE' | 'GYM_DELETE' | 'GYM_MANAGE_SETTINGS'
  // Member Management
  | 'MEMBER_VIEW' | 'MEMBER_CREATE' | 'MEMBER_UPDATE' | 'MEMBER_DELETE' | 'MEMBER_MANAGE_MEMBERSHIP'
  // Trainer Management
  | 'TRAINER_VIEW' | 'TRAINER_CREATE' | 'TRAINER_UPDATE' | 'TRAINER_DELETE' | 'TRAINER_ASSIGN_CUSTOMERS'
  // Training Sessions
  | 'SESSION_VIEW' | 'SESSION_CREATE' | 'SESSION_UPDATE' | 'SESSION_DELETE' | 'SESSION_MANAGE_OWN'
  // Staff Management
  | 'STAFF_VIEW' | 'STAFF_CREATE' | 'STAFF_UPDATE' | 'STAFF_DELETE' | 'STAFF_MANAGE_SHIFTS'
  // Performance & Analytics
  | 'PERFORMANCE_VIEW' | 'PERFORMANCE_MANAGE' | 'ANALYTICS_VIEW' | 'REPORTS_GENERATE'
  // Financial Management
  | 'BILLING_VIEW' | 'BILLING_MANAGE' | 'PAYMENTS_PROCESS' | 'REFUNDS_PROCESS'
  // System Administration
  | 'SYSTEM_SETTINGS' | 'SYSTEM_BACKUP' | 'AUDIT_VIEW' | 'MAINTENANCE_MODE'
  // Communication
  | 'NOTIFICATIONS_SEND' | 'EMAIL_SEND' | 'ANNOUNCEMENTS_CREATE'
  // Equipment Management
  | 'EQUIPMENT_VIEW' | 'EQUIPMENT_CREATE' | 'EQUIPMENT_UPDATE' | 'EQUIPMENT_DELETE' | 'EQUIPMENT_MAINTENANCE';

export type GymRole = 'OWNER' | 'ADMIN' | 'TRAINER' | 'MEMBER';

interface PermissionState {
  permissions: Permission[];
  roles: GymRole[];
  primaryRole: GymRole | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface PermissionContextType extends PermissionState {
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Role checks
  hasRole: (role: GymRole) => boolean;
  hasAnyRole: (roles: GymRole[]) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isTrainer: () => boolean;
  isMember: () => boolean;
  
  // Utilities
  refreshPermissions: () => Promise<void>;
  canAccess: (requiredPermissions?: Permission[], requiredRoles?: GymRole[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [state, setState] = useState<PermissionState>({
    permissions: [],
    roles: [],
    primaryRole: null,
    loading: true,
    error: null,
    lastFetched: null,
  });

  const fetchPermissions = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setState(prev => ({
        ...prev,
        loading: false,
        permissions: [],
        roles: [],
        primaryRole: null,
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.get<{
        userId: number;
        primaryRole: string | null;
        roles: string[];
        permissions: string[];
      }>('/settings/permissions/my-permissions');
      
      if (response.data) {
        setState({
          permissions: (response.data.permissions || []) as Permission[],
          roles: (response.data.roles || []) as GymRole[],
          primaryRole: response.data.primaryRole as GymRole | null,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      
      // Fallback: try to get permissions from localStorage user data
      try {
        const userStr = localStorage.getItem('authUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          setState({
            permissions: (user.permissions || []) as Permission[],
            roles: (user.roles || []) as GymRole[],
            primaryRole: user.primaryRole as GymRole | null,
            loading: false,
            error: null,
            lastFetched: new Date(),
          });
          return;
        }
      } catch (parseError) {
        console.error('Failed to parse cached user data:', parseError);
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load permissions',
      }));
    }
  }, []);

  // Fetch permissions on mount and when auth changes
  useEffect(() => {
    fetchPermissions();
    
    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'authUser') {
        fetchPermissions();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchPermissions]);

  // Permission check methods
  const hasPermission = useCallback((permission: Permission): boolean => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => state.permissions.includes(p));
  }, [state.permissions]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => state.permissions.includes(p));
  }, [state.permissions]);

  // Role check methods
  const hasRole = useCallback((role: GymRole): boolean => {
    return state.roles.includes(role);
  }, [state.roles]);

  const hasAnyRole = useCallback((roles: GymRole[]): boolean => {
    return roles.some(r => state.roles.includes(r));
  }, [state.roles]);

  const isOwner = useCallback((): boolean => hasRole('OWNER'), [hasRole]);
  const isAdmin = useCallback((): boolean => hasRole('ADMIN'), [hasRole]);
  const isTrainer = useCallback((): boolean => hasRole('TRAINER'), [hasRole]);
  const isMember = useCallback((): boolean => hasRole('MEMBER'), [hasRole]);

  // Combined access check
  const canAccess = useCallback((
    requiredPermissions?: Permission[], 
    requiredRoles?: GymRole[]
  ): boolean => {
    // Owner always has access
    if (state.roles.includes('OWNER')) return true;
    
    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(requiredRoles)) return false;
    }
    
    // Check permission requirements
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!hasAnyPermission(requiredPermissions)) return false;
    }
    
    return true;
  }, [state.roles, hasAnyRole, hasAnyPermission]);

  const value: PermissionContextType = {
    ...state,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isOwner,
    isAdmin,
    isTrainer,
    isMember,
    refreshPermissions: fetchPermissions,
    canAccess,
  };

  return React.createElement(PermissionContext.Provider, { value }, children);
};

// Main hook
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Convenience hooks for common permission patterns
export const useMemberPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewMembers: hasPermission('MEMBER_VIEW'),
    canCreateMembers: hasPermission('MEMBER_CREATE'),
    canEditMembers: hasPermission('MEMBER_UPDATE'),
    canDeleteMembers: hasPermission('MEMBER_DELETE'),
    canManageMembership: hasPermission('MEMBER_MANAGE_MEMBERSHIP'),
    canAccessMemberSection: canAccess(['MEMBER_VIEW']),
  };
};

export const useTrainerPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewTrainers: hasPermission('TRAINER_VIEW'),
    canCreateTrainers: hasPermission('TRAINER_CREATE'),
    canEditTrainers: hasPermission('TRAINER_UPDATE'),
    canDeleteTrainers: hasPermission('TRAINER_DELETE'),
    canAssignCustomers: hasPermission('TRAINER_ASSIGN_CUSTOMERS'),
    canAccessTrainerSection: canAccess(['TRAINER_VIEW']),
  };
};

export const useSessionPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewSessions: hasPermission('SESSION_VIEW'),
    canCreateSessions: hasPermission('SESSION_CREATE'),
    canEditSessions: hasPermission('SESSION_UPDATE'),
    canDeleteSessions: hasPermission('SESSION_DELETE'),
    canManageOwnSessions: hasPermission('SESSION_MANAGE_OWN'),
    canAccessSessionSection: canAccess(['SESSION_VIEW']),
  };
};

export const useBillingPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewBilling: hasPermission('BILLING_VIEW'),
    canManageBilling: hasPermission('BILLING_MANAGE'),
    canProcessPayments: hasPermission('PAYMENTS_PROCESS'),
    canProcessRefunds: hasPermission('REFUNDS_PROCESS'),
    canAccessBillingSection: canAccess(['BILLING_VIEW']),
  };
};

export const useStaffPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewStaff: hasPermission('STAFF_VIEW'),
    canCreateStaff: hasPermission('STAFF_CREATE'),
    canEditStaff: hasPermission('STAFF_UPDATE'),
    canDeleteStaff: hasPermission('STAFF_DELETE'),
    canManageShifts: hasPermission('STAFF_MANAGE_SHIFTS'),
    canAccessStaffSection: canAccess(['STAFF_VIEW']),
  };
};

export const useAnalyticsPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewPerformance: hasPermission('PERFORMANCE_VIEW'),
    canManagePerformance: hasPermission('PERFORMANCE_MANAGE'),
    canViewAnalytics: hasPermission('ANALYTICS_VIEW'),
    canGenerateReports: hasPermission('REPORTS_GENERATE'),
    canAccessAnalyticsSection: canAccess(['ANALYTICS_VIEW', 'PERFORMANCE_VIEW']),
  };
};

export const useEquipmentPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canViewEquipment: hasPermission('EQUIPMENT_VIEW'),
    canCreateEquipment: hasPermission('EQUIPMENT_CREATE'),
    canEditEquipment: hasPermission('EQUIPMENT_UPDATE'),
    canDeleteEquipment: hasPermission('EQUIPMENT_DELETE'),
    canScheduleMaintenance: hasPermission('EQUIPMENT_MAINTENANCE'),
    canAccessEquipmentSection: canAccess(['EQUIPMENT_VIEW']),
  };
};

export const useSystemPermissions = () => {
  const { hasPermission, canAccess } = usePermissions();
  
  return {
    canManageSettings: hasPermission('SYSTEM_SETTINGS'),
    canPerformBackup: hasPermission('SYSTEM_BACKUP'),
    canViewAuditLogs: hasPermission('AUDIT_VIEW'),
    canToggleMaintenance: hasPermission('MAINTENANCE_MODE'),
    canAccessSystemSection: canAccess(['SYSTEM_SETTINGS']),
  };
};

// Higher-order component for permission-based rendering
interface PermissionGateProps {
  permissions?: Permission[];
  roles?: GymRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  roles,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole, hasAnyRole, isOwner } = usePermissions();
  
  // Owner always has access
  if (isOwner()) {
    return React.createElement(React.Fragment, null, children);
  }
  
  // Check role requirements
  if (roles && roles.length > 0) {
    const hasRequiredRole = requireAll 
      ? roles.every(r => hasRole(r))
      : hasAnyRole(roles);
    if (!hasRequiredRole) {
      return React.createElement(React.Fragment, null, fallback);
    }
  }
  
  // Check permission requirements
  if (permissions && permissions.length > 0) {
    const hasRequiredPermission = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    if (!hasRequiredPermission) {
      return React.createElement(React.Fragment, null, fallback);
    }
  }
  
  return React.createElement(React.Fragment, null, children);
};

// Hook for conditional rendering based on permissions
export const useConditionalRender = () => {
  const permissions = usePermissions();
  
  const renderIf = useCallback((
    condition: boolean,
    content: React.ReactNode,
    fallback: React.ReactNode = null
  ): React.ReactNode => {
    return condition ? content : fallback;
  }, []);
  
  const renderIfHasPermission = useCallback((
    permission: Permission,
    content: React.ReactNode,
    fallback: React.ReactNode = null
  ): React.ReactNode => {
    return permissions.hasPermission(permission) ? content : fallback;
  }, [permissions]);
  
  const renderIfHasRole = useCallback((
    role: GymRole,
    content: React.ReactNode,
    fallback: React.ReactNode = null
  ): React.ReactNode => {
    return permissions.hasRole(role) ? content : fallback;
  }, [permissions]);
  
  return {
    renderIf,
    renderIfHasPermission,
    renderIfHasRole,
  };
};
