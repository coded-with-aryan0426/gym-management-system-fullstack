import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, RefreshCw, Filter, Plus, Calendar as CalendarIcon,
    Clock, MapPin, Users, X, Repeat, AlertTriangle,
    CheckCircle, XCircle, List, AlertCircle
} from 'lucide-react';
import './TrainerSchedule.css';
import trainerApi, { type TrainerSession } from '../../services/trainerApi';
import {
    getWeekRange, getWeekDates, formatTime, formatTime24,
    parseSessionDate, calculateEndTime, isToday, formatMonthYear,
    getWeekdayIndex, formatShortDate
} from '../../utils/dateUtils';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ScheduleEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: 'pt' | 'class' | 'meeting' | 'break' | 'blocked';
    status: string;
    notes?: string;
    client?: string;
    recurring: boolean;
    room?: string;
}

// Status-driven UI configuration
const STATUS_UI: Record<string, { color: string; bg: string; label: string; muted: boolean }> = {
    SCHEDULED: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Scheduled', muted: false },
    COMPLETED: { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)', label: 'Completed', muted: true },
    CANCELLED: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', label: 'Cancelled', muted: true },
    MISSED: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Missed', muted: false },
};

const EVENT_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    pt: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', label: 'PT Session' },
    class: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', label: 'Class' },
    meeting: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Meeting' },
    break: { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'Break' },
    blocked: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Blocked' },
};

// ─────────────────────────────────────────────────────────────
// Mapper: PTSession → ScheduleEvent
// ─────────────────────────────────────────────────────────────

