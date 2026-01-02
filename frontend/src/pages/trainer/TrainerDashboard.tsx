import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Calendar, Clock, Activity, Bell, FileText, 
    MessageSquare, TrendingUp, ChevronRight, Play, Pause,
    CheckCircle, XCircle, User, Timer, DollarSign, Target,
    Zap, ArrowRight, MoreVertical, Phone, Mail, Plus,
    AlertCircle, Award, Flame, Coffee
} from 'lucide-react';
import { format, isToday, isBefore, isAfter, addMinutes, differenceInMinutes } from 'date-fns';
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
                members: [
                    { id: '1', name: 'Sarah Wilson', checkedIn: true },
                    { id: '2', name: 'Mike Chen', checkedIn: true },
                ]
            },
            {
                id: '2',
                title: 'HIIT Session',
                type: 'class',
                startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
                endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
                room: 'Main Floor',
                enrolled: 8,
                capacity: 12,
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
                members: [{ id: '3', name: 'Emma Davis', checkedIn: true }]
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
            },
            {
                id: '5',
                title: 'PT: David Lee',
                type: 'pt',
                startTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
                endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),
                room: 'Training Zone',
                enrolled: 1,
                capacity: 1,
                status: 'upcoming',
                members: [{ id: '4', name: 'David Lee', checkedIn: false }]
            },
        ];

        setSessions(mockSessions);
        setActiveSessionId('3');

        setRecentMembers([
            { id: '1', name: 'Emma Davis', lastSession: 'Today', nextSession: 'Now', progress: 78, streak: 12, phone: '+91 98765 43210', email: 'emma@email.com' },
            { id: '2', name: 'David Lee', lastSession: 'Yesterday', nextSession: '4:00 PM', progress: 65, streak: 8, phone: '+91 98765 43211' },
            { id: '3', name: 'Sarah Wilson', lastSession: 'Today', progress: 92, streak: 24 },
            { id: '4', name: 'Mike Chen', lastSession: '2 days ago', progress: 45, streak: 3 },
            { id: '5', name: 'Priya Sharma', lastSession: '3 days ago', progress: 58, streak: 0 },
        ]);
    }, []);

    const currentSession = useMemo(() => {
        return sessions.find(s => s.status === 'in-progress');
    }, [sessions]);

    const nextSession = useMemo(() => {
        return sessions.find(s => s.status === 'upcoming');
    }, [sessions]);

    const upcomingSessions = useMemo(() => {
        return sessions.filter(s => s.status === 'upcoming');
    }, [sessions]);

    const completedSessions = useMemo(() => {
        return sessions.filter(s => s.status === 'completed');
    }, [sessions]);

    const getTimeRemaining = (endTime: Date) => {
        const diff = differenceInMinutes(endTime, currentTime);
        if (diff <= 0) return 'Ending soon';
        if (diff < 60) return `${diff} min left`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m left`;
    };

    const getTimeUntil = (startTime: Date) => {
        const diff = differenceInMinutes(startTime, currentTime);
        if (diff <= 0) return 'Starting now';
        if (diff < 60) return `in ${diff} min`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        if (hours > 0 && mins > 0) return `in ${hours}h ${mins}m`;
        if (hours > 0) return `in ${hours}h`;
        return `in ${mins}m`;
    };

    const getSessionTypeIcon = (type: string) => {
        switch (type) {
            case 'pt': return '🏋️';
            case 'class': return '👥';
            case 'group': return '🎯';
            default: return '📅';
        }
    };

    const getSessionTypeLabel = (type: string) => {
        switch (type) {
            case 'pt': return 'Personal Training';
            case 'class': return 'Group Class';
            case 'group': return 'Small Group';
            default: return 'Session';
        }
    };

    const handleStartSession = (sessionId: string) => {
        setSessions(prev => prev.map(s => 
            s.id === sessionId ? { ...s, status: 'in-progress' as const } : s
        ));
        setActiveSessionId(sessionId);
    };

    const handleEndSession = (sessionId: string) => {
        setSessions(prev => prev.map(s => 
            s.id === sessionId ? { ...s, status: 'completed' as const } : s
        ));
        if (activeSessionId === sessionId) {
            setActiveSessionId(null);
        }
    };

    if (!data) return <div className="trainer-loading">Loading...</div>;

    return (
        <div className="trainer-dashboard-v2">
            <div className="trainer-dashboard-v2__header">
                <div className="trainer-dashboard-v2__header-left">
                    <div className="trainer-dashboard-v2__greeting">
                        <h1>Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {data.trainerName}!</h1>
                        <p className="trainer-dashboard-v2__date">
                            {format(currentTime, 'EEEE, MMMM d')} • <span className="live-time">{format(currentTime, 'h:mm:ss a')}</span>
                        </p>
                    </div>
                </div>
                <div className="trainer-dashboard-v2__header-right">
                    <div className="trainer-dashboard-v2__day-progress">
                        <div className="day-progress__info">
                            <span className="day-progress__label">Today's Progress</span>
                            <span className="day-progress__value">{data.completedToday}/{data.totalToday} Sessions</span>
                        </div>
                        <div className="day-progress__bar">
                            <div 
                                className="day-progress__fill" 
                                style={{ width: `${(data.completedToday / data.totalToday) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="trainer-dashboard-v2__content">
                {currentSession && (
                    <div className="current-session-banner">
                        <div className="current-session-banner__pulse" />
                        <div className="current-session-banner__content">
                            <div className="current-session-banner__status">
                                <Zap size={16} />
                                <span>IN SESSION</span>
                            </div>
                            <div className="current-session-banner__info">
                                <h2>{currentSession.title}</h2>
                                <div className="current-session-banner__meta">
                                    <span>{currentSession.room}</span>
                                    <span className="separator">•</span>
                                    <span>{getTimeRemaining(currentSession.endTime)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="current-session-banner__actions">
                            <button 
                                className="current-session-banner__btn current-session-banner__btn--notes"
                                onClick={() => navigate('/trainer/progress-notes')}
                            >
                                <FileText size={16} />
                                Add Note
                            </button>
                            <button 
                                className="current-session-banner__btn current-session-banner__btn--end"
                                onClick={() => handleEndSession(currentSession.id)}
                            >
                                <CheckCircle size={16} />
                                End Session
                            </button>
                        </div>
                        <div className="current-session-banner__timer">
                            <Timer size={20} />
                            <span>{getTimeRemaining(currentSession.endTime)}</span>
                        </div>
                    </div>
                )}

                <div className="trainer-dashboard-v2__quick-stats">
                    <div className="quick-stat quick-stat--earnings">
                        <div className="quick-stat__icon">
                            <DollarSign size={20} />
                        </div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value">₹{data.todayEarnings.toLocaleString()}</span>
                            <span className="quick-stat__label">Today's Earnings</span>
                        </div>
                        <div className="quick-stat__trend quick-stat__trend--up">
                            <TrendingUp size={14} />
                            <span>+12%</span>
                        </div>
                    </div>
                    <div className="quick-stat quick-stat--members">
                        <div className="quick-stat__icon">
                            <Users size={20} />
                        </div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value">{data.activeMembers}/{data.assignedMembers}</span>
                            <span className="quick-stat__label">Active Members</span>
                        </div>
                        <button className="quick-stat__action" onClick={() => navigate('/trainer/members')}>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="quick-stat quick-stat--attendance">
                        <div className="quick-stat__icon">
                            <Target size={20} />
                        </div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value">{data.attendanceRate}%</span>
                            <span className="quick-stat__label">Attendance Rate</span>
                        </div>
                        <div className="quick-stat__mini-chart">
                            <svg viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                <circle 
                                    cx="18" cy="18" r="15.9" fill="none" 
                                    stroke="#10B981" strokeWidth="3"
                                    strokeDasharray={`${data.attendanceRate} ${100 - data.attendanceRate}`}
                                    strokeDashoffset="25"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="quick-stat quick-stat--sessions">
                        <div className="quick-stat__icon">
                            <Calendar size={20} />
                        </div>
                        <div className="quick-stat__content">
                            <span className="quick-stat__value">{upcomingSessions.length}</span>
                            <span className="quick-stat__label">Remaining Today</span>
                        </div>
                        <button className="quick-stat__action" onClick={() => navigate('/trainer/schedule')}>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="trainer-dashboard-v2__main-grid">
                    <div className="trainer-dashboard-v2__schedule-section">
                        <div className="section-header">
                            <h2>
                                <Calendar size={20} />
                                Today's Schedule
                            </h2>
                            <button className="section-header__link" onClick={() => navigate('/trainer/schedule')}>
                                Full Schedule <ChevronRight size={16} />
                            </button>
                        </div>

                        {nextSession && !currentSession && (
                            <div className="next-session-card">
                                <div className="next-session-card__badge">
                                    <Clock size={14} />
                                    Up Next {getTimeUntil(nextSession.startTime)}
                                </div>
                                <div className="next-session-card__content">
                                    <div className="next-session-card__icon">
                                        {getSessionTypeIcon(nextSession.type)}
                                    </div>
                                    <div className="next-session-card__info">
                                        <h3>{nextSession.title}</h3>
                                        <p>
                                            {format(nextSession.startTime, 'h:mm a')} - {format(nextSession.endTime, 'h:mm a')} • {nextSession.room}
                                        </p>
                                        <div className="next-session-card__capacity">
                                            <Users size={14} />
                                            <span>{nextSession.enrolled}/{nextSession.capacity} enrolled</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="next-session-card__start-btn"
                                        onClick={() => handleStartSession(nextSession.id)}
                                    >
                                        <Play size={16} />
                                        Start Session
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="session-timeline">
                            {sessions.map((session, index) => (
                                <div 
                                    key={session.id} 
                                    className={`session-timeline__item session-timeline__item--${session.status}`}
                                >
                                    <div className="session-timeline__time">
                                        <span className="session-timeline__time-text">
                                            {format(session.startTime, 'h:mm')}
                                        </span>
                                        <span className="session-timeline__time-period">
                                            {format(session.startTime, 'a')}
                                        </span>
                                    </div>
                                    <div className="session-timeline__marker">
                                        <div className={`session-timeline__dot session-timeline__dot--${session.status}`}>
                                            {session.status === 'completed' && <CheckCircle size={12} />}
                                            {session.status === 'in-progress' && <Zap size={12} />}
                                            {session.status === 'upcoming' && <Clock size={12} />}
                                        </div>
                                        {index < sessions.length - 1 && <div className="session-timeline__line" />}
                                    </div>
                                    <div className="session-timeline__content">
                                        <div className="session-timeline__header">
                                            <span className="session-timeline__type">{getSessionTypeLabel(session.type)}</span>
                                            {session.status === 'in-progress' && (
                                                <span className="session-timeline__live-badge">LIVE</span>
                                            )}
                                        </div>
                                        <h4 className="session-timeline__title">{session.title}</h4>
                                        <p className="session-timeline__meta">
                                            {session.room} • {session.enrolled}/{session.capacity}
                                        </p>
                                        {session.status === 'upcoming' && (
                                            <button 
                                                className="session-timeline__action"
                                                onClick={() => handleStartSession(session.id)}
                                            >
                                                Start Early
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="trainer-dashboard-v2__members-section">
                        <div className="section-header">
                            <h2>
                                <Users size={20} />
                                My Members
                            </h2>
                            <button className="section-header__link" onClick={() => navigate('/trainer/members')}>
                                View All <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="members-quick-list">
                            {recentMembers.slice(0, 5).map(member => (
                                <div key={member.id} className="member-quick-card">
                                    <div className="member-quick-card__avatar">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} />
                                        ) : (
                                            <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                                        )}
                                        {member.streak >= 7 && (
                                            <div className="member-quick-card__streak">
                                                <Flame size={10} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="member-quick-card__info">
                                        <h4>{member.name}</h4>
                                        <p>
                                            {member.nextSession ? (
                                                <span className="member-quick-card__next">
                                                    <Clock size={12} /> {member.nextSession}
                                                </span>
                                            ) : (
                                                <span className="member-quick-card__last">Last: {member.lastSession}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="member-quick-card__progress">
                                        <div className="member-quick-card__progress-bar">
                                            <div 
                                                className="member-quick-card__progress-fill"
                                                style={{ width: `${member.progress}%` }}
                                            />
                                        </div>
                                        <span>{member.progress}%</span>
                                    </div>
                                    <div className="member-quick-card__actions">
                                        {member.phone && (
                                            <button className="member-quick-card__btn" title="Call">
                                                <Phone size={14} />
                                            </button>
                                        )}
                                        <button 
                                            className="member-quick-card__btn" 
                                            title="Add Note"
                                            onClick={() => navigate('/trainer/progress-notes')}
                                        >
                                            <FileText size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="members-attention">
                            <h3>
                                <AlertCircle size={16} />
                                Needs Attention
                            </h3>
                            <div className="members-attention__list">
                                {recentMembers.filter(m => m.streak === 0 || m.progress < 50).slice(0, 2).map(member => (
                                    <div key={member.id} className="attention-item">
                                        <div className="attention-item__avatar">
                                            <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                                        </div>
                                        <div className="attention-item__info">
                                            <span className="attention-item__name">{member.name}</span>
                                            <span className="attention-item__reason">
                                                {member.streak === 0 ? 'No recent activity' : 'Low progress'}
                                            </span>
                                        </div>
                                        <button className="attention-item__btn">
                                            <MessageSquare size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="trainer-dashboard-v2__sidebar">
                        <div className="earnings-card">
                            <div className="earnings-card__header">
                                <h3>
                                    <DollarSign size={18} />
                                    Earnings
                                </h3>
                            </div>
                            <div className="earnings-card__content">
                                <div className="earnings-card__main">
                                    <span className="earnings-card__amount">₹{data.monthEarnings.toLocaleString()}</span>
                                    <span className="earnings-card__period">This Month</span>
                                </div>
                                <div className="earnings-card__breakdown">
                                    <div className="earnings-card__item">
                                        <span className="earnings-card__item-label">Today</span>
                                        <span className="earnings-card__item-value">₹{data.todayEarnings.toLocaleString()}</span>
                                    </div>
                                    <div className="earnings-card__item">
                                        <span className="earnings-card__item-label">This Week</span>
                                        <span className="earnings-card__item-value">₹{data.weekEarnings.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions-card">
                            <h3>Quick Actions</h3>
                            <div className="quick-actions-grid">
                                <button className="quick-action-btn" onClick={() => navigate('/trainer/progress-notes')}>
                                    <FileText size={20} />
                                    <span>Add Note</span>
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/trainer/messages')}>
                                    <MessageSquare size={20} />
                                    <span>Messages</span>
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/trainer/notifications')}>
                                    <Bell size={20} />
                                    <span>Alerts</span>
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/trainer/reports')}>
                                    <TrendingUp size={20} />
                                    <span>Reports</span>
                                </button>
                            </div>
                        </div>

                        <div className="performance-card">
                            <h3>
                                <Award size={18} />
                                Weekly Performance
                            </h3>
                            <div className="performance-card__metrics">
                                <div className="performance-metric">
                                    <div className="performance-metric__header">
                                        <span>Sessions</span>
                                        <span>18/20</span>
                                    </div>
                                    <div className="performance-metric__bar">
                                        <div className="performance-metric__fill" style={{ width: '90%' }} />
                                    </div>
                                </div>
                                <div className="performance-metric">
                                    <div className="performance-metric__header">
                                        <span>Client Retention</span>
                                        <span className="performance-metric__value--success">96%</span>
                                    </div>
                                    <div className="performance-metric__bar">
                                        <div className="performance-metric__fill performance-metric__fill--success" style={{ width: '96%' }} />
                                    </div>
                                </div>
                                <div className="performance-metric">
                                    <div className="performance-metric__header">
                                        <span>Avg. Rating</span>
                                        <span className="performance-metric__value--warning">4.9 ⭐</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="activity-card">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                <div className="activity-item activity-item--success">
                                    <div className="activity-item__icon">
                                        <CheckCircle size={14} />
                                    </div>
                                    <div className="activity-item__content">
                                        <p>Sarah Wilson completed Yoga</p>
                                        <span>2 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item activity-item--info">
                                    <div className="activity-item__icon">
                                        <FileText size={14} />
                                    </div>
                                    <div className="activity-item__content">
                                        <p>Progress note added for Mike</p>
                                        <span>3 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item activity-item--warning">
                                    <div className="activity-item__icon">
                                        <AlertCircle size={14} />
                                    </div>
                                    <div className="activity-item__content">
                                        <p>David Lee missed session</p>
                                        <span>Yesterday</span>
                                    </div>
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
