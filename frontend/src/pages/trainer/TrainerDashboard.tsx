import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Bell,
    MessageSquare, TrendingUp, ChevronRight,
    CheckCircle, IndianRupee,
    Dumbbell, FileText, AlertCircle, Clock
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { usePageEntry, useButtonPress } from '../../hooks/useAnimations';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './TrainerDashboard.css';

// New Components
import DashboardStatCard from '../../components/dashboard/shared/DashboardStatCard';
import ActivityChart from './components/ActivityChart';
import EarningsChart from './components/EarningsChart';
import SessionPieChart from './components/SessionPieChart';
import Editable from '../../components/editor/Editable';

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

    if (!data) return <div className="tp-loader">
        <div className="tp-spinner"></div>
        <div className="tp-text">Loading Mission Control...</div>
    </div>;

    const trainerFirstName = (user?.fullName || data.trainerName || 'Trainer').split(' ')[0] || 'Trainer';

    return (
        <div className="trainer-dashboard">
            <Editable id="trainer-dashboard-header" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
            <header className="dashboard-header">
                <div className="header-content">
                    <h1 className="welcome-text">
                        Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'},
                        <span className="highlight-text"> {trainerFirstName}</span>
                    </h1>
                    <p className="date-display">
                        <Calendar size={14} />
                        {format(currentTime, 'EEEE, MMMM do, yyyy')}
                        <span className="time-separator">•</span>
                        <Clock size={14} />
                        {format(currentTime, 'HH:mm:ss')}
                    </p>
                </div>
                <div className="header-actions">
                    <button className="action-btn" onClick={() => navigate('/trainer/schedule')} {...buttonPress}>
                        <Calendar size={18} /> Schedule
                    </button>
                    <button className="action-btn primary" onClick={() => navigate('/trainer/clients')} {...buttonPress}>
                        <Users size={18} /> Clients
                    </button>
                </div>
            </header>
            </Editable>

            {/* KPI Cards Grid */}
            <section className="kpi-grid">
                <Editable id="trainer-dashboard-kpi-earnings" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
                  <DashboardStatCard
                      title="Today's Earnings"
                        value={formatCurrency(data.todayEarnings)}
                      icon={IndianRupee}
                      color="#10b981"
                      delay={0.1}
                      trend="vs yesterday"
                      trendUp={true}
                  />
                </Editable>
                <Editable id="trainer-dashboard-kpi-sessions" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
                  <DashboardStatCard
                      title="Sessions Today"
                      value={`${data.completedToday}/${data.totalToday}`}
                      icon={Dumbbell}
                      color="#f8fafc"
                      delay={0.1}
                      trend={`${data.attendanceRate}% Rate`}
                      trendUp={data.attendanceRate > 80}
                  />
                </Editable>
                <Editable id="trainer-dashboard-kpi-active-clients" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
                  <DashboardStatCard
                      title="Active Clients"
                      value={data.activeMembers}
                      icon={Users}
                      color="#f8fafc"
                      delay={0.1}
                  />
                </Editable>
                <Editable id="trainer-dashboard-kpi-pending-tasks" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
                  <DashboardStatCard
                      title="Pending Tasks"
                      value={data.alerts.length}
                      icon={Bell}
                      color="#DC2626"
                      delay={0.1}
                      trend={data.alerts.length > 0 ? "Action Req." : "All Clear"}
                      trendUp={data.alerts.length === 0}
                  />
                </Editable>
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-main-grid">

                {/* Left Column: Charts */}
                <div className="dashboard-column main-column">
                    <Editable id="trainer-dashboard-activity-chart" config={{ allowLayout: true, allowStyle: true, allowContent: false, allowVisibility: true }}>
                      <ActivityChart data={data.weeklyActivity} />
                    </Editable>

                    {/* Secondary Charts Row */}
                    <div className="charts-row">
                        <Editable id="trainer-dashboard-earnings-chart" config={{ allowLayout: true, allowStyle: true, allowContent: false, allowVisibility: true }}>
                          <EarningsChart data={data.monthlyEarningsHistory} />
                        </Editable>
                        <Editable id="trainer-dashboard-session-pie" config={{ allowLayout: true, allowStyle: true, allowContent: false, allowVisibility: true }}>
                          <SessionPieChart data={data.sessionDistribution} />
                        </Editable>
                    </div>
                </div>

                {/* Right Column: Agenda & Alerts */}
                <div className="dashboard-column side-column">

                    <Editable id="trainer-dashboard-agenda" config={{ allowLayout: true, allowStyle: true, allowContent: false, allowVisibility: true }}>
                    <div className="widget-panel agenda-panel">
                        <div className="widget-header">
                            <h3><Calendar size={16} /> Today's Agenda</h3>
                            <button className="view-all-link" onClick={() => navigate('/trainer/schedule')}>View All</button>
                        </div>
                        <div className="agenda-list">
                            {sessions.length > 0 ? (
                                sessions.slice(0, 5).map((session) => (
                                    <div key={session.id} className={`agenda-item ${session.status}`}>
                                        <div className="agenda-time">
                                            <span className="start-time">{format(session.startTime, 'HH:mm')}</span>
                                            <span className="duration">{differenceInMinutes(session.endTime!, session.startTime)}m</span>
                                        </div>
                                        <div className="agenda-details">
                                            <h4>{session.title}</h4>
                                            <div className="agenda-meta">
                                                <span className="room">{session.room}</span>
                                                <span className={`status-badge ${session.status}`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                        </div>
                                        {session.status === 'upcoming' && (
                                            <button className="check-in-btn" title="Start Session">
                                                <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <CheckCircle size={24} />
                                    <p>No sessions scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </Editable>

                    {/* Alerts Panel */}
                    <Editable id="trainer-dashboard-alerts" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
                    <div className="widget-panel alerts-panel">
                        <div className="widget-header">
                            <h3><AlertCircle size={18} /> Needs Attention</h3>
                            {data.alerts.length > 0 && <span className="badge-count">{data.alerts.length}</span>}
                        </div>
                        <div className="alerts-list">
                            {data.alerts.length > 0 ? (
                                data.alerts.map(alert => (
                                    <div key={alert.id} className={`alert-card ${alert.severity}`}>
                                        <div className="alert-avatar" style={{ background: alert.severity === 'high' ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : undefined }}>
                                            <span>{getInitials(alert.memberName)}</span>
                                        </div>
                                        <div className="alert-content">
                                            <h4>{alert.memberName}</h4>
                                            <p>{alert.message}</p>
                                            <span className="alert-time">{alert.time}</span>
                                        </div>
                                        <button className="alert-action-btn" {...buttonPress}>
                                            {alert.type === 'PENDING_NOTE' ? <FileText size={14} /> : <MessageSquare size={14} />}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <CheckCircle size={32} />
                                    <p>All caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </Editable>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
