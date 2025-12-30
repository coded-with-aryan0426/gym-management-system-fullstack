import React, { useEffect, useState } from 'react';
import './Member.css';

interface ClassSession {
    id: number;
    sessionDate: string;
    durationMinutes: number;
    status: string;
    trainer?: {
        userId: number;
        fullName: string;
    };
    member?: {
        userId: number;
        fullName: string;
    };
}

const AvailableClasses: React.FC = () => {
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<number | null>(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Get all PT sessions (available classes)
                const response = await fetch('/api/pt-sessions');
                if (response.ok) {
                    const data = await response.json();
                    // Filter to show only scheduled sessions that the member is not already in
                    const available = data.filter((s: ClassSession) =>
                        s.status?.toUpperCase() === 'SCHEDULED' &&
                        (!s.member || s.member.userId !== user?.id)
                    );
                    setClasses(available);
                }
            } catch (error) {
                console.error('Failed to fetch classes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
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

    const handleBook = async (classId: number) => {
        if (!user?.id) return;

        setBooking(classId);
        try {
            const response = await fetch(`/api/member/classes/book?memberId=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId }),
            });

            if (response.ok) {
                setClasses(prev => prev.filter(c => c.id !== classId));
                alert('Class booked successfully!');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to book class');
            }
        } catch (error) {
            console.error('Failed to book:', error);
            alert('Failed to book class');
        } finally {
            setBooking(null);
        }
    };

    if (loading) {
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">Available Classes</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <h1 className="member-page-title">Available Classes ({classes.length})</h1>

            {classes.length === 0 ? (
                <div className="member-empty-state">
                    <div className="member-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h3 className="member-empty-state__title">No Classes Available</h3>
                    <p className="member-empty-state__text">
                        There are no classes available for booking at the moment. Check back later!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {classes.map(cls => (
                        <div key={cls.id} style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <line x1="20" y1="8" x2="20" y2="14" />
                                        <line x1="23" y1="11" x2="17" y2="11" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '16px', marginBottom: '4px' }}>
                                        Training Session
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        with {cls.trainer?.fullName || 'Trainer'}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--bg-tertiary)',
                                borderRadius: '10px',
                                padding: '12px',
                                marginBottom: '16px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Date & Time</span>
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {formatDate(cls.sessionDate)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Duration</span>
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {cls.durationMinutes} minutes
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleBook(cls.id)}
                                disabled={booking === cls.id}
                                className="member-btn member-btn--primary"
                                style={{ width: '100%' }}
                            >
                                {booking === cls.id ? 'Booking...' : 'Book Now'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableClasses;
