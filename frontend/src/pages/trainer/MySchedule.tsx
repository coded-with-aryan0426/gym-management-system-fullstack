import React, { useState, useMemo } from 'react';
import { 
    ChevronLeft, ChevronRight, RefreshCw, Filter, Plus, Calendar as CalendarIcon,
    Clock, MapPin, Users, MoreVertical, X, Check, Repeat, AlertCircle,
    Target, Zap, Bell, Download, Eye, Edit2, Trash2, Copy
} from 'lucide-react';
import './TrainerSchedule.css';

interface ScheduleEvent {
    id: number;
    title: string;
    date: string;
    day: number;
    startTime: string;
    endTime: string;
    type: 'class' | 'pt' | 'meeting' | 'break' | 'blocked';
    room: string;
    enrolled?: number;
    capacity?: number;
    recurring: boolean;
    recurringDays?: string[];
    notes?: string;
    client?: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

const MySchedule: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 25));
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);

    const events: ScheduleEvent[] = [
        { id: 1, title: 'Morning Yoga', date: '2024-03-25', day: 25, startTime: '06:00', endTime: '07:00', type: 'class', room: 'Studio A', enrolled: 12, capacity: 15, recurring: true, recurringDays: ['Mon', 'Wed', 'Fri'], status: 'confirmed' },
        { id: 2, title: 'HIIT Burn', date: '2024-03-25', day: 25, startTime: '08:00', endTime: '09:00', type: 'class', room: 'Main Floor', enrolled: 18, capacity: 20, recurring: true, recurringDays: ['Mon', 'Thu'], status: 'confirmed' },
        { id: 3, title: 'PT - Sarah Wilson', date: '2024-03-25', day: 25, startTime: '10:00', endTime: '11:00', type: 'pt', room: 'PT Area', client: 'Sarah Wilson', recurring: false, notes: 'Focus on lower body', status: 'confirmed' },
        { id: 4, title: 'Lunch Break', date: '2024-03-25', day: 25, startTime: '12:00', endTime: '13:00', type: 'break', room: '', recurring: true, recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'scheduled' },
        { id: 5, title: 'Spin Class', date: '2024-03-25', day: 25, startTime: '14:00', endTime: '15:00', type: 'class', room: 'Spin Studio', enrolled: 20, capacity: 20, recurring: true, recurringDays: ['Mon', 'Wed'], status: 'confirmed' },
        { id: 6, title: 'PT - Mike Johnson', date: '2024-03-25', day: 25, startTime: '16:00', endTime: '17:00', type: 'pt', room: 'PT Area', client: 'Mike Johnson', recurring: false, notes: 'Upper body focus', status: 'scheduled' },
        { id: 7, title: 'Staff Meeting', date: '2024-03-25', day: 25, startTime: '17:30', endTime: '18:30', type: 'meeting', room: 'Conference Room', recurring: false, status: 'confirmed' },
        { id: 8, title: 'Evening Pilates', date: '2024-03-25', day: 25, startTime: '19:00', endTime: '20:00', type: 'class', room: 'Studio B', enrolled: 8, capacity: 12, recurring: true, recurringDays: ['Mon', 'Thu'], status: 'confirmed' },
        { id: 9, title: 'Advanced HIIT', date: '2024-03-26', day: 26, startTime: '07:00', endTime: '08:00', type: 'class', room: 'Main Floor', enrolled: 15, capacity: 20, recurring: true, recurringDays: ['Tue', 'Thu'], status: 'scheduled' },
        { id: 10, title: 'PT - Emma Davis', date: '2024-03-26', day: 26, startTime: '09:00', endTime: '10:00', type: 'pt', room: 'PT Area', client: 'Emma Davis', recurring: true, recurringDays: ['Tue', 'Fri'], status: 'confirmed' },
        { id: 11, title: 'Strength Training', date: '2024-03-26', day: 26, startTime: '11:00', endTime: '12:00', type: 'class', room: 'Weight Room', enrolled: 10, capacity: 15, recurring: true, status: 'scheduled' },
        { id: 12, title: 'Cardio Blast', date: '2024-03-27', day: 27, startTime: '07:00', endTime: '08:00', type: 'class', room: 'Main Floor', enrolled: 22, capacity: 25, recurring: true, status: 'confirmed' },
        { id: 13, title: 'PT - James Wilson', date: '2024-03-27', day: 27, startTime: '10:00', endTime: '11:00', type: 'pt', room: 'PT Area', client: 'James Wilson', recurring: false, status: 'scheduled' },
        { id: 14, title: 'Blocked - Personal', date: '2024-03-28', day: 28, startTime: '09:00', endTime: '12:00', type: 'blocked', room: '', recurring: false, notes: 'Doctor appointment', status: 'scheduled' },
        { id: 15, title: 'Yoga Flow', date: '2024-03-29', day: 29, startTime: '06:00', endTime: '07:00', type: 'class', room: 'Studio A', enrolled: 10, capacity: 15, recurring: true, status: 'confirmed' },
    ];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 16 }, (_, i) => i + 6);

    const currentWeekStart = 25;
    const weekDates = weekDays.map((_, i) => currentWeekStart + i);

    const stats = useMemo(() => {
        const weekEvents = events.filter(e => e.day >= currentWeekStart && e.day < currentWeekStart + 7);
        const classes = weekEvents.filter(e => e.type === 'class').length;
        const pts = weekEvents.filter(e => e.type === 'pt').length;
        const meetings = weekEvents.filter(e => e.type === 'meeting').length;
        const totalHours = weekEvents.reduce((sum, e) => {
            const [startH] = e.startTime.split(':').map(Number);
            const [endH] = e.endTime.split(':').map(Number);
            return sum + (endH - startH);
        }, 0);
        return { classes, pts, meetings, totalHours };
    }, [events, currentWeekStart]);

    const getEventForSlot = (day: number, hour: number) => {
        return events.find(e => {
            const [startH] = e.startTime.split(':').map(Number);
            const [endH] = e.endTime.split(':').map(Number);
            return e.day === day && hour >= startH && hour < endH;
        });
    };

    const isEventStart = (event: ScheduleEvent, hour: number) => {
        const [startH] = event.startTime.split(':').map(Number);
        return startH === hour;
    };

    const getEventDuration = (event: ScheduleEvent) => {
        const [startH] = event.startTime.split(':').map(Number);
        const [endH] = event.endTime.split(':').map(Number);
        return endH - startH;
    };

    const filteredEvents = activeFilters.length > 0 
        ? events.filter(e => activeFilters.includes(e.type))
        : events;

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const formatHour = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour > 12 ? hour - 12 : hour;
        return `${h}:00 ${ampm}`;
    };

    const getEventTypeConfig = (type: string) => {
        switch (type) {
            case 'class': return { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', label: 'Class' };
            case 'pt': return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', label: 'PT' };
            case 'meeting': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Meeting' };
            case 'break': return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'Break' };
            case 'blocked': return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Blocked' };
            default: return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', label: '' };
        }
    };

    return (
        <div className="trainer-schedule">
            <div className="trainer-schedule__header">
                <div className="trainer-schedule__title-row">
                    <div className="trainer-schedule__title-section">
                        <h1>My Schedule</h1>
                        <span className="trainer-schedule__week-badge">
                            <CalendarIcon size={10} />
                            Week of Mar 25
                        </span>
                    </div>

                    <div className="trainer-schedule__week-stats">
                        <div className="trainer-schedule__week-stat">
                            <span className="trainer-schedule__week-stat-value">{stats.classes}</span>
                            <span className="trainer-schedule__week-stat-label">Classes</span>
                        </div>
                        <div className="trainer-schedule__week-stat trainer-schedule__week-stat--highlight">
                            <span className="trainer-schedule__week-stat-value">{stats.pts}</span>
                            <span className="trainer-schedule__week-stat-label">PT Sessions</span>
                        </div>
                        <div className="trainer-schedule__week-stat">
                            <span className="trainer-schedule__week-stat-value">{stats.totalHours}h</span>
                            <span className="trainer-schedule__week-stat-label">Total Hours</span>
                        </div>
                    </div>

                    <div className="trainer-schedule__header-actions">
                        <button className="trainer-schedule__sync-btn">
                            <RefreshCw size={12} />
                            Sync Calendar
                        </button>
                        <button className="trainer-schedule__export-btn">
                            <Download size={12} />
                            Export
                        </button>
                        <button className="trainer-schedule__add-btn" onClick={() => setShowAddModal(true)}>
                            <Plus size={14} />
                            Add Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="trainer-schedule__content">
                <div className="trainer-schedule__toolbar">
                    <div className="trainer-schedule__view-toggle">
                        <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>Day</button>
                        <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
                        <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
                    </div>

                    <div className="trainer-schedule__date-nav">
                        <button className="trainer-schedule__nav-btn"><ChevronLeft size={16} /></button>
                        <span className="trainer-schedule__date-text">March 2024</span>
                        <button className="trainer-schedule__nav-btn"><ChevronRight size={16} /></button>
                        <button className="trainer-schedule__today-btn">Today</button>
                    </div>

                    <div className="trainer-schedule__filter-group">
                        <button 
                            className={`trainer-schedule__filter-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={12} />
                            Filter
                            {activeFilters.length > 0 && (
                                <span className="trainer-schedule__filter-count">{activeFilters.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="trainer-schedule__filters-panel">
                        <span className="trainer-schedule__filters-label">Show:</span>
                        {['class', 'pt', 'meeting', 'break', 'blocked'].map(type => {
                            const config = getEventTypeConfig(type);
                            return (
                                <button 
                                    key={type}
                                    className={`trainer-schedule__filter-chip ${activeFilters.includes(type) ? 'active' : ''}`}
                                    onClick={() => toggleFilter(type)}
                                    style={{ '--chip-color': config.color } as React.CSSProperties}
                                >
                                    <span className="trainer-schedule__filter-dot" style={{ background: config.color }} />
                                    {config.label}
                                </button>
                            );
                        })}
                        {activeFilters.length > 0 && (
                            <button className="trainer-schedule__clear-filters" onClick={() => setActiveFilters([])}>
                                Clear all
                            </button>
                        )}
                    </div>
                )}

                {viewMode === 'week' && (
                    <div className="trainer-schedule__week-view">
                        <div className="trainer-schedule__week-header">
                            <div className="trainer-schedule__time-gutter" />
                            {weekDays.map((day, i) => {
                                const date = weekDates[i];
                                const isToday = date === 25;
                                const dayEvents = filteredEvents.filter(e => e.day === date);
                                return (
                                    <div key={day} className={`trainer-schedule__week-day-header ${isToday ? 'trainer-schedule__week-day-header--today' : ''}`}>
                                        <span className="trainer-schedule__week-day-name">{day}</span>
                                        <span className={`trainer-schedule__week-day-date ${isToday ? 'trainer-schedule__week-day-date--today' : ''}`}>
                                            {date}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="trainer-schedule__week-day-count">{dayEvents.length} events</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="trainer-schedule__week-body">
                            <div className="trainer-schedule__time-column">
                                {hours.map(hour => (
                                    <div key={hour} className="trainer-schedule__time-slot">
                                        <span className="trainer-schedule__time-label">{formatHour(hour)}</span>
                                    </div>
                                ))}
                            </div>

                            {weekDays.map((day, dayIndex) => {
                                const date = weekDates[dayIndex];
                                const isToday = date === 25;
                                return (
                                    <div key={day} className={`trainer-schedule__day-column ${isToday ? 'trainer-schedule__day-column--today' : ''}`}>
                                        {hours.map(hour => {
                                            const event = getEventForSlot(date, hour);
                                            const config = event ? getEventTypeConfig(event.type) : null;
                                            
                                            if (event && !isEventStart(event, hour)) {
                                                return <div key={hour} className="trainer-schedule__hour-slot trainer-schedule__hour-slot--occupied" />;
                                            }
                                            
                                            return (
                                                <div 
                                                    key={hour} 
                                                    className="trainer-schedule__hour-slot"
                                                    onClick={() => !event && setSelectedSlot({ day: date, hour })}
                                                >
                                                    {event && isEventStart(event, hour) && (
                                                        <div 
                                                            className={`trainer-schedule__event-block trainer-schedule__event-block--${event.type}`}
                                                            style={{ 
                                                                height: `calc(${getEventDuration(event) * 100}% + ${(getEventDuration(event) - 1)}px)`,
                                                                background: config?.bg,
                                                                borderLeftColor: config?.color
                                                            }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                                        >
                                                            <div className="trainer-schedule__event-time">
                                                                {event.startTime} - {event.endTime}
                                                            </div>
                                                            <div className="trainer-schedule__event-title">{event.title}</div>
                                                            {event.room && (
                                                                <div className="trainer-schedule__event-room">
                                                                    <MapPin size={9} /> {event.room}
                                                                </div>
                                                            )}
                                                            {event.enrolled !== undefined && (
                                                                <div className="trainer-schedule__event-enrolled">
                                                                    <Users size={9} /> {event.enrolled}/{event.capacity}
                                                                </div>
                                                            )}
                                                            {event.recurring && (
                                                                <div className="trainer-schedule__event-recurring">
                                                                    <Repeat size={9} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {!event && (
                                                        <div className="trainer-schedule__empty-slot">
                                                            <Plus size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {viewMode === 'day' && (
                    <div className="trainer-schedule__day-view">
                        <div className="trainer-schedule__day-header">
                            <h2>Monday, March 25</h2>
                            <span className="trainer-schedule__day-summary">
                                {filteredEvents.filter(e => e.day === 25).length} events scheduled
                            </span>
                        </div>
                        <div className="trainer-schedule__day-timeline">
                            {hours.map(hour => {
                                const hourEvents = filteredEvents.filter(e => {
                                    const [startH] = e.startTime.split(':').map(Number);
                                    return e.day === 25 && startH === hour;
                                });
                                return (
                                    <div key={hour} className="trainer-schedule__day-row">
                                        <div className="trainer-schedule__day-time">{formatHour(hour)}</div>
                                        <div className="trainer-schedule__day-events">
                                            {hourEvents.map(event => {
                                                const config = getEventTypeConfig(event.type);
                                                return (
                                                    <div 
                                                        key={event.id}
                                                        className="trainer-schedule__day-event"
                                                        style={{ borderLeftColor: config.color, background: config.bg }}
                                                        onClick={() => setSelectedEvent(event)}
                                                    >
                                                        <div className="trainer-schedule__day-event-header">
                                                            <h4>{event.title}</h4>
                                                            <span className="trainer-schedule__day-event-type" style={{ color: config.color }}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                        <div className="trainer-schedule__day-event-meta">
                                                            <span><Clock size={11} /> {event.startTime} - {event.endTime}</span>
                                                            {event.room && <span><MapPin size={11} /> {event.room}</span>}
                                                            {event.enrolled !== undefined && <span><Users size={11} /> {event.enrolled}/{event.capacity}</span>}
                                                        </div>
                                                        {event.notes && (
                                                            <div className="trainer-schedule__day-event-notes">{event.notes}</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {hourEvents.length === 0 && (
                                                <div className="trainer-schedule__day-empty" onClick={() => setSelectedSlot({ day: 25, hour })}>
                                                    <Plus size={12} /> Add event
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {viewMode === 'month' && (
                    <div className="trainer-schedule__month-view">
                        <div className="trainer-schedule__month-weekdays">
                            {weekDays.map(day => (
                                <div key={day} className="trainer-schedule__month-weekday">{day}</div>
                            ))}
                        </div>
                        <div className="trainer-schedule__month-grid">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="trainer-schedule__month-week">
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <div key={j} className="trainer-schedule__month-day" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="trainer-schedule__legend">
                    {['class', 'pt', 'meeting', 'break', 'blocked'].map(type => {
                        const config = getEventTypeConfig(type);
                        return (
                            <div key={type} className="trainer-schedule__legend-item">
                                <span className="trainer-schedule__legend-dot" style={{ background: config.color }} />
                                {config.label}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedEvent && (
                <div className="trainer-schedule__modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="trainer-schedule__modal" onClick={e => e.stopPropagation()}>
                        <div className="trainer-schedule__modal-header">
                            <div className="trainer-schedule__modal-type" style={{ background: getEventTypeConfig(selectedEvent.type).bg, color: getEventTypeConfig(selectedEvent.type).color }}>
                                {getEventTypeConfig(selectedEvent.type).label}
                            </div>
                            <button className="trainer-schedule__modal-close" onClick={() => setSelectedEvent(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="trainer-schedule__modal-body">
                            <h2>{selectedEvent.title}</h2>
                            <div className="trainer-schedule__modal-details">
                                <div className="trainer-schedule__modal-detail">
                                    <Clock size={14} />
                                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                                </div>
                                {selectedEvent.room && (
                                    <div className="trainer-schedule__modal-detail">
                                        <MapPin size={14} />
                                        <span>{selectedEvent.room}</span>
                                    </div>
                                )}
                                {selectedEvent.enrolled !== undefined && (
                                    <div className="trainer-schedule__modal-detail">
                                        <Users size={14} />
                                        <span>{selectedEvent.enrolled} / {selectedEvent.capacity} enrolled</span>
                                    </div>
                                )}
                                {selectedEvent.recurring && (
                                    <div className="trainer-schedule__modal-detail">
                                        <Repeat size={14} />
                                        <span>Recurring: {selectedEvent.recurringDays?.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                            {selectedEvent.notes && (
                                <div className="trainer-schedule__modal-notes">
                                    <h4>Notes</h4>
                                    <p>{selectedEvent.notes}</p>
                                </div>
                            )}
                            {selectedEvent.client && (
                                <div className="trainer-schedule__modal-client">
                                    <h4>Client</h4>
                                    <p>{selectedEvent.client}</p>
                                </div>
                            )}
                        </div>
                        <div className="trainer-schedule__modal-actions">
                            {selectedEvent.type === 'class' && (
                                <button className="trainer-schedule__modal-btn trainer-schedule__modal-btn--primary">
                                    <Users size={12} /> Take Attendance
                                </button>
                            )}
                            <button className="trainer-schedule__modal-btn">
                                <Edit2 size={12} /> Edit
                            </button>
                            <button className="trainer-schedule__modal-btn">
                                <Copy size={12} /> Duplicate
                            </button>
                            <button className="trainer-schedule__modal-btn trainer-schedule__modal-btn--danger">
                                <Trash2 size={12} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySchedule;
