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
    Lock
} from "lucide-react"
import api from "../../../services/api"

interface StaffRules {
    allowStaffLogin: boolean
    requireTwoFactor: boolean
    maxLoginAttempts: number
    sessionTimeoutMinutes: number
    allowTrainerSelfBooking: boolean
    autoAssignLeads: boolean
    staffRegistrationCode: string
    requireAttendanceApproval: boolean
    maxOvertimeHours: number
}

const StaffRulesSection: React.FC = () => {
    const [rules, setRules] = useState<StaffRules>({
        allowStaffLogin: true,
        requireTwoFactor: false,
        maxLoginAttempts: 5,
        sessionTimeoutMinutes: 60,
        allowTrainerSelfBooking: true,
        autoAssignLeads: false,
        staffRegistrationCode: 'GYM-STAFF-2024',
        requireAttendanceApproval: true,
        maxOvertimeHours: 10,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalRules, setOriginalRules] = useState<StaffRules | null>(null)

    useEffect(() => {
        fetchStaffRules()
    }, [])

    const fetchStaffRules = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings')
            if (response.data) {
                const fetched = response.data
                const staffRules: StaffRules = {
                    allowStaffLogin: fetched.allowStaffLogin === 'true' || fetched.allowStaffLogin === true,
                    requireTwoFactor: fetched.requireTwoFactor === 'true' || fetched.requireTwoFactor === true,
                    maxLoginAttempts: parseInt(fetched.maxLoginAttempts) || 5,
                    sessionTimeoutMinutes: parseInt(fetched.sessionTimeoutMinutes) || 60,
                    allowTrainerSelfBooking: fetched.allowTrainerSelfBooking === 'true' || fetched.allowTrainerSelfBooking === true,
                    autoAssignLeads: fetched.autoAssignLeads === 'true' || fetched.autoAssignLeads === true,
                    staffRegistrationCode: fetched.staffRegistrationCode || 'GYM-STAFF-2024',
                    requireAttendanceApproval: fetched.requireAttendanceApproval === 'true' || fetched.requireAttendanceApproval === true,
                    maxOvertimeHours: parseInt(fetched.maxOvertimeHours) || 10,
                }
                setRules(staffRules)
                setOriginalRules(staffRules)
            }
        } catch (error) {
            console.error('Failed to fetch staff rules:', error)
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

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put('/settings', rules)
            setOriginalRules(rules)
            setHasChanges(false)
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

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Staff & Trainer Rules</h2>
                        <p className="settings-section__description">
                            Manage access control, attendance policies, and registrations
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
                        <ShieldCheck size={16} />
                        <h4 className="form-group__title">Access & Security</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <CheckCircle2 size={16} />
                            </div>
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
                            <div className="policy-toggle-row__icon">
                                <Lock size={16} />
                            </div>
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

                    <div className="form-grid">
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
                        </div>
                        <div className="field-wrapper">
                            <label className="field-label">Session Timeout (Minutes)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.sessionTimeoutMinutes}
                                onChange={(e) => updateRule('sessionTimeoutMinutes', parseInt(e.target.value) || 0)}
                                min={15}
                                max={1440}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Calendar size={16} />
                        <h4 className="form-group__title">Operations & Attendance</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Clock size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Trainer Self-Booking</span>
                                <span className="policy-toggle-row__hint">Allow trainers to schedule their own PT sessions</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${rules.allowTrainerSelfBooking ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateRule('allowTrainerSelfBooking', !rules.allowTrainerSelfBooking)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <AlertCircle size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Require Attendance Approval</span>
                                <span className="policy-toggle-row__hint">Owner must approve staff clock-in/out records</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${rules.requireAttendanceApproval ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateRule('requireAttendanceApproval', !rules.requireAttendanceApproval)}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">Max Monthly Overtime (Hours)</label>
                            <input
                                type="number"
                                className="dense-input"
                                value={rules.maxOvertimeHours}
                                onChange={(e) => updateRule('maxOvertimeHours', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <UserPlus size={16} />
                        <h4 className="form-group__title">Registration</h4>
                    </div>

                    <div className="field-wrapper">
                        <label className="field-label">Staff Registration Code</label>
                        <div className="reminder-input-row">
                            <input
                                type="text"
                                className="dense-input"
                                value={rules.staffRegistrationCode}
                                onChange={(e) => updateRule('staffRegistrationCode', e.target.value)}
                                placeholder="Enter code"
                            />
                        </div>
                        <span className="field-helper">Required for new staff to create their account</span>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Users size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Auto-Assign Leads</span>
                                <span className="policy-toggle-row__hint">Round-robin assignment of new leads to sales staff</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${rules.autoAssignLeads ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateRule('autoAssignLeads', !rules.autoAssignLeads)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffRulesSection
