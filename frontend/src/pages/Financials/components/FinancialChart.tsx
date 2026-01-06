import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

const FinancialChart: React.FC<FinancialChartProps> = ({ data, period, onPeriodChange }) => {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="chart-tooltip">
                <div className="tooltip-header">{label}</div>
                <div className="tooltip-row">
                    <span className="dot emerald"></span>
                    <span>Revenue</span>
                    <span className="tooltip-value">₹{payload[0]?.value?.toLocaleString('en-IN')}</span>
                </div>
                <div className="tooltip-row">
                    <span className="dot crimson"></span>
                    <span>Expenses</span>
                    <span className="tooltip-value">₹{payload[1]?.value?.toLocaleString('en-IN')}</span>
                </div>
                <div className="tooltip-divider"></div>
                <div className="tooltip-row profit">
                    <span>Net Profit</span>
                    <span className="tooltip-value emerald">
                        ₹{((payload[0]?.value || 0) - (payload[1]?.value || 0)).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="financial-chart">
            <div className="chart-header">
                <div className="chart-title-group">
                    <h3 className="chart-title">Revenue vs Expenses</h3>
                    <div className="chart-summary">
                        <span className="summary-item">
                            <span className="summary-dot emerald"></span>
                            ₹{totalRevenue.toLocaleString('en-IN')}
                        </span>
                        <span className="summary-item">
                            <span className="summary-dot crimson"></span>
                            ₹{totalExpenses.toLocaleString('en-IN')}
                        </span>
                        <span className="summary-profit">
                            {profitPercent >= 0 ? '+' : ''}{profitPercent}% margin
                        </span>
                    </div>
                </div>
                <div className="period-toggle">
                    {(['day', 'week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            className={`period-btn ${period === p ? 'active' : ''}`}
                            onClick={() => onPeriodChange(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(255,255,255,0.05)" 
                            vertical={false}
                        />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            dy={8}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#revenueGrad)"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#EF4444"
                            strokeWidth={2}
                            fill="url(#expenseGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-insight">
                <span className="insight-icon">✓</span>
                <span className="insight-text">
                    Profit trend <strong className="positive">+{profitPercent}%</strong> this {period}
                </span>
                <span className="insight-divider">|</span>
                <span className="insight-action">Top driver: Memberships</span>
            </div>
        </div>
    );
};

export default FinancialChart;
