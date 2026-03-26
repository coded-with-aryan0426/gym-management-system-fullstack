import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, ChevronRight } from 'lucide-react';
import './LedgerMismatchAlert.css';

export interface LedgerMismatchAlertProps {
  discrepancy: number;
  currency?: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSync: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
  className?: string;
}

const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const LedgerMismatchAlert: React.FC<LedgerMismatchAlertProps> = ({
  discrepancy,
  currency = 'INR',
  isOpen,
  onDismiss,
  onSync,
  isSyncing = false,
  lastSyncTime,
  className = ''
}) => {
  const formattedAmount = formatCurrency(discrepancy, currency);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`ledger-mismatch-alert ${className}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="ledger-mismatch-alert__container">
            <div className="ledger-mismatch-alert__content">
              <motion.div
                className="ledger-mismatch-alert__icon"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertTriangle size={18} />
              </motion.div>

              <div className="ledger-mismatch-alert__text">
                <span className="ledger-mismatch-alert__title">Ledger Mismatch Detected</span>
                <span className="ledger-mismatch-alert__description">
                  {formattedAmount} discrepancy between Stripe and local database
                  {lastSyncTime && <span className="ledger-mismatch-alert__time"> · Last sync: {lastSyncTime}</span>}
                </span>
              </div>
            </div>

            <div className="ledger-mismatch-alert__actions">
              <motion.button
                className="ledger-mismatch-alert__btn ledger-mismatch-alert__btn--primary"
                onClick={onSync}
                disabled={isSyncing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSyncing ? (
                  <>
                    <motion.span
                      className="ledger-mismatch-alert__spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw size={14} />
                    </motion.span>
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Sync Now
                  </>
                )}
              </motion.button>

              <motion.button
                className="ledger-mismatch-alert__btn ledger-mismatch-alert__btn--ghost"
                onClick={onDismiss}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={14} />
                Dismiss
              </motion.button>

              <button className="ledger-mismatch-alert__details">
                View Details
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <motion.div
            className="ledger-mismatch-alert__pulse"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LedgerMismatchAlert;
