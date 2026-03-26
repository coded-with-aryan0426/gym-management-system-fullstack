import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Building2, X, Users, DollarSign,
    Calendar, Download, UserCog, Pause, Play,
    TrendingUp, TrendingDown, Activity, Clock, MapPin,
    Zap, CheckCircle2, Plus, AlertTriangle, Mail, Send, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { superAdminApi, SuperAdminGym, SuperAdminGymDeepDive } from '../../services/superAdminApi';
import {
    GymHealthScore,
    RevenueLeakageBadge,
    InlineSparkline,
    OwnerActivityStatus
} from '../../components/superadmin/shared';

type Gym = SuperAdminGym;
type GymDetail = SuperAdminGymDeepDive;

const SAGyms: React.FC = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedGym, setSelectedGym] = useState<GymDetail | null>(null);
    const [detailTab, setDetailTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [suspendGym, setSuspendGym] = useState<Gym | null>(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [suspendLoading, setSuspendLoading] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showCommsModal, setShowCommsModal] = useState(false);
    const [commsTarget, setCommsTarget] = useState<Gym | null>(null);
    const [exportFormat, setExportFormat] = useState('csv');
    
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadGyms();
    }, []);

    const loadGyms = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await superAdminApi.getGyms();
            setGyms(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load gyms');
            console.error('Failed to load gyms:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadGymDetail = async (gymId: number) => {
        try {
            setLoadingDetail(true);
            const detail = await superAdminApi.getGymDeepDive(gymId);
            setSelectedGym(detail);
        } catch (err: any) {
            console.error('Failed to load gym details:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load gym details');
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleGymClick = (gym: Gym) => {
        loadGymDetail(gym.id);
    };

    const handleConfirmSuspendToggle = async () => {
        if (!suspendGym) return;
        setSuspendLoading(true);
        try {
            if (suspendGym.status === 'active') {
                await superAdminApi.suspendGym(suspendGym.id, suspendReason || 'Suspended by Super Admin');
                setGyms(prev => prev.map(g => g.id === suspendGym.id ? { ...g, status: 'suspended' as const } : g));
            } else {
                await superAdminApi.activateGym(suspendGym.id);
                setGyms(prev => prev.map(g => g.id === suspendGym.id ? { ...g, status: 'active' as const } : g));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Action failed');
        } finally {
            setSuspendLoading(false);
            setSuspendGym(null);
            setSuspendReason('');
        }
    };

    const filtered = gyms.filter(g => {
        const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
            g.owner.toLowerCase().includes(search.toLowerCase()) ||
            g.city.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || g.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totals = useMemo(() => ({
        gyms: gyms.length,
        active: gyms.filter(g => g.status === 'active').length,
        members: gyms.reduce((s, g) => s + g.members, 0),
        revenue: gyms.reduce((s, g) => s + g.revenue, 0),
    }), [gyms]);

    const statusColor = (s: string) => s === 'active' ? 'green' : s === 'suspended' ? 'red' : 'amber';
    const planColor = (p: string) => p === 'Enterprise' ? 'violet' : p === 'Pro' ? 'blue' : 'gray';
    const healthColor = (h: number) => h >= 85 ? '#22c55e' : h >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Gym Management</h1>
                    <p>{totals.gyms} gyms · {totals.members.toLocaleString()} total members · ${totals.revenue.toLocaleString()}/mo revenue</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                        className="sa__btn sa__btn--ghost sa__btn--sm" 
                        onClick={loadGyms}
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowExportModal(true)}><Download size={14} /> Export</button>
                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Gym</button>
                </div>
            </header>

            {/* Error Alert */}
            {error && (
                <div style={{ padding: '12px 16px', background: '#fee', border: '1px solid #fcc', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={16} color="#c00" />
                    <span style={{ flex: 1, fontSize: 13, color: '#900' }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                </div>
            )}

            {/* Loading State */}
            {loading && gyms.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <RefreshCw size={32} className="spin" style={{ marginBottom: 12 }} />
                    <div>Loading gyms...</div>
                </div>
            )}

            {/* Summary KPIs */}
            <div className="sa__kpi-row">
                {[
                    { label: 'Total Gyms', value: String(totals.gyms), color: 'blue', icon: Building2 },
                    { label: 'Active', value: String(totals.active), color: 'emerald', icon: CheckCircle2 },
                    { label: 'Total Members', value: totals.members.toLocaleString(), color: 'violet', icon: Users },
                    { label: 'Platform Revenue', value: `$${totals.revenue.toLocaleString()}`, color: 'cyan', icon: DollarSign },
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
                    <input placeholder="Search gyms, owners, cities..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'active', 'trial', 'suspended'].map(f => (
                    <button key={f} className={`sa__filter ${statusFilter === f ? 'sa__filter--active' : ''}`} onClick={() => setStatusFilter(f)}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="sa__card" style={{ padding: 0, overflow: 'auto' }}>
                <table className="sa__table">
                    <thead>
                        <tr>
                            <th style={{ width: 60 }}>Health</th>
                            <th>Gym Name</th>
                            <th>Owner</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Members</th>
                            <th>Rev/mo</th>
                            <th>7-Day Trend</th>
                            <th>Owner Activity</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(gym => (
                            <tr key={gym.id} onClick={() => { handleGymClick(gym); setDetailTab('overview'); }}>
                                <td>
                                    <GymHealthScore
                                        score={gym.healthScore}
                                        size={40}
                                        strokeWidth={3}
                                    />
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Building2 size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                        <div>
                                            <div>{gym.name}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                                                <MapPin size={8} style={{ marginRight: 2 }} />{gym.city}, {gym.state}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: 12 }}>{gym.owner}</td>
                                <td><span className={`sa__badge sa__badge--${planColor(gym.plan)}`}>{gym.plan}</span></td>
                                <td><span className={`sa__badge sa__badge--${statusColor(gym.status)}`}>{gym.status}</span></td>
                                <td>{gym.members.toLocaleString()}</td>
                                <td>${gym.revenue.toLocaleString()}</td>
                                <td>
                                    <InlineSparkline
                                        values={[12, 19, 15, 22, 18, 25, 21]}
                                        width={60}
                                        height={24}
                                        showTrend={true}
                                    />
                                </td>
                                <td>
                                    <OwnerActivityStatus
                                        lastLogin={gym.lastActive}
                                        size="sm"
                                    />
                                </td>
                                <td>
                                    {(gym as any).hasRevenueLeakage && (
                                        <RevenueLeakageBadge
                                            amount={(gym as any).stuckAmount || 0}
                                            failedPayments={(gym as any).failedPayments || 0}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="sa__pagination" style={{ padding: '12px 14px' }}>
                    <span className="sa__pagination-info">Showing {filtered.length} of {gyms.length} gyms</span>
                </div>
            </div>

            {/* Popup Modal */}
            <AnimatePresence>
                {loadingDetail && (
                    <motion.div 
                        className="sa__modal-overlay" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center', color: '#fff' }}>
                            <RefreshCw size={40} className="spin" style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 14 }}>Loading gym details...</div>
                        </div>
                    </motion.div>
                )}
                {selectedGym && !loadingDetail && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGym(null)}>
                        <motion.div
                            className="sa__modal sa__modal--wide"
                            initial={{ opacity: 0, scale: 0.92, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 30 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Building2 size={18} color="#fff" />
                                        </div>
                                        <div>
                                            <div className="sa__modal-title">{selectedGym.name}</div>
                                            <div className="sa__modal-subtitle">
                                                <MapPin size={10} style={{ marginRight: 2 }} />{selectedGym.city}, {selectedGym.state} · Since {selectedGym.created} · <span className={`sa__badge sa__badge--${planColor(selectedGym.plan)}`} style={{ marginLeft: 4 }}>{selectedGym.plan}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedGym(null)}><X size={16} /></button>
                            </div>

                            {/* Tabs */}
                            <div className="sa__modal-tabs">
                                {(['overview', 'analytics', 'activity'] as const).map(tab => (
                                    <button key={tab} className={`sa__modal-tab ${detailTab === tab ? 'sa__modal-tab--active' : ''}`} onClick={() => setDetailTab(tab)}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="sa__modal-body">
                                {detailTab === 'overview' && (
                                    <>
                                        {/* Health Banner */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: `${healthColor(selectedGym.healthScore)}08`, borderRadius: 14, marginBottom: 20, border: `1px solid ${healthColor(selectedGym.healthScore)}20` }}>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${healthColor(selectedGym.healthScore)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: healthColor(selectedGym.healthScore) }}>
                                                {selectedGym.healthScore}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Health Score</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    {selectedGym.healthScore >= 85 ? 'Excellent — gym is thriving' : selectedGym.healthScore >= 60 ? 'Good — room for improvement' : 'At risk — needs attention'}
                                                </div>
                                            </div>
                                            <span className={`sa__badge sa__badge--${statusColor(selectedGym.status)}`}>{selectedGym.status}</span>
                                        </div>

                                        {/* 6-Stat Grid */}
                                        <div className="sa__modal-stat-grid">
                                            {[
                                                { label: 'Members', value: selectedGym.members, icon: Users, color: '#3b82f6' },
                                                { label: 'Trainers', value: selectedGym.trainers, icon: Zap, color: '#8b5cf6' },
                                                { label: 'Revenue/mo', value: `$${selectedGym.revenue.toLocaleString()}`, icon: DollarSign, color: '#10b981' },
                                                { label: 'Retention', value: `${selectedGym.retentionRate}%`, icon: TrendingUp, color: '#22c55e' },
                                                { label: 'Avg Session', value: selectedGym.avgSessionDuration, icon: Clock, color: '#f59e0b' },
                                                { label: 'Classes/wk', value: selectedGym.classesPerWeek, icon: Calendar, color: '#06b6d4' },
                                            ].map(stat => (
                                                <div key={stat.label} className="sa__modal-stat">
                                                    <div className="sa__modal-stat-label"><stat.icon size={10} style={{ color: stat.color }} />{stat.label}</div>
                                                    <div className="sa__modal-stat-value">{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Two-column: Owner Info + Features */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div>
                                                <div className="sa__modal-section-title">Owner Details</div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Name</span><span className="sa__stat-value">{selectedGym.owner}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Email</span><span className="sa__stat-value" style={{ fontSize: 11 }}>{selectedGym.email}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Equipment</span><span className="sa__stat-value">{selectedGym.equipmentCount} items</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Growth</span><span style={{ fontSize: 12, fontWeight: 600, color: selectedGym.growth >= 0 ? '#22c55e' : '#ef4444' }}>{selectedGym.growth > 0 ? '+' : ''}{selectedGym.growth}%</span></div>
                                            </div>
                                            <div>
                                                <div className="sa__modal-section-title">Active Features ({selectedGym.features.length})</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                    {selectedGym.features.map(f => (
                                                        <span key={f} className="sa__badge sa__badge--blue" style={{ fontSize: 10 }}>{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {detailTab === 'analytics' && (
                                    <>
                                        {/* Two chart columns */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                            <div>
                                                <div className="sa__modal-section-title">Revenue Trend (6mo)</div>
                                                <div style={{ height: 160 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={selectedGym.revenueHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="mRevG" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                            <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#mRevG)" dot={false} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="sa__modal-section-title">Member Growth</div>
                                                <div style={{ height: 160 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={selectedGym.memberGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="mMemG" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                            <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#mMemG)" dot={false} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Peak Hours full width */}
                                        <div className="sa__modal-section-title">Peak Usage Hours</div>
                                        <div style={{ height: 140 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={selectedGym.peakHours} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                    <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                    <Bar dataKey="v" radius={[4, 4, 0, 0]} barSize={28}>
                                                        {selectedGym.peakHours.map((entry, i) => (
                                                            <Cell key={i} fill={entry.v > 70 ? '#ef4444' : entry.v > 40 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.7} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}

                                {detailTab === 'activity' && (
                                    <>
                                        <div className="sa__modal-section-title">Recent Activity</div>
                                        {selectedGym.recentActivity.map((act, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 10, marginBottom: 4 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 5, flexShrink: 0 }} />
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
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><UserCog size={14} /> Impersonate</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setCommsTarget(selectedGym); setShowCommsModal(true); }}><Mail size={14} /> Email Owner</button>
                                {selectedGym.status === 'active' ? (
                                    <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setSuspendGym(selectedGym); setSelectedGym(null); }}><Pause size={14} /> Suspend</button>
                                ) : (
                                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => { setSuspendGym(selectedGym); setSelectedGym(null); }}><Play size={14} /> Activate</button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Add Gym Modal ── */}
                {showAddModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Add New Gym</div><div className="sa__modal-subtitle">Register a new gym on the platform</div></div>
                                <button className="sa__modal-close" onClick={() => setShowAddModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {[{ label: 'Gym Name', placeholder: 'e.g. FitZone Elite', type: 'text' }, { label: 'Owner Name', placeholder: 'e.g. Rahul Sharma', type: 'text' }, { label: 'Owner Email', placeholder: 'e.g. owner@gym.com', type: 'email' }, { label: 'City', placeholder: 'e.g. Mumbai', type: 'text' }].map((f, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                                    </div>
                                ))}
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</label>
                                    <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                                        <option value="starter">Starter</option>
                                        <option value="pro">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowAddModal(false)}><Plus size={14} /> Create Gym</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Suspend / Activate Confirmation ── */}
                {suspendGym && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSuspendGym(null)}>
                        <motion.div className="sa__modal" style={{ width: 480 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: suspendGym.status === 'active' ? 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' : 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">{suspendGym.status === 'active' ? 'Suspend' : 'Activate'} {suspendGym.name}?</div></div>
                                <button className="sa__modal-close" onClick={() => setSuspendGym(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: `rgba(${suspendGym.status === 'active' ? '239,68,68' : '34,197,94'}, 0.06)`, borderRadius: 14, marginBottom: 16, border: `1px solid rgba(${suspendGym.status === 'active' ? '239,68,68' : '34,197,94'}, 0.15)` }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: suspendGym.status === 'active' ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <AlertTriangle size={14} /> {suspendGym.status === 'active' ? 'This will restrict gym access' : 'This will restore gym access'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {suspendGym.status === 'active' ? 'Members and trainers will lose access. Billing will be paused.' : 'Members and trainers will regain access. Billing will resume.'}
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gym</span><span className="sa__stat-value">{suspendGym.name}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Owner</span><span className="sa__stat-value">{suspendGym.owner}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Affected Members</span><span className="sa__stat-value">{suspendGym.members}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Monthly Revenue</span><span className="sa__stat-value">${suspendGym.revenue.toLocaleString()}</span></div>
                                {suspendGym.status === 'active' && (
                                    <div style={{ marginTop: 14 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</label>
                                        <select
                                            value={suspendReason}
                                            onChange={e => setSuspendReason(e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                                        >
                                            <option value="">Select reason...</option>
                                            <option value="payment">Payment Overdue</option>
                                            <option value="violation">Terms Violation</option>
                                            <option value="request">Owner Request</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSuspendGym(null)}>Cancel</button>
                                <button
                                    className={`sa__btn sa__btn--${suspendGym.status === 'active' ? 'danger' : 'primary'} sa__btn--sm`}
                                    onClick={handleConfirmSuspendToggle}
                                    disabled={suspendLoading}
                                >
                                    {suspendLoading ? <RefreshCw size={14} className="spin" /> : (suspendGym.status === 'active' ? <><Pause size={14} /> Suspend</> : <><Play size={14} /> Activate</>)}
                                </button>
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
                                <div><div className="sa__modal-title">Export Gym Data</div></div>
                                <button className="sa__modal-close" onClick={() => setShowExportModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Format</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {['csv', 'pdf', 'json'].map(f => (
                                            <button key={f} className={`sa__btn ${exportFormat === f ? 'sa__btn--primary' : 'sa__btn--ghost'} sa__btn--sm`} onClick={() => setExportFormat(f)} style={{ flex: 1 }}>{f.toUpperCase()}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Include</label>
                                    {['Gym Details', 'Owner Info', 'Financial Data', 'Member Stats', 'Health Scores', 'Activity Log'].map(item => (
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

                {/* ── Communications Modal ── */}
                {showCommsModal && commsTarget && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommsModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Email {commsTarget.owner}</div><div className="sa__modal-subtitle">{commsTarget.email} · {commsTarget.name}</div></div>
                                <button className="sa__modal-close" onClick={() => setShowCommsModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</label>
                                    <input type="text" placeholder="e.g. Important update about your gym" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Template</label>
                                    <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
                                        <option value="">Custom message</option>
                                        <option value="payment">Payment Reminder</option>
                                        <option value="feature">New Feature Announcement</option>
                                        <option value="welcome">Welcome / Onboarding</option>
                                        <option value="maintenance">Maintenance Notice</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
                                    <textarea placeholder="Write your message..." rows={5} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCommsModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCommsModal(false)}><Send size={14} /> Send Email</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SAGyms;
