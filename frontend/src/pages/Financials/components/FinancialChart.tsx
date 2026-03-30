import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/formatters';
import './FinancialChart.css';

interface ChartDataPoint {
    name: string;
    revenue: number;
    expenses: number;
    profit: number;
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
    
    // Calculate average daily/weekly values
    const avgRevenue = data.length > 0 ? Math.round(totalRevenue / data.length) : 0;
    const avgExpenses = data.length > 0 ? Math.round(totalExpenses / data.length) : 0;
    const expenseRatio = totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;

    const fmtAxis = (v: number) => {
        if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
        if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
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
        const profit = rev - exp;
        const marginPercent = rev > 0 ? Math.round((profit / rev) * 100) : 0;
        
        return (
            <div className="chart-tooltip chart-tooltip--enhanced">
                <div className="tooltip-header">{fmtLabel(label)}</div>
                
                <div className="tooltip-section">
                    <div className="tooltip-row">
                        <span className="dot emerald" />
                        <span className="label">Revenue</span>
                        <span className="tooltip-value emerald-text">{formatCurrency(rev)}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="dot crimson" />
                        <span className="label">Expenses</span>
                        <span className="tooltip-value crimson-text">{formatCurrency(exp)}</span>
                    </div>
                    
                    <div className="tooltip-divider" />
                    
                    <div className="tooltip-row profit-highlight">
                        <span className="dot teal" />
                        <span className="label">Net Profit</span>
                        <span className={`tooltip-value ${profit >= 0 ? 'positive-text' : 'negative-text'}`}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                        </span>
                    </div>
                    <div className="tooltip-meta">
                        Margin: <strong>{marginPercent}%</strong>
                    </div>
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
        <div className="financial-chart financial-chart--enhanced">
            <div className="chart-header chart-header--improved">
                <div className="chart-title-group">
                    <h3 className="chart-title">Revenue vs Expenses Analysis</h3>
                    <p className="chart-subtitle">Track income and spending trends</p>
                </div>
                
                {/* Enhanced Summary Cards */}
                <div className="chart-summary chart-summary--enhanced">
                    <div className="summary-card summary-card--revenue">
                        <div className="card-header">
                            <span className="summary-dot emerald" />
                            <span className="card-label">Revenue</span>
                        </div>
                        <div className="card-value emerald-text">{formatCurrency(totalRevenue)}</div>
                        <div className="card-meta">Avg: {formatCurrency(avgRevenue)}/{period.slice(0, 1)}</div>
                    </div>
                    
                    <div className="summary-card summary-card--expenses">
                        <div className="card-header">
                            <span className="summary-dot crimson" />
                            <span className="card-label">Expenses</span>
                        </div>
                        <div className="card-value crimson-text">{formatCurrency(totalExpenses)}</div>
                        <div className="card-meta">{expenseRatio}% of revenue</div>
                    </div>
                    
                    <div className={`summary-card summary-card--profit ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                        <div className="card-header">
                            <span className="summary-dot teal" />
                            <span className="card-label">Net Profit</span>
                        </div>
                        <div className={`card-value ${netProfit >= 0 ? 'positive-text' : 'negative-text'}`}>
                            {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
                        </div>
                        <div className="card-meta margin-text">{profitPercent}% margin</div>
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
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
                            interval="preserveStartEnd"
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            tickFormatter={fmtAxis}
                            width={50}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 6, fill: '#10B981' }} />
                        <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 6, fill: '#EF4444' }} />
                        <Area type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2} fill="url(#profitGrad)" dot={false} activeDot={{ r: 5, fill: '#14B8A6' }} strokeDasharray="4 2" />
                        <Legend
                            verticalAlign="top"
                            height={32}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, color: '#71717a', paddingBottom: 8 }}
                            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-footer chart-footer--enhanced">
                <div className="insight-left">
                    <div className={`insight-badge ${netProfit >= 0 ? 'good' : 'bad'}`}>
                        {netProfit >= 0 ? '📈' : '📉'}
                    </div>
                    <div className="insight-text-group">
                        <span className="insight-primary">
                            Net profit&nbsp;
                            <strong className={netProfit >= 0 ? 'positive-text' : 'negative-text'}>
                                {netProfit >= 0 ? '+' : ''}{formatCurrency(Math.abs(netProfit))}
                            </strong>
                        </span>
                        <span className="insight-secondary">
                            {profitPercent}% profit margin this {period}
                        </span>
                    </div>
                </div>
                
                <div className="insight-meta">
                    <span className="meta-item">
                        <span className="meta-label">Expense Ratio:</span>
                        <span className="meta-value">{expenseRatio}%</span>
                    </span>
                    <span className="meta-separator">•</span>
                    <span className="meta-item">
                        <span className="meta-label">Health:</span>
                        <span className={`meta-value ${netProfit >= 0 && profitPercent > 20 ? 'healthy' : profitPercent > 10 ? 'moderate' : 'concerning'}`}>
                            {netProfit >= 0 && profitPercent > 20 ? '✓ Healthy' : profitPercent > 10 ? '⚠ Monitor' : '⚠ Concerning'}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FinancialChart;
