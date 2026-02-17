import { motion } from 'framer-motion';
import './utility-pages.css';

const ServerErrorPage = ({ error, onRetry }: { error?: string; onRetry?: () => void }) => {
    return (
        <div className="util-page">
            <div className="util-particles">
                {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} className="util-particle" style={{
                        left: `${Math.random() * 100}%`,
                        width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                        animationDelay: `${Math.random() * 6}s`,
                        animationDuration: `${7 + Math.random() * 6}s`,
                        background: 'rgba(239, 68, 68, 0.1)',
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
                        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <div className="util-code" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(239,68,68,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>500</div>
                <h1 className="util-title">Something Went Wrong</h1>
                <p className="util-desc">
                    Our servers ran into an unexpected problem. The engineering team has been
                    automatically notified. Please try again in a moment.
                </p>

                {error && (
                    <div className="util-terminal">
                        <div><span className="util-terminal__error">× INTERNAL SERVER ERROR</span></div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', wordBreak: 'break-all' }}>{error}</div>
                        <div><span className="util-terminal__warn">↻</span> Auto-retry in 30 seconds...</div>
                    </div>
                )}

                <div className="util-actions">
                    <button className="util-btn util-btn--danger" onClick={onRetry || (() => window.location.reload())}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                        Try Again
                    </button>
                    <button className="util-btn util-btn--ghost" onClick={() => window.location.href = '/'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Go Home
                    </button>
                </div>

                <div className="util-info">
                    <div className="util-info-card">
                        <div className="util-info-card__label">Error ID</div>
                        <div className="util-info-card__value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Time</div>
                        <div className="util-info-card__value" style={{ fontSize: 12 }}>{new Date().toLocaleTimeString()}</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Status</div>
                        <div className="util-info-card__value" style={{ color: '#f59e0b', fontSize: 12 }}>Investigating</div>
                    </div>
                </div>
            </motion.div>

            <div className="util-footer">
                If this persists, contact <a href="/contact">support</a>
            </div>
        </div>
    );
};

export default ServerErrorPage;
