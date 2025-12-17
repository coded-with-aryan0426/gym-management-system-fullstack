import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './RevenueChart.css';

const data = [
    { name: 'Memberships', value: 125000, color: '#10B981', percent: 65 },
    { name: 'PT Sessions', value: 45000, color: '#3B82F6', percent: 23 },
    { name: 'Merchandise', value: 15000, color: '#F59E0B', percent: 8 },
    { name: 'Day Passes', value: 8500, color: '#8B5CF6', percent: 4 },
];

// Calculate health status
const topSource = data[0];
const isHealthy = topSource.percent >= 50; // Healthy if top source > 50%

interface RevenueChartProps {
    onFilter?: (category: string) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ onFilter }) => {
    return (
        <div className="revenue-chart-container">
            <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                            style={{ cursor: 'pointer' }}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="rgba(0,0,0,0.1)"
                                    onClick={() => onFilter?.(entry.name === 'Memberships' ? 'Membership' : entry.name === 'PT Sessions' ? 'Personal Training' : 'Merchandise')}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', paddingLeft: '8px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Health Evaluation Strip */}
            <div className={`chart-evaluation ${isHealthy ? 'chart-evaluation--healthy' : 'chart-evaluation--warning'}`}>
                <span className="evaluation-indicator">{isHealthy ? '●' : '⚠'}</span>
                <span className="evaluation-text">
                    <strong>{topSource.name}</strong>: {topSource.percent}% of revenue
                    <span className="evaluation-status">{isHealthy ? '(Healthy)' : '(Review needed)'}</span>
                </span>
            </div>
        </div>
    );
};

export default RevenueChart;
