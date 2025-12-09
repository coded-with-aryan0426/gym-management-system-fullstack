import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const colors = {
    bgPrimary: "#0D0D0D",
    bgSecondary: "#1A1A1A",
    bgTertiary: "#252525",
    borderPrimary: "#1F2937",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",
    crimson: "#DC2626",
    crimsonHover: "#B91C1C",
    emerald: "#10B981",
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const onNavigate = (page: string) => {
        navigate('/' + page);
    };

    const onLogin = () => {
        // In a real app, you would set authentication state/context here
        navigate('/dashboard');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // Real API Call
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password }) // Assuming email is username
                // Note: Backend endpoint expects 'username', but UI field says 'email'. 
                // We should really handle username vs email. For now, sending email as username.
            });

            if (response.ok) {
                const data = await response.json();
                // Store auth data (token, role, etc)
                localStorage.setItem('user', JSON.stringify(data));
                onLogin();
            } else {
                setError("Invalid email or password");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: colors.bgPrimary,
                color: colors.textPrimary,
                display: "flex",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* Left Side - Image & Branding */}
            <div
                className="login-sidebar"
                style={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    display: "none", // Hidden on mobile by default, handled by CSS media queries if we added them
                }}
            >
                {/* We use inline style for display:block on desktop logic usually, but here simply: */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "url('/login-sidebar.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} />

                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top, ${colors.bgPrimary} 0%, rgba(13,13,13,0.6) 50%, rgba(13,13,13,0.4) 100%)`
                }} />

                <div style={{
                    position: "absolute",
                    bottom: 60,
                    left: 60,
                    maxWidth: 480,
                    animation: "fadeInUp 0.8s ease-out"
                }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            background: colors.crimson,
                            borderRadius: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 32,
                            marginBottom: 24,
                            color: "#fff",
                            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.3)"
                        }}
                    >
                        A
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
                        Welcome to <span style={{ color: colors.crimson }}>AthlonX</span>
                    </h1>
                    <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                        Empowering fitness professionals to build stronger communities and healthier businesses.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 60,
                    background: colors.bgPrimary,
                    position: "relative"
                }}
            >
                <div style={{ width: "100%", maxWidth: 420, animation: "fadeIn 0.6s ease-out" }}>

                    <button
                        onClick={() => onNavigate("")}
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 40,
                            background: "transparent",
                            border: "none",
                            color: colors.textSecondary,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 14,
                            transition: "color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = colors.textPrimary}
                        onMouseOut={(e) => e.currentTarget.style.color = colors.textSecondary}
                    >
                        Back to Home
                    </button>

                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Sign In</h2>
                        <p style={{ color: colors.textSecondary }}>Access your gym management dashboard</p>
                    </div>

                    {error && (
                        <div
                            style={{
                                background: "rgba(220, 38, 38, 0.1)",
                                border: "1px solid rgba(220, 38, 38, 0.2)",
                                color: "#ff6b6b", // slightly brighter for dark mode
                                padding: "12px 16px",
                                borderRadius: 8,
                                marginBottom: 24,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                gap: 12
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                            <div style={{ position: "relative", transition: "all 0.2s" }}>
                                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.textTertiary }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px 14px 48px", // Added left padding for icon
                                        background: colors.bgSecondary,
                                        border: `1px solid ${colors.borderPrimary}`,
                                        borderRadius: 12,
                                        color: colors.textPrimary,
                                        fontSize: 15,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.2s, box-shadow 0.2s"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.crimson;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.crimson}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.borderPrimary;
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                                <a href="#" style={{ color: colors.crimson, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Forgot password?</a>
                            </div>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.textTertiary }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: "100%",
                                        padding: "14px 48px 14px 48px",
                                        background: colors.bgSecondary,
                                        border: `1px solid ${colors.borderPrimary}`,
                                        borderRadius: 12,
                                        color: colors.textPrimary,
                                        fontSize: 15,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.2s, box-shadow 0.2s"

                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.crimson;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.crimson}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.borderPrimary;
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: 16,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        color: colors.textTertiary,
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "16px",
                                background: `linear-gradient(to right, ${colors.crimson}, ${colors.crimsonHover || '#b91c1c'})`,
                                border: "none",
                                borderRadius: 12,
                                color: "#fff",
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                transition: "transform 0.1s, box-shadow 0.2s",
                                boxShadow: `0 4px 6px -1px rgba(220, 38, 38, 0.2), 0 2px 4px -1px rgba(220, 38, 38, 0.1)`
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)";
                                if (!isLoading) e.currentTarget.style.boxShadow = `0 10px 15px -3px rgba(220, 38, 38, 0.3)`;
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) e.currentTarget.style.transform = "none";
                                if (!isLoading) e.currentTarget.style.boxShadow = `0 4px 6px -1px rgba(220, 38, 38, 0.2)`;
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        style={{ animation: "spin 1s linear infinite" }}
                                    >
                                        <circle cx="12" cy="12" r="10" opacity="0.3" />
                                        <path d="M12 2a10 10 0 0 1 10 10" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: 32, textAlign: "center" }}>
                        <p style={{ color: colors.textSecondary, fontSize: 15 }}>
                            Don't have an account?{" "}
                            <button
                                onClick={() => onNavigate("signup")}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: colors.crimson,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    padding: 0
                                }}
                            >
                                Sign up free
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer info */}
                <div style={{ position: "absolute", bottom: 24, fontSize: 13, color: colors.textTertiary }}>
                    &copy; 2025 AthlonX Inc.
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @media (min-width: 1024px) {
            .login-sidebar {
                display: block !important;
            }
        }
      `}</style>
        </div>
    )
}
