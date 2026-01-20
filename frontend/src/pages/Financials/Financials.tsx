import React, { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../utils/showToast';
import type { KPIStats, Transaction, RevenueSource, ExpenseBreakdown } from '../../types/finance';
import KPIStrip from './components/KPIStrip';
import FinancialChart from './components/FinancialChart';
import TransactionTable from './components/TransactionTable';
import RevenueChart from './components/RevenueChart';
import ExpenseChart from './components/ExpenseChart';
import TransactionModal from './components/TransactionModal';
import { exportToCSV } from '../../utils/exportUtils';
import FinancialAlerts from './components/FinancialAlerts';
import { financeApi } from '../../services/financeApi';
import './Financials.css';

const Financials: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Stats State
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

    const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [breakdownData, setBreakdownData] = useState<{ revenue: any[], expenses: any[] }>({ revenue: [], expenses: [] });
    const [chartData, setChartData] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [stats, txs, breakdown, cData] = await Promise.all([
                financeApi.getOverview(chartPeriod),
                financeApi.getTransactions({ page: 0, size: 20 }),
                financeApi.getBreakdown(chartPeriod),
                financeApi.getChartData(chartPeriod)
            ]);

            // Map Stats
            if (stats) {
                setKpiStats({
                    totalRevenue: stats.totalRevenue || 0,
                    revenueChange: stats.revenueChange || 0,
                    totalExpenses: stats.totalExpenses || 0,
                    expensesChange: stats.expensesChange || 0,
                    netProfit: stats.netProfit || 0,
                    profitMargin: stats.profitMargin || 0,
                    pendingPayments: stats.pendingPayments || 0,
                    pendingCount: 0, 
                    cashInHand: 0
                });
            }

            // Map Transactions
            const mappedTxs: Transaction[] = (txs && txs.content) ? txs.content.map((t: any) => ({
                id: t.transactionId,
                dateTime: t.dateTime,
                date: t.dateTime ? new Date(t.dateTime).toISOString() : '',
                invoiceId: t.referenceNumber || `INV-${t.transactionId}`,
                description: t.description,
                category: t.category,
                type: t.type,
                amount: t.amount,
                status: t.status,
                method: 'UPI',
            })) : [];

            setTransactions(mappedTxs);
            setBreakdownData(breakdown || { revenue: [], expenses: [] });
            setChartData(cData || []);

        } catch (error) {
            console.error(error);
            showToast('Failed to load financial data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [chartPeriod]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddTransaction = async (data: any) => {
        try {
            // Map form data to Backend DTO
            const newTx = {
                type: data.type === 'Expense' ? 'EXPENSE' : 'INCOME',
                category: data.category,
                amount: Number(data.amount),
                description: data.description,
                status: data.status || 'Completed',
                referenceNumber: `REF-${Date.now()}`,
                dateTime: `${data.date}T${new Date().toTimeString().split(' ')[0]}`
            };

            await financeApi.createTransaction(newTx as any);
            showToast('Transaction created successfully', 'success');
            setIsModalOpen(false);
            loadData(); // Refresh data
        } catch (error) {
            showToast('Failed to create transaction', 'error');
        }
    };

    const handleExport = () => {
        const data = transactions.map(t => ({
            ID: t.invoiceId,
            Date: t.date,
            Description: t.description,
            Category: t.category,
            Type: t.type,
            Amount: t.amount,
            Status: t.status
        }));
        exportToCSV(data, 'financial_report');
    };

    const displayedTransactions = filterCategory
        ? transactions.filter(t => t.category === filterCategory)
        : transactions;

    if (isLoading && transactions.length === 0 && kpiStats.totalRevenue === 0) {
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
                        Export
                    </button>
                    <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                        + Add Transaction
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
                            data={chartData}
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
                            <span className="total-badge">₹{kpiStats.totalRevenue.toLocaleString()}</span>
                        </div>
                        <RevenueChart onFilter={setFilterCategory} data={breakdownData.revenue} />
                    </section>

                    <section className="breakdown-card">
                        <div className="section-header-inline">
                            <h3>Expense Breakdown</h3>
                            <span className="total-badge expense">₹{kpiStats.totalExpenses.toLocaleString()}</span>
                        </div>
                        <ExpenseChart onFilter={setFilterCategory} data={breakdownData.expenses} />
                    </section>
                </div>

                <section className="transactions-section">
                    <div className="section-header-row">
                        <h3>Recent Transactions</h3>
                        <span className="record-count">{transactions.length} records</span>
                    </div>
                    <TransactionTable
                        transactions={displayedTransactions}
                        onAction={async (action, tx) => {
                            if (action === 'mark-paid') {
                                if (window.confirm('Mark this transaction as paid?')) {
                                    try {
                                        await financeApi.updateTransaction(tx.id, { status: 'Completed' });
                                        showToast('Status updated', 'success');
                                        loadData();
                                    } catch (e) { showToast('Failed update', 'error'); }
                                }
                            } else if (action === 'view') {
                                // For now just log, can implement view modal later
                                console.log('View transaction:', tx);
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
