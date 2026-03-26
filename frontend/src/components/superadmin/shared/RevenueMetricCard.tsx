import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import './RevenueMetricCard.css';

export interface RevenueMetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const RevenueMetricCard: React.FC<RevenueMetricCardProps> = ({
  label,
  value,
  change,
  changeLabel,
  icon,
  accentColor = '#10b981',
  isLoading = false,
  onClick,
  className = ''
}) => {
  const isPositive = change !== undefined && change >= 0;

  const formattedChange = useMemo(() => {
    if (change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }, [change]);

  if (isLoading) {
    return (
      <div className={`revenue-metric-card revenue-metric-card--loading ${className}`}>
        <div className="revenue-metric-card__skeleton revenue-metric-card__skeleton--label" />
        <div className="revenue-metric-card__skeleton revenue-metric-card__skeleton--value" />
        <div className="revenue-metric-card__skeleton revenue-metric-card__skeleton--change" />
      </div>
    );
  }

  return (
    <motion.div
      className={`revenue-metric-card ${onClick ? 'revenue-metric-card--clickable' : ''} ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
    >
      <div className="revenue-metric-card__header">
        <span className="revenue-metric-card__label">{label}</span>
        {icon && (
          <div className="revenue-metric-card__icon" style={{ background: `${accentColor}15`, color: accentColor }}>
            {icon}
          </div>
        )}
      </div>

      <div className="revenue-metric-card__body">
        <span className="revenue-metric-card__value">{value}</span>
        {change !== undefined && (
          <div className={`revenue-metric-card__change ${isPositive ? 'revenue-metric-card__change--positive' : 'revenue-metric-card__change--negative'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{formattedChange}</span>
            {changeLabel && <span className="revenue-metric-card__change-label">{changeLabel}</span>}
          </div>
        )}
      </div>

      <div className="revenue-metric-card__accent" style={{ background: accentColor }} />
    </motion.div>
  );
};

export default RevenueMetricCard;
