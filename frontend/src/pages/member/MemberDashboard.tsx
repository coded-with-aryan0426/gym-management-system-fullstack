import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
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

const AnimatedFlame: React.FC<{ size?: number }> = ({ size = 20 }) => {
    return (
        <motion.div
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0]
            }}
            transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{ display: 'flex' }}
        >
            <Flame size={size} />
        </motion.div>
    );
};

const AnimatedHeart: React.FC<{ size?: number }> = ({ size = 18 }) => {
    return (
        <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ display: 'flex' }}
        >
            <Heart size={size} />
        </motion.div>
    );
};

const AnimatedZap: React.FC<{ size?: number }> = ({ size = 18 }) => {
    return (
        <motion.div
            animate={{ 
                opacity: [1, 0.5, 1],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ display: 'flex' }}
        >
            <Zap size={size} />
        </motion.div>
    );
};

const AnimatedDumbbell: React.FC<{ size?: number }> = ({ size = 18 }) => {
    return (
        <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'flex' }}
        >
            <Dumbbell size={size} />
        </motion.div>
    );
};

const AnimatedActivity: React.FC<{ size?: number }> = ({ size = 18 }) => {
    return (
        <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ display: 'flex' }}
        >
            <Activity size={size} />
        </motion.div>
    );
};

const AnimatedSparkles: React.FC<{ size?: number }> = ({ size = 18 }) => {
    return (
        <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ display: 'flex' }}
        >
            <Sparkles size={size} />
        </motion.div>
    );
};

const AnimatedTarget: React.FC<{ size?: number }> = ({ size = 18 }) => {
    return (
        <motion.div
            animate={{ scale: [1, 0.9, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ display: 'flex' }}
        >
            <Target size={size} />
        </motion.div>
    );
};

const AnimatedTrophy: React.FC<{ size?: number }> = ({ size = 20 }) => {
    return (
        <motion.div
            animate={{ 
                y: [0, -3, 0],
                rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ display: 'flex' }}
        >
            <Trophy size={size} />
        </motion.div>
    );
};

const AnimatedStar: React.FC<{ size?: number }> = ({ size = 12 }) => {
    return (
        <motion.div
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ display: 'flex' }}
        >
            <Star size={size} />
        </motion.div>
    );
};

const AnimatedBell: React.FC<{ size?: number }> = ({ size = 20 }) => {
    return (
        <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            style={{ display: 'flex' }}
        >
            <Bell size={size} />
        </motion.div>
    );
};

const AnimatedGem: React.FC<{ size?: number }> = ({ size = 20 }) => {
    return (
        <motion.div
            animate={{ 
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'flex' }}
        >
            <Gem size={size} />
        </motion.div>
    );
};

