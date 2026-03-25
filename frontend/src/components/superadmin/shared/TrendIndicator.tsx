import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './TrendIndicator.css';

export interface TrendIndicatorProps {
    value: number;
    direction?: 'up' | 'down' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showSign?: boolean;
    suffix?: string;
    className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
    value,
    direction,
    size = 'md',
    showIcon = true,
    showSign = true,
    suffix = '%',
    className = ''
}) => {
    // Auto-detect direction if not provided
    const effectiveDirection = direction || (value > 0 ? 'up' : value < 0 ? 'down' : 'neutral');
    
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
    const absValue = Math.abs(value);

    const renderIcon = () => {
        if (!showIcon) return null;
        if (effectiveDirection === 'up') return <TrendingUp size={iconSize} />;
        if (effectiveDirection === 'down') return <TrendingDown size={iconSize} />;
        return <Minus size={iconSize} />;
    };

    return (
        <div className={`trend-indicator trend-indicator--${effectiveDirection} trend-indicator--${size} ${className}`}>
            {renderIcon()}
            <span className="trend-indicator__value">
                {showSign && value !== 0 && (value > 0 ? '+' : '')}
                {absValue}
                {suffix}
            </span>
        </div>
    );
};

export default TrendIndicator;
