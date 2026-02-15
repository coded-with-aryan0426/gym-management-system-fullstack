import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './utility-pages.css';

const ComingSoonPage = ({ featureName = 'This Feature' }: { featureName?: string }) => {
    const targetDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    const [timeLeft, setTimeLeft] = useState(getTimeLeft());

    function getTimeLeft() {
        const diff = targetDate.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="util-page">
            <div className="util-particles">
                {Array.from({ length: 18 }, (_, i) => (
                    <div key={i} className="util-particle" style={{
                        left: `${Math.random() * 100}%`,
                        width: 2 + Math.random() * 3, height: 2 + Math.random() * 3,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${6 + Math.random() * 8}s`,
                        background: 'rgba(16, 185, 129, 0.08)',
                    }} />
                ))}
            </div>

            <motion.div
                className="util-content"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="util-icon util-icon--emerald">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </div>

                <h1 className="util-title">{featureName}</h1>
                <p className="util-desc">
                    We're building something amazing. This feature is currently under development
                    and will be available soon. Stay tuned!
                </p>

                {/* Countdown */}
                <div className="util-countdown">
                    {[
                        { value: timeLeft.days, label: 'Days' },
                        { value: timeLeft.hours, label: 'Hours' },
                        { value: timeLeft.minutes, label: 'Min' },
                        { value: timeLeft.seconds, label: 'Sec' },
                    ].map((block, i) => (
                        <div key={block.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            {i > 0 && <span className="util-countdown__sep">:</span>}
                            <motion.div
                                className="util-countdown__block"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.08 }}
                            >
                                <div className="util-countdown__num">{String(block.value).padStart(2, '0')}</div>
                                <div className="util-countdown__label">{block.label}</div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Progress */}
                <div style={{ maxWidth: 360, margin: '0 auto 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                        <span>Development Progress</span>
                        <span>72%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '72%' }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                            style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #10b981, #059669)' }}
                        />
                    </div>
                </div>

                <div className="util-actions">
                    <button className="util-btn util-btn--ghost" onClick={() => window.history.back()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Go Back
                    </button>
                </div>

                <div className="util-info">
                    <div className="util-info-card">
                        <div className="util-info-card__label">Phase</div>
                        <div className="util-info-card__value" style={{ fontSize: 12 }}>Beta</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">Progress</div>
                        <div className="util-info-card__value" style={{ color: '#10b981', fontSize: 12 }}>72%</div>
                    </div>
                    <div className="util-info-card">
                        <div className="util-info-card__label">ETA</div>
                        <div className="util-info-card__value" style={{ fontSize: 12 }}>~2 weeks</div>
                    </div>
                </div>
            </motion.div>

            <div className="util-footer">
                Built with ❤️ by the FitTrack team
            </div>
        </div>
    );
};

export default ComingSoonPage;
