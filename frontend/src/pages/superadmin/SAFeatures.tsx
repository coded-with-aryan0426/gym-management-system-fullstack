import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle2, RefreshCw, ToggleRight, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFeatureContext } from '../../contexts/FeatureContext';
import api from '../../services/api';
import type { FeatureFlag } from '../../types/feature.types';
import FeatureToggle from '../../components/superadmin/FeatureToggle';

const SAFeatures: React.FC = () => {
    const { refetchFeatures } = useFeatureContext();
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [confirmToggle, setConfirmToggle] = useState<{ flag: FeatureFlag; newState: boolean } | null>(null);

    const loadFlags = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAllFeatures();
            setFlags(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load feature flags';
            setError(msg);
            console.error('Failed to load feature flags:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFlags();
    }, [loadFlags]);

    const handleToggle = (key: string, enabled: boolean) => {
        const flag = flags.find((f) => f.featureKey === key);
        if (!flag) return;
        setConfirmToggle({ flag, newState: enabled });
    };

    const confirmAndToggle = async () => {
        if (!confirmToggle) return;
        const { flag, newState } = confirmToggle;
        setConfirmToggle(null);
        setUpdating(flag.featureKey);

        // Optimistic update
        setFlags((prev) =>
            prev.map((f) => (f.featureKey === flag.featureKey ? { ...f, enabled: newState } : f))
        );

        try {
            await api.updateFeature(flag.featureKey, { enabled: newState });
            await refetchFeatures();
            toast.success(`Feature "${flag.featureKey}" ${newState ? 'enabled' : 'disabled'}`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update feature';
            toast.error(msg);
            // Revert on error
            setFlags((prev) =>
                prev.map((f) => (f.featureKey === flag.featureKey ? { ...f, enabled: !newState } : f))
            );
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Feature Toggles</h1>
                    <p>
                        {flags.length} flags · {flags.filter((f) => f.enabled).length} enabled ·{' '}
                        {flags.filter((f) => !f.enabled).length} disabled
                    </p>
                </div>
                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={loadFlags} disabled={loading}>
                    <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
                </button>
            </header>

            {/* Error Banner */}
            {error && (
                <div
                    style={{
                        padding: '14px 18px',
                        background: 'rgba(239,68,68,0.06)',
                        borderRadius: 14,
                        marginBottom: 16,
                        border: '1px solid rgba(239,68,68,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 2 }}>
                            Error loading feature flags
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</div>
                    </div>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={loadFlags}>
                        <RefreshCw size={12} /> Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && flags.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={32} className="spinning" style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Loading feature flags...</div>
                </div>
            )}

            {/* Flag List */}
            {!loading && flags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {flags.map((flag, i) => (
                        <motion.div
                            key={flag.featureKey}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <FeatureToggle
                                feature={flag}
                                onToggle={handleToggle}
                                isUpdating={updating === flag.featureKey}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && flags.length === 0 && !error && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <ToggleRight size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No feature flags found</div>
                    <div style={{ fontSize: 13 }}>
                        Feature flags are managed via the backend database. Seed initial flags to get started.
                    </div>
                </div>
            )}

            {/* Toggle Confirmation Modal */}
            <AnimatePresence>
                {confirmToggle && (
                    <motion.div
                        className="sa__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmToggle(null)}
                    >
                        <motion.div
                            className="sa__modal"
                            style={{ width: 460 }}
                            initial={{ opacity: 0, scale: 0.92, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 30 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sa__modal-header">
                                <div
                                    className="sa__modal-header-banner"
                                    style={{
                                        background: confirmToggle.newState
                                            ? 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)'
                                            : 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)',
                                    }}
                                />
                                <div className="sa__modal-title">
                                    {confirmToggle.newState ? 'Enable' : 'Disable'} Feature Flag
                                </div>
                                <button className="sa__modal-close" onClick={() => setConfirmToggle(null)}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="sa__modal-body">
                                <div
                                    style={{
                                        padding: '14px 18px',
                                        background: confirmToggle.newState
                                            ? 'rgba(34,197,94,0.06)'
                                            : 'rgba(245,158,11,0.06)',
                                        borderRadius: 14,
                                        marginBottom: 16,
                                        border: `1px solid ${confirmToggle.newState ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}`,
                                    }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                        {confirmToggle.newState ? 'Enable' : 'Disable'}{' '}
                                        <code
                                            style={{
                                                fontFamily: 'monospace',
                                                background: 'rgba(255,255,255,0.06)',
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                            }}
                                        >
                                            {confirmToggle.flag.featureKey}
                                        </code>
                                        ?
                                    </div>
                                    {confirmToggle.flag.description && (
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {confirmToggle.flag.description}
                                        </div>
                                    )}
                                </div>
                                <div className="sa__stat-row">
                                    <span className="sa__stat-label">Allowed Roles</span>
                                    <span className="sa__stat-value">
                                        {confirmToggle.flag.allowedRoles || 'All'}
                                    </span>
                                </div>
                                <div className="sa__stat-row">
                                    <span className="sa__stat-label">Current Status</span>
                                    <span className="sa__stat-value">
                                        {confirmToggle.flag.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button
                                    className="sa__btn sa__btn--ghost sa__btn--sm"
                                    onClick={() => setConfirmToggle(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`sa__btn ${confirmToggle.newState ? 'sa__btn--primary' : 'sa__btn--danger'} sa__btn--sm`}
                                    onClick={confirmAndToggle}
                                >
                                    {confirmToggle.newState ? (
                                        <CheckCircle2 size={14} />
                                    ) : (
                                        <AlertTriangle size={14} />
                                    )}
                                    {confirmToggle.newState ? 'Enable Flag' : 'Disable Flag'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SAFeatures;
