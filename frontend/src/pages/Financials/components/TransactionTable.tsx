import React from 'react';
import { Card, Badge, DataTable } from '../../../components/ui';
import type { Transaction } from '../../../types/finance';
import './TransactionTable.css';

interface TransactionTableProps {
    transactions: Transaction[];
    onAction?: (action: string, tx: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onAction }) => {

    const getInlineActions = (tx: Transaction) => {
        if (tx.status === 'Pending') {
            return (
                <div className="tx-actions">
                    <button className="tx-action-btn primary-text" title="Mark Paid" onClick={(e) => { e.stopPropagation(); onAction?.('mark-paid', tx); }}>
                        ✓ Paid
                    </button>
                    <button className="tx-action-btn" title="View Options" onClick={(e) => { e.stopPropagation(); onAction?.('view', tx); }}>
                        ⋮
                    </button>
                </div>
            )
        }
        return (
            <div className="tx-actions">
                <button className="tx-action-btn" title="View Details" onClick={(e) => { e.stopPropagation(); onAction?.('view', tx); }}>
                    View
                </button>
            </div>
        )
    };

    const columns = [
        {
            key: 'date',
            header: 'Date',
            width: '120px',
            render: (tx: Transaction) => (
                <div className="tx-date-cell">
                    <span className="tx-date font-mono">{tx.date}</span>
                    <span className="tx-id text-secondary text-xs">#{tx.invoiceId}</span>
                </div>
            )
        },
        {
            key: 'description',
            header: 'Description',
            render: (tx: Transaction) => (
                <div className="tx-desc-cell">
                    <div className="tx-main font-medium">{tx.description}</div>
                    <div className="tx-sub text-xs text-secondary">{tx.relatedUserName || 'General'}</div>
                </div>
            )
        },
        {
            key: 'category',
            header: 'Category',
            width: '140px',
            render: (tx: Transaction) => <span className="tx-category-badge text-xs">{tx.category}</span>
        },
        {
            key: 'amount',
            header: 'Amount',
            width: '120px',
            render: (tx: Transaction) => (
                <span className={`tx-amount font-mono font-bold ${tx.amount > 0 ? 'text-emerald' : 'text-crimson'}`}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(tx.amount)}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (tx: Transaction) => (
                <Badge variant={
                    tx.status === 'Completed' ? 'active' :
                        tx.status === 'Pending' ? 'pending' : 'expired'
                }>
                    {tx.status}
                </Badge>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '120px',
            render: getInlineActions
        }
    ];

    return (
        <div className="transaction-table-container">
            {/* Filters Row - Dense */}
            <div className="tx-filters-dense">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search..." className="tx-search-dense" />
                </div>
                <div className="filter-group">
                    <select className="tx-select-dense"><option>Status: All</option><option>Pending</option></select>
                    <select className="tx-select-dense"><option>Type: All</option><option>Income</option></select>
                </div>
            </div>

            {/* Table Area */}
            <div className="tx-table-scroll-area">
                <DataTable
                    data={transactions}
                    columns={columns}
                    keyExtractor={(tx) => tx.id}
                    onRowClick={(tx) => onAction?.('view', tx)}
                />
            </div>

            {/* Trust Label - This is the source of truth */}
            <div className="tx-trust-label">
                <span className="trust-icon">◉</span>
                <span>This table drives all calculations above</span>
            </div>
        </div>
    );
};

export default TransactionTable;
