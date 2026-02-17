import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, TrendingDown, Users, Building2,
    DollarSign, Activity, X, AlertTriangle, CheckCircle2, Shield,
    Clock, Zap, Eye, Bell, ChevronRight, Server, Wifi, WifiOff,
    RefreshCw, Globe, HardDrive
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line
} from 'recharts';

const KPI_DATA = [
    {
        label: 'Total Users', value: '1,958', change: +4.2, icon: Users, color: 'blue',
        breakdown: [
            { label: 'Active', value: '1,640', pct: 83.8 },
            { label: 'Inactive (30d+)', value: '218', pct: 11.1 },
            { label: 'Suspended', value: '65', pct: 3.3 },
            { label: 'New (7d)', value: '35', pct: 1.8 },
        ],
    },
    {
        label: 'Total Gyms', value: '247', change: +2.5, icon: Building2, color: 'emerald',
        breakdown: [
            { label: 'Active', value: '231', pct: 93.5 },
            { label: 'Trial', value: '8', pct: 3.2 },
            { label: 'Suspended', value: '5', pct: 2.0 },
            { label: 'Churned', value: '3', pct: 1.2 },
        ],
    },
    {
        label: 'MRR', value: '₹24.5L', change: +6.8, icon: DollarSign, color: 'violet',
        breakdown: [
            { label: 'Enterprise', value: '₹14.2L', pct: 58.0 },
            { label: 'Professional', value: '₹6.8L', pct: 27.8 },
            { label: 'Basic', value: '₹2.9L', pct: 11.8 },
            { label: 'Trial', value: '₹0.6L', pct: 2.4 },
        ],
    },
    {
        label: 'System Health', value: '99.8%', change: +0.2, icon: Activity, color: 'cyan',
        breakdown: [
            { label: 'API Uptime', value: '99.96%', pct: 99.96 },
            { label: 'DB Uptime', value: '99.99%', pct: 99.99 },
            { label: 'CDN Uptime', value: '99.95%', pct: 99.95 },
            { label: 'Avg Response', value: '48ms', pct: 0 },
        ],
    },
];

const ALERTS = [
    { id: 1, title: 'High CPU on API Server', severity: 'critical', time: '5 min ago', description: 'API server cpu-3 is at 92% utilization. Auto-scaling triggered.', source: 'Infrastructure', affectedService: 'API Gateway', status: 'active', metric: 'CPU: 92%', action: 'Auto-scaling initiated — 2 additional instances being provisioned.' },
    { id: 2, title: 'Payment Gateway Latency', severity: 'warning', time: '18 min ago', description: 'Payment processing latency exceeded 2s threshold (currently 2.4s).', source: 'Payments', affectedService: 'Razorpay Gateway', status: 'investigating', metric: 'Latency: 2.4s', action: 'Engineering team notified. Monitoring for auto-recovery.' },
    { id: 3, title: 'Brute Force Attempt Blocked', severity: 'warning', time: '32 min ago', description: '213 failed login attempts from IP 45.33.104.88 — auto-blocked.', source: 'Security', affectedService: 'Auth Service', status: 'resolved', metric: '213 attempts', action: 'IP automatically blocked. No successful breaches.' },
    { id: 4, title: 'Database Backup Completed', severity: 'info', time: '1 hr ago', description: 'Daily backup completed successfully. Size: 1.8 GB, Duration: 4m 32s.', source: 'Database', affectedService: 'PostgreSQL', status: 'resolved', metric: '1.8 GB', action: 'Backup verified and stored in S3.' },
    { id: 5, title: 'New Gym Onboarded', severity: 'info', time: '2 hrs ago', description: 'PowerHouse Gym (Delhi) completed onboarding — Enterprise plan.', source: 'Platform', affectedService: 'Onboarding', status: 'resolved', metric: 'Enterprise', action: 'Welcome email sent. Account manager assigned.' },
];

