import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import type { NavItem } from '../../components/Layout/CommandRail';
import '../../styles/unified-design-system.css';

interface MemberLayoutProps {
    children?: React.ReactNode;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
    useEffect(() => {
        document.documentElement.setAttribute('data-layout', 'member');
        return () => {
            document.documentElement.removeAttribute('data-layout');
        };
    }, []);

    const navItems: NavItem[] = [
        { path: '/member', label: 'Dashboard', key: 'dashboard', color: '#EF4444', end: true },
        { path: '/member/profile', label: 'My Profile', key: 'profile', color: '#3B82F6' },
        { path: '/member/membership', label: 'My Membership', key: 'my-membership', color: '#8B5CF6' },
        { path: '/member/progress', label: 'My Progress', key: 'my-progress', color: '#10B981' },
        { path: '/member/attendance', label: 'My Attendance', key: 'my-attendance', color: '#F59E0B' },
        { path: '/member/classes', label: 'Available Classes', key: 'available-classes', color: '#F59E0B' },
        { path: '/member/trainer', label: 'My Trainer', key: 'my-trainer', color: '#06B6D4' },
        { path: '/member/bookings', label: 'My Bookings', key: 'my-bookings', color: '#EC4899' },
        { path: '/member/messages', label: 'Messages', key: 'notifications', color: '#6366F1' },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default MemberLayout;
