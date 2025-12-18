"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    UserCog, 
    Calendar, 
    Eye, 
    Users,
    Clock,
    Save,
    Loader2,
    Shuffle,
    CalendarClock,
    UserCheck
} from "lucide-react"
import api from "../../../services/api"

interface StaffPolicy {
    maxSessionsPerDay: number
    minBreakBetweenSessions: number
    canTrainerReschedule: boolean
    canTrainerCancelSession: boolean
    trainerVisibility: 'own' | 'all'
    autoAssignNewMembers: boolean
    requireSessionNotes: boolean
    sessionDurationMinutes: number
}

const StaffRulesSection: React.FC = () => {
    const [policies, setPolicies] = useState<StaffPolicy>({
        maxSessionsPerDay: 8,
        minBreakBetweenSessions: 15,
        canTrainerReschedule: true,
        canTrainerCancelSession: false,
        trainerVisibility: 'own',
        autoAssignNewMembers: false,
        requireSessionNotes: false,
        sessionDurationMinutes: 60,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalPolicies, setOriginalPolicies] = useState<StaffPolicy | null>(null)

    useEffect(() => {
        fetchStaffPolicies()
    }, [])

    const fetchStaffPolicies = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings')
            if (response.data) {
                const settings = response.data
                const staffSettings: StaffPolicy = {
                    maxSessionsPerDay: parseInt(settings.maxSessionsPerDay) || 8,
                    minBreakBetweenSessions: parseInt(settings.minBreakBetweenSessions) || 15,
                    canTrainerReschedule: settings.canTrainerReschedule === 'true',
                    canTrainerCancelSession: settings.canTrainerCancelSession === 'true',
                    trainerVisibility: (settings.trainerVisibility as 'own' | 'all') || 'own',
                    autoAssignNewMembers: settings.autoAssignNewMembers === 'true',
                    requireSessionNotes: settings.requireSessionNotes === 'true',
                    sessionDurationMinutes: parseInt(settings.sessionDurationMinutes) || 60,
                }
                setPolicies(staffSettings)
                setOriginalPolicies(staffSettings)
            }
        } catch (error) {
            console.error('Failed to fetch staff policies:', error)
        } finally {
            setLoading(false)
        }
    }

    const updatePolicy = <K extends keyof StaffPolicy>(key: K, value: StaffPolicy[K]) => {
        setPolicies(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPolicies))
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put('/settings', policies)
            setOriginalPolicies(policies)
            setHasChanges(false)
            toast.success("Staff policies saved successfully")
        } catch (error) {
            console.error('Failed to save staff policies:', error)
            toast.error("Failed to save staff policies")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading staff policies...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <UserCog size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Staff & Trainer Rules</h2>
                        <p className="settings-section__description">
                            Workload, scheduling, and visibility permissions
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
                        <Clock size={16} />
                        <h4 className="form-group__title">Session Settings</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                <Calendar size={14} />
                                Max Sessions / Day
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.maxSessionsPerDay}
                                onChange={(e) => updatePolicy('maxSessionsPerDay', parseInt(e.target.value) || 1)}
                                min={1}
                                max={20}
                            />
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                <Clock size={14} />
                                Session Duration (mins)
                            </label>
                            <select
                                className="dense-input"
                                value={policies.sessionDurationMinutes}
                                onChange={(e) => updatePolicy('sessionDurationMinutes', parseInt(e.target.value))}
                            >
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                                <option value={90}>90 minutes</option>
                            </select>
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                <Clock size={14} />
                                Break Between Sessions (mins)
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.minBreakBetweenSessions}
                                onChange={(e) => updatePolicy('minBreakBetweenSessions', parseInt(e.target.value) || 0)}
                                min={0}
                                max={60}
                            />
                        </div>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <UserCheck size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Require Session Notes</span>
                                <span className="policy-toggle-row__hint">Trainers must add notes after each session</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.requireSessionNotes ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('requireSessionNotes', !policies.requireSessionNotes)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Shuffle size={16} />
                        <h4 className="form-group__title">Assignment Rules</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Users size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Auto-assign New Members</span>
                                <span className="policy-toggle-row__hint">Distribute new members among trainers based on workload</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.autoAssignNewMembers ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('autoAssignNewMembers', !policies.autoAssignNewMembers)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <CalendarClock size={16} />
                        <h4 className="form-group__title">Scheduling Permissions</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Calendar size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Trainer Rescheduling</span>
                                <span className="policy-toggle-row__hint">Trainers can move their own sessions</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.canTrainerReschedule ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('canTrainerReschedule', !policies.canTrainerReschedule)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Calendar size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Trainer Cancellation</span>
                                <span className="policy-toggle-row__hint">Trainers can cancel their own sessions</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.canTrainerCancelSession ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('canTrainerCancelSession', !policies.canTrainerCancelSession)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Eye size={16} />
                        <h4 className="form-group__title">Member Visibility</h4>
                    </div>

                    <div className="field-wrapper">
                        <label className="field-label" style={{ marginBottom: '12px' }}>
                            Trainers can view:
                        </label>
                        <div className="visibility-options">
                            <label 
                                className={`visibility-option ${policies.trainerVisibility === 'own' ? 'visibility-option--active' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={policies.trainerVisibility === 'own'}
                                    onChange={() => updatePolicy('trainerVisibility', 'own')}
                                />
                                <div className="visibility-option__content">
                                    <Users size={20} />
                                    <div>
                                        <span className="visibility-option__label">Own Members Only</span>
                                        <span className="visibility-option__hint">Members assigned directly to them</span>
                                    </div>
                                </div>
                            </label>

                            <label 
                                className={`visibility-option ${policies.trainerVisibility === 'all' ? 'visibility-option--active' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={policies.trainerVisibility === 'all'}
                                    onChange={() => updatePolicy('trainerVisibility', 'all')}
                                />
                                <div className="visibility-option__content">
                                    <Eye size={20} />
                                    <div>
                                        <span className="visibility-option__label">All Members</span>
                                        <span className="visibility-option__hint">Entire gym member database</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffRulesSection
