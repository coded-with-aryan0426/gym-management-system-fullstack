import React, { useState, useMemo } from 'react';
import type { Transaction } from '../../../types/finance';
import './TransactionTable.css';

interface TransactionTableProps {
    transactions: Transaction[];
    onAction?: (action: string, tx: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onAction }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            const matchSearch = !search || 
                tx.description.toLowerCase().includes(search.toLowerCase()) ||
                tx.invoiceId.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [transactions, search, statusFilter]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const formatAmount = (amount: number) => {
        const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Math.abs(amount));
        return amount >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    return (
        <div className="tx-table-wrapper">
            <div className="tx-filters">
                <div className="search-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="status-select"
                >
                    <option value="all">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            <div className="tx-table-scroll">
                <table className="tx-table">
                    <thead>
                        <tr>
                            <th className="col-date">Date</th>
                            <th className="col-desc">Description</th>
                            <th className="col-cat">Category</th>
                            <th className="col-amount">Amount</th>
                            <th className="col-status">Status</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((tx, i) => (
                            <tr 
                                key={tx.id} 
                                className={i % 2 === 0 ? 'even' : 'odd'}
                                onClick={() => onAction?.('view', tx)}
                            >
                                <td className="col-date">
                                    <span className="date-text">{formatDate(tx.date)}</span>
                                    <span className="invoice-id">{tx.invoiceId}</span>
                                </td>
                                <td className="col-desc">
                                    <span className="desc-text">{tx.description}</span>
                                </td>
                                <td className="col-cat">
                                    <span className="category-badge">{tx.category}</span>
                                </td>
                                <td className={`col-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                                    {formatAmount(tx.amount)}
                                </td>
                                <td className="col-status">
                                    <span className={`status-badge status-badge--${tx.status.toLowerCase()}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="col-actions">
                                    {tx.status === 'Pending' ? (
                                        <button 
                                            className="action-btn action-btn--primary"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('mark-paid', tx); }}
                                        >
                                            Mark Paid
                                        </button>
                                    ) : (
                                        <button 
                                            className="action-btn"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('view', tx); }}
                                        >
                                            View
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filtered.length === 0 && (
                    <div className="tx-empty">
                        <span>No transactions found</span>
                    </div>
                )}
            </div>

            <div className="tx-footer">
                <span className="footer-info">Showing {filtered.length} of {transactions.length} transactions</span>
            </div>
        </div>
    );
};

export default TransactionTable;
