import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Check, Zap, Shield, Download, Star, Clock, Users,
    Dumbbell, ChevronRight, Pause, RefreshCw, X, Gem, Award, Medal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
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
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const MyMembership: React.FC = () => {
    const [membership, setMembership] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchMembership = async () => {
            // Set mock data for development
            const mockData: MembershipData = {
                hasMembership: true,
                status: 'Active',
                packageName: 'Premium Monthly',
                packagePrice: 99.99,
                startDate: '2025-12-01',
                endDate: '2026-01-26',
                daysRemaining: 25,
                isExpired: false
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

    // Usage stats
    const usageStats = {
        gymVisits: 18,
        classesAttended: 12,
        ptSessionsUsed: 2,
        ptSessionsTotal: 4,
        guestPassesUsed: 0,
        guestPassesTotal: 2
    };

    // Payment History
    const paymentHistory = [
        { id: 'INV-2024-001', date: 'Dec 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242' },
        { id: 'INV-2024-002', date: 'Nov 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242' },
        { id: 'INV-2024-003', date: 'Oct 20, 2025', amount: 99.99, status: 'Paid', method: 'Visa ••4242' },
        { id: 'INV-2024-004', date: 'Sep 20, 2025', amount: 50.00, status: 'Paid', method: 'Visa ••4242' }
    ];

    // Plans with icon components
    const plans = [
        {
            name: 'Basic',
            price: 49.99,
            iconType: 'medal',
            features: ['Unlimited gym access', '10 classes per month', 'Locker access'],
            recommended: false,
            current: false
        },
        {
            name: 'Standard',
            price: 79.99,
            iconType: 'award',
            features: ['Everything in Basic', 'Unlimited classes', '2 PT sessions/month', '1 guest pass/month'],
            recommended: false,
            current: false
        },
        {
            name: 'Premium',
            price: 99.99,
            iconType: 'gem',
            features: ['Everything in Standard', '4 PT sessions/month', 'Nutrition consultation', 'Spa access', '2 guest passes/month'],
            recommended: true,
            current: true
        }
    ];

    const getPlanIcon = (iconType: string) => {
        switch (iconType) {
            case 'medal': return <Medal size={32} />;
            case 'award': return <Award size={32} />;
            case 'gem': return <Gem size={32} />;
            default: return <Star size={32} />;
        }
    };

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <CreditCard size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    const progressPercentage = membership?.daysRemaining ? Math.min((membership.daysRemaining / 30) * 100, 100) : 0;

    return (
        <motion.div
            className="macos-page membership-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="membership__header" variants={itemVariants}>
                <h1 className="macos-heading-xl">My Membership</h1>
                <p className="macos-text-md">Manage your subscription, view usage, and payment history</p>
            </motion.header>

            {/* Current Plan Hero Card */}
            <motion.div className="membership__hero-card" variants={itemVariants}>
                <div className="membership__hero-bg" />

                <div className="membership__hero-content">
                    <div className="membership__hero-header">
                        <div>
                            <span className="macos-text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Current Plan</span>
                            <h2 className="membership__plan-name">
                                <Gem size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                                {membership?.packageName || 'Premium Monthly'}
                            </h2>
                        </div>
                        <span className={`membership__status-badge ${membership?.isExpired ? 'membership__status-badge--expired' : ''}`}>
                            {membership?.isExpired ? <X size={14} /> : <Zap size={14} />}
                            {membership?.isExpired ? 'Expired' : 'Active'}
                        </span>
                    </div>

                    <div className="membership__hero-stats">
                        <div className="membership__hero-stat">
                            <span className="membership__hero-stat-label">Started</span>
                            <span className="membership__hero-stat-value">{membership?.startDate ? formatDate(membership.startDate) : 'N/A'}</span>
                        </div>
                        <div className="membership__hero-stat">
                            <span className="membership__hero-stat-label">Expires</span>
                            <span className="membership__hero-stat-value">{membership?.endDate ? formatDate(membership.endDate) : 'N/A'}</span>
                        </div>
                        <div className="membership__hero-stat">
                            <span className="membership__hero-stat-label">Monthly Fee</span>
                            <span className="membership__hero-stat-value">${membership?.packagePrice?.toFixed(2)}</span>
                        </div>
                        <div className="membership__hero-stat">
                            <span className="membership__hero-stat-label">Next Billing</span>
                            <span className="membership__hero-stat-value">{membership?.endDate ? formatDate(membership.endDate) : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="membership__hero-progress">
                        <div className="membership__progress-bar">
                            <motion.div
                                className="membership__progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="membership__progress-text">
                            {membership?.daysRemaining} days remaining
                        </span>
                    </div>

                    <div className="membership__hero-includes">
                        <span className="macos-text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Plan includes:</span>
                        <div className="membership__includes-list">
                            {['Unlimited gym access', 'All group classes', '4 PT sessions/month', 'Locker access', 'Nutrition consultation'].map((item, i) => (
                                <span key={i} className="membership__includes-item">
                                    <Check size={12} /> {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div className="bento-grid bento-grid--4col" variants={itemVariants}>
                <button className="membership__action-btn">
                    <Download size={20} />
                    <span>Download Card</span>
                </button>
                <button className="membership__action-btn">
                    <Users size={20} />
                    <span>Guest Pass</span>
                </button>
                <button className="membership__action-btn">
                    <Pause size={20} />
                    <span>Freeze</span>
                </button>
                <button className="membership__action-btn">
                    <RefreshCw size={20} />
                    <span>Renew Now</span>
                </button>
            </motion.div>

            {/* Usage Statistics */}
            <motion.section variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Usage This Month</h2>
                </div>
                <div className="bento-grid bento-grid--3col">
                    <div className="glass-card glass-card--md membership__usage-card">
                        <div className="membership__usage-icon" style={{ background: 'rgba(0, 122, 255, 0.15)', color: 'var(--macos-accent)' }}>
                            <Dumbbell size={20} />
                        </div>
                        <div className="membership__usage-value">{usageStats.gymVisits}</div>
                        <div className="membership__usage-label">Gym Visits</div>
                    </div>
                    <div className="glass-card glass-card--md membership__usage-card">
                        <div className="membership__usage-icon" style={{ background: 'var(--macos-success-bg)', color: 'var(--macos-success)' }}>
                            <Users size={20} />
                        </div>
                        <div className="membership__usage-value">{usageStats.classesAttended}</div>
                        <div className="membership__usage-label">Classes Attended</div>
                    </div>
                    <div className="glass-card glass-card--md membership__usage-card">
                        <div className="membership__usage-icon" style={{ background: 'rgba(175, 82, 222, 0.15)', color: 'var(--macos-purple)' }}>
                            <Star size={20} />
                        </div>
                        <div className="membership__usage-value">{usageStats.ptSessionsUsed}/{usageStats.ptSessionsTotal}</div>
                        <div className="membership__usage-label">PT Sessions</div>
                        <div className="macos-progress" style={{ marginTop: '8px' }}>
                            <div
                                className="macos-progress__fill macos-progress__fill--blue"
                                style={{ width: `${(usageStats.ptSessionsUsed / usageStats.ptSessionsTotal) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Available Plans */}
            <motion.section variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Available Plans</h2>
                    <button className="macos-section-link">Compare Plans</button>
                </div>
                <div className="bento-grid bento-grid--3col">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            className={`glass-card membership__plan-card ${plan.current ? 'membership__plan-card--current' : ''} ${plan.recommended ? 'membership__plan-card--recommended' : ''}`}
                            whileHover={{ y: -4 }}
                        >
                            {plan.recommended && (
                                <span className="membership__plan-badge">Most Popular</span>
                            )}
                            <div className="membership__plan-icon">{getPlanIcon(plan.iconType)}</div>
                            <h3 className="membership__plan-title">{plan.name}</h3>
                            <div className="membership__plan-price">
                                <span className="membership__plan-amount">${plan.price.toFixed(2)}</span>
                                <span className="membership__plan-period">/month</span>
                            </div>
                            <ul className="membership__plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>
                                        <Check size={14} /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className={`macos-btn ${plan.current ? 'macos-btn--secondary' : plan.recommended ? 'macos-btn--primary' : 'macos-btn--secondary'}`} style={{ width: '100%' }}>
                                {plan.current ? '✓ Current Plan' : 'Upgrade'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Payment History */}
            <motion.section variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Payment History</h2>
                    <button className="macos-section-link">Export PDF</button>
                </div>
                <div className="glass-card glass-card--md membership__history">
                    <table className="membership__history-table">
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
                                    <td className="membership__history-id">{payment.id}</td>
                                    <td>{payment.date}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CreditCard size={14} />
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td className="membership__history-amount">${payment.amount.toFixed(2)}</td>
                                    <td>
                                        <span className="macos-badge macos-badge--green">{payment.status}</span>
                                    </td>
                                    <td>
                                        <button className="macos-btn macos-btn--ghost macos-btn--sm">
                                            <Download size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default MyMembership;
