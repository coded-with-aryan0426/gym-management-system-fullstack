import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, List, Clock, MapPin,
    Users, ChevronLeft, ChevronRight, Heart, Zap,
    Dumbbell, Bike, Sparkles, Target, User, CalendarDays,
    Loader2, AlertCircle, CheckCircle2, BookmarkCheck,
    TrendingUp, Star, Award, LayoutGrid, Timer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ptSessionApi } from '../../services/api';
import { UnifiedPage } from '../../components/shared/UnifiedPage';
import { UnifiedCard } from '../../components/shared/UnifiedCard';
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
}

const classTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    'Yoga': { icon: <Heart size={16} />, color: '#34C759', bg: 'rgba(52, 199, 89, 0.12)' },
    'HIIT': { icon: <Zap size={16} />, color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.12)' },
    'Strength': { icon: <Dumbbell size={16} />, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.12)' },
    'Spin': { icon: <Bike size={16} />, color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.12)' },
    'Pilates': { icon: <Sparkles size={16} />, color: '#5AC8FA', bg: 'rgba(90, 200, 250, 0.12)' },
    'Boxing': { icon: <Target size={16} />, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.12)' },
    'PT Session': { icon: <User size={16} />, color: '#5856D6', bg: 'rgba(88, 86, 214, 0.12)' },
    'Group': { icon: <Users size={16} />, color: '#FF2D55', bg: 'rgba(255, 45, 85, 0.12)' }
};

const getClassType = (session: ClassSession): string => {
    if (session.sessionType) return session.sessionType;
    return 'PT Session';
};

const MOCK_CLASSES: ClassSession[] = [
    {
        id: -1,
        sessionType: 'Yoga',
        trainerName: 'Sarah Johnson',
        sessionDate: new Date().toISOString(),
        durationMinutes: 60,
        difficulty: 'Beginner',
        location: 'Studio A',
        spotsLeft: 5,
        status: 'SCHEDULED',
        trainer: { id: 101, fullName: 'Sarah Johnson' }
    },
    {
        id: -2,
        sessionType: 'HIIT',
        trainerName: 'Mike Chen',
        sessionDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 45,
        difficulty: 'Intermediate',
        location: 'Main Floor',
        spotsLeft: 8,
        status: 'SCHEDULED',
        trainer: { id: 102, fullName: 'Mike Chen' }
    },
    {
        id: -3,
        sessionType: 'Strength',
        trainerName: 'Emma Wilson',
        sessionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 60,
        difficulty: 'Advanced',
        location: 'Weight Room',
        spotsLeft: 3,
        status: 'SCHEDULED',
        trainer: { id: 103, fullName: 'Emma Wilson' }
    }
];

