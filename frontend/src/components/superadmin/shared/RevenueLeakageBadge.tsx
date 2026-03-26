import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import './RevenueLeakageBadge.css';

export interface RevenueLeakageBadgeProps {
  amount?: number;
  failedPayments?: number;
  variant?: 'warning' | 'critical';
  className?: string;
}

export const RevenueLeakageBadge: React.FC<RevenueLeakageBadgeProps> = ({
  amount = 0,
  failedPayments = 0,
  variant = 'warning',
  className = ''
}) => {
  const isCritical = variant === 'critical';

  return (
    <motion.div
      className={`revenue-leakage-badge ${isCritical ? 'revenue-leakage-badge--critical' : ''} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      title={`Revenue Leakage: ₹${amount.toLocaleString()} stuck in ${failedPayments} failed payments`}
    >
      <AlertTriangle size={12} className="revenue-leakage-badge__icon" />
      <span className="revenue-leakage-badge__amount">
        ₹{amount.toLocaleString()}
      </span>
      <motion.span
        className="revenue-leakage-badge__pulse"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
    </motion.div>
  );
};

export default RevenueLeakageBadge;
