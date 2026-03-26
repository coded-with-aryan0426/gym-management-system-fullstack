import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, Shield } from 'lucide-react';
import './PercentageRolloutSlider.css';

export type RolloutStrategy = 'global' | 'percentage' | 'gym-specific' | 'admin-only';

export interface PercentageRolloutSliderProps {
  value: number;
  onChange: (value: number) => void;
  strategy: RolloutStrategy;
  onStrategyChange?: (strategy: RolloutStrategy) => void;
  targetGymIds?: number[];
  onTargetGymsChange?: (gymIds: number[]) => void;
  totalUsers?: number;
  totalGyms?: number;
  className?: string;
}

const STRATEGY_OPTIONS: { key: RolloutStrategy; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'global', label: 'Global (100%)', icon: <Globe size={14} />, description: 'Enable for all users' },
  { key: 'percentage', label: 'Percentage', icon: <Users size={14} />, description: 'Random % of users' },
  { key: 'gym-specific', label: 'Gym-specific', icon: <Building2 size={14} />, description: 'Target certain gyms' },
  { key: 'admin-only', label: 'Admin Only', icon: <Shield size={14} />, description: 'Platform team only' },
];

export const PercentageRolloutSlider: React.FC<PercentageRolloutSliderProps> = ({
  value,
  onChange,
  strategy,
  onStrategyChange,
  targetGymIds = [],
  onTargetGymsChange,
  totalUsers = 10000,
  totalGyms = 100,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  }, [onChange]);

  const handleStrategySelect = (newStrategy: RolloutStrategy) => {
    if (onStrategyChange) {
      onStrategyChange(newStrategy);
    }
    if (newStrategy === 'global' && onChange) {
      onChange(100);
    } else if (newStrategy === 'admin-only' && onChange) {
      onChange(0);
    }
    setIsExpanded(false);
  };

  const impactedUsers = Math.round((value / 100) * totalUsers);
  const impactedGyms = Math.round((value / 100) * totalGyms);

  const currentStrategy = STRATEGY_OPTIONS.find(s => s.key === strategy) || STRATEGY_OPTIONS[0];

  return (
    <div className={`rollout-slider ${className}`}>
      <div className="rollout-slider__header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="rollout-slider__current">
          <span className="rollout-slider__icon">{currentStrategy.icon}</span>
          <span className="rollout-slider__label">{currentStrategy.label}</span>
          {strategy === 'percentage' && (
            <span className="rollout-slider__value">{value}%</span>
          )}
        </div>
        <motion.div
          className="rollout-slider__chevron"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </div>

      <motion.div
        className="rollout-slider__content"
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="rollout-slider__body">
          <div className="rollout-slider__options">
            {STRATEGY_OPTIONS.map(option => (
              <button
                key={option.key}
                className={`rollout-slider__option ${strategy === option.key ? 'rollout-slider__option--active' : ''}`}
                onClick={() => handleStrategySelect(option.key)}
              >
                {option.icon}
                <span className="rollout-slider__option-label">{option.label}</span>
              </button>
            ))}
          </div>

          {strategy === 'percentage' && (
            <div className="rollout-slider__slider-container">
              <div className="rollout-slider__slider-track">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={handleSliderChange}
                  className="rollout-slider__input"
                />
                <div className="rollout-slider__slider-fill" style={{ width: `${value}%` }} />
              </div>
              <div className="rollout-slider__slider-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <div className="rollout-slider__impact">
            <div className="rollout-slider__impact-item">
              <Users size={12} />
              <span className="rollout-slider__impact-value">{impactedUsers.toLocaleString()}</span>
              <span className="rollout-slider__impact-label">users impacted</span>
            </div>
            {strategy === 'gym-specific' && (
              <div className="rollout-slider__impact-item">
                <Building2 size={12} />
                <span className="rollout-slider__impact-value">{targetGymIds.length}</span>
                <span className="rollout-slider__impact-label">gyms selected</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PercentageRolloutSlider;
