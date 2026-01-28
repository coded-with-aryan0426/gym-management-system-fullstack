import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, List, Clock, MapPin,
    Users, ChevronLeft, ChevronRight, Heart, Zap,
    Dumbbell, Bike, Sparkles, Target, User, CalendarDays,
    Loader2, AlertCircle, CheckCircle2, CalendarCheck, Flame
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ptSessionApi } from '../../services/api';
import '../../styles/macos-member.css';
import './AvailableClasses.css';

interface ClassSession {
    id: number;
    sessionDate: string;
    durationMinutes: number;
    status: string;
    trainer?: { id: number; fullName: string };
    member?: { id: number; fullName: string };
    memberId?: number;
    trainerId?: number;
    trainerName?: string;
    memberName?: string;
    sessionType?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    location?: string;
    spotsLeft?: number;
    maxCapacity?: number;
}

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

const generateDummyClasses = (): ClassSession[] => {
    const today = new Date();
    const trainers = [
        { id: 101, fullName: 'Sarah Johnson' },
        { id: 102, fullName: 'Mike Chen' },
        { id: 103, fullName: 'Emma Wilson' },
        { id: 104, fullName: 'David Park' },
        { id: 105, fullName: 'Lisa Anderson' }
    ];
    
    const classTypes = ['Yoga', 'HIIT', 'Strength', 'Spin', 'Pilates', 'Boxing', 'CrossFit', 'Group'];
    const locations = ['Studio A', 'Studio B', 'Main Floor', 'Spin Room', 'Boxing Ring'];
    const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
    
    const dummyClasses: ClassSession[] = [];
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const classDate = new Date(today);
        classDate.setDate(today.getDate() + dayOffset);
        
        const timesForDay = dayOffset === 0 
            ? ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '19:30']
            : ['08:00', '10:00', '12:00', '15:00', '17:30', '19:00'];
        
        timesForDay.forEach((time, idx) => {
            const [hours, minutes] = time.split(':').map(Number);
            const sessionDate = new Date(classDate);
            sessionDate.setHours(hours, minutes, 0, 0);
            
            if (sessionDate > new Date()) {
                const trainer = trainers[Math.floor(Math.random() * trainers.length)];
                const classType = classTypes[Math.floor(Math.random() * classTypes.length)];
                const maxCapacity = Math.floor(Math.random() * 15) + 10;
                const spotsLeft = Math.floor(Math.random() * maxCapacity);
                
                dummyClasses.push({
                    id: 10000 + dayOffset * 100 + idx,
                    sessionDate: sessionDate.toISOString(),
                    durationMinutes: [45, 60, 75, 90][Math.floor(Math.random() * 4)],
                    status: 'SCHEDULED',
                    trainer: trainer,
                    trainerId: trainer.id,
                    trainerName: trainer.fullName,
                    sessionType: classType,
                    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
                    location: locations[Math.floor(Math.random() * locations.length)],
                    spotsLeft: spotsLeft,
                    maxCapacity: maxCapacity
                });
            }
        });
    }
    
    return dummyClasses;
};

