import React from 'react';
import { FileText, IndianRupee, AlertCircle, Zap, ClipboardCheck, Wrench, Shield, Calendar, ArrowRight, CheckCircle, Clock, TrendingUp, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type { EquipmentMaintenance, MaintenanceType } from '../../../../types/equipmentMaintenance';

interface MaintenanceOverviewProps {
    stats: {
        total: number;
        totalCost: number;
        overdue: number;
        scheduled: number;
        completed?: number;
        health: number;
    };
    history: EquipmentMaintenance[];
    setActiveTab: (tab: any) => void;
}

export const MaintenanceOverview: React.FC<MaintenanceOverviewProps> = ({ stats, history, setActiveTab }) => {

    const getTypeStyles = (type: MaintenanceType) => {
        const map: Record<MaintenanceType, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
            PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.18)', icon: <Shield size={14} />, label: 'Preventive' },
            REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.18)', icon: <Wrench size={14} />, label: 'Repair' },
            INSPECTION: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.18)', icon: <ClipboardCheck size={14} />, label: 'Inspection' }
        };
        return map[type] || { color: 'var(--text-secondary)', bg: 'var(--glass-bg)', border: 'var(--glass-border)', icon: <FileText size={14} />, label: type };
    };

    const getStatusStyle = (status: string) => {
        const map: Record<string, { color: string; bg: string; label: string }> = {
            COMPLETED: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', label: 'Done' },
            SCHEDULED: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', label: 'Scheduled' },
            OVERDUE: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', label: 'Overdue' },
            CANCELLED: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.08)', label: 'Cancelled' },
        };
        return map[status] || { color: 'var(--text-secondary)', bg: 'var(--glass-bg)', label: status };
    };

    const healthColor = stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#f59e0b' : '#ef4444';
    const healthLabel = stats.health > 80 ? 'Excellent' : stats.health > 60 ? 'Good' : stats.health > 40 ? 'Fair' : 'Critical';

    const kpiCards = [
        { label: 'Total Records', value: stats.total, icon: FileText, color: '#3b82f6', colorName: 'blue' },
        { label: 'Total Spent', value: formatCurrency(stats.totalCost), icon: IndianRupee, color: '#22c55e', colorName: 'green' },
        { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: '#ef4444', colorName: 'red', alert: stats.overdue > 0 },
        { label: 'Health Score', value: `${stats.health}%`, icon: Zap, color: healthColor, colorName: stats.health > 70 ? 'green' : stats.health > 40 ? 'amber' : 'red' }
    ];

    return (
        <div className="maint-overview">
            {/* KPI Cards */}
            <div className="maintenance-stat-grid">
                {kpiCards.map(({ label, value, icon: Icon, color, colorName, alert }) => (
                    <div
                        key={label}
                        className={`maintenance-stat-card maintenance-stat-card--${colorName} ${alert ? 'maintenance-stat-card--alert' : ''}`}
                    >
                        <div className={`stat-icon-wrap stat-icon-wrap--${colorName}`}>
                            <Icon size={18} />
                        </div>
                        <div className="maintenance-stat-info">
                            <p className="maintenance-stat-val">{value}</p>
                            <p className="maintenance-stat-label">{label}</p>
                        </div>
                        {alert && <span className="stat-alert-dot" />}
                    </div>
                ))}
            </div>

            {/* Main content — 2/3 + 1/3 layout */}
            <div className="maint-overview__grid">
                {/* Left — Recent Activity */}
                <div className="maint-overview__main">
                    <div className="maint-section-header">
                        <h3 className="eq-section-title" style={{ marginBottom: 0 }}>Recent Activity</h3>
                        {history.length > 0 && (
                            <button onClick={() => setActiveTab('history')} className="maint-link-btn">
                                View All <ArrowRight size={12} />
                            </button>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">
                                <ClipboardCheck size={22} />
                            </div>
                            <p className="empty-state__title">No maintenance records</p>
                            <p className="empty-state__desc">Click "New Log" to add your first maintenance record for this equipment</p>
                        </div>
                    ) : (
                        <div className="maint-activity-list">
                            {history.slice(0, 5).map((r, idx) => {
                                const ts = getTypeStyles(r.maintenanceType);
                                const ss = getStatusStyle(r.status);
                                return (
                                    <div key={r.id} className="maint-activity-card" style={{ '--activity-color': ts.color } as React.CSSProperties}>
                                        <div className="maint-activity-card__indicator" style={{ backgroundColor: ts.color }} />
                                        <div className="maint-activity-card__icon" style={{ backgroundColor: ts.bg, borderColor: ts.border, color: ts.color }}>
                                            {ts.icon}
                                        </div>
                                        <div className="maint-activity-card__body">
                                            <div className="maint-activity-card__top">
                                                <div className="maint-activity-card__title-area">
                                                    <h4 className="maint-activity-card__title">{r.description}</h4>
                                                    <div className="maint-activity-card__badges">
                                                        <span className="maint-badge" style={{ color: ts.color, backgroundColor: ts.bg, borderColor: ts.border }}>
                                                            {ts.label}
                                                        </span>
                                                        <span className="maint-badge" style={{ color: ss.color, backgroundColor: ss.bg, borderColor: `${ss.color}25` }}>
                                                            {ss.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="maint-activity-card__right">
                                                    <span className="maint-activity-card__cost">{formatCurrency(r.cost)}</span>
                                                    <span className="maint-activity-card__date">
                                                        <Clock size={10} /> {formatDate(r.maintenanceDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            {r.technicianName && (
                                                <div className="maint-activity-card__footer">
                                                    <span className="maint-activity-card__tech">
                                                        <User size={10} /> {r.technicianName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="maint-overview__sidebar">
                    {/* Health Score Card */}
                    <div className="maint-health-card">
                        <h3 className="maint-health-card__title">Health Score</h3>
                        <div className="maint-health-ring">
                            <svg viewBox="0 0 120 120" className="maint-health-ring__svg">
                                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
                                <circle
                                    cx="60" cy="60" r="48" fill="none"
                                    stroke={healthColor}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${stats.health * 3.015} 301.5`}
                                    className="maint-health-ring__fill"
                                />
                            </svg>
                            <div className="maint-health-ring__center">
                                <span className="maint-health-ring__value" style={{ color: healthColor }}>{stats.health}</span>
                                <span className="maint-health-ring__unit">/ 100</span>
                            </div>
                        </div>
                        <span className="maint-health-label" style={{ color: healthColor, backgroundColor: `${healthColor}12`, borderColor: `${healthColor}25` }}>
                            {healthLabel}
                        </span>
                        <p className="maint-health-desc">
                            {stats.health > 80 ? 'Equipment is in excellent condition. Keep up the preventive schedule.' :
                                stats.health > 50 ? 'Acceptable range. Monitor and schedule preventive checks.' :
                                    'Critical: Immediate maintenance action required to prevent failure.'}
                        </p>
                    </div>

                    {/* Queue */}
                    <div className="maint-queue-card">
                        <h3 className="maint-queue-card__title">
                            Upcoming Tasks
                            {stats.scheduled > 0 && <span className="maint-queue-card__count">{stats.scheduled}</span>}
                        </h3>
                        {stats.scheduled === 0 ? (
                            <div className="maint-queue-clear">
                                <CheckCircle size={20} />
                                <span className="maint-queue-clear__text">All Clear</span>
                                <span className="maint-queue-clear__sub">No pending maintenance</span>
                            </div>
                        ) : (
                            <div className="maint-queue-list">
                                {history.filter(r => r.status === 'SCHEDULED').slice(0, 3).map(r => {
                                    const ts = getTypeStyles(r.maintenanceType);
                                    return (
                                        <div key={r.id} className="maint-queue-item">
                                            <div className="maint-queue-item__icon" style={{ color: ts.color, backgroundColor: ts.bg }}>
                                                {ts.icon}
                                            </div>
                                            <div className="maint-queue-item__info">
                                                <p className="maint-queue-item__desc">{r.description}</p>
                                                <span className="maint-queue-item__date">
                                                    <Calendar size={10} /> {formatDate(r.maintenanceDate)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.scheduled > 3 && (
                                    <button onClick={() => setActiveTab('schedule')} className="maint-link-btn" style={{ justifyContent: 'center', width: '100%', marginTop: '4px' }}>
                                        +{stats.scheduled - 3} more <ArrowRight size={11} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
