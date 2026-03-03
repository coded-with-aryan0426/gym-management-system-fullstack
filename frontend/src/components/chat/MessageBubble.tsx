import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../services/chatApi';
import { Smile, Edit2, Trash2, Check, CheckCheck, X, Paperclip, BarChart2, FileText, Music, Download, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface MessageBubbleProps {
    message: ChatMessage;
    isMyMessage: boolean;
    onEdit: (id: number, content: string) => void;
    onDelete: (id: number) => void;
    onReact: (id: number, emoji: string) => void;
    onRemoveReaction: (id: number, emoji: string) => void;
    onImageClick?: (url: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isMyMessage,
    onEdit,
    onDelete,
    onReact,
    onRemoveReaction,
    onImageClick,
}) => {
    const { user } = useAuth();
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const actionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
                setShowActions(false);
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent.trim() !== message.content) {
            onEdit(message.messageId, editContent);
        } else {
            setEditContent(message.content);
        }
        setIsEditing(false);
    };

    const toggleReaction = (emoji: string) => {
        const userId = user?.userId || Number(user?.id);
        const existing = message.reactions?.find(r => r.userId === userId && r.emoji === emoji);
        if (existing) {
            onRemoveReaction(message.messageId, emoji);
        } else {
            onReact(message.messageId, emoji);
        }
        setShowEmojiPicker(false);
        setShowActions(false);
    };

    // Group reactions
    const reactionCounts = (message.reactions || []).reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Parse payload safely
    const parsedPayload = (() => {
        try {
            return message.payload ? JSON.parse(message.payload) : null;
        } catch {
            return null;
        }
    })();

    const renderContent = () => {
        const { contentType } = message;

        if (contentType === 'WORKOUT_PLAN' && parsedPayload) {
            return (
                <div className="workout-plan-card">
                    <div className="workout-plan-card__header">
                        <BarChart2 size={14} />
                        <span className="workout-plan-card__type">Workout Plan</span>
                    </div>
                    <h4 className="workout-plan-card__title">
                        {parsedPayload.title || 'Training Session'}
                    </h4>
                    <button className="workout-plan-card__btn workout-plan-card__btn--primary">View Plan</button>
                </div>
            );
        }

        if (contentType === 'IMAGE' && parsedPayload?.url) {
            return (
                <div className="message-attachment message-attachment--image">
                    <img
                        src={parsedPayload.url}
                        alt={parsedPayload.fileName || 'Attachment'}
                        className="message-attachment__img"
                        onClick={() => onImageClick ? onImageClick(parsedPayload.url) : window.open(parsedPayload.url, '_blank')}
                    />
                </div>
            );
        }

        if (contentType === 'VIDEO' && parsedPayload?.url) {
            return (
                <div className="message-attachment message-attachment--video">
                    <video
                        src={parsedPayload.url}
                        controls
                        className="message-attachment__video"
                        preload="metadata"
                    />
                </div>
            );
        }

        if ((contentType === 'AUDIO' || contentType === 'VOICE_NOTE') && parsedPayload?.url) {
            return (
                <div className="message-attachment message-attachment--audio">
                    <div className="message-attachment__audio-icon">
                        <Music size={16} />
                    </div>
                    <audio
                        src={parsedPayload.url}
                        controls
                        className="message-attachment__audio"
                        preload="metadata"
                    />
                </div>
            );
        }

        if (contentType === 'FILE' && parsedPayload) {
            return (
                <div className="message-attachment message-attachment--file">
                    <div className="message-attachment__file-icon">
                        <FileText size={20} />
                    </div>
                    <div className="message-attachment__file-info">
                        <span className="message-attachment__file-name">
                            {parsedPayload.fileName || 'File'}
                        </span>
                        {parsedPayload.fileSize && (
                            <span className="message-attachment__file-size">
                                {formatFileSize(parsedPayload.fileSize)}
                            </span>
                        )}
                    </div>
                    {parsedPayload.url && (
                        <a
                            href={parsedPayload.url}
                            download={parsedPayload.fileName}
                            className="message-attachment__download-btn"
                            target="_blank"
                            rel="noreferrer"
                            title="Download"
                        >
                            <Download size={16} />
                        </a>
                    )}
                </div>
            );
        }

        if (isEditing) {
            return (
                <div className="message-edit-box">
                    <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                                setEditContent(message.content);
                            }
                        }}
                        autoFocus
                        className="message-edit-input"
                    />
                    <div className="message-edit-actions">
                        <button onClick={() => { setIsEditing(false); setEditContent(message.content); }}>
                            <X size={14} />
                        </button>
                        <button onClick={handleSaveEdit}>
                            <CheckCheck size={14} />
                        </button>
                    </div>
                </div>
            );
        }

        return <p className="message-bubble__text">{message.content}</p>;
    };

    return (
        <div
            className={`message-bubble ${isMyMessage ? 'message-bubble--sent' : 'message-bubble--received'}`}
            onMouseEnter={() => !isEditing && setShowActions(true)}
            onMouseLeave={() => !showEmojiPicker && setShowActions(false)}
        >
            <div className="message-bubble__content-wrapper" ref={actionRef}>
                <div className="message-bubble__content">
                    {renderContent()}

                    {/* Meta Info */}
                    <div className="message-bubble__meta">
                        <span className="message-bubble__time">
                            {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                          {message.isEdited && <span className="message-bubble__edited">(edited)</span>}
                          {isMyMessage && (
                              <span className={`message-bubble__status message-bubble__status--${message.deliveryStatus?.toLowerCase() ?? 'sent'}`}>
                                  {message.deliveryStatus === 'READ' ? (
                                      <CheckCheck size={14} />
                                  ) : message.deliveryStatus === 'DELIVERED' ? (
                                      <CheckCheck size={14} />
                                  ) : (
                                      <Check size={14} />
                                  )}
                              </span>
                          )}
                    </div>

                    {/* Clear float from meta */}
                    <div style={{ clear: 'both' }} />

                    {/* Reactions Display */}
                    {Object.keys(reactionCounts).length > 0 && (
                        <div className="message-reactions">
                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                                <span key={emoji} className="message-reaction-chip" onClick={() => toggleReaction(emoji)}>
                                    {emoji} {count}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions Menu */}
                {showActions && !message.isSystemMessage && (
                    <div className={`message-actions ${isMyMessage ? 'message-actions--left' : 'message-actions--right'}`}>
                        <button className="message-action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <Smile size={16} />
                        </button>

                        {isMyMessage && (
                            <>
                                <button className="message-action-btn" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="message-action-btn" onClick={() => onDelete(message.messageId)}>
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}

                        {showEmojiPicker && (
                            <div className="emoji-picker-tooltip">
                                {COMMON_EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={() => toggleReaction(emoji)}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
