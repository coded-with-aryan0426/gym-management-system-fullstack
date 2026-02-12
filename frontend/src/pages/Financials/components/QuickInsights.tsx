import React from 'react';
import type { KPIStats, Transaction } from '../../../types/finance';
import './QuickInsights.css';

interface QuickInsightsProps {
    stats: KPIStats;
    transactions: Transaction[];
    chartData: { name: string; revenue: number; expenses: number }[];
}

const fmt = (v: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(v);

const QuickInsights: React.FC<QuickInsightsProps> = ({ stats, transactions, chartData }) => {
    const insights: { icon: string; text: string; type: 'good' | 'warning' | 'bad' | 'info'; detail?: string }[] = [];

    // Profitability insight
    if (stats.profitMargin > 20) {
        insights.push({
            icon: 'chart-up',
            text: `Strong profit margin at ${stats.profitMargin}%`,
            type: 'good',
            detail: `You're keeping ${fmt(stats.netProfit)} after all expenses`
        });
    } else if (stats.profitMargin > 0) {
        insights.push({
            icon: 'chart-flat',
            text: `Profit margin is ${stats.profitMargin}% - room to improve`,
            type: 'warning',
            detail: `Net profit: ${fmt(stats.netProfit)}`
        });
    } else {
        insights.push({
            icon: 'chart-down',
            text: `Operating at a ${Math.abs(stats.profitMargin)}% loss`,
            type: 'bad',
            detail: `Expenses exceed revenue by ${fmt(Math.abs(stats.netProfit))}`
        });
    }

    // Revenue growth
    if (stats.revenueChange > 10) {
        insights.push({
            icon: 'trending-up',
            text: `Revenue growing ${stats.revenueChange}% vs last period`,
            type: 'good',
            detail: `Total: ${fmt(stats.totalRevenue)}`
        });
    } else if (stats.revenueChange < -5) {
        insights.push({
            icon: 'trending-down',
            text: `Revenue dropped ${Math.abs(stats.revenueChange)}% vs last period`,
            type: 'bad',
            detail: 'Consider running promotions or member outreach'
        });
    }

    // Pending payments
    if (stats.pendingPayments > 0) {
        const pendingPct = stats.totalRevenue > 0 ? Math.round((stats.pendingPayments / stats.totalRevenue) * 100) : 0;
        if (pendingPct > 20) {
            insights.push({
                icon: 'alert',
                text: `${fmt(stats.pendingPayments)} pending (${pendingPct}% of revenue)`,
                type: 'bad',
                detail: `${stats.pendingCount} invoices need follow-up`
            });
        } else {
            insights.push({
                icon: 'clock',
                text: `${fmt(stats.pendingPayments)} in pending collections`,
                type: 'warning',
                detail: `${stats.pendingCount} invoices awaiting payment`
            });
        }
    } else {
        insights.push({
            icon: 'check',
            text: 'All payments collected - no pending dues',
            type: 'good'
        });
    }

    // Best performing day
    if (chartData.length > 0) {
        const bestDay = [...chartData].sort((a, b) => (b.revenue - b.expenses) - (a.revenue - a.expenses))[0];
        if (bestDay && bestDay.revenue > 0) {
            const profit = bestDay.revenue - bestDay.expenses;
            insights.push({
                icon: 'star',
                text: `Best day: ${new Date(bestDay.name).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`,
                type: 'info',
                detail: `${fmt(bestDay.revenue)} revenue, ${fmt(profit)} profit`
            });
        }
    }

    // Expense control
    const expenseRatio = stats.totalRevenue > 0 ? (stats.totalExpenses / stats.totalRevenue) * 100 : 0;
    if (expenseRatio > 80) {
        insights.push({
            icon: 'alert',
            text: `Expenses are ${expenseRatio.toFixed(0)}% of revenue`,
            type: 'bad',
            detail: 'High expense ratio - review spending'
        });
    } else if (expenseRatio < 50 && stats.totalRevenue > 0) {
        insights.push({
            icon: 'check',
            text: `Expenses controlled at ${expenseRatio.toFixed(0)}% of revenue`,
            type: 'good',
            detail: 'Healthy expense-to-revenue ratio'
        });
    }

    // Top income category
    const incomeByCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'INCOME').forEach(t => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });
    const topCat = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
        const pct = stats.totalRevenue > 0 ? Math.round((topCat[1] / stats.totalRevenue) * 100) : 0;
        insights.push({
            icon: 'target',
            text: `${topCat[0]} is your top earner (${pct}%)`,
            type: 'info',
            detail: `Contributing ${fmt(topCat[1])} this period`
        });
    }

    const getIcon = (icon: string) => {
        switch (icon) {
            case 'chart-up': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>);
            case 'chart-down': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
                </svg>);
            case 'chart-flat': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>);
            case 'trending-up': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>);
            case 'trending-down': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
                </svg>);
            case 'alert': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>);
            case 'clock': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>);
            case 'check': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>);
            case 'star': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>);
            case 'target': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>);
            default: return null;
        }
    };

    return (
        <div className="quick-insights">
            <div className="qi-header">
                <h3 className="qi-title">Financial Story</h3>
                <span className="qi-subtitle">Key insights from your data</span>
            </div>
            <div className="qi-list">
                {insights.map((ins, i) => (
                    <div key={i} className={`qi-item qi-item--${ins.type}`}>
                        <div className={`qi-icon qi-icon--${ins.type}`}>
                            {getIcon(ins.icon)}
                        </div>
                        <div className="qi-content">
                            <span className="qi-text">{ins.text}</span>
                            {ins.detail && <span className="qi-detail">{ins.detail}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickInsights;
