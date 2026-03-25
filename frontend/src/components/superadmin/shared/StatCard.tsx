import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './StatCard.css';

export interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon?: LucideIcon;
    color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'emerald';
    variant?: 'compact' | 'expanded' | 'minimal';
    breakdown?: Array<{ label: string; value: string; pct?: number }>;
    onClick?: () => void;
    loading?: boolean;
    trend?: 'up' | 'down' | 'neutral';
}

const colorMap = {
    blue: { bg: 'var(--active-blue-bg)', border: 'var(--active-blue-border)', text: 'var(--accent-blue)' },
    green: { bg: 'var(--active-green-bg)', border: 'var(--active-green-border)', text: 'var(--accent-green)' },
    red: { bg: 'var(--active-red-bg)', border: 'var(--active-red-border)', text: 'var(--accent-red)' },
    purple: { bg: 'rgba(191, 111, 239, 0.18)', border: 'rgba(191, 111, 239, 0.55)', text: 'var(--accent-purple)' },
    orange: { bg: 'var(--active-orange-bg)', border: 'var(--active-orange-border)', text: 'var(--accent-orange)' },
    teal: { bg: 'rgba(90, 200, 250, 0.18)', border: 'rgba(90, 200, 250, 0.55)', text: 'var(--accent-teal)' },
    emerald: { bg: 'var(--active-green-bg)', border: 'var(--active-green-border)', text: 'var(--accent-green)' },
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    icon: Icon,
    color = 'blue',
    variant = 'compact',
    breakdown,
    onClick,
    loading = false,
    trend
}) => {
    const [expanded, setExpanded] = useState(false);
    const colors = colorMap[color] || colorMap.blue; // Fallback to blue if color not found
    const hasBreakdown = breakdown && breakdown.length > 0;
    const isClickable = onClick || hasBreakdown;

    const handleClick = () => {
        if (hasBreakdown) {
            setExpanded(!expanded);
        }
        if (onClick) {
            onClick();
        }
    };

    // Determine trend from change if not explicitly provided
    const effectiveTrend = trend || (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);

    const renderTrendIcon = () => {
        if (effectiveTrend === 'up') return <TrendingUp size={12} />;
        if (effectiveTrend === 'down') return <TrendingDown size={12} />;
        if (effectiveTrend === 'neutral') return <Minus size={12} />;
        return null;
    };

    if (variant === 'minimal') {
        return (
            <div className="stat-card stat-card--minimal" onClick={isClickable ? handleClick : undefined}>
                <div className="stat-card__label-minimal">{label}</div>
                <div className="stat-card__value-minimal">{loading ? '...' : value}</div>
                {change !== undefined && (
                    <div className={`stat-card__change stat-card__change--${effectiveTrend}`}>
                        {renderTrendIcon()}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <motion.div
            className={`stat-card stat-card--${variant} ${isClickable ? 'stat-card--clickable' : ''} ${expanded ? 'stat-card--expanded' : ''}`}
            onClick={isClickable ? handleClick : undefined}
            whileHover={isClickable ? { scale: 1.02 } : undefined}
            transition={{ duration: 0.2 }}
        >
            <div className="stat-card__header">
                {Icon && (
                    <div className="stat-card__icon" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                        <Icon size={variant === 'compact' ? 16 : 20} style={{ color: colors.text }} strokeWidth={2} />
                    </div>
                )}
                <div className="stat-card__content">
                    <div className="stat-card__label">{label}</div>
                    <div className="stat-card__value" style={{ color: colors.text }}>
                        {loading ? (
                            <div className="stat-card__skeleton" />
                        ) : (
                            value
                        )}
                    </div>
                </div>
            </div>

            {change !== undefined && !loading && (
                <div className={`stat-card__change stat-card__change--${effectiveTrend}`}>
                    {renderTrendIcon()}
                    <span>{change > 0 ? '+' : ''}{change}%</span>
                    <span className="stat-card__change-label">vs last period</span>
                </div>
            )}

            <AnimatePresence>
                {expanded && hasBreakdown && (
                    <motion.div
                        className="stat-card__breakdown"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="stat-card__breakdown-item">
                                <span className="stat-card__breakdown-label">{item.label}</span>
                                <span className="stat-card__breakdown-value">{item.value}</span>
                                {item.pct !== undefined && (
                                    <span className="stat-card__breakdown-pct">{item.pct}%</span>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StatCard;
