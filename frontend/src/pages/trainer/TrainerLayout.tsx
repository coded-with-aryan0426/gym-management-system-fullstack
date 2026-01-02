import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Home, User, Users, BookOpen, Calendar, Bell, ClipboardList, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import type { NavItem } from '../../components/Layout/CommandRail';

interface TrainerLayoutProps {
    children?: React.ReactNode;
}

const TrainerLayout: React.FC<TrainerLayoutProps> = ({ children }) => {
    const navItems: NavItem[] = [
        { path: '/trainer', icon: <Home size={20} />, label: 'Dashboard', color: '#dc2626' },
        { path: '/trainer/profile', icon: <User size={20} />, label: 'My Profile', color: '#dc2626' },
        { path: '/trainer/members', icon: <Users size={20} />, label: 'My Members', color: '#dc2626' },
        { path: '/trainer/classes', icon: <BookOpen size={20} />, label: 'My Classes', color: '#dc2626' },
        { path: '/trainer/schedule', icon: <Calendar size={20} />, label: 'My Schedule', color: '#dc2626' },
        { path: '/trainer/progress-notes', icon: <ClipboardList size={20} />, label: 'Progress Notes', color: '#dc2626' },
        { path: '/trainer/messages', icon: <MessageSquare size={20} />, label: 'Messages', color: '#dc2626' },
        { path: '/trainer/notifications', icon: <Bell size={20} />, label: 'Notifications', color: '#dc2626' },
        { path: '/trainer/reports', icon: <TrendingUp size={20} />, label: 'Reports', color: '#dc2626' },
        { path: '/trainer/settings', icon: <Settings size={20} />, label: 'Settings', color: '#dc2626' },
    ];

    return (
        <DashboardLayout navItems={navItems} showUtilityBar={false}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default TrainerLayout;
