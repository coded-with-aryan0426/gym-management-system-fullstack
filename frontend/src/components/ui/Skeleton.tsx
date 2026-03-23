import React from 'react';
import './Skeleton.css';

// ─── Base Skeleton Props ──────────────────────────────────────────────────────
interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    className?: string;
    animation?: 'shimmer' | 'pulse' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    animation = 'shimmer',
}) => {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
            style={style}
            role="presentation"
            aria-hidden="true"
        />
    );
};

// ─── Text Skeleton ────────────────────────────────────────────────────────────
interface SkeletonTextProps {
    lines?: number;
    widths?: (string | number)[];
    lineHeight?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ 
    lines = 1, 
    widths,
    lineHeight = 16 
}) => (
    <div className="skeleton-text" role="presentation" aria-label="Loading text">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
                key={i} 
                variant="text" 
                width={widths?.[i] || (i === lines - 1 ? '60%' : '100%')}
                height={lineHeight}
            />
        ))}
    </div>
);

// ─── Avatar Skeleton ──────────────────────────────────────────────────────────
interface SkeletonAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const avatarSizes = { sm: 32, md: 40, lg: 48, xl: 64 };

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ size = 'md' }) => (
    <Skeleton 
        variant="circular" 
        width={avatarSizes[size]} 
        height={avatarSizes[size]} 
    />
);

// ─── Card Skeleton ────────────────────────────────────────────────────────────
interface SkeletonCardProps {
    hasImage?: boolean;
    imageHeight?: number;
    lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
    hasImage = true, 
    imageHeight = 120,
    lines = 2 
}) => (
    <div className="skeleton-card" role="presentation" aria-label="Loading card">
        {hasImage && <Skeleton variant="rectangular" height={imageHeight} />}
        <div className="skeleton-card__body">
            <Skeleton variant="text" width="70%" height={18} />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} variant="text" width={i === lines - 1 ? '50%' : '90%'} height={14} />
            ))}
        </div>
    </div>
);

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
interface SkeletonTableRowProps {
    columns?: number;
    hasAvatar?: boolean;
    hasActions?: boolean;
}

export const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({ 
    columns = 4, 
    hasAvatar = true,
    hasActions = true 
}) => (
    <tr className="skeleton-table-row" role="presentation">
        {hasAvatar && (
            <td className="skeleton-table-cell">
                <div className="skeleton-user-cell">
                    <SkeletonAvatar size="sm" />
                    <div className="skeleton-user-info">
                        <Skeleton variant="text" width={120} height={14} />
                        <Skeleton variant="text" width={160} height={12} />
                    </div>
                </div>
            </td>
        )}
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="skeleton-table-cell">
                <Skeleton variant="text" width={`${60 + Math.random() * 40}%`} height={14} />
            </td>
        ))}
        {hasActions && (
            <td className="skeleton-table-cell">
                <div className="skeleton-actions">
                    <Skeleton variant="rectangular" width={32} height={32} />
                    <Skeleton variant="rectangular" width={32} height={32} />
                </div>
            </td>
        )}
    </tr>
);

// ─── Table Skeleton ───────────────────────────────────────────────────────────
interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    hasAvatar?: boolean;
    hasActions?: boolean;
    hasHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
    rows = 5, 
    columns = 4,
    hasAvatar = true,
    hasActions = true,
    hasHeader = true
}) => (
    <div className="skeleton-table-container" role="presentation" aria-label="Loading table">
        <table className="skeleton-table">
            {hasHeader && (
                <thead>
                    <tr>
                        {hasAvatar && <th><Skeleton variant="text" width={80} height={12} /></th>}
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}><Skeleton variant="text" width={60} height={12} /></th>
                        ))}
                        {hasActions && <th><Skeleton variant="text" width={50} height={12} /></th>}
                    </tr>
                </thead>
            )}
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <SkeletonTableRow 
                        key={i} 
                        columns={columns} 
                        hasAvatar={hasAvatar}
                        hasActions={hasActions}
                    />
                ))}
            </tbody>
        </table>
    </div>
);

// ─── Metric Card Skeleton ─────────────────────────────────────────────────────
interface SkeletonMetricCardProps {
    hasIcon?: boolean;
    hasTrend?: boolean;
}

