import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, List, Clock, MapPin,
    Users, ChevronLeft, ChevronRight, Heart, Zap,
    Dumbbell, Bike, Sparkles, Target, User, CalendarDays,
    Loader2, AlertCircle, CheckCircle2, CalendarCheck, Flame
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { gymClassApi } from '../../services/api';
import type { GymClassDTO } from '../../services/api';
import '../../styles/macos-member.css';
import './AvailableClasses.css';

const classTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    'Yoga': { icon: <Heart size={16} />, color: '#34C759', bg: 'rgba(52, 199, 89, 0.12)' },
    'HIIT': { icon: <Zap size={16} />, color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.12)' },
    'Strength': { icon: <Dumbbell size={16} />, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.12)' },
    'Spin': { icon: <Bike size={16} />, color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.12)' },
    'Pilates': { icon: <Sparkles size={16} />, color: '#5AC8FA', bg: 'rgba(90, 200, 250, 0.12)' },
    'Boxing': { icon: <Target size={16} />, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.12)' },
    'PT Session': { icon: <User size={16} />, color: '#5856D6', bg: 'rgba(88, 86, 214, 0.12)' },
    'Group': { icon: <Users size={16} />, color: '#FF2D55', bg: 'rgba(255, 45, 85, 0.12)' },
    'CrossFit': { icon: <Flame size={16} />, color: '#FF6B35', bg: 'rgba(255, 107, 53, 0.12)' }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const AvailableClasses: React.FC = () => {
    const [classes, setClasses] = useState<GymClassDTO[]>([]);
    const [todaysClasses, setTodaysClasses] = useState<GymClassDTO[]>([]);
    const [bookedCount, setBookedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<number | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showBookingSuccess, setShowBookingSuccess] = useState<number | null>(null);

    const { user, isLoading: authLoading } = useAuth();
    const memberId = user?.userId || user?.id;

    useEffect(() => {
        if (!authLoading) {
            fetchClasses();
        }
    }, [memberId, authLoading]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            setError(null);

            const [availableClasses, todayClasses, bookingsCount] = await Promise.all([
                gymClassApi.getAvailableClasses(memberId),
                gymClassApi.getTodaysClasses(memberId),
                memberId ? gymClassApi.getMemberBookingsCount(memberId) : Promise.resolve(0)
            ]);

            setClasses(availableClasses);
            setTodaysClasses(todayClasses);
            setBookedCount(bookingsCount);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
            setError('Failed to load classes. Please try again.');
            setClasses([]);
            setTodaysClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (classId: number) => {
        if (!memberId) {
            toast.error('Please log in to book a class');
            return;
        }

        setBooking(classId);
        try {
            const booking = await gymClassApi.bookClass(classId, memberId);
            
            setClasses(prev => prev.map(c => 
                c.classId === classId 
                    ? { ...c, isBooked: true, bookingId: booking.bookingId, spotsLeft: c.spotsLeft - 1 }
                    : c
            ));
            setTodaysClasses(prev => prev.map(c => 
                c.classId === classId 
                    ? { ...c, isBooked: true, bookingId: booking.bookingId, spotsLeft: c.spotsLeft - 1 }
                    : c
            ));
            setBookedCount(prev => prev + 1);

            const bookedClass = classes.find(c => c.classId === classId);
            setShowBookingSuccess(classId);
            toast.success(
                <div className="toast-booking-success">
                    <CheckCircle2 size={18} />
                    <div>
                        <strong>Booking Confirmed!</strong>
                        <p>{bookedClass?.classType} with {bookedClass?.trainerName}</p>
                    </div>
                </div>,
                { duration: 4000, icon: null }
            );
            
            setTimeout(() => setShowBookingSuccess(null), 3000);
        } catch (err: any) {
            console.error('Booking failed:', err);
            const message = err.response?.data?.message || 'Failed to book class. Please try again.';
            toast.error(message);
        } finally {
            setBooking(null);
        }
    };

    const types = useMemo(() => {
        const uniqueTypes = new Set(classes.map(c => c.classType));
        return ['All', ...Array.from(uniqueTypes)];
    }, [classes]);

    const filteredClasses = useMemo(() => {
        return classes.filter(classItem => {
            const trainerName = classItem.trainerName || '';
            const matchesSearch = 
                trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.classType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.className.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'All' || classItem.classType === selectedType;
            return matchesSearch && matchesType;
        });
    }, [classes, searchTerm, selectedType]);

    const filteredTodaysClasses = useMemo(() => {
        return todaysClasses.filter(classItem => {
            const trainerName = classItem.trainerName || '';
            const matchesSearch = 
                trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.classType.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'All' || classItem.classType === selectedType;
            return matchesSearch && matchesType;
        });
    }, [todaysClasses, searchTerm, selectedType]);

    const getWeekDays = (weekOffset: number) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const weekDays = getWeekDays(selectedWeek);

    const getClassesForDay = (date: Date) =>
        filteredClasses.filter(classItem => {
            const classDate = new Date(classItem.startTime);
            return classDate.toDateString() === date.toDateString();
        });

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getDifficultyColor = (diff?: string) => {
        switch (diff) {
            case 'Beginner': return 'badge--success';
            case 'Intermediate': return 'badge--warning';
            case 'Advanced': return 'badge--danger';
            default: return 'badge--info';
        }
    };

    if (loading) {
        return (
            <div className="classes-page">
                <div className="classes-loading">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader2 size={24} className="classes-loading__icon" />
                    </motion.div>
                    <p>Loading available classes...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="classes-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header className="classes-header" variants={itemVariants}>
                <div className="classes-header__content">
                    <h1 className="classes-header__title">Class Schedule</h1>
                    <p className="classes-header__subtitle">
                        Browse and book available sessions
                    </p>
                </div>
                <div className="classes-header__stats">
                    <div className="classes-stat">
                        <span className="classes-stat__value">{filteredClasses.length}</span>
                        <span className="classes-stat__label">Available</span>
                    </div>
                    <div className="classes-stat classes-stat--booked">
                        <CalendarCheck size={16} className="classes-stat__icon" />
                        <span className="classes-stat__value">{bookedCount}</span>
                        <span className="classes-stat__label">Booked</span>
                    </div>
                    <div className="classes-stat classes-stat--today">
                        <Flame size={16} className="classes-stat__icon" />
                        <span className="classes-stat__value">{filteredTodaysClasses.length}</span>
                        <span className="classes-stat__label">Today</span>
                    </div>
                </div>
            </motion.header>

            {filteredTodaysClasses.length > 0 && (
                <motion.section className="todays-classes" variants={itemVariants}>
                    <div className="todays-classes__header">
                        <div className="todays-classes__title">
                            <Flame size={18} className="todays-classes__icon" />
                            <h2>Today's Classes</h2>
                            <span className="todays-classes__count">{filteredTodaysClasses.length} sessions</span>
                        </div>
                    </div>
                    <div className="todays-classes__list">
                        {filteredTodaysClasses.slice(0, 5).map(classItem => {
                            const config = classTypeConfig[classItem.classType] || classTypeConfig['PT Session'];
                            const isBooked = classItem.isBooked;
                            const isBookingThis = booking === classItem.classId;
                            const justBooked = showBookingSuccess === classItem.classId;

                            return (
                                <motion.div
                                    key={classItem.classId}
                                    className={`todays-class-item ${isBooked ? 'todays-class-item--booked' : ''} ${justBooked ? 'todays-class-item--just-booked' : ''}`}
                                    whileHover={{ scale: 1.01 }}
                                    layout
                                >
                                    <div 
                                        className="todays-class-item__icon"
                                        style={{ background: config.bg, color: config.color }}
                                    >
                                        {config.icon}
                                    </div>
                                    <div className="todays-class-item__info">
                                        <div className="todays-class-item__main">
                                            <span className="todays-class-item__type">{classItem.classType}</span>
                                            {classItem.difficulty && (
                                                <span className={`todays-class-item__difficulty ${getDifficultyColor(classItem.difficulty)}`}>
                                                    {classItem.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <div className="todays-class-item__meta">
                                            <span><Clock size={11} /> {formatTime(classItem.startTime)}</span>
                                            <span><User size={11} /> {classItem.trainerName}</span>
                                            {classItem.location && <span><MapPin size={11} /> {classItem.location}</span>}
                                        </div>
                                    </div>
                                    <div className="todays-class-item__action">
                                        {classItem.spotsLeft !== undefined && (
                                            <span className="todays-class-item__spots">
                                                {classItem.spotsLeft} spots
                                            </span>
                                        )}
                                        <button
                                            className={`todays-class-item__btn ${isBooked ? 'todays-class-item__btn--booked' : ''}`}
                                            onClick={() => !isBooked && handleBook(classItem.classId)}
                                            disabled={isBookingThis || isBooked}
                                        >
                                            {isBookingThis ? (
                                                <Loader2 size={14} className="spin" />
                                            ) : isBooked ? (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Booked
                                                </>
                                            ) : (
                                                'Book Now'
                                            )}
                                        </button>
                                    </div>
                                    {justBooked && (
                                        <motion.div 
                                            className="booking-success-overlay"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <CheckCircle2 size={24} />
                                            <span>Booked!</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            <motion.div className="classes-toolbar" variants={itemVariants}>
                <div className="classes-search">
                    <Search size={16} className="classes-search__icon" />
                    <input
                        type="text"
                        placeholder="Search classes or trainers..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="classes-search__input"
                    />
                </div>

                <div className="classes-filters">
                    {types.map(type => (
                        <button
                            key={type}
                            className={`classes-filter ${selectedType === type ? 'classes-filter--active' : ''}`}
                            onClick={() => setSelectedType(type as string)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="classes-view-toggle">
                    <button
                        className={`classes-view-btn ${view === 'list' ? 'classes-view-btn--active' : ''}`}
                        onClick={() => setView('list')}
                        title="List view"
                    >
                        <List size={16} />
                    </button>
                    <button
                        className={`classes-view-btn ${view === 'calendar' ? 'classes-view-btn--active' : ''}`}
                        onClick={() => setView('calendar')}
                        title="Calendar view"
                    >
                        <CalendarDays size={16} />
                    </button>
                </div>
            </motion.div>

            {error && (
                <motion.div className="classes-error" variants={itemVariants}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={fetchClasses}>Try Again</button>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        className="classes-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredClasses.length === 0 ? (
                            <motion.div className="classes-empty" variants={itemVariants}>
                                <div className="classes-empty__icon">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="classes-empty__title">No Classes Available</h3>
                                <p className="classes-empty__text">
                                    {searchTerm || selectedType !== 'All'
                                        ? 'Try adjusting your filters to see more classes'
                                        : 'Check back later for new sessions or contact your trainer'}
                                </p>
                                {(searchTerm || selectedType !== 'All') && (
                                    <button
                                        className="classes-empty__btn"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedType('All');
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="classes-grid">
                                {filteredClasses.map((classItem) => {
                                    const config = classTypeConfig[classItem.classType] || classTypeConfig['PT Session'];
                                    const isBooked = classItem.isBooked;
                                    const justBooked = showBookingSuccess === classItem.classId;

                                    return (
                                        <motion.div
                                            key={classItem.classId}
                                            className={`class-card ${isBooked ? 'class-card--booked' : ''} ${justBooked ? 'class-card--just-booked' : ''}`}
                                            variants={itemVariants}
                                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                            layout
                                        >
                                            {justBooked && (
                                                <motion.div 
                                                    className="class-card__success-badge"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Booking Confirmed!
                                                </motion.div>
                                            )}
                                            <div className="class-card__header">
                                                <div
                                                    className="class-card__icon"
                                                    style={{ background: config.bg, color: config.color }}
                                                >
                                                    {config.icon}
                                                </div>
                                                <div className="flex gap-2">
                                                    {classItem.difficulty && (
                                                        <span className={`class-card__badge ${getDifficultyColor(classItem.difficulty)}`}>
                                                            {classItem.difficulty}
                                                        </span>
                                                    )}
                                                    {isBooked && (
                                                        <span className="class-card__badge badge--success">
                                                            <CheckCircle2 size={10} /> Booked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="class-card__title">{classItem.classType}</h3>

                                            {classItem.trainerName && (
                                                <p className="class-card__trainer">
                                                    <User size={12} />
                                                    {classItem.trainerName}
                                                </p>
                                            )}

                                            <div className="class-card__details">
                                                <div className="class-card__detail">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(classItem.startTime)}</span>
                                                </div>
                                                <div className="class-card__detail">
                                                    <Clock size={12} />
                                                    <span>{formatTime(classItem.startTime)} · {classItem.durationMinutes}m</span>
                                                </div>
                                                {classItem.location && (
                                                    <div className="class-card__detail">
                                                        <MapPin size={12} />
                                                        <span>{classItem.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="class-card__footer">
                                                {classItem.spotsLeft !== undefined && (
                                                    <span className={`class-card__spots ${classItem.spotsLeft <= 3 ? 'class-card__spots--low' : ''}`}>
                                                        <Users size={12} />
                                                        {classItem.spotsLeft} spots left
                                                    </span>
                                                )}
                                                <button
                                                    className={`class-card__btn ${isBooked ? 'class-card__btn--booked' : ''}`}
                                                    onClick={() => !isBooked && handleBook(classItem.classId)}
                                                    disabled={booking === classItem.classId || isBooked}
                                                >
                                                    {booking === classItem.classId ? (
                                                        <>
                                                            <Loader2 size={12} className="spin" />
                                                            Booking...
                                                        </>
                                                    ) : isBooked ? (
                                                        <>
                                                            <CheckCircle2 size={12} />
                                                            Booked
                                                        </>
                                                    ) : (
                                                        'Book Now'
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="calendar"
                        className="classes-calendar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="classes-calendar__nav">
                            <button
                                className="classes-calendar__nav-btn"
                                onClick={() => setSelectedWeek(w => w - 1)}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="classes-calendar__nav-label">
                                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <button
                                className="classes-calendar__nav-btn"
                                onClick={() => setSelectedWeek(w => w + 1)}
                            >
                                <ChevronRight size={18} />
                            </button>
                            {selectedWeek !== 0 && (
                                <button
                                    className="classes-calendar__today-btn"
                                    onClick={() => setSelectedWeek(0)}
                                >
                                    Today
                                </button>
                            )}
                        </div>

                        <div className="classes-calendar__header">
                            {weekDays.map((day, i) => (
                                <div
                                    key={i}
                                    className={`classes-calendar__day-header ${isToday(day) ? 'classes-calendar__day-header--today' : ''}`}
                                >
                                    <span className="classes-calendar__weekday">
                                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className="classes-calendar__date">{day.getDate()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="classes-calendar__grid">
                            {weekDays.map((day, i) => {
                                const dayClasses = getClassesForDay(day);
                                return (
                                    <div
                                        key={i}
                                        className={`classes-calendar__column ${isToday(day) ? 'classes-calendar__column--today' : ''}`}
                                    >
                                        {dayClasses.length > 0 ? (
                                            dayClasses.map(classItem => {
                                                const config = classTypeConfig[classItem.classType] || classTypeConfig['PT Session'];
                                                const isBooked = classItem.isBooked;

                                                return (
                                                    <div
                                                        key={classItem.classId}
                                                        className={`classes-calendar__item ${isBooked ? 'classes-calendar__item--booked' : ''}`}
                                                        style={{ borderLeftColor: config.color }}
                                                        onClick={() => !isBooked && handleBook(classItem.classId)}
                                                    >
                                                        <div className="classes-calendar__item-icon" style={{ color: config.color }}>
                                                            {config.icon}
                                                        </div>
                                                        <div className="classes-calendar__item-info">
                                                            <span className="classes-calendar__item-time">
                                                                {formatTime(classItem.startTime)}
                                                            </span>
                                                            <span className="classes-calendar__item-type">{classItem.classType}</span>
                                                            {classItem.trainerName && (
                                                                <span className="classes-calendar__item-trainer">
                                                                    {classItem.trainerName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isBooked && (
                                                            <CheckCircle2 size={10} className="classes-calendar__item-check" />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="classes-calendar__empty">
                                                <span>No classes</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AvailableClasses;
