import React from 'react';
import { motion } from 'framer-motion';
import { FileText, IndianRupee, AlertCircle, Activity, ClipboardCheck, Wrench, Shield, User, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../../types/equipmentMaintenance';

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* KPI Grid */}
            <div>
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Overview KPIs</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Total Logs', value: stats.total, icon: FileText, bgColor: 'rgba(59, 130, 246, 0.1)', iconColor: '#3b82f6' },
                        { label: 'Total Cost', value: formatCurrency(stats.totalCost), icon: IndianRupee, bgColor: 'rgba(34, 197, 94, 0.1)', iconColor: '#22c55e' },
                        { label: 'Overdue', value: stats.overdue, icon: AlertCircle, bgColor: 'rgba(239, 68, 68, 0.1)', iconColor: '#ef4444', pulse: stats.overdue > 0 },
                        { label: 'Health', value: `${stats.health}%`, icon: Activity, bgColor: 'rgba(168, 85, 247, 0.1)', iconColor: '#a855f7' }
                    ].map(({ label, value, icon: Icon, bgColor, iconColor, pulse }) => (
                        <motion.div
                            variants={item}
                            key={label}
                            whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
                            className={`p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center gap-3 transition-all cursor-default ${pulse ? 'animate-pulse' : ''}`}
                            style={{ boxShadow: '0 4px 12px -4px rgba(0,0,0,0.08)' }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: bgColor }}
                            >
                                <Icon size={14} style={{ color: iconColor }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

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
                                    <motion.div
                                        variants={item}
                                        key={r.id}
                                        className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors group flex items-start gap-3 hover:shadow-sm"
                                    >
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: styles.bg }}>
                                            {r.maintenanceType === 'REPAIR' ? <Wrench size={14} style={{ color: styles.color }} /> :
                                                r.maintenanceType === 'PREVENTIVE' ? <Shield size={14} style={{ color: styles.color }} /> :
                                                    <ClipboardCheck size={14} style={{ color: styles.color }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{r.description}</h4>
                                                <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{formatDate(r.maintenanceDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-secondary)]">
                                                <span className="flex items-center gap-1"><User size={10} /> {r.technicianName}</span>
                                                <span className="flex items-center gap-1"><IndianRupee size={10} /> {formatCurrency(r.cost)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Upcoming */}
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
                                    <motion.div
                                        variants={item}
                                        key={r.id}
                                        className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/5" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color }}>{r.maintenanceType}</span>
                                            <span className="text-[10px] text-[var(--text-secondary)]">{formatDate(r.maintenanceDate)}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">{r.description}</p>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
