import React from 'react';

interface AlertCardProps {
    type: 'expiring' | 'overdue' | 'attendance' | 'system' | 'info';
    title: string;
    count?: number;
    message?: string;
    severity: 'info' | 'warning' | 'danger';
    actionLabel?: string;
    onAction?: () => void;
}

const severityColors = {
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#93C5FD', icon: 'ℹ️' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#FCD34D', icon: '⚠️' },
    danger: { bg: 'rgba(220, 38, 38, 0.1)', border: '#DC2626', text: '#FCA5A5', icon: '🚨' }
};

const typeIcons: Record<string, string> = {
    expiring: '📅',
    overdue: '💰',
    attendance: '📉',
    system: '⚙️',
    info: 'ℹ️'
};

export const AlertCard: React.FC<AlertCardProps> = ({
    type,
    title,
    count,
    message,
    severity,
    actionLabel,
    onAction
}) => {
    const colors = severityColors[severity];
    const icon = typeIcons[type] || colors.icon;

    return (
        <div style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s ease',
            cursor: onAction ? 'pointer' : 'default'
        }}
            onClick={onAction}
        >
            <div style={{
                fontSize: 24,
                lineHeight: 1
            }}>
                {icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <span style={{
                        fontWeight: 600,
                        color: '#F9FAFB',
                        fontSize: 14
                    }}>
                        {title}
                    </span>
                    {count !== undefined && count > 0 && (
                        <span style={{
                            background: colors.border,
                            color: '#0D0D0D',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700
                        }}>
                            {count}
                        </span>
                    )}
                </div>
                {message && (
                    <p style={{
                        margin: '4px 0 0',
                        fontSize: 12,
                        color: 'rgba(249, 250, 251, 0.6)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {message}
                    </p>
                )}
            </div>

            {actionLabel && onAction && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction();
                    }}
                    style={{
                        background: colors.border,
                        color: '#0D0D0D',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default AlertCard;
