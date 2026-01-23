import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { equipmentApi } from '../../../services/equipmentApi';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { Equipment } from '../../../types/equipment';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';

// Sub-components
import { MaintenanceOverview } from './tabs/MaintenanceOverview';
import { MaintenanceHistory } from './tabs/MaintenanceHistory';
import { MaintenanceSchedule } from './tabs/MaintenanceSchedule';
import { MaintenanceAnalysis } from './tabs/MaintenanceAnalysis';
import { MaintenanceForm } from './MaintenanceForm';

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

    const [newLog, setNewLog] = useState({
        maintenanceType: 'PREVENTIVE' as MaintenanceType,
        description: '',
        technicianName: '',
        cost: 0,
        maintenanceDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED' as MaintenanceStatus
    });

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

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="eq-modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="eq-modal eq-modal--xl eq-modal--compact relative overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                        style={{ maxHeight: '95vh', minHeight: '80vh' }}
                    >
                        {/* HEADER */}
                        <header className="eq-modal__header z-20 relative bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] shadow-sm">
                                    {getEquipmentIcon(equipment.category, equipment.name, 24)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{equipment.name}</h1>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${equipment.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                                                equipment.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                    'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                            }`}>{equipment.status}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{equipment.brand} • <span className="font-mono opacity-70">{equipment.serialNumber || `SN-${equipment.id}`}</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* TAB NAVIGATION */}
                                <nav className="eq-tabs relative p-1 bg-[var(--bg-surface-secondary)] rounded-xl border border-[var(--border-color)]">
                                    {(['overview', 'history', 'schedule', 'analysis'] as TabType[]).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => { setActiveTab(tab); setShowAddForm(false); }}
                                            className={`relative z-10 px-4 py-1.5 text-xs font-bold capitalize transition-colors duration-200 ${activeTab === tab && !showAddForm ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        >
                                            {activeTab === tab && !showAddForm && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-[var(--bg-surface)] rounded-lg shadow-sm border border-[var(--border-color)]"
                                                    initial={false}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <span className="relative z-10">{tab}</span>
                                        </button>
                                    ))}
                                </nav>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowAddForm(true)}
                                    className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/40 transition-shadow"
                                >
                                    <Plus size={16} /> <span className="hidden sm:inline">Add Log</span>
                                </motion.button>

                                <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </header>

                        {/* CONTENT AREA */}
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
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full overflow-y-auto custom-scrollbar p-6"
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

                        {/* FOOTER */}
                        <footer className="px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex items-center justify-between text-[11px] font-medium z-20 relative">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <TrendingUp size={14} />
                                <span>Last maintained: <span className="text-[var(--text-primary)] font-bold">{equipment.lastMaintenanceDate ? formatDate(equipment.lastMaintenanceDate) : 'Never'}</span></span>
                            </div>
                            {equipment.nextMaintenanceDueDate && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20">
                                    <Calendar size={14} />
                                    <span>Due: <span className="font-bold">{formatDate(equipment.nextMaintenanceDueDate)}</span></span>
                                </div>
                            )}
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MaintenancePanel;
