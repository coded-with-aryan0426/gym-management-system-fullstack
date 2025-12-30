import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Home, User, Users, BookOpen, Calendar, Bell } from 'lucide-react';
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
        { path: '/trainer/notifications', icon: <Bell size={20} />, label: 'Notifications', color: '#dc2626' },
    ];

    return (
        <DashboardLayout navItems={navItems} showUtilityBar={false}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default TrainerLayout;
