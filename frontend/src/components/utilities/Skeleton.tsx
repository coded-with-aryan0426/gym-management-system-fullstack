import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'rectangular',
  className = '',
  count = 1,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const classes = ['skeleton', `skeleton--${variant}`, className].filter(Boolean).join(' ');

  if (count === 1) {
    return <div className={classes} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={classes} style={style} />
      ))}
    </>
  );
};

export const SkeletonKPICard: React.FC = () => (
  <div className="skeleton-kpi-card">
    <div className="skeleton-kpi-header">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
    <Skeleton variant="text" width="40%" height={32} />
    <Skeleton variant="text" width="30%" height={14} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" height={14} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" height={16} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="skeleton-chart" style={{ height }}>
    <div className="skeleton-chart-header">
      <Skeleton variant="text" width="30%" height={20} />
      <Skeleton variant="text" width="20%" height={16} />
    </div>
    <div className="skeleton-chart-area">
      <Skeleton variant="rectangular" height={height - 60} />
    </div>
  </div>
);

export const SkeletonCard: React.FC<{ height?: number }> = ({ height = 120 }) => (
  <div className="skeleton-card" style={{ height }}>
    <Skeleton variant="rectangular" height={height} />
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-list-item">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="skeleton-list-item-content">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div className="skeleton-profile">
    <div className="skeleton-profile-header">
      <Skeleton variant="circular" width={80} height={80} />
      <div className="skeleton-profile-info">
        <Skeleton variant="text" width="50%" height={24} />
        <Skeleton variant="text" width="30%" height={16} />
      </div>
    </div>
    <div className="skeleton-profile-details">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-profile-row">
          <Skeleton variant="text" width="20%" height={14} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="skeleton-dashboard">
    <div className="skeleton-dashboard-header">
      <div>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={150} height={16} />
      </div>
      <Skeleton variant="rectangular" width={120} height={40} />
    </div>
    <div className="skeleton-kpi-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonKPICard key={i} />
      ))}
    </div>
    <div className="skeleton-dashboard-charts">
      <SkeletonChart height={350} />
      <SkeletonChart height={350} />
    </div>
    <div className="skeleton-dashboard-tables">
      <SkeletonTable rows={5} cols={4} />
      <SkeletonTable rows={5} cols={3} />
    </div>
  </div>
);

export const SkeletonMemberList: React.FC = () => (
  <div className="skeleton-member-list">
    <div className="skeleton-list-header">
      <Skeleton variant="text" width={150} height={24} />
      <div className="skeleton-list-actions">
        <Skeleton variant="rectangular" width={200} height={36} />
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    </div>
    <SkeletonTable rows={8} cols={5} />
  </div>
);

export const SkeletonTrainerList: React.FC = () => (
  <div className="skeleton-trainer-list">
    <div className="skeleton-list-header">
      <Skeleton variant="text" width={150} height={24} />
      <Skeleton variant="rectangular" width={120} height={36} />
    </div>
    <div className="skeleton-trainer-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-trainer-card">
          <Skeleton variant="circular" width={60} height={60} />
          <Skeleton variant="text" width="60%" height={18} />
          <Skeleton variant="text" width="40%" height={14} />
          <div className="skeleton-trainer-stats">
            <Skeleton variant="text" width={60} height={24} />
            <Skeleton variant="text" width={60} height={24} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStaffList: React.FC = () => (
  <div className="skeleton-staff-list">
    <div className="skeleton-list-header">
      <Skeleton variant="text" width={150} height={24} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </div>
    <SkeletonTable rows={6} cols={4} />
  </div>
);

export const SkeletonClassList: React.FC = () => (
  <div className="skeleton-class-list">
    <div className="skeleton-list-header">
      <Skeleton variant="text" width={200} height={24} />
      <div className="skeleton-list-actions">
        <Skeleton variant="rectangular" width={150} height={36} />
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    </div>
    <div className="skeleton-class-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-class-card">
          <Skeleton variant="text" width="70%" height={18} />
          <Skeleton variant="text" width="50%" height={14} />
          <div className="skeleton-class-info">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonEquipment: React.FC = () => (
  <div className="skeleton-equipment">
    <div className="skeleton-list-header">
      <Skeleton variant="text" width={200} height={24} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </div>
    <div className="skeleton-equipment-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-equipment-card">
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonFinance: React.FC = () => (
  <div className="skeleton-finance">
    <div className="skeleton-kpi-strip">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonKPICard key={i} />
      ))}
    </div>
    <div className="skeleton-finance-charts">
      <SkeletonChart height={300} />
      <SkeletonChart height={300} />
    </div>
    <SkeletonTable rows={10} cols={5} />
  </div>
);

export const SkeletonSession: React.FC = () => (
  <div className="skeleton-session">
    <div className="skeleton-list-header">
      <Skeleton variant="text" width={200} height={24} />
      <Skeleton variant="rectangular" width={150} height={36} />
    </div>
    <SkeletonTable rows={6} cols={5} />
  </div>
);

export default Skeleton;