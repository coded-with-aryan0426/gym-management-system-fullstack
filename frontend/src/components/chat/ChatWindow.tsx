import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import chatApi from '../../services/chatApi';
import { showToast } from '../../utils/toast';
import {
    Send, Paperclip, Smile,
    Phone, Video, User as UserIcon,
    MessageCircle, ShieldOff, Shield, AlertCircle, MoreVertical
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ImageLightbox from './ImageLightbox';

interface ChatWindowProps {
    onToggleContactPanel?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onToggleContactPanel }) => {
    const { activeConversation, messages, sendMessage, connected, blockUser, isUserBlocked, typingUsers, sendTyping } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
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
        scrollToBottom();
    }, [messages, typingUsers]);

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
                            <span className={`chat-header__status-dot ${connected ? 'chat-header__status-dot--online' : 'chat-header__status-dot--offline'}`} />
                            <span>{connected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                <div className="chat-header__actions">
                    <button className="chat-header__action-btn" title="Voice Call (Coming Soon)" disabled style={{ opacity: 0.5 }}>
                        <Phone size={18} />
                    </button>
                    <button className="chat-header__action-btn" title="Video Call (Coming Soon)" disabled style={{ opacity: 0.5 }}>
                        <Video size={18} />
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
                          <MessageBubble
                              key={item.messageId || index}
                              message={item}
                              isMyMessage={isMyMessage}
                              onEdit={chatApi.editMessage}
                              onDelete={chatApi.deleteMessage}
                              onReact={chatApi.addReaction}
                              onRemoveReaction={chatApi.removeReaction}
                              onImageClick={(url) => setLightboxUrl(url)}
                          />
                    );
                })}

                {/* Typing Indicator */}
                {isOtherTyping && (
                    <div className="chat-typing-indicator">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#888' }}>
                            {otherParticipant?.name} is typing...
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input">
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

        {/* Image Lightbox */}
        {lightboxUrl && (
            <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}
        </>
    );
};

export default ChatWindow;
