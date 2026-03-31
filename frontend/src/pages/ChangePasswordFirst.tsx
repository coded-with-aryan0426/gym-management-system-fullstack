import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Logo } from '../components/ui/Logo';
import { useAuthModal } from '../contexts/AuthModalContext';

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

const ChangePasswordFirst: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openAuthModal } = useAuthModal();

    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await api.changePasswordFirstLogin(formData);
            setSuccess("Password changed successfully! Redirecting...");
            setTimeout(() => {
                navigate('/');
                openAuthModal('login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to change password");
        } finally {
            setLoading(false);
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', sans-serif",
            padding: 24
        }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <Logo size={64} />
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
                        Secure Your Account
                    </h2>
                    <p style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
                        It looks like this is your first time logging in.<br />
                        Please create a new, secure password.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: "12px",
                        background: "rgba(220, 38, 38, 0.1)",
                        border: `1px solid ${colors.crimson}`,
                        borderRadius: 8,
                        color: colors.crimson,
                        marginBottom: 20,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span>⚠</span> {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: "12px",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: `1px solid ${colors.emerald}`,
                        borderRadius: 8,
                        color: colors.emerald,
                        marginBottom: 20,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span>✓</span> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: colors.bgSecondary,
                                border: `1px solid ${colors.borderPrimary}`,
                                borderRadius: 12,
                                color: colors.textSecondary, // Dimmed since disabled
                                fontSize: 15,
                                outline: "none",
                                cursor: "not-allowed",
                                opacity: 0.7
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            New Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="Enter new password"
                                required
                                style={{
                                    width: "100%",
                                    padding: "14px 48px 14px 14px",
                                    background: colors.bgSecondary,
                                    border: `1px solid ${colors.borderPrimary}`,
                                    borderRadius: 12,
                                    color: colors.textPrimary,
                                    fontSize: 15,
                                    outline: "none",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "transparent",
                                    border: "none",
                                    color: colors.textTertiary,
                                    cursor: "pointer",
                                }}
                            >
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Confirm New Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Re-enter new password"
                            required
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: colors.bgSecondary,
                                border: `1px solid ${colors.borderPrimary}`,
                                borderRadius: 12,
                                color: colors.textPrimary,
                                fontSize: 15,
                                outline: "none",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: `linear-gradient(to right, ${colors.crimson}, ${colors.crimsonHover})`,
                            border: "none",
                            borderRadius: 12,
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                        }}
                    >
                        {loading ? "Updating..." : "Change Password & Login"}
                    </button>
                </form>
            </div>

            <style>{`
                input:focus {
                    border-color: #10B981 !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
                    transition: all 0.2s ease !important;
                }
            `}</style>
        </div>
    );
};

export default ChangePasswordFirst;
