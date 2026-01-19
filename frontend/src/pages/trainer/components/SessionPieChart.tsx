import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
    label: string;
    value: number;
    meta?: string; // color
}

interface SessionPieChartProps {
    data: ChartData[];
}

const SessionPieChart: React.FC<SessionPieChartProps> = ({ data }) => {
    // Default colors if meta is missing
    const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

    return (
        <motion.div
            className="chart-container glass-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="chart-header">
                <h3>Session Types</h3>
                <span className="chart-subtitle">Distribution</span>
            </div>
            <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data as any}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.meta || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SessionPieChart;