const RESPONSE_TREND = [
    { t: '12AM', avg: 42, p95: 120 }, { t: '3AM', avg: 35, p95: 85 },
    { t: '6AM', avg: 38, p95: 95 }, { t: '9AM', avg: 52, p95: 145 },
    { t: '12PM', avg: 68, p95: 180 }, { t: '3PM', avg: 75, p95: 195 },
    { t: '6PM', avg: 58, p95: 160 }, { t: '9PM', avg: 48, p95: 130 },
    { t: 'Now', avg: 45, p95: 118 },
];

const SERVICES = [
    { name: 'API Gateway', status: 'operational', uptime: 99.96, latency: '45ms' },
    { name: 'Auth Service', status: 'operational', uptime: 99.99, latency: '28ms' },
    { name: 'Payment Service', status: 'degraded', uptime: 99.85, latency: '2.4s' },
    { name: 'Database (Primary)', status: 'operational', uptime: 99.99, latency: '12ms' },
    { name: 'Database (Replica)', status: 'operational', uptime: 99.98, latency: '15ms' },
    { name: 'CDN / Static', status: 'operational', uptime: 99.95, latency: '8ms' },
    { name: 'Email Service', status: 'operational', uptime: 99.90, latency: '350ms' },
    { name: 'Push Notifications', status: 'operational', uptime: 99.88, latency: '180ms' },
];

const AUDIT_LOG = [
    { action: 'Feature flag toggled', detail: 'dark_mode_v2 enabled globally', user: 'Super Admin', time: '12 min ago', type: 'config' },
    { action: 'IP blocked', detail: '45.33.104.88 — Brute force', user: 'System', time: '32 min ago', type: 'security' },
    { action: 'Gym suspended', detail: 'IronCore Fitness — Payment overdue', user: 'Super Admin', time: '1 hr ago', type: 'action' },
    { action: 'Backup completed', detail: 'titan_prod — 1.8 GB', user: 'System', time: '1 hr ago', type: 'system' },
    { action: 'New gym added', detail: 'PowerHouse Gym — Enterprise', user: 'System', time: '2 hrs ago', type: 'action' },
    { action: 'Security rule updated', detail: 'Rate limit changed to 5/15min', user: 'Super Admin', time: '4 hrs ago', type: 'config' },
];

const TOP_GYMS = [
    { name: 'FitZone Elite', city: 'Mumbai', members: 342, revenue: 12400, growth: +8.3 },
    { name: 'FlexFit Studio', city: 'Bangalore', members: 287, revenue: 9800, growth: +6.1 },
    { name: 'Muscle Factory', city: 'Hyderabad', members: 198, revenue: 7200, growth: +4.5 },
    { name: 'PowerHouse Gym', city: 'Delhi', members: 265, revenue: 8900, growth: +9.2 },
    { name: 'Zen Fitness', city: 'Chennai', members: 178, revenue: 6400, growth: +3.8 },
];

type Alert = typeof ALERTS[0];
type KPI = typeof KPI_DATA[0];

