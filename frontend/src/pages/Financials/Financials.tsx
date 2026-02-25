import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import PendingInvoices from './components/PendingInvoices';
import CategoryStats from './components/CategoryStats';
import QuickInsights from './components/QuickInsights';
import { exportToCSV, exportFinancialPDF } from '../../utils/exportUtils';
import { financeApi } from '../../services/financeApi';
import { formatCurrency } from '../../utils/formatters';
import './Financials.css';

type TabKey = 'overview' | 'transactions' | 'reports';
type Period = 'day' | 'week' | 'month';

const PERIODS: { key: Period; label: string }[] = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
];

const Financials: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'reports') setActiveTab('reports');
        else if (tab === 'transactions') setActiveTab('transactions');
    }, []);

    const [kpiStats, setKpiStats] = useState<KPIStats>({
        totalRevenue: 0, revenueChange: 0,
        totalExpenses: 0, expensesChange: 0,
        netProfit: 0, profitMargin: 0,
        pendingPayments: 0, pendingCount: 0, cashInHand: 0
    });

    const [chartPeriod, setChartPeriod] = useState<Period>('month');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [breakdownData, setBreakdownData] = useState<{ revenue: any[]; expenses: any[] }>({ revenue: [], expenses: [] });
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

            const mappedTxs: Transaction[] = (txs?.content ?? []).map((t: any) => ({
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
            }));

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

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => {
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Close export menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setExportMenuOpen(false);
            }
        };
        if (exportMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [exportMenuOpen]);

    const handleAddTransaction = async (data: any) => {
        try {
            await financeApi.createTransaction({
                type: data.type === 'Expense' ? 'EXPENSE' : 'INCOME',
                category: data.category,
                amount: Number(data.amount),
                description: data.description,
                status: data.status || 'Completed',
                referenceNumber: `REF-${Date.now()}`,
                dateTime: `${data.date}T${new Date().toTimeString().split(' ')[0]}`
            } as any);
            showToast('Transaction added', 'success');
            setIsModalOpen(false);
            loadData();
        } catch {
            showToast('Failed to create transaction', 'error');
        }
    };

    const handleMarkPaid = async (id: number) => {
        if (!window.confirm('Mark this transaction as paid?')) return;
        try {
            await financeApi.updateTransaction(id, { status: 'Completed' });
            showToast('Payment collected', 'success');
            loadData();
        } catch {
            showToast('Failed to update', 'error');
        }
    };

    const handleExportPDF = () => {
        exportFinancialPDF({
            stats: kpiStats, transactions,
            revenueBreakdown: breakdownData.revenue,
            expenseBreakdown: breakdownData.expenses,
            period: chartPeriod,
            categoryIncomeStats: incomeCatStats,
            categoryExpenseStats: expenseCatStats,
            pendingTransactions: pendingTxs,
            dailyTrend, topIncomeTransactions: topIncomeTxs,
            topExpenseTransactions: topExpenseTxs,
        });
        setExportMenuOpen(false);
        showToast('PDF report downloaded', 'success');
    };

    const handleExportCSV = () => {
        exportToCSV(transactions.map(t => ({
            ID: t.invoiceId, Date: t.date, Description: t.description,
            Category: t.category, Type: t.type, Amount: t.amount, Status: t.status
        })), 'financial_report');
        setExportMenuOpen(false);
        showToast('CSV exported', 'success');
    };

    const displayedTransactions = filterCategory
        ? transactions.filter(t => t.category === filterCategory)
        : transactions;

    const profitColor = kpiStats.profitMargin >= 20 ? 'emerald' : kpiStats.profitMargin >= 0 ? 'amber' : 'crimson';

    if (isLoading && transactions.length === 0 && kpiStats.totalRevenue === 0) {
        return (
            <div className="fin-page">
                <div className="fin-loading">
                    <div className="fin-spinner" />
                    <span>Loading financial data…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fin-page">

            {/* ── TOP TOOLBAR ─────────────────────────────────────── */}
            <header className="fin-toolbar">
                {/* Left: title + live */}
                <div className="fin-toolbar__left">
                    <h1 className="fin-title">Financials</h1>
                    <span className="fin-live"><span className="fin-live__dot" />Live</span>
                    <span className="fin-updated">
                        {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Center: period toggle */}
                <div className="fin-period-toggle">
                    {PERIODS.map(p => (
                        <button
                            key={p.key}
                            className={`fin-period-btn${chartPeriod === p.key ? ' active' : ''}`}
                            onClick={() => setChartPeriod(p.key)}
                        >{p.label}</button>
                    ))}
                </div>

                {/* Right: stat chips + export + add */}
                <div className="fin-toolbar__right">
                    <div className="fin-chip-row">
                        <span className="fin-chip">
                            <span className="fin-chip__dot emerald" />
                            <span className="fin-chip__label">Revenue</span>
                            <span className="fin-chip__val emerald">{formatCurrency(kpiStats.totalRevenue)}</span>
                        </span>
                        <span className="fin-chip">
                            <span className="fin-chip__dot crimson" />
                            <span className="fin-chip__label">Expenses</span>
                            <span className="fin-chip__val crimson">{formatCurrency(kpiStats.totalExpenses)}</span>
                        </span>
                        <span className="fin-chip">
                            <span className="fin-chip__dot blue" />
                            <span className="fin-chip__label">Profit</span>
                            <span className={`fin-chip__val ${profitColor}`}>{formatCurrency(kpiStats.netProfit)}</span>
                        </span>
                        {kpiStats.pendingCount > 0 && (
                            <span className="fin-chip fin-chip--alert">
                                <span className="fin-chip__dot amber" />
                                <span className="fin-chip__label">Pending</span>
                                <span className="fin-chip__val amber">{kpiStats.pendingCount}</span>
                            </span>
                        )}
                    </div>

                    <div className="fin-export-wrap" ref={exportRef}>
                        <button className="fin-btn fin-btn--ghost" onClick={() => setExportMenuOpen(v => !v)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export
                        </button>
                        {exportMenuOpen && (
                            <div className="fin-export-menu">
                                <button className="fin-export-item" onClick={handleExportPDF}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <span>
                                        PDF Report
                                        <em>Full report with charts</em>
                                    </span>
                                </button>
                                <button className="fin-export-item" onClick={handleExportCSV}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <line x1="3" y1="9" x2="21" y2="9"/>
                                        <line x1="9" y1="21" x2="9" y2="9"/>
                                    </svg>
                                    <span>
                                        CSV
                                        <em>Raw transaction data</em>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="fin-btn fin-btn--primary" onClick={() => setIsModalOpen(true)}>
                        + Add Transaction
                    </button>
                </div>
            </header>

            {/* ── TAB NAV ─────────────────────────────────────────── */}
            <nav className="fin-tabs">
                <button className={`fin-tab${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Overview
                </button>
                <button className={`fin-tab${activeTab === 'transactions' ? ' active' : ''}`} onClick={() => setActiveTab('transactions')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Transactions
                    <span className="fin-tab__count">{transactions.length}</span>
                </button>
                <button className={`fin-tab${activeTab === 'reports' ? ' active' : ''}`} onClick={() => setActiveTab('reports')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Reports
                </button>

                {/* filter badge lives in tab bar */}
                {filterCategory && (
                    <span className="fin-filter-badge">
                        {filterCategory}
                        <button onClick={() => setFilterCategory(null)}>×</button>
                    </span>
                )}
            </nav>

            {/* ── TAB CONTENT ─────────────────────────────────────── */}
            <div className="fin-content">

                {/* ══ OVERVIEW ══ */}
                {activeTab === 'overview' && (
                    <div className="fin-grid">
                        {/* Row 1: 4 KPI cards */}
                        <KPIStrip stats={kpiStats} />

                        {/* Row 2: Main chart (left 2/3) + right panel: Health Score + Quick Insights stacked (1/3) */}
                        <div className="fin-row fin-row--chart">
                            <div className="fin-card fin-card--chart">
                                <FinancialChart
                                    data={chartData}
                                    period={chartPeriod}
                                    onPeriodChange={setChartPeriod}
                                />
                            </div>
                            <div className="fin-right-panel">
                                <div className="fin-card fin-card--health">
                                    <FinancialHealthScore
                                        totalRevenue={kpiStats.totalRevenue}
                                        totalExpenses={kpiStats.totalExpenses}
                                        netProfit={kpiStats.netProfit}
                                        profitMargin={kpiStats.profitMargin}
                                        pendingPayments={kpiStats.pendingPayments}
                                        revenueChange={kpiStats.revenueChange}
                                    />
                                </div>
                                <div className="fin-card fin-card--insights">
                                    <QuickInsights
                                        stats={kpiStats}
                                        transactions={transactions}
                                        chartData={chartData}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Revenue breakdown (1/2) + Expense breakdown (1/2) */}
                        <div className="fin-row fin-row--half">
                            <div className="fin-card fin-card--breakdown">
                                <div className="fin-card__hd">
                                    <span className="fin-card__title">Revenue Sources</span>
                                    <span className="fin-badge fin-badge--emerald">{formatCurrency(kpiStats.totalRevenue)}</span>
                                </div>
                                <RevenueChart onFilter={setFilterCategory} data={breakdownData.revenue} />
                            </div>
                            <div className="fin-card fin-card--breakdown">
                                <div className="fin-card__hd">
                                    <span className="fin-card__title">Expense Breakdown</span>
                                    <span className="fin-badge fin-badge--crimson">{formatCurrency(kpiStats.totalExpenses)}</span>
                                </div>
                                <ExpenseChart onFilter={setFilterCategory} data={breakdownData.expenses} />
                            </div>
                        </div>

                        {/* Row 4: Cash Flow (1/2) + Pending (1/2) */}
                        <div className="fin-row fin-row--half">
                            <div className="fin-card">
                                <CashFlowWaterfall
                                    transactions={transactions}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                />
                            </div>
                            <div className="fin-card">
                                <PendingInvoices
                                    transactions={pendingTxs}
                                    onMarkPaid={handleMarkPaid}
                                    totalPending={kpiStats.pendingPayments}
                                />
                            </div>
                        </div>

                        {/* Row 5: Category Stats full width */}
                        <div className="fin-card">
                            <CategoryStats
                                incomeStats={incomeCatStats}
                                expenseStats={expenseCatStats}
                                totalRevenue={kpiStats.totalRevenue}
                                totalExpenses={kpiStats.totalExpenses}
                            />
                        </div>

                        {/* Row 6: Recent Transactions */}
                        <div className="fin-card fin-card--table">
                            <div className="fin-card__hd">
                                <span className="fin-card__title">Recent Transactions</span>
                                <div className="fin-card__hd-right">
                                    <span className="fin-record-count">{displayedTransactions.length} records</span>
                                    <button className="fin-btn fin-btn--link" onClick={() => setActiveTab('transactions')}>
                                        View All →
                                    </button>
                                </div>
                            </div>
                            <TransactionTable
                                transactions={displayedTransactions.slice(0, 10)}
                                onAction={async (action, tx) => { if (action === 'mark-paid') handleMarkPaid(tx.id); }}
                            />
                        </div>
                    </div>
                )}

                {/* ══ TRANSACTIONS ══ */}
                {activeTab === 'transactions' && (
                    <div className="fin-grid">
                        <KPIStrip stats={kpiStats} />
                        <div className="fin-card fin-card--table fin-card--full">
                            <div className="fin-card__hd">
                                <span className="fin-card__title">All Transactions</span>
                                <span className="fin-record-count">{displayedTransactions.length} records</span>
                            </div>
                            <TransactionTable
                                transactions={displayedTransactions}
                                onAction={async (action, tx) => { if (action === 'mark-paid') handleMarkPaid(tx.id); }}
                            />
                        </div>
                    </div>
                )}

                {/* ══ REPORTS ══ */}
                {activeTab === 'reports' && (
                    <div className="fin-grid">
                        <KPIStrip stats={kpiStats} />

                        {/* P&L + Health */}
                        <div className="fin-row fin-row--half">
                            <div className="fin-card fin-card--pl">
                                <ProfitLossCard
                                    revenue={breakdownData.revenue}
                                    expenses={breakdownData.expenses}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                    netProfit={kpiStats.netProfit}
                                    profitMargin={kpiStats.profitMargin}
                                />
                            </div>
                            <div className="fin-card">
                                <FinancialHealthScore
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                    netProfit={kpiStats.netProfit}
                                    profitMargin={kpiStats.profitMargin}
                                    pendingPayments={kpiStats.pendingPayments}
                                    revenueChange={kpiStats.revenueChange}
                                />
                            </div>
                        </div>

                        {/* Cash Flow full width */}
                        <div className="fin-card">
                            <CashFlowWaterfall
                                transactions={transactions}
                                totalRevenue={kpiStats.totalRevenue}
                                totalExpenses={kpiStats.totalExpenses}
                            />
                        </div>

                        {/* Daily Comparison full width */}
                        <div className="fin-card">
                            <MonthlyComparison chartData={chartData} period={chartPeriod} />
                        </div>

                        {/* Category + Insights */}
                        <div className="fin-row fin-row--half">
                            <div className="fin-card">
                                <CategoryStats
                                    incomeStats={incomeCatStats}
                                    expenseStats={expenseCatStats}
                                    totalRevenue={kpiStats.totalRevenue}
                                    totalExpenses={kpiStats.totalExpenses}
                                />
                            </div>
                            <div className="fin-card">
                                <QuickInsights
                                    stats={kpiStats}
                                    transactions={transactions}
                                    chartData={chartData}
                                />
                            </div>
                        </div>

                        {/* Pending Collections */}
                        <div className="fin-card">
                            <PendingInvoices
                                transactions={pendingTxs}
                                onMarkPaid={handleMarkPaid}
                                totalPending={kpiStats.pendingPayments}
                            />
                        </div>

                        {/* Export CTA */}
                        <div className="fin-export-cta">
                            <div>
                                <p className="fin-cta-title">Download Full Financial Report</p>
                                <p className="fin-cta-desc">PDF with P&amp;L, breakdowns, category analysis, pending dues &amp; full ledger.</p>
                            </div>
                            <button className="fin-btn fin-btn--primary fin-btn--lg" onClick={handleExportPDF}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                Download PDF
                            </button>
                        </div>
                    </div>
                )}
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