export const SkeletonMetricCard: React.FC<SkeletonMetricCardProps> = ({ 
    hasIcon = true,
    hasTrend = true 
}) => (
    <div className="skeleton-metric-card" role="presentation" aria-label="Loading metric">
        <div className="skeleton-metric-card__top">
            <Skeleton variant="text" width="60%" height={14} />
            {hasIcon && <Skeleton variant="rectangular" width={40} height={40} className="skeleton-metric-icon" />}
        </div>
        <Skeleton variant="text" width="50%" height={36} />
        <div className="skeleton-metric-card__bottom">
            <Skeleton variant="text" width="40%" height={12} />
            {hasTrend && <Skeleton variant="text" width={50} height={16} />}
        </div>
    </div>
);

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
interface SkeletonChartProps {
    type?: 'bar' | 'line' | 'area' | 'pie';
    height?: number;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({ 
    type = 'bar',
    height = 260 
}) => (
    <div className="skeleton-chart" role="presentation" aria-label="Loading chart">
        <div className="skeleton-chart__header">
            <Skeleton variant="text" width={150} height={18} />
            <Skeleton variant="text" width={100} height={14} />
        </div>
        <div className="skeleton-chart__body" style={{ height }}>
            {type === 'bar' && (
                <div className="skeleton-chart__bars">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton 
                            key={i} 
                            variant="rectangular" 
                            width={24} 
                            height={`${30 + Math.random() * 60}%`}
                            className="skeleton-chart__bar"
                        />
                    ))}
                </div>
            )}
            {(type === 'line' || type === 'area') && (
                <div className="skeleton-chart__line">
                    <svg viewBox="0 0 400 200" className="skeleton-chart__svg">
                        <path
                            d="M0,150 C50,120 100,180 150,100 C200,20 250,140 300,80 C350,40 400,100 400,60"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="skeleton-chart__path"
                        />
                    </svg>
                </div>
            )}
            {type === 'pie' && (
                <div className="skeleton-chart__pie">
                    <Skeleton variant="circular" width={180} height={180} />
                </div>
            )}
        </div>
    </div>
);

// ─── Dashboard KPI Grid Skeleton ──────────────────────────────────────────────
interface SkeletonKPIGridProps {
    count?: number;
}

export const SkeletonKPIGrid: React.FC<SkeletonKPIGridProps> = ({ count = 4 }) => (
    <div className="skeleton-kpi-grid" role="presentation" aria-label="Loading metrics">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonMetricCard key={i} />
        ))}
    </div>
);

// ─── Member Card Skeleton ─────────────────────────────────────────────────────
export const SkeletonMemberCard: React.FC = () => (
    <div className="skeleton-member-card" role="presentation" aria-label="Loading member">
        <div className="skeleton-member-card__header">
            <SkeletonAvatar size="lg" />
            <div className="skeleton-member-card__info">
                <Skeleton variant="text" width={120} height={16} />
                <Skeleton variant="text" width={160} height={12} />
                <Skeleton variant="rectangular" width={60} height={20} className="skeleton-badge" />
            </div>
        </div>
        <div className="skeleton-member-card__stats">
            <div className="skeleton-stat">
                <Skeleton variant="text" width={40} height={20} />
                <Skeleton variant="text" width={60} height={12} />
            </div>
            <div className="skeleton-stat">
                <Skeleton variant="text" width={40} height={20} />
                <Skeleton variant="text" width={60} height={12} />
            </div>
        </div>
        <div className="skeleton-member-card__actions">
            <Skeleton variant="rectangular" width="48%" height={36} />
            <Skeleton variant="rectangular" width="48%" height={36} />
        </div>
    </div>
);

// ─── List Item Skeleton ───────────────────────────────────────────────────────
export const SkeletonListItem: React.FC = () => (
    <div className="skeleton-list-item" role="presentation">
        <SkeletonAvatar size="md" />
        <div className="skeleton-list-item__content">
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width="40%" height={12} />
        </div>
        <Skeleton variant="rectangular" width={24} height={24} />
    </div>
);

// ─── Page Header Skeleton ─────────────────────────────────────────────────────
export const SkeletonPageHeader: React.FC = () => (
    <div className="skeleton-page-header" role="presentation" aria-label="Loading page">
        <div className="skeleton-page-header__left">
            <Skeleton variant="rectangular" width={48} height={48} className="skeleton-icon-box" />
            <div>
                <Skeleton variant="text" width={200} height={24} />
                <Skeleton variant="text" width={280} height={14} />
            </div>
        </div>
        <div className="skeleton-page-header__actions">
            <Skeleton variant="rectangular" width={100} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
        </div>
    </div>
);

