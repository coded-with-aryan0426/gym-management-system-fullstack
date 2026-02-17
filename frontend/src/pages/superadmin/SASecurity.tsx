import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, AlertTriangle, X, Users, Lock, Unlock,
    Eye, Globe, Smartphone, Clock, CheckCircle2, XCircle,
    Monitor, MapPin, Activity, Ban, Settings, Search,
    RefreshCw, ChevronDown, Fingerprint, Key
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const LOGIN_FEED = [
    { id: 1, email: 'rahul@fitzone.com', name: 'Rahul Sharma', ip: '103.21.58.12', location: 'Mumbai, India', type: 'success', time: '2 min ago', device: 'MacBook Pro', browser: 'Chrome 121', os: 'macOS Sonoma', gym: 'FitZone Elite', role: 'OWNER', sessionDuration: '1h 23m', twoFA: true },
    { id: 2, email: 'unknown@brute.net', name: 'Unknown', ip: '45.33.104.88', location: 'Moscow, Russia', type: 'fail', time: '5 min ago', device: 'Linux Server', browser: 'curl/7.68', os: 'Ubuntu 22.04', gym: 'N/A', role: 'N/A', sessionDuration: '-', twoFA: false },
    { id: 3, email: 'neha@flexfit.com', name: 'Neha Gupta', ip: '122.15.42.77', location: 'Pune, India', type: 'success', time: '8 min ago', device: 'iPhone 15 Pro', browser: 'Safari 17.3', os: 'iOS 17.3', gym: 'FlexFit Studio', role: 'OWNER', sessionDuration: '45m', twoFA: true },
    { id: 4, email: 'admin@titan.dev', name: 'Super Admin', ip: '192.168.1.1', location: 'Internal', type: 'suspicious', time: '12 min ago', device: 'Windows PC', browser: 'Firefox 122', os: 'Windows 11', gym: 'Platform', role: 'SUPER_ADMIN', sessionDuration: '3h 12m', twoFA: true },
    { id: 5, email: 'bot@scanner.io', name: 'Unknown', ip: '185.220.101.42', location: 'Amsterdam, NL', type: 'fail', time: '15 min ago', device: 'Linux Bot', browser: 'Python-urllib/3.11', os: 'Linux', gym: 'N/A', role: 'N/A', sessionDuration: '-', twoFA: false },
    { id: 6, email: 'vikram@mf.com', name: 'Vikram Reddy', ip: '49.207.82.11', location: 'Hyderabad, India', type: 'success', time: '18 min ago', device: 'Samsung S24', browser: 'Chrome 121', os: 'Android 14', gym: 'Muscle Factory', role: 'OWNER', sessionDuration: '25m', twoFA: false },
    { id: 7, email: 'test@test.com', name: 'Unknown', ip: '203.99.44.18', location: 'Beijing, China', type: 'fail', time: '22 min ago', device: 'Unknown', browser: 'Headless Chrome', os: 'Linux', gym: 'N/A', role: 'N/A', sessionDuration: '-', twoFA: false },
    { id: 8, email: 'priya@powerhouse.in', name: 'Priya Patel', ip: '106.51.13.22', location: 'Delhi, India', type: 'success', time: '30 min ago', device: 'iPad Pro', browser: 'Safari 17.2', os: 'iPadOS 17.3', gym: 'PowerHouse Gym', role: 'OWNER', sessionDuration: '1h 5m', twoFA: true },
];

