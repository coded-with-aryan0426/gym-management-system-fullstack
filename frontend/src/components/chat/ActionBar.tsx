import React, { useState } from 'react';
import { ChevronDown, X, LucideIcon } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import '../../styles/ChatActionBar.css';

export interface ActionItem {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
    description: string;
}

interface ActionBarProps {
    /** Icon shown in the collapsed pill */
    triggerIcon: LucideIcon;
    /** Label shown in the collapsed pill */
    triggerLabel: string;
    /** List of actions to render in the expanded tray */
    actions: ActionItem[];
    /** Called when the user clicks an action button */
    onAction: (id: string) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
    triggerIcon: TriggerIcon,
    triggerLabel,
    actions,
    onAction,
}) => {
    const { activeConversation } = useChat();
    const [expanded, setExpanded] = useState(false);

    if (!activeConversation) return null;

    return (
        <div className={`cab ${expanded ? 'cab--open' : ''}`}>
            {!expanded && (
                <button
                    className="cab__toggle"
                    onClick={() => setExpanded(true)}
                    title={triggerLabel}
                >
                    <TriggerIcon size={14} />
                    <span>{triggerLabel}</span>
                    <ChevronDown size={13} />
                </button>
            )}

            {expanded && (
                <div className="cab__tray">
                    <div className="cab__tray-header">
                        <span className="cab__tray-title">Quick Actions</span>
                        <button className="cab__close" onClick={() => setExpanded(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="cab__actions">
                        {actions.map(action => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    className="cab__btn"
                                    style={{
                                        '--cab-color': action.color,
                                        '--cab-bg': action.bg,
                                        '--cab-border': action.border,
                                    } as React.CSSProperties}
                                    onClick={() => {
                                        setExpanded(false);
                                        onAction(action.id);
                                    }}
                                >
                                    <div className="cab__btn-icon">
                                        <Icon size={16} />
                                    </div>
                                    <div className="cab__btn-body">
                                        <span className="cab__btn-label">{action.label}</span>
                                        <span className="cab__btn-desc">{action.description}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionBar;
