import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Check, Zap, Shield, Download, Star, Clock, Users,
    Dumbbell, ChevronRight, Pause, RefreshCw, X, Gem, Award, Medal,
    Calendar, AlertCircle, QrCode, Wallet, Plus, Trash2, Edit3,
    Bell, Gift, TrendingUp, Smartphone, Lock, Eye, EyeOff,
    CircleCheck, CircleX, Info, ArrowRight, Copy, ExternalLink,
    Ticket, MapPin, Coffee
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: '1', type: 'visa', last4: '4242', expiry: '12/26', isDefault: true },
        { id: '2', type: 'mastercard', last4: '8888', expiry: '08/25', isDefault: false }
    ]);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchMembership = async () => {
            const mockData: MembershipData = {
                hasMembership: true,
                status: 'Active',
                packageName: 'Premium Monthly',
                packagePrice: 99.99,
                startDate: '2025-12-01',
                endDate: '2026-01-26',
                daysRemaining: 24,
                isExpired: false,
                autoRenew: true,
                freezeAvailable: true,
                freezeDaysUsed: 3,
                freezeDaysTotal: 14
            };
            setMembership(mockData);
            setLoading(false);
        };

        fetchMembership();
    }, [user?.id]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const benefits = [
        { icon: <Dumbbell size={20} />, title: 'Unlimited Gym Access', desc: '24/7 access to all equipment', used: true },
        { icon: <Users size={20} />, title: 'Group Classes', desc: 'Unlimited access to all classes', used: true },
        { icon: <Star size={20} />, title: 'PT Sessions', desc: '2 of 4 used this month', used: true, progress: 50 },
        { icon: <Coffee size={20} />, title: 'Spa & Sauna', desc: 'Full spa access included', used: false },
        { icon: <Users size={20} />, title: 'Guest Passes', desc: '0 of 2 used this month', used: false, progress: 0 },
        { icon: <Gift size={20} />, title: 'Member Rewards', desc: '850 points earned', used: true }
    ];

    const usageStats = {
        gymVisits: 18,
        classesAttended: 12,
        ptSessionsUsed: 2,
        ptSessionsTotal: 4,
        guestPassesUsed: 0,
        guestPassesTotal: 2,
        calories: '24,500',
        minutesActive: 1680
    };

    const paymentHistory = [
        { id: 'INV-2025-001', date: 'Dec 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242', type: 'Monthly Subscription' },
        { id: 'INV-2025-002', date: 'Nov 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242', type: 'Monthly Subscription' },
        { id: 'INV-2025-003', date: 'Oct 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242', type: 'Monthly Subscription' },
        { id: 'INV-2025-004', date: 'Sep 20, 2025', amount: 50.00, status: 'Paid', method: 'Visa ••4242', type: 'PT Session Pack' }
    ];

    const upcomingPerks = [
        { date: 'Jan 5', title: 'Free Smoothie Day', icon: <Coffee size={16} /> },
        { date: 'Jan 10', title: 'Member Appreciation Event', icon: <Gift size={16} /> },
        { date: 'Jan 15', title: 'New Year Fitness Challenge', icon: <TrendingUp size={16} /> }
    ];

    const handleFreezeMembership = () => {
        toast.success(`Membership frozen for ${freezeDays} days`);
        setShowFreezeModal(false);
    };

    const handleCopyMemberId = () => {
        navigator.clipboard.writeText('MEM-2024-12345');
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

    const getCardIcon = (type: string) => {
        switch (type) {
            case 'visa': return '💳';
            case 'mastercard': return '💳';
            case 'amex': return '💳';
            default: return '💳';
        }
    };

    if (loading) {
        return (
            <div className="membership-loading">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <CreditCard size={32} />
                </motion.div>
            </div>
        );
    }

    const progressPercentage = membership?.daysRemaining ? Math.min((membership.daysRemaining / 30) * 100, 100) : 0;
    const freezeProgress = membership?.freezeDaysTotal ? ((membership.freezeDaysUsed || 0) / membership.freezeDaysTotal) * 100 : 0;

    return (
        <motion.div
            className="member-membership"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header className="membership-header" variants={itemVariants}>
                <div className="membership-header__content">
                    <h1>My Membership</h1>
                    <p>Manage your subscription, benefits, and payments</p>
                </div>
                <div className="membership-header__actions">
                    <motion.button 
                        className="membership-qr-btn"
                        onClick={() => setShowQRCode(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <QrCode size={18} />
                        Check-in QR
                    </motion.button>
                </div>
            </motion.header>

            <motion.div className="membership-hero" variants={itemVariants}>
                <div className="membership-hero__bg">
                    <div className="membership-hero__pattern" />
                </div>
                
                <div className="membership-hero__content">
                    <div className="membership-hero__top">
                        <div className="membership-hero__plan">
                            <span className="membership-hero__plan-label">Current Plan</span>
                            <div className="membership-hero__plan-name">
                                <Gem size={24} />
                                <h2>{membership?.packageName || 'Premium Monthly'}</h2>
                            </div>
                            <div className="membership-hero__id" onClick={handleCopyMemberId}>
                                <span>ID: MEM-2024-12345</span>
                                <Copy size={12} />
                            </div>
                        </div>
                        <div className="membership-hero__status-area">
                            <motion.span 
                                className={`membership-status ${membership?.isExpired ? 'membership-status--expired' : ''}`}
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {membership?.isExpired ? <CircleX size={14} /> : <CircleCheck size={14} />}
                                {membership?.isExpired ? 'Expired' : 'Active'}
                            </motion.span>
                            {membership?.autoRenew && (
                                <span className="membership-auto-renew">
                                    <RefreshCw size={12} />
                                    Auto-renew ON
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="membership-hero__stats">
                        <div className="membership-hero__stat">
                            <Calendar size={16} />
                            <div>
                                <span className="stat-label">Started</span>
                                <span className="stat-value">{membership?.startDate ? formatDate(membership.startDate) : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="membership-hero__stat">
                            <Clock size={16} />
                            <div>
                                <span className="stat-label">Renews</span>
                                <span className="stat-value">{membership?.endDate ? formatDate(membership.endDate) : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="membership-hero__stat">
                            <CreditCard size={16} />
                            <div>
                                <span className="stat-label">Monthly</span>
                                <span className="stat-value">${membership?.packagePrice?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="membership-hero__stat membership-hero__stat--highlight">
                            <Zap size={16} />
                            <div>
                                <span className="stat-label">Remaining</span>
                                <span className="stat-value">{membership?.daysRemaining} days</span>
                            </div>
                        </div>
                    </div>

                    <div className="membership-hero__progress">
                        <div className="membership-progress-bar">
                            <motion.div
                                className="membership-progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div className="membership-tabs" variants={itemVariants}>
                {[
                    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
                    { id: 'benefits', label: 'Benefits', icon: <Gift size={16} /> },
                    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
                    { id: 'settings', label: 'Settings', icon: <Shield size={16} /> }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`membership-tab ${activeTab === tab.id ? 'membership-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        whileHover={{ y: -2 }}
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
                    className="membership-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    {activeTab === 'overview' && (
                        <>
                            <div className="membership-quick-actions">
                                <motion.button 
                                    className="quick-action-card"
                                    onClick={() => setShowQRCode(true)}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="quick-action-icon quick-action-icon--blue">
                                        <QrCode size={22} />
                                    </div>
                                    <span>Check-in</span>
                                </motion.button>
                                <motion.button 
                                    className="quick-action-card"
                                    whileHover={{ y: -4 }}
                                    onClick={() => toast.success('Guest pass sent!')}
                                >
                                    <div className="quick-action-icon quick-action-icon--green">
                                        <Users size={22} />
                                    </div>
                                    <span>Guest Pass</span>
                                </motion.button>
                                <motion.button 
                                    className="quick-action-card"
                                    onClick={() => setShowFreezeModal(true)}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="quick-action-icon quick-action-icon--purple">
                                        <Pause size={22} />
                                    </div>
                                    <span>Freeze</span>
                                </motion.button>
                                <motion.button 
                                    className="quick-action-card"
                                    whileHover={{ y: -4 }}
                                    onClick={() => toast.success('Renewal reminder set')}
                                >
                                    <div className="quick-action-icon quick-action-icon--orange">
                                        <Bell size={22} />
                                    </div>
                                    <span>Remind Me</span>
                                </motion.button>
                            </div>

                            <div className="membership-section">
                                <div className="membership-section__header">
                                    <h3><Dumbbell size={18} /> This Month's Activity</h3>
                                </div>
                                <div className="membership-stats-grid">
                                    <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                        <div className="stat-card__icon stat-card__icon--blue">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="stat-card__value">{usageStats.gymVisits}</div>
                                        <div className="stat-card__label">Gym Visits</div>
                                    </motion.div>
                                    <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                        <div className="stat-card__icon stat-card__icon--green">
                                            <Users size={20} />
                                        </div>
                                        <div className="stat-card__value">{usageStats.classesAttended}</div>
                                        <div className="stat-card__label">Classes</div>
                                    </motion.div>
                                    <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                        <div className="stat-card__icon stat-card__icon--purple">
                                            <Star size={20} />
                                        </div>
                                        <div className="stat-card__value">{usageStats.ptSessionsUsed}/{usageStats.ptSessionsTotal}</div>
                                        <div className="stat-card__label">PT Sessions</div>
                                        <div className="stat-card__progress">
                                            <div className="stat-card__progress-fill" style={{ width: `${(usageStats.ptSessionsUsed / usageStats.ptSessionsTotal) * 100}%` }} />
                                        </div>
                                    </motion.div>
                                    <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                        <div className="stat-card__icon stat-card__icon--orange">
                                            <Clock size={20} />
                                        </div>
                                        <div className="stat-card__value">{Math.floor(usageStats.minutesActive / 60)}h</div>
                                        <div className="stat-card__label">Active Time</div>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="membership-section">
                                <div className="membership-section__header">
                                    <h3><Gift size={18} /> Upcoming Perks</h3>
                                    <button className="section-link">View All</button>
                                </div>
                                <div className="upcoming-perks">
                                    {upcomingPerks.map((perk, i) => (
                                        <motion.div 
                                            key={i} 
                                            className="perk-card"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="perk-card__icon">{perk.icon}</div>
                                            <div className="perk-card__content">
                                                <span className="perk-card__title">{perk.title}</span>
                                                <span className="perk-card__date">{perk.date}</span>
                                            </div>
                                            <ChevronRight size={16} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'benefits' && (
                        <div className="membership-benefits">
                            <div className="benefits-grid">
                                {benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        className={`benefit-card ${benefit.used ? 'benefit-card--used' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -4 }}
                                    >
                                        <div className="benefit-card__icon">{benefit.icon}</div>
                                        <h4>{benefit.title}</h4>
                                        <p>{benefit.desc}</p>
                                        {benefit.progress !== undefined && (
                                            <div className="benefit-card__progress">
                                                <div 
                                                    className="benefit-card__progress-fill" 
                                                    style={{ width: `${benefit.progress}%` }} 
                                                />
                                            </div>
                                        )}
                                        {benefit.used && (
                                            <span className="benefit-card__check">
                                                <Check size={12} />
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="membership-section">
                                <div className="membership-section__header">
                                    <h3><Award size={18} /> Membership Rewards</h3>
                                </div>
                                <div className="rewards-card">
                                    <div className="rewards-card__points">
                                        <span className="rewards-card__points-value">850</span>
                                        <span className="rewards-card__points-label">Points Earned</span>
                                    </div>
                                    <div className="rewards-card__progress">
                                        <div className="rewards-card__progress-bar">
                                            <div className="rewards-card__progress-fill" style={{ width: '85%' }} />
                                        </div>
                                        <span>150 more points to next reward</span>
                                    </div>
                                    <button className="rewards-card__btn">
                                        <Gift size={16} />
                                        Redeem Points
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="membership-payments">
                            <div className="membership-section">
                                <div className="membership-section__header">
                                    <h3><Wallet size={18} /> Payment Methods</h3>
                                    <button className="section-link" onClick={() => setShowAddCard(true)}>
                                        <Plus size={14} /> Add Card
                                    </button>
                                </div>
                                <div className="payment-methods">
                                    {paymentMethods.map((pm) => (
                                        <motion.div 
                                            key={pm.id} 
                                            className={`payment-card ${pm.isDefault ? 'payment-card--default' : ''}`}
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <div className="payment-card__icon">{getCardIcon(pm.type)}</div>
                                            <div className="payment-card__info">
                                                <span className="payment-card__type">{pm.type.toUpperCase()} •••• {pm.last4}</span>
                                                <span className="payment-card__expiry">Expires {pm.expiry}</span>
                                            </div>
                                            {pm.isDefault && (
                                                <span className="payment-card__badge">Default</span>
                                            )}
                                            <div className="payment-card__actions">
                                                {!pm.isDefault && (
                                                    <button onClick={() => handleSetDefaultCard(pm.id)} title="Set as default">
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleRemoveCard(pm.id)} title="Remove">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="membership-section">
                                <div className="membership-section__header">
                                    <h3><CreditCard size={18} /> Payment History</h3>
                                    <button className="section-link">
                                        <Download size={14} /> Export
                                    </button>
                                </div>
                                <div className="payment-history">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Invoice</th>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentHistory.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="invoice-id">{payment.id}</td>
                                                    <td>{payment.date}</td>
                                                    <td>
                                                        <div className="payment-desc">
                                                            <span>{payment.type}</span>
                                                            <span className="payment-method">{payment.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="payment-amount">${payment.amount.toFixed(2)}</td>
                                                    <td>
                                                        <span className="payment-status">{payment.status}</span>
                                                    </td>
                                                    <td>
                                                        <button className="download-btn" onClick={() => toast.success('Invoice downloaded')}>
                                                            <Download size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="membership-settings">
                            <div className="settings-card">
                                <div className="settings-card__header">
                                    <div className="settings-card__icon settings-card__icon--blue">
                                        <RefreshCw size={20} />
                                    </div>
                                    <div className="settings-card__info">
                                        <h4>Auto-Renewal</h4>
                                        <p>Automatically renew your membership</p>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={membership?.autoRenew} 
                                        onChange={() => {
                                            setMembership(prev => prev ? {...prev, autoRenew: !prev.autoRenew} : null);
                                            toast.success('Auto-renewal updated');
                                        }}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>

                            <div className="settings-card">
                                <div className="settings-card__header">
                                    <div className="settings-card__icon settings-card__icon--purple">
                                        <Pause size={20} />
                                    </div>
                                    <div className="settings-card__info">
                                        <h4>Freeze Membership</h4>
                                        <p>{membership?.freezeDaysUsed}/{membership?.freezeDaysTotal} days used this year</p>
                                        <div className="freeze-progress">
                                            <div className="freeze-progress__bar">
                                                <div className="freeze-progress__fill" style={{ width: `${freezeProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="settings-btn"
                                    onClick={() => setShowFreezeModal(true)}
                                    disabled={!membership?.freezeAvailable}
                                >
                                    Freeze
                                </button>
                            </div>

                            <div className="settings-card">
                                <div className="settings-card__header">
                                    <div className="settings-card__icon settings-card__icon--green">
                                        <Bell size={20} />
                                    </div>
                                    <div className="settings-card__info">
                                        <h4>Renewal Reminders</h4>
                                        <p>Get notified before your membership expires</p>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider" />
                                </label>
                            </div>

                            <div className="settings-card settings-card--danger">
                                <div className="settings-card__header">
                                    <div className="settings-card__icon settings-card__icon--red">
                                        <CircleX size={20} />
                                    </div>
                                    <div className="settings-card__info">
                                        <h4>Cancel Membership</h4>
                                        <p>End your membership at the current billing period</p>
                                    </div>
                                </div>
                                <button 
                                    className="settings-btn settings-btn--danger"
                                    onClick={() => toast.error('Please contact support to cancel')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {showQRCode && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQRCode(false)}
                    >
                        <motion.div 
                            className="qr-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setShowQRCode(false)}>
                                <X size={20} />
                            </button>
                            <div className="qr-modal__content">
                                <div className="qr-code-placeholder">
                                    <QrCode size={120} strokeWidth={1} />
                                </div>
                                <h3>Scan to Check In</h3>
                                <p>Show this QR code at the gym entrance</p>
                                <div className="qr-modal__id">
                                    <span>Member ID: MEM-2024-12345</span>
                                    <button onClick={handleCopyMemberId}><Copy size={14} /></button>
                                </div>
                                <div className="qr-modal__info">
                                    <CircleCheck size={14} />
                                    <span>Valid until {membership?.endDate ? formatDate(membership.endDate) : 'N/A'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showFreezeModal && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFreezeModal(false)}
                    >
                        <motion.div 
                            className="freeze-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="freeze-modal__header">
                                <h3><Pause size={20} /> Freeze Membership</h3>
                                <button onClick={() => setShowFreezeModal(false)}><X size={18} /></button>
                            </div>
                            <div className="freeze-modal__body">
                                <div className="freeze-info">
                                    <Info size={16} />
                                    <p>Freezing your membership will pause billing. You have {(membership?.freezeDaysTotal || 14) - (membership?.freezeDaysUsed || 0)} days remaining this year.</p>
                                </div>
                                <div className="freeze-duration">
                                    <label>Freeze Duration</label>
                                    <div className="freeze-duration__options">
                                        {[7, 14, 21, 30].map(days => (
                                            <button
                                                key={days}
                                                className={`freeze-option ${freezeDays === days ? 'freeze-option--active' : ''}`}
                                                onClick={() => setFreezeDays(days)}
                                            >
                                                {days} days
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="freeze-dates">
                                    <div className="freeze-date">
                                        <span>Freeze starts</span>
                                        <strong>Tomorrow</strong>
                                    </div>
                                    <ArrowRight size={16} />
                                    <div className="freeze-date">
                                        <span>Resumes on</span>
                                        <strong>{new Date(Date.now() + (freezeDays + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="freeze-modal__footer">
                                <button className="modal-btn modal-btn--secondary" onClick={() => setShowFreezeModal(false)}>
                                    Cancel
                                </button>
                                <button className="modal-btn modal-btn--primary" onClick={handleFreezeMembership}>
                                    <Pause size={14} />
                                    Freeze for {freezeDays} Days
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
