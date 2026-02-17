import React from 'react';
import { motion } from 'framer-motion';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEntry: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    onAddEntry
}) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content modal-xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2>Progress History</h2>
                        <span className="modal-subtitle">View your complete progress timeline</span>
                    </div>
                    <div className="header-actions">
                        <button className="btn-primary btn-sm" onClick={onAddEntry}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Entry
                        </button>
                        <button className="modal-close" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="history-controls">
                        <div className="filter-group">
                            <label>Filter by</label>
                            <select>
                                <option value="all">All Entries</option>
                                <option value="weight">Weight</option>
                                <option value="measurements">Measurements</option>
                                <option value="photos">Photos</option>
                                <option value="goals">Goals</option>
                                <option value="workouts">Workouts</option>
                            </select>
                        </div>
                        <div className="date-range">
                            <label>Date Range</label>
                            <div className="date-inputs">
                                <input type="date" />
                                <span>to</span>
                                <input type="date" />
                            </div>
                        </div>
                    </div>

                    <div className="empty-history">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        <h3>No history yet</h3>
                        <p>Start logging your progress to see your journey here.</p>
                        <button className="btn-primary" onClick={onAddEntry}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Log Progress
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default HistoryModal;