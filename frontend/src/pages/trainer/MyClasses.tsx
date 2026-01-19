import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
    List, Clock, MapPin, Users, Download, ChevronDown, MoreVertical,
    Play, CheckCircle, AlertCircle, XCircle, UserCheck, Bell, Clipboard,
    TrendingUp, Zap, Target, Loader2, Edit, Trash2, FileText
} from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerClassItem } from '../../services/trainerApi';
import './MyClasses.css';
import CreateClassModal from './CreateClassModal';
import ClassAttendanceModal from './ClassAttendanceModal';
import ClassReportModal from './ClassReportModal';

const MyClasses: React.FC = () => {
    // Initialize viewMode from localStorage or default to 'today'
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
    const [attendanceTarget, setAttendanceTarget] = useState<{ id: number, title: string } | null>(null);

    // New Feature States
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportClassItem, setReportClassItem] = useState<TrainerClassItem | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [editingClass, setEditingClass] = useState<TrainerClassItem | null>(null);

    // Persist viewMode changes
    useEffect(() => {
        localStorage.setItem('trainer_classes_view_mode', viewMode);
    }, [viewMode]);

    // Format today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const formattedToday = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Get current time for countdown
    const currentTime = today.toTimeString().slice(0, 5);

    // Fetch classes from API
    useEffect(() => {
        fetchClasses();
    }, [viewMode]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            let data: TrainerClassItem[];
            if (viewMode === 'today') {
                data = await trainerApi.getTodayClasses();
            } else if (viewMode === 'week') {
                const now = new Date();
                const day = now.getDay(); // 0 is Sunday
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
                const monday = new Date(now.setDate(diff));
                const sunday = new Date(now.setDate(monday.getDate() + 6));

                const startStr = monday.toISOString().split('T')[0];
                const endStr = sunday.toISOString().split('T')[0];
                data = await trainerApi.getClasses(startStr, endStr);
            } else {
                // List view - get all
                data = await trainerApi.getClasses();
            }
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const todayClasses = useMemo(() =>
        classes.filter(c => c.date === todayStr),
        [classes, todayStr]
    );

    const stats = useMemo(() => {
        // Fix: Use the displayed dataset for stats, not just "today"
        // If viewing "week", show stats for the whole week. If "today", show today.
        const sourceData = classes;

        const total = sourceData.length;
        const completed = sourceData.filter(c => c.status === 'completed').length;
        const inProgress = sourceData.filter(c => c.status === 'in-progress').length;
        const upcoming = sourceData.filter(c => c.status === 'upcoming').length;
        const cancelled = sourceData.filter(c => c.status === 'cancelled').length;
        const totalAttendees = sourceData.reduce((sum, c) => sum + c.attendees.confirmed, 0);
        const pendingConfirmations = sourceData.reduce((sum, c) => sum + c.attendees.pending, 0);
        const ptSessions = sourceData.filter(c => c.type === 'pt').length;

        return { total, completed, inProgress, upcoming, cancelled, totalAttendees, pendingConfirmations, ptSessions };
    }, [classes]);

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

    // Action handlers
    const handleStartClass = async (id: number) => {
        setActionLoading(id);
        try {
            await trainerApi.updateClassStatus(id, 'in-progress');
            await fetchClasses();
        } catch (error) {
            console.error('Failed to start class:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCompleteClass = async (id: number) => {
        setActionLoading(id);
        try {
            await trainerApi.updateClassStatus(id, 'completed');
            await fetchClasses();
        } catch (error) {
            console.error('Failed to complete class:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelClass = async (id: number) => {
        setActionLoading(id);
        try {
            await trainerApi.updateClassStatus(id, 'cancelled');
            await fetchClasses();
        } catch (error) {
            console.error('Failed to cancel class:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAttendance = (id: number, title: string) => {
        setAttendanceTarget({ id, title });
        setIsAttendanceModalOpen(true);
    };

    const handleClassCreated = () => {
        setEditingClass(null); // Clear edit mode if any
        fetchClasses();
    };

    const handleEdit = (cls: TrainerClassItem) => {
        setEditingClass(cls);
        setActiveMenuId(null);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        setActionLoading(id);
        try {
            await trainerApi.deleteClass(id);
            await fetchClasses();
        } catch (error) {
            console.error('Failed to delete class:', error);
        } finally {
            setActionLoading(null);
            setActiveMenuId(null);
        }
    };

    const handleViewReport = (cls: TrainerClassItem) => {
        setReportClassItem(cls);
        setIsReportModalOpen(true);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (loading) {
        return (
            <div className="my-classes my-classes--loading">
                <Loader2 className="my-classes__spinner" size={32} />
                <p>Loading classes...</p>
            </div>
        );
    }

    return (
        <div className="my-classes">
            <div className="my-classes__header">
                <div className="my-classes__title-row">
                    <div className="my-classes__title-section">
                        <h1>My Classes</h1>
                        <span className="my-classes__date-badge">
                            <CalendarIcon size={10} />
                            Today, {formattedToday}
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
                        <button className="my-classes__add-btn" onClick={() => setIsCreateModalOpen(true)}>
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
                            <button
                                className="my-classes__btn my-classes__btn--primary"
                                onClick={() => handleAttendance(nextClass.id, nextClass.title)}
                            >
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
                                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                            />
                            <div
                                className="my-classes__progress-fill my-classes__progress-fill--active"
                                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`, left: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
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
                                                <button
                                                    className="my-classes__action-btn my-classes__action-btn--primary"
                                                    onClick={(e) => { e.stopPropagation(); handleStartClass(cls.id); }}
                                                    disabled={actionLoading === cls.id}
                                                >
                                                    {actionLoading === cls.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Start Class
                                                </button>
                                                <button
                                                    className="my-classes__action-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleAttendance(cls.id, cls.title); }}
                                                >
                                                    <UserCheck size={12} /> Attendance
                                                </button>
                                            </>
                                        )}
                                        {cls.status === 'in-progress' && (
                                            <>
                                                <button
                                                    className="my-classes__action-btn my-classes__action-btn--success"
                                                    onClick={(e) => { e.stopPropagation(); handleCompleteClass(cls.id); }}
                                                    disabled={actionLoading === cls.id}
                                                >
                                                    {actionLoading === cls.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Complete
                                                </button>
                                                <button
                                                    className="my-classes__action-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleAttendance(cls.id, cls.title); }}
                                                >
                                                    <UserCheck size={12} /> Update Attendance
                                                </button>
                                            </>
                                        )}
                                        {cls.status === 'completed' && (
                                            <button
                                                className="my-classes__action-btn"
                                                onClick={(e) => { e.stopPropagation(); handleViewReport(cls); }}
                                            >
                                                <TrendingUp size={12} /> View Report
                                            </button>
                                        )}
                                        <div className="relative-menu-container">
                                            <button
                                                className="my-classes__action-btn my-classes__action-btn--icon"
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === cls.id ? null : cls.id); }}
                                            >
                                                <MoreVertical size={12} />
                                            </button>
                                            {activeMenuId === cls.id && (
                                                <div className="menu-dropdown">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(cls); }}>
                                                        <Edit size={12} /> Edit
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleViewReport(cls); }}>
                                                        <FileText size={12} /> Details
                                                    </button>
                                                    <button className="text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(cls.id); }}>
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
