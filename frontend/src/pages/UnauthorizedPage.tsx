import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const role = (user.role || user.userRole || '').toUpperCase();

            if (role === 'OWNER' || role === 'ADMIN') {
                navigate('/dashboard');
            } else if (role === 'TRAINER') {
                navigate('/trainer');
            } else if (role === 'CUSTOMER' || role === 'MEMBER') {
                navigate('/member');
            } else {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary, #0D0D0D)',
            color: 'var(--text-primary, #F9FAFB)',
            fontFamily: "'Inter', sans-serif",
            padding: '20px',
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '400px',
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(220, 38, 38, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#DC2626',
                }}>
                    Access Denied
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: 'var(--text-secondary, #9CA3AF)',
                    marginBottom: '32px',
                    lineHeight: 1.6,
                }}>
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>

                <button
                    onClick={handleGoBack}
                    style={{
                        padding: '14px 28px',
                        background: 'linear-gradient(to right, #DC2626, #B91C1C)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Go to My Dashboard
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
