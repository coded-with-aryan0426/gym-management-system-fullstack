// Micro-Interaction Components for Enhanced Member Action Modal

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Loading Button Component
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary'
}) => {
  return (
    <motion.button
      className={`btn btn--${variant} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-content"
          >
            <div className="loading-spinner-small" />
            <span>Loading...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Success Toast Component
interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  isVisible,
  onClose
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="success-toast"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="success-toast__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <span className="success-toast__message">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Error Toast Component
interface ErrorToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  isVisible,
  onClose,
  onRetry
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="error-toast"
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="error-toast__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <span className="error-toast__message">{message}</span>
          <div className="error-toast__actions">
            {onRetry && (
              <button className="error-toast__retry" onClick={onRetry}>
                Retry
              </button>
            )}
            <button className="error-toast__close" onClick={onClose}>
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Skeleton Loader Component
interface SkeletonLoaderProps {
  type: 'user-card' | 'user-list' | 'text' | 'avatar';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'user-card':
        return (
          <div className={`skeleton-user-card ${className}`}>
            <div className="skeleton-avatar" />
            <div className="skeleton-content">
              <div className="skeleton-text skeleton-text--name" />
              <div className="skeleton-text skeleton-text--email" />
            </div>
          </div>
        );
      case 'user-list':
        return (
          <div className={`skeleton-user-list ${className}`}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="skeleton-user-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-content">
                  <div className="skeleton-text skeleton-text--name" />
                  <div className="skeleton-text skeleton-text--email" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'text':
        return <div className={`skeleton-text ${className}`} />;
      case 'avatar':
        return <div className={`skeleton-avatar ${className}`} />;
      default:
        return <div className={`skeleton-text ${className}`} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="skeleton-container"
    >
      {renderSkeleton()}
    </motion.div>
  );
};

// Hover Card Component
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = '',
  disabled = false
}) => {
  return (
    <motion.div
      className={`hover-card ${className}`}
      whileHover={disabled ? {} : {
        scale: 1.02,
        y: -2,
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

// Pulse Indicator Component
interface PulseIndicatorProps {
  isActive: boolean;
  color?: 'red' | 'green' | 'blue' | 'yellow';
  size?: 'small' | 'medium' | 'large';
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  isActive,
  color = 'red',
  size = 'small'
}) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`pulse-indicator pulse-indicator--${color} pulse-indicator--${size}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  progress: number; // 0-100
  isVisible: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isVisible,
  color = 'primary'
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="progress-bar-container"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
        >
          <motion.div
            className={`progress-bar progress-bar--${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Floating Action Button Component
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  isVisible: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  isVisible,
  position = 'bottom-right'
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={`floating-action-button floating-action-button--${position}`}
          onClick={onClick}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {icon}
        </motion.button>
      )}
    </AnimatePresence>
  );
};