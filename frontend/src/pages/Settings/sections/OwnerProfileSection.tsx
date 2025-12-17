"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

interface OwnerProfile {
    legalName: string
    gymName: string
    email: string
    phone: string
}

const OwnerProfileSection: React.FC = () => {
    const [profile, setProfile] = useState<OwnerProfile>({
        legalName: "",
        gymName: "",
        email: "",
        phone: "",
    })
    const [originalProfile, setOriginalProfile] = useState<OwnerProfile | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load from localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
            const user = JSON.parse(userData)
            const loaded = {
                legalName: user.fullName || "",
                gymName: user.gymName || "My Gym",
                email: user.email || "",
                phone: user.phone || "",
            }
            setProfile(loaded)
            setOriginalProfile(loaded)
        }
        setIsLoading(false)
    }, [])

    const hasChanges = () => {
        if (!originalProfile) return false
        return JSON.stringify(profile) !== JSON.stringify(originalProfile)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))

            // Update localStorage
            const userData = localStorage.getItem("user")
            if (userData) {
                const user = JSON.parse(userData)
                user.fullName = profile.legalName
                user.gymName = profile.gymName
                user.email = profile.email
                user.phone = profile.phone
                localStorage.setItem("user", JSON.stringify(user))
            }

            setOriginalProfile({ ...profile })
            toast.success("Profile updated successfully")
        } catch (err) {
            toast.error("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="settings-section__loading">Loading...</div>
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Owner Profile</h2>
                    <p className="settings-section__description">
                        Legal identity for billing, data ownership, and accountability
                    </p>
                </div>
                {hasChanges() && (
                    <button
                        className="settings-section__save-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                )}
            </div>

            <div className="settings-section__content">
                {/* Identity Group */}
                <div className="form-group">
                    <h4 className="form-group__title">Identity</h4>
                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Legal Owner Name
                                <div className="info-icon" data-tooltip="Name on legal documents and billing invoices">
                                    <Info />
                                </div>
                            </label>
                            <input
                                type="text"
                                className="dense-input"
                                value={profile.legalName}
                                onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                Business / Gym Name
                                <div className="info-icon" data-tooltip="Displayed to members and on receipts">
                                    <Info />
                                </div>
                            </label>
                            <input
                                type="text"
                                className="dense-input"
                                value={profile.gymName}
                                onChange={(e) => setProfile({ ...profile, gymName: e.target.value })}
                                placeholder="FitZone Gym"
                            />
                        </div>
                    </div>
                </div>

                {/* Communication Group */}
                <div className="form-group">
                    <h4 className="form-group__title">Communication</h4>
                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Primary Email
                                <div className="info-icon" data-tooltip="Used for billing notifications and account recovery">
                                    <Info />
                                </div>
                            </label>
                            <input
                                type="email"
                                className="dense-input"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                placeholder="owner@gym.com"
                            />
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                Recovery Phone
                                <div className="info-icon" data-tooltip="Backup contact for critical account issues">
                                    <Info />
                                </div>
                            </label>
                            <input
                                type="tel"
                                className="dense-input"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OwnerProfileSection
