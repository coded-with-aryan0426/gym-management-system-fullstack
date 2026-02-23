import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, HardDrive, Zap, Clock, X, AlertTriangle,
    CheckCircle2, Activity, Download, RefreshCw, Settings,
    Table2, Search, Server, ArrowRight, Eye, Trash2, XCircle
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const DB_STATS = {
    size: '2.4 GB', activeConnections: 18, maxConnections: 50,
    uptime: '43 days', avgQueryTime: '12ms', cacheHitRate: '94.2%',
};

const TABLES = [
    { name: 'members', rows: 48291, size: '812 MB', indexes: 6, lastVacuum: '2 hrs ago', growth: '+2.3%', avgQueryTime: '8ms' },
    { name: 'payments', rows: 124582, size: '456 MB', indexes: 4, lastVacuum: '4 hrs ago', growth: '+1.8%', avgQueryTime: '15ms' },
    { name: 'workout_logs', rows: 892341, size: '324 MB', indexes: 3, lastVacuum: '6 hrs ago', growth: '+5.1%', avgQueryTime: '22ms' },
    { name: 'sessions', rows: 15234, size: '128 MB', indexes: 2, lastVacuum: '1 hr ago', growth: '+0.4%', avgQueryTime: '3ms' },
    { name: 'trainers', rows: 3421, size: '96 MB', indexes: 5, lastVacuum: '3 hrs ago', growth: '+0.9%', avgQueryTime: '5ms' },
    { name: 'equipment', rows: 8764, size: '84 MB', indexes: 3, lastVacuum: '8 hrs ago', growth: '+0.2%', avgQueryTime: '4ms' },
    { name: 'notifications', rows: 234521, size: '76 MB', indexes: 2, lastVacuum: '12 hrs ago', growth: '+8.2%', avgQueryTime: '6ms' },
    { name: 'audit_logs', rows: 1892341, size: '512 MB', indexes: 4, lastVacuum: '2 hrs ago', growth: '+12.1%', avgQueryTime: '28ms' },
];

const CONNECTIONS = [
    { id: 1, user: 'app_user', query: 'SELECT m.* FROM members m JOIN gyms g ON...', duration: '45ms', state: 'active', db: 'titan_prod' },
    { id: 2, user: 'app_user', query: 'UPDATE payments SET status = $1 WHERE...', duration: '120ms', state: 'active', db: 'titan_prod' },
    { id: 3, user: 'read_replica', query: 'SELECT COUNT(*) FROM workout_logs WHERE...', duration: '230ms', state: 'active', db: 'titan_prod' },
    { id: 4, user: 'analytics', query: 'SELECT DATE_TRUNC(\'day\', created_at)...', duration: '1.2s', state: 'active', db: 'titan_analytics' },
    { id: 5, user: 'app_user', query: 'INSERT INTO audit_logs (action, user_id...', duration: '12ms', state: 'idle', db: 'titan_prod' },
];

const SLOW_QUERIES = [
    {
        id: 1,
        query: `SELECT m.*, g.name as gym_name, p.plan_type
FROM members m
JOIN gyms g ON m.gym_id = g.id
LEFT JOIN payments p ON p.member_id = m.id
WHERE m.status = 'active'
AND p.created_at > NOW() - INTERVAL '30 days'
ORDER BY p.amount DESC
LIMIT 100;`,
        avgTime: '2.4s', maxTime: '8.1s', calls: 1247, table: 'members, payments',
        explanation: 'Full table scan on payments — missing index on (member_id, created_at)',
        suggestion: 'CREATE INDEX idx_payments_member_created ON payments (member_id, created_at);',
    },
    {
        id: 2,
        query: `SELECT COUNT(*), DATE_TRUNC('hour', created_at) as hour
FROM workout_logs
WHERE gym_id = $1
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;`,
        avgTime: '1.8s', maxTime: '4.2s', calls: 892, table: 'workout_logs',
        explanation: 'Sequential scan on workout_logs — index on gym_id does not include created_at',
        suggestion: 'CREATE INDEX idx_workout_logs_gym_created ON workout_logs (gym_id, created_at);',
    },
    {
        id: 3,
        query: `SELECT al.*, u.email, u.name
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;`,
        avgTime: '1.1s', maxTime: '3.5s', calls: 456, table: 'audit_logs',
        explanation: 'Large result set — audit_logs table growing 12% weekly, needs partitioning',
        suggestion: 'Implement range partitioning on audit_logs by month (created_at)',
    },
];

