import React, { useEffect, useState } from 'react';
import './Member.css';

interface ProgressNote {
    id: number;
    note: string;
    createdAt: string;
    trainer: {
        userId: number;
        fullName: string;
        avatarId?: string;
    };
}

const MyProgress: React.FC = () => {
    const [notes, setNotes] = useState<ProgressNote[]>([]);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchNotes = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/progress-notes?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                }
            } catch (error) {
                console.error('Failed to fetch progress notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [user?.id]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">My Progress</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <div style={{ marginBottom: '32px' }}>
                <h1 className="member-page-title">My Progress</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Track your fitness journey and view notes from your trainer.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                {/* Progress Notes Timeline */}
                <div className="member-card">
                    <h2 className="member-section-title" style={{ marginBottom: '20px' }}>Trainer Notes</h2>

                    {notes.length === 0 ? (
                        <div className="member-empty-state" style={{ padding: '32px 0' }}>
                            <div className="member-empty-state__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3 className="member-empty-state__title">No Notes Yet</h3>
                            <p className="member-empty-state__text">
                                Your trainer hasn't added any progress notes yet.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {notes.map(note => (
                                <div key={note.id} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'var(--bg-tertiary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid var(--border-primary)',
                                            zIndex: 1,
                                        }}>
                                            <span style={{ fontSize: '16px' }}>📝</span>
                                        </div>
                                        <div style={{ width: '2px', flex: 1, background: 'var(--border-primary)', marginTop: '8px' }} />
                                    </div>

                                    <div style={{ flex: 1, paddingBottom: '24px' }}>
                                        <div style={{
                                            background: 'var(--bg-tertiary)',
                                            padding: '20px',
                                            borderRadius: '16px',
                                            border: '1px solid var(--border-primary)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        {note.trainer.fullName}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        color: '#10B981',
                                                        fontWeight: 600
                                                    }}>
                                                        TRAINER
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                                    {formatDate(note.createdAt)}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                                                {note.note}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Stats (Placeholder for future metrics) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="member-card">
                        <h2 className="member-section-title">Measurements</h2>
                        <div className="member-empty-state" style={{ padding: '24px 0' }}>
                            <p className="member-empty-state__text" style={{ fontStyle: 'italic' }}>
                                Measurement tracking coming soon...
                            </p>
                        </div>
                    </div>

                    <div className="member-card">
                        <h2 className="member-section-title">Goals</h2>
                        <div className="member-empty-state" style={{ padding: '24px 0' }}>
                            <p className="member-empty-state__text" style={{ fontStyle: 'italic' }}>
                                Goal tracking coming soon...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProgress;
