import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, User, Users, MessageCircle } from 'lucide-react';
import NewChatModal from './NewChatModal';
import RequestItem from './RequestItem';
import api from '../../services/api';

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
    const { conversations, activeConversation, setActiveConversation, loadConversations } = useChat();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showNewChatModal, setShowNewChatModal] = useState(false);

    // Trainers members
    const [myMembers, setMyMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // New state for tabs
    const [activeTab, setActiveTab] = useState<'chats' | 'requests' | 'members'>(() => {
        return user?.role === 'TRAINER' ? 'members' : 'chats';
    });
    const [requests, setRequests] = useState<any[]>([]);

    React.useEffect(() => {
        if (activeTab === 'requests') {
            fetchRequests();
        } else if (activeTab === 'members' && user?.role === 'TRAINER') {
            fetchMyMembers();
        }
    }, [activeTab, user]);

    const fetchMyMembers = async () => {
        if (!user?.id) return;
        setLoadingMembers(true);
        try {
            // Assuming user.id is number, if not cast it
            const members = await api.getTrainerCustomers(Number(user.id));
            setMyMembers(members || []);
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await api.chat.getPendingRequests();
            // API returns { success: true, data: [...] } - extract the data array
            const requestsData = response?.data || response || [];
            setRequests(Array.isArray(requestsData) ? requestsData : []);
        } catch (error) {
            console.error(error);
            setRequests([]);
        }
    };

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
        const currentUserId = user?.userId || Number(user?.id);
        const otherParticipant = conv.participants?.find(
            (p: any) => Number(p.userId) !== currentUserId
        ) || conv.participants?.[0];

        return {
            name: otherParticipant?.fullName || otherParticipant?.username || 'Unknown User',
            initials: getInitials(otherParticipant?.fullName || otherParticipant?.username),
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

    const handleMemberClick = async (member: any) => {
        // Check if conversation exists
        const existing = conversations.find(c => {
            const other = c.participants?.find((p: any) => Number(p.userId) === member.userId);
            return !!other;
        });

        if (existing) {
            setActiveConversation(existing);
        } else {
            // Start new
            try {
                const result: any = await api.chat.startPrivateChat(member.userId);
                // The result is usually { success: true, data: conversation }
                if (result.success && result.data) {
                    setActiveConversation(result.data);
                    // Refresh conversations list to include the new conversation
                    await loadConversations();
                }
            } catch (err) {
                console.error("Failed to start chat with member", err);
                alert("Failed to start chat");
            }
        }
        // Switch to chats tab to show the active conversation
        setActiveTab('chats');
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

                {/* Main Tabs (Chats vs Requests) */}
                <div className="chat-main-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
                    <button
                        style={{ flex: 1, padding: '10px', background: activeTab === 'chats' ? 'var(--bg-secondary)' : 'transparent', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'chats' ? 'bold' : 'normal', color: 'var(--text-primary)' }}
                        onClick={() => setActiveTab('chats')}
                    >
                        Chats
                    </button>
                    <button
                        style={{ flex: 1, padding: '10px', background: activeTab === 'requests' ? 'var(--bg-secondary)' : 'transparent', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'requests' ? 'bold' : 'normal', color: 'var(--text-primary)' }}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests {requests.length > 0 && `(${requests.length})`}
                    </button>
                    {user?.role === 'TRAINER' && (
                        <button
                            style={{ flex: 1, padding: '10px', background: activeTab === 'members' ? 'var(--bg-secondary)' : 'transparent', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'members' ? 'bold' : 'normal', color: 'var(--text-primary)' }}
                            onClick={() => setActiveTab('members')}
                        >
                            Members
                        </button>
                    )}
                </div>

                {/* Filter Tabs (Only show for Chats) */}
                {activeTab === 'chats' && (
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
                )}

                {/* Content Area */}
                <div className="chat-list">
                    {activeTab === 'requests' ? (
                        <div className="requests-list">
                            {requests.length === 0 ? (
                                <div className="chat-window__empty" style={{ padding: '20px' }}>No pending requests</div>
                            ) : (
                                requests.map(req => (
                                    <RequestItem key={req.requestId} request={req} onRespond={fetchRequests} />
                                ))
                            )}
                        </div>
                    ) : activeTab === 'members' ? (
                        <div className="members-list">
                            {loadingMembers ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                            ) : myMembers.length === 0 ? (
                                <div className="chat-window__empty" style={{ padding: '20px' }}>No members assigned</div>
                            ) : (
                                myMembers.map(member => (
                                    <div
                                        key={member.userId}
                                        className="conversation-item"
                                        onClick={() => handleMemberClick(member)}
                                    >
                                        <div className="conversation-item__avatar">
                                            <div className="conversation-item__avatar-img conversation-item__avatar-img--owner"> {/* Using generic color */}
                                                {getInitials(member.fullName || member.username)}
                                            </div>
                                        </div>
                                        <div className="conversation-item__content">
                                            <div className="conversation-item__header">
                                                <h4 className="conversation-item__name">{member.fullName || member.username}</h4>
                                            </div>
                                            <div className="conversation-item__preview">MEMBER</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        // Existing Chat List Logic
                        filteredConversations.length === 0 ? (
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
                        )
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
