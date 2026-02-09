"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Users, 
    Pause, 
    ArrowLeftRight, 
    XCircle, 
    Calendar,
    Bell,
    Info,
    Save,
    Loader2,
    Clock,
    Plus,
    X
} from "lucide-react"
import api from "../../../services/api"

interface MembershipPolicy {
    freezeAllowanceDays: number
    maxFreezesPerYear: number
    allowTransfer: boolean
    transferFee: number
    cancellationNoticeDays: number
    cancellationFee: number
    defaultDurationMonths: number
    expiryReminderDays: number[]
    allowUpgrade: boolean
    allowDowngrade: boolean
    prorateUpgrades: boolean
}

const MembershipPoliciesSection: React.FC = () => {
    const [policies, setPolicies] = useState<MembershipPolicy>({
        freezeAllowanceDays: 30,
        maxFreezesPerYear: 2,
        allowTransfer: false,
        transferFee: 500,
        cancellationNoticeDays: 7,
        cancellationFee: 500,
        defaultDurationMonths: 1,
        expiryReminderDays: [7, 3, 1],
        allowUpgrade: true,
        allowDowngrade: false,
        prorateUpgrades: true,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalPolicies, setOriginalPolicies] = useState<MembershipPolicy | null>(null)
    const [newReminderDay, setNewReminderDay] = useState('')

    useEffect(() => {
        fetchMembershipPolicies()
    }, [])

    const fetchMembershipPolicies = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/settings')
            if (response.data) {
                const settings = response.data
                const membershipSettings: MembershipPolicy = {
                    freezeAllowanceDays: parseInt(settings.freezeAllowanceDays) || 30,
                    maxFreezesPerYear: parseInt(settings.maxFreezesPerYear) || 2,
                    allowTransfer: settings.allowTransfer === 'true' || settings.allowTransfer === true,
                    transferFee: parseInt(settings.transferFee) || 500,
                    cancellationNoticeDays: parseInt(settings.cancellationNoticeDays) || 7,
                    cancellationFee: parseInt(settings.cancellationFee) || 500,
                    defaultDurationMonths: parseInt(settings.defaultDurationMonths) || 1,
                    expiryReminderDays: Array.isArray(settings.expiryReminderDays) 
                        ? settings.expiryReminderDays 
                        : (settings.expiryReminderDays ? settings.expiryReminderDays.split(',').map(Number) : [7, 3, 1]),
                    allowUpgrade: settings.allowUpgrade === 'true' || settings.allowUpgrade === true,
                    allowDowngrade: settings.allowDowngrade === 'true' || settings.allowDowngrade === true,
                    prorateUpgrades: settings.prorateUpgrades === 'true' || settings.prorateUpgrades === true,
                }
                setPolicies(membershipSettings)
                setOriginalPolicies(membershipSettings)
            }
        } catch (error) {
            console.error('Failed to fetch membership policies:', error)
        } finally {
            setLoading(false)
        }
    }

    const updatePolicy = <K extends keyof MembershipPolicy>(key: K, value: MembershipPolicy[K]) => {
        setPolicies(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPolicies))
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put('/api/settings', policies)
            setOriginalPolicies(policies)
            setHasChanges(false)
            toast.success("Membership policies saved successfully")
        } catch (error) {
            toast.error("Failed to save membership policies")
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const addReminderDay = () => {
        const day = parseInt(newReminderDay)
        if (day > 0 && day <= 30 && !policies.expiryReminderDays.includes(day)) {
            const newDays = [...policies.expiryReminderDays, day].sort((a, b) => b - a)
            updatePolicy('expiryReminderDays', newDays)
            setNewReminderDay('')
        }
    }

    const removeReminderDay = (day: number) => {
        updatePolicy('expiryReminderDays', policies.expiryReminderDays.filter(d => d !== day))
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading membership policies...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Membership Policies</h2>
                        <p className="settings-section__description">
                            Rules for freezes, transfers, and cancellations
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
                        <Calendar size={16} />
                        <h4 className="form-group__title">Duration & Defaults</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                <Clock size={14} />
                                Default Duration
                            </label>
                            <select
                                className="dense-input"
                                value={policies.defaultDurationMonths}
                                onChange={(e) => updatePolicy('defaultDurationMonths', parseInt(e.target.value))}
                            >
                                <option value={1}>1 Month</option>
                                <option value={3}>3 Months</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>12 Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <ArrowLeftRight size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Plan Upgrades</span>
                                <span className="policy-toggle-row__hint">Members can upgrade to higher tier plans</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowUpgrade ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowUpgrade', !policies.allowUpgrade)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <ArrowLeftRight size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Plan Downgrades</span>
                                <span className="policy-toggle-row__hint">Members can downgrade to lower tier plans</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowDowngrade ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowDowngrade', !policies.allowDowngrade)}
                        />
                    </div>

                    {policies.allowUpgrade && (
                        <div className="policy-toggle-row" style={{ marginLeft: '40px' }}>
                            <div className="policy-toggle-row__info">
                                <div className="policy-toggle-row__icon">
                                    <Info size={16} />
                                </div>
                                <div className="policy-toggle-row__text">
                                    <span className="policy-toggle-row__label">Prorate Upgrade Costs</span>
                                    <span className="policy-toggle-row__hint">Calculate partial credit for remaining days</span>
                                </div>
                            </div>
                            <button
                                className={`policy-toggle ${policies.prorateUpgrades ? 'policy-toggle--active' : ''}`}
                                onClick={() => updatePolicy('prorateUpgrades', !policies.prorateUpgrades)}
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Pause size={16} />
                        <h4 className="form-group__title">Freeze Policy</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Max Freeze Days (Yearly)
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.freezeAllowanceDays}
                                onChange={(e) => updatePolicy('freezeAllowanceDays', parseInt(e.target.value) || 0)}
                                min={0}
                                max={90}
                            />
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                Max Freezes Per Year
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.maxFreezesPerYear}
                                onChange={(e) => updatePolicy('maxFreezesPerYear', parseInt(e.target.value) || 0)}
                                min={0}
                                max={12}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <ArrowLeftRight size={16} />
                        <h4 className="form-group__title">Transfer Policy</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <ArrowLeftRight size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Membership Transfer</span>
                                <span className="policy-toggle-row__hint">Members can transfer remaining days to another person</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowTransfer ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowTransfer', !policies.allowTransfer)}
                        />
                    </div>

                    {policies.allowTransfer && (
                        <div className="form-grid" style={{ marginTop: '12px', marginLeft: '40px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Transfer Fee (₹)</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={policies.transferFee}
                                    onChange={(e) => updatePolicy('transferFee', parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <XCircle size={16} />
                        <h4 className="form-group__title">Cancellation Policy</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Notice Period (Days)
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.cancellationNoticeDays}
                                onChange={(e) => updatePolicy('cancellationNoticeDays', parseInt(e.target.value) || 0)}
                                min={0}
                                max={30}
                            />
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                Cancellation Fee (₹)
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.cancellationFee}
                                onChange={(e) => updatePolicy('cancellationFee', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Bell size={16} />
                        <h4 className="form-group__title">Expiry Reminders</h4>
                    </div>

                    <div className="field-wrapper">
                        <label className="field-label">
                            Send reminders at (days before expiry)
                        </label>
                        <div className="reminder-input-row">
                            <input
                                type="number"
                                className="dense-input"
                                placeholder="Days"
                                value={newReminderDay}
                                onChange={(e) => setNewReminderDay(e.target.value)}
                                min={1}
                                max={30}
                                style={{ width: '100px' }}
                            />
                            <button 
                                className="reminder-add-btn"
                                onClick={addReminderDay}
                                disabled={!newReminderDay}
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>
                        <div className="reminder-tags">
                            {policies.expiryReminderDays.map(day => (
                                <span key={day} className="reminder-tag">
                                    {day} {day === 1 ? 'day' : 'days'}
                                    <button 
                                        className="reminder-tag__remove"
                                        onClick={() => removeReminderDay(day)}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MembershipPoliciesSection
