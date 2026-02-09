"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { 
  Info, 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  LogOut,
  Check,
  X,
  AlertTriangle,
  Lock,
  Power
} from "lucide-react"
import api from "../../../services/api"

interface Session {
  id: string
  device: string
  location: string
  ip: string
  lastActive: string
  current: boolean
  browser: string
}

interface LoginHistory {
  id: string
  device: string
  ip: string
  time: string
  success: boolean
  location: string
}

interface SecuritySettings {
  enforce2FA: boolean
  sessionTimeout: number
  passwordExpiry: number
  maxLoginAttempts: number
  requireStrongPassword: boolean
}

const SecuritySection: React.FC = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SecuritySettings>({
    enforce2FA: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    requireStrongPassword: true,
  })
  const [originalSettings, setOriginalSettings] = useState<SecuritySettings | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const [sessions, setSessions] = useState<Session[]>([
    { 
      id: '1', 
      device: 'Chrome on MacOS', 
      browser: 'Chrome 120',
      location: 'Mumbai, IN', 
      ip: '192.168.1.1', 
      lastActive: 'Now', 
      current: true 
    },
    { 
      id: '2', 
      device: 'Safari on iPhone', 
      browser: 'Safari 17',
      location: 'Mumbai, IN', 
      ip: '192.168.1.45', 
      lastActive: '2 hours ago', 
      current: false 
    },
  ])

  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([
    { id: '1', device: 'Chrome on MacOS', ip: '192.168.1.1', time: 'Today, 9:30 AM', success: true, location: 'Mumbai' },
    { id: '2', device: 'Safari on iPhone', ip: '192.168.1.45', time: 'Yesterday, 6:15 PM', success: true, location: 'Mumbai' },
    { id: '3', device: 'Unknown Device', ip: '45.67.89.12', time: '2 days ago', success: false, location: 'Unknown' },
  ])

  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const response = await api.get('/api/settings')
        if (response.data) {
          const s = response.data
          const loaded: SecuritySettings = {
            enforce2FA: s.enforce2FA === 'true' || s.enforce2FA === true,
            sessionTimeout: parseInt(s.sessionTimeout) || 30,
            passwordExpiry: parseInt(s.passwordExpiry) || 90,
            maxLoginAttempts: parseInt(s.maxLoginAttempts) || 5,
            requireStrongPassword: s.requireStrongPassword !== 'false' && s.requireStrongPassword !== false,
          }
          setSettings(loaded)
          setOriginalSettings(loaded)
        }
      } catch {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem("securitySettings")
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings(parsed)
          setOriginalSettings(parsed)
        } else {
          setOriginalSettings({ ...settings })
        }
      }
    }
    loadSecuritySettings()
  }, [])

  const hasChanges = () => {
    if (!originalSettings) return false
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }

  const updateSetting = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.put('/api/settings', settings)
      localStorage.setItem("securitySettings", JSON.stringify(settings))
      setOriginalSettings({ ...settings })
      toast.success("Security settings saved")
      
      const auditLog = JSON.parse(localStorage.getItem("auditLog") || "[]")
      auditLog.unshift({
        id: Date.now().toString(),
        action: "Security Updated",
        target: "Security Settings",
        user: "Admin User",
        role: "Owner",
        timestamp: new Date().toLocaleString(),
        details: "Security configuration updated"
      })
      localStorage.setItem("auditLog", JSON.stringify(auditLog.slice(0, 100)))
    } catch (err) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings })
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match")
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (settings.requireStrongPassword) {
      const hasUppercase = /[A-Z]/.test(passwordForm.new)
      const hasLowercase = /[a-z]/.test(passwordForm.new)
      const hasNumber = /[0-9]/.test(passwordForm.new)
      const hasSpecial = /[!@#$%^&*]/.test(passwordForm.new)
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        toast.error("Password must contain uppercase, lowercase, number, and special character")
        return
      }
    }
    
    try {
      const userData = localStorage.getItem("user")
      const email = userData ? JSON.parse(userData).email : null
      if (!email) {
        toast.error("Could not determine user email")
        return
      }

      await api.post('/api/auth/change-password', {
        email,
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      })

      toast.success("Password changed successfully")
      setShowPasswordModal(false)
      setPasswordForm({ current: "", new: "", confirm: "" })
      
      const auditLog = JSON.parse(localStorage.getItem("auditLog") || "[]")
      auditLog.unshift({
        id: Date.now().toString(),
        action: "Password Changed",
        target: "Account Security",
        user: "Admin User",
        role: "Owner",
        timestamp: new Date().toLocaleString(),
        details: "Account password was changed"
      })
      localStorage.setItem("auditLog", JSON.stringify(auditLog.slice(0, 100)))
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "Failed to change password"
      toast.error(errorMsg)
    }
  }

  const handleLogoutSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    toast.success("Session logged out")
    
    const auditLog = JSON.parse(localStorage.getItem("auditLog") || "[]")
    auditLog.unshift({
      id: Date.now().toString(),
      action: "Session Terminated",
      target: `Session ${sessionId}`,
      user: "Admin User",
      role: "Owner",
      timestamp: new Date().toLocaleString(),
      details: "Remote session was terminated"
    })
    localStorage.setItem("auditLog", JSON.stringify(auditLog.slice(0, 100)))
  }

  const handleLogoutAll = () => {
    setSessions(prev => prev.filter(s => s.current))
    toast.success("All other sessions logged out")
  }

  const handleLogoutAccount = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("selectedGym")
    toast.success("Logged out successfully")
    navigate("/")
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">Security & Access</h2>
            <p className="settings-section__description">
              Control password, authentication, and active sessions
            </p>
          </div>
        </div>
        <div className="settings-section__actions">
          {hasChanges() && (
            <>
              <div className="unsaved-indicator">
                <span className="unsaved-indicator__dot" />
                Unsaved changes
              </div>
              <button className="settings-section__cancel-btn" onClick={handleCancel}>
                <X size={14} />
                Cancel
              </button>
              <button 
                className="settings-save-btn" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Shield size={16} />
            <h4 className="form-group__title">Authentication Policies</h4>
          </div>

          <div className="policy-toggle-row">
            <div className="policy-toggle-row__info">
              <div className="policy-toggle-row__icon">
                <Lock size={16} />
              </div>
              <div className="policy-toggle-row__text">
                <span className="policy-toggle-row__label">Enforce 2FA for all staff</span>
                <p className="policy-toggle-row__hint">
                  Require all staff to enable two-factor authentication before accessing the system
                </p>
              </div>
            </div>
            <button
              className={`policy-toggle ${settings.enforce2FA ? 'policy-toggle--active' : ''}`}
              onClick={() => updateSetting('enforce2FA', !settings.enforce2FA)}
            />
          </div>

          <div className="policy-toggle-row">
            <div className="policy-toggle-row__info">
              <div className="policy-toggle-row__icon">
                <Key size={16} />
              </div>
              <div className="policy-toggle-row__text">
                <span className="policy-toggle-row__label">Require Strong Passwords</span>
                <p className="policy-toggle-row__hint">
                  Enforce uppercase, lowercase, numbers, and special characters
                </p>
              </div>
            </div>
            <button
              className={`policy-toggle ${settings.requireStrongPassword ? 'policy-toggle--active' : ''}`}
              onClick={() => updateSetting('requireStrongPassword', !settings.requireStrongPassword)}
            />
          </div>

          <div className="form-grid" style={{ marginTop: '16px' }}>
            <div className="field-wrapper">
              <label className="field-label">
                Session Timeout (minutes)
                <div className="info-icon" data-tooltip="Automatically log out after inactivity">
                  <Info size={14} />
                </div>
              </label>
              <select
                className="dense-input"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </div>

            <div className="field-wrapper">
              <label className="field-label">
                Password Expiry (days)
                <div className="info-icon" data-tooltip="Force password change after this period">
                  <Info size={14} />
                </div>
              </label>
              <select
                className="dense-input"
                value={settings.passwordExpiry}
                onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={0}>Never</option>
              </select>
            </div>

            <div className="field-wrapper">
              <label className="field-label">
                Max Login Attempts
                <div className="info-icon" data-tooltip="Lock account after failed attempts">
                  <Info size={14} />
                </div>
              </label>
              <select
                className="dense-input"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
              >
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={10}>10 attempts</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group__header">
            <Key size={16} />
            <h4 className="form-group__title">Password Management</h4>
          </div>

          <div className="policy-toggle-row">
            <div className="policy-toggle-row__info">
              <div className="policy-toggle-row__icon">
                <Key size={16} />
              </div>
              <div className="policy-toggle-row__text">
                <span className="policy-toggle-row__label">Account Password</span>
                <p className="policy-toggle-row__hint">
                  Last changed 45 days ago
                </p>
              </div>
            </div>
            <button
              className="settings-section__cancel-btn"
              onClick={() => setShowPasswordModal(true)}
              style={{ width: 'auto' }}
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group__header" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Monitor size={16} />
              <h4 className="form-group__title">Active Sessions</h4>
            </div>
            <button className="policy-text-btn" onClick={handleLogoutAll}>
              Logout All Others
            </button>
          </div>

          <div className="session-list">
            {sessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-item__info">
                  <span className="session-item__device">
                    {session.device.includes('iPhone') || session.device.includes('Android') ? (
                      <Smartphone size={16} />
                    ) : (
                      <Monitor size={16} />
                    )}
                    {session.device}
                    {session.current && <span className="session-item__badge">Current</span>}
                  </span>
                  <span className="session-item__meta">
                    {session.location} &bull; {session.ip} &bull; {session.lastActive}
                  </span>
                </div>
                {!session.current && (
                  <button
                    className="session-item__logout"
                    onClick={() => handleLogoutSession(session.id)}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <div className="form-group__header">
            <AlertTriangle size={16} />
            <h4 className="form-group__title">Login History</h4>
          </div>
          <div className="login-history">
            {loginHistory.map(entry => (
              <div key={entry.id} className={`login-history__item ${!entry.success ? 'login-history__item--failed' : ''}`}>
                <span className="login-history__device">
                  {entry.device.includes('iPhone') || entry.device.includes('Android') ? (
                    <Smartphone size={14} />
                  ) : (
                    <Monitor size={14} />
                  )}
                  {entry.device}
                </span>
                <span className="login-history__meta">{entry.ip}</span>
                <span className="login-history__time">{entry.time}</span>
                <span className={`login-history__status ${entry.success ? 'login-history__status--success' : 'login-history__status--failed'}`}>
                  {entry.success ? (
                    <><Check size={12} /> Success</>
                  ) : (
                    <><X size={12} /> Failed</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <div className="form-group__header">
            <Power size={16} />
            <h4 className="form-group__title">Account Logout</h4>
          </div>

          <div className="policy-toggle-row">
            <div className="policy-toggle-row__info">
              <div className="policy-toggle-row__icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <LogOut size={16} />
              </div>
              <div className="policy-toggle-row__text">
                <span className="policy-toggle-row__label">Sign Out of Account</span>
                <p className="policy-toggle-row__hint">
                  Log out from your current session and return to the login page
                </p>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogoutAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ef4444'
                e.currentTarget.style.color = 'white'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.color = '#ef4444'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="policy-note policy-note--warning">
          <div className="policy-note__icon">
            <AlertTriangle size={16} />
          </div>
          <span>
            <strong>Security Alert:</strong> If you notice any suspicious login activity, 
            change your password immediately and review your active sessions.
          </span>
        </div>
      </div>

      {showPasswordModal && (
        <div className="settings-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal__header">
              <h3>Change Password</h3>
              <button className="settings-modal__close" onClick={() => setShowPasswordModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="settings-modal__body">
              <div className="field-wrapper">
                <label className="field-label">Current Password</label>
                <input
                  type="password"
                  className="dense-input"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className="field-wrapper">
                <label className="field-label">New Password</label>
                <input
                  type="password"
                  className="dense-input"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="Enter new password"
                />
                {settings.requireStrongPassword && (
                  <p className="field-helper">
                    Must contain uppercase, lowercase, number, and special character
                  </p>
                )}
              </div>
              <div className="field-wrapper">
                <label className="field-label">Confirm Password</label>
                <input
                  type="password"
                  className="dense-input"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="settings-modal__footer">
              <button className="modal-btn modal-btn--secondary" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button className="modal-btn modal-btn--primary" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecuritySection
