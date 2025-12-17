"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

interface Session {
    id: string
    device: string
    location: string
    ip: string
    lastActive: string
    current: boolean
}

const SecuritySection: React.FC = () => {
    const [enforce2FA, setEnforce2FA] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        current: "",
        new: "",
        confirm: "",
    })

    const [sessions] = useState<Session[]>([
        { id: '1', device: 'Chrome on MacOS', location: 'Mumbai, IN', ip: '192.168.1.1', lastActive: 'Now', current: true },
        { id: '2', device: 'Safari on iPhone', location: 'Mumbai, IN', ip: '192.168.1.45', lastActive: '2 hours ago', current: false },
    ])

    const [loginHistory] = useState([
        { id: '1', device: 'Chrome on MacOS', ip: '192.168.1.1', time: 'Today, 9:30 AM', success: true },
        { id: '2', device: 'Safari on iPhone', ip: '192.168.1.45', time: 'Yesterday, 6:15 PM', success: true },
        { id: '3', device: 'Unknown Device', ip: '45.67.89.12', time: '2 days ago', success: false },
    ])

    const handleChangePassword = () => {
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error("Passwords do not match")
            return
        }
        if (passwordForm.new.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }
        toast.success("Password changed successfully")
        setShowPasswordModal(false)
        setPasswordForm({ current: "", new: "", confirm: "" })
    }

    const handleLogoutSession = (sessionId: string) => {
        toast.success("Session logged out")
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div>
                    <h2 className="settings-section__title">Security & Access</h2>
                    <p className="settings-section__description">
                        Control password, authentication, and active sessions
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                {/* Authentication Group */}
                <div className="form-group">
                    <h4 className="form-group__title">Authentication</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Enforce 2FA for all staff
                                <div className="info-icon" data-tooltip="Require all staff to enable 2FA before accessing the system">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${enforce2FA ? 'policy-toggle--active' : ''}`}
                            onClick={() => {
                                setEnforce2FA(!enforce2FA)
                                toast.success(`2FA enforcement ${!enforce2FA ? 'enabled' : 'disabled'}`)
                            }}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">Password</span>
                        </div>
                        <button
                            className="policy-action-btn"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {/* Sessions Group */}
                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)', paddingBottom: '4px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Active Sessions</h4>
                        <button className="policy-text-btn" onClick={() => toast.success("All other sessions logged out")}>
                            Logout All
                        </button>
                    </div>

                    <div className="session-list">
                        {sessions.map(session => (
                            <div key={session.id} className="session-item">
                                <div className="session-item__info">
                                    <span className="session-item__device">
                                        {session.device}
                                        {session.current && <span className="session-item__badge">Current</span>}
                                    </span>
                                    <span className="session-item__meta">
                                        {session.location} • {session.ip} • {session.lastActive}
                                    </span>
                                </div>
                                {!session.current && (
                                    <button
                                        className="session-item__logout"
                                        onClick={() => handleLogoutSession(session.id)}
                                    >
                                        Logout
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login History */}
                <div className="form-group">
                    <h4 className="form-group__title">Login History</h4>
                    <div className="login-history">
                        {loginHistory.map(entry => (
                            <div key={entry.id} className={`login-history__item ${!entry.success ? 'login-history__item--failed' : ''}`}>
                                <span className="login-history__device">{entry.device}</span>
                                <span className="login-history__meta">{entry.ip}</span>
                                <span className="login-history__time">{entry.time}</span>
                                <span className={`login-history__status ${entry.success ? 'login-history__status--success' : 'login-history__status--failed'}`}>
                                    {entry.success ? '✓ Success' : '✗ Failed'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="settings-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-modal__header">
                            <h3>Change Password</h3>
                            <button className="settings-modal__close" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <div className="settings-modal__body">
                            <div className="field-wrapper">
                                <label className="field-label">Current Password</label>
                                <input
                                    type="password"
                                    className="dense-input"
                                    value={passwordForm.current}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label className="field-label">New Password</label>
                                <input
                                    type="password"
                                    className="dense-input"
                                    value={passwordForm.new}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label className="field-label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="dense-input"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="settings-modal__footer">
                            <button className="policy-btn policy-btn--secondary" onClick={() => setShowPasswordModal(false)}>
                                Cancel
                            </button>
                            <button className="policy-btn policy-btn--primary" onClick={handleChangePassword}>
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
