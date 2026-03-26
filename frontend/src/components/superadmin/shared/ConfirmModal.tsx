import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, AlertCircle, Info, Loader2 } from 'lucide-react';
import './ConfirmModal.css';

export type ConfirmModalVariant = 'danger' | 'warning' | 'info' | 'critical';

export interface ConfirmModalAction {
  label: string;
  variant?: 'primary' | 'danger' | 'warning' | 'ghost';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  icon?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  loading?: boolean;
  actions?: ConfirmModalAction[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  auditInfo?: {
    actionType: string;
    targetEntity?: string;
    targetEntityId?: string;
  };
}

const variantConfig: Record<ConfirmModalVariant, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  primaryBtn: string;
  overlay: string;
}> = {
  danger: {
    icon: <AlertTriangle size={28} />,
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#ef4444',
    primaryBtn: 'var(--color-danger, #ef4444)',
    overlay: 'rgba(239, 68, 68, 0.05)'
  },
  warning: {
    icon: <AlertCircle size={28} />,
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    primaryBtn: 'var(--color-warning, #f59e0b)',
    overlay: 'rgba(245, 158, 11, 0.05)'
  },
  info: {
    icon: <Info size={28} />,
    iconBg: 'rgba(59, 130, 246, 0.12)',
    iconColor: '#3b82f6',
    primaryBtn: 'var(--color-info, #3b82f6)',
    overlay: 'rgba(59, 130, 246, 0.05)'
  },
  critical: {
    icon: <ShieldAlert size={28} />,
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: '#ef4444',
    primaryBtn: 'var(--color-critical, #dc2626)',
    overlay: 'rgba(239, 68, 68, 0.08)'
  }
};

const sizeConfig = {
  sm: { maxWidth: 360 },
  md: { maxWidth: 440 },
  lg: { maxWidth: 520 }
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  loading = false,
  actions,
  size = 'md',
  className = '',
  auditInfo
}) => {
  const config = variantConfig[variant];
  const sizeStyles = sizeConfig[size];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`sa-confirm-modal-overlay ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <motion.div
            className="sa-confirm-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--sa-bg-secondary, #1c1c1f)',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: sizeStyles.maxWidth,
              width: '100%',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              position: 'relative'
            }}
          >
            {auditInfo && (
              <div className="sa-confirm-modal__audit" data-audit-type={auditInfo.actionType}>
                <span className="sa-confirm-modal__audit-badge">
                  {auditInfo.actionType}
                </span>
              </div>
            )}

            {showCloseButton && (
              <button
                className="sa-confirm-modal__close"
                onClick={onClose}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="sa-confirm-modal__icon-wrapper" style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: config.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: config.iconColor,
              marginBottom: '20px'
            }}>
              {icon || config.icon}
            </div>

            <h2 className="sa-confirm-modal__title" style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '12px',
              letterSpacing: '-0.02em'
            }}>
              {title}
            </h2>

            {message && (
              <div className="sa-confirm-modal__message" style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '24px'
              }}>
                {typeof message === 'string' ? <p>{message}</p> : message}
              </div>
            )}

            <div className="sa-confirm-modal__actions" style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {actions ? (
                actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled || loading}
                    className={`sa-confirm-modal__action-btn sa-confirm-modal__action-btn--${action.variant || 'ghost'}`}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: action.disabled || loading ? 'not-allowed' : 'pointer',
                      opacity: action.disabled || loading ? 0.6 : 1,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {action.loading && <Loader2 size={14} className="spinning" />}
                    {action.label}
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="sa-confirm-modal__action-btn sa-confirm-modal__action-btn--ghost"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="sa-confirm-modal__action-btn sa-confirm-modal__action-btn--primary"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: config.primaryBtn,
                      border: 'none',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {loading && <Loader2 size={14} className="spinning" />}
                    {confirmText}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
