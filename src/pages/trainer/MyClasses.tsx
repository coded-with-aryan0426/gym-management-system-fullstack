import React, { useState, useMemo } from 'react';
import { 
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
    List, Clock, MapPin, Users, Download, ChevronDown, MoreVertical,
    Play, CheckCircle, AlertCircle, XCircle, UserCheck, Bell, Clipboard,
    TrendingUp, Zap, Target
} from 'lucide-react';
import './MyClasses.css';

interface ClassItem {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
    day: string;
    date: string;
    room: string;
    enrolled: number;
    capacity: number;
    status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
    attendees: { confirmed: number; pending: number; absent: number };
    type: 'group' | 'pt';
    recurring: boolean;
    notes?: string;
}

const MyClasses: React.FC = () => {
    const [viewMode, setViewMode] = useState<'today' | 'week' | 'list'>('today');
    const [currentWeek, setCurrentWeek] = useState(0);
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);

    const classes: ClassItem[] = [
        { id: 1, title: 'Morning Yoga', startTime: '06:00', endTime: '07:00', duration: 60, day: 'Mon', date: '2024-03-25', room: 'Studio A', enrolled: 12, capacity: 15, status: 'completed', attendees: { confirmed: 11, pending: 0, absent: 1 }, type: 'group', recurring: true },
        { id: 2, title: 'HIIT Burn', startTime: '08:30', endTime: '09:30', duration: 60, day: 'Mon', date: '2024-03-25', room: 'Main Floor', enrolled: 18, capacity: 20, status: 'in-progress', attendees: { confirmed: 16, pending: 2, absent: 0 }, type: 'group', recurring: true },
        { id: 3, title: 'PT - Sarah Wilson', startTime: '10:00', endTime: '11:00', duration: 60, day: 'Mon', date: '2024-03-25', room: 'PT Area', enrolled: 1, capacity: 1, status: 'upcoming', attendees: { confirmed: 1, pending: 0, absent: 0 }, type: 'pt', recurring: false, notes: 'Focus on lower body strength' },
        { id: 4, title: 'Spin Class', startTime: '12:00', endTime: '12:45', duration: 45, day: 'Mon', date: '2024-03-25', room: 'Spin Studio', enrolled: 20, capacity: 20, status: 'upcoming', attendees: { confirmed: 15, pending: 5, absent: 0 }, type: 'group', recurring: true },
        { id: 5, title: 'PT - Mike Johnson', startTime: '14:00', endTime: '15:00', duration: 60, day: 'Mon', date: '2024-03-25', room: 'PT Area', enrolled: 1, capacity: 1, status: 'upcoming', attendees: { confirmed: 0, pending: 1, absent: 0 }, type: 'pt', recurring: false, notes: 'Recovery session after injury' },
        { id: 6, title: 'Evening Pilates', startTime: '17:30', endTime: '18:30', duration: 60, day: 'Mon', date: '2024-03-25', room: 'Studio B', enrolled: 8, capacity: 12, status: 'upcoming', attendees: { confirmed: 6, pending: 2, absent: 0 }, type: 'group', recurring: true },
        { id: 7, title: 'Strength Training', startTime: '19:00', endTime: '20:00', duration: 60, day: 'Mon', date: '2024-03-25', room: 'Weight Room', enrolled: 10, capacity: 15, status: 'cancelled', attendees: { confirmed: 0, pending: 0, absent: 0 }, type: 'group', recurring: true },
        { id: 8, title: 'Advanced HIIT', startTime: '07:00', endTime: '08:00', duration: 60, day: 'Tue', date: '2024-03-26', room: 'Main Floor', enrolled: 15, capacity: 20, status: 'upcoming', attendees: { confirmed: 12, pending: 3, absent: 0 }, type: 'group', recurring: true },
        { id: 9, title: 'PT - Emma Davis', startTime: '09:00', endTime: '10:00', duration: 60, day: 'Tue', date: '2024-03-26', room: 'PT Area', enrolled: 1, capacity: 1, status: 'upcoming', attendees: { confirmed: 1, pending: 0, absent: 0 }, type: 'pt', recurring: false },
        { id: 10, title: 'Cardio Blast', startTime: '18:00', endTime: '19:00', duration: 60, day: 'Wed', date: '2024-03-27', room: 'Main Floor', enrolled: 22, capacity: 25, status: 'upcoming', attendees: { confirmed: 18, pending: 4, absent: 0 }, type: 'group', recurring: true },
    ];

    const todayClasses = classes.filter(c => c.date === '2024-03-25');
    const currentTime = '09:15';
    
    const stats = useMemo(() => {
        const today = todayClasses;
        const total = today.length;
        const completed = today.filter(c => c.status === 'completed').length;
        const inProgress = today.filter(c => c.status === 'in-progress').length;
        const upcoming = today.filter(c => c.status === 'upcoming').length;
        const cancelled = today.filter(c => c.status === 'cancelled').length;
        const totalAttendees = today.reduce((sum, c) => sum + c.attendees.confirmed, 0);
        const pendingConfirmations = today.reduce((sum, c) => sum + c.attendees.pending, 0);
        const ptSessions = today.filter(c => c.type === 'pt').length;
        return { total, completed, inProgress, upcoming, cancelled, totalAttendees, pendingConfirmations, ptSessions };
    }, [todayClasses]);

    const getNextClass = () => {
        const upcoming = todayClasses.filter(c => c.status === 'upcoming');
        return upcoming.length > 0 ? upcoming[0] : null;
    };

    const nextClass = getNextClass();

    const filteredClasses = useMemo(() => {
        let list = viewMode === 'today' ? todayClasses : classes;
        if (quickFilter === 'pt') list = list.filter(c => c.type === 'pt');
        if (quickFilter === 'group') list = list.filter(c => c.type === 'group');
        if (quickFilter === 'pending') list = list.filter(c => c.attendees.pending > 0);
        return list;
    }, [viewMode, quickFilter, todayClasses, classes]);

    const toggleQuickFilter = (filter: string) => {
        setQuickFilter(prev => prev === filter ? null : filter);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'in-progress': return <Play size={10} />;
            case 'completed': return <CheckCircle size={10} />;
            case 'upcoming': return <Clock size={10} />;
            case 'cancelled': return <XCircle size={10} />;
            default: return null;
        }
    };

    const formatTimeUntil = (startTime: string) => {
        const [hours, mins] = startTime.split(':').map(Number);
        const [currentHours, currentMins] = currentTime.split(':').map(Number);
        const startMinutes = hours * 60 + mins;
        const currentMinutes = currentHours * 60 + currentMins;
        const diff = startMinutes - currentMinutes;
        if (diff <= 0) return 'Now';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    return (
        <div className="my-classes">
            <div className="my-classes__header">
                <div className="my-classes__title-row">
                    <div className="my-classes__title-section">
                        <h1>My Classes</h1>
                        <span className="my-classes__date-badge">
                            <CalendarIcon size={10} />
                            Today, Mar 25
                        </span>
                    </div>

                    <div className="my-classes__quick-stats">
                        <div className="my-classes__quick-stat">
                            <span className="my-classes__quick-stat-value">{stats.total}</span>
                            <span className="my-classes__quick-stat-label">Classes</span>
                        </div>
                        <div className="my-classes__quick-stat my-classes__quick-stat--highlight">
                            <span className="my-classes__quick-stat-value">{stats.totalAttendees}</span>
                            <span className="my-classes__quick-stat-label">Attendees</span>
                        </div>
                        <div className="my-classes__quick-stat">
                            <span className="my-classes__quick-stat-value">{stats.ptSessions}</span>
                            <span className="my-classes__quick-stat-label">PT Sessions</span>
                        </div>
                    </div>

                    <div className="my-classes__header-actions">
                        <button className="my-classes__quick-btn" onClick={() => toggleQuickFilter('pending')}>
                            <Bell size={12} />
                            Pending
                            {stats.pendingConfirmations > 0 && (
                                <span className="my-classes__badge my-classes__badge--warning">{stats.pendingConfirmations}</span>
                            )}
                        </button>
                        <button className="my-classes__quick-btn" onClick={() => toggleQuickFilter('pt')}>
                            <Target size={12} />
                            PT Only
                        </button>
                        <button className="my-classes__add-btn">
                            <Plus size={14} />
                            Schedule
                        </button>
                    </div>
                </div>

                {nextClass && (
                    <div className="my-classes__next-class">
                        <div className="my-classes__next-label">
                            <Zap size={12} />
                            NEXT UP
                        </div>
                        <div className="my-classes__next-info">
                            <h3>{nextClass.title}</h3>
                            <div className="my-classes__next-meta">
                                <span><Clock size={11} /> {nextClass.startTime} - {nextClass.endTime}</span>
                                <span><MapPin size={11} /> {nextClass.room}</span>
                                <span><Users size={11} /> {nextClass.attendees.confirmed}/{nextClass.capacity}</span>
                                {nextClass.notes && <span className="my-classes__next-note"><Clipboard size={11} /> {nextClass.notes}</span>}
                            </div>
                        </div>
                        <div className="my-classes__next-countdown">
                            <span className="my-classes__next-time">{formatTimeUntil(nextClass.startTime)}</span>
                            <span className="my-classes__next-time-label">until start</span>
                        </div>
                        <div className="my-classes__next-actions">
                            <button className="my-classes__btn my-classes__btn--primary">
                                <UserCheck size={12} />
                                Take Attendance
                            </button>
                            <button className="my-classes__btn my-classes__btn--secondary">
                                View Details
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="my-classes__content">
                <div className="my-classes__toolbar">
                    <div className="my-classes__view-toggle">
                        <button 
                            className={viewMode === 'today' ? 'active' : ''} 
                            onClick={() => setViewMode('today')}
                        >
                            Today
                        </button>
                        <button 
                            className={viewMode === 'week' ? 'active' : ''} 
                            onClick={() => setViewMode('week')}
                        >
                            This Week
                        </button>
                        <button 
                            className={viewMode === 'list' ? 'active' : ''} 
                            onClick={() => setViewMode('list')}
                        >
                            <List size={12} />
                            All
                        </button>
                    </div>

                    <div className="my-classes__progress-bar">
                        <div className="my-classes__progress-track">
                            <div 
                                className="my-classes__progress-fill" 
                                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                            />
                            <div 
                                className="my-classes__progress-fill my-classes__progress-fill--active" 
                                style={{ width: `${(stats.inProgress / stats.total) * 100}%`, left: `${(stats.completed / stats.total) * 100}%` }}
                            />
                        </div>
                        <span className="my-classes__progress-text">
                            {stats.completed}/{stats.total} completed
                        </span>
                    </div>

                    <div className="my-classes__filters">
                        <button className="my-classes__export-btn">
                            <Download size={12} /> Export
                        </button>
                    </div>
                </div>

                <div className="my-classes__timeline">
                    {filteredClasses.map((cls) => (
                        <div 
                            key={cls.id} 
                            className={`my-classes__card my-classes__card--${cls.status} ${cls.type === 'pt' ? 'my-classes__card--pt' : ''} ${selectedClass === cls.id ? 'my-classes__card--selected' : ''}`}
                            onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                        >
                            <div className="my-classes__card-time">
                                <span className="my-classes__card-start">{cls.startTime}</span>
                                <span className="my-classes__card-end">{cls.endTime}</span>
                            </div>

                            <div className="my-classes__card-indicator">
                                <div className={`my-classes__card-dot my-classes__card-dot--${cls.status}`} />
                                <div className="my-classes__card-line" />
                            </div>

                            <div className="my-classes__card-body">
                                <div className="my-classes__card-header">
                                    <div className="my-classes__card-title-row">
                                        <h3>{cls.title}</h3>
                                        {cls.type === 'pt' && <span className="my-classes__card-type">PT</span>}
                                        <span className={`my-classes__card-status my-classes__card-status--${cls.status}`}>
                                            {getStatusIcon(cls.status)}
                                            {cls.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <div className="my-classes__card-meta">
                                        <span><MapPin size={11} /> {cls.room}</span>
                                        <span><Clock size={11} /> {cls.duration}min</span>
                                    </div>
                                </div>

                                <div className="my-classes__card-attendance">
                                    <div className="my-classes__attendance-bar">
                                        <div 
                                            className="my-classes__attendance-fill my-classes__attendance-fill--confirmed" 
                                            style={{ width: `${(cls.attendees.confirmed / cls.capacity) * 100}%` }} 
                                        />
                                        <div 
                                            className="my-classes__attendance-fill my-classes__attendance-fill--pending" 
                                            style={{ width: `${(cls.attendees.pending / cls.capacity) * 100}%`, left: `${(cls.attendees.confirmed / cls.capacity) * 100}%` }} 
                                        />
                                    </div>
                                    <div className="my-classes__attendance-stats">
                                        <span className="my-classes__attendance-confirmed">
                                            <UserCheck size={10} /> {cls.attendees.confirmed}
                                        </span>
                                        {cls.attendees.pending > 0 && (
                                            <span className="my-classes__attendance-pending">
                                                <AlertCircle size={10} /> {cls.attendees.pending} pending
                                            </span>
                                        )}
                                        <span className="my-classes__attendance-capacity">
                                            {cls.enrolled}/{cls.capacity} spots
                                        </span>
                                    </div>
                                </div>

                                {cls.notes && (
                                    <div className="my-classes__card-notes">
                                        <Clipboard size={10} />
                                        {cls.notes}
                                    </div>
                                )}

                                {selectedClass === cls.id && (
                                    <div className="my-classes__card-actions">
                                        {cls.status === 'upcoming' && (
                                            <>
                                                <button className="my-classes__action-btn my-classes__action-btn--primary">
                                                    <Play size={12} /> Start Class
                                                </button>
                                                <button className="my-classes__action-btn">
                                                    <UserCheck size={12} /> Attendance
                                                </button>
                                            </>
                                        )}
                                        {cls.status === 'in-progress' && (
                                            <>
                                                <button className="my-classes__action-btn my-classes__action-btn--success">
                                                    <CheckCircle size={12} /> Complete
                                                </button>
                                                <button className="my-classes__action-btn">
                                                    <UserCheck size={12} /> Update Attendance
                                                </button>
                                            </>
                                        )}
                                        {cls.status === 'completed' && (
                                            <button className="my-classes__action-btn">
                                                <TrendingUp size={12} /> View Report
                                            </button>
                                        )}
                                        <button className="my-classes__action-btn">
                                            <MoreVertical size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredClasses.length === 0 && (
                        <div className="my-classes__empty">
                            <CalendarIcon size={32} />
                            <p>No classes scheduled</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyClasses;
