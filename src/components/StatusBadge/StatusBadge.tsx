import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: 'active' | 'expired';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status === 'active' ? 'Active' : 'Expired'}
    </span>
  );
};

export default StatusBadge;
