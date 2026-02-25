"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Users, 
    Save, 
    Loader2, 
    Clock, 
    Calendar, 
    ShieldCheck, 
    AlertCircle,
    CheckCircle2,
    XCircle,
    UserPlus,
    Lock,
    Briefcase,
    Award,
    DollarSign,
    Bell,
    FileText,
    UserCheck,
    Target,
    Zap,
    Plus,
    X,
    Settings
} from "lucide-react"
import api from "../../../services/api"

interface StaffRules {
    // Access & Security
    allowStaffLogin: boolean
    requireTwoFactor: boolean
    maxLoginAttempts: number
    sessionTimeoutMinutes: number
    lockoutDurationMinutes: number
    requirePasswordChange: boolean
    passwordChangeDays: number
    ipRestrictionEnabled: boolean
    allowedIpAddresses: string[]
    
    // Shifts & Scheduling
    defaultShiftHours: number
    maxShiftHours: number
    minBreakMinutes: number
    allowSplitShifts: boolean
    requireShiftConfirmation: boolean
    shiftSwapEnabled: boolean
    shiftSwapApprovalRequired: boolean
    advanceScheduleDays: number
    
    // Attendance & Time
    requireAttendanceApproval: boolean
    allowRemoteClockIn: boolean
    geoFencingEnabled: boolean
    geoFenceRadiusMeters: number
    gracePeriodMinutes: number
    lateThresholdMinutes: number
    maxOvertimeHours: number
    overtimeApprovalRequired: boolean
    autoClockOutMinutes: number
    
    // Leave & Time Off
    annualLeaveDays: number
    sickLeaveDays: number
    casualLeaveDays: number
    carryForwardEnabled: boolean
    maxCarryForwardDays: number
    leaveApprovalRequired: boolean
    minLeaveNoticeDays: number
    
    // Compensation & Payroll
    defaultHourlyRate: number
    overtimeMultiplier: number
    holidayMultiplier: number
    weekendMultiplier: number
    performanceBonusEnabled: boolean
    maxBonusPercentage: number
    commissionEnabled: boolean
    commissionPercentage: number
    
    // Performance & KPIs
    performanceReviewEnabled: boolean
    reviewFrequencyMonths: number
    selfAssessmentRequired: boolean
    peerReviewEnabled: boolean
    kpiTrackingEnabled: boolean
    targetMemberSignups: number
    targetRetentionRate: number
    targetPtSessions: number
    
    // Registration & Onboarding
    staffRegistrationCode: string
    autoAssignLeads: boolean
    leadAssignmentMethod: string
    maxLeadsPerStaff: number
    probationPeriodDays: number
    trainingRequiredHours: number
    documentVerificationRequired: boolean
    backgroundCheckRequired: boolean
}

