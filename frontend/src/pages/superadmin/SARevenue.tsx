import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, Users, CreditCard,
    ArrowRight, AlertCircle, X, Download, RefreshCw, FileText,
    Calendar, ChevronDown, CheckCircle2, AlertTriangle, Search,
    Building2, Receipt, Percent, Clock, Ban, Send
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { superAdminApi, type SuperAdminRevenueData } from '../../services/superAdminApi';
import {
    RevenueMetricCard,
    LedgerMismatchAlert,
    GymPayoutLedger,
    TransactionForensicDrawer,
    type TransactionForensicData
} from '../../components/superadmin/shared';

function useContainerDimensions(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };
        measure();
        const observer = new ResizeObserver(measure);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, [containerRef]);

    return dimensions;
}

/* ─── Fallback Mock Data (used only when API returns empty) ─── */
const FALLBACK_REVENUE_TREND = [
    { m: 'Sep', revenue: 142000 }, { m: 'Oct', revenue: 151000 },
    { m: 'Nov', revenue: 159000 }, { m: 'Dec', revenue: 168000 },
    { m: 'Jan', revenue: 176000 }, { m: 'Feb', revenue: 184250 },
];

const PLAN_DISTRIBUTION = [
    { name: 'Enterprise', value: 68, revenue: 33932, color: '#8b5cf6', price: 499 },
    { name: 'Pro', value: 112, revenue: 22288, color: '#3b82f6', price: 199 },
    { name: 'Starter', value: 52, revenue: 5148, color: '#a1a1aa', price: 99 },
    { name: 'Trial', value: 15, revenue: 0, color: '#f59e0b', price: 0 },
];

const RECENT_PAYMENTS = [
    { id: 'PAY-2025-001', gym: 'FitZone Elite', owner: 'Rahul Sharma', amount: 499, plan: 'Enterprise', date: 'Today, 2:14 PM', status: 'success', method: 'Visa ****4242', gateway: 'Stripe', invoiceId: 'INV-FZ-2025-02', city: 'Vadodara' },
    { id: 'PAY-2025-002', gym: 'IronForge', owner: 'Amit Singh', amount: 499, plan: 'Enterprise', date: 'Today, 1:30 PM', status: 'success', method: 'UPI — amit@paytm', gateway: 'Razorpay', invoiceId: 'INV-IF-2025-02', city: 'Ahmedabad' },
    { id: 'PAY-2025-003', gym: 'Muscle Factory', owner: 'Vikram Reddy', amount: 199, plan: 'Pro', date: 'Today, 11:45 AM', status: 'success', method: 'Mastercard ****8811', gateway: 'Stripe', invoiceId: 'INV-MF-2025-02', city: 'Surat' },
    { id: 'PAY-2025-004', gym: 'PowerHouse Gym', owner: 'Priya Patel', amount: 199, plan: 'Pro', date: 'Yesterday', status: 'success', method: 'Visa ****1234', gateway: 'Stripe', invoiceId: 'INV-PH-2025-02', city: 'Delhi' },
];

const FAILED_PAYMENTS = [
    { id: 'FAIL-001', gym: 'FlexFit Studio', owner: 'Neha Gupta', amount: 99, plan: 'Starter', reason: 'Card declined — insufficient funds', attempts: 3, lastAttempt: 'Feb 10, 3:22 PM', method: 'Visa ****5678', nextRetry: 'Feb 16', city: 'Pune', daysPastDue: 5 },
    { id: 'FAIL-002', gym: 'BodyWorks Gym', owner: 'Rohit Mehta', amount: 199, plan: 'Pro', reason: 'Card expired — 01/2025', attempts: 2, lastAttempt: 'Feb 12, 10:15 AM', method: 'Mastercard ****9900', nextRetry: 'Feb 17', city: 'Ahmedabad', daysPastDue: 3 },
];

const REVENUE_BY_CITY = [
    { city: 'Vadodara', revenue: 48200 }, { city: 'Ahmedabad', revenue: 42100 },
    { city: 'Surat', revenue: 31800 }, { city: 'Delhi', revenue: 22500 },
    { city: 'Hyderabad', revenue: 18900 }, { city: 'Kolkata', revenue: 12400 },
];

const COUPONS = [
    { code: 'LAUNCH50', discount: '50%', type: 'percentage', usageLimit: 100, used: 67, validUntil: 'Mar 31, 2025', status: 'active' },
    { code: 'ANNUAL20', discount: '20%', type: 'percentage', usageLimit: 500, used: 234, validUntil: 'Dec 31, 2025', status: 'active' },
    { code: 'FRIEND10', discount: '₹10', type: 'flat', usageLimit: 200, used: 89, validUntil: 'Jun 30, 2025', status: 'active' },
];

