import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import chatApi from '../../services/chatApi';
import { showToast } from '../../utils/toast';
import {
    Send, Paperclip, Smile,
    Phone, Video, User as UserIcon,
    MessageCircle, ShieldOff, Shield, AlertCircle, MoreVertical,
    Search, X as XIcon, ChevronUp, ChevronDown
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import MessageBubble from './MessageBubble';
import ImageLightbox from './ImageLightbox';

interface ChatWindowProps {
    onToggleContactPanel?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onToggleContactPanel }) => {
    const { activeConversation, messages, sendMessage, connected, blockUser, isUserBlocked, typingUsers, sendTyping, hasMoreMessages, loadingMoreMessages, loadMoreMessages, presenceMap, replyToMessage, setReplyTo } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    // U9 — message search
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMatchIndex, setSearchMatchIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeConversation) {
            const file = e.target.files[0];
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('conversationId', activeConversation.conversationId.toString());
                const response = await apiClient.post('/chat/attachments', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const attachment = response.data?.data || response.data;

                const type = file.type.startsWith('image/') ? 'IMAGE'
                    : file.type.startsWith('video/') ? 'VIDEO'
                    : file.type.startsWith('audio/') ? 'AUDIO'
                    : 'FILE';
                const payload = JSON.stringify({
                    attachmentId: attachment.attachmentId,
                    url: attachment.url,
                    fileName: attachment.fileName,
                    fileSize: attachment.fileSize
                });
                await sendMessage('Sent an attachment', type, payload);
            } catch (error) {
                console.error('Failed to upload file', error);
                showToast.error('Failed to upload file');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Only auto-scroll to bottom on initial load (page 0), not when prepending older messages
        if (!loadingMoreMessages) {
            scrollToBottom();
        }
    }, [messages, typingUsers]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // B4 — infinite scroll: detect when user scrolls to the top to load older messages
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            if (container.scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
                // Remember scroll height before prepend so we can restore position
                const prevScrollHeight = container.scrollHeight;
                loadMoreMessages().then(() => {
                    // After prepend, keep the viewport at the same message
                    container.scrollTop = container.scrollHeight - prevScrollHeight;
                });
            }
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasMoreMessages, loadingMoreMessages, loadMoreMessages]);

    // U9 — focus search input when bar opens; reset match index when query changes
    useEffect(() => {
        if (showSearch) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        } else {
            setSearchQuery('');
            setSearchMatchIndex(0);
        }
    }, [showSearch]);

    useEffect(() => {
        setSearchMatchIndex(0);
    }, [searchQuery]);

    // U9 — close search bar when conversation changes
    useEffect(() => {
        setShowSearch(false);
    }, [activeConversation?.conversationId]);

    // U9 — compute search matches (indices into `messages`)
    const searchTerm = searchQuery.trim().toLowerCase();
    const searchMatchIds: number[] = searchTerm
        ? messages.reduce<number[]>((acc, m, idx) => {
            if (m.content?.toLowerCase().includes(searchTerm)) acc.push(idx);
            return acc;
        }, [])
        : [];

    // U9 — scroll matched message into view
    const scrollToMatch = useCallback((idx: number) => {
        const container = messagesContainerRef.current;
        if (!container || !searchMatchIds.length) return;
        const msgEl = container.querySelector(`[data-msg-idx="${searchMatchIds[idx]}"]`) as HTMLElement | null;
        msgEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [searchMatchIds]);

    useEffect(() => {
        if (searchMatchIds.length) scrollToMatch(searchMatchIndex);
    }, [searchMatchIndex, searchMatchIds.length]);

    const handleSearchNext = () => {
        if (!searchMatchIds.length) return;
        const next = (searchMatchIndex + 1) % searchMatchIds.length;
        setSearchMatchIndex(next);
    };

    const handleSearchPrev = () => {
        if (!searchMatchIds.length) return;
        const prev = (searchMatchIndex - 1 + searchMatchIds.length) % searchMatchIds.length;
        setSearchMatchIndex(prev);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        if (activeConversation) {
            sendTyping(e.target.value.length > 0);
        }
    };

    // Stop-typing signal: fire sendTyping(false) 2s after last keystroke
    useEffect(() => {
        if (!newMessage) return;
        const timeout = setTimeout(() => {
            sendTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, [newMessage]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeConversation) {
            sendMessage(newMessage);
            setNewMessage('');
            sendTyping(false);
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
        const currentUserId = user?.userId || Number(user?.id);
        const other = activeConversation.participants?.find(
            (p: any) => Number(p.userId) !== currentUserId
        ) || activeConversation.participants?.[0];

        const displayName = other?.fullName || other?.username || 'Unknown';
        return {
            userId: other?.userId,
            name: displayName,
            initials: getInitials(displayName),
            role: other?.role
        };
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
    // U6 — real presence from presenceMap, fall back to WS connected
    const isOtherOnline = otherParticipant?.userId
        ? (presenceMap[otherParticipant.userId] ?? false)
        : false;

    // Typing indicator
    const typingUserIds = activeConversation ? typingUsers[activeConversation.conversationId] || [] : [];
    const currentUserId = user?.userId || Number(user?.id);
    const isOtherTyping = typingUserIds.some(id => id !== currentUserId);

    // Group messages by date
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
        <>
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
                            <span className={`chat-header__status-dot ${isOtherOnline ? 'chat-header__status-dot--online' : 'chat-header__status-dot--offline'}`} />
                            <span>{isOtherOnline ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                <div className="chat-header__actions">
                    <button className="chat-header__action-btn chat-header__action-btn--disabled" title="Voice Call (Coming Soon)" disabled>
                        <Phone size={18} />
                    </button>
                    <button className="chat-header__action-btn chat-header__action-btn--disabled" title="Video Call (Coming Soon)" disabled>
                        <Video size={18} />
                    </button>
                    {/* U9 — search toggle */}
                    <button
                        className={`chat-header__action-btn${showSearch ? ' chat-header__action-btn--active' : ''}`}
                        onClick={() => setShowSearch(s => !s)}
                        title="Search Messages"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        className="chat-header__action-btn"
                        onClick={onToggleContactPanel}
                        title="Contact Info"
                    >
                        <UserIcon size={18} />
                    </button>

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

            {/* U9 — Search bar */}
            {showSearch && (
                <div className="chat-search-bar">
                    <Search size={15} className="chat-search-bar__icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="chat-search-bar__input"
                        placeholder="Search in conversation..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') e.shiftKey ? handleSearchPrev() : handleSearchNext();
                            if (e.key === 'Escape') setShowSearch(false);
                        }}
                    />
                    {searchTerm && (
                        <span className="chat-search-bar__count">
                            {searchMatchIds.length > 0
                                ? `${searchMatchIndex + 1} / ${searchMatchIds.length}`
                                : '0 results'}
                        </span>
                    )}
                    <button className="chat-search-bar__nav" onClick={handleSearchPrev} title="Previous" disabled={!searchMatchIds.length}>
                        <ChevronUp size={15} />
                    </button>
                    <button className="chat-search-bar__nav" onClick={handleSearchNext} title="Next" disabled={!searchMatchIds.length}>
                        <ChevronDown size={15} />
                    </button>
                    <button className="chat-search-bar__close" onClick={() => setShowSearch(false)} title="Close search">
                        <XIcon size={15} />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="chat-messages" ref={messagesContainerRef}>
                {/* B4 — load more spinner at top */}
                {loadingMoreMessages && (
                    <div className="chat-messages__load-more">
                        <span className="chat-messages__load-more-spinner" />
                        <span>Loading older messages...</span>
                    </div>
                )}
                {!loadingMoreMessages && hasMoreMessages && (
                    <div className="chat-messages__load-more">
                        <span className="chat-messages__scroll-hint">Scroll up for older messages</span>
                    </div>
                )}
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
                    // U9 — search highlight
                    const msgListIdx = messages.findIndex(m => m.messageId === item.messageId);
                    const isSearchMatch = searchTerm && searchMatchIds.includes(msgListIdx);
                    const isCurrentMatch = isSearchMatch && searchMatchIds[searchMatchIndex] === msgListIdx;

                          return (
                          <div key={item.messageId || index} data-msg-idx={msgListIdx} className={isCurrentMatch ? 'chat-msg-row--search-current' : isSearchMatch ? 'chat-msg-row--search-match' : ''}>
                          <MessageBubble
                              message={item}
                              isMyMessage={isMyMessage}
                              onEdit={chatApi.editMessage}
                              onDelete={chatApi.deleteMessage}
                              onReact={chatApi.addReaction}
                              onRemoveReaction={chatApi.removeReaction}
                              onImageClick={(url) => setLightboxUrl(url)}
                              searchTerm={searchTerm}
                              onReply={(msg) => { setReplyTo(msg); }}
                              allMessages={messages}
                          />
                          </div>
                    );
                })}

                {/* Typing Indicator */}
                {isOtherTyping && (
                    <div className="chat-typing-indicator">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="chat-typing-indicator__name">
                            {otherParticipant?.name} is typing...
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input">
                {/* U10 — Reply-to preview bar */}
                {replyToMessage && (
                    <div className="chat-reply-preview">
                        <div className="chat-reply-preview__bar" />
                        <div className="chat-reply-preview__content">
                            <span className="chat-reply-preview__name">
                                {replyToMessage.senderName || 'Unknown'}
                            </span>
                            <span className="chat-reply-preview__text">
                                {replyToMessage.content.length > 80
                                    ? replyToMessage.content.slice(0, 80) + '…'
                                    : replyToMessage.content}
                            </span>
                        </div>
                        <button
                            className="chat-reply-preview__dismiss"
                            onClick={() => setReplyTo(null)}
                            title="Cancel reply"
                        >
                            <XIcon size={16} />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="chat-input__form">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <button
                        type="button"
                        className="chat-input__attachment-btn"
                        title="Attach file"
                        disabled={isBlocked}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={22} />
                    </button>

                    <div className="chat-input__field-wrapper">
                        <textarea
                            rows={1}
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e as any);
                                }
                            }}
                            placeholder={isBlocked ? "You have blocked this user" : "Type a message..."}
                            className="chat-input__field chat-input__field--textarea"
                            disabled={isBlocked}
                        />
                        <div className="chat-input__emoji-wrapper" ref={emojiPickerRef}>
                            <button
                                type="button"
                                className="chat-input__emoji-btn"
                                title="Emoji"
                                disabled={isBlocked}
                                onClick={() => setShowEmojiPicker(p => !p)}
                            >
                                <Smile size={20} />
                            </button>
                            {showEmojiPicker && (
                                <div className="chat-input__emoji-picker-popup">
                                    <EmojiPicker
                                        theme={Theme.DARK}
                                        onEmojiClick={(emojiData) => {
                                            setNewMessage(prev => prev + emojiData.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        width={300}
                                        height={380}
                                    />
                                </div>
                            )}
                        </div>
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

        {/* Image Lightbox */}
        {lightboxUrl && (
            <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}
        </>
    );
};

export default ChatWindow;
