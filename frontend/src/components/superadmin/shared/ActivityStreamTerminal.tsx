import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Download, Pause, Play, ExternalLink } from 'lucide-react';
import './ActivityStreamTerminal.css';

export type ActivityEventType = 'payment' | 'error' | 'registration' | 'system' | 'security' | 'feature';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ActivityEventType;
  message: string;
  metadata?: Record<string, unknown>;
  gymId?: number;
  userId?: string;
}

interface ActivityStreamTerminalProps {
  events: ActivityEvent[];
  maxEvents?: number;
  autoScroll?: boolean;
  onEventClick?: (event: ActivityEvent) => void;
  onExport?: (events: ActivityEvent[]) => void;
  className?: string;
}

const EVENT_COLORS: Record<ActivityEventType, { text: string; bg: string; badge: string }> = {
  payment: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', badge: 'PAYMENT' },
  error: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', badge: 'ERROR' },
  registration: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', badge: 'REGISTER' },
  system: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', badge: 'SYSTEM' },
  security: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', badge: 'SECURITY' },
  feature: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', badge: 'FEATURE' }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const ActivityStreamTerminal: React.FC<ActivityStreamTerminalProps> = ({
  events,
  maxEvents = 100,
  autoScroll = true,
  onEventClick,
  onExport,
  className = ''
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const displayEvents = events.slice(-maxEvents);

  useEffect(() => {
    if (autoScroll && !isPaused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events, isPaused, autoScroll]);

  useEffect(() => {
    if (!isPaused && cursorRef.current) {
      const cursor = cursorRef.current;
      cursor.style.opacity = '1';
      const interval = setInterval(() => {
        if (cursor) {
          cursor.style.opacity = cursor.style.opacity === '1' ? '0' : '1';
        }
      }, 530);
      return () => clearInterval(interval);
    }
  }, [isPaused, events.length]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(displayEvents);
    } else {
      const blob = new Blob([JSON.stringify(displayEvents, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [displayEvents, onExport]);

  return (
    <div className={`activity-stream-terminal ${className}`}>
      <div className="activity-stream-terminal__header">
        <div className="activity-stream-terminal__title">
          <Terminal size={14} />
          <span>Live Event Console</span>
          <span className="activity-stream-terminal__count">{displayEvents.length}</span>
        </div>
        <div className="activity-stream-terminal__actions">
          <button
            className={`activity-stream-terminal__btn ${isPaused ? 'activity-stream-terminal__btn--active' : ''}`}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume stream' : 'Pause stream'}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            className="activity-stream-terminal__btn"
            onClick={handleExport}
            title="Export logs"
          >
            <Download size={12} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="activity-stream-terminal__content"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {displayEvents.length === 0 ? (
          <div className="activity-stream-terminal__empty">
            <span className="activity-stream-terminal__cursor">_</span>
            <span> Waiting for events...</span>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {displayEvents.map((event, index) => {
                const colors = EVENT_COLORS[event.type];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="activity-stream-terminal__event"
                    onClick={() => onEventClick?.(event)}
                    style={{
                      background: isHovering ? colors.bg : 'transparent',
                      cursor: onEventClick ? 'pointer' : 'default'
                    }}
                  >
                    <span className="activity-stream-terminal__timestamp">
                      [{formatTimestamp(event.timestamp)}]
                    </span>
                    <span
                      className="activity-stream-terminal__badge"
                      style={{
                        color: colors.text,
                        background: colors.bg,
                        borderColor: `${colors.text}30`
                      }}
                    >
                      [{colors.badge}]
                    </span>
                    <span className="activity-stream-terminal__message">
                      {event.message}
                    </span>
                    {event.gymId && (
                      <span className="activity-stream-terminal__meta">
                        <ExternalLink size={10} />
                        #{event.gymId}
                      </span>
                    )}
                    {index === displayEvents.length - 1 && !isPaused && (
                      <span ref={cursorRef} className="activity-stream-terminal__cursor">_</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {isPaused && (
              <div className="activity-stream-terminal__paused">
                <Pause size={12} />
                Stream paused
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityStreamTerminal;
