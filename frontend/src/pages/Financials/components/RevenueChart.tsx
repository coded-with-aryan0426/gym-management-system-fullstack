import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '../../../types/finance';
import './RevenueChart.css';

interface RevenueChartProps {
    onFilter?: (category: string) => void;
    transactions?: Transaction[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

const RevenueChart: React.FC<RevenueChartProps> = ({ onFilter, transactions = [] }) => {
    const chartData = useMemo(() => {
        const income = transactions.filter(t => t.amount > 0);
        const categoryTotals: Record<string, number> = {};
        
        income.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);
        
        return Object.entries(categoryTotals)
            .map(([name, value], i) => ({
                name,
                value,
                percent: total > 0 ? Math.round((value / total) * 100) : 0,
                color: COLORS[i % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [transactions]);

    const topSource = chartData[0];

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const data = payload[0].payload;
        return (
            <div className="revenue-tooltip">
                <span className="tooltip-name">{data.name}</span>
                <span className="tooltip-value">₹{data.value.toLocaleString('en-IN')}</span>
                <span className="tooltip-percent">{data.percent}%</span>
            </div>
        );
    };

    if (chartData.length === 0) {
        return (
            <div className="revenue-chart-empty">
                <span>No revenue data available</span>
            </div>
        );
    }

    return (
        <div className="revenue-chart">
            <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="35%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onFilter?.(entry.name)}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="chart-legend">
                    {chartData.map((item, i) => (
                        <button
                            key={i}
                            className="legend-item"
                            onClick={() => onFilter?.(item.name)}
                        >
                            <span className="legend-dot" style={{ background: item.color }}></span>
                            <span className="legend-name">{item.name}</span>
                            <span className="legend-percent">{item.percent}%</span>
                        </button>
                    ))}
                </div>
            </div>

            {topSource && (
                <div className="chart-insight healthy">
                    <span className="insight-dot"></span>
                    <span className="insight-text">
                        <strong>{topSource.name}</strong> leads with {topSource.percent}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default RevenueChart;
