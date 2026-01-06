import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Clock, Activity, Bell,
    MessageSquare, TrendingUp, ChevronRight,
    CheckCircle, User, Zap, DollarSign,
    Phone, Award, Dumbbell, FileText, MapPin,
    Play, AlertCircle
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { usePageEntry, useCountUp, useButtonPress } from '../../hooks/useAnimations';
import ActiveSessionToast from '../../components/shared/ActiveSessionToast';
import './TrainerDashboard.css'; // Dedicated Mission Control styles

interface Session {
    id: string;
    title: string;
    type: 'class' | 'pt' | 'group';
    startTime: Date;
    endTime: Date;
    room: string;
    enrolled: number;
    capacity: number;
    status: 'upcoming' | 'in-progress' | 'completed';
}

interface DashboardData {
    trainerName: string;
    todayEarnings: number;
    monthEarnings: number;
    completedToday: number;
    totalToday: number;
    attendanceRate: number;
    activeMembers: number;
    totalMembers: number;
}

const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showToast, setShowToast] = useState(true);
    const [toastStatus, setToastStatus] = useState<'active' | 'ended'>('active');
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        setData({
            trainerName: 'John Smith',
            todayEarnings: 2450,
            monthEarnings: 48500,
            completedToday: 2,
            totalToday: 5,
            attendanceRate: 94,
            activeMembers: 18,
            totalMembers: 24,
        });

        setSessions([
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
                id: '2',
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
                id: '3',
                title: 'Strength Training',
                type: 'class',
                startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
                endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),
                room: 'Weight Room',
                enrolled: 6,
                capacity: 10,
                status: 'upcoming',
            },
            {
                id: '4',
                title: 'PT: Mike Chen',
                type: 'pt',
                startTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
                endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),
                room: 'Training Zone',
                enrolled: 1,
                capacity: 1,
                status: 'upcoming',
            }
        ]);
    }, []);

    const currentSession = useMemo(() => sessions.find(s => s.status === 'in-progress'), [sessions]);
    // const upcomingSessions = useMemo(() => sessions.filter(s => s.status === 'upcoming').slice(0, 3), [sessions]);

    const getTimeRemaining = (endTime: Date) => {
        const diff = differenceInMinutes(endTime, currentTime);
        if (diff <= 0) return 'Ending';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    // Animation refs
    const monthEarningsRef = useRef<HTMLDivElement>(null);
    const todayEarningsRef = useRef<HTMLDivElement>(null);

    // Page entry animations for cards
    usePageEntry('.quick-stat, .current-session-banner, .session-timeline, .members-attention', { stagger: 50 });
    usePageEntry('.header-stat', { delay: 200, stagger: 30 });

    // Count-up animations for KPIs
    useCountUp(monthEarningsRef, data?.monthEarnings || 0, { prefix: '₹', duration: 1000 });
    useCountUp(todayEarningsRef, data?.todayEarnings || 0, { prefix: '₹', duration: 800 });

    const buttonPress = useButtonPress();

    // Handlers
    const handleSessionAction = () => {
        setToastStatus('ended');
    };

    const handleToastClose = () => {
        setShowToast(false);
        // Optional: Reset status after closing if needed, though unmounting handles it
    };

    if (!data) return <div className="tp" style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading...</div>;

    const quickActions = [
        { icon: <Calendar size={16} />, label: 'Schedule', path: '/trainer/schedule' },
        { icon: <Users size={16} />, label: 'Members', path: '/trainer/members' },
        { icon: <FileText size={16} />, label: 'Notes', path: '/trainer/progress-notes' },
        { icon: <MessageSquare size={16} />, label: 'Messages', path: '/trainer/messages' },
        { icon: <TrendingUp size={16} />, label: 'Reports', path: '/trainer/reports' },
        { icon: <Bell size={16} />, label: 'Alerts', path: '/trainer/notifications' },
    ];

    return (
        <div className="trainer-dashboard-v2">
            {/* Global Toast Notification */}
            {currentSession && showToast && (
                <ActiveSessionToast
                    status={toastStatus}
                    current={{
                        name: 'Emma Davis', // Using demo data to match image for now
                        type: 'Personal Training',
                        location: 'Training Zone',
                        initial: 'E',
                        avatarColor: '#8B5CF6',
                        progress: 65,
                        timeRemaining: getTimeRemaining(currentSession.endTime)
                    }}
                    next={{
                        name: 'Mike Johnson',
                        avatarUrl: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=1f2937&color=fff'
                    }}
                    onComplete={handleSessionAction}
                    onCancel={handleSessionAction}
                    onClose={handleToastClose}
                />
            )}

            {/* Header Section */}
            <div className="trainer-dashboard-v2__header">
                <div className="trainer-dashboard-v2__greeting">
                    <h1>{currentTime.getHours() < 12 ? 'Good Morning' : 'Good Afternoon'}, {data.trainerName.split(' ')[0]}</h1>
                    <p className="trainer-dashboard-v2__date">{format(currentTime, 'EEEE, MMMM do')} • <span className="live-time">{format(currentTime, 'h:mm a')}</span></p>
                </div>

                <div className="trainer-dashboard-v2__header-stats">
                    <div ref={todayEarningsRef} className="header-stat">
                        <span className="header-stat__value">₹0</span>
                        <span className="header-stat__label">Today</span>
                    </div>
                    <div className="header-stat header-stat--progress">
                        <div className="header-stat__progress-ring">
                            <svg viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${data.attendanceRate}, 100`} />
                            </svg>
                            <span className="header-stat__progress-text">{data.attendanceRate}%</span>
                        </div>
                        <span className="header-stat__label">Attend</span>
                    </div>
                </div>
            </div>

            <div className="trainer-dashboard-v2__content">

                {/* 1. Quick Stats Grid */}
                <div className="trainer-dashboard-v2__quick-stats">
                    <div className="quick-stat quick-stat--earnings">
                        <div className="quick-stat__icon"><DollarSign size={20} /></div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value" ref={monthEarningsRef}>₹0</span>
                            <span className="quick-stat__label">Monthly Earnings</span>
                        </div>
                        <span className="quick-stat__trend quick-stat__trend--up"><TrendingUp size={12} /> +12%</span>
                    </div>

                    <div className="quick-stat quick-stat--sessions">
                        <div className="quick-stat__icon"><Dumbbell size={20} /></div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value">{data.completedToday}/{data.totalToday}</span>
                            <span className="quick-stat__label">Sessions Done</span>
                        </div>
                        <div className="quick-stat__mini-chart">
                            <svg viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={`${(data.completedToday / data.totalToday) * 100}, 100`} />
                            </svg>
                        </div>
                    </div>

                    <div className="quick-stat quick-stat--members">
                        <div className="quick-stat__icon"><Users size={20} /></div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value">{data.activeMembers}</span>
                            <span className="quick-stat__label">Active Clients</span>
                        </div>
                        <button className="quick-stat__action" onClick={() => navigate('/trainer/members')} {...buttonPress}><ChevronRight size={16} /></button>
                    </div>

                    {/* Quick Actions as a specialized card */}
                    <div className="quick-stat" style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {quickActions.slice(0, 4).map(action => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                {...buttonPress}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 8, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', height: '100%', gap: 4
                                }}
                            >
                                {action.icon}
                                <span style={{ fontSize: 10 }}>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Main Content Grid */}
                <div className="trainer-dashboard-v2__main-grid">

                    {/* Left Col: Schedule */}
                    <div>
                        <div className="section-header">
                            <h2><Calendar size={18} /> Today's Agenda</h2>
                            <button className="section-header__link" onClick={() => navigate('/trainer/schedule')}>View Full Schedule <ChevronRight size={14} /></button>
                        </div>

                        <div className="session-timeline">
                            {sessions.filter(s => s.status !== 'in-progress').map((session, i) => (
                                <div key={session.id} className={`session-timeline__item session-timeline__item--${session.status}`}>
                                    <div className="session-timeline__time">
                                        <span className="session-timeline__time-text">{format(session.startTime, 'h:mm')}</span>
                                        <span className="session-timeline__time-period">{format(session.startTime, 'a')}</span>
                                    </div>
                                    <div className="session-timeline__marker">
                                        <div className={`session-timeline__dot session-timeline__dot--${session.status}`}>
                                            {session.status === 'completed' ? <CheckCircle size={14} /> : <div style={{ width: 8, height: 8, background: 'currentColor', borderRadius: '50%' }} />}
                                        </div>
                                        {i < sessions.length - 1 && <div className="session-timeline__line" />}
                                    </div>
                                    <div className="session-timeline__content">
                                        <div className="session-timeline__header">
                                            <span className="session-timeline__type">{session.type}</span>
                                            {session.status === 'in-progress' && <span className="session-timeline__live-badge">LIVE</span>}
                                        </div>
                                        <h4 className="session-timeline__title">{session.title}</h4>
                                        <p className="session-timeline__meta">{session.room} • {session.enrolled}/{session.capacity} Enrolled</p>
                                        {session.status === 'upcoming' && i === 0 && (
                                            <button className="session-timeline__action" {...buttonPress}>Check In</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Col: Attention & Quick Members */}
                    <div className="trainer-dashboard-v2__members-section">
                        <div className="members-attention">
                            <h3><AlertCircle size={16} /> Needs Attention</h3>
                            <div className="members-attention__list">
                                <div className="member-quick-card">
                                    <div className="member-quick-card__avatar" style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)' }}><span>JS</span></div>
                                    <div className="member-quick-card__info">
                                        <h4>John Smith</h4>
                                        <p className="member-quick-card__last">Missed 2 Sessions</p>
                                    </div>
                                    <button className="member-quick-card__btn" {...buttonPress}><MessageSquare size={14} /></button>
                                </div>
                                <div className="member-quick-card">
                                    <div className="member-quick-card__avatar"><span>AK</span></div>
                                    <div className="member-quick-card__info">
                                        <h4>Alice Kay</h4>
                                        <p className="member-quick-card__last">Goal Review Due</p>
                                    </div>
                                    <button className="member-quick-card__btn" {...buttonPress}><Calendar size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
