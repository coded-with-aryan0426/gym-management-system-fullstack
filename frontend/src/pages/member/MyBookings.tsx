import React, { useEffect, useState } from 'react';
import './Member.css';

interface Booking {
    id: number;
    classId: number;
    bookingDate: string;
    status: string;
    cancelledAt?: string;
}

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/bookings?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user?.id]);

    const handleCancel = async (bookingId: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch(`/api/member/bookings/${bookingId}?memberId=${user?.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setBookings(prev => prev.map(b =>
                    b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
                ));
                alert('Booking cancelled successfully');
            }
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            alert('Failed to cancel booking');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
            case 'CANCELLED':
                return { bg: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' };
            case 'COMPLETED':
                return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' };
            default:
                return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9CA3AF' };
        }
    };

    if (loading) {
        return (
            <div className="member-dashboard">
                <h1 className="member-page-title">My Bookings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <h1 className="member-page-title">My Bookings ({bookings.length})</h1>

            {bookings.length === 0 ? (
                <div className="member-empty-state">
                    <div className="member-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h3 className="member-empty-state__title">No Bookings Yet</h3>
                    <p className="member-empty-state__text">
                        You haven't booked any classes yet. Check out available classes to get started!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookings.map(booking => {
                        const statusStyle = getStatusStyle(booking.status);
                        return (
                            <div key={booking.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '12px',
                            }}>
                                <div>
                                    <div style={{
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        marginBottom: '4px'
                                    }}>
                                        Class #{booking.classId}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        Booked: {formatDate(booking.bookingDate)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        background: statusStyle.bg,
                                        color: statusStyle.color,
                                    }}>
                                        {booking.status}
                                    </span>
                                    {booking.status === 'BOOKED' && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'transparent',
                                                border: '1px solid rgba(220, 38, 38, 0.5)',
                                                borderRadius: '8px',
                                                color: '#DC2626',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
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

export default MyBookings;
