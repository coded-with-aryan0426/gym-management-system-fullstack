import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Users, X, Shield, Ban, KeyRound,
    LogOut, Calendar, Clock, Activity, AlertTriangle,
    CheckCircle2, Zap, Building2, UserPlus, UserCog, CreditCard,
    Plus, Monitor, Smartphone, RefreshCw
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip
} from 'recharts';
import { superAdminApi, SuperAdminUser, SuperAdminUserTelemetry } from '../../services/superAdminApi';

type User = SuperAdminUser;
type UserDetail = SuperAdminUserTelemetry;

const SAUsers: React.FC = () => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [detailTab, setDetailTab] = useState<'profile' | 'security' | 'activity'>('profile');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [banUser, setBanUser] = useState<User | null>(null);
    const [banReason, setBanReason] = useState('');
    const [banLoading, setBanLoading] = useState(false);
    const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);
    const [sessionUser, setSessionUser] = useState<UserDetail | null>(null);
    
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await superAdminApi.getUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load users');
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUserDetail = async (userId: number) => {
        try {
            setLoadingDetail(true);
            const detail = await superAdminApi.getUserTelemetry(userId);
            setSelectedUser(detail);
        } catch (err: any) {
            console.error('Failed to load user details:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load user details');
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleUserClick = (user: User) => {
        loadUserDetail(user.id);
    };

    const handleConfirmBanToggle = async () => {
        if (!banUser) return;
        setBanLoading(true);
        try {
            if (banUser.status !== 'banned') {
                await superAdminApi.banUser(banUser.id, banReason || 'Banned by Super Admin');
                setUsers(prev => prev.map(u => u.id === banUser.id ? { ...u, status: 'banned' as const } : u));
            } else {
                await superAdminApi.unbanUser(banUser.id);
                setUsers(prev => prev.map(u => u.id === banUser.id ? { ...u, status: 'active' as const } : u));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Action failed');
        } finally {
            setBanLoading(false);
            setBanUser(null);
            setBanReason('');
        }
    };

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const totals = useMemo(() => ({
        total: users.length,
        owners: users.filter(u => u.role === 'OWNER').length,
        trainers: users.filter(u => u.role === 'TRAINER').length,
        members: users.filter(u => u.role === 'MEMBER').length,
        atRisk: users.filter(u => u.riskScore >= 50).length,
    }), [users]);

    const roleColor = (r: string) => r === 'OWNER' ? 'amber' : r === 'TRAINER' ? 'violet' : 'blue';
    const statusColor = (s: string) => s === 'active' ? 'green' : s === 'suspended' ? 'amber' : s === 'banned' ? 'red' : 'gray';
    const riskColor = (s: number) => s >= 50 ? '#ef4444' : s >= 20 ? '#f59e0b' : '#22c55e';
    const activityTypeColor = (t: string) => t === 'security' ? '#ef4444' : t === 'billing' ? '#10b981' : t === 'login' ? '#3b82f6' : t === 'admin' ? '#8b5cf6' : '#f59e0b';
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>User Management</h1>
                    <p>{totals.total} users across all gyms · {totals.atRisk} at risk</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                        className="sa__btn sa__btn--ghost sa__btn--sm" 
                        onClick={loadUsers}
                        disabled={loading}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCreateModal(true)}><Plus size={14} /> Create User</button>
                </div>
            </header>

            {/* Error Alert */}
            {error && (
                <motion.div 
                    className="sa__alert sa__alert--error" 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={14} /></button>
                </motion.div>
            )}

            {/* Summary KPIs */}
            <div className="sa__kpi-row">
                {[
                    { label: 'Total Users', value: String(totals.total), color: 'blue', icon: Users },
                    { label: 'Owners', value: String(totals.owners), color: 'cyan', icon: Building2 },
                    { label: 'Trainers', value: String(totals.trainers), color: 'violet', icon: Zap },
                    { label: 'Members', value: String(totals.members), color: 'emerald', icon: UserPlus },
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

            {/* Toolbar */}
            <div className="sa__toolbar">
                <div className="sa__search">
                    <Search size={14} />
                    <input placeholder="Search users, emails, gyms..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'OWNER', 'TRAINER', 'MEMBER'].map(f => (
                    <button key={f} className={`sa__filter ${roleFilter === f ? 'sa__filter--active' : ''}`} onClick={() => setRoleFilter(f)}>
                        {f === 'all' ? 'All Roles' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="sa__card" style={{ padding: 0, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Activity size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: 8 }}>Loading users...</p>
                    </div>
                ) : (
                    <>
                        <table className="sa__table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Risk</th>
                                    <th>2FA</th>
                                    <th>Logins</th>
                                    <th>Streak</th>
                                    <th>Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id} onClick={() => handleUserClick(u)}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                    {getInitials(u.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 12 }}>{u.name}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`sa__badge sa__badge--${roleColor(u.role)}`}>{u.role}</span></td>
                                        <td><span className={`sa__badge sa__badge--${statusColor(u.status)}`}>{u.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: 24, height: 4, borderRadius: 2, background: 'var(--bg-active)' }}>
                                                    <div style={{ width: `${Math.min(u.riskScore, 100)}%`, height: '100%', borderRadius: 2, background: riskColor(u.riskScore) }} />
                                                </div>
                                                <span style={{ fontSize: 10, fontWeight: 600, color: riskColor(u.riskScore) }}>{u.riskScore}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {u.twoFA ?
                                                <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> :
                                                <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                                            }
                                        </td>
                                        <td style={{ fontSize: 11 }}>{u.totalLogins.toLocaleString()}</td>
                                        <td><span style={{ fontSize: 11 }}>🔥 {u.loginStreak}d</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.lastLogin}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="sa__pagination" style={{ padding: '12px 14px' }}>
                            <span className="sa__pagination-info">Showing {filtered.length} of {users.length} users</span>
                        </div>
                    </>
                )}
            </div>

            {/* Popup Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)}>
                        <motion.div
                            className="sa__modal sa__modal--wide"
                            initial={{ opacity: 0, scale: 0.92, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 30 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {loadingDetail ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Activity size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                    <p style={{ marginTop: 8 }}>Loading user details...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="sa__modal-header">
                                        <div className="sa__modal-header-banner" />
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                                                    {getInitials(selectedUser.name)}
                                                </div>
                                                <div>
                                                    <div className="sa__modal-title">{selectedUser.name}</div>
                                                    <div className="sa__modal-subtitle">
                                                        {selectedUser.email} ·{' '}
                                                        <span className={`sa__badge sa__badge--${roleColor(selectedUser.role)}`} style={{ marginLeft: 2 }}>{selectedUser.role}</span>{' '}
                                                        <span className={`sa__badge sa__badge--${statusColor(selectedUser.status)}`} style={{ marginLeft: 2 }}>{selectedUser.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="sa__modal-close" onClick={() => setSelectedUser(null)}><X size={16} /></button>
                                    </div>

                            {/* Tabs */}
                            <div className="sa__modal-tabs">
                                {(['profile', 'security', 'activity'] as const).map(tab => (
                                    <button key={tab} className={`sa__modal-tab ${detailTab === tab ? 'sa__modal-tab--active' : ''}`} onClick={() => setDetailTab(tab)}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="sa__modal-body">
                                {detailTab === 'profile' && (
                                    <>
                                        {/* Quick Stats */}
                                        <div className="sa__modal-stat-grid">
                                            {[
                                                { label: 'Total Logins', value: selectedUser.totalLogins.toLocaleString(), icon: Activity, color: '#3b82f6' },
                                                { label: 'Login Streak', value: `${selectedUser.loginStreak}d 🔥`, icon: Zap, color: '#f59e0b' },
                                                { label: 'Total Spent', value: selectedUser.totalSpent > 0 ? `₹${selectedUser.totalSpent.toLocaleString()}` : '—', icon: CreditCard, color: '#10b981' },
                                            ].map(stat => (
                                                <div key={stat.label} className="sa__modal-stat">
                                                    <div className="sa__modal-stat-label"><stat.icon size={10} style={{ color: stat.color }} />{stat.label}</div>
                                                    <div className="sa__modal-stat-value">{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Two columns: Details + Login Chart */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <div>
                                                <div className="sa__modal-section-title">User Details</div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Phone</span><span className="sa__stat-value">{selectedUser.phone || 'N/A'}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">City</span><span className="sa__stat-value">{selectedUser.city}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Joined</span><span className="sa__stat-value">{selectedUser.joinDate}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Last Login</span><span className="sa__stat-value">{selectedUser.lastLogin}</span></div>
                                            </div>
                                            <div>
                                                <div className="sa__modal-section-title">Login Activity (This Week)</div>
                                                <div style={{ height: 120 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={selectedUser.loginHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                            <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                            <Bar dataKey="v" radius={[4, 4, 0, 0]} barSize={18}>
                                                                {selectedUser.loginHistory.map((_, i) => (
                                                                    <Cell key={i} fill="#3b82f6" fillOpacity={0.5 + (i / 12)} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div style={{ marginTop: 20 }}>
                                            <div className="sa__modal-section-title">Permissions ({selectedUser.permissions.length})</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                {selectedUser.permissions.map(p => (
                                                    <span key={p} className={`sa__badge sa__badge--${p.includes('No access') || p.includes('Suspended') || p.includes('Banned') ? 'red' : 'blue'}`} style={{ fontSize: 10 }}>{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {detailTab === 'security' && (
                                    <>
                                        {/* Risk Score Banner */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: `${riskColor(selectedUser.riskScore)}08`, borderRadius: 14, marginBottom: 20, border: `1px solid ${riskColor(selectedUser.riskScore)}20` }}>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${riskColor(selectedUser.riskScore)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: riskColor(selectedUser.riskScore) }}>
                                                {selectedUser.riskScore}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Risk Score</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    {selectedUser.riskScore >= 50 ? 'High risk — review immediately' : selectedUser.riskScore >= 20 ? 'Moderate — monitor activity' : 'Low — user appears safe'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Two columns: Security + Device */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            <div>
                                                <div className="sa__modal-section-title">Security Info</div>
                                                <div className="sa__stat-row">
                                                    <span className="sa__stat-label">2FA</span>
                                                    <span>{selectedUser.twoFA ?
                                                        <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><CheckCircle2 size={12} /> Enabled</span> :
                                                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><AlertTriangle size={12} /> Disabled</span>
                                                    }</span>
                                                </div>
                                                <div className="sa__stat-row">
                                                    <span className="sa__stat-label">Email Verified</span>
                                                    <span>{selectedUser.emailVerified ?
                                                        <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><CheckCircle2 size={12} /> Yes</span> :
                                                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><AlertTriangle size={12} /> No</span>
                                                    }</span>
                                                </div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Last IP</span><span className="sa__stat-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{selectedUser.ip}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Country</span><span className="sa__stat-value">{selectedUser.country}</span></div>
                                            </div>
                                            <div>
                                                <div className="sa__modal-section-title">Device & Session</div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Device</span><span className="sa__stat-value">{selectedUser.device}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Browser</span><span className="sa__stat-value">{selectedUser.browser}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">OS</span><span className="sa__stat-value">{selectedUser.os}</span></div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {detailTab === 'activity' && (
                                    <>
                                        <div className="sa__modal-section-title">Activity Timeline</div>
                                        {selectedUser.activityTimeline.map((act, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 10, marginBottom: 4 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: activityTypeColor(act.type), marginTop: 5, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{act.action}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{act.detail}</div>
                                                </div>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>{act.time}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><KeyRound size={14} /> Reset PWD</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setRoleChangeUser(selectedUser); }}><UserCog size={14} /> Change Role</button>
                                {selectedUser.status !== 'banned' ? (
                                    <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setBanUser(selectedUser); setSelectedUser(null); }}><Ban size={14} /> Ban</button>
                                ) : (
                                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => { setBanUser(selectedUser); setSelectedUser(null); }}><CheckCircle2 size={14} /> Unban</button>
                                )}
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setSessionUser(selectedUser); }}><LogOut size={14} /> Sessions</button>
                            </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Create User Modal ── */}
                {showCreateModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Create New User</div><div className="sa__modal-subtitle">Add a user to the platform</div></div>
                                <button className="sa__modal-close" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {[{ label: 'Full Name', placeholder: 'e.g. Rahul Sharma', type: 'text' }, { label: 'Email', placeholder: 'e.g. user@gym.com', type: 'email' }, { label: 'Phone', placeholder: 'e.g. +91 98765 43210', type: 'tel' }].map((f, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                                    </div>
                                ))}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                                        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                                            <option value="OWNER">Owner</option>
                                            <option value="TRAINER">Trainer</option>
                                            <option value="MEMBER">Member</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assign to Gym</label>
                                        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                                            <option value="">Select gym...</option>
                                            <option value="fitzone">FitZone Elite</option>
                                            <option value="powerhouse">PowerHouse Gym</option>
                                            <option value="ironforge">IronForge</option>
                                        </select>
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} /> Send welcome email with temporary password
                                </label>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCreateModal(false)}><Plus size={14} /> Create User</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Ban / Unban Confirmation ── */}
                {banUser && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBanUser(null)}>
                        <motion.div className="sa__modal" style={{ width: 480 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: banUser.status !== 'banned' ? 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' : 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">{banUser.status !== 'banned' ? 'Ban' : 'Unban'} {banUser.name}?</div></div>
                                <button className="sa__modal-close" onClick={() => setBanUser(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: `rgba(${banUser.status !== 'banned' ? '239,68,68' : '34,197,94'}, 0.06)`, borderRadius: 14, marginBottom: 16, border: `1px solid rgba(${banUser.status !== 'banned' ? '239,68,68' : '34,197,94'}, 0.15)` }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: banUser.status !== 'banned' ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <AlertTriangle size={14} /> {banUser.status !== 'banned' ? 'This action will permanently block access' : 'This will restore the user\'s access'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {banUser.status !== 'banned' ? 'User will be logged out of all sessions and blocked from logging in.' : 'User will regain access to their account and associated gym.'}
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">User</span><span className="sa__stat-value">{banUser.name}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Email</span><span className="sa__stat-value">{banUser.email}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Role</span><span className="sa__stat-value">{banUser.role}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gym</span><span className="sa__stat-value">{banUser.gym}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Risk Score</span><span className="sa__stat-value" style={{ color: riskColor(banUser.riskScore) }}>{banUser.riskScore}</span></div>
                                {banUser.status !== 'banned' && (
                                    <div style={{ marginTop: 14 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</label>
                                        <select
                                            value={banReason}
                                            onChange={e => setBanReason(e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
                                            <option value="">Select reason...</option>
                                            <option value="bot">Bot / Automated Activity</option>
                                            <option value="abuse">Abusive Behavior</option>
                                            <option value="fraud">Fraud / Payment Abuse</option>
                                            <option value="tos">Terms of Service Violation</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setBanUser(null)}>Cancel</button>
                                <button
                                    className={`sa__btn sa__btn--${banUser.status !== 'banned' ? 'danger' : 'primary'} sa__btn--sm`}
                                    onClick={handleConfirmBanToggle}
                                    disabled={banLoading}
                                >
                                    {banLoading ? <RefreshCw size={14} className="spin" /> : (banUser.status !== 'banned' ? <><Ban size={14} /> Ban User</> : <><CheckCircle2 size={14} /> Unban User</>)}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Role Change Modal ── */}
                {roleChangeUser && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRoleChangeUser(null)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Change Role</div><div className="sa__modal-subtitle">{roleChangeUser.name} · Currently: {roleChangeUser.role}</div></div>
                                <button className="sa__modal-close" onClick={() => setRoleChangeUser(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Role</label>
                                    <select defaultValue={roleChangeUser.role} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                                        <option value="OWNER">Owner</option>
                                        <option value="TRAINER">Trainer</option>
                                        <option value="MEMBER">Member</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>
                                <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Changing role will immediately update the user's permissions. If downgrading from Owner, they will lose admin access to their gym.
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setRoleChangeUser(null)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setRoleChangeUser(null)}><UserCog size={14} /> Update Role</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Session Viewer Modal ── */}
                {sessionUser && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSessionUser(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Active Sessions</div><div className="sa__modal-subtitle">{sessionUser.name} · {sessionUser.email}</div></div>
                                <button className="sa__modal-close" onClick={() => setSessionUser(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {[{ device: sessionUser.device, browser: sessionUser.browser, os: sessionUser.os, ip: sessionUser.ip, location: `${sessionUser.city}, ${sessionUser.country}`, time: sessionUser.lastLogin, current: true },
                                ...(sessionUser.totalLogins > 200 ? [{ device: 'iPhone 15', browser: 'Safari 17', os: 'iOS 17.3', ip: '103.55.xx.xx', location: `${sessionUser.city}, India`, time: '2 hrs ago', current: false }] : [])
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: s.current ? 'rgba(34,197,94,0.04)' : 'transparent', borderRadius: 12, marginBottom: 8, border: `1px solid ${s.current ? 'rgba(34,197,94,0.15)' : 'var(--border-subtle)'}` }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {s.device.includes('iPhone') || s.device.includes('Samsung') || s.device.includes('iPad') ? <Smartphone size={16} style={{ color: '#3b82f6' }} /> : <Monitor size={16} style={{ color: '#3b82f6' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {s.device} {s.current && <span className="sa__badge sa__badge--green" style={{ fontSize: 9 }}>Current</span>}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.browser} · {s.os} · {s.ip}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{s.location} · {s.time}</div>
                                        </div>
                                        {!s.current && (
                                            <button className="sa__btn sa__btn--danger sa__btn--sm" style={{ fontSize: 10 }}><LogOut size={12} /> Revoke</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSessionUser(null)}>Close</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => setSessionUser(null)}><LogOut size={14} /> Revoke All Sessions</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SAUsers;
