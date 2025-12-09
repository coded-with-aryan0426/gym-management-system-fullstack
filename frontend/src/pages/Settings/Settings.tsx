"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import api from "../../services/api"
import "./Settings.css"

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@athlonx.com",
    phone: "(902) 456-7770",
  })

  const loadSettings = useCallback(async () => {
    try {
      const settings = await api.getSettings()
      if (settings) {
        // Update settings from backend
        console.log("[v0] Settings loaded:", settings)
      }
    } catch (err) {
      console.log("[v0] Using default settings - backend may not be running")
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
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
          </div>
          <div className="settings-card__body">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
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
          </div>
        </div>

        {/* Right Column - Security & Login */}
        <div className="settings-card">
          <div className="settings-card__header">
            <h3>Security & Login</h3>
          </div>
          <div className="settings-card__body">
            <div className="settings-menu-item">
              <div className="settings-menu-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="settings-menu-item__content">
                <span className="settings-menu-item__title">Change Password</span>
                <span className="settings-menu-item__subtitle">Change password and security.</span>
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
    </motion.div>
  )
}

export default Settings
