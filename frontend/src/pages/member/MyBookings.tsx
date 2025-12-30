import React, { useEffect, useState } from 'react';
import { Calendar, X, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { toast } from 'react-hot-toast';
import './MyBookings.css';

interface Booking {
    id: number;
    classId: number;
    bookingDate: string;
    status: string;
    cancelledAt?: string;
    // Mock fields for now
    className?: string;
    trainerName?: string;
    location?: string;
    duration?: number;
}

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY' | 'CANCELLED'>('UPCOMING');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/bookings?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Enhance data with mock details for UI
                    const enhancedData = data.map((b: Booking) => ({
                        ...b,
                        className: 'Personal Training Session',
                        trainerName: 'John Doe',
                        location: 'Main Gym Floor',
                        duration: 60
                    }));
                    setBookings(enhancedData);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
                toast.error('Failed to load bookings');
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
                toast.success('Booking cancelled successfully');
            } else {
                toast.error('Failed to cancel booking');
            }
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            toast.error('Failed to cancel booking');
        }
    };

    const getFilteredBookings = () => {
        const now = new Date();
        return bookings.filter(b => {
            const bookingDate = new Date(b.bookingDate);
            if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';

            if (activeTab === 'UPCOMING') {
                return b.status === 'BOOKED' && bookingDate >= now;
            }

            if (activeTab === 'HISTORY') {
                return b.status === 'COMPLETED' || (b.status === 'BOOKED' && bookingDate < now);
            }
            return false;
        }).sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
    };

    const filteredBookings = getFilteredBookings();

    // Stats Logic
    const stats = {
        upcoming: bookings.filter(b => b.status === 'BOOKED' && new Date(b.bookingDate) >= new Date()).length,
        completed: bookings.filter(b => b.status === 'COMPLETED' || (b.status === 'BOOKED' && new Date(b.bookingDate) < new Date())).length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    };

    if (loading) return <div className="p-8 text-zinc-400">Loading bookings...</div>;

    return (
        <div className="space-y-8 fade-in">
            <PageHeader
                title="My Bookings"
                subtitle="Manage your upcoming classes and view your attendance history."
            />

            {/* Quick Stats */}
            <div className="bookings-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Bookings</span>
                    <span className="stat-value">{bookings.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Upcoming</span>
                    <span className="stat-value text-blue-500">{stats.upcoming}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value text-green-500">{stats.completed}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Cancelled</span>
                    <span className="stat-value text-red-500">{stats.cancelled}</span>
                </div>
            </div>

            {/* Tabs & List */}
            <div>
                <div className="bookings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'UPCOMING' ? 'tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('UPCOMING')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'HISTORY' ? 'tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('HISTORY')}
                    >
                        History
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'CANCELLED' ? 'tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('CANCELLED')}
                    >
                        Cancelled
                    </button>
                </div>

                <div className="bookings-list">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                                {activeTab === 'UPCOMING' ? <Calendar size={24} /> :
                                    activeTab === 'CANCELLED' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                            </div>
                            <h3 className="text-zinc-300 font-medium mb-1">No {activeTab.toLowerCase()} bookings</h3>
                            <p className="text-zinc-500 text-sm">
                                {activeTab === 'UPCOMING' ? "You don't have any upcoming classes booked." : "No records found in this category."}
                            </p>
                        </div>
                    ) : (
                        filteredBookings.map(booking => {
                            const date = new Date(booking.bookingDate);
                            return (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-info">
                                        <div className="booking-date-badge">
                                            <span className="booking-day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className="booking-date-num">{date.getDate()}</span>
                                        </div>
                                        <div className="booking-details">
                                            <div className="booking-title">{booking.className} #{booking.classId}</div>
                                            <div className="booking-meta">
                                                <div className="meta-item">
                                                    <Clock size={14} />
                                                    {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="meta-item">
                                                    <MapPin size={14} />
                                                    {booking.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="booking-actions">
                                        {booking.status === 'BOOKED' && activeTab === 'UPCOMING' ? (
                                            <button
                                                className="cancel-btn"
                                                onClick={() => handleCancel(booking.id)}
                                            >
                                                Cancel Class
                                            </button>
                                        ) : (
                                            <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
