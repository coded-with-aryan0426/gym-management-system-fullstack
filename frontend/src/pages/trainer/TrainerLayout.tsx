import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
        { path: '/trainer', icon: <Home size={20} />, label: 'Dashboard', color: '#4F46E5' },
        { path: '/trainer/profile', icon: <User size={20} />, label: 'My Profile', color: '#4F46E5' },
        { path: '/trainer/members', icon: <Users size={20} />, label: 'My Members', color: '#4F46E5' },
        { path: '/trainer/classes', icon: <BookOpen size={20} />, label: 'My Classes', color: '#4F46E5' },
        { path: '/trainer/schedule', icon: <Calendar size={20} />, label: 'My Schedule', color: '#4F46E5' },
        { path: '/trainer/progress-notes', icon: <ClipboardList size={20} />, label: 'Progress Notes', color: '#4F46E5' },
        { path: '/trainer/messages', icon: <MessageSquare size={20} />, label: 'Messages', color: '#4F46E5' },
        { path: '/trainer/notifications', icon: <Bell size={20} />, label: 'Notifications', color: '#4F46E5' },
        { path: '/trainer/reports', icon: <TrendingUp size={20} />, label: 'Reports', color: '#4F46E5' },
        { path: '/trainer/settings', icon: <Settings size={20} />, label: 'Settings', color: '#4F46E5' },
    ];

    return (
        <DashboardLayout navItems={navItems} showUtilityBar={false}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default TrainerLayout;
