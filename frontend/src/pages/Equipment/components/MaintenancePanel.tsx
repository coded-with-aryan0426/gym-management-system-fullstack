import React, { useState, useEffect, useMemo } from 'react';
import type { Equipment } from '../../../types/equipment';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';
import { equipmentApi } from '../../../services/equipmentApi';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import {
    X,
    Calendar,
    DollarSign,
    User,
    CheckCircle,
    Clock,
    AlertTriangle,
    Wrench,
    ClipboardCheck,
    Plus,
    ArrowLeft,
    FileText,
    TrendingUp,
    Shield,
    AlertCircle,
    BarChart3,
    Search,
    Filter,
    PieChart,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface MaintenancePanelProps {
    equipment: Equipment | null;
    isOpen: boolean;
    onClose: () => void;
}

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ equipment, isOpen, onClose }) => {
    const [history, setHistory] = useState<EquipmentMaintenance[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'schedule' | 'analysis'>('overview');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<MaintenanceType | 'ALL'>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<MaintenanceStatus | 'ALL'>('ALL');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    // Sort states
    const [sortBy, setSortBy] = useState<'date' | 'cost' | 'technician' | 'type'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Expandable details state
    const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set());

    // Calendar localizer
    const localizer = momentLocalizer(moment);

    // --- Metric Calculations ---
    const metrics = useMemo(() => {
        if (!history.length || !equipment) return null;

        const totalRecords = history.length;
        const repairRecords = history.filter(h => h.maintenanceType === 'REPAIR');
        const preventiveRecords = history.filter(h => h.maintenanceType === 'PREVENTIVE');

        let healthScore = 100;
        const overdueCount = history.filter(h => h.status === 'OVERDUE').length;
        healthScore -= (overdueCount * 10);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRepairs = repairRecords.filter(r => new Date(r.maintenanceDate) >= thirtyDaysAgo).length;
        healthScore -= (recentRepairs * 15);

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const recentPreventive = preventiveRecords.filter(r => new Date(r.maintenanceDate) >= ninetyDaysAgo).length;
        healthScore += Math.min(20, recentPreventive * 5);

        healthScore = Math.max(0, Math.min(100, healthScore));

        let mtbf = 0;
        if (repairRecords.length > 0) {
            const firstDate = new Date(equipment.purchaseDate || history[history.length - 1].maintenanceDate).getTime();
            const lastDate = new Date().getTime();
            const daysDiff = (lastDate - firstDate) / (1000 * 3600 * 24);
            mtbf = Math.round(daysDiff / repairRecords.length);
        } else {
            const firstDate = new Date(equipment.purchaseDate).getTime();
            const daysDiff = (new Date().getTime() - firstDate) / (1000 * 3600 * 24);
            mtbf = Math.round(daysDiff);
        }

        const totalMaintenanceCost = history.reduce((sum, r) => sum + (r.cost || 0), 0);
        const purchaseCost = equipment.purchaseCost || 0;
        const tco = purchaseCost + totalMaintenanceCost;

        let reliabilityStatus: 'Excellent' | 'Good' | 'Concern' | 'Critical' = 'Good';
        if (healthScore >= 90) reliabilityStatus = 'Excellent';
        else if (healthScore >= 70) reliabilityStatus = 'Good';
        else if (healthScore >= 50) reliabilityStatus = 'Concern';
        else reliabilityStatus = 'Critical';

        return {
            healthScore,
            mtbf,
            tco,
            totalMaintenanceCost,
            reliabilityStatus,
            repairCount: repairRecords.length,
            preventiveCount: preventiveRecords.length,
            overdueCount
        };
    }, [history, equipment]);

    const getStatusColor = (status: MaintenanceStatus) => {
        switch (status) {
            case 'COMPLETED': return '#10B981';
            case 'SCHEDULED': return '#3B82F6';
            case 'OVERDUE': return '#EF4444';
            case 'CANCELLED': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const calendarEvents = useMemo(() => {
        return history.map(record => ({
            title: `${record.maintenanceType}: ${record.description}`,
            start: new Date(record.maintenanceDate),
            end: new Date(record.maintenanceDate),
            resourceId: record.id,
            status: record.status,
            allDay: true
        }));
    }, [history]);

    const [newLog, setNewLog] = useState<Partial<EquipmentMaintenance>>({
        maintenanceType: 'PREVENTIVE',
        description: '',
        technicianName: '',
        cost: 0,
        maintenanceDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED'
    });

    useEffect(() => {
        if (equipment && isOpen) {
            loadHistory();
            setShowAddForm(false);
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

    const handleAddLog = async (e: React.FormEvent) => {
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

    const toggleRecordExpansion = (recordId: number) => {
        const newExpanded = new Set(expandedRecords);
        if (newExpanded.has(recordId)) {
            newExpanded.delete(recordId);
        } else {
            newExpanded.add(recordId);
        }
        setExpandedRecords(newExpanded);
    };

    const isRecordExpanded = (recordId: number) => expandedRecords.has(recordId);

    const filteredHistory = useMemo(() => {
        let filtered = history.filter(record => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                record.description.toLowerCase().includes(searchLower) ||
                record.technicianName.toLowerCase().includes(searchLower) ||
                record.vendor?.toLowerCase().includes(searchLower) ||
                record.maintenanceType.toLowerCase().includes(searchLower) ||
                record.status.toLowerCase().includes(searchLower) ||
                (equipment && equipment.name.toLowerCase().includes(searchLower));

            const matchesType = selectedMaintenanceType === 'ALL' || record.maintenanceType === selectedMaintenanceType;
            const matchesStatus = selectedStatus === 'ALL' || record.status === selectedStatus;

            const recordDate = new Date(record.maintenanceDate);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;

            let matchesDate = true;
            if (startDate) matchesDate = matchesDate && recordDate >= startDate;
            if (endDate) matchesDate = matchesDate && recordDate <= endDate;
            return matchesSearch && matchesType && matchesStatus && matchesDate;
        });

        return filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.maintenanceDate).getTime();
                    bValue = new Date(b.maintenanceDate).getTime();
                    break;
                case 'cost':
                    aValue = a.cost;
                    bValue = b.cost;
                    break;
                case 'technician':
                    aValue = a.technicianName.toLowerCase();
                    bValue = b.technicianName.toLowerCase();
                    break;
                case 'type':
                    aValue = a.maintenanceType;
                    bValue = b.maintenanceType;
                    break;
                default: return 0;
            }
            if (sortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            else return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        });
    }, [history, searchTerm, selectedMaintenanceType, selectedStatus, dateRange, sortBy, sortOrder]);

    const analyticsData = useMemo(() => {
        const maintenanceTypeData = filteredHistory.reduce((acc, record) => {
            const type = record.maintenanceType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<MaintenanceType, number>);

        const monthlyCostData = filteredHistory.reduce((acc, record) => {
            const month = new Date(record.maintenanceDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            acc[month] = (acc[month] || 0) + record.cost;
            return acc;
        }, {} as Record<string, number>);

        return {
            maintenanceTypeData: Object.entries(maintenanceTypeData).map(([type, count]) => ({ name: type, value: count })),
            monthlyCostData: Object.entries(monthlyCostData).map(([month, cost]) => ({ month, cost })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
        };
    }, [filteredHistory]);

    const totalCost = filteredHistory.reduce((sum, r) => sum + (r.cost || 0), 0);
    const overdueRecords = filteredHistory.filter(r => r.status === 'OVERDUE');
    const scheduledRecords = filteredHistory.filter(r => r.status === 'SCHEDULED');

    const getTypeIcon = (type: MaintenanceType) => {
        switch (type) {
            case 'REPAIR': return <Wrench size={16} />;
            case 'PREVENTIVE': return <Shield size={16} />;
            case 'INSPECTION': return <ClipboardCheck size={16} />;
        }
    };

    const getTypeStyles = (type: MaintenanceType) => {
        switch (type) {
            case 'REPAIR': return 'bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-400 border-red-500/30';
            case 'PREVENTIVE': return 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-400 border-green-500/30';
            case 'INSPECTION': return 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (!isOpen || !equipment) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl max-h-[85vh] bg-[#121212]/95 backdrop-blur-md rounded-2xl border border-[#2E2E2E] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Premium Glassmorphism */}
                <div className="relative px-6 py-4 border-b border-white/5 bg-gradient-to-r from-[#121212] to-[#0A0A0A] flex justify-between items-center shrink-0">
                    <div className="flex gap-4 items-center">
                        <div className="p-2.5 bg-[#1E1E1E] rounded-xl border border-white/5 shadow-2xl shadow-black/50 text-[#4C8DFF] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            {getEquipmentIcon(equipment.category, equipment.name, 24)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-white tracking-tight font-display">{equipment.name}</h2>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm ${equipment.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    equipment.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {equipment.status}
                                </span>
                            </div>
                            <p className="text-[#808080] text-xs font-medium tracking-wide flex items-center gap-2 mt-0.5">
                                <span className="text-white/60">{equipment.brand}</span>
                                <span className="w-1 h-1 bg-[#5A5A5A] rounded-full"></span>
                                <span className="font-mono text-[#5A5A5A] tracking-wider">{equipment.serialNumber || `SN-${equipment.id}`}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Premium Segmented Control */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 backdrop-blur-md">
                            {['overview', 'history', 'schedule', 'analysis'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab as any); setShowAddForm(false); }}
                                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all duration-300 capitalize flex items-center gap-2 tracking-wide ${activeTab === tab && !showAddForm
                                        ? 'bg-[#2E2E2E] text-white shadow-lg shadow-black/20 ring-1 ring-white/5'
                                        : 'text-[#666] hover:text-[#B8B8B8] hover:bg-white/5'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-white/10"></div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#4C8DFF] hover:bg-[#3b82f6] text-white rounded-lg transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                            >
                                <Plus size={14} strokeWidth={3} />
                                <span className="text-[11px] font-bold">Log Event</span>
                            </button>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg text-[#666] hover:text-white transition-all active:scale-90"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && !showAddForm && (
                        <div className="p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-5">
                                <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 shadow-lg relative overflow-hidden group hover:border-[#4C8DFF]/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-8 bg-[#4C8DFF]/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-[#1E1E1E] rounded-lg text-[#4C8DFF] shadow-inner"><FileText size={16} /></div>
                                        <span className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Total Logs</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white tracking-tight">{history.length}</p>
                                </div>
                                <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 shadow-lg relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-8 bg-green-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-[#1E1E1E] rounded-lg text-green-400 shadow-inner"><DollarSign size={16} /></div>
                                        <span className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Total Cost</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalCost)}</p>
                                </div>
                                <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 shadow-lg relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-8 bg-red-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-[#1E1E1E] rounded-lg text-red-400 shadow-inner"><AlertCircle size={16} /></div>
                                        <span className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Overdue</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white tracking-tight">{overdueRecords.length}</p>
                                </div>
                                <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-8 bg-purple-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-[#1E1E1E] rounded-lg text-purple-400 shadow-inner"><TrendingUp size={16} /></div>
                                        <span className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Health Score</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-2xl font-bold text-white tracking-tight">{metrics?.healthScore || 100}</p>
                                        <span className="text-[11px] text-[#5A5A5A] font-bold">/100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {/* Recent Activity */}
                                <div className="col-span-2 bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-lg flex flex-col">
                                    <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-tight"><Clock size={16} className="text-[#808080]" /> Recent Activity</h3>
                                        <button onClick={() => setActiveTab('history')} className="text-[11px] font-bold text-[#4C8DFF] hover:text-[#3b82f6] transition-colors">VIEW ALL</button>
                                    </div>
                                    <div className="p-5 flex-1 min-h-[160px]">
                                        {history.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                <ClipboardCheck size={32} className="mb-3 text-[#5A5A5A]" />
                                                <p className="text-sm font-medium text-[#808080]">No maintenance history found.</p>
                                                <p className="text-xs text-[#5A5A5A] mt-1">Logs you create will appear here.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {history.slice(0, 3).map((record) => (
                                                    <div key={record.id} className="flex gap-4 items-start group">
                                                        <div className={`mt-1 p-2 rounded-lg border ${getTypeStyles(record.maintenanceType)} bg-opacity-20 shadow-sm transition-transform group-hover:scale-105`}>
                                                            {getTypeIcon(record.maintenanceType)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-sm text-white font-semibold group-hover:text-[#4C8DFF] transition-colors truncate">{record.description}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[11px] text-[#808080] font-medium bg-[#252525] px-2 py-0.5 rounded">{record.technicianName}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[11px] font-mono text-[#5A5A5A] whitespace-nowrap bg-[#252525] px-2 py-1 rounded border border-white/5">{formatDate(record.maintenanceDate)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Next Scheduled */}
                                <div className="col-span-1 bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-lg flex flex-col">
                                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-tight"><Calendar size={16} className="text-[#808080]" /> Up Next</h3>
                                    </div>
                                    <div className="p-5 flex-1 min-h-[160px] flex flex-col">
                                        {scheduledRecords.length > 0 ? (
                                            <div className="space-y-3">
                                                {scheduledRecords.slice(0, 2).map((record) => (
                                                    <div key={record.id} className="p-3 bg-[#1E1E1E] rounded-xl border border-white/5 hover:border-[#4C8DFF]/30 transition-all group cursor-pointer">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[9px] font-bold text-[#4C8DFF] bg-[#4C8DFF]/10 px-2 py-0.5 rounded uppercase tracking-wider">{record.maintenanceType}</span>
                                                            <span className="text-[10px] text-[#808080] font-mono">{formatDate(record.maintenanceDate)}</span>
                                                        </div>
                                                        <p className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#4C8DFF] transition-colors">{record.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center mb-3 text-[#5A5A5A] border border-white/5 shadow-inner">
                                                    <CheckCircle size={20} />
                                                </div>
                                                <p className="text-sm font-semibold text-white">All caught up!</p>
                                                <p className="text-[11px] text-[#808080] mt-1 mb-4 max-w-[150px]">No upcoming maintenance tasks scheduled.</p>
                                                <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white text-xs font-bold rounded-lg border border-white/10 hover:border-white/20 transition-all shadow-lg">
                                                    Schedule Task
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && !showAddForm && (
                        <div className="flex flex-col h-full bg-[#121212]">
                            {/* Premium Filter Toolbar */}
                            <div className="p-4 border-b border-white/5 bg-[#161616] flex flex-wrap gap-3 items-center sticky top-0 z-10 shadow-lg">
                                <div className="relative flex-1 min-w-[200px] group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] group-focus-within:text-[#4C8DFF] transition-colors" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search logs, technicians..."
                                        className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg py-2 pl-9 pr-3 text-white text-xs placeholder-[#5A5A5A] focus:border-[#4C8DFF]/50 focus:bg-[#202020] outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedMaintenanceType}
                                        onChange={(e) => setSelectedMaintenanceType(e.target.value as any)}
                                        className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3 py-2 text-white text-xs focus:border-[#4C8DFF]/50 outline-none cursor-pointer hover:bg-[#202020] transition-colors"
                                    >
                                        <option value="ALL">All Types</option>
                                        <option value="PREVENTIVE">Preventive</option>
                                        <option value="REPAIR">Repair</option>
                                        <option value="INSPECTION">Inspection</option>
                                    </select>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                                        className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3 py-2 text-white text-xs focus:border-[#4C8DFF]/50 outline-none cursor-pointer hover:bg-[#202020] transition-colors"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="OVERDUE">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            {/* Timeline List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {filteredHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-[#5A5A5A]">
                                        <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 border border-white/5">
                                            <Filter size={24} className="opacity-50" />
                                        </div>
                                        <p className="text-sm font-semibold text-[#808080]">No records match your filters</p>
                                        <button onClick={() => { setSearchTerm(''); setSelectedMaintenanceType('ALL'); setSelectedStatus('ALL'); }} className="mt-2 text-xs text-[#4C8DFF] hover:underline">Clear Filters</button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-6">
                                        {filteredHistory.map((record, index) => (
                                            <div key={record.id} className="relative pl-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                                {/* Connecting Line */}
                                                {index < filteredHistory.length - 1 && (
                                                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-[#2E2E2E]" />
                                                )}

                                                {/* Status Dot */}
                                                <div className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-4 border-[#121212] flex items-center justify-center z-10 ${record.status === 'COMPLETED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                                                    record.status === 'OVERDUE' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                                        'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                                    }`}>
                                                    {record.status === 'COMPLETED' && <CheckCircle size={10} className="text-[#121212]" strokeWidth={3} />}
                                                </div>

                                                {/* Card */}
                                                <div
                                                    className={`bg-[#1A1A1A] rounded-xl border border-white/5 p-4 hover:border-[#4C8DFF]/30 transition-all cursor-pointer group ${isRecordExpanded(record.id) ? 'bg-[#1E1E1E] border-[#4C8DFF]/20 shadow-lg' : ''}`}
                                                    onClick={() => toggleRecordExpansion(record.id)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono text-[#5A5A5A]">{formatDate(record.maintenanceDate)}</span>
                                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${record.maintenanceType === 'REPAIR' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
                                                                record.maintenanceType === 'PREVENTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/10' :
                                                                    'bg-blue-500/10 text-blue-400 border-blue-500/10'
                                                                }`}>
                                                                {record.maintenanceType}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] font-bold ${record.status === 'COMPLETED' ? 'text-green-500' :
                                                            record.status === 'OVERDUE' ? 'text-red-500' : 'text-blue-500'
                                                            }`}>{record.status}</span>
                                                    </div>

                                                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-[#4C8DFF] transition-colors">{record.description}</h4>

                                                    <div className="flex items-center gap-4 text-[11px] text-[#808080] mt-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <User size={12} />
                                                            <span>{record.technicianName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <DollarSign size={12} />
                                                            <span className="text-white font-medium">{formatCurrency(record.cost)}</span>
                                                        </div>
                                                    </div>

                                                    {isRecordExpanded(record.id) && (
                                                        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-1">
                                                            <div className="flex justify-between items-center">
                                                                {record.documentUrl ? (
                                                                    <a href="#" className="flex items-center gap-2 text-xs text-[#4C8DFF] hover:text-white transition-colors bg-[#4C8DFF]/10 px-3 py-1.5 rounded-lg border border-[#4C8DFF]/20">
                                                                        <FileText size={14} /> View Invoice / Report
                                                                    </a>
                                                                ) : <span className="text-[10px] text-[#5A5A5A] italic">No documents attached</span>}

                                                                <div className="flex gap-2">
                                                                    <button className="p-2 bg-[#252525] text-white rounded-lg hover:bg-[#333] transition-colors border border-white/5"><Wrench size={14} /></button>
                                                                    <button className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/10"><X size={14} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SCHEDULE TAB */}
                    {activeTab === 'schedule' && !showAddForm && (
                        <div className="p-6 h-full bg-[#121212]">
                            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 h-full shadow-lg">
                                <BigCalendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    titleAccessor="title"
                                    style={{ height: '100%', fontSize: '12px' }}
                                    views={['month', 'week', 'day']}
                                    defaultView="month"
                                    popup
                                    selectable
                                    components={{
                                        toolbar: (props) => ( // Custom Premium Toolbar
                                            <div className="flex justify-between items-center mb-6 text-white pb-4 border-b border-white/5">
                                                <div className="flex gap-2">
                                                    <button onClick={() => props.onNavigate('PREV')} className="p-2 hover:bg-white/5 rounded-lg text-[#808080] hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                                                    <button onClick={() => props.onNavigate('NEXT')} className="p-2 hover:bg-white/5 rounded-lg text-[#808080] hover:text-white transition-colors"><ChevronRight size={18} /></button>
                                                    <span className="font-bold text-lg tracking-tight ml-2 flex items-center">{props.label}</span>
                                                </div>
                                                <div className="flex gap-1 bg-[#121212] p-1 rounded-lg border border-white/5">
                                                    {['month', 'week', 'day'].map(view => (
                                                        <button
                                                            key={view}
                                                            onClick={() => props.onView(view as any)}
                                                            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${props.view === view ? 'bg-[#333] text-white shadow-sm' : 'text-[#666] hover:text-[#B8B8B8]'}`}
                                                        >
                                                            {view}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }}
                                    eventPropGetter={(event) => ({
                                        style: {
                                            backgroundColor: getStatusColor(event.status),
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }
                                    })}
                                    dayPropGetter={() => ({
                                        style: {
                                            backgroundColor: '#121212',
                                            color: '#808080',
                                            borderColor: '#2E2E2E'
                                        }
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    {/* ANALYSIS TAB */}
                    {activeTab === 'analysis' && (
                        <div className="p-6 h-full bg-[#121212] overflow-y-auto">
                            {!metrics ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#5A5A5A] opacity-60">
                                    <BarChart3 size={48} className="mb-4" />
                                    <p className="text-sm font-medium">Not enough data for analysis</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        {/* Health Score Card */}
                                        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 relative overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[220px]">
                                            <div className="absolute top-0 right-0 p-16 bg-[#4C8DFF]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                            <h3 className="text-sm font-bold text-[#808080] uppercase tracking-wider mb-6 z-10">Equipment Health</h3>
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="relative w-32 h-32 flex items-center justify-center">
                                                    {/* Outer Ring */}
                                                    <div className="absolute inset-0 rounded-full border-[6px] border-[#252525]" />
                                                    {/* Progress Ring (SVG for precision) */}
                                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                        <circle
                                                            cx="64" cy="64" r="58"
                                                            fill="none" stroke={metrics.healthScore > 80 ? '#22c55e' : metrics.healthScore > 50 ? '#eab308' : '#ef4444'}
                                                            strokeWidth="6"
                                                            strokeDasharray="364"
                                                            strokeDashoffset={364 - (metrics.healthScore / 100) * 364}
                                                            strokeLinecap="round"
                                                            className="transition-all duration-1000 ease-out"
                                                        />
                                                    </svg>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-4xl font-bold text-white tracking-tighter">{metrics.healthScore}</span>
                                                        <span className="text-[10px] uppercase font-bold text-[#808080] mt-1">Score</span>
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-xs font-medium text-[#B8B8B8] max-w-[200px] text-center leading-relaxed">
                                                    Based on frequency of repairs, age, and maintenance adhering.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Cost Analysis */}
                                        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
                                            <div className="absolute bottom-0 left-0 p-16 bg-green-500/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
                                            <div className="flex justify-between items-start z-10">
                                                <div>
                                                    <h3 className="text-sm font-bold text-[#808080] uppercase tracking-wider">Cost Efficiency</h3>
                                                    <p className="text-3xl font-bold text-white mt-2 tracking-tight">{formatCurrency(totalCost)}</p>
                                                    <p className="text-xs text-green-400 font-medium mt-1 flex items-center gap-1">
                                                        <TrendingUp size={12} /> +12% vs last year
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-green-900/20 rounded-xl text-green-400 border border-green-500/20">
                                                    <DollarSign size={20} />
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-3 z-10">
                                                <div>
                                                    <div className="flex justify-between text-[11px] font-medium text-[#808080] mb-1">
                                                        <span>Repair Costs</span>
                                                        <span className="text-white">75%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#252525] rounded-full overflow-hidden">
                                                        <div className="h-full bg-red-500 w-3/4 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-[11px] font-medium text-[#808080] mb-1">
                                                        <span>Preventive</span>
                                                        <span className="text-white">25%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#252525] rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-1/4 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reliability Stats */}
                                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 shadow-lg mb-6">
                                        <h3 className="text-sm font-bold text-[#808080] uppercase tracking-wider mb-5">Reliability Metrics</h3>
                                        <div className="grid grid-cols-3 gap-8 text-center divide-x divide-white/5">
                                            <div className="px-4">
                                                <div className="text-3xl font-bold text-white mb-1">98.5%</div>
                                                <div className="text-[10px] uppercase font-bold text-[#808080]">Uptime</div>
                                            </div>
                                            <div className="px-4">
                                                <div className="text-3xl font-bold text-white mb-1">{metrics.mtbf}<span className="text-sm text-[#5A5A5A] ml-1">days</span></div>
                                                <div className="text-[10px] uppercase font-bold text-[#808080]">MTBF</div>
                                            </div>
                                            <div className="px-4">
                                                <div className="text-3xl font-bold text-white mb-1">0<span className="text-sm text-[#5A5A5A] ml-1">critical</span></div>
                                                <div className="text-[10px] uppercase font-bold text-[#808080]">Failures</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* Monthly Cost Trend */}
                                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2E2E2E]">
                                            <h4 className="text-white font-medium mb-3 flex items-center gap-2 text-xs">
                                                <BarChart3 size={14} className="text-[#4C8DFF]" />
                                                Maintenance Cost Trend (L12M)
                                            </h4>
                                            <div className="h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={analyticsData.monthlyCostData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
                                                        <XAxis dataKey="month" stroke="#5A5A5A" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                                                        <YAxis stroke="#5A5A5A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: '#1A1A1A',
                                                                border: '1px solid #2E2E2E',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                                                color: '#fff',
                                                                fontSize: '12px'
                                                            }}
                                                            formatter={(value: number) => [`$${value}`, 'Cost']}
                                                        />
                                                        <Line type="monotone" dataKey="cost" stroke="#4C8DFF" strokeWidth={2} dot={{ fill: '#1E1E1E', stroke: '#4C8DFF', strokeWidth: 2, r: 3 }} activeDot={{ r: 5, fill: '#4C8DFF' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Type Distribution */}
                                        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2E2E2E]">
                                            <h4 className="text-white font-medium mb-3 flex items-center gap-2 text-xs">
                                                <PieChart size={14} className="text-[#10B981]" />
                                                Maintenance Type Mix
                                            </h4>
                                            <div className="h-48 flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPieChart>
                                                        <Pie
                                                            data={analyticsData.maintenanceTypeData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={70}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {analyticsData.maintenanceTypeData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#4C8DFF', '#10B981', '#F59E0B', '#EF4444'][index % 4]} stroke="none" />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: '#1A1A1A',
                                                                border: '1px solid #2E2E2E',
                                                                borderRadius: '8px',
                                                                color: '#fff',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        <Legend
                                                            verticalAlign="middle"
                                                            align="right"
                                                            layout="vertical"
                                                            iconType="circle"
                                                            wrapperStyle={{ fontSize: '10px' }}
                                                        />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {showAddForm && (
                        <form onSubmit={handleAddLog} className="p-6 max-w-xl mx-auto">
                            <div className="flex items-center gap-3 mb-5">
                                <button type="button" onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-[#B8B8B8] hover:text-white transition-all">
                                    <ArrowLeft size={16} />
                                </button>
                                <div>
                                    <h3 className="text-base font-bold text-white">New Maintenance Log</h3>
                                    <p className="text-[#808080] text-xs">Record maintenance for {equipment.name}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[#D9D9D9] text-xs font-medium mb-1.5 block">Maintenance Type</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {(['PREVENTIVE', 'REPAIR', 'INSPECTION'] as MaintenanceType[]).map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setNewLog({ ...newLog, maintenanceType: type })}
                                                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${newLog.maintenanceType === type
                                                            ? getTypeStyles(type) + ' ring-1 ring-offset-1 ring-offset-[#121212]'
                                                            : 'bg-[#1E1E1E] text-[#B8B8B8] border-[#2E2E2E] hover:border-[#3E3E3E]'
                                                            }`}
                                                    >
                                                        {getTypeIcon(type)}
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[#D9D9D9] text-xs font-medium mb-1.5 block">Description</label>
                                            <textarea
                                                value={newLog.description}
                                                onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                                className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg p-2.5 text-white text-xs placeholder-[#5A5A5A] focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] transition-all resize-none h-[120px]"
                                                placeholder="Describe the work performed..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[#D9D9D9] text-xs font-medium mb-1.5 block">Technician</label>
                                        <div className="relative">
                                            <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]" />
                                            <input
                                                type="text"
                                                value={newLog.technicianName}
                                                onChange={e => setNewLog({ ...newLog, technicianName: e.target.value })}
                                                className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg p-2 pl-8 text-white text-xs placeholder-[#5A5A5A] focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] transition-all"
                                                placeholder="Name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[#D9D9D9] text-xs font-medium mb-1.5 block">Cost ($)</label>
                                        <div className="relative">
                                            <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]" />
                                            <input
                                                type="number"
                                                value={newLog.cost}
                                                onChange={e => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                                                className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg p-2 pl-8 text-white text-xs placeholder-[#5A5A5A] focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[#D9D9D9] text-xs font-medium mb-1.5 block">Date</label>
                                        <div className="relative">
                                            <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]" />
                                            <input
                                                type="date"
                                                value={newLog.maintenanceDate}
                                                onChange={e => setNewLog({ ...newLog, maintenanceDate: e.target.value })}
                                                className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg p-2 pl-8 text-white text-xs focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] transition-all [color-scheme:dark]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[#D9D9D9] text-xs font-medium mb-1.5 block">Status</label>
                                        <select
                                            value={newLog.status}
                                            onChange={e => setNewLog({ ...newLog, status: e.target.value as MaintenanceStatus })}
                                            className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg p-2 text-white text-xs focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] transition-all"
                                        >
                                            <option value="COMPLETED">Completed</option>
                                            <option value="SCHEDULED">Scheduled</option>
                                            <option value="OVERDUE">Overdue</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#4C8DFF] to-[#3A7BE8] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#4C8DFF]/30 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <CheckCircle size={14} /> Save Record
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-[#2E2E2E] bg-[#161616] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-xs text-[#808080]">
                        <TrendingUp size={14} />
                        <span>Last maintained: <span className="text-white font-medium">{equipment.lastMaintenanceDate ? formatDate(equipment.lastMaintenanceDate) : 'Never'}</span></span>
                    </div>
                    {equipment.nextMaintenanceDueDate && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400">
                            <Calendar size={14} />
                            <span>Due: {formatDate(equipment.nextMaintenanceDueDate)}</span>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div >
    );
};

export default MaintenancePanel;
