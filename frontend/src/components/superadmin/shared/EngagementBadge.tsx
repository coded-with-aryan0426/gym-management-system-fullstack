import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './EngagementBadge.css';

export interface EngagementBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getTierInfo = (score: number): { tier: string; emoji: string; color: string; bg: string } => {
  if (score >= 90) return { tier: 'Diamond', emoji: '💎', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
  if (score >= 75) return { tier: 'Platinum', emoji: '🏆', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' };
  if (score >= 50) return { tier: 'Gold', emoji: '⭐', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  if (score >= 25) return { tier: 'Silver', emoji: '🥈', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)' };
  return { tier: 'Bronze', emoji: '🥉', color: '#cd7c32', bg: 'rgba(205, 124, 50, 0.15)' };
};

export const EngagementBadge: React.FC<EngagementBadgeProps> = ({
  score,
  showLabel = false,
  size = 'md',
  className = ''
}) => {
  const tier = useMemo(() => getTierInfo(score), [score]);

  const sizeClass = `engagement-badge--${size}`;

  return (
    <motion.div
      className={`engagement-badge ${sizeClass} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ background: tier.bg }}
      title={`${tier.tier} Power User (${score})`}
    >
      <span className="engagement-badge__emoji">{tier.emoji}</span>
      <span className="engagement-badge__score" style={{ color: tier.color }}>{score}</span>
      {showLabel && (
        <span className="engagement-badge__label" style={{ color: tier.color }}>{tier.tier}</span>
      )}
    </motion.div>
  );
};

export default EngagementBadge;
