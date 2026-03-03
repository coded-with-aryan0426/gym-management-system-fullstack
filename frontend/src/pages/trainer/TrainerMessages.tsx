import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, FileText, CalendarPlus, ChevronDown, X } from 'lucide-react';
import ChatLayout from '../../components/chat/ChatLayout';
import { useChat } from '../../contexts/ChatContext';
import './TrainerMessages.css';

/* ── Quick action definitions ────────────────────────────────── */
const QUICK_ACTIONS = [
    {
        id: 'workout',
        label: 'Share Workout Plan',
        icon: Dumbbell,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        description: 'Send a custom workout plan to this member',
        navPath: '/trainer/members',
    },
    {
        id: 'notes',
        label: 'Share Notes',
        icon: FileText,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.12)',
        border: 'rgba(99,102,241,0.25)',
        description: 'Share a progress note from your records',
        navPath: '/trainer/progress-notes',
    },
    {
        id: 'session',
        label: 'Book Session',
        icon: CalendarPlus,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.25)',
        description: 'Schedule a training session with this member',
        navPath: '/trainer/schedule',
    },
];

/* ── Trainer action bar ──────────────────────────────────────── */
const TrainerActionBar: React.FC = () => {
    const navigate = useNavigate();
    const { activeConversation } = useChat();
    const [expanded, setExpanded] = useState(false);

    if (!activeConversation) return null;

    return (
        <div className={`tm-action-bar ${expanded ? 'tm-action-bar--open' : ''}`}>
            {/* Collapsed pill trigger */}
            {!expanded && (
                <button
                    className="tm-action-bar__toggle"
                    onClick={() => setExpanded(true)}
                    title="Quick trainer actions"
                >
                    <Dumbbell size={14} />
                    <span>Trainer Actions</span>
                    <ChevronDown size={13} />
                </button>
            )}

            {/* Expanded action tray */}
            {expanded && (
                <div className="tm-action-bar__tray">
                    <div className="tm-action-bar__tray-header">
                        <span className="tm-action-bar__tray-title">Quick Actions</span>
                        <button className="tm-action-bar__close" onClick={() => setExpanded(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="tm-action-bar__actions">
                        {QUICK_ACTIONS.map(action => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    className="tm-action-btn"
                                    style={{
                                        '--action-color': action.color,
                                        '--action-bg': action.bg,
                                        '--action-border': action.border,
                                    } as React.CSSProperties}
                                    onClick={() => {
                                        setExpanded(false);
                                        navigate(action.navPath);
                                    }}
                                >
                                    <div className="tm-action-btn__icon">
                                        <Icon size={16} />
                                    </div>
                                    <div className="tm-action-btn__body">
                                        <span className="tm-action-btn__label">{action.label}</span>
                                        <span className="tm-action-btn__desc">{action.description}</span>
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

/* ── Page ────────────────────────────────────────────────────── */
const TrainerMessages: React.FC = () => {
    return (
        <div className="tm-wrapper">
            <ChatLayout />
            <TrainerActionBar />
        </div>
    );
};

export default TrainerMessages;
