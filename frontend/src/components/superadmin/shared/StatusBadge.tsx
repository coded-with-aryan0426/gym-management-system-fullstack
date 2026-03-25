import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Clock, Zap } from 'lucide-react';
import './StatusBadge.css';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'active' | 'inactive' | 'neutral';

export interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'outline' | 'subtle';
    showIcon?: boolean;
    className?: string;
}

const iconMap: Record<StatusType, React.ComponentType<{ size?: number }>> = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
    pending: Clock,
    active: Zap,
    inactive: XCircle,
    neutral: Info,
};

const labelMap: Record<StatusType, string> = {
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    info: 'Info',
    pending: 'Pending',
    active: 'Active',
    inactive: 'Inactive',
    neutral: 'Neutral',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    label,
    size = 'md',
    variant = 'subtle',
    showIcon = true,
    className = ''
}) => {
    const Icon = iconMap[status];
    const displayLabel = label || labelMap[status];
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

    return (
        <div className={`status-badge status-badge--${status} status-badge--${size} status-badge--${variant} ${className}`}>
            {showIcon && <Icon size={iconSize} className="status-badge__icon" />}
            <span className="status-badge__label">{displayLabel}</span>
        </div>
    );
};

export default StatusBadge;
