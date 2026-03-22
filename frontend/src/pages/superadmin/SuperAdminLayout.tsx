import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import {
    LayoutDashboard, Building2, Users, DollarSign,
    Bug, ToggleRight, Shield, Database, BarChart3
} from 'lucide-react';
import type { NavItem } from '../../components/Layout/CommandRail';
import { superAdminApi } from '../../services/superAdminApi';
import '../../styles/unified-design-system.css';
import './superadmin.css';

interface SuperAdminLayoutProps {
    children?: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
    // Portal auth guard — redirect if not authenticated via passphrase
    const isPortalAuth = superAdminApi.isAuthenticated();

    useEffect(() => {
        if (isPortalAuth) {
            document.documentElement.setAttribute('data-theme', 'superadmin');
        }
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, [isPortalAuth]);

    if (!isPortalAuth) {
        return <Navigate to="/portal" replace />;
    }

    const navItems: NavItem[] = [
        { path: '/superadmin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', color: '#f87171', end: true },
        { path: '/superadmin/gyms', icon: <Building2 size={20} />, label: 'Gyms', color: '#3b82f6' },
        { path: '/superadmin/users', icon: <Users size={20} />, label: 'Users', color: '#8b5cf6' },
        { path: '/superadmin/revenue', icon: <DollarSign size={20} />, label: 'Revenue', color: '#10b981' },
        { path: '/superadmin/errors', icon: <Bug size={20} />, label: 'Errors', color: '#ef4444' },
        { path: '/superadmin/features', icon: <ToggleRight size={20} />, label: 'Features', color: '#f59e0b' },
        { path: '/superadmin/security', icon: <Shield size={20} />, label: 'Security', color: '#06b6d4' },
        { path: '/superadmin/database', icon: <Database size={20} />, label: 'Database', color: '#a78bfa' },
        { path: '/superadmin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics', color: '#fb923c' },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default SuperAdminLayout;
