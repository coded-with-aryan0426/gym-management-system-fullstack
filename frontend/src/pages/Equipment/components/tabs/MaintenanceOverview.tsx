import React from 'react';
import { FileText, IndianRupee, AlertCircle, Zap, ClipboardCheck, Wrench, Shield, Calendar, ArrowRight, CheckCircle, Clock } from 'lucide-react';
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
        const map: Record<MaintenanceType, { color: string; bg: string; icon: React.ReactNode }> = {
            PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <Shield size={13} /> },
            REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Wrench size={13} /> },
            INSPECTION: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <ClipboardCheck size={13} /> }
        };
        return map[type] || { color: 'var(--text-secondary)', bg: 'var(--bg-surface-secondary)', icon: <FileText size={13} /> };
    };

    const healthColor = stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#eab308' : '#ef4444';

    return (
        <div className="space-y-5">
            {/* KPI Grid */}
            <div className="maintenance-stat-grid">
                {[
                    { label: 'Total Logs', value: stats.total, icon: FileText, color: '#3b82f6' },
                    { label: 'Total Cost', value: formatCurrency(stats.totalCost), icon: IndianRupee, color: '#22c55e' },
                    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: '#ef4444', highlight: stats.overdue > 0 },
                    { label: 'Health', value: `${stats.health}%`, icon: Zap, color: healthColor }
                ].map(({ label, value, icon: Icon, color, highlight }) => (
                    <div
                        key={label}
                        className={`maintenance-stat-card ${highlight ? 'border-red-500/30' : ''}`}
                        style={highlight ? { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.03)' } : {}}
                    >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12`, border: `1px solid ${color}20` }}>
                            <Icon size={16} style={{ color }} />
                        </div>
                        <div className="maintenance-stat-info">
                            <p className="maintenance-stat-val">{value}</p>
                            <p className="maintenance-stat-label">{label}</p>
                        </div>
                        {highlight && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                ))}
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-3 gap-4">
                {/* Recent Activity */}
                <div className="col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="eq-section-title flex-none" style={{ marginBottom: 0 }}>Recent Activity</h3>
                        {history.length > 0 && (
                            <button
                                onClick={() => setActiveTab('history')}
                                className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider hover:gap-2 transition-all"
                            >
                                View All <ArrowRight size={12} />
                            </button>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div className="py-10 rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center text-[var(--text-secondary)]">
                            <ClipboardCheck size={24} className="opacity-20 mb-2" />
                            <p className="text-xs font-semibold">No maintenance records yet</p>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Click "New Log" to add your first record</p>
                        </div>
                    ) : (
                        <div className="maintenance-timeline">
                            {history.slice(0, 5).map(r => {
                                const styles = getTypeStyles(r.maintenanceType);
                                return (
                                    <div key={r.id} className="timeline-item">
                                        <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 transition-all">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: styles.bg }}>
                                                    {styles.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="min-w-0">
                                                            <h4 className="text-[12px] font-bold text-[var(--text-primary)] line-clamp-1">{r.description}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ backgroundColor: styles.bg, color: styles.color, borderColor: `${styles.color}20` }}>
                                                                    {r.maintenanceType}
                                                                </span>
                                                                <span className="text-[10px] text-[var(--text-secondary)]">{r.technicianName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 justify-end">
                                                                <Clock size={10} /> {formatDate(r.maintenanceDate)}
                                                            </p>
                                                            <p className="text-[11px] font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(r.cost)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Queue + Insight */}
                <div className="space-y-4">
                    <div>
                        <h3 className="eq-section-title mb-3" style={{ marginBottom: '8px' }}>Queue</h3>
                        {stats.scheduled === 0 ? (
                            <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/10 flex flex-col items-center text-center">
                                <CheckCircle size={20} className="text-green-500 mb-1.5" />
                                <p className="text-xs font-bold text-green-500">All Clear</p>
                                <p className="text-[9px] text-green-500/60 uppercase font-bold tracking-wider mt-0.5">No pending tasks</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {history.filter(r => r.status === 'SCHEDULED').slice(0, 3).map(r => {
                                    const typeStyles = getTypeStyles(r.maintenanceType);
                                    return (
                                        <div key={r.id} className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color, borderColor: `${typeStyles.color}20` }}>{r.maintenanceType}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1"><Calendar size={10} /> {formatDate(r.maintenanceDate)}</span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-[var(--text-primary)] line-clamp-2">{r.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Health indicator */}
                    <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                        <h3 className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 mb-3">Health Score</h3>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${stats.health}%`, backgroundColor: healthColor }}
                                />
                            </div>
                            <span className="text-sm font-bold" style={{ color: healthColor }}>{stats.health}%</span>
                        </div>
                        <p className="text-[10px] font-medium text-[var(--text-secondary)] leading-relaxed">
                            {stats.health > 80 ? 'Equipment in excellent condition. Continue preventive schedule.' :
                                stats.health > 50 ? 'Within acceptable range. Monitor for potential issues.' :
                                    'Critical: Immediate maintenance required to prevent failure.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
