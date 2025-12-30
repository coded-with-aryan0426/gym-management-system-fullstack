import React, { useEffect, useState } from 'react';
import './Member.css';

interface TrainerData {
    hasTrainer: boolean;
    userId?: number;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    avatarId?: string;
}

const MyTrainer: React.FC = () => {
    const [trainer, setTrainer] = useState<TrainerData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchTrainer = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/my-trainer?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTrainer(data);
                }
            } catch (error) {
                console.error('Failed to fetch trainer:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainer();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">My Trainer</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    if (!trainer?.hasTrainer) {
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">My Trainer</h1>
                <div className="member-empty-state">
                    <div className="member-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                        </svg>
                    </div>
                    <h3 className="member-empty-state__title">No Trainer Assigned</h3>
                    <p className="member-empty-state__text">
                        You don't have a trainer assigned yet. Contact the front desk to get one!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <h1 className="member-page-title">My Trainer</h1>

            <div className="member-trainer-card" style={{ maxWidth: '500px' }}>
                <div className="member-trainer-card__avatar">
                    {trainer.fullName?.charAt(0) || 'T'}
                </div>
                <div className="member-trainer-card__info">
                    <div className="member-trainer-card__name">{trainer.fullName}</div>
                    <div className="member-trainer-card__email">{trainer.email}</div>
                    {trainer.phoneNumber && (
                        <div style={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            marginTop: '4px'
                        }}>
                            📞 {trainer.phoneNumber}
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-primary)',
                maxWidth: '500px'
            }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Need to contact your trainer?
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    You can reach out to your trainer directly using the contact information above,
                    or speak to the front desk for assistance.
                </div>
            </div>
        </div>
    );
};

export default MyTrainer;
