import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { memberProgressApi } from '../../../services/api';
import type { NoteDTO } from '../../../services/api';

interface Note extends NoteDTO { }

const TrainerNotesTab: React.FC = () => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

    useEffect(() => {
        const fetchNotes = async () => {
            if (!memberId) return;

            try {
                setLoading(true);
                const notesData = await memberProgressApi.getNotes(memberId);
                setNotes(notesData);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [memberId]);

    const getCategoryName = (category: string) => {
        const categories: Record<string, string> = {
            nutrition: 'Nutrition',
            workout: 'Workout',
            motivation: 'Motivation',
            assessment: 'Assessment',
            general: 'General'
        };
        return categories[category] || category;
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getImportanceIcon = (importance: string) => {
        switch (importance) {
            case 'high': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            );
            case 'medium': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
            );
            case 'low': return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            );
            default: return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            );
        }
    };

    const filteredNotes = notes.filter(note => {
        const categoryMatch = selectedCategory === 'all' || note.category === selectedCategory;
        const unreadMatch = !showUnreadOnly || !note.isRead;
        return categoryMatch && unreadMatch;
    });

    return (
        <motion.div className="notes-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            <div className="notes-header">
                <div className="notes-header__left">
                    <h2>Trainer Notes</h2>
                    <p>Messages and feedback from your trainer</p>
                </div>
                <div className="notes-header__stats">
                    <div className="note-stats">
                        <span className="stat-label">Total Notes</span>
                        <span className="stat-value">{notes.length}</span>
                    </div>
                    <div className="note-stats">
                        <span className="stat-label">Unread</span>
                        <span className="stat-value">{notes.filter(n => !n.isRead).length}</span>
                    </div>
                </div>
            </div>

            <div className="notes-controls">
                <div className="filter-group">
                    <label>Filter by Category</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="nutrition">Nutrition</option>
                        <option value="workout">Workout</option>
                        <option value="motivation">Motivation</option>
                        <option value="assessment">Assessment</option>
                        <option value="general">General</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={showUnreadOnly}
                            onChange={e => setShowUnreadOnly(e.target.checked)}
                        />
                        Show Unread Only
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="notes-loading">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </motion.div>
                    <span>Loading notes...</span>
                </div>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.length === 0 ? (
                        <div className="empty-notes">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            <h3>No notes yet</h3>
                            <p>Your trainer will send messages and feedback here</p>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <motion.div
                                key={note.id}
                                className={`note-card ${note.isRead ? 'read' : 'unread'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="note-card__header">
                                    <div className="note-icon">
                                        {getImportanceIcon(note.importance)}
                                    </div>
                                    <div className="note-info">
                                        <h3>{note.title}</h3>
                                        <div className="note-meta">
                                            <span className="note-category">{getCategoryName(note.category)}</span>
                                            <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="note-actions">
                                        <button className="note-action-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className="note-action-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="note-content">
                                    <p>{note.content}</p>
                                </div>

                                <div className="note-footer">
                                    <div className="note-importance" style={{ backgroundColor: getImportanceColor(note.importance) }}>
                                        {note.importance.toUpperCase()}
                                    </div>
                                    <button className="btn-secondary btn-sm">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2v20" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                        Mark as Read
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default TrainerNotesTab;