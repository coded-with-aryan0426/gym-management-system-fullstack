import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Camera, Trash2, Calendar, LayoutGrid } from 'lucide-react';

interface PhotoGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
    photos: any[];
    handleDeletePhoto: (id: number) => void;
}

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    photos,
    handleDeletePhoto
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
                className="modal-content modal-premium-form modal-xl gallery-modal-premium"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium gallery-header">
                    <div className="header-badge gallery">
                        <LayoutGrid size={18} />
                    </div>
                    <div className="header-info">
                        <h2>Evolution Gallery</h2>
                        <p>{photos.length} visual milestones captured</p>
                    </div>
                    <div className="header-actions-premium">
                        <button className="add-milestone-btn" onClick={onUpload}>
                            <Plus size={14} />
                            <span>Add Milestone</span>
                        </button>
                        <button className="close-btn-circle" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="modal-body-compact gallery-body-scroll">
                    {photos.length > 0 ? (
                        <div className="premium-photo-grid">
                            {photos.map((photo, i) => (
                                <motion.div 
                                  key={photo.id ?? `gallery-${i}`} 
                                      className="premium-gallery-card"
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.05 }}
                                  >
                                      <div className="gallery-image-wrapper">
                                          <img src={photo.photoUrl?.startsWith('http') ? photo.photoUrl : `http://localhost:8081${photo.photoUrl}`} alt={photo.description || 'Progress'} />
                                        <div className="card-overlay-actions">
                                            <button className="delete-photo-premium" onClick={() => handleDeletePhoto(photo.id)} title="Remove Milestone">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="card-date-floating">
                                            <Calendar size={10} />
                                            <span>{new Date(photo.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    {photo.description && (
                                        <div className="gallery-card-info">
                                            <p>{photo.description}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-gallery-premium">
                            <div className="empty-gallery-icon">
                                <Camera size={48} strokeWidth={1} />
                            </div>
                            <h3>The Canvas is Blank</h3>
                            <p>Capture your first visual milestone to begin your transformation timeline.</p>
                            <button className="btn-active-premium" onClick={onUpload}>
                                <Plus size={16} />
                                <span>Upload First Photo</span>
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PhotoGalleryModal;
