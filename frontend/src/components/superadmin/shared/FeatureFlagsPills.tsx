import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Percent, ExternalLink } from 'lucide-react';
import './FeatureFlagsPills.css';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  description?: string;
}

interface FeatureFlagsPillsProps {
  flags: FeatureFlag[];
  onFlagClick?: (flag: FeatureFlag) => void;
  maxDisplay?: number;
  isLoading?: boolean;
  className?: string;
}

export const FeatureFlagsPills: React.FC<FeatureFlagsPillsProps> = ({
  flags,
  onFlagClick,
  maxDisplay = 10,
  isLoading = false,
  className = ''
}) => {
  const displayedFlags = flags.slice(0, maxDisplay);
  const remainingCount = flags.length - maxDisplay;

  const getFlagIcon = (flag: FeatureFlag) => {
    if (flag.enabled && flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      return <Percent size={10} />;
    }
    return flag.enabled ? <Check size={10} /> : <X size={10} />;
  };

  const getFlagClass = (flag: FeatureFlag) => {
    if (!flag.enabled) return 'feature-flag-pill--disabled';
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) return 'feature-flag-pill--canary';
    return 'feature-flag-pill--enabled';
  };

  if (isLoading) {
    return (
      <div className={`feature-flags-pills ${className}`}>
        <div className="feature-flags-pills__loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="feature-flag-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`feature-flags-pills ${className}`}>
      <div className="feature-flags-pills__container">
        {displayedFlags.map((flag, index) => (
          <motion.button
            key={flag.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={`feature-flag-pill ${getFlagClass(flag)}`}
            onClick={() => onFlagClick?.(flag)}
            title={flag.description || flag.key}
          >
            <span className="feature-flag-pill__icon">{getFlagIcon(flag)}</span>
            <span className="feature-flag-pill__label">{flag.name || flag.key}</span>
            {flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && (
              <span className="feature-flag-pill__percentage">{flag.rolloutPercentage}%</span>
            )}
            {onFlagClick && (
              <ExternalLink size={10} className="feature-flag-pill__link" />
            )}
          </motion.button>
        ))}
        {remainingCount > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="feature-flag-pill feature-flag-pill--more"
            onClick={() => onFlagClick?.(flags[0])}
          >
            +{remainingCount} more
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FeatureFlagsPills;
