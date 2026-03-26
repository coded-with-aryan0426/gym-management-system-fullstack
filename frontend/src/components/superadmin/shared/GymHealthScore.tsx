import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './GymHealthScore.css';

export interface GymHealthScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Healthy';
  if (score >= 50) return 'Warning';
  return 'Critical';
};

export const GymHealthScore: React.FC<GymHealthScoreProps> = ({
  score,
  size = 48,
  strokeWidth = 4,
  showLabel = false,
  animated = true,
  className = ''
}) => {
  const color = useMemo(() => getScoreColor(score), [score]);
  const label = useMemo(() => getScoreLabel(score), [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const svgViewBox = `0 0 ${size} ${size}`;
  const center = size / 2;

  return (
    <motion.div
      className={`gym-health-score ${className}`}
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: size, height: size }}
      title={`Health Score: ${score} (${label})`}
    >
      <svg viewBox={svgViewBox} className="gym-health-score__svg">
        <circle
          className="gym-health-score__bg"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className="gym-health-score__ring"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="gym-health-score__content">
        <span className="gym-health-score__value" style={{ color }}>
          {score}
        </span>
      </div>
      {showLabel && (
        <span className="gym-health-score__label" style={{ color }}>
          {label}
        </span>
      )}
    </motion.div>
  );
};

export default GymHealthScore;
