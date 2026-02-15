import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './utility-pages.css';

const HEALTH_CHECK_INTERVAL = 15_000; // Check every 15s
const HEALTH_CHECK_TIMEOUT = 5_000;   // 5s timeout
const FAIL_THRESHOLD = 2;             // 2 consecutive failures before showing

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const ServerOfflinePage = () => (
    <div className="util-page">
        <div className="util-particles">
            {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="util-particle" style={{
                    left: `${Math.random() * 100}%`,
                    width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                    animationDelay: `${Math.random() * 6}s`,
                    animationDuration: `${7 + Math.random() * 6}s`,
                    background: 'rgba(239, 68, 68, 0.06)',
                }} />
            ))}
        </div>

        <motion.div
            className="util-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="util-icon util-icon--red">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
            </div>

            <h1 className="util-title">Server Unavailable</h1>
            <p className="util-desc">
                We can't reach our servers right now. This could be due to maintenance,
                network issues, or a temporary outage. We're working to restore service.
            </p>

            {/* Live status indicator */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                justifyContent: 'center', marginBottom: 28,
                padding: '10px 20px', borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.12)',
                fontSize: 13, color: 'rgba(255,255,255,0.6)',
            }}>
                <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                    animation: 'util-pulse-anim 2s ease-in-out infinite',
                }} />
                Attempting to reconnect automatically...
            </div>

            <div className="util-terminal">
                <div><span className="util-terminal__error">× CONNECTION_REFUSED</span></div>
                <div style={{ color: 'rgba(255,255,255,0.35)' }}>Unable to reach {BASE_URL}</div>
                <div><span className="util-terminal__warn">↻</span> Auto-retry every 15 seconds</div>
                <div><span className="util-terminal__info">ℹ</span> Page will reload automatically when server is back</div>
            </div>

            <div className="util-actions">
                <button className="util-btn util-btn--danger" onClick={() => window.location.reload()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                    Retry Now
                </button>
                <button className="util-btn util-btn--ghost" onClick={() => window.open('https://status.example.com', '_blank')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    Status Page
                </button>
            </div>

            <div className="util-info">
                <div className="util-info-card">
                    <div className="util-info-card__label">Server</div>
                    <div className="util-info-card__value" style={{ color: '#ef4444', fontSize: 12 }}>Offline</div>
                </div>
                <div className="util-info-card">
                    <div className="util-info-card__label">Last Check</div>
                    <div className="util-info-card__value" style={{ fontSize: 12 }}>{new Date().toLocaleTimeString()}</div>
                </div>
                <div className="util-info-card">
                    <div className="util-info-card__label">Retry</div>
                    <div className="util-info-card__value" style={{ fontSize: 12 }}>Auto (15s)</div>
                </div>
            </div>
        </motion.div>

        <div className="util-footer">
            If this persists, contact <a href="/contact">support</a>
        </div>
    </div>
);

/**
 * Wraps the app and shows the ServerOfflinePage overlay
 * when the backend API is unreachable.
 */
export const ServerHealthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOffline, setIsOffline] = useState(false);
    const [failCount, setFailCount] = useState(0);

    const checkHealth = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

            const response = await fetch(`${BASE_URL}/auth/health-check`, {
                method: 'GET',
                signal: controller.signal,
                cache: 'no-store',
            }).catch(() => null);

            clearTimeout(timeout);

            if (response && response.ok) {
                // Server is back
                if (isOffline) {
                    setIsOffline(false);
                    setFailCount(0);
                } else {
                    setFailCount(0);
                }
            } else {
                setFailCount(prev => {
                    const next = prev + 1;
                    if (next >= FAIL_THRESHOLD) setIsOffline(true);
                    return next;
                });
            }
        } catch {
            setFailCount(prev => {
                const next = prev + 1;
                if (next >= FAIL_THRESHOLD) setIsOffline(true);
                return next;
            });
        }
    }, [isOffline]);

    useEffect(() => {
        // Initial check
        checkHealth();

        // Periodic checks
        const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [checkHealth]);

    // Browser online/offline events
    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => checkHealth();

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [checkHealth]);

    return (
        <>
            {children}
            <AnimatePresence>
                {isOffline && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
                    >
                        <ServerOfflinePage />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ServerOfflinePage;
