import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import OtpInput from './OtpInput';
import SocialLoginButtons from './SocialLoginButtons';
import GymSelector from '../GymSelector/GymSelector';
import GymNameModal from './GymNameModal';

const getStorageKey = (key: string): string => {
    const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
    return `${key}_port_${port}`;
};

const getColors = (isDark: boolean) => ({
    bgPrimary: isDark ? "#0D0D0D" : "#F8FAFC",
    bgSecondary: isDark ? "#1A1A1A" : "#FFFFFF",
    bgTertiary: isDark ? "#252525" : "#F1F5F9",
    borderPrimary: isDark ? "#1F2937" : "#E2E8F0",
    textPrimary: isDark ? "#F9FAFB" : "#0F172A",
    textSecondary: isDark ? "#9CA3AF" : "#64748B",
    textTertiary: isDark ? "#6B7280" : "#94A3B8",
    crimson: "#DC2626",
    crimsonHover: "#B91C1C",
    emerald: "#10B981",
});

interface GymAssociation {
    gymId: number;
    gymName: string;
    role?: string;
    status: string;
    membershipEndDate?: string;
}

// Validation helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidIndianPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
};

export default function AuthModal() {
    const navigate = useNavigate();
    const { isOpen, activeTab, closeAuthModal, setActiveTab } = useAuthModal();
    const { login: authLogin } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const colors = getColors(isDark);
    const modalRef = useRef<HTMLDivElement>(null);

    // Login State
    const [loginStep, setLoginStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginOtp, setLoginOtp] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");

    // Signup State
    const [signupStep, setSignupStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gymName: ""
    });
    const [signupOtp, setSignupOtp] = useState("");
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

    // Shared State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Gym selection state
    const [showGymSelector, setShowGymSelector] = useState(false);
    const [gymAssociations, setGymAssociations] = useState<GymAssociation[]>([]);
    const [loginResponse, setLoginResponse] = useState<any>(null);
    const [showGymNameModal, setShowGymNameModal] = useState(false);
    const [newUserData, setNewUserData] = useState<{ userId: number; token: string; fullName: string } | null>(null);

    const selectedRole = 'STAFF';
    const passwordStrength = getPasswordStrength(signupData.password);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setLoginStep('CREDENTIALS');
            setLoginEmail("");
            setLoginPassword("");
            setLoginOtp("");
            setSignupStep('DETAILS');
            setSignupData({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", gymName: "" });
            setSignupOtp("");
            setError("");
            setSuccessMessage("");
        }
    }, [isOpen]);

    // Handle escape key and click outside
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) closeAuthModal();
        };
        
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                closeAuthModal();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, closeAuthModal]);

    // Signup validation
    const validateSignupField = (name: string, value: string) => {
        const newErrors = { ...signupErrors };
        if (name === 'fullName') !value ? newErrors.fullName = "Required" : delete newErrors.fullName;
        if (name === 'email') {
            if (!value) newErrors.email = "Required";
            else if (!isValidEmail(value)) newErrors.email = "Invalid email";
            else delete newErrors.email;
        }
        if (name === 'phone') {
            if (!value) newErrors.phone = "Required";
            else if (!isValidIndianPhone(value)) newErrors.phone = "Invalid format";
            else delete newErrors.phone;
        }
        if (name === 'password') {
            if (!value) newErrors.password = "Required";
            else if (value.length < 8) newErrors.password = "Min 8 chars";
            else delete newErrors.password;
        }
        if (name === 'confirmPassword') {
            if (value !== signupData.password) newErrors.confirmPassword = "Mismatch";
            else delete newErrors.confirmPassword;
        }
        if (name === 'gymName') !value ? newErrors.gymName = "Required" : delete newErrors.gymName;
        setSignupErrors(newErrors);
    };

    const handleSignupChange = (name: string, value: string) => {
        setSignupData({ ...signupData, [name]: value });
        validateSignupField(name, value);
    };

    // LOGIN HANDLERS
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!loginEmail || !loginPassword) {
            setError("Please enter both email and password");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const isEmail = emailRegex.test(loginEmail);
        const isPhone = phoneRegex.test(loginEmail);

        if (!isEmail && !isPhone) {
            setError("Please enter a valid email or 10-digit phone number");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.login({
                username: loginEmail,
                password: loginPassword,
                loginContext: selectedRole
            });

            if (response.otpSent) {
                setVerificationEmail(response.email || loginEmail);
                setLoginStep('OTP');
                setSuccessMessage("Verification code sent to your email");
            } else if (response.token) {
                handleAuthSuccess(response);
            } else {
                setError("Invalid server response");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Login failed. Please check credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (loginOtp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.verifyLogin(verificationEmail || loginEmail, loginOtp);
            if (response.firstLogin) {
                closeAuthModal();
                navigate('/change-password', { state: { email: verificationEmail || loginEmail } });
            } else {
                handleAuthSuccess(response);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    // SIGNUP HANDLERS
    const handleSignupSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (Object.keys(signupErrors).length > 0) return;
        if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.gymName) {
            setError("Please fill all required fields");
            return;
        }

        setIsLoading(true);
        try {
            await api.sendOtp(signupData.email, 'SIGNUP');
            setSignupStep('OTP');
            setSuccessMessage(`Verification code sent to ${signupData.email}`);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to send verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (signupOtp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.ownerRegister({
                ...signupData,
                ownerName: signupData.fullName,
                otp: signupOtp
            });

            if (response && response.token) {
                localStorage.setItem('user', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                closeAuthModal();
                navigate('/dashboard');
            } else {
                closeAuthModal();
                setActiveTab('login');
                setSuccessMessage('Account created! Please log in.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed. Please check OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    // AUTH SUCCESS HANDLER
    const handleAuthSuccess = (data: any) => {
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

        if (data.token) {
            const userId = data.userId || data.id;
            authLogin(data.token, {
                id: String(userId),
                userId: typeof userId === 'number' ? userId : parseInt(String(userId)),
                username: data.username,
                email: data.email,
                fullName: data.fullName,
                role: data.staffRole || data.role || 'CUSTOMER',
                staffRole: data.staffRole,
                token: data.token,
                activeGymId: data.activeGymId,
                activeGymName: data.activeGymName
            });
        }

        if (data.gymAssociations && data.gymAssociations.length > 1 && !data.activeGymId) {
            setGymAssociations(data.gymAssociations);
            setShowGymSelector(true);
        } else {
            closeAuthModal();
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
                localStorage.setItem(getStorageKey('user'), JSON.stringify({ ...loginResponse, ...response }));
                localStorage.setItem(getStorageKey('token'), response.token);
                closeAuthModal();
                navigate('/dashboard');
            }
        } catch {
            setError("Failed to select gym");
        }
    };

    const handleGymNameComplete = (gymName: string) => {
        if (newUserData) {
            const userData = { ...newUserData, gymName, staffRole: 'OWNER' };
            localStorage.setItem(getStorageKey('user'), JSON.stringify(userData));
            localStorage.setItem(getStorageKey('token'), newUserData.token);
        }
        setShowGymNameModal(false);
        closeAuthModal();
        navigate('/dashboard');
    };

    const handleSocialSuccess = (data: any) => {
        handleAuthSuccess(data);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px',
                }}
            >
                    <div
                        ref={modalRef}
                        style={{
                            background: colors.bgSecondary,
                            borderRadius: 20,
                            width: '100%',
                            maxWidth: 480,
                            minWidth: 480,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: isDark 
                                ? '0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(220, 38, 38, 0.1)' 
                                : '0 25px 60px -12px rgba(0, 0, 0, 0.2), 0 0 40px rgba(220, 38, 38, 0.05)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            animation: 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    >
                        {/* Header - Compact */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 20px',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        }}>
                            <div>
                                <h2 style={{ 
                                    fontSize: 17, 
                                    fontWeight: 700, 
                                    color: colors.textPrimary, 
                                    margin: 0,
                                    letterSpacing: '-0.3px'
                                }}>
                                    {activeTab === 'login' 
                                        ? (loginStep === 'OTP' ? 'Verify Code' : 'Welcome Back')
                                        : (signupStep === 'OTP' ? 'Verify Code' : 'Start Your Gym')
                                    }
                                </h2>
                                <p style={{
                                    fontSize: 12,
                                    color: colors.textTertiary,
                                    margin: '2px 0 0 0',
                                }}>
                                    {activeTab === 'login' 
                                        ? (loginStep === 'OTP' ? 'Enter the code sent to your email' : 'Sign in to your account')
                                        : (signupStep === 'OTP' ? 'Enter the code sent to your email' : 'Create your gym owner account')
                                    }
                                </p>
                            </div>
                            <button
                                onClick={closeAuthModal}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    border: 'none',
                                    color: colors.textTertiary,
                                    cursor: 'pointer',
                                    padding: 6,
                                    display: 'flex',
                                    borderRadius: 8,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tab Switcher - Compact Slider */}
                        {loginStep === 'CREDENTIALS' && signupStep === 'DETAILS' && (
                            <div style={{ padding: '12px 20px 0' }}>
                                <div style={{
                                    position: 'relative',
                                    display: 'flex',
                                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                    borderRadius: 10,
                                    padding: 3,
                                }}>
                                    {/* Sliding Indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 3,
                                        left: activeTab === 'login' ? 3 : 'calc(50% + 1.5px)',
                                        width: 'calc(50% - 4.5px)',
                                        height: 'calc(100% - 6px)',
                                        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                        borderRadius: 7,
                                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                                        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        zIndex: 0,
                                    }} />
                                    {/* Login Tab */}
                                    <button
                                        onClick={() => setActiveTab('login')}
                                        style={{
                                            flex: 1,
                                            padding: '8px 16px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: 7,
                                            color: activeTab === 'login' ? '#fff' : colors.textSecondary,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'color 0.25s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    >
                                        Sign In
                                    </button>
                                    {/* Signup Tab */}
                                    <button
                                        onClick={() => setActiveTab('signup')}
                                        style={{
                                            flex: 1,
                                            padding: '8px 16px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: 7,
                                            color: activeTab === 'signup' ? '#fff' : colors.textSecondary,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'color 0.25s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    >
                                        Gym Owner
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div style={{ 
                            padding: '16px 20px 20px',
                            animation: 'tabSwitch 0.2s ease-out',
                        }}
                        key={activeTab + loginStep + signupStep}>
                            {/* Messages - Compact */}
                            {(error || successMessage) && (
                                <div style={{ marginBottom: 12 }}>
                                    {error && (
                                        <div style={{
                                            padding: "10px 12px",
                                            background: "rgba(220, 38, 38, 0.08)",
                                            border: `1px solid rgba(220, 38, 38, 0.25)`,
                                            borderRadius: 8,
                                            color: colors.crimson,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            animation: 'fadeIn 0.2s ease',
                                        }}>
                                            <span style={{ fontSize: 14 }}>⚠</span> {error}
                                        </div>
                                    )}
                                    {successMessage && (
                                        <div style={{
                                            padding: "10px 12px",
                                            background: "rgba(16, 185, 129, 0.08)",
                                            border: `1px solid rgba(16, 185, 129, 0.25)`,
                                            borderRadius: 8,
                                            color: colors.emerald,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            animation: 'fadeIn 0.2s ease',
                                        }}>
                                            <span style={{ fontSize: 14 }}>✓</span> {successMessage}
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* LOGIN TAB */}
                        {activeTab === 'login' && (
                            <>
                                {loginStep === 'CREDENTIALS' ? (
                                    <form onSubmit={handleLoginSubmit}>
                                        <div style={{ marginBottom: 12 }}>
                                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                Email or Phone
                                            </label>
                                            <input
                                                type="text"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                required
                                                style={{
                                                    width: "100%",
                                                    padding: "11px 14px",
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                    borderRadius: 10,
                                                    color: colors.textPrimary,
                                                    fontSize: 14,
                                                    outline: "none",
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                                                <a href="#" style={{ color: colors.crimson, textDecoration: "none", fontSize: 11, fontWeight: 600 }}>Forgot?</a>
                                            </div>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    type={showLoginPassword ? "text" : "password"}
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    style={{
                                                        width: "100%",
                                                        padding: "11px 48px 11px 14px",
                                                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                        borderRadius: 10,
                                                        color: colors.textPrimary,
                                                        fontSize: 14,
                                                        outline: "none",
                                                        boxSizing: 'border-box',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
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
                                                        fontWeight: 600,
                                                        letterSpacing: '0.5px',
                                                    }}
                                                >
                                                    {showLoginPassword ? "HIDE" : "SHOW"}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                                border: "none",
                                                borderRadius: 10,
                                                color: "#fff",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: isLoading ? "not-allowed" : "pointer",
                                                opacity: isLoading ? 0.7 : 1,
                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isLoading) {
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.45)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {isLoading ? "Signing in..." : "Sign In"}
                                        </button>

                                        <SocialLoginButtons
                                            onSuccess={handleSocialSuccess}
                                            onError={(err) => setError(err)}
                                            mode="login"
                                        />
                                    </form>
                                ) : (
                                    <form onSubmit={handleLoginOtpSubmit}>
                                        <p style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center', lineHeight: 1.5 }}>
                                            Enter the code sent to<br/><strong style={{ color: colors.textPrimary }}>{verificationEmail || loginEmail}</strong>
                                        </p>
                                        <div style={{ marginBottom: 20 }}>
                                            <OtpInput value={loginOtp} onChange={setLoginOtp} length={6} disabled={isLoading} />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || loginOtp.length !== 6}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                                border: "none",
                                                borderRadius: 10,
                                                color: "#fff",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: isLoading || loginOtp.length !== 6 ? "not-allowed" : "pointer",
                                                opacity: isLoading || loginOtp.length !== 6 ? 0.7 : 1,
                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isLoading && loginOtp.length === 6) {
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.45)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {isLoading ? "Verifying..." : "Verify & Login"}
                                        </button>
                                        <div style={{ textAlign: 'center', marginTop: 14 }}>
                                            <button
                                                type="button"
                                                onClick={() => { setLoginStep('CREDENTIALS'); setLoginOtp(""); setError(""); }}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: colors.textSecondary, 
                                                    fontSize: 13, 
                                                    cursor: 'pointer',
                                                    fontWeight: 500,
                                                    transition: 'color 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = colors.textPrimary}
                                                onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                                            >
                                                ← Back to Login
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}

                        {/* SIGNUP TAB */}
                        {activeTab === 'signup' && (
                            <>
                                {signupStep === 'DETAILS' ? (
                                    <form onSubmit={handleSignupSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {/* Row 1: Full Name */}
                                        <InputField
                                            label="Full Name"
                                            value={signupData.fullName}
                                            onChange={(val) => handleSignupChange('fullName', val)}
                                            error={signupErrors.fullName}
                                            placeholder="John Doe"
                                            colors={colors}
                                            isDark={isDark}
                                        />
                                        {/* Row 2: Email & Phone side by side */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <InputField
                                                label="Email"
                                                type="email"
                                                value={signupData.email}
                                                onChange={(val) => handleSignupChange('email', val)}
                                                error={signupErrors.email}
                                                placeholder="name@company.com"
                                                isValid={isValidEmail(signupData.email)}
                                                colors={colors}
                                                isDark={isDark}
                                            />
                                            <InputField
                                                label="Phone"
                                                type="tel"
                                                value={signupData.phone}
                                                onChange={(val) => handleSignupChange('phone', val)}
                                                error={signupErrors.phone}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                isValid={isValidIndianPhone(signupData.phone)}
                                                colors={colors}
                                                isDark={isDark}
                                            />
                                        </div>
                                        {/* Row 3: Gym Name */}
                                        <InputField
                                            label="Gym Name"
                                            value={signupData.gymName}
                                            onChange={(val) => handleSignupChange('gymName', val)}
                                            error={signupErrors.gymName}
                                            placeholder="My Awesome Gym"
                                            colors={colors}
                                            isDark={isDark}
                                        />
                                        {/* Row 4: Password & Confirm side by side */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <PasswordField
                                                label="Password"
                                                value={signupData.password}
                                                onChange={(val) => handleSignupChange('password', val)}
                                                error={signupErrors.password}
                                                show={showSignupPassword}
                                                onToggle={() => setShowSignupPassword(!showSignupPassword)}
                                                colors={colors}
                                                isDark={isDark}
                                            />
                                            <PasswordField
                                                label="Confirm"
                                                value={signupData.confirmPassword}
                                                onChange={(val) => handleSignupChange('confirmPassword', val)}
                                                error={signupErrors.confirmPassword}
                                                show={showConfirmPassword}
                                                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                                colors={colors}
                                                isDark={isDark}
                                            />
                                        </div>
                                        {/* Password Strength Indicator */}
                                        {signupData.password && (
                                            <div style={{ display: "flex", alignItems: 'center', gap: 8 }}>
                                                <div style={{ display: "flex", gap: 3, flex: 1, height: 3 }}>
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} style={{ 
                                                            flex: 1, 
                                                            borderRadius: 3, 
                                                            background: i <= passwordStrength 
                                                                ? (passwordStrength < 3 ? colors.crimson : colors.emerald) 
                                                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                                            transition: 'background 0.2s ease'
                                                        }} />
                                                    ))}
                                                </div>
                                                <div style={{ 
                                                    fontSize: 10, 
                                                    fontWeight: 600,
                                                    color: passwordStrength === 4 ? colors.emerald : colors.textTertiary 
                                                }}>
                                                    {passwordStrength === 4 ? "Strong" : passwordStrength >= 2 ? "Medium" : "Weak"}
                                                </div>
                                            </div>
                                        )}
                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                marginTop: 4,
                                                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                                border: "none",
                                                borderRadius: 10,
                                                color: "#fff",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: isLoading ? "not-allowed" : "pointer",
                                                opacity: isLoading ? 0.7 : 1,
                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isLoading) {
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.45)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {isLoading ? "Sending Code..." : "Register as Owner"}
                                        </button>
                                        <SocialLoginButtons
                                            onSuccess={handleSocialSuccess}
                                            onError={(err) => setError(err)}
                                            mode="signup"
                                        />
                                    </form>
                                ) : (
                                    <form onSubmit={handleSignupRegister}>
                                        <p style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center', lineHeight: 1.5 }}>
                                            Enter the code sent to<br/><strong style={{ color: colors.textPrimary }}>{signupData.email}</strong>
                                        </p>
                                        <div style={{ marginBottom: 20 }}>
                                            <OtpInput value={signupOtp} onChange={setSignupOtp} length={6} disabled={isLoading} />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || signupOtp.length !== 6}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                                                border: "none",
                                                borderRadius: 10,
                                                color: "#fff",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: isLoading || signupOtp.length !== 6 ? "not-allowed" : "pointer",
                                                opacity: isLoading || signupOtp.length !== 6 ? 0.7 : 1,
                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isLoading && signupOtp.length === 6) {
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.45)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {isLoading ? "Creating Account..." : "Verify & Register"}
                                        </button>
                                        <div style={{ textAlign: 'center', marginTop: 14 }}>
                                            <button
                                                type="button"
                                                onClick={() => { setSignupStep('DETAILS'); setSignupOtp(""); setError(""); }}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: colors.textSecondary, 
                                                    fontSize: 13, 
                                                    cursor: 'pointer',
                                                    fontWeight: 500,
                                                    transition: 'color 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = colors.textPrimary}
                                                onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                                            >
                                                ← Back to Details
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Gym Selector Modal */}
            {showGymSelector && gymAssociations.length > 0 && (
                <GymSelector
                    gyms={gymAssociations}
                    context={selectedRole}
                    onSelectGym={handleGymSelect}
                    onClose={() => setShowGymSelector(false)}
                />
            )}

            {/* Gym Name Modal */}
            {showGymNameModal && newUserData && (
                <GymNameModal
                    userId={newUserData.userId}
                    token={newUserData.token}
                    fullName={newUserData.fullName}
                    onComplete={handleGymNameComplete}
                    onClose={() => {
                        setShowGymNameModal(false);
                        localStorage.setItem(getStorageKey('token'), newUserData.token);
                        closeAuthModal();
                        navigate('/dashboard');
                    }}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes tabSwitch {
                    0% { opacity: 0.7; transform: translateX(5px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                input:focus {
                    border-color: #DC2626 !important;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12) !important;
                }
                input::placeholder {
                    color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'};
                }
                button:active:not(:disabled) {
                    transform: scale(0.98);
                }
            `}</style>
        </>
    );
}

// Input Field Component - Compact
const InputField = ({ label, type = "text", value, onChange, error, placeholder, isValid, maxLength, colors, isDark }: any) => (
    <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
            {error && <span style={{ color: colors.crimson, fontSize: 9, fontWeight: 500 }}>{error}</span>}
        </div>
        <div style={{ position: "relative" }}>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    paddingRight: isValid ? 32 : 12,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${error ? colors.crimson : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: 'border-box',
                    transition: "all 0.2s ease"
                }}
            />
            {isValid && (
                <div style={{ 
                    position: "absolute", 
                    right: 10, 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    color: colors.emerald, 
                    fontSize: 12,
                    fontWeight: 600,
                    animation: 'fadeIn 0.2s ease'
                }}>✓</div>
            )}
        </div>
    </div>
);

// Password Field Component - Compact
const PasswordField = ({ label, value, onChange, error, show, onToggle, colors, isDark }: any) => (
    <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
            {error && <span style={{ color: colors.crimson, fontSize: 9, fontWeight: 500 }}>{error}</span>}
        </div>
        <div style={{ position: "relative" }}>
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="••••••••"
                style={{
                    width: "100%",
                    padding: "10px 44px 10px 12px",
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${error ? colors.crimson : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: 'border-box',
                    transition: "all 0.2s ease"
                }}
            />
            <button 
                type="button" 
                onClick={onToggle} 
                style={{ 
                    position: "absolute", 
                    right: 12, 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    background: "none", 
                    border: "none", 
                    color: colors.textTertiary, 
                    cursor: "pointer", 
                    fontSize: 10, 
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    padding: '4px',
                    transition: 'color 0.2s ease'
                }}
            >
                {show ? "HIDE" : "SHOW"}
            </button>
        </div>
    </div>
);
