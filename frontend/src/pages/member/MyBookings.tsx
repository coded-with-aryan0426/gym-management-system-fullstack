import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, X, CheckCircle2,
    CalendarPlus, User as UserIcon, Activity,
    TrendingUp, History, Info, ChevronLeft, ChevronRight,
    LayoutList, CalendarDays, Star, MessageSquare,
    RefreshCw, AlertTriangle, CheckCheck, XCircle,
    Timer, Repeat, Bell, ExternalLink, MoreHorizontal,
    ArrowRight, Zap, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { gymClassApi, ptSessionApi } from '../../services/api';
import type { AvailableSlotDTO } from '../../types/ptSession';
import '../../styles/macos-member.css';
import './MyBookings.css';

// ─── Types ───────────────────────────────────────────────────────────────────

enum BookingType {
    CLASS = 'CLASS',
    PT = 'PT'
}

type BookingStatus = 'BOOKED' | 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'WAITLISTED';
type TabType = 'UPCOMING' | 'IN_PROGRESS' | 'PAST' | 'WAITLIST' | 'CANCELLED';
type ViewMode = 'list' | 'calendar';

interface UnifiedBooking {
    id: number;
    title: string;
    type: BookingType;
    classType?: string;
    date: string;
    duration: number;
    trainerName: string;
    location: string;
    status: BookingStatus;
    originalId: number;
    bookedAt?: string;
    cancelledAt?: string;
    attended?: boolean;
    notes?: string;
    trainerId?: number;
    memberId?: number;
    rating?: number;
    review?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getClassTypeIcon = (classType?: string): React.ReactNode => {
    const t = classType?.toLowerCase() || '';
    if (t.includes('yoga')) return <Activity size={22} />;
    if (t.includes('hiit') || t.includes('cardio')) return <Zap size={22} />;
    if (t.includes('spin') || t.includes('cycle')) return <RefreshCw size={22} />;
    if (t.includes('box') || t.includes('martial')) return <Shield size={22} />;
    if (t.includes('swim')) return <Activity size={22} />;
    if (t.includes('dance')) return <Activity size={22} />;
    return <Activity size={22} />;
};

const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMs < 0) {
        const absMins = Math.abs(diffMins);
        if (absMins < 60) return `${absMins}m ago`;
        const absHours = Math.abs(diffHours);
        if (absHours < 24) return `${absHours}h ago`;
        return `${Math.abs(diffDays)}d ago`;
    }
    if (diffMins < 60) return `In ${diffMins}m`;
    if (diffHours < 24) return `In ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
        case 'BOOKED':
        case 'SCHEDULED':
            return { label: 'Confirmed', icon: <CheckCircle2 size={12} />, className: 'status--confirmed' };
        case 'CHECKED_IN':
            return { label: 'Checked In', icon: <CheckCheck size={12} />, className: 'status--checked-in' };
        case 'COMPLETED':
            return { label: 'Completed', icon: <CheckCircle2 size={12} />, className: 'status--completed' };
        case 'CANCELLED':
            return { label: 'Cancelled', icon: <XCircle size={12} />, className: 'status--cancelled' };
        case 'NO_SHOW':
            return { label: 'No Show', icon: <AlertTriangle size={12} />, className: 'status--no-show' };
        case 'WAITLISTED':
            return { label: 'Waitlisted', icon: <Timer size={12} />, className: 'status--waitlisted' };
        default:
            return { label: status, icon: null, className: '' };
    }
};

const canCancelFreely = (bookingDate: Date): boolean => {
    const now = new Date();
    const hoursUntil = (bookingDate.getTime() - now.getTime()) / 3600000;
    return hoursUntil >= 2;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

// Cancel Confirmation Modal
const CancelModal: React.FC<{
    booking: UnifiedBooking;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}> = ({ booking, onConfirm, onClose, loading }) => {
    const bookingDate = new Date(booking.date);
    const isFree = canCancelFreely(bookingDate);
    const hoursUntil = Math.max(0, Math.round((bookingDate.getTime() - Date.now()) / 3600000));

    return (
        <div className="bk-modal-overlay" onClick={onClose}>
            <motion.div
                className="bk-modal bk-cancel-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="bk-cancel-modal__icon">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="bk-cancel-modal__title">Cancel Booking?</h3>
                <p className="bk-cancel-modal__subtitle">
                    <strong>{booking.title}</strong><br />
                    {bookingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at{' '}
                    {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div className={`bk-cancel-modal__policy ${isFree ? 'bk-cancel-modal__policy--free' : 'bk-cancel-modal__policy--late'}`}>
                    <div className="bk-cancel-modal__policy-icon">
                        {isFree ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div>
                        <strong>{isFree ? 'Free Cancellation' : 'Late Cancellation'}</strong>
                        <p>
                            {isFree
                                ? `You have ${hoursUntil} hours until the session. Cancellations are free up to 2 hours before.`
                                : `This session starts in less than 2 hours. A late cancellation fee may apply per gym policy.`}
                        </p>
                    </div>
                </div>

                <div className="bk-cancel-modal__actions">
                    <button className="bk-btn bk-btn--ghost" onClick={onClose} disabled={loading}>
                        Keep Booking
                    </button>
                    <button className="bk-btn bk-btn--danger" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Booking Details Drawer
const BookingDrawer: React.FC<{
    booking: UnifiedBooking;
    onClose: () => void;
    onCancel: (b: UnifiedBooking) => void;
    onReschedule: (b: UnifiedBooking) => void;
    onRate: (b: UnifiedBooking) => void;
}> = ({ booking, onClose, onCancel, onReschedule, onRate }) => {
    const date = new Date(booking.date);
    const statusCfg = getStatusConfig(booking.status as BookingStatus);
    const isPast = booking.status === 'COMPLETED' || booking.status === 'NO_SHOW';
    const isUpcoming = booking.status === 'BOOKED' || booking.status === 'SCHEDULED';

    return (
        <div className="bk-drawer-overlay" onClick={onClose}>
            <motion.div
                className="bk-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="bk-drawer__header">
                    <h3>Booking Details</h3>
                    <button className="bk-drawer__close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="bk-drawer__body">
                    {/* Type & Status */}
                    <div className="bk-drawer__type-row">
                        <span className={`bk-drawer__type-badge bk-drawer__type-badge--${booking.type.toLowerCase()}`}>
                            {booking.type === BookingType.CLASS ? 'Group Class' : 'PT Session'}
                        </span>
                        <span className={`bk-status-pill ${statusCfg.className}`}>
                            {statusCfg.icon} {statusCfg.label}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="bk-drawer__title">{booking.title}</h2>
                    {booking.classType && (
                        <span className="bk-drawer__class-type">{booking.classType}</span>
                    )}

                    {/* Info Grid */}
                    <div className="bk-drawer__info-grid">
                        <div className="bk-drawer__info-item">
                            <Calendar size={16} />
                            <div>
                                <span className="label">Date</span>
                                <span className="value">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                        <div className="bk-drawer__info-item">
                            <Clock size={16} />
                            <div>
                                <span className="label">Time</span>
                                <span className="value">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.duration} min)</span>
                            </div>
                        </div>
                        <div className="bk-drawer__info-item">
                            <MapPin size={16} />
                            <div>
                                <span className="label">Location</span>
                                <span className="value">{booking.location}</span>
                            </div>
                        </div>
                        <div className="bk-drawer__info-item">
                            <UserIcon size={16} />
                            <div>
                                <span className="label">Trainer</span>
                                <span className="value">{booking.trainerName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Booked At */}
                    {booking.bookedAt && (
                        <div className="bk-drawer__meta">
                            <span>Booked on {new Date(booking.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    )}

                    {/* Check-in Status */}
                    {booking.attended !== undefined && (
                        <div className={`bk-drawer__checkin ${booking.attended ? 'bk-drawer__checkin--yes' : 'bk-drawer__checkin--no'}`}>
                            {booking.attended ? <CheckCheck size={18} /> : <XCircle size={18} />}
                            <span>{booking.attended ? 'Checked In' : 'Did Not Attend'}</span>
                        </div>
                    )}

                    {/* Notes */}
                    {booking.notes && (
                        <div className="bk-drawer__notes">
                            <h4><MessageSquare size={14} /> Notes</h4>
                            <p>{booking.notes}</p>
                        </div>
                    )}

                    {/* Rating (if already rated) */}
                    {booking.rating && (
                        <div className="bk-drawer__rating-display">
                            <h4>Your Rating</h4>
                            <div className="bk-stars">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={18} className={s <= booking.rating! ? 'bk-star--filled' : 'bk-star--empty'} />
                                ))}
                            </div>
                            {booking.review && <p className="bk-drawer__review-text">{booking.review}</p>}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="bk-drawer__footer">
                    {isUpcoming && (
                        <>
                            {booking.type === BookingType.PT && (
                                <button className="bk-btn bk-btn--secondary bk-btn--full" onClick={() => onReschedule(booking)}>
                                    <RefreshCw size={16} /> Reschedule
                                </button>
                            )}
                            <button className="bk-btn bk-btn--danger-outline bk-btn--full" onClick={() => onCancel(booking)}>
                                <X size={16} /> Cancel Booking
                            </button>
                        </>
                    )}
                    {isPast && !booking.rating && (
                        <button className="bk-btn bk-btn--primary bk-btn--full" onClick={() => onRate(booking)}>
                            <Star size={16} /> Rate This Session
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Reschedule Modal
const RescheduleModal: React.FC<{
    booking: UnifiedBooking;
    onClose: () => void;
    onConfirm: (slotDate: string, slotTime: string) => void;
    loading: boolean;
}> = ({ booking, onClose, onConfirm, loading }) => {
    const [selectedDate, setSelectedDate] = useState(new Date(booking.date).toISOString().split('T')[0]);
    const [slots, setSlots] = useState<AvailableSlotDTO[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const fetchSlots = useCallback(async () => {
        if (!booking.trainerId) return;
        setLoadingSlots(true);
        try {
            const data = await ptSessionApi.getAvailableSlots(booking.trainerId, selectedDate);
            setSlots(data.filter(s => s.isAvailable));
        } catch {
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [booking.trainerId, selectedDate]);

    useEffect(() => { fetchSlots(); }, [fetchSlots]);

    return (
        <div className="bk-modal-overlay" onClick={onClose}>
            <motion.div
                className="bk-modal bk-reschedule-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="bk-modal__header">
                    <h3><RefreshCw size={18} /> Reschedule Session</h3>
                    <button className="bk-drawer__close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="bk-reschedule-modal__body">
                    <p className="bk-reschedule-modal__current">
                        Current: <strong>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong> with {booking.trainerName}
                    </p>

                    <label className="bk-form-label">Pick a new date</label>
                    <input
                        type="date"
                        className="bk-form-input"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                    />

                    <label className="bk-form-label">Available Slots</label>
                    {loadingSlots ? (
                        <div className="bk-slots-loading">Loading available times...</div>
                    ) : slots.length === 0 ? (
                        <div className="bk-slots-empty">No available slots on this date</div>
                    ) : (
                        <div className="bk-slots-grid">
                            {slots.map((slot, i) => {
                                const time = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <button
                                        key={i}
                                        className={`bk-slot-btn ${selectedSlot === slot.startTime ? 'bk-slot-btn--active' : ''}`}
                                        onClick={() => setSelectedSlot(slot.startTime)}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bk-modal__footer">
                    <button className="bk-btn bk-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className="bk-btn bk-btn--primary"
                        disabled={!selectedSlot || loading}
                        onClick={() => selectedSlot && onConfirm(selectedDate, selectedSlot)}
                    >
                        {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Rate & Review Modal
const RateModal: React.FC<{
    booking: UnifiedBooking;
    onClose: () => void;
    onSubmit: (rating: number, review: string) => void;
    loading: boolean;
}> = ({ booking, onClose, onSubmit, loading }) => {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [review, setReview] = useState('');

    return (
        <div className="bk-modal-overlay" onClick={onClose}>
            <motion.div
                className="bk-modal bk-rate-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="bk-modal__header">
                    <h3><Star size={18} /> Rate Your Experience</h3>
                    <button className="bk-drawer__close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="bk-rate-modal__body">
                    <p className="bk-rate-modal__session-name">{booking.title}</p>
                    <p className="bk-rate-modal__trainer">with {booking.trainerName}</p>

                    <div className="bk-rate-modal__stars">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                className={`bk-star-btn ${s <= (hoveredStar || rating) ? 'bk-star-btn--active' : ''}`}
                                onClick={() => setRating(s)}
                                onMouseEnter={() => setHoveredStar(s)}
                                onMouseLeave={() => setHoveredStar(0)}
                            >
                                <Star size={32} />
                            </button>
                        ))}
                    </div>
                    <span className="bk-rate-modal__label">
                        {rating === 0 ? 'Tap a star' : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                    </span>

                    <textarea
                        className="bk-form-textarea"
                        placeholder="Share your experience (optional)..."
                        value={review}
                        onChange={e => setReview(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="bk-modal__footer">
                    <button className="bk-btn bk-btn--ghost" onClick={onClose} disabled={loading}>Skip</button>
                    <button
                        className="bk-btn bk-btn--primary"
                        disabled={rating === 0 || loading}
                        onClick={() => onSubmit(rating, review)}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Calendar View
const CalendarView: React.FC<{
    bookings: UnifiedBooking[];
    onSelectBooking: (b: UnifiedBooking) => void;
}> = ({ bookings, onSelectBooking }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const bookingsByDate = useMemo(() => {
        const map: Record<string, UnifiedBooking[]> = {};
        bookings.forEach(b => {
            const key = new Date(b.date).toISOString().split('T')[0];
            if (!map[key]) map[key] = [];
            map[key].push(b);
        });
        return map;
    }, [bookings]);

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const today = new Date();
    const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
        <div className="bk-calendar">
            <div className="bk-calendar__nav">
                <button className="bk-calendar__nav-btn" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
                    <ChevronLeft size={18} />
                </button>
                <h3 className="bk-calendar__month-title">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button className="bk-calendar__nav-btn" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="bk-calendar__weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bk-calendar__weekday">{d}</div>
                ))}
            </div>

            <div className="bk-calendar__grid">
                {days.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} className="bk-calendar__cell bk-calendar__cell--empty" />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayBookings = bookingsByDate[dateStr] || [];
                    return (
                        <div
                            key={day}
                            className={`bk-calendar__cell ${isToday(day) ? 'bk-calendar__cell--today' : ''} ${dayBookings.length > 0 ? 'bk-calendar__cell--has-bookings' : ''}`}
                        >
                            <span className="bk-calendar__day-num">{day}</span>
                            {dayBookings.length > 0 && (
                                <div className="bk-calendar__dots">
                                    {dayBookings.slice(0, 3).map((b, j) => (
                                        <button
                                            key={j}
                                            className={`bk-calendar__dot bk-calendar__dot--${b.type.toLowerCase()}`}
                                            title={b.title}
                                            onClick={() => onSelectBooking(b)}
                                        />
                                    ))}
                                    {dayBookings.length > 3 && (
                                        <span className="bk-calendar__dot-more">+{dayBookings.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Next Up Card
const NextUpCard: React.FC<{
    booking: UnifiedBooking;
    onClick: () => void;
}> = ({ booking, onClick }) => {
    const date = new Date(booking.date);
    return (
        <motion.div
            className={`bk-next-up bk-next-up--${booking.type.toLowerCase()}`}
            variants={itemVariants}
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
        >
            <div className="bk-next-up__badge">
                <Zap size={14} /> NEXT UP
            </div>
            <div className="bk-next-up__content">
                <div className="bk-next-up__icon">
                    {booking.type === BookingType.PT ? <UserIcon size={28} /> : getClassTypeIcon(booking.classType)}
                </div>
                <div className="bk-next-up__info">
                    <h3>{booking.title}</h3>
                    <div className="bk-next-up__meta">
                        <span><Clock size={14} /> {getRelativeTime(date)} &middot; {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span><MapPin size={14} /> {booking.location}</span>
                        <span><UserIcon size={14} /> {booking.trainerName}</span>
                    </div>
                </div>
                <div className="bk-next-up__arrow">
                    <ArrowRight size={20} />
                </div>
            </div>
        </motion.div>
    );
};

// Booking Card (Redesigned)
const BookingCard: React.FC<{
    booking: UnifiedBooking;
    onClick: () => void;
    onCancel: () => void;
    onReschedule: () => void;
    onRate: () => void;
    isUpcoming: boolean;
    isPast: boolean;
}> = ({ booking, onClick, onCancel, onReschedule, onRate, isUpcoming, isPast }) => {
    const date = new Date(booking.date);
    const statusCfg = getStatusConfig(booking.status as BookingStatus);
    const isCancelled = booking.status === 'CANCELLED';

    return (
        <motion.div
            className={`bk-card ${isCancelled ? 'bk-card--cancelled' : ''} ${isPast ? 'bk-card--past' : ''}`}
            layout
            onClick={onClick}
            whileHover={{ y: -2 }}
        >
            <div className={`bk-card__border bk-card__border--${booking.type.toLowerCase()}`} />

            <div className="bk-card__date-col">
                <span className="bk-card__weekday">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="bk-card__day">{date.getDate()}</span>
                <span className="bk-card__month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>

            <div className={`bk-card__icon bk-card__icon--${booking.type.toLowerCase()}`}>
                {booking.type === BookingType.PT ? <UserIcon size={22} /> : getClassTypeIcon(booking.classType)}
                <span className="bk-card__type-label">{booking.type}</span>
            </div>

            <div className="bk-card__body">
                <div className="bk-card__title-row">
                    <h3 className={isCancelled ? 'bk-card__title--strike' : ''}>{booking.title}</h3>
                    <span className={`bk-status-pill ${statusCfg.className}`}>
                        {statusCfg.icon} {statusCfg.label}
                    </span>
                </div>
                <div className="bk-card__meta">
                    <span><Clock size={13} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.duration}m) &middot; {getRelativeTime(date)}</span>
                    <span><MapPin size={13} /> {booking.location}</span>
                    <span><UserIcon size={13} /> {booking.trainerName}</span>
                </div>

                {/* Check-in indicator for past */}
                {isPast && booking.attended !== undefined && (
                    <div className={`bk-card__checkin ${booking.attended ? 'bk-card__checkin--yes' : 'bk-card__checkin--no'}`}>
                        {booking.attended ? <CheckCheck size={13} /> : <XCircle size={13} />}
                        <span>{booking.attended ? 'Checked In' : 'Not Attended'}</span>
                    </div>
                )}

                {/* Rating prompt for past unrated */}
                {isPast && !booking.rating && booking.status === 'COMPLETED' && (
                    <button className="bk-card__rate-prompt" onClick={e => { e.stopPropagation(); onRate(); }}>
                        <Star size={13} /> Rate this session
                    </button>
                )}
            </div>

            <div className="bk-card__actions" onClick={e => e.stopPropagation()}>
                {isUpcoming && (
                    <>
                        {booking.type === BookingType.PT && (
                            <button className="bk-btn bk-btn--ghost bk-btn--sm" onClick={onReschedule} title="Reschedule">
                                <RefreshCw size={15} />
                            </button>
                        )}
                        <button className="bk-btn bk-btn--danger-ghost bk-btn--sm" onClick={onCancel} title="Cancel">
                            <X size={15} />
                        </button>
                    </>
                )}
                <button className="bk-btn bk-btn--ghost bk-btn--sm" onClick={onClick} title="Details">
                    <MoreHorizontal size={15} />
                </button>
            </div>
        </motion.div>
    );
};

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

// ─── Main Component ──────────────────────────────────────────────────────────

const MyBookings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Modal states
    const [cancelTarget, setCancelTarget] = useState<UnifiedBooking | null>(null);
    const [drawerTarget, setDrawerTarget] = useState<UnifiedBooking | null>(null);
    const [rescheduleTarget, setRescheduleTarget] = useState<UnifiedBooking | null>(null);
    const [rateTarget, setRateTarget] = useState<UnifiedBooking | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const memberId = user?.userId || (user?.id ? Number(user.id) : null);

    const fetchAllBookings = useCallback(async () => {
        if (!memberId) { setLoading(false); return; }
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
                type: BookingType.CLASS,
                classType: cb.classType,
                date: cb.classStartTime,
                duration: cb.durationMinutes,
                trainerName: cb.trainerName || 'Staff',
                location: cb.location || 'Main Studio',
                status: (cb.status as BookingStatus) || 'BOOKED',
                bookedAt: cb.bookedAt,
                cancelledAt: cb.cancelledAt,
                attended: cb.attended,
                notes: cb.notes
            }));

            const unifiedPT: UnifiedBooking[] = ptSessions.map(pt => ({
                id: (pt.sessionId || 0) + 10000,
                originalId: pt.sessionId || 0,
                title: 'Personal Training',
                type: BookingType.PT,
                date: pt.sessionDate.toString(),
                duration: pt.durationMinutes,
                trainerName: pt.trainerName || 'Private Trainer',
                location: 'PT Area',
                status: (pt.status as BookingStatus) || 'SCHEDULED',
                trainerId: pt.trainerId,
                memberId: pt.memberId,
                notes: pt.progressNotes
            }));

            setBookings([...unifiedClasses, ...unifiedPT]);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { fetchAllBookings(); }, [fetchAllBookings]);

    // ─── Filtering ───────────────────────────────────────────────────────────

    const filteredBookings = useMemo(() => {
        const now = new Date();
        return bookings.filter(b => {
            const bDate = new Date(b.date);
            const isCancelled = b.status === 'CANCELLED';
            const isCompleted = b.status === 'COMPLETED' || b.status === 'NO_SHOW';
            const isWaitlisted = b.status === 'WAITLISTED';
            const isPast = !isCancelled && !isWaitlisted && bDate < now && !isCompleted;
            const isInProgress = !isCancelled && !isWaitlisted && bDate <= now && bDate >= new Date(now.getTime() - 2 * 3600000) && !isCompleted;

            switch (activeTab) {
                case 'UPCOMING': return !isCancelled && !isCompleted && !isWaitlisted && bDate >= now;
                case 'IN_PROGRESS': return isInProgress;
                case 'PAST': return isCompleted || isPast;
                case 'WAITLIST': return isWaitlisted;
                case 'CANCELLED': return isCancelled;
                default: return false;
            }
        }).sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return activeTab === 'UPCOMING' ? da - db : db - da;
        });
    }, [bookings, activeTab]);

    const stats = useMemo(() => {
        const now = new Date();
        const upcoming = bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'WAITLISTED' && new Date(b.date) >= now);
        const thisWeek = upcoming.filter(b => {
            const d = new Date(b.date);
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return d <= weekEnd;
        });
        return {
            total: bookings.length,
            upcoming: upcoming.length,
            thisWeek: thisWeek.length,
            completed: bookings.filter(b => b.status === 'COMPLETED' || (b.status !== 'CANCELLED' && b.status !== 'WAITLISTED' && new Date(b.date) < now)).length,
            cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
            waitlisted: bookings.filter(b => b.status === 'WAITLISTED').length,
            pt: bookings.filter(b => b.type === BookingType.PT && b.status !== 'CANCELLED').length,
            classes: bookings.filter(b => b.type === BookingType.CLASS && b.status !== 'CANCELLED').length
        };
    }, [bookings]);

    const nextBooking = useMemo(() => {
        const now = new Date();
        return bookings
            .filter(b => b.status !== 'CANCELLED' && b.status !== 'WAITLISTED' && new Date(b.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;
    }, [bookings]);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleCancelConfirm = async () => {
        if (!cancelTarget || !memberId) return;
        setActionLoading(true);
        try {
            if (cancelTarget.type === BookingType.CLASS) {
                await gymClassApi.cancelBooking(cancelTarget.originalId, memberId);
            } else {
                await ptSessionApi.cancelSession(cancelTarget.originalId);
            }
            toast.success('Booking cancelled successfully');
            setCancelTarget(null);
            setDrawerTarget(null);
            fetchAllBookings();
        } catch {
            toast.error('Failed to cancel booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRescheduleConfirm = async (date: string, slotTime: string) => {
        if (!rescheduleTarget) return;
        setActionLoading(true);
        try {
            await ptSessionApi.updateSession(rescheduleTarget.originalId, {
                ...({} as any),
                trainerId: rescheduleTarget.trainerId!,
                memberId: rescheduleTarget.memberId!,
                sessionDate: slotTime,
                durationMinutes: rescheduleTarget.duration,
                status: 'SCHEDULED'
            });
            toast.success('Session rescheduled!');
            setRescheduleTarget(null);
            setDrawerTarget(null);
            fetchAllBookings();
        } catch {
            toast.error('Failed to reschedule');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRateSubmit = async (rating: number, review: string) => {
        if (!rateTarget) return;
        setActionLoading(true);
        // Store rating locally since no backend endpoint yet
        try {
            setBookings(prev => prev.map(b =>
                b.id === rateTarget.id ? { ...b, rating, review } : b
            ));
            toast.success('Thanks for your review!');
            setRateTarget(null);
            setDrawerTarget(null);
        } finally {
            setActionLoading(false);
        }
    };

    // ─── Tabs config ─────────────────────────────────────────────────────────

    const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
        { key: 'UPCOMING', label: 'Upcoming', icon: <Clock size={15} />, count: stats.upcoming },
        { key: 'IN_PROGRESS', label: 'In Progress', icon: <Activity size={15} />, count: 0 },
        { key: 'PAST', label: 'Past', icon: <History size={15} />, count: stats.completed },
        { key: 'WAITLIST', label: 'Waitlist', icon: <Timer size={15} />, count: stats.waitlisted },
        { key: 'CANCELLED', label: 'Cancelled', icon: <XCircle size={15} />, count: stats.cancelled },
    ];

    // ─── Render ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="macos-page bk-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="bk-loading__spinner"
                />
                <p className="bk-loading__text">Synchronizing your schedule...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="macos-page bk-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="bk-header" variants={itemVariants}>
                <div className="bk-header__info">
                    <h1>My Bookings</h1>
                    <p>Track and manage your fitness journey</p>
                </div>
                <div className="bk-header__actions">
                    <div className="bk-view-toggle">
                        <button
                            className={`bk-view-toggle__btn ${viewMode === 'list' ? 'bk-view-toggle__btn--active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <LayoutList size={16} />
                        </button>
                        <button
                            className={`bk-view-toggle__btn ${viewMode === 'calendar' ? 'bk-view-toggle__btn--active' : ''}`}
                            onClick={() => setViewMode('calendar')}
                            title="Calendar View"
                        >
                            <CalendarDays size={16} />
                        </button>
                    </div>
                    <button
                        className="bk-btn bk-btn--primary"
                        onClick={() => navigate('/member/classes')}
                    >
                        <CalendarPlus size={16} />
                        <span>Book Class</span>
                    </button>
                </div>
            </motion.header>

            {/* Weekly Summary */}
            {stats.thisWeek > 0 && (
                <motion.div className="bk-week-summary" variants={itemVariants}>
                    <Activity size={16} />
                    <span>You have <strong>{stats.thisWeek} session{stats.thisWeek !== 1 ? 's' : ''}</strong> this week</span>
                </motion.div>
            )}

            {/* Stats */}
            <motion.div className="bk-stats" variants={itemVariants}>
                <div className="bk-stat" style={{ '--stat-accent': '#007AFF' } as any}>
                    <span className="bk-stat__value">{stats.upcoming}</span>
                    <span className="bk-stat__label">Upcoming</span>
                </div>
                <div className="bk-stat" style={{ '--stat-accent': '#34C759' } as any}>
                    <span className="bk-stat__value">{stats.completed}</span>
                    <span className="bk-stat__label">Completed</span>
                </div>
                <div className="bk-stat" style={{ '--stat-accent': '#AF52DE' } as any}>
                    <span className="bk-stat__value">{stats.pt}</span>
                    <span className="bk-stat__label">PT Sessions</span>
                </div>
                <div className="bk-stat" style={{ '--stat-accent': '#FF9500' } as any}>
                    <span className="bk-stat__value">{stats.classes}</span>
                    <span className="bk-stat__label">Classes</span>
                </div>
            </motion.div>

            {/* Next Up */}
            {nextBooking && activeTab === 'UPCOMING' && viewMode === 'list' && (
                <NextUpCard booking={nextBooking} onClick={() => setDrawerTarget(nextBooking)} />
            )}

            {/* Tabs */}
            <motion.div className="bk-tabs" variants={itemVariants}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`bk-tabs__btn ${activeTab === tab.key ? 'bk-tabs__btn--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.count > 0 && <span className="bk-tabs__count">{tab.count}</span>}
                    </button>
                ))}
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {viewMode === 'calendar' ? (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <CalendarView bookings={bookings} onSelectBooking={b => setDrawerTarget(b)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        className="bk-list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        {filteredBookings.length === 0 ? (
                            <div className="bk-empty">
                                <div className="bk-empty__icon">
                                    {activeTab === 'UPCOMING' ? <CalendarPlus size={44} /> : <Info size={44} />}
                                </div>
                                <h3>No {activeTab.toLowerCase().replace('_', ' ')} bookings</h3>
                                <p>
                                    {activeTab === 'UPCOMING'
                                        ? "You don't have any upcoming sessions. Time to book one!"
                                        : "Nothing here yet."}
                                </p>
                                {activeTab === 'UPCOMING' && (
                                    <button className="bk-btn bk-btn--primary" onClick={() => navigate('/member/classes')}>
                                        Browse Classes <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredBookings.map(booking => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onClick={() => setDrawerTarget(booking)}
                                    onCancel={() => setCancelTarget(booking)}
                                    onReschedule={() => setRescheduleTarget(booking)}
                                    onRate={() => setRateTarget(booking)}
                                    isUpcoming={activeTab === 'UPCOMING'}
                                    isPast={activeTab === 'PAST'}
                                />
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {cancelTarget && (
                    <CancelModal
                        booking={cancelTarget}
                        onConfirm={handleCancelConfirm}
                        onClose={() => setCancelTarget(null)}
                        loading={actionLoading}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {drawerTarget && (
                    <BookingDrawer
                        booking={drawerTarget}
                        onClose={() => setDrawerTarget(null)}
                        onCancel={b => { setDrawerTarget(null); setCancelTarget(b); }}
                        onReschedule={b => { setDrawerTarget(null); setRescheduleTarget(b); }}
                        onRate={b => { setDrawerTarget(null); setRateTarget(b); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {rescheduleTarget && (
                    <RescheduleModal
                        booking={rescheduleTarget}
                        onClose={() => setRescheduleTarget(null)}
                        onConfirm={handleRescheduleConfirm}
                        loading={actionLoading}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {rateTarget && (
                    <RateModal
                        booking={rateTarget}
                        onClose={() => setRateTarget(null)}
                        onSubmit={handleRateSubmit}
                        loading={actionLoading}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyBookings;
