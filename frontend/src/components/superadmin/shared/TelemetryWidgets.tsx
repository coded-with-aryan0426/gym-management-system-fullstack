import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Zap } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import './TelemetryWidgets.css';

export interface TelemetryMetric {
  timestamp: string;
  value: number;
}

interface ApiLatencyWidgetProps {
  data: TelemetryMetric[];
  threshold?: number;
  unit?: string;
  isLoading?: boolean;
  lastUpdated?: string;
}

export const ApiLatencyWidget: React.FC<ApiLatencyWidgetProps> = ({
  data,
  threshold = 800,
  unit = 'ms',
  isLoading = false,
  lastUpdated
}) => {
  const { avg, p95, isHealthy } = useMemo(() => {
    if (!data.length) return { avg: 0, p95: 0, isHealthy: true };
    const values = data.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avgValue = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95Value = sorted[p95Index] || sorted[sorted.length - 1];
    return {
      avg: avgValue,
      p95: p95Value,
      isHealthy: p95Value < threshold
    };
  }, [data, threshold]);

  return (
    <motion.div
      className={`telemetry-widget telemetry-widget--api ${!isHealthy ? 'telemetry-widget--warning' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="telemetry-widget__header">
        <div className="telemetry-widget__icon">
          <Activity size={14} />
        </div>
        <span className="telemetry-widget__title">API Latency</span>
        {!isHealthy && <span className="telemetry-widget__alert">HIGH</span>}
      </div>

      <div className="telemetry-widget__chart">
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isHealthy ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isHealthy ? '#22c55e' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: '#1c1c1f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                fontSize: 11
              }}
              formatter={(value: number) => [`${value.toFixed(1)}${unit}`, 'Latency']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isHealthy ? '#22c55e' : '#ef4444'}
              strokeWidth={1.5}
              fill="url(#latencyGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="telemetry-widget__stats">
        <div className="telemetry-widget__stat">
          <span className="telemetry-widget__stat-label">Avg</span>
          <span className="telemetry-widget__stat-value">{avg.toFixed(1)}{unit}</span>
        </div>
        <div className="telemetry-widget__stat">
          <span className="telemetry-widget__stat-label">P95</span>
          <span className="telemetry-widget__stat-value" style={{ color: !isHealthy ? '#ef4444' : undefined }}>
            {p95.toFixed(1)}{unit}
          </span>
        </div>
      </div>

      {lastUpdated && (
        <div className="telemetry-widget__footer">
          Updated {lastUpdated}
        </div>
      )}
    </motion.div>
  );
};

interface DbConnectionsWidgetProps {
  active: number;
  total: number;
  threshold?: number;
  isLoading?: boolean;
}

export const DbConnectionsWidget: React.FC<DbConnectionsWidgetProps> = ({
  active,
  total,
  threshold = 80,
  isLoading = false
}) => {
  const percentage = total > 0 ? (active / total) * 100 : 0;
  const isHealthy = percentage < threshold;

  const strokeDasharray = 251.2;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * Math.min(percentage, 100)) / 100;

  return (
    <motion.div
      className={`telemetry-widget telemetry-widget--db ${!isHealthy ? 'telemetry-widget--warning' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="telemetry-widget__header">
        <div className="telemetry-widget__icon">
          <Database size={14} />
        </div>
        <span className="telemetry-widget__title">DB Connections</span>
        {!isHealthy && <span className="telemetry-widget__alert">HIGH</span>}
      </div>

      <div className="telemetry-widget__gauge">
        <svg viewBox="0 0 100 60" className="telemetry-widget__gauge-svg">
          <path
            d="M 10 55 A 40 40 0 0 1 90 55"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 55 A 40 40 0 0 1 90 55"
            fill="none"
            stroke={isHealthy ? '#22c55e' : '#ef4444'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="telemetry-widget__gauge-value">
          <span className="telemetry-widget__gauge-number">{active}</span>
          <span className="telemetry-widget__gauge-total">/ {total}</span>
        </div>
      </div>

      <div className="telemetry-widget__progress">
        <div className="telemetry-widget__progress-bar">
          <div
            className="telemetry-widget__progress-fill"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              background: isHealthy ? '#22c55e' : '#ef4444'
            }}
          />
        </div>
        <span className="telemetry-widget__progress-label">{percentage.toFixed(0)}% utilized</span>
      </div>
    </motion.div>
  );
};

interface RedisHitRatioWidgetProps {
  hits: number;
  misses: number;
  threshold?: number;
  isLoading?: boolean;
}

export const RedisHitRatioWidget: React.FC<RedisHitRatioWidgetProps> = ({
  hits,
  misses,
  threshold = 80,
  isLoading = false
}) => {
  const total = hits + misses;
  const ratio = total > 0 ? (hits / total) * 100 : 0;
  const isHealthy = ratio >= threshold;

  return (
    <motion.div
      className={`telemetry-widget telemetry-widget--redis ${!isHealthy ? 'telemetry-widget--warning' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="telemetry-widget__header">
        <div className="telemetry-widget__icon">
          <Zap size={14} />
        </div>
        <span className="telemetry-widget__title">Redis Cache</span>
        {!isHealthy && <span className="telemetry-widget__alert">LOW</span>}
      </div>

      <div className="telemetry-widget__big-number" style={{ color: isHealthy ? '#22c55e' : '#f59e0b' }}>
        {ratio.toFixed(1)}%
        <span className="telemetry-widget__big-label">Hit Ratio</span>
      </div>

      <div className="telemetry-widget__stats-row">
        <div className="telemetry-widget__stat-inline">
          <span className="telemetry-widget__stat-dot telemetry-widget__stat-dot--hit" />
          <span className="telemetry-widget__stat-label">Hits</span>
          <span className="telemetry-widget__stat-value">{hits.toLocaleString()}</span>
        </div>
        <div className="telemetry-widget__stat-inline">
          <span className="telemetry-widget__stat-dot telemetry-widget__stat-dot--miss" />
          <span className="telemetry-widget__stat-label">Misses</span>
          <span className="telemetry-widget__stat-value">{misses.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default { ApiLatencyWidget, DbConnectionsWidget, RedisHitRatioWidget };