type Payment = typeof RECENT_PAYMENTS[0];
type FailedPayment = typeof FAILED_PAYMENTS[0];

const SARevenue: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useContainerDimensions(containerRef);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [selectedFailed, setSelectedFailed] = useState<FailedPayment | null>(null);
    const [showRefundModal, setShowRefundModal] = useState<Payment | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showDrilldown, setShowDrilldown] = useState<string | null>(null);
    const [showCoupons, setShowCoupons] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [exportFormat, setExportFormat] = useState('csv');

    // ── Real API data ──
    const [revenueData, setRevenueData] = useState<SuperAdminRevenueData | null>(null);

    useEffect(() => {
        superAdminApi.getRevenue()
            .then(data => setRevenueData(data))
            .catch(() => { /* silently fall back to mock data */ });
    }, []);

    // Use real API data when available, otherwise fall back to mock
    const revenueTrend = revenueData?.monthlyTrend?.length
        ? revenueData.monthlyTrend.map(p => ({ m: p.m, revenue: Number(p.revenue ?? 0) }))
        : FALLBACK_REVENUE_TREND;

    const mrrFormatted = revenueData
        ? `₹${Number(revenueData.mrr).toLocaleString('en-IN')}`
        : '₹1,84,250';
    const arrFormatted = revenueData
        ? `₹${(Number(revenueData.arr) / 100000).toFixed(2)}L`
        : '₹22.1L';
    const mrrChange = revenueData ? Number(revenueData.mrrChange.toFixed(1)) : 15.2;

    const kpis = useMemo(() => [
        { label: 'MRR', value: mrrFormatted, change: mrrChange, color: 'emerald', icon: DollarSign, drillKey: 'mrr' },
        { label: 'ARR', value: arrFormatted, change: mrrChange, color: 'blue', icon: TrendingUp, drillKey: 'arr' },
        { label: 'Paying Gyms', value: revenueData ? String(revenueData.topGyms.length) : '—', change: +4.8, color: 'violet', icon: Building2, drillKey: 'gyms' },
        { label: 'Churn Rate', value: '2.1%', change: -0.3, color: 'cyan', icon: Users, drillKey: 'churn' },
        { label: 'Failed Payments', value: String(FAILED_PAYMENTS.length), change: +1, color: 'rose', icon: AlertCircle, drillKey: 'failed' },
    ], [revenueData, mrrFormatted, arrFormatted, mrrChange]);

    const planColor = (p: string) => p === 'Enterprise' ? 'violet' : p === 'Pro' ? 'blue' : p === 'Starter' ? 'gray' : 'amber';

    return (
        <div className="sa" ref={containerRef}>
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Revenue &amp; Billing</h1>
                    <p>Platform financials, payments, and subscription management</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCoupons(true)}><Percent size={14} /> Coupons</button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowExportModal(true)}><Download size={14} /> Export</button>
                </div>
            </header>

            {/* KPIs — clickable */}
            <div className="sa__kpi-row">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        className={`sa__kpi sa__kpi--${kpi.color}`}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowDrilldown(kpi.drillKey)}
                    >
                        <div className="sa__kpi-icon"><kpi.icon size={18} /></div>
                        <div className="sa__kpi-body">
                            <div className="sa__kpi-label">{kpi.label}</div>
                            <div className="sa__kpi-value">{kpi.value}</div>
                            <span style={{ fontSize: 10, color: kpi.change >= 0 ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                                {kpi.change >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                                {kpi.change > 0 ? '+' : ''}{kpi.change}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="sa__grid">
                {/* Revenue Trend */}
                <section className="sa__card sa__card--span-7">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--emerald"><TrendingUp size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Revenue Trend</h3>
                            <p className="sa__card-sub">{revenueData ? 'Live data from database' : '6-month history'}</p>
                        </div>
                    </div>
                    <div style={{ height: 200 }}>
                        {dimensions.width > 0 && dimensions.height > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revG)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : <div style={{ height: '100%', minHeight: 200 }} />}
                    </div>
                </section>

                {/* Plan Distribution */}
                <section className="sa__card sa__card--span-5">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--violet"><CreditCard size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Plan Distribution</h3>
                            <p className="sa__card-sub">{PLAN_DISTRIBUTION.reduce((s, p) => s + p.value, 0)} total subscriptions</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 180 }}>
                        {dimensions.width > 0 && dimensions.height > 0 ? (
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie data={PLAN_DISTRIBUTION} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                                    {PLAN_DISTRIBUTION.map((p, i) => <Cell key={i} fill={p.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : <div style={{ width: '50%', height: '100%', minHeight: 180 }} />}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {PLAN_DISTRIBUTION.map(p => (
                                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{p.name}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.value}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>₹{p.price}/mo</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Revenue by City */}
            <div className="sa__card" style={{ marginTop: 16 }}>
                <div className="sa__card-head">
                    <div className="sa__card-icon sa__card-icon--blue"><Building2 size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Revenue by City</h3>
                        <p className="sa__card-sub">Top performing cities</p>
                    </div>
                </div>
                <div style={{ height: 140 }}>
                    {dimensions.width > 0 && dimensions.height > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_BY_CITY} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                            <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={32}>
                                {REVENUE_BY_CITY.map((_, i) => <Cell key={i} fill={i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#8b5cf6'} fillOpacity={0.6} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    ) : <div style={{ height: '100%', minHeight: 140 }} />}
                </div>
            </div>

            {/* Payment Tables */}
            <div className="sa__grid" style={{ marginTop: 16 }}>
                {/* Recent Payments */}
                <section className="sa__card sa__card--span-7" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--emerald"><CheckCircle2 size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Recent Payments</h3>
                            <p className="sa__card-sub">{RECENT_PAYMENTS.length} successful transactions</p>
                        </div>
                    </div>
                    <table className="sa__table">
                        <thead><tr><th>Gym</th><th>Plan</th><th>Amount</th><th>Method</th><th>Date</th><th></th></tr></thead>
                        <tbody>
                            {RECENT_PAYMENTS.map(p => (
                                <tr key={p.id} onClick={() => setSelectedPayment(p)}>
                                    <td style={{ fontWeight: 600, fontSize: 12 }}>{p.gym}</td>
                                    <td><span className={`sa__badge sa__badge--${planColor(p.plan)}`}>{p.plan}</span></td>
                                    <td style={{ fontWeight: 600, color: '#22c55e' }}>₹{p.amount}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.method}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.date}</td>
                                    <td><ArrowRight size={12} style={{ color: 'var(--text-muted)' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Failed Payments */}
                <section className="sa__card sa__card--span-5" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--rose"><AlertCircle size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Failed Payments</h3>
                            <p className="sa__card-sub">{FAILED_PAYMENTS.length} requiring attention</p>
                        </div>
                    </div>
                    <table className="sa__table">
                        <thead><tr><th>Gym</th><th>Amount</th><th>Attempts</th><th>Past Due</th><th></th></tr></thead>
                        <tbody>
                            {FAILED_PAYMENTS.map(f => (
                                <tr key={f.id} onClick={() => setSelectedFailed(f)}>
                                    <td style={{ fontWeight: 600, fontSize: 12 }}>{f.gym}</td>
                                    <td style={{ fontWeight: 600, color: '#ef4444' }}>₹{f.amount}</td>
                                    <td><span className="sa__badge sa__badge--red">{f.attempts}×</span></td>
                                    <td style={{ fontSize: 11, color: '#f59e0b' }}>{f.daysPastDue}d</td>
                                    <td><ArrowRight size={12} style={{ color: 'var(--text-muted)' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Payment Detail Modal ── */}
                {selectedPayment && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPayment(null)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div>
                                    <div className="sa__modal-title">Payment Details</div>
                                    <div className="sa__modal-subtitle">{selectedPayment.id} · {selectedPayment.gym}</div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedPayment(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {/* Success Banner */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(34, 197, 94, 0.06)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                                    <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>Payment Successful</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processed on {selectedPayment.date}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>${selectedPayment.amount}</div>
                                </div>

                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Building2 size={10} />Gym</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedPayment.gym}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Users size={10} />Owner</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedPayment.owner}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><CreditCard size={10} />Plan</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedPayment.plan}</div>
                                    </div>
                                </div>

                                <div className="sa__modal-section-title">Transaction Details</div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Payment Method</span><span className="sa__stat-value">{selectedPayment.method}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gateway</span><span className="sa__stat-value">{selectedPayment.gateway}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Invoice ID</span><span className="sa__stat-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{selectedPayment.invoiceId}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">City</span><span className="sa__stat-value">{selectedPayment.city}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Transaction ID</span><span className="sa__stat-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{selectedPayment.id}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setSelectedPayment(null); }}><FileText size={14} /> View Invoice</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><Download size={14} /> Download Receipt</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setShowRefundModal(selectedPayment); setSelectedPayment(null); setRefundAmount(String(selectedPayment.amount)); }}><RefreshCw size={14} /> Refund</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Failed Payment Modal ── */}
                {selectedFailed && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFailed(null)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(245,158,11,0.06) 50%, transparent 100%)' }} />
                                <div>
                                    <div className="sa__modal-title">Failed Payment</div>
                                    <div className="sa__modal-subtitle">{selectedFailed.id} · {selectedFailed.gym}</div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedFailed(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {/* Failure Banner */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                    <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{selectedFailed.reason}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedFailed.attempts} failed attempt{selectedFailed.attempts > 1 ? 's' : ''} · {selectedFailed.daysPastDue} days past due</div>
                                    </div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>${selectedFailed.amount}</div>
                                </div>

                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Building2 size={10} />Gym</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedFailed.gym}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Users size={10} />Owner</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedFailed.owner}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Next Retry</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedFailed.nextRetry}</div>
                                    </div>
                                </div>

                                <div className="sa__modal-section-title">Payment Details</div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Plan</span><span className="sa__stat-value">{selectedFailed.plan}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Payment Method</span><span className="sa__stat-value">{selectedFailed.method}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Last Attempt</span><span className="sa__stat-value">{selectedFailed.lastAttempt}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">City</span><span className="sa__stat-value">{selectedFailed.city}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setSelectedFailed(null)}><RefreshCw size={14} /> Retry Charge</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedFailed(null)}><Send size={14} /> Send Reminder</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setSelectedFailed(null)}><Ban size={14} /> Suspend Gym</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Refund Modal ── */}
                {showRefundModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRefundModal(null)}>
                        <motion.div className="sa__modal" style={{ width: 480 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)' }} />
                                <div><div className="sa__modal-title">Process Refund</div><div className="sa__modal-subtitle">{showRefundModal.gym} · {showRefundModal.id}</div></div>
                                <button className="sa__modal-close" onClick={() => setShowRefundModal(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.06)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={16} /> This action cannot be undone. The refund will be processed to the original payment method.
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Refund Amount ($)</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input
                                            type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                                            max={showRefundModal.amount} min={1}
                                            style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none' }}
                                        />
                                        <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setRefundAmount(String(showRefundModal.amount))}>Full (${showRefundModal.amount})</button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</label>
                                    <select
                                        value={refundReason} onChange={e => setRefundReason(e.target.value)}
                                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                                    >
                                        <option value="">Select reason...</option>
                                        <option value="duplicate">Duplicate charge</option>
                                        <option value="service">Service issue</option>
                                        <option value="downgrade">Plan downgrade</option>
                                        <option value="cancel">Cancellation</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowRefundModal(null)}>Cancel</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setShowRefundModal(null)}><RefreshCw size={14} /> Process Refund — ${refundAmount || '0'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Export Modal ── */}
                {showExportModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportModal(false)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Export Revenue Report</div><div className="sa__modal-subtitle">Download financial data</div></div>
                                <button className="sa__modal-close" onClick={() => setShowExportModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Format</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {['csv', 'pdf', 'json'].map(f => (
                                            <button key={f} className={`sa__btn ${exportFormat === f ? 'sa__btn--primary' : 'sa__btn--ghost'} sa__btn--sm`} onClick={() => setExportFormat(f)} style={{ flex: 1 }}>
                                                {f.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Include</label>
                                    {['All Payments', 'Revenue Summary', 'Failed Payments', 'Plan Breakdown', 'City Breakdown'].map(item => (
                                        <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} /> {item}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowExportModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowExportModal(false)}><Download size={14} /> Export {exportFormat.toUpperCase()}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── KPI Drilldown Modal ── */}
                {showDrilldown && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDrilldown(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div>
                                    <div className="sa__modal-title">
                                        {showDrilldown === 'mrr' ? 'MRR Breakdown' : showDrilldown === 'arr' ? 'ARR Breakdown' : showDrilldown === 'gyms' ? 'Paying Gyms' : showDrilldown === 'churn' ? 'Churn Analysis' : 'Failed Payments'}
                                    </div>
                                    <div className="sa__modal-subtitle">Detailed breakdown</div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setShowDrilldown(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {(showDrilldown === 'mrr' || showDrilldown === 'arr') && (
                                    <>
                                        <div className="sa__modal-section-title">Revenue by Plan Tier</div>
                                        <table className="sa__table">
                                            <thead><tr><th>Plan</th><th>Gyms</th><th>Price/mo</th><th>MRR Contribution</th><th>% of Total</th></tr></thead>
                                            <tbody>
                                                {PLAN_DISTRIBUTION.filter(p => p.revenue > 0).map(p => (
                                                    <tr key={p.name}>
                                                        <td><span className={`sa__badge sa__badge--${p.name === 'Enterprise' ? 'violet' : p.name === 'Pro' ? 'blue' : 'gray'}`}>{p.name}</span></td>
                                                        <td>{p.value}</td>
                                                        <td>${p.price}</td>
                                                        <td style={{ fontWeight: 600, color: '#22c55e' }}>${p.revenue.toLocaleString()}</td>
                                                        <td>{((p.revenue / 184250) * 100).toFixed(1)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="sa__modal-section-title" style={{ marginTop: 20 }}>Revenue by City (Top 7)</div>
                                        <table className="sa__table">
                                            <thead><tr><th>City</th><th>Gyms</th><th>Revenue/mo</th></tr></thead>
                                            <tbody>
                                                 {REVENUE_BY_CITY.map(c => (
                                                     <tr key={c.city}><td style={{ fontWeight: 600 }}>{c.city}</td><td>—</td><td style={{ color: '#22c55e', fontWeight: 600 }}>₹{c.revenue.toLocaleString('en-IN')}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                                {showDrilldown === 'gyms' && (
                                    <>
                                        <div className="sa__modal-section-title">Paying Gyms by Plan</div>
                                        {PLAN_DISTRIBUTION.map(p => (
                                            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                                <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                                                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{p.value}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 80 }}>${p.price}/mo each</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {showDrilldown === 'churn' && (
                                    <>
                                        <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.06)', borderRadius: 14, marginBottom: 20, border: '1px solid rgba(245,158,11,0.15)' }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>Churn Risk Indicators</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gyms showing signs of potential cancellation</div>
                                        </div>
                                        {[
                                            { gym: 'FlexFit Studio', risk: 'High', reason: 'Payment overdue 5 days, declining usage', score: 85 },
                                            { gym: 'BodyWorks Gym', risk: 'Medium', reason: 'Payment failed 2×, reduced logins', score: 55 },
                                            { gym: 'Zen Fitness', risk: 'Low', reason: 'Trial ending soon, low feature adoption', score: 30 },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 10, marginBottom: 4 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${item.score >= 70 ? '#ef4444' : item.score >= 40 ? '#f59e0b' : '#22c55e'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: item.score >= 70 ? '#ef4444' : item.score >= 40 ? '#f59e0b' : '#22c55e' }}>
                                                    {item.score}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.gym}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.reason}</div>
                                                </div>
                                                <span className={`sa__badge sa__badge--${item.risk === 'High' ? 'red' : item.risk === 'Medium' ? 'amber' : 'green'}`}>{item.risk} Risk</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {showDrilldown === 'failed' && (
                                    <>
                                        <div className="sa__modal-section-title">All Failed Payments</div>
                                        <table className="sa__table">
                                            <thead><tr><th>Gym</th><th>Owner</th><th>Amount</th><th>Reason</th><th>Attempts</th><th>Days Overdue</th></tr></thead>
                                            <tbody>
                                                {FAILED_PAYMENTS.map(f => (
                                                    <tr key={f.id}>
                                                        <td style={{ fontWeight: 600 }}>{f.gym}</td>
                                                        <td style={{ fontSize: 11 }}>{f.owner}</td>
                                                        <td style={{ color: '#ef4444', fontWeight: 600 }}>${f.amount}</td>
                                                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.reason}</td>
                                                        <td><span className="sa__badge sa__badge--red">{f.attempts}×</span></td>
                                                        <td style={{ color: '#f59e0b', fontWeight: 600 }}>{f.daysPastDue}d</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowDrilldown(null)}>Close</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><Download size={14} /> Export</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Coupons Modal ── */}
                {showCoupons && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCoupons(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Coupon & Discount Management</div><div className="sa__modal-subtitle">{COUPONS.length} coupons configured</div></div>
                                <button className="sa__modal-close" onClick={() => setShowCoupons(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <table className="sa__table">
                                    <thead><tr><th>Code</th><th>Discount</th><th>Usage</th><th>Valid Until</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {COUPONS.map(c => (
                                            <tr key={c.code}>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{c.code}</td>
                                                <td style={{ fontWeight: 600, color: '#22c55e' }}>{c.discount}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--bg-active)' }}>
                                                            <div style={{ width: `${(c.used / c.usageLimit) * 100}%`, height: '100%', borderRadius: 2, background: c.used >= c.usageLimit ? '#ef4444' : '#3b82f6' }} />
                                                        </div>
                                                        <span style={{ fontSize: 11 }}>{c.used}/{c.usageLimit}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.validUntil}</td>
                                                <td><span className={`sa__badge sa__badge--${c.status === 'active' ? 'green' : 'gray'}`}>{c.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCoupons(false)}>Close</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm"><Percent size={14} /> Create Coupon</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default SARevenue;
