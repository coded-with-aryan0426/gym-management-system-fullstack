"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Bell, 
    Save, 
    Loader2, 
    Mail, 
    Smartphone, 
    MessageSquare, 
    Clock, 
    Calendar, 
    AlertCircle,
    CheckCircle2,
    Info,
    CreditCard,
    Zap
} from "lucide-react"
import api from "../../../services/api"

interface NotificationSettings {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    whatsappNotifications: boolean
    notifyOnNewMember: boolean
    notifyOnPayment: boolean
    notifyOnLowStock: boolean
    notifyOnClassBooking: boolean
    paymentReminderDays: number[]
    expiryReminderDays: number[]
    dailyReportEnabled: boolean
}

const NotificationsSection: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        whatsappNotifications: false,
        notifyOnNewMember: true,
        notifyOnPayment: true,
        notifyOnLowStock: true,
        notifyOnClassBooking: true,
        paymentReminderDays: [3, 1],
        expiryReminderDays: [7, 3, 1],
        dailyReportEnabled: true,
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
                const fetched = response.data
                const notificationSettings: NotificationSettings = {
                    emailNotifications: fetched.emailNotifications === 'true' || fetched.emailNotifications === true,
                    smsNotifications: fetched.smsNotifications === 'true' || fetched.smsNotifications === true,
                    pushNotifications: fetched.pushNotifications === 'true' || fetched.pushNotifications === true,
                    whatsappNotifications: fetched.whatsappNotifications === 'true' || fetched.whatsappNotifications === true,
                    notifyOnNewMember: fetched.notifyOnNewMember === 'true' || fetched.notifyOnNewMember === true,
                    notifyOnPayment: fetched.notifyOnPayment === 'true' || fetched.notifyOnPayment === true,
                    notifyOnLowStock: fetched.notifyOnLowStock === 'true' || fetched.notifyOnLowStock === true,
                    notifyOnClassBooking: fetched.notifyOnClassBooking === 'true' || fetched.notifyOnClassBooking === true,
                    paymentReminderDays: Array.isArray(fetched.paymentReminderDays) 
                        ? fetched.paymentReminderDays 
                        : (fetched.paymentReminderDays ? fetched.paymentReminderDays.split(',').map(Number) : [3, 1]),
                    expiryReminderDays: Array.isArray(fetched.expiryReminderDays) 
                        ? fetched.expiryReminderDays 
                        : (fetched.expiryReminderDays ? fetched.expiryReminderDays.split(',').map(Number) : [7, 3, 1]),
                    dailyReportEnabled: fetched.dailyReportEnabled === 'true' || fetched.dailyReportEnabled === true,
                }
                setSettings(notificationSettings)
                setOriginalSettings(notificationSettings)
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
            await api.put('/api/gym-settings', settings)
            setOriginalSettings(settings)
            setHasChanges(false)
            toast.success("Notification settings saved successfully")
        } catch (error) {
            toast.error("Failed to save notification settings")
        } finally {
            setSaving(false)
        }
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
                            Manage how and when you and your members receive alerts
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
                        <Zap size={16} />
                        <h4 className="form-group__title">Active Channels</h4>
                    </div>

                    <div className="notification-channel-group">
                        <div className="notification-channel">
                            <div className="notification-channel__label">
                                <Mail size={16} />
                                Email
                            </div>
                            <button
                                className={`policy-toggle ${settings.emailNotifications ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                            />
                        </div>

                        <div className="notification-channel">
                            <div className="notification-channel__label">
                                <Smartphone size={16} />
                                SMS
                            </div>
                            <button
                                className={`policy-toggle ${settings.smsNotifications ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateSetting('smsNotifications', !settings.smsNotifications)}
                            />
                        </div>

                        <div className="notification-channel">
                            <div className="notification-channel__label">
                                <MessageSquare size={16} />
                                WhatsApp
                            </div>
                            <button
                                className={`policy-toggle ${settings.whatsappNotifications ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateSetting('whatsappNotifications', !settings.whatsappNotifications)}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <AlertCircle size={16} />
                        <h4 className="form-group__title">Admin Alerts</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <CheckCircle2 size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">New Member Registration</span>
                                <span className="policy-toggle-row__hint">Alert when a new member joins the gym</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.notifyOnNewMember ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('notifyOnNewMember', !settings.notifyOnNewMember)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <CreditCard size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Payment Received</span>
                                <span className="policy-toggle-row__hint">Alert when a member completes a payment</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.notifyOnPayment ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('notifyOnPayment', !settings.notifyOnPayment)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Clock size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Daily Revenue Report</span>
                                <span className="policy-toggle-row__hint">Receive a summary of today's earnings at EOD</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.dailyReportEnabled ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('dailyReportEnabled', !settings.dailyReportEnabled)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Calendar size={16} />
                        <h4 className="form-group__title">Member Reminders</h4>
                    </div>

                    <div className="policy-toggle-row" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Info size={16} color="var(--settings-accent-blue)" />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Reminder Logic</span>
                                <span className="policy-toggle-row__hint">
                                    Reminder intervals for payments and expirations are synced with <strong>Membership Policies</strong>.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsSection
