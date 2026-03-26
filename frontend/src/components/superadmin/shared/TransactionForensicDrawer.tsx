import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, AlertTriangle, CheckCircle2, Copy, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import './TransactionForensicDrawer.css';

export interface TransactionEvent {
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  message: string;
}

export interface TransactionForensicData {
  id: string;
  stripeId?: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  gatewayResponse?: string;
  riskLevel?: 'normal' | 'elevated' | 'highest';
  receiptUrl?: string;
  createdAt: string;
  events: TransactionEvent[];
  rawJson?: Record<string, unknown>;
}

export interface TransactionForensicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionForensicData | null;
  onRetry?: () => void;
  onMarkRecovered?: () => void;
  className?: string;
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount / 100);
};

const getRiskColor = (level?: 'normal' | 'elevated' | 'highest'): string => {
  switch (level) {
    case 'highest': return '#ef4444';
    case 'elevated': return '#f59e0b';
    default: return '#10b981';
  }
};

const getStatusIcon = (status: 'success' | 'pending' | 'failed') => {
  switch (status) {
    case 'success': return <CheckCircle2 size={16} className="forensic-status-icon forensic-status-icon--success" />;
    case 'pending': return <Clock size={16} className="forensic-status-icon forensic-status-icon--pending" />;
    case 'failed': return <AlertTriangle size={16} className="forensic-status-icon forensic-status-icon--failed" />;
  }
};

export const TransactionForensicDrawer: React.FC<TransactionForensicDrawerProps> = ({
  isOpen,
  onClose,
  transaction,
  onRetry,
  onMarkRecovered,
  className = ''
}) => {
  const [showRawJson, setShowRawJson] = React.useState(false);

  const handleCopyJson = () => {
    if (transaction?.rawJson) {
      navigator.clipboard.writeText(JSON.stringify(transaction.rawJson, null, 2));
    }
  };

  if (!transaction) return null;

  const riskColor = getRiskColor(transaction.riskLevel);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="forensic-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`forensic-drawer ${className}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="forensic-drawer__header">
              <h3 className="forensic-drawer__title">Transaction Forensics</h3>
              <button className="forensic-drawer__close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="forensic-drawer__content">
              <div className="forensic-drawer__summary">
                <div className="forensic-drawer__amount">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
                <div className="forensic-drawer__meta">
                  {getStatusIcon(transaction.status)}
                  <span className="forensic-drawer__status">{transaction.status.toUpperCase()}</span>
                  {transaction.riskLevel && transaction.riskLevel !== 'normal' && (
                    <span
                      className="forensic-drawer__risk"
                      style={{ background: `${riskColor}20`, color: riskColor }}
                    >
                      {transaction.riskLevel} risk
                    </span>
                  )}
                </div>
                <div className="forensic-drawer__id">
                  <span className="forensic-drawer__id-label">Transaction ID:</span>
                  <code className="forensic-drawer__id-value">{transaction.id}</code>
                </div>
                {transaction.stripeId && (
                  <div className="forensic-drawer__id">
                    <span className="forensic-drawer__id-label">Stripe ID:</span>
                    <code className="forensic-drawer__id-value">{transaction.stripeId}</code>
                  </div>
                )}
              </div>

              {transaction.receiptUrl && (
                <a
                  href={transaction.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="forensic-drawer__receipt-link"
                >
                  <ExternalLink size={14} />
                  View Receipt
                </a>
              )}

              <div className="forensic-drawer__section">
                <h4 className="forensic-drawer__section-title">Timeline</h4>
                <div className="forensic-drawer__timeline">
                  {transaction.events.map((event, index) => (
                    <div key={index} className="forensic-drawer__event">
                      <div className={`forensic-drawer__event-dot forensic-drawer__event-dot--${event.status}`} />
                      <div className="forensic-drawer__event-content">
                        <span className="forensic-drawer__event-message">{event.message}</span>
                        <span className="forensic-drawer__event-time">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {transaction.gatewayResponse && (
                <div className="forensic-drawer__section">
                  <h4 className="forensic-drawer__section-title">Gateway Response</h4>
                  <pre className="forensic-drawer__gateway-response">
                    {transaction.gatewayResponse}
                  </pre>
                </div>
              )}

              <div className="forensic-drawer__section">
                <button
                  className="forensic-drawer__raw-toggle"
                  onClick={() => setShowRawJson(!showRawJson)}
                >
                  {showRawJson ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Raw Stripe Payload
                  <Copy size={12} onClick={(e) => { e.stopPropagation(); handleCopyJson(); }} />
                </button>
                {showRawJson && transaction.rawJson && (
                  <pre className="forensic-drawer__raw-json">
                    {JSON.stringify(transaction.rawJson, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="forensic-drawer__actions">
              {transaction.status === 'failed' && onRetry && (
                <button className="forensic-drawer__action forensic-drawer__action--primary" onClick={onRetry}>
                  <RefreshCw size={14} />
                  Trigger Retry
                </button>
              )}
              {transaction.status === 'failed' && onMarkRecovered && (
                <button className="forensic-drawer__action forensic-drawer__action--secondary" onClick={onMarkRecovered}>
                  <CheckCircle2 size={14} />
                  Mark Recovered
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionForensicDrawer;
