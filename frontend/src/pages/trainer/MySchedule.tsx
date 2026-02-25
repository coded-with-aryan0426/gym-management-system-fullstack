import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, RefreshCw, Plus, Calendar as CalendarIcon,
    Clock, MapPin, Users, X, Repeat, CheckCircle, XCircle, List,
    Zap, Filter, Activity, TrendingUp, Target, LayoutGrid
} from 'lucide-react';
import './TrainerSchedule.css';
import {
    getWeekRange, getWeekDates, formatTime,
    isToday, formatShortDate
} from '../../utils/dateUtils';
import { trainerApi } from '../../services/trainerApi';
import CreateSessionModal from '../../components/Trainer/CreateSessionModal';

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

const STATUS_UI: Record<string, { color: string; bg: string; label: string; muted: boolean; gradient: string }> = {
    SCHEDULED: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'Scheduled', muted: false, gradient: 'linear-gradient(135deg,#10B981,#059669)' },
    UPCOMING:  { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'Upcoming',  muted: false, gradient: 'linear-gradient(135deg,#10B981,#059669)' },
    COMPLETED: { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', label: 'Completed', muted: true,  gradient: 'linear-gradient(135deg,#6B7280,#4B5563)' },
    CANCELLED: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   label: 'Cancelled', muted: true,  gradient: 'linear-gradient(135deg,#EF4444,#DC2626)' },
    MISSED:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  label: 'Missed',    muted: false, gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
};

const TYPE_CONFIG: Record<string, { color: string; bg: string; label: string; gradient: string }> = {
    pt:      { color: '#10B981', bg: 'rgba(16,185,129,0.15)',  label: 'PT Session', gradient: 'linear-gradient(135deg,#10B981,#059669)' },
    class:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', label: 'Class',      gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
    meeting: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'Meeting',    gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
    break:   { color: '#6B7280', bg: 'rgba(107,114,128,0.15)',label: 'Break',      gradient: 'linear-gradient(135deg,#6B7280,#4B5563)' },
    blocked: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  label: 'Blocked',    gradient: 'linear-gradient(135deg,#EF4444,#DC2626)' },
};

const FILTER_CHIPS = [
    { key: 'SCHEDULED', label: 'Scheduled', color: '#10B981' },
    { key: 'COMPLETED', label: 'Completed', color: '#6B7280' },
    { key: 'CANCELLED', label: 'Cancelled', color: '#EF4444' },
    { key: 'MISSED',    label: 'Missed',    color: '#F59E0B' },
];

const TYPE_FILTER_CHIPS = [
    { key: 'pt',      label: 'PT',      color: '#10B981' },
    { key: 'class',   label: 'Class',   color: '#8B5CF6' },
    { key: 'meeting', label: 'Meeting', color: '#F59E0B' },
];

