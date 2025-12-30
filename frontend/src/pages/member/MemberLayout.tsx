import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Home, User, CreditCard, Activity, BookOpen, UserCheck, Calendar, Bell } from 'lucide-react';
import type { NavItem } from '../../components/Layout/CommandRail';

interface MemberLayoutProps {
    children?: React.ReactNode;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
    const navItems: NavItem[] = [
        { path: '/member', icon: <Home size={20} />, label: 'Dashboard', color: '#dc2626' },
        { path: '/member/profile', icon: <User size={20} />, label: 'My Profile', color: '#dc2626' },
        { path: '/member/membership', icon: <CreditCard size={20} />, label: 'My Membership', color: '#dc2626' },
        { path: '/member/progress', icon: <Activity size={20} />, label: 'My Progress', color: '#dc2626' },
        { path: '/member/classes', icon: <BookOpen size={20} />, label: 'Available Classes', color: '#dc2626' },
        { path: '/member/trainer', icon: <UserCheck size={20} />, label: 'My Trainer', color: '#dc2626' },
        { path: '/member/bookings', icon: <Calendar size={20} />, label: 'My Bookings', color: '#dc2626' },
        { path: '/member/notifications', icon: <Bell size={20} />, label: 'Notifications', color: '#dc2626' },
    ];

    return (
        <DashboardLayout navItems={navItems} showUtilityBar={false}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default MemberLayout;
