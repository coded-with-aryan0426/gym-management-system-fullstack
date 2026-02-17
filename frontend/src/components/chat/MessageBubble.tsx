import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../services/chatApi';
import { Smile, Edit2, Trash2, CheckCheck, MoreVertical, X, Paperclip, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface MessageBubbleProps {
    message: ChatMessage;
    isMyMessage: boolean;
    onEdit: (id: number, content: string) => void;
    onDelete: (id: number) => void;
    onReact: (id: number, emoji: string) => void;
    onRemoveReaction: (id: number, emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
    message, 
    isMyMessage, 
    onEdit, 
    onDelete, 
    onReact, 
    onRemoveReaction 
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

    return (
        <div 
            className={`message-bubble ${isMyMessage ? 'message-bubble--sent' : 'message-bubble--received'}`}
            onMouseEnter={() => !isEditing && setShowActions(true)}
            onMouseLeave={() => !showEmojiPicker && setShowActions(false)}
        >
            <div className="message-bubble__content-wrapper" ref={actionRef}>
                <div className="message-bubble__content">
                    {/* Attachments & Special Content */}
                    {message.contentType === 'WORKOUT_PLAN' && message.payload ? (
                         <div className="workout-plan-card">
                             <div className="workout-plan-card__header">
                                 <BarChart2 size={14} />
                                 <span className="workout-plan-card__type">Workout Plan</span>
                             </div>
                             <h4 className="workout-plan-card__title">
                                 {JSON.parse(message.payload).title || 'Training Session'}
                             </h4>
                             <button className="workout-plan-card__btn workout-plan-card__btn--primary">View Plan</button>
                         </div>
                    ) : message.contentType === 'IMAGE' && message.payload ? (
                        <div className="message-attachment message-attachment--image">
                            <img
                                src={JSON.parse(message.payload).url}
                                alt="Attachment"
                                style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }}
                                onClick={() => {
                                    if (message.payload) {
                                        window.open(JSON.parse(message.payload).url, '_blank');
                                    }
                                }}
                            />
                        </div>
                    ) : isEditing ? (
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
                    ) : (
                        <p className="message-bubble__text">{message.content}</p>
                    )}

                    {/* Meta Info */}
                    <div className="message-bubble__meta">
                        <span className="message-bubble__time">
                            {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                        {message.isEdited && <span className="message-bubble__edited">(edited)</span>}
                        {isMyMessage && (
                            <span className="message-bubble__status">
                                <CheckCheck size={14} />
                            </span>
                        )}
                    </div>

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
