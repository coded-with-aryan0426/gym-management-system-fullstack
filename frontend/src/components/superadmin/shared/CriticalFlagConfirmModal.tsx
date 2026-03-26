import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import './CriticalFlagConfirmModal.css';

export interface CriticalFlagConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flagName: string;
  flagKey: string;
  newState: boolean;
  isLoading?: boolean;
  className?: string;
}

export const CriticalFlagConfirmModal: React.FC<CriticalFlagConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  flagName,
  flagKey,
  newState,
  isLoading = false,
  className = ''
}) => {
  const [confirmText, setConfirmText] = useState('');
  const requiredText = newState ? 'ENABLE' : 'DISABLE';
  const isConfirmValid = confirmText.toUpperCase() === requiredText;

  const getWarningMessage = () => {
    if (newState) {
      return `Enabling this feature will activate "${flagName}" for users based on the rollout configuration.`;
    }
    return `Disabling this feature will immediately block access to "${flagName}" for all affected users.`;
  };

  return (
    <motion.div
      className={`critical-flag-modal-overlay ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <motion.div
        className="critical-flag-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1c1c1f',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}
      >
        <div
          className="critical-flag-modal__header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: newState ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: newState ? '#f59e0b' : '#ef4444'
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)' }}>
              Critical Feature Toggle
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
              This action requires explicit confirmation
            </p>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              background: newState ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          >
            <AlertTriangle size={16} style={{ color: newState ? '#f59e0b' : '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: newState ? '#f59e0b' : '#ef4444', fontWeight: 500 }}>
              You are about to {newState ? 'ENABLE' : 'DISABLE'} a critical feature flag
            </span>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Flag Key
            </div>
            <code style={{ fontSize: '12px', color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
              {flagKey}
            </code>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px', marginBottom: '4px' }}>
              Feature Name
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
              {flagName}
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px', lineHeight: 1.5 }}>
            {getWarningMessage()}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
              Type <strong style={{ color: newState ? '#f59e0b' : '#ef4444' }}>{requiredText}</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requiredText}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${isConfirmValid ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: 'rgba(255, 255, 255, 0.9)',
                outline: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxSizing: 'border-box'
              }}
              autoComplete="off"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!isConfirmValid || isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: !isConfirmValid || isLoading ? 'rgba(239, 68, 68, 0.3)' : (newState ? '#f59e0b' : '#ef4444'),
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                cursor: isConfirmValid && !isLoading ? 'pointer' : 'not-allowed',
                opacity: isConfirmValid && !isLoading ? 1 : 0.6,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              I Understand, {newState ? 'Enable' : 'Disable'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CriticalFlagConfirmModal;
