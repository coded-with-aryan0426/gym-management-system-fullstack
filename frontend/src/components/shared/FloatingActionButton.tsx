import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, CheckCircle, Clock, X, User, GripVertical } from 'lucide-react';
import './FloatingActionButton.css';

interface FABMenuItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    primary?: boolean;
    onClick: () => void;
}

interface QuickNoteData {
    clientName?: string;
    sessionType?: string;
    note: string;
}

interface FloatingActionButtonProps {
    currentClient?: {
        name: string;
        sessionType: string;
    };
    onAddNote?: (data: QuickNoteData) => void;
    onQuickLog?: () => void;
    onBlockTime?: () => void;
    className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    currentClient,
    onAddNote,
    onQuickLog,
    onBlockTime,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteText, setNoteText] = useState('');

    // Draggable state
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('fab-position');
        return saved ? parseInt(saved, 10) : 100;
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const dragStartPos = useRef(0);

    // Save position to localStorage
    useEffect(() => {
        localStorage.setItem('fab-position', position.toString());
    }, [position]);

    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartY.current = clientY;
        dragStartPos.current = position;
    }, [position]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const delta = dragStartY.current - clientY;
            const newPos = Math.max(20, Math.min(window.innerHeight - 100, dragStartPos.current + delta));
            setPosition(newPos);
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    const handleToggle = useCallback(() => {
        if (!isDragging) {
            setIsOpen(prev => !prev);
        }
    }, [isDragging]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleAddNote = useCallback(() => {
        setIsOpen(false);
        setShowNoteModal(true);
    }, []);

    const handleSaveNote = useCallback(() => {
        if (onAddNote && noteText.trim()) {
            onAddNote({
                clientName: currentClient?.name,
                sessionType: currentClient?.sessionType,
                note: noteText.trim()
            });
        }
        setNoteText('');
        setShowNoteModal(false);
    }, [currentClient, noteText, onAddNote]);

    const handleQuickLog = useCallback(() => {
        setIsOpen(false);
        onQuickLog?.();
    }, [onQuickLog]);

    const handleBlockTime = useCallback(() => {
        setIsOpen(false);
        onBlockTime?.();
    }, [onBlockTime]);

    const menuItems: FABMenuItem[] = [
        {
            id: 'add-note',
            icon: <FileText size={20} />,
            label: 'Add Note',
            primary: true,
            onClick: handleAddNote
        },
        {
            id: 'quick-log',
            icon: <CheckCircle size={20} />,
            label: 'Quick Log',
            onClick: handleQuickLog
        },
        {
            id: 'block-time',
            icon: <Clock size={20} />,
            label: 'Block Time',
            onClick: handleBlockTime
        }
    ];

    return (
        <>
            {/* FAB Container - Side-docked, Draggable */}
            <div
                className={`fab-container ${isDragging ? 'fab-container--dragging' : ''} ${className}`}
                style={{ bottom: position }}
            >
                {/* Drag Handle */}
                <div
                    className="fab-drag-handle"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    title="Drag to move"
                >
                    <GripVertical size={12} />
                </div>

                {/* Slide-out Panel */}
                <div className={`fab-panel ${isOpen ? 'fab-panel--open' : ''}`}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className="fab-panel__item"
                            onClick={item.onClick}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Trigger Button - Minimal side tab */}
                <button
                    className={`fab-trigger ${isOpen ? 'fab-trigger--open' : ''}`}
                    onClick={handleToggle}
                    aria-label={isOpen ? 'Close menu' : 'Quick actions'}
                    aria-expanded={isOpen}
                >
                    <Plus size={14} className="fab-trigger__icon" />
                </button>
            </div>

            {/* Quick Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <motion.div
                        className="fab-quick-note-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className="fab-quick-note-modal__backdrop"
                            onClick={() => setShowNoteModal(false)}
                        />
                        <motion.div
                            className="fab-quick-note-modal__content"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="fab-quick-note-modal__header">
                                <h3>Quick Note</h3>
                                <button
                                    className="fab-quick-note-modal__close"
                                    onClick={() => setShowNoteModal(false)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {currentClient && (
                                <div className="fab-quick-note-modal__client">
                                    <div className="fab-quick-note-modal__client-avatar">
                                        {currentClient.name.charAt(0)}
                                    </div>
                                    <div className="fab-quick-note-modal__client-info">
                                        <h4>{currentClient.name}</h4>
                                        <span>{currentClient.sessionType}</span>
                                    </div>
                                </div>
                            )}

                            {!currentClient && (
                                <div className="fab-quick-note-modal__client">
                                    <div className="fab-quick-note-modal__client-avatar">
                                        <User size={18} />
                                    </div>
                                    <div className="fab-quick-note-modal__client-info">
                                        <h4>General Note</h4>
                                        <span>No active session</span>
                                    </div>
                                </div>
                            )}

                            <textarea
                                className="fab-quick-note-modal__textarea"
                                placeholder="Enter your note here..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                autoFocus
                            />

                            <div className="fab-quick-note-modal__actions">
                                <button
                                    className="fab-quick-note-modal__btn fab-quick-note-modal__btn--cancel"
                                    onClick={() => setShowNoteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="fab-quick-note-modal__btn fab-quick-note-modal__btn--save"
                                    onClick={handleSaveNote}
                                    disabled={!noteText.trim()}
                                >
                                    Save Note
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingActionButton;
