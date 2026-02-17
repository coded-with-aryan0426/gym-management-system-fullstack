import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../contexts/AuthModalContext';
import { motion } from 'framer-motion';
import './utility/utility-pages.css';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { openAuthModal } = useAuthModal();

    const handleGoBack = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const role = (user.role || user.userRole || '').toUpperCase();
            if (role === 'OWNER' || role === 'ADMIN') navigate('/dashboard');
            else if (role === 'TRAINER') navigate('/trainer');
            else if (role === 'CUSTOMER' || role === 'MEMBER') navigate('/member');
            else { navigate('/'); openAuthModal('login'); }
        } else {
            navigate('/');
            openAuthModal('login');
        }
    };

    return (
        <div className="util-page">
            <div className="util-particles">
                {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="util-particle" style={{
                        left: `${Math.random() * 100}%`,
                        width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
                        animationDelay: `${Math.random() * 6}s`,
                        animationDuration: `${7 + Math.random() * 5}s`,
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
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <div className="util-code" style={{ fontSize: 72, background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(239,68,68,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>403</div>
                <h1 className="util-title">Access Denied</h1>
                <p className="util-desc">
                    You don't have permission to access this page.
                    Please contact your administrator if you believe this is an error.
                </p>

                <div className="util-terminal" style={{ borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <div><span className="util-terminal__error">× FORBIDDEN</span></div>
                    <div style={{ color: 'rgba(255,255,255,0.35)' }}>Insufficient permissions for requested resource</div>
                    <div><span className="util-terminal__info">→</span> Required: ADMIN or OWNER role</div>
                </div>

                <div className="util-actions">
                    <button className="util-btn util-btn--primary" onClick={handleGoBack}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Go to My Dashboard
                    </button>
                    <button className="util-btn util-btn--ghost" onClick={() => navigate('/')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Home
                    </button>
                </div>
            </motion.div>

            <div className="util-footer">
                Need help? <a href="/contact">Contact Support</a>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
