import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, List, Clock, MapPin,
    Users, ChevronLeft, ChevronRight, Heart, Zap,
    Dumbbell, Bike, Sparkles, Target, User, CalendarDays,
    Loader2, AlertCircle, CheckCircle2, CalendarCheck, Flame,
    X, Star, Download, Bell, Info, Timer,
    UserCircle, Award, TrendingUp, Grid3X3, SlidersHorizontal,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { gymClassApi } from '../../services/api';
import type { GymClassDTO } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonCard } from '../../components/ui/Skeleton';
import '../../styles/macos-member.css';
import './AvailableClasses.css';

/* ────────────── constants ────────────── */

const CLASS_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; gradient: string }> = {
    'Yoga':       { icon: <Heart size={16} />,    color: '#34C759', bg: 'rgba(52,199,89,0.14)',   gradient: 'linear-gradient(135deg,#34C759 0%,#30D158 100%)' },
    'HIIT':       { icon: <Zap size={16} />,      color: '#FF3B30', bg: 'rgba(255,59,48,0.14)',   gradient: 'linear-gradient(135deg,#FF3B30 0%,#FF6961 100%)' },
    'Strength':   { icon: <Dumbbell size={16} />, color: '#007AFF', bg: 'rgba(0,122,255,0.14)',   gradient: 'linear-gradient(135deg,#007AFF 0%,#5AC8FA 100%)' },
    'Spin':       { icon: <Bike size={16} />,     color: '#AF52DE', bg: 'rgba(175,82,222,0.14)',  gradient: 'linear-gradient(135deg,#AF52DE 0%,#BF5AF2 100%)' },
    'Pilates':    { icon: <Sparkles size={16} />, color: '#5AC8FA', bg: 'rgba(90,200,250,0.14)',  gradient: 'linear-gradient(135deg,#5AC8FA 0%,#64D2FF 100%)' },
    'Boxing':     { icon: <Target size={16} />,   color: '#FF9500', bg: 'rgba(255,149,0,0.14)',   gradient: 'linear-gradient(135deg,#FF9500 0%,#FFCC00 100%)' },
    'PT Session': { icon: <User size={16} />,     color: '#5856D6', bg: 'rgba(88,86,214,0.14)',   gradient: 'linear-gradient(135deg,#5856D6 0%,#AF52DE 100%)' },
    'Group':      { icon: <Users size={16} />,    color: '#FF2D55', bg: 'rgba(255,45,85,0.14)',   gradient: 'linear-gradient(135deg,#FF2D55 0%,#FF6482 100%)' },
    'CrossFit':   { icon: <Flame size={16} />,    color: '#FF6B35', bg: 'rgba(255,107,53,0.14)',  gradient: 'linear-gradient(135deg,#FF6B35 0%,#FF9500 100%)' },
};

const DEFAULT_CONFIG = { icon: <Sparkles size={16} />, color: '#8E8E93', bg: 'rgba(142,142,147,0.14)', gradient: 'linear-gradient(135deg,#8E8E93 0%,#AEAEB2 100%)' };

const DIFFICULTY_MAP: Record<string, { label: string; cls: string }> = {
    'Beginner':     { label: 'Beginner',     cls: 'badge--success' },
    'Intermediate': { label: 'Intermediate', cls: 'badge--warning' },
    'Advanced':     { label: 'Advanced',     cls: 'badge--danger'  },
};

const TIME_FILTERS = [
    { key: 'all',       label: 'All Day'   },
    { key: 'morning',   label: 'Morning',   range: [0,  12] },
    { key: 'afternoon', label: 'Afternoon', range: [12, 17] },
    { key: 'evening',   label: 'Evening',   range: [17, 24] },
] as const;

type ViewMode   = 'list' | 'weekly' | 'monthly';
type TimeFilter = typeof TIME_FILTERS[number]['key'];

/* ────────────── helpers ────────────── */

const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const isToday    = (date: Date) => date.toDateString() === new Date().toDateString();

const getRelativeTime = (dateStr: string) => {
    const diffMs  = new Date(dateStr).getTime() - Date.now();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 0)   return 'Started';
    if (diffMin < 60)  return `In ${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24)  return `In ${diffHrs}h`;
    return `In ${Math.floor(diffHrs / 24)}d`;
};

const isStartingSoon = (dateStr: string) => {
    const diffMs = new Date(dateStr).getTime() - Date.now();
    return diffMs > 0 && diffMs < 30 * 60 * 1000;
};

const getConfig = (type: string) => CLASS_TYPE_CONFIG[type] || DEFAULT_CONFIG;

const generateICS = (c: GymClassDTO) => {
    const start = new Date(c.startTime);
    const end   = new Date(start.getTime() + c.durationMinutes * 60000);
    const fmt   = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${c.classType} - ${c.className}\nLOCATION:${c.location || ''}\nDESCRIPTION:Trainer: ${c.trainerName || 'TBA'}\\nDifficulty: ${c.difficulty || 'All levels'}\nEND:VEVENT\nEND:VCALENDAR`;
};

const downloadICS = (c: GymClassDTO) => {
    const blob = new Blob([generateICS(c)], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${c.classType.replace(/\s/g, '_')}_${formatDate(c.startTime).replace(/\s/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar event downloaded');
};

const FAVORITES_KEY  = (uid: number | string) => `gym_class_favorites_${uid}`;
const loadFavorites  = (uid: number): Set<number> => {
    try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY(uid)) || '[]')); } catch { return new Set(); }
};
const saveFavorites  = (uid: number, favs: Set<number>) => {
    localStorage.setItem(FAVORITES_KEY(uid), JSON.stringify([...favs]));
};

