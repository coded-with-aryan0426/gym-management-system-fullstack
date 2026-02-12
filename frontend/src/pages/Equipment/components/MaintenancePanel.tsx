import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, TrendingUp, Calendar, LayoutDashboard, History, CalendarDays, BarChart3 } from 'lucide-react';
import { equipmentApi } from '../../../services/equipmentApi';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { formatDate } from '../../../utils/formatters';
import type { Equipment } from '../../../types/equipment';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';

import { MaintenanceOverview } from './tabs/MaintenanceOverview';
import { MaintenanceHistory } from './tabs/MaintenanceHistory';
import { MaintenanceSchedule } from './tabs/MaintenanceSchedule';
import { MaintenanceAnalysis } from './tabs/MaintenanceAnalysis';
import { MaintenanceForm } from './MaintenanceForm';

import '../EquipmentModals.css';

interface MaintenancePanelProps {
    equipment: Equipment | null;
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'overview' | 'history' | 'schedule' | 'analysis';

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ equipment, isOpen, onClose }) => {
    const [history, setHistory] = useState<EquipmentMaintenance[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [newLog, setNewLog] = useState({
        maintenanceType: 'PREVENTIVE' as MaintenanceType,
        description: '',
        technicianName: '',
        cost: 0,
        maintenanceDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED' as MaintenanceStatus
    });

    useEffect(() => {
        if (equipment && isOpen) {
            loadHistory();
            setShowAddForm(false);
            setActiveTab('overview');
            setSubmitSuccess(false);
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

    const resetForm = () => {
        setNewLog({
            maintenanceType: 'PREVENTIVE',
            description: '',
            technicianName: '',
            cost: 0,
            maintenanceDate: new Date().toISOString().split('T')[0],
            status: 'COMPLETED'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipment) return;
        setIsSubmitting(true);
        try {
            await equipmentApi.logMaintenance(equipment.id, newLog);
            setSubmitSuccess(true);
            setTimeout(() => {
                setShowAddForm(false);
                setSubmitSuccess(false);
                resetForm();
                loadHistory();
            }, 800);
        } catch (error) {
            console.error('Failed to log maintenance', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = useMemo(() => ({
        total: history.length,
        totalCost: history.reduce((sum, r) => sum + (r.cost || 0), 0),
        overdue: history.filter(r => r.status === 'OVERDUE').length,
        scheduled: history.filter(r => r.status === 'SCHEDULED').length,
        completed: history.filter(r => r.status === 'COMPLETED').length,
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

    if (!isOpen || !equipment) return null;

    const navItems: { id: TabType; label: string; icon: any; count?: number }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'history', label: 'History', icon: History, count: stats.total },
        { id: 'schedule', label: 'Schedule', icon: CalendarDays, count: stats.scheduled },
        { id: 'analysis', label: 'Analytics', icon: BarChart3 },
    ];

    const statusColor = equipment.status === 'ACTIVE' ? '#22c55e' :
        equipment.status === 'MAINTENANCE' ? '#eab308' : '#ef4444';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="eq-modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="eq-modal eq-modal--xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <header className="eq-modal__header">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]">
                                    {getEquipmentIcon(equipment.category, equipment.name, 22)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h1 className="eq-modal__title">{equipment.name}</h1>
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{
                                            color: statusColor,
                                            borderColor: `${statusColor}40`,
                                            backgroundColor: `${statusColor}10`
                                        }}>{equipment.status.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">{equipment.brand}</span>
                                        {equipment.model && (
                                            <>
                                                <span className="text-[var(--border-color)]">/</span>
                                                <span className="text-[11px] text-[var(--accent-primary)] font-semibold">{equipment.model}</span>
                                            </>
                                        )}
                                        {equipment.location && (
                                            <>
                                                <span className="text-[var(--border-color)]">/</span>
                                                <span className="text-[11px] text-[var(--text-secondary)]">{equipment.location}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setShowAddForm(true); setSubmitSuccess(false); }}
                                    className="eq-btn eq-btn--primary h-8 px-4 text-xs"
                                >
                                    <Plus size={14} /> New Log
                                </button>
                                <button onClick={onClose} className="eq-modal__close">
                                    <X size={16} />
                                </button>
                            </div>
                        </header>

                        {/* TAB BAR */}
                        <div className="maint-tabbar">
                            <div className="eq-tab-bar">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setShowAddForm(false); }}
                                        className={`eq-tab-btn ${activeTab === item.id && !showAddForm ? 'eq-tab-btn--active' : ''}`}
                                    >
                                        <item.icon size={13} />
                                        {item.label}
                                        {item.count !== undefined && item.count > 0 && (
                                            <span className="eq-tab-count">{item.count}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="maint-tabbar-info">
                                <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                                    <TrendingUp size={12} className="text-[var(--accent-primary)]" />
                                    Health: <strong className="text-[var(--text-primary)]">{stats.health}%</strong>
                                </span>
                                {equipment.nextMaintenanceDueDate && (
                                    <span className="maint-next-badge">
                                        <Calendar size={11} />
                                        Next: {formatDate(equipment.nextMaintenanceDueDate)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 overflow-hidden relative" style={{ minHeight: '420px' }}>
                            {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="relative w-8 h-8">
                                        <div className="absolute inset-0 border-2 border-[var(--accent-primary)]/20 rounded-full" />
                                        <div className="absolute inset-0 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="mt-3 text-[11px] text-[var(--text-secondary)]">Loading maintenance data...</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {showAddForm ? (
                                        <motion.div
                                            key="form"
                                            className="absolute inset-0 z-30 bg-[var(--bg-surface)]"
                                            initial={{ x: '100%' }}
                                            animate={{ x: 0 }}
                                            exit={{ x: '100%' }}
                                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                        >
                                            <MaintenanceForm
                                                newLog={newLog}
                                                setNewLog={setNewLog}
                                                onSubmit={handleSubmit}
                                                onCancel={() => { setShowAddForm(false); resetForm(); }}
                                                isLoading={isSubmitting}
                                                isSuccess={submitSuccess}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full overflow-y-auto custom-scrollbar p-5"
                                        >
                                            {activeTab === 'overview' && (
                                                <MaintenanceOverview stats={stats} history={history} setActiveTab={setActiveTab} />
                                            )}
                                            {activeTab === 'history' && (
                                                <MaintenanceHistory history={history} />
                                            )}
                                            {activeTab === 'schedule' && (
                                                <MaintenanceSchedule calendarEvents={calendarEvents} />
                                            )}
                                            {activeTab === 'analysis' && (
                                                <MaintenanceAnalysis stats={stats} history={history} chartData={chartData} />
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MaintenancePanel;
