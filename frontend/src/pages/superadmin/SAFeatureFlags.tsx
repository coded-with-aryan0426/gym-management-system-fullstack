import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ToggleRight, X, Plus, AlertTriangle, CheckCircle2,
    Edit3, Trash2, Clock, Building2, Users, Zap,
    Shield, Smartphone, Globe, Calendar, History, Info, RefreshCw
} from 'lucide-react';
import { superAdminApi, SuperAdminFeatureFlag } from '../../services/superAdminApi';
import { ToggleSwitch } from '../../components/superadmin/shared/ToggleSwitch';
import { PercentageRolloutSlider, RolloutStrategy } from '../../components/superadmin/shared/PercentageRolloutSlider';
import { CriticalFlagConfirmModal } from '../../components/superadmin/shared/CriticalFlagConfirmModal';
import { ImpactCounter } from '../../components/superadmin/shared/ImpactCounter';

type Flag = SuperAdminFeatureFlag & {
    id?: string;
    desc?: string;
    rollout?: number;
    strategy?: string;
    gyms?: string[];
    createdBy?: string;
    createdAt?: string;
    usersAffected?: number;
    gymsAffected?: number;
    category?: string;
    changelog?: { action: string; by: string; date: string }[];
};

const ALL_GYMS = ['FitZone Elite', 'IronForge', 'CrossTrain Hub', 'PowerHouse Gym', 'Muscle Factory', 'Peak Performance', 'FlexFit Studio', 'Zen Fitness'];
const CATEGORIES = ['All', 'UI', 'AI', 'Payments', 'Social', 'Notifications', 'Operations', 'Analytics', 'Hardware'];

