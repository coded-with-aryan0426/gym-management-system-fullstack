import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Flame,
    CheckCircle2,
    CreditCard,
    ChevronRight,
    Clock,
    MapPin,
    User,
    Activity,
    Trophy,
    MessageSquare,
    Dumbbell,
    Gem,
    Zap,
    Heart,
    Target,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Class type icons mapping
const classTypeIcons: Record<string, React.ReactNode> = {
    yoga: <Heart size={20} />,
    hiit: <Zap size={20} />,
    strength: <Dumbbell size={20} />,
    spin: <Activity size={20} />,
    pilates: <Sparkles size={20} />,
    boxing: <Target size={20} />
};

const classTypeColors: Record<string, string> = {
    yoga: 'rgba(52, 199, 89, 0.15)',
    hiit: 'rgba(255, 59, 48, 0.15)',
    strength: 'rgba(0, 122, 255, 0.15)',
    spin: 'rgba(175, 82, 222, 0.15)',
    pilates: 'rgba(90, 200, 250, 0.15)',
    boxing: 'rgba(255, 149, 0, 0.15)'
};

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

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

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const memberName = dashboard?.memberName || user?.fullName || 'Member';
    const firstName = memberName.split(' ')[0];

    // Mock data for demo (replace with real data)
    const stats = {
        classesThisWeek: 3,
        attendedThisMonth: 18,
        streakDays: 7
    };

    const membership = dashboard?.membership || {
        status: 'Active',
        packageName: 'Premium Monthly',
        daysRemaining: 25,
        endDate: 'Jan 26, 2026'
    };

    const upcomingClasses = [
        { id: 1, title: 'Yoga Class', time: '9:00 AM', date: 'Tomorrow', location: 'Room A', trainer: 'Sarah J', type: 'yoga' },
        { id: 2, title: 'HIIT Training', time: '6:00 PM', date: 'Tue, Jan 2', location: 'Main Studio', trainer: 'Mike C', type: 'hiit' },
        { id: 3, title: 'Strength Training', time: '10:00 AM', date: 'Fri, Jan 5', location: 'Weight Room', trainer: 'John S', type: 'strength' }
    ];

    const trainer = dashboard?.assignedTrainer || {
        id: 1,
        fullName: 'John Smith',
        specialization: 'Weight Training & Nutrition',
        nextSession: 'Friday, 10:00 AM'
    };

    const recentActivity = [
        { id: 1, text: 'Attended Yoga Class', time: 'Today 9:00 AM', type: 'attendance', color: 'green' },
        { id: 2, text: 'Booked HIIT Training', time: 'Yesterday', type: 'booking', color: 'blue' },
        { id: 3, text: 'Weight updated to 78kg', time: '2 days ago', type: 'progress', color: 'purple' },
        { id: 4, text: 'Completed 10 classes milestone', time: '5 days ago', type: 'achievement', color: 'orange' }
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
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Dumbbell size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="macos-page member-dashboard-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Header */}
            <motion.header className="member-dashboard__header" variants={itemVariants}>
                <div>
                    <h1 className="macos-heading-xl">
                        {getGreeting()}, {firstName}!
                    </h1>
                    <p className="macos-text-md" style={{ marginTop: '4px' }}>
                        Your last visit: Yesterday at 6:00 PM
                    </p>
                </div>
            </motion.header>

            {/* Membership Hero Card */}
            <motion.div className="macos-membership-card" variants={itemVariants}>
                <div className="macos-membership-card__header">
                    <div>
                        <span className="macos-text-xs" style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>
                            Current Plan
                        </span>
                        <h2 className="macos-membership-card__plan">
                            <Gem size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            {membership.packageName}
                        </h2>
                    </div>
                    <span className={`macos-membership-card__badge macos-membership-card__badge--${membership.status?.toLowerCase() || 'active'}`}>
                        {membership.status}
                    </span>
                </div>

                <div className="macos-membership-card__stats">
                    <div className="macos-membership-card__stat">
                        <span className="macos-membership-card__stat-label">Days Remaining</span>
                        <span className="macos-membership-card__stat-value">{membership.daysRemaining}</span>
                    </div>
                    <div className="macos-membership-card__stat">
                        <span className="macos-membership-card__stat-label">Expires</span>
                        <span className="macos-membership-card__stat-value">{membership.endDate}</span>
                    </div>
                    <div className="macos-membership-card__stat">
                        <span className="macos-membership-card__stat-label">Plan Type</span>
                        <span className="macos-membership-card__stat-value">Monthly</span>
                    </div>
                </div>

                <div className="macos-membership-card__progress">
                    <div className="macos-membership-card__progress-bar">
                        <div
                            className="macos-membership-card__progress-fill"
                            style={{ width: `${Math.max(0, (membership.daysRemaining || 0) / 30 * 100)}%` }}
                        />
                    </div>
                    <p className="macos-membership-card__progress-text">
                        {membership.daysRemaining} days of membership remaining
                    </p>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div className="bento-grid bento-grid--4col" variants={itemVariants}>
                <motion.div className="glass-card glass-card--md macos-stat-card" whileHover={{ y: -2 }}>
                    <div className="macos-stat-card__icon macos-stat-card__icon--blue">
                        <Calendar size={22} />
                    </div>
                    <div className="macos-stat-card__value">{stats.classesThisWeek}</div>
                    <div className="macos-stat-card__label">Classes This Week</div>
                    <span className="macos-stat-card__trend macos-stat-card__trend--up">
                        +2 more scheduled
                    </span>
                </motion.div>

                <motion.div className="glass-card glass-card--md macos-stat-card" whileHover={{ y: -2 }}>
                    <div className="macos-stat-card__icon macos-stat-card__icon--green">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="macos-stat-card__value">{stats.attendedThisMonth}</div>
                    <div className="macos-stat-card__label">Attended This Month</div>
                    <span className="macos-stat-card__trend macos-stat-card__trend--up">
                        <TrendingUp size={12} /> +3 from last month
                    </span>
                </motion.div>

                <motion.div className="glass-card glass-card--md macos-stat-card" whileHover={{ y: -2 }}>
                    <div className="macos-stat-card__icon macos-stat-card__icon--orange">
                        <Flame size={22} />
                    </div>
                    <div className="macos-stat-card__value">{stats.streakDays}</div>
                    <div className="macos-stat-card__label">Day Streak</div>
                    <span className="macos-badge macos-badge--orange">
                        <Flame size={12} /> Keep it up!
                    </span>
                </motion.div>

                <motion.div className="glass-card glass-card--md macos-stat-card" whileHover={{ y: -2 }}>
                    <div className="macos-stat-card__icon macos-stat-card__icon--purple">
                        <Trophy size={22} />
                    </div>
                    <div className="macos-stat-card__value">4</div>
                    <div className="macos-stat-card__label">Achievements</div>
                    <span className="macos-badge macos-badge--purple">New unlocked!</span>
                </motion.div>
            </motion.div>

            {/* Upcoming Classes Section */}
            <motion.section className="member-dashboard__section" variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Upcoming Classes</h2>
                    <button className="macos-section-link" onClick={() => navigate('/member/bookings')}>
                        View All <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    </button>
                </div>

                <div className="member-dashboard__classes-list">
                    {upcomingClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            className="macos-list-item"
                            whileHover={{ x: 6 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div
                                className="macos-list-item__icon"
                                style={{
                                    background: classTypeColors[cls.type] || 'rgba(0, 122, 255, 0.15)',
                                    color: cls.type === 'yoga' ? 'var(--macos-success)' :
                                        cls.type === 'hiit' ? 'var(--macos-error)' :
                                            'var(--macos-accent)'
                                }}
                            >
                                {classTypeIcons[cls.type] || <Calendar size={20} />}
                            </div>
                            <div className="macos-list-item__content">
                                <div className="macos-list-item__title">{cls.title}</div>
                                <div className="macos-list-item__subtitle">
                                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {cls.location} • {cls.trainer}
                                </div>
                            </div>
                            <div className="macos-list-item__meta">
                                <div className="macos-list-item__time">{cls.time}</div>
                                <div className="macos-list-item__date">{cls.date}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Two Column Grid - Trainer & Progress */}
            <motion.div className="bento-grid bento-grid--2col" variants={itemVariants}>
                {/* Trainer Card */}
                <motion.div className="glass-card glass-card--lg" whileHover={{ scale: 1.01 }}>
                    <div className="macos-section-header" style={{ marginBottom: 'var(--space-5)' }}>
                        <h3 className="macos-heading-md">
                            <Dumbbell size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            My Trainer
                        </h3>
                    </div>

                    <div className="macos-trainer-card">
                        <div className="macos-trainer-card__avatar">
                            {trainer.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="macos-trainer-card__info">
                            <div className="macos-trainer-card__name">{trainer.fullName}</div>
                            <div className="macos-trainer-card__role">{trainer.specialization}</div>
                            <div className="macos-trainer-card__session">
                                <Clock size={14} />
                                Next: {trainer.nextSession}
                            </div>
                        </div>
                    </div>

                    <div className="macos-trainer-card__actions">
                        <button className="macos-btn macos-btn--secondary macos-btn--sm">
                            <MessageSquare size={14} /> Message
                        </button>
                        <button
                            className="macos-btn macos-btn--ghost macos-btn--sm"
                            onClick={() => navigate('/member/trainer')}
                        >
                            View Profile
                        </button>
                    </div>
                </motion.div>

                {/* Progress Snapshot */}
                <motion.div className="glass-card glass-card--lg" whileHover={{ scale: 1.01 }}>
                    <div className="macos-section-header" style={{ marginBottom: 'var(--space-5)' }}>
                        <h3 className="macos-heading-md">
                            <Activity size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            Progress Snapshot
                        </h3>
                        <button className="macos-section-link" onClick={() => navigate('/member/progress')}>
                            View All
                        </button>
                    </div>

                    <div className="member-dashboard__progress-stats">
                        <div className="member-dashboard__progress-weight">
                            <span className="macos-text-xs">Weight Progress</span>
                            <div className="member-dashboard__progress-values">
                                <span className="macos-text-md">{progressStats.startWeight}kg</span>
                                <span className="macos-heading-lg" style={{ color: 'var(--macos-success)' }}>
                                    {progressStats.currentWeight}kg
                                </span>
                                <span className="macos-text-md">{progressStats.goalWeight}kg</span>
                            </div>
                            <div className="macos-progress" style={{ marginTop: '8px' }}>
                                <div
                                    className="macos-progress__fill macos-progress__fill--green"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="macos-text-sm" style={{ marginTop: '4px', display: 'block' }}>
                                {progressPercentage}% to goal
                            </span>
                        </div>

                        <div className="macos-divider" />

                        <div className="member-dashboard__progress-quick">
                            <div className="member-dashboard__progress-item">
                                <span className="macos-text-tertiary">Workouts</span>
                                <span className="macos-heading-sm">{progressStats.workoutsThisMonth}</span>
                            </div>
                            <div className="member-dashboard__progress-item">
                                <span className="macos-text-tertiary">Calories</span>
                                <span className="macos-heading-sm">{progressStats.caloriesBurned.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.section className="member-dashboard__section" variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Recent Activity</h2>
                    <button className="macos-section-link">
                        View All <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    </button>
                </div>

                <div className="glass-card glass-card--md">
                    <div className="macos-timeline">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="macos-timeline-item">
                                <div className={`macos-timeline-item__dot macos-timeline-item__dot--${activity.color}`} />
                                <div className="macos-timeline-item__content">
                                    <div className="macos-timeline-item__text">{activity.text}</div>
                                    <div className="macos-timeline-item__time">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default MemberDashboard;
