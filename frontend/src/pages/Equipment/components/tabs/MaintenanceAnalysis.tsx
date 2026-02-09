import React from 'react';
import { BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { MaintenanceType } from '../../../../types/equipmentMaintenance';

interface MaintenanceAnalysisProps {
    stats: { health: number };
    history: any[];
    chartData: { name: string; value: number }[];
}

export const MaintenanceAnalysis: React.FC<MaintenanceAnalysisProps> = ({ stats, history, chartData }) => {
    const getTypeColor = (type: MaintenanceType) => {
        const c: Record<string, string> = { PREVENTIVE: '#22c55e', REPAIR: '#ef4444', INSPECTION: '#3b82f6' };
        return c[type] || 'var(--text-secondary)';
    };

    if (history.length === 0) {
        return (
            <div className="h-48 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <BarChart3 size={28} className="mb-2 opacity-30" />
                <p className="text-xs">Not enough data for analysis</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Add some maintenance records first</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Health + Distribution */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-lg">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3">Equipment Health</h3>
                    <div className="flex items-center justify-center">
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="56" cy="56" r="46" fill="none" className="stroke-[var(--border-color)]" strokeWidth="7" />
                                <circle
                                    cx="56" cy="56" r="46" fill="none"
                                    stroke={stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#eab308' : '#ef4444'}
                                    strokeWidth="7" strokeLinecap="round"
                                    strokeDasharray={`${stats.health * 2.89} 289`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-[var(--text-primary)]">{stats.health}</span>
                                <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Score</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-lg">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3">Type Distribution</h3>
                    <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={55}
                                    dataKey="value"
                                    paddingAngle={4}
                                    stroke="none"
                                >
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={getTypeColor(entry.name as MaintenanceType)} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: 'var(--text-primary)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Summary counts */}
            <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-lg">
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3">Summary</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                        <p className="text-lg font-bold text-[var(--text-primary)]">{history.filter(r => r.maintenanceType === 'PREVENTIVE').length}</p>
                        <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">Preventive</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                        <p className="text-lg font-bold text-[var(--text-primary)]">{history.filter(r => r.maintenanceType === 'REPAIR').length}</p>
                        <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">Repairs</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                        <p className="text-lg font-bold text-[var(--text-primary)]">{history.filter(r => r.maintenanceType === 'INSPECTION').length}</p>
                        <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">Inspections</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
