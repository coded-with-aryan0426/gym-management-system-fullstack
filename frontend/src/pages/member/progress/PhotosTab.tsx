import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Photo {
    id: number;
    url: string;
    description: string;
    recordDate: string;
    createdAt: string;
}

const PhotosTab: React.FC = () => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [description, setDescription] = useState('');
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchPhotos();
    }, [memberId]);

    const fetchPhotos = async () => {
        if (!memberId) return;
        
        try {
            setLoading(true);
            const photosData = await memberProgressApi.getPhotos(memberId);
            setPhotos(photosData);
        } catch (error) {
            console.error('Error fetching photos:', error);
            toast.error('Failed to load photos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberId || !selectedFile) return;

        try {
            setUploading(true);
            await memberProgressApi.uploadPhoto(memberId, selectedFile, description, recordDate);
            toast.success('Photo uploaded successfully!');
            setShowModal(false);
            resetForm();
            fetchPhotos();
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (photoId: number) => {
        if (!memberId || !confirm('Delete this photo?')) return;

        try {
            await memberProgressApi.deletePhoto(memberId, photoId);
            toast.success('Photo deleted');
            fetchPhotos();
        } catch (error) {
            console.error('Error deleting photo:', error);
            toast.error('Failed to delete photo');
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setDescription('');
        setRecordDate(new Date().toISOString().split('T')[0]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getPhotoDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPhotoTime = (date: string) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredPhotos = selectedDate 
        ? photos.filter(p => p.recordDate === selectedDate)
        : photos;

    return (
        <motion.div className="photos-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            <div className="photos-header">
                <div className="photos-header__left">
                    <h2>Visual Progress</h2>
                    <p>Track your transformation with progress photos</p>
                </div>
                <div className="photos-header__actions">
                    <button className="btn-primary btn-sm" onClick={openModal}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Photo
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="photos-loading">
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                    </motion.div>
                    <span>Loading photos...</span>
                </div>
            ) : (
                <div className="photos-grid">
                    {photos.length === 0 ? (
                        <div className="empty-photos">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <h3>No photos yet</h3>
                            <p>Start your visual journey by uploading your first progress photo.</p>
                            <button className="btn-primary" onClick={openModal}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Upload Photo
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="photo-filters">
                                <label>Date Filter</label>
                                <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
                                    <option value="">All Photos</option>
                                    {photos.map((photo, opi) => (
                                        <option key={`opt-${opi}-${photo.recordDate}`} value={photo.recordDate}>
                                            {getPhotoDate(photo.recordDate)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="photo-gallery">
                                {filteredPhotos.map((photo, fpi) => (
                                    <motion.div
                                        key={`fphoto-${fpi}-${photo.id ?? ''}`}
                                        className="photo-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="photo-container">
                                            <img src={photo.url} alt={photo.description || 'Progress Photo'} />
                                            <div className="photo-overlay">
                                                <button className="photo-action-btn">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                </button>
                                            <button className="photo-action-btn" onClick={() => handleDelete(photo.id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                            </div>
                                        </div>

                                        <div className="photo-info">
                                            <div className="photo-meta">
                                                <span className="photo-date">{getPhotoDate(photo.recordDate)}</span>
                                                <span className="photo-time">{getPhotoTime(photo.createdAt)}</span>
                                            </div>
                                            {photo.description && (
                                                <p className="photo-description">{photo.description}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Photo Upload Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Upload Progress Photo</h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpload} className="modal-form">
                                <div className="form-group">
                                    <label>Photo</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        required
                                    />
                                    {previewUrl && (
                                        <div className="photo-preview">
                                            <img src={previewUrl} alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={recordDate}
                                        onChange={(e) => setRecordDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Add notes about your progress..."
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Upload Photo'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PhotosTab;