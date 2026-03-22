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

import { useEffect } from 'react';
import { superAdminApi, type SuperAdminError } from '../../services/superAdminApi';

const ERROR_TREND = [
    { d: 'Feb 9', critical: 2, warning: 8, info: 15 },
    { d: 'Feb 10', critical: 5, warning: 12, info: 18 },
    { d: 'Feb 11', critical: 3, warning: 10, info: 22 },
    { d: 'Feb 12', critical: 1, warning: 15, info: 25 },
    { d: 'Feb 13', critical: 4, warning: 9, info: 20 },
    { d: 'Feb 14', critical: 8, warning: 18, info: 28 },
    { d: 'Feb 15', critical: 6, warning: 14, info: 24 },
];

const SAErrors: React.FC = () => {
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedError, setSelectedError] = useState<SuperAdminError | null>(null);
    const [showResolveConfirm, setShowResolveConfirm] = useState<SuperAdminError | null>(null);

    const [errors, setErrors] = useState<SuperAdminError[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const loadErrors = async () => {
            try {
                const data = await superAdminApi.getErrors();
                setErrors(data);
            } catch (err) {
                setErrorMsg('Failed to load error data');
            } finally {
                setLoading(false);
            }
        };
        loadErrors();
    }, []);

    const filtered = errors.filter(e => {
        const matchSearch = e.message.toLowerCase().includes(search.toLowerCase()) || e.service.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = severityFilter === 'all' || e.severity === severityFilter;
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchSeverity && matchStatus;
    });

    const totals = useMemo(() => ({
        total: errors.reduce((s, e) => s + e.occurrences, 0),
        critical: errors.filter(e => e.severity === 'critical').length,
        open: errors.filter(e => e.status === 'open').length,
        resolved: errors.filter(e => e.status === 'resolved').length,
    }), [errors]);

    const severityIcon = (s: string) => {
        const props = { size: 14 };
        return s === 'critical' ? <XCircle {...props} style={{ color: '#ef4444' }} /> :
            s === 'high' ? <AlertTriangle {...props} style={{ color: '#f59e0b' }} /> :
                <Info {...props} style={{ color: '#3b82f6' }} />;
    };

    const severityColor = (s: string) => (s === 'critical' || s === 'high') ? 'red' : 'blue';
    const statusColor = (s: string) => s === 'open' ? 'red' : s === 'investigating' ? 'amber' : s === 'resolved' ? 'green' : 'gray';

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Error Tracker</h1>
                    <p>{loading ? 'Loading errors...' : `${totals.total} total occurrences · ${totals.critical} critical · ${totals.open} open`}</p>
                </div>
            </header>

            {errorMsg && (
                <div className="sa__card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.4)' }}>
                    <div style={{ color: '#ef4444', fontSize: 12 }}>{errorMsg}</div>
                </div>
            )}

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
                {['all', 'critical', 'high', 'medium', 'low'].map(f => (
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
                            <div className="sa__error-title" style={{ color: err.severity === 'critical' ? '#ef4444' : err.severity === 'high' ? '#f59e0b' : '#3b82f6' }}>
                                {err.message}
                            </div>
                            <span className={`sa__badge sa__badge--${statusColor(err.status)}`}>{err.status}</span>
                        </div>
                        <div className="sa__error-meta">
                            <span><Bug size={10} /> {err.occurrences} occurrences</span>
                            <span><Clock size={10} /> {err.timestamp}</span>
                            <span><Building2 size={10} /> {err.service}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="sa__pagination" style={{ marginTop: 12 }}>
                <span className="sa__pagination-info">Showing {filtered.length} of {errors.length} errors</span>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Error Detail Modal ── */}
                {selectedError && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedError(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: selectedError.severity === 'critical' ? 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)' : selectedError.severity === 'high' ? 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' : 'linear-gradient(135deg, rgba(59,130,246,0.08), transparent)' }} />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {severityIcon(selectedError.severity)}
                                        <div className="sa__modal-title" style={{ fontSize: 14 }}>{selectedError.message}</div>
                                    </div>
                                    <div className="sa__modal-subtitle">
                                        <span className={`sa__badge sa__badge--${severityColor(selectedError.severity)}`}>{selectedError.severity}</span>{' '}
                                        <span className={`sa__badge sa__badge--${statusColor(selectedError.status)}`} style={{ marginLeft: 4 }}>{selectedError.status}</span>{' '}
                                        · {selectedError.occurrences} occurrences
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedError(null)}><X size={16} /></button>
                            </div>

                            <div className="sa__modal-body">
                                {/* Error frequency chart */}
                                <div className="sa__modal-section-title">Error Trend (Simulated)</div>
                                <div style={{ height: 100, marginBottom: 20 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={ERROR_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="errTrend" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b'} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                            <Area type="monotone" dataKey={selectedError.severity === 'low' || selectedError.severity === 'medium' ? 'info' : 'critical'} stroke={selectedError.severity === 'critical' ? '#ef4444' : '#f59e0b'} strokeWidth={2} fill="url(#errTrend)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Metadata Grid */}
                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Timestamp</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13 }}>{selectedError.timestamp}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Code size={10} />Users Affected</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 13, color: '#f59e0b' }}>{selectedError.usersAffected}</div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <div className="sa__modal-section-title">Context Info</div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Service</span><span className="sa__stat-value" style={{ fontFamily: 'monospace', fontSize: 10 }}>{selectedError.service}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Type</span><span className="sa__stat-value" style={{ fontSize: 10 }}>{selectedError.type}</span></div>
                                    </div>
                                </div>

                                {/* Stack Trace */}
                                <div className="sa__modal-section-title">Stack Trace</div>
                                <div className="sa__error-stack">{selectedError.stackTrace}</div>
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
                                        This will mark <strong>{showResolveConfirm.message}</strong> as resolved and remove it from the active errors list.
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Occurrences</span><span className="sa__stat-value">{showResolveConfirm.occurrences}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Timestamp</span><span className="sa__stat-value">{showResolveConfirm.timestamp}</span></div>

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
