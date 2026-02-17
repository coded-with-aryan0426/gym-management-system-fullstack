import React from 'react';
import './CategoryStats.css';

interface CategoryStat {
    category: string;
    count: number;
    total: number;
}

interface CategoryStatsProps {
    incomeStats: CategoryStat[];
    expenseStats: CategoryStat[];
    totalRevenue: number;
    totalExpenses: number;
}

const fmt = (v: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(v);

const INCOME_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];
const EXPENSE_COLORS = ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'];

const CategoryStats: React.FC<CategoryStatsProps> = ({ incomeStats, expenseStats, totalRevenue, totalExpenses }) => {
    const renderSection = (
        title: string,
        stats: CategoryStat[],
        total: number,
        colors: string[],
        type: 'income' | 'expense'
    ) => {
        const totalTxCount = stats.reduce((s, c) => s + c.count, 0);

        return (
            <div className={`cs-section cs-section--${type}`}>
                <div className="cs-section-header">
                    <span className="cs-section-title">{title}</span>
                    <div className="cs-section-summary">
                        <span className="cs-section-count">{totalTxCount} txns</span>
                        <span className={`cs-section-total cs-section-total--${type}`}>{fmt(total)}</span>
                    </div>
                </div>

                {/* Stacked bar */}
                <div className="cs-stacked-bar">
                    {stats.map((s, i) => {
                        const pct = total > 0 ? (s.total / total) * 100 : 0;
                        return (
                            <div
                                key={s.category}
                                className="cs-bar-segment"
                                style={{ width: `${Math.max(pct, 2)}%`, background: colors[i % colors.length] }}
                                title={`${s.category}: ${fmt(s.total)} (${pct.toFixed(1)}%)`}
                            />
                        );
                    })}
                </div>

                <div className="cs-items">
                    {stats.map((s, i) => {
                        const pct = total > 0 ? ((s.total / total) * 100).toFixed(1) : '0';
                        return (
                            <div key={s.category} className="cs-item">
                                <div className="cs-item-left">
                                    <span className="cs-item-dot" style={{ background: colors[i % colors.length] }}></span>
                                    <span className="cs-item-name">{s.category}</span>
                                </div>
                                <div className="cs-item-right">
                                    <span className="cs-item-count">{s.count}x</span>
                                    <span className="cs-item-amount">{fmt(s.total)}</span>
                                    <span className="cs-item-pct">{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="category-stats">
            <div className="cs-header">
                <h3 className="cs-title">Category Breakdown</h3>
                <span className="cs-subtitle">Transaction distribution by category</span>
            </div>
            <div className="cs-body">
                {renderSection('Income Sources', incomeStats, totalRevenue, INCOME_COLORS, 'income')}
                <div className="cs-divider"></div>
                {renderSection('Expense Categories', expenseStats, totalExpenses, EXPENSE_COLORS, 'expense')}
            </div>
        </div>
    );
};

export default CategoryStats;
