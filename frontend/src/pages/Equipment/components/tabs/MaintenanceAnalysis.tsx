import React from 'react';
import { BarChart3, TrendingUp, IndianRupee, Shield, Wrench, ClipboardCheck, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../../utils/formatters';
import type { MaintenanceType } from '../../../../types/equipmentMaintenance';

interface MaintenanceAnalysisProps {
    stats: { health: number; totalCost?: number };
    history: any[];
    chartData: { name: string; value: number }[];
}

export const MaintenanceAnalysis: React.FC<MaintenanceAnalysisProps> = ({ stats, history, chartData }) => {
    const typeConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
        PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.18)', icon: <Shield size={16} />, label: 'Preventive' },
        REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.18)', icon: <Wrench size={16} />, label: 'Repair' },
        INSPECTION: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.08)', border: 'rgba(100, 116, 139, 0.18)', icon: <ClipboardCheck size={16} />, label: 'Inspection' }
    };

    const healthColor = stats.health > 70 ? '#22c55e' : stats.health > 40 ? '#f59e0b' : '#ef4444';

    if (history.length === 0) {
        return (
            <div className="empty-state" style={{ minHeight: '240px' }}>
                <div className="empty-state__icon"><BarChart3 size={22} /></div>
                <p className="empty-state__title">Not enough data</p>
                <p className="empty-state__desc">Add maintenance records to see analytics and cost insights</p>
            </div>
        );
    }

    const totalCost = history.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);
    const avgCost = totalCost / history.length;
    const preventiveCount = history.filter((r: any) => r.maintenanceType === 'PREVENTIVE').length;
    const repairCount = history.filter((r: any) => r.maintenanceType === 'REPAIR').length;
    const inspectionCount = history.filter((r: any) => r.maintenanceType === 'INSPECTION').length;

    const kpis = [
        { label: 'Total Spent', value: formatCurrency(totalCost), icon: IndianRupee, color: '#22c55e' },
        { label: 'Avg / Service', value: formatCurrency(avgCost), icon: IndianRupee, color: '#64748b' },
        { label: 'Health Score', value: `${stats.health}%`, icon: Activity, color: healthColor },
    ];

    const breakdownItems = [
        { type: 'PREVENTIVE' as MaintenanceType, count: preventiveCount },
        { type: 'REPAIR' as MaintenanceType, count: repairCount },
        { type: 'INSPECTION' as MaintenanceType, count: inspectionCount }
    ];

    return (
        <div className="maint-analytics">
            {/* KPI Row */}
            <div className="maint-analytics__kpis">
                {kpis.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="maint-analytics__kpi">
                        <div className="maint-analytics__kpi-icon" style={{ color, backgroundColor: `${color}10`, borderColor: `${color}20` }}>
                            <Icon size={16} />
                        </div>
                        <div className="maint-analytics__kpi-info">
                            <span className="maint-analytics__kpi-val">{value}</span>
                            <span className="maint-analytics__kpi-label">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="maint-analytics__charts">
                {/* Health Ring */}
                <div className="maint-analytics__chart-card">
                    <h3 className="maint-analytics__chart-title">
                        <TrendingUp size={14} /> Equipment Health
                    </h3>
                    <div className="maint-analytics__health-ring-wrap">
                        <svg viewBox="0 0 120 120" className="maint-analytics__health-svg">
                            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--glass-border)" strokeWidth="7" />
                            <circle
                                cx="60" cy="60" r="48" fill="none"
                                stroke={healthColor}
                                strokeWidth="7" strokeLinecap="round"
                                strokeDasharray={`${stats.health * 3.015} 301.5`}
                                style={{ transition: 'stroke-dasharray 0.8s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div className="maint-analytics__health-center">
                            <span className="maint-analytics__health-num" style={{ color: healthColor }}>{stats.health}</span>
                            <span className="maint-analytics__health-unit">/ 100</span>
                        </div>
                    </div>
                    <p className="maint-analytics__health-desc">
                        {stats.health > 80 ? 'Excellent condition' : stats.health > 50 ? 'Within acceptable range' : 'Needs immediate attention'}
                    </p>
                </div>

                {/* Pie Chart */}
                <div className="maint-analytics__chart-card">
                    <h3 className="maint-analytics__chart-title">
                        <BarChart3 size={14} /> Type Distribution
                    </h3>
                    {chartData.length > 0 ? (
                        <div className="maint-analytics__pie-wrap">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={36}
                                        outerRadius={64}
                                        dataKey="value"
                                        paddingAngle={4}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, i) => (
                                            <Cell key={i} fill={typeConfig[entry.name]?.color || '#8896AB'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-surface)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '10px',
                                            fontSize: '11px',
                                            color: 'var(--text-primary)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                            padding: '8px 14px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <div className="maint-analytics__legend">
                                {chartData.map(entry => {
                                    const cfg = typeConfig[entry.name];
                                    return cfg ? (
                                        <div key={entry.name} className="maint-analytics__legend-item">
                                            <span className="maint-analytics__legend-dot" style={{ backgroundColor: cfg.color }} />
                                            <span className="maint-analytics__legend-label">{cfg.label}</span>
                                            <span className="maint-analytics__legend-val">{entry.value}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="maint-analytics__no-data">No data available</div>
                    )}
                </div>
            </div>

            {/* Breakdown Grid */}
            <div className="maint-analytics__breakdown">
                <h3 className="eq-section-title">Breakdown by Type</h3>
                <div className="maint-analytics__breakdown-grid">
                    {breakdownItems.map(({ type, count }) => {
                        const cfg = typeConfig[type];
                        const pct = history.length > 0 ? Math.round((count / history.length) * 100) : 0;
                        const cost = history.filter((r: any) => r.maintenanceType === type).reduce((s: number, r: any) => s + (r.cost || 0), 0);
                        return (
                            <div key={type} className="maint-breakdown-card" style={{ '--bd-color': cfg.color } as React.CSSProperties}>
                                <div className="maint-breakdown-card__header">
                                    <div className="maint-breakdown-card__icon" style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}>
                                        {cfg.icon}
                                    </div>
                                    <span className="maint-breakdown-card__label">{cfg.label}</span>
                                </div>
                                <div className="maint-breakdown-card__stats">
                                    <div className="maint-breakdown-card__stat">
                                        <span className="maint-breakdown-card__stat-val">{count}</span>
                                        <span className="maint-breakdown-card__stat-label">Records</span>
                                    </div>
                                    <div className="maint-breakdown-card__stat">
                                        <span className="maint-breakdown-card__stat-val">{pct}%</span>
                                        <span className="maint-breakdown-card__stat-label">Share</span>
                                    </div>
                                    <div className="maint-breakdown-card__stat">
                                        <span className="maint-breakdown-card__stat-val">{formatCurrency(cost)}</span>
                                        <span className="maint-breakdown-card__stat-label">Cost</span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="maint-breakdown-card__bar">
                                    <div className="maint-breakdown-card__bar-fill" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
