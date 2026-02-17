import React from 'react';
import './PendingInvoices.css';

interface PendingTransaction {
    transactionId: number;
    description: string;
    category: string;
    amount: number;
    dateTime: string;
    referenceNumber?: string;
}

interface PendingInvoicesProps {
    transactions: PendingTransaction[];
    onMarkPaid?: (id: number) => void;
    totalPending: number;
}

const fmt = (v: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(v);

const PendingInvoices: React.FC<PendingInvoicesProps> = ({ transactions, onMarkPaid, totalPending }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getUrgency = (dateStr: string) => {
        if (!dateStr) return 'normal';
        const d = new Date(dateStr);
        const diffDays = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 14) return 'critical';
        if (diffDays > 7) return 'warning';
        return 'normal';
    };

    return (
        <div className="pending-invoices">
            <div className="pi-header">
                <div className="pi-header-left">
                    <h3 className="pi-title">Pending Collections</h3>
                    <span className="pi-count">{transactions.length}</span>
                </div>
                <span className="pi-total">{fmt(totalPending)}</span>
            </div>

            <div className="pi-list">
                {transactions.length === 0 ? (
                    <div className="pi-empty">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span>All payments collected</span>
                    </div>
                ) : (
                    transactions.slice(0, 8).map((tx) => {
                        const urgency = getUrgency(tx.dateTime);
                        return (
                            <div key={tx.transactionId} className={`pi-item pi-item--${urgency}`}>
                                <div className="pi-item-left">
                                    <div className={`pi-urgency-dot pi-urgency-dot--${urgency}`}></div>
                                    <div className="pi-item-info">
                                        <span className="pi-item-desc">{tx.description}</span>
                                        <span className="pi-item-meta">
                                            {tx.category} &middot; {formatDate(tx.dateTime)}
                                            {tx.referenceNumber && <> &middot; {tx.referenceNumber}</>}
                                        </span>
                                    </div>
                                </div>
                                <div className="pi-item-right">
                                    <span className="pi-item-amount">{fmt(tx.amount)}</span>
                                    {onMarkPaid && (
                                        <button
                                            className="pi-collect-btn"
                                            onClick={() => onMarkPaid(tx.transactionId)}
                                            title="Mark as paid"
                                        >
                                            Collect
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {transactions.length > 8 && (
                <div className="pi-footer">
                    <span className="pi-more">+{transactions.length - 8} more pending</span>
                </div>
            )}
        </div>
    );
};

export default PendingInvoices;
