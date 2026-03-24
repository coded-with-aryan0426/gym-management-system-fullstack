import { useState, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { getPendingFeedbackCount } from '../../utils/feedback.utils';

interface FeedbackButtonProps {
  onClick: () => void;
  pendingCount?: number;
}

export function FeedbackButton({ onClick, pendingCount }: FeedbackButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [localPendingCount, setLocalPendingCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setLocalPendingCount(getPendingFeedbackCount());
    const interval = setInterval(() => {
      setLocalPendingCount(getPendingFeedbackCount());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const displayCount = pendingCount ?? localPendingCount;

  return (
    <button
      onClick={onClick}
      aria-label="Submit feedback"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0)',
        transition: 'all 0.3s ease',
        zIndex: 9999,
        color: 'white',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0)';
      }}
    >
      <MessageSquarePlus size={24} strokeWidth={2} />
      {displayCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '20px',
            height: '20px',
            padding: '0 6px',
            borderRadius: '10px',
            background: '#ef4444',
            color: 'white',
            fontSize: '11px',
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
  );
}

export default FeedbackButton;