const BLOCKED_IPS = [
    { ip: '45.33.104.88', attempts: 213, firstSeen: 'Feb 10, 2025', lastSeen: '5 min ago', country: 'Russia', city: 'Moscow', attackType: 'Brute Force', reason: 'Automated brute force attack (213 attempts)', blockedBy: 'Auto-Block', blockedAt: 'Feb 10, 4:22 PM', isp: 'DataLine Ltd', targetEmails: ['admin@titan.dev', 'test@test.com', 'root@titan.dev'] },
    { ip: '185.220.101.42', attempts: 89, firstSeen: 'Feb 12, 2025', lastSeen: '15 min ago', country: 'Netherlands', city: 'Amsterdam', attackType: 'SQL Injection', reason: 'SQL injection attempts on login endpoint', blockedBy: 'WAF', blockedAt: 'Feb 12, 2:15 PM', isp: 'Tor Exit Node', targetEmails: ['*@*'] },
    { ip: '203.99.44.18', attempts: 156, firstSeen: 'Feb 13, 2025', lastSeen: '22 min ago', country: 'China', city: 'Beijing', attackType: 'Credential Stuffing', reason: 'Credential stuffing with leaked database', blockedBy: 'Auto-Block', blockedAt: 'Feb 13, 8:45 AM', isp: 'China Telecom', targetEmails: ['admin@titan.dev', 'rahul@fitzone.com', 'neha@flexfit.com'] },
    { ip: '91.132.147.55', attempts: 42, firstSeen: 'Feb 14, 2025', lastSeen: '1 hr ago', country: 'Germany', city: 'Frankfurt', attackType: 'Directory Traversal', reason: 'Path traversal attempts on /api/', blockedBy: 'Manual', blockedAt: 'Feb 14, 6:30 PM', isp: 'Hetzner Online', targetEmails: ['N/A'] },
];

const ACTIVE_SESSIONS = [
    { user: 'Rahul Sharma', email: 'rahul@fitzone.com', device: 'MacBook Pro', browser: 'Chrome 121', ip: '103.21.58.12', location: 'Mumbai', duration: '1h 23m', lastActive: '2 min ago' },
    { user: 'Super Admin', email: 'admin@titan.dev', device: 'Windows PC', browser: 'Firefox 122', ip: '192.168.1.1', location: 'Internal', duration: '3h 12m', lastActive: '12 min ago' },
    { user: 'Neha Gupta', email: 'neha@flexfit.com', device: 'iPhone 15 Pro', browser: 'Safari 17.3', ip: '122.15.42.77', location: 'Pune', duration: '45m', lastActive: '8 min ago' },
    { user: 'Priya Patel', email: 'priya@powerhouse.in', device: 'iPad Pro', browser: 'Safari 17.2', ip: '106.51.13.22', location: 'Delhi', duration: '1h 5m', lastActive: '30 min ago' },
    { user: 'Vikram Reddy', email: 'vikram@mf.com', device: 'Samsung S24', browser: 'Chrome 121', ip: '49.207.82.11', location: 'Hyderabad', duration: '25m', lastActive: '18 min ago' },
];

const ATTACK_TREND = [
    { d: 'Feb 9', attacks: 12, blocked: 10, successful: 2 },
    { d: 'Feb 10', attacks: 45, blocked: 43, successful: 2 },
    { d: 'Feb 11', attacks: 28, blocked: 27, successful: 1 },
    { d: 'Feb 12', attacks: 92, blocked: 89, successful: 3 },
    { d: 'Feb 13', attacks: 168, blocked: 165, successful: 3 },
    { d: 'Feb 14', attacks: 55, blocked: 53, successful: 2 },
    { d: 'Feb 15', attacks: 38, blocked: 37, successful: 1 },
];

type LoginEntry = typeof LOGIN_FEED[0];
type BlockedIP = typeof BLOCKED_IPS[0];

