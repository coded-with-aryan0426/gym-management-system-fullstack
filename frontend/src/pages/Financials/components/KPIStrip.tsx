import React from 'react';
import { Card } from '../../../components/ui';
import type { KPIStats } from '../../../types/finance';
import './KPIStrip.css';

interface KPIStripProps {
    stats: KPIStats;
}

const KPIStrip: React.FC<KPIStripProps> = ({ stats }) => {
    // Helper to format currency
    const fmt = (val: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);

    const hasOverdue = stats.pendingCount > 0;

    return (
        <div className="kpi-strip-grid">
            {/* ═══════════════════════════════════════════════════════════
                TIER 1: URGENT / OPERATIONAL (Left, Larger)
                ═══════════════════════════════════════════════════════════ */}

            {/* 1. Cash Balance (Hero - Liquidity) */}
            <Card className="kpi-card kpi-card--tier1 kpi-card--hero">
                <div className="kpi-icon-wrapper icon-emerald">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                </div>
                <div className="kpi-content">
                    <span className="kpi-micro-label">Liquidity</span>
                    <span className="kpi-label">Cash Balance</span>
                    <div className="kpi-value-row">
                        <span className="kpi-value kpi-value--tier1">{fmt(stats.cashInHand)}</span>
                    </div>
                </div>
            </Card>

            {/* 2. Pending Dues (Alert - Outstanding Risk) */}
            <Card className={`kpi-card kpi-card--tier1 kpi-card--alert ${hasOverdue ? 'kpi-card--pulse' : ''}`}>
                <div className="kpi-icon-wrapper icon-amber">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <div className="kpi-content">
                    <span className="kpi-micro-label kpi-micro-label--warning">Outstanding Risk</span>
                    <span className="kpi-label">Pending Dues</span>
                    <div className="kpi-value-row">
                        <span className="kpi-value kpi-value--tier1">{fmt(stats.pendingPayments)}</span>
                        {hasOverdue && (
                            <span className="kpi-detail kpi-detail--alert">⚠️ {stats.pendingCount} overdue</span>
                        )}
                    </div>
                </div>
            </Card>

            {/* ═══════════════════════════════════════════════════════════
                TIER 2: ANALYTICAL (Right, Smaller)
                ═══════════════════════════════════════════════════════════ */}

            {/* 3. Net Profit (MTD) */}
            <Card className="kpi-card kpi-card--tier2">
                <div className="kpi-icon-wrapper icon-blue icon-small">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </div>
                <div className="kpi-content">
                    <span className="kpi-micro-label">Monthly</span>
                    <span className="kpi-label kpi-label--tier2">Net Profit</span>
                    <div className="kpi-value-row">
                        <span className="kpi-value kpi-value--tier2">{fmt(stats.netProfit)}</span>
                        <span className="kpi-trend text-emerald">+{stats.profitMargin}% margin</span>
                    </div>
                </div>
            </Card>

            {/* 4. Burn Rate */}
            <Card className="kpi-card kpi-card--tier2">
                <div className="kpi-icon-wrapper icon-crimson icon-small">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>
                <div className="kpi-content">
                    <span className="kpi-micro-label">Run Rate</span>
                    <span className="kpi-label kpi-label--tier2">Burn Rate</span>
                    <div className="kpi-value-row">
                        <span className="kpi-value kpi-value--tier2">{fmt(stats.totalExpenses)}</span>
                        <span className={`kpi-trend ${stats.expensesChange > 0 ? 'text-crimson' : 'text-emerald'}`}>
                            {stats.expensesChange > 0 ? '+' : ''}{stats.expensesChange}%
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default KPIStrip;
