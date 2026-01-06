import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import FloatingActionButton from '../../components/shared/FloatingActionButton';
import { Home, User, Users, BookOpen, Calendar, Bell, ClipboardList, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import type { NavItem } from '../../components/Layout/CommandRail';
import '../../styles/unified-design-system.css';

interface Session {
    id: string;
    clientName: string;
    sessionType: string;
    startTime: Date;
    endTime: Date;
    room?: string;
}

interface TrainerLayoutProps {
    children?: React.ReactNode;
}

const TrainerLayout: React.FC<TrainerLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [nextSession, setNextSession] = useState<Session | null>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'trainer');
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, []);

    // Mock session data - In production, this would come from API/context
    useEffect(() => {
        const now = new Date();

        // Create a mock "in-progress" session
        const mockCurrentSession: Session = {
            id: 'session-1',
            clientName: 'Emma Davis',
            sessionType: 'Personal Training',
            startTime: new Date(now.getTime() - 20 * 60 * 1000), // Started 20 mins ago
            endTime: new Date(now.getTime() + 40 * 60 * 1000),   // Ends in 40 mins
            room: 'Training Zone'
        };

        const mockNextSession: Session = {
            id: 'session-2',
            clientName: 'Mike Johnson',
            sessionType: 'Strength Training',
            startTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
            endTime: new Date(now.getTime() + 120 * 60 * 1000),
            room: 'Weight Room'
        };

        setCurrentSession(mockCurrentSession);
        setNextSession(mockNextSession);
    }, []);

    const navItems: NavItem[] = [
        { path: '/trainer', icon: <Home size={20} />, label: 'Dashboard', color: '#4F46E5', end: true },
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

    // FAB handlers
    const handleAddNote = (data: { clientName?: string; sessionType?: string; note: string }) => {
        console.log('Note added:', data);
        // In production: API call to save note
        navigate('/trainer/progress-notes');
    };

    const handleQuickLog = () => {
        console.log('Quick log session');
        // In production: Open quick log modal or mark session
    };

    const handleBlockTime = () => {
        console.log('Block time');
        navigate('/trainer/schedule');
    };

    // HUD handlers
    const handleSessionComplete = (sessionId: string) => {
        console.log('Session completed:', sessionId);
        setCurrentSession(null);
        // In production: API call to mark complete
    };

    const handleSessionNoShow = (sessionId: string) => {
        console.log('Session no-show:', sessionId);
        setCurrentSession(null);
        // In production: API call to mark no-show
    };

    const currentClient = currentSession ? {
        name: currentSession.clientName,
        sessionType: currentSession.sessionType
    } : undefined;

    return (
        <DashboardLayout navItems={navItems} showUtilityBar={false}>
            {children ? children : <Outlet />}
        </DashboardLayout>
    );
};

export default TrainerLayout;

