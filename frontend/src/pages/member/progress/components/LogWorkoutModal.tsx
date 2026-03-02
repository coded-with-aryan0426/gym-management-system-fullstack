import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Dumbbell, Trophy, Hash, Scale, MessageSquare, Target } from 'lucide-react';

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
                className="modal-content modal-premium-form pr-modal"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium pr-header">
                    <div className="header-badge trophy">
                        <Trophy size={18} />
                    </div>
                    <div className="header-info">
                        <h2>Record New PR</h2>
                        <p>Push your limits, track your strength</p>
                    </div>
                    <button className="close-btn-circle" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body-compact">
                    {/* Exercise & Category Section */}
                    <div className="form-section-premium">
                        <div className="compact-input-group active-focus">
                            <label><Dumbbell size={12} /> Exercise Name</label>
                            <input
                                type="text"
                                placeholder="What did you crush today?"
                                value={newWorkout.exercise}
                                onChange={e => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                                className="premium-text-input"
                            />
                        </div>
                        
                        <div className="category-select-wrapper">
                            <label>Training Category</label>
                            <select
                                value={newWorkout.category}
                                onChange={e => setNewWorkout({ ...newWorkout, category: e.target.value })}
                            >
                                <option value="push">Push (Chest/Shoulders/Tri)</option>
                                <option value="pull">Pull (Back/Biceps)</option>
                                <option value="legs">Legs (Lower Body)</option>
                                <option value="core">Core & Stability</option>
                                <option value="cardio">Cardio & Endurance</option>
                            </select>
                        </div>
                    </div>

                    {/* PR Pods - Main Metrics */}
                    <div className="metrics-pod-grid pr-pods">
                        <div className="metric-pod weight-pod">
                            <div className="pod-icon"><Scale size={16} /></div>
                            <div className="pod-content">
                                <label>Weight</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.5"
                                        placeholder="0.0"
                                        value={newWorkout.weight}
                                        onChange={e => setNewWorkout({ ...newWorkout, weight: e.target.value })}
                                    />
                                    <select 
                                        className="unit-selector-minimal"
                                        value={newWorkout.unit}
                                        onChange={e => setNewWorkout({ ...newWorkout, unit: e.target.value })}
                                    >
                                        <option value="lbs">lbs</option>
                                        <option value="kg">kg</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="metric-pod reps-pod">
                            <div className="pod-icon"><Hash size={16} /></div>
                            <div className="pod-content">
                                <label>Repetitions</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={newWorkout.reps}
                                        onChange={e => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                                    />
                                    <span>Reps</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="notes-pod-compact">
                        <div className="pod-header">
                            <MessageSquare size={14} />
                            <label>Form Notes (Optional)</label>
                        </div>
                        <textarea
                            placeholder="How did the set feel? Any technical cues?"
                            value={newWorkout.notes}
                            onChange={e => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                            rows={2}
                        />
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="btn-ghost-premium" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className={`btn-active-premium pr-btn ${saving ? 'loading' : ''}`} onClick={onSave} disabled={saving}>
                        {saving ? <div className="loader-dots"><span></span><span></span><span></span></div> : (
                            <>
                                <span>Log Personal Best</span>
                                <Check size={16} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LogWorkoutModal;
