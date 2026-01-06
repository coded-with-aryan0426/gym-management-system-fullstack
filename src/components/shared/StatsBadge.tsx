import React from 'react'

interface StatsBadgeProps {
    total: number
    active: number
    inactive?: number
    className?: string
}

/**
 * Stats badge showing Total / Active / Inactive counts
 * Used consistently across directory pages
 */
export const StatsBadge: React.FC<StatsBadgeProps> = ({
    total,
    active,
    inactive,
    className = ''
}) => {
    return (
        <div className={`stats-badge ${className}`}>
            <span className="stats-badge__pill">
                <strong>{total}</strong> Total
            </span>
            <span className="stats-badge__divider" />
            <span className="stats-badge__pill stats-badge__pill--active">
                <strong>{active}</strong> Active
            </span>
            {inactive !== undefined && inactive > 0 && (
                <>
                    <span className="stats-badge__divider" />
                    <span className="stats-badge__pill stats-badge__pill--inactive">
                        <strong>{inactive}</strong> Inactive
                    </span>
                </>
            )}
        </div>
    )
}

export default StatsBadge
