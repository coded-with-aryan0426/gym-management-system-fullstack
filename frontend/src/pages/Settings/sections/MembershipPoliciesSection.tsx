"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { showToast } from "../../../utils/showToast"
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
    X,
    AlertTriangle,
    Check,
    RefreshCw,
    Shield,
    Percent,
    DollarSign,
    UserMinus,
    UserPlus,
    CalendarClock,
    BadgeCheck
} from "lucide-react"
import api from "../../../services/api"

interface MembershipPolicy {
    // Duration settings
    defaultDurationMonths: number
    minMembershipDurationDays: number
    maxMembershipDurationMonths: number
    
    // Plan change settings
    allowUpgrade: boolean
    allowDowngrade: boolean
    prorateUpgrades: boolean
    prorateDowngrades: boolean
    planChangeNoticeDays: number
    planChangeFee: number
    
    // Freeze settings
    freezeAllowanceDays: number
    maxFreezesPerYear: number
    minFreezeDurationDays: number
    maxFreezeDurationDays: number
    freezeFeeEnabled: boolean
    freezeFeePerDay: number
    
    // Transfer settings
    allowTransfer: boolean
    transferFee: number
    transferExpiryExtension: boolean
    transferRequiresApproval: boolean
    
    // Cancellation settings
    cancellationNoticeDays: number
    cancellationFee: number
    cancellationFeeType: string
    cancellationFeePercentage: number
    allowEarlyCancellation: boolean
    earlyCancellationPenalty: number
    
    // Renewal settings
    autoRenewalEnabled: boolean
    renewalReminderDays: number[]
    expiryReminderDays: number[]
    graceAfterExpiry: number
    
    // Guest passes
    guestPassesPerMonth: number
    guestPassFee: number
    guestPassDurationHours: number
}

interface ChangeItem {
    field: string
    oldValue: string
    newValue: string
}

const defaultPolicies: MembershipPolicy = {
    defaultDurationMonths: 1,
    minMembershipDurationDays: 30,
    maxMembershipDurationMonths: 24,
    
    allowUpgrade: true,
    allowDowngrade: false,
    prorateUpgrades: true,
    prorateDowngrades: false,
    planChangeNoticeDays: 0,
    planChangeFee: 0,
    
    freezeAllowanceDays: 30,
    maxFreezesPerYear: 2,
    minFreezeDurationDays: 7,
    maxFreezeDurationDays: 30,
    freezeFeeEnabled: false,
    freezeFeePerDay: 0,
    
    allowTransfer: false,
    transferFee: 500,
    transferExpiryExtension: false,
    transferRequiresApproval: true,
    
    cancellationNoticeDays: 7,
    cancellationFee: 500,
    cancellationFeeType: 'FIXED',
    cancellationFeePercentage: 10,
    allowEarlyCancellation: true,
    earlyCancellationPenalty: 1000,
    
    autoRenewalEnabled: false,
    renewalReminderDays: [14, 7, 3],
    expiryReminderDays: [7, 3, 1],
    graceAfterExpiry: 3,
    
    guestPassesPerMonth: 2,
    guestPassFee: 200,
    guestPassDurationHours: 4
}

