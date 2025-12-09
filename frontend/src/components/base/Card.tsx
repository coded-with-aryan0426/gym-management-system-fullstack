import React from 'react';
import './Card.css';

export type CardElevation = '1' | '2' | '3' | '4' | '5';

interface CardProps {
  elevation?: CardElevation;
  hoverable?: boolean;
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  elevation = '2',
  hoverable = false,
  clickable = false,
  padding = 'md',
  children,
  className = '',
  onClick,
}) => {
  const classes = [
    'card',
    `card--elevation-${elevation}`,
    `card--padding-${padding}`,
    hoverable && 'card--hoverable',
    clickable && 'card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} role={clickable ? 'button' : undefined}>
      {children}
    </div>
  );
};

export default Card;
