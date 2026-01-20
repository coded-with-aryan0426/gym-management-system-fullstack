import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '../../pages/Dashboard/Dashboard.css'; // Ensure styles are loaded

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    subValue?: string;
    capacity?: {
        current: number;
        max: number;
    };
    delay?: number;
    onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    subValue, 
    capacity,
    delay = 0,
    onClick
}) => {
    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const getCapacityClass = (current: number, max: number) => {
        const pct = (current / max) * 100;
        if (pct > 80) return 'urgent';
        if (pct > 60) return 'warning';
        return '';
    };

    return (
        <motion.div 
            className="dash-stat-card" 
            variants={itemVariants}
            transition={{ delay }}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="dash-stat-card__header">
                <Icon size={16} className="dash-stat-card__icon" />
                <span>{title}</span>
            </div>
            
            <div className="dash-stat-card__value">{value}</div>
            
            {capacity && (
                <div className="capacity-bar">
                    <div
                        className={`capacity-bar__fill ${getCapacityClass(capacity.current, capacity.max)}`}
                        style={{ width: `${(capacity.current / capacity.max) * 100}%` }}
                    />
                </div>
            )}

            {trend && (
                <div className={`dash-stat-card__change ${trend.isPositive ? 'positive' : 'negative'}`}>
                    {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 
                    {trend.value}% {trend.label}
                </div>
            )}

            {subValue && <div className="dash-stat-card__sub">{subValue}</div>}
        </motion.div>
    );
};

export default StatsCard;