const TABS = [
    { id: 'access', label: 'Access & Security', icon: ShieldCheck },
    { id: 'shifts', label: 'Shifts & Scheduling', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Policy', icon: FileText },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
]

const StaffRulesSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState('access')
    const [rules, setRules] = useState<StaffRules>({
        // Access & Security
        allowStaffLogin: true,
        requireTwoFactor: false,
        maxLoginAttempts: 5,
        sessionTimeoutMinutes: 60,
        lockoutDurationMinutes: 30,
        requirePasswordChange: true,
        passwordChangeDays: 90,
        ipRestrictionEnabled: false,
        allowedIpAddresses: [],
        
        // Shifts & Scheduling
        defaultShiftHours: 8,
        maxShiftHours: 12,
        minBreakMinutes: 30,
        allowSplitShifts: false,
        requireShiftConfirmation: true,
        shiftSwapEnabled: true,
        shiftSwapApprovalRequired: true,
        advanceScheduleDays: 14,
        
        // Attendance & Time
        requireAttendanceApproval: true,
        allowRemoteClockIn: false,
        geoFencingEnabled: true,
        geoFenceRadiusMeters: 100,
        gracePeriodMinutes: 10,
        lateThresholdMinutes: 15,
        maxOvertimeHours: 20,
        overtimeApprovalRequired: true,
        autoClockOutMinutes: 480,
        
        // Leave & Time Off
        annualLeaveDays: 15,
        sickLeaveDays: 10,
        casualLeaveDays: 5,
        carryForwardEnabled: true,
        maxCarryForwardDays: 5,
        leaveApprovalRequired: true,
        minLeaveNoticeDays: 3,
        
        // Compensation & Payroll
        defaultHourlyRate: 250,
        overtimeMultiplier: 1.5,
        holidayMultiplier: 2.0,
        weekendMultiplier: 1.25,
        performanceBonusEnabled: true,
        maxBonusPercentage: 20,
        commissionEnabled: true,
        commissionPercentage: 5,
        
        // Performance & KPIs
        performanceReviewEnabled: true,
        reviewFrequencyMonths: 3,
        selfAssessmentRequired: true,
        peerReviewEnabled: false,
        kpiTrackingEnabled: true,
        targetMemberSignups: 10,
        targetRetentionRate: 85,
        targetPtSessions: 40,
        
        // Registration & Onboarding
        staffRegistrationCode: 'GYM-STAFF-2024',
        autoAssignLeads: true,
        leadAssignmentMethod: 'round_robin',
        maxLeadsPerStaff: 20,
        probationPeriodDays: 90,
        trainingRequiredHours: 40,
        documentVerificationRequired: true,
        backgroundCheckRequired: false,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalRules, setOriginalRules] = useState<StaffRules | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [newIpAddress, setNewIpAddress] = useState('')

    useEffect(() => {
        fetchStaffRules()
    }, [])

    const fetchStaffRules = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/gym')
            if (response.data) {
                const fetched = response.data
                const staffRules: StaffRules = {
                    // Access & Security
                    allowStaffLogin: fetched.allowStaffLogin === 'true' || fetched.allowStaffLogin === true,
                    requireTwoFactor: fetched.requireTwoFactor === 'true' || fetched.requireTwoFactor === true,
                    maxLoginAttempts: parseInt(fetched.maxLoginAttempts) || 5,
                    sessionTimeoutMinutes: parseInt(fetched.sessionTimeoutMinutes) || 60,
                    lockoutDurationMinutes: parseInt(fetched.lockoutDurationMinutes) || 30,
                    requirePasswordChange: fetched.requirePasswordChange === 'true' || fetched.requirePasswordChange === true,
                    passwordChangeDays: parseInt(fetched.passwordChangeDays) || 90,
                    ipRestrictionEnabled: fetched.ipRestrictionEnabled === 'true' || fetched.ipRestrictionEnabled === true,
                    allowedIpAddresses: fetched.allowedIpAddresses ? JSON.parse(fetched.allowedIpAddresses) : [],
                    
                    // Shifts & Scheduling
                    defaultShiftHours: parseInt(fetched.defaultShiftHours) || 8,
                    maxShiftHours: parseInt(fetched.maxShiftHours) || 12,
                    minBreakMinutes: parseInt(fetched.minBreakMinutes) || 30,
                    allowSplitShifts: fetched.allowSplitShifts === 'true' || fetched.allowSplitShifts === true,
                    requireShiftConfirmation: fetched.requireShiftConfirmation !== 'false' && fetched.requireShiftConfirmation !== false,
                    shiftSwapEnabled: fetched.shiftSwapEnabled !== 'false' && fetched.shiftSwapEnabled !== false,
                    shiftSwapApprovalRequired: fetched.shiftSwapApprovalRequired !== 'false' && fetched.shiftSwapApprovalRequired !== false,
                    advanceScheduleDays: parseInt(fetched.advanceScheduleDays) || 14,
                    
                    // Attendance & Time
                    requireAttendanceApproval: fetched.requireAttendanceApproval !== 'false' && fetched.requireAttendanceApproval !== false,
                    allowRemoteClockIn: fetched.allowRemoteClockIn === 'true' || fetched.allowRemoteClockIn === true,
                    geoFencingEnabled: fetched.geoFencingEnabled !== 'false' && fetched.geoFencingEnabled !== false,
                    geoFenceRadiusMeters: parseInt(fetched.geoFenceRadiusMeters) || 100,
                    gracePeriodMinutes: parseInt(fetched.gracePeriodMinutes) || 10,
                    lateThresholdMinutes: parseInt(fetched.lateThresholdMinutes) || 15,
                    maxOvertimeHours: parseInt(fetched.maxOvertimeHours) || 20,
                    overtimeApprovalRequired: fetched.overtimeApprovalRequired !== 'false' && fetched.overtimeApprovalRequired !== false,
                    autoClockOutMinutes: parseInt(fetched.autoClockOutMinutes) || 480,
                    
                    // Leave & Time Off
                    annualLeaveDays: parseInt(fetched.annualLeaveDays) || 15,
                    sickLeaveDays: parseInt(fetched.sickLeaveDays) || 10,
                    casualLeaveDays: parseInt(fetched.casualLeaveDays) || 5,
                    carryForwardEnabled: fetched.carryForwardEnabled !== 'false' && fetched.carryForwardEnabled !== false,
                    maxCarryForwardDays: parseInt(fetched.maxCarryForwardDays) || 5,
                    leaveApprovalRequired: fetched.leaveApprovalRequired !== 'false' && fetched.leaveApprovalRequired !== false,
                    minLeaveNoticeDays: parseInt(fetched.minLeaveNoticeDays) || 3,
                    
                    // Compensation & Payroll
                    defaultHourlyRate: parseFloat(fetched.defaultHourlyRate) || 250,
                    overtimeMultiplier: parseFloat(fetched.overtimeMultiplier) || 1.5,
                    holidayMultiplier: parseFloat(fetched.holidayMultiplier) || 2.0,
                    weekendMultiplier: parseFloat(fetched.weekendMultiplier) || 1.25,
                    performanceBonusEnabled: fetched.performanceBonusEnabled !== 'false' && fetched.performanceBonusEnabled !== false,
                    maxBonusPercentage: parseInt(fetched.maxBonusPercentage) || 20,
                    commissionEnabled: fetched.commissionEnabled !== 'false' && fetched.commissionEnabled !== false,
                    commissionPercentage: parseFloat(fetched.commissionPercentage) || 5,
                    
                    // Performance & KPIs
                    performanceReviewEnabled: fetched.performanceReviewEnabled !== 'false' && fetched.performanceReviewEnabled !== false,
                    reviewFrequencyMonths: parseInt(fetched.reviewFrequencyMonths) || 3,
                    selfAssessmentRequired: fetched.selfAssessmentRequired !== 'false' && fetched.selfAssessmentRequired !== false,
                    peerReviewEnabled: fetched.peerReviewEnabled === 'true' || fetched.peerReviewEnabled === true,
                    kpiTrackingEnabled: fetched.kpiTrackingEnabled !== 'false' && fetched.kpiTrackingEnabled !== false,
                    targetMemberSignups: parseInt(fetched.targetMemberSignups) || 10,
                    targetRetentionRate: parseInt(fetched.targetRetentionRate) || 85,
                    targetPtSessions: parseInt(fetched.targetPtSessions) || 40,
                    
                    // Registration & Onboarding
                    staffRegistrationCode: fetched.staffRegistrationCode || 'GYM-STAFF-2024',
                    autoAssignLeads: fetched.autoAssignLeads !== 'false' && fetched.autoAssignLeads !== false,
                    leadAssignmentMethod: fetched.leadAssignmentMethod || 'round_robin',
                    maxLeadsPerStaff: parseInt(fetched.maxLeadsPerStaff) || 20,
                    probationPeriodDays: parseInt(fetched.probationPeriodDays) || 90,
                    trainingRequiredHours: parseInt(fetched.trainingRequiredHours) || 40,
                    documentVerificationRequired: fetched.documentVerificationRequired !== 'false' && fetched.documentVerificationRequired !== false,
                    backgroundCheckRequired: fetched.backgroundCheckRequired === 'true' || fetched.backgroundCheckRequired === true,
                }
                setRules(staffRules)
                setOriginalRules(staffRules)
            }
        } catch (error) {
            console.error('Failed to fetch staff rules:', error)
            toast.error('Failed to load staff rules')
        } finally {
            setLoading(false)
        }
    }

    const updateRule = <K extends keyof StaffRules>(key: K, value: StaffRules[K]) => {
        setRules(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalRules))
            return updated
        })
    }

    const addIpAddress = () => {
        if (newIpAddress && !rules.allowedIpAddresses.includes(newIpAddress)) {
            const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
            if (ipPattern.test(newIpAddress)) {
                updateRule('allowedIpAddresses', [...rules.allowedIpAddresses, newIpAddress])
                setNewIpAddress('')
            } else {
                toast.error('Invalid IP address format')
            }
        }
    }

    const removeIpAddress = (ip: string) => {
        updateRule('allowedIpAddresses', rules.allowedIpAddresses.filter(i => i !== ip))
    }

    const getChangedFields = (): string[] => {
        if (!originalRules) return []
        const changes: string[] = []
        const fieldLabels: Record<string, string> = {
            allowStaffLogin: 'Staff Login',
            requireTwoFactor: 'Two-Factor Auth',
            maxLoginAttempts: 'Max Login Attempts',
            sessionTimeoutMinutes: 'Session Timeout',
            lockoutDurationMinutes: 'Lockout Duration',
            requirePasswordChange: 'Password Change Required',
            passwordChangeDays: 'Password Change Days',
            ipRestrictionEnabled: 'IP Restriction',
            allowedIpAddresses: 'Allowed IPs',
            defaultShiftHours: 'Default Shift Hours',
            maxShiftHours: 'Max Shift Hours',
            minBreakMinutes: 'Min Break Minutes',
            allowSplitShifts: 'Split Shifts',
            requireShiftConfirmation: 'Shift Confirmation',
            shiftSwapEnabled: 'Shift Swap',
            shiftSwapApprovalRequired: 'Shift Swap Approval',
            advanceScheduleDays: 'Advance Schedule Days',
            requireAttendanceApproval: 'Attendance Approval',
            allowRemoteClockIn: 'Remote Clock-In',
            geoFencingEnabled: 'Geo-Fencing',
            geoFenceRadiusMeters: 'Geo-Fence Radius',
            gracePeriodMinutes: 'Grace Period',
            lateThresholdMinutes: 'Late Threshold',
            maxOvertimeHours: 'Max Overtime Hours',
            overtimeApprovalRequired: 'Overtime Approval',
            autoClockOutMinutes: 'Auto Clock-Out',
            annualLeaveDays: 'Annual Leave Days',
            sickLeaveDays: 'Sick Leave Days',
            casualLeaveDays: 'Casual Leave Days',
            carryForwardEnabled: 'Carry Forward',
            maxCarryForwardDays: 'Max Carry Forward Days',
            leaveApprovalRequired: 'Leave Approval',
            minLeaveNoticeDays: 'Min Leave Notice',
            defaultHourlyRate: 'Hourly Rate',
            overtimeMultiplier: 'Overtime Multiplier',
            holidayMultiplier: 'Holiday Multiplier',
            weekendMultiplier: 'Weekend Multiplier',
            performanceBonusEnabled: 'Performance Bonus',
            maxBonusPercentage: 'Max Bonus %',
            commissionEnabled: 'Commission',
            commissionPercentage: 'Commission %',
            performanceReviewEnabled: 'Performance Review',
            reviewFrequencyMonths: 'Review Frequency',
            selfAssessmentRequired: 'Self Assessment',
            peerReviewEnabled: 'Peer Review',
            kpiTrackingEnabled: 'KPI Tracking',
            targetMemberSignups: 'Target Signups',
            targetRetentionRate: 'Target Retention',
            targetPtSessions: 'Target PT Sessions',
            staffRegistrationCode: 'Registration Code',
            autoAssignLeads: 'Auto-Assign Leads',
            leadAssignmentMethod: 'Lead Assignment Method',
            maxLeadsPerStaff: 'Max Leads Per Staff',
            probationPeriodDays: 'Probation Period',
            trainingRequiredHours: 'Training Hours',
            documentVerificationRequired: 'Document Verification',
            backgroundCheckRequired: 'Background Check',
        }
        
        Object.keys(rules).forEach(key => {
            const k = key as keyof StaffRules
            const oldVal = JSON.stringify(originalRules[k])
            const newVal = JSON.stringify(rules[k])
            if (oldVal !== newVal) {
                changes.push(`${fieldLabels[k] || k}: ${formatValue(originalRules[k])} → ${formatValue(rules[k])}`)
            }
        })
        return changes
    }

    const formatValue = (value: any): string => {
        if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
        if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None'
        return String(value)
    }

    const handleSaveClick = () => {
        setShowConfirmDialog(true)
    }

    const handleConfirmSave = async () => {
        try {
            setSaving(true)
            const dataToSave = {
                ...rules,
                allowedIpAddresses: JSON.stringify(rules.allowedIpAddresses),
            }
            await api.put('/settings/gym', dataToSave)
            setOriginalRules(rules)
            setHasChanges(false)
            setShowConfirmDialog(false)
            toast.success("Staff rules saved successfully")
        } catch (error) {
            toast.error("Failed to save staff rules")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading staff configurations...</span>
                </div>
            </div>
        )
    }

    const renderAccessTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <Lock size={16} />
                    <h4 className="form-group__title">Login & Authentication</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Allow Staff Login</span>
                            <span className="policy-toggle-row__hint">Enable login access for employees and trainers</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.allowStaffLogin ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('allowStaffLogin', !rules.allowStaffLogin)}
                    />
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><ShieldCheck size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Require Two-Factor Auth</span>
                            <span className="policy-toggle-row__hint">Staff must use MFA to access the dashboard</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.requireTwoFactor ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('requireTwoFactor', !rules.requireTwoFactor)}
                    />
                </div>

                <div className="form-grid form-grid--2col">
                    <div className="field-wrapper">
                        <label className="field-label">Max Login Attempts</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.maxLoginAttempts}
                            onChange={(e) => updateRule('maxLoginAttempts', parseInt(e.target.value) || 0)}
                            min={1}
                            max={10}
                        />
                        <span className="field-helper">Before account lockout</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Lockout Duration (Min)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.lockoutDurationMinutes}
                            onChange={(e) => updateRule('lockoutDurationMinutes', parseInt(e.target.value) || 0)}
                            min={5}
                            max={1440}
                        />
                        <span className="field-helper">After max failed attempts</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Session Timeout (Min)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.sessionTimeoutMinutes}
                            onChange={(e) => updateRule('sessionTimeoutMinutes', parseInt(e.target.value) || 0)}
                            min={15}
                            max={1440}
                        />
                        <span className="field-helper">Auto-logout after inactivity</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Password Change (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.passwordChangeDays}
                            onChange={(e) => updateRule('passwordChangeDays', parseInt(e.target.value) || 0)}
                            min={0}
                            max={365}
                            disabled={!rules.requirePasswordChange}
                        />
                        <span className="field-helper">0 = never expires</span>
                    </div>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Lock size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Require Password Change</span>
                            <span className="policy-toggle-row__hint">Force periodic password updates</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.requirePasswordChange ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('requirePasswordChange', !rules.requirePasswordChange)}
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Zap size={16} />
                    <h4 className="form-group__title">IP Restriction</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><ShieldCheck size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable IP Restriction</span>
                            <span className="policy-toggle-row__hint">Only allow login from specified IP addresses</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.ipRestrictionEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('ipRestrictionEnabled', !rules.ipRestrictionEnabled)}
                    />
                </div>

                {rules.ipRestrictionEnabled && (
                    <div className="field-wrapper">
                        <label className="field-label">Allowed IP Addresses</label>
                        <div className="reminder-days-container">
                            {rules.allowedIpAddresses.map((ip, index) => (
                                <span key={index} className="reminder-day-tag">
                                    {ip}
                                    <button onClick={() => removeIpAddress(ip)} className="reminder-day-remove">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="reminder-input-row">
                            <input
                                type="text"
                                className="dense-input"
                                value={newIpAddress}
                                onChange={(e) => setNewIpAddress(e.target.value)}
                                placeholder="e.g., 192.168.1.0/24"
                                onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                            />
                            <button className="reminder-add-btn" onClick={addIpAddress}>
                                <Plus size={14} /> Add
                            </button>
                        </div>
                        <span className="field-helper">Supports CIDR notation for subnets</span>
                    </div>
                )}
            </div>
        </>
    )

    const renderShiftsTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <Clock size={16} />
                    <h4 className="form-group__title">Shift Configuration</h4>
                </div>

                <div className="form-grid form-grid--3col">
                    <div className="field-wrapper">
                        <label className="field-label">Default Shift (Hours)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.defaultShiftHours}
                            onChange={(e) => updateRule('defaultShiftHours', parseInt(e.target.value) || 0)}
                            min={1}
                            max={12}
                        />
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Max Shift (Hours)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.maxShiftHours}
                            onChange={(e) => updateRule('maxShiftHours', parseInt(e.target.value) || 0)}
                            min={1}
                            max={24}
                        />
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Min Break (Minutes)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.minBreakMinutes}
                            onChange={(e) => updateRule('minBreakMinutes', parseInt(e.target.value) || 0)}
                            min={0}
                            max={120}
                        />
                    </div>
                </div>

                <div className="form-grid form-grid--2col">
                    <div className="field-wrapper">
                        <label className="field-label">Advance Schedule (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.advanceScheduleDays}
                            onChange={(e) => updateRule('advanceScheduleDays', parseInt(e.target.value) || 0)}
                            min={1}
                            max={90}
                        />
                        <span className="field-helper">How far ahead schedules can be created</span>
                    </div>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Allow Split Shifts</span>
                            <span className="policy-toggle-row__hint">Staff can work multiple shifts in one day</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.allowSplitShifts ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('allowSplitShifts', !rules.allowSplitShifts)}
                    />
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Require Shift Confirmation</span>
                            <span className="policy-toggle-row__hint">Staff must accept assigned shifts</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.requireShiftConfirmation ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('requireShiftConfirmation', !rules.requireShiftConfirmation)}
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Users size={16} />
                    <h4 className="form-group__title">Shift Swapping</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Users size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable Shift Swapping</span>
                            <span className="policy-toggle-row__hint">Allow staff to trade shifts with colleagues</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.shiftSwapEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('shiftSwapEnabled', !rules.shiftSwapEnabled)}
                    />
                </div>

                {rules.shiftSwapEnabled && (
                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon"><UserCheck size={16} /></div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Require Swap Approval</span>
                                <span className="policy-toggle-row__hint">Manager must approve shift swaps</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${rules.shiftSwapApprovalRequired ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateRule('shiftSwapApprovalRequired', !rules.shiftSwapApprovalRequired)}
                        />
                    </div>
                )}
            </div>
        </>
    )

    const renderAttendanceTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <Clock size={16} />
                    <h4 className="form-group__title">Clock-In Settings</h4>
                </div>

                <div className="form-grid form-grid--3col">
                    <div className="field-wrapper">
                        <label className="field-label">Grace Period (Min)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.gracePeriodMinutes}
                            onChange={(e) => updateRule('gracePeriodMinutes', parseInt(e.target.value) || 0)}
                            min={0}
                            max={60}
                        />
                        <span className="field-helper">Before marked late</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Late Threshold (Min)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.lateThresholdMinutes}
                            onChange={(e) => updateRule('lateThresholdMinutes', parseInt(e.target.value) || 0)}
                            min={0}
                            max={120}
                        />
                        <span className="field-helper">Before flagged as absent</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Auto Clock-Out (Min)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.autoClockOutMinutes}
                            onChange={(e) => updateRule('autoClockOutMinutes', parseInt(e.target.value) || 0)}
                            min={60}
                            max={1440}
                        />
                        <span className="field-helper">Max shift duration</span>
                    </div>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><UserCheck size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Require Attendance Approval</span>
                            <span className="policy-toggle-row__hint">Manager must approve clock-in/out records</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.requireAttendanceApproval ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('requireAttendanceApproval', !rules.requireAttendanceApproval)}
                    />
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Zap size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Allow Remote Clock-In</span>
                            <span className="policy-toggle-row__hint">Staff can clock in from outside the gym</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.allowRemoteClockIn ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('allowRemoteClockIn', !rules.allowRemoteClockIn)}
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Target size={16} />
                    <h4 className="form-group__title">Geo-Fencing</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Target size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable Geo-Fencing</span>
                            <span className="policy-toggle-row__hint">Require staff to be at gym location to clock in</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.geoFencingEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('geoFencingEnabled', !rules.geoFencingEnabled)}
                    />
                </div>

                {rules.geoFencingEnabled && (
                    <div className="form-grid form-grid--2col">
                        <div className="field-wrapper">
                            <label className="field-label">Geo-Fence Radius (Meters)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.geoFenceRadiusMeters}
                                onChange={(e) => updateRule('geoFenceRadiusMeters', parseInt(e.target.value) || 0)}
                                min={10}
                                max={1000}
                            />
                            <span className="field-helper">Distance from gym center</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Clock size={16} />
                    <h4 className="form-group__title">Overtime</h4>
                </div>

                <div className="form-grid form-grid--2col">
                    <div className="field-wrapper">
                        <label className="field-label">Max Monthly Overtime (Hours)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.maxOvertimeHours}
                            onChange={(e) => updateRule('maxOvertimeHours', parseInt(e.target.value) || 0)}
                            min={0}
                            max={100}
                        />
                    </div>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><UserCheck size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Require Overtime Approval</span>
                            <span className="policy-toggle-row__hint">Manager must pre-approve overtime hours</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.overtimeApprovalRequired ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('overtimeApprovalRequired', !rules.overtimeApprovalRequired)}
                    />
                </div>
            </div>
        </>
    )

    const renderLeaveTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <Calendar size={16} />
                    <h4 className="form-group__title">Leave Allocation (Per Year)</h4>
                </div>

                <div className="form-grid form-grid--3col">
                    <div className="field-wrapper">
                        <label className="field-label">Annual Leave (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.annualLeaveDays}
                            onChange={(e) => updateRule('annualLeaveDays', parseInt(e.target.value) || 0)}
                            min={0}
                            max={60}
                        />
                        <span className="field-helper">Paid vacation days</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Sick Leave (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.sickLeaveDays}
                            onChange={(e) => updateRule('sickLeaveDays', parseInt(e.target.value) || 0)}
                            min={0}
                            max={30}
                        />
                        <span className="field-helper">Medical absence</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Casual Leave (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.casualLeaveDays}
                            onChange={(e) => updateRule('casualLeaveDays', parseInt(e.target.value) || 0)}
                            min={0}
                            max={30}
                        />
                        <span className="field-helper">Personal time off</span>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <FileText size={16} />
                    <h4 className="form-group__title">Leave Policy</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable Carry Forward</span>
                            <span className="policy-toggle-row__hint">Allow unused leave to carry to next year</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.carryForwardEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('carryForwardEnabled', !rules.carryForwardEnabled)}
                    />
                </div>

                {rules.carryForwardEnabled && (
                    <div className="form-grid form-grid--2col">
                        <div className="field-wrapper">
                            <label className="field-label">Max Carry Forward (Days)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.maxCarryForwardDays}
                                onChange={(e) => updateRule('maxCarryForwardDays', parseInt(e.target.value) || 0)}
                                min={0}
                                max={30}
                            />
                        </div>
                    </div>
                )}

                <div className="form-grid form-grid--2col">
                    <div className="field-wrapper">
                        <label className="field-label">Min Notice Period (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.minLeaveNoticeDays}
                            onChange={(e) => updateRule('minLeaveNoticeDays', parseInt(e.target.value) || 0)}
                            min={0}
                            max={30}
                        />
                        <span className="field-helper">For planned leave requests</span>
                    </div>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><UserCheck size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Require Leave Approval</span>
                            <span className="policy-toggle-row__hint">Manager must approve leave requests</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.leaveApprovalRequired ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('leaveApprovalRequired', !rules.leaveApprovalRequired)}
                    />
                </div>
            </div>
        </>
    )

    const renderCompensationTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <DollarSign size={16} />
                    <h4 className="form-group__title">Base Pay</h4>
                </div>

                <div className="form-grid form-grid--2col">
                    <div className="field-wrapper">
                        <label className="field-label">Default Hourly Rate (₹)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.defaultHourlyRate}
                            onChange={(e) => updateRule('defaultHourlyRate', parseFloat(e.target.value) || 0)}
                            min={0}
                            step={10}
                        />
                        <span className="field-helper">For new staff members</span>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Clock size={16} />
                    <h4 className="form-group__title">Pay Multipliers</h4>
                </div>

                <div className="form-grid form-grid--3col">
                    <div className="field-wrapper">
                        <label className="field-label">Overtime Multiplier</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.overtimeMultiplier}
                            onChange={(e) => updateRule('overtimeMultiplier', parseFloat(e.target.value) || 0)}
                            min={1}
                            max={3}
                            step={0.1}
                        />
                        <span className="field-helper">e.g., 1.5x = 150%</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Holiday Multiplier</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.holidayMultiplier}
                            onChange={(e) => updateRule('holidayMultiplier', parseFloat(e.target.value) || 0)}
                            min={1}
                            max={3}
                            step={0.1}
                        />
                        <span className="field-helper">Public holidays</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Weekend Multiplier</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.weekendMultiplier}
                            onChange={(e) => updateRule('weekendMultiplier', parseFloat(e.target.value) || 0)}
                            min={1}
                            max={3}
                            step={0.1}
                        />
                        <span className="field-helper">Saturday/Sunday</span>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Award size={16} />
                    <h4 className="form-group__title">Bonuses & Commission</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Award size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable Performance Bonus</span>
                            <span className="policy-toggle-row__hint">Award bonuses based on KPI achievement</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.performanceBonusEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('performanceBonusEnabled', !rules.performanceBonusEnabled)}
                    />
                </div>

                {rules.performanceBonusEnabled && (
                    <div className="form-grid form-grid--2col">
                        <div className="field-wrapper">
                            <label className="field-label">Max Bonus (%)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.maxBonusPercentage}
                                onChange={(e) => updateRule('maxBonusPercentage', parseInt(e.target.value) || 0)}
                                min={0}
                                max={100}
                            />
                            <span className="field-helper">Of base salary</span>
                        </div>
                    </div>
                )}

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><DollarSign size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable Sales Commission</span>
                            <span className="policy-toggle-row__hint">Pay commission on membership sales</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.commissionEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('commissionEnabled', !rules.commissionEnabled)}
                    />
                </div>

                {rules.commissionEnabled && (
                    <div className="form-grid form-grid--2col">
                        <div className="field-wrapper">
                            <label className="field-label">Commission Rate (%)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.commissionPercentage}
                                onChange={(e) => updateRule('commissionPercentage', parseFloat(e.target.value) || 0)}
                                min={0}
                                max={50}
                                step={0.5}
                            />
                            <span className="field-helper">Of sale value</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    )

    const renderPerformanceTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <Award size={16} />
                    <h4 className="form-group__title">Performance Reviews</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Award size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable Performance Reviews</span>
                            <span className="policy-toggle-row__hint">Schedule periodic performance evaluations</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.performanceReviewEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('performanceReviewEnabled', !rules.performanceReviewEnabled)}
                    />
                </div>

                {rules.performanceReviewEnabled && (
                    <>
                        <div className="form-grid form-grid--2col">
                            <div className="field-wrapper">
                                <label className="field-label">Review Frequency (Months)</label>
                                <select
                                    className="dense-select"
                                    value={rules.reviewFrequencyMonths}
                                    onChange={(e) => updateRule('reviewFrequencyMonths', parseInt(e.target.value))}
                                >
                                    <option value={1}>Monthly</option>
                                    <option value={3}>Quarterly</option>
                                    <option value={6}>Semi-Annual</option>
                                    <option value={12}>Annual</option>
                                </select>
                            </div>
                        </div>

                        <div className="policy-toggle-row">
                            <div className="policy-toggle-row__info">
                                <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                                <div className="policy-toggle-row__text">
                                    <span className="policy-toggle-row__label">Require Self-Assessment</span>
                                    <span className="policy-toggle-row__hint">Staff must submit self-review before manager review</span>
                                </div>
                            </div>
                            <button
                                className={`policy-toggle ${rules.selfAssessmentRequired ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateRule('selfAssessmentRequired', !rules.selfAssessmentRequired)}
                            />
                        </div>

                        <div className="policy-toggle-row">
                            <div className="policy-toggle-row__info">
                                <div className="policy-toggle-row__icon"><Users size={16} /></div>
                                <div className="policy-toggle-row__text">
                                    <span className="policy-toggle-row__label">Enable Peer Review</span>
                                    <span className="policy-toggle-row__hint">Include feedback from colleagues</span>
                                </div>
                            </div>
                            <button
                                className={`policy-toggle ${rules.peerReviewEnabled ? 'policy-toggle--active' : ''}`}
                                onClick={() => updateRule('peerReviewEnabled', !rules.peerReviewEnabled)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Target size={16} />
                    <h4 className="form-group__title">KPI Tracking</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Target size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Enable KPI Tracking</span>
                            <span className="policy-toggle-row__hint">Track key performance indicators for staff</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.kpiTrackingEnabled ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('kpiTrackingEnabled', !rules.kpiTrackingEnabled)}
                    />
                </div>

                {rules.kpiTrackingEnabled && (
                    <div className="form-grid form-grid--3col">
                        <div className="field-wrapper">
                            <label className="field-label">Target Member Signups</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.targetMemberSignups}
                                onChange={(e) => updateRule('targetMemberSignups', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                            <span className="field-helper">Per month</span>
                        </div>
                        <div className="field-wrapper">
                            <label className="field-label">Target Retention (%)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.targetRetentionRate}
                                onChange={(e) => updateRule('targetRetentionRate', parseInt(e.target.value) || 0)}
                                min={0}
                                max={100}
                            />
                            <span className="field-helper">Monthly rate</span>
                        </div>
                        <div className="field-wrapper">
                            <label className="field-label">Target PT Sessions</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.targetPtSessions}
                                onChange={(e) => updateRule('targetPtSessions', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                            <span className="field-helper">Per month (trainers)</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    )

    const renderOnboardingTab = () => (
        <>
            <div className="form-group">
                <div className="form-group__header">
                    <UserPlus size={16} />
                    <h4 className="form-group__title">Registration</h4>
                </div>

                <div className="field-wrapper">
                    <label className="field-label">Staff Registration Code</label>
                    <input
                        type="text"
                        className="dense-input"
                        value={rules.staffRegistrationCode}
                        onChange={(e) => updateRule('staffRegistrationCode', e.target.value)}
                        placeholder="Enter code"
                    />
                    <span className="field-helper">Required for new staff to create their account</span>
                </div>
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Users size={16} />
                    <h4 className="form-group__title">Lead Assignment</h4>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><Zap size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Auto-Assign Leads</span>
                            <span className="policy-toggle-row__hint">Automatically assign new leads to sales staff</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.autoAssignLeads ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('autoAssignLeads', !rules.autoAssignLeads)}
                    />
                </div>

                {rules.autoAssignLeads && (
                    <div className="form-grid form-grid--2col">
                        <div className="field-wrapper">
                            <label className="field-label">Assignment Method</label>
                            <select
                                className="dense-select"
                                value={rules.leadAssignmentMethod}
                                onChange={(e) => updateRule('leadAssignmentMethod', e.target.value)}
                            >
                                <option value="round_robin">Round Robin</option>
                                <option value="load_balanced">Load Balanced</option>
                                <option value="performance_based">Performance Based</option>
                                <option value="random">Random</option>
                            </select>
                        </div>
                        <div className="field-wrapper">
                            <label className="field-label">Max Leads Per Staff</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.maxLeadsPerStaff}
                                onChange={(e) => updateRule('maxLeadsPerStaff', parseInt(e.target.value) || 0)}
                                min={1}
                                max={100}
                            />
                            <span className="field-helper">Active leads at a time</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-group">
                <div className="form-group__header">
                    <Briefcase size={16} />
                    <h4 className="form-group__title">Onboarding Requirements</h4>
                </div>

                <div className="form-grid form-grid--2col">
                    <div className="field-wrapper">
                        <label className="field-label">Probation Period (Days)</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.probationPeriodDays}
                            onChange={(e) => updateRule('probationPeriodDays', parseInt(e.target.value) || 0)}
                            min={0}
                            max={365}
                        />
                        <span className="field-helper">Trial period for new hires</span>
                    </div>
                    <div className="field-wrapper">
                        <label className="field-label">Training Hours Required</label>
                        <input
                            type="number"
                            className="dense-input"
                            value={rules.trainingRequiredHours}
                            onChange={(e) => updateRule('trainingRequiredHours', parseInt(e.target.value) || 0)}
                            min={0}
                            max={200}
                        />
                        <span className="field-helper">Before full duties</span>
                    </div>
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Document Verification Required</span>
                            <span className="policy-toggle-row__hint">Verify ID, certifications before activation</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.documentVerificationRequired ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('documentVerificationRequired', !rules.documentVerificationRequired)}
                    />
                </div>

                <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon"><ShieldCheck size={16} /></div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Background Check Required</span>
                            <span className="policy-toggle-row__hint">Run background verification for new staff</span>
                        </div>
                    </div>
                    <button
                        className={`policy-toggle ${rules.backgroundCheckRequired ? 'policy-toggle--active' : ''}`}
                        onClick={() => updateRule('backgroundCheckRequired', !rules.backgroundCheckRequired)}
                    />
                </div>
            </div>
        </>
    )

    return (
        <div className="settings-section settings-section--purple">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon settings-section__icon--purple">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Staff & Trainer Rules</h2>
                        <p className="settings-section__description">
                            Manage access, shifts, attendance, compensation, and performance policies
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
                {TABS.map(tab => (
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
                {activeTab === 'access' && renderAccessTab()}
                {activeTab === 'shifts' && renderShiftsTab()}
                {activeTab === 'attendance' && renderAttendanceTab()}
                {activeTab === 'leave' && renderLeaveTab()}
                {activeTab === 'compensation' && renderCompensationTab()}
                {activeTab === 'performance' && renderPerformanceTab()}
                {activeTab === 'onboarding' && renderOnboardingTab()}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <div className="confirm-dialog__header">
                            <AlertCircle size={20} />
                            <h3>Confirm Changes</h3>
                        </div>
                        <div className="confirm-dialog__body">
                            <p>You are about to update the following staff rules:</p>
                            <ul className="confirm-dialog__changes">
                                {getChangedFields().map((change, index) => (
                                    <li key={index}>{change}</li>
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

export default StaffRulesSection
