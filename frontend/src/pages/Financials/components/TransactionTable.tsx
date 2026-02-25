import React, { useState, useMemo } from 'react';
import type { Transaction } from '../../../types/finance';
import './TransactionTable.css';

interface TransactionTableProps {
    transactions: Transaction[];
    onAction?: (action: string, tx: Transaction) => void;
}

type SortKey = 'date' | 'amount' | 'description';
type SortDir = 'asc' | 'desc';

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onAction }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const filtered = useMemo(() => {
        let result = transactions.filter(tx => {
            const matchSearch = !search ||
                tx.description.toLowerCase().includes(search.toLowerCase()) ||
                (tx.invoiceId || '').toLowerCase().includes(search.toLowerCase()) ||
                (tx.category || '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
            const matchType = typeFilter === 'all' || tx.type === typeFilter;
            return matchSearch && matchStatus && matchType;
        });

        result = [...result].sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'date') cmp = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
            else if (sortKey === 'amount') cmp = Math.abs(a.amount) - Math.abs(b.amount);
            else if (sortKey === 'description') cmp = a.description.localeCompare(b.description);
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [transactions, search, statusFilter, typeFilter, sortKey, sortDir]);

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === 'Invalid Date') return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const formatAmount = (amount: number, type: string) => {
        const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(Math.abs(amount));
        return type === 'INCOME' ? `+${formatted}` : `-${formatted}`;
    };

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className={`sort-icon ${sortKey === col ? 'active' : ''}`}>
            {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );

    // Summary row counts
    const incomeCount = filtered.filter(t => t.type === 'INCOME').length;
    const expenseCount = filtered.filter(t => t.type === 'EXPENSE').length;
    const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    const fmtShort = (v: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(v);

    return (
        <div className="tx-table-wrapper">
            {/* Filters */}
            <div className="tx-filters">
                <div className="search-box">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search description, category, ref…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch('')}>×</button>
                    )}
                </div>

                <div className="tx-filter-group">
                    <button
                        className={`tx-type-btn ${typeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('all')}
                    >All</button>
                    <button
                        className={`tx-type-btn income ${typeFilter === 'INCOME' ? 'active' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'INCOME' ? 'all' : 'INCOME')}
                    >
                        <span className="type-dot income" />
                        Income {incomeCount > 0 && <span className="type-count">{incomeCount}</span>}
                    </button>
                    <button
                        className={`tx-type-btn expense ${typeFilter === 'EXPENSE' ? 'active' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'EXPENSE' ? 'all' : 'EXPENSE')}
                    >
                        <span className="type-dot expense" />
                        Expense {expenseCount > 0 && <span className="type-count">{expenseCount}</span>}
                    </button>
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

            {/* Summary bar */}
            {filtered.length > 0 && (
                <div className="tx-summary-bar">
                    <span className="tx-summary-item income">
                        <span className="type-dot income" />
                        {fmtShort(totalIncome)} in {incomeCount} receipts
                    </span>
                    <span className="tx-summary-sep">·</span>
                    <span className="tx-summary-item expense">
                        <span className="type-dot expense" />
                        {fmtShort(totalExpense)} in {expenseCount} expenses
                    </span>
                    <span className="tx-summary-sep">·</span>
                    <span className={`tx-summary-net ${totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}`}>
                        Net {fmtShort(totalIncome - totalExpense)}
                    </span>
                </div>
            )}

            <div className="tx-table-scroll">
                <table className="tx-table">
                    <thead>
                        <tr>
                            <th className="col-type" />
                            <th className="col-date" onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                                Date <SortIcon col="date" />
                            </th>
                            <th className="col-desc" onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                                Description <SortIcon col="description" />
                            </th>
                            <th className="col-cat">Category</th>
                            <th className="col-amount" onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                                Amount <SortIcon col="amount" />
                            </th>
                            <th className="col-status">Status</th>
                            <th className="col-actions">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((tx) => (
                            <tr
                                key={tx.id}
                                className={`tx-row tx-row--${tx.type === 'INCOME' ? 'income' : 'expense'}`}
                                onClick={() => onAction?.('view', tx)}
                            >
                                <td className="col-type">
                                    <span className={`type-stripe type-stripe--${tx.type === 'INCOME' ? 'income' : 'expense'}`} />
                                </td>
                                <td className="col-date">
                                    <span className="date-text">{formatDate(tx.date || '')}</span>
                                    <span className="invoice-id">{tx.invoiceId}</span>
                                </td>
                                <td className="col-desc">
                                    <span className="desc-text">{tx.description}</span>
                                </td>
                                <td className="col-cat">
                                    <span className="category-badge">{tx.category}</span>
                                </td>
                                <td className={`col-amount ${tx.type === 'INCOME' ? 'positive' : 'negative'}`}>
                                    {formatAmount(tx.amount, tx.type)}
                                </td>
                                <td className="col-status">
                                    <span className={`status-badge status-badge--${tx.status.toLowerCase()}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="col-actions">
                                    {tx.status === 'Pending' ? (
                                        <button
                                            className="action-btn action-btn--collect"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('mark-paid', tx); }}
                                        >Collect</button>
                                    ) : (
                                        <button
                                            className="action-btn"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('view', tx); }}
                                        >View</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="tx-empty">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <span>No transactions match your filters</span>
                    </div>
                )}
            </div>

            <div className="tx-footer">
                <span className="footer-info">
                    {filtered.length} of {transactions.length} transactions
                </span>
            </div>
        </div>
    );
};

export default TransactionTable;
