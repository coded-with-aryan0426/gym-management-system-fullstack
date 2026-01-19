import React, { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../utils/showToast';
import type { KPIStats, Transaction, TransactionCategory } from '../../types/finance';
import KPIStrip from './components/KPIStrip';
import FinancialChart from './components/FinancialChart';
import TransactionTable from './components/TransactionTable';
import RevenueChart from './components/RevenueChart';
import ExpenseChart from './components/ExpenseChart';
import TransactionModal from './components/TransactionModal';
import { exportToCSV } from '../../utils/exportUtils';
import FinancialAlerts from './components/FinancialAlerts';
import apiService from '../../services/api';
import './Financials.css';

interface BackendTransaction {
    transactionId: number;
    dateTime: string;
    description: string;
    category: string;
    amount: number;
    status: string;
    userId: number;
}

const Financials: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [kpiStats, setKpiStats] = useState<KPIStats>({
        totalRevenue: 0,
        revenueChange: 0,
        totalExpenses: 0,
        expensesChange: 0,
        netProfit: 0,
        profitMargin: 0,
        pendingPayments: 0,
        pendingCount: 0,
        cashInHand: 0
    });

    const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getDashboardTransactions();
            const data = response as BackendTransaction[];

            const mapped: Transaction[] = data.map((t) => ({
                id: t.transactionId,
                invoiceId: `INV-${String(t.transactionId).padStart(4, '0')}`,
                date: new Date(t.dateTime).toISOString().split('T')[0],
                description: t.description,
                category: mapCategory(t.category),
                amount: t.amount,
                method: 'UPI' as const,
                status: t.status === 'Completed' ? 'Completed' : 'Pending' as const
            }));

            setTransactions(mapped);

            const totalRevenue = mapped.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const totalExpenses = Math.abs(mapped.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
            const pendingTx = mapped.filter(t => t.status === 'Pending');
            const pendingPayments = pendingTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const netProfit = totalRevenue - totalExpenses;
            const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

            setKpiStats({
                totalRevenue,
                revenueChange: 12.5,
                totalExpenses,
                expensesChange: -5.2,
                netProfit,
                profitMargin,
                pendingPayments,
                pendingCount: pendingTx.length,
                cashInHand: totalRevenue * 0.12
            });
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            showToast('Failed to load financial data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const mapCategory = (category: string): TransactionCategory => {
        const map: Record<string, TransactionCategory> = {
            'MEMBERSHIP_RENEWAL': 'Membership',
            'MEMBERSHIP': 'Membership',
            'PERSONAL_TRAINING': 'Personal Training',
            'PT_SESSION': 'Personal Training',
            'CLASS': 'Class Pack',
            'MERCHANDISE': 'Merchandise',
            'REGISTRATION': 'Registration',
            'DIET_PLAN': 'Diet Plan'
        };
        return map[category] || 'Other';
    };

    const chartData = {
        day: Array.from({ length: 12 }, (_, i) => ({
            name: `${i * 2}h`,
            revenue: Math.floor(Math.random() * 5000) + 1000,
            expenses: Math.floor(Math.random() * 2000) + 500
        })),
        week: Array.from({ length: 7 }, (_, i) => ({
            name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            revenue: Math.floor(Math.random() * 20000) + 5000,
            expenses: Math.floor(Math.random() * 8000) + 2000
        })),
        month: Array.from({ length: 4 }, (_, i) => ({
            name: `Week ${i + 1}`,
            revenue: Math.floor(Math.random() * 80000) + 20000,
            expenses: Math.floor(Math.random() * 30000) + 10000
        }))
    };

    const filteredTransactions = filterCategory
        ? transactions.filter(t => t.category === filterCategory)
        : transactions;

    const handleExport = () => {
        exportToCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}`);
        showToast('Report downloaded successfully', 'success');
    };

    const handleAddTransaction = (newTx: any) => {
        const isExpense = newTx.type === 'Expense';
        const finalAmount = isExpense ? -Math.abs(Number(newTx.amount)) : Math.abs(Number(newTx.amount));

        const transaction: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            invoiceId: `INV-${Math.floor(Math.random() * 1000)}`,
            date: newTx.date || new Date().toISOString().split('T')[0],
            description: newTx.description || 'Manual Entry',
            category: newTx.category as TransactionCategory || 'Other',
            amount: finalAmount,
            method: 'Cash',
            status: newTx.status || 'Completed'
        };

        setTransactions(prev => [transaction, ...prev]);
        showToast(`${newTx.type} added successfully`, 'success');

        if (isExpense) {
            setKpiStats(prev => ({
                ...prev,
                totalExpenses: prev.totalExpenses + Math.abs(finalAmount),
                netProfit: prev.netProfit - Math.abs(finalAmount)
            }));
        } else {
            setKpiStats(prev => ({
                ...prev,
                totalRevenue: prev.totalRevenue + finalAmount,
                netProfit: prev.netProfit + finalAmount
            }));
        }
    };

    if (isLoading) {
        return (
            <div className="financials-page">
                <div className="financials-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading financial data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="financials-page">
            <header className="financials-header">
                <div className="header-left">
                    <h1 className="page-title">Financial Overview</h1>
                    <span className="header-badge">Live</span>
                </div>
                <div className="financials-actions">
                    <button className="btn btn--secondary" onClick={handleExport}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                    </button>
                    <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Entry
                    </button>
                </div>
            </header>

            <div className="financials-grid">
                <section className="kpi-section">
                    <KPIStrip stats={kpiStats} />
                </section>

                <div className="main-content-row">
                    <section className="chart-section">
                        <FinancialChart
                            data={chartData[chartPeriod] || []}
                            period={chartPeriod}
                            onPeriodChange={setChartPeriod}
                        />
                    </section>

                    <section className="alerts-section">
                        <div className="section-header-inline">
                            <h3>Action Required</h3>
                            <span className="alert-count">{kpiStats.pendingCount}</span>
                        </div>
                        <FinancialAlerts pendingCount={kpiStats.pendingCount} pendingAmount={kpiStats.pendingPayments} />
                    </section>
                </div>

                <div className="breakdown-row">
                    <section className="breakdown-card">
                        <div className="section-header-inline">
                            <h3>Revenue Sources</h3>
                            <span className="total-badge">₹{kpiStats.totalRevenue.toLocaleString('en-IN')}</span>
                        </div>
                        <RevenueChart onFilter={setFilterCategory} transactions={transactions} />
                    </section>

                    <section className="breakdown-card">
                        <div className="section-header-inline">
                            <h3>Expense Breakdown</h3>
                            <span className="total-badge expense">₹{kpiStats.totalExpenses.toLocaleString('en-IN')}</span>
                        </div>
                        <ExpenseChart onFilter={setFilterCategory} />
                    </section>
                </div>

                <section className="transactions-section">
                    <div className="section-header-row">
                        <div className="header-left">
                            <h3>Recent Transactions</h3>
                            {filterCategory && (
                                <span className="filter-badge">
                                    {filterCategory}
                                    <button onClick={() => setFilterCategory(null)} className="clear-filter">×</button>
                                </span>
                            )}
                        </div>
                        <span className="record-count">{filteredTransactions.length} records</span>
                    </div>
                    <TransactionTable
                        transactions={filteredTransactions}
                        onAction={(action, tx) => {
                            if (action === 'mark-paid') {
                                setTransactions(prev =>
                                    prev.map(t => t.id === tx.id ? { ...t, status: 'Completed' as const } : t)
                                );
                                showToast(`${tx.invoiceId} marked as paid`, 'success');
                            }
                        }}
                    />
                </section>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTransaction}
            />
        </div>
    );
};

export default Financials;
