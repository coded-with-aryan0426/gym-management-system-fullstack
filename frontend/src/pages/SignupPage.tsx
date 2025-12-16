import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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

    // 1. Role Selection
    const [selectedRole, setSelectedRole] = useState<'OWNER' | 'TRAINER' | null>(null);

    // 2. Base Form Data
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    // 3. Staff Specific Data
    const [staffData, setStaffData] = useState({
        gymName: "",
        gymAddress: "",
        gymCity: "",
        gymPhone: "",
        inviteCode: "",
    });

    // 4. Member Specific Data
    const [memberData, setMemberData] = useState({
        inviteCode: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState("");

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

        // TEMPORARILY DISABLED: Add New Gym feature
        // if (selectedRole === 'OWNER') {
        //     if (name === 'gymName') !value ? newErrors.gymName = "Required" : delete newErrors.gymName;
        //     if (name === 'gymAddress') !value ? newErrors.gymAddress = "Required" : delete newErrors.gymAddress;
        //     if (name === 'gymCity') !value ? newErrors.gymCity = "Required" : delete newErrors.gymCity;
        // } else if (selectedRole === 'TRAINER') {
        //     if (name === 'inviteCodeStaff') !value ? newErrors.inviteCodeStaff = "Required" : delete newErrors.inviteCodeStaff;
        // }
        // Trainer validation (standalone since OWNER is disabled)
        if (selectedRole === 'TRAINER') {
            if (name === 'inviteCodeStaff') !value ? newErrors.inviteCodeStaff = "Required" : delete newErrors.inviteCodeStaff;
        }

        setErrors(newErrors);
    };

    const handleBaseChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleStaffChange = (name: string, value: string) => {
        setStaffData({ ...staffData, [name]: value });
        validateField(name, value);
    };

    const handleMemberChange = (name: string, value: string) => {
        setMemberData({ ...memberData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");

        if (!selectedRole) {
            setApiError("Please select a role");
            return;
        }

        if (Object.keys(errors).length > 0) return;
        if (!formData.fullName || !formData.email || !formData.password) return;

        setIsLoading(true);

        try {
            let response;
            if (selectedRole === 'OWNER' || selectedRole === 'TRAINER') {
                // V1: Simple signup with role, no gym logic
                const payload = {
                    ...formData,
                    role: selectedRole, // V1: Include role in payload
                };
                response = await api.signupStaff(payload);
            } else {
                const payload = {
                    ...formData,
                };
                response = await api.signupMember(payload);
            }

            if (response && response.token) {
                // AUTO-LOGIN: Store token and user data 
                localStorage.setItem('user', JSON.stringify(response));
                localStorage.setItem('token', response.token);

                // V1: Direct redirect to dashboard (no gym checks)
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.response) {
                // Server responded with a status code outside 2xx
                setApiError(err.response.data?.error || `Server error: ${err.response.status}`);
            } else if (err.request) {
                // Request made but no response received
                setApiError("Unable to reach server. Please check your connection.");
            } else {
                // Something else happened
                setApiError(err.message || "An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
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
                    <AthlonXLogo size="xl" showText={false} />
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
                // Changed from justify-content: center to flex-start with top spacing to prevent layout "explosion"
                padding: "40px",
                paddingTop: "60px",
                background: colors.bgPrimary,
                position: "relative",
                overflowY: "auto",
                overflowX: "hidden",
            }}>
                <div style={{ width: "100%", maxWidth: 520 }}>
                    <button onClick={() => navigate('/')} style={{ position: "absolute", top: 30, right: 30, background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", fontSize: 13, zIndex: 10 }}>Back to Home</button>

                    <div style={{ marginBottom: 24, textAlign: 'center' }}>
                        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Account</h2>
                        <p style={{ color: colors.textSecondary, fontSize: 14 }}>Start your fitness journey today</p>
                    </div>

                    {/* V1 Explicit Role Selection */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: "flex", gap: 10, background: colors.bgTertiary, padding: 4, borderRadius: 14 }}>
                            <RoleButton
                                active={selectedRole === 'OWNER'}
                                onClick={() => setSelectedRole('OWNER')}
                                icon={<GymIcon />}
                                title="Gym Owner"
                                color={colors.crimson}
                            />
                            {/* Note: Gym Details form is disabled - Owner signup will use invite code like Trainer */}
                            <RoleButton
                                active={selectedRole === 'TRAINER'}
                                onClick={() => setSelectedRole('TRAINER')}
                                icon={<TrainerIcon />}
                                title="Trainer"
                                color="#D97706"
                            />
                        </div>
                        {!selectedRole && <p style={{ textAlign: "center", fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>Select a role to proceed</p>}
                    </div>

                    {apiError && (
                        <div style={{ padding: "10px", background: "rgba(220, 38, 38, 0.1)", border: `1px solid ${colors.crimson}`, borderRadius: 8, color: colors.crimson, marginBottom: 16, fontSize: 13, textAlign: 'center' }}>
                            ⚠ {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Common Fields - Compact Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <InputField
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(val: string) => handleBaseChange('fullName', val)}
                                    error={errors.fullName}
                                    placeholder="John Doe"
                                />
                            </div>

                            <InputField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(val: string) => handleBaseChange('email', val)}
                                error={errors.email}
                                placeholder="name@company.com"
                                isValid={isValidEmail(formData.email)}
                            />

                            <InputField
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(val: string) => handleBaseChange('phone', val)}
                                error={errors.phone}
                                placeholder="9876543210"
                                maxLength={10}
                                isValid={isValidIndianPhone(formData.phone)}
                            />
                        </div>

                        {/* Expandable Sections */}
                        <div style={{
                            maxHeight: selectedRole ? '500px' : '0',
                            overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: selectedRole ? 1 : 0,
                            marginBottom: selectedRole ? 12 : 0
                        }}>
                            {/* TEMPORARILY DISABLED: Gym Owner form fields - Add New Gym feature
                            {selectedRole === 'OWNER' && (
                                <div style={{ padding: 16, background: "rgba(220, 38, 38, 0.05)", borderRadius: 12, border: `1px solid ${colors.crimson}40`, marginTop: 4 }}>
                                    <h4 style={{ fontSize: 12, color: colors.crimson, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>Gym Details</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <InputField label="Gym Name" value={staffData.gymName} onChange={(val: string) => handleStaffChange('gymName', val)} error={errors.gymName} placeholder="Apex Fitness" />
                                        </div>
                                        <InputField label="City" value={staffData.gymCity} onChange={(val: string) => handleStaffChange('gymCity', val)} error={errors.gymCity} placeholder="Mumbai" />
                                        <InputField label="Phone (Opt)" value={staffData.gymPhone} onChange={(val: string) => handleStaffChange('gymPhone', val)} placeholder="9876543210" maxLength={10} />
                                        <div style={{ gridColumn: "span 2" }}>
                                            <InputField label="Address" value={staffData.gymAddress} onChange={(val: string) => handleStaffChange('gymAddress', val)} error={errors.gymAddress} placeholder="123 Main St" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            */}

                            {/* TEMPORARILY DISABLED: Trainer Join Workspace form fields
                            {selectedRole === 'TRAINER' && (
                                <div style={{ padding: 16, background: "rgba(217, 119, 6, 0.05)", borderRadius: 12, border: `1px solid #D9770640`, marginTop: 4 }}>
                                    <h4 style={{ fontSize: 12, color: "#D97706", marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>Join a Workspace</h4>
                                    <InputField
                                        label="Gym Invite Code"
                                        value={staffData.inviteCode}
                                        onChange={(val: string) => handleStaffChange('inviteCode', val)}
                                        error={errors.inviteCode}
                                        placeholder="Enter code from your manager"
                                    />
                                </div>
                            )}
                            */}

                        </div>

                        {/* Passwords */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <PasswordField
                                label="Password"
                                value={formData.password}
                                onChange={(val: string) => handleBaseChange('password', val)}
                                error={errors.password}
                                show={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                            />
                            <PasswordField
                                label="Confirm"
                                value={formData.confirmPassword}
                                onChange={(val: string) => handleBaseChange('confirmPassword', val)}
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
                            disabled={isLoading || !selectedRole}
                            style={{
                                width: "100%",
                                padding: "14px",
                                marginTop: 12,
                                background: selectedRole ? (selectedRole === 'TRAINER' ? '#D97706' : colors.crimson) : colors.bgTertiary,
                                border: "none",
                                borderRadius: 12,
                                color: selectedRole ? "#fff" : colors.textTertiary,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: isLoading || !selectedRole ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                transition: "all 0.2s"
                            }}
                        >
                            {isLoading ? "Creating..." : /* selectedRole === 'OWNER' ? "Create Gym & Account" : */ "Create Account"}
                        </button>

                        <p style={{ textAlign: "center", marginTop: 12, color: colors.textSecondary, fontSize: 13 }}>
                            Already have an account? <span onClick={() => navigate('/login')} style={{ color: colors.crimson, cursor: "pointer", textDecoration: "underline" }}>Login</span>
                        </p>

                    </form>
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
const RoleButton = ({ active, onClick, icon, title, color }: any) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            flex: 1,
            padding: "10px 4px",
            background: active ? color : "transparent",
            borderRadius: 10,
            border: "none",
            color: active ? "#fff" : colors.textSecondary,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.2s"
        }}
    >
        {icon}
        {title}
    </button>
);

const RadioOption = ({ checked, onChange, label }: any) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <div style={{
            width: 16, height: 16, borderRadius: '50%', border: `2px solid ${checked ? colors.crimson : colors.textTertiary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {checked && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.crimson }} />}
        </div>
        <span style={{ fontSize: 13, color: checked ? colors.textPrimary : colors.textSecondary, fontWeight: 500 }}>{label}</span>
        {/* Hidden native input for accessibility if needed, but managing via div for style */}
        <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }} />
    </label>
);

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

// Icons
const GymIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" /></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>;
const TrainerIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>;
