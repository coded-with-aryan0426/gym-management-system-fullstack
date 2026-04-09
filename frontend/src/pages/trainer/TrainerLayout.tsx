import React, { useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import type { NavItem } from '../../components/Layout/CommandRail';
import '../../styles/unified-design-system.css';

interface TrainerLayoutProps {
    children?: React.ReactNode;
}

const TrainerLayout: React.FC<TrainerLayoutProps> = ({ children }) => {
    useEffect(() => {
        document.documentElement.setAttribute('data-dashboard', 'trainer');
        return () => {
            document.documentElement.removeAttribute('data-dashboard');
        };
    }, []);

    const navItems: NavItem[] = [
        { path: '/trainer', label: 'Dashboard', key: 'trainer-dashboard', color: '#EF4444', end: true },
        { path: '/trainer/profile', label: 'My Profile', key: 'profile', color: '#3B82F6' },
        { path: '/trainer/members', label: 'My Members', key: 'my-members', color: '#8B5CF6' },
        { path: '/trainer/member-attendance', label: 'Member Attendance', key: 'member-attendance', color: '#10B981' },
        { path: '/trainer/classes', label: 'My Classes', key: 'my-classes', color: '#10B981' },
        { path: '/trainer/schedule', label: 'My Schedule', key: 'my-schedule', color: '#F59E0B' },
        { path: '/trainer/progress-notes', label: 'Progress Notes', key: 'progress-notes', color: '#EC4899' },
        { path: '/trainer/messages', label: 'Messages', key: 'notifications', color: '#06B6D4' },
        { path: '/trainer/reports', label: 'Reports', key: 'reports', color: '#6366F1' },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
};

export default TrainerLayout;
