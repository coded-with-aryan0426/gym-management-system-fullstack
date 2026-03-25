import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ChartCard.css';

export interface ChartCardProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    actions?: React.ReactNode;
    variant?: 'default' | 'compact';
    height?: string | number;
    loading?: boolean;
    error?: string;
    className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    children,
    actions,
    variant = 'default',
    height,
    loading = false,
    error,
    className = ''
}) => {
    return (
        <div className={`chart-card chart-card--${variant} ${className}`}>
            <div className="chart-card__header">
                <div className="chart-card__title-section">
                    {Icon && (
                        <div className="chart-card__icon">
                            <Icon size={16} />
                        </div>
                    )}
                    <div>
                        <h3 className="chart-card__title">{title}</h3>
                        {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
                    </div>
                </div>
                {actions && (
                    <div className="chart-card__actions">
                        {actions}
                    </div>
                )}
            </div>

            <div 
                className="chart-card__content"
                style={{ 
                    height: height === 'auto' ? 'auto' : (height || (variant === 'compact' ? '200px' : '300px')),
                    minHeight: height === 'auto' ? '200px' : undefined
                }}
            >
                {loading ? (
                    <div className="chart-card__loading">
                        <div className="chart-card__spinner" />
                        <span>Loading chart data...</span>
                    </div>
                ) : error ? (
                    <div className="chart-card__error">
                        <span>⚠️ {error}</span>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default ChartCard;
