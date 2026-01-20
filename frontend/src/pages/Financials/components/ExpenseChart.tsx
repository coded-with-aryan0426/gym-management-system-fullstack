import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ExpenseBreakdown } from '../../../types/finance';
import './ExpenseChart.css';

interface ExpenseChartProps {
    data?: ExpenseBreakdown[]; // Now accepts real data
    onFilter?: (category: string) => void;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data = [], onFilter }) => {
    // Fallback if empty
    if (!data || data.length === 0) {
        return (
            <div className="expense-chart empty-state">
                <div className="chart-area empty">
                    <span>No expenses record</span>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const topExpense = data.reduce((prev, current) => (prev.value > current.value) ? prev : current, data[0]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const item = payload[0].payload;
        return (
            <div className="expense-tooltip">
                <span className="tooltip-name">{item.label}</span>
                <span className="tooltip-value">₹{item.value.toLocaleString('en-IN')}</span>
                <span className="tooltip-percent">{item.percentage}% of total</span>
            </div>
        );
    }

    return (
        <div className="expense-chart">
            <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="label"
                            type="category"
                            width={100}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            barSize={16}
                            style={{ cursor: 'pointer' }}
                            onClick={(data: any) => onFilter?.(data?.label)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || '#EF4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="expense-summary">
                <div className="summary-row">
                    <span className="summary-label">Total Expenses</span>
                    <span className="summary-value">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {topExpense && topExpense.value > 0 && (
                    <div className="summary-insight">
                        <span className="insight-indicator warning">!</span>
                        <span className="insight-text">
                            <strong>{topExpense.label}</strong> is {topExpense.percentage}% of costs
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseChart;
