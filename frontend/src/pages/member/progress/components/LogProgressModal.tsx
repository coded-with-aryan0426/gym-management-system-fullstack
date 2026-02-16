import React from 'react';
import { motion } from 'framer-motion';

interface LogProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
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
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const headerStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
};

const bodyStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
};

const footerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
};

const hintStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px',
    display: 'block',
};

const sectionTitleStyle: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
};

const LogProgressModal: React.FC<LogProgressModalProps> = ({
    isOpen,
    onClose,
    onSave,
    saving,
    newProgress,
    setNewProgress
}) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={overlayStyle}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={modalStyle}
            >
                {/* Fixed Header */}
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                        Log Today's Progress
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Scrollable Body */}
                <div style={bodyStyle}>
                    {/* Tip Banner */}
                    <div style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.5' }}>
                            Tip: Log at the same time each day for accurate tracking.
                        </span>
                    </div>

                    {/* Body Metrics */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={sectionTitleStyle}>Body Metrics</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Weight (kg)</label>
                                <input type="number" step="0.1" placeholder="e.g., 78.5" value={newProgress.weight}
                                    onChange={e => setNewProgress({ ...newProgress, weight: e.target.value })} style={inputStyle} />
                                <span style={hintStyle}>Morning measurement</span>
                            </div>
                            <div>
                                <label style={labelStyle}>Body Fat (%)</label>
                                <input type="number" step="0.1" placeholder="e.g., 18.5" value={newProgress.bodyFat}
                                    onChange={e => setNewProgress({ ...newProgress, bodyFat: e.target.value })} style={inputStyle} />
                                <span style={hintStyle}>Smart scale or calipers</span>
                            </div>
                            <div>
                                <label style={labelStyle}>Muscle Mass (kg)</label>
                                <input type="number" step="0.1" placeholder="e.g., 35.2" value={newProgress.muscleMass}
                                    onChange={e => setNewProgress({ ...newProgress, muscleMass: e.target.value })} style={inputStyle} />
                                <span style={hintStyle}>From smart scale</span>
                            </div>
                        </div>
                    </div>

                    {/* Body Measurements */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ ...sectionTitleStyle, marginBottom: '8px' }}>Body Measurements (cm)</h4>
                        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280' }}>
                            Measure at the widest/largest point
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Chest</label>
                                <input type="number" step="0.1" placeholder="102" value={newProgress.chest}
                                    onChange={e => setNewProgress({ ...newProgress, chest: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Waist</label>
                                <input type="number" step="0.1" placeholder="85" value={newProgress.waist}
                                    onChange={e => setNewProgress({ ...newProgress, waist: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Hips</label>
                                <input type="number" step="0.1" placeholder="98" value={newProgress.hips}
                                    onChange={e => setNewProgress({ ...newProgress, hips: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Arms</label>
                                <input type="number" step="0.1" placeholder="36" value={newProgress.arms}
                                    onChange={e => setNewProgress({ ...newProgress, arms: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Legs</label>
                                <input type="number" step="0.1" placeholder="58" value={newProgress.legs}
                                    onChange={e => setNewProgress({ ...newProgress, legs: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Shoulders</label>
                                <input type="number" step="0.1" placeholder="115" value={newProgress.shoulders}
                                    onChange={e => setNewProgress({ ...newProgress, shoulders: e.target.value })} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                            Notes (Optional)
                        </h4>
                        <textarea
                            placeholder="How are you feeling? Any observations?"
                            value={newProgress.notes}
                            onChange={e => setNewProgress({ ...newProgress, notes: e.target.value })}
                            rows={3}
                            style={{
                                ...inputStyle,
                                resize: 'vertical',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                </div>

                {/* Fixed Footer */}
                <div style={footerStyle}>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            color: '#374151',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Progress'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LogProgressModal;