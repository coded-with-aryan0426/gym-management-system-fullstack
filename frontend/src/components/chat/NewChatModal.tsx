import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Search, X, Users, Loader, Circle } from 'lucide-react';
import type { ChatUser } from '../../services/chatApi';
import * as chatApi from '../../services/chatApi';

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

    // Load available users on mount
    useEffect(() => {
        loadUsers();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            // If search cleared, reload all users
            loadUsers();
            return;
        }

        const timer = setTimeout(() => {
            searchUsers(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await chatApi.getAvailableChatUsers();
            setUsers(data || []);
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
            const data = await chatApi.searchUsers(query);
            setUsers(data || []);
        } catch (err) {
            console.error('Error searching users:', err);
            // Keep existing users on search error
        } finally {
            setSearching(false);
        }
    }, []);

    const handleStartChat = async (targetUser: ChatUser) => {
        setStarting(targetUser.userId);
        try {
            await startPrivateChat(targetUser.userId);
            onClose();
        } catch (err) {
            console.error('Failed to start chat:', err);
            setError('Failed to start conversation');
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

    const getRoleBadgeStyle = (role?: string) => {
        switch (role?.toUpperCase()) {
            case 'TRAINER':
                return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
            case 'OWNER':
                return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
            case 'ADMIN':
                return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
            case 'NUTRITIONIST':
                return { background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' };
            default:
                return { background: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' };
        }
    };

    const getAvatarGradient = (role?: string) => {
        switch (role?.toUpperCase()) {
            case 'TRAINER':
                return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'OWNER':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'ADMIN':
                return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            default:
                return 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)';
        }
    };

    // Filter users by role tab and exclude blocked users
    const filteredUsers = users.filter(u => {
        // Exclude blocked users
        if (isUserBlocked(u.userId)) return false;

        // Role filter
        if (activeFilter !== 'all') {
            const filterTab = FILTER_TABS.find(t => t.id === activeFilter);
            if (filterTab?.role && u.role?.toUpperCase() !== filterTab.role) {
                return false;
            }
        }
        return true;
    });

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050,
                backdropFilter: 'blur(4px)'
            }}
        >
            <div
                className="modal-content"
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    maxHeight: '80vh',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={20} style={{ color: 'var(--accent-primary)' }} />
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            New Chat
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '16px 24px' }}>
                    <div className="chat-search" style={{ position: 'relative' }}>
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
                                className="animate-spin"
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-tertiary)'
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Role Filter Tabs */}
                <div className="chat-filter-tabs" style={{ paddingTop: 0 }}>
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
                <div className="new-chat-modal__user-list" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            color: 'var(--text-tertiary)'
                        }}>
                            <Loader size={24} className="animate-spin" />
                        </div>
                    ) : error ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-tertiary)'
                        }}>
                            <p>{error}</p>
                            <button
                                onClick={loadUsers}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    background: 'var(--accent-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-tertiary)'
                        }}>
                            {searchQuery ? 'No users found' : 'No users available'}
                        </div>
                    ) : (
                        filteredUsers.map(chatUser => (
                            <div
                                key={chatUser.userId}
                                className="new-chat-modal__user"
                                onClick={() => handleStartChat(chatUser)}
                                style={{
                                    opacity: starting === chatUser.userId ? 0.6 : 1,
                                    pointerEvents: starting ? 'none' : 'auto'
                                }}
                            >
                                <div
                                    className="new-chat-modal__user-avatar"
                                    style={{
                                        background: getAvatarGradient(chatUser.role),
                                        position: 'relative'
                                    }}
                                >
                                    {getInitials(chatUser.fullName)}
                                    {chatUser.online && (
                                        <Circle
                                            size={10}
                                            fill="#22c55e"
                                            stroke="var(--bg-secondary)"
                                            strokeWidth={2}
                                            style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                right: '0'
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="new-chat-modal__user-info">
                                    <h4 className="new-chat-modal__user-name">
                                        {chatUser.fullName || chatUser.username}
                                    </h4>
                                    <span
                                        className="new-chat-modal__user-role"
                                        style={{
                                            ...getRoleBadgeStyle(chatUser.role),
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 500
                                        }}
                                    >
                                        {chatUser.role || 'Member'}
                                    </span>
                                </div>
                                {starting === chatUser.userId && (
                                    <Loader size={18} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
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
