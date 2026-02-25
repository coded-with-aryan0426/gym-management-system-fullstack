import React from 'react';
import './Badge.css';

type BadgeVariant = 'active' | 'pending' | 'expired' | 'on-leave' | 'info' | 'default';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    children,
    className = ''
}) => {
    return (
        <span className={`badge badge--${variant} ${className}`}>
            {children}
        </span>
    );
};

// Helper to convert status string to badge variant
export const getStatusVariant = (status: string): BadgeVariant => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'active';
    if (statusLower === 'pending') return 'pending';
    if (statusLower === 'expired' || statusLower === 'inactive' || statusLower === 'left') return 'expired';
    if (statusLower === 'on leave' || statusLower === 'on-leave') return 'on-leave';
    return 'default';
};

export default Badge;
