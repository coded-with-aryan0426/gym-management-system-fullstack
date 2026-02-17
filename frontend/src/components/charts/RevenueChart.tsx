import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          stroke="var(--text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--text-secondary)"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            color: 'var(--text-primary)',
          }}
          formatter={(value: number) => [`$${value}`, 'Revenue']}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent-primary)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