const BACKUPS = [
    { name: 'titan_prod_20250215_0600.sql.gz', type: 'Full', size: '1.8 GB', date: 'Feb 15, 6:00 AM', status: 'success', duration: '4m 32s' },
    { name: 'titan_prod_20250214_0600.sql.gz', type: 'Full', size: '1.7 GB', date: 'Feb 14, 6:00 AM', status: 'success', duration: '4m 18s' },
    { name: 'titan_prod_20250213_0600.sql.gz', type: 'Full', size: '1.7 GB', date: 'Feb 13, 6:00 AM', status: 'success', duration: '4m 15s' },
    { name: 'titan_prod_20250212_1800.sql.gz', type: 'Incremental', size: '120 MB', date: 'Feb 12, 6:00 PM', status: 'success', duration: '38s' },
];

const MIGRATIONS = [
    { version: 'V043', name: 'add_equipment_maintenance_log', date: 'Feb 14, 2025', status: 'applied', duration: '1.2s' },
    { version: 'V042', name: 'create_notification_preferences', date: 'Feb 10, 2025', status: 'applied', duration: '0.8s' },
    { version: 'V041', name: 'add_2fa_columns_to_users', date: 'Feb 5, 2025', status: 'applied', duration: '0.5s' },
    { version: 'V040', name: 'payment_gateway_refactor', date: 'Jan 28, 2025', status: 'applied', duration: '2.4s' },
    { version: 'V039', name: 'gym_health_score_columns', date: 'Jan 20, 2025', status: 'applied', duration: '0.9s' },
];

const STORAGE_TREND = [
    { d: 'Jan 1', size: 1.8 }, { d: 'Jan 15', size: 1.9 }, { d: 'Feb 1', size: 2.1 },
    { d: 'Feb 8', size: 2.2 }, { d: 'Feb 15', size: 2.4 },
];

const QUERY_PERF = [
    { t: '12AM', p50: 5, p95: 18, p99: 45 }, { t: '4AM', p50: 4, p95: 12, p99: 28 },
    { t: '8AM', p50: 8, p95: 25, p99: 62 }, { t: '12PM', p50: 12, p95: 35, p99: 88 },
    { t: '4PM', p50: 15, p95: 42, p99: 95 }, { t: '8PM', p50: 10, p95: 30, p99: 72 },
    { t: 'Now', p50: 8, p95: 22, p99: 55 },
];

type SlowQuery = typeof SLOW_QUERIES[0];
type TableInfo = typeof TABLES[0];

