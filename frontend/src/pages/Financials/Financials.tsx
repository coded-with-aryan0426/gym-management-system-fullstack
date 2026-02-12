import React, { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../utils/showToast';
import type { KPIStats, Transaction } from '../../types/finance';
import KPIStrip from './components/KPIStrip';
import FinancialChart from './components/FinancialChart';
import TransactionTable from './components/TransactionTable';
import RevenueChart from './components/RevenueChart';
import ExpenseChart from './components/ExpenseChart';
import TransactionModal from './components/TransactionModal';
import CashFlowWaterfall from './components/CashFlowWaterfall';
import ProfitLossCard from './components/ProfitLossCard';
import MonthlyComparison from './components/MonthlyComparison';
import FinancialHealthScore from './components/FinancialHealthScore';
import FinancialAlerts from './components/FinancialAlerts';
import PendingInvoices from './components/PendingInvoices';
import CategoryStats from './components/CategoryStats';
import QuickInsights from './components/QuickInsights';
import { exportToCSV, exportFinancialPDF } from '../../utils/exportUtils';
import { financeApi } from '../../services/financeApi';
import './Financials.css';

type TabKey = 'overview' | 'transactions' | 'reports';

const Financials: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [exportMenuOpen, setExportMenuOpen] = useState(false);

    const [kpiStats, setKpiStats] = useState<KPIStats>({
        totalRevenue: 0, revenueChange: 0,
        totalExpenses: 0, expensesChange: 0,
        netProfit: 0, profitMargin: 0,
        pendingPayments: 0, pendingCount: 0, cashInHand: 0
    });

    const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [breakdownData, setBreakdownData] = useState<{ revenue: any[], expenses: any[] }>({ revenue: [], expenses: [] });
    const [chartData, setChartData] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [pendingTxs, setPendingTxs] = useState<any[]>([]);
    const [incomeCatStats, setIncomeCatStats] = useState<any[]>([]);
    const [expenseCatStats, setExpenseCatStats] = useState<any[]>([]);
    const [dailyTrend, setDailyTrend] = useState<any[]>([]);
    const [topIncomeTxs, setTopIncomeTxs] = useState<any[]>([]);
    const [topExpenseTxs, setTopExpenseTxs] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [stats, txs, breakdown, cData, pending, incStats, expStats, trend, topInc, topExp] = await Promise.all([
                financeApi.getOverview(chartPeriod),
                financeApi.getTransactions({ page: 0, size: 100 }),
                financeApi.getBreakdown(chartPeriod),
                financeApi.getChartData(chartPeriod),
                financeApi.getPendingTransactions(chartPeriod).catch(() => []),
                financeApi.getCategoryStats('INCOME', chartPeriod).catch(() => []),
                financeApi.getCategoryStats('EXPENSE', chartPeriod).catch(() => []),
                financeApi.getDailyTrend(chartPeriod).catch(() => []),
                financeApi.getTopTransactions('INCOME', chartPeriod, 5).catch(() => []),
                financeApi.getTopTransactions('EXPENSE', chartPeriod, 5).catch(() => [])
            ]);

            if (stats) {
                setKpiStats({
                    totalRevenue: stats.totalRevenue || 0,
                    revenueChange: stats.revenueChange || 0,
                    totalExpenses: stats.totalExpenses || 0,
                    expensesChange: stats.expensesChange || 0,
                    netProfit: stats.netProfit || 0,
                    profitMargin: stats.profitMargin || 0,
                    pendingPayments: stats.pendingPayments || 0,
                    pendingCount: stats.pendingCount || 0,
                    cashInHand: 0
                });
            }

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
            setPendingTxs(pending || []);
            setIncomeCatStats(incStats || []);
            setExpenseCatStats(expStats || []);
            setDailyTrend(trend || []);
            setTopIncomeTxs(topInc || []);
            setTopExpenseTxs(topExp || []);
            setLastUpdated(new Date());

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

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleAddTransaction = async (data: any) => {
        try {
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
            loadData();
        } catch (error) {
            showToast('Failed to create transaction', 'error');
        }
    };

    const handleMarkPaid = async (id: number) => {
        if (window.confirm('Mark this transaction as paid?')) {
            try {
                await financeApi.updateTransaction(id, { status: 'Completed' });
                showToast('Payment collected', 'success');
                loadData();
            } catch (e) {
                showToast('Failed to update', 'error');
            }
        }
    };

    const handleExportPDF = () => {
        exportFinancialPDF({
            stats: kpiStats,
            transactions,
            revenueBreakdown: breakdownData.revenue,
            expenseBreakdown: breakdownData.expenses,
            period: chartPeriod,
            categoryIncomeStats: incomeCatStats,
            categoryExpenseStats: expenseCatStats,
            pendingTransactions: pendingTxs,
            dailyTrend: dailyTrend,
            topIncomeTransactions: topIncomeTxs,
            topExpenseTransactions: topExpenseTxs,
        });
        setExportMenuOpen(false);
        showToast('PDF report downloaded', 'success');
    };

    const handleExportCSV = () => {
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
        setExportMenuOpen(false);
        showToast('CSV exported', 'success');
    };

    const displayedTransactions = filterCategory
        ? transactions.filter(t => t.category === filterCategory)
        : transactions;

    const incomeCount = transactions.filter(t => t.type === 'INCOME').length;
    const expenseCount = transactions.filter(t => t.type === 'EXPENSE').length;

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
                    <h1 className="page-title">Financials</h1>
                    <span className="header-badge live-badge">
                        <span className="live-dot"></span>Live
                    </span>
                    <span className="header-updated">
                        Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="financials-actions">
                    <div className="export-dropdown-wrap">
                        <button className="btn btn--secondary" onClick={() => setExportMenuOpen(!exportMenuOpen)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export
                        </button>
                        {exportMenuOpen && (
                            <div className="export-dropdown">
                                <button className="export-option" onClick={handleExportPDF}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    Export as PDF Report
                                    <span className="export-desc">Full financial report with charts</span>
                                </button>
                                <button className="export-option" onClick={handleExportCSV}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="3" y1="9" x2="21" y2="9"/>
                                        <line x1="9" y1="21" x2="9" y2="9"/>
                                    </svg>
                                    Export as CSV
                                    <span className="export-desc">Raw transaction data</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                        + Add Transaction
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="financials-tabs">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Overview
                </button>
                <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Transactions
                    <span className="tab-count">{transactions.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Reports & Analysis
                </button>
            </nav>

            {/* Quick Stats Bar */}
            <div className="quick-stats-bar">
                <div className="qs-item">
                    <span className="qs-label">Income Txns</span>
                    <span className="qs-value emerald">{incomeCount}</span>
                </div>
                <div className="qs-divider"></div>
                <div className="qs-item">
                    <span className="qs-label">Expense Txns</span>
                    <span className="qs-value crimson">{expenseCount}</span>
                </div>
                <div className="qs-divider"></div>
                <div className="qs-item">
                    <span className="qs-label">Pending</span>
                    <span className="qs-value amber">{kpiStats.pendingCount}</span>
                </div>
                <div className="qs-divider"></div>
                <div className="qs-item">
                    <span className="qs-label">Profit Margin</span>
                    <span className={`qs-value ${kpiStats.profitMargin >= 0 ? 'emerald' : 'crimson'}`}>{kpiStats.profitMargin}%</span>
                </div>
                <div className="qs-divider"></div>
                <div className="qs-item">
                    <span className="qs-label">Period</span>
                    <span className="qs-value">{chartPeriod === 'day' ? 'Today' : chartPeriod === 'week' ? 'This Week' : 'This Month'}</span>
                </div>
                {filterCategory && (
                    <>
                        <div className="qs-divider"></div>
                        <div className="qs-item">
                            <span className="filter-badge">
                                Filter: {filterCategory}
                                <button className="clear-filter" onClick={() => setFilterCategory(null)}>&times;</button>
                            </span>
                        </div>
                    </>
                )}
            </div>

            <div className="financials-grid">
                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                    <>
                        {/* Section: KPI Cards */}
                        <div className="section-divider">
                            <span className="section-divider-text">Financial Summary</span>
                        </div>
                        <section className="kpi-section">
                            <KPIStrip stats={kpiStats} />
                        </section>

                        {/* Section: Charts & Alerts */}
                        <div className="section-divider">
                            <span className="section-divider-text">Revenue & Expense Trend</span>
                        </div>
                        <div className="main-content-row">
                            <section className="chart-section">
                                <FinancialChart
                                    data={chartData}
                                    period={chartPeriod}
                                    onPeriodChange={setChartPeriod}
                                />
                            </section>

                            <section className="side-section">
                                <QuickInsights
                                    stats={kpiStats}
                                    transactions={transactions}
                                    chartData={chartData}
                                />
                            </section>
                        </div>

                        {/* Section: Cash Flow + Pending */}
                        <div className="section-divider">
                            <span className="section-divider-text">Money Flow & Collections</span>
                        </div>
                        <div className="storytelling-row">
                            <section className="card-section cashflow-card">
                                <CashFlowWaterfall
                                    transactions={transactions}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                />
                            </section>
                            <section className="card-section pending-card">
                                <PendingInvoices
                                    transactions={pendingTxs}
                                    onMarkPaid={handleMarkPaid}
                                    totalPending={kpiStats.pendingPayments}
                                />
                            </section>
                        </div>

                        {/* Section: Revenue & Expense Breakdown */}
                        <div className="section-divider">
                            <span className="section-divider-text">Where Money Comes & Goes</span>
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

                        {/* Section: Health + Category Stats */}
                        <div className="section-divider">
                            <span className="section-divider-text">Health & Category Analysis</span>
                        </div>
                        <div className="storytelling-row">
                            <section className="card-section">
                                <CategoryStats
                                    incomeStats={incomeCatStats}
                                    expenseStats={expenseCatStats}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                />
                            </section>
                            <section className="card-section health-card">
                                <FinancialHealthScore
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                    netProfit={kpiStats.netProfit}
                                    profitMargin={kpiStats.profitMargin}
                                    pendingPayments={kpiStats.pendingPayments}
                                    revenueChange={kpiStats.revenueChange}
                                />
                            </section>
                        </div>

                        {/* Section: Recent Transactions */}
                        <div className="section-divider">
                            <span className="section-divider-text">Recent Transactions</span>
                        </div>
                        <section className="transactions-section">
                            <div className="section-header-row">
                                <div className="header-left">
                                    <h3>Transaction Ledger</h3>
                                    {filterCategory && (
                                        <span className="filter-badge">
                                            {filterCategory}
                                            <button className="clear-filter" onClick={() => setFilterCategory(null)}>&times;</button>
                                        </span>
                                    )}
                                </div>
                                <div className="header-right">
                                    <span className="record-count">{displayedTransactions.length} records</span>
                                    <button className="btn btn--text" onClick={() => setActiveTab('transactions')}>View All</button>
                                </div>
                            </div>
                            <TransactionTable
                                transactions={displayedTransactions.slice(0, 10)}
                                onAction={async (action, tx) => {
                                    if (action === 'mark-paid') {
                                        handleMarkPaid(tx.id);
                                    }
                                }}
                            />
                        </section>
                    </>
                )}

                {/* === TRANSACTIONS TAB === */}
                {activeTab === 'transactions' && (
                    <>
                        <section className="kpi-section">
                            <KPIStrip stats={kpiStats} />
                        </section>
                        <section className="transactions-section transactions-full">
                            <div className="section-header-row">
                                <div className="header-left">
                                    <h3>All Transactions</h3>
                                    {filterCategory && (
                                        <span className="filter-badge">
                                            {filterCategory}
                                            <button className="clear-filter" onClick={() => setFilterCategory(null)}>&times;</button>
                                        </span>
                                    )}
                                </div>
                                <span className="record-count">{displayedTransactions.length} records</span>
                            </div>
                            <TransactionTable
                                transactions={displayedTransactions}
                                onAction={async (action, tx) => {
                                    if (action === 'mark-paid') {
                                        handleMarkPaid(tx.id);
                                    }
                                }}
                            />
                        </section>
                    </>
                )}

                {/* === REPORTS TAB === */}
                {activeTab === 'reports' && (
                    <>
                        <div className="section-divider">
                            <span className="section-divider-text">Financial Summary</span>
                        </div>
                        <section className="kpi-section">
                            <KPIStrip stats={kpiStats} />
                        </section>

                        <div className="section-divider">
                            <span className="section-divider-text">Profit & Loss Statement</span>
                        </div>
                        <div className="reports-row">
                            <section className="card-section pl-card-section">
                                <ProfitLossCard
                                    revenue={breakdownData.revenue}
                                    expenses={breakdownData.expenses}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                    netProfit={kpiStats.netProfit}
                                    profitMargin={kpiStats.profitMargin}
                                />
                            </section>
                            <section className="card-section health-card">
                                <FinancialHealthScore
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                    netProfit={kpiStats.netProfit}
                                    profitMargin={kpiStats.profitMargin}
                                    pendingPayments={kpiStats.pendingPayments}
                                    revenueChange={kpiStats.revenueChange}
                                />
                            </section>
                        </div>

                        <div className="section-divider">
                            <span className="section-divider-text">Cash Flow Analysis</span>
                        </div>
                        <div className="reports-row full-width">
                            <section className="card-section cashflow-card">
                                <CashFlowWaterfall
                                    transactions={transactions}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                />
                            </section>
                        </div>

                        <div className="section-divider">
                            <span className="section-divider-text">Daily Revenue vs Expenses</span>
                        </div>
                        <div className="reports-row full-width">
                            <section className="card-section comparison-card">
                                <MonthlyComparison
                                    chartData={chartData}
                                    period={chartPeriod}
                                />
                            </section>
                        </div>

                        <div className="section-divider">
                            <span className="section-divider-text">Category & Insights</span>
                        </div>
                        <div className="reports-row">
                            <section className="card-section">
                                <CategoryStats
                                    incomeStats={incomeCatStats}
                                    expenseStats={expenseCatStats}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                />
                            </section>
                            <section className="card-section">
                                <QuickInsights
                                    stats={kpiStats}
                                    transactions={transactions}
                                    chartData={chartData}
                                />
                            </section>
                        </div>

                        {/* Pending Collections */}
                        <div className="section-divider">
                            <span className="section-divider-text">Pending Collections</span>
                        </div>
                        <div className="reports-row full-width">
                            <section className="card-section">
                                <PendingInvoices
                                    transactions={pendingTxs}
                                    onMarkPaid={handleMarkPaid}
                                    totalPending={kpiStats.pendingPayments}
                                />
                            </section>
                        </div>

                        {/* Export CTA */}
                        <div className="export-cta">
                            <div className="cta-content">
                                <h3 className="cta-title">Download Full Financial Report</h3>
                                <p className="cta-desc">Professional PDF with P&L statement, revenue/expense breakdown, category analysis, pending dues, and complete transaction ledger.</p>
                            </div>
                            <button className="btn btn--primary btn--lg" onClick={handleExportPDF}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                Download PDF Report
                            </button>
                        </div>
                    </>
                )}
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTransaction}
            />

            {/* Click outside to close export menu */}
            {exportMenuOpen && <div className="export-backdrop" onClick={() => setExportMenuOpen(false)}></div>}
        </div>
    );
};

export default Financials;
