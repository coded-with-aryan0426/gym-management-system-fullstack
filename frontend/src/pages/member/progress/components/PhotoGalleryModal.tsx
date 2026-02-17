import React from 'react';
import { motion } from 'framer-motion';

interface PhotoGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
}

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
    isOpen,
    onClose,
    onUpload
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
                        <h2>Visual Progress Gallery</h2>
                        <span className="modal-subtitle">Track your transformation over time</span>
                    </div>
                    <div className="header-actions">
                        <button className="btn-primary btn-sm" onClick={onUpload}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Photo
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
                    <div className="empty-gallery">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <h3>No photos yet</h3>
                        <p>Start your visual journey by uploading your first progress photo.</p>
                        <button className="btn-primary" onClick={onUpload}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Upload Photo
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PhotoGalleryModal;