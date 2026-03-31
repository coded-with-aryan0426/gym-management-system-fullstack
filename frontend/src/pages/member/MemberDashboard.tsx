import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, Flame, ChevronRight, Clock, MapPin,
    Activity, Trophy, MessageSquare, Dumbbell, Zap, Heart,
    Target, TrendingUp, Bell, Star, Award, User,
    BarChart3, Users, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import {
    BarChart, Bar, LineChart, Line, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/ui/Avatar';

// Import unified dashboard CSS
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-members.css';
import './MemberDashboard.css';

interface DashboardData {
    memberId: number;
    memberName: string;
    email: string;
    avatarId: string;
    workoutsThisMonth: number;
    streakDays: number;
    bookedClassesCount: number;
    unreadNotificationsCount: number;
    caloriesBurned: number;
    minutesActive: number;
    totalPoints: number;
    membership: {
        status: string;
        packageName: string;
        startDate: string;
        endDate: string;
        daysRemaining: number;
        isExpired: boolean;
        planPrice: number;
        planDuration: string;
        autoRenew: boolean;
        isFrozen: boolean;
    } | null;
    assignedTrainer: {
        userId: number;
        fullName: string;
        email: string;
        avatarId: string;
        specialization: string;
        nextSession: string;
        sessionsCount: number;
        rating: number;
    } | null;
    upcomingClasses: Array<{
        id: number;
        title: string;
        time: string;
        date: string;
        location: string;
        trainer: string;
        type: string;
        capacity: number;
        enrolled: number;
    }>;
    weeklyActivity: Array<{
        day: string;
        workouts: number;
        calories: number;
    }>;
    recentActivity: Array<{
        id: number;
        name: string;
        type: 'checkin' | 'workout' | 'booking' | 'payment';
        date: string;
        reason: string;
    }>;
    fitnessMetrics: Array<{
        metric: string;
        value: number;
    }>;
    weightProgress: Array<{
        week: string;
        weight: number;
        goal: number;
    }>;
    achievements: Array<{
        icon: string;
        label: string;
        color: string;
    }>;
}

const COLORS = {
    primary: '#3B82F6',
    blue: '#3B82F6',
    green: '#10B981',
    violet: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#F43F5E',
    cyan: '#06B6D4',
};

const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
    })
};

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
            } catch (error) { 
                console.error('Failed to fetch dashboard:', error); 
            } finally { 
                setLoading(false); 
            }
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

    const quickActions = [
        { icon: Calendar, label: 'Book Class', path: '/member/classes', color: COLORS.blue },
        { icon: Activity, label: 'My Progress', path: '/member/progress', color: COLORS.green },
        { icon: MessageSquare, label: 'Chat', path: '/member/trainer', color: COLORS.violet },
        { icon: Bell, label: 'Alerts', path: '/member/notifications', color: COLORS.amber }
    ];

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'Trophy': return Trophy;
            case 'Target': return Target;
            case 'Award': return Award;
            case 'Star': return Star;
            default: return Star;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'checkin': return MapPin;
            case 'workout': return Dumbbell;
            case 'booking': return Calendar;
            case 'payment': return CreditCard;
            default: return Activity;
        }
    };

    if (loading) {
        return (
            <div className="dash dash--member">
                <div className="dash-skeleton">
                    <div className="dash-skeleton__header" style={{ height: 140 }}></div>
                    <div className="dash-skeleton__kpi-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="dash-skeleton__card" style={{ height: 100 }}></div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginTop: '20px' }}>
                        <div className="dash-skeleton__card" style={{ height: 400 }}></div>
                        <div className="dash-skeleton__card" style={{ height: 400 }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard) return null;

    return (
        <div className="dash dash--member">
            {/* Header */}
            <motion.header 
                className="dash-member__header"
                initial="hidden"
                animate="visible"
                variants={CARD_VARIANTS}
                custom={0}
            >
                <div className="dash-member__header__top">
                    <div className="dash-member__header__profile">
                        <div className="dash-member__avatar">
                            <Avatar 
                                name={dashboard.memberName} 
                                avatarId={dashboard.avatarId} 
                                size="lg"
                            />
                        </div>
                        <div className="dash-member__header__welcome">
                            <h1 className="dash-member__header__title">
                                {getGreeting()}, {firstName}
                            </h1>
                            <p className="dash-member__header__subtitle">
                                Ready to crush your fitness goals today?
                            </p>
                        </div>
                    </div>
                    <div className="dash-trainer__header__date">
                        <Calendar size={14} />
                        {format(currentTime, 'EEE, MMM d')}
                        <span style={{ opacity: 0.4 }}>•</span>
                        <Clock size={14} />
                        {format(currentTime, 'h:mm a')}
                    </div>
                </div>
            </motion.header>

            {/* Stats Grid */}
            <section className="dash-member__stats-grid">
                {[
                    { icon: Dumbbell, label: 'Workouts', value: dashboard.workoutsThisMonth, subtitle: 'This Month', color: 'workouts', delay: 1 },
                    { icon: Flame, label: 'Streak', value: dashboard.streakDays, subtitle: 'Days', color: 'streak', delay: 2 },
                    { icon: Calendar, label: 'Booked', value: dashboard.bookedClassesCount, subtitle: 'Classes', color: 'classes', delay: 3 },
                    { icon: Heart, label: 'Calories', value: dashboard.caloriesBurned, subtitle: 'Total Burn', color: 'calories', delay: 4 }
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            className="dash-member__stat"
                            initial="hidden"
                            animate="visible"
                            variants={CARD_VARIANTS}
                            custom={stat.delay}
                        >
                            <div className={`dash-member__stat__icon dash-member__stat__icon--${stat.color}`}>
                                <Icon size={20} />
                            </div>
                            <span className="dash-member__stat__value">{stat.value}</span>
                            <span className="dash-member__stat__label">{stat.subtitle}</span>
                        </motion.div>
                    );
                })}
            </section>

            {/* Main Layout */}
            <div className="dash-member__layout">
                {/* Main Content */}
                <div className="dash-member__main">
                    {/* Membership Card */}
                    {dashboard.membership && (
                        <motion.div 
                            className={`dash-member__membership dash-card ${dashboard.membership.packageName?.toLowerCase().includes('premium') ? 'dash-member__membership--premium' : ''}`}
                            initial="hidden"
                            animate="visible"
                            variants={CARD_VARIANTS}
                            custom={5}
                        >
                            <div className="dash-member__membership__header">
                                <div className="dash-member__membership__type">
                                    <span className={`dash-member__membership__badge ${dashboard.membership.packageName?.toLowerCase().includes('premium') ? 'dash-member__membership__badge--premium' : ''}`}>
                                        {dashboard.membership.packageName?.toLowerCase().includes('premium') ? '⭐ PREMIUM' : 'STANDARD'}
                                    </span>
                                    <span className="dash-member__membership__name">{dashboard.membership.packageName}</span>
                                </div>
                                <span className={`dash-badge dash-badge--${dashboard.membership.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                                    {dashboard.membership.status}
                                </span>
                            </div>
                            <div className="dash-member__membership__body">
                                <div className="dash-member__membership__stat">
                                    <span className="dash-member__membership__stat__value">{dashboard.membership.daysRemaining}</span>
                                    <span className="dash-member__membership__stat__label">Days Left</span>
                                </div>
                                <div className="dash-member__membership__stat">
                                    <span className="dash-member__membership__stat__value">₹{dashboard.membership.planPrice}</span>
                                    <span className="dash-member__membership__stat__label">{dashboard.membership.planDuration}</span>
                                </div>
                                <div className="dash-member__membership__stat">
                                    <span className="dash-member__membership__stat__value">{dashboard.totalPoints}</span>
                                    <span className="dash-member__membership__stat__label">Points</span>
                                </div>
                            </div>
                            <div className="dash-member__membership__expiry">
                                <div className="dash-member__membership__expiry__info">
                                    <span className="dash-member__membership__expiry__label">Membership Ends</span>
                                    <span className="dash-member__membership__expiry__date">{format(new Date(dashboard.membership.endDate), 'MMM d, yyyy')}</span>
                                </div>
                                <button className="dash-btn dash-btn--primary dash-btn--sm" onClick={() => navigate('/member/membership')}>
                                    Renew Now
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Upcoming Classes */}
                    <motion.div 
                        className="dash-member__classes dash-card dash-member__card--classes"
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        custom={6}
                    >
                        <div className="dash-member__classes__header">
                            <h3 className="dash-member__classes__title">
                                <Calendar size={18} /> Upcoming Classes
                            </h3>
                            <button className="dash-link" onClick={() => navigate('/member/bookings')}>
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="dash-member__classes__list dash-member__classes__list--scroll">
                            {dashboard.upcomingClasses.length > 0 ? (
                                dashboard.upcomingClasses.map((cls, idx) => (
                                    <motion.div
                                        key={cls.id}
                                        className="dash-member__class-row"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + idx * 0.05 }}
                                    >
                                        <div className="dash-member__class__date">
                                            <span className="dash-member__class__day">
                                                {cls.date.split(',')[0]}
                                            </span>
                                            <span className="dash-member__class__month">
                                                {cls.date.split(',')[1]?.trim().split(' ')[0]}
                                            </span>
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
                                    </motion.div>
                                ))
                            ) : (
                                <div className="dash-empty" style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                                    No upcoming classes booked.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Weekly Activity Chart */}
                    <motion.div
                        className="dash-card"
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        custom={7}
                    >
                        <div className="dash-card__header">
                            <h3 className="dash-card__title">
                                <BarChart3 size={18} /> Weekly Activity
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dashboard.weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="day" 
                                    stroke="rgba(255,255,255,0.3)"
                                    style={{ fontSize: 12 }}
                                />
                                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: '#0f0f18', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8
                                    }}
                                />
                                <Bar dataKey="workouts" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Progress Chart */}
                    {dashboard.weightProgress.length > 0 && (
                        <motion.div
                            className="dash-card"
                            initial="hidden"
                            animate="visible"
                            variants={CARD_VARIANTS}
                            custom={8}
                        >
                            <div className="dash-card__header">
                                <h3 className="dash-card__title">
                                    <TrendingUp size={18} /> Weight Progress
                                </h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dashboard.weightProgress}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="week" 
                                        stroke="rgba(255,255,255,0.3)"
                                        style={{ fontSize: 12 }}
                                    />
                                    <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 12 }} domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            background: '#0f0f18', 
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8
                                        }}
                                    />
                                    <Line type="monotone" dataKey="weight" stroke={COLORS.green} strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="goal" stroke={COLORS.amber} strokeWidth={2} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="dash-member__sidebar">
                    {/* Quick Actions */}
                    <motion.div 
                        className="dash-card"
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        custom={9}
                    >
                        <h3 className="dash-card__title">
                            <Zap size={16} /> Quick Actions
                        </h3>
                        <div className="dash-member__actions">
                            {quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                    <button 
                                        key={idx} 
                                        className="dash-member__action-btn" 
                                        onClick={() => navigate(action.path)}
                                    >
                                        <div className="dash-member__action-btn__icon" style={{ color: action.color }}>
                                            <Icon size={18} />
                                        </div>
                                        <span>{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div 
                        className="dash-card"
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        custom={10}
                    >
                        <h3 className="dash-card__title">
                            <Activity size={16} /> Recent Activity
                        </h3>
                        <div className="dash-member__activity-list">
                            {dashboard.recentActivity.map((activity, idx) => {
                                const Icon = getActivityIcon(activity.type);
                                return (
                                    <div key={idx} className="dash-member__activity-item">
                                        <div className={`dash-member__activity-icon dash-member__activity-icon--${activity.type}`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="dash-member__activity-content">
                                            <div className="dash-member__activity-header">
                                                <span className="dash-member__activity-name">{activity.name}</span>
                                                <span className="dash-member__activity-date">{activity.date}</span>
                                            </div>
                                            <p className="dash-member__activity-reason">{activity.reason}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* My Trainer */}
                    {dashboard.assignedTrainer && (
                        <motion.div 
                            className="dash-member__trainer-card dash-card"
                            initial="hidden"
                            animate="visible"
                            variants={CARD_VARIANTS}
                            custom={11}
                        >
                            <h3 className="dash-card__title">
                                <Users size={16} /> My Trainer
                            </h3>
                            <div className="dash-member__trainer-card__header">
                                <div className="dash-member__trainer-card__avatar">
                                    <Avatar 
                                        name={dashboard.assignedTrainer.fullName} 
                                        avatarId={dashboard.assignedTrainer.avatarId} 
                                        size="md"
                                    />
                                </div>
                                <div className="dash-member__trainer-card__info">
                                    <span className="dash-member__trainer-card__name">{dashboard.assignedTrainer.fullName}</span>
                                    <span className="dash-member__trainer-card__specialty">{dashboard.assignedTrainer.specialization}</span>
                                </div>
                            </div>
                            <div className="dash-member__trainer-card__stats">
                                <div className="dash-member__trainer-card__stat">
                                    <span className="dash-member__trainer-card__stat__value">{dashboard.assignedTrainer.sessionsCount}</span>
                                    <span className="dash-member__trainer-card__stat__label">Sessions</span>
                                </div>
                                <div className="dash-member__trainer-card__stat">
                                    <span className="dash-member__trainer-card__stat__value">{dashboard.assignedTrainer.rating}</span>
                                    <span className="dash-member__trainer-card__stat__label">Rating</span>
                                </div>
                            </div>
                            {dashboard.assignedTrainer.nextSession && (
                                <div className="dash-member__trainer-next" style={{ margin: '12px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                                    <Clock size={12} style={{ marginRight: '6px', display: 'inline' }} />
                                    Next: {dashboard.assignedTrainer.nextSession}
                                </div>
                            )}
                            <button 
                                className="dash-btn dash-btn--primary" 
                                onClick={() => navigate('/member/trainer')} 
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <MessageSquare size={16} /> Message Trainer
                            </button>
                        </motion.div>
                    )}

                    {/* Fitness Radar */}
                    <motion.div 
                        className="dash-card"
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        custom={12}
                    >
                        <h3 className="dash-card__title">
                            <Target size={16} /> Fitness Profile
                        </h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadarChart data={dashboard.fitnessMetrics}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis 
                                    dataKey="metric" 
                                    stroke="rgba(255,255,255,0.5)"
                                    style={{ fontSize: 11 }}
                                />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.3)" />
                                <Radar 
                                    name="You" 
                                    dataKey="value" 
                                    stroke={COLORS.blue} 
                                    fill={COLORS.blue} 
                                    fillOpacity={0.3} 
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Achievements */}
                    <motion.div 
                        className="dash-card"
                        initial="hidden"
                        animate="visible"
                        variants={CARD_VARIANTS}
                        custom={13}
                    >
                        <h3 className="dash-card__title">
                            <Award size={16} /> Achievements
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {dashboard.achievements.map((achievement, idx) => {
                                const Icon = getIconComponent(achievement.icon);
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            gap: '6px'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `${achievement.color}20`,
                                                color: achievement.color
                                            }}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                            {achievement.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
