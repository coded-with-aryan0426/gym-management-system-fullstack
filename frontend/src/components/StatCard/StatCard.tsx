import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cardHover } from '../../utils/animations';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'primary',
}) => {
  return (
    <motion.div 
      className={`stat-card stat-card--${color}`}
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="stat-card__header">
        <motion.div 
          className="stat-card__icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {icon}
        </motion.div>
        <div className="stat-card__title">{title}</div>
      </div>
      
      <div className="stat-card__body">
        <motion.div 
          className="stat-card__value"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {value}
        </motion.div>
        
        {trend && (
          <motion.div 
            className={`stat-card__trend ${trend.isPositive ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <motion.div
              animate={{ y: trend.isPositive ? [-2, 0, -2] : [2, 0, 2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </motion.div>
            <span>{Math.abs(trend.value)}%</span>
          </motion.div>
        )}
      </div>
      
      {subtitle && (
        <motion.div 
          className="stat-card__subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {subtitle}
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatCard;