const AvailableClasses: React.FC = () => {
    const [sessions, setSessions] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<number | null>(null);
    const [view, setView] = useState<'grid' | 'calendar'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [dashboardStats, setDashboardStats] = useState({ bookedCount: 0 });

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const memberId = user?.userId || user?.id;

    useEffect(() => {
        fetchData();
    }, [memberId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchSessions(), fetchDashboardStats()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        if (!memberId) return;
        try {
            const response = await fetch(`/api/member/dashboard?memberId=${memberId}`);
            if (response.ok) {
                const data = await response.json();
                setDashboardStats({ bookedCount: data.bookedClassesCount || 0 });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        }
    };

    const fetchSessions = async () => {
        try {
            let allSessions: any[] = [];
            
            try {
                // Fetch all sessions (to see available ones)
                // In a real app, this might be a dedicated /classes endpoint
                allSessions = await ptSessionApi.getAllSessions();
            } catch {
                allSessions = [];
            }

            const mapped: ClassSession[] = (allSessions || []).map((s: any) => ({
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
                sessionType: s.sessionType || 'Group',
                difficulty: s.difficulty || 'Intermediate',
                location: s.location || 'Gym Floor',
                spotsLeft: s.spotsLeft ?? 10
            }));

            // Merge with mock classes for demo purposes
            const combined = [...MOCK_CLASSES, ...mapped];
            
            // Filter out past sessions
            const upcoming = combined.filter(s => {
                const sessionDate = new Date(s.sessionDate);
                const now = new Date();
                return sessionDate >= now && s.status !== 'CANCELLED' && s.status !== 'COMPLETED';
            });

            setSessions(upcoming);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
            setSessions(MOCK_CLASSES);
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
                // If it's a mock class, just update state locally
                if (sessionId < 0) {
                    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
                    setSessions(prev => prev.map(s => 
                        s.id === sessionId ? { ...s, memberId: memberId, spotsLeft: (s.spotsLeft || 1) - 1 } : s
                    ));
                } else {
                    // Real API call
                    const updateData = {
                        sessionId: sessionId,
                        trainerId: session.trainerId || 0,
                        memberId: memberId,
                        sessionDate: session.sessionDate,
                        durationMinutes: session.durationMinutes,
                        status: session.status as any
                    };
                    await ptSessionApi.updateSession(sessionId, updateData);
                }
                
                toast.success('Booking Successful! Enjoy your session.');
                fetchDashboardStats();
                if (sessionId > 0) fetchSessions();
            }
        } catch (err) {
            console.error('Booking failed:', err);
            toast.error('Failed to book class. Please try again.');
        } finally {
            setBooking(null);
        }
    };

    const myBookings = useMemo(() => sessions.filter(s => s.memberId === memberId), [sessions, memberId]);
    const todaysClasses = useMemo(() => {
        const today = new Date().toDateString();
        return sessions.filter(s => new Date(s.sessionDate).toDateString() === today);
    }, [sessions]);

    const types = useMemo(() => {
        const uniqueTypes = new Set(sessions.map(s => getClassType(s)));
        return ['All', ...Array.from(uniqueTypes)];
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const type = getClassType(session);
            const trainerName = session.trainer?.fullName || session.trainerName || '';
            const matchesSearch = 
                trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'All' || type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [sessions, searchTerm, selectedType]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
            <div className="classes-loading-container">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p>Curating your schedule...</p>
            </div>
        );
    }

    return (
        <UnifiedPage className="classes-page-unified">
            <header className="classes-hero">
                <div className="classes-hero__content">
                    <h1 className="hero-title">Class Schedule</h1>
                    <p className="hero-subtitle">Optimize your routine with expert-led sessions</p>
                </div>
                
                <div className="classes-hero__stats">
                    <UnifiedCard className="hero-stat-box" hover={false}>
                        <div className="hero-stat-icon" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>
                            <BookmarkCheck size={20} color="#34C759" />
                        </div>
                        <div>
                            <div className="hero-stat-value">{dashboardStats.bookedCount}</div>
                            <div className="hero-stat-label">Booked</div>
                        </div>
                    </UnifiedCard>
                    <UnifiedCard className="hero-stat-box" hover={false}>
                        <div className="hero-stat-icon" style={{ background: 'rgba(0, 122, 255, 0.1)' }}>
                            <Timer size={20} color="#007AFF" />
                        </div>
                        <div>
                            <div className="hero-stat-value">{todaysClasses.length}</div>
                            <div className="hero-stat-label">Today</div>
                        </div>
                    </UnifiedCard>
                </div>
            </header>

            {todaysClasses.length > 0 && (
                <section className="classes-section">
                    <div className="section-header">
                        <h2 className="section-title"><Sparkles size={18} /> Today's Sessions</h2>
                    </div>
                    <div className="horizontal-scroll-container">
                        {todaysClasses.map(session => (
                            <TodayClassCard 
                                key={session.id} 
                                session={session} 
                                memberId={memberId}
                                booking={booking}
                                onBook={handleBook}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="classes-section">
                <div className="section-header">
                    <h2 className="section-title"><LayoutGrid size={18} /> Browse Classes</h2>
                    <div className="classes-toolbar-compact">
                        <div className="search-pill">
                            <Search size={14} />
                            <input 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-scroll">
                            {types.map(type => (
                                <button
                                    key={type}
                                    className={`filter-pill ${selectedType === type ? 'active' : ''}`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="classes-grid-compact">
                    <AnimatePresence>
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session, index) => (
                                <ClassCardCompact 
                                    key={session.id} 
                                    session={session} 
                                    index={index}
                                    memberId={memberId}
                                    booking={booking}
                                    onBook={handleBook}
                                />
                            ))
                        ) : (
                            <motion.div 
                                className="classes-empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Calendar size={40} className="empty-icon" />
                                <h3>No classes found</h3>
                                <p>Try adjusting your filters or search term</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </UnifiedPage>
    );
};

interface CardProps {
    session: ClassSession;
    index?: number;
    memberId?: number;
    booking: number | null;
    onBook: (id: number) => void;
}

const TodayClassCard: React.FC<CardProps> = ({ session, memberId, booking, onBook }) => {
    const type = getClassType(session);
    const config = classTypeConfig[type] || classTypeConfig['PT Session'];
    const isBooked = session.memberId === memberId;

    return (
        <UnifiedCard className="today-class-card" delay={0.1}>
            <div className="today-card-top">
                <div className="type-icon-circle" style={{ background: config.bg, color: config.color }}>
                    {config.icon}
                </div>
                <div className="time-badge">{new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <h3 className="today-card-title">{type}</h3>
            <p className="today-card-trainer">with {session.trainerName || 'Expert Trainer'}</p>
            <div className="today-card-footer">
                <div className="location-info"><MapPin size={12} /> {session.location}</div>
                <button 
                    className={`book-btn-sm ${isBooked ? 'booked' : ''}`}
                    onClick={() => !isBooked && onBook(session.id)}
                    disabled={booking === session.id || isBooked}
                >
                    {booking === session.id ? <Loader2 size={12} className="animate-spin" /> : isBooked ? <CheckCircle2 size={12} /> : 'Book'}
                </button>
            </div>
        </UnifiedCard>
    );
};

const ClassCardCompact: React.FC<CardProps> = ({ session, index, memberId, booking, onBook }) => {
    const type = getClassType(session);
    const config = classTypeConfig[type] || classTypeConfig['PT Session'];
    const isBooked = session.memberId === memberId;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index || 0) * 0.02 }}
        >
            <UnifiedCard className={`class-card-compact-ui ${isBooked ? 'booked' : ''}`}>
                <div className="compact-card-left">
                    <div className="compact-icon-box" style={{ background: config.bg, color: config.color }}>
                        {config.icon}
                    </div>
                    <div className="compact-info">
                        <div className="compact-type">{type}</div>
                        <div className="compact-trainer">Coach {session.trainerName || 'AthlonX'}</div>
                    </div>
                </div>
                <div className="compact-card-mid">
                    <div className="compact-meta"><Clock size={12} /> {new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="compact-meta"><Calendar size={12} /> {new Date(session.sessionDate).toLocaleDateString([], { weekday: 'short' })}</div>
                </div>
                <div className="compact-card-right">
                    <div className={`compact-difficulty ${session.difficulty?.toLowerCase() || 'intermediate'}`}>
                        {session.difficulty || 'Intermediate'}
                    </div>
                    <button 
                        className={`compact-book-btn ${isBooked ? 'booked' : ''}`}
                        onClick={() => !isBooked && onBook(session.id)}
                        disabled={booking === session.id || isBooked}
                    >
                        {booking === session.id ? <Loader2 size={14} className="animate-spin" /> : isBooked ? <CheckCircle2 size={14} /> : 'Book'}
                    </button>
                </div>
            </UnifiedCard>
        </motion.div>
    );
};

export default AvailableClasses;
