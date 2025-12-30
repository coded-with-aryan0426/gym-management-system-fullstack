import React, { useEffect, useState } from 'react';
import './Member.css';

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
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">My Membership</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    if (!membership?.hasMembership) {
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">My Membership</h1>
                <div className="member-empty-state">
                    <div className="member-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                    </div>
                    <h3 className="member-empty-state__title">No Active Membership</h3>
                    <p className="member-empty-state__text">
                        You don't have an active membership. Contact the gym to sign up!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <h1 className="member-page-title">My Membership</h1>

            {/* Membership Card */}
            <div className="member-membership-card" style={{
                background: membership.isExpired
                    ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                marginBottom: '24px'
            }}>
                <div className="member-membership-card__header">
                    <div className="member-membership-card__plan">
                        {membership.packageName || 'Membership Plan'}
                    </div>
                    <div className={`member-membership-card__status ${membership.isExpired
                            ? 'member-membership-card__status--expired'
                            : 'member-membership-card__status--active'
                        }`}>
                        {membership.isExpired ? '⚠️ Expired' : '✓ ' + membership.status}
                    </div>
                </div>
                <div className="member-membership-card__details">
                    {membership.startDate && (
                        <div className="member-membership-card__detail">
                            <span className="member-membership-card__detail-label">Started</span>
                            <span className="member-membership-card__detail-value">
                                {formatDate(membership.startDate)}
                            </span>
                        </div>
                    )}
                    {membership.endDate && (
                        <div className="member-membership-card__detail">
                            <span className="member-membership-card__detail-label">Expires</span>
                            <span className="member-membership-card__detail-value">
                                {formatDate(membership.endDate)}
                            </span>
                        </div>
                    )}
                    {membership.daysRemaining !== undefined && !membership.isExpired && (
                        <div className="member-membership-card__detail">
                            <span className="member-membership-card__detail-label">Days Left</span>
                            <span className="member-membership-card__detail-value">
                                {membership.daysRemaining} days
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Renewal Notice for Expired */}
            {membership.isExpired && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                        <div style={{ fontWeight: 600, color: '#DC2626', marginBottom: '4px' }}>
                            Membership Expired
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Please contact the front desk to renew your membership.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyMembership;
