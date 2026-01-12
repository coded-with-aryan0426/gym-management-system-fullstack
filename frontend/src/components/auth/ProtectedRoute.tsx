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
    const isDevMode = localStorage.getItem('dev_mode_active') === 'true';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // GOD MODE: In development, if dev_mode_active is set, bypass ALL security checks
    if (isDevMode && (import.meta.env.DEV || window.location.hostname === 'localhost')) {
        return <>{children}</>;
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
