import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Users, Calendar, Clock, Activity, Bell, FileText, 
    MessageSquare, TrendingUp, ChevronRight, Play,
    CheckCircle, User, Zap, DollarSign, Target,
    Phone, AlertCircle, Award, Flame, Dumbbell
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { UnifiedPage } from '../../components/shared/UnifiedPage';
import { UnifiedCard } from '../../components/shared/UnifiedCard';
import './TrainerDashboard.css';

interface Session {
    id: string;
    title: string;
    type: 'class' | 'pt' | 'group';
    startTime: Date;
    endTime: Date;
    room: string;
    enrolled: number;
    capacity: number;
    status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
    members?: { id: string; name: string; avatar?: string; checkedIn: boolean }[];
}

interface Member {
    id: string;
    name: string;
    avatar?: string;
    lastSession: string;
    nextSession?: string;
    progress: number;
    streak: number;
    phone?: string;
    email?: string;
}

interface DashboardData {
    trainerName: string;
    trainerId: string;
    todayEarnings: number;
    weekEarnings: number;
    monthEarnings: number;
    completedToday: number;
    totalToday: number;
    attendanceRate: number;
    assignedMembers: number;
    activeMembers: number;
}

const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sessions, setSessions] = useState<Session[]>([]);
    const [recentMembers, setRecentMembers] = useState<Member[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        setData({
            trainerName: 'John',
            trainerId: 'TR001',
            todayEarnings: 2450,
            weekEarnings: 12800,
            monthEarnings: 48500,
            completedToday: 2,
            totalToday: 5,
            attendanceRate: 94,
            assignedMembers: 24,
            activeMembers: 18,
        });

        const mockSessions: Session[] = [
            {
                id: '1',
                title: 'Morning Yoga',
                type: 'class',
                startTime: new Date(today.getTime() + 6 * 60 * 60 * 1000),
                endTime: new Date(today.getTime() + 7 * 60 * 60 * 1000),
                room: 'Studio A',
                enrolled: 12,
                capacity: 15,
                status: 'completed',
            },
            {
                id: '3',
                title: 'PT: Emma Davis',
                type: 'pt',
                startTime: new Date(now.getTime() - 20 * 60 * 1000),
                endTime: new Date(now.getTime() + 40 * 60 * 1000),
                room: 'Training Zone',
                enrolled: 1,
                capacity: 1,
                status: 'in-progress',
            },
            {
                id: '4',
                title: 'Strength Training',
                type: 'class',
                startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
                endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),
                room: 'Weight Room',
                enrolled: 6,
                capacity: 10,
                status: 'upcoming',
            }
        ];

        setSessions(mockSessions);
        setActiveSessionId('3');

        setRecentMembers([
            { id: '1', name: 'Emma Davis', lastSession: 'Today', nextSession: 'Now', progress: 78, streak: 12 },
            { id: '2', name: 'David Lee', lastSession: 'Yesterday', nextSession: '4:00 PM', progress: 65, streak: 8 }
        ]);
    }, []);

    const currentSession = useMemo(() => sessions.find(s => s.status === 'in-progress'), [sessions]);

    const getTimeRemaining = (endTime: Date) => {
        const diff = differenceInMinutes(endTime, currentTime);
        if (diff <= 0) return 'Ending soon';
        if (diff < 60) return `${diff} min left`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m left`;
    };

    if (!data) return <div className="trainer-loading">Loading...</div>;

    return (
        <UnifiedPage className="trainer-dashboard-unified">
            <header className="trainer-dashboard__header" style={{ marginBottom: 32 }}>
                <span className="text-subtitle">{currentTime.getHours() < 12 ? 'Good Morning' : 'Good Afternoon'}</span>
                <h1 className="heading-hero">Coach {data.trainerName}</h1>
                <p className="text-subtitle">
                    {format(currentTime, 'EEEE, MMMM d')} • {format(currentTime, 'h:mm a')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
                    <UnifiedCard hover={false} className="header-stat-card">
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Today's Earnings</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>₹{data.todayEarnings.toLocaleString()}</div>
                    </UnifiedCard>
                    <UnifiedCard hover={false} className="header-stat-card">
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Active Members</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{data.activeMembers}</div>
                    </UnifiedCard>
                    <UnifiedCard hover={false} className="header-stat-card">
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Attendance</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{data.attendanceRate}%</div>
                    </UnifiedCard>
                </div>
            </header>

            <div className="layout-dashboard">
                <div className="layout-main-content">
                    {currentSession && (
                        <UnifiedCard className="current-session-banner-unified" hover={false} style={{ background: 'rgba(0, 122, 255, 0.1)', border: '1px solid var(--accent-blue)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-blue)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                                        <Zap size={14} fill="currentColor" /> LIVE SESSION
                                    </div>
                                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>{currentSession.title}</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>{currentSession.room} • {getTimeRemaining(currentSession.endTime)}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="btn-premium-outline">Add Note</button>
                                    <button className="btn-premium">End Session</button>
                                </div>
                            </div>
                        </UnifiedCard>
                    )}

                    <section>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="section-title"><Calendar size={20} /> Today's Schedule</h2>
                            <button onClick={() => navigate('/trainer/schedule')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>View Full <ChevronRight size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {sessions.map((session, idx) => (
                                <UnifiedCard key={session.id} delay={idx * 0.05} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                                        <div style={{ fontSize: 18, fontWeight: 700 }}>{format(session.startTime, 'h:mm')}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{format(session.startTime, 'a')}</div>
                                    </div>
                                    <div style={{ width: 1, height: 40, background: 'var(--border-main)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 2 }}>{session.type.toUpperCase()}</div>
                                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{session.title}</h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{session.room} • {session.enrolled}/{session.capacity} Enrolled</p>
                                    </div>
                                    {session.status === 'completed' ? <CheckCircle color="var(--accent-green)" /> : <button className="btn-premium-outline btn-sm">Start</button>}
                                </UnifiedCard>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="layout-sidebar">
                    <UnifiedCard>
                        <h3 style={{ fontSize: 14, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Earnings</h3>
                        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>₹{data.monthEarnings.toLocaleString()}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>This Week</span>
                                <span style={{ fontWeight: 600 }}>₹{data.weekEarnings.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Today</span>
                                <span style={{ fontWeight: 600 }}>₹{data.todayEarnings.toLocaleString()}</span>
                            </div>
                        </div>
                        <button className="btn-premium" style={{ width: '100%', marginTop: 24 }}>View Report</button>
                    </UnifiedCard>

                    <UnifiedCard>
                        <h3 style={{ fontSize: 14, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 16 }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                            {[
                                { icon: <MessageSquare size={20} />, label: 'Messages', path: '/trainer/messages' },
                                { icon: <Bell size={20} />, label: 'Alerts', path: '/trainer/notifications' },
                                { icon: <TrendingUp size={20} />, label: 'Reports', path: '/trainer/reports' },
                                { icon: <User size={20} />, label: 'Settings', path: '/trainer/settings' }
                            ].map(action => (
                                <button key={action.label} onClick={() => navigate(action.path)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'white' }}>
                                    {action.icon}
                                    <span style={{ fontSize: 12 }}>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </UnifiedCard>
                </aside>
            </div>
        </UnifiedPage>
    );
};

export default TrainerDashboard;
