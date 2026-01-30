import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, X, CheckCircle2,
    CalendarPlus, User as UserIcon, Activity,
    TrendingUp, History, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { gymClassApi, ptSessionApi } from '../../services/api';
import '../../styles/macos-member.css';
import './MyBookings.css';

interface UnifiedBooking {
    id: number;
    title: string;
    type: 'CLASS' | 'PT';
    date: string;
    duration: number;
    trainerName: string;
    location: string;
    status: string;
    icon: string;
    originalId: number; // The actual ID from the backend (bookingId or sessionId)
}

type TabType = 'UPCOMING' | 'HISTORY' | 'CANCELLED';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const MyBookings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');

    const memberId = user?.userId || (user?.id ? Number(user.id) : null);

    const fetchAllBookings = async () => {
        if (!memberId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [classBookings, ptSessions] = await Promise.all([
                gymClassApi.getMemberBookings(memberId),
                ptSessionApi.getMemberSessions(memberId)
            ]);

            const unifiedClasses: UnifiedBooking[] = classBookings.map(cb => ({
                id: cb.bookingId,
                originalId: cb.bookingId,
                title: cb.className,
                type: 'CLASS',
                date: cb.classStartTime,
                duration: cb.durationMinutes,
                trainerName: cb.trainerName || 'Staff',
                location: cb.location || 'Main Studio',
                status: cb.status, // BOOKED, COMPLETED, CANCELLED
                icon: getClassIcon(cb.classType)
            }));

            const unifiedPT: UnifiedBooking[] = ptSessions.map(pt => ({
                id: pt.sessionId + 10000, // Offset to avoid ID collision
                originalId: pt.sessionId,
                title: 'Personal Training Session',
                type: 'PT',
                date: pt.sessionDate.toString(),
                duration: pt.durationMinutes,
                trainerName: pt.trainerName || 'Private Trainer',
                location: 'PT Area',
                status: pt.status || 'SCHEDULED', // SCHEDULED, COMPLETED, CANCELLED
                icon: '💪'
            }));

            setBookings([...unifiedClasses, ...unifiedPT]);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllBookings();
    }, [memberId]);

    const getClassIcon = (type?: string) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('yoga')) return '🧘';
        if (t.includes('hiit')) return '🏃';
        if (t.includes('spin') || t.includes('cycle')) return '🚴';
        if (t.includes('dance')) return '💃';
        if (t.includes('box')) return '🥊';
        if (t.includes('swim')) return '🏊';
        return '🏋️';
    };

    const handleCancel = async (booking: UnifiedBooking) => {
        try {
            if (booking.type === 'CLASS') {
                await gymClassApi.cancelBooking(booking.originalId, memberId);
            } else {
                await ptSessionApi.cancelSession(booking.originalId);
            }
            toast.success('Booking cancelled successfully');
            fetchAllBookings();
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const filteredBookings = useMemo(() => {
        const now = new Date();
        return bookings.filter(b => {
            const bookingDate = new Date(b.date);
            const isCancelled = b.status === 'CANCELLED';
            const isCompleted = b.status === 'COMPLETED' || (b.status !== 'CANCELLED' && bookingDate < now);

            if (activeTab === 'CANCELLED') return isCancelled;
            if (activeTab === 'HISTORY') return isCompleted;
            if (activeTab === 'UPCOMING') return !isCancelled && !isCompleted;
            return false;
        }).sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return activeTab === 'UPCOMING' ? dateA - dateB : dateB - dateA;
        });
    }, [bookings, activeTab]);

    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: bookings.length,
            upcoming: bookings.filter(b => b.status !== 'CANCELLED' && new Date(b.date) >= now).length,
            completed: bookings.filter(b => b.status === 'COMPLETED' || (b.status !== 'CANCELLED' && new Date(b.date) < now)).length,
            cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
            ptCount: bookings.filter(b => b.type === 'PT').length,
            classCount: bookings.filter(b => b.type === 'CLASS').length
        };
    }, [bookings]);

    if (loading) {
        return (
            <div className="macos-page flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-macos-accent/30 border-t-macos-accent rounded-full"
                    />
                    <p className="text-macos-text-secondary font-medium animate-pulse">Synchronizing your schedule...</p>
                </div>
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
            {/* Header Section */}
            <motion.header className="bookings__header" variants={itemVariants}>
                <div className="bookings__header-info">
                    <h1>My Bookings</h1>
                    <p>Track and manage your fitness journey</p>
                </div>
                <button
                    className="macos-btn macos-btn--primary flex items-center gap-2"
                    onClick={() => navigate('/member/classes')}
                >
                    <CalendarPlus size={18} />
                    <span>Book New Class</span>
                </button>
            </motion.header>

            {/* Stats Dashboard */}
            <motion.div className="bookings__stats-container" variants={itemVariants}>
                <div className="glass-card bookings__stat-card" style={{ '--stat-color': '#007aff' } as any}>
                    <span className="bookings__stat-label">Upcoming</span>
                    <span className="bookings__stat-value">{stats.upcoming}</span>
                    <div className="bookings__stat-trend text-macos-accent">
                        <Activity size={12} /> Next: {filteredBookings[0] ? new Date(filteredBookings[0].date).toLocaleDateString() : 'None'}
                    </div>
                </div>
                <div className="glass-card bookings__stat-card" style={{ '--stat-color': '#34c759' } as any}>
                    <span className="bookings__stat-label">Completed</span>
                    <span className="bookings__stat-value">{stats.completed}</span>
                    <div className="bookings__stat-trend text-macos-success">
                        <CheckCircle2 size={12} /> Keep it up!
                    </div>
                </div>
                <div className="glass-card bookings__stat-card" style={{ '--stat-color': '#ff9500' } as any}>
                    <span className="bookings__stat-label">PT Sessions</span>
                    <span className="bookings__stat-value">{stats.ptCount}</span>
                    <div className="bookings__stat-trend text-[#ff9500]">
                        <UserIcon size={12} /> Private Coaching
                    </div>
                </div>
                <div className="glass-card bookings__stat-card" style={{ '--stat-color': '#ff3b30' } as any}>
                    <span className="bookings__stat-label">Cancelled</span>
                    <span className="bookings__stat-value">{stats.cancelled}</span>
                    <div className="bookings__stat-trend text-macos-error">
                        <History size={12} /> History
                    </div>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div className="bookings__tabs-nav" variants={itemVariants}>
                {(['UPCOMING', 'HISTORY', 'CANCELLED'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        className={`bookings__tab-btn ${activeTab === tab ? 'bookings__tab-btn--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'UPCOMING' && <Clock size={16} />}
                        {tab === 'HISTORY' && <History size={16} />}
                        {tab === 'CANCELLED' && <X size={16} />}
                        <span>{tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                        <span className="bookings__tab-count">
                            {tab === 'UPCOMING' ? stats.upcoming : tab === 'HISTORY' ? stats.completed : stats.cancelled}
                        </span>
                    </button>
                ))}
            </motion.div>

            {/* Bookings Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="bookings__list-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredBookings.length === 0 ? (
                        <div className="glass-card bookings__empty">
                            <div className="bookings__empty-icon">
                                <Info size={40} />
                            </div>
                            <h3>No {activeTab.toLowerCase()} bookings</h3>
                            <p>You don't have any bookings in this category yet. Start your journey today!</p>
                            {activeTab === 'UPCOMING' && (
                                <button
                                    className="macos-btn macos-btn--secondary mt-4"
                                    onClick={() => navigate('/member/classes')}
                                >
                                    Explore Classes
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredBookings.map((booking) => {
                            const date = new Date(booking.date);
                            const isUpcoming = activeTab === 'UPCOMING';

                            return (
                                <motion.div
                                    key={booking.id}
                                    className="glass-card booking-card"
                                    layout
                                >
                                    <div className="booking-card__date-box">
                                        <span className="booking-card__day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="booking-card__day-num">{date.getDate()}</span>
                                        <span className="booking-card__month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </div>

                                    <div className="booking-card__type-icon">
                                        {booking.icon}
                                        <span className={`booking-card__type-badge ${booking.type === 'PT' ? 'booking-card__type-badge--pt' : ''}`}>
                                            {booking.type}
                                        </span>
                                    </div>

                                    <div className="booking-card__content">
                                        <div className="booking-card__title-row">
                                            <h3 className="booking-card__title">{booking.title}</h3>
                                            <span className={`status-badge status-badge--${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="booking-card__meta">
                                            <div className="booking-card__meta-item">
                                                <Clock size={14} />
                                                <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.duration}m)</span>
                                            </div>
                                            <div className="booking-card__meta-item">
                                                <MapPin size={14} />
                                                <span>{booking.location}</span>
                                            </div>
                                            <div className="booking-card__meta-item">
                                                <UserIcon size={14} />
                                                <span>{booking.trainerName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="booking-card__actions">
                                        {isUpcoming ? (
                                            <button
                                                className="macos-btn macos-btn--secondary macos-btn--sm"
                                                onClick={() => handleCancel(booking)}
                                            >
                                                Cancel
                                            </button>
                                        ) : (
                                            <button className="macos-btn macos-btn--ghost macos-btn--sm">
                                                View Details
                                            </button>
                                        )}
                                        <button className="macos-btn macos-btn--ghost macos-btn--sm p-2">
                                            <Info size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default MyBookings;
