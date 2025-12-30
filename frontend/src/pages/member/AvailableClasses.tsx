import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import { Search, Calendar, List, Clock, User, Filter, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './AvailableClasses.css';

interface ClassSession {
    id: number;
    sessionDate: string;
    durationMinutes: number;
    status: string;
    trainer?: {
        userId: number;
        fullName: string;
    };
    member?: {
        userId: number;
        fullName: string;
    };
    // Mock fields for UI enhancement since backend might not provide them yet
    type?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    location?: string;
    spotsLeft?: number;
}

const AvailableClasses: React.FC = () => {
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<number | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState('All');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('/api/pt-sessions');
                if (response.ok) {
                    const data = await response.json();

                    // Filter and Enhance Data
                    const available = data
                        .filter((s: ClassSession) =>
                            s.status?.toUpperCase() === 'SCHEDULED' &&
                            (!s.member || s.member.userId !== user?.id)
                        )
                        .map((s: ClassSession) => ({
                            ...s,
                            type: 'Personal Training', // Default since api is pt-sessions
                            difficulty: 'Intermediate',
                            location: 'Main Gym Floor',
                            spotsLeft: 1
                        }));

                    setClasses(available);
                }
            } catch (error) {
                console.error('Failed to fetch classes:', error);
                toast.error("Failed to load classes");
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user?.id]);

    const handleBook = async (classId: number) => {
        if (!user?.id) return;

        setBooking(classId);
        try {
            const response = await fetch(`/api/member/classes/book?memberId=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId }),
            });

            if (response.ok) {
                setClasses(prev => prev.filter(c => c.id !== classId));
                toast.success('Class booked successfully!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to book class');
            }
        } catch (error) {
            console.error('Failed to book:', error);
            toast.error('Failed to book class');
        } finally {
            setBooking(null);
        }
    };

    // Filtering Logic
    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.trainer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTrainer = selectedTrainer === 'All' || cls.trainer?.fullName === selectedTrainer;
        return matchesSearch && matchesTrainer;
    });

    // Calendar Helper
    const getWeekDays = () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const weekDays = getWeekDays();

    const getClassesForDay = (date: Date) => {
        return filteredClasses.filter(cls => {
            const clsDate = new Date(cls.sessionDate);
            return clsDate.getDate() === date.getDate() &&
                clsDate.getMonth() === date.getMonth() &&
                clsDate.getFullYear() === date.getFullYear();
        });
    };

    if (loading) return <div className="p-8 text-zinc-400">Loading schedule...</div>;

    // Extract unique trainers for filter
    const trainers = ['All', ...Array.from(new Set(classes.map(c => c.trainer?.fullName).filter(Boolean)))];

    return (
        <div className="space-y-8 fade-in">
            <PageHeader
                title="Class Schedule"
                subtitle="Browse and book upcoming training sessions and classes."
            />

            {/* Toolbar */}
            <div className="classes-toolbar">
                <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by trainer or class..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <select
                            className="filter-select pl-10"
                            value={selectedTrainer}
                            onChange={(e) => setSelectedTrainer(e.target.value)}
                        >
                            {trainers.map((t: any) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="view-toggle">
                    <button
                        className={`view-toggle__btn ${view === 'list' ? 'view-toggle__btn--active' : ''}`}
                        onClick={() => setView('list')}
                    >
                        <List size={18} /> List
                    </button>
                    <button
                        className={`view-toggle__btn ${view === 'calendar' ? 'view-toggle__btn--active' : ''}`}
                        onClick={() => setView('calendar')}
                    >
                        <Calendar size={18} /> Week
                    </button>
                </div>
            </div>

            {/* Content */}
            {view === 'list' ? (
                <div className="classes-grid">
                    {filteredClasses.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-zinc-500">
                            No classes found matching your criteria.
                        </div>
                    ) : (
                        filteredClasses.map(cls => (
                            <div key={cls.id} className="class-card">
                                <div className="class-card__header">
                                    <div className="class-card__type">
                                        <div className="class-card__icon">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <div className="class-card__title">{cls.type}</div>
                                            <div className="class-card__subtitle">{cls.trainer?.fullName}</div>
                                        </div>
                                    </div>
                                    <div className="class-card__difficulty">
                                        {cls.difficulty}
                                    </div>
                                </div>

                                <div className="class-card__details">
                                    <div className="class-detail">
                                        <Calendar size={16} />
                                        {new Date(cls.sessionDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="class-detail">
                                        <Clock size={16} />
                                        {new Date(cls.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({cls.durationMinutes} min)
                                    </div>
                                    <div className="class-detail">
                                        <MapPin size={16} />
                                        {cls.location}
                                    </div>
                                </div>

                                <div className="class-card__footer">
                                    <span className="class-card__spots">
                                        {cls.spotsLeft} spot left
                                    </span>
                                    <button
                                        className="book-btn"
                                        onClick={() => handleBook(cls.id)}
                                        disabled={booking === cls.id}
                                    >
                                        {booking === cls.id ? 'Booking...' : 'Book Now'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="calendar-view">
                    <div className="calendar-header">
                        {weekDays.map((day, i) => (
                            <div key={i} className="calendar-day-header">
                                <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className="text-2xl font-light text-white">{day.getDate()}</div>
                            </div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {weekDays.map((day, i) => {
                            const dayClasses = getClassesForDay(day);
                            return (
                                <div key={i} className="calendar-day-column">
                                    {dayClasses.map(cls => (
                                        <div key={cls.id} className="calendar-class" onClick={() => handleBook(cls.id)}>
                                            <div className="calendar-class__time">
                                                {new Date(cls.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="calendar-class__title">{cls.type}</div>
                                            <div className="calendar-class__trainer">{cls.trainer?.fullName}</div>
                                        </div>
                                    ))}
                                    {dayClasses.length === 0 && (
                                        <div className="text-center py-4 text-zinc-700 text-xs">-</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailableClasses;
