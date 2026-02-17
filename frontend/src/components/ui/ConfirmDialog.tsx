import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
        }}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()} style={{
                background: '#1a1a1a', // Dark theme default
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                border: '1px solid #333'
            }}>
                <div className="confirm-icon" style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    color: variant === 'danger' ? '#ef4444' : '#f59e0b'
                }}>
                    <AlertTriangle size={48} />
                </div>

                <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#fff',
                    fontSize: '1.25rem',
                    fontWeight: 600
                }}>{title}</h3>

                <p style={{
                    margin: '0 0 24px 0',
                    color: '#9ca3af',
                    lineHeight: 1.5
                }}>{message}</p>

                <div className="confirm-buttons" style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            color: '#e5e7eb',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 500
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            background: variant === 'danger' ? '#dc2626' : '#f59e0b',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
