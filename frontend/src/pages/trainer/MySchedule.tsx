import React, { useEffect, useState } from 'react';
import './Trainer.css';

interface Session {
    sessionId: number;
    sessionDate: string;
    durationMinutes: number;
    status: string;
    member?: {
        fullName: string;
    };
}

const MySchedule: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/trainer/schedule?trainerId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSessions(data);
                }
            } catch (error) {
                console.error('Failed to fetch schedule:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [user?.id]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return '#10B981';
            case 'COMPLETED': return '#6B7280';
            case 'CANCELLED': return '#DC2626';
            default: return '#9CA3AF';
        }
    };

    if (loading) {
        return (
            <div className="trainer-dashboard">
                <h1 className="trainer-page-title">My Schedule</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="trainer-dashboard">
            <h1 className="trainer-page-title">My Schedule</h1>

            {sessions.length === 0 ? (
                <div className="trainer-empty-state">
                    <div className="trainer-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h3 className="trainer-empty-state__title">No Sessions Scheduled</h3>
                    <p className="trainer-empty-state__text">
                        You don't have any sessions scheduled yet.
                    </p>
                </div>
            ) : (
                <div className="trainer-members-list">
                    {sessions.map(session => (
                        <div key={session.sessionId} className="trainer-member-card">
                            <div className="trainer-member-card__avatar" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="trainer-member-card__info">
                                <div className="trainer-member-card__name">
                                    {session.member?.fullName || 'Personal Training Session'}
                                </div>
                                <div className="trainer-member-card__email">
                                    {formatDate(session.sessionDate)} • {session.durationMinutes} min
                                </div>
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: `${getStatusColor(session.status)}20`,
                                color: getStatusColor(session.status)
                            }}>
                                {session.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySchedule;
