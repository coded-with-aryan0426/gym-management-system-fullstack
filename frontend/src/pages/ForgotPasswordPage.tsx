import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import OtpInput from '../components/auth/OtpInput';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const getColors = (isDark: boolean) => ({
    bgPrimary: isDark ? "#0D0D0D" : "#F8FAFC",
    bgSecondary: isDark ? "#1A1A1A" : "#FFFFFF",
    borderPrimary: isDark ? "#1F2937" : "#E2E8F0",
    textPrimary: isDark ? "#F9FAFB" : "#0F172A",
    textSecondary: isDark ? "#9CA3AF" : "#64748B",
    crimson: "#DC2626",
    crimsonHover: "#B91C1C",
    emerald: "#10B981",
});

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const colors = getColors(isDark);

    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Password validation
    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 1, label: 'Weak', color: '#EF4444' };
        if (strength <= 4) return { strength: 2, label: 'Medium', color: '#F59E0B' };
        return { strength: 3, label: 'Strong', color: '#10B981' };
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password/request', { email });
            setSuccessMessage('Verification code sent to your email');
            setStep('OTP');
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password/verify', { email, otp });
            setSuccessMessage('Code verified! Set your new password');
            setStep('NEW_PASSWORD');
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Invalid or expired verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password/reset', {
                email,
                otp,
                newPassword
            });
            setStep('SUCCESS');
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div style={{
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
            background: colors.bgPrimary,
            color: colors.textPrimary,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Inter', sans-serif",
            transition: "background-color 0.3s ease, color 0.3s ease",
        }}>
            <div style={{ width: "100%", maxWidth: 420, padding: "40px" }}>
                {/* Back button */}
                <button
                    onClick={() => step === 'EMAIL' ? navigate('/login') : setStep('EMAIL')}
                    style={{
                        position: "absolute",
                        top: 40,
                        left: 40,
                        background: "transparent",
                        border: "none",
                        color: colors.textSecondary,
                        cursor: "pointer",
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    ← {step === 'EMAIL' ? 'Back to Login' : 'Start Over'}
                </button>

                {/* Header */}
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            borderRadius: 999,
                            background: isDark ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 38, 38, 0.08)',
                            border: `1px solid ${isDark ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)'}`,
                        }}>
                            <Logo size={20} showText={false} />
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: colors.crimson
                            }}>
                                AthlonX
                            </span>
                        </div>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                        {step === 'SUCCESS' ? 'Password Reset!' : 'Reset Password'}
                    </h2>
                    <p style={{ color: colors.textSecondary, fontSize: 14 }}>
                        {step === 'EMAIL' && "Enter your email to receive a verification code"}
                        {step === 'OTP' && `Enter the code sent to ${email}`}
                        {step === 'NEW_PASSWORD' && "Create a new secure password"}
                        {step === 'SUCCESS' && "Your password has been successfully reset"}
                    </p>
                </div>

                {/* Messages */}
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
                        }}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {successMessage && !error && step !== 'SUCCESS' && (
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
                        }}>
                            <span>✓</span> {successMessage}
                        </div>
                    )}
                </div>

                {/* Step 1: Email */}
                {step === 'EMAIL' && (
                    <form onSubmit={handleSendOtp}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 600,
                                color: colors.textSecondary,
                                marginBottom: 5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: isLoading ? colors.textSecondary : colors.crimson,
                                border: "none",
                                borderRadius: 10,
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 'OTP' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ marginBottom: 20 }}>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                length={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: isLoading || otp.length !== 6 ? colors.textSecondary : colors.crimson,
                                border: "none",
                                borderRadius: 10,
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isLoading || otp.length !== 6 ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                                marginBottom: 16,
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: "transparent",
                                border: `1px solid ${colors.borderPrimary}`,
                                borderRadius: 10,
                                color: colors.textSecondary,
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            Resend Code
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 'NEW_PASSWORD' && (
                    <form onSubmit={handleResetPassword}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 600,
                                color: colors.textSecondary,
                                marginBottom: 5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                New Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
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
                                        color: colors.textSecondary,
                                        cursor: "pointer",
                                        fontSize: 13,
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                            
                            {/* Password strength indicator */}
                            {newPassword && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: 4,
                                        marginBottom: 4,
                                    }}>
                                        {[1, 2, 3].map((level) => (
                                            <div
                                                key={level}
                                                style={{
                                                    flex: 1,
                                                    height: 4,
                                                    borderRadius: 2,
                                                    background: passwordStrength.strength >= level
                                                        ? passwordStrength.color
                                                        : colors.borderPrimary,
                                                    transition: 'background 0.2s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{
                                        fontSize: 11,
                                        color: passwordStrength.color,
                                    }}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 600,
                                color: colors.textSecondary,
                                marginBottom: 5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: colors.bgSecondary,
                                    border: `1px solid ${newPassword && confirmPassword && newPassword !== confirmPassword ? colors.crimson : colors.borderPrimary}`,
                                    borderRadius: 10,
                                    color: colors.textPrimary,
                                    fontSize: 14,
                                    outline: "none",
                                }}
                            />
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <span style={{ fontSize: 11, color: colors.crimson, marginTop: 4, display: 'block' }}>
                                    Passwords do not match
                                </span>
                            )}
                        </div>

                        {/* Password requirements */}
                        <div style={{
                            padding: 12,
                            background: colors.bgSecondary,
                            borderRadius: 8,
                            marginBottom: 20,
                            fontSize: 12,
                            color: colors.textSecondary,
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Password must contain:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ color: newPassword.length >= 8 ? colors.emerald : colors.textSecondary }}>
                                    {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                                </span>
                                <span style={{ color: /[A-Z]/.test(newPassword) ? colors.emerald : colors.textSecondary }}>
                                    {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                                </span>
                                <span style={{ color: /[a-z]/.test(newPassword) ? colors.emerald : colors.textSecondary }}>
                                    {/[a-z]/.test(newPassword) ? '✓' : '○'} One lowercase letter
                                </span>
                                <span style={{ color: /[0-9]/.test(newPassword) ? colors.emerald : colors.textSecondary }}>
                                    {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: isLoading ? colors.textSecondary : colors.crimson,
                                border: "none",
                                borderRadius: 10,
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Step 4: Success */}
                {step === 'SUCCESS' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: 36,
                        }}>
                            ✓
                        </div>
                        <p style={{ color: colors.textSecondary, marginBottom: 24 }}>
                            You can now log in with your new password
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: colors.crimson,
                                border: "none",
                                borderRadius: 10,
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
