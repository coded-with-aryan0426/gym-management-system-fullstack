import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Bell,
    MessageSquare, TrendingUp, ChevronRight,
    CheckCircle, IndianRupee, Star,
    Dumbbell, FileText, AlertCircle, Clock, Flame, Target
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { usePageEntry, useButtonPress } from '../../hooks/useAnimations';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

// Import unified dashboard CSS
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-trainers.css';
import './TrainerDashboard.css';

// Components
import DashboardStatCard from '../../components/dashboard/shared/DashboardStatCard';
import ActivityChart from './components/ActivityChart';
import EarningsChart from './components/EarningsChart';
import SessionPieChart from './components/SessionPieChart';

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
}

interface DashboardAlert {
    id: string;
    type: 'MISSED_SESSION' | 'PENDING_NOTE' | 'UNREAD_MESSAGE';
    message: string;
    memberName: string;
    memberId: number;
    severity: 'high' | 'medium' | 'low';
    time: string;
}

interface ChartData {
    label: string;
    value: number;
    meta?: string;
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
    sessions: Session[];
    alerts: DashboardAlert[];
    weeklyActivity: ChartData[];
    monthlyEarningsHistory: ChartData[];
    sessionDistribution: ChartData[];
}

const TrainerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sessions, setSessions] = useState<Session[]>([]);

    // Animation hooks
    usePageEntry('.kpi-grid > *, .dashboard-main-grid > *');
    const buttonPress = useButtonPress();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch real data
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Use the explicit method if available, or direct axios call
                const response = await api.getTrainerDashboard();

                // Handle different response structures (unwrapped vs wrapped)
                const apiData = response.data || response;

                if (apiData) {
                    // Transform sessions
                    const transformedSessions = (apiData.sessions || []).map((s: any) => ({
                        ...s,
                        startTime: new Date(s.startTime),
                        endTime: s.endTime ? new Date(s.endTime) : null,
                        status: s.status ? s.status.toLowerCase() : 'upcoming'
                    }));

                    setData({
                        ...apiData,
                        sessions: transformedSessions,
                        alerts: apiData.alerts || [],
                        weeklyActivity: apiData.weeklyActivity || [],
                        monthlyEarningsHistory: apiData.monthlyEarningsHistory || [],
                        sessionDistribution: apiData.sessionDistribution || []
                    });
                    setSessions(transformedSessions);
                } else {
                    console.error("Dashboard API returned empty data", response);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        fetchDashboard();
    }, [user]);

    const currentSession = useMemo(() => sessions.find(s => s.status === 'in-progress'), [sessions]);

    const getTimeRemaining = (endTime: Date) => {
        if (!endTime) return '';
        const diff = differenceInMinutes(endTime, currentTime);
        if (diff <= 0) return 'Ending';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (!data) return (
        <div className="dash dash--trainer">
            <div className="dash-skeleton">
                <div className="dash-skeleton__header"></div>
                <div className="dash-skeleton__kpi-grid">
                    {[1, 2, 3, 4].map(i => <div key={i} className="dash-skeleton__card"></div>)}
                </div>
                <div className="dash-skeleton__content"></div>
            </div>
        </div>
    );

    const trainerFirstName = (user?.fullName || data.trainerName || 'Trainer').split(' ')[0] || 'Trainer';
    const greeting = currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening';

    return (
        <div className="dash dash--trainer">
            {/* Header */}
            <header className="dash-trainer__header">
                <div className="dash-trainer__header__top">
                    <div className="dash-trainer__header__welcome">
                        <h1 className="dash-trainer__header__title">
                            Good {greeting}, <span style={{ color: 'var(--dash-brand-primary)' }}>{trainerFirstName}</span>
                        </h1>
                        <p className="dash-trainer__header__subtitle">
                            Here's your training overview for today
                        </p>
                    </div>
                    <div className="dash-trainer__header__date">
                        <Calendar size={14} />
                        {format(currentTime, 'EEEE, MMMM d')}
                        <span style={{ opacity: 0.5 }}>•</span>
                        <Clock size={14} />
                        {format(currentTime, 'HH:mm')}
                    </div>
                </div>
            </header>

            {/* KPI Grid */}
            <section className="dash-trainer__kpi-grid">
                <div className="dash-trainer__kpi dash-trainer__kpi--earnings">
                    <div className="dash-trainer__kpi__header">
                        <div className="dash-trainer__kpi__icon dash-trainer__kpi__icon--earnings">
                            <IndianRupee size={20} />
                        </div>
                        {data.todayEarnings > 0 && (
                            <span className="dash-trainer__kpi__trend dash-trainer__kpi__trend--up">
                                <TrendingUp size={12} /> +12%
                            </span>
                        )}
                    </div>
                    <div className="dash-trainer__kpi__body">
                        <span className="dash-trainer__kpi__value">{formatCurrency(data.todayEarnings)}</span>
                        <span className="dash-trainer__kpi__label">Today's Earnings</span>
                    </div>
                </div>

                <div className="dash-trainer__kpi dash-trainer__kpi--sessions">
                    <div className="dash-trainer__kpi__header">
                        <div className="dash-trainer__kpi__icon dash-trainer__kpi__icon--sessions">
                            <Dumbbell size={20} />
                        </div>
                        {data.attendanceRate > 80 && (
                            <span className="dash-trainer__kpi__trend dash-trainer__kpi__trend--up">
                                {data.attendanceRate}%
                            </span>
                        )}
                    </div>
                    <div className="dash-trainer__kpi__body">
                        <span className="dash-trainer__kpi__value">{data.completedToday}/{data.totalToday}</span>
                        <span className="dash-trainer__kpi__label">Sessions Today</span>
                    </div>
                </div>

                <div className="dash-trainer__kpi dash-trainer__kpi--clients">
                    <div className="dash-trainer__kpi__header">
                        <div className="dash-trainer__kpi__icon dash-trainer__kpi__icon--clients">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="dash-trainer__kpi__body">
                        <span className="dash-trainer__kpi__value">{data.activeMembers}</span>
                        <span className="dash-trainer__kpi__label">Active Clients</span>
                    </div>
                </div>

                <div className="dash-trainer__kpi dash-trainer__kpi--rating">
                    <div className="dash-trainer__kpi__header">
                        <div className="dash-trainer__kpi__icon dash-trainer__kpi__icon--rating">
                            <Star size={20} />
                        </div>
                    </div>
                    <div className="dash-trainer__kpi__body">
                        <span className="dash-trainer__kpi__value">4.9</span>
                        <span className="dash-trainer__kpi__label">Avg. Rating</span>
                    </div>
                </div>
            </section>

            {/* Main Layout */}
            <div className="dash-trainer__layout">
                {/* Main Column */}
                <div className="dash-trainer__main">
                    {/* Today's Schedule */}
                    <div className="dash-trainer__schedule dash-card dash-trainer__card--schedule">
                        <div className="dash-trainer__schedule__header">
                            <h3 className="dash-trainer__schedule__title">
                                <Calendar size={18} /> Today's Schedule
                            </h3>
                            <span className="dash-trainer__schedule__count">{sessions.length} sessions</span>
                        </div>
                        <div className="dash-trainer__schedule__list dash-trainer__schedule__list--scroll">
                            {sessions.length > 0 ? (
                                sessions.map((session) => (
                                    <div key={session.id} className={`dash-trainer__session dash-trainer__session--${session.status}`}>
                                        <div className="dash-trainer__session__time">
                                            <span className="dash-trainer__session__time-start">
                                                {format(session.startTime, 'HH:mm')}
                                            </span>
                                            <span className="dash-trainer__session__time-end">
                                                {session.endTime ? format(session.endTime, 'HH:mm') : '--:--'}
                                            </span>
                                        </div>
                                        <div className="dash-trainer__session__client">
                                            <div className="dash-trainer__session__avatar">
                                                {session.title.charAt(0)}
                                            </div>
                                            <div className="dash-trainer__session__info">
                                                <span className="dash-trainer__session__name">{session.title}</span>
                                                <span className="dash-trainer__session__type">{session.room} • {session.enrolled}/{session.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="dash-trainer__session__status">
                                            <span className={`dash-badge dash-badge--${session.status === 'completed' ? 'success' : session.status === 'in-progress' ? 'primary' : 'default'}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="dash-empty">
                                    <CheckCircle size={32} />
                                    <p>No sessions scheduled for today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="dash-row dash-row--2">
                        <div className="dash-card">
                            <ActivityChart data={data.weeklyActivity} />
                        </div>
                        <div className="dash-card">
                            <EarningsChart data={data.monthlyEarningsHistory} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="dash-trainer__sidebar">
                    {/* Quick Actions */}
                    <div className="dash-card">
                        <h3 className="dash-card__title">Quick Actions</h3>
                        <div className="dash-trainer__actions">
                            <button className="dash-trainer__action-btn dash-trainer__action-btn--primary" onClick={() => navigate('/trainer/schedule')} {...buttonPress}>
                                <div className="dash-trainer__action-btn__icon"><Calendar size={18} /></div>
                                <span>Schedule</span>
                            </button>
                            <button className="dash-trainer__action-btn" onClick={() => navigate('/trainer/members')} {...buttonPress}>
                                <div className="dash-trainer__action-btn__icon"><Users size={18} /></div>
                                <span>Members</span>
                            </button>
                            <button className="dash-trainer__action-btn" onClick={() => navigate('/trainer/messages')} {...buttonPress}>
                                <div className="dash-trainer__action-btn__icon"><MessageSquare size={18} /></div>
                                <span>Messages</span>
                            </button>
                            <button className="dash-trainer__action-btn" onClick={() => navigate('/trainer/progress-notes')} {...buttonPress}>
                                <div className="dash-trainer__action-btn__icon"><FileText size={18} /></div>
                                <span>Notes</span>
                            </button>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="dash-card dash-trainer__card--clients">
                        <div className="dash-card__header">
                            <h3 className="dash-card__title">
                                <AlertCircle size={16} /> Needs Attention
                            </h3>
                            {data.alerts.length > 0 && (
                                <span className="dash-badge dash-badge--danger">{data.alerts.length}</span>
                            )}
                        </div>
                        <div className="dash-trainer__clients__list--scroll">
                            {data.alerts.length > 0 ? (
                                data.alerts.map(alert => (
                                    <div key={alert.id} className="dash-trainer__client-row">
                                        <div 
                                            className="dash-trainer__client__avatar" 
                                            style={{ 
                                                background: alert.severity === 'high' 
                                                    ? 'linear-gradient(135deg, #EF4444, #B91C1C)' 
                                                    : 'linear-gradient(135deg, var(--dash-violet), var(--dash-indigo))' 
                                            }}
                                        >
                                            {getInitials(alert.memberName)}
                                        </div>
                                        <div className="dash-trainer__client__info">
                                            <span className="dash-trainer__client__name">{alert.memberName}</span>
                                            <span className="dash-trainer__client__meta">{alert.message}</span>
                                        </div>
                                        <button
                                            className="dash-btn dash-btn--ghost dash-btn--sm"
                                            onClick={() => {
                                                if (alert.type === 'PENDING_NOTE') navigate('/trainer/progress-notes');
                                                else if (alert.type === 'MISSED_SESSION') navigate('/trainer/schedule');
                                                else navigate('/trainer/messages');
                                            }}
                                            {...buttonPress}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="dash-empty">
                                    <CheckCircle size={24} />
                                    <p>All caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="dash-card dash-trainer__card--performance">
                        <h3 className="dash-card__title">Performance</h3>
                        <div className="dash-trainer__performance">
                            <div className="dash-trainer__performance__metric">
                                <span className="dash-trainer__performance__label">
                                    <Target size={14} /> Sessions This Week
                                </span>
                                <span className="dash-trainer__performance__value">{data.totalToday * 5}</span>
                            </div>
                            <div className="dash-trainer__performance__metric">
                                <span className="dash-trainer__performance__label">
                                    <Flame size={14} /> Retention Rate
                                </span>
                                <span className="dash-trainer__performance__value">94%</span>
                            </div>
                            <div className="dash-trainer__performance__metric">
                                <span className="dash-trainer__performance__label">
                                    <Star size={14} /> Client Rating
                                </span>
                                <div className="dash-trainer__rating">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={14} className={i <= 4 ? 'dash-trainer__rating__star' : 'dash-trainer__rating__star--empty'} fill={i <= 4 ? 'currentColor' : 'none'} />
                                    ))}
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
