import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { Transaction } from '../../../types/finance';
import { formatCurrency } from '../../../utils/formatters';
import './CashFlowWaterfall.css';

interface CashFlowWaterfallProps {
    transactions: Transaction[];
    totalRevenue: number;
    totalExpenses: number;
}

const CashFlowWaterfall: React.FC<CashFlowWaterfallProps> = ({ transactions, totalRevenue, totalExpenses }) => {
    const normalizeKey = (s: string | undefined) => s?.trim().toLowerCase().replace(/\s+/g, ' ') || 'uncategorized';

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    transactions.forEach(t => {
        const cat = t.category || 'uncategorized';
        if (t.type === 'INCOME') {
            const key = normalizeKey(cat);
            incomeByCategory[key] = (incomeByCategory[key] || 0) + t.amount;
        } else {
            const key = normalizeKey(cat);
            expenseByCategory[key] = (expenseByCategory[key] || 0) + t.amount;
        }
    });

    const netProfit = totalRevenue - totalExpenses;

    // Build waterfall data
    const waterfallData: { name: string; value: number; type: 'income' | 'expense' | 'total'; cumulative: number }[] = [];

    let cumulative = 0;

    // Add income items
    Object.entries(incomeByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, val]) => {
            cumulative += val;
            waterfallData.push({ name: cat, value: val, type: 'income', cumulative });
        });

    // Add expense items (negative)
    Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, val]) => {
            cumulative -= val;
            waterfallData.push({ name: cat, value: -val, type: 'expense', cumulative });
        });

    // Add net profit
    waterfallData.push({ name: 'Net Profit', value: netProfit, type: 'total', cumulative: netProfit });

    // For waterfall chart, we need base and value
    const chartData = waterfallData.map((d, i) => {
        if (d.type === 'total') {
            return { name: d.name, base: 0, positive: d.value >= 0 ? d.value : 0, negative: d.value < 0 ? Math.abs(d.value) : 0, type: d.type };
        }
        if (d.type === 'income') {
            const base = d.cumulative - d.value;
            return { name: d.name, base, positive: d.value, negative: 0, type: d.type };
        }
        // expense
        const base = d.cumulative;
        return { name: d.name, base, positive: 0, negative: Math.abs(d.value), type: d.type };
    });

    const fmt = (v: number) => {
        const abs = Math.abs(v);
        if (abs >= 100000) return `₹${(abs / 100000).toFixed(0)}L`;
        if (abs >= 1000) return `₹${(abs / 1000).toFixed(0)}k`;
        return `₹${abs}`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const d = waterfallData.find(w => w.name === label);
        if (!d) return null;
        return (
            <div className="waterfall-tooltip">
                <div className="wt-label">{label}</div>
                <div className={`wt-value ${d.type}`}>
                    {d.value >= 0 ? '+' : '-'}{formatCurrency(Math.abs(d.value))}
                </div>
                <div className="wt-cumulative">Running: {formatCurrency(d.cumulative)}</div>
            </div>
        );
    };

    // Cash flow story
    const topIncome = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1])[0];
    const topExpense = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="cashflow-waterfall">
            <div className="waterfall-header">
                <h3 className="waterfall-title">Cash Flow Waterfall</h3>
                <div className="waterfall-legend">
                    <span className="wl-item income"><span className="wl-dot"></span>Money In</span>
                    <span className="wl-item expense"><span className="wl-dot"></span>Money Out</span>
                    <span className="wl-item total"><span className="wl-dot"></span>Net</span>
                </div>
            </div>

            <div className="waterfall-chart-container">
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 45, bottom: 5 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            interval={0}
                            angle={-35}
                            textAnchor="end"
                            height={55}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            tickFormatter={fmt}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                        <Bar dataKey="base" stackId="a" fill="transparent" />
                        <Bar dataKey="positive" stackId="a" radius={[3, 3, 0, 0]}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.type === 'total' ? '#3B82F6' : '#10B981'} />
                            ))}
                        </Bar>
                        <Bar dataKey="negative" stackId="a" radius={[3, 3, 0, 0]}>
                            {chartData.map((_, i) => (
                                <Cell key={i} fill="#EF4444" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="waterfall-story">
                <div className="story-flow">
                    <div className="flow-item income">
                        <span className="flow-label">Money In</span>
                        <span className="flow-value">{formatCurrency(totalRevenue)}</span>
                        {topIncome && <span className="flow-detail">Top: {capitalize(topIncome[0])}</span>}
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-item expense">
                        <span className="flow-label">Money Out</span>
                        <span className="flow-value">{formatCurrency(totalExpenses)}</span>
                        {topExpense && <span className="flow-detail">Top: {capitalize(topExpense[0])}</span>}
                    </div>
                    <div className="flow-arrow">=</div>
                    <div className={`flow-item ${netProfit >= 0 ? 'profit' : 'loss'}`}>
                        <span className="flow-label">{netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                        <span className="flow-value">{formatCurrency(Math.abs(netProfit))}</span>
                        <span className="flow-detail">{totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}% margin</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashFlowWaterfall;
