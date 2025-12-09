"use client"

import type React from "react"

import { useState, useEffect } from "react"

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
}

// ============================================
// LANDING PAGE COMPONENT
// ============================================
function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: colors.crimson,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 20,
                color: "#fff",
              }}
            >
              A
            </div>
            <span style={{ fontWeight: 700, fontSize: 20 }}>Apex Gym</span>
          </div>

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
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: colors.crimson,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#fff",
                    }}
                  >
                    A
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Apex Gym</span>
                </div>
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
            Join 500+ gyms already using Apex to streamline their operations.
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: colors.crimson,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
              }}
            >
              A
            </div>
            <span style={{ fontWeight: 600 }}>Apex Gym</span>
          </div>
          <p style={{ color: colors.textTertiary, fontSize: 14 }}>
            &copy; 2025 Apex Gym Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// LOGIN PAGE COMPONENT
// ============================================
function LoginPage({ onNavigate, onLogin }: { onNavigate: (page: string) => void; onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email && password) {
      onLogin()
    } else {
      setError("Please enter valid credentials")
    }
    setIsLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bgPrimary,
        color: colors.textPrimary,
        display: "flex",
      }}
    >
      {/* Left Side - Branding */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 100%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(${colors.crimson} 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />

        <div style={{ position: "relative", textAlign: "center", maxWidth: 400 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: colors.crimson,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 40,
              margin: "0 auto 32px",
              color: "#fff",
            }}
          >
            A
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Apex Gym</h1>
          <p style={{ fontSize: 18, color: colors.textSecondary, lineHeight: 1.6 }}>
            The complete gym management platform trusted by fitness professionals worldwide.
          </p>

          <div style={{ marginTop: 48, display: "flex", gap: 24, justifyContent: "center" }}>
            {[
              { value: "500+", label: "Gyms" },
              { value: "50K+", label: "Members" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.crimson }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: colors.textTertiary }}>{stat.label}</div>
              </div>
            ))}
          </div>
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
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button
            onClick={() => onNavigate("landing")}
            style={{
              background: "transparent",
              border: "none",
              color: colors.textSecondary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 40,
              fontSize: 14,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: colors.textSecondary, marginBottom: 32 }}>Sign in to access your dashboard</p>

          {error && (
            <div
              style={{
                background: `${colors.crimson}15`,
                border: `1px solid ${colors.crimson}50`,
                color: colors.crimson,
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.borderPrimary}`,
                  borderRadius: 10,
                  color: colors.textPrimary,
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 10,
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
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: colors.textTertiary,
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="checkbox"
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: colors.crimson,
                  }}
                />
                Remember me
              </label>
              <a href="#" style={{ color: colors.crimson, textDecoration: "none", fontSize: 14 }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: colors.crimson,
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
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
                "Sign In"
              )}
            </button>
          </form>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p style={{ color: colors.textSecondary, fontSize: 14 }}>
              Don't have an account?{" "}
              <button
                onClick={() => onNavigate("signup")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.crimson,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Sign up for free
              </button>
            </p>
          </div>

          <div style={{ marginTop: 32 }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, color: colors.textTertiary }}
            >
              <div style={{ flex: 1, height: 1, background: colors.borderPrimary }} />
              <span style={{ fontSize: 13 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: colors.borderPrimary }} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {["Google", "Microsoft"].map((provider) => (
                <button
                  key={provider}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// SIGNUP PAGE COMPONENT
// ============================================
function SignupPage({ onNavigate, onSignup }: { onNavigate: (page: string) => void; onSignup: () => void }) {
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
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    onSignup()
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bgPrimary,
        color: colors.textPrimary,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.borderPrimary}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: colors.crimson,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#fff",
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Apex Gym</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: colors.textSecondary, fontSize: 14 }}>Already have an account?</span>
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
        </div>
      </header>

      {/* Progress Steps */}
      <div style={{ maxWidth: 600, margin: "40px auto 0", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 48 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: step >= s ? colors.crimson : colors.bgTertiary,
                  border: step >= s ? "none" : `1px solid ${colors.borderPrimary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  color: step >= s ? "#fff" : colors.textTertiary,
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
                    width: 80,
                    height: 2,
                    background: step > s ? colors.crimson : colors.borderPrimary,
                    marginLeft: 8,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
              Let's get you started
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: 32, textAlign: "center" }}>Tell us about your gym</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Gym Name</label>
                <input
                  type="text"
                  value={formData.gymName}
                  onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                  placeholder="Apex Fitness Center"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${errors.gymName ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.gymName && (
                  <span style={{ color: colors.crimson, fontSize: 13, marginTop: 4, display: "block" }}>
                    {errors.gymName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${errors.fullName ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.fullName && (
                  <span style={{ color: colors.crimson, fontSize: 13, marginTop: 4, display: "block" }}>
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@apexfitness.com"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${errors.email ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.email && (
                  <span style={{ color: colors.crimson, fontSize: 13, marginTop: 4, display: "block" }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${errors.phone ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.phone && (
                  <span style={{ color: colors.crimson, fontSize: 13, marginTop: 4, display: "block" }}>
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "14px",
                background: colors.crimson,
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
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
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Secure your account</h2>
            <p style={{ color: colors.textSecondary, marginBottom: 32, textAlign: "center" }}>
              Create a strong password
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${errors.password ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.password && (
                  <span style={{ color: colors.crimson, fontSize: 13, marginTop: 4, display: "block" }}>
                    {errors.password}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: colors.bgSecondary,
                    border: `1px solid ${errors.confirmPassword ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 10,
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.confirmPassword && (
                  <span style={{ color: colors.crimson, fontSize: 13, marginTop: 4, display: "block" }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div
                style={{
                  background: colors.bgSecondary,
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${colors.borderPrimary}`,
                }}
              >
                <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>Password requirements:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "At least 8 characters", valid: formData.password.length >= 8 },
                    { label: "One uppercase letter", valid: /[A-Z]/.test(formData.password) },
                    { label: "One number", valid: /[0-9]/.test(formData.password) },
                  ].map((req) => (
                    <div key={req.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: req.valid ? colors.emerald : colors.bgTertiary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {req.valid && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: req.valid ? colors.emerald : colors.textTertiary }}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.borderPrimary}`,
                  borderRadius: 10,
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "14px",
                  background: colors.crimson,
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
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
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Choose your plan</h2>
            <p style={{ color: colors.textSecondary, marginBottom: 32, textAlign: "center" }}>
              Start with a 14-day free trial. Cancel anytime.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id })}
                  style={{
                    background: colors.bgSecondary,
                    border: `2px solid ${formData.plan === plan.id ? colors.crimson : colors.borderPrimary}`,
                    borderRadius: 16,
                    padding: 24,
                    cursor: "pointer",
                    position: "relative",
                    transition: "border-color 0.2s",
                  }}
                >
                  {plan.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: -12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: colors.crimson,
                        padding: "4px 12px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{plan.name}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                    <span style={{ fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>{plan.period}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {plan.features.map((feature) => (
                      <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={colors.emerald}
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: 14, color: colors.textSecondary }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 20,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${formData.plan === plan.id ? colors.crimson : colors.borderSecondary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {formData.plan === plan.id && (
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.crimson }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.borderPrimary}`,
                  borderRadius: 10,
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  flex: 2,
                  padding: "14px",
                  background: colors.crimson,
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
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
                    Creating your account...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => onNavigate("landing")}
          style={{
            background: "transparent",
            border: "none",
            color: colors.textTertiary,
            cursor: "pointer",
            marginTop: 24,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: "24px auto 60px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// CREATE MODAL COMPONENT
// ============================================
type CreateModalType = "member" | "class" | "staff" | "transaction" | "report" | null

function CreateModal({ type, onClose }: { type: CreateModalType; onClose: () => void }) {
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({})
  }, [type])

  if (!type) return null

  const modalConfig = {
    member: {
      title: "Add New Member",
      fields: [
        { name: "name", label: "Full Name", type: "text", placeholder: "Enter member name" },
        { name: "email", label: "Email Address", type: "email", placeholder: "member@email.com" },
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "+1 555 0100" },
        { name: "plan", label: "Membership Plan", type: "select", options: ["Gold", "Silver", "Student", "Basic"] },
        { name: "startDate", label: "Start Date", type: "date", placeholder: "" },
      ],
      submitLabel: "Add Member",
    },
    class: {
      title: "Schedule New Class",
      fields: [
        {
          name: "className",
          label: "Class Name",
          type: "select",
          options: ["HIIT Burn", "Yoga Flow", "Spin Cycle", "Strength Training", "Boxing"],
        },
        {
          name: "trainer",
          label: "Trainer",
          type: "select",
          options: ["Mike Tyson", "Rocky Balboa", "Anya Smith", "Chris Evans"],
        },
        { name: "date", label: "Date", type: "date", placeholder: "" },
        { name: "time", label: "Time", type: "time", placeholder: "" },
        { name: "duration", label: "Duration (mins)", type: "select", options: ["30", "45", "60", "90"] },
        { name: "capacity", label: "Max Capacity", type: "number", placeholder: "20" },
      ],
      submitLabel: "Schedule Class",
    },
    staff: {
      title: "Register New Staff",
      fields: [
        { name: "name", label: "Full Name", type: "text", placeholder: "Enter staff name" },
        { name: "email", label: "Email Address", type: "email", placeholder: "staff@apexgym.com" },
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "+1 555 0200" },
        { name: "role", label: "Role", type: "select", options: ["Trainer", "Manager", "Receptionist", "Maintenance"] },
        { name: "specialization", label: "Specialization", type: "text", placeholder: "e.g., Boxing, Yoga" },
        { name: "startDate", label: "Start Date", type: "date", placeholder: "" },
      ],
      submitLabel: "Register Staff",
    },
    transaction: {
      title: "Record Transaction",
      fields: [
        { name: "member", label: "Member Name", type: "text", placeholder: "Search member..." },
        {
          name: "type",
          label: "Transaction Type",
          type: "select",
          options: ["Membership", "PT Session", "PT Package", "Product Sale", "Merchandise", "Other"],
        },
        { name: "amount", label: "Amount ($)", type: "number", placeholder: "0.00" },
        {
          name: "paymentMethod",
          label: "Payment Method",
          type: "select",
          options: ["Credit Card", "Debit Card", "Cash", "Bank Transfer"],
        },
        { name: "notes", label: "Notes", type: "textarea", placeholder: "Optional notes..." },
      ],
      submitLabel: "Record Transaction",
    },
    report: {
      title: "Create Report",
      fields: [
        {
          name: "reportType",
          label: "Report Type",
          type: "select",
          options: ["Membership", "Revenue", "Attendance", "Trainer Performance", "Custom"],
        },
        {
          name: "dateRange",
          label: "Date Range",
          type: "select",
          options: ["Today", "This Week", "This Month", "This Quarter", "Custom Range"],
        },
        { name: "format", label: "Format", type: "select", options: ["PDF", "Excel", "CSV"] },
        { name: "includeCharts", label: "Include Charts", type: "select", options: ["Yes", "No"] },
      ],
      submitLabel: "Generate Report",
    },
  }

  const config = modalConfig[type]

  const handleSubmit = () => {
    alert(`${config.title} submitted: ${JSON.stringify(formData, null, 2)}`)
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div
        style={{
          position: "relative",
          background: colors.bgSecondary,
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          border: `1px solid ${colors.borderPrimary}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.textPrimary }}>{config.title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: colors.textSecondary,
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {config.fields.map((field) => (
            <div key={field.name}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 6,
                  color: colors.textSecondary,
                }}
              >
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: colors.bgTertiary,
              border: `1px solid ${colors.borderPrimary}`,
              borderRadius: 8,
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: colors.crimson,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {config.submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CREATE MENU COMPONENT
// ============================================
function CreateMenu({ onClose, onSelect }: { onClose: () => void; onSelect: (type: CreateModalType) => void }) {
  const items = [
    { icon: "👤", label: "Add Member", desc: "Register a new gym member", type: "member" as const },
    { icon: "📅", label: "Schedule Class", desc: "Create a new class session", type: "class" as const },
    { icon: "👥", label: "Register Staff", desc: "Add new staff member", type: "staff" as const },
    { icon: "💰", label: "Record Transaction", desc: "Log a payment or sale", type: "transaction" as const },
    { icon: "📊", label: "Create Report", desc: "Generate a custom report", type: "report" as const },
  ]

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onClose} />
      <div
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          background: colors.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${colors.borderPrimary}`,
          padding: 8,
          minWidth: 240,
          zIndex: 50,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {items.map((item) => (
          <button
            key={item.type}
            onClick={() => {
              onSelect(item.type)
              onClose()
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
              color: colors.textPrimary,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: colors.textTertiary }}>{item.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

// ============================================
// DASHBOARD COMPONENT
// ============================================
function Dashboard() {
  const metrics = [
    { label: "Today's Revenue", value: "$1,245.00", change: "+8.5%", changeType: "positive" },
    { label: "Live Check-ins", value: "42", subtext: "Currently on premises" },
    { label: "New Signups (MTD)", value: "115", progress: 77, goal: "150" },
  ]

  const floorStatus = [
    { name: "Sarah Connor", time: "8:00 AM", status: "check-in", avatar: "SC" },
    { name: "John Wick", time: "7:30 AM", status: "access denied", avatar: "JW" },
    { name: "Elena Fisher", time: "6:00 PM", status: "active", avatar: "EF" },
  ]

  const classManifest = [
    { time: "08:00 AM", name: "HIIT Burn", trainer: "Mike T.", capacity: 95 },
    { time: "07:30 AM", name: "Yoga Flow", trainer: "Anya S.", capacity: 80 },
    { time: "08:00 AM", name: "Spin Cycle", trainer: "Chris E.", capacity: 50 },
  ]

  const alerts = [
    { type: "danger", icon: "🔧", title: "Treadmill #4 reported broken", time: "10 hours ago" },
    { type: "danger", icon: "🤒", title: "Trainer John D. called in sick", time: "2 months ago" },
    { type: "warning", icon: "📦", title: "Low inventory: Protein Bars", time: "2 month ago" },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: colors.textPrimary }}>Tactical Canvas</h1>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              background: colors.bgSecondary,
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${colors.borderPrimary}`,
            }}
          >
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>{metric.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.textPrimary }}>{metric.value}</div>
            {metric.change && (
              <div style={{ fontSize: 13, color: colors.emerald, marginTop: 4 }}>{metric.change} vs yesterday</div>
            )}
            {metric.subtext && (
              <div style={{ fontSize: 13, color: colors.textTertiary, marginTop: 4 }}>{metric.subtext}</div>
            )}
            {metric.progress && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, background: colors.bgTertiary, borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${metric.progress}%`,
                      background: colors.emerald,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>Goal: {metric.goal}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Live Floor Status */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>Live Floor Status</h3>
            <button
              style={{ background: "transparent", border: "none", color: colors.textTertiary, cursor: "pointer" }}
            >
              •••
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.borderPrimary}` }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 0",
                    fontSize: 12,
                    color: colors.textTertiary,
                    fontWeight: 500,
                  }}
                >
                  Member
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 0",
                    fontSize: 12,
                    color: colors.textTertiary,
                    fontWeight: 500,
                  }}
                >
                  Time in
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 0",
                    fontSize: 12,
                    color: colors.textTertiary,
                    fontWeight: 500,
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {floorStatus.map((member) => (
                <tr key={member.name} style={{ borderBottom: `1px solid ${colors.borderPrimary}` }}>
                  <td style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: colors.bgTertiary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.textPrimary,
                      }}
                    >
                      {member.avatar}
                    </div>
                    <span style={{ fontSize: 14, color: colors.textPrimary }}>{member.name}</span>
                  </td>
                  <td style={{ padding: "12px 0", fontSize: 14, color: colors.textSecondary }}>{member.time}</td>
                  <td style={{ padding: "12px 0" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: member.status === "access denied" ? colors.crimson : colors.emerald,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: member.status === "access denied" ? colors.crimson : colors.emerald,
                        }}
                      />
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Today's Class Manifest */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>Today's Class Manifest</h3>
            <button
              style={{ background: "transparent", border: "none", color: colors.textTertiary, cursor: "pointer" }}
            >
              •••
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {classManifest.map((cls, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: cls.capacity > 90 ? colors.crimson : cls.capacity > 70 ? colors.amber : colors.emerald,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: colors.textPrimary }}>
                      {cls.time} - {cls.name}
                    </span>
                    <span style={{ fontSize: 13, color: colors.textSecondary }}>{cls.capacity}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: colors.textTertiary }}>Trainer: {cls.trainer}</div>
                  <div
                    style={{
                      height: 4,
                      background: colors.bgTertiary,
                      borderRadius: 2,
                      marginTop: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${cls.capacity}%`,
                        background:
                          cls.capacity > 90 ? colors.crimson : cls.capacity > 70 ? colors.amber : colors.emerald,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Financial Chart */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>Financial Performance Trend</h3>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors.crimson }} />
                Memberships
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors.emerald }} />
                POS/Retail
              </span>
            </div>
          </div>
          <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8, paddingTop: 20 }}>
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: h * 1.5, background: colors.crimson, borderRadius: 4, opacity: 0.8 }} />
                <div style={{ height: h * 0.6 * 1.5, background: colors.emerald, borderRadius: 4, opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>Staff & Facility Alerts</h3>
            <button
              style={{ background: "transparent", border: "none", color: colors.textTertiary, cursor: "pointer" }}
            >
              •••
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  background: colors.bgTertiary,
                  borderRadius: 8,
                  borderLeft: `3px solid ${alert.type === "danger" ? colors.crimson : colors.amber}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{alert.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, color: colors.textPrimary }}>{alert.title}</div>
                    <div style={{ fontSize: 11, color: colors.textTertiary }}>{alert.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MEMBERS COMPONENT
// ============================================
function Members({ onCreateMember }: { onCreateMember: () => void }) {
  const [selectedMember, setSelectedMember] = useState<(typeof members)[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const members = [
    { id: 1, name: "Sarah Connor", email: "sarah@example.com", plan: "Gold", status: "Active", avatar: "SC" },
    { id: 2, name: "John Wick", email: "john@example.com", plan: "Silver", status: "Active", avatar: "JW" },
    { id: 3, name: "Rocky Balboa", email: "rocky@example.com", plan: "Gold", status: "Expired", avatar: "RB" },
    { id: 4, name: "Elena Fisher", email: "elena@example.com", plan: "Student", status: "Pending", avatar: "EF" },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>Members Directory</h1>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>Total Members: {members.length}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "10px 16px",
              background: colors.bgTertiary,
              border: `1px solid ${colors.borderPrimary}`,
              borderRadius: 8,
              color: colors.textPrimary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button
            onClick={onCreateMember}
            style={{
              padding: "10px 16px",
              background: colors.crimson,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      {showFilters && (
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Status
              </label>
              {["Active", "Expired", "Pending"].map((s) => (
                <label
                  key={s}
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
                >
                  <input type="checkbox" style={{ accentColor: colors.crimson }} />
                  <span
                    style={{
                      fontSize: 14,
                      color: s === "Active" ? colors.emerald : s === "Expired" ? colors.crimson : colors.amber,
                    }}
                  >
                    {s}
                  </span>
                </label>
              ))}
            </div>
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Plan
              </label>
              {["Gold", "Silver", "Student"].map((p) => (
                <label
                  key={p}
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
                >
                  <input type="checkbox" style={{ accentColor: colors.crimson }} />
                  <span style={{ fontSize: 14, color: colors.textPrimary }}>{p}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: colors.crimson,
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Apply
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          background: colors.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${colors.borderPrimary}`,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: colors.bgTertiary }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Plan
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: `1px solid ${colors.borderPrimary}` }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: colors.bgTertiary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textPrimary,
                      }}
                    >
                      {member.avatar}
                    </div>
                    <span style={{ fontSize: 14, color: colors.textPrimary }}>{member.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: colors.textSecondary }}>{member.email}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      background: `${colors.amber}20`,
                      color: colors.amber,
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {member.plan}
                  </span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      background:
                        member.status === "Active"
                          ? `${colors.emerald}20`
                          : member.status === "Expired"
                            ? `${colors.crimson}20`
                            : `${colors.amber}20`,
                      color:
                        member.status === "Active"
                          ? colors.emerald
                          : member.status === "Expired"
                            ? colors.crimson
                            : colors.amber,
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {member.status}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <button
                    onClick={() => setSelectedMember(member)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.textTertiary,
                      cursor: "pointer",
                      padding: 8,
                    }}
                  >
                    •••
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }}
            onClick={() => setSelectedMember(null)}
          />
          <div
            style={{
              position: "relative",
              background: colors.bgSecondary,
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 500,
              border: `1px solid ${colors.borderPrimary}`,
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.textPrimary }}>
                Manage Member: {selectedMember.name}
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
                padding: 16,
                background: colors.bgTertiary,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: colors.borderPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}
              >
                {selectedMember.avatar}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: colors.textPrimary }}>{selectedMember.name}</div>
                <div style={{ fontSize: 14, color: colors.crimson }}>{selectedMember.plan} Plan</div>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "6px 12px",
                  background: `${colors.emerald}20`,
                  color: colors.emerald,
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {selectedMember.status}
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: colors.textSecondary, marginBottom: 12 }}>
                Quick Actions
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { icon: "✏️", label: "Edit Profile" },
                  { icon: "🔄", label: "Renew Plan" },
                  { icon: "✉️", label: "Message" },
                ].map((action) => (
                  <button
                    key={action.label}
                    style={{
                      padding: "16px",
                      background: colors.bgTertiary,
                      border: `1px solid ${colors.borderPrimary}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{action.icon}</span>
                    <span style={{ fontSize: 13, color: colors.textPrimary }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: colors.textSecondary, marginBottom: 12 }}>
                Assigned Trainers (2)
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Mike Tyson", "Rocky Balboa"].map((trainer) => (
                  <div
                    key={trainer}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: colors.bgTertiary,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: colors.borderPrimary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={colors.textSecondary}
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, color: colors.textPrimary }}>
                        {trainer} <span style={{ color: colors.textTertiary }}>(Trainer)</span>
                      </span>
                    </div>
                    <button
                      style={{
                        padding: "6px 12px",
                        background: colors.crimson,
                        border: "none",
                        borderRadius: 6,
                        color: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px",
                  background: "transparent",
                  border: `1px dashed ${colors.borderSecondary}`,
                  borderRadius: 8,
                  color: colors.textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Trainer
              </button>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              style={{
                width: "100%",
                marginTop: 24,
                padding: "12px",
                background: colors.bgTertiary,
                border: `1px solid ${colors.borderPrimary}`,
                borderRadius: 8,
                color: colors.textPrimary,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// CLASSES COMPONENT
// ============================================
function Classes({ onCreateClass }: { onCreateClass: () => void }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  const hours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"]

  const todayClasses = [
    { time: "06:00 AM", name: "HIIT Burn", trainer: "Mike T.", capacity: 100, status: "Full" },
    { time: "07:30 AM", name: "Spin Cycle", trainer: "Chris S.", capacity: 85, status: "Busy" },
    { time: "08:00 AM", name: "HIIT Burn", trainer: "Anya A.", capacity: 70, status: "Busy" },
    { time: "08:30 AM", name: "HIIT Burn", trainer: "Mike T.", capacity: 45, status: "Available" },
    { time: "09:00 AM", name: "Spin Cycle", trainer: "Anya A.", capacity: 50, status: "Available" },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>Class Schedule</h1>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>Upcoming: 12 Classes Today</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              padding: "10px 16px",
              background: colors.bgTertiary,
              border: `1px solid ${colors.borderPrimary}`,
              borderRadius: 8,
              color: colors.textPrimary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button
            onClick={onCreateClass}
            style={{
              padding: "10px 16px",
              background: colors.crimson,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Schedule Class
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Weekly View */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>Weekly View</h3>
          <div style={{ display: "grid", gridTemplateColumns: "60px repeat(5, 1fr)", gap: 2 }}>
            <div />
            {days.map((day) => (
              <div
                key={day}
                style={{ textAlign: "center", padding: 8, fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}
              >
                {day}
              </div>
            ))}
            {hours.map((hour) => (
              <>
                <div key={hour} style={{ padding: "8px 4px", fontSize: 12, color: colors.textTertiary }}>
                  {hour}
                </div>
                {days.map((day, di) => (
                  <div
                    key={`${hour}-${day}`}
                    style={{ background: colors.bgTertiary, borderRadius: 4, minHeight: 40, position: "relative" }}
                  >
                    {((hour === "07:00" && di === 2) ||
                      (hour === "10:00" && di === 1) ||
                      (hour === "11:00" && di === 4)) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 2,
                          background: colors.emerald,
                          borderRadius: 4,
                          padding: 4,
                          fontSize: 10,
                          color: "#fff",
                        }}
                      >
                        Yoga
                      </div>
                    )}
                    {((hour === "08:00" && di === 0) ||
                      (hour === "12:00" && di === 1) ||
                      (hour === "12:00" && di === 2)) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 2,
                          background: colors.crimson,
                          borderRadius: 4,
                          padding: 4,
                          fontSize: 10,
                          color: "#fff",
                        }}
                      >
                        HIIT
                      </div>
                    )}
                    {((hour === "11:00" && di === 2) || (hour === "09:00" && di === 4)) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 2,
                          background: colors.ocean,
                          borderRadius: 4,
                          padding: 4,
                          fontSize: 10,
                          color: "#fff",
                        }}
                      >
                        Spin
                      </div>
                    )}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>

        {/* Today's Classes */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>
            Today's Classes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayClasses.map((cls, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  background: colors.bgTertiary,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      cls.status === "Full" ? colors.crimson : cls.status === "Busy" ? colors.amber : colors.emerald,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: colors.textPrimary }}>
                    {cls.time} - {cls.name}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textTertiary }}>{cls.trainer}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        cls.status === "Full" ? colors.crimson : cls.status === "Busy" ? colors.amber : colors.emerald,
                    }}
                  >
                    {cls.status}
                  </div>
                  <div
                    style={{
                      height: 4,
                      width: 60,
                      background: colors.bgSecondary,
                      borderRadius: 2,
                      marginTop: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${cls.capacity}%`,
                        background:
                          cls.status === "Full"
                            ? colors.crimson
                            : cls.status === "Busy"
                              ? colors.amber
                              : colors.emerald,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// STAFF COMPONENT
// ============================================
function Staff({ onCreateStaff }: { onCreateStaff: () => void }) {
  const staff = [
    { id: 1, name: "Mike Tyson", role: "Trainer", email: "mike@apexgym.com", status: "Active", avatar: "MT" },
    { id: 2, name: "Rocky Balboa", role: "Trainer", email: "rocky@apexgym.com", status: "Active", avatar: "RB" },
    { id: 3, name: "Anya Smith", role: "Manager", email: "anya@apexgym.com", status: "Active", avatar: "AS" },
    { id: 4, name: "John Doe", role: "Receptionist", email: "john@apexgym.com", status: "On Leave", avatar: "JD" },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>Staff Management</h1>
        <button
          onClick={onCreateStaff}
          style={{
            padding: "10px 16px",
            background: colors.crimson,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Staff
        </button>
      </div>

      <div
        style={{
          background: colors.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${colors.borderPrimary}`,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: colors.bgTertiary }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Role
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "14px 20px",
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderPrimary}` }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: colors.bgTertiary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textPrimary,
                      }}
                    >
                      {s.avatar}
                    </div>
                    <span style={{ fontSize: 14, color: colors.textPrimary }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: colors.textSecondary }}>{s.role}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: colors.textSecondary }}>{s.email}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      background: s.status === "Active" ? `${colors.emerald}20` : `${colors.amber}20`,
                      color: s.status === "Active" ? colors.emerald : colors.amber,
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.textTertiary,
                      cursor: "pointer",
                      padding: 8,
                    }}
                  >
                    •••
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// FINANCIALS COMPONENT
// ============================================
function Financials({ onCreateTransaction }: { onCreateTransaction: () => void }) {
  const stats = [
    { label: "Total Revenue", value: "$45,230", change: "+12.5%" },
    { label: "Expenses", value: "$12,450", change: "-3.2%" },
    { label: "Net Profit", value: "$32,780", change: "+18.7%" },
    { label: "Outstanding", value: "$2,340", change: "5 invoices" },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>Financials</h1>
        <button
          onClick={onCreateTransaction}
          style={{
            padding: "10px 16px",
            background: colors.crimson,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Transaction
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: colors.bgSecondary,
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${colors.borderPrimary}`,
            }}
          >
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>{stat.value}</div>
            <div
              style={{
                fontSize: 13,
                color: stat.change.startsWith("+")
                  ? colors.emerald
                  : stat.change.startsWith("-")
                    ? colors.crimson
                    : colors.textTertiary,
                marginTop: 4,
              }}
            >
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: colors.bgSecondary,
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${colors.borderPrimary}`,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>
          Recent Transactions
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { desc: "Membership - Gold Plan", member: "Sarah Connor", amount: "+$199.00", time: "2 hours ago" },
            { desc: "PT Session Package", member: "John Wick", amount: "+$450.00", time: "5 hours ago" },
            { desc: "Equipment Rental", member: "Elena Fisher", amount: "+$25.00", time: "1 day ago" },
            { desc: "Refund - Class Cancellation", member: "Rocky Balboa", amount: "-$50.00", time: "2 days ago" },
          ].map((tx, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                background: colors.bgTertiary,
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: colors.textPrimary }}>{tx.desc}</div>
                <div style={{ fontSize: 12, color: colors.textTertiary }}>
                  {tx.member} • {tx.time}
                </div>
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: tx.amount.startsWith("+") ? colors.emerald : colors.crimson,
                }}
              >
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// REPORTS COMPONENT
// ============================================
function Reports({ onCreateReport }: { onCreateReport: () => void }) {
  const reports = [
    { name: "Membership Report", type: "Monthly", date: "Dec 1, 2024", status: "Ready" },
    { name: "Revenue Analysis", type: "Quarterly", date: "Nov 30, 2024", status: "Ready" },
    { name: "Attendance Summary", type: "Weekly", date: "Dec 8, 2024", status: "Processing" },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>Reports</h1>
        <button
          onClick={onCreateReport}
          style={{
            padding: "10px 16px",
            background: colors.crimson,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Report
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        {["Membership", "Revenue", "Attendance", "Trainer Performance", "Inventory", "Custom"].map((type) => (
          <div
            key={type}
            style={{
              background: colors.bgSecondary,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${colors.borderPrimary}`,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: `${colors.crimson}15`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.crimson} strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>{type} Report</h3>
            <p style={{ fontSize: 13, color: colors.textTertiary }}>Generate {type.toLowerCase()} analytics</p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: colors.bgSecondary,
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${colors.borderPrimary}`,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>Recent Reports</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.map((report, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                background: colors.bgTertiary,
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: colors.textPrimary }}>{report.name}</div>
                <div style={{ fontSize: 12, color: colors.textTertiary }}>
                  {report.type} • {report.date}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    padding: "4px 10px",
                    background: report.status === "Ready" ? `${colors.emerald}20` : `${colors.amber}20`,
                    color: report.status === "Ready" ? colors.emerald : colors.amber,
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  {report.status}
                </span>
                {report.status === "Ready" && (
                  <button
                    style={{
                      padding: "6px 12px",
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.borderPrimary}`,
                      borderRadius: 6,
                      color: colors.textPrimary,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SETTINGS COMPONENT
// ============================================
function Settings() {
  const [notifications, setNotifications] = useState({ email: true, push: false, sms: false })

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: colors.textPrimary }}>Account Settings</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Personal Info */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 20 }}>
            Personal Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Name", value: "John Doe" },
              { label: "Email", value: "john.doe@apexgym.com" },
              { label: "Phone", value: "(902) 456-7770" },
            ].map((field) => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  defaultValue={field.value}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: 8,
                    color: colors.textPrimary,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 20 }}>
            Security & Login
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "🔑", title: "Change Password", desc: "Update your password" },
              { icon: "🛡️", title: "Two-Factor Auth", desc: "Add extra security" },
              { icon: "📱", title: "Managed Sessions", desc: "View active sessions" },
            ].map((item) => (
              <button
                key={item.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.borderPrimary}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: colors.textTertiary }}>{item.desc}</div>
                </div>
                <svg
                  style={{ marginLeft: "auto" }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.textTertiary}
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 20 }}>
            Billing & Payments
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "📋", title: "Plan", desc: "Professional - 2 months" },
              { icon: "💳", title: "Payment Method", desc: "Visa ending in 4242" },
              { icon: "📜", title: "Billing History", desc: "View past invoices" },
            ].map((item) => (
              <button
                key={item.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.borderPrimary}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: colors.textTertiary }}>{item.desc}</div>
                </div>
                <svg
                  style={{ marginLeft: "auto" }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.textTertiary}
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div
          style={{
            background: colors.bgSecondary,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 20 }}>Notifications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "email", icon: "✉️", title: "Email", desc: "Receive email notifications" },
              { key: "push", icon: "🔔", title: "Push alerts", desc: "Browser push notifications" },
              { key: "sms", icon: "📱", title: "SMS alerts", desc: "Text message alerts" },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  background: colors.bgTertiary,
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: colors.textTertiary }}>{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]: !notifications[item.key as keyof typeof notifications],
                    })
                  }
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    background: notifications[item.key as keyof typeof notifications]
                      ? colors.crimson
                      : colors.bgSecondary,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: 3,
                      left: notifications[item.key as keyof typeof notifications] ? 25 : 3,
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN GYM APP COMPONENT
// ============================================
function GymApp({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [createModalType, setCreateModalType] = useState<CreateModalType>(null)

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "members", icon: "👥", label: "Members" },
    { id: "classes", icon: "📅", label: "Classes" },
    { id: "staff", icon: "👔", label: "Staff" },
    { id: "financials", icon: "💰", label: "Financials" },
    { id: "reports", icon: "📈", label: "Reports" },
  ]

  const handleCreateSelect = (type: CreateModalType) => {
    setCreateModalType(type)
    setShowCreateMenu(false)
  }

  const renderPage = () => {
    switch (activePage) {
      case "members":
        return <Members onCreateMember={() => setCreateModalType("member")} />
      case "classes":
        return <Classes onCreateClass={() => setCreateModalType("class")} />
      case "staff":
        return <Staff onCreateStaff={() => setCreateModalType("staff")} />
      case "financials":
        return <Financials onCreateTransaction={() => setCreateModalType("transaction")} />
      case "reports":
        return <Reports onCreateReport={() => setCreateModalType("report")} />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? 72 : 220,
          background: colors.bgSecondary,
          borderRight: `1px solid ${colors.borderPrimary}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
        }}
      >
        <div
          style={{
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${colors.borderPrimary}`,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: colors.crimson,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            A
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 700, fontSize: 18, color: colors.textPrimary }}>Apex Gym</span>
          )}
        </div>

        <nav style={{ flex: 1, padding: 12 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                width: "100%",
                padding: sidebarCollapsed ? "12px" : "12px 16px",
                marginBottom: 4,
                background: activePage === item.id ? `${colors.crimson}20` : "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: activePage === item.id ? colors.crimson : colors.textSecondary,
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span style={{ fontSize: 14, fontWeight: activePage === item.id ? 600 : 400 }}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: `1px solid ${colors.borderPrimary}` }}>
          <button
            onClick={() => setActivePage("settings")}
            style={{
              width: "100%",
              padding: sidebarCollapsed ? "12px" : "12px 16px",
              marginBottom: 8,
              background: activePage === "settings" ? `${colors.crimson}20` : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: activePage === "settings" ? colors.crimson : colors.textSecondary,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
          >
            <span style={{ fontSize: 18 }}>⚙️</span>
            {!sidebarCollapsed && <span style={{ fontSize: 14 }}>Account Settings</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: "100%",
              padding: sidebarCollapsed ? "12px" : "12px 16px",
              background: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: colors.textTertiary,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
          >
            <span style={{ fontSize: 18 }}>{sidebarCollapsed ? "→" : "←"}</span>
            {!sidebarCollapsed && <span style={{ fontSize: 14 }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            padding: "16px 24px",
            background: colors.bgSecondary,
            borderBottom: `1px solid ${colors.borderPrimary}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: colors.bgTertiary,
              borderRadius: 8,
              width: 300,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search members, classes, or staff (Cmd+K)"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: colors.textPrimary,
                fontSize: 14,
                width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                style={{
                  padding: "10px 16px",
                  background: colors.crimson,
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create
              </button>
              {showCreateMenu && <CreateMenu onClose={() => setShowCreateMenu(false)} onSelect={handleCreateSelect} />}
            </div>

            <button
              style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", padding: 8 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  background: colors.crimson,
                  borderRadius: "50%",
                }}
              />
            </button>

            <button
              onClick={onLogout}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: colors.bgTertiary,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.textPrimary,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              JD
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>{renderPage()}</main>
      </div>

      {/* Create Modal */}
      {createModalType && <CreateModal type={createModalType} onClose={() => setCreateModalType(null)} />}
    </div>
  )
}

// ============================================
// ROOT APP COMPONENT WITH ROUTING
// ============================================

type AppPage = "landing" | "login" | "signup" | "app"

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("landing")

  const handleLogin = () => setCurrentPage("app")
  const handleSignup = () => setCurrentPage("app")
  const handleLogout = () => setCurrentPage("landing")

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage)
  }

  switch (currentPage) {
    case "login":
      return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
    case "signup":
      return <SignupPage onNavigate={handleNavigate} onSignup={handleSignup} />
    case "app":
      return <GymApp onLogout={handleLogout} />
    default:
      return <LandingPage onNavigate={handleNavigate} />
  }
}