const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM – 7 PM
const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const MySchedule: React.FC = () => {
    const [currentDate, setCurrentDate]     = useState(new Date());
    const [viewMode, setViewMode]           = useState<'day' | 'week' | 'agenda'>('week');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showFilters, setShowFilters]     = useState(false);
    const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
    const [activeTypeFilters, setActiveTypeFilters]     = useState<string[]>([]);

    const [events, setEvents]   = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createModalDate, setCreateModalDate]     = useState<Date | undefined>();
    const [createModalTime, setCreateModalTime]     = useState<number | undefined>();

    const [now, setNow] = useState(new Date());

    const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);
    const weekDates = useMemo(() => getWeekDates(weekRange.start), [weekRange.start]);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    // ── Data Fetch ──────────────────────────────────────────
    const fetchSchedule = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const startStr = weekRange.start.toISOString().split('T')[0];
            const endStr   = weekRange.end.toISOString().split('T')[0];
            const [ptSessions, classesData] = await Promise.all([
                trainerApi.getSchedule(startStr, endStr),
                trainerApi.getClasses(startStr, endStr),
            ]);
            const mapped: ScheduleEvent[] = [];
            ptSessions.forEach((s: any) => {
                mapped.push({
                    id: parseInt(s.id), title: s.title,
                    start: new Date(s.startTime), end: new Date(s.endTime),
                    type: 'pt', status: (s.status || 'SCHEDULED').toUpperCase(),
                    client: s.title.replace('PT: ', ''), recurring: false,
                    notes: s.notes, room: s.room,
                });
            });
            classesData.forEach((cls: any) => {
                mapped.push({
                    id: cls.id + 10000, title: cls.title,
                    start: new Date(`${cls.date}T${cls.startTime}`),
                    end:   new Date(`${cls.date}T${cls.endTime}`),
                    type: 'class', status: cls.status.toUpperCase(),
                    room: cls.room, recurring: cls.recurring, notes: cls.notes,
                });
            });
            setEvents(mapped);
        } catch (e) {
            setError('Failed to load schedule. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [weekRange]);

    useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

    // ── Filters ─────────────────────────────────────────────
    const toggleStatusFilter = (f: string) =>
        setActiveStatusFilters(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);
    const toggleTypeFilter = (f: string) =>
        setActiveTypeFilters(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);
    const clearFilters = () => { setActiveStatusFilters([]); setActiveTypeFilters([]); };
    const totalFilters = activeStatusFilters.length + activeTypeFilters.length;

    const filteredEvents = useMemo(() => {
        let evs = events;
        if (activeStatusFilters.length > 0) evs = evs.filter(e => activeStatusFilters.includes(e.status));
        if (activeTypeFilters.length > 0)   evs = evs.filter(e => activeTypeFilters.includes(e.type));
        return evs;
    }, [events, activeStatusFilters, activeTypeFilters]);

    // ── Stats ────────────────────────────────────────────────
    const stats = useMemo(() => {
        const scheduled  = events.filter(e => e.status === 'SCHEDULED' || e.status === 'UPCOMING').length;
        const completed  = events.filter(e => e.status === 'COMPLETED').length;
        const totalHours = events.reduce((s, e) => s + (e.end.getTime() - e.start.getTime()) / 3600000, 0);
        const ptCount    = events.filter(e => e.type === 'pt').length;
        return { scheduled, completed, totalHours: Math.round(totalHours * 10) / 10, ptCount };
    }, [events]);

    // ── Navigation ───────────────────────────────────────────
    const navigate = (dir: -1 | 1) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + dir * 7);
        setCurrentDate(d);
    };

    // ── Helpers ──────────────────────────────────────────────
    const handleSlotClick = (date: Date, hour: number) => {
        const slot = new Date(date); slot.setHours(hour, 0, 0, 0);
        if (slot < new Date()) return;
        setCreateModalDate(date); setCreateModalTime(hour); setIsCreateModalOpen(true);
    };

    const getEventsForDay = (date: Date) =>
        filteredEvents.filter(e => e.start.toDateString() === date.toDateString());

    const getEventForSlot = (date: Date, hour: number) =>
        filteredEvents.find(e => {
            if (e.start.toDateString() !== date.toDateString()) return false;
            const sh = e.start.getHours();
            const eh = e.end.getHours() + (e.end.getMinutes() > 0 ? 1 : 0);
            return hour >= sh && hour < eh;
        });

    const getTimePosition = (date: Date): number | null => {
        if (!isToday(date)) return null;
        const h = now.getHours(), m = now.getMinutes();
        if (h < 6 || h > 19) return null;
        return ((h - 6) + m / 60) / 14 * 100;
    };

    const fmtHour = (h: number) => {
        const ap = h >= 12 ? 'PM' : 'AM';
        return `${h > 12 ? h - 12 : h === 0 ? 12 : h}${ap}`;
    };

    const statusCfg = (s: string) => STATUS_UI[s] || STATUS_UI.SCHEDULED;
    const typeCfg   = (t: string) => TYPE_CONFIG[t] || TYPE_CONFIG.pt;

    const formatMonthYearRange = () => {
        const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${weekRange.start.toLocaleDateString('en-US', opts)} – ${weekRange.end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
    };

    // ── Loading ──────────────────────────────────────────────
    if (loading) return (
        <div className="ts-page">
            <div className="ts-header">
                <div className="ts-header__left">
                    <div className="ts-header__icon-badge"><CalendarIcon size={18} /></div>
                    <div><h1 className="ts-header__title">My Schedule</h1>
                    <p className="ts-header__sub">Loading your week…</p></div>
                </div>
            </div>
            <div className="ts-content">
                <div className="ts-skeleton-grid">
                    {Array.from({length:21}).map((_,i)=><div key={i} className="ts-skeleton-slot"/>)}
                </div>
            </div>
        </div>
    );

    // ── Error ────────────────────────────────────────────────
    if (error) return (
        <div className="ts-page">
            <div className="ts-error-state">
                <div className="ts-error-icon"><Activity size={32}/></div>
                <h3>Failed to load schedule</h3>
                <p>{error}</p>
                <button className="ts-btn ts-btn--primary" onClick={fetchSchedule}><RefreshCw size={14}/> Retry</button>
            </div>
        </div>
    );

    // ── Render ───────────────────────────────────────────────
    return (
        <div className="ts-page">

            {/* ── HEADER ── */}
            <div className="ts-header">
                <div className="ts-header__left">
                    <div className="ts-header__icon-badge"><CalendarIcon size={18}/></div>
                    <div>
                        <h1 className="ts-header__title">My Schedule</h1>
                        <p className="ts-header__sub">{formatMonthYearRange()}</p>
                    </div>
                </div>

                {/* Stat Pills */}
                <div className="ts-header__stats">
                    <div className="ts-stat-pill ts-stat-pill--green">
                        <Zap size={13}/>
                        <span className="ts-stat-pill__val">{stats.scheduled}</span>
                        <span className="ts-stat-pill__lbl">Upcoming</span>
                    </div>
                    <div className="ts-stat-pill ts-stat-pill--blue">
                        <CheckCircle size={13}/>
                        <span className="ts-stat-pill__val">{stats.completed}</span>
                        <span className="ts-stat-pill__lbl">Done</span>
                    </div>
                    <div className="ts-stat-pill ts-stat-pill--purple">
                        <Clock size={13}/>
                        <span className="ts-stat-pill__val">{stats.totalHours}h</span>
                        <span className="ts-stat-pill__lbl">Hours</span>
                    </div>
                    <div className="ts-stat-pill ts-stat-pill--amber">
                        <Target size={13}/>
                        <span className="ts-stat-pill__val">{stats.ptCount}</span>
                        <span className="ts-stat-pill__lbl">PT Sessions</span>
                    </div>
                </div>

                <div className="ts-header__actions">
                    <button className="ts-btn ts-btn--ghost" onClick={fetchSchedule}><RefreshCw size={13}/> Sync</button>
                    <button className="ts-btn ts-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={14}/> Schedule
                    </button>
                </div>
            </div>

            {/* ── TOOLBAR ── */}
            <div className="ts-toolbar">
                {/* View toggle */}
                <div className="ts-view-toggle">
                    {(['week','day','agenda'] as const).map(v => (
                        <button key={v} className={viewMode === v ? 'active' : ''} onClick={() => setViewMode(v)}>
                            {v === 'week' ? <><LayoutGrid size={12}/> Week</> :
                             v === 'day'  ? <><CalendarIcon size={12}/> Day</> :
                                           <><List size={12}/> Agenda</>}
                        </button>
                    ))}
                </div>

                {/* Date nav */}
                <div className="ts-date-nav">
                    <button className="ts-nav-btn" onClick={() => navigate(-1)}><ChevronLeft size={14}/></button>
                    <span className="ts-date-label">{formatMonthYearRange()}</span>
                    <button className="ts-nav-btn" onClick={() => navigate(1)}><ChevronRight size={14}/></button>
                    <button className="ts-today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
                </div>

                {/* Filter button */}
                <div className="ts-toolbar__right">
                    <button
                        className={`ts-filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(p => !p)}
                    >
                        <Filter size={13}/>
                        Filters
                        {totalFilters > 0 && <span className="ts-filter-count">{totalFilters}</span>}
                    </button>
                </div>
            </div>

            {/* ── FILTER PANEL ── */}
            {showFilters && (
                <div className="ts-filter-panel">
                    <span className="ts-filter-panel__label">Status</span>
                    {FILTER_CHIPS.map(c => (
                        <button
                            key={c.key}
                            className={`ts-chip ${activeStatusFilters.includes(c.key) ? 'active' : ''}`}
                            style={{ '--chip-color': c.color } as React.CSSProperties}
                            onClick={() => toggleStatusFilter(c.key)}
                        >
                            <span className="ts-chip__dot" style={{ background: c.color }}/>
                            {c.label}
                        </button>
                    ))}
                    <span className="ts-filter-panel__sep"/>
                    <span className="ts-filter-panel__label">Type</span>
                    {TYPE_FILTER_CHIPS.map(c => (
                        <button
                            key={c.key}
                            className={`ts-chip ${activeTypeFilters.includes(c.key) ? 'active' : ''}`}
                            style={{ '--chip-color': c.color } as React.CSSProperties}
                            onClick={() => toggleTypeFilter(c.key)}
                        >
                            <span className="ts-chip__dot" style={{ background: c.color }}/>
                            {c.label}
                        </button>
                    ))}
                    {totalFilters > 0 && (
                        <button className="ts-clear-btn" onClick={clearFilters}>Clear all</button>
                    )}
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <div className="ts-content">

                {/* ══ WEEK VIEW ══ */}
                {viewMode === 'week' && (
                    <div className="ts-week-view">
                        {/* Day headers */}
                        <div className="ts-week-header">
                            <div className="ts-gutter"/>
                            {weekDates.map((date, i) => {
                                const today = isToday(date);
                                const count = getEventsForDay(date).length;
                                return (
                                    <div key={i} className={`ts-week-day-hdr ${today ? 'today' : ''}`}>
                                        <span className="ts-wdh-name">{weekDayNames[i]}</span>
                                        <span className={`ts-wdh-date ${today ? 'today-circle' : ''}`}>
                                            {date.getDate()}
                                        </span>
                                        {count > 0 && <span className="ts-wdh-count">{count}</span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Body */}
                        <div className="ts-week-body">
                            <div className="ts-time-col">
                                {hours.map(h => (
                                    <div key={h} className="ts-time-slot">
                                        <span className="ts-time-lbl">{fmtHour(h)}</span>
                                    </div>
                                ))}
                            </div>
                            {weekDates.map((date, di) => {
                                const tp = getTimePosition(date);
                                return (
                                    <div key={di} className={`ts-day-col ${isToday(date) ? 'today' : ''}`}>
                                        {tp !== null && (
                                            <div className="ts-now-line" style={{ top: `${tp}%` }}>
                                                <div className="ts-now-dot"/>
                                                <div className="ts-now-bar"/>
                                            </div>
                                        )}
                                        {hours.map(hour => {
                                            const event = getEventForSlot(date, hour);
                                            const isStart = event && event.start.getHours() === hour;
                                            const dur = event ? Math.ceil((event.end.getTime() - event.start.getTime()) / 3600000) : 1;
                                            const tc = event ? typeCfg(event.type) : null;
                                            return (
                                                <div
                                                    key={hour}
                                                    className={`ts-hour-slot ${event ? 'occupied' : ''}`}
                                                    onClick={() => !event && handleSlotClick(date, hour)}
                                                >
                                                    {event && isStart && (
                                                        <div
                                                            className={`ts-event-block ${event.status === 'COMPLETED' ? 'muted' : ''}`}
                                                            style={{
                                                                background: tc!.bg,
                                                                borderLeftColor: tc!.color,
                                                                height: `calc(${dur * 100}% - 4px)`,
                                                            }}
                                                            onClick={e => { e.stopPropagation(); setSelectedEvent(event); }}
                                                        >
                                                            <div className="ts-eb-time">
                                                                {formatTime(event.start)}
                                                            </div>
                                                            <div className="ts-eb-title" style={{ color: tc!.color }}>
                                                                {event.title}
                                                            </div>
                                                            {event.room && (
                                                                <div className="ts-eb-room"><MapPin size={8}/>{event.room}</div>
                                                            )}
                                                            {event.recurring && (
                                                                <Repeat size={9} className="ts-eb-recurring"/>
                                                            )}
                                                        </div>
                                                    )}
                                                    {!event && (
                                                        <div className="ts-empty-slot">
                                                            <Plus size={10}/><span>Add</span>
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

                {/* ══ DAY VIEW ══ */}
                {viewMode === 'day' && (
                    <div className="ts-day-view">
                        <div className="ts-day-view-header">
                            <div className={`ts-day-view-title ${isToday(currentDate) ? 'today' : ''}`}>
                                <span className="ts-dvt-weekday">
                                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                </span>
                                <span className="ts-dvt-date">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                {isToday(currentDate) && <span className="ts-today-badge">Today</span>}
                            </div>
                            <span className="ts-day-view-count">
                                {getEventsForDay(currentDate).length} sessions
                            </span>
                        </div>
                        <div className="ts-day-timeline">
                            {hours.map(hour => {
                                const dayEvents = getEventsForDay(currentDate).filter(
                                    e => e.start.getHours() === hour
                                );
                                const tp = getTimePosition(currentDate);
                                return (
                                    <div key={hour} className="ts-day-row">
                                        <div className="ts-day-time">
                                            {fmtHour(hour)}
                                            {tp !== null && Math.floor(tp / (100/14)) === hour - 6 && (
                                                <div className="ts-now-line-day"/>
                                            )}
                                        </div>
                                        <div className="ts-day-events">
                                            {dayEvents.length === 0 ? (
                                                <div
                                                    className="ts-day-empty-slot"
                                                    onClick={() => handleSlotClick(currentDate, hour)}
                                                >
                                                    <Plus size={12}/> Schedule something
                                                </div>
                                            ) : dayEvents.map(event => {
                                                const tc = typeCfg(event.type);
                                                const sc = statusCfg(event.status);
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`ts-day-event ${event.status === 'COMPLETED' ? 'muted' : ''}`}
                                                        style={{ borderLeftColor: tc.color, background: tc.bg }}
                                                        onClick={() => setSelectedEvent(event)}
                                                    >
                                                        <div className="ts-de-header">
                                                            <div className="ts-de-type-badge" style={{ background: tc.gradient }}>
                                                                {tc.label}
                                                            </div>
                                                            <div className="ts-de-status" style={{ color: sc.color }}>
                                                                {sc.label}
                                                            </div>
                                                        </div>
                                                        <h4 className="ts-de-title" style={{ color: tc.color }}>{event.title}</h4>
                                                        <div className="ts-de-meta">
                                                            <span><Clock size={11}/>{formatTime(event.start)}–{formatTime(event.end)}</span>
                                                            {event.room && <span><MapPin size={11}/>{event.room}</span>}
                                                            {event.client && <span><Users size={11}/>{event.client}</span>}
                                                            {event.recurring && <span><Repeat size={11}/> Recurring</span>}
                                                        </div>
                                                        {event.notes && <p className="ts-de-notes">{event.notes}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══ AGENDA VIEW ══ */}
                {viewMode === 'agenda' && (
                    <div className="ts-agenda-view">
                        <div className="ts-agenda-header">
                            <h2>This Week's Sessions</h2>
                            <span>{formatShortDate(weekRange.start)} – {formatShortDate(weekRange.end)}</span>
                        </div>
                        <div className="ts-agenda-list">
                            {filteredEvents.length === 0 ? (
                                <div className="ts-agenda-empty">
                                    <div className="ts-agenda-empty-icon"><CalendarIcon size={28}/></div>
                                    <h3>No sessions this week</h3>
                                    <p>Your schedule is clear. Click "Schedule" to add a session.</p>
                                    <button className="ts-btn ts-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
                                        <Plus size={14}/> Schedule Session
                                    </button>
                                </div>
                            ) : (
                                [...filteredEvents]
                                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                                    .map(event => {
                                        const tc = typeCfg(event.type);
                                        const sc = statusCfg(event.status);
                                        const dur = Math.round((event.end.getTime() - event.start.getTime()) / 60000);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`ts-agenda-card ${sc.muted ? 'muted' : ''}`}
                                                style={{ borderLeftColor: tc.color }}
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                {/* Time column */}
                                                <div className="ts-ac-time">
                                                    <span className="ts-ac-date">
                                                        {event.start.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                                                    </span>
                                                    <span className="ts-ac-start">{formatTime(event.start)}</span>
                                                    <span className="ts-ac-end">{formatTime(event.end)}</span>
                                                    <span className="ts-ac-dur">{dur}m</span>
                                                </div>

                                                {/* Content */}
                                                <div className="ts-ac-content">
                                                    <div className="ts-ac-top">
                                                        <span className="ts-ac-type" style={{ background: tc.gradient }}>
                                                            {tc.label}
                                                        </span>
                                                        <span className="ts-ac-status" style={{ color: sc.color, background: sc.bg }}>
                                                            {sc.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="ts-ac-title" style={{ color: tc.color }}>
                                                        {event.title}
                                                        {event.recurring && <Repeat size={12} style={{ marginLeft: 6 }}/>}
                                                    </h3>
                                                    <div className="ts-ac-meta">
                                                        {event.room   && <span><MapPin size={11}/>{event.room}</span>}
                                                        {event.client && <span><Users size={11}/>{event.client}</span>}
                                                    </div>
                                                    {event.notes && <p className="ts-ac-notes">{event.notes}</p>}
                                                </div>

                                                {/* Actions */}
                                                {(event.status === 'SCHEDULED' || event.status === 'UPCOMING') && (
                                                    <div className="ts-ac-actions">
                                                        <button className="ts-ac-action ts-ac-action--green"
                                                            onClick={e => { e.stopPropagation(); }}>
                                                            <CheckCircle size={15}/>
                                                        </button>
                                                        <button className="ts-ac-action ts-ac-action--red"
                                                            onClick={e => { e.stopPropagation(); }}>
                                                            <XCircle size={15}/>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="ts-legend">
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <div key={key} className="ts-legend-item">
                            <span className="ts-legend-dot" style={{ background: cfg.color }}/>
                            {cfg.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ EVENT DETAIL MODAL ══ */}
            {selectedEvent && (
                <div className="ts-modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="ts-modal" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div
                            className="ts-modal-header"
                            style={{ '--modal-color': typeCfg(selectedEvent.type).color } as React.CSSProperties}
                        >
                            <div className="ts-modal-header-glow"/>
                            <div className="ts-modal-header-left">
                                <div className="ts-modal-icon-badge" style={{ background: typeCfg(selectedEvent.type).gradient }}>
                                    <CalendarIcon size={16}/>
                                </div>
                                <div>
                                    <div className="ts-modal-type-label">{typeCfg(selectedEvent.type).label}</div>
                                    <h2 className="ts-modal-title">{selectedEvent.title}</h2>
                                </div>
                            </div>
                            <button className="ts-modal-close" onClick={() => setSelectedEvent(null)}>
                                <X size={16}/>
                            </button>
                        </div>

                        {/* Status banner */}
                        <div
                            className="ts-modal-status-bar"
                            style={{
                                background: statusCfg(selectedEvent.status).bg,
                                borderColor: statusCfg(selectedEvent.status).color + '40',
                                color: statusCfg(selectedEvent.status).color,
                            }}
                        >
                            <span className="ts-modal-status-dot" style={{ background: statusCfg(selectedEvent.status).color }}/>
                            {statusCfg(selectedEvent.status).label}
                            {selectedEvent.recurring && (
                                <span className="ts-modal-recurring"><Repeat size={12}/> Recurring</span>
                            )}
                        </div>

                        {/* Details grid */}
                        <div className="ts-modal-body">
                            <div className="ts-modal-details">
                                <div className="ts-modal-detail">
                                    <div className="ts-modal-detail-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                        <CalendarIcon size={13}/>
                                    </div>
                                    <div>
                                        <div className="ts-modal-detail-lbl">Date</div>
                                        <div className="ts-modal-detail-val">
                                            {selectedEvent.start.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
                                        </div>
                                    </div>
                                </div>
                                <div className="ts-modal-detail">
                                    <div className="ts-modal-detail-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                                        <Clock size={13}/>
                                    </div>
                                    <div>
                                        <div className="ts-modal-detail-lbl">Time</div>
                                        <div className="ts-modal-detail-val">
                                            {formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}
                                            <span className="ts-modal-duration">
                                                {Math.round((selectedEvent.end.getTime()-selectedEvent.start.getTime())/60000)}m
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {selectedEvent.client && (
                                    <div className="ts-modal-detail">
                                        <div className="ts-modal-detail-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                                            <Users size={13}/>
                                        </div>
                                        <div>
                                            <div className="ts-modal-detail-lbl">Client</div>
                                            <div className="ts-modal-detail-val">{selectedEvent.client}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedEvent.room && (
                                    <div className="ts-modal-detail">
                                        <div className="ts-modal-detail-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                                            <MapPin size={13}/>
                                        </div>
                                        <div>
                                            <div className="ts-modal-detail-lbl">Location</div>
                                            <div className="ts-modal-detail-val">{selectedEvent.room}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedEvent.notes && (
                                <div className="ts-modal-notes">
                                    <div className="ts-modal-notes-lbl">Notes</div>
                                    <p>{selectedEvent.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {(selectedEvent.status === 'SCHEDULED' || selectedEvent.status === 'UPCOMING') && (
                            <div className="ts-modal-actions">
                                <button className="ts-modal-action ts-modal-action--complete">
                                    <CheckCircle size={13}/> Mark Complete
                                </button>
                                <button className="ts-modal-action ts-modal-action--noshow">
                                    <XCircle size={13}/> Mark No-Show
                                </button>
                                <button className="ts-modal-action ts-modal-action--close" onClick={() => setSelectedEvent(null)}>
                                    Close
                                </button>
                            </div>
                        )}
                        {selectedEvent.status !== 'SCHEDULED' && selectedEvent.status !== 'UPCOMING' && (
                            <div className="ts-modal-actions">
                                <button className="ts-modal-action ts-modal-action--close" onClick={() => setSelectedEvent(null)}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Session Modal */}
            <CreateSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { fetchSchedule(); setIsCreateModalOpen(false); }}
                initialDate={createModalDate}
                initialTime={createModalTime}
            />
        </div>
    );
};

export default MySchedule;
