import React from 'react';

interface RoleSelectorProps {
    onSelectRole: (role: 'STAFF' | 'MEMBER') => void;
}

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

/**
 * Role Selector Component - First step in signup/login flow
 * User chooses between Gym Staff (Owner/Admin/Trainer) or Customer (Member)
 */
export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
    const [hoveredRole, setHoveredRole] = React.useState<'STAFF' | 'MEMBER' | null>(null);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            padding: 24,
            maxWidth: 600,
            margin: "0 auto",
        }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h2 style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    marginBottom: 12
                }}>
                    How will you use AthlonX?
                </h2>
                <p style={{
                    fontSize: 16,
                    color: colors.textSecondary,
                    lineHeight: 1.6
                }}>
                    Choose your role to get started with the right experience
                </p>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
            }}>
                {/* Gym Owner / Staff Option */}
                <button
                    onClick={() => onSelectRole('STAFF')}
                    onMouseEnter={() => setHoveredRole('STAFF')}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        padding: 24,
                        background: hoveredRole === 'STAFF' ? colors.bgTertiary : colors.bgSecondary,
                        border: `2px solid ${hoveredRole === 'STAFF' ? colors.crimson : colors.borderPrimary}`,
                        borderRadius: 16,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                        transform: hoveredRole === 'STAFF' ? "translateY(-2px)" : "none",
                        boxShadow: hoveredRole === 'STAFF' ? "0 8px 25px rgba(220, 38, 38, 0.15)" : "none",
                    }}
                >
                    <div style={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${colors.crimson}, ${colors.crimsonHover})`,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6M12 11h.01" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: colors.textPrimary,
                            marginBottom: 6
                        }}>
                            Gym Owner / Staff
                        </h3>
                        <p style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            lineHeight: 1.5
                        }}>
                            I run or work at a gym. I need to manage members, trainers, schedules, and payments.
                        </p>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>

                {/* Customer / Member Option */}
                <button
                    onClick={() => onSelectRole('MEMBER')}
                    onMouseEnter={() => setHoveredRole('MEMBER')}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        padding: 24,
                        background: hoveredRole === 'MEMBER' ? colors.bgTertiary : colors.bgSecondary,
                        border: `2px solid ${hoveredRole === 'MEMBER' ? colors.emerald : colors.borderPrimary}`,
                        borderRadius: 16,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                        transform: hoveredRole === 'MEMBER' ? "translateY(-2px)" : "none",
                        boxShadow: hoveredRole === 'MEMBER' ? "0 8px 25px rgba(16, 185, 129, 0.15)" : "none",
                    }}
                >
                    <div style={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${colors.emerald}, #059669)`,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: colors.textPrimary,
                            marginBottom: 6
                        }}>
                            Customer / Member
                        </h3>
                        <p style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            lineHeight: 1.5
                        }}>
                            I want to join a gym. I'll book classes, schedule PT sessions, and track my fitness.
                        </p>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            <p style={{
                fontSize: 13,
                color: colors.textTertiary,
                textAlign: "center",
                marginTop: 16
            }}>
                Don't worry, you can always switch roles or have both!
            </p>
        </div>
    );
}
