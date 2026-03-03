import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
    List, Clock, MapPin, Users, Download, MoreVertical,
    Play, CheckCircle, AlertCircle, XCircle, UserCheck, Bell, Clipboard,
    TrendingUp, Zap, Target, Loader2, Edit, Trash2, FileText,
    Activity, Star, Dumbbell, PersonStanding, BarChart2
} from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerClassItem } from '../../services/trainerApi';
import './MyClasses.css';
import CreateClassModal from './CreateClassModal';
import ClassAttendanceModal from './ClassAttendanceModal';
import ClassReportModal from './ClassReportModal';

/* ── per-class-type visual config ── */
const CLASS_TYPE_CONFIG: Record<string, { gradient: string; iconBg: string; icon: React.ReactNode; label: string }> = {
    pt: { gradient: 'linear-gradient(135deg,#7C3AED,#A855F7)', iconBg: 'rgba(139,92,246,0.18)', icon: <Target size={14} />, label: 'Personal Training' },
    group: { gradient: 'linear-gradient(135deg,#0EA5E9,#6366F1)', iconBg: 'rgba(99,102,241,0.18)', icon: <Users size={14} />, label: 'Group Class' },
    yoga: { gradient: 'linear-gradient(135deg,#10B981,#34D399)', iconBg: 'rgba(16,185,129,0.18)', icon: <Activity size={14} />, label: 'Yoga' },
    hiit: { gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)', iconBg: 'rgba(245,158,11,0.18)', icon: <Zap size={14} />, label: 'HIIT' },
    strength: { gradient: 'linear-gradient(135deg,#EF4444,#F97316)', iconBg: 'rgba(239,68,68,0.18)', icon: <Dumbbell size={14} />, label: 'Strength' },
    default: { gradient: 'linear-gradient(135deg,#3B82F6,#06B6D4)', iconBg: 'rgba(59,130,246,0.18)', icon: <Star size={14} />, label: 'Class' },
};

/* ── status config ── */
const STATUS_CONFIG: Record<string, { color: string; bg: string; dotColor: string; label: string; icon: React.ReactNode }> = {
    upcoming: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', dotColor: '#3B82F6', label: 'Upcoming', icon: <Clock size={10} /> },
    'in-progress': { color: '#34D399', bg: 'rgba(52,211,153,0.12)', dotColor: '#10B981', label: 'In Progress', icon: <Play size={10} /> },
    completed: { color: '#A3A3A3', bg: 'rgba(163,163,163,0.12)', dotColor: '#737373', label: 'Completed', icon: <CheckCircle size={10} /> },
    cancelled: { color: '#F87171', bg: 'rgba(248,113,113,0.12)', dotColor: '#EF4444', label: 'Cancelled', icon: <XCircle size={10} /> },
};

/* ── helper: get type config (fallback to default) ── */
const getTypeCfg = (type: string) => CLASS_TYPE_CONFIG[type] ?? CLASS_TYPE_CONFIG.default;
const getStatusCfg = (status: string) => STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;

