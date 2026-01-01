import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, List, Clock, MapPin, Filter,
    Users, ChevronLeft, ChevronRight, Star, Heart, Zap,
    Dumbbell, Bike, Sparkles, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
import './AvailableClasses.css';

// Class type icon and color mapping
const classTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    'Yoga': { icon: <Heart size={24} />, color: 'var(--macos-success)', bg: 'rgba(52, 199, 89, 0.15)' },
    'HIIT': { icon: <Zap size={24} />, color: 'var(--macos-error)', bg: 'rgba(255, 59, 48, 0.15)' },
    'Strength': { icon: <Dumbbell size={24} />, color: 'var(--macos-accent)', bg: 'rgba(0, 122, 255, 0.15)' },
    'Spin': { icon: <Bike size={24} />, color: 'var(--macos-purple)', bg: 'rgba(175, 82, 222, 0.15)' },
    'Pilates': { icon: <Sparkles size={24} />, color: 'var(--macos-teal)', bg: 'rgba(90, 200, 250, 0.15)' },
    'Boxing': { icon: <Target size={24} />, color: 'var(--macos-warning)', bg: 'rgba(255, 149, 0, 0.15)' }
};

interface ClassSession {
    id: number;
    sessionDate: string;
    durationMinutes: number;
    status: string;
    trainer?: { userId: number; fullName: string };
    member?: { userId: number; fullName: string };
    type?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    location?: string;
    spotsLeft?: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const AvailableClasses: React.FC = () => {
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<number | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        // Mock data for development
        const mockClasses: ClassSession[] = [
            { id: 1, sessionDate: '2026-01-02T09:00:00', durationMinutes: 60, status: 'SCHEDULED', trainer: { userId: 1, fullName: 'Sarah Johnson' }, type: 'Yoga', difficulty: 'Beginner', location: 'Room A', spotsLeft: 8 },
            { id: 2, sessionDate: '2026-01-02T18:00:00', durationMinutes: 45, status: 'SCHEDULED', trainer: { userId: 2, fullName: 'Mike Chen' }, type: 'HIIT', difficulty: 'Advanced', location: 'Main Studio', spotsLeft: 3 },
            { id: 3, sessionDate: '2026-01-03T10:00:00', durationMinutes: 60, status: 'SCHEDULED', trainer: { userId: 3, fullName: 'John Smith' }, type: 'Strength', difficulty: 'Intermediate', location: 'Weight Room', spotsLeft: 1 },
            { id: 4, sessionDate: '2026-01-03T14:00:00', durationMinutes: 45, status: 'SCHEDULED', trainer: { userId: 4, fullName: 'Alex Rivera' }, type: 'Spin', difficulty: 'Intermediate', location: 'Cycle Room', spotsLeft: 10 },
            { id: 5, sessionDate: '2026-01-04T08:00:00', durationMinutes: 30, status: 'SCHEDULED', trainer: { userId: 1, fullName: 'Sarah Johnson' }, type: 'Pilates', difficulty: 'Beginner', location: 'Room B', spotsLeft: 12 },
            { id: 6, sessionDate: '2026-01-05T17:00:00', durationMinutes: 60, status: 'SCHEDULED', trainer: { userId: 2, fullName: 'Mike Chen' }, type: 'Boxing', difficulty: 'Advanced', location: 'Boxing Ring', spotsLeft: 6 }
        ];
        setClasses(mockClasses);
        setLoading(false);
    }, [user?.id]);

    const handleBook = async (classId: number) => {
        setBooking(classId);
        await new Promise(resolve => setTimeout(resolve, 600));
        setClasses(prev => prev.filter(c => c.id !== classId));
        toast.success('Class booked successfully!');
        setBooking(null);
    };

    // Types filter
    const types = ['All', ...new Set(classes.map(c => c.type))];

    // Filter classes
    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.trainer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'All' || cls.type === selectedType;
        return matchesSearch && matchesType;
    });

    // Calendar helpers
    const getWeekDays = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const weekDays = getWeekDays();

    const getClassesForDay = (date: Date) =>
        filteredClasses.filter(cls => {
            const clsDate = new Date(cls.sessionDate);
            return clsDate.toDateString() === date.toDateString();
        });

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Calendar size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Beginner': return 'macos-badge--green';
            case 'Intermediate': return 'macos-badge--orange';
            case 'Advanced': return 'macos-badge--red';
            default: return 'macos-badge--blue';
        }
    };

    return (
        <motion.div
            className="macos-page classes-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="classes__header" variants={itemVariants}>
                <div>
                    <h1 className="macos-heading-xl">Class Schedule</h1>
                    <p className="macos-text-md">Browse and book available group classes</p>
                </div>
            </motion.header>

            {/* Filter Bar */}
            <motion.div className="glass-card glass-card--sm classes__toolbar" variants={itemVariants}>
                <div className="classes__search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search classes or trainers..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="classes__search-input"
                    />
                </div>

                <div className="classes__filters">
                    {types.map(type => (
                        <button
                            key={type}
                            className={`classes__filter-pill ${selectedType === type ? 'classes__filter-pill--active' : ''}`}
                            onClick={() => setSelectedType(type as string)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="classes__view-toggle">
                    <button
                        className={`classes__view-btn ${view === 'list' ? 'classes__view-btn--active' : ''}`}
                        onClick={() => setView('list')}
                    >
                        <List size={18} />
                    </button>
                    <button
                        className={`classes__view-btn ${view === 'calendar' ? 'classes__view-btn--active' : ''}`}
                        onClick={() => setView('calendar')}
                    >
                        <Calendar size={18} />
                    </button>
                </div>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        className="classes__grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredClasses.length === 0 ? (
                            <div className="glass-card glass-card--lg" style={{ gridColumn: '1 / -1' }}>
                                <div className="macos-empty-state">
                                    <div className="macos-empty-state__icon"><Calendar size={24} /></div>
                                    <div className="macos-empty-state__title">No classes found</div>
                                    <div className="macos-empty-state__text">Try adjusting your filters</div>
                                </div>
                            </div>
                        ) : (
                            filteredClasses.map((cls, index) => {
                                const date = new Date(cls.sessionDate);
                                return (
                                    <motion.div
                                        key={cls.id}
                                        className="glass-card classes__card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    >
                                        <div className="classes__card-header">
                                            <div className="classes__card-icon" style={{ background: classTypeConfig[cls.type || '']?.bg, color: classTypeConfig[cls.type || '']?.color }}>
                                                {classTypeConfig[cls.type || '']?.icon || <Calendar size={24} />}
                                            </div>
                                            <span className={`macos-badge ${getDifficultyColor(cls.difficulty || '')}`}>
                                                {cls.difficulty}
                                            </span>
                                        </div>

                                        <h3 className="classes__card-title">{cls.type}</h3>
                                        <p className="classes__card-trainer">with {cls.trainer?.fullName}</p>

                                        <div className="classes__card-details">
                                            <div className="classes__card-detail">
                                                <Calendar size={14} />
                                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="classes__card-detail">
                                                <Clock size={14} />
                                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {cls.durationMinutes}min
                                            </div>
                                            <div className="classes__card-detail">
                                                <MapPin size={14} />
                                                {cls.location}
                                            </div>
                                        </div>

                                        <div className="classes__card-footer">
                                            <span className="classes__card-spots">
                                                <Users size={14} /> {cls.spotsLeft} spots
                                            </span>
                                            <button
                                                className="macos-btn macos-btn--primary macos-btn--sm"
                                                onClick={() => handleBook(cls.id)}
                                                disabled={booking === cls.id}
                                            >
                                                {booking === cls.id ? 'Booking...' : 'Book'}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="calendar"
                        className="glass-card glass-card--lg classes__calendar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="classes__calendar-header">
                            {weekDays.map((day, i) => (
                                <div key={i} className="classes__calendar-day-header">
                                    <span className="classes__calendar-weekday">
                                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className="classes__calendar-date">{day.getDate()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="classes__calendar-grid">
                            {weekDays.map((day, i) => {
                                const dayClasses = getClassesForDay(day);
                                return (
                                    <div key={i} className="classes__calendar-column">
                                        {dayClasses.map(cls => (
                                            <div
                                                key={cls.id}
                                                className="classes__calendar-item"
                                                onClick={() => handleBook(cls.id)}
                                            >
                                                <span className="classes__calendar-item-icon" style={{ color: classTypeConfig[cls.type || '']?.color }}>
                                                    {classTypeConfig[cls.type || '']?.icon || <Calendar size={16} />}
                                                </span>
                                                <span className="classes__calendar-item-time">
                                                    {new Date(cls.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="classes__calendar-item-type">{cls.type}</span>
                                            </div>
                                        ))}
                                        {dayClasses.length === 0 && (
                                            <div className="classes__calendar-empty">—</div>
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
