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
    emerald: "#10B981",
    amber: "#F59E0B",
    borderSecondary: "#374151",
};

export default function SignupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        gymName: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        plan: "starter",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const onNavigate = (page: string) => {
        navigate('/' + page);
    };

    const onSignup = () => {
        navigate('/dashboard');
    };

    const plans = [
        {
            id: "starter",
            name: "Starter",
            price: "$49",
            period: "/month",
            features: ["Up to 100 members", "Basic reporting", "Email support", "1 staff account"],
        },
        {
            id: "professional",
            name: "Professional",
            price: "$99",
            period: "/month",
            features: ["Up to 500 members", "Advanced analytics", "Priority support", "5 staff accounts", "API access"],
            popular: true,
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "$199",
            period: "/month",
            features: ["Unlimited members", "Custom reports", "24/7 phone support", "Unlimited staff", "White-label option"],
        },
    ]

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.gymName) newErrors.gymName = "Gym name is required"
        if (!formData.fullName) newErrors.fullName = "Full name is required"
        if (!formData.email) newErrors.email = "Email is required"
        if (!formData.phone) newErrors.phone = "Phone is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.password) newErrors.password = "Password is required"
        if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2)
        } else if (step === 2 && validateStep2()) {
            setStep(3)
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const payload = {
                username: formData.email, // Using email as username for simplicity or separate them
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                // Roles handled by backend default or we can send role: 'ADMIN' if plan is Enterprise etc.
            };

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSignup();
            } else {
                const msg = await response.text();
                alert('Signup failed: ' + msg);
            }
        } catch (err) {
            alert('An error occurred');
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
                className="signup-sidebar"
                style={{
                    width: "400px", // Fixed width for sidebar on large screens
                    position: "relative",
                    overflow: "hidden",
                    display: "none", // Hidden on mobile by default
                    flexShrink: 0
                }}
            >
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "url('/signup-sidebar.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} />

                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top, ${colors.bgPrimary} 0%, rgba(13,13,13,0.7) 40%, rgba(13,13,13,0.3) 100%)`
                }} />

                <div style={{
                    position: "absolute",
                    bottom: 60,
                    left: 40,
                    right: 40,
                    animation: "fadeInUp 0.8s ease-out"
                }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            background: colors.crimson,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 24,
                            marginBottom: 20,
                            color: "#fff",
                        }}
                    >
                        A
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
                        Join the Movement
                    </h2>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                        "AthlonX helped us grow our membership by 300% in just 6 months. It's the only software you'll ever need."
                    </p>
                    <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#333", border: "2px solid white" }}></div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>Sarah Jenkins</div>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>Owner, IronClad Fitness</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Content */}
            <div style={{ flex: 1, height: "100vh", overflowY: "auto", position: "relative" }}>

                {/* Top Bar */}
                <header
                    style={{
                        padding: "24px 40px",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ color: colors.textSecondary, fontSize: 14 }}>Already have an account?</span>
                        <button
                            onClick={() => onNavigate("login")}
                            style={{
                                background: "transparent",
                                border: `1px solid ${colors.borderSecondary}`,
                                color: colors.textPrimary,
                                padding: "10px 20px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: 14,
                                fontWeight: 500,
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = colors.textPrimary; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = colors.borderSecondary; }}
                        >
                            Log In
                        </button>
                    </div>
                </header>

                {/* Main Form Content */}
                <div style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>

                    {/* Steps Indicator */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 48 }}>
                        {[1, 2, 3].map((s) => (
                            <div key={s} style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: step >= s ? colors.crimson : colors.bgTertiary,
                                        border: step >= s ? "none" : `1px solid ${colors.borderPrimary}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        color: step >= s ? "#fff" : colors.textTertiary,
                                        transition: "all 0.3s"
                                    }}
                                >
                                    {step > s ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        s
                                    )}
                                </div>
                                {s < 3 && (
                                    <div
                                        style={{
                                            width: 60,
                                            height: 2,
                                            background: step > s ? colors.crimson : colors.borderPrimary,
                                            margin: "0 12px",
                                            transition: "all 0.3s"
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Steps with Animation */}
                    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>
                                    Let's get you started
                                </h2>
                                <p style={{ color: colors.textSecondary, marginBottom: 40, textAlign: "center", fontSize: 16 }}>
                                    Enter your business details to create your workspace.
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <InputField
                                        label="Gym Name"
                                        value={formData.gymName}
                                        onChange={(v) => setFormData({ ...formData, gymName: v })}
                                        placeholder="Apex Fitness Center"
                                        error={errors.gymName}
                                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8" /></svg>}
                                    />
                                    <InputField
                                        label="Your Full Name"
                                        value={formData.fullName}
                                        onChange={(v) => setFormData({ ...formData, fullName: v })}
                                        placeholder="John Doe"
                                        error={errors.fullName}
                                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                                    />
                                    <InputField
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(v) => setFormData({ ...formData, email: v })}
                                        placeholder="john@apexfitness.com"
                                        error={errors.email}
                                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
                                    />
                                    <InputField
                                        label="Phone Number"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(v) => setFormData({ ...formData, phone: v })}
                                        placeholder="+1 (555) 000-0000"
                                        error={errors.phone}
                                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
                                    />
                                </div>

                                <button
                                    onClick={handleNext}
                                    style={{
                                        width: "100%",
                                        padding: "16px",
                                        background: colors.crimson,
                                        border: "none",
                                        borderRadius: 12,
                                        color: "#fff",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        marginTop: 40,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 12,
                                        boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)"
                                    }}
                                >
                                    Continue
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Password */}
                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Secure your account</h2>
                                <p style={{ color: colors.textSecondary, marginBottom: 40, textAlign: "center", fontSize: 16 }}>
                                    Create a strong password to protect your data.
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <InputField
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(v) => setFormData({ ...formData, password: v })}
                                        placeholder="Min. 8 characters"
                                        error={errors.password}
                                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                    />
                                    <InputField
                                        label="Confirm Password"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
                                        placeholder="Repeat your password"
                                        error={errors.confirmPassword}
                                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                    />

                                    <div
                                        style={{
                                            background: colors.bgSecondary,
                                            padding: 20,
                                            borderRadius: 12,
                                            border: `1px solid ${colors.borderPrimary}`,
                                            marginTop: 8
                                        }}
                                    >
                                        <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, fontWeight: 600, textTransform: "uppercase" }}>Password requirements:</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {[
                                                { label: "At least 8 characters", valid: formData.password.length >= 8 },
                                                { label: "One uppercase letter", valid: /[A-Z]/.test(formData.password) },
                                                { label: "One number", valid: /[0-9]/.test(formData.password) },
                                            ].map((req) => (
                                                <div key={req.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div
                                                        style={{
                                                            width: 18,
                                                            height: 18,
                                                            borderRadius: "50%",
                                                            background: req.valid ? colors.emerald : colors.bgTertiary,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            transition: "background 0.2s"
                                                        }}
                                                    >
                                                        {req.valid && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: 14, color: req.valid ? colors.emerald : colors.textTertiary, transition: "color 0.2s" }}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
                                    <button
                                        onClick={() => setStep(1)}
                                        style={{
                                            flex: 1,
                                            padding: "16px",
                                            background: colors.bgSecondary,
                                            border: `1px solid ${colors.borderPrimary}`,
                                            borderRadius: 12,
                                            color: colors.textPrimary,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = colors.bgTertiary}
                                        onMouseOut={(e) => e.currentTarget.style.background = colors.bgSecondary}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        style={{
                                            flex: 2,
                                            padding: "16px",
                                            background: colors.crimson,
                                            border: "none",
                                            borderRadius: 12,
                                            color: "#fff",
                                            fontSize: 16,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 12,
                                            boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)"
                                        }}
                                    >
                                        Continue
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Plan Selection */}
                        {step === 3 && (
                            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Choose a plan</h2>
                                <p style={{ color: colors.textSecondary, marginBottom: 40, textAlign: "center", fontSize: 16 }}>
                                    Start with a 14-day free trial. No commitments.
                                </p>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setFormData({ ...formData, plan: plan.id })}
                                            style={{
                                                background: colors.bgSecondary,
                                                border: `2px solid ${formData.plan === plan.id ? colors.crimson : colors.borderPrimary}`,
                                                borderRadius: 16,
                                                padding: 20,
                                                cursor: "pointer",
                                                position: "relative",
                                                transition: "all 0.2s",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 20
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: "50%",
                                                    border: `2px solid ${formData.plan === plan.id ? colors.crimson : colors.borderSecondary}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {formData.plan === plan.id && (
                                                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: colors.crimson }} />
                                                )}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{plan.name}</h3>
                                                    {plan.popular && <span style={{ fontSize: 12, fontWeight: 700, color: colors.crimson, background: `${colors.crimson}20`, padding: "2px 8px", borderRadius: 10 }}>POPULAR</span>}
                                                </div>
                                                <div style={{ fontSize: 14, color: colors.textSecondary }}>{plan.features.slice(0, 3).join(" • ")}</div>
                                            </div>

                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: 20, fontWeight: 700 }}>{plan.price}</div>
                                                <div style={{ fontSize: 12, color: colors.textSecondary }}>{plan.period}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
                                    <button
                                        onClick={() => setStep(2)}
                                        style={{
                                            flex: 1,
                                            padding: "16px",
                                            background: colors.bgSecondary,
                                            border: `1px solid ${colors.borderPrimary}`,
                                            borderRadius: 12,
                                            color: colors.textPrimary,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = colors.bgTertiary}
                                        onMouseOut={(e) => e.currentTarget.style.background = colors.bgSecondary}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        style={{
                                            flex: 2,
                                            padding: "16px",
                                            background: colors.crimson,
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
                                            boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)"
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
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Complete Signup
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
            .signup-sidebar {
                display: block !important;
            }
        }
      `}</style>
        </div>
    )
}

// Helper component for cleaner inputs
function InputField({ label, value, onChange, type = "text", placeholder, error, icon }: any) {
    const colors = {
        bgSecondary: "#1A1A1A",
        borderPrimary: "#1F2937",
        textPrimary: "#F9FAFB",
        textSecondary: "#9CA3AF",
        textTertiary: "#6B7280",
        crimson: "#DC2626",
    };

    return (
        <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
            <div style={{ position: "relative" }}>
                {icon && (
                    <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.textTertiary }}>
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        padding: icon ? "14px 16px 14px 48px" : "14px 16px",
                        background: colors.bgSecondary,
                        border: `1px solid ${error ? colors.crimson : colors.borderPrimary}`,
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
                        e.target.style.borderColor = error ? colors.crimson : colors.borderPrimary;
                        e.target.style.boxShadow = "none";
                    }}
                />
            </div>
            {error && (
                <span style={{ color: colors.crimson, fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    {error}
                </span>
            )}
        </div>
    )
}
