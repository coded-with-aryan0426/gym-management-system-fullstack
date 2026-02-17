import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, TrendingUp, Calendar, LayoutDashboard, History, CalendarDays, BarChart3, Activity, AlertTriangle, Wrench, RefreshCw } from 'lucide-react';
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

    const statusMap: Record<string, { color: string; label: string; bg: string }> = {
        ACTIVE: { color: '#22c55e', label: 'Active', bg: 'rgba(34, 197, 94, 0.08)' },
        MAINTENANCE: { color: '#f59e0b', label: 'In Maintenance', bg: 'rgba(245, 158, 11, 0.08)' },
        INACTIVE: { color: '#ef4444', label: 'Out of Service', bg: 'rgba(239, 68, 68, 0.08)' },
        OUT_OF_SERVICE: { color: '#ef4444', label: 'Out of Service', bg: 'rgba(239, 68, 68, 0.08)' },
    };
    const eqStatus = statusMap[equipment.status] || statusMap.ACTIVE;
    const healthColor = stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#f59e0b' : '#ef4444';

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
                        {/* ===== HEADER — Equipment Info Banner ===== */}
                        <header className="maint-panel-header">
                            <div className="maint-panel-header__left">
                                <div className="maint-panel-header__icon">
                                    {getEquipmentIcon(equipment.category, equipment.name, 24)}
                                </div>
                                <div className="maint-panel-header__info">
                                    <div className="maint-panel-header__title-row">
                                        <h1 className="maint-panel-header__name">{equipment.name}</h1>
                                        <span className="maint-status-chip" style={{
                                            color: eqStatus.color,
                                            borderColor: `${eqStatus.color}40`,
                                            backgroundColor: eqStatus.bg
                                        }}>
                                            <span className="maint-status-chip__dot" style={{ backgroundColor: eqStatus.color }} />
                                            {eqStatus.label}
                                        </span>
                                    </div>
                                    <div className="maint-panel-header__meta">
                                        {equipment.brand && <span className="maint-meta-tag">{equipment.brand}</span>}
                                        {equipment.model && <><span className="maint-meta-sep">/</span><span className="maint-meta-tag maint-meta-tag--accent">{equipment.model}</span></>}
                                        {equipment.location && <><span className="maint-meta-sep">/</span><span className="maint-meta-tag maint-meta-tag--dim">{equipment.location}</span></>}
                                    </div>
                                </div>
                            </div>
                            <div className="maint-panel-header__actions">
                                {/* Quick stats in header */}
                                <div className="maint-header-stats">
                                    <div className="maint-header-stat" style={{ '--stat-color': healthColor } as React.CSSProperties}>
                                        <Activity size={12} />
                                        <span className="maint-header-stat__val">{stats.health}%</span>
                                        <span className="maint-header-stat__label">Health</span>
                                    </div>
                                    {stats.overdue > 0 && (
                                        <div className="maint-header-stat maint-header-stat--alert">
                                            <AlertTriangle size={12} />
                                            <span className="maint-header-stat__val">{stats.overdue}</span>
                                            <span className="maint-header-stat__label">Overdue</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setShowAddForm(true); setSubmitSuccess(false); }}
                                    className="maint-btn-new"
                                >
                                    <Plus size={14} strokeWidth={2.5} />
                                    <span>New Log</span>
                                </button>
                                <button onClick={onClose} className="maint-btn-close">
                                    <X size={16} />
                                </button>
                            </div>
                        </header>

                        {/* ===== TAB BAR ===== */}
                        <nav className="maint-nav">
                            <div className="maint-nav__tabs">
                                {navItems.map(item => {
                                    const isActive = activeTab === item.id && !showAddForm;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setShowAddForm(false); }}
                                            className={`maint-nav__tab ${isActive ? 'maint-nav__tab--active' : ''}`}
                                        >
                                            <item.icon size={14} />
                                            <span>{item.label}</span>
                                            {item.count !== undefined && item.count > 0 && (
                                                <span className="maint-nav__badge">{item.count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="maint-nav__right">
                                {equipment.nextMaintenanceDueDate && (
                                    <span className="maint-next-due">
                                        <Calendar size={11} />
                                        Next: <strong>{formatDate(equipment.nextMaintenanceDueDate)}</strong>
                                    </span>
                                )}
                                <button onClick={loadHistory} className="maint-btn-refresh" title="Refresh">
                                    <RefreshCw size={13} />
                                </button>
                            </div>
                        </nav>

                        {/* ===== CONTENT AREA ===== */}
                        <div className="maint-content">
                            {loading ? (
                                <div className="maint-loader">
                                    <div className="maint-spinner">
                                        <div className="maint-spinner__track" />
                                        <div className="maint-spinner__fill" />
                                    </div>
                                    <p className="maint-loader__text">Loading maintenance data...</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {showAddForm ? (
                                        <motion.div
                                            key="form"
                                            className="maint-content__slide"
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
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.18 }}
                                            className="maint-content__body custom-scrollbar"
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
