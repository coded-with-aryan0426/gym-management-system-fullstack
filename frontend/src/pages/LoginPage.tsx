import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GymSelector from '../components/GymSelector/GymSelector';
import GymNameModal from '../components/auth/GymNameModal';
import { Logo } from '../components/ui/Logo';
import api from '../services/api'; // Use api wrapper
import OtpInput from '../components/auth/OtpInput';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';

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

    // Steps: 'CREDENTIALS' | 'OTP'
    const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Gym selection state (after login)
    const [showGymSelector, setShowGymSelector] = useState(false);
    const [gymAssociations, setGymAssociations] = useState<GymAssociation[]>([]);
    const [loginResponse, setLoginResponse] = useState<any>(null);

    // New user gym name modal
    const [showGymNameModal, setShowGymNameModal] = useState(false);
    const [newUserData, setNewUserData] = useState<{ userId: number; token: string; fullName: string } | null>(null);

    // V1 Owner Pivot: Default to STAFF role
    const selectedRole = 'STAFF';

    useEffect(() => {
        if (searchParams.get('signup') === 'success') {
            setSuccessMessage('Account created successfully! Please log in with your credentials.');
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [searchParams]);

    // State for the email to be used for verification (returned from backend)
    const [verificationEmail, setVerificationEmail] = useState("");

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        // Validate Email or Phone
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        const isEmail = emailRegex.test(email);
        const isPhone = phoneRegex.test(email);

        if (!isEmail && !isPhone) {
            setError("Please enter a valid email address or a 10-digit phone number");
            return;
        }

        setIsLoading(true);

        try {
            // Step 1: Validate credentials and request OTP
            const response = await api.login({
                username: email,
                password: password,
                loginContext: selectedRole
            });

            if (response.otpSent) {
                // Use the email returned from backend for verification (handles phone login case)
                setVerificationEmail(response.email || email);
                setStep('OTP');
                setSuccessMessage("Verification code sent to your email");
            } else {
                // Fallback for unexpected response (legacy flow?)
                handleAuthSuccess(response);
            }
        } catch (err: any) {
            console.error("Login Check Error:", err);
            setError(err.response?.data?.error || "Login failed. Please check credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);

        try {
            // Use verificationEmail instead of the input email
            const response = await api.verifyLogin(verificationEmail || email, otp);

            if (response.firstLogin) {
                // Redirect to change password page
                // Pass normalized email in state
                navigate('/change-password', { state: { email: verificationEmail || email } });
            } else {
                handleAuthSuccess(response);
            }

        } catch (err: any) {
            console.error("OTP Verify Error:", err);
            setError(err.response?.data?.error || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSuccess = (data: any) => {
        // Check if this is a new user from OAuth
        if (data.isNewUser) {
            setNewUserData({
                userId: data.user?.id || data.id,
                token: data.token,
                fullName: data.user?.fullName || data.fullName || ''
            });
            setShowGymNameModal(true);
            return;
        }

        setLoginResponse(data);
        localStorage.setItem('user', JSON.stringify(data));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        // Gym selection logic
        if (data.gymAssociations && data.gymAssociations.length > 1 && !data.activeGymId) {
            setGymAssociations(data.gymAssociations);
            setShowGymSelector(true);
        } else {
            // Redirect based on role
            const role = (data.staffRole || data.role || '').toUpperCase();
            if (role === 'OWNER' || role === 'ADMIN') {
                navigate('/dashboard');
            } else if (role === 'TRAINER') {
                navigate('/trainer');
            } else if (role === 'CUSTOMER' || role === 'MEMBER') {
                navigate('/member');
            } else {
                navigate('/dashboard');
            }
        }
    };

    const handleGymSelect = async (gymId: number) => {
        if (!loginResponse) return;

        try {
            const response = await api.setActiveGym({
                userId: loginResponse.id,
                gymId: gymId,
                context: selectedRole
            });

            if (response.token) {
                localStorage.setItem('user', JSON.stringify({
                    ...loginResponse,
                    ...response
                }));
                localStorage.setItem('token', response.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError("Failed to select gym");
        }
    };

    const handleGymNameComplete = (gymName: string) => {
        if (newUserData) {
            const userData = {
                ...newUserData,
                gymName,
                staffRole: 'OWNER'
            };
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newUserData.token);
        }
        setShowGymNameModal(false);
        navigate('/dashboard');
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
                    background: `linear-gradient(to top, ${colors.bgPrimary} 0%, rgba(13, 13, 13, 0.6) 50%, rgba(13, 13, 13, 0.4) 100%)`
                }} />
                <div style={{
                    position: "absolute",
                    bottom: 60,
                    left: 60,
                    maxWidth: 480,
                }}>
                    <Logo size={48} showText={false} />
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
                padding: "40px 60px",
                background: colors.bgPrimary,
                position: "relative",
                minHeight: "100vh"
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

                    {/* Header - No logo, just title */}
                    <div style={{ marginBottom: 24, textAlign: 'center' }}>
                        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                            {step === 'OTP' ? 'Verification' : 'Login'}
                        </h2>
                        <p style={{ color: colors.textSecondary, fontSize: 14 }}>
                            {step === 'OTP'
                                ? `Enter the code sent to ${email}`
                                : 'Access your gym management dashboard'}
                        </p>
                    </div>

                    {/* Fixed height message container - prevents layout shift */}
                    <div style={{ minHeight: 48, marginBottom: 8 }}>
                        {error && (
                            <div style={{
                                padding: "10px 14px",
                                background: "rgba(220, 38, 38, 0.1)",
                                border: `1px solid ${colors.crimson}`,
                                borderRadius: 8,
                                color: colors.crimson,
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                animation: 'fadeIn 0.2s ease'
                            }}>
                                <span>⚠</span> {error}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{
                                padding: "10px 14px",
                                background: "rgba(16, 185, 129, 0.1)",
                                border: `1px solid ${colors.emerald}`,
                                borderRadius: 8,
                                color: colors.emerald,
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                animation: 'fadeIn 0.2s ease'
                            }}>
                                <span>✓</span> {successMessage}
                            </div>
                        )}
                    </div>

                    {step === 'CREDENTIALS' ? (
                        <form onSubmit={handleLoginSubmit}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: colors.textSecondary, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Email or Phone
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email or Phone Number"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: colors.bgSecondary,
                                        border: `1px solid ${colors.borderPrimary}`,
                                        borderRadius: 10,
                                        color: colors.textPrimary,
                                        fontSize: 14,
                                        outline: "none",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                                    <a href="#" style={{ color: colors.crimson, textDecoration: "none", fontSize: 11, fontWeight: 500 }}>Forgot password?</a>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px 44px 12px 12px",
                                            background: colors.bgSecondary,
                                            border: `1px solid ${colors.borderPrimary}`,
                                            borderRadius: 10,
                                            color: colors.textPrimary,
                                            fontSize: 14,
                                            outline: "none",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: 12,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "transparent",
                                            border: "none",
                                            color: colors.textTertiary,
                                            cursor: "pointer",
                                            fontSize: 10,
                                        }}
                                    >
                                        {showPassword ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    background: `linear-gradient(to right, ${colors.crimson}, ${colors.crimsonHover})`,
                                    border: "none",
                                    borderRadius: 10,
                                    color: "#fff",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                }}
                            >
                                {isLoading ? "Checking..." : "Sign In"}
                            </button>

                            {/* Social Login Buttons */}
                            <SocialLoginButtons
                                onSuccess={handleAuthSuccess}
                                onError={(err) => setError(err)}
                                mode="login"
                            />
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit}>
                            <div style={{ marginBottom: 32 }}>
                                <OtpInput
                                    value={otp}
                                    onChange={setOtp}
                                    length={6}
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    background: `linear-gradient(to right, ${colors.crimson}, ${colors.crimsonHover})`,
                                    border: "none",
                                    borderRadius: 12,
                                    color: "#fff",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading || otp.length !== 6 ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 12,
                                }}
                            >
                                {isLoading ? "Verifying..." : "Verify & Login"}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <button
                                    type="button"
                                    onClick={() => setStep('CREDENTIALS')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: colors.textSecondary,
                                        fontSize: 13,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'CREDENTIALS' && (
                        <p style={{ textAlign: "center", marginTop: 24, color: colors.textSecondary, fontSize: 14 }}>
                            Don't have an account?{" "}
                            <span
                                onClick={() => navigate('/signup')}
                                style={{ color: colors.crimson, cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
                            >
                                Sign up free
                            </span>
                        </p>
                    )}
                </div>

                <div style={{ position: "absolute", bottom: 24, fontSize: 13, color: colors.textTertiary }}>
                    © 2025 AthlonX Inc.
                </div>
            </div>

            {showGymSelector && gymAssociations.length > 0 && (
                <GymSelector
                    gyms={gymAssociations}
                    context={selectedRole}
                    onSelectGym={handleGymSelect}
                    onClose={() => setShowGymSelector(false)}
                />
            )}

            {showGymNameModal && newUserData && (
                <GymNameModal
                    userId={newUserData.userId}
                    token={newUserData.token}
                    fullName={newUserData.fullName}
                    onComplete={handleGymNameComplete}
                    onClose={() => {
                        setShowGymNameModal(false);
                        // Even without gym, allow them to proceed
                        localStorage.setItem('token', newUserData.token);
                        navigate('/dashboard');
                    }}
                />
            )}

            <style>{`
                @media (min-width: 1024px) {
                    .login-sidebar { display: block !important; }
                }
                input:focus {
                    border-color: #10B981 !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
                    transition: all 0.2s ease !important;
                }
            `}</style>
        </div>
    );
}
