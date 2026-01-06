import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
}) => {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`skeleton skeleton--${variant} ${className}`}
            style={style}
        />
    );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 1 }) => (
    <div className="skeleton-text">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" />
        ))}
    </div>
);

export const SkeletonCard: React.FC = () => (
    <div className="skeleton-card">
        <Skeleton variant="rectangular" height={120} />
        <div className="skeleton-card__body">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
        </div>
    </div>
);

export const SkeletonTableRow: React.FC = () => (
    <div className="skeleton-table-row">
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="10%" />
        <Skeleton variant="text" width="15%" />
    </div>
);

export const SkeletonMetricCard: React.FC = () => (
    <div className="skeleton-metric-card">
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="text" width="70%" height={32} />
        <Skeleton variant="text" width="40%" height={12} />
    </div>
);

export default Skeleton;
