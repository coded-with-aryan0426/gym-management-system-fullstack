import React, { useEffect, useState } from 'react';
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
import { superAdminApi, type SuperAdminAlert, type SuperAdminDashboardData, type SuperAdminServiceStatus, type SuperAdminTopGym, type SuperAdminTrendPoint } from '../../services/superAdminApi';

type KPI = {
    label: string;
    value: string;
    change: number;
    icon: typeof Users;
    color: string;
    breakdown: { label: string; value: string; pct: number }[];
};

type Alert = SuperAdminAlert;

const FALLBACK_AUDIT_LOG = [
    { action: 'Super Admin dashboard viewed', detail: 'Dashboard data fetched from backend', user: 'Super Admin', time: 'just now', type: 'system' },
];

const SADashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<SuperAdminAlert | null>(null);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);

    const loadDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await superAdminApi.getDashboard();
            setDashboardData(data);
        } catch (err) {
            setError('Failed to load Super Admin dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const kpiData: KPI[] = dashboardData ? [
        {
            label: 'Total Users',
            value: String(dashboardData.kpis.totalUsers.value),
            change: dashboardData.kpis.totalUsers.change,
            icon: Users,
            color: 'blue',
            breakdown: [
                { label: 'Total Users', value: String(dashboardData.kpis.totalUsers.value), pct: 100 },
                { label: 'Active Check-ins', value: String(dashboardData.summary.activeCheckIns), pct: 0 },
                { label: 'Unread Alerts', value: String(dashboardData.summary.unreadAlerts), pct: 0 },
            ],
        },
        {
            label: 'Total Gyms',
            value: String(dashboardData.kpis.totalGyms.value),
            change: dashboardData.kpis.totalGyms.change,
            icon: Building2,
            color: 'emerald',
            breakdown: [
                { label: 'Total Gyms', value: String(dashboardData.kpis.totalGyms.value), pct: 100 },
                { label: 'Critical Security Events', value: String(dashboardData.summary.criticalSecurityEvents), pct: 0 },
                { label: 'Scheduled Sessions', value: String(dashboardData.summary.scheduledSessions), pct: 0 },
            ],
        },
        {
            label: 'MRR',
            value: `₹${Number(dashboardData.kpis.mrr.value).toLocaleString('en-IN')}`,
            change: dashboardData.kpis.mrr.change,
            icon: DollarSign,
            color: 'violet',
            breakdown: [
                { label: 'Current MRR', value: `₹${Number(dashboardData.kpis.mrr.value).toLocaleString('en-IN')}`, pct: 100 },
            ],
        },
        {
            label: 'System Health',
            value: `${Number(dashboardData.kpis.systemHealth.value).toFixed(2)}%`,
            change: dashboardData.kpis.systemHealth.change,
            icon: Activity,
            color: 'cyan',
            breakdown: dashboardData.serviceStatus.map((s) => ({
                label: s.name,
                value: `${s.uptime}%`,
                pct: s.uptime,
            })),
        },
    ] : [];

    const alerts = dashboardData?.alerts ?? [];
    const topGyms = dashboardData?.topGyms ?? [];
    const responseTrend = dashboardData?.responseTrend ?? [];
    const services = dashboardData?.serviceStatus ?? [];
    const auditLog = dashboardData?.activityStream?.map((item) => ({
        action: item.type,
        detail: item.message,
        user: item.severity === 'critical' ? 'System' : 'Super Admin',
        time: item.time,
        type: item.severity === 'critical' ? 'security' : 'system',
    })) ?? FALLBACK_AUDIT_LOG;

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Super Admin Dashboard</h1>
                    <p>{loading ? 'Loading dashboard...' : 'Platform overview & system health'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={loadDashboard}><RefreshCw size={14} /> Refresh</button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowServicesModal(true)}><Server size={14} /> Status</button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowAuditModal(true)}><Eye size={14} /> Audit Log</button>
                </div>
            </header>

            {error && (
                <div className="sa__card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.4)' }}>
                    <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>
                </div>
            )}

            {/* Clickable KPIs */}
            <div className="sa__kpi-row">
                {kpiData.map((kpi, i) => (
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
                                {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(2)}%
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
                            <AreaChart data={responseTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
                            {topGyms.map(g => (
                                <tr key={g.name}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 12 }}>{g.name}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{g.city}</div>
                                    </td>
                                    <td style={{ fontSize: 11 }}>{g.members}</td>
                                    <td style={{ fontSize: 11, fontWeight: 600 }}>₹{(Number(g.revenue) / 1000).toFixed(1)}k</td>
                                    <td style={{ fontSize: 11, color: '#22c55e' }}>—</td>
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
                    {alerts.map(alert => (
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
                            {services.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < services.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
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
                                {auditLog.map((log, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < auditLog.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
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
