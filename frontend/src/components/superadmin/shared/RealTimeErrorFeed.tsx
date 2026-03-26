import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, Pause, Play, Zap } from 'lucide-react';
import './RealTimeErrorFeed.css';

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface RealTimeError {
  id: string;
  type: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  service?: string;
  userId?: string;
  gymId?: string;
}

export interface RealTimeErrorFeedProps {
  events: RealTimeError[];
  onErrorClick?: (error: RealTimeError) => void;
  maxVisible?: number;
  autoScroll?: boolean;
  className?: string;
}

const severityConfig: Record<ErrorSeverity, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  critical: { icon: <Zap size={12} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'FATAL' },
  error: { icon: <AlertCircle size={12} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'ERROR' },
  warning: { icon: <AlertTriangle size={12} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'WARN' },
  info: { icon: <Info size={12} />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'INFO' }
};

export const RealTimeErrorFeed: React.FC<RealTimeErrorFeedProps> = ({
  events,
  onErrorClick,
  maxVisible = 10,
  autoScroll = true,
  className = ''
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [newErrors, setNewErrors] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEventsLength = useRef(events.length);

  useEffect(() => {
    if (events.length > prevEventsLength.current && !isPaused) {
      const newIds = events.slice(prevEventsLength.current).map(e => e.id);
      setNewErrors(prev => new Set([...prev, ...newIds]));
      setTimeout(() => {
        setNewErrors(prev => {
          const next = new Set(prev);
          newIds.forEach(id => next.delete(id));
          return next;
        });
      }, 3000);
    }
    prevEventsLength.current = events.length;
  }, [events, isPaused]);

  useEffect(() => {
    if (autoScroll && !isPaused && !isHovering && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events, isPaused, isHovering, autoScroll]);

  const visibleEvents = events.slice(0, maxVisible);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className={`realtime-feed ${className}`}>
      <div className="realtime-feed__header">
        <div className="realtime-feed__title">
          <span className={`realtime-feed__status ${isPaused ? 'realtime-feed__status--paused' : 'realtime-feed__status--live'}`} />
          <span>{isPaused ? 'Feed Paused' : 'Live Errors'}</span>
        </div>
        <div className="realtime-feed__actions">
          <button className="realtime-feed__btn" onClick={() => setIsPaused(!isPaused)} title={isPaused ? 'Resume feed' : 'Pause feed'}>
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="realtime-feed__content" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <AnimatePresence initial={false}>
          {visibleEvents.map((error) => {
            const config = severityConfig[error.severity];
            const isNew = newErrors.has(error.id);
            return (
              <motion.div
                key={error.id}
                className={`realtime-feed__item ${isNew ? 'realtime-feed__item--new' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onClick={() => onErrorClick?.(error)}
                style={{ '--accent-color': config.color, backgroundColor: config.bg } as React.CSSProperties}
              >
                <div className="realtime-feed__item-severity">
                  <span style={{ color: config.color }}>{config.icon}</span>
                </div>
                <div className="realtime-feed__item-content">
                  <div className="realtime-feed__item-header">
                    <span className="realtime-feed__item-type" style={{ color: config.color }}>{error.type}</span>
                    <span className="realtime-feed__item-time">{formatTime(error.timestamp)}</span>
                  </div>
                  <div className="realtime-feed__item-message">{error.message.length > 60 ? `${error.message.substring(0, 60)}...` : error.message}</div>
                  {error.service && <div className="realtime-feed__item-service">{error.service}</div>}
                </div>
                {isNew && error.severity === 'critical' && (
                  <motion.div className="realtime-feed__item-pulse" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {visibleEvents.length === 0 && <div className="realtime-feed__empty"><Info size={20} /><span>No errors to display</span></div>}
      </div>
      {!isPaused && events.length > maxVisible && <div className="realtime-feed__overflow">+{events.length - maxVisible} more errors</div>}
    </div>
  );
};

export default RealTimeErrorFeed;
