import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, Filter } from 'lucide-react';
import './GhostAccountsFilter.css';

export interface GhostAccount {
  id: string;
  daysSinceLastLogin: number;
  totalLogins: number;
  lastActive: string;
}

export interface GhostAccountsFilterProps {
  ghostAccounts: GhostAccount[];
  onFilterChange?: (filter: 'all' | 'ghost' | 'active' | 'recent') => void;
  currentFilter?: 'all' | 'ghost' | 'active' | 'recent';
  className?: string;
}

const filterOptions: { key: 'all' | 'ghost' | 'active' | 'recent'; label: string; description: string }[] = [
  { key: 'all', label: 'All Users', description: 'Show all users regardless of activity' },
  { key: 'ghost', label: 'Ghost Only', description: 'Users with <3 logins and inactive >30 days' },
  { key: 'active', label: 'Power Users', description: 'Users with 50+ logins and active in last 7 days' },
  { key: 'recent', label: 'Recent Joiners', description: 'Joined in last 30 days with <5 logins' }
];

export const GhostAccountsFilter: React.FC<GhostAccountsFilterProps> = ({
  ghostAccounts,
  onFilterChange,
  currentFilter = 'all',
  className = ''
}) => {
  const ghostCount = ghostAccounts.length;

  return (
    <div className={`ghost-accounts-filter ${className}`}>
      <div className="ghost-accounts-filter__header">
        <Ghost size={14} />
        <span className="ghost-accounts-filter__title">Ghost Accounts</span>
        {ghostCount > 0 && (
          <motion.span
            className="ghost-accounts-filter__count"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {ghostCount}
          </motion.span>
        )}
      </div>
      <div className="ghost-accounts-filter__options">
        {filterOptions.map(option => (
          <button
            key={option.key}
            className={`ghost-accounts-filter__option ${currentFilter === option.key ? 'ghost-accounts-filter__option--active' : ''}`}
            onClick={() => onFilterChange?.(option.key)}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GhostAccountsFilter;