const SASecurity: React.FC = () => {
    const [selectedLogin, setSelectedLogin] = useState<LoginEntry | null>(null);
    const [selectedIP, setSelectedIP] = useState<BlockedIP | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showUnblockConfirm, setShowUnblockConfirm] = useState<BlockedIP | null>(null);
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [blockIP, setBlockIP] = useState('');
    const [blockReason, setBlockReason] = useState('');

    const stats = useMemo(() => ({
        failedLogins: LOGIN_FEED.filter(l => l.type === 'fail').length,
        blockedIPs: BLOCKED_IPS.length,
        activeSessions: ACTIVE_SESSIONS.length,
        twoFAAdoption: '74%',
    }), []);

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Security Monitor</h1>
                    <p>Real-time threat monitoring, access control, and security posture</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowSessionsModal(true)}><Eye size={14} /> Sessions ({ACTIVE_SESSIONS.length})</button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowRulesModal(true)}><Settings size={14} /> Rules</button>
                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowBlockModal(true)}><Ban size={14} /> Block IP</button>
                </div>
            </header>

            {/* KPIs */}
            <div className="sa__kpi-row">
                {[
                    { label: 'Failed Logins (24h)', value: String(stats.failedLogins), color: 'rose', icon: XCircle },
                    { label: 'Blocked IPs', value: String(stats.blockedIPs), color: 'amber', icon: Ban },
                    { label: 'Active Sessions', value: String(stats.activeSessions), color: 'emerald', icon: Activity },
                    { label: '2FA Adoption', value: stats.twoFAAdoption, color: 'blue', icon: Shield },
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

            {/* Attack Trend */}
            <div className="sa__card" style={{ marginBottom: 16 }}>
                <div className="sa__card-head">
                    <div className="sa__card-icon sa__card-icon--rose"><Activity size={14} /></div>
                    <div>
                        <h3 className="sa__card-title">Attack Trend (7 Days)</h3>
                        <p className="sa__card-sub">Total attacks vs blocked</p>
                    </div>
                </div>
                <div style={{ height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ATTACK_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="atkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                                <linearGradient id="blkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                            </defs>
                            <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                            <Area type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} fill="url(#atkG)" dot={false} />
                            <Area type="monotone" dataKey="blocked" stroke="#22c55e" strokeWidth={1.5} fill="url(#blkG)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                    {[{ label: 'Attacks', color: '#ef4444' }, { label: 'Blocked', color: '#22c55e' }].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
                            <div style={{ width: 8, height: 3, borderRadius: 2, background: l.color }} />{l.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="sa__grid">
                {/* Live Login Feed */}
                <section className="sa__card sa__card--span-7" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--emerald"><Activity size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Live Login Feed</h3>
                            <p className="sa__card-sub">Click any entry for details</p>
                        </div>
                    </div>
                    <div className="sa__feed-list" style={{ padding: '0 10px 10px' }}>
                        {LOGIN_FEED.map(entry => (
                            <div
                                key={entry.id}
                                className={`sa__feed-item sa__feed-item--${entry.type}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedLogin(entry)}
                            >
                                <div className="sa__feed-dot" />
                                <span className="sa__feed-email">{entry.email}</span>
                                <span className="sa__feed-IP">{entry.ip}</span>
                                <span className="sa__feed-tag">{entry.type}</span>
                                <span className="sa__feed-time">{entry.time}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Blocked IPs */}
                <section className="sa__card sa__card--span-5" style={{ padding: 0 }}>
                    <div className="sa__card-head" style={{ padding: '16px 18px' }}>
                        <div className="sa__card-icon sa__card-icon--rose"><Ban size={14} /></div>
                        <div>
                            <h3 className="sa__card-title">Blocked IPs</h3>
                            <p className="sa__card-sub">{BLOCKED_IPS.length} currently blocked</p>
                        </div>
                    </div>
                    <table className="sa__table">
                        <thead><tr><th>IP Address</th><th>Attacks</th><th>Type</th><th></th></tr></thead>
                        <tbody>
                            {BLOCKED_IPS.map(ip => (
                                <tr key={ip.ip} onClick={() => setSelectedIP(ip)}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 11 }}>{ip.ip}</td>
                                    <td><span className="sa__badge sa__badge--red">{ip.attempts}</span></td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ip.attackType}</td>
                                    <td>
                                        <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={e => { e.stopPropagation(); setShowUnblockConfirm(ip); }} style={{ padding: '4px 8px', fontSize: 10 }}>
                                            <Unlock size={10} /> Unblock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Login Detail Modal ── */}
                {selectedLogin && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLogin(null)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: selectedLogin.type === 'success' ? 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' : selectedLogin.type === 'fail' ? 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' : 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' }} />
                                <div>
                                    <div className="sa__modal-title">Login Detail</div>
                                    <div className="sa__modal-subtitle">
                                        <span className={`sa__badge sa__badge--${selectedLogin.type === 'success' ? 'green' : selectedLogin.type === 'fail' ? 'red' : 'amber'}`}>{selectedLogin.type}</span>{' '}
                                        · {selectedLogin.time}
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedLogin(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Users size={10} />User</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedLogin.name}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><MapPin size={10} />Location</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedLogin.location}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Duration</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedLogin.sessionDuration}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <div className="sa__modal-section-title">Identity</div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Email</span><span className="sa__stat-value" style={{ fontSize: 11 }}>{selectedLogin.email}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Role</span><span className="sa__stat-value">{selectedLogin.role}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Gym</span><span className="sa__stat-value">{selectedLogin.gym}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">2FA</span><span className="sa__stat-value" style={{ color: selectedLogin.twoFA ? '#22c55e' : '#ef4444' }}>{selectedLogin.twoFA ? 'Enabled' : 'Disabled'}</span></div>
                                    </div>
                                    <div>
                                        <div className="sa__modal-section-title">Device & Network</div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Device</span><span className="sa__stat-value">{selectedLogin.device}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Browser</span><span className="sa__stat-value">{selectedLogin.browser}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">OS</span><span className="sa__stat-value">{selectedLogin.os}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">IP Address</span><span className="sa__stat-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{selectedLogin.ip}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedLogin(null)}>Close</button>
                                {selectedLogin.type !== 'success' && (
                                    <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setBlockIP(selectedLogin.ip); setShowBlockModal(true); setSelectedLogin(null); }}><Ban size={14} /> Block IP</button>
                                )}
                                {selectedLogin.type === 'success' && (
                                    <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setSelectedLogin(null)}><XCircle size={14} /> Force Logout</button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── IP Detail Modal ── */}
                {selectedIP && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIP(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }} />
                                <div>
                                    <div className="sa__modal-title">IP Threat Report</div>
                                    <div className="sa__modal-subtitle" style={{ fontFamily: 'monospace' }}>{selectedIP.ip} · {selectedIP.country}</div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedIP(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {/* Threat Banner */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                    <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{selectedIP.attackType}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedIP.reason}</div>
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{selectedIP.attempts}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>attempts</div>
                                </div>

                                <div className="sa__modal-stat-grid">
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Globe size={10} />Location</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedIP.city}, {selectedIP.country}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Shield size={10} />Blocked By</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedIP.blockedBy}</div>
                                    </div>
                                    <div className="sa__modal-stat">
                                        <div className="sa__modal-stat-label"><Clock size={10} />Blocked At</div>
                                        <div className="sa__modal-stat-value" style={{ fontSize: 14 }}>{selectedIP.blockedAt}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <div className="sa__modal-section-title">Network Info</div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">ISP</span><span className="sa__stat-value">{selectedIP.isp}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">First Seen</span><span className="sa__stat-value">{selectedIP.firstSeen}</span></div>
                                        <div className="sa__stat-row"><span className="sa__stat-label">Last Seen</span><span className="sa__stat-value">{selectedIP.lastSeen}</span></div>
                                    </div>
                                    <div>
                                        <div className="sa__modal-section-title">Targeted Emails ({selectedIP.targetEmails.length})</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {selectedIP.targetEmails.map(e => (
                                                <span key={e} style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedIP(null)}>Close</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => { setShowUnblockConfirm(selectedIP); setSelectedIP(null); }}><Unlock size={14} /> Unblock</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Block IP Modal ── */}
                {showBlockModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBlockModal(false)}>
                        <motion.div className="sa__modal" style={{ width: 480 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">Block IP Address</div><div className="sa__modal-subtitle">Manually block suspicious IP</div></div>
                                <button className="sa__modal-close" onClick={() => setShowBlockModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>IP Address</label>
                                    <input
                                        type="text" value={blockIP} onChange={e => setBlockIP(e.target.value)}
                                        placeholder="e.g. 192.168.1.1"
                                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</label>
                                    <select
                                        value={blockReason} onChange={e => setBlockReason(e.target.value)}
                                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                                    >
                                        <option value="">Select reason...</option>
                                        <option value="brute">Brute Force Attack</option>
                                        <option value="sqli">SQL Injection</option>
                                        <option value="cred">Credential Stuffing</option>
                                        <option value="scan">Port Scanning</option>
                                        <option value="spam">Spam/Abuse</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setShowBlockModal(false); setBlockIP(''); }}>Cancel</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setShowBlockModal(false); setBlockIP(''); }}><Ban size={14} /> Block IP</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Unblock Confirmation Modal ── */}
                {showUnblockConfirm && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUnblockConfirm(null)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">Unblock IP?</div></div>
                                <button className="sa__modal-close" onClick={() => setShowUnblockConfirm(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.06)', borderRadius: 14, marginBottom: 16, border: '1px solid rgba(245,158,11,0.15)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <AlertTriangle size={14} /> This IP had {showUnblockConfirm.attempts} attack attempts
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        Are you sure you want to unblock <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{showUnblockConfirm.ip}</code>?
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Attack Type</span><span className="sa__stat-value">{showUnblockConfirm.attackType}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Country</span><span className="sa__stat-value">{showUnblockConfirm.country}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Last Active</span><span className="sa__stat-value">{showUnblockConfirm.lastSeen}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowUnblockConfirm(null)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowUnblockConfirm(null)}><Unlock size={14} /> Unblock</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Active Sessions Modal ── */}
                {showSessionsModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSessionsModal(false)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Active Sessions</div><div className="sa__modal-subtitle">{ACTIVE_SESSIONS.length} live sessions</div></div>
                                <button className="sa__modal-close" onClick={() => setShowSessionsModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <table className="sa__table">
                                    <thead><tr><th>User</th><th>Device</th><th>IP</th><th>Location</th><th>Duration</th><th>Last Active</th><th></th></tr></thead>
                                    <tbody>
                                        {ACTIVE_SESSIONS.map((s, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: 12 }}>{s.user}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.email}</div>
                                                </td>
                                                <td style={{ fontSize: 11 }}>{s.device}<br /><span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{s.browser}</span></td>
                                                <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{s.ip}</td>
                                                <td style={{ fontSize: 11 }}>{s.location}</td>
                                                <td style={{ fontSize: 11 }}>{s.duration}</td>
                                                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.lastActive}</td>
                                                <td>
                                                    <button className="sa__btn sa__btn--danger sa__btn--sm" style={{ padding: '4px 8px', fontSize: 10 }}><XCircle size={10} /> Logout</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowSessionsModal(false)}>Close</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm"><XCircle size={14} /> Force Logout All</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Security Rules Modal ── */}
                {showRulesModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRulesModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Security Rules</div><div className="sa__modal-subtitle">Configure platform security policies</div></div>
                                <button className="sa__modal-close" onClick={() => setShowRulesModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {[
                                    { label: 'Rate Limiting', desc: 'Max login attempts before auto-block', value: '5 attempts / 15 min', icon: Shield },
                                    { label: 'Session Timeout', desc: 'Auto-logout after inactivity', value: '4 hours', icon: Clock },
                                    { label: 'Password Policy', desc: 'Minimum requirements for passwords', value: '8+ chars, 1 upper, 1 digit', icon: Key },
                                    { label: '2FA Enforcement', desc: 'Require 2FA for specific roles', value: 'Owners + Admins', icon: Fingerprint },
                                    { label: 'IP Whitelist', desc: 'Only allow logins from trusted IPs', value: 'Disabled', icon: Globe },
                                    { label: 'Auto-Block Threshold', desc: 'Auto-block IPs after X failed attempts', value: '10 attempts', icon: Ban },
                                ].map((rule, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <rule.icon size={16} style={{ color: '#3b82f6' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{rule.label}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rule.desc}</div>
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6 }}>{rule.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowRulesModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowRulesModal(false)}><CheckCircle2 size={14} /> Save Rules</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default SASecurity;
