import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquarePlus, GripVertical } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getPendingFeedbackCount } from '../../utils/feedback.utils';

interface FeedbackButtonProps {
  onClick: () => void;
  pendingCount?: number;
}

export function FeedbackButton({ onClick, pendingCount }: FeedbackButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);
  const [localPendingCount, setLocalPendingCount] = useState(0);

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('feedback-fab-bottom');
    return saved ? parseInt(saved, 10) : 24;
  });
  const [rightPos, setRightPos] = useState(() => {
    const saved = localStorage.getItem('feedback-fab-right');
    return saved ? parseInt(saved, 10) : 24;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartRight = useRef(0);
  const dragStartBottom = useRef(0);
  const hasDragged = useRef(false);

  useEffect(() => {
    setMounted(true);
    setLocalPendingCount(getPendingFeedbackCount());
    const interval = setInterval(() => {
      setLocalPendingCount(getPendingFeedbackCount());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('feedback-fab-bottom', position.toString());
  }, [position]);

  useEffect(() => {
    localStorage.setItem('feedback-fab-right', rightPos.toString());
  }, [rightPos]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hasDragged.current = false;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragStartRight.current = rightPos;
    dragStartBottom.current = position;
  }, [rightPos, position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = Math.abs(clientX - dragStartX.current);
      const deltaY = Math.abs(clientY - dragStartY.current);
      if (deltaX > 5 || deltaY > 5) {
        hasDragged.current = true;
      }
      const newRight = Math.max(0, Math.min(window.innerWidth - 56, dragStartRight.current + (dragStartX.current - clientX)));
      const newBottom = Math.max(0, Math.min(window.innerHeight - 56, dragStartBottom.current + (dragStartY.current - clientY)));
      setRightPos(newRight);
      setPosition(newBottom);
    };

    const handleDragEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!hasDragged.current) {
        setIsDragging(false);
        return;
      }
      setIsDragging(false);
      hasDragged.current = false;
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
      return;
    }
    onClick();
  }, [onClick]);

  if (!mounted) return null;

  const displayCount = pendingCount ?? localPendingCount;
  const buttonSize = 45;
  const iconSize = 20;

  const lightModeStyles = {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0)',
  };

  const darkModeStyles = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5), 0 0 0 2px rgba(255,255,255,0.1)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `${position}px`,
        right: `${rightPos}px`,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 0,
        transition: isDragging ? 'none' : 'all 0.2s ease',
      }}
    >
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        title="Drag to move"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '14px',
          height: `${buttonSize}px`,
          background: isDragging ? 'rgba(99, 102, 241, 0.3)' : 'rgba(28, 28, 32, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '6px 0 0 6px',
          color: isDragging ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.3)',
          cursor: isDragging ? 'grabbing' : 'ns-resize',
          backdropFilter: 'blur(12px)',
          transition: isDragging ? 'none' : 'all 0.15s ease',
        }}
      >
        <GripVertical size={10} />
      </div>
      <button
        onClick={handleButtonClick}
        aria-label="Submit feedback"
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '0 50% 50% 0',
          ...(isDark ? darkModeStyles : lightModeStyles),
          border: isDark ? '2px solid rgba(255,255,255,0.2)' : 'none',
          borderLeft: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: isDragging ? 'none' : 'all 0.3s ease',
          color: 'white',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = isDark
              ? '0 6px 30px rgba(99, 102, 241, 0.6), 0 0 0 4px rgba(99, 102, 241, 0.2)'
              : '0 6px 30px rgba(99, 102, 241, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = isDark
              ? '0 4px 20px rgba(99, 102, 241, 0.5), 0 0 0 2px rgba(255,255,255,0.1)'
              : '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0)';
          }
        }}
      >
        <MessageSquarePlus size={iconSize} strokeWidth={2} />
        {displayCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '8px',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
            }}
          >
            {displayCount > 9 ? '9+' : displayCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default FeedbackButton;