function mapSessionToEvent(session: TrainerSession): ScheduleEvent {
    const start = parseSessionDate(session.sessionDate);
    const end = calculateEndTime(start, session.durationMinutes);
    const clientName = session.member?.fullName || 'Unknown Client';

    return {
        id: session.sessionId,
        title: `PT – ${clientName}`,
        start,
        end,
        type: 'pt',
        status: session.status || 'SCHEDULED',
        notes: session.progressNotes,
        client: clientName,
        recurring: session.isRecurring || false,
    };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const MySchedule: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'agenda'>('week');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Data state
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Centralized week range calculation
    const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);
    const weekDates = useMemo(() => getWeekDates(weekRange.start), [weekRange.start]);

    // ─────────────────────────────────────────────────────────
    // Data Fetching
    // ─────────────────────────────────────────────────────────

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const sessions = await trainerApi.getSchedule(weekRange.startISO, weekRange.endISO);
            const mapped = sessions.map(mapSessionToEvent);
            setEvents(mapped);
        } catch (err) {
            console.error('Failed to fetch schedule:', err);
            setError('Failed to load schedule. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [weekRange.startISO, weekRange.endISO]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    // ─────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────

    const goToPrevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        setCurrentDate(prev);
    };

    const goToNextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 7);
        setCurrentDate(next);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // ─────────────────────────────────────────────────────────
    // Filters
    // ─────────────────────────────────────────────────────────

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const filteredEvents = activeFilters.length > 0
        ? events.filter(e => activeFilters.includes(e.status))
        : events;

    // ─────────────────────────────────────────────────────────
    // Stats
    // ─────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const scheduled = events.filter(e => e.status === 'SCHEDULED').length;
        const completed = events.filter(e => e.status === 'COMPLETED').length;
        const totalHours = events.reduce((sum, e) => {
            return sum + (e.end.getTime() - e.start.getTime()) / 3600000;
        }, 0);
        return { scheduled, completed, totalHours: Math.round(totalHours * 10) / 10 };
    }, [events]);

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

    const getEventsForDay = (date: Date) => {
        return filteredEvents.filter(e =>
            e.start.toDateString() === date.toDateString()
        );
    };

    const getEventForSlot = (date: Date, hour: number) => {
        return filteredEvents.find(e => {
            if (e.start.toDateString() !== date.toDateString()) return false;
            const startH = e.start.getHours();
            const endH = e.end.getHours() + (e.end.getMinutes() > 0 ? 1 : 0);
            return hour >= startH && hour < endH;
        });
    };

    const isEventStart = (event: ScheduleEvent, hour: number) => {
        return event.start.getHours() === hour;
    };

    const getEventDuration = (event: ScheduleEvent) => {
        return Math.ceil((event.end.getTime() - event.start.getTime()) / 3600000);
    };

    const formatHour = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${h}:00 ${ampm}`;
    };

    const getStatusConfig = (status: string) => {
        return STATUS_UI[status] || STATUS_UI.SCHEDULED;
    };

    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // ─────────────────────────────────────────────────────────
    // Skeleton Loading
    // ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="trainer-schedule">
                <div className="trainer-schedule__header">
                    <div className="trainer-schedule__title-row">
                        <div className="trainer-schedule__title-section">
                            <h1>My Schedule</h1>
                            <span className="trainer-schedule__week-badge skeleton" style={{ width: 100 }} />
                        </div>
                    </div>
                </div>
                <div className="trainer-schedule__content">
                    <div className="trainer-schedule__skeleton-grid">
                        {Array.from({ length: 21 }).map((_, i) => (
                            <div key={i} className="trainer-schedule__skeleton-slot" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // Error State
    // ─────────────────────────────────────────────────────────

    if (error) {
        return (
            <div className="trainer-schedule">
                <div className="trainer-schedule__header">
                    <div className="trainer-schedule__title-row">
                        <div className="trainer-schedule__title-section">
                            <h1>My Schedule</h1>
                        </div>
                    </div>
                </div>
                <div className="trainer-schedule__error">
                    <AlertCircle size={48} />
                    <h3>Failed to load schedule</h3>
                    <p>{error}</p>
                    <button onClick={fetchSchedule} className="trainer-schedule__retry-btn">
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────

    return (
        <div className="trainer-schedule">
            {/* Header */}
            <div className="trainer-schedule__header">
                <div className="trainer-schedule__title-row">
                    <div className="trainer-schedule__title-section">
                        <h1>My Schedule</h1>
                        <span className="trainer-schedule__week-badge">
                            <CalendarIcon size={10} />
                            Week of {formatShortDate(weekRange.start)}
                        </span>
                    </div>

                    <div className="trainer-schedule__week-stats">
                        <div className="trainer-schedule__week-stat trainer-schedule__week-stat--highlight">
                            <span className="trainer-schedule__week-stat-value">{stats.scheduled}</span>
                            <span className="trainer-schedule__week-stat-label">Upcoming</span>
                        </div>
                        <div className="trainer-schedule__week-stat">
                            <span className="trainer-schedule__week-stat-value">{stats.completed}</span>
                            <span className="trainer-schedule__week-stat-label">Completed</span>
                        </div>
                        <div className="trainer-schedule__week-stat">
                            <span className="trainer-schedule__week-stat-value">{stats.totalHours}h</span>
                            <span className="trainer-schedule__week-stat-label">Total Hours</span>
                        </div>
                    </div>

                    <div className="trainer-schedule__header-actions">
                        <button className="trainer-schedule__sync-btn" onClick={fetchSchedule}>
                            <RefreshCw size={12} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="trainer-schedule__content">
                {/* Toolbar */}
                <div className="trainer-schedule__toolbar">
                    <div className="trainer-schedule__view-toggle">
                        <button className={viewMode === 'agenda' ? 'active' : ''} onClick={() => setViewMode('agenda')}>
                            <List size={12} /> Agenda
                        </button>
                        <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>Day</button>
                        <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
                    </div>

                    <div className="trainer-schedule__date-nav">
                        <button className="trainer-schedule__nav-btn" onClick={goToPrevWeek}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="trainer-schedule__date-text">{formatMonthYear(currentDate)}</span>
                        <button className="trainer-schedule__nav-btn" onClick={goToNextWeek}>
                            <ChevronRight size={16} />
                        </button>
                        <button className="trainer-schedule__today-btn" onClick={goToToday}>Today</button>
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

                {/* Filters Panel */}
                {showFilters && (
                    <div className="trainer-schedule__filters-panel">
                        <span className="trainer-schedule__filters-label">Status:</span>
                        {Object.entries(STATUS_UI).map(([status, config]) => (
                            <button
                                key={status}
                                className={`trainer-schedule__filter-chip ${activeFilters.includes(status) ? 'active' : ''}`}
                                onClick={() => toggleFilter(status)}
                                style={{ '--chip-color': config.color } as React.CSSProperties}
                            >
                                <span className="trainer-schedule__filter-dot" style={{ background: config.color }} />
                                {config.label}
                            </button>
                        ))}
                        {activeFilters.length > 0 && (
                            <button className="trainer-schedule__clear-filters" onClick={() => setActiveFilters([])}>
                                Clear all
                            </button>
                        )}
                    </div>
                )}

                {/* Week View */}
                {viewMode === 'week' && (
                    <div className="trainer-schedule__week-view">
                        <div className="trainer-schedule__week-header">
                            <div className="trainer-schedule__time-gutter" />
                            {weekDates.map((date, i) => {
                                const dayEvents = getEventsForDay(date);
                                const isTodayDate = isToday(date);
                                return (
                                    <div key={i} className={`trainer-schedule__week-day-header ${isTodayDate ? 'trainer-schedule__week-day-header--today' : ''}`}>
                                        <span className="trainer-schedule__week-day-name">{weekDayNames[i]}</span>
                                        <span className={`trainer-schedule__week-day-date ${isTodayDate ? 'trainer-schedule__week-day-date--today' : ''}`}>
                                            {date.getDate()}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="trainer-schedule__week-day-count">{dayEvents.length} sessions</span>
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

                            {weekDates.map((date, dayIndex) => {
                                const isTodayDate = isToday(date);
                                return (
                                    <div key={dayIndex} className={`trainer-schedule__day-column ${isTodayDate ? 'trainer-schedule__day-column--today' : ''}`}>
                                        {hours.map(hour => {
                                            const event = getEventForSlot(date, hour);
                                            const statusConfig = event ? getStatusConfig(event.status) : null;

                                            if (event && !isEventStart(event, hour)) {
                                                return <div key={hour} className="trainer-schedule__hour-slot trainer-schedule__hour-slot--occupied" />;
                                            }

                                            return (
                                                <div key={hour} className="trainer-schedule__hour-slot">
                                                    {event && isEventStart(event, hour) && (
                                                        <div
                                                            className={`trainer-schedule__event-block ${statusConfig?.muted ? 'trainer-schedule__event-block--muted' : ''}`}
                                                            style={{
                                                                height: `calc(${getEventDuration(event) * 100}% + ${(getEventDuration(event) - 1)}px)`,
                                                                background: statusConfig?.bg,
                                                                borderLeftColor: statusConfig?.color
                                                            }}
                                                            onClick={() => setSelectedEvent(event)}
                                                        >
                                                            <div className="trainer-schedule__event-time">
                                                                {formatTime(event.start)} - {formatTime(event.end)}
                                                            </div>
                                                            <div className="trainer-schedule__event-title">
                                                                {event.title}
                                                                {event.recurring && <Repeat size={10} className="trainer-schedule__recurring-icon" />}
                                                            </div>
                                                            {event.status === 'CANCELLED' && (
                                                                <span className="trainer-schedule__event-cancelled">Cancelled</span>
                                                            )}
                                                            {event.status === 'COMPLETED' && (
                                                                <CheckCircle size={12} className="trainer-schedule__event-completed-icon" />
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

                {/* Agenda View */}
                {viewMode === 'agenda' && (
                    <div className="trainer-schedule__agenda-view">
                        <div className="trainer-schedule__agenda-header">
                            <h2>This Week's Sessions</h2>
                            <span className="trainer-schedule__agenda-date">
                                {formatShortDate(weekRange.start)} – {formatShortDate(weekRange.end)}
                            </span>
                        </div>
                        <div className="trainer-schedule__agenda-list">
                            {filteredEvents.length === 0 ? (
                                <div className="trainer-schedule__agenda-empty">
                                    <CalendarIcon size={32} />
                                    <h3>No sessions scheduled</h3>
                                    <p>Your week is clear! Sessions will appear here when booked.</p>
                                </div>
                            ) : (
                                filteredEvents
                                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                                    .map(event => {
                                        const statusConfig = getStatusConfig(event.status);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`trainer-schedule__agenda-card ${statusConfig.muted ? 'trainer-schedule__agenda-card--muted' : ''}`}
                                                style={{ borderLeftColor: statusConfig.color }}
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                <div className="trainer-schedule__agenda-time">
                                                    <span className="trainer-schedule__agenda-date-label">
                                                        {event.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="trainer-schedule__agenda-time-range">
                                                        {formatTime(event.start)} – {formatTime(event.end)}
                                                    </span>
                                                </div>
                                                <div className="trainer-schedule__agenda-content">
                                                    <h3 className="trainer-schedule__agenda-title">
                                                        {event.title}
                                                        {event.recurring && <Repeat size={12} />}
                                                    </h3>
                                                    <div className="trainer-schedule__agenda-status" style={{ color: statusConfig.color }}>
                                                        {statusConfig.label}
                                                    </div>
                                                    {event.notes && (
                                                        <p className="trainer-schedule__agenda-notes">{event.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="trainer-schedule__legend">
                    {Object.entries(STATUS_UI).map(([status, config]) => (
                        <div key={status} className="trainer-schedule__legend-item">
                            <span className="trainer-schedule__legend-dot" style={{ background: config.color }} />
                            {config.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="trainer-schedule__modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="trainer-schedule__modal" onClick={e => e.stopPropagation()}>
                        <div className="trainer-schedule__modal-header">
                            <div
                                className="trainer-schedule__modal-type"
                                style={{ background: getStatusConfig(selectedEvent.status).bg, color: getStatusConfig(selectedEvent.status).color }}
                            >
                                {getStatusConfig(selectedEvent.status).label}
                            </div>
                            <button className="trainer-schedule__modal-close" onClick={() => setSelectedEvent(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="trainer-schedule__modal-body">
                            <h2>{selectedEvent.title}</h2>
                            {selectedEvent.recurring && (
                                <div className="trainer-schedule__modal-recurring">
                                    <Repeat size={14} /> Recurring Session
                                </div>
                            )}
                            <div className="trainer-schedule__modal-details">
                                <div className="trainer-schedule__modal-detail">
                                    <CalendarIcon size={14} />
                                    <span>{selectedEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="trainer-schedule__modal-detail">
                                    <Clock size={14} />
                                    <span>{formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}</span>
                                </div>
                                {selectedEvent.client && (
                                    <div className="trainer-schedule__modal-detail">
                                        <Users size={14} />
                                        <span>{selectedEvent.client}</span>
                                    </div>
                                )}
                            </div>
                            {selectedEvent.notes && (
                                <div className="trainer-schedule__modal-notes">
                                    <h4>Notes</h4>
                                    <p>{selectedEvent.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="trainer-schedule__modal-actions">
                            {selectedEvent.status === 'SCHEDULED' && (
                                <>
                                    <button className="trainer-schedule__modal-btn trainer-schedule__modal-btn--primary">
                                        <CheckCircle size={12} /> Mark Complete
                                    </button>
                                    <button className="trainer-schedule__modal-btn trainer-schedule__modal-btn--danger">
                                        <XCircle size={12} /> Mark No-Show
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySchedule;
