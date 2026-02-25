import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/formatters';
import './FinancialChart.css';

interface ChartDataPoint {
    name: string;
    revenue: number;
    expenses: number;
}

interface FinancialChartProps {
    data: ChartDataPoint[];
    period: 'day' | 'week' | 'month';
    onPeriodChange: (p: 'day' | 'week' | 'month') => void;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ data, period }) => {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    const fmtAxis = (v: number) => {
        if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
        if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
        return `₹${v}`;
    };

    const fmtLabel = (value: string) => {
        if (period === 'month') {
            const d = new Date(value);
            return isNaN(d.getTime()) ? value : d.getDate().toString();
        }
        if (period === 'week') {
            const d = new Date(value);
            return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US', { weekday: 'short' });
        }
        return value;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const rev = payload[0]?.value || 0;
        const exp = payload[1]?.value || 0;
        const net = rev - exp;
        return (
            <div className="chart-tooltip">
                <div className="tooltip-header">{fmtLabel(label)}</div>
                <div className="tooltip-row">
                    <span className="dot emerald" />
                    <span>Revenue</span>
                    <span className="tooltip-value">{formatCurrency(rev)}</span>
                </div>
                <div className="tooltip-row">
                    <span className="dot crimson" />
                    <span>Expenses</span>
                    <span className="tooltip-value">{formatCurrency(exp)}</span>
                </div>
                <div className="tooltip-divider" />
                <div className="tooltip-row profit">
                    <span>Net</span>
                    <span className={`tooltip-value ${net >= 0 ? 'emerald' : 'crimson'}`}>
                        {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net))}
                    </span>
                </div>
            </div>
        );
    };

    if (!data || data.length === 0) {
        return (
            <div className="financial-chart">
                <div className="chart-header">
                    <span className="chart-title">Revenue vs Expenses</span>
                </div>
                <div className="chart-empty">No data for this period</div>
            </div>
        );
    }

    return (
        <div className="financial-chart">
            <div className="chart-header">
                <div className="chart-title-group">
                    <span className="chart-title">Revenue vs Expenses</span>
                    <div className="chart-summary">
                        <span className="summary-item">
                            <span className="summary-dot emerald" />
                            {formatCurrency(totalRevenue)}
                        </span>
                        <span className="summary-item">
                            <span className="summary-dot crimson" />
                            {formatCurrency(totalExpenses)}
                        </span>
                        <span className={`summary-profit ${profitPercent < 0 ? 'loss' : ''}`}>
                            {profitPercent >= 0 ? '+' : ''}{profitPercent}% margin
                        </span>
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            dy={6}
                            tickFormatter={fmtLabel}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            tickFormatter={fmtAxis}
                            width={46}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
                        <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-insight">
                <span className={`insight-badge ${netProfit >= 0 ? 'good' : 'bad'}`}>
                    {netProfit >= 0 ? '↑' : '↓'}
                </span>
                <span className="insight-text">
                    Net profit&nbsp;
                    <strong className={netProfit >= 0 ? 'positive' : 'negative'}>
                        {netProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netProfit))}
                    </strong>
                    &nbsp;this {period}
                </span>
                <span className="insight-divider">·</span>
                <span className="insight-sub">{profitPercent}% margin</span>
            </div>
        </div>
    );
};

export default FinancialChart;