const getClassType = (session: ClassSession): string => {
    if (session.sessionType) return session.sessionType;
    return 'PT Session';
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
    const [sessions, setSessions] = useState<ClassSession[]>([]);
    const [bookedSessions, setBookedSessions] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<number | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showBookingSuccess, setShowBookingSuccess] = useState<number | null>(null);

    const getStorageKey = (key: string): string => {
        const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
        return `${key}_port_${port}`;
    };

    const userStr = localStorage.getItem(getStorageKey('user'));
    const user = userStr ? JSON.parse(userStr) : null;
    const memberId = user?.userId || user?.id;

    useEffect(() => {
        fetchSessions();
    }, [memberId]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            let realSessions: any[] = [];
            
            try {
                if (memberId) {
                    realSessions = await ptSessionApi.getMemberSessions(memberId);
                }
            } catch {
                realSessions = [];
            }

            const mappedReal: ClassSession[] = (realSessions || []).map((s: any) => ({
                id: s.sessionId || s.id,
                sessionDate: s.sessionDate,
                durationMinutes: s.durationMinutes,
                status: s.status,
                memberId: s.memberId,
                trainerId: s.trainerId,
                trainerName: s.trainerName,
                memberName: s.memberName,
                trainer: s.trainerName ? { id: s.trainerId, fullName: s.trainerName } : undefined,
                member: s.memberName ? { id: s.memberId, fullName: s.memberName } : undefined,
                sessionType: s.sessionType || 'PT Session',
                difficulty: s.difficulty,
                location: s.location,
                spotsLeft: s.spotsLeft
            }));

            const dummyClasses = generateDummyClasses();
            
            const allSessions = [...mappedReal, ...dummyClasses];

            const upcoming = allSessions.filter(s => {
                const sessionDate = new Date(s.sessionDate);
                const now = new Date();
                return sessionDate >= now && s.status !== 'CANCELLED' && s.status !== 'COMPLETED';
            });

            const booked = mappedReal.filter(s => s.memberId === memberId);
            setBookedSessions(booked);

            setSessions(upcoming);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
            setSessions(generateDummyClasses());
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (sessionId: number) => {
        if (!memberId) {
            toast.error('Please log in to book a class');
            return;
        }

        setBooking(sessionId);
        try {
            const session = sessions.find(s => s.id === sessionId);
            if (session) {
                if (session.id >= 10000) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    setSessions(prev => prev.map(s => 
                        s.id === sessionId 
                            ? { ...s, memberId: memberId, spotsLeft: (s.spotsLeft || 1) - 1 }
                            : s
                    ));
                    setBookedSessions(prev => [...prev, { ...session, memberId: memberId }]);
                } else {
                    const updateData = {
                        sessionId: sessionId,
                        trainerId: session.trainerId || 0,
                        memberId: memberId,
                        sessionDate: session.sessionDate,
                        durationMinutes: session.durationMinutes,
                        status: session.status as any
                    };
                    await ptSessionApi.updateSession(sessionId, updateData);
                    fetchSessions();
                }
                
                setShowBookingSuccess(sessionId);
                toast.success(
                    <div className="toast-booking-success">
                        <CheckCircle2 size={18} />
                        <div>
                            <strong>Booking Confirmed!</strong>
                            <p>{getClassType(session)} with {session.trainer?.fullName}</p>
                        </div>
                    </div>,
                    { duration: 4000, icon: null }
                );
                
                setTimeout(() => setShowBookingSuccess(null), 3000);
            }
        } catch (err) {
            console.error('Booking failed:', err);
            toast.error('Failed to book class. Please try again.');
        } finally {
            setBooking(null);
        }
    };

    const types = useMemo(() => {
        const uniqueTypes = new Set(sessions.map(s => getClassType(s)));
        return ['All', ...Array.from(uniqueTypes)];
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const type = getClassType(session);
            const trainerName = session.trainer?.fullName || '';
            const matchesSearch = 
                trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'All' || type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [sessions, searchTerm, selectedType]);

    const todaysClasses = useMemo(() => {
        const today = new Date();
        return filteredSessions.filter(session => {
            const sessionDate = new Date(session.sessionDate);
            return sessionDate.toDateString() === today.toDateString();
        }).sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
    }, [filteredSessions]);

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

    const getSessionsForDay = (date: Date) =>
        filteredSessions.filter(session => {
            const sessionDate = new Date(session.sessionDate);
            return sessionDate.toDateString() === date.toDateString();
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

    const isSessionBooked = (session: ClassSession) => {
        return session.memberId === memberId || bookedSessions.some(b => b.id === session.id);
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
                        <span className="classes-stat__value">{filteredSessions.length}</span>
                        <span className="classes-stat__label">Available</span>
                    </div>
                    <div className="classes-stat classes-stat--booked">
                        <CalendarCheck size={16} className="classes-stat__icon" />
                        <span className="classes-stat__value">{bookedSessions.length}</span>
                        <span className="classes-stat__label">Booked</span>
                    </div>
                    <div className="classes-stat classes-stat--today">
                        <Flame size={16} className="classes-stat__icon" />
                        <span className="classes-stat__value">{todaysClasses.length}</span>
                        <span className="classes-stat__label">Today</span>
                    </div>
                </div>
            </motion.header>

            {todaysClasses.length > 0 && (
                <motion.section className="todays-classes" variants={itemVariants}>
                    <div className="todays-classes__header">
                        <div className="todays-classes__title">
                            <Flame size={18} className="todays-classes__icon" />
                            <h2>Today's Classes</h2>
                            <span className="todays-classes__count">{todaysClasses.length} sessions</span>
                        </div>
                    </div>
                    <div className="todays-classes__list">
                        {todaysClasses.slice(0, 5).map(session => {
                            const type = getClassType(session);
                            const config = classTypeConfig[type] || classTypeConfig['PT Session'];
                            const isBooked = isSessionBooked(session);
                            const isBookingThis = booking === session.id;
                            const justBooked = showBookingSuccess === session.id;

                            return (
                                <motion.div
                                    key={session.id}
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
                                            <span className="todays-class-item__type">{type}</span>
                                            {session.difficulty && (
                                                <span className={`todays-class-item__difficulty ${getDifficultyColor(session.difficulty)}`}>
                                                    {session.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <div className="todays-class-item__meta">
                                            <span><Clock size={11} /> {formatTime(session.sessionDate)}</span>
                                            <span><User size={11} /> {session.trainer?.fullName}</span>
                                            {session.location && <span><MapPin size={11} /> {session.location}</span>}
                                        </div>
                                    </div>
                                    <div className="todays-class-item__action">
                                        {session.spotsLeft !== undefined && (
                                            <span className="todays-class-item__spots">
                                                {session.spotsLeft} spots
                                            </span>
                                        )}
                                        <button
                                            className={`todays-class-item__btn ${isBooked ? 'todays-class-item__btn--booked' : ''}`}
                                            onClick={() => !isBooked && handleBook(session.id)}
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
                    <button onClick={fetchSessions}>Try Again</button>
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
                        {filteredSessions.length === 0 ? (
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
                                {filteredSessions.map((session) => {
                                    const type = getClassType(session);
                                    const config = classTypeConfig[type] || classTypeConfig['PT Session'];
                                    const isBooked = isSessionBooked(session);
                                    const justBooked = showBookingSuccess === session.id;

                                    return (
                                        <motion.div
                                            key={session.id}
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
                                                    {session.difficulty && (
                                                        <span className={`class-card__badge ${getDifficultyColor(session.difficulty)}`}>
                                                            {session.difficulty}
                                                        </span>
                                                    )}
                                                    {isBooked && (
                                                        <span className="class-card__badge badge--success">
                                                            <CheckCircle2 size={10} /> Booked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="class-card__title">{type}</h3>

                                            {session.trainer && (
                                                <p className="class-card__trainer">
                                                    <User size={12} />
                                                    {session.trainer.fullName}
                                                </p>
                                            )}

                                            <div className="class-card__details">
                                                <div className="class-card__detail">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(session.sessionDate)}</span>
                                                </div>
                                                <div className="class-card__detail">
                                                    <Clock size={12} />
                                                    <span>{formatTime(session.sessionDate)} · {session.durationMinutes}m</span>
                                                </div>
                                                {session.location && (
                                                    <div className="class-card__detail">
                                                        <MapPin size={12} />
                                                        <span>{session.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="class-card__footer">
                                                {session.spotsLeft !== undefined && (
                                                    <span className={`class-card__spots ${session.spotsLeft <= 3 ? 'class-card__spots--low' : ''}`}>
                                                        <Users size={12} />
                                                        {session.spotsLeft} spots left
                                                    </span>
                                                )}
                                                <button
                                                    className={`class-card__btn ${isBooked ? 'class-card__btn--booked' : ''}`}
                                                    onClick={() => !isBooked && handleBook(session.id!)}
                                                    disabled={booking === session.id || isBooked}
                                                >
                                                    {booking === session.id ? (
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
                                const dayClasses = getSessionsForDay(day);
                                return (
                                    <div
                                        key={i}
                                        className={`classes-calendar__column ${isToday(day) ? 'classes-calendar__column--today' : ''}`}
                                    >
                                        {dayClasses.length > 0 ? (
                                            dayClasses.map(session => {
                                                const type = getClassType(session);
                                                const config = classTypeConfig[type] || classTypeConfig['PT Session'];
                                                const isBooked = isSessionBooked(session);

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className={`classes-calendar__item ${isBooked ? 'classes-calendar__item--booked' : ''}`}
                                                        style={{ borderLeftColor: config.color }}
                                                        onClick={() => !isBooked && handleBook(session.id!)}
                                                    >
                                                        <div className="classes-calendar__item-icon" style={{ color: config.color }}>
                                                            {config.icon}
                                                        </div>
                                                        <div className="classes-calendar__item-info">
                                                            <span className="classes-calendar__item-time">
                                                                {formatTime(session.sessionDate)}
                                                            </span>
                                                            <span className="classes-calendar__item-type">{type}</span>
                                                            {session.trainer && (
                                                                <span className="classes-calendar__item-trainer">
                                                                    {session.trainer.fullName}
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
