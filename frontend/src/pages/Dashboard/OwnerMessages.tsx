import React, { useState } from 'react';
import { Dumbbell, Megaphone, UserCircle, X } from 'lucide-react';
import ChatLayout from '../../components/chat/ChatLayout';
import ActionBar, { ActionItem } from '../../components/chat/ActionBar';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './OwnerMessages.css';

type OwnerModal = 'announce' | null;

const OWNER_ACTIONS: ActionItem[] = [
    {
        id: 'profile',
        label: 'View Member Profile',
        icon: UserCircle,
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)',
        description: "Open this member's full profile",
    },
    {
        id: 'trainer',
        label: 'View Trainer Profile',
        icon: Dumbbell,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        description: "Open this trainer's full profile",
    },
    {
        id: 'announce',
        label: 'Send Announcement',
        icon: Megaphone,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.25)',
        description: 'Broadcast a message to all gym members',
    },
];

/* ── Announcement Modal ───────────────────────────────────────── */
const AnnouncementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { sendMessage } = useChat();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            sendMessage(message.trim(), 'TEXT');
            toast.success('Announcement sent!');
            onClose();
        } catch {
            toast.error('Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="chat-modal-overlay" onClick={onClose}>
            <div className="chat-modal" onClick={e => e.stopPropagation()}>
                <div className="chat-modal__header">
                    <div className="chat-modal__title">
                        <Megaphone size={16} />
                        <span>Send Announcement</span>
                    </div>
                    <button className="chat-modal__close" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="chat-modal__body">
                    <label className="chat-modal__label">Message</label>
                    <textarea
                        className="chat-modal__textarea"
                        rows={5}
                        placeholder="Type your announcement..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="chat-modal__footer">
                    <button className="chat-modal__cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="chat-modal__submit"
                        onClick={handleSend}
                        disabled={!message.trim() || sending}
                    >
                        {sending ? 'Sending…' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Page ─────────────────────────────────────────────────────── */
const OwnerMessages: React.FC = () => {
    const { activeConversation } = useChat();
    const { user } = useAuth();
    const [openModal, setOpenModal] = useState<OwnerModal>(null);

    const handleAction = (id: string) => {
        if (id === 'announce') {
            setOpenModal('announce');
            return;
        }
        const other = activeConversation?.participants.find(
            p => p.userId !== (user?.userId || Number(user?.id))
        );
        if (!other) return;
        if (id === 'profile') window.open(`/members/${other.userId}`, '_blank');
        if (id === 'trainer') window.open(`/trainers/${other.userId}`, '_blank');
    };

    return (
        <div className="messages-page-wrapper">
            <ChatLayout />

            <ActionBar
                triggerIcon={Megaphone}
                triggerLabel="Owner Actions"
                actions={OWNER_ACTIONS}
                onAction={handleAction}
            />

            {openModal === 'announce' && (
                <AnnouncementModal onClose={() => setOpenModal(null)} />
            )}
        </div>
    );
};

export default OwnerMessages;
