import React from 'react';
import { motion } from 'framer-motion';

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
                className="modal-content"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Add Progress Photo</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <div 
                        className={`photo-upload-zone ${photoFile ? 'has-file' : ''}`}
                        onClick={() => document.getElementById('photo-input')?.click()}
                    >
                        {photoFile ? (
                            <div className="photo-preview-container">
                                <img src={URL.createObjectURL(photoFile)} alt="Preview" />
                                <div className="change-photo-overlay">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    <span>Change Photo</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <p>Click to select or drag progress photo</p>
                                <span>JPG, PNG up to 10MB</span>
                            </>
                        )}
                        <input 
                            id="photo-input"
                            type="file" 
                            accept="image/*" 
                            onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                            hidden
                        />
                    </div>

                    <div className="form-group mt-4">
                        <label>Record Date</label>
                        <input 
                            type="date" 
                            value={photoDate}
                            onChange={e => setPhotoDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            placeholder="Front view, side view, etc."
                            value={photoDescription}
                            onChange={e => setPhotoDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="photo-tips">
                        <h4>Tips for Progress Photos</h4>
                        <ul>
                            <li>Use consistent lighting and background</li>
                            <li>Take photos at the same time of day</li>
                            <li>Include front, side, and back views</li>
                        </ul>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className={`btn-primary ${saving ? 'loading' : ''}`} onClick={onSave} disabled={saving || !photoFile}>
                        {saving ? <div className="spinner-small"></div> : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/>
                                    <polyline points="16 16 12 12 16 8"/>
                                    <line x1="12" y1="12" x2="22" y2="12"/>
                                </svg>
                                <span>Upload Photo</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PhotoUploadModal;