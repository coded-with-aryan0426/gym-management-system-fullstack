import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const location = useLocation();

    // Get user from localStorage
    const userStr = localStorage.getItem('user');

    // Not logged in
    if (!userStr) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // Get user role (handle 'role', 'userRole', 'staffRole' fields, AND nested 'roles' array)
        let userRole = (user.role || user.userRole || user.staffRole || '').toUpperCase();

        // Handle nested roles array (e.g. from Spring Security / JWT) which UtilityBar uses
        if (!userRole && user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
            userRole = (user.roles[0].roleName || user.roles[0].name || '').toUpperCase();
        }

        // Check if user's role is allowed
        const isAllowed = allowedRoles.some(role =>
            role.toUpperCase() === userRole ||
            // OWNER and ADMIN have same privileges
            (role.toUpperCase() === 'ADMIN' && userRole === 'OWNER') ||
            (role.toUpperCase() === 'OWNER' && userRole === 'ADMIN')
        );

        if (!isAllowed) {
            return <Navigate to="/unauthorized" replace />;
        }

        return <>{children}</>;
    } catch {
        // Invalid user data
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
