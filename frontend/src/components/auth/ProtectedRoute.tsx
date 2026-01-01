import React from 'react';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

/**
 * DEV MODE: Authentication bypassed for frontend development.
 * All routes are accessible without login.
 * TODO: Re-enable authentication before production deployment.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // DEV MODE: Always allow access - no authentication check
    return <>{children}</>;
};

export default ProtectedRoute;