const MembershipPoliciesSection: React.FC = () => {
    const [policies, setPolicies] = useState<MembershipPolicy>(defaultPolicies)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalPolicies, setOriginalPolicies] = useState<MembershipPolicy | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingChanges, setPendingChanges] = useState<ChangeItem[]>([])
    const [activeTab, setActiveTab] = useState<'duration' | 'freeze' | 'transfer' | 'cancellation' | 'renewal' | 'guest'>('duration')
    const [newReminderDay, setNewReminderDay] = useState<number>(0)
    const [newExpiryDay, setNewExpiryDay] = useState<number>(0)

    useEffect(() => {
        fetchMembershipPolicies()
    }, [])

    const fetchMembershipPolicies = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/gym')
            if (response.data) {
                const settings = response.data
                
                const parseBoolean = (val: any): boolean => val === true || val === 'true'
                const parseNumber = (val: any, defaultVal: number): number => {
                    const num = parseFloat(val)
                    return isNaN(num) ? defaultVal : num
                }
                const parseArray = (val: any, defaultVal: number[]): number[] => {
                    if (Array.isArray(val)) return val
                    if (typeof val === 'string' && val) {
                        return val.split(',').map(Number).filter(n => !isNaN(n))
                    }
                    return defaultVal
                }
                
                const membershipSettings: MembershipPolicy = {
                    defaultDurationMonths: parseNumber(settings.defaultDurationMonths, 1),
                    minMembershipDurationDays: parseNumber(settings.minMembershipDurationDays, 30),
                    maxMembershipDurationMonths: parseNumber(settings.maxMembershipDurationMonths, 24),
                    
                    allowUpgrade: parseBoolean(settings.allowUpgrade ?? true),
                    allowDowngrade: parseBoolean(settings.allowDowngrade),
                    prorateUpgrades: parseBoolean(settings.prorateUpgrades ?? true),
                    prorateDowngrades: parseBoolean(settings.prorateDowngrades),
                    planChangeNoticeDays: parseNumber(settings.planChangeNoticeDays, 0),
                    planChangeFee: parseNumber(settings.planChangeFee, 0),
                    
                    freezeAllowanceDays: parseNumber(settings.freezeAllowanceDays, 30),
                    maxFreezesPerYear: parseNumber(settings.maxFreezesPerYear, 2),
                    minFreezeDurationDays: parseNumber(settings.minFreezeDurationDays, 7),
                    maxFreezeDurationDays: parseNumber(settings.maxFreezeDurationDays, 30),
                    freezeFeeEnabled: parseBoolean(settings.freezeFeeEnabled),
                    freezeFeePerDay: parseNumber(settings.freezeFeePerDay, 0),
                    
                    allowTransfer: parseBoolean(settings.allowTransfer),
                    transferFee: parseNumber(settings.transferFee, 500),
                    transferExpiryExtension: parseBoolean(settings.transferExpiryExtension),
                    transferRequiresApproval: parseBoolean(settings.transferRequiresApproval ?? true),
                    
                    cancellationNoticeDays: parseNumber(settings.cancellationNoticeDays, 7),
                    cancellationFee: parseNumber(settings.cancellationFee, 500),
                    cancellationFeeType: settings.cancellationFeeType || 'FIXED',
                    cancellationFeePercentage: parseNumber(settings.cancellationFeePercentage, 10),
                    allowEarlyCancellation: parseBoolean(settings.allowEarlyCancellation ?? true),
                    earlyCancellationPenalty: parseNumber(settings.earlyCancellationPenalty, 1000),
                    
                    autoRenewalEnabled: parseBoolean(settings.autoRenewalEnabled),
                    renewalReminderDays: parseArray(settings.renewalReminderDays, [14, 7, 3]),
                    expiryReminderDays: parseArray(settings.expiryReminderDays, [7, 3, 1]),
                    graceAfterExpiry: parseNumber(settings.graceAfterExpiry, 3),
                    
                    guestPassesPerMonth: parseNumber(settings.guestPassesPerMonth, 2),
                    guestPassFee: parseNumber(settings.guestPassFee, 200),
                    guestPassDurationHours: parseNumber(settings.guestPassDurationHours, 4),
                }
                setPolicies(membershipSettings)
                setOriginalPolicies(membershipSettings)
            }
        } catch (error) {
            console.error('Failed to fetch membership policies:', error)
            setOriginalPolicies(defaultPolicies)
        } finally {
            setLoading(false)
        }
    }

    const updatePolicy = useCallback(<K extends keyof MembershipPolicy>(key: K, value: MembershipPolicy[K]) => {
        setPolicies(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPolicies))
            return updated
        })
    }, [originalPolicies])

    const formatFieldName = (field: string): string => {
        const fieldNames: Record<string, string> = {
            defaultDurationMonths: 'Default Duration',
            minMembershipDurationDays: 'Min Duration (Days)',
            maxMembershipDurationMonths: 'Max Duration (Months)',
            allowUpgrade: 'Allow Upgrades',
            allowDowngrade: 'Allow Downgrades',
            prorateUpgrades: 'Prorate Upgrades',
            prorateDowngrades: 'Prorate Downgrades',
            planChangeNoticeDays: 'Plan Change Notice',
            planChangeFee: 'Plan Change Fee',
            freezeAllowanceDays: 'Freeze Allowance',
            maxFreezesPerYear: 'Max Freezes/Year',
            minFreezeDurationDays: 'Min Freeze Days',
            maxFreezeDurationDays: 'Max Freeze Days',
            freezeFeeEnabled: 'Freeze Fee',
            freezeFeePerDay: 'Freeze Fee/Day',
            allowTransfer: 'Allow Transfer',
            transferFee: 'Transfer Fee',
            transferExpiryExtension: 'Extend on Transfer',
            transferRequiresApproval: 'Require Approval',
            cancellationNoticeDays: 'Cancellation Notice',
            cancellationFee: 'Cancellation Fee',
            cancellationFeeType: 'Fee Type',
            cancellationFeePercentage: 'Fee Percentage',
            allowEarlyCancellation: 'Early Cancellation',
            earlyCancellationPenalty: 'Early Penalty',
            autoRenewalEnabled: 'Auto Renewal',
            renewalReminderDays: 'Renewal Reminders',
            expiryReminderDays: 'Expiry Reminders',
            graceAfterExpiry: 'Grace Period',
            guestPassesPerMonth: 'Guest Passes/Month',
            guestPassFee: 'Guest Pass Fee',
            guestPassDurationHours: 'Guest Pass Hours',
        }
        return fieldNames[field] || field
    }

    const formatValue = (key: string, value: any): string => {
        if (value === null || value === undefined) return 'Not set'
        if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
        if (Array.isArray(value)) return value.join(', ') + ' days'
        if (key.includes('Fee') || key.includes('Penalty')) return `₹${value}`
        if (key.includes('Days') || key.includes('days')) return `${value} days`
        if (key.includes('Months') || key.includes('months')) return `${value} months`
        if (key.includes('Hours') || key.includes('hours')) return `${value} hours`
        if (key.includes('Percentage') || key.includes('percentage')) return `${value}%`
        return String(value)
    }

    const calculateChanges = (): ChangeItem[] => {
        if (!originalPolicies) return []
        
        const changes: ChangeItem[] = []
        const keys = Object.keys(policies) as (keyof MembershipPolicy)[]
        
        keys.forEach(key => {
            const oldVal = originalPolicies[key]
            const newVal = policies[key]
            
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                changes.push({
                    field: formatFieldName(key),
                    oldValue: formatValue(key, oldVal),
                    newValue: formatValue(key, newVal),
                })
            }
        })
        
        return changes
    }

    const handleSaveClick = () => {
        const changes = calculateChanges()
        if (changes.length === 0) {
            showToast("No changes to save", "info")
            return
        }
        setPendingChanges(changes)
        setShowConfirmDialog(true)
    }

    const handleConfirmSave = async () => {
        try {
            setSaving(true)
            setShowConfirmDialog(false)
            
            const settingsToSave = {
                defaultDurationMonths: String(policies.defaultDurationMonths),
                minMembershipDurationDays: String(policies.minMembershipDurationDays),
                maxMembershipDurationMonths: String(policies.maxMembershipDurationMonths),
                allowUpgrade: String(policies.allowUpgrade),
                allowDowngrade: String(policies.allowDowngrade),
                prorateUpgrades: String(policies.prorateUpgrades),
                prorateDowngrades: String(policies.prorateDowngrades),
                planChangeNoticeDays: String(policies.planChangeNoticeDays),
                planChangeFee: String(policies.planChangeFee),
                freezeAllowanceDays: String(policies.freezeAllowanceDays),
                maxFreezesPerYear: String(policies.maxFreezesPerYear),
                minFreezeDurationDays: String(policies.minFreezeDurationDays),
                maxFreezeDurationDays: String(policies.maxFreezeDurationDays),
                freezeFeeEnabled: String(policies.freezeFeeEnabled),
                freezeFeePerDay: String(policies.freezeFeePerDay),
                allowTransfer: String(policies.allowTransfer),
                transferFee: String(policies.transferFee),
                transferExpiryExtension: String(policies.transferExpiryExtension),
                transferRequiresApproval: String(policies.transferRequiresApproval),
                cancellationNoticeDays: String(policies.cancellationNoticeDays),
                cancellationFee: String(policies.cancellationFee),
                cancellationFeeType: policies.cancellationFeeType,
                cancellationFeePercentage: String(policies.cancellationFeePercentage),
                allowEarlyCancellation: String(policies.allowEarlyCancellation),
                earlyCancellationPenalty: String(policies.earlyCancellationPenalty),
                autoRenewalEnabled: String(policies.autoRenewalEnabled),
                renewalReminderDays: policies.renewalReminderDays.join(','),
                expiryReminderDays: policies.expiryReminderDays.join(','),
                graceAfterExpiry: String(policies.graceAfterExpiry),
                guestPassesPerMonth: String(policies.guestPassesPerMonth),
                guestPassFee: String(policies.guestPassFee),
                guestPassDurationHours: String(policies.guestPassDurationHours),
            }
            
            await api.put('/settings/gym', settingsToSave)
            setOriginalPolicies({ ...policies })
            setHasChanges(false)
            showToast("Membership policies saved successfully", "success")
        } catch (error) {
            showToast("Failed to save membership policies", "error")
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const addReminderDay = (type: 'renewal' | 'expiry') => {
        const day = type === 'renewal' ? newReminderDay : newExpiryDay
        if (day <= 0 || day > 60) {
            showToast("Please enter a valid day (1-60)", "error")
            return
        }
        
        const key = type === 'renewal' ? 'renewalReminderDays' : 'expiryReminderDays'
        const currentDays = policies[key]
        
        if (currentDays.includes(day)) {
            showToast("This day is already added", "error")
            return
        }
        
        const newDays = [...currentDays, day].sort((a, b) => b - a)
        updatePolicy(key, newDays)
        
        if (type === 'renewal') setNewReminderDay(0)
        else setNewExpiryDay(0)
    }

    const removeReminderDay = (type: 'renewal' | 'expiry', day: number) => {
        const key = type === 'renewal' ? 'renewalReminderDays' : 'expiryReminderDays'
        const newDays = policies[key].filter(d => d !== day)
        updatePolicy(key, newDays)
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

    const tabs = [
        { id: 'duration', label: 'Duration & Plans', icon: Calendar },
        { id: 'freeze', label: 'Freeze Policy', icon: Pause },
        { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
        { id: 'cancellation', label: 'Cancellation', icon: XCircle },
        { id: 'renewal', label: 'Renewal & Expiry', icon: RefreshCw },
        { id: 'guest', label: 'Guest Passes', icon: UserPlus },
    ]

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
                            Configure membership rules, freezes, transfers, and cancellation policies
                        </p>
                    </div>
                </div>
                {hasChanges && (
                    <button 
                        className="settings-save-btn"
                        onClick={handleSaveClick}
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="settings-section__content">
                {/* Duration & Plans Tab */}
                {activeTab === 'duration' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Clock size={16} />
                                <h4 className="form-group__title">Membership Duration</h4>
                            </div>

                            <div className="form-grid form-grid--3col">
                                <div className="field-wrapper">
                                    <label className="field-label">Default Duration</label>
                                    <select
                                        className="dense-input"
                                        value={policies.defaultDurationMonths}
                                        onChange={(e) => updatePolicy('defaultDurationMonths', parseInt(e.target.value))}
                                    >
                                        <option value={1}>1 Month</option>
                                        <option value={3}>3 Months</option>
                                        <option value={6}>6 Months</option>
                                        <option value={12}>12 Months</option>
                                        <option value={24}>24 Months</option>
                                    </select>
                                    <span className="field-hint">Pre-selected duration for new members</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Min Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.minMembershipDurationDays}
                                        onChange={(e) => updatePolicy('minMembershipDurationDays', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={365}
                                    />
                                    <span className="field-hint">Shortest allowed membership</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Max Duration (Months)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.maxMembershipDurationMonths}
                                        onChange={(e) => updatePolicy('maxMembershipDurationMonths', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={60}
                                    />
                                    <span className="field-hint">Longest allowed membership</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <ArrowLeftRight size={16} />
                                <h4 className="form-group__title">Plan Changes</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <UserPlus size={16} />
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

                            {policies.allowUpgrade && (
                                <div className="policy-toggle-row" style={{ marginLeft: '40px' }}>
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <Percent size={16} />
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

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <UserMinus size={16} />
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

                            {policies.allowDowngrade && (
                                <div className="policy-toggle-row" style={{ marginLeft: '40px' }}>
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <Percent size={16} />
                                        </div>
                                        <div className="policy-toggle-row__text">
                                            <span className="policy-toggle-row__label">Prorate Downgrade Refunds</span>
                                            <span className="policy-toggle-row__hint">Issue partial refund for remaining days</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`policy-toggle ${policies.prorateDowngrades ? 'policy-toggle--active' : ''}`}
                                        onClick={() => updatePolicy('prorateDowngrades', !policies.prorateDowngrades)}
                                    />
                                </div>
                            )}

                            {(policies.allowUpgrade || policies.allowDowngrade) && (
                                <div className="form-grid form-grid--2col" style={{ marginTop: '16px', marginLeft: '40px' }}>
                                    <div className="field-wrapper">
                                        <label className="field-label">Notice Period (Days)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={policies.planChangeNoticeDays}
                                            onChange={(e) => updatePolicy('planChangeNoticeDays', parseInt(e.target.value) || 0)}
                                            min={0}
                                            max={30}
                                        />
                                        <span className="field-hint">Days required before plan change</span>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Plan Change Fee (₹)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={policies.planChangeFee}
                                            onChange={(e) => updatePolicy('planChangeFee', parseInt(e.target.value) || 0)}
                                            min={0}
                                        />
                                        <span className="field-hint">Fee charged for changing plans</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Freeze Policy Tab */}
                {activeTab === 'freeze' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Pause size={16} />
                                <h4 className="form-group__title">Freeze Allowance</h4>
                            </div>

                            <div className="form-grid form-grid--2col">
                                <div className="field-wrapper">
                                    <label className="field-label">Total Freeze Days (Per Year)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.freezeAllowanceDays}
                                        onChange={(e) => updatePolicy('freezeAllowanceDays', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={180}
                                    />
                                    <span className="field-hint">Maximum days a member can freeze per year</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Maximum Freezes Per Year</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.maxFreezesPerYear}
                                        onChange={(e) => updatePolicy('maxFreezesPerYear', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={12}
                                    />
                                    <span className="field-hint">Number of times member can freeze</span>
                                </div>
                            </div>

                            <div className="form-grid form-grid--2col" style={{ marginTop: '16px' }}>
                                <div className="field-wrapper">
                                    <label className="field-label">Minimum Freeze Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.minFreezeDurationDays}
                                        onChange={(e) => updatePolicy('minFreezeDurationDays', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={30}
                                    />
                                    <span className="field-hint">Shortest freeze period allowed</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Maximum Freeze Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.maxFreezeDurationDays}
                                        onChange={(e) => updatePolicy('maxFreezeDurationDays', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={90}
                                    />
                                    <span className="field-hint">Longest single freeze allowed</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <DollarSign size={16} />
                                <h4 className="form-group__title">Freeze Fees</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <DollarSign size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Charge Fee for Freezing</span>
                                        <span className="policy-toggle-row__hint">Charge a daily fee while membership is frozen</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${policies.freezeFeeEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updatePolicy('freezeFeeEnabled', !policies.freezeFeeEnabled)}
                                />
                            </div>

                            {policies.freezeFeeEnabled && (
                                <div className="field-wrapper" style={{ marginLeft: '40px', marginTop: '16px', maxWidth: '200px' }}>
                                    <label className="field-label">Freeze Fee Per Day (₹)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.freezeFeePerDay}
                                        onChange={(e) => updatePolicy('freezeFeePerDay', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transfer Tab */}
                {activeTab === 'transfer' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <ArrowLeftRight size={16} />
                                <h4 className="form-group__title">Membership Transfer</h4>
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
                                <>
                                    <div className="field-wrapper" style={{ marginLeft: '40px', marginTop: '16px', maxWidth: '200px' }}>
                                        <label className="field-label">Transfer Fee (₹)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={policies.transferFee}
                                            onChange={(e) => updatePolicy('transferFee', parseInt(e.target.value) || 0)}
                                            min={0}
                                        />
                                        <span className="field-hint">Fee charged for transfer</span>
                                    </div>

                                    <div className="policy-toggle-row" style={{ marginLeft: '40px' }}>
                                        <div className="policy-toggle-row__info">
                                            <div className="policy-toggle-row__icon">
                                                <CalendarClock size={16} />
                                            </div>
                                            <div className="policy-toggle-row__text">
                                                <span className="policy-toggle-row__label">Extend Expiry on Transfer</span>
                                                <span className="policy-toggle-row__hint">Transferred membership starts fresh from transfer date</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`policy-toggle ${policies.transferExpiryExtension ? 'policy-toggle--active' : ''}`}
                                            onClick={() => updatePolicy('transferExpiryExtension', !policies.transferExpiryExtension)}
                                        />
                                    </div>

                                    <div className="policy-toggle-row" style={{ marginLeft: '40px' }}>
                                        <div className="policy-toggle-row__info">
                                            <div className="policy-toggle-row__icon">
                                                <BadgeCheck size={16} />
                                            </div>
                                            <div className="policy-toggle-row__text">
                                                <span className="policy-toggle-row__label">Require Admin Approval</span>
                                                <span className="policy-toggle-row__hint">Transfers must be approved by staff</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`policy-toggle ${policies.transferRequiresApproval ? 'policy-toggle--active' : ''}`}
                                            onClick={() => updatePolicy('transferRequiresApproval', !policies.transferRequiresApproval)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Cancellation Tab */}
                {activeTab === 'cancellation' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <XCircle size={16} />
                                <h4 className="form-group__title">Cancellation Policy</h4>
                            </div>

                            <div className="form-grid form-grid--2col">
                                <div className="field-wrapper">
                                    <label className="field-label">Notice Period (Days)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.cancellationNoticeDays}
                                        onChange={(e) => updatePolicy('cancellationNoticeDays', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={30}
                                    />
                                    <span className="field-hint">Required notice before cancellation</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Cancellation Fee Type</label>
                                    <select
                                        className="dense-input"
                                        value={policies.cancellationFeeType}
                                        onChange={(e) => updatePolicy('cancellationFeeType', e.target.value)}
                                    >
                                        <option value="FIXED">Fixed Amount</option>
                                        <option value="PERCENTAGE">Percentage of Remaining</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid form-grid--2col" style={{ marginTop: '8px' }}>
                                {policies.cancellationFeeType === 'FIXED' ? (
                                    <div className="field-wrapper">
                                        <label className="field-label">Cancellation Fee (₹)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={policies.cancellationFee}
                                            onChange={(e) => updatePolicy('cancellationFee', parseInt(e.target.value) || 0)}
                                            min={0}
                                        />
                                    </div>
                                ) : (
                                    <div className="field-wrapper">
                                        <label className="field-label">Cancellation Fee (%)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={policies.cancellationFeePercentage}
                                            onChange={(e) => updatePolicy('cancellationFeePercentage', parseInt(e.target.value) || 0)}
                                            min={0}
                                            max={100}
                                        />
                                        <span className="field-hint">% of remaining membership value</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <AlertTriangle size={16} />
                                <h4 className="form-group__title">Early Cancellation</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Shield size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Allow Early Cancellation</span>
                                        <span className="policy-toggle-row__hint">Members can cancel before minimum duration</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${policies.allowEarlyCancellation ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updatePolicy('allowEarlyCancellation', !policies.allowEarlyCancellation)}
                                />
                            </div>

                            {policies.allowEarlyCancellation && (
                                <div className="field-wrapper" style={{ marginLeft: '40px', marginTop: '16px', maxWidth: '200px' }}>
                                    <label className="field-label">Early Cancellation Penalty (₹)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.earlyCancellationPenalty}
                                        onChange={(e) => updatePolicy('earlyCancellationPenalty', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                    <span className="field-hint">Additional penalty for early exit</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Renewal & Expiry Tab */}
                {activeTab === 'renewal' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <RefreshCw size={16} />
                                <h4 className="form-group__title">Auto Renewal</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <RefreshCw size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Auto Renewal</span>
                                        <span className="policy-toggle-row__hint">Automatically renew memberships before expiry</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${policies.autoRenewalEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updatePolicy('autoRenewalEnabled', !policies.autoRenewalEnabled)}
                                />
                            </div>

                            {policies.autoRenewalEnabled && (
                                <div className="reminder-days-config" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                    <label className="field-label">Renewal Reminder Days (Before Expiry)</label>
                                    <div className="reminder-tags">
                                        {policies.renewalReminderDays.map(day => (
                                            <span key={day} className="reminder-tag">
                                                {day} day{day !== 1 ? 's' : ''} before
                                                <button onClick={() => removeReminderDay('renewal', day)}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="reminder-add">
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={newReminderDay || ''}
                                            onChange={(e) => setNewReminderDay(parseInt(e.target.value) || 0)}
                                            placeholder="Days"
                                            min={1}
                                            max={60}
                                            style={{ width: '80px' }}
                                        />
                                        <button 
                                            className="add-reminder-btn"
                                            onClick={() => addReminderDay('renewal')}
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Bell size={16} />
                                <h4 className="form-group__title">Expiry Reminders</h4>
                            </div>

                            <div className="reminder-days-config">
                                <label className="field-label">Send Reminders (Days Before Expiry)</label>
                                <div className="reminder-tags">
                                    {policies.expiryReminderDays.map(day => (
                                        <span key={day} className="reminder-tag">
                                            {day} day{day !== 1 ? 's' : ''} before
                                            <button onClick={() => removeReminderDay('expiry', day)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="reminder-add">
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={newExpiryDay || ''}
                                        onChange={(e) => setNewExpiryDay(parseInt(e.target.value) || 0)}
                                        placeholder="Days"
                                        min={1}
                                        max={60}
                                        style={{ width: '80px' }}
                                    />
                                    <button 
                                        className="add-reminder-btn"
                                        onClick={() => addReminderDay('expiry')}
                                    >
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                            </div>

                            <div className="field-wrapper" style={{ marginTop: '16px', maxWidth: '200px' }}>
                                <label className="field-label">Grace Period After Expiry (Days)</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={policies.graceAfterExpiry}
                                    onChange={(e) => updatePolicy('graceAfterExpiry', parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={14}
                                />
                                <span className="field-hint">Days member can access after expiry</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guest Passes Tab */}
                {activeTab === 'guest' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <UserPlus size={16} />
                                <h4 className="form-group__title">Guest Pass Settings</h4>
                            </div>

                            <div className="form-grid form-grid--3col">
                                <div className="field-wrapper">
                                    <label className="field-label">Guest Passes Per Month</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.guestPassesPerMonth}
                                        onChange={(e) => updatePolicy('guestPassesPerMonth', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={10}
                                    />
                                    <span className="field-hint">Passes included with membership</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Guest Pass Fee (₹)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.guestPassFee}
                                        onChange={(e) => updatePolicy('guestPassFee', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                    <span className="field-hint">Fee for additional passes</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Pass Duration (Hours)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.guestPassDurationHours}
                                        onChange={(e) => updatePolicy('guestPassDurationHours', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={24}
                                    />
                                    <span className="field-hint">How long guest can stay</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <div className="confirm-dialog__header">
                            <h3>Confirm Policy Changes</h3>
                            <button onClick={() => setShowConfirmDialog(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="confirm-dialog__body">
                            <p className="confirm-dialog__message">
                                You are about to update the following membership policies:
                            </p>
                            <div className="changes-list">
                                {pendingChanges.map((change, index) => (
                                    <div key={index} className="change-item">
                                        <span className="change-item__field">{change.field}</span>
                                        <div className="change-item__values">
                                            <span className="change-item__old">{change.oldValue}</span>
                                            <span className="change-item__arrow">→</span>
                                            <span className="change-item__new">{change.newValue}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="confirm-dialog__warning">
                                <AlertTriangle size={16} />
                                <span>These changes may affect existing memberships and future renewals.</span>
                            </div>
                        </div>
                        <div className="confirm-dialog__actions">
                            <button 
                                className="confirm-dialog__btn confirm-dialog__btn--cancel"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-dialog__btn confirm-dialog__btn--confirm"
                                onClick={handleConfirmSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                                Confirm Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MembershipPoliciesSection
