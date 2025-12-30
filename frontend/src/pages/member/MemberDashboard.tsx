import React, { useEffect, useState } from 'react';
import './Member.css';

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
        userId: number;
        fullName: string;
        avatarId?: string;
    } | null;
    bookedClassesCount: number;
    unreadNotificationsCount: number;
}

const MemberDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.id) return;

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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="member-dashboard">
                <div className="member-dashboard__header">
                    <h1 className="member-dashboard__welcome">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <div className="member-dashboard__header">
                <h1 className="member-dashboard__welcome">
                    Welcome back, {dashboard?.memberName || user?.fullName || 'Member'}! 💪
                </h1>
                <p className="member-dashboard__subtitle">
                    Track your fitness journey and manage your membership.
                </p>
            </div>

            {/* Membership Card */}
            {dashboard?.membership && (
                <div className="member-membership-card" style={{
                    background: dashboard.membership.isExpired
                        ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}>
                    <div className="member-membership-card__header">
                        <div className="member-membership-card__plan">
                            {dashboard.membership.packageName || 'Membership'}
                        </div>
                        <div className={`member-membership-card__status ${dashboard.membership.isExpired
                                ? 'member-membership-card__status--expired'
                                : 'member-membership-card__status--active'
                            }`}>
                            {dashboard.membership.isExpired ? '⚠️ Expired' : '✓ Active'}
                        </div>
                    </div>
                    <div className="member-membership-card__details">
                        {dashboard.membership.endDate && (
                            <div className="member-membership-card__detail">
                                <span className="member-membership-card__detail-label">Expires</span>
                                <span className="member-membership-card__detail-value">
                                    {formatDate(dashboard.membership.endDate)}
                                </span>
                            </div>
                        )}
                        {dashboard.membership.daysRemaining !== undefined && !dashboard.membership.isExpired && (
                            <div className="member-membership-card__detail">
                                <span className="member-membership-card__detail-label">Days Left</span>
                                <span className="member-membership-card__detail-value">
                                    {dashboard.membership.daysRemaining} days
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="member-stats-grid">
                <div className="member-stat-card">
                    <div className="member-stat-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="member-stat-card__content">
                        <div className="member-stat-card__value">{dashboard?.bookedClassesCount || 0}</div>
                        <div className="member-stat-card__label">Booked Classes</div>
                    </div>
                </div>

                <div className="member-stat-card">
                    <div className="member-stat-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <div className="member-stat-card__content">
                        <div className="member-stat-card__value">{dashboard?.unreadNotificationsCount || 0}</div>
                        <div className="member-stat-card__label">Notifications</div>
                    </div>
                </div>
            </div>

            {/* Trainer Preview */}
            {dashboard?.assignedTrainer && (
                <div style={{ marginTop: '32px' }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '16px'
                    }}>
                        Your Trainer
                    </h3>
                    <div className="member-trainer-card">
                        <div className="member-trainer-card__avatar">
                            {dashboard.assignedTrainer.fullName.charAt(0)}
                        </div>
                        <div className="member-trainer-card__info">
                            <div className="member-trainer-card__name">{dashboard.assignedTrainer.fullName}</div>
                            <div className="member-trainer-card__email">Personal Trainer</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberDashboard;
