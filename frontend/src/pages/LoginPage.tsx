import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GymSelector from '../components/GymSelector/GymSelector';
import { AthlonXLogo } from '../components/ui/AthlonXLogo';

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

interface GymAssociation {
    gymId: number;
    gymName: string;
    role?: string;
    status: string;
    membershipEndDate?: string;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Role selection state
    // V1 Owner Pivot: Default to STAFF role
    const [selectedRole, setSelectedRole] = useState<'STAFF' | 'MEMBER' | null>('STAFF');

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Gym selection state (after login)
    const [showGymSelector, setShowGymSelector] = useState(false);
    const [gymAssociations, setGymAssociations] = useState<GymAssociation[]>([]);
    const [loginResponse, setLoginResponse] = useState<any>(null);

    // Check for signup success
    useEffect(() => {
        if (searchParams.get('signup') === 'success') {
            setSuccessMessage('Account created successfully! Please log in with your credentials.');
            // Clear the param after showing message
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [searchParams]);

    // Email validation
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError("");
        setPasswordError("");

        // Validate with inline errors
        let hasError = false;

        if (!email) {
            setEmailError("Email is required");
            hasError = true;
        } else if (!isValidEmail(email)) {
            setEmailError("Enter a valid email (e.g., name@company.com)");
            hasError = true;
        }

        if (!password) {
            setPasswordError("Password is required");
            hasError = true;
        }

        if (hasError) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: email,
                    password: password,
                    loginContext: selectedRole // Always send STAFF context for V1
                })
            });

            if (response.ok) {
                const data = await response.json();
                setLoginResponse(data);

                // Check if we need gym selection
                if (data.gymAssociations && data.gymAssociations.length > 1 && !data.activeGymId) {
                    setGymAssociations(data.gymAssociations);
                    setShowGymSelector(true);
                } else {
                    // Direct login
                    localStorage.setItem('user', JSON.stringify(data));
                    navigate('/dashboard');
                }
            } else {
                const errorData = await response.json();

                // Check if user has access via other role
                if (errorData.hasStaffAccess !== undefined || errorData.hasMemberAccess !== undefined) {
                    if (selectedRole === 'STAFF' && errorData.hasMemberAccess) {
                        setPasswordError("You don't have staff access. Try logging in as a Member.");
                    } else if (selectedRole === 'MEMBER' && errorData.hasStaffAccess) {
                        setPasswordError("You don't have member access. Try logging in as Staff.");
                    } else {
                        setPasswordError(errorData.error || "Login failed");
                    }
                } else {
                    setPasswordError(errorData.error || "Invalid email or password");
                }
            }
        } catch (err) {
            setPasswordError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGymSelect = async (gymId: number) => {
        if (!loginResponse) return;

        try {
            const response = await fetch('/api/auth/set-active-gym', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loginResponse.id,
                    gymId: gymId,
                    context: selectedRole
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify({
                    ...loginResponse,
                    ...data
                }));
                navigate('/dashboard');
            }
        } catch (err) {
            setPasswordError("Failed to select gym");
        }
    };

    return (
        <div style={{
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
            background: colors.bgPrimary,
            color: colors.textPrimary,
            display: "flex",
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Left Side - Image & Branding */}
            <div className="login-sidebar" style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                display: "none",
            }}>
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
                }}>
                    <AthlonXLogo size="xl" showText={false} />
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, lineHeight: 1.1, marginTop: 24 }}>
                        Welcome to <span style={{ color: colors.crimson }}>AthlonX</span>
                    </h1>
                    <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                        Empowering fitness professionals to build stronger communities and healthier businesses.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 60,
                background: colors.bgPrimary,
                position: "relative"
            }}>
                <div style={{ width: "100%", maxWidth: 420 }}>

                    <button
                        onClick={() => navigate('/')}
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 40,
                            background: "transparent",
                            border: "none",
                            color: colors.textSecondary,
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        Back to Home
                    </button>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Login</h2>
                        <p style={{ color: colors.textSecondary }}>Access your gym management dashboard</p>
                    </div>

                    {/* Role Selection Removed for V1 - Default to Staff */}

                    <form onSubmit={handleSubmit}>
                        {/* Email Field with Inline Error */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Email Address
                                </label>
                                {emailError && (
                                    <span style={{ color: "#DC2626", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                                        ⚠ {emailError}
                                    </span>
                                )}
                            </div>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.textTertiary }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                    placeholder="name@company.com"
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px 14px 48px",
                                        background: colors.bgSecondary,
                                        border: `1px solid ${emailError ? "#DC2626" : colors.borderPrimary}`,
                                        borderRadius: 12,
                                        color: colors.textPrimary,
                                        fontSize: 15,
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field with Inline Error */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                                    {passwordError && (
                                        <span style={{ color: "#DC2626", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                                            ⚠ {passwordError}
                                        </span>
                                    )}
                                </div>
                                <a href="#" style={{ color: colors.crimson, textDecoration: "none", fontSize: 12, fontWeight: 500 }}>Forgot password?</a>
                            </div>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.textTertiary }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                                    placeholder="Enter your password"
                                    style={{
                                        width: "100%",
                                        padding: "14px 48px 14px 48px",
                                        background: colors.bgSecondary,
                                        border: `1px solid ${passwordError ? "#DC2626" : colors.borderPrimary}`,
                                        borderRadius: 12,
                                        color: colors.textPrimary,
                                        fontSize: 15,
                                        outline: "none",
                                        boxSizing: "border-box",
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
                                        minHeight: 44,
                                        minWidth: 44,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
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

                        {/* Sign Up Link - Above Submit Button */}
                        <p style={{ textAlign: "center", marginBottom: 16, color: colors.textSecondary, fontSize: 14 }}>
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: colors.crimson,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 14,
                                    padding: 0,
                                    textDecoration: "underline",
                                }}
                            >
                                Sign up free
                            </button>
                        </p>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "16px",
                                background: selectedRole ? `linear-gradient(to right, ${colors.crimson}, ${colors.crimsonHover})` : colors.bgTertiary,
                                border: "none",
                                borderRadius: 12,
                                color: selectedRole ? "#fff" : colors.textTertiary,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: isLoading || !selectedRole ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                                        <circle cx="12" cy="12" r="10" opacity="0.3" />
                                        <path d="M12 2a10 10 0 0 1 10 10" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ position: "absolute", bottom: 24, fontSize: 13, color: colors.textTertiary }}>
                    © 2025 AthlonX Inc.
                </div>
            </div>

            {/* Gym Selector Modal */}
            {showGymSelector && (
                <GymSelector
                    gyms={gymAssociations}
                    context={selectedRole!}
                    onSelectGym={handleGymSelect}
                    onClose={() => setShowGymSelector(false)}
                />
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (min-width: 1024px) {
                    .login-sidebar { display: block !important; }
                }
                
                /* Input focus glow effect */
                input:focus {
                    border-color: #10B981 !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.1) !important;
                    transition: all 0.2s ease !important;
                }
                
                /* Role button hover lift */
                .role-btn {
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .role-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }
                .role-btn:active {
                    transform: translateY(0);
                }
                
                /* Submit button hover effect */
                button[type="submit"]:not(:disabled):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);
                }
                button[type="submit"]:active {
                    transform: translateY(0);
                }
                
                /* Link hover underline */
                a:hover {
                    text-decoration: underline !important;
                }
                
                /* Error animation */
                .error-box {
                    animation: slideIn 0.3s ease;
                }
            `}</style>
        </div>
    );
}