const SAFeatureFlags: React.FC = () => {
    const [flags, setFlags] = useState<Flag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        loadFlags();
    }, []);

    const loadFlags = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await superAdminApi.getFeatureFlags();
            const mappedFlags: Flag[] = data
              .filter(f => f.key !== 'feedback_widget')
              .map(f => ({
                ...f,
                id: f.key,
                desc: f.description,
                rollout: f.rolloutPercentage,
                strategy: f.enabled ? (f.rolloutPercentage === 100 ? 'all' : 'percentage') : 'disabled',
                gyms: [],
                createdBy: 'System',
                createdAt: new Date(f.updatedAt).toLocaleDateString(),
                usersAffected: 0,
                gymsAffected: 0,
                category: f.critical ? 'Critical' : 'Feature',
                changelog: [],
            }));
            setFlags(mappedFlags);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load feature flags');
            console.error('Failed to load feature flags:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFlags = categoryFilter === 'All' ? flags : flags.filter(f => f.category === categoryFilter);

    const handleToggle = (flag: Flag) => {
        setShowToggleConfirm({ flag, newState: !flag.enabled });
    };

    const confirmToggle = async () => {
        if (!showToggleConfirm) return;
        const { flag, newState } = showToggleConfirm;
        
        // Optimistic update
        setFlags(prev => prev.map(f =>
            f.key === flag.key ? {
                ...f,
                enabled: newState,
                rollout: newState ? (f.rollout || 100) : 0,
                strategy: newState ? (f.strategy === 'disabled' ? 'all' : f.strategy) : 'disabled',
            } : f
        ));
        setShowToggleConfirm(null);

        try {
            await superAdminApi.updateFeatureFlag(flag.key, { 
                enabled: newState,
                rolloutPercentage: newState ? (flag.rolloutPercentage || 100) : 0
            });
        } catch (err: any) {
            console.error('Failed to update feature flag:', err);
            setError(err.response?.data?.message || err.message || 'Failed to update feature flag');
            // Revert on error
            loadFlags();
        }
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
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="sa__btn sa__btn--primary sa__btn--sm"
                        style={{ background: '#22c55e', minWidth: 160 }}
                        onClick={() => {
                            const fbFlag = flags.find(f => f.key === 'feedback_widget');
                            if (fbFlag) {
                                setShowToggleConfirm({ flag: fbFlag, newState: !fbFlag.enabled });
                            } else {
                                alert('feedback_widget flag not found! Restart backend.');
                            }
                        }}
                    >
                        🧪 Toggle Feedback Widget
                    </button>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={loadFlags} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
                    </button>
                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCreateModal(true)}><Plus size={14} /> Create Flag</button>
                </div>
            </header>

            {/* Loading State */}
            {loading && flags.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={32} className="spinning" style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Loading feature flags...</div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.06)', borderRadius: 14, marginBottom: 16, border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 2 }}>Error loading feature flags</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</div>
                    </div>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={loadFlags}>
                        <RefreshCw size={12} /> Retry
                    </button>
                </div>
            )}

            {/* Category Filter */}
            <div className="sa__toolbar">
                {CATEGORIES.map(c => (
                    <button key={c} className={`sa__filter ${categoryFilter === c ? 'sa__filter--active' : ''}`} onClick={() => setCategoryFilter(c)}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Flag Cards */}
            {!loading && flags.length > 0 && (
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
                                {categoryIcon(flag.category || 'Feature')} {flag.category || 'Feature'}
                            </div>
                            <div style={{ flex: 1 }} />
                            {/* Critical Badge */}
                            {flag.critical && (
                                <span className="sa__badge sa__badge--red" style={{ fontSize: 9, marginRight: 8 }}>CRITICAL</span>
                            )}
                            <ToggleSwitch
                                checked={flag.enabled}
                                onChange={() => handleToggle(flag)}
                                size="sm"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, cursor: 'pointer' }} onClick={() => { setSelectedFlag(flag); setDetailTab('settings'); }}>
                            <div className="sa__flag-name">{flag.name}</div>
                        </div>
                        <div className="sa__flag-desc">{flag.description || flag.desc}</div>
                        <div className="sa__flag-footer">
                            <div className="sa__flag-progress" style={{ flex: 1 }}>
                                <div className="sa__flag-rollout">Rollout: {flag.rolloutPercentage}% · Strategy: {strategyLabel(flag.strategy || 'disabled')}</div>
                                <div className="sa__progress">
                                    <div className="sa__progress-fill" style={{ width: `${flag.rolloutPercentage}%`, background: flag.enabled ? '#22c55e' : 'var(--bg-active)' }} />
                                </div>
                            </div>
                            {flag.gyms && flag.gyms.length > 0 && (
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
            )}

            {/* Empty State */}
            {!loading && flags.length === 0 && !error && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <ToggleRight size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No feature flags found</div>
                    <div style={{ fontSize: 13, marginBottom: 20 }}>Create your first feature flag to get started</div>
                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCreateModal(true)}>
                        <Plus size={14} /> Create Flag
                    </button>
                </div>
            )}

            {/* ═══════════ MODALS ═══════════ */}
            <AnimatePresence>

                {/* ── Critical Flag Confirmation Modal ── */}
                {showToggleConfirm && showToggleConfirm.flag.critical && (
                    <CriticalFlagConfirmModal
                        isOpen={true}
                        onClose={() => setShowToggleConfirm(null)}
                        onConfirm={confirmToggle}
                        flagName={showToggleConfirm.flag.name}
                        flagKey={showToggleConfirm.flag.key}
                        newState={showToggleConfirm.newState}
                    />
                )}

                {/* ── Standard Toggle Confirmation Modal ── */}
                {showToggleConfirm && !showToggleConfirm.flag.critical && (
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
                                <div className="sa__stat-row"><span className="sa__stat-label">Users Affected</span><span className="sa__stat-value">{(showToggleConfirm.flag.usersAffected ?? 0).toLocaleString()}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gyms Affected</span><span className="sa__stat-value">{showToggleConfirm.flag.gymsAffected ?? 0}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Current Rollout</span><span className="sa__stat-value">{showToggleConfirm.flag.rollout ?? 0}%</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Strategy</span><span className="sa__stat-value">{strategyLabel(showToggleConfirm.flag.strategy || 'disabled')}</span></div>
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
                                                {selectedFlag.critical && <span className="sa__badge sa__badge--red">CRITICAL</span>}{' '}
                                                · Updated {new Date(selectedFlag.updatedAt).toLocaleDateString()}
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
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>{selectedFlag.description || selectedFlag.desc}</div>

                                        <div className="sa__modal-stat-grid">
                                            <div className="sa__modal-stat">
                                                <div className="sa__modal-stat-label"><Zap size={10} />Rollout</div>
                                                <div className="sa__modal-stat-value">{selectedFlag.rolloutPercentage}%</div>
                                            </div>
                                            <div className="sa__modal-stat">
                                                <div className="sa__modal-stat-label"><Shield size={10} />Critical</div>
                                                <div className="sa__modal-stat-value">{selectedFlag.critical ? 'Yes' : 'No'}</div>
                                            </div>
                                            <div className="sa__modal-stat">
                                                <div className="sa__modal-stat-label"><Clock size={10} />Updated</div>
                                                <div className="sa__modal-stat-value">{new Date(selectedFlag.updatedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        {/* Impact Counter */}
                                        <div style={{ marginBottom: 20 }}>
                                            <ImpactCounter
                                                usersAffected={selectedFlag.usersAffected ?? 0}
                                                gymsAffected={selectedFlag.gymsAffected ?? 0}
                                                totalUsers={50000}
                                                totalGyms={500}
                                            />
                                        </div>

                                        {/* Rollout Slider */}
                                        <div style={{ marginBottom: 20 }}>
                                            <PercentageRolloutSlider
                                                value={selectedFlag.rolloutPercentage}
                                                onChange={(value) => {
                                                    setFlags(prev => prev.map(f =>
                                                        f.key === selectedFlag.key
                                                            ? { ...f, rolloutPercentage: value }
                                                            : f
                                                    ));
                                                    setSelectedFlag(prev => prev ? { ...prev, rolloutPercentage: value } : null);
                                                }}
                                                strategy={(selectedFlag.strategy || 'disabled') as RolloutStrategy}
                                                onStrategyChange={(strategy) => {
                                                    const strategyMap: Record<RolloutStrategy, string> = {
                                                        'global': 'all',
                                                        'percentage': 'percentage',
                                                        'gym-specific': 'gym-whitelist',
                                                        'admin-only': 'admin-only'
                                                    };
                                                    setFlags(prev => prev.map(f =>
                                                        f.key === selectedFlag.key
                                                            ? { ...f, strategy: strategyMap[strategy] }
                                                            : f
                                                    ));
                                                    setSelectedFlag(prev => prev ? { ...prev, strategy: strategyMap[strategy] } : null);
                                                }}
                                                totalUsers={50000}
                                                totalGyms={500}
                                            />
                                        </div>

                                        {/* Gym whitelist */}
                                        {selectedFlag.strategy === 'gym-whitelist' && (
                                            <div>
                                                <div className="sa__modal-section-title">Whitelisted Gyms ({(selectedFlag.gyms ?? []).length})</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {ALL_GYMS.map(g => {
                                                        const isSelected = (selectedFlag.gyms ?? []).includes(g);
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
                                        {selectedFlag.changelog && selectedFlag.changelog.length > 0 ? (
                                            selectedFlag.changelog.map((entry, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 10, marginBottom: 4 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 5, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{entry.action}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>by {entry.by}</div>
                                                    </div>
                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>{entry.date}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                                <History size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                                                <div style={{ fontSize: 13 }}>No change history available</div>
                                            </div>
                                        )}
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
                                <div className="sa__stat-row"><span className="sa__stat-label">Rollout Percentage</span><span className="sa__stat-value">{showDeleteConfirm.rolloutPercentage}%</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Critical Flag</span><span className="sa__stat-value">{showDeleteConfirm.critical ? 'Yes' : 'No'}</span></div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                                <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => {
                                    setFlags(prev => prev.filter(f => f.key !== showDeleteConfirm.key));
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
