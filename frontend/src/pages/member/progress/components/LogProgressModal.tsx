import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info, Scale, Activity, Zap, Ruler, MessageSquare } from 'lucide-react';

interface LogProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    editingEntry: any;
    newProgress: {
        weight: string;
        bodyFat: string;
        muscleMass: string;
        chest: string;
        waist: string;
        arms: string;
        legs: string;
        hips: string;
        shoulders: string;
        notes: string;
    };
    setNewProgress: (progress: any) => void;
    stats?: any;
}

const LogProgressModal: React.FC<LogProgressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    saving,
    editingEntry,
    newProgress,
    setNewProgress,
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
                className="modal-content modal-premium-form"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium">
                    <div className="header-badge">
                        <Activity size={18} />
                    </div>
                    <div className="header-info">
                        <h2>{editingEntry ? 'Refine Record' : 'Daily Progress'}</h2>
                        <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button className="close-btn-circle" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body-compact">
                    {/* Key Metrics Pods */}
                    <div className="metrics-pod-grid">
                        <div className="metric-pod weight">
                            <div className="pod-icon"><Scale size={16} /></div>
                            <div className="pod-content">
                                <label>Weight</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder={stats?.currentWeight ? `${stats.currentWeight}` : "0.0"}
                                        value={newProgress.weight}
                                        onChange={e => setNewProgress({ ...newProgress, weight: e.target.value })}
                                    />
                                    <span>kg</span>
                                </div>
                            </div>
                        </div>
                        <div className="metric-pod fat">
                            <div className="pod-icon"><Zap size={16} /></div>
                            <div className="pod-content">
                                <label>Body Fat</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder={stats?.bodyFat ? `${stats.bodyFat}` : "0.0"}
                                        value={newProgress.bodyFat}
                                        onChange={e => setNewProgress({ ...newProgress, bodyFat: e.target.value })}
                                    />
                                    <span>%</span>
                                </div>
                            </div>
                        </div>
                        <div className="metric-pod muscle">
                            <div className="pod-icon"><Activity size={16} /></div>
                            <div className="pod-content">
                                <label>Muscle</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder={stats?.muscleMass ? `${stats.muscleMass}` : "0.0"}
                                        value={newProgress.muscleMass}
                                        onChange={e => setNewProgress({ ...newProgress, muscleMass: e.target.value })}
                                    />
                                    <span>kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Measurements Section */}
                    <div className="measurements-section-compact">
                        <div className="section-title-compact">
                            <Ruler size={14} />
                            <span>Body Measurements (cm)</span>
                        </div>
                        <div className="compact-grid">
                            <div className="compact-input-group">
                                <label>Chest</label>
                                <input type="number" step="0.1" placeholder={stats?.currentChest || "—"} value={newProgress.chest} onChange={e => setNewProgress({ ...newProgress, chest: e.target.value })} />
                            </div>
                            <div className="compact-input-group">
                                <label>Waist</label>
                                <input type="number" step="0.1" placeholder={stats?.currentWaist || "—"} value={newProgress.waist} onChange={e => setNewProgress({ ...newProgress, waist: e.target.value })} />
                            </div>
                            <div className="compact-input-group">
                                <label>Arms</label>
                                <input type="number" step="0.1" placeholder={stats?.currentArms || "—"} value={newProgress.arms} onChange={e => setNewProgress({ ...newProgress, arms: e.target.value })} />
                            </div>
                            <div className="compact-input-group">
                                <label>Legs</label>
                                <input type="number" step="0.1" placeholder={stats?.currentLegs || "—"} value={newProgress.legs} onChange={e => setNewProgress({ ...newProgress, legs: e.target.value })} />
                            </div>
                            <div className="compact-input-group">
                                <label>Hips</label>
                                <input type="number" step="0.1" placeholder={stats?.currentHips || "—"} value={newProgress.hips} onChange={e => setNewProgress({ ...newProgress, hips: e.target.value })} />
                            </div>
                            <div className="compact-input-group">
                                <label>Shoulders</label>
                                <input type="number" step="0.1" placeholder={stats?.currentShoulders || "—"} value={newProgress.shoulders} onChange={e => setNewProgress({ ...newProgress, shoulders: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Notes Pod */}
                    <div className="notes-pod-compact">
                        <div className="pod-header">
                            <MessageSquare size={14} />
                            <label>Notes & Observations</label>
                        </div>
                        <textarea
                            placeholder="How are you feeling today?"
                            value={newProgress.notes}
                            onChange={e => setNewProgress({ ...newProgress, notes: e.target.value })}
                            rows={2}
                        />
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="btn-ghost-premium" onClick={onClose} disabled={saving}>Discard</button>
                    <button className={`btn-active-premium ${saving ? 'loading' : ''}`} onClick={onSave} disabled={saving}>
                        {saving ? <div className="loader-dots"><span></span><span></span><span></span></div> : (
                            <>
                                <span>Complete Log</span>
                                <Check size={16} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LogProgressModal;
