import React from 'react';
import { motion } from 'framer-motion';
import { FileText, IndianRupee, AlertCircle, Activity, ClipboardCheck, Wrench, Shield, User, CheckCircle, ArrowRight, Zap } from 'lucide-react';
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
            PREVENTIVE: '#22c55e',
            REPAIR: '#ef4444',
            INSPECTION: '#3b82f6'
        };
        const bgs: Record<string, string> = {
            PREVENTIVE: 'rgba(34, 197, 94, 0.1)',
            REPAIR: 'rgba(239, 68, 68, 0.1)',
            INSPECTION: 'rgba(59, 130, 246, 0.1)'
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
            className="space-y-10"
        >
            {/* KPI Grid */}
            <section>
                <h3 className="eq-section-title">Fleet Vitality KPIs</h3>
                <div className="maintenance-stat-grid mt-4">
                    {[
                        { label: 'Service Logs', value: stats.total, icon: FileText, color: '#3b82f6' },
                        { label: 'Expenditure', value: formatCurrency(stats.totalCost), icon: IndianRupee, color: '#22c55e' },
                        { label: 'Critical Overdue', value: stats.overdue, icon: AlertCircle, color: '#ef4444', highlight: stats.overdue > 0 },
                        { label: 'Health Score', value: `${stats.health}%`, icon: Zap, color: '#a855f7' }
                    ].map(({ label, value, icon: Icon, color, highlight }) => (
                        <motion.div
                            variants={item}
                            key={label}
                            className={`maintenance-stat-card group hover:border-[var(--accent-primary)] transition-all cursor-default ${highlight ? 'border-red-500/50 bg-red-500/5' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-color)] group-hover:border-[var(--accent-primary)] transition-colors">
                                    <Icon size={18} style={{ color }} />
                                </div>
                                {highlight && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                )}
                            </div>
                            <p className="maintenance-stat-val">{value}</p>
                            <p className="maintenance-stat-label">{label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-5 gap-10">
                {/* Recent Activity */}
                <div className="col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="eq-section-title flex-none">Service Timeline</h3>
                        <button 
                            onClick={() => setActiveTab('history')} 
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider hover:gap-2.5 transition-all"
                        >
                            View Full History <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="maintenance-timeline mt-4">
                        {history.length === 0 ? (
                            <div className="p-12 rounded-3xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-secondary)] flex items-center justify-center">
                                    <ClipboardCheck size={32} className="opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-sm">No Maintenance Data</p>
                                    <p className="text-[11px] opacity-60 mt-1">Start logging service records to track asset health.</p>
                                </div>
                            </div>
                        ) : (
                            history.slice(0, 4).map(r => {
                                const styles = getTypeStyles(r.maintenanceType);
                                return (
                                    <div key={r.id} className="timeline-item">
                                        <motion.div
                                            variants={item}
                                            className="p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group flex items-start gap-5 hover:shadow-xl hover:shadow-black/10"
                                        >
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: styles.bg }}>
                                                {r.maintenanceType === 'REPAIR' ? <Wrench size={20} style={{ color: styles.color }} /> :
                                                    r.maintenanceType === 'PREVENTIVE' ? <Shield size={20} style={{ color: styles.color }} /> :
                                                        <ClipboardCheck size={20} style={{ color: styles.color }} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{r.description}</h4>
                                                        <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">{r.technicianName} • <span className="opacity-70">{r.maintenanceType}</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-1 rounded-lg border border-[var(--border-color)] uppercase tracking-tighter">{formatDate(r.maintenanceDate)}</p>
                                                        <p className="text-xs font-bold text-[var(--text-primary)] mt-2">{formatCurrency(r.cost)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Upcoming / Sidebar stats */}
                <div className="col-span-2 space-y-6">
                    <section className="space-y-4">
                        <h3 className="eq-section-title">Maintenance Queue</h3>
                        <div className="space-y-3">
                            {stats.scheduled === 0 ? (
                                <div className="p-8 rounded-3xl bg-green-500/5 border border-green-500/10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-3">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-green-600">All Scheduled Tasks Clear</p>
                                    <p className="text-[10px] text-green-600/60 mt-1 uppercase font-black tracking-widest">Everything is running smooth</p>
                                </div>
                            ) : (
                                history.filter(r => r.status === 'SCHEDULED').slice(0, 3).map(r => {
                                    const typeStyles = getTypeStyles(r.maintenanceType);
                                    return (
                                        <motion.div
                                            variants={item}
                                            key={r.id}
                                            className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-surface-secondary)] to-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] shadow-sm transition-all"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border border-white/5 uppercase tracking-widest" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color }}>{r.maintenanceType}</span>
                                                <span className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-1"><Calendar size={12} /> {formatDate(r.maintenanceDate)}</span>
                                            </div>
                                            <p className="text-xs font-bold text-[var(--text-primary)] leading-relaxed line-clamp-2">{r.description}</p>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <section className="p-6 rounded-3xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">Insight</h3>
                            <p className="text-xs font-bold text-[var(--text-primary)] mt-3 leading-relaxed">
                                {stats.health > 80 ? 'The asset is in prime condition. Continue with preventive schedule.' : 
                                 stats.health > 50 ? 'Performance is within limits, but efficiency may be decreasing.' : 
                                 'Critical maintenance required to prevent permanent failure.'}
                            </p>
                        </div>
                        <Activity size={80} className="absolute -right-4 -bottom-4 text-[var(--accent-primary)] opacity-5 rotate-12" />
                    </section>
                </div>
            </div>
        </motion.div>
    );
};
