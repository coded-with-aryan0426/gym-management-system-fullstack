import React from 'react';
import type { KPIStats } from '../../../types/finance';
import './KPIStrip.css';

interface KPIStripProps {
    stats: KPIStats;
}

const KPIStrip: React.FC<KPIStripProps> = ({ stats }) => {
    const fmt = (val: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);

    const hasOverdue = stats.pendingCount > 0;

    const kpis = [
        {
            id: 'revenue',
            label: 'Total Revenue',
            value: stats.totalRevenue,
            change: stats.revenueChange,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            ),
            color: 'emerald',
            trend: 'up'
        },
        {
            id: 'expenses',
            label: 'Expenses',
            value: stats.totalExpenses,
            change: stats.expensesChange,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
            ),
            color: 'crimson',
            trend: stats.expensesChange > 0 ? 'up' : 'down'
        },
        {
            id: 'profit',
            label: 'Net Profit',
            value: stats.netProfit,
            change: stats.profitMargin,
            suffix: '% margin',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                </svg>
            ),
            color: 'blue',
            trend: 'up'
        },
        {
            id: 'pending',
            label: 'Pending Dues',
            value: stats.pendingPayments,
            badge: hasOverdue ? `${stats.pendingCount} overdue` : null,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            ),
            color: hasOverdue ? 'amber' : 'zinc',
            pulse: hasOverdue
        }
    ];

    return (
        <div className="kpi-strip">
            {kpis.map(kpi => (
                <div 
                    key={kpi.id} 
                    className={`kpi-card kpi-card--${kpi.color} ${kpi.pulse ? 'kpi-card--pulse' : ''}`}
                >
                    <div className={`kpi-icon kpi-icon--${kpi.color}`}>
                        {kpi.icon}
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">{kpi.label}</span>
                        <div className="kpi-value-row">
                            <span className="kpi-value">{fmt(kpi.value)}</span>
                            {kpi.change !== undefined && !kpi.badge && (
                                <span className={`kpi-change ${kpi.trend === 'up' && kpi.id !== 'expenses' ? 'positive' : kpi.trend === 'down' && kpi.id === 'expenses' ? 'positive' : 'negative'}`}>
                                    {kpi.trend === 'up' ? '↑' : '↓'} {Math.abs(kpi.change)}{kpi.suffix || '%'}
                                </span>
                            )}
                            {kpi.badge && (
                                <span className="kpi-badge">{kpi.badge}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIStrip;
