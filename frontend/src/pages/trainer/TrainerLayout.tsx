import React, { useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Home, User, Users, BookOpen, Calendar, Bell, ClipboardList, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import type { NavItem } from '../../components/Layout/CommandRail';
import '../../styles/unified-design-system.css';

interface TrainerLayoutProps {
    children?: React.ReactNode;
}

const TrainerLayout: React.FC<TrainerLayoutProps> = ({ children }) => {
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'trainer');
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, []);

    const navItems: NavItem[] = [
        { path: '/trainer', icon: <Home size={20} />, label: 'Dashboard', color: '#EF4444', end: true },
        { path: '/trainer/profile', icon: <User size={20} />, label: 'My Profile', color: '#3B82F6' },
        { path: '/trainer/members', icon: <Users size={20} />, label: 'My Members', color: '#8B5CF6' },
        { path: '/trainer/classes', icon: <BookOpen size={20} />, label: 'My Classes', color: '#10B981' },
        { path: '/trainer/schedule', icon: <Calendar size={20} />, label: 'My Schedule', color: '#F59E0B' },
        { path: '/trainer/progress-notes', icon: <ClipboardList size={20} />, label: 'Progress Notes', color: '#EC4899' },
        { path: '/trainer/messages', icon: <MessageSquare size={20} />, label: 'Messages', color: '#06B6D4' },
        { path: '/trainer/reports', icon: <TrendingUp size={20} />, label: 'Reports', color: '#6366F1' },
        { path: '/trainer/notifications', icon: <Bell size={20} />, label: 'Notifications', color: '#F97316' },
        { path: '/trainer/settings', icon: <Settings size={20} />, label: 'Settings', color: '#64748B' },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
};

export default TrainerLayout;
