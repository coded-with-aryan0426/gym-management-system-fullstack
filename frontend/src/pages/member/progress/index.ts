import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';

// Lazy load all tab components for code splitting
export const OverviewTab = lazy(() => import('./OverviewTab'));
export const MetricsTab = lazy(() => import('./MetricsTab'));
export const GoalsTab = lazy(() => import('./GoalsTab'));
export const WorkoutsTab = lazy(() => import('./WorkoutsTab'));
export const PhotosTab = lazy(() => import('./PhotosTab'));
export const TrainerNotesTab = lazy(() => import('./TrainerNotesTab'));

// Lazy load modal components
export const LogProgressModal = lazy(() => import('./components/LogProgressModal'));
export const LogWorkoutModal = lazy(() => import('./components/LogWorkoutModal'));
export const CreateGoalModal = lazy(() => import('./components/CreateGoalModal'));
export const PhotoUploadModal = lazy(() => import('./components/PhotoUploadModal'));
export const PhotoGalleryModal = lazy(() => import('./components/PhotoGalleryModal'));
export const HistoryModal = lazy(() => import('./components/HistoryModal'));

// Loading component for Suspense fallback
export const ProgressLoading = () => (
    <MotionConfig>
        <div className="progress-loading-container">
            <div className="loading-spinner">
                <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ animation: 'spin 1s linear infinite' }}
                >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
            </div>
            <p>Loading progress data...</p>
        </div>
    </MotionConfig>
);

// Error fallback component
export const ProgressError = ({ 
    error, 
    onRetry 
}: { 
    error: Error; 
    onRetry?: () => void 
}) => (
    <div className="progress-error-container">
        <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>
        <h3>Something went wrong</h3>
        <p>{error.message || 'Failed to load progress data'}</p>
        {onRetry && (
            <button className="btn-primary" onClick={onRetry}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Try Again
            </button>
        )}
    </div>
);

// Empty state component
export const ProgressEmpty = ({ 
    title, 
    message, 
    actionLabel, 
    onAction 
}: { 
    title: string; 
    message: string; 
    actionLabel?: string; 
    onAction?: () => void 
}) => (
    <div className="progress-empty-container">
        <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        {actionLabel && onAction && (
            <button className="btn-primary" onClick={onAction}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {actionLabel}
            </button>
        )}
    </div>
);

// Re-export main component as default
export { default } from './MyProgress';