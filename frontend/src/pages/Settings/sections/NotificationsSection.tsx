"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Bell, 
    AlertCircle, 
    TrendingDown, 
    FileText,
    Mail,
    MessageSquare,
    Save,
    Loader2,
    CreditCard,
    Calendar,
    Users,
    Activity
} from "lucide-react"
import api from "../../../services/api"

interface NotificationSettings {
    membershipExpiry: boolean
    membershipExpiryDays: number
    paymentFailure: boolean
    lowAttendance: boolean
    lowAttendanceWeeks: number
    dailySummary: boolean
    weeklySummary: boolean
    newMemberAlert: boolean
    churnRiskAlert: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
}

const NotificationsSection: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        membershipExpiry: true,
        membershipExpiryDays: 7,
        paymentFailure: true,
        lowAttendance: false,
        lowAttendanceWeeks: 2,
        dailySummary: false,
        weeklySummary: true,
        newMemberAlert: true,
        churnRiskAlert: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null)

    useEffect(() => {
        fetchNotificationSettings()
    }, [])

    const fetchNotificationSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/gym-settings')
            if (response.data) {
                const data = response.data
                const notifSettings: NotificationSettings = {
                    membershipExpiry: data.notifyMembershipExpiry ?? true,
                    membershipExpiryDays: data.membershipExpiryDays ?? 7,
                    paymentFailure: data.notifyPaymentFailure ?? true,
                    lowAttendance: data.notifyLowAttendance ?? false,
                    lowAttendanceWeeks: data.lowAttendanceWeeks ?? 2,
                    dailySummary: data.dailySummary ?? false,
                    weeklySummary: data.weeklySummary ?? true,
                    newMemberAlert: data.notifyNewMember ?? true,
                    churnRiskAlert: data.notifyChurnRisk ?? true,
                    emailNotifications: data.emailNotifications ?? true,
                    smsNotifications: data.smsNotifications ?? false,
                    pushNotifications: data.pushNotifications ?? true,
                }
                setSettings(notifSettings)
                setOriginalSettings(notifSettings)
            }
        } catch (error) {
            console.error('Failed to fetch notification settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings))
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put('/api/gym-settings', {
                notifyMembershipExpiry: settings.membershipExpiry,
                membershipExpiryDays: settings.membershipExpiryDays,
                notifyPaymentFailure: settings.paymentFailure,
                notifyLowAttendance: settings.lowAttendance,
                lowAttendanceWeeks: settings.lowAttendanceWeeks,
                dailySummary: settings.dailySummary,
                weeklySummary: settings.weeklySummary,
                notifyNewMember: settings.newMemberAlert,
                notifyChurnRisk: settings.churnRiskAlert,
                emailNotifications: settings.emailNotifications,
                smsNotifications: settings.smsNotifications,
                pushNotifications: settings.pushNotifications,
            })
            setOriginalSettings(settings)
            setHasChanges(false)
            toast.success("Notification settings saved successfully")
        } catch (error) {
            toast.error("Failed to save notification settings")
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading notification settings...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Notifications</h2>
                        <p className="settings-section__description">
                            Actionable alerts that drive decisions
                        </p>
                    </div>
                </div>
                {hasChanges && (
                    <button 
                        className="settings-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            <div className="settings-section__content">
                <div className="form-group">
                    <div className="form-group__header">
                        <MessageSquare size={16} />
                        <h4 className="form-group__title">Notification Channels</h4>
                    </div>

                    <div className="notification-channels">
                        <div className="notification-channel">
                            <div className="notification-channel__info">
                                <Mail size={18} />
                                <span>Email</span>
                            </div>
                            <button
                                className={`policy-toggle ${settings.emailNotifications ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                            />
                        </div>

                        <div className="notification-channel">
                            <div className="notification-channel__info">
                                <MessageSquare size={18} />
                                <span>SMS</span>
                            </div>
                            <button
                                className={`policy-toggle ${settings.smsNotifications ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateSetting('smsNotifications', !settings.smsNotifications)}
                            />
                        </div>

                        <div className="notification-channel">
                            <div className="notification-channel__info">
                                <Bell size={18} />
                                <span>Push</span>
                            </div>
                            <button
                                className={`policy-toggle ${settings.pushNotifications ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <AlertCircle size={16} />
                        <h4 className="form-group__title">Critical Alerts</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Calendar size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Membership Expiry</span>
                                <span className="policy-toggle-row__hint">Alert when memberships are about to expire</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.membershipExpiry ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('membershipExpiry', !settings.membershipExpiry)}
                        />
                    </div>

                    {settings.membershipExpiry && (
                        <div className="form-grid" style={{ marginLeft: '40px', marginTop: '8px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Days before expiry</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={settings.membershipExpiryDays}
                                    onChange={(e) => updateSetting('membershipExpiryDays', parseInt(e.target.value) || 7)}
                                    min={1}
                                    max={30}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <CreditCard size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Payment Failure</span>
                                <span className="policy-toggle-row__hint">Immediate notification when payment fails</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.paymentFailure ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('paymentFailure', !settings.paymentFailure)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Users size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">New Member Alert</span>
                                <span className="policy-toggle-row__hint">Notification when new member signs up</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.newMemberAlert ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('newMemberAlert', !settings.newMemberAlert)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <TrendingDown size={16} />
                        <h4 className="form-group__title">Engagement Alerts</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Activity size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Low Attendance Warning</span>
                                <span className="policy-toggle-row__hint">Alert when member hasn't visited recently</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.lowAttendance ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('lowAttendance', !settings.lowAttendance)}
                        />
                    </div>

                    {settings.lowAttendance && (
                        <div className="form-grid" style={{ marginLeft: '40px', marginTop: '8px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Weeks without visit</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={settings.lowAttendanceWeeks}
                                    onChange={(e) => updateSetting('lowAttendanceWeeks', parseInt(e.target.value) || 2)}
                                    min={1}
                                    max={8}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <TrendingDown size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Churn Risk Alert</span>
                                <span className="policy-toggle-row__hint">AI-detected members likely to cancel</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.churnRiskAlert ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('churnRiskAlert', !settings.churnRiskAlert)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <FileText size={16} />
                        <h4 className="form-group__title">Summary Reports</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <FileText size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Daily Summary</span>
                                <span className="policy-toggle-row__hint">Daily digest of key metrics and events</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.dailySummary ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('dailySummary', !settings.dailySummary)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <FileText size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Weekly Summary</span>
                                <span className="policy-toggle-row__hint">Weekly report with revenue and trends</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.weeklySummary ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('weeklySummary', !settings.weeklySummary)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsSection
