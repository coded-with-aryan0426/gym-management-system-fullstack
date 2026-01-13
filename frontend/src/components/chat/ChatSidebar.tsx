import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, User, Users, MessageCircle } from 'lucide-react';
import NewChatModal from './NewChatModal';

interface FilterTab {
    id: string;
    label: string;
    role?: string;
}

const FILTER_TABS: FilterTab[] = [
    { id: 'all', label: 'All' },
    { id: 'trainers', label: 'Trainers', role: 'TRAINER' },
    { id: 'support', label: 'Support', role: 'SUPPORT' },
];

const ChatSidebar: React.FC = () => {
    const { conversations, activeConversation, setActiveConversation } = useChat();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showNewChatModal, setShowNewChatModal] = useState(false);

    // Get the other participant's info for private chats
    const getConversationDisplay = (conv: any) => {
        if (conv.type === 'GROUP') {
            return {
                name: conv.title || 'Group Chat',
                initials: conv.title?.[0] || 'G',
                role: null,
                isOnline: false
            };
        }

        // For private chat, find the other participant
        const otherParticipant = conv.participants?.find(
            (p: any) => Number(p.userId) !== Number(user?.id)
        ) || conv.participants?.[0];

        return {
            name: otherParticipant?.fullName || 'Unknown User',
            initials: getInitials(otherParticipant?.fullName),
            avatarId: otherParticipant?.avatarId,
            role: otherParticipant?.role || 'MEMBER',
            isOnline: false // TODO: Implement presence
        };
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getRoleBadgeClass = (role?: string) => {
        switch (role?.toUpperCase()) {
            case 'TRAINER': return 'conversation-item__role-badge--trainer';
            case 'OWNER': return 'conversation-item__role-badge--owner';
            case 'SUPPORT': return 'conversation-item__role-badge--support';
            case 'NUTRITIONIST': return 'conversation-item__role-badge--nutritionist';
            default: return '';
        }
    };

    const getAvatarBorderClass = (role?: string) => {
        switch (role?.toUpperCase()) {
            case 'TRAINER': return 'conversation-item__avatar-img--trainer';
            case 'OWNER': return 'conversation-item__avatar-img--owner';
            case 'SUPPORT': return 'conversation-item__avatar-img--support';
            default: return '';
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        const display = getConversationDisplay(conv);

        // Search filter
        if (searchQuery && !display.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Role filter
        if (activeFilter !== 'all') {
            const filterTab = FILTER_TABS.find(t => t.id === activeFilter);
            if (filterTab?.role && display.role?.toUpperCase() !== filterTab.role) {
                return false;
            }
        }

        return true;
    });

    const totalUnread = 3; // TODO: Calculate from conversations

    return (
        <>
            <div className="chat-sidebar">
                {/* Header */}
                <div className="chat-sidebar__header">
                    <div className="chat-sidebar__title-row">
                        <h2 className="chat-sidebar__title">
                            Messages
                            {totalUnread > 0 && (
                                <span className="chat-sidebar__unread-badge">{totalUnread}</span>
                            )}
                        </h2>
                        <button
                            className="chat-sidebar__new-btn"
                            onClick={() => setShowNewChatModal(true)}
                            title="New Chat"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="chat-search">
                        <Search size={16} className="chat-search__icon" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="chat-search__input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="chat-filter-tabs">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`chat-filter-tab ${activeFilter === tab.id ? 'chat-filter-tab--active' : ''}`}
                            onClick={() => setActiveFilter(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Conversation List */}
                <div className="chat-list">
                    {filteredConversations.length === 0 ? (
                        <div className="chat-window__empty" style={{ padding: '40px 20px' }}>
                            <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                                {searchQuery ? 'No conversations found' : 'No messages yet'}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => {
                            const display = getConversationDisplay(conv);
                            const isActive = activeConversation?.conversationId === conv.conversationId;

                            return (
                                <div
                                    key={conv.conversationId}
                                    className={`conversation-item ${isActive ? 'conversation-item--active' : ''}`}
                                    onClick={() => setActiveConversation(conv)}
                                >
                                    {/* Avatar */}
                                    <div className="conversation-item__avatar">
                                        <div className={`conversation-item__avatar-img ${getAvatarBorderClass(display.role)}`}>
                                            {conv.type === 'GROUP'
                                                ? <Users size={20} />
                                                : display.initials
                                            }
                                        </div>
                                        {display.isOnline && (
                                            <div className="conversation-item__online-badge" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="conversation-item__content">
                                        <div className="conversation-item__header">
                                            <h4 className="conversation-item__name">
                                                {display.name}
                                                {display.role && display.role !== 'MEMBER' && (
                                                    <span className={`conversation-item__role-badge ${getRoleBadgeClass(display.role)}`}>
                                                        {display.role}
                                                    </span>
                                                )}
                                            </h4>
                                            <span className="conversation-item__time">
                                                {formatTime(conv.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="conversation-item__preview">
                                            Tap to view message
                                        </p>
                                    </div>

                                    {/* Unread Badge */}
                                    {(conv.unreadCount ?? 0) > 0 && (
                                        <span className="conversation-item__unread-badge">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <NewChatModal onClose={() => setShowNewChatModal(false)} />
            )}
        </>
    );
};

export default ChatSidebar;
