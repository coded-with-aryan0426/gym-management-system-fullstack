import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Home, User, CreditCard, Activity, BookOpen, UserCheck, Calendar, Bell, MessageSquare, Settings } from 'lucide-react';
import type { NavItem } from '../../components/Layout/CommandRail';
import '../../styles/unified-design-system.css';

interface MemberLayoutProps {
    children?: React.ReactNode;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'member');
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, []);

    const navItems: NavItem[] = [
        { path: '/member', icon: <Home size={20} />, label: 'Dashboard', color: '#EF4444', end: true },
        { path: '/member/profile', icon: <User size={20} />, label: 'My Profile', color: '#3B82F6' },
        { path: '/member/membership', icon: <CreditCard size={20} />, label: 'My Membership', color: '#8B5CF6' },
        { path: '/member/progress', icon: <Activity size={20} />, label: 'My Progress', color: '#10B981' },
        { path: '/member/classes', icon: <BookOpen size={20} />, label: 'Available Classes', color: '#F59E0B' },
        { path: '/member/trainer', icon: <UserCheck size={20} />, label: 'My Trainer', color: '#06B6D4' },
        { path: '/member/bookings', icon: <Calendar size={20} />, label: 'My Bookings', color: '#EC4899' },
        { path: '/member/messages', icon: <MessageSquare size={20} />, label: 'Messages', color: '#6366F1' },
        { path: '/member/notifications', icon: <Bell size={20} />, label: 'Notifications', color: '#F97316' },
        { path: '/member/settings', icon: <Settings size={20} />, label: 'Settings', color: '#64748B' },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default MemberLayout;
