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
    Pause,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

// Import unified dashboard CSS
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-members.css';
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
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        const fetchDashboard = async () => {
            const memberId = user?.userId || user?.id;
            if (!memberId) { setLoading(false); return; }
            try {
                const response = await fetch(`/api/member/dashboard?memberId=${memberId}`);
                if (response.ok) setDashboard(await response.json());
            } catch (error) { console.error('Failed to fetch dashboard:', error); }
            finally { setLoading(false); }
        };
        fetchDashboard();
        return () => clearInterval(timer);
    }, [user]);

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

    // Skeleton Loading State
    if (loading) return (
        <div className="dash dash--member">
            <div className="dash-skeleton">
                <div className="dash-skeleton__header"></div>
                <div className="dash-skeleton__kpi-grid">
                    {[1, 2, 3, 4].map(i => <div key={i} className="dash-skeleton__card"></div>)}
                </div>
                <div className="dash-skeleton__content"></div>
            </div>
        </div>
    );

    return (
        <div className="dash dash--member">
            {/* Header */}
            <header className="dash-member__header">
                <div className="dash-member__header__top">
                    <div className="dash-member__header__profile">
                        <div className="dash-member__avatar">
                            {firstName.charAt(0)}
                        </div>
                        <div className="dash-member__header__welcome">
                            <h1 className="dash-member__header__title">
                                {getGreeting()}, {firstName}
                            </h1>
                            <p className="dash-member__header__subtitle">
                                Let's crush your fitness goals today
                            </p>
                        </div>
                    </div>
                    <div className="dash-trainer__header__date">
                        <Calendar size={14} />
                        {format(currentTime, 'EEE, MMM d')}
                        <span style={{ opacity: 0.5 }}>•</span>
                        {format(currentTime, 'h:mm a')}
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <section className="dash-member__stats-grid">
                <div className="dash-member__stat">
                    <div className="dash-member__stat__icon dash-member__stat__icon--workouts">
                        <Dumbbell size={20} />
                    </div>
                    <span className="dash-member__stat__value">18</span>
                    <span className="dash-member__stat__label">This Month</span>
                </div>
                <div className="dash-member__stat">
                    <div className="dash-member__stat__icon dash-member__stat__icon--streak">
                        <Flame size={20} />
                    </div>
                    <span className="dash-member__stat__value">{stats.streakDays}</span>
                    <span className="dash-member__stat__label">Day Streak</span>
                </div>
                <div className="dash-member__stat">
                    <div className="dash-member__stat__icon dash-member__stat__icon--classes">
                        <Calendar size={20} />
                    </div>
                    <span className="dash-member__stat__value">{dashboard?.bookedClassesCount || 0}</span>
                    <span className="dash-member__stat__label">Booked Classes</span>
                </div>
                <div className="dash-member__stat">
                    <div className="dash-member__stat__icon dash-member__stat__icon--calories">
                        <Heart size={20} />
                    </div>
                    <span className="dash-member__stat__value">2,450</span>
                    <span className="dash-member__stat__label">Avg. Calories</span>
                </div>
            </section>

            {/* Main Layout */}
            <div className="dash-member__layout">
                {/* Main Content */}
                <div className="dash-member__main">
                    {/* Membership Card */}
                    <div className={`dash-member__membership ${membership.packageName?.toLowerCase().includes('premium') ? 'dash-member__membership--premium' : ''}`}>
                        <div className="dash-member__membership__header">
                            <div className="dash-member__membership__type">
                                <span className={`dash-member__membership__badge ${membership.packageName?.toLowerCase().includes('premium') ? 'dash-member__membership__badge--premium' : ''}`}>
                                    {membership.packageName?.toLowerCase().includes('premium') ? '⭐ PREMIUM' : 'STANDARD'}
                                </span>
                                <span className="dash-member__membership__name">{membership.packageName}</span>
                            </div>
                            <span className={`dash-badge dash-badge--${membership.status === 'Active' ? 'success' : 'warning'}`}>
                                {membership.status}
                            </span>
                        </div>
                        <div className="dash-member__membership__body">
                            <div className="dash-member__membership__stat">
                                <span className="dash-member__membership__stat__value">{membership.daysRemaining}</span>
                                <span className="dash-member__membership__stat__label">Days Left</span>
                            </div>
                            <div className="dash-member__membership__stat">
                                <span className="dash-member__membership__stat__value">∞</span>
                                <span className="dash-member__membership__stat__label">Gym Access</span>
                            </div>
                            <div className="dash-member__membership__stat">
                                <span className="dash-member__membership__stat__value">5</span>
                                <span className="dash-member__membership__stat__label">PT Sessions</span>
                            </div>
                        </div>
                        <div className="dash-member__membership__expiry">
                            <div className="dash-member__membership__expiry__info">
                                <span className="dash-member__membership__expiry__label">Membership Ends</span>
                                <span className="dash-member__membership__expiry__date">{membership.endDate}</span>
                            </div>
                            <button className="dash-btn dash-btn--primary dash-btn--sm" onClick={() => navigate('/member/membership')}>
                                Renew
                            </button>
                        </div>
                    </div>

                    {/* Upcoming Classes */}
                    <div className="dash-member__classes dash-card dash-member__card--classes">
                        <div className="dash-member__classes__header">
                            <h3 className="dash-member__classes__title">
                                <Calendar size={18} /> Upcoming Classes
                            </h3>
                            <button className="dash-link" onClick={() => navigate('/member/bookings')}>
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="dash-member__classes__list dash-member__classes__list--scroll">
                            {upcomingClasses.map((cls) => (
                                <div key={cls.id} className="dash-member__class-row">
                                    <div className="dash-member__class__date">
                                        <span className="dash-member__class__day">{cls.date.split(',')[0].split(' ')[1] || cls.date.split(' ')[0]}</span>
                                        <span className="dash-member__class__month">{cls.date.includes(',') ? cls.date.split(',')[0].split(' ')[0] : 'TMW'}</span>
                                    </div>
                                    <div className="dash-member__class__info">
                                        <span className="dash-member__class__name">{cls.title}</span>
                                        <span className="dash-member__class__meta">
                                            <Clock size={12} /> {cls.time} • <MapPin size={12} /> {cls.location}
                                        </span>
                                    </div>
                                    <div className="dash-member__class__trainer">
                                        <div className="dash-member__class__trainer__avatar">
                                            {cls.trainer.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="dash-member__class__trainer__name">{cls.trainer.split(' ')[0]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="dash-member__sidebar">
                    {/* Quick Actions */}
                    <div className="dash-card">
                        <h3 className="dash-card__title">Quick Actions</h3>
                        <div className="dash-member__actions">
                            {quickActions.map(action => (
                                <button key={action.label} className="dash-member__action-btn" onClick={() => navigate(action.path)}>
                                    <div className="dash-member__action-btn__icon" style={{ color: action.color }}>
                                        {action.icon}
                                    </div>
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* My Trainer */}
                    <div className="dash-member__trainer-card">
                        <div className="dash-member__trainer-card__header">
                            <div className="dash-member__trainer-card__avatar">
                                {trainer.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="dash-member__trainer-card__info">
                                <span className="dash-member__trainer-card__name">{trainer.fullName}</span>
                                <span className="dash-member__trainer-card__specialty">{trainer.specialization}</span>
                            </div>
                        </div>
                        <div className="dash-member__trainer-card__stats">
                            <div className="dash-member__trainer-card__stat">
                                <span className="dash-member__trainer-card__stat__value">12</span>
                                <span className="dash-member__trainer-card__stat__label">Sessions</span>
                            </div>
                            <div className="dash-member__trainer-card__stat">
                                <span className="dash-member__trainer-card__stat__value">4.9</span>
                                <span className="dash-member__trainer-card__stat__label">Rating</span>
                            </div>
                        </div>
                        <button className="dash-btn dash-btn--primary" onClick={() => navigate('/member/trainer')} style={{ width: '100%', justifyContent: 'center' }}>
                            <MessageSquare size={16} /> Message Trainer
                        </button>
                    </div>

                    {/* Progress Snapshot */}
                    <div className="dash-member__progress dash-member__card--activity">
                        <div className="dash-member__progress__header">
                            <h3 className="dash-member__progress__title">
                                <TrendingUp size={16} /> Progress
                            </h3>
                        </div>
                        <div className="dash-member__progress__goals">
                            <div className="dash-member__goal">
                                <div className="dash-member__goal__header">
                                    <span className="dash-member__goal__name">Weight Goal</span>
                                    <span className="dash-member__goal__value">78kg → 75kg</span>
                                </div>
                                <div className="dash-member__goal__bar">
                                    <div className="dash-member__goal__fill dash-member__goal__fill--blue" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                            <div className="dash-member__goal">
                                <div className="dash-member__goal__header">
                                    <span className="dash-member__goal__name">Weekly Workouts</span>
                                    <span className="dash-member__goal__value">4/5</span>
                                </div>
                                <div className="dash-member__goal__bar">
                                    <div className="dash-member__goal__fill dash-member__goal__fill--green" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                            <div className="dash-member__goal">
                                <div className="dash-member__goal__header">
                                    <span className="dash-member__goal__name">Strength Progress</span>
                                    <span className="dash-member__goal__value">Level 3</span>
                                </div>
                                <div className="dash-member__goal__bar">
                                    <div className="dash-member__goal__fill dash-member__goal__fill--violet" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
