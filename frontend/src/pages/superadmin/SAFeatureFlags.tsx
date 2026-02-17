import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ToggleRight, X, Plus, AlertTriangle, CheckCircle2,
    Edit3, Trash2, Clock, Building2, Users, Zap,
    Shield, Smartphone, Globe, Calendar, History, Info
} from 'lucide-react';

const MOCK_FLAGS = [
    {
        id: 'dark_mode', name: 'dark-mode', desc: 'Enable dark mode UI for member and trainer dashboards',
        enabled: true, rollout: 100, strategy: 'all', gyms: [] as string[],
        createdBy: 'Creator', createdAt: '2024-06-15', usersAffected: 1958, gymsAffected: 8,
        category: 'UI',
        changelog: [
            { action: 'Enabled for all', by: 'Creator', date: 'Jan 15, 2025' },
            { action: 'Rollout increased to 100%', by: 'Creator', date: 'Jan 10, 2025' },
            { action: 'Created, rollout 50%', by: 'Creator', date: 'Jun 15, 2024' },
        ],
    },
    {
        id: 'ai_workout', name: 'ai-workout-generator', desc: 'AI-powered personalized workout plan generator using GPT-4',
        enabled: true, rollout: 65, strategy: 'percentage', gyms: [] as string[],
        createdBy: 'Creator', createdAt: '2024-11-20', usersAffected: 1270, gymsAffected: 5,
        category: 'AI',
        changelog: [
            { action: 'Rollout increased to 65%', by: 'Creator', date: 'Feb 10, 2025' },
            { action: 'Created at 25%', by: 'Creator', date: 'Nov 20, 2024' },
        ],
    },
    {
        id: 'stripe_v2', name: 'stripe-checkout-v2', desc: 'New Stripe checkout flow with Apple Pay and Google Pay support',
        enabled: true, rollout: 30, strategy: 'gym-whitelist', gyms: ['FitZone Elite', 'IronForge', 'CrossTrain Hub'],
        createdBy: 'Creator', createdAt: '2025-01-08', usersAffected: 1278, gymsAffected: 3,
        category: 'Payments',
        changelog: [
            { action: 'Whitelisted CrossTrain Hub', by: 'Creator', date: 'Feb 5, 2025' },
            { action: 'Whitelisted IronForge', by: 'Creator', date: 'Jan 20, 2025' },
            { action: 'Created for FitZone Elite', by: 'Creator', date: 'Jan 8, 2025' },
        ],
    },
    {
        id: 'social_feed', name: 'social-activity-feed', desc: 'Community feed where members can share workouts, achievements, and photos',
        enabled: false, rollout: 0, strategy: 'disabled', gyms: [] as string[],
        createdBy: 'Creator', createdAt: '2025-02-01', usersAffected: 0, gymsAffected: 0,
        category: 'Social',
        changelog: [
            { action: 'Created (disabled)', by: 'Creator', date: 'Feb 1, 2025' },
        ],
    },
    {
        id: 'push_notif', name: 'push-notifications', desc: 'Browser and mobile push notifications for class reminders and announcements',
        enabled: true, rollout: 80, strategy: 'percentage', gyms: [] as string[],
        createdBy: 'Creator', createdAt: '2024-09-15', usersAffected: 1560, gymsAffected: 7,
        category: 'Notifications',
        changelog: [
            { action: 'Rollout increased to 80%', by: 'Creator', date: 'Feb 1, 2025' },
            { action: 'Created at 40%', by: 'Creator', date: 'Sep 15, 2024' },
        ],
    },
    {
        id: 'member_qr', name: 'qr-code-checkin', desc: 'QR code based member check-in at gym entrance',
        enabled: false, rollout: 0, strategy: 'disabled', gyms: [] as string[],
        createdBy: 'Creator', createdAt: '2025-01-25', usersAffected: 0, gymsAffected: 0,
        category: 'Operations',
        changelog: [
            { action: 'Created (disabled)', by: 'Creator', date: 'Jan 25, 2025' },
        ],
    },
    {
        id: 'analytics_v2', name: 'advanced-analytics', desc: 'Enhanced analytics dashboard with cohort analysis, funnel tracking, and custom reports',
        enabled: true, rollout: 100, strategy: 'all', gyms: [] as string[],
        createdBy: 'Creator', createdAt: '2024-08-01', usersAffected: 1958, gymsAffected: 8,
        category: 'Analytics',
        changelog: [
            { action: 'Enabled for all', by: 'Creator', date: 'Dec 1, 2024' },
            { action: 'Created at 50%', by: 'Creator', date: 'Aug 1, 2024' },
        ],
    },
    {
        id: 'equipment_iot', name: 'iot-equipment-tracking', desc: 'IoT sensor integration for real-time equipment usage tracking and maintenance prediction',
        enabled: true, rollout: 15, strategy: 'gym-whitelist', gyms: ['IronForge'],
        createdBy: 'Creator', createdAt: '2025-02-10', usersAffected: 524, gymsAffected: 1,
        category: 'Hardware',
        changelog: [
            { action: 'Created, IronForge pilot', by: 'Creator', date: 'Feb 10, 2025' },
        ],
    },
];

