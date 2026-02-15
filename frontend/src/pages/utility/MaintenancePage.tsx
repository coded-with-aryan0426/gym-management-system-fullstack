import { motion } from 'framer-motion';
import './utility-pages.css';

const MaintenancePage = () => {
    return (
        <div className="util-page">
            <div className="util-particles">
                {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="util-particle" style={{
                        left: `${Math.random() * 100}%`,
                        width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                        animationDelay: `${Math.random() * 6}s`,
                        animationDuration: `${8 + Math.random() * 6}s`,
                        background: 'rgba(245, 158, 11, 0.08)',
                    }} />
                ))}
            </div>

            <motion.div
                className="util-content"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="util-icon util-icon--amber">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                </div>

                <h1 className="util-title">Under Maintenance</h1>
                <p className="util-desc">
                    We're performing scheduled maintenance to improve your experience.
                    Everything will be back to normal shortly.
                </p>

                {/* Progress indicator */}
                <div className="util-progress">
                    <div className="util-progress__bar" style={{ background: 'linear-gradient(90deg, #f59e0b, #eab308)' }} />
                </div>

                {/* Status checklist */}
                <div style={{ textAlign: 'left', maxWidth: 320, margin: '20px auto 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { label: 'Database migration', status: 'done' },
                        { label: 'API server upgrade', status: 'progress' },
                        { label: 'Cache rebuild', status: 'pending' },
                        { label: 'Health checks', status: 'pending' },
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}
                        >
                            {step.status === 'done' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : step.status === 'progress' ? (
                                <div className="util-pulse" style={{ background: '#f59e0b', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'util-pulse-anim 1.5s ease-in-out infinite' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                                </div>
                            ) : (
                                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)' }} />
                            )}
                            <span style={{ color: step.status === 'done' ? 'rgba(255,255,255,0.4)' : step.status === 'progress' ? '#f59e0b' : 'rgba(255,255,255,0.3)', textDecoration: step.status === 'done' ? 'line-through' : 'none' }}>
                                {step.label}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <div className="util-info">
                    <div className="util-info-card">
                        <div className="util-info-card__label">Est. Duration</div>
                        <div className="util-info-card__value">~30 min</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Started</div>
                        <div className="util-info-card__value" style={{ fontSize: 12 }}>
                            {new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Status</div>
                        <div className="util-info-card__value" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <span className="util-pulse" style={{ background: '#f59e0b', width: 6, height: 6 }} /> In Progress
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="util-footer">
                Follow <a href="#">@fittrackpro</a> for live updates
            </div>
        </div>
    );
};

export default MaintenancePage;
