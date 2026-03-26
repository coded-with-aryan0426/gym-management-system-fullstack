import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Check, ExternalLink, XCircle } from 'lucide-react';
import './ErrorStackTraceAccordion.css';

export interface StackFrame {
  file: string;
  line: number;
  method: string;
  column?: number;
}

export interface ErrorStackTraceAccordionProps {
  errorId: string;
  errorType: string;
  message: string;
  stackTrace: string;
  stackFrames?: StackFrame[];
  timestamp: string;
  service?: string;
  resolved?: boolean;
  onCopy?: () => void;
  onResolve?: () => void;
  onViewLogs?: () => void;
  className?: string;
}

const parseStackTrace = (trace: string): StackFrame[] => {
  const lines = trace.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const match = line.match(/(?:at\s+)?(.+?)\(([^:]+):(\d+)(?::(\d+))?\)/);
    if (match) {
      return {
        method: match[1] || 'unknown',
        file: match[2] || 'unknown',
        line: parseInt(match[3], 10) || 0,
        column: match[4] ? parseInt(match[4], 10) : undefined
      };
    }
    return {
      method: line.trim(),
      file: '',
      line: 0
    };
  });
};

const INITIAL_LINES = 8;

export const ErrorStackTraceAccordion: React.FC<ErrorStackTraceAccordionProps> = ({
  errorId,
  errorType,
  message,
  stackTrace,
  stackFrames,
  timestamp,
  service,
  resolved = false,
  onCopy,
  onResolve,
  onViewLogs,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const frames = stackFrames || parseStackTrace(stackTrace);
  const hasMoreFrames = frames.length > INITIAL_LINES;
  const displayedFrames = isExpanded ? frames : frames.slice(0, INITIAL_LINES);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(stackTrace);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [stackTrace, onCopy]);

  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <motion.div
      className={`error-accordion ${resolved ? 'error-accordion--resolved' : ''} ${className}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="error-accordion__header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="error-accordion__header-left">
          <div className="error-accordion__expand-icon">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          <div className="error-accordion__severity-badge">
            <XCircle size={12} />
            {errorType}
          </div>

          <div className="error-accordion__message">
            {message.length > 80 ? `${message.substring(0, 80)}...` : message}
          </div>
        </div>

        <div className="error-accordion__header-right">
          <span className="error-accordion__time">{formattedTime}</span>
          <span className="error-accordion__id">#{errorId}</span>
          {resolved && (
            <span className="error-accordion__resolved-badge">Resolved</span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="error-accordion__content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="error-accordion__body">
              {service && (
                <div className="error-accordion__service">
                  <span className="error-accordion__service-label">Service:</span>
                  <span className="error-accordion__service-value">{service}</span>
                </div>
              )}

              <div className="error-accordion__stack-container">
                <div className="error-accordion__stack-header">
                  <span>Stack Trace</span>
                  <span className="error-accordion__stack-count">
                    {frames.length} frames
                    {hasMoreFrames && !isExpanded && ` (${frames.length - INITIAL_LINES} more)`}
                  </span>
                </div>

                <pre className="error-accordion__stack">
                  <code>
                    {displayedFrames.map((frame, index) => (
                      <div key={index} className="error-accordion__frame">
                        <span className="error-accordion__frame-line">
                          {frame.line > 0 ? `${index + 1}` : ''}
                        </span>
                        <span className="error-accordion__frame-method">
                          {frame.method}
                        </span>
                        {frame.file && (
                          <span className="error-accordion__frame-location">
                            ({frame.file}:{frame.line})
                          </span>
                        )}
                      </div>
                    ))}
                    {hasMoreFrames && !isExpanded && (
                      <div className="error-accordion__more-frames">
                        ... {frames.length - INITIAL_LINES} more frames
                      </div>
                    )}
                  </code>
                </pre>
              </div>

              <div className="error-accordion__actions">
                <button
                  className={`error-accordion__action ${copied ? 'error-accordion__action--success' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy Trace'}
                </button>

                {!resolved && onResolve && (
                  <button
                    className="error-accordion__action error-accordion__action--resolve"
                    onClick={(e) => { e.stopPropagation(); onResolve(); }}
                  >
                    <XCircle size={12} />
                    Mark Resolved
                  </button>
                )}

                {onViewLogs && (
                  <button
                    className="error-accordion__action error-accordion__action--logs"
                    onClick={(e) => { e.stopPropagation(); onViewLogs(); }}
                  >
                    <ExternalLink size={12} />
                    View in Logs
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ErrorStackTraceAccordion;
