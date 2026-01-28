import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Check, Zap, Shield, Download, Star, Clock, Users,
    Dumbbell, ChevronRight, Pause, RefreshCw, X, Gem, Award,
    Calendar, QrCode, Wallet, Plus, Trash2,
    Bell, Gift, TrendingUp, Lock,
    CircleCheck, CircleX, Info, ArrowRight, Copy,
    MapPin, Coffee, Flame, Target, Activity,
    Crown, Sparkles, Timer, Heart, BarChart3, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../services/api';
import '../../styles/unified-design-system.css';
import './MyMembership.css';

interface MembershipData {
    hasMembership: boolean;
    membershipId?: number;
    status?: string;
    packageName?: string;
    packagePrice?: number;
    startDate?: string;
    endDate?: string;
    daysRemaining?: number;
    isExpired?: boolean;
    autoRenew?: boolean;
    freezeAvailable?: boolean;
    freezeDaysUsed?: number;
    freezeDaysTotal?: number;
}

interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard' | 'amex';
    last4: string;
    expiry: string;
    isDefault: boolean;
}

const DUMMY_MEMBERSHIP: MembershipData = {
    hasMembership: true,
    membershipId: 9999,
    status: 'ACTIVE',
    packageName: 'Premium Fitness',
    packagePrice: 79.99,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 45,
    isExpired: false,
    autoRenew: true,
    freezeAvailable: true,
    freezeDaysUsed: 3,
    freezeDaysTotal: 14
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
};

