import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { generateCalendarSequence, alignDataToCalendar, type DataPoint } from '../utils/dateUtils';

interface CalendarChartProps {
  year: number;
  month: number; // 0-11
  data: DataPoint[]; // data with possibly disorganized dates
  valueKey?: string; // default 'value'
}

const CalendarChart: React.FC<CalendarChartProps> = ({ year, month, data, valueKey = 'value' }) => {
  const cal = React.useMemo(() => generateCalendarSequence(year, month, 10, 8), [year, month]);
  const aligned = React.useMemo(() => alignDataToCalendar(data, cal), [data, cal]);
  const chartData = aligned.map(d => ({
    name: d.monthLabel,
    value: Number((d.data as any)[valueKey] || 0),
  }));

  const fmtAxis = (v: number) => String(v);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value || 0;
    return (
      <div className="chart-tooltip">
        <div className="tooltip-row"><span className="label">{label}</span></div>
        <div className="tooltip-row"><span className="label">Value</span><span className="tooltip-value">{val}</span></div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#calGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CalendarChart;
