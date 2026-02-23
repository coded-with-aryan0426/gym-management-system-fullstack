import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
    label: string;
    value: number;
}

interface EarningsChartProps {
    data: ChartData[];
}

const EarningsChart: React.FC<EarningsChartProps> = ({ data }) => {
    return (
        <motion.div
            className="chart-container glass-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <div className="chart-header">
                <h3>Earnings History</h3>
                <span className="chart-subtitle">Last 6 months</span>
            </div>
            <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Earnings']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#10b981' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default EarningsChart;