const MyClasses: React.FC = () => {
    const [viewMode, setViewMode] = useState<'today' | 'week' | 'list'>(() => {
        const saved = localStorage.getItem('trainer_classes_view_mode');
        return (saved === 'today' || saved === 'week' || saved === 'list') ? saved : 'today';
    });

    const [currentWeek, setCurrentWeek] = useState(0);
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [classes, setClasses] = useState<TrainerClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [attendanceTarget, setAttendanceTarget] = useState<{ id: number; title: string } | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportClassItem, setReportClassItem] = useState<TrainerClassItem | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [editingClass, setEditingClass] = useState<TrainerClassItem | null>(null);

    useEffect(() => { localStorage.setItem('trainer_classes_view_mode', viewMode); }, [viewMode]);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const formattedToday = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const currentTime = today.toTimeString().slice(0, 5);

    useEffect(() => { fetchClasses(); }, [viewMode]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            let data: TrainerClassItem[];
            if (viewMode === 'today') {
                data = await trainerApi.getTodayClasses();
            } else if (viewMode === 'week') {
                const now = new Date();
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(now.setDate(diff));
                const sunday = new Date(now.setDate(monday.getDate() + 6));
                data = await trainerApi.getClasses(monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]);
            } else {
                data = await trainerApi.getClasses();
            }
            setClasses(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const todayClasses = useMemo(() => classes.filter(c => c.date === todayStr), [classes, todayStr]);

    const stats = useMemo(() => {
        const s = classes;
        return {
            total: s.length,
            completed: s.filter(c => c.status === 'completed').length,
            inProgress: s.filter(c => c.status === 'in-progress').length,
            upcoming: s.filter(c => c.status === 'upcoming').length,
            cancelled: s.filter(c => c.status === 'cancelled').length,
            totalAttendees: s.reduce((a, c) => a + c.attendees.confirmed, 0),
            pendingConfirmations: s.reduce((a, c) => a + c.attendees.pending, 0),
            ptSessions: s.filter(c => c.type === 'pt').length,
        };
    }, [classes]);

    const nextClass = useMemo(() => todayClasses.filter(c => c.status === 'upcoming')[0] ?? null, [todayClasses]);

    const filteredClasses = useMemo(() => {
        let list = viewMode === 'today' ? todayClasses : classes;
        if (quickFilter === 'pt') list = list.filter(c => c.type === 'pt');
        if (quickFilter === 'group') list = list.filter(c => c.type === 'group');
        if (quickFilter === 'pending') list = list.filter(c => c.attendees.pending > 0);
        return list;
    }, [viewMode, quickFilter, todayClasses, classes]);

    const toggleQuickFilter = (f: string) => setQuickFilter(p => p === f ? null : f);

    const formatTimeUntil = (startTime: string) => {
        const [h, m] = startTime.split(':').map(Number);
        const [ch, cm] = currentTime.split(':').map(Number);
        const diff = (h * 60 + m) - (ch * 60 + cm);
        if (diff <= 0) return 'Now';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    const handleStartClass = async (id: number) => { setActionLoading(id); try { await trainerApi.updateClassStatus(id, 'in-progress'); await fetchClasses(); } catch (e) { } finally { setActionLoading(null); } };
    const handleCompleteClass = async (id: number) => { setActionLoading(id); try { await trainerApi.updateClassStatus(id, 'completed'); await fetchClasses(); } catch (e) { } finally { setActionLoading(null); } };
    const handleCancelClass = async (id: number) => { setActionLoading(id); try { await trainerApi.updateClassStatus(id, 'cancelled'); await fetchClasses(); } catch (e) { } finally { setActionLoading(null); } };
    const handleAttendance = (id: number, title: string) => { setAttendanceTarget({ id, title }); setIsAttendanceModalOpen(true); };
    const handleClassCreated = () => { setEditingClass(null); fetchClasses(); };
    const handleEdit = (cls: TrainerClassItem) => { setEditingClass(cls); setActiveMenuId(null); setIsCreateModalOpen(true); };
    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this class?')) return;
        setActionLoading(id);
        try {
            await trainerApi.deleteClass(id);
            await fetchClasses();
        } catch (e) {
            console.error('Delete failed:', e);
            alert('Failed to delete class. Please try again.');
        } finally {
            setActionLoading(null);
            setActiveMenuId(null);
        }
    };

    const handleExportCSV = useCallback(() => {
        const headers = ['Title', 'Type', 'Date', 'Start Time', 'End Time', 'Room', 'Capacity', 'Confirmed', 'Status'];
        const rows = classes.map(c => [
            `"${c.title}"`,
            c.type,
            c.date,
            c.startTime,
            c.endTime,
            `"${c.room}"`,
            c.capacity,
            c.attendees.confirmed,
            c.status
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-classes-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [classes]);
    const handleViewReport = (cls: TrainerClassItem) => { setReportClassItem(cls); setIsReportModalOpen(true); };

    useEffect(() => {
        const close = () => setActiveMenuId(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    /* ── loading ── */
    if (loading) {
        return (
            <div className="mc mc--loading">
                <div className="mc__loading-ring" />
                <p>Loading classes…</p>
            </div>
        );
    }

    const completedPct = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    const inProgressPct = stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0;

    return (
        <div className="mc">

            {/* ══════════════════ HEADER ══════════════════ */}
            <div className="mc__header">
                <div className="mc__header-bg" />

                {/* top row */}
                <div className="mc__top-row">
                    {/* left: title */}
                    <div className="mc__title-block">
                        <div className="mc__title-icon">
                            <CalendarIcon size={18} />
                        </div>
                        <div>
                            <h1 className="mc__title">My Classes</h1>
                            <p className="mc__subtitle">{formattedToday}</p>
                        </div>
                    </div>

                    {/* centre: stat pills */}
                    <div className="mc__stat-pills">
                        <div className="mc__stat-pill mc__stat-pill--blue">
                            <span className="mc__stat-pill-num">{stats.total}</span>
                            <span className="mc__stat-pill-lbl">Total</span>
                        </div>
                        <div className="mc__stat-pill mc__stat-pill--green">
                            <span className="mc__stat-pill-num">{stats.upcoming}</span>
                            <span className="mc__stat-pill-lbl">Upcoming</span>
                        </div>
                        <div className="mc__stat-pill mc__stat-pill--amber">
                            <span className="mc__stat-pill-num">{stats.totalAttendees}</span>
                            <span className="mc__stat-pill-lbl">Attendees</span>
                        </div>
                        <div className="mc__stat-pill mc__stat-pill--purple">
                            <span className="mc__stat-pill-num">{stats.ptSessions}</span>
                            <span className="mc__stat-pill-lbl">PT Sessions</span>
                        </div>
                    </div>

                    {/* right: actions */}
                    <div className="mc__header-actions">
                        <button
                            className={`mc__filter-btn ${quickFilter === 'pending' ? 'mc__filter-btn--active-amber' : ''}`}
                            onClick={() => toggleQuickFilter('pending')}
                        >
                            <Bell size={12} />
                            Pending
                            {stats.pendingConfirmations > 0 && (
                                <span className="mc__badge mc__badge--amber">{stats.pendingConfirmations}</span>
                            )}
                        </button>
                        <button
                            className={`mc__filter-btn ${quickFilter === 'pt' ? 'mc__filter-btn--active-purple' : ''}`}
                            onClick={() => toggleQuickFilter('pt')}
                        >
                            <Target size={12} />
                            PT Only
                        </button>
                        <button className="mc__add-btn" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus size={14} />
                            Schedule Class
                        </button>
                    </div>
                </div>

                {/* NEXT UP banner */}
                {nextClass && (() => {
                    const tc = getTypeCfg(nextClass.type);
                    return (
                        <div className="mc__next-banner" style={{ '--tc-gradient': tc.gradient } as React.CSSProperties}>
                            <div className="mc__next-banner-glow" />
                            <div className="mc__next-label">
                                <Zap size={11} /> NEXT UP
                            </div>
                            <div className="mc__next-icon" style={{ background: tc.iconBg }}>
                                {tc.icon}
                            </div>
                            <div className="mc__next-info">
                                <h3>{nextClass.title}</h3>
                                <div className="mc__next-meta">
                                    <span><Clock size={11} />{nextClass.startTime} – {nextClass.endTime}</span>
                                    <span><MapPin size={11} />{nextClass.room}</span>
                                    <span><Users size={11} />{nextClass.attendees.confirmed}/{nextClass.capacity}</span>
                                    {nextClass.notes && <span className="mc__next-note"><Clipboard size={11} />{nextClass.notes}</span>}
                                </div>
                            </div>
                            <div className="mc__next-countdown">
                                <span className="mc__next-count-val">{formatTimeUntil(nextClass.startTime)}</span>
                                <span className="mc__next-count-lbl">until start</span>
                            </div>
                            <div className="mc__next-acts">
                                <button className="mc__next-act mc__next-act--primary" onClick={() => handleAttendance(nextClass.id, nextClass.title)}>
                                    <UserCheck size={12} /> Take Attendance
                                </button>
                                <button className="mc__next-act mc__next-act--ghost" onClick={() => handleViewReport(nextClass)}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* ══════════════════ TOOLBAR ══════════════════ */}
            <div className="mc__toolbar">
                {/* view toggle */}
                <div className="mc__view-toggle">
                    {(['today', 'week', 'list'] as const).map(v => (
                        <button
                            key={v}
                            className={`mc__view-btn ${viewMode === v ? 'mc__view-btn--active' : ''}`}
                            onClick={() => setViewMode(v)}
                        >
                            {v === 'list' ? <><List size={12} /> All</> : v === 'week' ? 'This Week' : 'Today'}
                        </button>
                    ))}
                </div>

                {/* progress */}
                <div className="mc__progress-wrap">
                    <div className="mc__progress-track">
                        <div className="mc__progress-fill mc__progress-fill--completed" style={{ width: `${completedPct}%` }} />
                        <div className="mc__progress-fill mc__progress-fill--active" style={{ width: `${inProgressPct}%`, left: `${completedPct}%` }} />
                    </div>
                    <span className="mc__progress-label">{stats.completed}/{stats.total} done</span>
                </div>

                {/* export */}
                <button className="mc__export-btn" onClick={handleExportCSV}>
                    <Download size={12} /> Export CSV
                </button>
            </div>

            {/* ══════════════════ CLASS CARDS ══════════════════ */}
            <div className="mc__list">
                {filteredClasses.map(cls => {
                    const tc = getTypeCfg(cls.type);
                    const sc = getStatusCfg(cls.status);
                    const fillPct = cls.capacity > 0 ? (cls.attendees.confirmed / cls.capacity) * 100 : 0;
                    const pendPct = cls.capacity > 0 ? (cls.attendees.pending / cls.capacity) * 100 : 0;
                    const isOpen = selectedClass === cls.id;

                    return (
                        <div
                            key={cls.id}
                            className={`mc__card mc__card--${cls.status} ${isOpen ? 'mc__card--open' : ''}`}
                            onClick={() => setSelectedClass(isOpen ? null : cls.id)}
                        >
                            {/* left gradient accent bar */}
                            <div className="mc__card-accent" style={{ background: tc.gradient }} />

                            {/* time column */}
                            <div className="mc__card-time">
                                <span className="mc__card-start">{cls.startTime}</span>
                                <div className="mc__card-dot" style={{ background: sc.dotColor, boxShadow: `0 0 0 3px ${sc.dotColor}22` }} />
                                <span className="mc__card-end">{cls.endTime}</span>
                            </div>

                            {/* type icon */}
                            <div className="mc__card-type-icon" style={{ background: tc.iconBg }}>
                                {tc.icon}
                            </div>

                            {/* body */}
                            <div className="mc__card-body">
                                <div className="mc__card-top">
                                    <div className="mc__card-name-row">
                                        <h3 className="mc__card-name">{cls.title}</h3>
                                        {cls.type === 'pt' && (
                                            <span className="mc__card-pt-tag">PT</span>
                                        )}
                                    </div>
                                    <div className="mc__card-meta">
                                        <span><MapPin size={11} />{cls.room}</span>
                                        <span><Clock size={11} />{cls.duration}min</span>
                                    </div>
                                </div>

                                {/* attendance row */}
                                <div className="mc__card-attend">
                                    <div className="mc__attend-bar">
                                        <div className="mc__attend-fill mc__attend-fill--confirmed" style={{ width: `${fillPct}%` }} />
                                        <div className="mc__attend-fill mc__attend-fill--pending" style={{ width: `${pendPct}%`, left: `${fillPct}%` }} />
                                    </div>
                                    <div className="mc__attend-row">
                                        <span className="mc__attend-confirmed"><UserCheck size={10} />{cls.attendees.confirmed} confirmed</span>
                                        {cls.attendees.pending > 0 && <span className="mc__attend-pending"><AlertCircle size={10} />{cls.attendees.pending} pending</span>}
                                        <span className="mc__attend-cap">{cls.enrolled}/{cls.capacity} spots</span>
                                    </div>
                                </div>

                                {cls.notes && (
                                    <div className="mc__card-note">
                                        <Clipboard size={10} />{cls.notes}
                                    </div>
                                )}
                            </div>

                            {/* status badge */}
                            <div className="mc__card-status" style={{ color: sc.color, background: sc.bg }}>
                                {sc.icon} {sc.label}
                            </div>

                            {/* expanded actions */}
                            {isOpen && (
                                <div className="mc__card-actions" onClick={e => e.stopPropagation()}>
                                    {cls.status === 'upcoming' && (
                                        <>
                                            <button
                                                className="mc__act-btn mc__act-btn--green"
                                                onClick={() => handleStartClass(cls.id)}
                                                disabled={actionLoading === cls.id}
                                            >
                                                {actionLoading === cls.id ? <Loader2 size={12} className="mc__spin" /> : <Play size={12} />}
                                                Start Class
                                            </button>
                                            <button className="mc__act-btn" onClick={() => handleAttendance(cls.id, cls.title)}>
                                                <UserCheck size={12} /> Attendance
                                            </button>
                                        </>
                                    )}
                                    {cls.status === 'in-progress' && (
                                        <>
                                            <button
                                                className="mc__act-btn mc__act-btn--blue"
                                                onClick={() => handleCompleteClass(cls.id)}
                                                disabled={actionLoading === cls.id}
                                            >
                                                {actionLoading === cls.id ? <Loader2 size={12} className="mc__spin" /> : <CheckCircle size={12} />}
                                                Complete
                                            </button>
                                            <button className="mc__act-btn" onClick={() => handleAttendance(cls.id, cls.title)}>
                                                <UserCheck size={12} /> Update Attendance
                                            </button>
                                        </>
                                    )}
                                    {cls.status === 'completed' && (
                                        <button className="mc__act-btn mc__act-btn--purple" onClick={() => handleViewReport(cls)}>
                                            <TrendingUp size={12} /> View Report
                                        </button>
                                    )}
                                    <div className="mc__menu-wrap">
                                        <button
                                            className="mc__act-btn mc__act-btn--icon"
                                            onClick={e => { e.stopPropagation(); setActiveMenuId(activeMenuId === cls.id ? null : cls.id); }}
                                        >
                                            <MoreVertical size={12} />
                                        </button>
                                        {activeMenuId === cls.id && (
                                            <div className="mc__dropdown">
                                                <button onClick={() => handleEdit(cls)}><Edit size={12} /> Edit</button>
                                                <button onClick={() => handleViewReport(cls)}><FileText size={12} /> Details</button>
                                                <button className="mc__dropdown-danger" onClick={() => handleDelete(cls.id)}><Trash2 size={12} /> Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredClasses.length === 0 && (
                    <div className="mc__empty">
                        <div className="mc__empty-icon"><CalendarIcon size={28} /></div>
                        <p className="mc__empty-title">No classes scheduled</p>
                        <p className="mc__empty-sub">Schedule a new class to get started</p>
                        <button className="mc__empty-cta" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus size={14} /> Schedule Class
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════════════ MODALS ══════════════════ */}
            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setEditingClass(null); }}
                onClassCreated={handleClassCreated}
                editData={editingClass}
            />
            <ClassAttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
                classId={attendanceTarget?.id ?? null}
                classTitle={attendanceTarget?.title ?? ''}
                onSave={fetchClasses}
            />
            <ClassReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                classItem={reportClassItem}
            />
        </div>
    );
};

export default MyClasses;
