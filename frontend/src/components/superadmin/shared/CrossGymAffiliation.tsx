import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';
import './CrossGymAffiliation.css';

export interface GymAffiliation {
  gymId: number;
  gymName: string;
  role: string;
  isPrimary?: boolean;
}

export interface CrossGymAffiliationProps {
  affiliations: GymAffiliation[];
  maxDisplay?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const CrossGymAffiliation: React.FC<CrossGymAffiliationProps> = ({
  affiliations,
  maxDisplay = 3,
  size = 'sm',
  className = ''
}) => {
  const displayed = affiliations.slice(0, maxDisplay);
  const remaining = affiliations.length - maxDisplay;

  if (affiliations.length === 0) {
    return (
      <span className={`cross-gym-affiliation cross-gym-affiliation--empty ${className}`}>
        No affiliations
      </span>
    );
  }

  return (
    <div className={`cross-gym-affiliation cross-gym-affiliation--${size} ${className}`}>
      {displayed.map((aff, index) => (
        <motion.span
          key={`${aff.gymId}-${aff.role}`}
          className={`cross-gym-affiliation__pill ${aff.isPrimary ? 'cross-gym-affiliation__pill--primary' : ''}`}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          title={`${aff.gymName} (${aff.role})`}
        >
          <Building2 size={9} />
          <span className="cross-gym-affiliation__name">
            {aff.gymName.length > 12 ? `${aff.gymName.substring(0, 12)}...` : aff.gymName}
          </span>
          {aff.isPrimary && <span className="cross-gym-affiliation__primary-badge">★</span>}
        </motion.span>
      ))}
      {remaining > 0 && (
        <motion.span
          className="cross-gym-affiliation__more"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          title={`${remaining} more affiliations`}
        >
          <Plus size={9} />
          +{remaining}
        </motion.span>
      )}
    </div>
  );
};

export default CrossGymAffiliation;
