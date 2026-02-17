import React from 'react';
import { motion } from 'framer-motion';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    newGoal: {
        title: string;
        type: string;
        currentValue: string;
        targetValue: string;
        unit: string;
        targetDate: string;
        weeklyTarget: string;
    };
    setNewGoal: (goal: any) => void;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
    isOpen,
    onClose,
    onSave,
    saving,
    newGoal,
    setNewGoal
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
                    <h2>Create New Goal</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Goal Title</label>
                        <input
                            type="text"
                            placeholder="e.g., Reach 75kg, Build 5kg Muscle"
                            value={newGoal.title}
                            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Goal Type</label>
                        <select
                            value={newGoal.type}
                            onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                        >
                            <option value="weight">Weight Loss/Gain</option>
                            <option value="muscle">Muscle Mass</option>
                            <option value="bodyFat">Body Fat Percentage</option>
                            <option value="strength">Strength (Lift Weight)</option>
                            <option value="endurance">Endurance</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Current Value</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="e.g., 80.5"
                                value={newGoal.currentValue}
                                onChange={e => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Target Value</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="e.g., 75.0"
                                value={newGoal.targetValue}
                                onChange={e => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Unit</label>
                            <select
                                value={newGoal.unit}
                                onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                            >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                                <option value="%">%</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Weekly Target (optional)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="e.g., 0.5"
                                value={newGoal.weeklyTarget}
                                onChange={e => setNewGoal({ ...newGoal, weeklyTarget: e.target.value })}
                            />
                            <span className="form-hint">How much change per week</span>
                        </div>
                        <div className="form-group">
                            <label>Target Date (optional)</label>
                            <input
                                type="date"
                                value={newGoal.targetDate}
                                onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                            />
                        </div>
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
                        Create Goal
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CreateGoalModal;