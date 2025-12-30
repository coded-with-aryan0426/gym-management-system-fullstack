import React, { useEffect, useState } from 'react';
import './Trainer.css';

interface Session {
    id: number;
    sessionDate: string;
    durationMinutes: number;
    status: string;
    member?: {
        userId: number;
        fullName: string;
        email?: string;
    };
    trainer?: {
        userId: number;
        fullName: string;
    };
    notes?: string;
}

const MyClasses: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/pt-sessions/trainer/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSessions(data);
                }
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
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

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'SCHEDULED':
                return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
            case 'COMPLETED':
                return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' };
            case 'CANCELLED':
                return { bg: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' };
            default:
                return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9CA3AF' };
        }
    };

    const filteredSessions = sessions.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return s.status?.toUpperCase() === 'SCHEDULED';
        if (filter === 'completed') return s.status?.toUpperCase() === 'COMPLETED';
        return true;
    });

    const handleMarkComplete = async (sessionId: number) => {
        try {
            const response = await fetch(`/api/pt-sessions/${sessionId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: 'Session completed' }),
            });

            if (response.ok) {
                setSessions(prev => prev.map(s =>
                    s.id === sessionId ? { ...s, status: 'COMPLETED' } : s
                ));
            }
        } catch (error) {
            console.error('Failed to mark complete:', error);
        }
    };

    if (loading) {
        return (
            <div className="trainer-dashboard">
                <h1 className="trainer-page-title">My Classes</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="trainer-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="trainer-page-title" style={{ marginBottom: 0 }}>
                    My Classes ({filteredSessions.length})
                </h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(['upcoming', 'completed', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === f ? 'var(--color-crimson, #DC2626)' : 'var(--bg-tertiary, #252525)',
                                color: filter === f ? 'white' : 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredSessions.length === 0 ? (
                <div className="trainer-empty-state">
                    <div className="trainer-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h3 className="trainer-empty-state__title">No Sessions Found</h3>
                    <p className="trainer-empty-state__text">
                        {filter === 'upcoming' ? 'No upcoming sessions scheduled.' : 'No sessions match this filter.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredSessions.map(session => {
                        const statusStyle = getStatusStyle(session.status);
                        return (
                            <div key={session.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '12px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            {session.member?.fullName || 'Personal Training Session'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {formatDate(session.sessionDate)} • {session.durationMinutes} min
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        background: statusStyle.bg,
                                        color: statusStyle.color,
                                    }}>
                                        {session.status}
                                    </span>
                                    {session.status?.toUpperCase() === 'SCHEDULED' && (
                                        <button
                                            onClick={() => handleMarkComplete(session.id)}
                                            className="trainer-btn trainer-btn--primary"
                                            style={{ padding: '8px 16px', fontSize: '13px' }}
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyClasses;
