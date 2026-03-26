import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import './ImpactCounter.css';

export interface ImpactCounterProps {
  usersAffected: number;
  gymsAffected: number;
  totalUsers?: number;
  totalGyms?: number;
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const ImpactCounter: React.FC<ImpactCounterProps> = ({
  usersAffected,
  gymsAffected,
  totalUsers = 50000,
  totalGyms = 500,
  className = ''
}) => {
  const userPercentage = calculatePercentage(usersAffected, totalUsers);
  const gymPercentage = calculatePercentage(gymsAffected, totalGyms);

  const getImpactLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (userPercentage >= 80) return 'critical';
    if (userPercentage >= 50) return 'high';
    if (userPercentage >= 20) return 'medium';
    return 'low';
  };

  const impactLevel = getImpactLevel();

  return (
    <div className={`impact-counter ${className}`}>
      <div className="impact-counter__header">
        <span className="impact-counter__title">Impact Analysis</span>
        <span className={`impact-counter__badge impact-counter__badge--${impactLevel}`}>
          {impactLevel === 'critical' && <AlertCircle size={10} />}
          {impactLevel.charAt(0).toUpperCase() + impactLevel.slice(1)} Impact
        </span>
      </div>

      <div className="impact-counter__metrics">
        <div className="impact-counter__metric">
          <div className="impact-counter__metric-icon">
            <Users size={14} />
          </div>
          <div className="impact-counter__metric-content">
            <div className="impact-counter__metric-label">Users Affected</div>
            <div className="impact-counter__metric-value">
              {formatNumber(usersAffected)}
              <span className="impact-counter__metric-percentage">
                ({userPercentage}%)
              </span>
            </div>
          </div>
          <div className="impact-counter__progress">
            <motion.div
              className={`impact-counter__progress-fill impact-counter__progress-fill--${impactLevel}`}
              initial={{ width: 0 }}
              animate={{ width: `${userPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="impact-counter__metric">
          <div className="impact-counter__metric-icon">
            <Building2 size={14} />
          </div>
          <div className="impact-counter__metric-content">
            <div className="impact-counter__metric-label">Gyms Affected</div>
            <div className="impact-counter__metric-value">
              {formatNumber(gymsAffected)}
              <span className="impact-counter__metric-percentage">
                ({gymPercentage}%)
              </span>
            </div>
          </div>
          <div className="impact-counter__progress">
            <motion.div
              className={`impact-counter__progress-fill impact-counter__progress-fill--${impactLevel}`}
              initial={{ width: 0 }}
              animate={{ width: `${gymPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      <div className="impact-counter__footer">
        <TrendingUp size={10} />
        <span>Live impact counter</span>
      </div>
    </div>
  );
};

export default ImpactCounter;