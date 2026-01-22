import React, { useState, useEffect, useMemo } from 'react';
import type { Equipment } from '../../../types/equipment';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';
import { equipmentApi } from '../../../services/equipmentApi';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import {
    X, Calendar, DollarSign, User, CheckCircle, Clock, Wrench, ClipboardCheck,
    Plus, ArrowLeft, FileText, TrendingUp, AlertCircle, BarChart3, Search,
    Filter, ChevronLeft, ChevronRight, Shield, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../EquipmentModals.css';

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE PANEL - Premium SaaS Design
// ═══════════════════════════════════════════════════════════════════════════

interface MaintenancePanelProps {
    equipment: Equipment | null;
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'overview' | 'history' | 'schedule' | 'analysis';

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ equipment, isOpen, onClose }) => {
    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────
    const [history, setHistory] = useState<EquipmentMaintenance[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');

    const [newLog, setNewLog] = useState({
        maintenanceType: 'PREVENTIVE' as MaintenanceType,
        description: '',
        technicianName: '',
        cost: 0,
        maintenanceDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED' as MaintenanceStatus
    });

    const localizer = momentLocalizer(moment);

    // ─────────────────────────────────────────────────────────────────────────
    // DATA LOADING
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (equipment && isOpen) {
            loadHistory();
            setShowAddForm(false);
            setActiveTab('overview');
        }
    }, [equipment, isOpen]);

    const loadHistory = async () => {
        if (!equipment) return;
        setLoading(true);
        try {
            const data = await equipmentApi.getMaintenanceHistory(equipment.id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipment) return;
        try {
            await equipmentApi.logMaintenance(equipment.id, newLog);
            setShowAddForm(false);
            setNewLog({
                maintenanceType: 'PREVENTIVE',
                description: '',
                technicianName: '',
                cost: 0,
                maintenanceDate: new Date().toISOString().split('T')[0],
                status: 'COMPLETED'
            });
            loadHistory();
        } catch (error) {
            console.error('Failed to log maintenance', error);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // COMPUTED VALUES
    // ─────────────────────────────────────────────────────────────────────────
    const filteredHistory = useMemo(() => {
        return history.filter(r => {
            const matchSearch = !searchTerm ||
                r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.technicianName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = typeFilter === 'ALL' || r.maintenanceType === typeFilter;
            const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
            return matchSearch && matchType && matchStatus;
        });
    }, [history, searchTerm, typeFilter, statusFilter]);

    const stats = useMemo(() => ({
        total: history.length,
        totalCost: history.reduce((sum, r) => sum + (r.cost || 0), 0),
        overdue: history.filter(r => r.status === 'OVERDUE').length,
        scheduled: history.filter(r => r.status === 'SCHEDULED').length,
        health: Math.max(0, 100 - history.filter(r => r.status === 'OVERDUE').length * 10)
    }), [history]);

    const calendarEvents = useMemo(() => history.map(r => ({
        title: `${r.maintenanceType}: ${r.description.slice(0, 20)}...`,
        start: new Date(r.maintenanceDate),
        end: new Date(r.maintenanceDate),
        status: r.status,
        allDay: true
    })), [history]);

    const chartData = useMemo(() => {
        const types = history.reduce((acc, r) => {
            acc[r.maintenanceType] = (acc[r.maintenanceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [history]);

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    const getTypeStyles = (type: MaintenanceType) => {
        const colors: Record<string, string> = { 
            PREVENTIVE: 'var(--modal-success)', 
            REPAIR: 'var(--modal-danger)', 
            INSPECTION: 'var(--accent-primary)' 
        };
        const bgs: Record<string, string> = { 
            PREVENTIVE: 'var(--modal-success-bg)', 
            REPAIR: 'var(--modal-danger-bg)', 
            INSPECTION: 'var(--modal-info-bg)' 
        };
        return { color: colors[type] || 'var(--text-secondary)', bg: bgs[type] || 'var(--bg-surface-secondary)' };
    };

    const getStatusStyles = (status: MaintenanceStatus) => {
        const colors: Record<string, string> = { 
            COMPLETED: 'var(--modal-success)', 
            SCHEDULED: 'var(--accent-primary)', 
            OVERDUE: 'var(--modal-danger)', 
            CANCELLED: 'var(--text-secondary)' 
        };
        const bgs: Record<string, string> = { 
            COMPLETED: 'var(--modal-success-bg)', 
            SCHEDULED: 'var(--modal-info-bg)', 
            OVERDUE: 'var(--modal-danger-bg)', 
            CANCELLED: 'var(--bg-surface-secondary)' 
        };
        return { color: colors[status] || 'var(--text-secondary)', bg: bgs[status] || 'var(--bg-surface-secondary)' };
    };

    if (!isOpen || !equipment) return null;

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="eq-modal-overlay" onClick={onClose}>
            <div
                className="eq-modal eq-modal--xl eq-modal--compact"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '95vh', minHeight: '80vh' }}
            >
                {/* ══════════════════════════════════════════════════════════ */}
                {/* HEADER */}
                {/* ══════════════════════════════════════════════════════════ */}
                <header className="eq-modal__header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]">
                            {getEquipmentIcon(equipment.category, equipment.name, 20)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-semibold text-[var(--text-primary)]">{equipment.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${equipment.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                    equipment.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                        'bg-red-500/10 text-red-600 dark:text-red-400'
                                    }`}>{equipment.status}</span>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)]">{equipment.brand} • {equipment.serialNumber || `SN-${equipment.id}`}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* TAB NAVIGATION */}
                        <nav className="eq-tabs">
                            {(['overview', 'history', 'schedule', 'analysis'] as TabType[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setShowAddForm(false); }}
                                    className={`eq-tab capitalize ${activeTab === tab && !showAddForm ? 'eq-tab--active' : ''}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        <button
                            onClick={() => setShowAddForm(true)}
                            className="eq-btn eq-btn--primary"
                            style={{ padding: '10px 20px', fontSize: '13px' }}
                        >
                            <Plus size={16} /> Add Log
                        </button>

                        <button onClick={onClose} className="eq-modal__close">
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* CONTENT */}
                {/* ══════════════════════════════════════════════════════════ */}
                <main className="flex-1 overflow-y-auto">

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* OVERVIEW TAB */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeTab === 'overview' && !showAddForm && (
                        <div className="eq-modal__body space-y-6">
                            {/* Section: Overview KPIs */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Overview KPIs</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: 'Total Logs', value: stats.total, icon: FileText, color: 'blue' },
                                        { label: 'Total Cost', value: formatCurrency(stats.totalCost), icon: DollarSign, color: 'green' },
                                        { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'red' },
                                        { label: 'Health', value: `${stats.health}%`, icon: Activity, color: 'purple' }
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <div key={label} className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-surface)] text-${color}-600 dark:text-${color}-400`}>
                                                <Icon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
                                                <p className="text-sm font-bold text-[var(--text-primary)]">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Recent Activity & Upcoming */}
                            <div className="grid grid-cols-3 gap-6">
                                {/* Recent Activity */}
                                <div className="col-span-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Recent Activity</h3>
                                        <button onClick={() => setActiveTab('history')} className="text-[10px] font-semibold text-[var(--accent-primary)] hover:underline">View All</button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {history.length === 0 ? (
                                            <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-2">
                                                <ClipboardCheck size={20} className="opacity-30" />
                                                <p className="text-xs">No records found</p>
                                            </div>
                                        ) : (
                                            history.slice(0, 3).map(r => {
                                                const styles = getTypeStyles(r.maintenanceType);
                                                return (
                                                    <div key={r.id} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors group flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: styles.bg }}>
                                                            {r.maintenanceType === 'REPAIR' ? <Wrench size={14} style={{ color: styles.color }} /> :
                                                                r.maintenanceType === 'PREVENTIVE' ? <Shield size={14} style={{ color: styles.color }} /> :
                                                                    <ClipboardCheck size={14} style={{ color: styles.color }} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{r.description}</h4>
                                                                <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)] px-1.5 py-0.5 rounded">{formatDate(r.maintenanceDate)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-secondary)]">
                                                                <span className="flex items-center gap-1"><User size={10} /> {r.technicianName}</span>
                                                                <span className="flex items-center gap-1"><DollarSign size={10} /> {formatCurrency(r.cost)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Maintenance */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Upcoming</h3>
                                    <div className="space-y-2">
                                        {stats.scheduled === 0 ? (
                                            <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-2 h-full">
                                                <CheckCircle size={20} className="opacity-30" />
                                                <p className="text-xs">All caught up!</p>
                                            </div>
                                        ) : (
                                            history.filter(r => r.status === 'SCHEDULED').slice(0, 3).map(r => {
                                                const typeStyles = getTypeStyles(r.maintenanceType);
                                                return (
                                                    <div key={r.id} className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color }}>{r.maintenanceType}</span>
                                                            <span className="text-[10px] text-[var(--text-secondary)]">{formatDate(r.maintenanceDate)}</span>
                                                        </div>
                                                        <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">{r.description}</p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* HISTORY TAB */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeTab === 'history' && !showAddForm && (
                        <div className="flex flex-col h-full">
                            {/* Filters */}
                            <div className="px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search logs..."
                                        className="eq-input"
                                        style={{ paddingLeft: '36px', height: '36px', fontSize: '12px' }}
                                    />
                                </div>
                                <select
                                    value={typeFilter}
                                    onChange={e => setTypeFilter(e.target.value as any)}
                                    className="eq-input"
                                    style={{ width: '140px', height: '36px', padding: '0 12px', fontSize: '12px' }}
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="PREVENTIVE">Preventive</option>
                                    <option value="REPAIR">Repair</option>
                                    <option value="INSPECTION">Inspection</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value as any)}
                                    className="eq-input"
                                    style={{ width: '140px', height: '36px', padding: '0 12px', fontSize: '12px' }}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {filteredHistory.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                                        <Filter size={32} className="mb-3 opacity-30" />
                                        <p className="text-sm">No records found</p>
                                        <button onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }} className="mt-2 text-xs text-[var(--accent-primary)] hover:underline">Clear filters</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredHistory.map((r, index) => {
                                            const typeStyles = getTypeStyles(r.maintenanceType);
                                            const statusStyles = getStatusStyles(r.status);
                                            return (
                                                <div key={r.id} className={`eq-list-item p-3 rounded-lg border border-[var(--border-color)] ${index % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-surface-secondary)]'}`}>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-[var(--text-secondary)] font-mono">{formatDate(r.maintenanceDate)}</span>
                                                                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color }}>
                                                                    {r.maintenanceType}
                                                                </div>
                                                            </div>
                                                            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: statusStyles.bg, color: statusStyles.color }}>
                                                                {r.status}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-[var(--text-primary)] font-medium mb-1">{r.description}</p>
                                                        <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
                                                            <span className="flex items-center gap-1"><User size={12} /> {r.technicianName}</span>
                                                            <span className="flex items-center gap-1"><DollarSign size={12} /> {formatCurrency(r.cost)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* SCHEDULE TAB */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeTab === 'schedule' && !showAddForm && (
                        <div className="p-4 h-[500px]">
                            <div className="eq-card h-full">
                                <div className="eq-calendar h-full p-2">
                                    <BigCalendar
                                        localizer={localizer}
                                        events={calendarEvents}
                                        startAccessor="start"
                                        endAccessor="end"
                                        style={{ height: '100%' }}
                                        views={['month', 'week', 'day']}
                                        defaultView="month"
                                        popup
                                        components={{
                                            toolbar: ({ label, onNavigate, onView, view }) => (
                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-color)]">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-[var(--bg-surface-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ChevronLeft size={16} /></button>
                                                        <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-[var(--bg-surface-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ChevronRight size={16} /></button>
                                                        <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">{label}</span>
                                                    </div>
                                                    <div className="flex bg-[var(--bg-surface-secondary)] rounded-lg p-0.5 border border-[var(--border-color)]">
                                                        {['month', 'week', 'day'].map(v => (
                                                            <button key={v} onClick={() => onView(v as any)} className={`px-2.5 py-1 text-[10px] font-medium rounded capitalize ${view === v ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{v}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }}
                                        eventPropGetter={event => {
                                            const statusStyles = getStatusStyles(event.status);
                                            return {
                                                style: {
                                                    backgroundColor: statusStyles.bg,
                                                    border: `1px solid ${statusStyles.color}`,
                                                    borderRadius: '4px',
                                                    color: statusStyles.color,
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    fontWeight: '600'
                                                }
                                            };
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* ANALYSIS TAB */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeTab === 'analysis' && !showAddForm && (
                        <div className="p-5 space-y-5">
                            {history.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                                    <BarChart3 size={40} className="mb-3 opacity-30" />
                                    <p className="text-sm">Not enough data for analysis</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Add some maintenance records first</p>
                                </div>
                            ) : (
                                <>
                                    {/* Health Score Card */}
                                    <div className="eq-grid eq-grid--2" style={{ gap: '20px' }}>
                                        <div className="eq-card">
                                            <div className="eq-card__header">
                                                <h3 className="eq-card__title">Equipment Health</h3>
                                            </div>
                                            <div className="eq-card__body flex items-center justify-center">
                                                <div className="relative w-32 h-32">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="64" cy="64" r="54" fill="none" className="stroke-[var(--border-color)]" strokeWidth="8" />
                                                        <circle
                                                            cx="64" cy="64" r="54" fill="none"
                                                            stroke={stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#eab308' : '#ef4444'}
                                                            strokeWidth="8" strokeLinecap="round"
                                                            strokeDasharray={`${stats.health * 3.39} 339`}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.health}</span>
                                                        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Score</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="eq-card">
                                            <div className="eq-card__header">
                                                <h3 className="eq-card__title">Type Distribution</h3>
                                            </div>
                                            <div className="eq-card__body h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                                                            {chartData.map((entry, i) => (
                                                                <Cell key={i} fill={getTypeStyles(entry.name as MaintenanceType).color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }}
                                                            itemStyle={{ fontSize: '12px' }}
                                                            labelStyle={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Summary */}
                                    <div className="eq-card">
                                        <div className="eq-card__header">
                                            <h3 className="eq-card__title">Summary</h3>
                                        </div>
                                        <div className="eq-card__body">
                                            <div className="grid grid-cols-3 gap-6 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{history.filter(r => r.maintenanceType === 'PREVENTIVE').length}</p>
                                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Preventive</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{history.filter(r => r.maintenanceType === 'REPAIR').length}</p>
                                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Repairs</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{history.filter(r => r.maintenanceType === 'INSPECTION').length}</p>
                                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Inspections</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* ADD FORM */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {showAddForm && (
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <button type="button" onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-[var(--bg-surface-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    <ArrowLeft size={16} />
                                </button>
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">New Maintenance Log</h2>
                            </div>

                            {/* Type Selector */}
                            <div className="eq-modal__section">
                                <label className="eq-label">Maintenance Type</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['PREVENTIVE', 'REPAIR', 'INSPECTION'] as MaintenanceType[]).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewLog({ ...newLog, maintenanceType: type })}
                                            className={`py-4 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-3 ${newLog.maintenanceType === type
                                                ? 'border-transparent shadow-lg'
                                                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                            style={newLog.maintenanceType === type ? { backgroundColor: getTypeStyles(type).bg, color: getTypeStyles(type).color, borderColor: getTypeStyles(type).color } : {}}
                                        >
                                            {type === 'PREVENTIVE' && <Shield size={20} />}
                                            {type === 'REPAIR' && <Wrench size={20} />}
                                            {type === 'INSPECTION' && <ClipboardCheck size={20} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="eq-modal__section">
                                <label className="eq-label">Description *</label>
                                <textarea
                                    value={newLog.description}
                                    onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                    placeholder="Describe the maintenance work performed in detail..."
                                    className="eq-input"
                                    style={{ resize: 'none', height: '120px' }}
                                    required
                                />
                            </div>

                            {/* Fields Grid */}
                            <div className="eq-modal__section eq-grid eq-grid--2" style={{ gap: '24px' }}>
                                <div>
                                    <label className="eq-label">Technician</label>
                                    <input
                                        type="text"
                                        value={newLog.technicianName}
                                        onChange={e => setNewLog({ ...newLog, technicianName: e.target.value })}
                                        placeholder="Name"
                                        className="eq-input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="eq-label">Cost ($)</label>
                                    <input
                                        type="number"
                                        value={newLog.cost}
                                        onChange={e => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                                        placeholder="0"
                                        className="eq-input"
                                    />
                                </div>
                                <div>
                                    <label className="eq-label">Date</label>
                                    <input
                                        type="date"
                                        value={newLog.maintenanceDate}
                                        onChange={e => setNewLog({ ...newLog, maintenanceDate: e.target.value })}
                                        className="eq-input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="eq-label">Status</label>
                                    <select
                                        value={newLog.status}
                                        onChange={e => setNewLog({ ...newLog, status: e.target.value as MaintenanceStatus })}
                                        className="eq-input"
                                    >
                                        <option value="COMPLETED">Completed</option>
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="OVERDUE">Overdue</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="eq-modal__section pt-6 border-t border-[var(--border-color)]">
                                <button type="submit" className="eq-btn eq-btn--primary" style={{ width: '100%', padding: '16px', fontSize: '15px' }}>
                                    <CheckCircle size={20} /> Save Maintenance Record
                                </button>
                            </div>
                        </form>
                    )}
                </main>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* FOOTER */}
                {/* ══════════════════════════════════════════════════════════ */}
                <footer className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <TrendingUp size={12} />
                        <span>Last maintained: <span className="text-[var(--text-primary)]">{equipment.lastMaintenanceDate ? formatDate(equipment.lastMaintenanceDate) : 'Never'}</span></span>
                    </div>
                    {equipment.nextMaintenanceDueDate && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <Calendar size={12} />
                            <span>Due: {formatDate(equipment.nextMaintenanceDueDate)}</span>
                        </div>
                    )}
                </footer>
            </div>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* CALENDAR THEME STYLES */}
            {/* ══════════════════════════════════════════════════════════ */}
            <style>{`
                .eq-calendar .rbc-calendar { background: transparent; }
                .eq-calendar .rbc-header { background: var(--bg-surface-secondary); border-color: var(--border-color) !important; padding: 8px 4px; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
                .eq-calendar .rbc-month-view { border-color: var(--border-color); background: var(--bg-surface); border-radius: 8px; overflow: hidden; }
                .eq-calendar .rbc-month-row { border-color: var(--border-color); }
                .eq-calendar .rbc-day-bg { background: var(--bg-surface); border-color: var(--border-color) !important; }
                .eq-calendar .rbc-day-bg.rbc-today { background: var(--bg-surface-secondary); }
                .eq-calendar .rbc-day-bg.rbc-off-range-bg { background: var(--bg-primary); }
                .eq-calendar .rbc-date-cell { padding: 6px 8px; color: var(--text-secondary); font-size: 12px; text-align: right; }
                .eq-calendar .rbc-date-cell.rbc-now { color: var(--accent-primary); font-weight: 700; }
                .eq-calendar .rbc-date-cell.rbc-off-range { color: var(--text-secondary); opacity: 0.5; }
                .eq-calendar .rbc-row-segment { padding: 1px 3px; }
                .eq-calendar .rbc-event { padding: 2px 6px !important; font-size: 10px !important; border-radius: 4px !important; }
                .eq-calendar .rbc-show-more { background: transparent; color: var(--accent-primary); font-size: 10px; font-weight: 600; }
                .eq-calendar .rbc-time-view, .eq-calendar .rbc-time-header, .eq-calendar .rbc-time-content { background: var(--bg-surface); border-color: var(--border-color); }
                .eq-calendar .rbc-timeslot-group { border-color: var(--border-color); }
                .eq-calendar .rbc-time-slot { color: var(--text-secondary); font-size: 10px; }
                .eq-calendar .rbc-current-time-indicator { background: var(--accent-primary); height: 2px; }
                .eq-calendar .rbc-row-bg { background: var(--bg-surface); }
                .eq-calendar .rbc-allday-cell { background: var(--bg-surface); border-color: var(--border-color); }
            `}</style>
        </div>
    );
};

export default MaintenancePanel;
