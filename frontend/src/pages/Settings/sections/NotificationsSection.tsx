"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Bell, 
    Mail, 
    MessageSquare, 
    Smartphone, 
    RefreshCw, 
    UserPlus, 
    TrendingUp, 
    AlertCircle,
    Save,
    Loader2,
    Calendar,
    Settings
} from "lucide-react"
import api from "../../../services/api"

interface NotificationSettings {
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
    pushNotifications: boolean
    memberRenewalReminders: boolean
    staffShiftReminders: boolean
    dailyRevenueReport: boolean
    systemAlerts: boolean
}

const NotificationsSection: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        smsNotifications: false,
        whatsappNotifications: false,
        pushNotifications: true,
        memberRenewalReminders: true,
        staffShiftReminders: true,
        dailyRevenueReport: false,
        systemAlerts: true,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings')
            if (response.data) {
                const data = response.data
                const notificationSettings: NotificationSettings = {
                    emailNotifications: data.emailNotifications === 'true',
                    smsNotifications: data.smsNotifications === 'true',
                    whatsappNotifications: data.whatsappNotifications === 'true',
                    pushNotifications: data.pushNotifications === 'true',
                    memberRenewalReminders: data.memberRenewalReminders === 'true',
                    staffShiftReminders: data.staffShiftReminders === 'true',
                    dailyRevenueReport: data.dailyRevenueReport === 'true',
                    systemAlerts: data.systemAlerts === 'true',
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
            await api.put('/settings', settings)
            setOriginalSettings(settings)
            setHasChanges(false)
            toast.success("Notification settings saved successfully")
        } catch (error) {
            console.error('Failed to save notification settings:', error)
            toast.error("Failed to save notification settings")
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
                            Manage how and when you receive updates
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
                        <Smartphone size={16} />
                        <h4 className="form-group__title">Notification Channels</h4>
                    </div>

                    <div className="notification-channels-grid">
                        <button 
                            className={`channel-toggle ${settings.emailNotifications ? 'channel-toggle--active' : ''}`}
                            onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                        >
                            <Mail size={18} />
                            <span>Email</span>
                        </button>
                        <button 
                            className={`channel-toggle ${settings.smsNotifications ? 'channel-toggle--active' : ''}`}
                            onClick={() => updateSetting('smsNotifications', !settings.smsNotifications)}
                        >
                            <Smartphone size={18} />
                            <span>SMS</span>
                        </button>
                        <button 
                            className={`channel-toggle ${settings.whatsappNotifications ? 'channel-toggle--active' : ''}`}
                            onClick={() => updateSetting('whatsappNotifications', !settings.whatsappNotifications)}
                        >
                            <MessageSquare size={18} />
                            <span>WhatsApp</span>
                        </button>
                        <button 
                            className={`channel-toggle ${settings.pushNotifications ? 'channel-toggle--active' : ''}`}
                            onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                        >
                            <Bell size={18} />
                            <span>Push</span>
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Settings size={16} />
                        <h4 className="form-group__title">Reminder Preferences</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <RefreshCw size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Member Renewal Reminders</span>
                                <span className="policy-toggle-row__hint">Notify when memberships are about to expire</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.memberRenewalReminders ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('memberRenewalReminders', !settings.memberRenewalReminders)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Calendar size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Staff Shift Reminders</span>
                                <span className="policy-toggle-row__hint">Send reminders to staff before their shifts</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.staffShiftReminders ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('staffShiftReminders', !settings.staffShiftReminders)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <TrendingUp size={16} />
                        <h4 className="form-group__title">Reports & Alerts</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <TrendingUp size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Daily Revenue Report</span>
                                <span className="policy-toggle-row__hint">Receive a summary of today's collections every evening</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.dailyRevenueReport ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('dailyRevenueReport', !settings.dailyRevenueReport)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <AlertCircle size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">System Critical Alerts</span>
                                <span className="policy-toggle-row__hint">Notify about payment failures or account locks</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.systemAlerts ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('systemAlerts', !settings.systemAlerts)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsSection
