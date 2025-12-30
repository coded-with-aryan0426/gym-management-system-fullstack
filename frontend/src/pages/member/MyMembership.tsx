import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import ContentCard from '../../components/shared/ContentCard';
import { Check, Shield, Zap, Star, Download, CreditCard } from 'lucide-react';
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

const MyMembership: React.FC = () => {
    const [membership, setMembership] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchMembership = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/membership?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMembership(data);
                }
            } catch (error) {
                console.error('Failed to fetch membership:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembership();
    }, [user?.id]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading membership details...</div>;
    }

    // Mock Payment History
    const paymentHistory = [
        { id: 'INV-001', date: 'Mar 1, 2024', amount: '$49.99', status: 'Paid', method: 'Visa •••• 4242' },
        { id: 'INV-002', date: 'Feb 1, 2024', amount: '$49.99', status: 'Paid', method: 'Visa •••• 4242' },
        { id: 'INV-003', date: 'Jan 1, 2024', amount: '$49.99', status: 'Paid', method: 'Visa •••• 4242' },
    ];

    // Mock Plans for Upgrades
    const plans = [
        {
            name: 'Basic',
            price: '$29.99',
            features: ['Access to main gym floor', 'Locker access', '1 Guest pass/month'],
            recommended: false
        },
        {
            name: 'Premium',
            price: '$49.99',
            features: ['All Basic features', 'Unlimited group classes', 'Sauna access', 'Free smoothy/month'],
            recommended: true
        },
        {
            name: 'Elite',
            price: '$89.99',
            features: ['All Premium features', '2 Personal training sessions', 'Nutrition consultation', 'Priority support'],
            recommended: false
        }
    ];

    return (
        <div className="space-y-8 fade-in">
            <PageHeader
                title="My Membership"
                subtitle="Manage your subscription, view payment history, and upgrade plans."
            />

            <div className="membership-container">
                {/* Current Plan Card */}
                <div className="current-plan-card">
                    <div className="current-plan__header">
                        <div>
                            <div className="current-plan__title">Current Plan</div>
                            <div className="current-plan__name">{membership?.packageName || 'No Active Plan'}</div>
                        </div>
                        {membership?.status && (
                            <div className={`current-plan__status-badge ${membership.isExpired ? 'status-expired' : 'status-active'}`}>
                                {membership.isExpired ? <Shield size={14} /> : <Zap size={14} />}
                                {membership.isExpired ? 'Expired' : 'Active'}
                            </div>
                        )}
                    </div>

                    {membership?.hasMembership && (
                        <div className="current-plan__details">
                            <div>
                                <div className="plan-detail__label">Start Date</div>
                                <div className="plan-detail__value">{membership.startDate ? formatDate(membership.startDate) : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="plan-detail__label">Renewal Date</div>
                                <div className="plan-detail__value">{membership.endDate ? formatDate(membership.endDate) : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="plan-detail__label">Price</div>
                                <div className="plan-detail__value">{membership.packagePrice ? `$${membership.packagePrice}/mo` : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="plan-detail__label">Days Remaining</div>
                                <div className={`plan-detail__value ${membership.daysRemaining && membership.daysRemaining < 7 ? 'days-left-highlight' : ''}`}>
                                    {membership.daysRemaining !== undefined ? `${membership.daysRemaining} Days` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment History */}
                <ContentCard title="Payment History">
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((payment, index) => (
                                    <tr key={index}>
                                        <td>{payment.id}</td>
                                        <td>{payment.date}</td>
                                        <td>{payment.amount}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={14} />
                                                {payment.method}
                                            </div>
                                        </td>
                                        <td><span className="status-paid">{payment.status}</span></td>
                                        <td>
                                            <button className="text-zinc-500 hover:text-white transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ContentCard>

                {/* Upgrade Plans */}
                {!membership?.isExpired && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Upgrade Your Plan</h2>
                        <div className="upgrade-grid">
                            {plans.map((plan, index) => (
                                <div key={index} className={`plan-card ${plan.recommended ? 'plan-card--featured' : ''}`}>
                                    {plan.recommended && <div className="plan-card__badge">Most Popular</div>}
                                    <div className="plan-card__name">{plan.name}</div>
                                    <div className="plan-card__price">
                                        <span className="plan-card__amount">{plan.price}</span>
                                        <span className="plan-card__period">/month</span>
                                    </div>
                                    <ul className="plan-card__features">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="plan-card__feature">
                                                <Check size={16} className="feature-icon" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className={`plan-btn ${plan.recommended ? 'plan-btn--primary' : 'plan-btn--outline'}`}>
                                        {membership?.packageName === plan.name ? 'Current Plan' : 'Upgrade'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMembership;
