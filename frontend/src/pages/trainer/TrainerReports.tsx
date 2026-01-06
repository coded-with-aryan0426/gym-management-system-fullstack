import React, { useState, useMemo } from 'react';
import { 
    TrendingUp, TrendingDown, Users, Calendar, Clock, Download, ChevronDown,
    BarChart3, PieChart, Activity, Award, Target, Filter, RefreshCw,
    DollarSign, Dumbbell, Heart, Zap, Star, ArrowUpRight, ArrowDownRight,
    FileText, Share2, Printer, ChevronRight, ChevronLeft, Info, Eye,
    CheckCircle, XCircle, AlertCircle, Flame, Trophy, Medal, Crown
} from 'lucide-react';
import './TrainerReports.css';

interface DateRange {
    start: Date;
    end: Date;
    label: string;
}

interface SessionData {
    id: number;
    member: string;
    avatar: string;
    type: string;
    date: string;
    time: string;
    duration: string;
    status: 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
    rating?: number;
    notes?: string;
}

interface MemberProgress {
    id: number;
    name: string;
    avatar: string;
    sessions: number;
    attendance: number;
    goalProgress: number;
    trend: 'up' | 'down' | 'stable';
    lastSession: string;
    goal: string;
}

interface EarningsBreakdown {
    category: string;
    amount: number;
    sessions: number;
    color: string;
}

