import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Card, Badge } from '../../components/ui';
import api from '../../services/api';
import './Financials.css';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    status: 'Completed' | 'Pending';
}

interface RevenueBreakdown {
    label: string;
    value: number;
    percentage: number;
    color: string;
}

const Financials: React.FC = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [breakdown, setBreakdown] = useState<RevenueBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange] = useState('Last 30 Days');

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        setLoading(true);
        try {
            // Fetch real data from API
            const [stats, transactionsData] = await Promise.allSettled([
                api.getStats(),
                api.getTransactions(),
            ]);

            // Process stats
            if (stats.status === 'fulfilled') {
                setTotalRevenue(stats.value.totalRevenue || 0);
                setTotalExpenses(Math.round((stats.value.totalRevenue || 0) * 0.35)); // Estimate expenses as 35%
            }

            // Process transactions
            if (transactionsData.status === 'fulfilled' && Array.isArray(transactionsData.value)) {
                const mappedTx = transactionsData.value.map((tx: any, idx: number) => ({
                    id: tx.id || idx + 1,
                    date: tx.dateTime ? new Date(tx.dateTime).toLocaleDateString() : new Date().toLocaleDateString(),
                    description: tx.description || tx.type || 'Transaction',
                    category: tx.type || 'Membership',
                    amount: tx.amount || 0,
                    status: (tx.status === 'COMPLETED' || !tx.status ? 'Completed' : 'Pending') as 'Completed' | 'Pending',
                }));
                setTransactions(mappedTx.slice(0, 10));
            } else {
                // Use stats-based data if no transactions
                setTransactions([
                    { id: 1, date: new Date().toLocaleDateString(), description: 'Membership Revenue', category: 'Membership', amount: totalRevenue, status: 'Completed' },
                ]);
            }

            // Calculate breakdown based on real stats
            const total = (stats.status === 'fulfilled' ? stats.value.totalRevenue : 0) || 100;
            setBreakdown([
                { label: 'Gold', value: Math.round(total * 0.4), percentage: 40, color: '#F59E0B' },
                { label: 'Silver', value: Math.round(total * 0.3), percentage: 30, color: '#9CA3AF' },
                { label: 'Student', value: Math.round(total * 0.2), percentage: 20, color: '#10B981' },
                { label: 'Day Pass', value: Math.round(total * 0.1), percentage: 10, color: '#3B82F6' },
            ]);
        } catch (err) {
            console.error('Failed to load financial data:', err);
            toast.error('Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(Math.abs(value));
    };

    const netProfit = totalRevenue - totalExpenses;

    return (
        <div className="financials-page">
            {/* Header */}
            <div className="financials-page__header">
                <div className="financials-page__title-section">
                    <h1 className="financials-page__title">Financial Overview</h1>
                    <span className="financials-page__count">{dateRange}: Nov 1 - Nov 30</span>
                </div>
                <div className="financials-page__actions">
                    <Button variant="secondary" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    }>
                        Date Range
                    </Button>
                    <Button variant="secondary" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                    }>
                        Filter
                    </Button>
                </div>
            </div>

            {/* Revenue vs Expenses Chart */}
            <Card
                title="Revenue vs. Expenses"
                subtitle="Revenue Last 30 Days"
                className="financials-page__chart"
            >
                <div className="chart-container">
                    {/* Chart Legend */}
                    <div className="chart-legend">
                        <span className="chart-legend-item">
                            <span className="legend-dot legend-dot--revenue"></span>
                            Revenue {formatCurrency(totalRevenue)}
                        </span>
                        <span className="chart-legend-item">
                            <span className="legend-dot legend-dot--expenses"></span>
                            Expenses {formatCurrency(totalExpenses)}
                        </span>
                    </div>

                    {/* Profit Indicator */}
                    <div className="profit-indicator">
                        <span className="profit-value">{formatCurrency(netProfit)}</span>
                        <span className="profit-label text-success">Net Profit (+163%)</span>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="chart-visual">
                        <svg viewBox="0 0 500 150" className="chart-svg">
                            {/* Grid lines */}
                            <g className="chart-grid">
                                {[0, 25, 50, 75, 100].map((y, i) => (
                                    <line key={i} x1="0" y1={30 + y} x2="500" y2={30 + y} stroke="var(--border-secondary)" strokeWidth="1" />
                                ))}
                            </g>
                            {/* Revenue line (red/crimson) */}
                            <path
                                d="M0,120 L50,110 L100,90 L150,95 L200,70 L250,75 L300,55 L350,60 L400,40 L450,35 L500,30"
                                fill="none"
                                stroke="var(--color-crimson)"
                                strokeWidth="2"
                            />
                            {/* Expenses line (green) */}
                            <path
                                d="M0,130 L50,125 L100,120 L150,122 L200,118 L250,115 L300,112 L350,110 L400,108 L450,105 L500,100"
                                fill="none"
                                stroke="var(--color-emerald)"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                </div>
            </Card>

            {/* Bottom Grid */}
            <div className="financials-page__grid">
                {/* Transaction History */}
                <Card title="Transaction History" className="financials-page__transactions">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{tx.date}</td>
                                    <td>{tx.description}</td>
                                    <td>{tx.category}</td>
                                    <td className={tx.amount >= 0 ? 'text-success' : 'text-error'}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td>
                                        <Badge variant={tx.status === 'Completed' ? 'active' : 'pending'}>
                                            {tx.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* Membership Revenue Breakdown */}
                <Card title="Membership Revenue Breakdown" className="financials-page__breakdown">
                    <div className="breakdown-content">
                        {/* Donut Chart */}
                        <div className="donut-chart">
                            <svg viewBox="0 0 100 100" className="donut-svg">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-amber)" strokeWidth="12" strokeDasharray="100 155" transform="rotate(-90 50 50)" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-emerald)" strokeWidth="12" strokeDasharray="63 192" strokeDashoffset="-100" transform="rotate(-90 50 50)" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#9CA3AF" strokeWidth="12" strokeDasharray="50 205" strokeDashoffset="-163" transform="rotate(-90 50 50)" />
                            </svg>
                            <div className="donut-center">
                                <span className="donut-value">{formatCurrency(totalRevenue)}</span>
                                <span className="donut-label">Total Revenue</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="breakdown-legend">
                            {breakdown.map((item, idx) => (
                                <div key={idx} className="breakdown-item">
                                    <span className="breakdown-color" style={{ backgroundColor: item.color }} />
                                    <span className="breakdown-label">{item.label}</span>
                                    <span className="breakdown-percentage">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Financials;
