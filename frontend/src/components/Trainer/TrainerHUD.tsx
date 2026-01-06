import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Check, X, Clock } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import './TrainerHUD.css';

interface Session {
    id: string;
    clientName: string;
    sessionType: string;
    startTime: Date;
    endTime: Date;
    room?: string;
}

interface TrainerHUDProps {
    currentSession?: Session | null;
    nextSession?: Session | null;
    onComplete?: (sessionId: string) => void;
    onNoShow?: (sessionId: string) => void;
    onDismiss?: () => void;
    className?: string;
}

const TrainerHUD: React.FC<TrainerHUDProps> = ({
    currentSession,
    nextSession,
    onComplete,
    onNoShow,
    onDismiss,
    className = ''
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDismissed, setIsDismissed] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Reset dismissed state when session changes
    useEffect(() => {
        if (currentSession) {
            setIsDismissed(false);
        }
    }, [currentSession?.id]);

    // Calculate remaining time
    const timeRemaining = useMemo(() => {
        if (!currentSession) return null;

        const secondsLeft = differenceInSeconds(currentSession.endTime, currentTime);

        if (secondsLeft <= 0) {
            return { minutes: 0, seconds: 0, isEnding: true, isWarning: false };
        }

        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const isWarning = minutes <= 5 && minutes > 1;
        const isEnding = minutes <= 1;

        return { minutes, seconds, isWarning, isEnding };
    }, [currentSession, currentTime]);

    const formatTime = (minutes: number, seconds: number) => {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleComplete = () => {
        if (currentSession && onComplete) {
            onComplete(currentSession.id);
        }
    };

    const handleNoShow = () => {
        if (currentSession && onNoShow) {
            onNoShow(currentSession.id);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    // Don't render if dismissed or no session data
    if (isDismissed || (!currentSession && !nextSession)) {
        return null;
    }

    const isIdle = !currentSession;

    return (
        <div className={`trainer-hud ${isIdle ? 'trainer-hud--idle' : ''} ${className}`}>
            <div className="trainer-hud__container">
                {/* Live Indicator */}
                <div className="trainer-hud__live">
                    <div className="trainer-hud__live-dot" />
                </div>

                {/* Current Session Info */}
                <div className="trainer-hud__current">
                    <div className="trainer-hud__avatar">
                        {currentSession
                            ? currentSession.clientName.charAt(0).toUpperCase()
                            : <Clock size={18} />
                        }
                    </div>
                    <div className="trainer-hud__info">
                        <div className="trainer-hud__client-name">
                            {currentSession ? currentSession.clientName : 'No Active Session'}
                        </div>
                        <div className="trainer-hud__session-type">
                            {currentSession
                                ? `${currentSession.sessionType}${currentSession.room ? ` • ${currentSession.room}` : ''}`
                                : nextSession
                                    ? `Next: ${nextSession.clientName} at ${nextSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'No upcoming sessions'
                            }
                        </div>
                    </div>
                </div>

                {/* Timer (only show if active session) */}
                {currentSession && timeRemaining && (
                    <div className={`trainer-hud__timer ${timeRemaining.isWarning ? 'trainer-hud__timer--warning' : ''} ${timeRemaining.isEnding ? 'trainer-hud__timer--ending' : ''}`}>
                        <div className="trainer-hud__timer-value">
                            {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
                        </div>
                        <div className="trainer-hud__timer-label">remaining</div>
                    </div>
                )}

                {/* Next Session Preview (desktop only) */}
                {currentSession && nextSession && (
                    <div className="trainer-hud__next">
                        <ChevronRight size={14} className="trainer-hud__next-icon" />
                        <div className="trainer-hud__next-info">
                            <span className="trainer-hud__next-label">Next</span>
                            <span className="trainer-hud__next-name">{nextSession.clientName}</span>
                        </div>
                    </div>
                )}

                {/* Action Buttons (only show if active session) */}
                {currentSession && (
                    <div className="trainer-hud__actions">
                        <button
                            className="trainer-hud__action-btn trainer-hud__action-btn--complete"
                            onClick={handleComplete}
                            title="Mark Complete"
                            aria-label="Mark session complete"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            className="trainer-hud__action-btn trainer-hud__action-btn--noshow"
                            onClick={handleNoShow}
                            title="Mark No-Show"
                            aria-label="Mark no-show"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Dismiss Button */}
                <button
                    className="trainer-hud__dismiss"
                    onClick={handleDismiss}
                    aria-label="Dismiss HUD"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default TrainerHUD;
