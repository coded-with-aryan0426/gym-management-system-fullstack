import React, { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import ContentCard from '../../components/shared/ContentCard';
import PageHeader from '../../components/shared/PageHeader';
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
        return <div className="p-8">Loading bookings...</div>;
    }

    return (
        <div className="fade-in">
            <PageHeader
                title={`My Bookings (${bookings.length})`}
                subtitle="Manage your class schedules and history."
            />

            {bookings.length === 0 ? (
                <ContentCard padded>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                            <Calendar size={32} className="text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No Bookings Yet</h3>
                        <p className="text-zinc-400 max-w-md">
                            You haven't booked any classes yet. Check out available classes to get started!
                        </p>
                    </div>
                </ContentCard>
            ) : (
                <ContentCard padded className="space-y-4">
                    {bookings.map(booking => {
                        const statusStyle = getStatusStyle(booking.status);
                        return (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                                <div>
                                    <div className="font-semibold text-white mb-1">
                                        Class #{booking.classId}
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        Booked: {formatDate(booking.bookingDate)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                                    >
                                        {booking.status}
                                    </span>
                                    {booking.status === 'BOOKED' && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Cancel Booking"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </ContentCard>
            )}
        </div>
    );
};

export default MyBookings;
