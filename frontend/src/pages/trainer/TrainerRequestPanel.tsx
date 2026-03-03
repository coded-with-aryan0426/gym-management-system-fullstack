import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Mail, Phone, Clock, CheckCircle2, XCircle,
    MessageSquare, User, Zap, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import './TrainerNotifications.css';

export interface TrainerRequestData {
    id: number;
    status: string;
    memberMessage: string | null;
    createdAt: string;
    member: {
        userId: number;
        name: string;
        email: string;
        phone?: string;
    };
}

interface TrainerRequestPanelProps {
    request: TrainerRequestData;
    onClose: () => void;
    onResolved: (requestId: number, newStatus: 'ACCEPTED' | 'DECLINED') => void;
}

const TrainerRequestPanel: React.FC<TrainerRequestPanelProps> = ({ request, onClose, onResolved }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
    const maxNote = 300;

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleAccept = async () => {
        setLoading('accept');
        try {
            await api.post(`/trainer-requests/${request.id}/accept`, { note: note.trim() || undefined });
            toast.success(`${request.member.name} added to your members!`);
            onResolved(request.id, 'ACCEPTED');
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to accept request');
        } finally {
            setLoading(null);
        }
    };

    const handleDecline = async () => {
        setLoading('decline');
        try {
            await api.post(`/trainer-requests/${request.id}/decline`, { note: note.trim() || undefined });
            toast.success('Request declined.');
            onResolved(request.id, 'DECLINED');
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to decline request');
        } finally {
            setLoading(null);
        }
    };

    return (
        <motion.div
            className="trm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="trm-modal"
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 28, scale: 0.96 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header — member info */}
                <div className="trm-header">
                    <div className="trm-header__avatar">
                        {(request.member.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div className="trm-header__info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h2 className="trm-header__name">{request.member.name}</h2>
                            <span className="trm-header__badge trm-header__badge--new">New Request</span>
                            <span className="trm-header__badge trm-header__badge--time">
                                <Clock size={9} /> {formatTime(request.createdAt)}
                            </span>
                        </div>
                        <div className="trm-header__meta">
                            <span><Mail size={11} /> {request.member.email}</span>
                            {request.member.phone && <span><Phone size={11} /> {request.member.phone}</span>}
                            <span><User size={11} /> Member</span>
                        </div>
                    </div>
                    <button className="trm-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* Member's message */}
                <div className="trm-message-section">
                    <p className="trm-message-label">
                        <MessageSquare size={10} style={{ display: 'inline', marginRight: 4 }} />
                        Their message
                    </p>
                    {request.memberMessage ? (
                        <div className="trm-message-bubble">
                            "{request.memberMessage}"
                        </div>
                    ) : (
                        <p className="trm-no-message">No message provided — they'd like you to be their trainer.</p>
                    )}
                </div>

                {/* Your response note */}
                <div className="trm-note-section">
                    <p className="trm-note-label">Your response note <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(optional)</span></p>
                    <textarea
                        className="trm-note-textarea"
                        placeholder={`e.g. "Welcome! Let's start with an assessment on Monday." or "My schedule is full right now, please try again next month."`}
                        value={note}
                        onChange={e => setNote(e.target.value.slice(0, maxNote))}
                        rows={3}
                    />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                        {note.length}/{maxNote}
                    </span>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '8px', lineHeight: '1.5' }}>
                        <Check size={10} style={{ display: 'inline', marginRight: 4 }} />
                        {request.member.name} will be notified of your decision with your note.
                    </p>
                </div>

                {/* Actions */}
                <div className="trm-footer">
                    <button
                        className="trm-btn-decline"
                        onClick={handleDecline}
                        disabled={loading !== null}
                    >
                        {loading === 'decline' ? (
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <Zap size={14} />
                            </motion.span>
                        ) : (
                            <XCircle size={15} />
                        )}
                        {loading === 'decline' ? 'Declining…' : 'Decline'}
                    </button>
                    <button
                        className="trm-btn-accept"
                        onClick={handleAccept}
                        disabled={loading !== null}
                    >
                        {loading === 'accept' ? (
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <Zap size={14} />
                            </motion.span>
                        ) : (
                            <CheckCircle2 size={15} />
                        )}
                        {loading === 'accept' ? 'Accepting…' : `Accept — Add ${request.member.name.split(' ')[0]}`}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TrainerRequestPanel;