/* ────────────── animation variants ────────────── */

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants       = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

/* ── Capacity Bar ── */
const CapacityBar: React.FC<{ current: number; max: number; spotsLeft: number }> = ({ current, max, spotsLeft }) => {
    const pct    = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const isFull = spotsLeft <= 0;
    const isLow  = spotsLeft > 0 && spotsLeft <= 3;
    return (
        <div className="capacity-bar">
            <div className="capacity-bar__track">
                <div className={`capacity-bar__fill ${isFull ? 'capacity-bar__fill--full' : isLow ? 'capacity-bar__fill--low' : ''}`}
                    style={{ width: `${pct}%` }} />
            </div>
            <span className={`capacity-bar__label ${isFull ? 'capacity-bar__label--full' : isLow ? 'capacity-bar__label--low' : ''}`}>
                {isFull ? 'Full' : `${spotsLeft} left`}
            </span>
        </div>
    );
};

/* ── Trainer Preview Popup ── */
const TrainerPreview: React.FC<{ name: string; onClose: () => void }> = ({ name, onClose }) => (
    <motion.div className="trainer-preview"
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.15 }}>
        <div className="trainer-preview__header">
            <div className="trainer-preview__avatar"><UserCircle size={32} /></div>
            <div>
                <h4 className="trainer-preview__name">{name}</h4>
                <span className="trainer-preview__role">Certified Trainer</span>
            </div>
            <button className="trainer-preview__close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="trainer-preview__stats">
            <div className="trainer-preview__stat"><Award size={12} /><span>Certified</span></div>
            <div className="trainer-preview__stat"><Star size={12} /><span>4.8★</span></div>
            <div className="trainer-preview__stat"><TrendingUp size={12} /><span>200+ sessions</span></div>
        </div>
    </motion.div>
);

