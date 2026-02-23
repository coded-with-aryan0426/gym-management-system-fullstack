import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { memberProgressApi } from '../../../services/api';

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

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        const fetchPhotos = async () => {
            if (!memberId) return;

            try {
                setLoading(true);
                const photosData = await memberProgressApi.getPhotos(memberId);
                setPhotos(photosData);
            } catch (error) {
                console.error('Error fetching photos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [memberId]);

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
                    <button className="btn-primary btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
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
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </motion.div>
                    <span>Loading photos...</span>
                </div>
            ) : (
                <div className="photos-grid">
                    {photos.length === 0 ? (
                        <div className="empty-photos">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <h3>No photos yet</h3>
                            <p>Start your visual journey by uploading your first progress photo.</p>
                            <button className="btn-primary">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
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
                                    {photos.map((photo) => (
                                        <option key={photo.recordDate} value={photo.recordDate}>
                                            {getPhotoDate(photo.recordDate)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="photo-gallery">
                                {filteredPhotos.map((photo) => (
                                    <motion.div
                                        key={photo.id}
                                        className="photo-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="photo-container">
                                            <img src={photo.url} alt={photo.description || 'Progress Photo'} />
                                            <div className="photo-overlay">
                                                <button className="photo-action-btn">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button className="photo-action-btn">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
        </motion.div>
    );
};

export default PhotosTab;