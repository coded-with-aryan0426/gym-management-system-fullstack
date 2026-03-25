import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ActionPanel.css';

export interface ActionButton {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
    loading?: boolean;
    tooltip?: string;
}

export interface ActionPanelProps {
    actions: ActionButton[];
    layout?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
    actions,
    layout = 'horizontal',
    size = 'md',
    className = ''
}) => {
    return (
        <div className={`action-panel action-panel--${layout} action-panel--${size} ${className}`}>
            {actions.map((action, idx) => {
                const Icon = action.icon;
                return (
                    <button
                        key={idx}
                        className={`action-panel__button action-panel__button--${action.variant || 'secondary'}`}
                        onClick={action.onClick}
                        disabled={action.disabled || action.loading}
                        title={action.tooltip}
                        type="button"
                    >
                        {Icon && !action.loading && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />}
                        {action.loading && <div className="action-panel__spinner" />}
                        <span>{action.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ActionPanel;
