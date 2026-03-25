import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, TrendingDown, Users, Building2,
    DollarSign, Activity, X, AlertTriangle, CheckCircle2, Shield,
    Clock, Zap, Eye, Bell, ChevronRight, Server, Wifi, WifiOff,
    RefreshCw, Globe, HardDrive, Download
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line
} from 'recharts';
import { superAdminApi, type SuperAdminAlert, type SuperAdminDashboardData, type SuperAdminServiceStatus, type SuperAdminTopGym, type SuperAdminTrendPoint, type SuperAdminAuditLogEntry } from '../../services/superAdminApi';
import {
    MetricGrid,
    StatCard,
    ChartCard,
    DataTable,
    ActionPanel,
    StatusBadge,
    FilterBar,
    DetailDrawer,
    type Column
} from '../../components/superadmin/shared';

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
    const [fullAuditLogs, setFullAuditLogs] = useState<SuperAdminAuditLogEntry[]>([]);
    const [loadingAudit, setLoadingAudit] = useState(false);

    const openAuditModal = async () => {
        setShowAuditModal(true);
        setLoadingAudit(true);
        try {
            const logs = await superAdminApi.getAuditLogs(50);
            setFullAuditLogs(logs);
        } catch (e) {
            console.error('Failed to load audit logs', e);
        } finally {
            setLoadingAudit(false);
        }
    };

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
            color: 'purple',
            breakdown: [
                { label: 'Current MRR', value: `₹${Number(dashboardData.kpis.mrr.value).toLocaleString('en-IN')}`, pct: 100 },
            ],
        },
        {
            label: 'System Health',
            value: `${Number(dashboardData.kpis.systemHealth.value).toFixed(2)}%`,
            change: dashboardData.kpis.systemHealth.change,
            icon: Activity,
            color: 'teal',
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
                <ActionPanel
                    actions={[
                        { label: 'Refresh', icon: RefreshCw, onClick: loadDashboard, variant: 'secondary' },
                        { label: 'Status', icon: Server, onClick: () => setShowServicesModal(true), variant: 'secondary' },
                        { label: 'Audit', icon: Eye, onClick: openAuditModal, variant: 'secondary' },
                        { label: 'Export', icon: Download, onClick: () => console.log('Export'), variant: 'primary' },
                    ]}
                    size="sm"
                />
            </header>

            {error && (
                <div className="sa__card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.4)' }}>
                    <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>
                </div>
            )}

            {/* KPI Cards - New Component System */}
            <MetricGrid columns={4} gap="md" style={{ marginBottom: 16 }}>
                {kpiData.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                    >
                        <StatCard
                            label={kpi.label}
                            value={kpi.value}
                            change={kpi.change}
                            icon={kpi.icon}
                            color={kpi.color as 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'emerald'}
                            variant="compact"
                            breakdown={kpi.breakdown}
                            onClick={() => setSelectedKPI(kpi)}
                            loading={loading}
                        />
                    </motion.div>
                ))}
            </MetricGrid>

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
                {/* Response Time Trend - New ChartCard */}
                <section className="sa__card--span-7">
                    <ChartCard
                        title="Response Time (24h)"
                        subtitle="Average & P95 latency"
                        icon={Clock}
                        variant="compact"
                        height={180}
                    >
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
                    </ChartCard>
                </section>

                {/* Top Gyms - New DataTable */}
                <section className="sa__card--span-5">
                    <ChartCard
                        title="Top Gyms by Revenue"
                        subtitle="This month"
                        icon={Building2}
                        variant="compact"
                        height="auto"
                    >
                        <DataTable
                            data={topGyms}
                            columns={[
                                {
                                    key: 'name',
                                    label: 'Gym',
                                    render: (_, row) => (
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 12 }}>{row.name}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{row.city}</div>
                                        </div>
                                    )
                                },
                                { key: 'members', label: 'Members', align: 'center', sortable: true },
                                {
                                    key: 'revenue',
                                    label: 'Revenue',
                                    align: 'right',
                                    sortable: true,
                                    render: (value) => `₹${(Number(value) / 1000).toFixed(1)}k`
                                },
                            ]}
                            variant="compact"
                            pageSize={5}
                            striped
                            hoverable
                        />
                    </ChartCard>
                </section>
            </div>

            {/* Alerts - Compact with StatusBadge */}
            <div className="sa__card" style={{ marginTop: 16, padding: '16px 18px' }}>
                <div className="sa__card-head" style={{ padding: 0, marginBottom: 12 }}>
                    <div className="sa__card-icon sa__card-icon--rose"><Bell size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Recent Alerts</h3>
                        <p className="sa__card-sub">Click for details</p>
                    </div>
                    {alerts.length > 0 && (
                        <span className="sa__badge sa__badge--red" style={{ marginLeft: 'auto', fontSize: 10 }}>{alerts.filter(a => a.status !== 'resolved').length} Active</span>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {alerts.map(alert => (
                        <div key={alert.id} onClick={() => setSelectedAlert(alert)} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                            cursor: 'pointer', transition: 'all 0.15s',
                            background: 'var(--bg-glass)',
                            border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.2)' : 'var(--border-main)'}`,
                        }}>
                            <StatusBadge
                                status={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'success'}
                                label=""
                                size="sm"
                                variant="solid"
                                showIcon
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{alert.title}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{alert.source} · {alert.time}</div>
                            </div>
                            <StatusBadge status={alert.status === 'resolved' ? 'success' : 'pending'} label={alert.status} size="sm" variant="subtle" />
                            <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
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

                {/* ── Service Status Modal ── Enhanced with Component Library */}
                {showServicesModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowServicesModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Service Status</div><div className="sa__modal-subtitle">All platform services</div></div>
                                <button className="sa__modal-close" onClick={() => setShowServicesModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <DataTable
                                    data={services}
                                    columns={[
                                        {
                                            key: 'name',
                                            label: 'Service',
                                            sortable: true,
                                            render: (value, row) => (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Server size={14} style={{ color: 'var(--text-tertiary)' }} />
                                                    <span style={{ fontWeight: 600 }}>{value}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'status',
                                            label: 'Status',
                                            sortable: true,
                                            render: (value) => (
                                                <StatusBadge
                                                    status={value === 'operational' ? 'success' : value === 'degraded' ? 'warning' : 'error'}
                                                    label={value}
                                                    variant="filled"
                                                    size="sm"
                                                />
                                            )
                                        },
                                        {
                                            key: 'uptime',
                                            label: 'Uptime',
                                            sortable: true,
                                            render: (value) => (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ 
                                                        flex: '0 0 60px', 
                                                        height: 4, 
                                                        borderRadius: 2, 
                                                        background: 'rgba(255,255,255,0.06)', 
                                                        overflow: 'hidden' 
                                                    }}>
                                                        <div style={{ 
                                                            width: `${value}%`, 
                                                            height: '100%', 
                                                            background: value >= 99 ? '#22c55e' : value >= 95 ? '#f59e0b' : '#ef4444',
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                                        {value.toFixed(2)}%
                                                    </span>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'latency',
                                            label: 'Latency',
                                            sortable: true,
                                            render: (value) => (
                                                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                                                    {value}
                                                </span>
                                            )
                                        }
                                    ]}
                                    pageSize={10}
                                    stickyHeader
                                />
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowServicesModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Audit Log Modal ── Enhanced with Component Library */}
                {showAuditModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuditModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Audit Log</div><div className="sa__modal-subtitle">Recent administrative actions</div></div>
                                <button className="sa__modal-close" onClick={() => setShowAuditModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {loadingAudit ? (
                                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit records...</div>
                                ) : (
                                    <>
                                        <FilterBar
                                            searchPlaceholder="Search actions, users, or details..."
                                            onSearchChange={(value) => console.log('Search:', value)}
                                            filters={[
                                                {
                                                    type: 'select',
                                                    placeholder: 'Severity',
                                                    value: '',
                                                    onChange: (value) => console.log('Severity:', value),
                                                    options: [
                                                        { value: '', label: 'All Severities' },
                                                        { value: 'critical', label: 'Critical' },
                                                        { value: 'high', label: 'High' },
                                                        { value: 'medium', label: 'Medium' },
                                                        { value: 'low', label: 'Low' },
                                                    ]
                                                },
                                                {
                                                    type: 'select',
                                                    placeholder: 'User Role',
                                                    value: '',
                                                    onChange: (value) => console.log('Role:', value),
                                                    options: [
                                                        { value: '', label: 'All Roles' },
                                                        { value: 'SUPER_ADMIN', label: 'Super Admin' },
                                                        { value: 'GYM_OWNER', label: 'Gym Owner' },
                                                        { value: 'TRAINER', label: 'Trainer' },
                                                    ]
                                                }
                                            ]}
                                            onClearAll={() => console.log('Clear all filters')}
                                            style={{ marginBottom: 16 }}
                                        />
                                        <DataTable
                                            data={fullAuditLogs}
                                            columns={[
                                                {
                                                    key: 'severity',
                                                    label: '',
                                                    render: (value) => (
                                                        <StatusBadge
                                                            status={value === 'critical' || value === 'high' ? 'error' : value === 'medium' ? 'warning' : 'info'}
                                                            variant="filled"
                                                            size="sm"
                                                        />
                                                    )
                                                },
                                                {
                                                    key: 'action',
                                                    label: 'Action',
                                                    sortable: true,
                                                    render: (value, row) => (
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                {value}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                                {row.details}
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    key: 'userName',
                                                    label: 'User',
                                                    sortable: true,
                                                    render: (value, row) => (
                                                        <div>
                                                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                                {value}
                                                            </div>
                                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                                                {row.userRole}
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    key: 'timestamp',
                                                    label: 'Time',
                                                    sortable: true,
                                                    render: (value) => (
                                                        <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                                            {new Date(value).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    )
                                                }
                                            ]}
                                            pageSize={10}
                                            stickyHeader
                                        />
                                    </>
                                )}
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
