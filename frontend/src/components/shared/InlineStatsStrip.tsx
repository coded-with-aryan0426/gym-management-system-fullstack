import React from 'react'
import './InlineStatsStrip.css'

export interface InlineStat {
    label: string
    value: string | number
    icon?: React.ReactNode
    color?: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'cyan' | 'slate'
    live?: number
    progress?: number
    tooltip?: string
}

interface InlineStatsStripProps {
    stats: InlineStat[]
    className?: string
    compact?: boolean
}

export const InlineStatsStrip: React.FC<InlineStatsStripProps> = ({ 
    stats, 
    className = '',
    compact = false 
}) => {
    if (!stats || stats.length === 0) return null

    return (
        <div className={`inline-stats-strip ${compact ? 'inline-stats-strip--compact' : ''} ${className}`}>
            {stats.map((stat, index) => (
                <div 
                    key={index} 
                    className={`inline-stat inline-stat--${stat.color || 'blue'}`}
                    title={stat.tooltip}
                >
                    {stat.icon && <span className="inline-stat__icon">{stat.icon}</span>}
                    <span className="inline-stat__value">{stat.value}</span>
                    <span className="inline-stat__label">{stat.label}</span>
                    {stat.live !== undefined && stat.live > 0 && (
                        <span className="inline-stat__live">
                            <span className="live-pulse"></span>
                            {stat.live} live
                        </span>
                    )}
                    {stat.progress !== undefined && (
                        <div className="inline-stat__progress">
                            <div 
                                className="inline-stat__progress-fill" 
                                style={{ width: `${Math.min(stat.progress, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default InlineStatsStrip
