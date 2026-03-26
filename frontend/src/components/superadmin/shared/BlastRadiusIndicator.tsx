import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Zap } from 'lucide-react';
import './BlastRadiusIndicator.css';

export interface BlastRadiusData {
  usersAffected: number;
  gymsAffected: number;
  occurrences: number;
  errorType?: string;
}

export interface BlastRadiusIndicatorProps {
  data: BlastRadiusData;
  variant?: 'compact' | 'expanded';
  showImpact?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BlastRadiusIndicator: React.FC<BlastRadiusIndicatorProps> = ({
  data,
  variant = 'compact',
  showImpact = true,
  onClick,
  className = ''
}) => {
  const severity = useMemo(() => {
    if (data.usersAffected > 50 || data.gymsAffected > 10) return 'critical';
    if (data.usersAffected > 20 || data.gymsAffected > 5) return 'high';
    if (data.usersAffected > 5 || data.gymsAffected > 2) return 'medium';
    return 'low';
  }, [data.usersAffected, data.gymsAffected]);

  const severityConfig = {
    critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Critical Impact' },
    high: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'High Impact' },
    medium: { color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', label: 'Medium Impact' },
    low: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'Low Impact' }
  };

  const config = severityConfig[severity];

  if (variant === 'compact') {
    return (
      <motion.div
        className={`blast-radius blast-radius--compact ${onClick ? 'blast-radius--clickable' : ''} ${className}`}
        style={{ background: config.bg, borderColor: `${config.color}30` }}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        <Zap size={12} style={{ color: config.color }} />
        <span className="blast-radius__count" style={{ color: config.color }}>
          {data.usersAffected}
        </span>
        <span className="blast-radius__label">users</span>
        {data.gymsAffected > 0 && (
          <>
            <span className="blast-radius__sep">across</span>
            <span className="blast-radius__count" style={{ color: config.color }}>
              {data.gymsAffected}
            </span>
            <span className="blast-radius__label">gyms</span>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`blast-radius blast-radius--expanded ${onClick ? 'blast-radius--clickable' : ''} ${className}`}
      style={{ background: config.bg, borderColor: `${config.color}30` }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
    >
      <div className="blast-radius__header">
        <Zap size={14} style={{ color: config.color }} />
        <span className="blast-radius__severity" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      <div className="blast-radius__stats">
        <div className="blast-radius__stat">
          <Users size={14} className="blast-radius__stat-icon" style={{ color: config.color }} />
          <span className="blast-radius__stat-value" style={{ color: config.color }}>
            {data.usersAffected}
          </span>
          <span className="blast-radius__stat-label">users affected</span>
        </div>

        <div className="blast-radius__divider" />

        <div className="blast-radius__stat">
          <Building2 size={14} className="blast-radius__stat-icon" style={{ color: config.color }} />
          <span className="blast-radius__stat-value" style={{ color: config.color }}>
            {data.gymsAffected}
          </span>
          <span className="blast-radius__stat-label">gyms affected</span>
        </div>

        <div className="blast-radius__divider" />

        <div className="blast-radius__stat">
          <Zap size={14} className="blast-radius__stat-icon" style={{ color: config.color }} />
          <span className="blast-radius__stat-value" style={{ color: config.color }}>
            {data.occurrences}
          </span>
          <span className="blast-radius__stat-label">occurrences</span>
        </div>
      </div>

      {showImpact && (
        <div className="blast-radius__impact-bar">
          <motion.div
            className="blast-radius__impact-fill"
            style={{ background: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((data.usersAffected / 100) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default BlastRadiusIndicator;
