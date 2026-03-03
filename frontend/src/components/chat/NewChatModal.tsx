import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Search, X, Users, UserPlus, Loader } from 'lucide-react';
import type { ChatUser } from '../../services/chatApi';
import chatApi from '../../services/chatApi';
import { showToast } from '../../utils/toast';
import '../../styles/Chat.css';

interface FilterTab {
    id: string;
    label: string;
    role?: string;
}

const FILTER_TABS: FilterTab[] = [
    { id: 'all', label: 'All' },
    { id: 'trainers', label: 'Trainers', role: 'TRAINER' },
    { id: 'members', label: 'Members', role: 'MEMBER' },
    { id: 'owners', label: 'Owners', role: 'OWNER' },
];

interface NewChatModalProps {
    onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
    const { startPrivateChat, isUserBlocked } = useChat();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState<number | null>(null);
    const [searching, setSearching] = useState(false);

    useEffect(() => { loadUsers(); }, []);

    useEffect(() => {
        if (!searchQuery.trim()) { loadUsers(); return; }
        const timer = setTimeout(() => searchUsers(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userList = await chatApi.getAvailableChatUsers();
            setUsers(Array.isArray(userList) ? userList : []);
        } catch (err) {
            setError('Failed to load users');
            console.error('Error loading chat users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchUsers = useCallback(async (query: string) => {
        setSearching(true);
        try {
            const userList = await chatApi.searchUsers(query);
            setUsers(Array.isArray(userList) ? userList : []);
        } catch (err) {
            console.error('Error searching users:', err);
        } finally {
            setSearching(false);
        }
    }, []);

    const handleStartChat = async (targetUser: ChatUser) => {
        setStarting(targetUser.userId);
        try {
            await startPrivateChat(targetUser.userId);
            onClose();
        } catch (err: any) {
            console.error('Failed to start chat:', err);
            if (err?.message === 'CHAT_REQUEST_REQUIRED' || err?.response?.status === 403) {
                if (window.confirm(`This user accepts invitations only. Send a request to ${targetUser.fullName || targetUser.username}?`)) {
                    try {
                        await chatApi.sendConversationRequest(targetUser.userId);
                        showToast.success('Invitation sent!');
                        onClose();
                    } catch {
                        showToast.error('Failed to send request');
                    }
                }
            } else {
                setError('Failed to start conversation');
            }
        } finally {
            setStarting(null);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Dynamic role badge colors — must remain inline (runtime values)
    const getRoleBadgeStyle = (role?: string): React.CSSProperties => {
        switch (role?.toUpperCase()) {
            case 'TRAINER':     return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
            case 'OWNER':       return { background: 'rgba(245, 158, 11, 0.15)',  color: '#f59e0b' };
            case 'ADMIN':       return { background: 'rgba(239, 68, 68, 0.15)',   color: '#ef4444' };
            case 'NUTRITIONIST':return { background: 'rgba(139, 92, 246, 0.15)',  color: '#8b5cf6' };
            default:            return { background: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' };
        }
    };

    // Dynamic avatar gradient — must remain inline (runtime values)
    const getAvatarGradient = (role?: string): string => {
        switch (role?.toUpperCase()) {
            case 'TRAINER': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'OWNER':   return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'ADMIN':   return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            default:        return 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)';
        }
    };

    const filteredUsers = users.filter(u => {
        if (isUserBlocked(u.userId)) return false;
        if (activeFilter !== 'all') {
            const filterTab = FILTER_TABS.find(t => t.id === activeFilter);
            if (filterTab?.role && u.role?.toUpperCase() !== filterTab.role) return false;
        }
        return true;
    });

    return (
        <div
            className="new-chat-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="new-chat-modal-box">
                {/* Header */}
                <div className="new-chat-modal__header">
                    <div className="new-chat-modal__header-left">
                        <Users size={20} className="new-chat-modal__header-icon" />
                        <h3 className="new-chat-modal__title">New Chat</h3>
                    </div>
                    <button onClick={onClose} className="new-chat-modal__close-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="new-chat-modal__search-wrap">
                    <div className="chat-search new-chat-modal__search-inner">
                        <Search size={16} className="chat-search__icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="chat-search__input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {searching && (
                            <Loader
                                size={16}
                                className="animate-spin new-chat-modal__search-spinner"
                            />
                        )}
                    </div>
                </div>

                {/* Role Filter Tabs */}
                <div className="chat-filter-tabs new-chat-modal__filter-tabs">
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

                {/* User List */}
                <div className="new-chat-modal__user-list">
                    {loading ? (
                        <div className="new-chat-modal__state-center">
                            <Loader size={24} className="animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="new-chat-modal__error-state">
                            <p>{error}</p>
                            <button onClick={loadUsers} className="new-chat-modal__retry-btn">
                                Retry
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="new-chat-modal__empty-state">
                            {searchQuery ? 'No users found' : 'No users available'}
                        </div>
                    ) : (
                        filteredUsers.map(chatUser => (
                            <div
                                key={chatUser.userId}
                                className={`new-chat-modal__user ${starting === chatUser.userId ? 'new-chat-modal__user--loading' : ''}`}
                                onClick={() => handleStartChat(chatUser)}
                            >
                                {/* Avatar — background is dynamic so kept inline */}
                                <div
                                    className="new-chat-modal__user-avatar new-chat-modal__user-avatar--relative"
                                    style={{ background: getAvatarGradient(chatUser.role) }}
                                >
                                    {getInitials(chatUser.fullName)}
                                    {chatUser.online && (
                                        <div className="new-chat-modal__online-dot" />
                                    )}
                                </div>

                                <div className="new-chat-modal__user-info">
                                    <h4 className="new-chat-modal__user-name">
                                        {chatUser.fullName || chatUser.username}
                                    </h4>
                                    {/* Role badge colors are dynamic — kept inline */}
                                    <span
                                        className="new-chat-modal__user-role new-chat-modal__role-badge"
                                        style={getRoleBadgeStyle(chatUser.role)}
                                    >
                                        {chatUser.role || 'Member'}
                                    </span>
                                </div>

                                {starting === chatUser.userId ? (
                                    <Loader size={18} className="animate-spin new-chat-modal__spinner-icon" />
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Send a conversation request to ${chatUser.fullName || chatUser.username}?`)) {
                                                chatApi.sendConversationRequest(chatUser.userId)
                                                    .then(() => showToast.success('Invitation sent!'))
                                                    .catch(() => showToast.error('Failed to send request'));
                                            }
                                        }}
                                        title="Send Request"
                                        className="new-chat-modal__request-btn"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
