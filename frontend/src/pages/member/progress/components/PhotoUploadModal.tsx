import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Camera, Upload, Calendar, Sparkles } from 'lucide-react';

interface PhotoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    photoFile: File | null;
    setPhotoFile: (file: File | null) => void;
    photoDescription: string;
    setPhotoDescription: (desc: string) => void;
    photoDate: string;
    setPhotoDate: (date: string) => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
    isOpen,
    onClose,
    onSave,
    saving,
    photoFile,
    setPhotoFile,
    photoDescription,
    setPhotoDescription,
    photoDate,
    setPhotoDate
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
                className="modal-content modal-premium-form photo-modal"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium photo-header">
                    <div className="header-badge camera">
                        <Camera size={18} />
                    </div>
                    <div className="header-info">
                        <h2>Visual Milestone</h2>
                        <p>Capture your evolution, one frame at a time</p>
                    </div>
                    <button className="close-btn-circle" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body-compact">
                    <div 
                        className={`premium-upload-zone ${photoFile ? 'has-preview' : ''}`}
                        onClick={() => document.getElementById('premium-photo-input')?.click()}
                    >
                        {photoFile ? (
                            <div className="premium-preview-container">
                                <img src={URL.createObjectURL(photoFile)} alt="Preview" />
                                <div className="preview-overlay-active">
                                    <Upload size={24} />
                                    <span>Change Image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <div className="upload-icon-pulse">
                                    <Upload size={32} />
                                </div>
                                <h3>Select Progress Photo</h3>
                                <p>Drag and drop or tap to browse</p>
                                <span className="upload-hint">High resolution JPG or PNG</span>
                            </div>
                        )}
                        <input 
                            id="premium-photo-input"
                            type="file" 
                            accept="image/*" 
                            onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                            hidden
                        />
                    </div>

                    <div className="photo-meta-grid">
                        <div className="compact-input-group active-focus">
                            <label><Calendar size={12} /> Capture Date</label>
                            <input 
                                type="date" 
                                value={photoDate}
                                onChange={e => setPhotoDate(e.target.value)}
                            />
                        </div>

                        <div className="compact-input-group active-focus">
                            <label><Sparkles size={12} /> Description</label>
                            <input
                                type="text"
                                placeholder="e.g., Front view, morning check-in"
                                value={photoDescription}
                                onChange={e => setPhotoDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="upload-tips-card">
                        <div className="tip-item">
                            <span className="tip-dot"></span>
                            <p>Use consistent lighting and background</p>
                        </div>
                        <div className="tip-item">
                            <span className="tip-dot"></span>
                            <p>Try to capture front, side, and back views</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="btn-ghost-premium" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className={`btn-active-premium photo-btn ${saving ? 'loading' : ''}`} onClick={onSave} disabled={saving || !photoFile}>
                        {saving ? <div className="loader-dots"><span></span><span></span><span></span></div> : (
                            <>
                                <span>Upload Milestone</span>
                                <Check size={16} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PhotoUploadModal;
