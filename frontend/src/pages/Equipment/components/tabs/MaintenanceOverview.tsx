import React from 'react';
import { motion } from 'framer-motion';
import { FileText, IndianRupee, AlertCircle, Zap, ClipboardCheck, Wrench, Shield, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type { EquipmentMaintenance, MaintenanceType } from '../../../../types/equipmentMaintenance';

interface MaintenanceOverviewProps {
    stats: {
        total: number;
        totalCost: number;
        overdue: number;
        scheduled: number;
        health: number;
    };
    history: EquipmentMaintenance[];
    setActiveTab: (tab: any) => void;
}

export const MaintenanceOverview: React.FC<MaintenanceOverviewProps> = ({ stats, history, setActiveTab }) => {

    const getTypeStyles = (type: MaintenanceType) => {
        const colors: Record<string, string> = { PREVENTIVE: '#22c55e', REPAIR: '#ef4444', INSPECTION: '#3b82f6' };
        const bgs: Record<string, string> = { PREVENTIVE: 'rgba(34, 197, 94, 0.1)', REPAIR: 'rgba(239, 68, 68, 0.1)', INSPECTION: 'rgba(59, 130, 246, 0.1)' };
        return { color: colors[type] || 'var(--text-secondary)', bg: bgs[type] || 'var(--bg-surface-secondary)' };
    };

    return (
        <div className="space-y-5">
            {/* KPI Grid */}
            <div className="maintenance-stat-grid">
                {[
                    { label: 'Total Logs', value: stats.total, icon: FileText, color: '#3b82f6' },
                    { label: 'Total Cost', value: formatCurrency(stats.totalCost), icon: IndianRupee, color: '#22c55e' },
                    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: '#ef4444', highlight: stats.overdue > 0 },
                    { label: 'Health', value: `${stats.health}%`, icon: Zap, color: '#a855f7' }
                ].map(({ label, value, icon: Icon, color, highlight }) => (
                    <div
                        key={label}
                        className={`maintenance-stat-card ${highlight ? 'border-red-500/40 bg-red-500/5' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-color)] shrink-0">
                            <Icon size={14} style={{ color }} />
                        </div>
                        <div className="maintenance-stat-info">
                            <p className="maintenance-stat-val">{value}</p>
                            <p className="maintenance-stat-label">{label}</p>
                        </div>
                        {highlight && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                ))}
            </div>

            {/* Two columns: timeline + queue */}
            <div className="grid grid-cols-3 gap-4">
                {/* Recent Activity */}
                <div className="col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="eq-section-title flex-none">Recent Activity</h3>
                        <button
                            onClick={() => setActiveTab('history')}
                            className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider hover:gap-2 transition-all"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="maintenance-timeline">
                        {history.length === 0 ? (
                            <div className="py-6 rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center text-[var(--text-secondary)]">
                                <ClipboardCheck size={20} className="opacity-20 mb-2" />
                                <p className="text-[11px] font-semibold">No maintenance records yet</p>
                            </div>
                        ) : (
                            history.slice(0, 4).map(r => {
                                const styles = getTypeStyles(r.maintenanceType);
                                return (
                                    <div key={r.id} className="timeline-item">
                                        <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: styles.bg }}>
                                                {r.maintenanceType === 'REPAIR' ? <Wrench size={12} style={{ color: styles.color }} /> :
                                                    r.maintenanceType === 'PREVENTIVE' ? <Shield size={12} style={{ color: styles.color }} /> :
                                                        <ClipboardCheck size={12} style={{ color: styles.color }} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] truncate">{r.description}</h4>
                                                        <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{r.technicianName} &middot; {r.maintenanceType}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[9px] font-semibold text-[var(--text-secondary)]">{formatDate(r.maintenanceDate)}</p>
                                                        <p className="text-[10px] font-bold text-[var(--text-primary)]">{formatCurrency(r.cost)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Queue + Insight */}
                <div className="space-y-4">
                    <div>
                        <h3 className="eq-section-title mb-2">Queue</h3>
                        {stats.scheduled === 0 ? (
                            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10 flex flex-col items-center text-center">
                                <CheckCircle size={18} className="text-green-500 mb-1" />
                                <p className="text-[11px] font-bold text-green-600">All Clear</p>
                                <p className="text-[9px] text-green-600/60 uppercase font-bold tracking-wider mt-0.5">No pending tasks</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {history.filter(r => r.status === 'SCHEDULED').slice(0, 3).map(r => {
                                    const typeStyles = getTypeStyles(r.maintenanceType);
                                    return (
                                        <div key={r.id} className="p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wider" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color }}>{r.maintenanceType}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1"><Calendar size={10} /> {formatDate(r.maintenanceDate)}</span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-[var(--text-primary)] line-clamp-2">{r.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                        <h3 className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 mb-1.5">Insight</h3>
                        <p className="text-[11px] font-medium text-[var(--text-primary)] leading-relaxed">
                            {stats.health > 80 ? 'Asset in prime condition. Continue preventive schedule.' :
                                stats.health > 50 ? 'Performance within limits, efficiency may be decreasing.' :
                                    'Critical maintenance needed to prevent failure.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
