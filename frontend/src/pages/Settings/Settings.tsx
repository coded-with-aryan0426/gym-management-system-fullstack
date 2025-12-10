"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import api from "../../services/api"
import "./Settings.css"

interface UserProfile {
  userId: number
  fullName: string
  email: string
  phone: string
}

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const [profile, setProfile] = useState<UserProfile>({
    userId: 0,
    fullName: "",
    email: "",
    phone: "",
  })

  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get user data from localStorage (set during login)
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        const loadedProfile = {
          userId: user.userId || 0,
          fullName: user.fullName || user.username || "User",
          email: user.email || "",
          phone: user.phone || "",
        }
        setProfile(loadedProfile)
        setOriginalProfile(loadedProfile)
      }
    } catch (err) {
      console.error("Failed to load user profile:", err)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${notifications[key] ? "disabled" : "enabled"}`)
  }

  const hasProfileChanges = () => {
    if (!originalProfile) return false
    return (
      profile.fullName !== originalProfile.fullName ||
      profile.email !== originalProfile.email ||
      profile.phone !== originalProfile.phone
    )
  }

  const handleSaveProfile = async () => {
    if (!hasProfileChanges()) {
      toast("No changes to save")
      return
    }

    setIsSaving(true)
    try {
      // Update user via API
      await api.updateUser(profile.userId, {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
      })

      // Update localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        user.fullName = profile.fullName
        user.email = profile.email
        user.phone = profile.phone
        localStorage.setItem("user", JSON.stringify(user))
      }

      setOriginalProfile({ ...profile })
      toast.success("Profile updated successfully!")
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    // For now, show success - backend endpoint needs to be implemented
    toast.success("Password change feature coming soon!")
    setShowPasswordModal(false)
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div className="settings-page" initial="initial" animate="animate" exit="exit" variants={pageTransition}>
      {/* Page Header */}
      <div className="settings-page__header">
        <h1 className="settings-page__title">Account Settings</h1>
      </div>

      {/* Settings Grid Layout */}
      <div className="settings-grid">
        {/* Left Column - Personal Information */}
        <div className="settings-card">
          <div className="settings-card__header">
            <h3>Personal Information</h3>
            {hasProfileChanges() && (
              <button
                className="settings-save-btn"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
          <div className="settings-card__body">
            {isLoading ? (
              <div className="settings-loading">Loading profile...</div>
            ) : (
              <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Security & Login */}
        <div className="settings-card">
          <div className="settings-card__header">
            <h3>Security & Login</h3>
          </div>
          <div className="settings-card__body">
            <div className="settings-menu-item" onClick={() => setShowPasswordModal(true)} style={{ cursor: "pointer" }}>
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Change Password</span>
                <span className="settings-menu-item__subtitle">Update your password for security.</span>
              </div>
              <svg
                className="settings-menu-item__arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Two-Factor Authentication</span>
                <span className="settings-menu-item__subtitle">Manage password password and 2FA settings.</span>
              </div>
              <svg
                className="settings-menu-item__arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Managed Sessions</span>
                <span className="settings-menu-item__subtitle">Set up password or managed sessions.</span>
              </div>
              <svg
                className="settings-menu-item__arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Billing & Payments */}
        <div className="settings-card">
          <div className="settings-card__header">
            <h3>Billing & Payments</h3>
          </div>
          <div className="settings-card__body">
            <div className="settings-menu-item">
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Plan</span>
                <span className="settings-menu-item__subtitle">Plan details: 2 months</span>
              </div>
              <svg
                className="settings-menu-item__arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Payment Method</span>
                <span className="settings-menu-item__subtitle">Payment method, pay mound.</span>
              </div>
              <svg
                className="settings-menu-item__arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Billing History</span>
                <span className="settings-menu-item__subtitle">Billing history, method, details....</span>
              </div>
              <svg
                className="settings-menu-item__arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <div className="settings-card__header">
            <h3>Notifications</h3>
          </div>
          <div className="settings-card__body">
            <div className="notification-toggle">
              <div className="notification-toggle__info">
                <div className="notification-toggle__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span>Email</span>
              </div>
              <button
                className={`toggle-switch ${notifications.email ? "active" : ""}`}
                onClick={() => handleNotificationToggle("email")}
              />
            </div>
            <div className="notification-toggle">
              <div className="notification-toggle__info">
                <div className="notification-toggle__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <span>Push alerts</span>
              </div>
              <button
                className={`toggle-switch ${notifications.push ? "active" : ""}`}
                onClick={() => handleNotificationToggle("push")}
              />
            </div>
            <div className="notification-toggle">
              <div className="notification-toggle__info">
                <div className="notification-toggle__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span>SMS alerts</span>
              </div>
              <button
                className={`toggle-switch ${notifications.sms ? "active" : ""}`}
                onClick={() => handleNotificationToggle("sms")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="settings-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal__header">
              <h3>Change Password</h3>
              <button className="settings-modal__close" onClick={() => setShowPasswordModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="settings-modal__body">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="settings-modal__footer">
              <button className="settings-modal__cancel" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button className="settings-modal__submit" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Settings
