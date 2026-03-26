import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './InlineSparkline.css';

export interface InlineSparklineProps {
  values: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  showTrend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
  switch (trend) {
    case 'up': return <TrendingUp size={10} />;
    case 'down': return <TrendingDown size={10} />;
    default: return <Minus size={10} />;
  }
};

export const InlineSparkline: React.FC<InlineSparklineProps> = ({
  values,
  width = 60,
  height = 20,
  strokeWidth = 1.5,
  color,
  showTrend = true,
  showTooltip = false,
  className = ''
}) => {
  const { path, trend, minVal, maxVal, lastValue } = useMemo(() => {
    if (!values || values.length === 0) {
      return { path: '', trend: 'flat' as const, minVal: 0, maxVal: 0, lastValue: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = 2;

    const xStep = (width - padding * 2) / (values.length - 1);
    const yScale = (height - padding * 2) / range;

    const points = values.map((val, i) => ({
      x: padding + i * xStep,
      y: height - padding - (val - min) * yScale
    }));

    const pathData = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + point.x) / 2;
      return `${acc} C ${cpx} ${prev.y}, ${cpx} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const diff = values[values.length - 1] - values[0];
    const trendVal: 'up' | 'down' | 'flat' = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';

    return {
      path: pathData,
      trend: trendVal,
      minVal: min,
      maxVal: max,
      lastValue: values[values.length - 1]
    };
  }, [values, width, height]);

  const lineColor = useMemo(() => {
    if (color) return color;
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  }, [trend, color]);

  if (!values || values.length === 0) {
    return (
      <div className={`inline-sparkline inline-sparkline--empty ${className}`} style={{ width, height }}>
        <Minus size={12} style={{ opacity: 0.3 }} />
      </div>
    );
  }

  return (
    <motion.div
      className={`inline-sparkline ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width, height }}
      title={showTooltip ? `Last: ${lastValue} | Min: ${minVal} | Max: ${maxVal}` : undefined}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-sparkline__svg">
        <defs>
          <linearGradient id={`sparkGrad-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {showTrend && (
        <span
          className="inline-sparkline__trend"
          style={{ color: lineColor }}
        >
          {getTrendIcon(trend)}
        </span>
      )}
    </motion.div>
  );
};

export default InlineSparkline;
