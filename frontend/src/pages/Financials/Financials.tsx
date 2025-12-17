import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { KPIStats, Transaction, TransactionCategory } from '../../types/finance';
import KPIStrip from './components/KPIStrip';
import FinancialChart from './components/FinancialChart';
import TransactionTable from './components/TransactionTable';
import RevenueChart from './components/RevenueChart';
import ExpenseChart from './components/ExpenseChart';
import TransactionModal from './components/TransactionModal';
import { exportToCSV } from '../../utils/exportUtils';
import FinancialAlerts from './components/FinancialAlerts';
import './Financials.css';

const Financials: React.FC = () => {
    // 1. KPI State
    const [kpiStats, setKpiStats] = useState<KPIStats>({
        totalRevenue: 125000, revenueChange: 12.5,
        totalExpenses: 45000, expensesChange: -5.2,
        netProfit: 80000, profitMargin: 64,
        pendingPayments: 24000, pendingCount: 8,
        cashInHand: 15400
    });

    const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');

    // Mock Chart Data for different periods
    const mockChartData = {
        day: Array.from({ length: 12 }, (_, i) => ({ name: `${i * 2}h`, value: Math.floor(Math.random() * 5000) + 1000 })),
        week: Array.from({ length: 7 }, (_, i) => ({ name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: Math.floor(Math.random() * 20000) + 5000 })),
        month: Array.from({ length: 4 }, (_, i) => ({ name: `Week ${i + 1}`, value: Math.floor(Math.random() * 80000) + 20000 }))
    };

    // 2. Transactions State (Mock Data aligned with Transaction Interface)
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const base = [
            { id: '1', invoiceId: 'INV-001', date: '2024-11-01', description: 'Membership - Gold', amount: 5000, category: 'Membership', status: 'Completed', method: 'UPI' },
            { id: '2', invoiceId: 'EXP-002', date: '2024-11-02', description: 'Rent Payment', amount: -25000, category: 'Other', status: 'Completed', method: 'Bank Transfer' },
            { id: '3', invoiceId: 'INV-003', date: '2024-11-03', description: 'PT Session 10 Pack', amount: 15000, category: 'Personal Training', status: 'Pending', method: 'Card' },
            { id: '4', invoiceId: 'EXP-004', date: '2024-11-04', description: 'Equipment Maint', amount: -2000, category: 'Other', status: 'Completed', method: 'Cash' },
            { id: '5', invoiceId: 'INV-005', date: '2024-11-05', description: 'Supplements', amount: 3500, category: 'Merchandise', status: 'Completed', method: 'UPI' },
        ];
        // Generate 45 more for scrolling proof
        const more = Array.from({ length: 45 }, (_, i) => ({
            id: `gen-${i}`,
            invoiceId: `INV-0${10 + i}`,
            date: `2024-11-${10 + (i % 20)}`,
            description: i % 3 === 0 ? 'Day Pass' : i % 3 === 1 ? 'Protein Shake' : 'Monthly Sub',
            amount: i % 3 === 0 ? 500 : i % 3 === 1 ? 250 : 3000,
            category: i % 3 === 0 ? 'Registration' : i % 3 === 1 ? 'Merchandise' : 'Membership',
            status: i % 5 === 0 ? 'Pending' : 'Completed',
            method: 'UPI'
        }));
        return [...base, ...more] as Transaction[];
    });

    // 3. Filter State
    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    const filteredTransactions = filterCategory
        ? transactions.filter(t => t.category === filterCategory)
        : transactions;

    // 4. Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handlers
    const handleExport = () => {
        exportToCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}`);
        toast.success('Report downloaded successfully');
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
        toast.success(`${newTx.type} added successfully`);

        // Update KPIs
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

    return (
        <div className="financials-page">
            {/* Header Section with Actions */}
            <header className="financials-header">
                <div>
                    <h1 className="page-title">Financial Overview</h1>
                    <p className="page-subtitle">Track revenue, expenses, and profitability in real-time.</p>
                </div>
                <div className="financials-actions">
                    <button className="btn btn--secondary" onClick={handleExport}>
                        Export Report
                    </button>
                    <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                        + Add Transaction
                    </button>
                </div>
            </header>

            {/* Main Grid Content */}
            <div className="financials-grid">
                {/* 1. Money Health (KPI Strip) */}
                <section className="kpi-section">
                    <KPIStrip stats={kpiStats} />
                </section>

                {/* 2. Main Financial Context & Control (Grid 2:1) */}
                <div className="financial-context-grid">
                    {/* Left: Main Chart (Reduced height) */}
                    <section className="financial-chart-card">
                        <FinancialChart
                            data={mockChartData[chartPeriod] || []}
                            period={chartPeriod}
                            onPeriodChange={setChartPeriod}
                        />
                    </section>

                    {/* Right: Action Alerts Widget (Filling the void) */}
                    <section className="alerts-section">
                        <div className="section-header-compact">
                            <h3>Action Triggers</h3>
                            <span className="badge-count">3</span>
                        </div>
                        <FinancialAlerts />
                    </section>
                </div>

                {/* 3. Breakdown Compact Row (Grid 1:1) */}
                <div className="financial-breakdown-row">
                    <section className="revenue-sources-section compact-card">
                        <div className="section-header-compact"><h3>Revenue Sources</h3></div>
                        <RevenueChart onFilter={setFilterCategory} />
                    </section>

                    <section className="expense-breakdown-section compact-card">
                        <div className="section-header-compact"><h3>Expense Breakdown</h3></div>
                        <ExpenseChart onFilter={setFilterCategory} />
                    </section>
                </div>

                {/* 4. Transactions Table (Hero) */}
                <section className="transactions-section">
                    <div className="section-header-row">
                        <div className="flex items-center gap-3">
                            <h3>Recent Transactions</h3>
                            {filterCategory && (
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    Filtered: {filterCategory}
                                    <button
                                        onClick={() => setFilterCategory(null)}
                                        className="hover:text-red-500 ml-1"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                        </div>
                        <div className="table-actions">
                            <span className="text-secondary text-sm">Showing {filteredTransactions.length} items</span>
                        </div>
                    </div>
                    <TransactionTable
                        transactions={filteredTransactions}
                        onAction={(action, tx) => toast(`${action} ${tx.invoiceId}`)}
                    />
                </section>
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTransaction}
            />
        </div>
    );
};

export default Financials;