const MyMembership: React.FC = () => {
    const [membership, setMembership] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'payments' | 'settings'>('overview');
    const [showQRCode, setShowQRCode] = useState(false);
    const [showFreezeModal, setShowFreezeModal] = useState(false);
    const [showAddCard, setShowAddCard] = useState(false);
    const [freezeDays, setFreezeDays] = useState(7);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isUsingDummyData, setIsUsingDummyData] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: '1', type: 'visa', last4: '4242', expiry: '12/26', isDefault: true },
        { id: '2', type: 'mastercard', last4: '8888', expiry: '08/25', isDefault: false }
    ]);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchMembership = async () => {
            const userId = user?.id || user?.userId;
            if (!userId || isNaN(Number(userId))) {
                setMembership(DUMMY_MEMBERSHIP);
                setIsUsingDummyData(true);
                setLoading(false);
                return;
            }
            try {
                const response = await apiClient.get('/member/membership', {
                    params: { memberId: userId }
                });
                const data = response.data;
                if (data.hasMembership) {
                    setMembership({
                        ...data,
                        autoRenew: data.autoRenew ?? true,
                        freezeAvailable: true,
                        freezeDaysUsed: 3,
                        freezeDaysTotal: 14
                    });
                    setIsUsingDummyData(false);
                } else {
                    setMembership(DUMMY_MEMBERSHIP);
                    setIsUsingDummyData(true);
                }
            } catch (error) {
                console.error('Error fetching membership:', error);
                setMembership(DUMMY_MEMBERSHIP);
                setIsUsingDummyData(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMembership();
    }, [user?.id, user?.userId]);

    useEffect(() => {
        if (!membership?.endDate) return;

        const calculateTimeLeft = () => {
            const endDate = new Date(membership.endDate!);
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [membership?.endDate]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const membershipTier = useMemo(() => {
        const name = membership?.packageName?.toLowerCase() || '';
        if (name.includes('premium') || name.includes('vip')) return { tier: 'premium', color: '#f59e0b', icon: <Crown size={16} /> };
        if (name.includes('pro') || name.includes('elite')) return { tier: 'elite', color: '#8b5cf6', icon: <Sparkles size={16} /> };
        return { tier: 'standard', color: '#3b82f6', icon: <Star size={16} /> };
    }, [membership?.packageName]);

    const benefits = [
        { icon: <Dumbbell size={18} />, title: 'Unlimited Gym Access', desc: '24/7 access to all equipment', active: true, premium: false },
        { icon: <Users size={18} />, title: 'Group Classes', desc: 'All fitness classes included', active: true, premium: false },
        { icon: <Star size={18} />, title: 'PT Sessions', desc: '2 of 4 sessions used', active: true, premium: false, progress: 50 },
        { icon: <Coffee size={18} />, title: 'Spa & Sauna', desc: 'Relaxation zone access', active: membershipTier.tier !== 'standard', premium: true },
        { icon: <Users size={18} />, title: 'Guest Passes', desc: '2 passes per month', active: true, premium: false, progress: 0 },
        { icon: <Gift size={18} />, title: 'Member Rewards', desc: '850 points earned', active: true, premium: false },
        { icon: <Target size={18} />, title: 'Personal Goals', desc: 'AI-powered tracking', active: true, premium: false },
        { icon: <Activity size={18} />, title: 'Health Analytics', desc: 'Advanced body metrics', active: membershipTier.tier !== 'standard', premium: true }
    ];

    const usageStats = {
        gymVisits: 18,
        classesAttended: 12,
        ptSessionsUsed: 2,
        ptSessionsTotal: 4,
        calories: 24500,
        minutesActive: 1680,
        streak: 7,
        points: 850
    };

    const paymentHistory = [
        { id: 'INV-2025-001', date: 'Dec 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242', type: 'Monthly Subscription' },
        { id: 'INV-2025-002', date: 'Nov 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242', type: 'Monthly Subscription' },
        { id: 'INV-2025-003', date: 'Oct 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242', type: 'Monthly Subscription' },
    ];

    const upcomingPerks = [
        { date: 'Jan 28', title: 'Free Smoothie Day', icon: <Coffee size={14} />, type: 'event' },
        { date: 'Jan 30', title: 'Double Points Weekend', icon: <Sparkles size={14} />, type: 'promo' },
        { date: 'Feb 1', title: 'New Year Challenge', icon: <Target size={14} />, type: 'challenge' }
    ];

    const handleFreezeMembership = () => {
        toast.success(`Membership frozen for ${freezeDays} days`);
        setShowFreezeModal(false);
    };

    const handleCopyMemberId = () => {
        navigator.clipboard.writeText(`MEM-${user?.id || '0000'}`);
        toast.success('Member ID copied!');
    };

    const handleSetDefaultCard = (cardId: string) => {
        setPaymentMethods(prev => prev.map(pm => ({
            ...pm,
            isDefault: pm.id === cardId
        })));
        toast.success('Default payment method updated');
    };

    const handleRemoveCard = (cardId: string) => {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== cardId));
        toast.success('Payment method removed');
    };

    if (loading) {
        return (
            <div className="mm-loading">
                <motion.div 
                    className="mm-loading__spinner"
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <CreditCard size={28} />
                </motion.div>
                <span>Loading membership...</span>
            </div>
        );
    }

    const progressPercentage = membership?.daysRemaining ? Math.min((membership.daysRemaining / 30) * 100, 100) : 0;
    const freezeProgress = membership?.freezeDaysTotal ? ((membership.freezeDaysUsed || 0) / membership.freezeDaysTotal) * 100 : 0;

    return (
        <motion.div
            className="mm-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {isUsingDummyData && (
                <motion.div 
                    className="mm-dev-banner"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="mm-dev-banner__content">
                        <AlertCircle size={16} />
                        <div className="mm-dev-banner__text">
                            <strong>No Active Membership</strong>
                            <span>Membership plans are assigned by gym owners/admins. Showing preview with sample data.</span>
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div className="mm-hero" variants={itemVariants}>
                <div className="mm-hero__glow" />
                <div className="mm-hero__pattern" />
                
                <div className="mm-hero__content">
                    <div className="mm-hero__top">
                        <div className="mm-hero__plan">
                            <div className="mm-hero__tier" style={{ '--tier-color': membershipTier.color } as React.CSSProperties}>
                                {membershipTier.icon}
                                <span>{membershipTier.tier.toUpperCase()}</span>
                            </div>
                            <h1 className="mm-hero__title">{membership?.packageName || 'Membership'}</h1>
                            <div className="mm-hero__id" onClick={handleCopyMemberId}>
                                <span>ID: MEM-{user?.id || '0000'}</span>
                                <Copy size={10} />
                            </div>
                        </div>
                        
                        <div className="mm-hero__status-group">
                            <motion.div 
                                className={`mm-status ${membership?.isExpired ? 'mm-status--expired' : ''} ${isUsingDummyData ? 'mm-status--preview' : ''}`}
                                animate={!isUsingDummyData ? { scale: [1, 1.02, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {isUsingDummyData ? (
                                    <>
                                        <Info size={12} />
                                        Preview
                                    </>
                                ) : membership?.isExpired ? (
                                    <>
                                        <CircleX size={12} />
                                        Expired
                                    </>
                                ) : (
                                    <>
                                        <CircleCheck size={12} />
                                        Active
                                    </>
                                )}
                            </motion.div>
                            {membership?.autoRenew && !isUsingDummyData && (
                                <span className="mm-auto-renew">
                                    <RefreshCw size={10} />
                                    Auto-renew
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mm-hero__main">
                        <div className="mm-countdown">
                            <div className="mm-countdown__label">
                                <Timer size={14} />
                                Time Remaining
                            </div>
                            <div className="mm-countdown__grid">
                                <div className="mm-countdown__item">
                                    <span className="mm-countdown__value">{timeLeft.days}</span>
                                    <span className="mm-countdown__unit">days</span>
                                </div>
                                <span className="mm-countdown__separator">:</span>
                                <div className="mm-countdown__item">
                                    <span className="mm-countdown__value">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="mm-countdown__unit">hrs</span>
                                </div>
                                <span className="mm-countdown__separator">:</span>
                                <div className="mm-countdown__item">
                                    <span className="mm-countdown__value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="mm-countdown__unit">min</span>
                                </div>
                                <span className="mm-countdown__separator">:</span>
                                <div className="mm-countdown__item mm-countdown__item--seconds">
                                    <span className="mm-countdown__value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="mm-countdown__unit">sec</span>
                                </div>
                            </div>
                        </div>

                        <div className="mm-hero__stats">
                            <div className="mm-hero__stat">
                                <Calendar size={14} />
                                <div>
                                    <span className="mm-stat-label">Started</span>
                                    <span className="mm-stat-value">{membership?.startDate ? formatDate(membership.startDate) : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="mm-hero__stat">
                                <Clock size={14} />
                                <div>
                                    <span className="mm-stat-label">Renews</span>
                                    <span className="mm-stat-value">{membership?.endDate ? formatDate(membership.endDate) : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="mm-hero__stat">
                                <CreditCard size={14} />
                                <div>
                                    <span className="mm-stat-label">Monthly</span>
                                    <span className="mm-stat-value">${membership?.packagePrice?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mm-hero__progress">
                        <motion.div
                            className="mm-hero__progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="mm-hero__actions">
                        <motion.button 
                            className="mm-qr-btn"
                            onClick={() => setShowQRCode(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <QrCode size={16} />
                            Check-in QR
                        </motion.button>
                        <motion.button 
                            className="mm-renew-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RefreshCw size={16} />
                            Renew Early
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <motion.div className="mm-quick-stats" variants={itemVariants}>
                <div className="mm-quick-stat">
                    <div className="mm-quick-stat__icon mm-quick-stat__icon--blue">
                        <MapPin size={16} />
                    </div>
                    <div className="mm-quick-stat__info">
                        <span className="mm-quick-stat__value">{usageStats.gymVisits}</span>
                        <span className="mm-quick-stat__label">Visits</span>
                    </div>
                </div>
                <div className="mm-quick-stat">
                    <div className="mm-quick-stat__icon mm-quick-stat__icon--green">
                        <Flame size={16} />
                    </div>
                    <div className="mm-quick-stat__info">
                        <span className="mm-quick-stat__value">{usageStats.streak}</span>
                        <span className="mm-quick-stat__label">Streak</span>
                    </div>
                </div>
                <div className="mm-quick-stat">
                    <div className="mm-quick-stat__icon mm-quick-stat__icon--purple">
                        <Heart size={16} />
                    </div>
                    <div className="mm-quick-stat__info">
                        <span className="mm-quick-stat__value">{(usageStats.calories / 1000).toFixed(1)}k</span>
                        <span className="mm-quick-stat__label">Calories</span>
                    </div>
                </div>
                <div className="mm-quick-stat">
                    <div className="mm-quick-stat__icon mm-quick-stat__icon--amber">
                        <Award size={16} />
                    </div>
                    <div className="mm-quick-stat__info">
                        <span className="mm-quick-stat__value">{usageStats.points}</span>
                        <span className="mm-quick-stat__label">Points</span>
                    </div>
                </div>
            </motion.div>

            <motion.div className="mm-tabs" variants={itemVariants}>
                {[
                    { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
                    { id: 'benefits', label: 'Benefits', icon: <Gift size={14} /> },
                    { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
                    { id: 'settings', label: 'Settings', icon: <Shield size={14} /> }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`mm-tab ${activeTab === tab.id ? 'mm-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {tab.icon}
                        {tab.label}
                    </motion.button>
                ))}
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="mm-content"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <>
                            <div className="mm-actions-grid">
                                <motion.button 
                                    className="mm-action-card"
                                    onClick={() => setShowQRCode(true)}
                                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)' }}
                                >
                                    <div className="mm-action-card__icon mm-action-card__icon--blue">
                                        <QrCode size={20} />
                                    </div>
                                    <div className="mm-action-card__text">
                                        <span className="mm-action-card__title">Check-in</span>
                                        <span className="mm-action-card__desc">Scan at entrance</span>
                                    </div>
                                </motion.button>
                                <motion.button 
                                    className="mm-action-card"
                                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)' }}
                                    onClick={() => toast.success('Guest pass sent!')}
                                >
                                    <div className="mm-action-card__icon mm-action-card__icon--green">
                                        <Users size={20} />
                                    </div>
                                    <div className="mm-action-card__text">
                                        <span className="mm-action-card__title">Guest Pass</span>
                                        <span className="mm-action-card__desc">2 remaining</span>
                                    </div>
                                </motion.button>
                                <motion.button 
                                    className="mm-action-card"
                                    onClick={() => setShowFreezeModal(true)}
                                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)' }}
                                >
                                    <div className="mm-action-card__icon mm-action-card__icon--purple">
                                        <Pause size={20} />
                                    </div>
                                    <div className="mm-action-card__text">
                                        <span className="mm-action-card__title">Freeze</span>
                                        <span className="mm-action-card__desc">11 days left</span>
                                    </div>
                                </motion.button>
                                <motion.button 
                                    className="mm-action-card"
                                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)' }}
                                    onClick={() => toast.success('Renewal reminder set')}
                                >
                                    <div className="mm-action-card__icon mm-action-card__icon--amber">
                                        <Bell size={20} />
                                    </div>
                                    <div className="mm-action-card__text">
                                        <span className="mm-action-card__title">Remind Me</span>
                                        <span className="mm-action-card__desc">Before expiry</span>
                                    </div>
                                </motion.button>
                            </div>

                            <div className="mm-section">
                                <div className="mm-section__header">
                                    <h3><Activity size={16} /> Monthly Activity</h3>
                                </div>
                                <div className="mm-activity-grid">
                                    <motion.div className="mm-activity-card" whileHover={{ scale: 1.01 }}>
                                        <div className="mm-activity-card__header">
                                            <MapPin size={16} />
                                            <span>Gym Visits</span>
                                        </div>
                                        <div className="mm-activity-card__value">{usageStats.gymVisits}</div>
                                        <div className="mm-activity-card__change">+3 from last month</div>
                                    </motion.div>
                                    <motion.div className="mm-activity-card" whileHover={{ scale: 1.01 }}>
                                        <div className="mm-activity-card__header">
                                            <Users size={16} />
                                            <span>Classes</span>
                                        </div>
                                        <div className="mm-activity-card__value">{usageStats.classesAttended}</div>
                                        <div className="mm-activity-card__change">+5 from last month</div>
                                    </motion.div>
                                    <motion.div className="mm-activity-card" whileHover={{ scale: 1.01 }}>
                                        <div className="mm-activity-card__header">
                                            <Star size={16} />
                                            <span>PT Sessions</span>
                                        </div>
                                        <div className="mm-activity-card__value">{usageStats.ptSessionsUsed}/{usageStats.ptSessionsTotal}</div>
                                        <div className="mm-activity-card__progress">
                                            <div style={{ width: `${(usageStats.ptSessionsUsed / usageStats.ptSessionsTotal) * 100}%` }} />
                                        </div>
                                    </motion.div>
                                    <motion.div className="mm-activity-card" whileHover={{ scale: 1.01 }}>
                                        <div className="mm-activity-card__header">
                                            <Clock size={16} />
                                            <span>Active Time</span>
                                        </div>
                                        <div className="mm-activity-card__value">{Math.floor(usageStats.minutesActive / 60)}h</div>
                                        <div className="mm-activity-card__change">{usageStats.minutesActive} minutes</div>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="mm-section">
                                <div className="mm-section__header">
                                    <h3><Gift size={16} /> Upcoming Perks</h3>
                                    <button className="mm-section__link">View All</button>
                                </div>
                                <div className="mm-perks-list">
                                    {upcomingPerks.map((perk, i) => (
                                        <motion.div 
                                            key={i} 
                                            className="mm-perk-item"
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className={`mm-perk-item__icon mm-perk-item__icon--${perk.type}`}>
                                                {perk.icon}
                                            </div>
                                            <div className="mm-perk-item__content">
                                                <span className="mm-perk-item__title">{perk.title}</span>
                                                <span className="mm-perk-item__date">{perk.date}</span>
                                            </div>
                                            <ChevronRight size={14} className="mm-perk-item__arrow" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'benefits' && (
                        <>
                            <div className="mm-benefits-grid">
                                {benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        className={`mm-benefit-card ${benefit.active ? '' : 'mm-benefit-card--locked'}`}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        whileHover={benefit.active ? { y: -3 } : {}}
                                    >
                                        {benefit.premium && !benefit.active && (
                                            <div className="mm-benefit-card__lock">
                                                <Lock size={12} />
                                            </div>
                                        )}
                                        <div className="mm-benefit-card__icon">{benefit.icon}</div>
                                        <h4 className="mm-benefit-card__title">{benefit.title}</h4>
                                        <p className="mm-benefit-card__desc">{benefit.desc}</p>
                                        {benefit.progress !== undefined && benefit.active && (
                                            <div className="mm-benefit-card__progress">
                                                <div style={{ width: `${benefit.progress}%` }} />
                                            </div>
                                        )}
                                        {benefit.active && (
                                            <div className="mm-benefit-card__check">
                                                <Check size={10} />
                                            </div>
                                        )}
                                        {benefit.premium && !benefit.active && (
                                            <span className="mm-benefit-card__upgrade">Upgrade to unlock</span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mm-section">
                                <div className="mm-section__header">
                                    <h3><Award size={16} /> Rewards Program</h3>
                                </div>
                                <div className="mm-rewards-card">
                                    <div className="mm-rewards-card__left">
                                        <div className="mm-rewards-card__points">
                                            <Sparkles size={20} />
                                            <span className="mm-rewards-card__value">{usageStats.points}</span>
                                        </div>
                                        <span className="mm-rewards-card__label">Points Earned</span>
                                    </div>
                                    <div className="mm-rewards-card__right">
                                        <div className="mm-rewards-card__progress">
                                            <div className="mm-rewards-card__progress-bar">
                                                <div style={{ width: '85%' }} />
                                            </div>
                                            <span>150 more to next reward</span>
                                        </div>
                                        <motion.button 
                                            className="mm-rewards-card__btn"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Gift size={14} />
                                            Redeem
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'payments' && (
                        <>
                            <div className="mm-section">
                                <div className="mm-section__header">
                                    <h3><Wallet size={16} /> Payment Methods</h3>
                                    <button className="mm-section__link" onClick={() => setShowAddCard(true)}>
                                        <Plus size={12} /> Add Card
                                    </button>
                                </div>
                                <div className="mm-payment-methods">
                                    {paymentMethods.map((pm) => (
                                        <motion.div 
                                            key={pm.id} 
                                            className={`mm-payment-card ${pm.isDefault ? 'mm-payment-card--default' : ''}`}
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <div className="mm-payment-card__brand">
                                                {pm.type === 'visa' && <span className="mm-card-visa">VISA</span>}
                                                {pm.type === 'mastercard' && <span className="mm-card-mc">MC</span>}
                                                {pm.type === 'amex' && <span className="mm-card-amex">AMEX</span>}
                                            </div>
                                            <div className="mm-payment-card__info">
                                                <span className="mm-payment-card__number">•••• •••• •••• {pm.last4}</span>
                                                <span className="mm-payment-card__expiry">Expires {pm.expiry}</span>
                                            </div>
                                            {pm.isDefault && (
                                                <span className="mm-payment-card__badge">Default</span>
                                            )}
                                            <div className="mm-payment-card__actions">
                                                {!pm.isDefault && (
                                                    <button onClick={() => handleSetDefaultCard(pm.id)} title="Set as default">
                                                        <Check size={12} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleRemoveCard(pm.id)} title="Remove">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="mm-section">
                                <div className="mm-section__header">
                                    <h3><CreditCard size={16} /> Payment History</h3>
                                    <button className="mm-section__link">
                                        <Download size={12} /> Export
                                    </button>
                                </div>
                                <div className="mm-payment-history">
                                    {paymentHistory.map((payment, i) => (
                                        <motion.div 
                                            key={payment.id}
                                            className="mm-history-item"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <div className="mm-history-item__icon">
                                                <Check size={12} />
                                            </div>
                                            <div className="mm-history-item__info">
                                                <span className="mm-history-item__type">{payment.type}</span>
                                                <span className="mm-history-item__meta">{payment.date} • {payment.method}</span>
                                            </div>
                                            <div className="mm-history-item__right">
                                                <span className="mm-history-item__amount">${payment.amount.toFixed(2)}</span>
                                                <button className="mm-history-item__download" onClick={() => toast.success('Invoice downloaded')}>
                                                    <Download size={12} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'settings' && (
                        <div className="mm-settings-list">
                            <motion.div className="mm-setting-card" whileHover={{ x: 2 }}>
                                <div className="mm-setting-card__left">
                                    <div className="mm-setting-card__icon mm-setting-card__icon--blue">
                                        <RefreshCw size={18} />
                                    </div>
                                    <div className="mm-setting-card__info">
                                        <h4>Auto-Renewal</h4>
                                        <p>Automatically renew your membership</p>
                                    </div>
                                </div>
                                <label className="mm-toggle">
                                    <input 
                                        type="checkbox" 
                                        checked={membership?.autoRenew} 
                                        onChange={() => {
                                            setMembership(prev => prev ? {...prev, autoRenew: !prev.autoRenew} : null);
                                            toast.success('Auto-renewal updated');
                                        }}
                                    />
                                    <span className="mm-toggle__slider" />
                                </label>
                            </motion.div>

                            <motion.div className="mm-setting-card" whileHover={{ x: 2 }}>
                                <div className="mm-setting-card__left">
                                    <div className="mm-setting-card__icon mm-setting-card__icon--purple">
                                        <Pause size={18} />
                                    </div>
                                    <div className="mm-setting-card__info">
                                        <h4>Freeze Membership</h4>
                                        <p>{membership?.freezeDaysUsed}/{membership?.freezeDaysTotal} freeze days used</p>
                                        <div className="mm-setting-card__progress">
                                            <div style={{ width: `${freezeProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <motion.button 
                                    className="mm-setting-btn"
                                    onClick={() => setShowFreezeModal(true)}
                                    disabled={!membership?.freezeAvailable}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Freeze
                                </motion.button>
                            </motion.div>

                            <motion.div className="mm-setting-card" whileHover={{ x: 2 }}>
                                <div className="mm-setting-card__left">
                                    <div className="mm-setting-card__icon mm-setting-card__icon--green">
                                        <Bell size={18} />
                                    </div>
                                    <div className="mm-setting-card__info">
                                        <h4>Renewal Reminders</h4>
                                        <p>Get notified before membership expires</p>
                                    </div>
                                </div>
                                <label className="mm-toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="mm-toggle__slider" />
                                </label>
                            </motion.div>

                            <motion.div className="mm-setting-card mm-setting-card--danger" whileHover={{ x: 2 }}>
                                <div className="mm-setting-card__left">
                                    <div className="mm-setting-card__icon mm-setting-card__icon--red">
                                        <CircleX size={18} />
                                    </div>
                                    <div className="mm-setting-card__info">
                                        <h4>Cancel Membership</h4>
                                        <p>End your membership at the current billing period</p>
                                    </div>
                                </div>
                                <motion.button 
                                    className="mm-setting-btn mm-setting-btn--danger"
                                    onClick={() => toast.error('Please contact support to cancel')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {showQRCode && (
                    <motion.div 
                        className="mm-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQRCode(false)}
                    >
                        <motion.div 
                            className="mm-qr-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="mm-modal-close" onClick={() => setShowQRCode(false)}>
                                <X size={18} />
                            </button>
                            <div className="mm-qr-modal__content">
                                <div className="mm-qr-code">
                                    <QrCode size={100} strokeWidth={1} />
                                </div>
                                <h3>Scan to Check In</h3>
                                <p>Show this QR code at the gym entrance</p>
                                <div className="mm-qr-modal__id" onClick={handleCopyMemberId}>
                                    <span>MEM-{user?.id || '0000'}</span>
                                    <Copy size={12} />
                                </div>
                                <div className="mm-qr-modal__valid">
                                    <CircleCheck size={12} />
                                    Valid until {membership?.endDate ? formatDate(membership.endDate) : 'N/A'}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showFreezeModal && (
                    <motion.div 
                        className="mm-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFreezeModal(false)}
                    >
                        <motion.div 
                            className="mm-freeze-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="mm-freeze-modal__header">
                                <h3><Pause size={18} /> Freeze Membership</h3>
                                <button onClick={() => setShowFreezeModal(false)}><X size={16} /></button>
                            </div>
                            <div className="mm-freeze-modal__body">
                                <div className="mm-freeze-info">
                                    <Info size={14} />
                                    <p>Freezing pauses billing. You have {(membership?.freezeDaysTotal || 14) - (membership?.freezeDaysUsed || 0)} days remaining.</p>
                                </div>
                                <div className="mm-freeze-duration">
                                    <label>Duration</label>
                                    <div className="mm-freeze-options">
                                        {[7, 14, 21, 30].map(days => (
                                            <button
                                                key={days}
                                                className={`mm-freeze-option ${freezeDays === days ? 'mm-freeze-option--active' : ''}`}
                                                onClick={() => setFreezeDays(days)}
                                            >
                                                {days}d
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mm-freeze-dates">
                                    <div className="mm-freeze-date">
                                        <span>Starts</span>
                                        <strong>Tomorrow</strong>
                                    </div>
                                    <ArrowRight size={14} />
                                    <div className="mm-freeze-date">
                                        <span>Resumes</span>
                                        <strong>{new Date(Date.now() + (freezeDays + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="mm-freeze-modal__footer">
                                <button className="mm-modal-btn mm-modal-btn--secondary" onClick={() => setShowFreezeModal(false)}>
                                    Cancel
                                </button>
                                <button className="mm-modal-btn mm-modal-btn--primary" onClick={handleFreezeMembership}>
                                    <Pause size={12} />
                                    Freeze {freezeDays} Days
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyMembership;
