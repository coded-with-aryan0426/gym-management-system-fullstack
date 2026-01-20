import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '../../../types/finance';
import './RevenueChart.css';

interface RevenueChartProps {
    onFilter?: (category: string) => void;
    data?: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ onFilter, data = [] }) => {
    // Data is already processed by API service
    const chartData = useMemo(() => {
        return data.map(d => ({
            name: d.label,
            value: d.value,
            percent: d.percentage,
            color: d.color
        })).sort((a, b) => b.value - a.value);
    }, [data]);

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
                            innerRadius={60}
                            outerRadius={80}
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
                            <span className="legend-percent" style={{ marginLeft: 'auto' }}>{item.percent}%</span>
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
