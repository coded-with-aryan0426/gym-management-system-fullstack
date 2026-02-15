import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Users, X, Download,
    Calendar, Globe, Smartphone, Monitor, Laptop, Tablet as TabletIcon,
    ArrowRight, Filter, Clock, Activity, Eye, ChevronDown
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

/* ─── Mock Data ─── */
const GROWTH = [
    { m: 'Sep', users: 1420, gyms: 210 }, { m: 'Oct', users: 1560, gyms: 218 },
    { m: 'Nov', users: 1710, gyms: 228 }, { m: 'Dec', users: 1835, gyms: 234 },
    { m: 'Jan', users: 1920, gyms: 241 }, { m: 'Feb', users: 1958, gyms: 247 },
];

const DEVICES = [
    { name: 'Mobile', value: 48, users: 940, color: '#3b82f6', icon: Smartphone },
    { name: 'Desktop', value: 35, users: 685, color: '#8b5cf6', icon: Monitor },
    { name: 'Tablet', value: 12, users: 235, color: '#22c55e', icon: TabletIcon },
    { name: 'Laptop', value: 5, users: 98, color: '#f59e0b', icon: Laptop },
];

const BROWSERS = [
    { name: 'Chrome', value: 58, users: 1135, color: '#3b82f6' },
    { name: 'Safari', value: 24, users: 470, color: '#a1a1aa' },
    { name: 'Firefox', value: 10, users: 196, color: '#f59e0b' },
    { name: 'Edge', value: 5, users: 98, color: '#22c55e' },
    { name: 'Other', value: 3, users: 59, color: '#8b5cf6' },
];

const HOURLY = [
    { h: '6AM', v: 45 }, { h: '7AM', v: 89 }, { h: '8AM', v: 156 }, { h: '9AM', v: 210 },
    { h: '10AM', v: 178 }, { h: '11AM', v: 168 }, { h: '12PM', v: 195 }, { h: '1PM', v: 165 },
    { h: '2PM', v: 142 }, { h: '3PM', v: 120 }, { h: '4PM', v: 135 }, { h: '5PM', v: 185 },
    { h: '6PM', v: 230 }, { h: '7PM', v: 265 }, { h: '8PM', v: 245 }, { h: '9PM', v: 198 },
    { h: '10PM', v: 120 }, { h: '11PM', v: 68 },
];

const ENGAGEMENT = [
    { m: 'Sep', dau: 420, wau: 890, mau: 1420 }, { m: 'Oct', dau: 465, wau: 950, mau: 1560 },
    { m: 'Nov', dau: 510, wau: 1020, mau: 1710 }, { m: 'Dec', dau: 540, wau: 1080, mau: 1835 },
    { m: 'Jan', dau: 575, wau: 1140, mau: 1920 }, { m: 'Feb', dau: 598, wau: 1185, mau: 1958 },
];

const COHORTS = [
    { month: 'Oct 2024', w0: 100, w1: 82, w2: 71, w3: 64, w4: 58 },
    { month: 'Nov 2024', w0: 100, w1: 85, w2: 74, w3: 67, w4: 62 },
    { month: 'Dec 2024', w0: 100, w1: 88, w2: 78, w3: 72, w4: null },
    { month: 'Jan 2025', w0: 100, w1: 90, w2: 81, w3: null, w4: null },
    { month: 'Feb 2025', w0: 100, w1: 92, w2: null, w3: null, w4: null },
];

const FUNNEL = [
    { stage: 'Visit Landing', count: 8500, pct: 100 },
    { stage: 'Sign Up', count: 2125, pct: 25 },
    { stage: 'Onboarding', count: 1488, pct: 17.5 },
    { stage: 'First Class', count: 1063, pct: 12.5 },
    { stage: '30-Day Retain', count: 744, pct: 8.75 },
];

const GEO_DIST = [
    { city: 'Mumbai', users: 420, gyms: 28, pct: 21.4 },
    { city: 'Bangalore', users: 365, gyms: 24, pct: 18.6 },
    { city: 'Delhi', users: 310, gyms: 22, pct: 15.8 },
    { city: 'Chennai', users: 215, gyms: 15, pct: 11.0 },
    { city: 'Hyderabad', users: 178, gyms: 12, pct: 9.1 },
    { city: 'Kolkata', users: 145, gyms: 9, pct: 7.4 },
    { city: 'Pune', users: 125, gyms: 7, pct: 6.4 },
    { city: 'Others', users: 200, gyms: 15, pct: 10.3 },
];

