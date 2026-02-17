import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './utility-pages.css';

const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
    size: 2 + Math.random() * 3,
}));

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="util-page">
            {/* Floating particles */}
            <div className="util-particles">
                {particles.map(p => (
                    <div key={p.id} className="util-particle" style={{
                        left: p.left, width: p.size, height: p.size,
                        animationDelay: p.delay, animationDuration: p.duration,
                    }} />
                ))}
            </div>

            <motion.div
                className="util-content"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="util-icon util-icon--blue">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                </div>

                <div className="util-code">404</div>
                <h1 className="util-title">Page Not Found</h1>
                <p className="util-desc">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="util-actions">
                    <button className="util-btn util-btn--primary" onClick={() => navigate(-1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Go Back
                    </button>
                    <button className="util-btn util-btn--ghost" onClick={() => navigate('/')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Home
                    </button>
                </div>

                <div className="util-terminal">
                    <div><span className="util-terminal__prompt">$</span> GET /the-page-you-wanted</div>
                    <div><span className="util-terminal__error">ERROR</span> Route not found in manifest</div>
                    <div><span className="util-terminal__info">INFO</span> Did you mean /dashboard?</div>
                    <div><span className="util-terminal__prompt">$</span> <span style={{ opacity: 0.4 }}>_</span></div>
                </div>
            </motion.div>

            <div className="util-footer">
                FitTrack Pro · <a href="/">Back to safety</a>
            </div>
        </div>
    );
};

export default NotFoundPage;
