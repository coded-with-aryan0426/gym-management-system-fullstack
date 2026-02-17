import React from 'react';
import './Badge.css';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
}) => {
  const classes = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
};

export default Badge;