const FEATURES = [
    { name: 'Member Check-in', adoption: 94, trend: '+2%' },
    { name: 'Class Booking', adoption: 87, trend: '+5%' },
    { name: 'Payment Processing', adoption: 82, trend: '+1%' },
    { name: 'Workout Tracking', adoption: 71, trend: '+8%' },
    { name: 'Trainer Management', adoption: 65, trend: '+3%' },
    { name: 'Equipment Tracking', adoption: 42, trend: '+12%' },
    { name: 'Push Notifications', adoption: 38, trend: '+15%' },
    { name: 'Analytics Dashboard', adoption: 28, trend: '+7%' },
];

const PAGE_PERF = [
    { page: '/dashboard', visits: 12400, avgLoad: '1.2s', bounce: '15%' },
    { page: '/members', visits: 8920, avgLoad: '0.8s', bounce: '22%' },
    { page: '/classes', visits: 7650, avgLoad: '1.0s', bounce: '18%' },
    { page: '/payments', visits: 5430, avgLoad: '1.5s', bounce: '25%' },
    { page: '/trainers', visits: 3210, avgLoad: '0.6s', bounce: '20%' },
    { page: '/settings', visits: 1890, avgLoad: '0.4s', bounce: '35%' },
];

const SAAnalytics: React.FC = () => {
    const [dateRange, setDateRange] = useState('30d');
    const [showDeviceDrill, setShowDeviceDrill] = useState<typeof DEVICES[0] | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showGeoModal, setShowGeoModal] = useState(false);
    const [showFunnelModal, setShowFunnelModal] = useState(false);
    const [showCohortModal, setShowCohortModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');

    const kpis = useMemo(() => [
        { label: 'DAU', value: '598', change: +4.0, color: 'blue', icon: Users },
        { label: 'WAU', value: '1,185', change: +3.9, color: 'violet', icon: Activity },
        { label: 'MAU', value: '1,958', change: +2.0, color: 'emerald', icon: TrendingUp },
        { label: 'Avg Session', value: '12m 34s', change: +1.2, color: 'cyan', icon: Clock },
        { label: 'Bounce Rate', value: '22.1%', change: -1.5, color: 'rose', icon: Eye },
    ], []);

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Platform Analytics</h1>
                    <p>User engagement, device insights, and growth metrics</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 2, background: 'var(--bg-secondary)', borderRadius: 8, padding: 2, border: '1px solid var(--border-default)' }}>
                        {[{ label: '7d', value: '7d' }, { label: '30d', value: '30d' }, { label: '90d', value: '90d' }].map(r => (
                            <button key={r.value} onClick={() => setDateRange(r.value)} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: dateRange === r.value ? 600 : 400, color: dateRange === r.value ? '#60a5fa' : 'var(--text-muted)', background: dateRange === r.value ? 'rgba(59,130,246,0.12)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowExportModal(true)}><Download size={14} /> Export</button>
                </div>
            </header>

            {/* KPIs */}
            <div className="sa__kpi-row">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} className={`sa__kpi sa__kpi--${kpi.color}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
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

            <div className="sa__grid">
                {/* Platform Growth */}
                <section className="sa__card sa__card--span-7">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--blue"><TrendingUp size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Platform Growth</h3>
                            <p className="sa__card-sub">Users & gyms over 6 months</p>
                        </div>
                    </div>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={GROWTH} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="usersG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                                </defs>
                                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#usersG)" dot={false} name="Users" />
                                <Area type="monotone" dataKey="gyms" stroke="#8b5cf6" strokeWidth={1.5} fill="none" dot={false} name="Gyms" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Engagement DAU/WAU/MAU */}
                <section className="sa__card sa__card--span-5">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--emerald"><Activity size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">User Engagement</h3>
                            <p className="sa__card-sub">DAU / WAU / MAU trends</p>
                        </div>
                    </div>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ENGAGEMENT} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                <Line type="monotone" dataKey="dau" stroke="#22c55e" strokeWidth={2} dot={false} name="DAU" />
                                <Line type="monotone" dataKey="wau" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="WAU" />
                                <Line type="monotone" dataKey="mau" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="MAU" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            {/* Row 2: Device + Hourly */}
            <div className="sa__grid" style={{ marginTop: 16 }}>
                {/* Device Breakdown */}
                <section className="sa__card sa__card--span-5">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--violet"><Smartphone size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Device Breakdown</h3>
                            <p className="sa__card-sub">Click for details</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 180 }}>
                        <ResponsiveContainer width="45%" height="100%">
                            <PieChart>
                                <Pie data={DEVICES} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                                    {DEVICES.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {DEVICES.map(d => (
                                <div key={d.name} onClick={() => setShowDeviceDrill(d)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                    <d.icon size={12} style={{ color: d.color }} />
                                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Hourly Usage */}
                <section className="sa__card sa__card--span-7">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--cyan"><Clock size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">User Activity by Hour</h3>
                            <p className="sa__card-sub">Peak usage times today</p>
                        </div>
                    </div>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={HOURLY} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                <Bar dataKey="v" radius={[3, 3, 0, 0]} barSize={18} name="Active Users">
                                    {HOURLY.map((_, i) => <Cell key={i} fill="#3b82f6" fillOpacity={0.3 + (HOURLY[i].v / 265) * 0.7} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            {/* Row 3: Quick actions → deeper analysis */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {[
                    { label: 'Funnel Analysis', icon: Filter, onClick: () => setShowFunnelModal(true) },
                    { label: 'Cohort Retention', icon: Users, onClick: () => setShowCohortModal(true) },
                    { label: 'Geographic Distribution', icon: Globe, onClick: () => setShowGeoModal(true) },
                ].map(item => (
                    <button key={item.label} className="sa__btn sa__btn--ghost sa__btn--sm" style={{ flex: 1, padding: '14px 16px', justifyContent: 'center', fontSize: 12, gap: 8 }} onClick={item.onClick}>
                        <item.icon size={16} /> {item.label}
                    </button>
                ))}
            </div>

            {/* Feature Adoption + Page Performance */}
            <div className="sa__grid" style={{ marginTop: 16 }}>
                <section className="sa__card sa__card--span-6" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--emerald"><BarChart3 size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Feature Adoption</h3>
                            <p className="sa__card-sub">% of gyms using each feature</p>
                        </div>
                    </div>
                    <div style={{ padding: '0 16px 16px' }}>
                        {FEATURES.map(f => (
                            <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 140 }}>{f.name}</span>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                    <div style={{ width: `${f.adoption}%`, height: '100%', borderRadius: 3, background: f.adoption > 80 ? '#22c55e' : f.adoption > 50 ? '#3b82f6' : '#f59e0b', transition: 'width 0.5s' }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{f.adoption}%</span>
                                <span style={{ fontSize: 9, color: '#22c55e', width: 25 }}>{f.trend}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="sa__card sa__card--span-6" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--blue"><Eye size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Page Performance</h3>
                            <p className="sa__card-sub">Most visited pages & load times</p>
                        </div>
                    </div>
                    <table className="sa__table">
                        <thead><tr><th>Page</th><th>Visits</th><th>Avg Load</th><th>Bounce</th></tr></thead>
                        <tbody>
                            {PAGE_PERF.map(p => (
                                <tr key={p.page}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>{p.page}</td>
                                    <td style={{ fontSize: 11 }}>{p.visits.toLocaleString()}</td>
                                    <td style={{ fontSize: 11, color: parseFloat(p.avgLoad) > 1 ? '#f59e0b' : '#22c55e' }}>{p.avgLoad}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.bounce}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Device Drill-Down ── */}
                {showDeviceDrill && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeviceDrill(null)}>
                        <motion.div className="sa__modal" style={{ width: 520 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${showDeviceDrill.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <showDeviceDrill.icon size={18} style={{ color: showDeviceDrill.color }} />
                                    </div>
                                    <div>
                                        <div className="sa__modal-title">{showDeviceDrill.name} Users</div>
                                        <div className="sa__modal-subtitle">{showDeviceDrill.users.toLocaleString()} users · {showDeviceDrill.value}% of traffic</div>
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setShowDeviceDrill(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Users size={10} />Users</div>
                                        <div className="sa__modal-stat-value">{showDeviceDrill.users.toLocaleString()}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Eye size={10} />Traffic %</div>
                                        <div className="sa__modal-stat-value">{showDeviceDrill.value}%</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Avg Session</div>
                                        <div className="sa__modal-stat-value">{showDeviceDrill.name === 'Mobile' ? '8m 15s' : showDeviceDrill.name === 'Desktop' ? '18m 42s' : '12m 30s'}</div>
                                    </div>
                                </div>

                                <div className="sa__modal-section-title">Browser Breakdown on {showDeviceDrill.name}</div>
                                {BROWSERS.slice(0, 3).map(b => (
                                    <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80 }}>{b.name}</span>
                                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{ width: `${b.value}%`, height: '100%', borderRadius: 3, background: b.color }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{b.value}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowDeviceDrill(null)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Funnel Modal ── */}
                {showFunnelModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFunnelModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Conversion Funnel</div><div className="sa__modal-subtitle">Signup → Onboarding → Retention</div></div>
                                <button className="sa__modal-close" onClick={() => setShowFunnelModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {FUNNEL.map((stage, i) => {
                                    const width = Math.max(20, stage.pct);
                                    const dropoff = i > 0 ? FUNNEL[i - 1].count - stage.count : 0;
                                    return (
                                        <div key={stage.stage} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{stage.stage}</span>
                                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{stage.count.toLocaleString()}</span>
                                                    {dropoff > 0 && <span style={{ fontSize: 10, color: '#ef4444' }}>−{dropoff.toLocaleString()} dropped</span>}
                                                </div>
                                            </div>
                                            <div style={{ height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                                                <div style={{ width: `${width}%`, height: '100%', borderRadius: 6, background: `rgba(59, 130, 246, ${0.3 + (stage.pct / 100) * 0.7})`, transition: 'width 0.5s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{stage.pct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowFunnelModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Cohort Retention Modal ── */}
                {showCohortModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCohortModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Cohort Retention</div><div className="sa__modal-subtitle">User retention by signup month (% retained)</div></div>
                                <button className="sa__modal-close" onClick={() => setShowCohortModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <table className="sa__table">
                                    <thead><tr><th>Cohort</th><th>Week 0</th><th>Week 1</th><th>Week 2</th><th>Week 3</th><th>Week 4</th></tr></thead>
                                    <tbody>
                                        {COHORTS.map(c => (
                                            <tr key={c.month}>
                                                <td style={{ fontWeight: 600, fontSize: 12 }}>{c.month}</td>
                                                {[c.w0, c.w1, c.w2, c.w3, c.w4].map((val, i) => (
                                                    <td key={i} style={{
                                                        textAlign: 'center', fontSize: 12, fontWeight: 600,
                                                        color: val === null ? 'var(--text-muted)' : val >= 80 ? '#22c55e' : val >= 60 ? '#f59e0b' : '#ef4444',
                                                        background: val === null ? 'transparent' : `rgba(${val >= 80 ? '34,197,94' : val >= 60 ? '245,158,11' : '239,68,68'}, ${(val || 0) / 400})`,
                                                    }}>
                                                        {val !== null ? `${val}%` : '—'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCohortModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Geographic Distribution Modal ── */}
                {showGeoModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGeoModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Geographic Distribution</div><div className="sa__modal-subtitle">Users & gyms by city</div></div>
                                <button className="sa__modal-close" onClick={() => setShowGeoModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {GEO_DIST.map(g => (
                                    <div key={g.city} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Globe size={14} style={{ color: '#3b82f6' }} />
                                        </div>
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{g.city}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80 }}>{g.users.toLocaleString()} users</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60 }}>{g.gyms} gyms</span>
                                        <div style={{ width: 80, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{ width: `${g.pct}%`, height: '100%', borderRadius: 3, background: '#3b82f6' }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{g.pct}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowGeoModal(false)}>Close</button>
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
                                <div><div className="sa__modal-title">Export Analytics</div></div>
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
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Include</label>
                                    {['Growth Metrics', 'Device Breakdown', 'Feature Adoption', 'Page Performance', 'Cohort Data', 'Funnel Data'].map(item => (
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

            </AnimatePresence>
        </div>
    );
};

export default SAAnalytics;
