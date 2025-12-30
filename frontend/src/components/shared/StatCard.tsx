import React from 'react';
import './SharedComponents.css';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
        label?: string; // e.g. "vs last week"
    };
    color?: 'crimson' | 'emerald' | 'amber' | 'ocean';
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    trend,
    color = 'crimson',
    onClick
}) => {
    return (
        <div
            className="stat-card"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="stat-card__header">
                <div className={`stat-card__icon stat-card__icon--${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`stat-card__trend stat-card__trend--${trend.isPositive ? 'up' : 'down'}`}>
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div className="stat-card__content">
                <div className="stat-card__value">{value}</div>
                <div className="stat-card__label">
                    {label}
                    {trend?.label && <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: '4px' }}>{trend.label}</span>}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
