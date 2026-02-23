import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthData {
  month: string;
  members: number;
}

interface MemberGrowthChartProps {
  data: GrowthData[];
}

const MemberGrowthChart: React.FC<MemberGrowthChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
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
          formatter={(value: number | undefined) => [value ?? 0, 'Members']}
        />
        <Area
          type="monotone"
          dataKey="members"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorMembers)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MemberGrowthChart;
