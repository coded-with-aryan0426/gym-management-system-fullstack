import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import './GymPayoutLedger.css';

export interface GymPayoutLedgerProps {
  platformRevenue: {
    amount: number;
    change?: number;
    currency?: string;
  };
  pendingPayouts: {
    amount: number;
    gymCount: number;
    overdueCount?: number;
    pendingCount?: number;
  };
  isLoading?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const GymPayoutLedger: React.FC<GymPayoutLedgerProps> = ({
  platformRevenue,
  pendingPayouts,
  isLoading = false,
  onViewAll,
  className = ''
}) => {
  const formatAmount = (amt: number) => formatCurrency(amt, platformRevenue.currency);

  if (isLoading) {
    return (
      <div className={`gym-payout-ledger ${className}`}>
        <div className="gym-payout-ledger__skeleton gym-payout-ledger__skeleton--left" />
        <div className="gym-payout-ledger__divider" />
        <div className="gym-payout-ledger__skeleton gym-payout-ledger__skeleton--right" />
      </div>
    );
  }

  return (
    <motion.div
      className={`gym-payout-ledger ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="gym-payout-ledger__section gym-payout-ledger__section--platform">
        <div className="gym-payout-ledger__header">
          <div className="gym-payout-ledger__icon gym-payout-ledger__icon--platform">
            <Wallet size={16} />
          </div>
          <span className="gym-payout-ledger__label">Platform Revenue</span>
        </div>

        <div className="gym-payout-ledger__amount">
          <span className="gym-payout-ledger__value">{formatAmount(platformRevenue.amount)}</span>
          {platformRevenue.change !== undefined && (
            <span className={`gym-payout-ledger__change ${platformRevenue.change >= 0 ? 'gym-payout-ledger__change--positive' : 'gym-payout-ledger__change--negative'}`}>
              {platformRevenue.change >= 0 ? '+' : ''}{platformRevenue.change.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="gym-payout-ledger__badge">
          <CheckCircle2 size={12} />
          Stripe Live
        </div>
      </div>

      <div className="gym-payout-ledger__divider" />

      <div className="gym-payout-ledger__section gym-payout-ledger__section--payouts">
        <div className="gym-payout-ledger__header">
          <div className="gym-payout-ledger__icon gym-payout-ledger__icon--payouts">
            <Clock size={16} />
          </div>
          <span className="gym-payout-ledger__label">Pending Gym Payouts</span>
        </div>

        <div className="gym-payout-ledger__amount">
          <span className="gym-payout-ledger__value">{formatAmount(pendingPayouts.amount)}</span>
          <span className="gym-payout-ledger__subtitle">{pendingPayouts.gymCount} gyms</span>
        </div>

        <div className="gym-payout-ledger__stats">
          {pendingPayouts.pendingCount !== undefined && pendingPayouts.pendingCount > 0 && (
            <div className="gym-payout-ledger__stat">
              <Clock size={10} />
              <span>{pendingPayouts.pendingCount} pending</span>
            </div>
          )}
          {pendingPayouts.overdueCount !== undefined && pendingPayouts.overdueCount > 0 && (
            <div className="gym-payout-ledger__stat gym-payout-ledger__stat--warning">
              <AlertTriangle size={10} />
              <span>{pendingPayouts.overdueCount} overdue</span>
            </div>
          )}
        </div>
      </div>

      {onViewAll && (
        <button className="gym-payout-ledger__view-all" onClick={onViewAll}>
          <Building2 size={14} />
          View Ledger
        </button>
      )}
    </motion.div>
  );
};

export default GymPayoutLedger;
