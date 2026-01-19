import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color: string;
    delay?: number;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    color,
    delay = 0
}) => {
    return (
        <motion.div
            className="stat-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="stat-card__content">
                <div className="stat-card__header">
                    <span className="stat-card__title">{title}</span>
                    <div className="stat-card__icon-wrapper" style={{ backgroundColor: `${color}20`, color: color }}>
                        <Icon size={20} />
                    </div>
                </div>
                <div className="stat-card__body">
                    <h3 className="stat-card__value">{value}</h3>
                    {trend && (
                        <div className={`stat-card__trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </div>
                    )}
                </div>
            </div>
            {/* Background decoration */}
            <div className="stat-card__bg-icon" style={{ color: color }}>
                <Icon size={100} />
            </div>
        </motion.div>
    );
};

export default DashboardStatCard;
