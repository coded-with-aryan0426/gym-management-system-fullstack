import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import MultiRoleCommandRail from './MultiRoleCommandRail';
import UtilityBar from './UtilityBar';
import { useMultiRoleAuth } from '../../contexts/MultiRoleAuthContext';
import { PermissionGuard } from '../ui/PermissionGuard';
import './AppShell.css';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: true,
    toggleCollapsed: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

interface MultiRoleAppShellProps {
    children?: React.ReactNode;
    showUtilityBar?: boolean;
    requiredPermissions?: string[];
    requiredRoles?: string[];
}

const MultiRoleAppShell: React.FC<MultiRoleAppShellProps> = ({ 
    children, 
    showUtilityBar = true,
    requiredPermissions = [],
    requiredRoles = []
}) => {
    const { user, hasPermission, hasRole } = useMultiRoleAuth();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const stored = localStorage.getItem('sidebar-collapsed');
            return stored === null ? true : stored === 'true';
        } catch {
            return true;
        }
    });

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('sidebar-collapsed', String(next));
            } catch { /* ignore */ }
            return next;
        });
    };

    // Determine if utility bar should be shown based on user permissions
    const shouldShowUtilityBar = showUtilityBar && (
        hasPermission('BILLING_VIEW') || 
        hasPermission('ANALYTICS_VIEW') || 
        hasPermission('SYSTEM_SETTINGS') ||
        hasRole('OWNER') || 
        hasRole('ADMIN')
    );

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>
            <div className={`app-shell multi-role-app-shell ${isCollapsed ? 'app-shell--collapsed' : ''}`}>
                {/* Dynamic Command Rail based on permissions */}
                <MultiRoleCommandRail isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
                
                <div className="app-shell__main">
                    {/* Utility Bar with permission check */}
                    {shouldShowUtilityBar && <UtilityBar />}
                    
                    <main className="app-shell__content multi-role-content">
                        {/* Permission wrapper for main content */}
                        <PermissionGuard
                            permissions={requiredPermissions}
                            roles={requiredRoles}
                            fallback={
                                <div className="access-denied">
                                    <div className="access-denied__icon">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                    </div>
                                    <h2>Access Denied</h2>
                                    <p>You don't have the required permissions to access this page.</p>
                                    <p>
                                        Required: {requiredPermissions.length > 0 ? requiredPermissions.join(', ') : 'None'}<br/>
                                        Your roles: {user?.roles.join(', ') || 'None'}
                                    </p>
                                </div>
                            }
                        >
                            {children || <Outlet />}
                        </PermissionGuard>
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default MultiRoleAppShell;
