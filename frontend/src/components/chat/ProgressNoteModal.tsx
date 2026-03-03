import React, { useState, useEffect } from 'react';
import { X, FileText, Loader } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import { showToast } from '../../utils/toast';
import { format } from 'date-fns';

interface ProgressNoteModalProps {
    onClose: () => void;
}

interface ProgressNote {
    id: number;
    date: string;
    sessionType?: string;
    category?: string;
    content?: string;
    mood?: string;
    member?: { name?: string };
    stats?: { label: string; value: string }[];
}

const ProgressNoteModal: React.FC<ProgressNoteModalProps> = ({ onClose }) => {
    const { activeConversation, sendMessage } = useChat();
    const { user } = useAuth();
    const [notes, setNotes] = useState<ProgressNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ProgressNote | null>(null);
    const [sending, setSending] = useState(false);

    const getMemberId = () => {
        if (!activeConversation) return null;
        const currentUserId = user?.userId || Number(user?.id);
        const other = activeConversation.participants?.find(
            (p: any) => Number(p.userId) !== currentUserId
        );
        return other?.userId ?? null;
    };

    useEffect(() => {
        const memberId = getMemberId();
        if (!memberId) { setLoading(false); return; }

        setLoading(true);
        apiClient.get(`/members/${memberId}/progress-notes`)
            .then(res => {
                const data = res.data?.data ?? res.data ?? [];
                const arr = Array.isArray(data) ? data : [];
                setNotes(arr.slice(0, 10)); // last 10
            })
            .catch(() => setNotes([]))
            .finally(() => setLoading(false));
    }, [activeConversation]);

    const handleShare = async () => {
        if (!selected) return;
        setSending(true);
        try {
            const payload = JSON.stringify({
                noteId: selected.id,
                date: selected.date,
                sessionType: selected.sessionType,
                category: selected.category,
                content: selected.content,
                mood: selected.mood,
                stats: selected.stats ?? [],
            });
            const preview = selected.content
                ? selected.content.substring(0, 60) + (selected.content.length > 60 ? '...' : '')
                : 'Progress note';
            await sendMessage(preview, 'TEXT', payload);
            showToast.success('Progress note shared!');
            onClose();
        } catch {
            showToast.error('Failed to share progress note');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try { return format(new Date(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
    };

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal--sm">
                <div className="modal__header">
                    <div className="modal__header-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                        <FileText size={18} />
                    </div>
                    <h2 className="modal__title">Share Progress Note</h2>
                    <button className="modal__close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="modal__body">
                    {loading ? (
                        <div className="modal__loading">
                            <Loader size={24} className="spin" />
                            <span>Loading notes...</span>
                        </div>
                    ) : notes.length === 0 ? (
                        <p className="modal__empty">No progress notes found for this member.</p>
                    ) : (
                        <div className="plan-list">
                            {notes.map(note => (
                                <button
                                    key={note.id}
                                    className={`plan-item ${selected?.id === note.id ? 'plan-item--selected' : ''}`}
                                    onClick={() => setSelected(note)}
                                >
                                    <div className="plan-item__info">
                                        <span className="plan-item__name">
                                            {formatDate(note.date)}
                                            {note.sessionType && ` — ${note.sessionType}`}
                                        </span>
                                        {note.content && (
                                            <span className="plan-item__desc">
                                                {note.content.substring(0, 80)}{note.content.length > 80 ? '...' : ''}
                                            </span>
                                        )}
                                        {note.category && (
                                            <span className="plan-item__meta">{note.category}</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn--primary"
                        disabled={!selected || sending}
                        onClick={handleShare}
                    >
                        {sending ? 'Sharing...' : 'Share Note'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgressNoteModal;
