import React from 'react';

interface GymAssociation {
    gymId: number;
    gymName: string;
    role?: string;
    status: string;
    membershipEndDate?: string;
}

interface GymSelectorProps {
    gyms: GymAssociation[];
    context: 'STAFF' | 'MEMBER';
    onSelectGym: (gymId: number) => void;
    onClose?: () => void;
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
    emerald: "#10B981",
    amber: "#F59E0B",
};

/**
 * Gym Selector Modal - Shows after login when user has multiple gyms
 */
export default function GymSelector({ gyms, context, onSelectGym, onClose }: GymSelectorProps) {
    const [selectedGym, setSelectedGym] = React.useState<number | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return colors.emerald;
            case 'PENDING': return colors.amber;
            case 'EXPIRED': return colors.crimson;
            default: return colors.textTertiary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return '✓ Active';
            case 'PENDING': return '⏳ Pending Approval';
            case 'EXPIRED': return '⚠ Expired';
            default: return status;
        }
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
        }}>
            <div style={{
                background: colors.bgSecondary,
                borderRadius: 20,
                padding: 32,
                maxWidth: 500,
                width: "100%",
                maxHeight: "80vh",
                overflow: "auto",
                border: `1px solid ${colors.borderPrimary}`,
            }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <h2 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        marginBottom: 8
                    }}>
                        {context === 'STAFF' ? 'Select Your Gym' : 'Choose a Gym'}
                    </h2>
                    <p style={{
                        fontSize: 14,
                        color: colors.textSecondary
                    }}>
                        {context === 'STAFF'
                            ? 'Which gym would you like to manage?'
                            : 'Which gym would you like to access?'}
                    </p>
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                }}>
                    {gyms.map((gym) => (
                        <button
                            key={gym.gymId}
                            onClick={() => {
                                if (gym.status === 'PENDING') return;
                                setSelectedGym(gym.gymId);
                                onSelectGym(gym.gymId);
                            }}
                            disabled={gym.status === 'PENDING'}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: 16,
                                background: selectedGym === gym.gymId ? colors.bgTertiary : colors.bgPrimary,
                                border: `2px solid ${selectedGym === gym.gymId ? colors.crimson : colors.borderPrimary}`,
                                borderRadius: 12,
                                cursor: gym.status === 'PENDING' ? 'not-allowed' : 'pointer',
                                textAlign: "left",
                                opacity: gym.status === 'PENDING' ? 0.6 : 1,
                                transition: "all 0.2s ease",
                            }}
                        >
                            <div style={{
                                width: 48,
                                height: 48,
                                background: context === 'STAFF' ? colors.crimson : colors.emerald,
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 700,
                                fontSize: 18,
                            }}>
                                {gym.gymName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: colors.textPrimary,
                                    marginBottom: 4
                                }}>
                                    {gym.gymName}
                                </div>
                                <div style={{
                                    display: "flex",
                                    gap: 12,
                                    fontSize: 12
                                }}>
                                    {gym.role && (
                                        <span style={{
                                            color: colors.crimson,
                                            fontWeight: 600
                                        }}>
                                            {gym.role}
                                        </span>
                                    )}
                                    <span style={{
                                        color: getStatusColor(gym.status)
                                    }}>
                                        {getStatusLabel(gym.status)}
                                    </span>
                                    {gym.membershipEndDate && (
                                        <span style={{ color: colors.textTertiary }}>
                                            Expires: {gym.membershipEndDate}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textTertiary} strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    ))}
                </div>

                {context === 'MEMBER' && (
                    <button
                        onClick={() => { /* Navigate to gym finder */ }}
                        style={{
                            width: "100%",
                            marginTop: 16,
                            padding: 12,
                            background: "transparent",
                            border: `1px dashed ${colors.borderPrimary}`,
                            borderRadius: 12,
                            color: colors.textSecondary,
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v8M8 12h8" />
                        </svg>
                        Join Another Gym
                    </button>
                )}

                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            width: "100%",
                            marginTop: 16,
                            padding: 12,
                            background: "transparent",
                            border: "none",
                            color: colors.textTertiary,
                            cursor: "pointer",
                            fontSize: 14
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
