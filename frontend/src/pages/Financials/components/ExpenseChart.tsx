import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ExpenseChart.css';

const mockData = [
    { name: 'Salaries', value: 65000, percent: 48, color: '#F59E0B' },
    { name: 'Rent', value: 35000, percent: 26, color: '#EF4444' },
    { name: 'Utilities', value: 15000, percent: 11, color: '#3B82F6' },
    { name: 'Equipment', value: 12000, percent: 9, color: '#10B981' },
    { name: 'Other', value: 8000, percent: 6, color: '#8B5CF6' },
];

interface ExpenseChartProps {
    onFilter?: (category: string) => void;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ onFilter }) => {
    const total = mockData.reduce((sum, d) => sum + d.value, 0);
    const topExpense = mockData[0];

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const data = payload[0].payload;
        return (
            <div className="expense-tooltip">
                <span className="tooltip-name">{data.name}</span>
                <span className="tooltip-value">₹{data.value.toLocaleString('en-IN')}</span>
                <span className="tooltip-percent">{data.percent}% of total</span>
            </div>
        );
    };

    return (
        <div className="expense-chart">
            <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={mockData}
                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={65}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            barSize={14}
                            style={{ cursor: 'pointer' }}
                            onClick={(data) => onFilter?.('Other')}
                        >
                            {mockData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
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
                <div className="summary-insight">
                    <span className="insight-indicator warning">!</span>
                    <span className="insight-text">
                        <strong>{topExpense.name}</strong> is {topExpense.percent}% of costs
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseChart;
