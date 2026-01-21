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

    const getTypeColor = (type: MaintenanceType) => {
        const colors = { PREVENTIVE: '#22c55e', REPAIR: '#ef4444', INSPECTION: '#3b82f6' };
        return colors[type] || '#6b7280';
    };

    const getStatusColor = (status: MaintenanceStatus) => {
        const colors = { COMPLETED: '#22c55e', SCHEDULED: '#3b82f6', OVERDUE: '#ef4444', CANCELLED: '#6b7280' };
        return colors[status] || '#6b7280';
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
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center text-blue-400">
                            {getEquipmentIcon(equipment.category, equipment.name, 20)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-semibold text-white">{equipment.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${equipment.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                    equipment.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>{equipment.status}</span>
                            </div>
                            <p className="text-[11px] text-gray-500">{equipment.brand} • {equipment.serialNumber || `SN-${equipment.id}`}</p>
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
                            <Plus size={16} /> Add Maintenance Log
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
                        <div className="eq-modal__body space-y-5">
                            {/* Stats Row */}
                            <div className="eq-stats-grid">
                                {[
                                    { label: 'Total Logs', value: stats.total, icon: FileText, color: 'blue' },
                                    { label: 'Total Cost', value: formatCurrency(stats.totalCost), icon: DollarSign, color: 'green' },
                                    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'red' },
                                    { label: 'Health', value: `${stats.health}%`, icon: Activity, color: 'purple' }
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="eq-stat-card">
                                        <div className="eq-stat-card__label">
                                            <Icon size={14} className={`text-${color}-400`} />
                                            {label}
                                        </div>
                                        <p className="eq-stat-card__value">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Activity & Upcoming */}
                            <div className="eq-grid eq-grid--3-1" style={{ gap: '20px' }}>
                                <div className="eq-card" style={{ gridColumn: 'span 2' }}>
                                    <div className="eq-card__header">
                                        <h3 className="eq-card__title">
                                            <Clock size={14} className="text-gray-500" /> Recent Activity
                                        </h3>
                                        <button onClick={() => setActiveTab('history')} className="text-[10px] text-blue-400 hover:underline">View All</button>
                                    </div>
                                    <div className="eq-card__body">
                                        {history.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                                                <ClipboardCheck size={24} className="opacity-30" />
                                                <p className="text-xs">No records found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {history.slice(0, 3).map(r => (
                                                    <div key={r.id} className="eq-list-item">
                                                        <div className="eq-badge--icon" style={{ backgroundColor: `${getTypeColor(r.maintenanceType)}20` }}>
                                                            {r.maintenanceType === 'REPAIR' ? <Wrench size={12} style={{ color: getTypeColor(r.maintenanceType) }} /> :
                                                                r.maintenanceType === 'PREVENTIVE' ? <Shield size={12} style={{ color: getTypeColor(r.maintenanceType) }} /> :
                                                                    <ClipboardCheck size={12} style={{ color: getTypeColor(r.maintenanceType) }} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <p className="text-xs font-medium text-white truncate">{r.description}</p>
                                                                <span className="text-[10px] font-mono text-gray-500">{formatCurrency(r.cost)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                                <span>{r.technicianName}</span>
                                                                <span>•</span>
                                                                <span>{formatDate(r.maintenanceDate)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="eq-card">
                                    <div className="eq-card__header">
                                        <h3 className="eq-card__title">
                                            <Calendar size={14} className="text-gray-500" /> Upcoming
                                        </h3>
                                    </div>
                                    <div className="eq-card__body">
                                        {stats.scheduled === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                                                <CheckCircle size={24} className="opacity-30" />
                                                <p className="text-xs">All caught up!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {history.filter(r => r.status === 'SCHEDULED').slice(0, 3).map(r => (
                                                    <div key={r.id} className="eq-list-item" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.05)' }}>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-[9px] font-bold text-blue-400">{r.maintenanceType}</span>
                                                                <span className="text-[9px] text-gray-500">{formatDate(r.maintenanceDate)}</span>
                                                            </div>
                                                            <p className="text-[11px] text-white truncate">{r.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
                            <div className="px-5 py-3 border-b border-white/5 bg-[#141414] flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
                                    <div className="h-64 flex flex-col items-center justify-center text-gray-600">
                                        <Filter size={32} className="mb-3 opacity-30" />
                                        <p className="text-sm">No records found</p>
                                        <button onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }} className="mt-2 text-xs text-blue-400 hover:underline">Clear filters</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredHistory.map(r => (
                                            <div key={r.id} className="eq-list-item">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-500 font-mono">{formatDate(r.maintenanceDate)}</span>
                                                            <div className="eq-badge" style={{ backgroundColor: `${getTypeColor(r.maintenanceType)}20`, color: getTypeColor(r.maintenanceType) }}>
                                                                {r.maintenanceType}
                                                            </div>
                                                        </div>
                                                        <div className="eq-badge" style={{ color: getStatusColor(r.status) }}>
                                                            {r.status}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-white font-medium mb-1">{r.description}</p>
                                                    <div className="flex items-center gap-4 text-[11px] text-gray-500">
                                                        <span className="flex items-center gap-1"><User size={12} /> {r.technicianName}</span>
                                                        <span className="flex items-center gap-1"><DollarSign size={12} /> {formatCurrency(r.cost)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                                                        <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white"><ChevronRight size={16} /></button>
                                                        <span className="text-sm font-semibold text-white ml-2">{label}</span>
                                                    </div>
                                                    <div className="flex bg-[#0d0d0d] rounded-lg p-0.5 border border-white/5">
                                                        {['month', 'week', 'day'].map(v => (
                                                            <button key={v} onClick={() => onView(v as any)} className={`px-2.5 py-1 text-[10px] font-medium rounded capitalize ${view === v ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>{v}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }}
                                        eventPropGetter={event => ({
                                            style: {
                                                backgroundColor: getStatusColor(event.status),
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: 'white',
                                                fontSize: '10px',
                                                padding: '2px 6px'
                                            }
                                        })}
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
                                <div className="h-64 flex flex-col items-center justify-center text-gray-600">
                                    <BarChart3 size={40} className="mb-3 opacity-30" />
                                    <p className="text-sm">Not enough data for analysis</p>
                                    <p className="text-xs text-gray-600">Add some maintenance records first</p>
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
                                                        <circle cx="64" cy="64" r="54" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                                                        <circle
                                                            cx="64" cy="64" r="54" fill="none"
                                                            stroke={stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#eab308' : '#ef4444'}
                                                            strokeWidth="8" strokeLinecap="round"
                                                            strokeDasharray={`${stats.health * 3.39} 339`}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl font-bold text-white">{stats.health}</span>
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Score</span>
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
                                                                <Cell key={i} fill={getTypeColor(entry.name as MaintenanceType)} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }} />
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
                                                    <p className="text-2xl font-bold text-white">{history.filter(r => r.maintenanceType === 'PREVENTIVE').length}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Preventive</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-white">{history.filter(r => r.maintenanceType === 'REPAIR').length}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Repairs</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-white">{history.filter(r => r.maintenanceType === 'INSPECTION').length}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Inspections</p>
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
                                <button type="button" onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white">
                                    <ArrowLeft size={16} />
                                </button>
                                <h2 className="text-sm font-semibold text-white">New Maintenance Log</h2>
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
                                                ? 'border-transparent text-white shadow-lg'
                                                : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white'
                                                }`}
                                            style={newLog.maintenanceType === type ? { backgroundColor: `${getTypeColor(type)}25`, color: getTypeColor(type), borderColor: getTypeColor(type) } : {}}
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
                                        style={{ colorScheme: 'dark' }}
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

                            <div className="eq-modal__section" style={{ paddingTop: '24px', borderTop: '1px solid #2a2a2a' }}>
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
                <footer className="px-5 py-3 border-t border-white/5 bg-[#111] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-gray-500">
                        <TrendingUp size={12} />
                        <span>Last maintained: <span className="text-white">{equipment.lastMaintenanceDate ? formatDate(equipment.lastMaintenanceDate) : 'Never'}</span></span>
                    </div>
                    {equipment.nextMaintenanceDueDate && (
                        <div className="flex items-center gap-2 text-amber-400">
                            <Calendar size={12} />
                            <span>Due: {formatDate(equipment.nextMaintenanceDueDate)}</span>
                        </div>
                    )}
                </footer>
            </div>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* CALENDAR DARK THEME STYLES */}
            {/* ══════════════════════════════════════════════════════════ */}
            <style>{`
                .calendar-dark .rbc-calendar { background: transparent; }
                .calendar-dark .rbc-header { background: #1a1a1a; border-color: #2a2a2a !important; padding: 8px 4px; font-size: 11px; color: #666; text-transform: uppercase; font-weight: 600; }
                .calendar-dark .rbc-month-view { border-color: #2a2a2a; background: #0d0d0d; border-radius: 8px; overflow: hidden; }
                .calendar-dark .rbc-month-row { border-color: #2a2a2a; }
                .calendar-dark .rbc-day-bg { background: #0d0d0d; border-color: #2a2a2a !important; }
                .calendar-dark .rbc-day-bg.rbc-today { background: #1e3a5f; }
                .calendar-dark .rbc-day-bg.rbc-off-range-bg { background: #080808; }
                .calendar-dark .rbc-date-cell { padding: 6px 8px; color: #808080; font-size: 12px; text-align: right; }
                .calendar-dark .rbc-date-cell.rbc-now { color: #3b82f6; font-weight: 700; }
                .calendar-dark .rbc-date-cell.rbc-off-range { color: #444; }
                .calendar-dark .rbc-row-segment { padding: 1px 3px; }
                .calendar-dark .rbc-event { padding: 2px 6px !important; font-size: 10px !important; border-radius: 4px !important; }
                .calendar-dark .rbc-show-more { background: transparent; color: #3b82f6; font-size: 10px; font-weight: 600; }
                .calendar-dark .rbc-time-view, .calendar-dark .rbc-time-header, .calendar-dark .rbc-time-content { background: #0d0d0d; border-color: #2a2a2a; }
                .calendar-dark .rbc-timeslot-group { border-color: #2a2a2a; }
                .calendar-dark .rbc-time-slot { color: #666; font-size: 10px; }
                .calendar-dark .rbc-current-time-indicator { background: #3b82f6; height: 2px; }
                .calendar-dark .rbc-row-bg { background: #0d0d0d; }
                .calendar-dark .rbc-allday-cell { background: #0d0d0d; border-color: #2a2a2a; }
            `}</style>
        </div>
    );
};

export default MaintenancePanel;
