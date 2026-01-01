import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, X, CheckCircle2,
    AlertCircle, ChevronRight, CalendarPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
import './MyBookings.css';

interface Booking {
    id: number;
    classId: number;
    bookingDate: string;
    status: string;
    cancelledAt?: string;
    className?: string;
    trainerName?: string;
    location?: string;
    duration?: number;
    icon?: string;
}

type TabType = 'UPCOMING' | 'HISTORY' | 'CANCELLED';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        // Set mock data for development
        const mockBookings: Booking[] = [
            { id: 1, classId: 101, bookingDate: '2026-01-02T09:00:00', status: 'BOOKED', className: 'Yoga Class', trainerName: 'Sarah J', location: 'Room A', duration: 60, icon: '🧘' },
            { id: 2, classId: 102, bookingDate: '2026-01-03T18:00:00', status: 'BOOKED', className: 'HIIT Training', trainerName: 'Mike C', location: 'Main Studio', duration: 45, icon: '🏃' },
            { id: 3, classId: 103, bookingDate: '2026-01-05T10:00:00', status: 'BOOKED', className: 'Strength Training', trainerName: 'John S', location: 'Weight Room', duration: 60, icon: '💪' },
            { id: 4, classId: 104, bookingDate: '2025-12-28T09:00:00', status: 'COMPLETED', className: 'Yoga Class', trainerName: 'Sarah J', location: 'Room A', duration: 60, icon: '🧘' },
            { id: 5, classId: 105, bookingDate: '2025-12-20T18:00:00', status: 'CANCELLED', className: 'Spin Class', trainerName: 'Alex R', location: 'Cycle Room', duration: 45, icon: '🚴' }
        ];
        setBookings(mockBookings);
        setLoading(false);
    }, [user?.id]);

    const handleCancel = (bookingId: number) => {
        setBookings(prev => prev.map(b =>
            b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ));
        toast.success('Booking cancelled');
    };

    const getFilteredBookings = () => {
        const now = new Date();
        return bookings.filter(b => {
            const bookingDate = new Date(b.bookingDate);
            if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
            if (activeTab === 'UPCOMING') return b.status === 'BOOKED' && bookingDate >= now;
            if (activeTab === 'HISTORY') return b.status === 'COMPLETED' || (b.status === 'BOOKED' && bookingDate < now);
            return false;
        }).sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
    };

    const filteredBookings = getFilteredBookings();

    const stats = {
        total: bookings.length,
        upcoming: bookings.filter(b => b.status === 'BOOKED' && new Date(b.bookingDate) >= new Date()).length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length
    };

    const tabs: { id: TabType; label: string; count: number }[] = [
        { id: 'UPCOMING', label: 'Upcoming', count: stats.upcoming },
        { id: 'HISTORY', label: 'Past', count: stats.completed },
        { id: 'CANCELLED', label: 'Cancelled', count: stats.cancelled }
    ];

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Calendar size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="macos-page bookings-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="bookings__header" variants={itemVariants}>
                <div>
                    <h1 className="macos-heading-xl">My Bookings</h1>
                    <p className="macos-text-md">Manage your class bookings and view history</p>
                </div>
                <button className="macos-btn macos-btn--primary">
                    <CalendarPlus size={16} /> Book Class
                </button>
            </motion.header>

            {/* Stats */}
            <motion.div className="bento-grid bento-grid--4col" variants={itemVariants}>
                <div className="glass-card glass-card--sm bookings__stat">
                    <span className="bookings__stat-label">Total</span>
                    <span className="bookings__stat-value">{stats.total}</span>
                </div>
                <div className="glass-card glass-card--sm bookings__stat">
                    <span className="bookings__stat-label">Upcoming</span>
                    <span className="bookings__stat-value bookings__stat-value--blue">{stats.upcoming}</span>
                </div>
                <div className="glass-card glass-card--sm bookings__stat">
                    <span className="bookings__stat-label">Completed</span>
                    <span className="bookings__stat-value bookings__stat-value--green">{stats.completed}</span>
                </div>
                <div className="glass-card glass-card--sm bookings__stat">
                    <span className="bookings__stat-label">Cancelled</span>
                    <span className="bookings__stat-value bookings__stat-value--red">{stats.cancelled}</span>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div className="bookings__tabs" variants={itemVariants}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`bookings__tab ${activeTab === tab.id ? 'bookings__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        <span className="bookings__tab-count">{tab.count}</span>
                    </button>
                ))}
            </motion.div>

            {/* Bookings List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="bookings__list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {filteredBookings.length === 0 ? (
                        <div className="glass-card glass-card--lg">
                            <div className="macos-empty-state">
                                <div className="macos-empty-state__icon">
                                    {activeTab === 'UPCOMING' ? <Calendar size={24} /> :
                                        activeTab === 'CANCELLED' ? <X size={24} /> : <CheckCircle2 size={24} />}
                                </div>
                                <div className="macos-empty-state__title">No {activeTab.toLowerCase()} bookings</div>
                                <div className="macos-empty-state__text">
                                    {activeTab === 'UPCOMING' ? "You don't have any upcoming classes booked." : "No records found."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        filteredBookings.map((booking, index) => {
                            const date = new Date(booking.bookingDate);
                            const isUpcoming = booking.status === 'BOOKED' && date >= new Date();

                            return (
                                <motion.div
                                    key={booking.id}
                                    className="glass-card bookings__card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="bookings__card-date">
                                        <span className="bookings__card-day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="bookings__card-num">{date.getDate()}</span>
                                        <span className="bookings__card-month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </div>

                                    <div className="bookings__card-icon">{booking.icon}</div>

                                    <div className="bookings__card-info">
                                        <div className="bookings__card-title">{booking.className}</div>
                                        <div className="bookings__card-meta">
                                            <span><Clock size={12} /> {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span><MapPin size={12} /> {booking.location}</span>
                                            <span>with {booking.trainerName}</span>
                                        </div>
                                    </div>

                                    <div className="bookings__card-actions">
                                        {isUpcoming ? (
                                            <>
                                                <button className="macos-btn macos-btn--ghost macos-btn--sm">
                                                    <CalendarPlus size={14} />
                                                </button>
                                                <button
                                                    className="macos-btn macos-btn--secondary macos-btn--sm"
                                                    onClick={() => handleCancel(booking.id)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`macos-badge ${booking.status === 'COMPLETED' ? 'macos-badge--green' : 'macos-badge--red'}`}>
                                                {booking.status === 'COMPLETED' ? 'Attended' : 'Cancelled'}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Summary */}
            {activeTab === 'UPCOMING' && stats.upcoming > 0 && (
                <motion.div className="glass-card glass-card--md bookings__summary" variants={itemVariants}>
                    <div className="bookings__summary-item">
                        <span>📊 Booking Summary</span>
                    </div>
                    <div className="bookings__summary-stats">
                        <span>Total: {stats.total}</span>
                        <span>Attendance Rate: {stats.total > 0 ? Math.round((stats.completed / (stats.completed + stats.cancelled)) * 100) : 0}%</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default MyBookings;
