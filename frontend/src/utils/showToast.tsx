import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
    description?: string;
    duration?: number;
}

const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />
};

const colors = {
    success: {
        bg: 'linear-gradient(135deg, #10B981, #059669)',
        border: 'rgba(16, 185, 129, 0.3)',
        shadow: 'rgba(16, 185, 129, 0.4)'
    },
    error: {
        bg: 'linear-gradient(135deg, #EF4444, #DC2626)',
        border: 'rgba(239, 68, 68, 0.3)',
        shadow: 'rgba(239, 68, 68, 0.4)'
    },
    info: {
        bg: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        border: 'rgba(59, 130, 246, 0.3)',
        shadow: 'rgba(59, 130, 246, 0.4)'
    }
};

/**
 * Premium toast notification with glassmorphism design
 * @param message - Main toast message
 * @param type - 'success' | 'error' | 'info'
 * @param options - Optional description and duration
 */
export const showToast = (
    message: string,
    type: ToastType = 'success',
    options?: ToastOptions | string
) => {
    // Support old signature: showToast(message, type, description)
    const description = typeof options === 'string' ? options : options?.description;
    const duration = typeof options === 'object' ? options?.duration : undefined;

    toast.custom((t) => (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                background: 'rgba(20, 20, 24, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '14px',
                border: `1px solid ${colors[type].border}`,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                maxWidth: '360px',
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: colors[type].bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${colors[type].shadow}`,
                }}
            >
                {icons[type]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, letterSpacing: '-0.2px' }}>
                    {message}
                </span>
                {description && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        {description}
                    </span>
                )}
            </div>
            <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.6)',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
            >
                <X size={14} />
            </button>
        </div>
    ), { duration: duration ?? 3000 });
};

export default showToast;
