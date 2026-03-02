import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Edit3, Trash2, Check, Info, History, Plus, TrendingDown, TrendingUp, ArrowRight, Trophy } from 'lucide-react';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEntry: () => void;
    progressEntries?: any[];
    handleEditEntry?: (entry: any) => void;
    handleDeleteEntry?: (id: number) => void;
    deleteTarget?: number | null;
    setDeleteTarget?: (id: number | null) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    onAddEntry,
    progressEntries = [],
    handleEditEntry = () => {},
    handleDeleteEntry = () => {},
    deleteTarget = null,
    setDeleteTarget = () => {}
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
                className="modal-content modal-premium-form modal-xl history-journey-modal"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium journey-header">
                    <div className="header-badge journey">
                        <History size={18} />
                    </div>
                    <div className="header-info">
                        <h2>Progress Journey</h2>
                        <div className="header-stats-mini">
                            <span className="stat-tag">
                                <strong>{progressEntries.length}</strong> {progressEntries.length === 1 ? 'Milestone' : 'Milestones'}
                            </span>
                            {progressEntries.length > 1 && (
                                <>
                                    <span className="stat-separator"></span>
                                    <span className="stat-tag journey-duration">
                                        <Calendar size={12} />
                                        {Math.ceil((new Date(progressEntries[progressEntries.length-1].date).getTime() - new Date(progressEntries[0].date).getTime()) / (1000 * 60 * 60 * 24))} Days
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="header-actions-premium">
                        <button className="add-milestone-btn" onClick={onAddEntry}>
                            <Plus size={14} />
                            <span>New Entry</span>
                        </button>
                        <button className="close-btn-circle" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="modal-body-compact journey-body-scroll">
                    {progressEntries.length > 0 ? (
                        <div className="premium-timeline">
                            {progressEntries.length > 1 && (
                                <motion.div 
                                    className="timeline-summary-card"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="summary-stat-group">
                                        <div className="summary-icon">
                                            <Trophy size={18} />
                                        </div>
                                        <div className="summary-details">
                                            <h4>Transformation Summary</h4>
                                            <div className="summary-pills">
                                                {progressEntries[progressEntries.length-1].weight && progressEntries[0].weight && (
                                                    <div className="summary-mini-pill">
                                                        <span>Weight:</span>
                                                        <strong>{(progressEntries[progressEntries.length-1].weight - progressEntries[0].weight).toFixed(1)}kg</strong>
                                                    </div>
                                                )}
                                                {progressEntries[progressEntries.length-1].bodyFat && progressEntries[0].bodyFat && (
                                                    <div className="summary-mini-pill">
                                                        <span>Body Fat:</span>
                                                        <strong>{(progressEntries[progressEntries.length-1].bodyFat - progressEntries[0].bodyFat).toFixed(1)}%</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {[...progressEntries].reverse().map((entry, i) => {
                                const prev = progressEntries[progressEntries.length - i - 2];
                                const weightChange = prev && entry.weight && prev.weight ? entry.weight - prev.weight : 0;
                                const fatChange = prev && entry.bodyFat && prev.bodyFat ? entry.bodyFat - prev.bodyFat : 0;

                                return (
                                    <motion.div 
                                        key={`entry-${i}-${entry.id ?? ''}`} 
                                        className="timeline-milestone"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div className="milestone-date-rail">
                                            <div className="rail-dot"></div>
                                            <div className="rail-line"></div>
                                            <span className="milestone-date-text">
                                                {new Date(entry.date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="milestone-year">{new Date(entry.date).getFullYear()}</span>
                                        </div>

                                        <div className="milestone-card-premium">
                                            <div className="milestone-metrics">
                                                {entry.weight && (
                                                    <div className="milestone-pill weight">
                                                        <label>Weight</label>
                                                        <div className="pill-value-group">
                                                            <span className="value">{entry.weight}kg</span>
                                                            {weightChange !== 0 && (
                                                                <div className={`trend-tag ${weightChange < 0 ? 'good' : 'bad'}`}>
                                                                    {weightChange < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                                                                    {Math.abs(weightChange).toFixed(1)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {entry.bodyFat && (
                                                    <div className="milestone-pill fat">
                                                        <label>Body Fat</label>
                                                        <div className="pill-value-group">
                                                            <span className="value">{entry.bodyFat}%</span>
                                                            {fatChange !== 0 && (
                                                                <div className={`trend-tag ${fatChange < 0 ? 'good' : 'bad'}`}>
                                                                    {fatChange < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                                                                    {Math.abs(fatChange).toFixed(1)}%
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {entry.muscleMass && (
                                                    <div className="milestone-pill muscle">
                                                        <label>Muscle</label>
                                                        <span className="value">{entry.muscleMass}kg</span>
                                                    </div>
                                                )}
                                            </div>

                                            {(entry.chest || entry.waist || entry.arms || entry.legs) && (
                                                <div className="milestone-sub-metrics">
                                                    {entry.chest && <div className="sub-metric"><span>Chest</span> <strong>{entry.chest}cm</strong></div>}
                                                    {entry.waist && <div className="sub-metric"><span>Waist</span> <strong>{entry.waist}cm</strong></div>}
                                                    {entry.arms && <div className="sub-metric"><span>Arms</span> <strong>{entry.arms}cm</strong></div>}
                                                    {entry.legs && <div className="sub-metric"><span>Legs</span> <strong>{entry.legs}cm</strong></div>}
                                                </div>
                                            )}

                                            {entry.notes && (
                                                <div className="milestone-notes">
                                                    <Info size={12} />
                                                    <p>{entry.notes}</p>
                                                </div>
                                            )}

                                            <div className="milestone-actions">
                                                <button className="milestone-btn edit" onClick={() => handleEditEntry(entry)}>
                                                    <Edit3 size={14} />
                                                </button>
                                                {deleteTarget === entry.id ? (
                                                    <div className="inline-confirm-premium">
                                                        <button className="confirm-yes" onClick={() => { handleDeleteEntry(entry.id); setDeleteTarget(null); }}>
                                                            <Check size={14} />
                                                        </button>
                                                        <button className="confirm-no" onClick={() => setDeleteTarget(null)}>
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="milestone-btn delete" onClick={() => setDeleteTarget(entry.id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-journey-premium">
                            <div className="empty-journey-icon">
                                <History size={48} strokeWidth={1} />
                            </div>
                            <h3>A Journey of a Thousand Miles...</h3>
                            <p>Begins with your first entry. Start tracking your transformation today.</p>
                            <button className="btn-active-premium" onClick={onAddEntry}>
                                <Plus size={16} />
                                <span>Record First Milestone</span>
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default HistoryModal;
