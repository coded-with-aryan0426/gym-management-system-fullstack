import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './MonthlyComparison.css';

interface MonthlyComparisonProps {
    chartData: { name: string; revenue: number; expenses: number }[];
    period: string;
}

const fmt = (v: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(v);

const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({ chartData, period }) => {
    // Compute best/worst days
    const sorted = [...chartData].filter(d => d.revenue > 0 || d.expenses > 0);
    const bestDay = sorted.sort((a, b) => (b.revenue - b.expenses) - (a.revenue - a.expenses))[0];
    const worstDay = sorted.sort((a, b) => (a.revenue - a.expenses) - (b.revenue - b.expenses))[0];

    const totalRev = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalExp = chartData.reduce((s, d) => s + d.expenses, 0);
    const avgDailyRev = sorted.length > 0 ? totalRev / sorted.length : 0;
    const avgDailyExp = sorted.length > 0 ? totalExp / sorted.length : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const rev = payload[0]?.value || 0;
        const exp = payload[1]?.value || 0;
        const profit = rev - exp;
        return (
            <div className="mc-tooltip">
                <div className="mc-tt-label">{label}</div>
                <div className="mc-tt-row"><span className="mc-tt-dot emerald"></span>Revenue: {fmt(rev)}</div>
                <div className="mc-tt-row"><span className="mc-tt-dot crimson"></span>Expenses: {fmt(exp)}</div>
                <div className="mc-tt-divider"></div>
                <div className={`mc-tt-profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                    {profit >= 0 ? 'Profit' : 'Loss'}: {fmt(Math.abs(profit))}
                </div>
            </div>
        );
    };

    const formatXLabel = (value: string) => {
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

    return (
        <div className="monthly-comparison">
            <div className="mc-header">
                <h3 className="mc-title">Daily Revenue vs Expenses</h3>
            </div>

            <div className="mc-chart-container">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 9 }}
                            tickFormatter={formatXLabel}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 9 }}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                            width={45}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#10B981" radius={[2, 2, 0, 0]} barSize={8} />
                        <Bar dataKey="expenses" fill="#EF4444" radius={[2, 2, 0, 0]} barSize={8} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mc-stats">
                <div className="mc-stat-item">
                    <span className="mc-stat-label">Avg Daily Revenue</span>
                    <span className="mc-stat-value income">{fmt(avgDailyRev)}</span>
                </div>
                <div className="mc-stat-item">
                    <span className="mc-stat-label">Avg Daily Expense</span>
                    <span className="mc-stat-value expense">{fmt(avgDailyExp)}</span>
                </div>
                {bestDay && (
                    <div className="mc-stat-item">
                        <span className="mc-stat-label">Best Day</span>
                        <span className="mc-stat-value small">{bestDay.name}</span>
                    </div>
                )}
                {worstDay && worstDay !== bestDay && (
                    <div className="mc-stat-item">
                        <span className="mc-stat-label">Worst Day</span>
                        <span className="mc-stat-value small">{worstDay.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyComparison;
