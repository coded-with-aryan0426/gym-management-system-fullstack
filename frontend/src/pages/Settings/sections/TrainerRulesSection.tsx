"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Dumbbell, 
    Save, 
    Loader2, 
    Clock, 
    Calendar, 
    DollarSign, 
    AlertCircle,
    CheckCircle2,
    XCircle,
    Users,
    Target,
    Award,
    TrendingUp,
    Star,
    Percent,
    FileText,
    X
} from "lucide-react"
import api from "../../../services/api"

type TabType = 'scheduling' | 'compensation' | 'performance' | 'certification' | 'clients'

interface TrainerRules {
    // Scheduling
    maxDailyHours: number
    maxWeeklyHours: number
    minBreakBetweenSessions: number
    allowBackToBackSessions: boolean
    maxSessionsPerDay: number
    advanceBookingDays: number
    cancellationNoticePeriod: number
    allowSelfScheduling: boolean
    requireManagerApproval: boolean
    
    // Compensation
    baseHourlyRate: number
    ptSessionRate: number
    groupClassRate: number
    commissionEnabled: boolean
    commissionPercentage: number
    bonusEnabled: boolean
    bonusThreshold: number
    bonusAmount: number
    overtimeMultiplier: number
    
    // Performance
    minClientsPerMonth: number
    minSessionsPerWeek: number
    clientRetentionTarget: number
    performanceReviewFrequency: string
    enablePerformanceTracking: boolean
    requireSessionNotes: boolean
    sessionRatingEnabled: boolean
    minAcceptableRating: number
    
    // Certification
    requireCertification: boolean
    certificationExpiryWarningDays: number
    allowExpiredCertTrainers: boolean
    requiredCertifications: string[]
    continuingEducationHours: number
    
    // Client Management
    maxActiveClients: number
    clientAssignmentMethod: string
    allowClientTransfer: boolean
    transferNoticePeriod: number
    newClientTrialSessions: number
}

const TrainerRulesSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('scheduling')
    const [rules, setRules] = useState<TrainerRules>({
        // Scheduling
        maxDailyHours: 8,
        maxWeeklyHours: 40,
        minBreakBetweenSessions: 15,
        allowBackToBackSessions: false,
        maxSessionsPerDay: 10,
        advanceBookingDays: 14,
        cancellationNoticePeriod: 24,
        allowSelfScheduling: true,
        requireManagerApproval: false,
        
        // Compensation
        baseHourlyRate: 500,
        ptSessionRate: 800,
        groupClassRate: 1200,
        commissionEnabled: true,
        commissionPercentage: 10,
        bonusEnabled: true,
        bonusThreshold: 50,
        bonusAmount: 5000,
        overtimeMultiplier: 1.5,
        
        // Performance
        minClientsPerMonth: 10,
        minSessionsPerWeek: 20,
        clientRetentionTarget: 80,
        performanceReviewFrequency: 'monthly',
        enablePerformanceTracking: true,
        requireSessionNotes: true,
        sessionRatingEnabled: true,
        minAcceptableRating: 4.0,
        
        // Certification
        requireCertification: true,
        certificationExpiryWarningDays: 30,
        allowExpiredCertTrainers: false,
        requiredCertifications: ['CPR', 'First Aid', 'Personal Training'],
        continuingEducationHours: 20,
        
        // Client Management
        maxActiveClients: 30,
        clientAssignmentMethod: 'round-robin',
        allowClientTransfer: true,
        transferNoticePeriod: 7,
        newClientTrialSessions: 2,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalRules, setOriginalRules] = useState<TrainerRules | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [newCertification, setNewCertification] = useState('')

    const tabs = [
        { id: 'scheduling' as TabType, label: 'Scheduling', icon: Calendar },
        { id: 'compensation' as TabType, label: 'Compensation', icon: DollarSign },
        { id: 'performance' as TabType, label: 'Performance', icon: TrendingUp },
        { id: 'certification' as TabType, label: 'Certification', icon: Award },
        { id: 'clients' as TabType, label: 'Clients', icon: Users },
    ]

    useEffect(() => {
        fetchTrainerRules()
    }, [])

    const fetchTrainerRules = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/gym')
            if (response.data) {
                const fetched = response.data
                const trainerRules: TrainerRules = {
                    // Scheduling
                    maxDailyHours: parseInt(fetched.trainerMaxDailyHours) || 8,
                    maxWeeklyHours: parseInt(fetched.trainerMaxWeeklyHours) || 40,
                    minBreakBetweenSessions: parseInt(fetched.trainerMinBreakBetweenSessions) || 15,
                    allowBackToBackSessions: fetched.trainerAllowBackToBackSessions === 'true',
                    maxSessionsPerDay: parseInt(fetched.trainerMaxSessionsPerDay) || 10,
                    advanceBookingDays: parseInt(fetched.trainerAdvanceBookingDays) || 14,
                    cancellationNoticePeriod: parseInt(fetched.trainerCancellationNoticePeriod) || 24,
                    allowSelfScheduling: fetched.trainerAllowSelfScheduling !== 'false',
                    requireManagerApproval: fetched.trainerRequireManagerApproval === 'true',
                    
                    // Compensation
                    baseHourlyRate: parseInt(fetched.trainerBaseHourlyRate) || 500,
                    ptSessionRate: parseInt(fetched.trainerPtSessionRate) || 800,
                    groupClassRate: parseInt(fetched.trainerGroupClassRate) || 1200,
                    commissionEnabled: fetched.trainerCommissionEnabled !== 'false',
                    commissionPercentage: parseInt(fetched.trainerCommissionPercentage) || 10,
                    bonusEnabled: fetched.trainerBonusEnabled !== 'false',
                    bonusThreshold: parseInt(fetched.trainerBonusThreshold) || 50,
                    bonusAmount: parseInt(fetched.trainerBonusAmount) || 5000,
                    overtimeMultiplier: parseFloat(fetched.trainerOvertimeMultiplier) || 1.5,
                    
                    // Performance
                    minClientsPerMonth: parseInt(fetched.trainerMinClientsPerMonth) || 10,
                    minSessionsPerWeek: parseInt(fetched.trainerMinSessionsPerWeek) || 20,
                    clientRetentionTarget: parseInt(fetched.trainerClientRetentionTarget) || 80,
                    performanceReviewFrequency: fetched.trainerPerformanceReviewFrequency || 'monthly',
                    enablePerformanceTracking: fetched.trainerEnablePerformanceTracking !== 'false',
                    requireSessionNotes: fetched.trainerRequireSessionNotes !== 'false',
                    sessionRatingEnabled: fetched.trainerSessionRatingEnabled !== 'false',
                    minAcceptableRating: parseFloat(fetched.trainerMinAcceptableRating) || 4.0,
                    
                    // Certification
                    requireCertification: fetched.trainerRequireCertification !== 'false',
                    certificationExpiryWarningDays: parseInt(fetched.trainerCertificationExpiryWarningDays) || 30,
                    allowExpiredCertTrainers: fetched.trainerAllowExpiredCertTrainers === 'true',
                    requiredCertifications: fetched.trainerRequiredCertifications 
                        ? JSON.parse(fetched.trainerRequiredCertifications) 
                        : ['CPR', 'First Aid', 'Personal Training'],
                    continuingEducationHours: parseInt(fetched.trainerContinuingEducationHours) || 20,
                    
                    // Client Management
                    maxActiveClients: parseInt(fetched.trainerMaxActiveClients) || 30,
                    clientAssignmentMethod: fetched.trainerClientAssignmentMethod || 'round-robin',
                    allowClientTransfer: fetched.trainerAllowClientTransfer !== 'false',
                    transferNoticePeriod: parseInt(fetched.trainerTransferNoticePeriod) || 7,
                    newClientTrialSessions: parseInt(fetched.trainerNewClientTrialSessions) || 2,
                }
                setRules(trainerRules)
                setOriginalRules(trainerRules)
            }
        } catch (error) {
            console.error('Failed to fetch trainer rules:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateRule = <K extends keyof TrainerRules>(key: K, value: TrainerRules[K]) => {
        setRules(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalRules))
            return updated
        })
    }

    const getChangedFields = (): string[] => {
        if (!originalRules) return []
        const changes: string[] = []
        const labels: Record<string, string> = {
            maxDailyHours: 'Max Daily Hours',
            maxWeeklyHours: 'Max Weekly Hours',
            minBreakBetweenSessions: 'Min Break Between Sessions',
            allowBackToBackSessions: 'Allow Back-to-Back Sessions',
            maxSessionsPerDay: 'Max Sessions Per Day',
            advanceBookingDays: 'Advance Booking Days',
            cancellationNoticePeriod: 'Cancellation Notice Period',
            allowSelfScheduling: 'Allow Self Scheduling',
            requireManagerApproval: 'Require Manager Approval',
            baseHourlyRate: 'Base Hourly Rate',
            ptSessionRate: 'PT Session Rate',
            groupClassRate: 'Group Class Rate',
            commissionEnabled: 'Commission Enabled',
            commissionPercentage: 'Commission Percentage',
            bonusEnabled: 'Bonus Enabled',
            bonusThreshold: 'Bonus Threshold',
            bonusAmount: 'Bonus Amount',
            overtimeMultiplier: 'Overtime Multiplier',
            minClientsPerMonth: 'Min Clients Per Month',
            minSessionsPerWeek: 'Min Sessions Per Week',
            clientRetentionTarget: 'Client Retention Target',
            performanceReviewFrequency: 'Performance Review Frequency',
            enablePerformanceTracking: 'Enable Performance Tracking',
            requireSessionNotes: 'Require Session Notes',
            sessionRatingEnabled: 'Session Rating Enabled',
            minAcceptableRating: 'Min Acceptable Rating',
            requireCertification: 'Require Certification',
            certificationExpiryWarningDays: 'Certification Expiry Warning Days',
            allowExpiredCertTrainers: 'Allow Expired Cert Trainers',
            requiredCertifications: 'Required Certifications',
            continuingEducationHours: 'Continuing Education Hours',
            maxActiveClients: 'Max Active Clients',
            clientAssignmentMethod: 'Client Assignment Method',
            allowClientTransfer: 'Allow Client Transfer',
            transferNoticePeriod: 'Transfer Notice Period',
            newClientTrialSessions: 'New Client Trial Sessions',
        }
        
        Object.keys(rules).forEach(key => {
            const k = key as keyof TrainerRules
            const oldVal = JSON.stringify(originalRules[k])
            const newVal = JSON.stringify(rules[k])
            if (oldVal !== newVal) {
                changes.push(`${labels[k] || k}: ${originalRules[k]} → ${rules[k]}`)
            }
        })
        return changes
    }

    const handleSaveClick = () => {
        setShowConfirmDialog(true)
    }

    const handleConfirmSave = async () => {
        try {
            setSaving(true)
            const payload = {
                trainerMaxDailyHours: rules.maxDailyHours.toString(),
                trainerMaxWeeklyHours: rules.maxWeeklyHours.toString(),
                trainerMinBreakBetweenSessions: rules.minBreakBetweenSessions.toString(),
                trainerAllowBackToBackSessions: rules.allowBackToBackSessions.toString(),
                trainerMaxSessionsPerDay: rules.maxSessionsPerDay.toString(),
                trainerAdvanceBookingDays: rules.advanceBookingDays.toString(),
                trainerCancellationNoticePeriod: rules.cancellationNoticePeriod.toString(),
                trainerAllowSelfScheduling: rules.allowSelfScheduling.toString(),
                trainerRequireManagerApproval: rules.requireManagerApproval.toString(),
                trainerBaseHourlyRate: rules.baseHourlyRate.toString(),
                trainerPtSessionRate: rules.ptSessionRate.toString(),
                trainerGroupClassRate: rules.groupClassRate.toString(),
                trainerCommissionEnabled: rules.commissionEnabled.toString(),
                trainerCommissionPercentage: rules.commissionPercentage.toString(),
                trainerBonusEnabled: rules.bonusEnabled.toString(),
                trainerBonusThreshold: rules.bonusThreshold.toString(),
                trainerBonusAmount: rules.bonusAmount.toString(),
                trainerOvertimeMultiplier: rules.overtimeMultiplier.toString(),
                trainerMinClientsPerMonth: rules.minClientsPerMonth.toString(),
                trainerMinSessionsPerWeek: rules.minSessionsPerWeek.toString(),
                trainerClientRetentionTarget: rules.clientRetentionTarget.toString(),
                trainerPerformanceReviewFrequency: rules.performanceReviewFrequency,
                trainerEnablePerformanceTracking: rules.enablePerformanceTracking.toString(),
                trainerRequireSessionNotes: rules.requireSessionNotes.toString(),
                trainerSessionRatingEnabled: rules.sessionRatingEnabled.toString(),
                trainerMinAcceptableRating: rules.minAcceptableRating.toString(),
                trainerRequireCertification: rules.requireCertification.toString(),
                trainerCertificationExpiryWarningDays: rules.certificationExpiryWarningDays.toString(),
                trainerAllowExpiredCertTrainers: rules.allowExpiredCertTrainers.toString(),
                trainerRequiredCertifications: JSON.stringify(rules.requiredCertifications),
                trainerContinuingEducationHours: rules.continuingEducationHours.toString(),
                trainerMaxActiveClients: rules.maxActiveClients.toString(),
                trainerClientAssignmentMethod: rules.clientAssignmentMethod,
                trainerAllowClientTransfer: rules.allowClientTransfer.toString(),
                trainerTransferNoticePeriod: rules.transferNoticePeriod.toString(),
                trainerNewClientTrialSessions: rules.newClientTrialSessions.toString(),
            }
            await api.put('/settings/gym', payload)
            setOriginalRules(rules)
            setHasChanges(false)
            setShowConfirmDialog(false)
            toast.success("Trainer rules saved successfully")
        } catch (error) {
            toast.error("Failed to save trainer rules")
        } finally {
            setSaving(false)
        }
    }

    const addCertification = () => {
        if (newCertification.trim() && !rules.requiredCertifications.includes(newCertification.trim())) {
            updateRule('requiredCertifications', [...rules.requiredCertifications, newCertification.trim()])
            setNewCertification('')
        }
    }

    const removeCertification = (cert: string) => {
        updateRule('requiredCertifications', rules.requiredCertifications.filter(c => c !== cert))
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading trainer configurations...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Trainer Rules</h2>
                        <p className="settings-section__description">
                            Configure scheduling, compensation, performance, and client management for trainers
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

            {/* Tabs */}
            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="settings-section__content">
                {/* Scheduling Tab */}
                {activeTab === 'scheduling' && (
                    <>
                        <div className="form-group">
                            <div className="form-group__header">
                                <Clock size={16} />
                                <h4 className="form-group__title">Working Hours</h4>
                            </div>

                            <div className="form-grid form-grid--3col">
                                <div className="field-wrapper">
                                    <label className="field-label">Max Daily Hours</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.maxDailyHours}
                                        onChange={(e) => updateRule('maxDailyHours', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={12}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Max Weekly Hours</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.maxWeeklyHours}
                                        onChange={(e) => updateRule('maxWeeklyHours', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={60}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Max Sessions/Day</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.maxSessionsPerDay}
                                        onChange={(e) => updateRule('maxSessionsPerDay', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={20}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Calendar size={16} />
                                <h4 className="form-group__title">Session Settings</h4>
                            </div>

                            <div className="form-grid">
                                <div className="field-wrapper">
                                    <label className="field-label">Min Break Between Sessions (mins)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.minBreakBetweenSessions}
                                        onChange={(e) => updateRule('minBreakBetweenSessions', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={60}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Advance Booking (days)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.advanceBookingDays}
                                        onChange={(e) => updateRule('advanceBookingDays', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={90}
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label className="field-label">Cancellation Notice Period (hours)</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={rules.cancellationNoticePeriod}
                                    onChange={(e) => updateRule('cancellationNoticePeriod', parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={72}
                                    style={{ maxWidth: '200px' }}
                                />
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Allow Back-to-Back Sessions</span>
                                        <span className="policy-toggle-row__hint">Trainers can schedule sessions without breaks</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.allowBackToBackSessions ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('allowBackToBackSessions', !rules.allowBackToBackSessions)}
                                />
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Allow Self Scheduling</span>
                                        <span className="policy-toggle-row__hint">Trainers can manage their own schedule</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.allowSelfScheduling ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('allowSelfScheduling', !rules.allowSelfScheduling)}
                                />
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <AlertCircle size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Require Manager Approval</span>
                                        <span className="policy-toggle-row__hint">Schedule changes need approval</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.requireManagerApproval ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('requireManagerApproval', !rules.requireManagerApproval)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Compensation Tab */}
                {activeTab === 'compensation' && (
                    <>
                        <div className="form-group">
                            <div className="form-group__header">
                                <DollarSign size={16} />
                                <h4 className="form-group__title">Base Rates</h4>
                            </div>

                            <div className="form-grid form-grid--3col">
                                <div className="field-wrapper">
                                    <label className="field-label">Base Hourly Rate (₹)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.baseHourlyRate}
                                        onChange={(e) => updateRule('baseHourlyRate', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">PT Session Rate (₹)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.ptSessionRate}
                                        onChange={(e) => updateRule('ptSessionRate', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Group Class Rate (₹)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.groupClassRate}
                                        onChange={(e) => updateRule('groupClassRate', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label className="field-label">Overtime Multiplier</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={rules.overtimeMultiplier}
                                    onChange={(e) => updateRule('overtimeMultiplier', parseFloat(e.target.value) || 1)}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    style={{ maxWidth: '150px' }}
                                />
                                <span className="field-helper">e.g., 1.5x for overtime hours</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Percent size={16} />
                                <h4 className="form-group__title">Commission</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Percent size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Commission</span>
                                        <span className="policy-toggle-row__hint">Trainers earn commission on PT sales</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.commissionEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('commissionEnabled', !rules.commissionEnabled)}
                                />
                            </div>

                            {rules.commissionEnabled && (
                                <div className="field-wrapper">
                                    <label className="field-label">Commission Percentage (%)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.commissionPercentage}
                                        onChange={(e) => updateRule('commissionPercentage', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={50}
                                        style={{ maxWidth: '150px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Award size={16} />
                                <h4 className="form-group__title">Performance Bonus</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Award size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Performance Bonus</span>
                                        <span className="policy-toggle-row__hint">Reward trainers for exceeding targets</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.bonusEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('bonusEnabled', !rules.bonusEnabled)}
                                />
                            </div>

                            {rules.bonusEnabled && (
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Sessions Threshold</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={rules.bonusThreshold}
                                            onChange={(e) => updateRule('bonusThreshold', parseInt(e.target.value) || 0)}
                                            min={0}
                                        />
                                        <span className="field-helper">Sessions/month to qualify</span>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Bonus Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={rules.bonusAmount}
                                            onChange={(e) => updateRule('bonusAmount', parseInt(e.target.value) || 0)}
                                            min={0}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                    <>
                        <div className="form-group">
                            <div className="form-group__header">
                                <Target size={16} />
                                <h4 className="form-group__title">Targets</h4>
                            </div>

                            <div className="form-grid form-grid--3col">
                                <div className="field-wrapper">
                                    <label className="field-label">Min Clients/Month</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.minClientsPerMonth}
                                        onChange={(e) => updateRule('minClientsPerMonth', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Min Sessions/Week</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.minSessionsPerWeek}
                                        onChange={(e) => updateRule('minSessionsPerWeek', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Retention Target (%)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.clientRetentionTarget}
                                        onChange={(e) => updateRule('clientRetentionTarget', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label className="field-label">Performance Review Frequency</label>
                                <select 
                                    className="dense-input"
                                    value={rules.performanceReviewFrequency}
                                    onChange={(e) => updateRule('performanceReviewFrequency', e.target.value)}
                                    style={{ maxWidth: '200px' }}
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Star size={16} />
                                <h4 className="form-group__title">Quality & Feedback</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Performance Tracking</span>
                                        <span className="policy-toggle-row__hint">Track and display trainer metrics</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.enablePerformanceTracking ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('enablePerformanceTracking', !rules.enablePerformanceTracking)}
                                />
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Require Session Notes</span>
                                        <span className="policy-toggle-row__hint">Trainers must log notes after each session</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.requireSessionNotes ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('requireSessionNotes', !rules.requireSessionNotes)}
                                />
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Star size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Session Rating Enabled</span>
                                        <span className="policy-toggle-row__hint">Members can rate training sessions</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.sessionRatingEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('sessionRatingEnabled', !rules.sessionRatingEnabled)}
                                />
                            </div>

                            {rules.sessionRatingEnabled && (
                                <div className="field-wrapper">
                                    <label className="field-label">Min Acceptable Rating</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.minAcceptableRating}
                                        onChange={(e) => updateRule('minAcceptableRating', parseFloat(e.target.value) || 0)}
                                        min={1}
                                        max={5}
                                        step={0.1}
                                        style={{ maxWidth: '150px' }}
                                    />
                                    <span className="field-helper">Out of 5 stars</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Certification Tab */}
                {activeTab === 'certification' && (
                    <>
                        <div className="form-group">
                            <div className="form-group__header">
                                <Award size={16} />
                                <h4 className="form-group__title">Certification Requirements</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Require Certification</span>
                                        <span className="policy-toggle-row__hint">Trainers must have valid certifications</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.requireCertification ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('requireCertification', !rules.requireCertification)}
                                />
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <AlertCircle size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Allow Expired Certifications</span>
                                        <span className="policy-toggle-row__hint">Trainers can work with expired certs (with warning)</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.allowExpiredCertTrainers ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('allowExpiredCertTrainers', !rules.allowExpiredCertTrainers)}
                                />
                            </div>

                            <div className="form-grid">
                                <div className="field-wrapper">
                                    <label className="field-label">Expiry Warning (days before)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.certificationExpiryWarningDays}
                                        onChange={(e) => updateRule('certificationExpiryWarningDays', parseInt(e.target.value) || 0)}
                                        min={7}
                                        max={90}
                                    />
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Continuing Ed Hours/Year</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.continuingEducationHours}
                                        onChange={(e) => updateRule('continuingEducationHours', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <FileText size={16} />
                                <h4 className="form-group__title">Required Certifications</h4>
                            </div>

                            <div className="reminder-days-container">
                                {rules.requiredCertifications.map((cert, index) => (
                                    <span key={index} className="reminder-day-tag">
                                        {cert}
                                        <button onClick={() => removeCertification(cert)}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="reminder-input-row" style={{ marginTop: '12px' }}>
                                <input
                                    type="text"
                                    className="dense-input"
                                    value={newCertification}
                                    onChange={(e) => setNewCertification(e.target.value)}
                                    placeholder="Enter certification name"
                                    onKeyDown={(e) => e.key === 'Enter' && addCertification()}
                                />
                                <button 
                                    className="add-btn"
                                    onClick={addCertification}
                                    disabled={!newCertification.trim()}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Clients Tab */}
                {activeTab === 'clients' && (
                    <>
                        <div className="form-group">
                            <div className="form-group__header">
                                <Users size={16} />
                                <h4 className="form-group__title">Client Assignment</h4>
                            </div>

                            <div className="form-grid">
                                <div className="field-wrapper">
                                    <label className="field-label">Max Active Clients</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.maxActiveClients}
                                        onChange={(e) => updateRule('maxActiveClients', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={100}
                                    />
                                    <span className="field-helper">Per trainer limit</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Assignment Method</label>
                                    <select 
                                        className="dense-input"
                                        value={rules.clientAssignmentMethod}
                                        onChange={(e) => updateRule('clientAssignmentMethod', e.target.value)}
                                    >
                                        <option value="round-robin">Round Robin</option>
                                        <option value="load-balanced">Load Balanced</option>
                                        <option value="manual">Manual Only</option>
                                        <option value="client-choice">Client Choice</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label className="field-label">New Client Trial Sessions</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={rules.newClientTrialSessions}
                                    onChange={(e) => updateRule('newClientTrialSessions', parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={10}
                                    style={{ maxWidth: '150px' }}
                                />
                                <span className="field-helper">Free sessions before commitment</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <AlertCircle size={16} />
                                <h4 className="form-group__title">Client Transfers</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Users size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Allow Client Transfer</span>
                                        <span className="policy-toggle-row__hint">Clients can switch to different trainers</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${rules.allowClientTransfer ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateRule('allowClientTransfer', !rules.allowClientTransfer)}
                                />
                            </div>

                            {rules.allowClientTransfer && (
                                <div className="field-wrapper">
                                    <label className="field-label">Transfer Notice Period (days)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={rules.transferNoticePeriod}
                                        onChange={(e) => updateRule('transferNoticePeriod', parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={30}
                                        style={{ maxWidth: '150px' }}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <div className="confirm-dialog__header">
                            <AlertCircle size={20} className="confirm-dialog__icon" />
                            <h3>Confirm Changes</h3>
                        </div>
                        <div className="confirm-dialog__content">
                            <p>You are about to update the following trainer settings:</p>
                            <ul className="confirm-dialog__changes">
                                {getChangedFields().map((change, idx) => (
                                    <li key={idx}>{change}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="confirm-dialog__actions">
                            <button 
                                className="confirm-dialog__btn confirm-dialog__btn--cancel"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                <XCircle size={16} />
                                Cancel
                            </button>
                            <button 
                                className="confirm-dialog__btn confirm-dialog__btn--confirm"
                                onClick={handleConfirmSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                                {saving ? 'Saving...' : 'Confirm & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TrainerRulesSection
