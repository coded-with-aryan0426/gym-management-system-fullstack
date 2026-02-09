import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, TrendingUp, Calendar, LayoutDashboard, History, CalendarDays, BarChart3, Settings2 } from 'lucide-react';
import { equipmentApi } from '../../../services/equipmentApi';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { formatDate } from '../../../utils/formatters';
import type { Equipment } from '../../../types/equipment';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';

// Sub-components
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
        setIsSubmitting(true);
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
        } finally {
            setIsSubmitting(false);
        }
    };

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

    if (!isOpen || !equipment) return null;

    const navItems: { id: TabType; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'history', label: 'History', icon: History },
        { id: 'schedule', label: 'Schedule', icon: CalendarDays },
        { id: 'analysis', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="eq-modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="eq-modal eq-modal--xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <header className="eq-modal__header">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--bg-surface-secondary)] to-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] shadow-xl shadow-black/30 group transition-transform hover:scale-105">
                                    {getEquipmentIcon(equipment.category, equipment.name, 32)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{equipment.name}</h1>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                            equipment.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
                                            equipment.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        }`}>{equipment.status}</div>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] font-medium mt-1.5 flex items-center gap-2">
                                        <span className="opacity-80">{equipment.brand}</span>
                                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                                        <span className="font-mono opacity-60 text-xs">{equipment.serialNumber || `SN-${equipment.id}`}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowAddForm(true)}
                                    className="eq-btn eq-btn--primary h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600"
                                >
                                    <Plus size={18} strokeWidth={3} /> <span className="font-bold">New Log</span>
                                </motion.button>

                                <button onClick={onClose} className="eq-modal__close">
                                    <X size={20} />
                                </button>
                            </div>
                        </header>

                        <div className="eq-modal-layout">
                            {/* NAVIGATION SIDEBAR */}
                            <aside className="w-[260px] bg-[var(--bg-surface-secondary)] border-right border-[var(--border-color)] flex flex-col p-6 gap-8">
                                <section>
                                    <h3 className="eq-section-title">Navigation</h3>
                                    <nav className="flex flex-col gap-1.5 mt-4">
                                        {navItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setActiveTab(item.id); setShowAddForm(false); }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                                                    activeTab === item.id && !showAddForm 
                                                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-lg shadow-black/10 border border-[var(--border-color)]' 
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50'
                                                }`}
                                            >
                                                <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                                                {item.label}
                                                {activeTab === item.id && (
                                                    <motion.div layoutId="active-tab-glow" className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                                                )}
                                            </button>
                                        ))}
                                    </nav>
                                </section>

                                <section>
                                    <h3 className="eq-section-title">Maintenance Profile</h3>
                                    <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold opacity-60">Asset Health</span>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-[var(--bg-surface-secondary)] rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${stats.health}%` }}
                                                        className={`h-full ${stats.health > 80 ? 'bg-green-500' : stats.health > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold font-mono">{stats.health}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-color)]">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Settings2 size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-[var(--text-secondary)]">Last Service</span>
                                                <span className="text-xs font-semibold">{equipment.lastMaintenanceDate ? formatDate(equipment.lastMaintenanceDate) : 'None'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </aside>

                            {/* MAIN CONTENT AREA */}
                            <main className="flex-1 overflow-hidden relative bg-[var(--bg-surface)]">
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
                                                onCancel={() => setShowAddForm(false)}
                                                isLoading={isSubmitting}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="h-full overflow-y-auto custom-scrollbar p-10"
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
                            </main>
                        </div>

                        {/* STATUS BAR FOOTER */}
                        <footer className="h-14 px-8 border-t border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex items-center justify-between z-20">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-secondary)]">
                                    <TrendingUp size={16} className="text-[var(--accent-primary)]" />
                                    <span>Reliability Index: <span className="text-[var(--text-primary)]">{stats.health > 90 ? 'Excellent' : stats.health > 70 ? 'Optimal' : 'Needs Attention'}</span></span>
                                </div>
                                {equipment.nextMaintenanceDueDate && (
                                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Calendar size={14} strokeWidth={3} />
                                        <span>Next service: {formatDate(equipment.nextMaintenanceDueDate)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-30 select-none">
                                Fleet Management Engine 4.0
                            </div>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MaintenancePanel;
