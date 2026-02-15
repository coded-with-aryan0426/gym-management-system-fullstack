import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './utility-pages.css';

const SessionExpiredPage = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="util-page">
            <div className="util-particles">
                {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="util-particle" style={{
                        left: `${Math.random() * 100}%`,
                        width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${7 + Math.random() * 5}s`,
                        background: 'rgba(139, 92, 246, 0.08)',
                    }} />
                ))}
            </div>

            <motion.div
                className="util-content"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="util-icon util-icon--violet">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>

                <h1 className="util-title">Session Expired</h1>
                <p className="util-desc">
                    Your session has timed out for security reasons.
                    Please sign in again to continue where you left off.
                </p>

                <div className="util-terminal" style={{ borderColor: 'rgba(139, 92, 246, 0.12)' }}>
                    <div><span className="util-terminal__warn">⚠ SESSION_TIMEOUT</span></div>
                    <div style={{ color: 'rgba(255,255,255,0.35)' }}>Token expired at {new Date().toLocaleTimeString()}</div>
                    <div><span className="util-terminal__info">→</span> Please re-authenticate to continue</div>
                </div>

                <div className="util-actions">
                    <button className="util-btn util-btn--primary" onClick={handleLogin}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                        Sign In Again
                    </button>
                    <button className="util-btn util-btn--ghost" onClick={() => navigate('/')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Go Home
                    </button>
                </div>

                <div className="util-info">
                    <div className="util-info-card">
                        <div className="util-info-card__label">Session</div>
                        <div className="util-info-card__value" style={{ color: '#ef4444', fontSize: 12 }}>Expired</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Timeout</div>
                        <div className="util-info-card__value" style={{ fontSize: 12 }}>30 min</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Security</div>
                        <div className="util-info-card__value" style={{ color: '#22c55e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="util-pulse" style={{ width: 6, height: 6 }} /> Active
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="util-footer">
                Your data is safe. <a href="/privacy">Privacy Policy</a>
            </div>
        </div>
    );
};

export default SessionExpiredPage;