const TrainerReports: React.FC = () => {
    const [period, setPeriod] = useState('This Month');
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'members' | 'earnings'>('overview');
    const [sessionFilter, setSessionFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'member' | 'type'>('date');

    const stats = [
        { 
            label: 'Total Sessions', 
            value: '156', 
            change: '+12%', 
            changeValue: 18,
            changeType: 'positive', 
            icon: Calendar, 
            color: '#8B5CF6',
            subtext: 'vs last month'
        },
        { 
            label: 'Active Members', 
            value: '24', 
            change: '+3', 
            changeValue: 3,
            changeType: 'positive', 
            icon: Users, 
            color: '#3B82F6',
            subtext: '2 new this week'
        },
        { 
            label: 'Avg. Attendance', 
            value: '94%', 
            change: '+5%', 
            changeValue: 5,
            changeType: 'positive', 
            icon: Activity, 
            color: '#10B981',
            subtext: 'Industry avg: 78%'
        },
        { 
            label: 'Client Rating', 
            value: '4.9', 
            change: 'Top 5%', 
            changeValue: 0,
            changeType: 'neutral', 
            icon: Star, 
            color: '#F59E0B',
            subtext: 'Based on 48 reviews'
        },
    ];

    const performanceData = [
        { label: 'Sessions Completed', value: 42, max: 48, percent: 87, icon: CheckCircle, color: '#10B981' },
        { label: 'Client Goals Met', value: 18, max: 24, percent: 75, icon: Target, color: '#8B5CF6' },
        { label: 'On-Time Rate', value: 98, max: 100, percent: 98, icon: Clock, color: '#3B82F6' },
        { label: 'Member Retention', value: 96, max: 100, percent: 96, icon: Heart, color: '#EC4899' },
        { label: 'Session Utilization', value: 89, max: 100, percent: 89, icon: Zap, color: '#F59E0B' },
    ];

    const weeklySessionData = [
        { day: 'Mon', sessions: 8, target: 10 },
        { day: 'Tue', sessions: 12, target: 10 },
        { day: 'Wed', sessions: 6, target: 10 },
        { day: 'Thu', sessions: 10, target: 10 },
        { day: 'Fri', sessions: 14, target: 10 },
        { day: 'Sat', sessions: 8, target: 6 },
        { day: 'Sun', sessions: 2, target: 4 },
    ];

    const sessionTypeBreakdown = [
        { type: 'Personal Training', count: 68, percent: 44, color: '#DC2626' },
        { type: 'Group Classes', count: 42, percent: 27, color: '#8B5CF6' },
        { type: 'HIIT Sessions', count: 28, percent: 18, color: '#3B82F6' },
        { type: 'Yoga/Flexibility', count: 18, percent: 11, color: '#10B981' },
    ];

    const recentSessions: SessionData[] = [
        { id: 1, member: 'Sarah Wilson', avatar: 'SW', type: 'Personal Training', date: 'Mar 25, 2024', time: '9:00 AM', duration: '60 min', status: 'completed', rating: 5 },
        { id: 2, member: 'Mike Johnson', avatar: 'MJ', type: 'HIIT Class', date: 'Mar 25, 2024', time: '10:30 AM', duration: '45 min', status: 'completed', rating: 5 },
        { id: 3, member: 'Emma Davis', avatar: 'ED', type: 'Yoga Session', date: 'Mar 25, 2024', time: '2:00 PM', duration: '60 min', status: 'completed', rating: 4 },
        { id: 4, member: 'James Wilson', avatar: 'JW', type: 'Strength Training', date: 'Mar 24, 2024', time: '3:00 PM', duration: '90 min', status: 'cancelled', notes: 'Member sick' },
        { id: 5, member: 'Lisa Chen', avatar: 'LC', type: 'Personal Training', date: 'Mar 24, 2024', time: '4:30 PM', duration: '60 min', status: 'completed', rating: 5 },
        { id: 6, member: 'David Brown', avatar: 'DB', type: 'HIIT Class', date: 'Mar 24, 2024', time: '6:00 PM', duration: '45 min', status: 'no-show' },
        { id: 7, member: 'Tom Richards', avatar: 'TR', type: 'Personal Training', date: 'Mar 23, 2024', time: '8:00 AM', duration: '60 min', status: 'completed', rating: 5 },
        { id: 8, member: 'Anna Smith', avatar: 'AS', type: 'Yoga Session', date: 'Mar 23, 2024', time: '11:00 AM', duration: '60 min', status: 'rescheduled' },
    ];

    const topMembers: MemberProgress[] = [
        { id: 1, name: 'Sarah Wilson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=DC2626&color=fff', sessions: 18, attendance: 100, goalProgress: 95, trend: 'up', lastSession: '2 days ago', goal: 'Build muscle' },
        { id: 2, name: 'Emma Davis', avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=10B981&color=fff', sessions: 15, attendance: 94, goalProgress: 88, trend: 'up', lastSession: 'Yesterday', goal: 'Weight loss' },
        { id: 3, name: 'Mike Johnson', avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3B82F6&color=fff', sessions: 12, attendance: 85, goalProgress: 72, trend: 'stable', lastSession: '3 days ago', goal: 'General fitness' },
        { id: 4, name: 'Lisa Chen', avatar: 'https://ui-avatars.com/api/?name=Lisa+Chen&background=EC4899&color=fff', sessions: 10, attendance: 90, goalProgress: 65, trend: 'up', lastSession: 'Today', goal: 'Flexibility' },
        { id: 5, name: 'James Wilson', avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=F59E0B&color=fff', sessions: 8, attendance: 75, goalProgress: 45, trend: 'down', lastSession: '1 week ago', goal: 'Rehabilitation' },
    ];

    const earningsData: EarningsBreakdown[] = [
        { category: 'PT Sessions', amount: 2400, sessions: 48, color: '#DC2626' },
        { category: 'Group Classes', amount: 840, sessions: 42, color: '#8B5CF6' },
        { category: 'Specialty Sessions', amount: 600, sessions: 12, color: '#3B82F6' },
        { category: 'Bonus & Tips', amount: 320, sessions: 0, color: '#10B981' },
    ];

    const totalEarnings = earningsData.reduce((sum, e) => sum + e.amount, 0);

    const achievements = [
        { icon: Trophy, label: '100 Sessions Milestone', date: 'Mar 15', color: '#F59E0B' },
        { icon: Star, label: 'Perfect 5.0 Rating Week', date: 'Mar 10', color: '#8B5CF6' },
        { icon: Flame, label: '30-Day Streak', date: 'Mar 1', color: '#DC2626' },
        { icon: Medal, label: 'Top Trainer - February', date: 'Feb 28', color: '#3B82F6' },
    ];

    const filteredSessions = useMemo(() => {
        let filtered = recentSessions;
        if (sessionFilter !== 'all') {
            filtered = filtered.filter(s => s.status === sessionFilter);
        }
        return filtered;
    }, [sessionFilter]);

    const sessionStats = useMemo(() => ({
        total: recentSessions.length,
        completed: recentSessions.filter(s => s.status === 'completed').length,
        cancelled: recentSessions.filter(s => s.status === 'cancelled').length,
        noShow: recentSessions.filter(s => s.status === 'no-show').length,
        rescheduled: recentSessions.filter(s => s.status === 'rescheduled').length,
    }), []);

    const maxSessions = Math.max(...weeklySessionData.map(d => Math.max(d.sessions, d.target)));

    const getStatusBadge = (status: SessionData['status']) => {
        const badges = {
            completed: { icon: CheckCircle, label: 'Completed', class: 'completed' },
            cancelled: { icon: XCircle, label: 'Cancelled', class: 'cancelled' },
            'no-show': { icon: AlertCircle, label: 'No Show', class: 'no-show' },
            rescheduled: { icon: RefreshCw, label: 'Rescheduled', class: 'rescheduled' },
        };
        return badges[status];
    };

    return (
        <div className="trainer-reports">
            <div className="trainer-reports__header">
                <div className="trainer-reports__header-content">
                    <div className="trainer-reports__title-section">
                        <h1>Performance Reports</h1>
                        <p>Track your performance, earnings, and member progress</p>
                    </div>
                    <div className="trainer-reports__header-actions">
                        <div className="trainer-reports__period-select">
                            <Calendar size={14} />
                            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last 3 Months</option>
                                <option>This Year</option>
                                <option>Custom Range</option>
                            </select>
                            <ChevronDown size={14} />
                        </div>
                        <button className="trainer-reports__refresh-btn" title="Refresh Data">
                            <RefreshCw size={16} />
                        </button>
                        <div className="trainer-reports__export-dropdown">
                            <button className="trainer-reports__export-btn">
                                <Download size={16} />
                                Export
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="trainer-reports__tabs">
                <button 
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={16} /> Overview
                </button>
                <button 
                    className={activeTab === 'sessions' ? 'active' : ''}
                    onClick={() => setActiveTab('sessions')}
                >
                    <Calendar size={16} /> Sessions
                </button>
                <button 
                    className={activeTab === 'members' ? 'active' : ''}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={16} /> Members
                </button>
                <button 
                    className={activeTab === 'earnings' ? 'active' : ''}
                    onClick={() => setActiveTab('earnings')}
                >
                    <DollarSign size={16} /> Earnings
                </button>
            </div>

            <div className="trainer-reports__content">
                {activeTab === 'overview' && (
                    <>
                        <div className="trainer-reports__stats">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="trainer-reports__stat-card">
                                    <div className="trainer-reports__stat-header">
                                        <div 
                                            className="trainer-reports__stat-icon"
                                            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                        >
                                            <stat.icon size={18} />
                                        </div>
                                        <div className={`trainer-reports__stat-trend trainer-reports__stat-trend--${stat.changeType}`}>
                                            {stat.changeType === 'positive' && <ArrowUpRight size={14} />}
                                            {stat.changeType === 'negative' && <ArrowDownRight size={14} />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="trainer-reports__stat-value">{stat.value}</div>
                                    <div className="trainer-reports__stat-label">{stat.label}</div>
                                    <div className="trainer-reports__stat-subtext">{stat.subtext}</div>
                                </div>
                            ))}
                        </div>

                        <div className="trainer-reports__grid">
                            <div className="trainer-reports__card trainer-reports__card--chart">
                                <div className="trainer-reports__card-header">
                                    <h2><Activity size={18} /> Weekly Session Activity</h2>
                                    <div className="trainer-reports__chart-legend">
                                        <span><span className="trainer-reports__legend-dot trainer-reports__legend-dot--actual"></span> Actual</span>
                                        <span><span className="trainer-reports__legend-dot trainer-reports__legend-dot--target"></span> Target</span>
                                    </div>
                                </div>
                                <div className="trainer-reports__card-content">
                                    <div className="trainer-reports__bar-chart">
                                        {weeklySessionData.map((day, idx) => (
                                            <div key={idx} className="trainer-reports__bar-group">
                                                <div className="trainer-reports__bar-container">
                                                    <div 
                                                        className="trainer-reports__bar trainer-reports__bar--target"
                                                        style={{ height: `${(day.target / maxSessions) * 100}%` }}
                                                    />
                                                    <div 
                                                        className="trainer-reports__bar trainer-reports__bar--actual"
                                                        style={{ height: `${(day.sessions / maxSessions) * 100}%` }}
                                                    >
                                                        <span className="trainer-reports__bar-value">{day.sessions}</span>
                                                    </div>
                                                </div>
                                                <span className="trainer-reports__bar-label">{day.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="trainer-reports__chart-summary">
                                        <div className="trainer-reports__summary-item">
                                            <span className="trainer-reports__summary-value">60</span>
                                            <span className="trainer-reports__summary-label">Total Sessions</span>
                                        </div>
                                        <div className="trainer-reports__summary-item">
                                            <span className="trainer-reports__summary-value">8.6</span>
                                            <span className="trainer-reports__summary-label">Daily Average</span>
                                        </div>
                                        <div className="trainer-reports__summary-item">
                                            <span className="trainer-reports__summary-value trainer-reports__summary-value--positive">+20%</span>
                                            <span className="trainer-reports__summary-label">vs Last Week</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="trainer-reports__card trainer-reports__card--breakdown">
                                <div className="trainer-reports__card-header">
                                    <h2><PieChart size={18} /> Session Type Breakdown</h2>
                                </div>
                                <div className="trainer-reports__card-content">
                                    <div className="trainer-reports__donut-chart">
                                        <div className="trainer-reports__donut">
                                            <svg viewBox="0 0 36 36">
                                                {sessionTypeBreakdown.reduce((acc, item, idx) => {
                                                    const offset = acc.offset;
                                                    const dash = item.percent;
                                                    acc.elements.push(
                                                        <circle
                                                            key={idx}
                                                            cx="18"
                                                            cy="18"
                                                            r="15.9"
                                                            fill="none"
                                                            stroke={item.color}
                                                            strokeWidth="3.8"
                                                            strokeDasharray={`${dash} ${100 - dash}`}
                                                            strokeDashoffset={-offset}
                                                            strokeLinecap="round"
                                                        />
                                                    );
                                                    acc.offset += dash;
                                                    return acc;
                                                }, { offset: 25, elements: [] as React.ReactNode[] }).elements}
                                            </svg>
                                            <div className="trainer-reports__donut-center">
                                                <span className="trainer-reports__donut-value">156</span>
                                                <span className="trainer-reports__donut-label">Sessions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="trainer-reports__breakdown-list">
                                        {sessionTypeBreakdown.map((item, idx) => (
                                            <div key={idx} className="trainer-reports__breakdown-item">
                                                <div className="trainer-reports__breakdown-color" style={{ backgroundColor: item.color }} />
                                                <span className="trainer-reports__breakdown-type">{item.type}</span>
                                                <span className="trainer-reports__breakdown-count">{item.count}</span>
                                                <span className="trainer-reports__breakdown-percent">{item.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="trainer-reports__card trainer-reports__card--performance">
                                <div className="trainer-reports__card-header">
                                    <h2><Target size={18} /> Performance Metrics</h2>
                                    <button className="trainer-reports__info-btn" title="Learn more">
                                        <Info size={14} />
                                    </button>
                                </div>
                                <div className="trainer-reports__card-content">
                                    <div className="trainer-reports__metrics">
                                        {performanceData.map((metric, idx) => (
                                            <div key={idx} className="trainer-reports__metric">
                                                <div className="trainer-reports__metric-header">
                                                    <div className="trainer-reports__metric-title">
                                                        <metric.icon size={14} style={{ color: metric.color }} />
                                                        <span className="trainer-reports__metric-label">{metric.label}</span>
                                                    </div>
                                                    <span className="trainer-reports__metric-value" style={{ color: metric.color }}>
                                                        {metric.percent}%
                                                    </span>
                                                </div>
                                                <div className="trainer-reports__metric-bar">
                                                    <div 
                                                        className="trainer-reports__metric-progress" 
                                                        style={{ width: `${metric.percent}%`, backgroundColor: metric.color }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="trainer-reports__card trainer-reports__card--achievements">
                                <div className="trainer-reports__card-header">
                                    <h2><Award size={18} /> Recent Achievements</h2>
                                </div>
                                <div className="trainer-reports__card-content">
                                    <div className="trainer-reports__achievements">
                                        {achievements.map((achievement, idx) => (
                                            <div key={idx} className="trainer-reports__achievement">
                                                <div 
                                                    className="trainer-reports__achievement-icon"
                                                    style={{ backgroundColor: `${achievement.color}15`, color: achievement.color }}
                                                >
                                                    <achievement.icon size={18} />
                                                </div>
                                                <div className="trainer-reports__achievement-info">
                                                    <span className="trainer-reports__achievement-label">{achievement.label}</span>
                                                    <span className="trainer-reports__achievement-date">{achievement.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'sessions' && (
                    <>
                        <div className="trainer-reports__session-stats">
                            <div className="trainer-reports__session-stat">
                                <span className="trainer-reports__session-stat-value">{sessionStats.total}</span>
                                <span className="trainer-reports__session-stat-label">Total</span>
                            </div>
                            <div className="trainer-reports__session-stat trainer-reports__session-stat--completed">
                                <span className="trainer-reports__session-stat-value">{sessionStats.completed}</span>
                                <span className="trainer-reports__session-stat-label">Completed</span>
                            </div>
                            <div className="trainer-reports__session-stat trainer-reports__session-stat--cancelled">
                                <span className="trainer-reports__session-stat-value">{sessionStats.cancelled}</span>
                                <span className="trainer-reports__session-stat-label">Cancelled</span>
                            </div>
                            <div className="trainer-reports__session-stat trainer-reports__session-stat--no-show">
                                <span className="trainer-reports__session-stat-value">{sessionStats.noShow}</span>
                                <span className="trainer-reports__session-stat-label">No Show</span>
                            </div>
                        </div>

                        <div className="trainer-reports__sessions-toolbar">
                            <div className="trainer-reports__sessions-filter">
                                <button 
                                    className={sessionFilter === 'all' ? 'active' : ''}
                                    onClick={() => setSessionFilter('all')}
                                >
                                    All
                                </button>
                                <button 
                                    className={sessionFilter === 'completed' ? 'active' : ''}
                                    onClick={() => setSessionFilter('completed')}
                                >
                                    Completed
                                </button>
                                <button 
                                    className={sessionFilter === 'cancelled' ? 'active' : ''}
                                    onClick={() => setSessionFilter('cancelled')}
                                >
                                    Cancelled
                                </button>
                            </div>
                        </div>

                        <div className="trainer-reports__card trainer-reports__card--full">
                            <div className="trainer-reports__sessions-table">
                                <div className="trainer-reports__table-header">
                                    <span>Member</span>
                                    <span>Type</span>
                                    <span>Date</span>
                                    <span>Time</span>
                                    <span>Duration</span>
                                    <span>Status</span>
                                    <span>Rating</span>
                                </div>
                                {filteredSessions.map((session) => {
                                    const badge = getStatusBadge(session.status);
                                    return (
                                        <div key={session.id} className="trainer-reports__table-row">
                                            <div className="trainer-reports__session-member">
                                                <div className="trainer-reports__member-avatar-small">
                                                    {session.avatar}
                                                </div>
                                                <span>{session.member}</span>
                                            </div>
                                            <span>{session.type}</span>
                                            <span>{session.date}</span>
                                            <span>{session.time}</span>
                                            <span>{session.duration}</span>
                                            <span className={`trainer-reports__session-status trainer-reports__session-status--${badge.class}`}>
                                                <badge.icon size={12} />
                                                {badge.label}
                                            </span>
                                            <span className="trainer-reports__session-rating">
                                                {session.rating ? (
                                                    <>
                                                        <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                                                        {session.rating}.0
                                                    </>
                                                ) : '-'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'members' && (
                    <>
                        <div className="trainer-reports__members-header">
                            <h2>Member Progress Overview</h2>
                            <p>Track how your members are progressing towards their goals</p>
                        </div>

                        <div className="trainer-reports__members-grid">
                            {topMembers.map((member, idx) => (
                                <div key={member.id} className="trainer-reports__member-card">
                                    <div className="trainer-reports__member-card-header">
                                        {idx < 3 && (
                                            <div className={`trainer-reports__member-badge trainer-reports__member-badge--${idx + 1}`}>
                                                {idx === 0 && <Crown size={12} />}
                                                {idx === 1 && <Medal size={12} />}
                                                {idx === 2 && <Award size={12} />}
                                                #{idx + 1}
                                            </div>
                                        )}
                                        <img src={member.avatar} alt={member.name} className="trainer-reports__member-avatar-large" />
                                        <h3>{member.name}</h3>
                                        <span className="trainer-reports__member-goal">{member.goal}</span>
                                    </div>
                                    <div className="trainer-reports__member-stats">
                                        <div className="trainer-reports__member-stat">
                                            <span className="trainer-reports__member-stat-value">{member.sessions}</span>
                                            <span className="trainer-reports__member-stat-label">Sessions</span>
                                        </div>
                                        <div className="trainer-reports__member-stat">
                                            <span className="trainer-reports__member-stat-value">{member.attendance}%</span>
                                            <span className="trainer-reports__member-stat-label">Attendance</span>
                                        </div>
                                        <div className="trainer-reports__member-stat">
                                            <span className={`trainer-reports__member-stat-value trainer-reports__member-stat-value--${member.trend}`}>
                                                {member.trend === 'up' && <TrendingUp size={12} />}
                                                {member.trend === 'down' && <TrendingDown size={12} />}
                                                {member.goalProgress}%
                                            </span>
                                            <span className="trainer-reports__member-stat-label">Goal Progress</span>
                                        </div>
                                    </div>
                                    <div className="trainer-reports__member-progress-bar">
                                        <div className="trainer-reports__member-progress-track">
                                            <div 
                                                className="trainer-reports__member-progress-fill"
                                                style={{ width: `${member.goalProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="trainer-reports__member-footer">
                                        <span>Last session: {member.lastSession}</span>
                                        <button className="trainer-reports__view-member-btn">
                                            <Eye size={14} /> View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'earnings' && (
                    <>
                        <div className="trainer-reports__earnings-summary">
                            <div className="trainer-reports__earnings-total">
                                <span className="trainer-reports__earnings-label">Total Earnings</span>
                                <span className="trainer-reports__earnings-value">${totalEarnings.toLocaleString()}</span>
                                <span className="trainer-reports__earnings-period">{period}</span>
                            </div>
                            <div className="trainer-reports__earnings-trend">
                                <ArrowUpRight size={20} />
                                <span>+18% vs last period</span>
                            </div>
                        </div>

                        <div className="trainer-reports__earnings-grid">
                            <div className="trainer-reports__card">
                                <div className="trainer-reports__card-header">
                                    <h2><DollarSign size={18} /> Earnings Breakdown</h2>
                                </div>
                                <div className="trainer-reports__card-content">
                                    <div className="trainer-reports__earnings-breakdown">
                                        {earningsData.map((item, idx) => (
                                            <div key={idx} className="trainer-reports__earnings-item">
                                                <div className="trainer-reports__earnings-item-header">
                                                    <div 
                                                        className="trainer-reports__earnings-dot"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="trainer-reports__earnings-category">{item.category}</span>
                                                </div>
                                                <div className="trainer-reports__earnings-item-details">
                                                    <span className="trainer-reports__earnings-amount">${item.amount}</span>
                                                    {item.sessions > 0 && (
                                                        <span className="trainer-reports__earnings-sessions">{item.sessions} sessions</span>
                                                    )}
                                                </div>
                                                <div className="trainer-reports__earnings-bar">
                                                    <div 
                                                        className="trainer-reports__earnings-bar-fill"
                                                        style={{ 
                                                            width: `${(item.amount / totalEarnings) * 100}%`,
                                                            backgroundColor: item.color 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="trainer-reports__card">
                                <div className="trainer-reports__card-header">
                                    <h2><TrendingUp size={18} /> Rate Analysis</h2>
                                </div>
                                <div className="trainer-reports__card-content">
                                    <div className="trainer-reports__rate-cards">
                                        <div className="trainer-reports__rate-card">
                                            <span className="trainer-reports__rate-value">$50</span>
                                            <span className="trainer-reports__rate-label">Avg. per Session</span>
                                        </div>
                                        <div className="trainer-reports__rate-card">
                                            <span className="trainer-reports__rate-value">$173</span>
                                            <span className="trainer-reports__rate-label">Avg. Daily Earnings</span>
                                        </div>
                                        <div className="trainer-reports__rate-card">
                                            <span className="trainer-reports__rate-value">102</span>
                                            <span className="trainer-reports__rate-label">Paid Sessions</span>
                                        </div>
                                        <div className="trainer-reports__rate-card">
                                            <span className="trainer-reports__rate-value">$4,160</span>
                                            <span className="trainer-reports__rate-label">Projected Monthly</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TrainerReports;
