import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { MaintenanceType } from '../../../../types/equipmentMaintenance';

interface MaintenanceAnalysisProps {
    stats: {
        health: number;
    };
    history: any[]; // Using any[] for now as per original code usage patterns, but ideally stricter
    chartData: { name: string; value: number }[];
}

export const MaintenanceAnalysis: React.FC<MaintenanceAnalysisProps> = ({ stats, history, chartData }) => {

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 space-y-5"
        >
            {history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                    <BarChart3 size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">Not enough data for analysis</p>
                    <p className="text-xs text-[var(--text-secondary)]">Add some maintenance records first</p>
                </div>
            ) : (
                <>
                    {/* Health Score Card */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="eq-card p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Equipment Health</h3>
                                <p className="text-[11px] text-[var(--text-secondary)]">Overall condition score</p>
                            </div>
                            <div className="flex items-center justify-center p-4">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="54" fill="none" className="stroke-[var(--border-color)]" strokeWidth="8" />
                                        <circle
                                            cx="64" cy="64" r="54" fill="none"
                                            stroke={stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#eab308' : '#ef4444'}
                                            strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${stats.health * 3.39} 339`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.health}</span>
                                        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Score</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="eq-card p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Type Distribution</h3>
                                <p className="text-[11px] text-[var(--text-secondary)]">Breakdown by maintenance type</p>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            dataKey="value"
                                            paddingAngle={4}
                                            stroke="none"
                                        >
                                            {chartData.map((entry, i) => (
                                                <Cell key={i} fill={getTypeStyles(entry.name as MaintenanceType).color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-surface)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                color: 'var(--text-primary)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                            labelStyle={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}
                                            cursor={false}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="eq-card p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">Summary</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                                <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{history.filter(r => r.maintenanceType === 'PREVENTIVE').length}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">Preventive</p>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                                <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{history.filter(r => r.maintenanceType === 'REPAIR').length}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">Repairs</p>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                                <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{history.filter(r => r.maintenanceType === 'INSPECTION').length}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">Inspections</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};
