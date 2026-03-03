import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

/**
 * Protected Route Component
 * 
 * Enforces authentication and role-based access control.
 * - Returns 401-equivalent redirect if not authenticated
 * - Returns 403-equivalent redirect if role mismatch
 * 
 * NOTE: Auth is ALWAYS enforced, even in development mode.
 * The backend is the final authority - this is a UX guard only.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { openAuthModal } = useAuthModal();
    const location = useLocation();

    // Show loading state while auth is initializing
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // 401 - Not authenticated: redirect to home and open auth modal
    if (!isAuthenticated || !user) {
        console.warn('[Auth] Not authenticated, redirecting to home');
        return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
    }

    // Normalize user role (handle role, case insensitivity)
    const userRole = (user.role || '').toUpperCase();

    // Normalize allowed roles and check authorization
    const isAuthorized = allowedRoles.some(role => {
        const normalizedRole = role.toUpperCase();

        // ADMIN and OWNER are equivalent
        if (normalizedRole === 'ADMIN' || normalizedRole === 'OWNER') {
            return userRole === 'ADMIN' || userRole === 'OWNER';
        }

        // CUSTOMER and MEMBER are equivalent
        if (normalizedRole === 'CUSTOMER' || normalizedRole === 'MEMBER') {
            return userRole === 'CUSTOMER' || userRole === 'MEMBER';
        }

        // Exact match for TRAINER and other roles
        return userRole === normalizedRole;
    });

    // 403 - Authenticated but wrong role
    if (!isAuthorized) {
        console.warn(
            `[Auth] Access denied: User role "${userRole}" not authorized for [${allowedRoles.join(', ')}]. ` +
            `Path: ${location.pathname}`
        );
        return <Navigate to="/unauthorized" replace />;
    }

    // Authorized - render children
    return <>{children}</>;
};

export default ProtectedRoute;
