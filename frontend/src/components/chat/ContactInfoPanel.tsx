import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import { getSharedMedia } from '../../services/chatApi';
import type { SharedMediaItem } from '../../services/chatApi';
import {
    X, Calendar, BarChart2, Star, Bell, Pin,
    Image as ImageIcon, FileText, Shield, ShieldOff,
    Download, ChevronRight
} from 'lucide-react';
import ImageLightbox from './ImageLightbox';

interface ContactInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactInfoPanel: React.FC<ContactInfoPanelProps> = ({ isOpen, onClose }) => {
    const { activeConversation, blockUser, unblockUser, isUserBlocked, presenceMap } = useChat();
    const { user } = useAuth();
    const [blocking, setBlocking] = useState(false);
    const [mediaTab, setMediaTab] = useState<'photos' | 'docs'>('photos');
    const [photos, setPhotos] = useState<SharedMediaItem[]>([]);
    const [docs, setDocs] = useState<SharedMediaItem[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    // Load shared media when conversation changes or panel opens
    useEffect(() => {
        if (!activeConversation || !isOpen) return;
        setLoadingMedia(true);
        Promise.all([
            getSharedMedia(activeConversation.conversationId, 'IMAGE', 0, 18),
            getSharedMedia(activeConversation.conversationId, 'DOCUMENT', 0, 12),
        ]).then(([imgPage, docPage]) => {
            setPhotos(imgPage.items || []);
            setDocs(docPage.items || []);
        }).catch(() => {}).finally(() => setLoadingMedia(false));
    }, [activeConversation?.conversationId, isOpen]);

    if (!activeConversation) return null;

    const getOtherParticipant = () => {
        if (activeConversation.type === 'GROUP') {
            return { name: activeConversation.title || 'Group Chat', initials: 'G', role: 'GROUP' };
        }
        const other = activeConversation.participants?.find(
            (p: any) => Number(p.userId) !== Number(user?.id)
        ) || activeConversation.participants?.[0];
        return {
            name: other?.fullName || 'Unknown',
            initials: getInitials(other?.fullName),
            role: other?.role || 'MEMBER',
            avatarId: other?.avatarId
        };
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getRoleBadgeStyle = (role?: string) => {
        switch (role?.toUpperCase()) {
            case 'TRAINER': return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
            case 'OWNER': return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
            case 'NUTRITIONIST': return { background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' };
            default: return { background: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' };
        }
    };

    const getAvatarGradient = (role?: string) => {
        switch (role?.toUpperCase()) {
            case 'TRAINER': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'OWNER': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'NUTRITIONIST': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
            default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const otherParticipant = getOtherParticipant();

    const getOtherUserId = (): number | null => {
        if (activeConversation.type === 'GROUP') return null;
        const other = activeConversation.participants?.find(
            (p: any) => Number(p.userId) !== Number(user?.id)
        ) || activeConversation.participants?.[0];
        return other ? Number(other.userId) : null;
    };

    const otherUserId = getOtherUserId();
    const blocked = otherUserId ? isUserBlocked(otherUserId) : false;
    const isOnline = otherUserId ? (presenceMap[otherUserId] ?? false) : false;

    const handleBlockToggle = async () => {
        if (!otherUserId) return;
        setBlocking(true);
        try {
            if (blocked) {
                await unblockUser(otherUserId);
                showToast.success('User unblocked');
            } else {
                await blockUser(otherUserId);
                showToast.success('User blocked');
            }
        } catch {
            showToast.error('Action failed. Please try again.');
        } finally {
            setBlocking(false);
        }
    };

    return (
        <>
        <div className={`contact-panel ${!isOpen ? 'contact-panel--hidden' : ''}`}>
            {/* Header */}
            <div className="contact-panel__header">
                <h3 className="contact-panel__title">Contact Info</h3>
                <button className="contact-panel__close" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            {/* Profile Section */}
            <div className="contact-panel__profile">
                <div
                    className="contact-panel__avatar"
                    style={{ background: getAvatarGradient(otherParticipant.role) }}
                >
                    {otherParticipant.initials}
                </div>
                <h4 className="contact-panel__name">{otherParticipant.name}</h4>
                {otherParticipant.role && otherParticipant.role !== 'MEMBER' && (
                    <span
                        className="contact-panel__role-badge"
                        style={getRoleBadgeStyle(otherParticipant.role)}
                    >
                        {otherParticipant.role === 'TRAINER' ? '🏋️ Strength & Conditioning' : otherParticipant.role}
                    </span>
                )}
                <span className={`contact-panel__status${isOnline ? ' contact-panel__status--online' : ''}`}>
                    {isOnline ? 'Online now' : 'Offline'}
                </span>
            </div>

            {/* Quick Actions */}
            <div className="contact-panel__quick-actions">
                <button className="contact-panel__quick-action">
                    <Calendar size={20} />
                    <span className="contact-panel__quick-action-label">Book Session</span>
                </button>
                <button className="contact-panel__quick-action">
                    <BarChart2 size={20} />
                    <span className="contact-panel__quick-action-label">View Progress</span>
                </button>
            </div>

            {/* Quick Actions List */}
            <div className="contact-panel__section">
                <h5 className="contact-panel__section-title">Quick Actions</h5>
                <div className="contact-panel__action">
                    <span className="contact-panel__action-icon"><Star size={18} /></span>
                    <span className="contact-panel__action-text">Rate Trainer</span>
                </div>
                <div className="contact-panel__action">
                    <span className="contact-panel__action-icon"><Bell size={18} /></span>
                    <span className="contact-panel__action-text">Notifications</span>
                </div>
                <div className="contact-panel__action">
                    <span className="contact-panel__action-icon"><Pin size={18} /></span>
                    <span className="contact-panel__action-text">Pin Conversation</span>
                </div>
            </div>

            {/* Shared Media Section — U7 */}
            <div className="contact-panel__section contact-panel__section--media">
                <h5 className="contact-panel__section-title">Shared Media</h5>

                {/* Tab switcher */}
                <div className="contact-panel__media-tabs">
                    <button
                        className={`contact-panel__media-tab${mediaTab === 'photos' ? ' contact-panel__media-tab--active' : ''}`}
                        onClick={() => setMediaTab('photos')}
                    >
                        <ImageIcon size={14} />
                        Photos
                    </button>
                    <button
                        className={`contact-panel__media-tab${mediaTab === 'docs' ? ' contact-panel__media-tab--active' : ''}`}
                        onClick={() => setMediaTab('docs')}
                    >
                        <FileText size={14} />
                        Files
                    </button>
                </div>

                {loadingMedia ? (
                    <div className="contact-panel__media-loading">Loading...</div>
                ) : mediaTab === 'photos' ? (
                    photos.length > 0 ? (
                        <>
                        <div className="contact-panel__photo-grid">
                            {photos.slice(0, 9).map((item) => (
                                <button
                                    key={item.attachmentId}
                                    className="contact-panel__photo-cell"
                                    onClick={() => setLightboxUrl(item.fileUrl)}
                                    title={item.fileName || 'Photo'}
                                >
                                    <img
                                        src={item.thumbnailUrl || item.fileUrl}
                                        alt={item.fileName || 'photo'}
                                        className="contact-panel__photo-img"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                        {photos.length > 9 && (
                            <button className="contact-panel__media-see-all">
                                See all {photos.length}+ photos <ChevronRight size={14} />
                            </button>
                        )}
                        </>
                    ) : (
                        <p className="contact-panel__media-empty">No photos shared yet</p>
                    )
                ) : (
                    docs.length > 0 ? (
                        <>
                        <div className="contact-panel__doc-list">
                            {docs.map((item) => (
                                <a
                                    key={item.attachmentId}
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-panel__doc-item"
                                    download={item.fileName}
                                >
                                    <div className="contact-panel__doc-icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="contact-panel__doc-info">
                                        <span className="contact-panel__doc-name">{item.fileName || 'Document'}</span>
                                        <span className="contact-panel__doc-meta">
                                            {formatFileSize(item.fileSize)}
                                            {item.createdAt && ` · ${formatDate(item.createdAt)}`}
                                        </span>
                                    </div>
                                    <Download size={14} className="contact-panel__doc-dl" />
                                </a>
                            ))}
                        </div>
                        </>
                    ) : (
                        <p className="contact-panel__media-empty">No files shared yet</p>
                    )
                )}
            </div>

            {/* Privacy Section */}
            {activeConversation.type === 'PRIVATE' && otherUserId && (
                <div className="contact-panel__section">
                    <h5 className="contact-panel__section-title">Privacy</h5>
                    <button
                        className={`contact-panel__action contact-panel__action--btn contact-panel__action--block${blocked ? ' contact-panel__action--unblock' : ''}`}
                        onClick={handleBlockToggle}
                        disabled={blocking}
                    >
                        <span className="contact-panel__action-icon">
                            {blocked ? <ShieldOff size={18} /> : <Shield size={18} />}
                        </span>
                        <span className="contact-panel__action-text">
                            {blocking ? 'Please wait...' : blocked ? 'Unblock User' : 'Block User'}
                        </span>
                    </button>
                </div>
            )}
        </div>

        {lightboxUrl && (
            <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}
        </>
    );
};

export default ContactInfoPanel;
