import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ExpenseChart.css';

const data = [
    { name: 'Salaries', value: 65000, color: '#F59E0B', percentOfRevenue: 34 },
    { name: 'Rent', value: 45000, color: '#EF4444', percentOfRevenue: 23 },
    { name: 'Utilities', value: 12000, color: '#3B82F6', percentOfRevenue: 6 },
    { name: 'Equipment', value: 8500, color: '#10B981', percentOfRevenue: 4 },
    { name: 'Maintenance', value: 5000, color: '#8B5CF6', percentOfRevenue: 3 },
];

const totalExpensePercent = data.reduce((sum, d) => sum + d.percentOfRevenue, 0);
const isHealthy = totalExpensePercent <= 70; // Healthy if expenses <= 70% of revenue

// Find highest expense category
const topExpense = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);

interface ExpenseChartProps {
    onFilter?: (category: string) => void;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ onFilter }) => {
    return (
        <div className="expense-chart-container">
            <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                        onClick={() => onFilter?.('Other')}
                        style={{ cursor: 'pointer' }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={70}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Cost']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.percentOfRevenue > 30 ? '#EF4444' : entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Expense Threshold Evaluation */}
            <div className={`expense-evaluation ${isHealthy ? 'expense-evaluation--healthy' : 'expense-evaluation--critical'}`}>
                <span className="expense-indicator">{isHealthy ? '✓' : '⚠'}</span>
                <span className="expense-text">
                    Total: <strong>{totalExpensePercent}%</strong> of revenue
                    <span className="expense-status">{isHealthy ? '(Within budget)' : '(Over threshold)'}</span>
                </span>
                <span className="expense-top">
                    Top: {topExpense.name} ({topExpense.percentOfRevenue}%)
                </span>
            </div>
        </div>
    );
};

export default ExpenseChart;