const SADatabase: React.FC = () => {
    const [selectedQuery, setSelectedQuery] = useState<SlowQuery | null>(null);
    const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
    const [showConnectionsModal, setShowConnectionsModal] = useState(false);
    const [showBackupsModal, setShowBackupsModal] = useState(false);
    const [showMigrationsModal, setShowMigrationsModal] = useState(false);
    const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

    const poolUsed = Math.round((DB_STATS.activeConnections / DB_STATS.maxConnections) * 100);
    const poolColor = poolUsed > 80 ? '#ef4444' : poolUsed > 50 ? '#f59e0b' : '#22c55e';

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Database Health</h1>
                    <p>Database performance, storage, and maintenance</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowBackupsModal(true)}><Download size={14} /> Backups</button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowMigrationsModal(true)}><RefreshCw size={14} /> Migrations</button>
                    <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setShowMaintenanceConfirm(true)}><Settings size={14} /> Maintenance</button>
                </div>
            </header>

            {/* KPIs */}
            <div className="sa__kpi-row">
                {[
                    { label: 'Database Size', value: DB_STATS.size, color: 'blue', icon: HardDrive },
                    { label: 'Connections', value: `${DB_STATS.activeConnections}/${DB_STATS.maxConnections}`, color: 'emerald', icon: Zap },
                    { label: 'Avg Query Time', value: DB_STATS.avgQueryTime, color: 'violet', icon: Clock },
                    { label: 'Cache Hit Rate', value: DB_STATS.cacheHitRate, color: 'cyan', icon: Activity },
                    { label: 'Uptime', value: DB_STATS.uptime, color: 'emerald', icon: Server },
                ].map((kpi, i) => (
                    <motion.div key={kpi.label} className={`sa__kpi sa__kpi--${kpi.color}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ cursor: kpi.label === 'Connections' ? 'pointer' : 'default' }}
                        onClick={() => kpi.label === 'Connections' && setShowConnectionsModal(true)}
                    >
                        <div className="sa__kpi-icon"><kpi.icon size={18} /></div>
                        <div className="sa__kpi-body">
                            <div className="sa__kpi-label">{kpi.label}</div>
                            <div className="sa__kpi-value">{kpi.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="sa__grid">
                {/* Storage Trend */}
                <section className="sa__card sa__card--span-7">
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--blue"><HardDrive size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Storage Growth</h3>
                            <p className="sa__card-sub">Database size over time</p>
                        </div>
                    </div>
                    <div style={{ height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={STORAGE_TREND} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="storeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                                </defs>
                                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickFormatter={(v: number) => `${v} GB`} domain={[1.5, 3]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v: number | undefined) => [`${v ?? 0} GB`, 'Size']} />
                                <Area type="monotone" dataKey="size" stroke="#3b82f6" strokeWidth={2} fill="url(#storeG)" dot={{ r: 3, fill: '#3b82f6' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Connection Pool Gauge */}
                <section className="sa__card sa__card--span-5" style={{ cursor: 'pointer' }} onClick={() => setShowConnectionsModal(true)}>
                    <div className="sa__card-head">
                        <div className="sa__card-icon sa__card-icon--emerald"><Zap size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Connection Pool</h3>
                            <p className="sa__card-sub">{DB_STATS.activeConnections} active of {DB_STATS.maxConnections} max — click to view</p>
                        </div>
                    </div>
                    <div className="sa__gauge">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke={poolColor} strokeWidth="10"
                                strokeDasharray={`${poolUsed * 3.14} ${314 - poolUsed * 3.14}`}
                                strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.5s' }} />
                            <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="800">{poolUsed}%</text>
                            <text x="60" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="10">used</text>
                        </svg>
                    </div>
                </section>
            </div>

            {/* Query Performance Timeline */}
            <div className="sa__card" style={{ marginTop: 16 }}>
                <div className="sa__card-head">
                    <div className="sa__card-icon sa__card-icon--violet"><Clock size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Query Performance (24h)</h3>
                        <p className="sa__card-sub">P50 / P95 / P99 latency in ms</p>
                    </div>
                </div>
                <div style={{ height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={QUERY_PERF} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                            <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickFormatter={(v: number) => `${v}ms`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                            <Area type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1} fill="none" dot={false} />
                            <Area type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={1.5} fill="none" dot={false} />
                            <Area type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={2} fill="none" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                    {[{ label: 'P50', color: '#22c55e' }, { label: 'P95', color: '#f59e0b' }, { label: 'P99', color: '#ef4444' }].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
                            <div style={{ width: 8, height: 3, borderRadius: 2, background: l.color }} />{l.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="sa__grid" style={{ marginTop: 16 }}>
                {/* Table Sizes */}
                <section className="sa__card sa__card--span-7" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--blue"><Table2 size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Tables ({TABLES.length})</h3>
                            <p className="sa__card-sub">Click any table for details</p>
                        </div>
                    </div>
                    <table className="sa__table">
                        <thead><tr><th>Table</th><th>Rows</th><th>Size</th><th>Growth</th><th>Indexes</th><th></th></tr></thead>
                        <tbody>
                            {TABLES.map(t => (
                                <tr key={t.name} onClick={() => setSelectedTable(t)}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{t.name}</td>
                                    <td style={{ fontSize: 11 }}>{t.rows.toLocaleString()}</td>
                                    <td style={{ fontSize: 11 }}>{t.size}</td>
                                    <td style={{ fontSize: 11, color: parseFloat(t.growth) > 5 ? '#f59e0b' : '#22c55e' }}>{t.growth}</td>
                                    <td style={{ fontSize: 11 }}>{t.indexes}</td>
                                    <td><ArrowRight size={12} style={{ color: 'var(--text-muted)' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Slow Queries */}
                <section className="sa__card sa__card--span-5" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--rose"><AlertTriangle size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Slow Queries ({SLOW_QUERIES.length})</h3>
                            <p className="sa__card-sub">Queries exceeding 1s threshold</p>
                        </div>
                    </div>
                    <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {SLOW_QUERIES.map(q => (
                            <div key={q.id} onClick={() => setSelectedQuery(q)} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-subtle)', transition: 'border-color 0.15s' }}>
                                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
                                    {q.query.split('\n')[0]}...
                                </div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)' }}>
                                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Avg: {q.avgTime}</span>
                                    <span>Max: {q.maxTime}</span>
                                    <span>{q.calls.toLocaleString()} calls</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Slow Query Detail Modal ── */}
                {selectedQuery && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQuery(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">Slow Query Analysis</div><div className="sa__modal-subtitle">{selectedQuery.table} · {selectedQuery.calls.toLocaleString()} calls</div></div>
                                <button className="sa__modal-close" onClick={() => setSelectedQuery(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Avg Time</div>
                                        <div className="sa__modal-stat-value" style={{ color: '#ef4444' }}>{selectedQuery.avgTime}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Max Time</div>
                                        <div className="sa__modal-stat-value" style={{ color: '#f59e0b' }}>{selectedQuery.maxTime}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Activity size={10} />Total Calls</div>
                                        <div className="sa__modal-stat-value">{selectedQuery.calls.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="sa__modal-section-title">SQL Query</div>
                                <div className="sa__error-stack" style={{ maxHeight: 160, marginBottom: 16 }}>{selectedQuery.query}</div>

                                <div className="sa__modal-section-title">Execution Plan Analysis</div>
                                <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.06)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: '#f59e0b' }}>
                                    <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                    {selectedQuery.explanation}
                                </div>

                                <div className="sa__modal-section-title">Optimization Suggestion</div>
                                <div className="sa__error-stack" style={{ maxHeight: 80, color: '#22c55e', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                                    {selectedQuery.suggestion}
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedQuery(null)}>Close</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setSelectedQuery(null)}><Zap size={14} /> Apply Index</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Table Detail Modal ── */}
                {selectedTable && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTable(null)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div>
                                    <div className="sa__modal-title" style={{ fontFamily: 'monospace' }}>{selectedTable.name}</div>
                                    <div className="sa__modal-subtitle">{selectedTable.size} · {selectedTable.rows.toLocaleString()} rows</div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedTable(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Table2 size={10} />Rows</div>
                                        <div className="sa__modal-stat-value">{selectedTable.rows.toLocaleString()}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><HardDrive size={10} />Size</div>
                                        <div className="sa__modal-stat-value">{selectedTable.size}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Activity size={10} />Growth</div>
                                        <div className="sa__modal-stat-value" style={{ color: parseFloat(selectedTable.growth) > 5 ? '#f59e0b' : '#22c55e' }}>{selectedTable.growth}</div>
                                    </div>
                                </div>

                                <div className="sa__modal-section-title">Health</div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Indexes</span><span className="sa__stat-value">{selectedTable.indexes}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Last Vacuum</span><span className="sa__stat-value">{selectedTable.lastVacuum}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Avg Query Time</span><span className="sa__stat-value">{selectedTable.avgQueryTime}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Weekly Growth</span><span className="sa__stat-value">{selectedTable.growth}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedTable(null)}>Close</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><RefreshCw size={14} /> Vacuum Now</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><Eye size={14} /> View Indexes</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Connections Modal ── */}
                {showConnectionsModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConnectionsModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Active Connections</div><div className="sa__modal-subtitle">{CONNECTIONS.length} of {DB_STATS.maxConnections} connections in use</div></div>
                                <button className="sa__modal-close" onClick={() => setShowConnectionsModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <table className="sa__table">
                                    <thead><tr><th>User</th><th>Query</th><th>Duration</th><th>State</th><th>DB</th><th></th></tr></thead>
                                    <tbody>
                                        {CONNECTIONS.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.user}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: 10, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.query}</td>
                                                <td style={{ fontSize: 11, color: parseFloat(c.duration) > 500 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{c.duration}</td>
                                                <td><span className={`sa__badge sa__badge--${c.state === 'active' ? 'green' : 'gray'}`}>{c.state}</span></td>
                                                <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.db}</td>
                                                <td><button className="sa__btn sa__btn--danger sa__btn--sm" style={{ padding: '4px 8px', fontSize: 10 }}><XCircle size={10} /> Kill</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowConnectionsModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Backups Modal ── */}
                {showBackupsModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBackupsModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Backup Management</div><div className="sa__modal-subtitle">{BACKUPS.length} backups available</div></div>
                                <button className="sa__modal-close" onClick={() => setShowBackupsModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <table className="sa__table">
                                    <thead><tr><th>Backup</th><th>Type</th><th>Size</th><th>Date</th><th>Duration</th><th>Status</th><th></th></tr></thead>
                                    <tbody>
                                        {BACKUPS.map((b, i) => (
                                            <tr key={i}>
                                                <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{b.name}</td>
                                                <td><span className={`sa__badge sa__badge--${b.type === 'Full' ? 'blue' : 'gray'}`}>{b.type}</span></td>
                                                <td style={{ fontSize: 11 }}>{b.size}</td>
                                                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.date}</td>
                                                <td style={{ fontSize: 11 }}>{b.duration}</td>
                                                <td><span className="sa__badge sa__badge--green">{b.status}</span></td>
                                                <td style={{ display: 'flex', gap: 4 }}>
                                                    <button className="sa__btn sa__btn--ghost sa__btn--sm" style={{ padding: '4px 8px', fontSize: 10 }}><Download size={10} /></button>
                                                    <button className="sa__btn sa__btn--ghost sa__btn--sm" style={{ padding: '4px 8px', fontSize: 10 }}><RefreshCw size={10} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowBackupsModal(false)}>Close</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm"><Download size={14} /> Trigger Backup Now</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Migrations Modal ── */}
                {showMigrationsModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMigrationsModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Migration History</div><div className="sa__modal-subtitle">{MIGRATIONS.length} migrations applied</div></div>
                                <button className="sa__modal-close" onClick={() => setShowMigrationsModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {MIGRATIONS.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < MIGRATIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                                <span style={{ fontFamily: 'monospace', color: '#3b82f6', marginRight: 6 }}>{m.version}</span>
                                                {m.name}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Applied {m.date} · {m.duration}</div>
                                        </div>
                                        <span className="sa__badge sa__badge--green">{m.status}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowMigrationsModal(false)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Maintenance Mode Confirmation ── */}
                {showMaintenanceConfirm && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMaintenanceConfirm(false)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">Enable Maintenance Mode</div></div>
                                <button className="sa__modal-close" onClick={() => setShowMaintenanceConfirm(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.06)', borderRadius: 14, marginBottom: 16, border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <AlertTriangle size={14} /> This will affect all users
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        Enabling maintenance mode will show a maintenance page to all users. Super Admin access will remain available.
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Active Sessions</span><span className="sa__stat-value">{DB_STATS.activeConnections}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Affected Gyms</span><span className="sa__stat-value">All (247)</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Estimated Downtime</span><span className="sa__stat-value">Until manually disabled</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowMaintenanceConfirm(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setShowMaintenanceConfirm(false)}><Settings size={14} /> Enable Maintenance</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default SADatabase;