/* ── Class Detail Modal ── */
const ClassDetailModal: React.FC<{
    classItem: GymClassDTO;
    onClose: () => void;
    onBook: (id: number) => void;
    onWaitlist: (id: number) => void;
    isBooking: boolean;
    isFavorite: boolean;
    onToggleFav: () => void;
    onCancel?: (bookingId: number) => void;
    memberId?: number;
}> = ({ classItem, onClose, onBook, onWaitlist, isBooking, isFavorite, onToggleFav, onCancel }) => {
    const config = getConfig(classItem.classType);
    const isFull = classItem.spotsLeft <= 0;
    const isWL   = classItem.isWaitlisted;
    const diff   = DIFFICULTY_MAP[classItem.difficulty || ''];

    return (
        <motion.div className="ac-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}>
            <motion.div className="ac-modal"
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                onClick={e => e.stopPropagation()}>

                {/* Hero */}
                <div className="ac-modal__hero" style={{ background: config.gradient }}>
                    <button className="ac-modal__close" onClick={onClose}><X size={16} /></button>
                    <button className={`ac-modal__fav ${isFavorite ? 'ac-modal__fav--active' : ''}`} onClick={onToggleFav}>
                        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <div className="ac-modal__hero-icon">{config.icon}</div>
                    <h2 className="ac-modal__hero-title">{classItem.className || classItem.classType}</h2>
                    <div className="ac-modal__hero-meta">
                        <span className="ac-modal__hero-type">{classItem.classType}</span>
                        {diff && <span className={`ac-modal__hero-badge ${diff.cls}`}>{diff.label}</span>}
                        {isStartingSoon(classItem.startTime) && (
                            <span className="ac-modal__soon-badge"><Timer size={11} /> Starting Soon</span>
                        )}
                    </div>
                </div>

                <div className="ac-modal__body">
                    {/* Details grid */}
                    <div className="ac-modal__details-grid">
                        <div className="ac-modal__detail">
                            <Calendar size={14} />
                            <div>
                                <span className="ac-modal__detail-label">Date</span>
                                <span className="ac-modal__detail-value">{formatDate(classItem.startTime)}</span>
                            </div>
                        </div>
                        <div className="ac-modal__detail">
                            <Clock size={14} />
                            <div>
                                <span className="ac-modal__detail-label">Time</span>
                                <span className="ac-modal__detail-value">{formatTime(classItem.startTime)} · {classItem.durationMinutes}m</span>
                            </div>
                        </div>
                        {classItem.location && (
                            <div className="ac-modal__detail">
                                <MapPin size={14} />
                                <div>
                                    <span className="ac-modal__detail-label">Location</span>
                                    <span className="ac-modal__detail-value">{classItem.location}</span>
                                </div>
                            </div>
                        )}
                        <div className="ac-modal__detail">
                            <Users size={14} />
                            <div>
                                <span className="ac-modal__detail-label">Capacity</span>
                                <span className="ac-modal__detail-value">{classItem.currentBookings}/{classItem.maxCapacity} booked</span>
                            </div>
                        </div>
                    </div>

                    {/* Trainer */}
                    {classItem.trainerName && (
                        <div className="ac-modal__trainer">
                            <div className="ac-modal__trainer-avatar"><UserCircle size={36} /></div>
                            <div className="ac-modal__trainer-info">
                                <span className="ac-modal__trainer-name">{classItem.trainerName}</span>
                                <span className="ac-modal__trainer-role">Instructor</span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {classItem.description && (
                        <div className="ac-modal__desc">
                            <h4>About this class</h4>
                            <p>{classItem.description}</p>
                        </div>
                    )}

                    {/* Capacity bar */}
                    <div className="ac-modal__capacity">
                        <CapacityBar current={classItem.currentBookings} max={classItem.maxCapacity} spotsLeft={classItem.spotsLeft} />
                    </div>

                    {/* Policy */}
                    <div className="ac-modal__policy">
                        <Info size={13} />
                        <span>Free cancellation up to 2 hours before class start time</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="ac-modal__footer">
                    <button className="ac-modal__ics-btn" onClick={() => downloadICS(classItem)}>
                        <Download size={14} /> Export .ics
                    </button>
                    {classItem.isBooked ? (
                        <div className="ac-modal__booked-actions">
                            <button className="ac-modal__book-btn ac-modal__book-btn--booked" disabled>
                                <CheckCircle2 size={16} /> Booked
                            </button>
                            {onCancel && classItem.bookingId && (
                                <button className="ac-modal__book-btn ac-modal__book-btn--cancel"
                                    onClick={() => { onCancel(classItem.bookingId!); onClose(); }}>
                                    <X size={15} /> Cancel
                                </button>
                            )}
                        </div>
                    ) : isWL ? (
                        <button className="ac-modal__book-btn ac-modal__book-btn--waitlist" disabled>
                            <Bell size={16} /> On Waitlist
                        </button>
                    ) : isFull ? (
                        <button className="ac-modal__book-btn ac-modal__book-btn--waitlist"
                            onClick={() => onWaitlist(classItem.classId)}>
                            <Bell size={16} /> Join Waitlist
                        </button>
                    ) : (
                        <button className="ac-modal__book-btn" onClick={() => onBook(classItem.classId)} disabled={isBooking}>
                            {isBooking ? <><Loader2 size={16} className="spin" /> Booking...</> : 'Book This Class'}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ── Monthly Calendar ── */
const MonthlyCalendar: React.FC<{
    classes: GymClassDTO[];
    month: Date;
    onChangeMonth: (dir: number) => void;
    onSelectClass: (c: GymClassDTO) => void;
    favorites: Set<number>;
}> = ({ classes, month, onChangeMonth, onSelectClass }) => {
    const year       = month.getFullYear();
    const m          = month.getMonth();
    const firstDay   = new Date(year, m, 1).getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    const classMap = useMemo(() => {
        const map: Record<string, GymClassDTO[]> = {};
        classes.forEach(c => {
            const d = new Date(c.startTime);
            if (d.getMonth() === m && d.getFullYear() === year) {
                const key = d.getDate().toString();
                if (!map[key]) map[key] = [];
                map[key].push(c);
            }
        });
        return map;
    }, [classes, m, year]);

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const todayDate  = new Date();
    const isTodayCell = (day: number) =>
        todayDate.getFullYear() === year && todayDate.getMonth() === m && todayDate.getDate() === day;

    return (
        <div className="monthly-cal">
            <div className="monthly-cal__nav">
                <button className="monthly-cal__nav-btn" onClick={() => onChangeMonth(-1)}><ChevronLeft size={18} /></button>
                <span className="monthly-cal__nav-label">
                    {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button className="monthly-cal__nav-btn" onClick={() => onChangeMonth(1)}><ChevronRight size={18} /></button>
            </div>
            <div className="monthly-cal__weekdays">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="monthly-cal__weekday">{d}</div>
                ))}
            </div>
            <div className="monthly-cal__grid">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="monthly-cal__cell monthly-cal__cell--empty" />;
                    const dayClasses = classMap[day.toString()] || [];
                    return (
                        <div key={day}
                            className={`monthly-cal__cell${isTodayCell(day) ? ' monthly-cal__cell--today' : ''}${dayClasses.length > 0 ? ' monthly-cal__cell--has-classes' : ''}`}>
                            <span className="monthly-cal__day-num">{day}</span>
                            {dayClasses.length > 0 && (
                                <div className="monthly-cal__dots">
                                    {dayClasses.slice(0, 4).map(c => {
                                        const cfg = getConfig(c.classType);
                                        return (
                                            <button key={c.classId}
                                                className={`monthly-cal__dot ${c.isBooked ? 'monthly-cal__dot--booked' : 'monthly-cal__dot--available'}`}
                                                style={c.isBooked ? undefined : { background: cfg.color, borderColor: cfg.color }}
                                                onClick={() => onSelectClass(c)}
                                                title={`${c.classType} ${formatTime(c.startTime)} — ${c.isBooked ? 'Booked' : 'Available'}`}
                                            />
                                        );
                                    })}
                                    {dayClasses.length > 4 && (
                                        <span className="monthly-cal__more">+{dayClasses.length - 4}</span>
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

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */

const AvailableClasses: React.FC = () => {
    const [classes,           setClasses]           = useState<GymClassDTO[]>([]);
    const [todaysClasses,     setTodaysClasses]     = useState<GymClassDTO[]>([]);
    const [bookedCount,       setBookedCount]       = useState(0);
    const [loading,           setLoading]           = useState(true);
    const [booking,           setBooking]           = useState<number | null>(null);
    const [view,              setView]              = useState<ViewMode>('list');
    const [searchTerm,        setSearchTerm]        = useState('');
    const [selectedType,      setSelectedType]      = useState('All');
    const [selectedDifficulty,setSelectedDifficulty] = useState('All');
    const [selectedTimeFilter,setSelectedTimeFilter] = useState<TimeFilter>('all');
    const [selectedWeek,      setSelectedWeek]      = useState(0);
    const [calMonth,          setCalMonth]          = useState(new Date());
    const [error,             setError]             = useState<string | null>(null);
    const [showBookingSuccess,setShowBookingSuccess] = useState<number | null>(null);
    const [detailClass,       setDetailClass]       = useState<GymClassDTO | null>(null);
    const [showFavOnly,       setShowFavOnly]       = useState(false);
    const [trainerPreview,    setTrainerPreview]    = useState<{ name: string; x: number; y: number } | null>(null);
    const [waitlist,          setWaitlist]          = useState<Set<number>>(new Set());
    const [showFilters,       setShowFilters]       = useState(false);
    const filterPopoverRef = useRef<HTMLDivElement>(null);

    const { user, isLoading: authLoading } = useAuth();
    const memberId = Number(user?.userId || (user as any)?.id);

    const [favorites, setFavorites] = useState<Set<number>>(() => memberId ? loadFavorites(memberId) : new Set());

    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => { return () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); }; }, []);

    // Close filter popover on outside click
    useEffect(() => {
        if (!showFilters) return;
        const handler = (e: MouseEvent) => {
            if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target as Node)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showFilters]);

    useEffect(() => { if (!authLoading) fetchClasses(); }, [memberId, authLoading]);

    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const [availableClasses, todayClasses] = await Promise.all([
                gymClassApi.getAvailableClasses(memberId),
                gymClassApi.getTodaysClasses(memberId),
            ]);
            setClasses(availableClasses);
            setTodaysClasses(todayClasses);
            setBookedCount(availableClasses.filter(c => c.isBooked).length);
            setWaitlist(new Set(availableClasses.filter(c => c.isWaitlisted).map(c => c.classId)));
        } catch (err) {
            console.error('Failed to fetch classes:', err);
            setError('Failed to load classes. Please try again.');
            setClasses([]); setTodaysClasses([]);
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    const handleBook = async (classId: number) => {
        if (!memberId) { toast.error('Please log in to book a class'); return; }
        setBooking(classId);
        try {
            const bk = await gymClassApi.bookClass(classId, memberId);
            const update = (list: GymClassDTO[]) =>
                list.map(c => c.classId === classId
                    ? { ...c, isBooked: true, bookingId: bk.bookingId, spotsLeft: c.spotsLeft - 1, currentBookings: c.currentBookings + 1 }
                    : c);
            setClasses(update); setTodaysClasses(update);
            setBookedCount(prev => prev + 1);
            setShowBookingSuccess(classId);
            const bookedClass = classes.find(c => c.classId === classId);
            toast.success(
                <div className="toast-booking-success">
                    <CheckCircle2 size={18} />
                    <div><strong>Booking Confirmed!</strong><p>{bookedClass?.classType} with {bookedClass?.trainerName}</p></div>
                </div>,
                { duration: 4000, icon: null }
            );
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
            successTimerRef.current = setTimeout(() => setShowBookingSuccess(null), 3000);
            if (detailClass?.classId === classId) {
                setDetailClass(prev => prev
                    ? { ...prev, isBooked: true, bookingId: bk.bookingId, spotsLeft: prev.spotsLeft - 1, currentBookings: prev.currentBookings + 1 }
                    : null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to book class.');
        } finally {
            setBooking(null);
        }
    };

    const handleWaitlist = useCallback(async (classItem: GymClassDTO) => {
        if (!memberId) { toast.error('Please log in'); return; }
        setBooking(classItem.classId);
        try {
            const bk = await gymClassApi.bookClass(classItem.classId, memberId);
            if (bk.status === 'WAITLISTED') {
                setWaitlist(prev => new Set([...prev, classItem.classId]));
                const update = (list: GymClassDTO[]) => list.map(c => c.classId === classItem.classId ? { ...c, isWaitlisted: true } : c);
                setClasses(update); setTodaysClasses(update);
                toast.success("Added to waitlist! You'll be notified when a spot opens.", { duration: 4000 });
            } else {
                toast.success('Class booked!');
                fetchClasses();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to join waitlist');
        } finally {
            setBooking(null);
        }
    }, [memberId, fetchClasses]);

    const toggleFavorite = useCallback((classId: number) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(classId)) next.delete(classId); else next.add(classId);
            saveFavorites(memberId, next);
            return next;
        });
    }, [memberId]);

    const handleTrainerClick = useCallback((name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const rect    = (e.target as HTMLElement).getBoundingClientRect();
        const POPUP_W = 240, POPUP_H = 150;
        const x       = Math.min(rect.left, window.innerWidth - POPUP_W - 16);
        const y       = Math.min(rect.bottom + 8, window.innerHeight - POPUP_H - 16);
        setTrainerPreview({ name, x, y });
    }, []);

    /* ── derived data ── */

    const types = useMemo(() => {
        const unique = new Set(classes.map(c => c.classType).filter(Boolean));
        return ['All', ...Array.from(unique)];
    }, [classes]);

    const difficulties = useMemo(() => {
        const unique = new Set(classes.map(c => c.difficulty).filter(Boolean));
        return ['All', ...Array.from(unique)] as string[];
    }, [classes]);

    const filterFn = useCallback((c: GymClassDTO) => {
        const trainerName = c.trainerName || '';
        const matchSearch =
            trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.classType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.className.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType  = selectedType === 'All' || c.classType === selectedType;
        const matchDiff  = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
        const matchFav   = !showFavOnly || favorites.has(c.classId);
        let matchTime    = true;
        if (selectedTimeFilter !== 'all') {
            const hour = new Date(c.startTime).getHours();
            const tf   = TIME_FILTERS.find(t => t.key === selectedTimeFilter);
            if (tf && 'range' in tf) matchTime = hour >= tf.range[0] && hour < tf.range[1];
        }
        return matchSearch && matchType && matchDiff && matchTime && matchFav;
    }, [searchTerm, selectedType, selectedDifficulty, selectedTimeFilter, showFavOnly, favorites]);

    const filteredClasses       = useMemo(() => classes.filter(filterFn),       [classes, filterFn]);
    const filteredTodaysClasses = useMemo(() => todaysClasses.filter(filterFn), [todaysClasses, filterFn]);

    const weekDays = useMemo(() => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() + selectedWeek * 7);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start); d.setDate(d.getDate() + i); return d;
        });
    }, [selectedWeek]);

    const getClassesForDay = (date: Date) =>
        filteredClasses.filter(c => new Date(c.startTime).toDateString() === date.toDateString());

    const activeFilterCount = [
        selectedType !== 'All',
        selectedDifficulty !== 'All',
        selectedTimeFilter !== 'all',
        showFavOnly,
        searchTerm.length > 0,
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setSearchTerm(''); setSelectedType('All');
        setSelectedDifficulty('All'); setSelectedTimeFilter('all');
        setShowFavOnly(false);
    };

    /* ── loading ── */
    if (loading) {
        return (
            <div className="classes-page">
                <div className="classes-topbar">
                    <div className="classes-topbar__row">
                        <div className="classes-topbar__left">
                            <h1 className="classes-header__title">Class Schedule</h1>
                            <p className="classes-header__subtitle">Browse and book available sessions</p>
                        </div>
                    </div>
                </div>
                
                {/* Skeleton for class cards */}
                <div className="classes-grid" style={{ marginTop: '24px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} hasImage={false} lines={4} />
                    ))}
                </div>
            </div>
        );
    }

    /* ── render ── */
    return (
        <motion.div className="classes-page" variants={containerVariants} initial="hidden" animate="visible">
            {trainerPreview && <div className="ac-click-away" onClick={() => setTrainerPreview(null)} />}

              {/* ── Combined Header + Toolbar ── */}
              <motion.div className="classes-topbar" variants={itemVariants}>
                  {/* Row 1: title | stats | controls */}
                  <div className="classes-topbar__row">
                      {/* Left: title + subtitle */}
                      <div className="classes-topbar__left">
                          <h1 className="classes-header__title">Class Schedule</h1>
                          <p className="classes-header__subtitle">Browse and book available sessions</p>
                      </div>

                      {/* Center: stats */}
                      <div className="classes-header__stats">
                          <div className="classes-stat">
                              <div className="classes-stat__icon-wrap classes-stat__icon-wrap--blue"><Calendar size={13} /></div>
                              <div>
                                  <span className="classes-stat__value">{filteredClasses.length}</span>
                                  <span className="classes-stat__label">Available</span>
                              </div>
                          </div>
                          <div className="classes-stat classes-stat--booked">
                              <div className="classes-stat__icon-wrap classes-stat__icon-wrap--green"><CalendarCheck size={13} /></div>
                              <div>
                                  <span className="classes-stat__value">{bookedCount}</span>
                                  <span className="classes-stat__label">Booked</span>
                              </div>
                          </div>
                          <div className="classes-stat classes-stat--today">
                              <div className="classes-stat__icon-wrap classes-stat__icon-wrap--orange"><Flame size={13} /></div>
                              <div>
                                  <span className="classes-stat__value">{filteredTodaysClasses.length}</span>
                                  <span className="classes-stat__label">Today</span>
                              </div>
                          </div>
                      </div>

                      {/* Right: search + controls */}
                      <div className="classes-topbar__right">
                    <div className="classes-search">
                        <Search size={14} className="classes-search__icon" />
                        <input type="text" placeholder="Search classes or trainers…"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="classes-search__input" />
                        {searchTerm && (
                            <button className="classes-search__clear" onClick={() => setSearchTerm('')}><X size={13} /></button>
                        )}
                    </div>

                    {activeFilterCount > 0 && (
                        <button className="classes-clear-filters" onClick={clearAllFilters}>
                            <X size={12} /> Clear {activeFilterCount}
                        </button>
                    )}

                    {/* Filter button + popover */}
                    <div className="classes-filter-popover-wrap" ref={filterPopoverRef}>
                        <button
                            className={`classes-filter-toggle ${showFilters ? 'classes-filter-toggle--active' : ''}`}
                            onClick={() => setShowFilters(v => !v)}>
                            <SlidersHorizontal size={14} />
                            Filters
                            {activeFilterCount > 0 && <span className="classes-filter-toggle__badge">{activeFilterCount}</span>}
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div className="classes-filter-popover"
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.16 }}>
                                    <div className="classes-filter-popover__header">
                                        <span>Filters</span>
                                        <button onClick={() => setShowFilters(false)}><X size={13} /></button>
                                    </div>
                                    <div className="classes-filter-group">
                                        <label className="classes-filter-group__label">Difficulty</label>
                                        <div className="classes-filter-group__options">
                                            {difficulties.map((d, i) => (
                                                <button key={d || `diff-${i}`}
                                                    className={`classes-filter-pill ${selectedDifficulty === d ? 'classes-filter-pill--active' : ''}`}
                                                    onClick={() => setSelectedDifficulty(d)}>{d}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="classes-filter-group">
                                        <label className="classes-filter-group__label">Time of Day</label>
                                        <div className="classes-filter-group__options">
                                            {TIME_FILTERS.map(tf => (
                                                <button key={tf.key}
                                                    className={`classes-filter-pill ${selectedTimeFilter === tf.key ? 'classes-filter-pill--active' : ''}`}
                                                    onClick={() => setSelectedTimeFilter(tf.key)}>{tf.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <button className={`classes-fav-filter ${showFavOnly ? 'classes-fav-filter--active' : ''}`}
                                        onClick={() => setShowFavOnly(!showFavOnly)}>
                                        <Heart size={13} fill={showFavOnly ? 'currentColor' : 'none'} />
                                        Favorites only
                                        {favorites.size > 0 && <span className="classes-fav-filter__count">{favorites.size}</span>}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="classes-view-toggle">
                        <button className={`classes-view-btn ${view === 'list'    ? 'classes-view-btn--active' : ''}`} onClick={() => setView('list')}    title="List view"><List size={15} /></button>
                        <button className={`classes-view-btn ${view === 'weekly'  ? 'classes-view-btn--active' : ''}`} onClick={() => setView('weekly')}  title="Weekly view"><CalendarDays size={15} /></button>
                        <button className={`classes-view-btn ${view === 'monthly' ? 'classes-view-btn--active' : ''}`} onClick={() => setView('monthly')} title="Monthly view"><Grid3X3 size={15} /></button>
                    </div>
                    <button className="classes-refresh-btn" onClick={fetchClasses} title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>
        </motion.div>

            {/* ── Type Chips ── */}
            <motion.div className="classes-filters" variants={itemVariants}>
                {types.map((type, i) => {
                    const cfg = type !== 'All' ? getConfig(type) : null;
                    return (
                        <button key={type || `type-${i}`}
                            className={`classes-filter ${selectedType === type ? 'classes-filter--active' : ''}`}
                            onClick={() => setSelectedType(type)}
                            style={selectedType === type && cfg
                                ? { borderColor: cfg.color, color: cfg.color, background: cfg.bg, boxShadow: `0 0 0 1px ${cfg.color}40` }
                                : cfg ? { '--chip-color': cfg.color } as React.CSSProperties : undefined}>
                            {cfg && <span className="classes-filter__icon" style={selectedType === type ? { color: cfg.color } : { color: cfg.color, opacity: 0.75 }}>{cfg.icon}</span>}
                            {type}
                        </button>
                    );
                })}
            </motion.div>

              {/* ── Today's Classes ── */}
            {filteredTodaysClasses.length > 0 && (
                <motion.section className="todays-classes" variants={itemVariants}>
                    <div className="todays-classes__header">
                        <Flame size={14} className="todays-classes__header-icon" />
                        <span className="todays-classes__header-label">Today's Classes</span>
                        <span className="todays-classes__header-count">{filteredTodaysClasses.length}</span>
                    </div>
                    <div className="todays-classes__grid">
                        {filteredTodaysClasses.slice(0, 6).map(classItem => {
                            const config      = getConfig(classItem.classType);
                            const isBooked    = classItem.isBooked;
                            const isBookingThis = booking === classItem.classId;
                            const justBooked  = showBookingSuccess === classItem.classId;
                            const isFull      = classItem.spotsLeft <= 0;
                            const onWL        = waitlist.has(classItem.classId) || !!classItem.isWaitlisted;
                            const soon        = isStartingSoon(classItem.startTime);

                            return (
                                <motion.div key={classItem.classId}
                                    className={`todays-class-item${isBooked ? ' todays-class-item--booked' : ''}${justBooked ? ' todays-class-item--just-booked' : ''}${soon ? ' todays-class-item--soon' : ''}`}
                                    whileHover={{ scale: 1.005 }} layout
                                    onClick={() => setDetailClass(classItem)}
                                    style={{ cursor: 'pointer' }}>
                                    <div className="todays-class-item__icon" style={{ background: config.bg, color: config.color }}>
                                        {config.icon}
                                    </div>
                                    <div className="todays-class-item__info">
                                          <div className="todays-class-item__main">
                                              <span className="todays-class-item__type">{classItem.className || classItem.classType}</span>
                                            {soon && <span className="starting-soon-badge"><Timer size={10} /> Soon</span>}
                                            {classItem.difficulty && (
                                                <span className={`todays-class-item__difficulty ${DIFFICULTY_MAP[classItem.difficulty]?.cls || 'badge--info'}`}>
                                                    {classItem.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <div className="todays-class-item__meta">
                                            <span><Clock size={11} /> {formatTime(classItem.startTime)}</span>
                                            {classItem.trainerName && <span><User size={11} /> {classItem.trainerName}</span>}
                                            {classItem.location && <span><MapPin size={11} /> {classItem.location}</span>}
                                        </div>
                                    </div>
                                    <div className="todays-class-item__action" onClick={e => e.stopPropagation()}>
                                        <CapacityBar current={classItem.currentBookings} max={classItem.maxCapacity} spotsLeft={classItem.spotsLeft} />
                                        <button
                                            className={`todays-class-item__btn${isBooked ? ' todays-class-item__btn--booked' : isFull ? ' todays-class-item__btn--waitlist' : ''}`}
                                            onClick={() => { if (isBooked) return; if (isFull) handleWaitlist(classItem); else handleBook(classItem.classId); }}
                                            disabled={isBookingThis || isBooked || onWL}>
                                            {isBookingThis ? <Loader2 size={13} className="spin" />
                                                : isBooked  ? <><CheckCircle2 size={13} /> Booked</>
                                                : onWL      ? <><Bell size={13} /> Waitlisted</>
                                                : isFull    ? <><Bell size={13} /> Waitlist</>
                                                : 'Book Now'}
                                        </button>
                                    </div>
                                    {justBooked && (
                                        <motion.div className="booking-success-overlay"
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                            <CheckCircle2 size={22} /><span>Booked!</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {/* Today's empty state */}
            {filteredTodaysClasses.length === 0 && !loading && (
                <motion.div className="todays-empty" variants={itemVariants}>
                    <div className="todays-empty__icon"><Calendar size={18} /></div>
                    <div className="todays-empty__text">
                        <span>No classes scheduled for today</span>
                        <button onClick={() => setView('list')}>Browse all classes →</button>
                    </div>
                </motion.div>
            )}

            {/* Error */}
            {error && (
                <motion.div className="classes-error" variants={itemVariants}>
                    <AlertCircle size={16} /><span>{error}</span>
                    <button onClick={fetchClasses}>Try Again</button>
                </motion.div>
            )}

            {/* ── Content ── */}
            <AnimatePresence mode="wait">

                {/* List view */}
                {view === 'list' && (
                    <motion.div key="list" className="classes-content"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {filteredClasses.length === 0 ? (
                            <motion.div className="classes-empty" variants={itemVariants}>
                                <div className="classes-empty__icon"><Calendar size={28} /></div>
                                <h3 className="classes-empty__title">No Classes Found</h3>
                                <p className="classes-empty__text">
                                    {activeFilterCount > 0
                                        ? 'Try adjusting your filters to see more classes'
                                        : 'Check back later for new sessions'}
                                </p>
                                {activeFilterCount > 0 && (
                                    <button className="classes-empty__btn" onClick={clearAllFilters}>Clear Filters</button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="classes-grid">
                                {filteredClasses.map(classItem => {
                                    const config    = getConfig(classItem.classType);
                                    const isBooked  = classItem.isBooked;
                                    const justBooked = showBookingSuccess === classItem.classId;
                                    const isFav     = favorites.has(classItem.classId);
                                    const isFull    = classItem.spotsLeft <= 0;
                                    const onWL      = waitlist.has(classItem.classId) || !!classItem.isWaitlisted;
                                    const soon      = isStartingSoon(classItem.startTime);

                                    return (
                                        <motion.div key={classItem.classId}
                                            className={`class-card${isBooked ? ' class-card--booked' : ''}${justBooked ? ' class-card--just-booked' : ''}`}
                                            variants={itemVariants}
                                            whileHover={{ y: -3, transition: { duration: 0.18 } }}
                                            layout
                                            onClick={() => setDetailClass(classItem)}
                                            style={{ cursor: 'pointer' }}>

                                            {/* Color strip */}
                                            <div className="class-card__strip" style={{ background: config.gradient }} />

                                            {justBooked && (
                                                <motion.div className="class-card__success-badge"
                                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <CheckCircle2 size={13} /> Confirmed!
                                                </motion.div>
                                            )}

                                            <div className="class-card__header">
                                                <div className="class-card__icon" style={{ background: config.bg, color: config.color }}>
                                                    {config.icon}
                                                </div>
                                                <div className="class-card__header-right">
                                                    {soon && <span className="starting-soon-badge"><Timer size={10} /> Soon</span>}
                                                    {isBooked && (
                                                        <span className="class-card__badge badge--success"><CheckCircle2 size={10} /> Booked</span>
                                                    )}
                                                    <button className={`class-card__fav ${isFav ? 'class-card__fav--active' : ''}`}
                                                        onClick={e => { e.stopPropagation(); toggleFavorite(classItem.classId); }}>
                                                        <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="class-card__body">
                                                <div className="class-card__title-row">
                                                    <h3 className="class-card__title">{classItem.className || classItem.classType}</h3>
                                                    {classItem.difficulty && (
                                                        <span className={`class-card__diff-badge ${DIFFICULTY_MAP[classItem.difficulty]?.cls || 'badge--info'}`}>
                                                            {classItem.difficulty}
                                                        </span>
                                                    )}
                                                </div>

                                                {classItem.trainerName && (
                                                    <p className="class-card__trainer"
                                                        onClick={e => handleTrainerClick(classItem.trainerName!, e)}>
                                                        <User size={11} /> {classItem.trainerName}
                                                    </p>
                                                )}

                                                <div className="class-card__details">
                                                    <div className="class-card__detail">
                                                        <Calendar size={11} />
                                                        <span>{formatDate(classItem.startTime)}</span>
                                                        <span className="class-card__relative-time">{getRelativeTime(classItem.startTime)}</span>
                                                    </div>
                                                    <div className="class-card__detail">
                                                        <Clock size={11} />
                                                        <span>{formatTime(classItem.startTime)} · {classItem.durationMinutes}m</span>
                                                    </div>
                                                    {classItem.location && (
                                                        <div className="class-card__detail">
                                                            <MapPin size={11} /><span>{classItem.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="class-card__capacity">
                                                    <CapacityBar current={classItem.currentBookings} max={classItem.maxCapacity} spotsLeft={classItem.spotsLeft} />
                                                </div>
                                            </div>

                                            <div className="class-card__footer" onClick={e => e.stopPropagation()}>
                                                <button className="class-card__ics" onClick={() => downloadICS(classItem)} title="Download .ics">
                                                    <Download size={12} />
                                                </button>
                                                {isBooked ? (
                                                    <div className="class-card__booked-actions">
                                                        <button className="class-card__btn class-card__btn--booked" disabled>
                                                            <CheckCircle2 size={12} /> Booked
                                                        </button>
                                                        <button className="class-card__btn class-card__btn--cancel"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await gymClassApi.cancelBooking(classItem.bookingId!, memberId);
                                                                    const update = (list: GymClassDTO[]) => list.map(c =>
                                                                        c.classId === classItem.classId
                                                                            ? { ...c, isBooked: false, spotsLeft: c.spotsLeft + 1, currentBookings: c.currentBookings - 1 }
                                                                            : c);
                                                                    setClasses(update); setTodaysClasses(update);
                                                                    setBookedCount(prev => prev - 1);
                                                                    toast.success('Booking cancelled');
                                                                } catch { toast.error('Failed to cancel booking'); }
                                                            }}>
                                                            <X size={12} /> Cancel
                                                        </button>
                                                    </div>
                                                ) : isFull ? (
                                                    <button
                                                        className={`class-card__btn class-card__btn--waitlist ${onWL ? 'class-card__btn--on-wl' : ''}`}
                                                        onClick={() => !onWL && handleWaitlist(classItem)}
                                                        disabled={onWL || booking === classItem.classId}>
                                                        {booking === classItem.classId ? <Loader2 size={12} className="spin" /> : <Bell size={12} />}
                                                        {onWL ? 'On Waitlist' : 'Join Waitlist'}
                                                    </button>
                                                ) : (
                                                    <button className="class-card__btn"
                                                        onClick={() => handleBook(classItem.classId)}
                                                        disabled={booking === classItem.classId}>
                                                        {booking === classItem.classId
                                                            ? <><Loader2 size={12} className="spin" /> Booking…</>
                                                            : 'Book Now'}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Weekly view */}
                {view === 'weekly' && (
                    <motion.div key="weekly" className="classes-calendar"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="classes-calendar__nav">
                            <button className="classes-calendar__nav-btn" onClick={() => setSelectedWeek(w => w - 1)}><ChevronLeft size={18} /></button>
                            <span className="classes-calendar__nav-label">
                                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <button className="classes-calendar__nav-btn" onClick={() => setSelectedWeek(w => w + 1)}><ChevronRight size={18} /></button>
                            {selectedWeek !== 0 && (
                                <button className="classes-calendar__today-btn" onClick={() => setSelectedWeek(0)}>Today</button>
                            )}
                        </div>
                        <div className="classes-calendar__header">
                            {weekDays.map((day, i) => (
                                <div key={i} className={`classes-calendar__day-header ${isToday(day) ? 'classes-calendar__day-header--today' : ''}`}>
                                    <span className="classes-calendar__weekday">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    <span className="classes-calendar__date">{day.getDate()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="classes-calendar__grid">
                            {weekDays.map((day, i) => {
                                const dayClasses = getClassesForDay(day);
                                return (
                                    <div key={i} className={`classes-calendar__column ${isToday(day) ? 'classes-calendar__column--today' : ''}`}>
                                        {dayClasses.length > 0 ? (
                                            dayClasses.map(classItem => {
                                                const config   = getConfig(classItem.classType);
                                                const isBooked = classItem.isBooked;
                                                return (
                                                    <div key={classItem.classId}
                                                        className={`classes-calendar__item ${isBooked ? 'classes-calendar__item--booked' : ''}`}
                                                        style={{ borderLeftColor: config.color }}
                                                        onClick={() => setDetailClass(classItem)}>
                                                        <div className="classes-calendar__item-icon" style={{ color: config.color }}>{config.icon}</div>
                                                        <div className="classes-calendar__item-info">
                                                            <span className="classes-calendar__item-time">{formatTime(classItem.startTime)}</span>
                                                            <span className="classes-calendar__item-type">{classItem.classType}</span>
                                                            {classItem.trainerName && (
                                                                <span className="classes-calendar__item-trainer">{classItem.trainerName}</span>
                                                            )}
                                                        </div>
                                                        {isBooked && <CheckCircle2 size={10} className="classes-calendar__item-check" />}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="classes-calendar__empty"><span>—</span></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Monthly view */}
                {view === 'monthly' && (
                    <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <MonthlyCalendar
                            classes={filteredClasses}
                            month={calMonth}
                            onChangeMonth={dir => setCalMonth(prev => {
                                const n = new Date(prev); n.setMonth(n.getMonth() + dir); return n;
                            })}
                            onSelectClass={c => setDetailClass(c)}
                            favorites={favorites}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trainer preview popup */}
            <AnimatePresence>
                {trainerPreview && (
                    <div style={{ position: 'fixed', left: trainerPreview.x, top: trainerPreview.y, zIndex: 1000 }}>
                        <TrainerPreview name={trainerPreview.name} onClose={() => setTrainerPreview(null)} />
                    </div>
                )}
            </AnimatePresence>

            {/* Class detail modal */}
            <AnimatePresence>
                {detailClass && (
                    <ClassDetailModal
                        classItem={detailClass}
                        onClose={() => setDetailClass(null)}
                        onBook={handleBook}
                        onWaitlist={(id) => handleWaitlist(classes.find(c => c.classId === id) || detailClass)}
                        isBooking={booking === detailClass.classId}
                        isFavorite={favorites.has(detailClass.classId)}
                        onToggleFav={() => toggleFavorite(detailClass.classId)}
                        onCancel={async (bookingId) => {
                            try {
                                await gymClassApi.cancelBooking(bookingId, memberId);
                                const update = (list: GymClassDTO[]) => list.map(c =>
                                    c.classId === detailClass.classId
                                        ? { ...c, isBooked: false, spotsLeft: c.spotsLeft + 1, currentBookings: c.currentBookings - 1 }
                                        : c);
                                setClasses(update); setTodaysClasses(update);
                                setBookedCount(prev => prev - 1);
                                setDetailClass(null);
                                toast.success('Booking cancelled');
                            } catch { toast.error('Failed to cancel booking'); }
                        }}
                        memberId={memberId}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AvailableClasses;
