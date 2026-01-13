import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    Send, Paperclip, Smile,
    Phone, Video, User as UserIcon, Calendar, BarChart2,
    MessageCircle, CheckCheck, MoreVertical, ShieldOff, Shield, AlertCircle
} from 'lucide-react';

interface ChatWindowProps {
    onToggleContactPanel?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onToggleContactPanel }) => {
    const { activeConversation, messages, sendMessage, connected, blockUser, isUserBlocked } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeConversation) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    // Get the other participant for header display
    const getOtherParticipant = () => {
        if (!activeConversation) return null;
        if (activeConversation.type === 'GROUP') {
            return {
                userId: null,
                name: activeConversation.title || 'Group Chat',
                initials: 'G',
                role: null
            };
        }
        const other = activeConversation.participants?.find(
            (p: any) => Number(p.userId) !== Number(user?.id)
        ) || activeConversation.participants?.[0];

        return {
            userId: other?.userId,
            name: other?.fullName || 'Unknown',
            initials: getInitials(other?.fullName),
            role: other?.role
        };
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatMessageTime = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateDivider = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const handleBlockUser = async () => {
        const other = getOtherParticipant();
        if (!other?.userId) return;

        setBlocking(true);
        try {
            await blockUser(other.userId);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to block user:', error);
        } finally {
            setBlocking(false);
        }
    };

    // Empty state
    if (!activeConversation) {
        return (
            <div className="chat-window">
                <div className="chat-window__empty">
                    <div className="chat-window__empty-icon">
                        <MessageCircle size={36} />
                    </div>
                    <h3 className="chat-window__empty-title">Select a conversation</h3>
                    <p className="chat-window__empty-subtitle">
                        Choose from your existing conversations or start a new chat
                    </p>
                </div>
            </div>
        );
    }

    const otherParticipant = getOtherParticipant();
    const isBlocked = otherParticipant?.userId ? isUserBlocked(otherParticipant.userId) : false;

    // Group messages by date - messages are already in chronological order from context
    const groupedMessages = messages.reduce((groups: any[], msg, index, arr) => {
        const msgDate = new Date(msg.createdAt).toDateString();
        const prevMsgDate = index > 0 ? new Date(arr[index - 1].createdAt).toDateString() : null;

        if (msgDate !== prevMsgDate) {
            groups.push({ type: 'date', date: msg.createdAt });
        }
        groups.push({ type: 'message', ...msg });
        return groups;
    }, []);

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header__user">
                    <div className="chat-header__avatar">
                        {otherParticipant?.initials}
                    </div>
                    <div className="chat-header__info">
                        <h3 className="chat-header__name">{otherParticipant?.name}</h3>
                        <div className="chat-header__status">
                            <span className={`chat-header__status-dot ${connected ? 'chat-header__status-dot--online' : 'chat-header__status-dot--offline'}`} />
                            <span>{connected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                <div className="chat-header__actions">
                    {/* Book Session Button */}
                    <button className="chat-header__action-btn chat-header__action-btn--primary" title="Book Session">
                        <Calendar size={18} />
                    </button>

                    {/* Voice Call - Coming Soon */}
                    <button className="chat-header__action-btn" title="Voice Call (Coming Soon)" disabled style={{ opacity: 0.5 }}>
                        <Phone size={18} />
                    </button>

                    {/* Video Call - Coming Soon */}
                    <button className="chat-header__action-btn" title="Video Call (Coming Soon)" disabled style={{ opacity: 0.5 }}>
                        <Video size={18} />
                    </button>

                    {/* Contact Info Toggle */}
                    <button
                        className="chat-header__action-btn"
                        onClick={onToggleContactPanel}
                        title="Contact Info"
                    >
                        <UserIcon size={18} />
                    </button>

                    {/* More Options Dropdown */}
                    {activeConversation.type === 'PRIVATE' && (
                        <div className="chat-header__dropdown" ref={menuRef}>
                            <button
                                className="chat-header__action-btn"
                                onClick={() => setShowMenu(!showMenu)}
                                title="More Options"
                            >
                                <MoreVertical size={18} />
                            </button>
                            {showMenu && (
                                <div className="chat-header__dropdown-menu">
                                    <button
                                        className="chat-header__dropdown-item chat-header__dropdown-item--danger"
                                        onClick={handleBlockUser}
                                        disabled={blocking || isBlocked}
                                    >
                                        {isBlocked ? (
                                            <>
                                                <ShieldOff size={16} />
                                                <span>User Blocked</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={16} />
                                                <span>{blocking ? 'Blocking...' : 'Block User'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Blocked Warning */}
            {isBlocked && (
                <div className="chat-window__blocked-banner">
                    <AlertCircle size={16} />
                    <span>You have blocked this user. Unblock them to continue messaging.</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="chat-messages">
                {groupedMessages.map((item, index) => {
                    if (item.type === 'date') {
                        return (
                            <div key={`date-${index}`} className="chat-messages__date-divider">
                                <span className="chat-messages__date-label">
                                    {formatDateDivider(item.date)}
                                </span>
                            </div>
                        );
                    }

                    const isMyMessage = item.senderId === Number(user?.id);

                    return (
                        <div
                            key={item.messageId || index}
                            className={`message-bubble ${isMyMessage ? 'message-bubble--sent' : 'message-bubble--received'}`}
                        >
                            <div className="message-bubble__content">
                                {/* Workout Plan Card - if content type is WORKOUT_PLAN */}
                                {item.contentType === 'WORKOUT_PLAN' && item.payload ? (
                                    <WorkoutPlanCard payload={JSON.parse(item.payload)} />
                                ) : (
                                    <p className="message-bubble__text">{item.content}</p>
                                )}

                                <div className="message-bubble__meta">
                                    <span className="message-bubble__time">
                                        {formatMessageTime(item.createdAt)}
                                    </span>
                                    {isMyMessage && (
                                        <span className="message-bubble__status">
                                            <CheckCheck size={14} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input">
                <form onSubmit={handleSend} className="chat-input__form">
                    <button type="button" className="chat-input__attachment-btn" title="Attach file" disabled={isBlocked}>
                        <Paperclip size={22} />
                    </button>

                    <div className="chat-input__field-wrapper">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isBlocked ? "You have blocked this user" : "Type a message..."}
                            className="chat-input__field"
                            disabled={isBlocked}
                        />
                        <button type="button" className="chat-input__emoji-btn" title="Emoji" disabled={isBlocked}>
                            <Smile size={20} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !connected || isBlocked}
                        className="chat-input__send-btn"
                        title="Send message"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

// Workout Plan Card Component (embedded in messages)
const WorkoutPlanCard: React.FC<{ payload: any }> = ({ payload }) => {
    return (
        <div className="workout-plan-card">
            <div className="workout-plan-card__header">
                <div className="workout-plan-card__icon">
                    <BarChart2 size={14} />
                </div>
                <span className="workout-plan-card__type">Workout Plan</span>
            </div>
            <h4 className="workout-plan-card__title">
                {payload.title || 'Training Session'}
            </h4>
            <div className="workout-plan-card__meta">
                <span className="workout-plan-card__meta-item">
                    ⏱️ {payload.duration || '50'} min
                </span>
                <span className="workout-plan-card__meta-item">
                    💪 {payload.exercises || '8'} exercises
                </span>
                <span className="workout-plan-card__meta-item">
                    ⬆️ {payload.difficulty || 'Intermediate'}
                </span>
            </div>
            <div className="workout-plan-card__actions">
                <button className="workout-plan-card__btn workout-plan-card__btn--primary">
                    View Plan
                </button>
                <button className="workout-plan-card__btn workout-plan-card__btn--secondary">
                    ↓ Save
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
