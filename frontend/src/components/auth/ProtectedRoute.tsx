import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // DEV MODE: Completely bypass ALL authentication on localhost
    // This allows accessing any page without login during development
    const isDevelopment = import.meta.env.DEV ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    // In development, ALWAYS allow access - no auth checks at all
    if (isDevelopment) {
        return <>{children}</>;
    }

    // === PRODUCTION AUTH CHECKS BELOW ===
    // Only run auth checks in production

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access control
    const userRole = (user.staffRole || user.role || '').toUpperCase();
    const isAuthorized = allowedRoles.some(role => {
        const r = role.toUpperCase();
        if (r === 'ADMIN' || r === 'OWNER') return userRole === 'ADMIN' || userRole === 'OWNER';
        if (r === 'CUSTOMER') return userRole === 'CUSTOMER' || userRole === 'MEMBER';
        return userRole === r;
    });

    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

