import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    X, Calendar, BarChart2, Star, Bell, Pin,
    Phone, Video, Image as ImageIcon, FileText, Shield
} from 'lucide-react';

interface ContactInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactInfoPanel: React.FC<ContactInfoPanelProps> = ({ isOpen, onClose }) => {
    const { activeConversation } = useChat();
    const { user } = useAuth();

    if (!activeConversation) return null;

    // Get the other participant for display
    const getOtherParticipant = () => {
        if (activeConversation.type === 'GROUP') {
            return {
                name: activeConversation.title || 'Group Chat',
                initials: 'G',
                role: 'GROUP'
            };
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
            case 'TRAINER':
                return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
            case 'OWNER':
                return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
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
            case 'NUTRITIONIST':
                return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
            default:
                return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    };

    const otherParticipant = getOtherParticipant();

    return (
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
                <span className="contact-panel__status">Online now</span>
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

            {/* Shared Media Section */}
            <div className="contact-panel__section">
                <h5 className="contact-panel__section-title">Shared Media</h5>

                <div className="contact-panel__action">
                    <span className="contact-panel__action-icon"><ImageIcon size={18} /></span>
                    <span className="contact-panel__action-text">Photos & Videos</span>
                </div>

                <div className="contact-panel__action">
                    <span className="contact-panel__action-icon"><FileText size={18} /></span>
                    <span className="contact-panel__action-text">Documents</span>
                </div>
            </div>

            {/* Privacy Section */}
            <div className="contact-panel__section">
                <h5 className="contact-panel__section-title">Privacy</h5>

                <div
                    className="contact-panel__action"
                    style={{ color: '#ef4444' }}
                >
                    <span className="contact-panel__action-icon"><Shield size={18} /></span>
                    <span className="contact-panel__action-text">Block User</span>
                </div>
            </div>
        </div>
    );
};

export default ContactInfoPanel;
