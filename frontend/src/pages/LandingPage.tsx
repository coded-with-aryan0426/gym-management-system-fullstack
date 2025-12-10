import { useNavigate } from 'react-router-dom';
import { AthlonXLogo } from '../components/ui/AthlonXLogo';

// Color System matching reference design
const colors = {
    bgPrimary: "#0D0D0D",
    bgSecondary: "#1A1A1A",
    bgTertiary: "#252525",
    bgElevated: "#2A2A2A",
    borderPrimary: "#1F2937",
    borderSecondary: "#374151",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",
    crimson: "#DC2626",
    crimsonHover: "#B91C1C", // Added for consistency
    emerald: "#10B981",
    amber: "#F59E0B",
    ocean: "#3B82F6",
};

export default function LandingPage() {
    const navigate = useNavigate();

    const onNavigate = (page: string) => {
        navigate('/' + page);
    };

    const features = [
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            title: "Member Management",
            description: "Track memberships, attendance, and member profiles with ease. Automate renewals and notifications.",
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
            title: "Class Scheduling",
            description: "Manage classes, trainers, and capacity. Members can book sessions directly through the system.",
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            title: "Financial Tracking",
            description: "Monitor revenue, expenses, and transactions. Generate detailed financial reports instantly.",
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
            ),
            title: "Analytics & Reports",
            description: "Gain insights with real-time dashboards and customizable reports for data-driven decisions.",
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
            ),
            title: "Staff Management",
            description: "Track staff schedules, performance metrics, and payroll. Assign trainers to classes effortlessly.",
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            ),
            title: "Smart Notifications",
            description: "Automated alerts for renewals, class reminders, and important updates to keep everyone informed.",
        },
    ]

    const stats = [
        { value: "500+", label: "Gyms Powered" },
        { value: "50K+", label: "Members Managed" },
        { value: "99.9%", label: "Uptime" },
        { value: "24/7", label: "Support" },
    ]

    return (
        <div style={{ minHeight: "100vh", background: colors.bgPrimary, color: colors.textPrimary }}>
            {/* Navigation */}
            <nav
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: "rgba(13, 13, 13, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderBottom: `1px solid ${colors.borderPrimary}`,
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        padding: "16px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <AthlonXLogo size="md" />

                    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                        <a href="#features" style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 14 }}>
                            Features
                        </a>
                        <a href="#pricing" style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 14 }}>
                            Pricing
                        </a>
                        <a href="#about" style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 14 }}>
                            About
                        </a>
                        <button
                            onClick={() => onNavigate("login")}
                            style={{
                                background: "transparent",
                                border: `1px solid ${colors.borderSecondary}`,
                                color: colors.textPrimary,
                                padding: "8px 16px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: 14,
                            }}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => onNavigate("signup")}
                            style={{
                                background: colors.crimson,
                                border: "none",
                                color: "#fff",
                                padding: "8px 20px",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                style={{
                    paddingTop: 140,
                    paddingBottom: 80,
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: `linear-gradient(to bottom, rgba(13,13,13,0.8), rgba(13,13,13,1)), url('/hero-banner.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Background gradient effect */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 800,
                        height: 600,
                        background: `radial-gradient(ellipse at center, ${colors.crimson}15 0%, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />

                <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", position: "relative" }}>
                    <div
                        style={{
                            display: "inline-block",
                            padding: "6px 16px",
                            background: `${colors.crimson}20`,
                            borderRadius: 20,
                            marginBottom: 24,
                            border: `1px solid ${colors.crimson}40`,
                        }}
                    >
                        <span style={{ color: colors.crimson, fontSize: 14, fontWeight: 500 }}>The #1 Gym Management Platform</span>
                    </div>

                    <h1
                        style={{
                            fontSize: 64,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            marginBottom: 24,
                            background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.textSecondary} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Manage Your Gym
                        <br />
                        <span style={{ color: colors.crimson, WebkitTextFillColor: colors.crimson }}>Like a Pro</span>
                    </h1>

                    <p
                        style={{
                            fontSize: 20,
                            color: colors.textSecondary,
                            maxWidth: 600,
                            margin: "0 auto 40px",
                            lineHeight: 1.6,
                        }}
                    >
                        Streamline operations, boost member engagement, and grow your fitness business with our all-in-one gym
                        management solution.
                    </p>

                    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <button
                            onClick={() => onNavigate("signup")}
                            style={{
                                background: colors.crimson,
                                border: "none",
                                color: "#fff",
                                padding: "16px 32px",
                                borderRadius: 12,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 16,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            Start Free Trial
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button
                            style={{
                                background: colors.bgTertiary,
                                border: `1px solid ${colors.borderSecondary}`,
                                color: colors.textPrimary,
                                padding: "16px 32px",
                                borderRadius: 12,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 16,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div
                    style={{
                        maxWidth: 1100,
                        margin: "60px auto 0",
                        padding: "0 24px",
                    }}
                >
                    <div
                        style={{
                            background: colors.bgSecondary,
                            borderRadius: 16,
                            border: `1px solid ${colors.borderPrimary}`,
                            overflow: "hidden",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        <div
                            style={{
                                padding: 12,
                                background: colors.bgTertiary,
                                borderBottom: `1px solid ${colors.borderPrimary}`,
                                display: "flex",
                                gap: 8,
                            }}
                        >
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
                        </div>
                        <div style={{ padding: 24, display: "flex", gap: 24 }}>
                            {/* Mini Sidebar */}
                            <div style={{ width: 180, flexShrink: 0 }}>
                                <AthlonXLogo size="sm" />
                                {["Dashboard", "Members", "Classes", "Staff", "Financials"].map((item, i) => (
                                    <div
                                        key={item}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 6,
                                            marginBottom: 4,
                                            background: i === 0 ? `${colors.crimson}20` : "transparent",
                                            color: i === 0 ? colors.crimson : colors.textSecondary,
                                            fontSize: 13,
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>

                            {/* Mini Dashboard Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                                    {[
                                        { label: "Revenue", value: "$12,450", change: "+8.5%" },
                                        { label: "Members", value: "845", change: "+12" },
                                        { label: "Classes Today", value: "24", change: "Active" },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            style={{
                                                background: colors.bgTertiary,
                                                padding: 16,
                                                borderRadius: 8,
                                                border: `1px solid ${colors.borderPrimary}`,
                                            }}
                                        >
                                            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>{stat.label}</div>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>{stat.value}</div>
                                            <div style={{ fontSize: 11, color: colors.emerald }}>{stat.change}</div>
                                        </div>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        background: colors.bgTertiary,
                                        padding: 16,
                                        borderRadius: 8,
                                        border: `1px solid ${colors.borderPrimary}`,
                                        height: 120,
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: 8,
                                    }}
                                >
                                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: `${h}%`,
                                                background: i === 5 ? colors.crimson : colors.borderSecondary,
                                                borderRadius: 4,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{ padding: "60px 24px", background: colors.bgSecondary }}>
                <div
                    style={{
                        maxWidth: 1000,
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 32,
                    }}
                >
                    {stats.map((stat) => (
                        <div key={stat.label} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 42, fontWeight: 700, color: colors.crimson, marginBottom: 8 }}>{stat.value}</div>
                            <div style={{ fontSize: 14, color: colors.textSecondary }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: "100px 24px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 60 }}>
                        <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Everything You Need to Run Your Gym</h2>
                        <p style={{ fontSize: 18, color: colors.textSecondary, maxWidth: 600, margin: "0 auto" }}>
                            Powerful features designed specifically for fitness businesses of all sizes.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                style={{
                                    background: colors.bgSecondary,
                                    padding: 32,
                                    borderRadius: 16,
                                    border: `1px solid ${colors.borderPrimary}`,
                                    transition: "border-color 0.2s, transform 0.2s",
                                }}
                            >
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        background: `${colors.crimson}15`,
                                        borderRadius: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 20,
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{feature.title}</h3>
                                <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: "100px 24px", background: colors.bgSecondary }}>
                <div
                    style={{
                        maxWidth: 800,
                        margin: "0 auto",
                        textAlign: "center",
                        background: `linear-gradient(135deg, ${colors.crimson}20 0%, ${colors.bgTertiary} 100%)`,
                        padding: 60,
                        borderRadius: 24,
                        border: `1px solid ${colors.crimson}30`,
                    }}
                >
                    <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Ready to Transform Your Gym?</h2>
                    <p style={{ fontSize: 18, color: colors.textSecondary, marginBottom: 32 }}>
                        Join 500+ gyms already using AthlonX to streamline their operations.
                    </p>
                    <button
                        onClick={() => onNavigate("signup")}
                        style={{
                            background: colors.crimson,
                            border: "none",
                            color: "#fff",
                            padding: "16px 40px",
                            borderRadius: 12,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 18,
                        }}
                    >
                        Start Your Free 14-Day Trial
                    </button>
                    <p style={{ fontSize: 13, color: colors.textTertiary, marginTop: 16 }}>No credit card required</p>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: "60px 24px", borderTop: `1px solid ${colors.borderPrimary}` }}>
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <AthlonXLogo size="sm" />
                    <p style={{ color: colors.textTertiary, fontSize: 14 }}>
                        &copy; 2025 AthlonX Gym Management. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