// ─── Profile Section Skeleton ─────────────────────────────────────────────────
export const SkeletonProfileSection: React.FC = () => (
    <div className="skeleton-profile-section" role="presentation" aria-label="Loading profile">
        <div className="skeleton-profile-section__header">
            <SkeletonAvatar size="xl" />
            <div className="skeleton-profile-section__info">
                <Skeleton variant="text" width={180} height={24} />
                <Skeleton variant="text" width={220} height={14} />
                <div className="skeleton-badges">
                    <Skeleton variant="rectangular" width={70} height={22} />
                    <Skeleton variant="rectangular" width={90} height={22} />
                </div>
            </div>
        </div>
        <div className="skeleton-profile-section__stats">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-profile-stat">
                    <Skeleton variant="text" width={60} height={28} />
                    <Skeleton variant="text" width={80} height={12} />
                </div>
            ))}
        </div>
    </div>
);

// ─── Full Page Skeleton ───────────────────────────────────────────────────────
interface SkeletonPageProps {
    hasHeader?: boolean;
    hasKPIs?: boolean;
    hasChart?: boolean;
    hasTable?: boolean;
    kpiCount?: number;
    tableRows?: number;
}

export const SkeletonPage: React.FC<SkeletonPageProps> = ({
    hasHeader = true,
    hasKPIs = true,
    hasChart = true,
    hasTable = true,
    kpiCount = 4,
    tableRows = 5
}) => (
    <div className="skeleton-page" role="presentation" aria-busy="true" aria-label="Loading page content">
        {hasHeader && <SkeletonPageHeader />}
        {hasKPIs && <SkeletonKPIGrid count={kpiCount} />}
        {hasChart && (
            <div className="skeleton-chart-section">
                <SkeletonChart type="bar" />
            </div>
        )}
        {hasTable && <SkeletonTable rows={tableRows} />}
    </div>
);

// ─── Heatmap Skeleton ─────────────────────────────────────────────────────────
export const SkeletonHeatmap: React.FC = () => (
    <div className="skeleton-heatmap" role="presentation" aria-label="Loading heatmap">
        <div className="skeleton-heatmap__header">
            <Skeleton variant="text" width={150} height={18} />
            <Skeleton variant="text" width={100} height={14} />
        </div>
        <div className="skeleton-heatmap__grid">
            {Array.from({ length: 7 }).map((_, row) => (
                <div key={row} className="skeleton-heatmap__row">
                    <Skeleton variant="text" width={30} height={14} />
                    {Array.from({ length: 19 }).map((_, col) => (
                        <Skeleton 
                            key={col} 
                            variant="rectangular" 
                            width={20} 
                            height={20} 
                            className="skeleton-heatmap__cell"
                        />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// ─── Form Skeleton ────────────────────────────────────────────────────────────
interface SkeletonFormProps {
    fields?: number;
    hasSubmit?: boolean;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({ 
    fields = 4, 
    hasSubmit = true 
}) => (
    <div className="skeleton-form" role="presentation" aria-label="Loading form">
        {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="skeleton-form__field">
                <Skeleton variant="text" width={100} height={14} />
                <Skeleton variant="rectangular" width="100%" height={44} />
            </div>
        ))}
        {hasSubmit && (
            <div className="skeleton-form__actions">
                <Skeleton variant="rectangular" width={120} height={44} />
            </div>
        )}
    </div>
);

// ─── Notification/Activity Skeleton ───────────────────────────────────────────
export const SkeletonActivityItem: React.FC = () => (
    <div className="skeleton-activity-item" role="presentation">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="skeleton-activity-item__content">
            <Skeleton variant="text" width="80%" height={14} />
            <Skeleton variant="text" width="50%" height={12} />
        </div>
        <Skeleton variant="text" width={60} height={12} />
    </div>
);

export const SkeletonActivityFeed: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="skeleton-activity-feed" role="presentation" aria-label="Loading activity">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonActivityItem key={i} />
        ))}
    </div>
);

export default Skeleton;
