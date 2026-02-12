import React from 'react';
import './ProfitLossCard.css';

interface PLItem {
    label: string;
    value: number;
    percentage: number;
}

interface ProfitLossCardProps {
    revenue: PLItem[];
    expenses: PLItem[];
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
}

const fmt = (v: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(v);

const ProfitLossCard: React.FC<ProfitLossCardProps> = ({
    revenue, expenses, totalRevenue, totalExpenses, netProfit, profitMargin
}) => {
    return (
        <div className="pl-card">
            <div className="pl-header">
                <h3 className="pl-title">Profit & Loss Statement</h3>
                <span className={`pl-badge ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                    {netProfit >= 0 ? 'Profitable' : 'Loss'}
                </span>
            </div>

            <div className="pl-body">
                {/* Revenue Section */}
                <div className="pl-section">
                    <div className="pl-section-header">
                        <span className="pl-section-label">Revenue</span>
                        <span className="pl-section-total income">{fmt(totalRevenue)}</span>
                    </div>
                    <div className="pl-items">
                        {revenue.map((item, i) => (
                            <div key={i} className="pl-item">
                                <span className="pl-item-name">{item.label}</span>
                                <div className="pl-item-bar-container">
                                    <div className="pl-item-bar income" style={{ width: `${item.percentage}%` }}></div>
                                </div>
                                <span className="pl-item-value">{fmt(item.value)}</span>
                                <span className="pl-item-pct">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="pl-divider">
                    <span className="pl-divider-label">minus</span>
                </div>

                {/* Expenses Section */}
                <div className="pl-section">
                    <div className="pl-section-header">
                        <span className="pl-section-label">Expenses</span>
                        <span className="pl-section-total expense">{fmt(totalExpenses)}</span>
                    </div>
                    <div className="pl-items">
                        {expenses.map((item, i) => (
                            <div key={i} className="pl-item">
                                <span className="pl-item-name">{item.label}</span>
                                <div className="pl-item-bar-container">
                                    <div className="pl-item-bar expense" style={{ width: `${item.percentage}%` }}></div>
                                </div>
                                <span className="pl-item-value">{fmt(item.value)}</span>
                                <span className="pl-item-pct">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="pl-divider">
                    <span className="pl-divider-label">equals</span>
                </div>

                {/* Net Profit */}
                <div className={`pl-net ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                    <div className="pl-net-row">
                        <span className="pl-net-label">Net Profit</span>
                        <span className="pl-net-value">{fmt(netProfit)}</span>
                    </div>
                    <div className="pl-net-bar-container">
                        <div
                            className={`pl-net-bar ${netProfit >= 0 ? 'positive' : 'negative'}`}
                            style={{ width: `${Math.min(Math.abs(profitMargin), 100)}%` }}
                        ></div>
                    </div>
                    <span className="pl-net-margin">{profitMargin}% profit margin</span>
                </div>
            </div>
        </div>
    );
};

export default ProfitLossCard;
