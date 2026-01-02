import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    trend?: { value: string; up: boolean };
    badge?: { text: string; isNew?: boolean };
    onClick?: () => void;
    animate?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
    icon, 
    value, 
    label, 
    trend, 
    badge,
    onClick,
    animate = true 
}) => {
    const [displayValue, setDisplayValue] = React.useState<number | string>(typeof value === 'number' ? 0 : value);

    React.useEffect(() => {
        if (typeof value !== 'number' || !animate) {
            setDisplayValue(value);
            return;
        }

        let start = 0;
        const duration = 1000;
        const increment = value / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, animate]);

    return (
        <motion.div 
            className="unified-card unified-card--sm unified-stat"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <motion.div 
                className="unified-stat__icon"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
            >
                {icon}
            </motion.div>
            <div className="unified-stat__value">{displayValue}</div>
            <div className="unified-stat__label">{label}</div>
            {trend && (
                <div className={`unified-stat__trend unified-stat__trend--${trend.up ? 'up' : 'down'}`}>
                    {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {trend.value}
                </div>
            )}
            {badge && (
                <div className={`unified-badge ${badge.isNew ? 'unified-badge--accent' : 'unified-badge--success'}`}>
                    {badge.text}
                </div>
            )}
        </motion.div>
    );
};

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
    children, 
    className = '', 
    size = 'md',
    interactive = false,
    onClick 
}) => {
    return (
        <motion.div 
            className={`unified-card unified-card--${size} ${interactive ? 'unified-card--interactive' : ''} ${className}`}
            whileHover={interactive ? { scale: 1.01, y: -2 } : {}}
            whileTap={interactive ? { scale: 0.99 } : {}}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    linkText?: string;
    onLinkClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
    title, 
    icon, 
    linkText, 
    onLinkClick 
}) => {
    return (
        <div className="unified-section-header">
            <h2 className="unified-section-title">
                {icon}
                {title}
            </h2>
            {linkText && (
                <motion.button 
                    className="unified-section-link" 
                    onClick={onLinkClick}
                    whileHover={{ x: 4 }}
                >
                    {linkText}
                </motion.button>
            )}
        </div>
    );
};

interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    src?: string;
    showStatus?: boolean;
    statusColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
    name, 
    size = 'md', 
    src,
    showStatus = false,
    statusColor = '#34C759'
}) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <motion.div 
            className={`unified-avatar unified-avatar--${size}`}
            whileHover={{ scale: 1.05 }}
            style={{ position: 'relative' }}
        >
            {src ? (
                <img src={src} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
                initials
            )}
            {showStatus && (
                <motion.span
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: size === 'xl' ? 16 : size === 'lg' ? 14 : 10,
                        height: size === 'xl' ? 16 : size === 'lg' ? 14 : 10,
                        borderRadius: '50%',
                        background: statusColor,
                        border: '2px solid var(--bg-primary)'
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
};

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'accent' | 'success' | 'warning' | 'error' | 'info';
    icon?: React.ReactNode;
    pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
    children, 
    variant = 'accent', 
    icon,
    pulse = false 
}) => {
    return (
        <motion.span 
            className={`unified-badge unified-badge--${variant}`}
            animate={pulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
        >
            {icon}
            {children}
        </motion.span>
    );
};

interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
    value, 
    max = 100, 
    showLabel = false,
    size = 'md',
    animated = true
}) => {
    const percentage = Math.min((value / max) * 100, 100);
    const heights = { sm: 4, md: 8, lg: 12 };

    return (
        <div style={{ width: '100%' }}>
            <div className="unified-progress" style={{ height: heights[size] }}>
                <motion.div 
                    className="unified-progress__fill"
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
            {showLabel && (
                <span style={{ 
                    fontSize: 12, 
                    color: 'var(--text-tertiary)', 
                    marginTop: 4, 
                    display: 'block' 
                }}>
                    {percentage.toFixed(0)}%
                </span>
            )}
        </div>
    );
};

interface ListItemProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    rightContent?: React.ReactNode;
    onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({ 
    icon, 
    title, 
    subtitle, 
    rightContent,
    onClick 
}) => {
    return (
        <motion.div 
            className="unified-list-item"
            onClick={onClick}
            whileHover={{ x: 4, background: 'var(--bg-glass-hover)' }}
        >
            {icon && <div className="unified-list-item__icon">{icon}</div>}
            <div className="unified-list-item__content">
                <div className="unified-list-item__title">{title}</div>
                {subtitle && <div className="unified-list-item__subtitle">{subtitle}</div>}
            </div>
            {rightContent}
        </motion.div>
    );
};

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
    icon, 
    title, 
    description,
    action 
}) => {
    return (
        <div className="unified-empty">
            <motion.div 
                className="unified-empty__icon"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                {icon}
            </motion.div>
            <h3 className="unified-empty__title">{title}</h3>
            {description && <p className="unified-empty__text">{description}</p>}
            {action && <div style={{ marginTop: 16 }}>{action}</div>}
        </div>
    );
};

interface RoleIndicatorProps {
    role: 'admin' | 'trainer' | 'member';
}

const roleLabels = {
    admin: 'Admin Portal',
    trainer: 'Trainer Portal', 
    member: 'Member Portal'
};

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({ role }) => {
    return (
        <div className="unified-role-indicator">
            <span className="unified-role-indicator__dot" />
            {roleLabels[role]}
        </div>
    );
};

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md',
    icon,
    onClick,
    disabled = false,
    loading = false,
    type = 'button'
}) => {
    return (
        <motion.button 
            className={`unified-btn unified-btn--${variant} unified-btn--${size}`}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {loading ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
            ) : icon}
            {children}
        </motion.button>
    );
};
