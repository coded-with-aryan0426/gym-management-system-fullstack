import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Flame,
    CheckCircle2,
    ChevronRight,
    Clock,
    MapPin,
    Activity,
    Trophy,
    MessageSquare,
    Dumbbell,
    Gem,
    Zap,
    Heart,
    Target,
    TrendingUp,
    Sparkles,
    Bell,
    ArrowUpRight,
    Star,
    Award,
    Play,
    Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { UnifiedPage } from '../../components/shared/UnifiedPage';
import { UnifiedCard } from '../../components/shared/UnifiedCard';
import './MemberDashboard.css';

interface DashboardData {
    memberId: number;
    memberName: string;
    membership: {
        status: string;
        packageName?: string;
        endDate?: string;
        daysRemaining?: number;
        isExpired?: boolean;
    } | null;
    assignedTrainer: {
        id: number;
        fullName: string;
        specialization?: string;
        nextSession?: string;
    } | null;
    bookedClassesCount: number;
    unreadNotificationsCount: number;
}

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        const fetchDashboard = async () => {
            if (!user?.id) { setLoading(false); return; }
            try {
                const response = await fetch(`/api/member/dashboard?memberId=${user.id}`);
                if (response.ok) setDashboard(await response.json());
            } catch (error) { console.error('Failed to fetch dashboard:', error); }
            finally { setLoading(false); }
        };
        fetchDashboard();
        return () => clearInterval(timer);
    }, [user?.id]);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const firstName = (dashboard?.memberName || user?.fullName || 'Member').split(' ')[0];

    const stats = { streakDays: 7 };
    const membership = dashboard?.membership || { status: 'Active', packageName: 'Premium Monthly', daysRemaining: 25, endDate: 'Jan 26, 2026' };
    const upcomingClasses = [
        { id: 1, title: 'Morning Yoga', time: '9:00 AM', date: 'Tomorrow', location: 'Studio A', trainer: 'Sarah Johnson', type: 'yoga' },
        { id: 2, title: 'HIIT Burn', time: '6:00 PM', date: 'Tue, Jan 2', location: 'Main Floor', trainer: 'Mike Chen', type: 'hiit' },
        { id: 3, title: 'Power Lifting', time: '10:00 AM', date: 'Fri, Jan 5', location: 'Weight Room', trainer: 'John Smith', type: 'strength' }
    ];
    const trainer = dashboard?.assignedTrainer || { fullName: 'John Smith', specialization: 'Strength & Conditioning' };

    const quickActions = [
        { icon: <Calendar size={18} />, label: 'Book Class', path: '/member/classes', color: 'var(--accent-blue)' },
        { icon: <Activity size={18} />, label: 'My Progress', path: '/member/progress', color: 'var(--accent-green)' },
        { icon: <MessageSquare size={18} />, label: 'Messages', path: '/member/trainer', color: 'var(--accent-purple)' },
        { icon: <Bell size={18} />, label: 'Notifications', path: '/member/notifications', color: 'var(--accent-orange)' }
    ];

    if (loading) return <div className="member-dashboard-loading">Loading...</div>;

    return (
        <UnifiedPage className="member-dashboard-unified">
            <header className="member-dashboard__header">
                <div className="header-top-row">
                    <div className="welcome-group">
                        <span className="text-greeting">{getGreeting()},</span>
                        <h1 className="heading-hero">{firstName}</h1>
                    </div>
                    <div className="header-date-display">
                        <Calendar size={14} />
                        <span>{format(currentTime, 'EEE, MMM d')} • {format(currentTime, 'h:mm a')}</span>
                    </div>
                </div>

                <div className="header-stats-grid">
                    <UnifiedCard hover={false} className="header-stat-card">
                        <div className="header-stat-label">Membership</div>
                        <div className="header-stat-value">
                            {membership.daysRemaining} 
                            <span className="header-stat-unit">Days Left</span>
                        </div>
                    </UnifiedCard>
                    <UnifiedCard hover={false} className="header-stat-card">
                        <div className="header-stat-label">Bookings</div>
                        <div className="header-stat-value">
                            {dashboard?.bookedClassesCount || 0} 
                            <span className="header-stat-unit">Classes</span>
                        </div>
                    </UnifiedCard>
                    <UnifiedCard hover={false} className="header-stat-card">
                        <div className="header-stat-label">Activity</div>
                        <div className="header-stat-value">
                            {stats.streakDays} 
                            <span className="header-stat-unit">Day Streak</span>
                        </div>
                    </UnifiedCard>
                </div>
            </header>

            <div className="layout-dashboard">
                <div className="layout-main-content">
                    {upcomingClasses.length > 0 && (
                        <UnifiedCard className="current-session-banner-unified" hover={false}>
                            <div className="session-banner-content">
                                <div>
                                    <div className="session-tag">
                                        <Zap size={14} fill="currentColor" /> NEXT SESSION
                                    </div>
                                    <h2 className="session-title">{upcomingClasses[0].title}</h2>
                                    <p className="session-info">{upcomingClasses[0].location} • {upcomingClasses[0].time}</p>
                                </div>
                                <button className="btn-premium" onClick={() => navigate('/member/classes')}>
                                    Check In
                                </button>
                            </div>
                        </UnifiedCard>
                    )}

                    <section>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="section-title" style={{ margin: 0 }}><Calendar size={18} /> My Schedule</h2>
                            <button onClick={() => navigate('/member/bookings')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="schedule-list">
                            {upcomingClasses.map((cls, idx) => (
                                <UnifiedCard key={cls.id} delay={idx * 0.05} className="class-card-compact">
                                    <div className="class-time-block">
                                        <div className="class-time-hour">{cls.time.split(' ')[0]}</div>
                                        <div className="class-time-ampm">{cls.time.split(' ')[1]}</div>
                                    </div>
                                    <div className="class-divider" />
                                    <div className="class-details">
                                        <div className="class-type-tag">{cls.type.toUpperCase()}</div>
                                        <h3 className="class-name">{cls.title}</h3>
                                        <p className="class-meta">{cls.location} • Coach {cls.trainer}</p>
                                    </div>
                                    <div className="class-action-area">
                                        <span className="class-date-label">{cls.date}</span>
                                        <ChevronRight size={16} color="var(--text-tertiary)" />
                                    </div>
                                </UnifiedCard>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="layout-sidebar">
                    <UnifiedCard>
                        <h3 className="sidebar-section-title">Quick Actions</h3>
                        <div className="quick-actions-grid">
                            {quickActions.map(action => (
                                <button key={action.label} onClick={() => navigate(action.path)} className="quick-action-btn-dashboard">
                                    <div className="quick-action-icon" style={{ color: action.color }}>{action.icon}</div>
                                    <span className="quick-action-label">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </UnifiedCard>

                    <UnifiedCard>
                        <h3 className="sidebar-section-title">My Trainer</h3>
                        <div className="trainer-card-compact">
                            <div className="trainer-avatar-sm">
                                {trainer.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div className="trainer-name-sm">{trainer.fullName}</div>
                                <div className="trainer-special-sm">{trainer.specialization}</div>
                            </div>
                        </div>
                        <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/member/trainer')}>
                            Message
                        </button>
                    </UnifiedCard>

                    <UnifiedCard>
                        <h3 className="sidebar-section-title">Membership Status</h3>
                        <div className="membership-status-bar">
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{membership.packageName}</span>
                            <span className="membership-badge">{membership.status}</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (membership.daysRemaining || 0) / 30 * 100)}%` }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
                            Ends {membership.endDate}
                        </div>
                    </UnifiedCard>

                    <UnifiedCard>
                        <h3 className="sidebar-section-title">Progress Snapshot</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                            <span>Weight: 78kg</span>
                            <span>Goal: 75kg</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: '70%' }} />
                        </div>
                        <div className="progress-snapshot-metrics">
                            <div className="metric-item">
                                <div className="metric-value">18</div>
                                <div className="metric-label">Workouts</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">92%</div>
                                <div className="metric-label">Accuracy</div>
                            </div>
                        </div>
                    </UnifiedCard>
                </aside>
            </div>
        </UnifiedPage>
    );
};

export default MemberDashboard;
