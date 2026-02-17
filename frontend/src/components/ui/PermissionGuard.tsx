import React from 'react';
import { useMultiRoleAuth } from '../../contexts/MultiRoleAuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  gymId?: number;
}

/**
 * PermissionGuard component - Conditionally renders children based on user permissions and roles
 * 
 * @param children - Content to render if user has required permissions/roles
 * @param permissions - Array of required permissions
 * @param roles - Array of required roles
 * @param requireAll - If true, user must have ALL permissions/roles (default: false - any is sufficient)
 * @param fallback - Content to render if user doesn't have required permissions/roles
 * @param gymId - Optional gym ID to check permissions against specific gym
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  gymId
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, hasRoleInGym } = useMultiRoleAuth();

  // Check permissions
  const hasRequiredPermissions = () => {
    if (permissions.length === 0) return true;
    
    if (requireAll) {
      return hasAllPermissions(permissions);
    } else {
      return hasAnyPermission(permissions);
    }
  };

  // Check roles
  const hasRequiredRoles = () => {
    if (roles.length === 0) return true;
    
    if (requireAll) {
      return roles.every(role => hasRole(role));
    } else {
      return hasAnyRole(roles);
    }
  };

  // Check gym-specific permissions if gymId is provided
  const hasGymSpecificAccess = () => {
    if (!gymId) return true;
    
    // Check if user has any of the required roles in the specific gym
    if (roles.length > 0) {
      return requireAll 
        ? roles.every(role => hasRoleInGym(gymId, role))
        : roles.some(role => hasRoleInGym(gymId, role));
    }
    
    return true;
  };

  const canAccess = hasRequiredPermissions() && hasRequiredRoles() && hasGymSpecificAccess();

  if (canAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Higher-order component for permission-based route protection
 */
export const withPermissionGuard = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[],
  requiredRoles?: string[],
  requireAll: boolean = false,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <PermissionGuard
      permissions={requiredPermissions}
      roles={requiredRoles}
      requireAll={requireAll}
      fallback={fallback}
    >
      <Component {...props} />
    </PermissionGuard>
  );

  WrappedComponent.displayName = `withPermissionGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook for checking permissions programmatically
 */
export const usePermissionCheck = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasRole, 
    hasAnyRole, 
    hasRoleInGym 
  } = useMultiRoleAuth();

  const canAccess = ({
    permissions = [],
    roles = [],
    requireAll = false,
    gymId
  }: {
    permissions?: string[];
    roles?: string[];
    requireAll?: boolean;
    gymId?: number;
  }) => {
    // Check permissions
    const hasRequiredPermissions = permissions.length === 0 || (
      requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions)
    );

    // Check roles
    const hasRequiredRoles = roles.length === 0 || (
      requireAll
        ? roles.every(role => hasRole(role))
        : hasAnyRole(roles)
    );

    // Check gym-specific access
    const hasGymAccess = !gymId || (
      roles.length > 0 && (
        requireAll
          ? roles.every(role => hasRoleInGym(gymId, role))
          : roles.some(role => hasRoleInGym(gymId, role))
      )
    );

    return hasRequiredPermissions && hasRequiredRoles && hasGymAccess;
  };

  return {
    canAccess,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasRoleInGym
  };
};

/**
 * Permission-based button component
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  gymId?: number;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissions,
  roles,
  requireAll = false,
  fallback,
  gymId,
  children,
  ...props
}) => {
  return (
    <PermissionGuard
      permissions={permissions}
      roles={roles}
      requireAll={requireAll}
      fallback={fallback}
      gymId={gymId}
    >
      <button {...props}>
        {children}
      </button>
    </PermissionGuard>
  );
};

/**
 * Permission-based link component
 */
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  gymId?: number;
  to?: string;
}

export const PermissionLink: React.FC<PermissionLinkProps> = ({
  permissions,
  roles,
  requireAll = false,
  fallback,
  gymId,
  to,
  children,
  ...props
}) => {
  const linkProps = to ? { href: to } : props;

  return (
    <PermissionGuard
      permissions={permissions}
      roles={roles}
      requireAll={requireAll}
      fallback={fallback}
      gymId={gymId}
    >
      <a {...linkProps}>
        {children}
      </a>
    </PermissionGuard>
  );
};

export default PermissionGuard;
