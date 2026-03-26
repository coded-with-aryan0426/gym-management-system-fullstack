import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './OwnerActivityStatus.css';

export interface OwnerActivityStatusProps {
  lastLogin?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

type ActivityLevel = 'active' | 'recent' | 'stale' | 'abandoned';

const getActivityLevel = (lastLogin: string | undefined): ActivityLevel => {
  if (!lastLogin) return 'abandoned';

  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffMs = now.getTime() - loginDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) return 'active';
  if (diffHours < 24) return 'recent';
  if (diffDays < 7) return 'stale';
  return 'abandoned';
};

const formatLastLogin = (lastLogin: string | undefined): string => {
  if (!lastLogin) return 'Unknown';

  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffMs = now.getTime() - loginDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${diffDays}d ago`;
};

const activityConfig: Record<ActivityLevel, { color: string; bg: string; label: string }> = {
  active: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Active' },
  recent: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Recent' },
  stale: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Stale' },
  abandoned: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Abandoned' }
};

export const OwnerActivityStatus: React.FC<OwnerActivityStatusProps> = ({
  lastLogin,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const level = useMemo(() => getActivityLevel(lastLogin), [lastLogin]);
  const config = activityConfig[level];
  const formattedTime = useMemo(() => formatLastLogin(lastLogin), [lastLogin]);

  const dotSize = size === 'sm' ? 6 : 8;

  return (
    <motion.div
      className={`owner-activity-status owner-activity-status--${level} owner-activity-status--${size} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      title={`Last login: ${formattedTime}`}
    >
      <span
        className="owner-activity-status__dot"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: config.color,
          boxShadow: level === 'active' ? `0 0 6px ${config.color}` : undefined
        }}
      />
      {showLabel && (
        <span className="owner-activity-status__label" style={{ color: config.color }}>
          {formattedTime}
        </span>
      )}
      {level === 'abandoned' && (
        <motion.span
          className="owner-activity-status__badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          Abandoned
        </motion.span>
      )}
    </motion.div>
  );
};

export default OwnerActivityStatus;