const PulsingDot: React.FC<{ color: string }> = ({ color }) => {
    return (
        <motion.span
            className="status-dot"
            style={{ background: color }}
            animate={{ 
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    );
};

const classTypeIcons: Record<string, React.ReactNode> = {
    yoga: <AnimatedHeart size={18} />,
    hiit: <AnimatedZap size={18} />,
    strength: <AnimatedDumbbell size={18} />,
    spin: <AnimatedActivity size={18} />,
    pilates: <AnimatedSparkles size={18} />,
    boxing: <AnimatedTarget size={18} />
};

const classTypeGradients: Record<string, string> = {
    yoga: 'linear-gradient(135deg, #34C759, #30D158)',
    hiit: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
    strength: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    spin: 'linear-gradient(135deg, #AF52DE, #BF5AF2)',
    pilates: 'linear-gradient(135deg, #5AC8FA, #64D2FF)',
    boxing: 'linear-gradient(135deg, #FF9500, #FFCC00)'
};

const InteractiveStatCard: React.FC<{
    icon: React.ReactNode;
    value: number;
    label: string;
    colorClass: string;
    trend?: { value: string; up: boolean };
    badge?: { text: string; isNew?: boolean };
}> = ({ icon, value, label, colorClass, trend, badge }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1000;
        const increment = value / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div 
            className={`stat-card ${colorClass}`}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{ cursor: 'pointer' }}
        >
            <motion.div 
                className="stat-card__icon"
                animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
                transition={{ duration: 0.4 }}
            >
                {icon}
            </motion.div>
            <div className="stat-card__content">
                <motion.span 
                    className="stat-card__value"
                    animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                >
                    {displayValue}
                </motion.span>
                <span className="stat-card__label">{label}</span>
            </div>
            {trend && (
                <motion.div 
                    className={`stat-card__trend stat-card__trend--${trend.up ? 'up' : 'down'}`}
                    animate={isHovered ? { y: [-2, 0], opacity: [0.7, 1] } : {}}
                >
                    <TrendingUp size={14} />
                    {trend.value}
                </motion.div>
            )}
            {badge && (
                <motion.div 
                    className={`stat-card__badge ${badge.isNew ? 'stat-card__badge--new' : ''}`}
                    animate={isHovered ? { scale: [1, 1.15, 1] } : {}}
                >
                    {badge.isNew ? <Award size={12} /> : <AnimatedStar size={12} />}
                    {badge.text}
                </motion.div>
            )}
        </motion.div>
    );
};

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hoveredClass, setHoveredClass] = useState<number | null>(null);

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
        { icon: <AnimatedActivity size={20} />, label: 'My Progress', path: '/member/progress', color: '#34C759' },
        { icon: <MessageSquare size={20} />, label: 'Messages', path: '/member/trainer', color: '#AF52DE' },
        { icon: <AnimatedBell size={20} />, label: 'Notifications', path: '/member/notifications', color: '#FF9500' }
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
                <motion.div 
                    className="member-dashboard__hero-avatar"
                    whileHover={{ scale: 1.05 }}
                >
                    <motion.div 
                        className="member-dashboard__avatar-ring"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="member-dashboard__avatar">
                            {firstName.charAt(0)}
                        </div>
                    </motion.div>
                    <motion.div 
                        className="member-dashboard__streak-badge"
                        animate={{ 
                            scale: [1, 1.1, 1],
                            boxShadow: [
                                '0 4px 12px rgba(255, 149, 0, 0.4)',
                                '0 6px 20px rgba(255, 149, 0, 0.6)',
                                '0 4px 12px rgba(255, 149, 0, 0.4)'
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <AnimatedFlame size={12} />
                        {stats.streakDays}
                    </motion.div>
                </motion.div>
            </motion.header>

            <motion.div 
                className="member-dashboard__membership-card" 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
            >
                <div className="membership-card__glow" />
                <motion.div 
                    className="membership-card__pattern"
                    animate={{ 
                        backgroundPosition: ['0% 0%', '100% 100%']
                    }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                />
                <div className="membership-card__content">
                    <div className="membership-card__header">
                        <div className="membership-card__plan-info">
                            <span className="membership-card__label">Current Plan</span>
                            <h2 className="membership-card__plan-name">
                                <AnimatedGem size={20} />
                                {membership.packageName}
                            </h2>
                        </div>
                        <span className={`membership-card__status membership-card__status--${membership.status?.toLowerCase()}`}>
                            <PulsingDot color={membership.status === 'Active' ? '#34C759' : '#FF9500'} />
                            {membership.status}
                        </span>
                    </div>
                    
                    <div className="membership-card__stats">
                        <motion.div 
                            className="membership-card__stat"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="membership-card__stat-value">{membership.daysRemaining}</span>
                            <span className="membership-card__stat-label">Days Left</span>
                        </motion.div>
                        <div className="membership-card__stat-divider" />
                        <motion.div 
                            className="membership-card__stat"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="membership-card__stat-value">{membership.endDate}</span>
                            <span className="membership-card__stat-label">Expires On</span>
                        </motion.div>
                        <div className="membership-card__stat-divider" />
                        <motion.div 
                            className="membership-card__stat"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="membership-card__stat-value">Monthly</span>
                            <span className="membership-card__stat-label">Billing Cycle</span>
                        </motion.div>
                    </div>

                    <div className="membership-card__progress">
                        <div className="membership-card__progress-bar">
                            <motion.div 
                                className="membership-card__progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, (membership.daysRemaining || 0) / 30 * 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                            <motion.div 
                                className="membership-card__progress-glow"
                                animate={{ 
                                    x: ['0%', '100%'],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
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
                        whileHover={{ 
                            y: -6, 
                            scale: 1.05,
                            boxShadow: `0 12px 40px ${action.color}30`
                        }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                    >
                        <motion.div 
                            className="quick-action__icon" 
                            style={{ background: `${action.color}20`, color: action.color }}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.4 }}
                        >
                            {action.icon}
                        </motion.div>
                        <span className="quick-action__label">{action.label}</span>
                    </motion.button>
                ))}
            </motion.div>

            <motion.div className="member-dashboard__stats-grid" variants={itemVariants}>
                <InteractiveStatCard
                    icon={<Calendar size={20} />}
                    value={stats.classesThisWeek}
                    label="Classes This Week"
                    colorClass="stat-card--blue"
                    trend={{ value: '+2', up: true }}
                />
                <InteractiveStatCard
                    icon={<CheckCircle2 size={20} />}
                    value={stats.attendedThisMonth}
                    label="Attended This Month"
                    colorClass="stat-card--green"
                    trend={{ value: '+3', up: true }}
                />
                <InteractiveStatCard
                    icon={<AnimatedFlame size={20} />}
                    value={stats.streakDays}
                    label="Day Streak"
                    colorClass="stat-card--orange"
                    badge={{ text: 'Best!' }}
                />
                <InteractiveStatCard
                    icon={<AnimatedTrophy size={20} />}
                    value={stats.achievements}
                    label="Achievements"
                    colorClass="stat-card--purple"
                    badge={{ text: 'New!', isNew: true }}
                />
            </motion.div>

            <motion.section className="member-dashboard__section" variants={itemVariants}>
                <div className="section-header">
                    <h2 className="section-header__title">
                        <Calendar size={20} />
                        Upcoming Classes
                    </h2>
                    <motion.button 
                        className="section-header__link" 
                        onClick={() => navigate('/member/bookings')}
                        whileHover={{ x: 4 }}
                    >
                        View All <ChevronRight size={16} />
                    </motion.button>
                </div>

                <div className="classes-list">
                    {upcomingClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            className="class-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 + 0.4 }}
                            whileHover={{ 
                                x: 8, 
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                            }}
                            onHoverStart={() => setHoveredClass(cls.id)}
                            onHoverEnd={() => setHoveredClass(null)}
                        >
                            <motion.div 
                                className="class-card__icon"
                                style={{ background: classTypeGradients[cls.type] }}
                                animate={hoveredClass === cls.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                            >
                                {classTypeIcons[cls.type]}
                            </motion.div>
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
                            <motion.div 
                                className="class-card__spots"
                                animate={hoveredClass === cls.id ? { scale: 1.05 } : { scale: 1 }}
                            >
                                {cls.spots} spots
                            </motion.div>
                            <motion.div
                                className="class-card__play"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={hoveredClass === cls.id ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            >
                                <Play size={16} fill="currentColor" />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.div className="member-dashboard__grid-2col" variants={itemVariants}>
                <motion.div 
                    className="trainer-card" 
                    whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)' }}
                >
                    <div className="trainer-card__header">
                        <h3 className="trainer-card__title">
                            <AnimatedDumbbell size={18} />
                            My Trainer
                        </h3>
                        <motion.button 
                            className="trainer-card__action" 
                            onClick={() => navigate('/member/trainer')}
                            whileHover={{ scale: 1.1, rotate: 45 }}
                        >
                            <ArrowUpRight size={16} />
                        </motion.button>
                    </div>
                    
                    <div className="trainer-card__profile">
                        <motion.div 
                            className="trainer-card__avatar"
                            whileHover={{ scale: 1.1 }}
                            animate={{ 
                                boxShadow: [
                                    '0 4px 20px rgba(0, 122, 255, 0.3)',
                                    '0 4px 30px rgba(175, 82, 222, 0.3)',
                                    '0 4px 20px rgba(0, 122, 255, 0.3)'
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {trainer.fullName.split(' ').map(n => n[0]).join('')}
                        </motion.div>
                        <div className="trainer-card__info">
                            <h4 className="trainer-card__name">{trainer.fullName}</h4>
                            <p className="trainer-card__specialty">{trainer.specialization}</p>
                            <motion.div 
                                className="trainer-card__next-session"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Clock size={14} />
                                <span>Next: {trainer.nextSession}</span>
                            </motion.div>
                        </div>
                    </div>

                    <div className="trainer-card__actions">
                        <motion.button 
                            className="btn btn--secondary btn--sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <MessageSquare size={14} />
                            Message
                        </motion.button>
                        <motion.button 
                            className="btn btn--ghost btn--sm" 
                            onClick={() => navigate('/member/trainer')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View Profile
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div 
                    className="progress-card" 
                    whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)' }}
                >
                    <div className="progress-card__header">
                        <h3 className="progress-card__title">
                            <AnimatedActivity size={18} />
                            Progress Snapshot
                        </h3>
                        <motion.button 
                            className="progress-card__action" 
                            onClick={() => navigate('/member/progress')}
                            whileHover={{ scale: 1.1, rotate: 45 }}
                        >
                            <ArrowUpRight size={16} />
                        </motion.button>
                    </div>

                    <div className="progress-card__weight">
                        <div className="progress-card__weight-labels">
                            <span className="weight-label">Start</span>
                            <span className="weight-label weight-label--current">Current</span>
                            <span className="weight-label">Goal</span>
                        </div>
                        <div className="progress-card__weight-values">
                            <span className="weight-value">{progressStats.startWeight}kg</span>
                            <motion.span 
                                className="weight-value weight-value--current"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {progressStats.currentWeight}kg
                            </motion.span>
                            <span className="weight-value">{progressStats.goalWeight}kg</span>
                        </div>
                        <div className="progress-card__progress-bar">
                            <motion.div 
                                className="progress-card__progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                            />
                            <motion.div 
                                className="progress-card__progress-shine"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />
                        </div>
                        <motion.span 
                            className="progress-card__percentage"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {progressPercentage}% to goal
                        </motion.span>
                    </div>

                    <div className="progress-card__stats">
                        <motion.div 
                            className="progress-card__stat"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="progress-card__stat-label">Workouts</span>
                            <span className="progress-card__stat-value">{progressStats.workoutsThisMonth}</span>
                        </motion.div>
                        <motion.div 
                            className="progress-card__stat"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="progress-card__stat-label">Calories Burned</span>
                            <span className="progress-card__stat-value">{progressStats.caloriesBurned.toLocaleString()}</span>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default MemberDashboard;
