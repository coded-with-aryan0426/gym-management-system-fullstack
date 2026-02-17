import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bug, AlertCircle, AlertTriangle, Info, X, Download,
    ChevronDown, ChevronUp, CheckCircle2, Clock, Search,
    Building2, XCircle, Filter, TrendingUp, TrendingDown,
    Code, User, ExternalLink, Trash2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const MOCK_ERRORS = [
    {
        id: 1,
        title: 'NullPointerException in PaymentService.processPayment()',
        severity: 'critical', count: 47, firstSeen: '2 hours ago', lastSeen: '5 min ago',
        affectedGyms: ['FitZone Elite', 'IronForge', 'Muscle Factory'],
        status: 'open', assignee: '',
        endpoint: 'POST /api/payments/process',
        httpStatus: 500,
        userAgent: 'Chrome 121 / macOS',
        stack: `java.lang.NullPointerException: Cannot invoke "com.gym.management.model.Payment.getAmount()" because "payment" is null
    at com.gym.management.service.PaymentService.processPayment(PaymentService.java:142)
    at com.gym.management.controller.PaymentController.createPayment(PaymentController.java:67)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:897)`,
        trend: [
            { h: '6AM', v: 0 }, { h: '8AM', v: 2 }, { h: '10AM', v: 5 }, { h: '12PM', v: 8 },
            { h: '2PM', v: 12 }, { h: '4PM', v: 15 }, { h: '6PM', v: 3 }, { h: 'Now', v: 2 },
        ],
    },
    {
        id: 2,
        title: 'HikariCP Connection Pool Exhausted',
        severity: 'critical', count: 12, firstSeen: '4 hours ago', lastSeen: '30 min ago',
        affectedGyms: ['All gyms (platform-wide)'],
        status: 'investigating', assignee: 'DevOps Team',
        endpoint: 'Multiple endpoints',
        httpStatus: 503,
        userAgent: 'Multiple',
        stack: `com.zaxxer.hikari.pool.HikariPool$PoolEntryCreator: Connection is not available, request timed out after 30002ms.
    at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:696)
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:181)
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:112)`,
        trend: [
            { h: '6AM', v: 0 }, { h: '8AM', v: 0 }, { h: '10AM', v: 1 }, { h: '12PM', v: 3 },
            { h: '2PM', v: 5 }, { h: '4PM', v: 2 }, { h: '6PM', v: 1 }, { h: 'Now', v: 0 },
        ],
    },
    {
        id: 3,
        title: 'JWT Token expired: TokenExpiredException',
        severity: 'warning', count: 234, firstSeen: '12 hours ago', lastSeen: '1 min ago',
        affectedGyms: ['Multiple (15+ gyms)'],
        status: 'open', assignee: '',
        endpoint: 'GET /api/auth/validate',
        httpStatus: 401,
        userAgent: 'Safari 17 / iOS 17.3',
        stack: `io.jsonwebtoken.ExpiredJwtException: JWT expired at 2025-02-15T08:30:00Z. Current time: 2025-02-15T14:22:15Z
    at io.jsonwebtoken.impl.DefaultJwtParser.parse(DefaultJwtParser.java:385)
    at com.gym.management.security.JwtTokenProvider.validateToken(JwtTokenProvider.java:89)`,
        trend: [
            { h: '6AM', v: 10 }, { h: '8AM', v: 28 }, { h: '10AM', v: 35 }, { h: '12PM', v: 42 },
            { h: '2PM', v: 38 }, { h: '4PM', v: 30 }, { h: '6PM', v: 25 }, { h: 'Now', v: 26 },
        ],
    },
    {
        id: 4,
        title: 'MaxUploadSizeExceededException: Profile photo > 5MB',
        severity: 'info', count: 89, firstSeen: '6 hours ago', lastSeen: '2 hr ago',
        affectedGyms: ['FitZone Elite'],
        status: 'resolved', assignee: 'Backend Team',
        endpoint: 'POST /api/profile/upload',
        httpStatus: 413,
        userAgent: 'Chrome 120 / Android 14',
        stack: `org.springframework.web.multipart.MaxUploadSizeExceededException: Maximum upload size exceeded
    at com.gym.management.controller.ProfileController.uploadPhoto(ProfileController.java:94)
    at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:897)`,
        trend: [
            { h: '6AM', v: 5 }, { h: '8AM', v: 12 }, { h: '10AM', v: 18 }, { h: '12PM', v: 22 },
            { h: '2PM', v: 15 }, { h: '4PM', v: 10 }, { h: '6PM', v: 5 }, { h: 'Now', v: 2 },
        ],
    },
    {
        id: 5,
        title: 'ClassNotFoundException: Redis connection refused',
        severity: 'warning', count: 18, firstSeen: '1 hour ago', lastSeen: '15 min ago',
        affectedGyms: ['CrossTrain Hub', 'PowerHouse Gym'],
        status: 'open', assignee: '',
        endpoint: 'GET /api/cache/sessions',
        httpStatus: 500,
        userAgent: 'Server-Internal',
        stack: `redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool
    at redis.clients.jedis.JedisPool.getResource(JedisPool.java:254)
    at com.gym.management.cache.RedisCacheService.get(RedisCacheService.java:42)`,
        trend: [
            { h: '6AM', v: 0 }, { h: '8AM', v: 0 }, { h: '10AM', v: 0 }, { h: '12PM', v: 0 },
            { h: '2PM', v: 3 }, { h: '4PM', v: 8 }, { h: '6PM', v: 5 }, { h: 'Now', v: 2 },
        ],
    },
    {
        id: 6,
        title: 'CORS origin mismatch: https://fitzone.com blocked',
        severity: 'info', count: 156, firstSeen: '2 days ago', lastSeen: '45 min ago',
        affectedGyms: ['FitZone Elite'],
        status: 'ignored', assignee: '',
        endpoint: 'OPTIONS /api/*',
        httpStatus: 403,
        userAgent: 'Chrome 121 / Windows 11',
        stack: `Access to XMLHttpRequest at 'https://api.titan.dev/api/members' from origin 'https://fitzone.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
        trend: [
            { h: '6AM', v: 8 }, { h: '8AM', v: 15 }, { h: '10AM', v: 22 }, { h: '12PM', v: 20 },
            { h: '2PM', v: 25 }, { h: '4PM', v: 18 }, { h: '6PM', v: 28 }, { h: 'Now', v: 20 },
        ],
    },
];

const ERROR_TREND = [
    { d: 'Feb 9', critical: 2, warning: 8, info: 15 },
    { d: 'Feb 10', critical: 5, warning: 12, info: 18 },
    { d: 'Feb 11', critical: 3, warning: 10, info: 22 },
    { d: 'Feb 12', critical: 1, warning: 15, info: 25 },
    { d: 'Feb 13', critical: 4, warning: 9, info: 20 },
    { d: 'Feb 14', critical: 8, warning: 18, info: 28 },
    { d: 'Feb 15', critical: 6, warning: 14, info: 24 },
];

type ErrorItem = typeof MOCK_ERRORS[0];

const SAErrors: React.FC = () => {
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedError, setSelectedError] = useState<ErrorItem | null>(null);
    const [showResolveConfirm, setShowResolveConfirm] = useState<ErrorItem | null>(null);

    const filtered = MOCK_ERRORS.filter(e => {
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = severityFilter === 'all' || e.severity === severityFilter;
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchSeverity && matchStatus;
    });

    const totals = useMemo(() => ({
        total: MOCK_ERRORS.reduce((s, e) => s + e.count, 0),
        critical: MOCK_ERRORS.filter(e => e.severity === 'critical').length,
        open: MOCK_ERRORS.filter(e => e.status === 'open').length,
        resolved: MOCK_ERRORS.filter(e => e.status === 'resolved').length,
    }), []);

    const severityIcon = (s: string) => {
        const props = { size: 14 };
        return s === 'critical' ? <XCircle {...props} style={{ color: '#ef4444' }} /> :
            s === 'warning' ? <AlertTriangle {...props} style={{ color: '#f59e0b' }} /> :
                <Info {...props} style={{ color: '#3b82f6' }} />;
    };

    const severityColor = (s: string) => s === 'critical' ? 'red' : s === 'warning' ? 'amber' : 'blue';
    const statusColor = (s: string) => s === 'open' ? 'red' : s === 'investigating' ? 'amber' : s === 'resolved' ? 'green' : 'gray';

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Error Tracker</h1>
                    <p>{totals.total} total occurrences · {totals.critical} critical · {totals.open} open</p>
                </div>
            </header>

            {/* KPIs */}
            <div className="sa__kpi-row">
                {[
                    { label: 'Total Errors', value: String(totals.total), color: 'rose', icon: Bug },
                    { label: 'Critical', value: String(totals.critical), color: 'red', icon: AlertCircle },
                    { label: 'Open Issues', value: String(totals.open), color: 'amber', icon: Clock },
                    { label: 'Resolved', value: String(totals.resolved), color: 'emerald', icon: CheckCircle2 },
                ].map((kpi, i) => (
                    <motion.div key={kpi.label} className={`sa__kpi sa__kpi--${kpi.color}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className="sa__kpi-icon"><kpi.icon size={18} /></div>
                        <div className="sa__kpi-body">
                            <div className="sa__kpi-label">{kpi.label}</div>
                            <div className="sa__kpi-value">{kpi.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Error Trend Chart */}
            <div className="sa__card" style={{ marginBottom: 16 }}>
                <div className="sa__card-head">
                    <div className="sa__card-icon sa__card-icon--rose"><TrendingUp size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Error Trend (7 Days)</h3>
                        <p className="sa__card-sub">Errors by severity over time</p>
                    </div>
                </div>
                <div style={{ height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ERROR_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="errCrit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                                <linearGradient id="errWarn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                            </defs>
                            <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                            <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#errCrit)" dot={false} />
                            <Area type="monotone" dataKey="warning" stroke="#f59e0b" strokeWidth={1.5} fill="url(#errWarn)" dot={false} />
                            <Area type="monotone" dataKey="info" stroke="#3b82f6" strokeWidth={1} fill="none" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                    {[{ label: 'Critical', color: '#ef4444' }, { label: 'Warning', color: '#f59e0b' }, { label: 'Info', color: '#3b82f6' }].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
                            <div style={{ width: 8, height: 3, borderRadius: 2, background: l.color }} />{l.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="sa__toolbar">
                <div className="sa__search">
                    <Search size={14} />
                    <input placeholder="Search errors..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'critical', 'warning', 'info'].map(f => (
                    <button key={f} className={`sa__filter ${severityFilter === f ? 'sa__filter--active' : ''}`} onClick={() => setSeverityFilter(f)}>
                        {f === 'all' ? 'All Severity' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
                <div style={{ borderLeft: '1px solid var(--border-default)', height: 20 }} />
                {['all', 'open', 'investigating', 'resolved', 'ignored'].map(f => (
                    <button key={f} className={`sa__filter ${statusFilter === f ? 'sa__filter--active' : ''}`} onClick={() => setStatusFilter(f)}>
                        {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Error Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((err, i) => (
                    <motion.div
                        key={err.id}
                        className="sa__error-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedError(err)}
                    >
                        <div className="sa__error-head">
                            {severityIcon(err.severity)}
                            <div className="sa__error-title" style={{ color: err.severity === 'critical' ? '#ef4444' : err.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                                {err.title}
                            </div>
                            <span className={`sa__badge sa__badge--${statusColor(err.status)}`}>{err.status}</span>
                        </div>
                        <div className="sa__error-meta">
                            <span><Bug size={10} /> {err.count} occurrences</span>
                            <span><Clock size={10} /> First: {err.firstSeen}</span>
                            <span><Clock size={10} /> Last: {err.lastSeen}</span>
                            <span><Building2 size={10} /> {err.affectedGyms.join(', ')}</span>
                            {err.assignee && <span><User size={10} /> {err.assignee}</span>}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="sa__pagination" style={{ marginTop: 12 }}>
                <span className="sa__pagination-info">Showing {filtered.length} of {MOCK_ERRORS.length} errors</span>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Error Detail Modal ── */}
                {selectedError && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedError(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: selectedError.severity === 'critical' ? 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)' : selectedError.severity === 'warning' ? 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' : 'linear-gradient(135deg, rgba(59,130,246,0.08), transparent)' }} />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {severityIcon(selectedError.severity)}
                                        <div className="sa__modal-title" style={{ fontSize: 14 }}>{selectedError.title}</div>
                                    </div>
                                    <div className="sa__modal-subtitle">
                                        <span className={`sa__badge sa__badge--${severityColor(selectedError.severity)}`}>{selectedError.severity}</span>{' '}
                                        <span className={`sa__badge sa__badge--${statusColor(selectedError.status)}`} style={{ marginLeft: 4 }}>{selectedError.status}</span>{' '}
                                        · {selectedError.count} occurrences
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedError(null)}><X size={16} /></button>
                            </div>

                            <div className="sa__modal-body">
                                {/* Error frequency chart */}
                                <div className="sa__modal-section-title">Error Frequency (Today)</div>
                                <div style={{ height: 100, marginBottom: 20 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={selectedError.trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="errTrend" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b'} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                            <Area type="monotone" dataKey="v" stroke={selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b'} strokeWidth={2} fill="url(#errTrend)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Metadata Grid */}
                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />First Seen</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13 }}>{selectedError.firstSeen}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Last Seen</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13 }}>{selectedError.lastSeen}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Code size={10} />HTTP Status</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13, color: selectedError.httpStatus >= 500 ? '#ef4444' : '#f59e0b' }}>{selectedError.httpStatus}</div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <div className="sa__modal-section-title">Request Info</div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Endpoint</span><span className="sa__stat-value" style={{ fontFamily: 'monospace', fontSize: 10 }}>{selectedError.endpoint}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">User Agent</span><span className="sa__stat-value" style={{ fontSize: 10 }}>{selectedError.userAgent}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Assignee</span><span className="sa__stat-value">{selectedError.assignee || 'Unassigned'}</span></div>
                                    </div>
                                    <div>
                                        <div className="sa__modal-section-title">Affected Gyms ({selectedError.affectedGyms.length})</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {selectedError.affectedGyms.map(g => (
                                                <span key={g} className="sa__badge sa__badge--blue" style={{ fontSize: 10 }}>{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Stack Trace */}
                                <div className="sa__modal-section-title">Stack Trace</div>
                                <div className="sa__error-stack">{selectedError.stack}</div>
                            </div>

                            <div className="sa__modal-footer">
                                {selectedError.status !== 'resolved' ? (
                                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => { setShowResolveConfirm(selectedError); setSelectedError(null); }}>
                                        <CheckCircle2 size={14} /> Mark Resolved
                                    </button>
                                ) : (
                                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedError(null)}>
                                        <ExternalLink size={14} /> Reopen
                                    </button>
                                )}
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedError(null)}><User size={14} /> Assign</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedError(null)}><ExternalLink size={14} /> Create Ticket</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setSelectedError(null)}><Trash2 size={14} /> Ignore</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Resolve Confirmation Modal ── */}
                {showResolveConfirm && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResolveConfirm(null)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">Resolve Error</div></div>
                                <button className="sa__modal-close" onClick={() => setShowResolveConfirm(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: 'rgba(34,197,94,0.06)', borderRadius: 14, marginBottom: 16, border: '1px solid rgba(34,197,94,0.15)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Mark as resolved?</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        This will mark <strong>{showResolveConfirm.title}</strong> as resolved and remove it from the active errors list.
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Occurrences</span><span className="sa__stat-value">{showResolveConfirm.count}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Affected Gyms</span><span className="sa__stat-value">{showResolveConfirm.affectedGyms.length}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Last Seen</span><span className="sa__stat-value">{showResolveConfirm.lastSeen}</span></div>

                                <div style={{ marginTop: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolution Note (optional)</label>
                                    <textarea
                                        placeholder="What was the fix?"
                                        rows={3}
                                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowResolveConfirm(null)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowResolveConfirm(null)}><CheckCircle2 size={14} /> Confirm Resolve</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default SAErrors;