const SADashboard: React.FC = () => {
    const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Super Admin Dashboard</h1>
                    <p>Platform overview & system health</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowServicesModal(true)}><Server size={14} /> Status</button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowAuditModal(true)}><Eye size={14} /> Audit Log</button>
                </div>
            </header>

            {/* Clickable KPIs */}
            <div className="sa__kpi-row">
                {KPI_DATA.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        className={`sa__kpi sa__kpi--${kpi.color}`}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedKPI(kpi)}
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

            {/* Uptime Bar */}
            <div className="sa__card" style={{ marginBottom: 16 }}>
                <div className="sa__card-head">
                    <div className="sa__card-icon sa__card-icon--emerald"><Wifi size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Service Uptime (30 Days)</h3>
                        <p className="sa__card-sub">Click for full status page</p>
                    </div>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowServicesModal(true)} style={{ marginLeft: 'auto' }}>View All <ChevronRight size={12} /></button>
                </div>
                <div style={{ display: 'flex', gap: 2, height: 18, borderRadius: 4, overflow: 'hidden' }}>
                    {Array.from({ length: 30 }, (_, i) => {
                        const isDown = i === 12 || i === 22;
                        const isDegraded = i === 15 || i === 28;
                        return (
                            <div key={i} style={{ flex: 1, background: isDown ? '#ef4444' : isDegraded ? '#f59e0b' : '#22c55e', opacity: 0.6 + (i / 30) * 0.4, borderRadius: 1 }} title={`Day ${30 - i}: ${isDown ? 'Downtime' : isDegraded ? 'Degraded' : 'Operational'}`} />
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>30 days ago</span>
                    <span style={{ display: 'flex', gap: 12 }}>
                        {[{ label: 'Operational', color: '#22c55e' }, { label: 'Degraded', color: '#f59e0b' }, { label: 'Downtime', color: '#ef4444' }].map(l => (
                            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 6, height: 6, borderRadius: 2, background: l.color }} />{l.label}</span>
                        ))}
                    </span>
                    <span>Today</span>
                </div>
            </div>

            <div className="sa__grid">
                {/* Response Time Trend */}
                <section className="sa__card sa__card--span-7">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--cyan"><Clock size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Response Time (24h)</h3>
                            <p className="sa__card-sub">Average & P95 latency</p>
                        </div>
                    </div>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={RESPONSE_TREND} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="avgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                                </defs>
                                <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickFormatter={(v: number) => `${v}ms`} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                <Area type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={1} fill="none" dot={false} name="P95" />
                                <Area type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={2} fill="url(#avgG)" dot={false} name="Average" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Top Gyms */}
                <section className="sa__card sa__card--span-5" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--blue"><Building2 size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Top Gyms by Revenue</h3>
                            <p className="sa__card-sub">This month</p>
                        </div>
                    </div>
                    <table className="sa__table">
                        <thead><tr><th>Gym</th><th>Members</th><th>Revenue</th><th>Growth</th></tr></thead>
                        <tbody>
                            {TOP_GYMS.map(g => (
                                <tr key={g.name}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 12 }}>{g.name}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{g.city}</div>
                                    </td>
                                    <td style={{ fontSize: 11 }}>{g.members}</td>
                                    <td style={{ fontSize: 11, fontWeight: 600 }}>₹{(g.revenue / 1000).toFixed(1)}k</td>
                                    <td style={{ fontSize: 11, color: '#22c55e' }}>+{g.growth}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* Alerts */}
            <div className="sa__card" style={{ marginTop: 16, padding: 0 }}>
                <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                    <div className="sa__card-icon sa__card-icon--rose"><Bell size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Recent Alerts</h3>
                        <p className="sa__card-sub">Click any alert for details</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px 10px' }}>
                    {ALERTS.map(alert => (
                        <div key={alert.id} onClick={() => setSelectedAlert(alert)} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                            cursor: 'pointer', transition: 'background 0.15s',
                            background: alert.severity === 'critical' ? 'rgba(239,68,68,0.04)' : 'transparent',
                            border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'transparent'}`,
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#22c55e' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.title}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{alert.source} · {alert.time}</div>
                            </div>
                            <span className={`sa__badge sa__badge--${alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'amber' : 'green'}`} style={{ fontSize: 9 }}>{alert.status}</span>
                            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── KPI Drilldown Modal ── */}
                {selectedKPI && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedKPI(null)}>
                        <motion.div className="sa__modal" style={{ width: 520 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className={`sa__kpi-icon`} style={{ background: `var(--${selectedKPI.color}-subtle, rgba(59,130,246,0.08))` }}>
                                        <selectedKPI.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="sa__modal-title">{selectedKPI.label}</div>
                                        <div className="sa__modal-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedKPI.value}</span>
                                            <span style={{ fontSize: 11, color: selectedKPI.change >= 0 ? '#22c55e' : '#ef4444' }}>
                                                {selectedKPI.change >= 0 ? '+' : ''}{selectedKPI.change}% vs last month
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedKPI(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div className="sa__modal-section-title">Breakdown</div>
                                {selectedKPI.breakdown.map(item => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{item.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                                        {item.pct > 0 && (
                                            <div style={{ width: 60, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(item.pct, 100)}%`, height: '100%', borderRadius: 3, background: '#3b82f6' }} />
                                            </div>
                                        )}
                                        {item.pct > 0 && <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 35, textAlign: 'right' }}>{item.pct}%</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedKPI(null)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Alert Detail Modal ── */}
                {selectedAlert && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAlert(null)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: selectedAlert.severity === 'critical' ? 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' : selectedAlert.severity === 'warning' ? 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' : 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' }} />
                                <div>
                                    <div className="sa__modal-title">{selectedAlert.title}</div>
                                    <div className="sa__modal-subtitle">
                                        <span className={`sa__badge sa__badge--${selectedAlert.severity === 'critical' ? 'red' : selectedAlert.severity === 'warning' ? 'amber' : 'green'}`}>{selectedAlert.severity}</span>
                                        {' '}· {selectedAlert.time}
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedAlert(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '12px 16px', background: `rgba(${selectedAlert.severity === 'critical' ? '239,68,68' : selectedAlert.severity === 'warning' ? '245,158,11' : '34,197,94'}, 0.06)`, borderRadius: 12, marginBottom: 16, border: `1px solid rgba(${selectedAlert.severity === 'critical' ? '239,68,68' : selectedAlert.severity === 'warning' ? '245,158,11' : '34,197,94'}, 0.15)` }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedAlert.description}</div>
                                </div>

                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Server size={10} />Service</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13 }}>{selectedAlert.affectedService}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Activity size={10} />Metric</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13 }}>{selectedAlert.metric}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Shield size={10} />Status</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13, color: selectedAlert.status === 'resolved' ? '#22c55e' : '#f59e0b' }}>{selectedAlert.status}</div>
                                    </div>
                                </div>

                                <div className="sa__modal-section-title">Action Taken</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 0' }}>{selectedAlert.action}</div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedAlert(null)}>Close</button>
                                {selectedAlert.status !== 'resolved' && (
                                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setSelectedAlert(null)}><CheckCircle2 size={14} /> Acknowledge</button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Service Status Modal ── */}
                {showServicesModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowServicesModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Service Status</div><div className="sa__modal-subtitle">All platform services</div></div>
                                <button className="sa__modal-close" onClick={() => setShowServicesModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {SERVICES.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < SERVICES.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.status === 'operational' ? '#22c55e' : s.status === 'degraded' ? '#f59e0b' : '#ef4444' }} />
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                                        <span style={{ fontSize: 11, fontWeight: 500, color: s.status === 'operational' ? '#22c55e' : '#f59e0b', minWidth: 80 }}>{s.status}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>{s.uptime}%</span>
                                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: 55, textAlign: 'right' }}>{s.latency}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowServicesModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Audit Log Modal ── */}
                {showAuditModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuditModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Audit Log</div><div className="sa__modal-subtitle">Recent administrative actions</div></div>
                                <button className="sa__modal-close" onClick={() => setShowAuditModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {AUDIT_LOG.map((log, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < AUDIT_LOG.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: log.type === 'security' ? 'rgba(239,68,68,0.08)' : log.type === 'config' ? 'rgba(59,130,246,0.08)' : log.type === 'system' ? 'rgba(34,197,94,0.08)' : 'rgba(139,92,246,0.08)' }}>
                                            {log.type === 'security' ? <Shield size={14} style={{ color: '#ef4444' }} /> :
                                                log.type === 'config' ? <Zap size={14} style={{ color: '#3b82f6' }} /> :
                                                    log.type === 'system' ? <Server size={14} style={{ color: '#22c55e' }} /> :
                                                        <Activity size={14} style={{ color: '#8b5cf6' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{log.detail}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{log.user}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowAuditModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default SADashboard;
