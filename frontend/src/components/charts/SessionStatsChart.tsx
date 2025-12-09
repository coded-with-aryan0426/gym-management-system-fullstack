import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SessionData {
  day: string;
  completed: number;
  scheduled: number;
  missed: number;
}

interface SessionStatsChartProps {
  data: SessionData[];
}

const SessionStatsChart: React.FC<SessionStatsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="day"
          stroke="var(--text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            color: 'var(--text-primary)',
          }}
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        />
        <Bar dataKey="completed" fill="var(--success)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="scheduled" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="missed" fill="var(--warning)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SessionStatsChart;
