import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Logo } from '../components/ui/Logo';
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
    teal: "#14B8A6",
};

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

export default function SignupPage() {
    const navigate = useNavigate();

    // Steps: 'DETAILS' | 'OTP'
    const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');

    // Base Form Data - Only Gym Owner for now
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gymName: "", // Owners need to create a gym
        gymAddress: "",
        gymCity: "",
        gymPhone: ""
    });

    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const passwordStrength = getPasswordStrength(formData.password);

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors };

        // Base fields
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
            if (value !== formData.password) newErrors.confirmPassword = "Mismatch";
            else delete newErrors.confirmPassword;
        }

        // Gym details
        if (name === 'gymName') !value ? newErrors.gymName = "Required" : delete newErrors.gymName;

        setErrors(newErrors);
    };

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");

        if (Object.keys(errors).length > 0) return;
        if (!formData.fullName || !formData.email || !formData.password || !formData.gymName) {
            setApiError("Please fill all required fields");
            return;
        }

        setIsLoading(true);

        try {
            await api.sendOtp(formData.email, 'SIGNUP');
            setStep('OTP');
            setSuccessMessage(`Verification code sent to ${formData.email}`);
        } catch (err: any) {
            console.error("Send OTP error:", err);
            setApiError(err.response?.data?.error || "Failed to send verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");

        if (otp.length !== 6) {
            setApiError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.ownerRegister({
                ...formData,
                ownerName: formData.fullName,
                otp: otp
            });

            if (response && response.token) {
                localStorage.setItem('user', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                navigate('/dashboard');
            } else {
                // Should not happen if successful, but fallback
                navigate('/login?signup=success');
            }
        } catch (err: any) {
            console.error("Signup error:", err);
            setApiError(err.response?.data?.error || "Registration failed. Please check OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle social login success
    const handleSocialSuccess = (data: any) => {
        localStorage.setItem('user', JSON.stringify(data));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
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
            {/* Left Sidebar - Hidden on mobile */}
            <div className="signup-sidebar" style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                display: "none",
            }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/login-sidebar.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${colors.bgPrimary} 0%, rgba(13,13,13,0.6) 50%, rgba(13,13,13,0.4) 100%)` }} />
                <div style={{ position: "absolute", bottom: 60, left: 60, maxWidth: 480 }}>
                    <Logo size={48} showText={false} />
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, lineHeight: 1.1, marginTop: 24 }}>Join <span style={{ color: colors.crimson }}>AthlonX</span></h1>
                    <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>Start your fitness journey with the most powerful gym management platform.</p>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "30px 40px",
                background: colors.bgPrimary,
                position: "relative",
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: "100vh"
            }}>
                <div style={{ width: "100%", maxWidth: 480 }}>
                    <button onClick={() => navigate('/')} style={{ position: "absolute", top: 20, right: 30, background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", fontSize: 12, zIndex: 10 }}>Back to Home</button>

                    {/* Header */}
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
                            {step === 'OTP' ? 'Verification' : 'Register Gym'}
                        </h2>
                        <p style={{ color: colors.textSecondary, fontSize: 13 }}>
                            {step === 'OTP' ? `Enter the code sent to ${formData.email}` : 'Create your account and gym workspace'}
                        </p>
                    </div>

                    {/* Fixed height message container - prevents layout shift */}
                    <div style={{ minHeight: 42, marginBottom: 6 }}>
                        {apiError && (
                            <div style={{ padding: "8px 12px", background: "rgba(220, 38, 38, 0.1)", border: `1px solid ${colors.crimson}`, borderRadius: 8, color: colors.crimson, fontSize: 12, textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
                                ⚠ {apiError}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{ padding: "8px 12px", background: "rgba(16, 185, 129, 0.1)", border: `1px solid ${colors.emerald}`, borderRadius: 8, color: colors.emerald, fontSize: 12, textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
                                ✓ {successMessage}
                            </div>
                        )}
                    </div>

                    {step === 'DETAILS' ? (
                        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Personal Details */}
                            <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginTop: 8 }}>Personal Details</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ gridColumn: "span 2" }}>
                                    <InputField
                                        label="Full Name"
                                        value={formData.fullName}
                                        onChange={(val: string) => handleChange('fullName', val)}
                                        error={errors.fullName}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <InputField
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(val: string) => handleChange('email', val)}
                                    error={errors.email}
                                    placeholder="name@company.com"
                                    isValid={isValidEmail(formData.email)}
                                />

                                <InputField
                                    label="Phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(val: string) => handleChange('phone', val)}
                                    error={errors.phone}
                                    placeholder="9876543210"
                                    maxLength={10}
                                    isValid={isValidIndianPhone(formData.phone)}
                                />
                            </div>

                            {/* Gym Details */}
                            <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginTop: 16 }}>Gym Details</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                                <InputField
                                    label="Gym Name"
                                    value={formData.gymName}
                                    onChange={(val: string) => handleChange('gymName', val)}
                                    error={errors.gymName}
                                    placeholder="My awesome gym"
                                />
                            </div>

                            {/* Passwords */}
                            <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', marginTop: 16 }}>Security</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <PasswordField
                                    label="Password"
                                    value={formData.password}
                                    onChange={(val: string) => handleChange('password', val)}
                                    error={errors.password}
                                    show={showPassword}
                                    onToggle={() => setShowPassword(!showPassword)}
                                />
                                <PasswordField
                                    label="Confirm"
                                    value={formData.confirmPassword}
                                    onChange={(val: string) => handleChange('confirmPassword', val)}
                                    error={errors.confirmPassword}
                                    show={showConfirmPassword}
                                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            </div>

                            {/* Strength Meter (Compact) */}
                            {formData.password && (
                                <div style={{ display: "flex", alignItems: 'center', gap: 8, marginTop: -4 }}>
                                    <div style={{ display: "flex", gap: 2, flex: 1, height: 3 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ flex: 1, borderRadius: 2, background: i <= passwordStrength ? (passwordStrength < 3 ? colors.crimson : colors.emerald) : colors.bgTertiary }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 10, color: colors.textTertiary, whiteSpace: 'nowrap' }}>
                                        {passwordStrength === 4 ? "Strong" : "Weak"}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    marginTop: 12,
                                    background: `linear-gradient(to right, ${colors.crimson}, ${colors.crimsonHover})`,
                                    border: "none",
                                    borderRadius: 12,
                                    color: "#fff",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: "all 0.2s"
                                }}
                            >
                                {isLoading ? "Sending Code..." : "Next: Verify Email"}
                            </button>

                            {/* Social Login Buttons */}
                            <SocialLoginButtons
                                onSuccess={handleSocialSuccess}
                                onError={(err) => setApiError(err)}
                                mode="signup"
                            />

                            <p style={{ textAlign: "center", marginTop: 12, color: colors.textSecondary, fontSize: 13 }}>
                                Already have an account? <span onClick={() => navigate('/login')} style={{ color: colors.crimson, cursor: "pointer", textDecoration: "underline" }}>Login</span>
                            </p>

                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
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
                                    cursor: isLoading || otp.length !== 6 ? "not-allowed" : "pointer",
                                    opacity: isLoading || otp.length !== 6 ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 12,
                                }}
                            >
                                {isLoading ? "Creating Account..." : "Verify & Register"}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <button
                                    type="button"
                                    onClick={() => setStep('DETAILS')}
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
                </div>
                {/* Copyright pushed to bottom with margin auto top if needed, 
                    but here sticking it to normal flow to avoid overlapping content on small screens */}
                <div style={{ marginTop: 24, fontSize: 12, color: colors.textTertiary }}>© 2025 AthlonX Inc.</div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .signup-sidebar { display: block !important; }
                }
                input:focus { border-color: #10B981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1); }
                
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #0D0D0D; }
                ::-webkit-scrollbar-thumb { background: #252525; borderRadius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: #353535; }
            `}</style>
        </div>
    );
}

// Components
const InputField = ({ label, type = "text", value, onChange, error, placeholder, isValid, maxLength }: any) => (
    <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
            {error && <span style={{ color: colors.crimson, fontSize: 10 }}>{error}</span>}
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
                    padding: "12px",
                    background: colors.bgSecondary,
                    border: `1px solid ${error ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 14,
                    outline: "none",
                    transition: "border 0.2s"
                }}
            />
            {isValid && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: colors.emerald, fontSize: 12 }}>✓</div>}
        </div>
    </div>
);

const PasswordField = ({ label, value, onChange, error, show, onToggle }: any) => (
    <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: colors.textSecondary, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
        <div style={{ position: "relative" }}>
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%",
                    padding: "12px 36px 12px 12px",
                    background: colors.bgSecondary,
                    border: `1px solid ${error ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 14,
                    outline: "none",
                }}
            />
            <button type="button" onClick={onToggle} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: colors.textTertiary, cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                {show ? "HIDE" : "SHOW"}
            </button>
        </div>
        {error && <div style={{ color: colors.crimson, fontSize: 10, marginTop: 2 }}>{error}</div>}
    </div>
);
