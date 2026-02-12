import React from 'react';
import { BarChart3, TrendingUp, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../../utils/formatters';
import type { MaintenanceType } from '../../../../types/equipmentMaintenance';

interface MaintenanceAnalysisProps {
    stats: { health: number; totalCost?: number };
    history: any[];
    chartData: { name: string; value: number }[];
}

export const MaintenanceAnalysis: React.FC<MaintenanceAnalysisProps> = ({ stats, history, chartData }) => {
    const getTypeColor = (type: MaintenanceType) => {
        const c: Record<string, string> = { PREVENTIVE: '#22c55e', REPAIR: '#ef4444', INSPECTION: '#3b82f6' };
        return c[type] || '#8896AB';
    };

    const healthColor = stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#eab308' : '#ef4444';

    if (history.length === 0) {
        return (
            <div className="h-56 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <BarChart3 size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-semibold">Not enough data</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Add maintenance records to see analytics</p>
            </div>
        );
    }

    const totalCost = history.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);
    const avgCost = totalCost / history.length;
    const preventiveCount = history.filter((r: any) => r.maintenanceType === 'PREVENTIVE').length;
    const repairCount = history.filter((r: any) => r.maintenanceType === 'REPAIR').length;
    const inspectionCount = history.filter((r: any) => r.maintenanceType === 'INSPECTION').length;

    return (
        <div className="space-y-5">
            {/* Top stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl text-center">
                    <IndianRupee size={16} className="text-green-500 mx-auto mb-1.5" />
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(totalCost)}</p>
                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-0.5">Total Spent</p>
                </div>
                <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl text-center">
                    <IndianRupee size={16} className="text-blue-500 mx-auto mb-1.5" />
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(avgCost)}</p>
                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-0.5">Avg per Service</p>
                </div>
                <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl text-center">
                    <TrendingUp size={16} className="mx-auto mb-1.5" style={{ color: healthColor }} />
                    <p className="text-lg font-bold text-[var(--text-primary)]">{stats.health}%</p>
                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-0.5">Health Score</p>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Health Ring */}
                <div className="p-5 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4">Equipment Health</h3>
                    <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="52" fill="none" className="stroke-[var(--border-color)]" strokeWidth="8" />
                                <circle
                                    cx="64" cy="64" r="52" fill="none"
                                    stroke={healthColor}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${stats.health * 3.27} 327`}
                                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.health}</span>
                                <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Score</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution */}
                <div className="p-5 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4">Type Distribution</h3>
                    {chartData.length > 0 ? (
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={32}
                                        outerRadius={60}
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
                                            borderRadius: '10px',
                                            fontSize: '11px',
                                            color: 'var(--text-primary)',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                            padding: '8px 12px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-[var(--text-secondary)] text-xs">No data</div>
                    )}
                </div>
            </div>

            {/* Summary cards */}
            <div className="p-4 bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl">
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3">Breakdown by Type</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { type: 'PREVENTIVE' as MaintenanceType, count: preventiveCount, color: '#22c55e' },
                        { type: 'REPAIR' as MaintenanceType, count: repairCount, color: '#ef4444' },
                        { type: 'INSPECTION' as MaintenanceType, count: inspectionCount, color: '#3b82f6' }
                    ].map(({ type, count, color }) => (
                        <div key={type} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
                            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
                                <span className="text-sm font-bold" style={{ color }}>{count}</span>
                            </div>
                            <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wide font-bold">{type}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                                {history.length > 0 ? Math.round((count / history.length) * 100) : 0}% of total
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
