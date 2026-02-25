import React from 'react';
import type { KPIStats } from '../../../types/finance';
import './KPIStrip.css';

interface KPIStripProps { stats: KPIStats; }

const fmt = (v: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(v);

const KPIStrip: React.FC<KPIStripProps> = ({ stats }) => {
    const hasOverdue = stats.pendingCount > 0;

    const kpis = [
        {
            id: 'revenue',
            label: 'Total Revenue',
            value: fmt(stats.totalRevenue),
            change: `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% vs last`,
            positive: stats.revenueChange >= 0,
            color: 'emerald',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            ),
        },
        {
            id: 'expenses',
            label: 'Total Expenses',
            value: fmt(stats.totalExpenses),
            change: `${stats.expensesChange > 0 ? '+' : ''}${stats.expensesChange}% vs last`,
            positive: stats.expensesChange <= 0,
            color: 'crimson',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
            ),
        },
        {
            id: 'profit',
            label: 'Net Profit',
            value: fmt(stats.netProfit),
            change: `${stats.profitMargin}% margin`,
            positive: stats.netProfit >= 0,
            color: stats.netProfit >= 0 ? 'blue' : 'crimson',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                </svg>
            ),
        },
        {
            id: 'pending',
            label: 'Pending Dues',
            value: fmt(stats.pendingPayments),
            change: hasOverdue ? `${stats.pendingCount} awaiting` : 'All collected',
            positive: !hasOverdue,
            color: hasOverdue ? 'amber' : 'zinc',
            pulse: hasOverdue,
            badge: hasOverdue ? `${stats.pendingCount}` : null,
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            ),
        },
    ];

    return (
        <div className="kpi-strip">
            {kpis.map(k => (
                <div key={k.id} className={`kpi-card kpi-card--${k.color}${k.pulse ? ' kpi-card--pulse' : ''}`}>
                    <div className={`kpi-icon kpi-icon--${k.color}`}>{k.icon}</div>
                    <div className="kpi-data">
                        <span className="kpi-label">{k.label}</span>
                        <div className="kpi-value-row">
                            <span className="kpi-value">{k.value}</span>
                            {k.badge && <span className="kpi-badge">{k.badge}</span>}
                        </div>
                        <span className={`kpi-change ${k.positive ? 'positive' : 'negative'}`}>
                            {k.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIStrip;
