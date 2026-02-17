import React from 'react';
import { motion } from 'framer-motion';

interface LogWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    newWorkout: {
        exercise: string;
        weight: string;
        reps: string;
        unit: string;
        category: string;
        notes: string;
    };
    setNewWorkout: (workout: any) => void;
}

const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({
    isOpen,
    onClose,
    onSave,
    saving,
    newWorkout,
    setNewWorkout
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
                className="modal-content"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Log Personal Record</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Exercise Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Bench Press, Squat, Deadlift"
                            value={newWorkout.exercise}
                            onChange={e => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={newWorkout.category}
                            onChange={e => setNewWorkout({ ...newWorkout, category: e.target.value })}
                        >
                            <option value="push">Push (Chest, Shoulders, Triceps)</option>
                            <option value="pull">Pull (Back, Biceps)</option>
                            <option value="legs">Legs (Quads, Hamstrings, Glutes)</option>
                            <option value="core">Core (Abs, Obliques)</option>
                            <option value="cardio">Cardio / Endurance</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>Weight</label>
                            <input
                                type="number"
                                placeholder="e.g., 185"
                                value={newWorkout.weight}
                                onChange={e => setNewWorkout({ ...newWorkout, weight: e.target.value })}
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>Unit</label>
                            <select
                                value={newWorkout.unit}
                                onChange={e => setNewWorkout({ ...newWorkout, unit: e.target.value })}
                            >
                                <option value="lbs">lbs</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>Reps</label>
                            <input
                                type="number"
                                placeholder="e.g., 5"
                                value={newWorkout.reps}
                                onChange={e => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes (optional)</label>
                        <textarea
                            placeholder="How did it feel? Any form notes?"
                            value={newWorkout.notes}
                            onChange={e => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={onSave}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/>
                            <polyline points="16 16 12 12 16 8"/>
                            <line x1="12" y1="12" x2="22" y2="12"/>
                        </svg>
                        Log PR
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LogWorkoutModal;