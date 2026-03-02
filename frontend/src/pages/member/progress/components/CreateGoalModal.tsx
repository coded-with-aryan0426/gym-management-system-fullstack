import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Target, TrendingUp, Calendar, Ruler, Scale, Activity } from 'lucide-react';

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
    stats?: any;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
    isOpen,
    onClose,
    onSave,
    saving,
    newGoal,
    setNewGoal,
    stats = {}
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
                className="modal-content modal-premium-form goal-modal"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium goal-header">
                    <div className="header-badge target">
                        <Target size={18} />
                    </div>
                    <div className="header-info">
                        <h2>Define Your Goal</h2>
                        <p>Set a target and track your ascent</p>
                    </div>
                    <button className="close-btn-circle" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body-compact">
                    <div className="compact-input-group active-focus">
                        <label>Goal Title</label>
                        <input
                            type="text"
                            placeholder="e.g., Summer Body Transformation"
                            value={newGoal.title}
                            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                            className="premium-text-input"
                        />
                    </div>

                    <div className="goal-type-grid">
                        <div className={`goal-type-option ${newGoal.type === 'weight' ? 'active' : ''}`} onClick={() => setNewGoal({...newGoal, type: 'weight', unit: 'kg'})}>
                            <Scale size={16} />
                            <span>Weight</span>
                        </div>
                        <div className={`goal-type-option ${newGoal.type === 'bodyFat' ? 'active' : ''}`} onClick={() => setNewGoal({...newGoal, type: 'bodyFat', unit: '%'})}>
                            <TrendingUp size={16} />
                            <span>Body Fat</span>
                        </div>
                        <div className={`goal-type-option ${newGoal.type === 'muscle' ? 'active' : ''}`} onClick={() => setNewGoal({...newGoal, type: 'muscle', unit: 'kg'})}>
                            <Activity size={16} />
                            <span>Muscle</span>
                        </div>
                    </div>

                    <div className="metrics-pod-grid goal-pods">
                        <div className="metric-pod current-pod">
                            <div className="pod-content">
                                <label>Current</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder={`${stats?.currentWeight || "0.0"}`}
                                        value={newGoal.currentValue}
                                        onChange={e => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                                    />
                                    <span>{newGoal.unit}</span>
                                </div>
                            </div>
                        </div>
                        <div className="metric-pod target-pod">
                            <div className="pod-content">
                                <label>Target</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        value={newGoal.targetValue}
                                        onChange={e => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                                    />
                                    <span>{newGoal.unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row-compact">
                        <div className="compact-input-group flex-1">
                            <label><Calendar size={12} /> Target Date</label>
                            <input
                                type="date"
                                value={newGoal.targetDate}
                                onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                            />
                        </div>
                        <div className="compact-input-group flex-1">
                            <label><TrendingUp size={12} /> Weekly Pace</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="0.5"
                                value={newGoal.weeklyTarget}
                                onChange={e => setNewGoal({ ...newGoal, weeklyTarget: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="btn-ghost-premium" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className={`btn-active-premium goal-btn ${saving ? 'loading' : ''}`} onClick={onSave} disabled={saving}>
                        {saving ? <div className="loader-dots"><span></span><span></span><span></span></div> : (
                            <>
                                <span>Activate Goal</span>
                                <Check size={16} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CreateGoalModal;