type Flag = typeof MOCK_FLAGS[0];

const ALL_GYMS = ['FitZone Elite', 'IronForge', 'CrossTrain Hub', 'PowerHouse Gym', 'Muscle Factory', 'Peak Performance', 'FlexFit Studio', 'Zen Fitness'];
const CATEGORIES = ['All', 'UI', 'AI', 'Payments', 'Social', 'Notifications', 'Operations', 'Analytics', 'Hardware'];

const SAFeatureFlags: React.FC = () => {
    const [flags, setFlags] = useState(MOCK_FLAGS);
    const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
    const [showToggleConfirm, setShowToggleConfirm] = useState<{ flag: Flag; newState: boolean } | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Flag | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [detailTab, setDetailTab] = useState<'settings' | 'history'>('settings');

    // Create form state
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCategory, setNewCategory] = useState('UI');
    const [newStrategy, setNewStrategy] = useState('disabled');

    const filteredFlags = categoryFilter === 'All' ? flags : flags.filter(f => f.category === categoryFilter);

    const handleToggle = (flag: Flag) => {
        setShowToggleConfirm({ flag, newState: !flag.enabled });
    };

    const confirmToggle = () => {
        if (!showToggleConfirm) return;
        setFlags(prev => prev.map(f =>
            f.id === showToggleConfirm.flag.id ? {
                ...f,
                enabled: showToggleConfirm.newState,
                rollout: showToggleConfirm.newState ? (f.rollout || 100) : 0,
                strategy: showToggleConfirm.newState ? (f.strategy === 'disabled' ? 'all' : f.strategy) : 'disabled',
            } : f
        ));
        setShowToggleConfirm(null);
    };

    const strategyLabel = (s: string) =>
        s === 'all' ? 'All Users' : s === 'percentage' ? 'Percentage Rollout' : s === 'gym-whitelist' ? 'Gym Whitelist' : 'Disabled';

    const categoryIcon = (c: string) => {
        switch (c) {
            case 'UI': return <Globe size={12} />;
            case 'AI': return <Zap size={12} />;
            case 'Payments': return <Shield size={12} />;
            case 'Notifications': return <Smartphone size={12} />;
            case 'Operations': return <Building2 size={12} />;
            case 'Analytics': return <ToggleRight size={12} />;
            case 'Hardware': return <Zap size={12} />;
            default: return <Info size={12} />;
        }
    };

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Feature Flags</h1>
                    <p>{flags.length} flags · {flags.filter(f => f.enabled).length} enabled · {flags.filter(f => !f.enabled).length} disabled</p>
                </div>
                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCreateModal(true)}><Plus size={14} /> Create Flag</button>
            </header>

            {/* Category Filter */}
            <div className="sa__toolbar">
                {CATEGORIES.map(c => (
                    <button key={c} className={`sa__filter ${categoryFilter === c ? 'sa__filter--active' : ''}`} onClick={() => setCategoryFilter(c)}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Flag Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredFlags.map((flag, i) => (
                    <motion.div
                        key={flag.id}
                        className="sa__flag-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                    >
                        <div className="sa__flag-head">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {categoryIcon(flag.category)} {flag.category}
                            </div>
                            <div style={{ flex: 1 }} />
                            {/* Impact Badge */}
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 8 }}>
                                <Users size={10} style={{ marginRight: 2 }} />{flag.usersAffected.toLocaleString()} users · {flag.gymsAffected} gyms
                            </span>
                            <label className="sa__toggle" onClick={e => { e.stopPropagation(); handleToggle(flag); }}>
                                <input type="checkbox" checked={flag.enabled} readOnly />
                                <span className="sa__toggle-track" />
                                <span className="sa__toggle-thumb" />
                            </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, cursor: 'pointer' }} onClick={() => { setSelectedFlag(flag); setDetailTab('settings'); }}>
                            <div className="sa__flag-name">{flag.name}</div>
                        </div>
                        <div className="sa__flag-desc">{flag.desc}</div>
                        <div className="sa__flag-footer">
                            <div className="sa__flag-progress" style={{ flex: 1 }}>
                                <div className="sa__flag-rollout">Rollout: {flag.rollout}% · Strategy: {strategyLabel(flag.strategy)}</div>
                                <div className="sa__progress">
                                    <div className="sa__progress-fill" style={{ width: `${flag.rollout}%`, background: flag.enabled ? '#22c55e' : 'var(--bg-active)' }} />
                                </div>
                            </div>
                            {flag.gyms.length > 0 && (
                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    {flag.gyms.map(g => <span key={g} className="sa__badge sa__badge--blue" style={{ fontSize: 9 }}>{g}</span>)}
                                </div>
                            )}
                            <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setSelectedFlag(flag); setDetailTab('settings'); }}>
                                <Edit3 size={12} /> Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Toggle Confirmation Modal ── */}
                {showToggleConfirm && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowToggleConfirm(null)}>
                        <motion.div className="sa__modal" style={{ width: 480 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: showToggleConfirm.newState ? 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' : 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' }} />
                                <div className="sa__modal-title">{showToggleConfirm.newState ? 'Enable' : 'Disable'} Feature Flag</div>
                                <button className="sa__modal-close" onClick={() => setShowToggleConfirm(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: showToggleConfirm.newState ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', borderRadius: 14, marginBottom: 16, border: `1px solid ${showToggleConfirm.newState ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                        {showToggleConfirm.newState ? 'Enable' : 'Disable'} <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{showToggleConfirm.flag.name}</code>?
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{showToggleConfirm.flag.desc}</div>
                                </div>

                                <div className="sa__modal-section-title">Impact</div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Users Affected</span><span className="sa__stat-value">{showToggleConfirm.flag.usersAffected.toLocaleString()}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gyms Affected</span><span className="sa__stat-value">{showToggleConfirm.flag.gymsAffected}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Current Rollout</span><span className="sa__stat-value">{showToggleConfirm.flag.rollout}%</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Strategy</span><span className="sa__stat-value">{strategyLabel(showToggleConfirm.flag.strategy)}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowToggleConfirm(null)}>Cancel</button>
                                <button className={`sa__btn ${showToggleConfirm.newState ? 'sa__btn--primary' : 'sa__btn--danger'} sa__btn--sm`} onClick={confirmToggle}>
                                    {showToggleConfirm.newState ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                    {showToggleConfirm.newState ? 'Enable Flag' : 'Disable Flag'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Flag Detail/Edit Modal ── */}
                {selectedFlag && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFlag(null)}>
                        <motion.div className="sa__modal sa__modal--wide" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedFlag.enabled ? 'rgba(34,197,94,0.15)' : 'rgba(161,161,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ToggleRight size={16} style={{ color: selectedFlag.enabled ? '#22c55e' : '#a1a1aa' }} />
                                        </div>
                                        <div>
                                            <div className="sa__modal-title">{selectedFlag.name}</div>
                                            <div className="sa__modal-subtitle">
                                                <span className={`sa__badge sa__badge--${selectedFlag.enabled ? 'green' : 'gray'}`}>{selectedFlag.enabled ? 'Enabled' : 'Disabled'}</span>{' '}
                                                · {selectedFlag.category} · Created {selectedFlag.createdAt}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedFlag(null)}><X size={16} /></button>
                            </div>

                            {/* Tabs */}
                            <div className="sa__modal-tabs">
                                {(['settings', 'history'] as const).map(tab => (
                                    <button key={tab} className={`sa__modal-tab ${detailTab === tab ? 'sa__modal-tab--active' : ''}`} onClick={() => setDetailTab(tab)}>
                                        {tab === 'settings' ? 'Settings' : 'Change History'}
                                    </button>
                                ))}
                            </div>

                            <div className="sa__modal-body">
                                {detailTab === 'settings' && (
                                    <>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>{selectedFlag.desc}</div>

                                        <div className="sa__modal-stat-grid">
                                            <div className="sa__modal-stat">
                                                <div className="sa__modal-stat-label"><Users size={10} />Users Affected</div>
                                                <div className="sa__modal-stat-value">{selectedFlag.usersAffected.toLocaleString()}</div>
                                            </div>
                                            <div className="sa__modal-stat">
                                                <div className="sa__modal-stat-label"><Building2 size={10} />Gyms Affected</div>
                                                <div className="sa__modal-stat-value">{selectedFlag.gymsAffected}</div>
                                            </div>
                                            <div className="sa__modal-stat">
                                                <div className="sa__modal-stat-label"><Zap size={10} />Rollout</div>
                                                <div className="sa__modal-stat-value">{selectedFlag.rollout}%</div>
                                            </div>
                                        </div>

                                        {/* Rollout Slider */}
                                        <div style={{ marginBottom: 20 }}>
                                            <div className="sa__modal-section-title">Rollout Percentage</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <input
                                                    type="range" min={0} max={100} value={selectedFlag.rollout}
                                                    onChange={() => { }}
                                                    style={{ flex: 1, accentColor: '#3b82f6' }}
                                                />
                                                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', minWidth: 40, textAlign: 'right' }}>{selectedFlag.rollout}%</span>
                                            </div>
                                        </div>

                                        {/* Strategy */}
                                        <div style={{ marginBottom: 20 }}>
                                            <div className="sa__modal-section-title">Rollout Strategy</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {[
                                                    { value: 'all', label: 'All Users', icon: Globe },
                                                    { value: 'percentage', label: 'Percentage', icon: Users },
                                                    { value: 'gym-whitelist', label: 'Gym Whitelist', icon: Building2 },
                                                    { value: 'disabled', label: 'Disabled', icon: Shield },
                                                ].map(s => (
                                                    <button
                                                        key={s.value}
                                                        className={`sa__btn ${selectedFlag.strategy === s.value ? 'sa__btn--primary' : 'sa__btn--ghost'} sa__btn--sm`}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <s.icon size={12} /> {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Gym whitelist */}
                                        {selectedFlag.strategy === 'gym-whitelist' && (
                                            <div>
                                                <div className="sa__modal-section-title">Whitelisted Gyms ({selectedFlag.gyms.length})</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {ALL_GYMS.map(g => {
                                                        const isSelected = selectedFlag.gyms.includes(g);
                                                        return (
                                                            <button key={g} className={`sa__btn ${isSelected ? 'sa__btn--primary' : 'sa__btn--ghost'} sa__btn--sm`}>
                                                                <Building2 size={10} /> {g}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {detailTab === 'history' && (
                                    <>
                                        <div className="sa__modal-section-title">Change History</div>
                                        {selectedFlag.changelog.map((entry, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 10, marginBottom: 4 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 5, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{entry.action}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>by {entry.by}</div>
                                                </div>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>{entry.date}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSelectedFlag(null)}>Close</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setShowDeleteConfirm(selectedFlag); setSelectedFlag(null); }}><Trash2 size={14} /> Delete</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setSelectedFlag(null)}><CheckCircle2 size={14} /> Save Changes</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Create Flag Modal ── */}
                {showCreateModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)}>
                        <motion.div className="sa__modal" style={{ width: 540 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Create Feature Flag</div><div className="sa__modal-subtitle">Define a new flag for your platform</div></div>
                                <button className="sa__modal-close" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flag Name</label>
                                    <input
                                        type="text" value={newName} onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. my-new-feature"
                                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                    <textarea
                                        value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                        placeholder="What does this feature do?"
                                        rows={3}
                                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                                        <select
                                            value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                                        >
                                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Initial Strategy</label>
                                        <select
                                            value={newStrategy} onChange={e => setNewStrategy(e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                                        >
                                            <option value="disabled">Disabled (create only)</option>
                                            <option value="all">All Users</option>
                                            <option value="percentage">Percentage Rollout</option>
                                            <option value="gym-whitelist">Gym Whitelist</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCreateModal(false)}><Plus size={14} /> Create Flag</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Delete Confirmation Modal ── */}
                {showDeleteConfirm && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(null)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">Delete Feature Flag</div></div>
                                <button className="sa__modal-close" onClick={() => setShowDeleteConfirm(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.06)', borderRadius: 14, marginBottom: 16, border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <AlertTriangle size={14} /> This action is irreversible
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        Deleting <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{showDeleteConfirm.name}</code> will permanently remove this flag and may cause features to break.
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Currently Enabled</span><span className="sa__stat-value">{showDeleteConfirm.enabled ? 'Yes' : 'No'}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Users Depending</span><span className="sa__stat-value">{showDeleteConfirm.usersAffected.toLocaleString()}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gyms Depending</span><span className="sa__stat-value">{showDeleteConfirm.gymsAffected}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => {
                                    setFlags(prev => prev.filter(f => f.id !== showDeleteConfirm.id));
                                    setShowDeleteConfirm(null);
                                }}><Trash2 size={14} /> Delete Forever</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default SAFeatureFlags;
