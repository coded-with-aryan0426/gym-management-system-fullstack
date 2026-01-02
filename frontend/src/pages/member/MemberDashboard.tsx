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
    Play,
    Star,
    Award
} from 'lucide-react';
import '../../styles/macos-member.css';
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

const classTypeIcons: Record<string, React.ReactNode> = {
    yoga: <Heart size={18} />,
    hiit: <Zap size={18} />,
    strength: <Dumbbell size={18} />,
    spin: <Activity size={18} />,
    pilates: <Sparkles size={18} />,
    boxing: <Target size={18} />
};

const classTypeGradients: Record<string, string> = {
    yoga: 'linear-gradient(135deg, #34C759, #30D158)',
    hiit: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
    strength: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    spin: 'linear-gradient(135deg, #AF52DE, #BF5AF2)',
    pilates: 'linear-gradient(135deg, #5AC8FA, #64D2FF)',
    boxing: 'linear-gradient(135deg, #FF9500, #FFCC00)'
};

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/member/dashboard?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboard(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user?.id]);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const memberName = dashboard?.memberName || user?.fullName || 'Member';
    const firstName = memberName.split(' ')[0];

    const stats = {
        classesThisWeek: 3,
        attendedThisMonth: 18,
        streakDays: 7,
        achievements: 4
    };

    const membership = dashboard?.membership || {
        status: 'Active',
        packageName: 'Premium Monthly',
        daysRemaining: 25,
        endDate: 'Jan 26, 2026'
    };

    const upcomingClasses = [
        { id: 1, title: 'Morning Yoga', time: '9:00 AM', date: 'Tomorrow', location: 'Studio A', trainer: 'Sarah Johnson', type: 'yoga', spots: 3 },
        { id: 2, title: 'HIIT Burn', time: '6:00 PM', date: 'Tue, Jan 2', location: 'Main Floor', trainer: 'Mike Chen', type: 'hiit', spots: 8 },
        { id: 3, title: 'Power Lifting', time: '10:00 AM', date: 'Fri, Jan 5', location: 'Weight Room', trainer: 'John Smith', type: 'strength', spots: 5 }
    ];

    const trainer = dashboard?.assignedTrainer || {
        id: 1,
        fullName: 'John Smith',
        specialization: 'Strength & Conditioning',
        nextSession: 'Friday, 10:00 AM'
    };

    const quickActions = [
        { icon: <Calendar size={20} />, label: 'Book Class', path: '/member/classes', color: '#007AFF' },
        { icon: <Activity size={20} />, label: 'My Progress', path: '/member/progress', color: '#34C759' },
        { icon: <MessageSquare size={20} />, label: 'Messages', path: '/member/trainer', color: '#AF52DE' },
        { icon: <Bell size={20} />, label: 'Notifications', path: '/member/notifications', color: '#FF9500' }
    ];

    const progressStats = {
        startWeight: 85,
        currentWeight: 78,
        goalWeight: 75,
        workoutsThisMonth: 18,
        caloriesBurned: 5200
    };

    const progressPercentage = Math.round(
        ((progressStats.startWeight - progressStats.currentWeight) /
            (progressStats.startWeight - progressStats.goalWeight)) * 100
    );

    if (loading) {
        return (
            <div className="member-dashboard-loading">
                <motion.div
                    className="member-dashboard-loading__spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Dumbbell size={32} />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="member-dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header className="member-dashboard__hero" variants={itemVariants}>
                <div className="member-dashboard__hero-content">
                    <span className="member-dashboard__hero-greeting">{getGreeting()}</span>
                    <h1 className="member-dashboard__hero-name">{firstName}</h1>
                    <p className="member-dashboard__hero-subtitle">
                        You're on a <span className="highlight">{stats.streakDays}-day streak</span> — keep it up!
                    </p>
                </div>
                <div className="member-dashboard__hero-avatar">
                    <div className="member-dashboard__avatar-ring">
                        <div className="member-dashboard__avatar">
                            {firstName.charAt(0)}
                        </div>
                    </div>
                    <div className="member-dashboard__streak-badge">
                        <Flame size={12} />
                        {stats.streakDays}
                    </div>
                </div>
            </motion.header>

            <motion.div className="member-dashboard__membership-card" variants={itemVariants}>
                <div className="membership-card__glow" />
                <div className="membership-card__pattern" />
                <div className="membership-card__content">
                    <div className="membership-card__header">
                        <div className="membership-card__plan-info">
                            <span className="membership-card__label">Current Plan</span>
                            <h2 className="membership-card__plan-name">
                                <Gem size={20} />
                                {membership.packageName}
                            </h2>
                        </div>
                        <span className={`membership-card__status membership-card__status--${membership.status?.toLowerCase()}`}>
                            <span className="status-dot" />
                            {membership.status}
                        </span>
                    </div>
                    
                    <div className="membership-card__stats">
                        <div className="membership-card__stat">
                            <span className="membership-card__stat-value">{membership.daysRemaining}</span>
                            <span className="membership-card__stat-label">Days Left</span>
                        </div>
                        <div className="membership-card__stat-divider" />
                        <div className="membership-card__stat">
                            <span className="membership-card__stat-value">{membership.endDate}</span>
                            <span className="membership-card__stat-label">Expires On</span>
                        </div>
                        <div className="membership-card__stat-divider" />
                        <div className="membership-card__stat">
                            <span className="membership-card__stat-value">Monthly</span>
                            <span className="membership-card__stat-label">Billing Cycle</span>
                        </div>
                    </div>

                    <div className="membership-card__progress">
                        <div className="membership-card__progress-bar">
                            <motion.div 
                                className="membership-card__progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, (membership.daysRemaining || 0) / 30 * 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div className="member-dashboard__quick-actions" variants={itemVariants}>
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.label}
                        className="quick-action"
                        onClick={() => navigate(action.path)}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                    >
                        <div className="quick-action__icon" style={{ background: `${action.color}20`, color: action.color }}>
                            {action.icon}
                        </div>
                        <span className="quick-action__label">{action.label}</span>
                    </motion.button>
                ))}
            </motion.div>

            <motion.div className="member-dashboard__stats-grid" variants={itemVariants}>
                <motion.div className="stat-card stat-card--blue" whileHover={{ y: -2 }}>
                    <div className="stat-card__icon">
                        <Calendar size={20} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">{stats.classesThisWeek}</span>
                        <span className="stat-card__label">Classes This Week</span>
                    </div>
                    <div className="stat-card__trend stat-card__trend--up">
                        <TrendingUp size={14} />
                        +2
                    </div>
                </motion.div>

                <motion.div className="stat-card stat-card--green" whileHover={{ y: -2 }}>
                    <div className="stat-card__icon">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">{stats.attendedThisMonth}</span>
                        <span className="stat-card__label">Attended This Month</span>
                    </div>
                    <div className="stat-card__trend stat-card__trend--up">
                        <TrendingUp size={14} />
                        +3
                    </div>
                </motion.div>

                <motion.div className="stat-card stat-card--orange" whileHover={{ y: -2 }}>
                    <div className="stat-card__icon">
                        <Flame size={20} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">{stats.streakDays}</span>
                        <span className="stat-card__label">Day Streak</span>
                    </div>
                    <div className="stat-card__badge">
                        <Star size={12} /> Best!
                    </div>
                </motion.div>

                <motion.div className="stat-card stat-card--purple" whileHover={{ y: -2 }}>
                    <div className="stat-card__icon">
                        <Trophy size={20} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">{stats.achievements}</span>
                        <span className="stat-card__label">Achievements</span>
                    </div>
                    <div className="stat-card__badge stat-card__badge--new">
                        <Award size={12} /> New!
                    </div>
                </motion.div>
            </motion.div>

            <motion.section className="member-dashboard__section" variants={itemVariants}>
                <div className="section-header">
                    <h2 className="section-header__title">
                        <Calendar size={20} />
                        Upcoming Classes
                    </h2>
                    <button className="section-header__link" onClick={() => navigate('/member/bookings')}>
                        View All <ChevronRight size={16} />
                    </button>
                </div>

                <div className="classes-list">
                    {upcomingClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            className="class-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 + 0.4 }}
                            whileHover={{ x: 4 }}
                        >
                            <div 
                                className="class-card__icon"
                                style={{ background: classTypeGradients[cls.type] }}
                            >
                                {classTypeIcons[cls.type]}
                            </div>
                            <div className="class-card__content">
                                <h3 className="class-card__title">{cls.title}</h3>
                                <p className="class-card__meta">
                                    <MapPin size={12} />
                                    {cls.location} • {cls.trainer}
                                </p>
                            </div>
                            <div className="class-card__time">
                                <span className="class-card__time-value">{cls.time}</span>
                                <span className="class-card__time-date">{cls.date}</span>
                            </div>
                            <div className="class-card__spots">
                                {cls.spots} spots
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.div className="member-dashboard__grid-2col" variants={itemVariants}>
                <motion.div className="trainer-card" whileHover={{ scale: 1.01 }}>
                    <div className="trainer-card__header">
                        <h3 className="trainer-card__title">
                            <Dumbbell size={18} />
                            My Trainer
                        </h3>
                        <button className="trainer-card__action" onClick={() => navigate('/member/trainer')}>
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                    
                    <div className="trainer-card__profile">
                        <div className="trainer-card__avatar">
                            {trainer.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="trainer-card__info">
                            <h4 className="trainer-card__name">{trainer.fullName}</h4>
                            <p className="trainer-card__specialty">{trainer.specialization}</p>
                            <div className="trainer-card__next-session">
                                <Clock size={14} />
                                <span>Next: {trainer.nextSession}</span>
                            </div>
                        </div>
                    </div>

                    <div className="trainer-card__actions">
                        <button className="btn btn--secondary btn--sm">
                            <MessageSquare size={14} />
                            Message
                        </button>
                        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/member/trainer')}>
                            View Profile
                        </button>
                    </div>
                </motion.div>

                <motion.div className="progress-card" whileHover={{ scale: 1.01 }}>
                    <div className="progress-card__header">
                        <h3 className="progress-card__title">
                            <Activity size={18} />
                            Progress Snapshot
                        </h3>
                        <button className="progress-card__action" onClick={() => navigate('/member/progress')}>
                            <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <div className="progress-card__weight">
                        <div className="progress-card__weight-labels">
                            <span className="weight-label">Start</span>
                            <span className="weight-label weight-label--current">Current</span>
                            <span className="weight-label">Goal</span>
                        </div>
                        <div className="progress-card__weight-values">
                            <span className="weight-value">{progressStats.startWeight}kg</span>
                            <span className="weight-value weight-value--current">{progressStats.currentWeight}kg</span>
                            <span className="weight-value">{progressStats.goalWeight}kg</span>
                        </div>
                        <div className="progress-card__progress-bar">
                            <motion.div 
                                className="progress-card__progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                            />
                        </div>
                        <span className="progress-card__percentage">{progressPercentage}% to goal</span>
                    </div>

                    <div className="progress-card__stats">
                        <div className="progress-card__stat">
                            <span className="progress-card__stat-label">Workouts</span>
                            <span className="progress-card__stat-value">{progressStats.workoutsThisMonth}</span>
                        </div>
                        <div className="progress-card__stat">
                            <span className="progress-card__stat-label">Calories Burned</span>
                            <span className="progress-card__stat-value">{progressStats.caloriesBurned.toLocaleString()}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default MemberDashboard;
