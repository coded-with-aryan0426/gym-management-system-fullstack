import './ActiveSessionToast.css';
import { Check, X, User, Clock } from 'lucide-react';
import { useRef, useEffect } from 'react';
import anime from 'animejs';

interface ActiveSessionToastProps {
    status?: 'active' | 'ended';
    current: {
        name: string;
        type: string;
        location: string;
        avatarColor: string;
        initial: string;
        progress: number;
        timeRemaining: string;
    };
    next: {
        name: string;
        avatarUrl?: string;
    };
    onComplete: () => void;
    onCancel: () => void;
    onClose?: () => void;
}

const ActiveSessionToast: React.FC<ActiveSessionToastProps> = ({
    status = 'active',
    current,
    next,
    onComplete,
    onCancel,
    onClose
}) => {
    const toastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Pop-in animation
        anime({
            targets: toastRef.current,
            translateY: [-100, 0],
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 800,
            easing: 'spring(1, 80, 10, 0)'
        });
    }, [status]);

    const handleAction = (callback: () => void) => {
        if (!toastRef.current) return;

        // Pop-out animation
        anime({
            targets: toastRef.current,
            opacity: [1, 0],
            scale: [1, 0.9],
            translateY: [0, -20],
            duration: 300,
            easing: 'easeInQuad',
            complete: callback
        });
    };

    return (
        <div className="active-session-toast-wrapper" style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div className={`active-session-toast ${status === 'ended' ? 'active-session-toast--ended' : ''}`} ref={toastRef}>
                {status === 'ended' ? (
                    <>
                        {/* Left: Info (Same Detail as old) */}
                        <div className="ast__profile">
                            <div className="ast__avatar" style={{ background: '#333', color: '#666' }}>
                                <Clock size={24} />
                            </div>
                            <div className="ast__info">
                                <h3 className="ast__name" style={{ color: '#aaa' }}>No Active Session</h3>
                                <p className="ast__context">Session Ended • {current.location}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="ast__divider" />

                        {/* Right: Close Action */}
                        <div className="ast__actions">
                            <button className="ast__btn ast__btn--danger" onClick={() => handleAction(onClose || onCancel)}>
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Left: Current Profile */}
                        <div className="ast__profile">
                            <div className="ast__avatar" style={{ background: current.avatarColor }}>
                                {current.initial}
                            </div>
                            <div className="ast__info">
                                <h3 className="ast__name">{current.name}</h3>
                                <p className="ast__context">{current.type} • {current.location}</p>
                                <div className="ast__progress-container">
                                    <div className="ast__progress-bar">
                                        <div className="ast__progress-fill" style={{ width: `${current.progress}%` }} />
                                    </div>
                                    <span className="ast__time">{current.timeRemaining} REMAINING</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="ast__divider" />

                        {/* Middle: Next Up */}
                        <div className="ast__next">
                            <span className="ast__next-label">NEXT:</span>
                            <div className="ast__next-profile">
                                <div className="ast__next-avatar">
                                    {next.avatarUrl ? <img src={next.avatarUrl} alt="" /> : <User size={14} />}
                                </div>
                                <span className="ast__next-name">{next.name.split(' ')[0]}<br />{next.name.split(' ')[1]}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="ast__divider" />

                        {/* Right: Actions */}
                        <div className="ast__actions">
                            <button className="ast__btn ast__btn--success" onClick={() => handleAction(onComplete)}>
                                <Check size={20} strokeWidth={3} />
                            </button>
                            <button className="ast__btn ast__btn--danger" onClick={() => handleAction(onCancel)}>
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ActiveSessionToast;
