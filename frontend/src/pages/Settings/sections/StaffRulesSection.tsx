"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

interface StaffPolicy {
    maxSessionsPerDay: number
    canTrainerReschedule: boolean
    trainerVisibility: 'own' | 'all'
    autoAssignNewMembers: boolean
}

const StaffRulesSection: React.FC = () => {
    const [policies, setPolicies] = useState<StaffPolicy>({
        maxSessionsPerDay: 8,
        canTrainerReschedule: true,
        trainerVisibility: 'own',
        autoAssignNewMembers: false,
    })

    const updatePolicy = <K extends keyof StaffPolicy>(key: K, value: StaffPolicy[K]) => {
        setPolicies(prev => ({ ...prev, [key]: value }))
        toast.success("Policy updated")
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Staff & Trainer Rules</h2>
                    <p className="settings-section__description">
                        Workload, scheduling, and visibility permissions
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                {/* Workload Group */}
                <div className="form-group">
                    <h4 className="form-group__title">Workload & Assignment</h4>
                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Max Sessions / Day
                                <div className="info-icon" data-tooltip="Prevents trainer burnout. System blocks over-booking.">
                                    <Info />
                                </div>
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

                        <div className="field-wrapper" style={{ justifyContent: 'flex-end' }}>
                            <div className="policy-toggle-row" style={{ border: 'none', padding: 0 }}>
                                <div className="policy-toggle-row__info">
                                    <span className="policy-toggle-row__label">
                                        Auto-assign Members
                                        <div className="info-icon" data-tooltip="Distribute new members among trainers based on workload">
                                            <Info />
                                        </div>
                                    </span>
                                </div>
                                <button
                                    className={`policy-toggle ${policies.autoAssignNewMembers ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updatePolicy('autoAssignNewMembers', !policies.autoAssignNewMembers)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Group */}
                <div className="form-group">
                    <h4 className="form-group__title">Trainer Permissions</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Allow Rescheduling
                                <div className="info-icon" data-tooltip="Trainers can move their own sessions. If disabled, only managers can.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${policies.canTrainerReschedule ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('canTrainerReschedule', !policies.canTrainerReschedule)}
                        />
                    </div>
                </div>

                {/* Visibility Group */}
                <div className="form-group">
                    <h4 className="form-group__title">Member Visibility</h4>
                    <div className="field-wrapper">
                        <label className="field-label" style={{ marginBottom: '8px' }}>
                            Trainers can view:
                            <div className="info-icon" data-tooltip="Control which members a trainer can view in their dashboard">
                                <Info />
                            </div>
                        </label>
                        <div className="form-grid">
                            <label className={`policy-radio ${policies.trainerVisibility === 'own' ? 'policy-radio--active' : ''}`} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', height: 'auto', padding: '10px' }}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={policies.trainerVisibility === 'own'}
                                    onChange={() => updatePolicy('trainerVisibility', 'own')}
                                />
                                <div>
                                    <span className="policy-radio__label" style={{ fontSize: '0.8125rem' }}>Own members only</span>
                                    <p className="policy-radio__description" style={{ fontSize: '0.75rem', margin: 0 }}>Assigned directly</p>
                                </div>
                            </label>

                            <label className={`policy-radio ${policies.trainerVisibility === 'all' ? 'policy-radio--active' : ''}`} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', height: 'auto', padding: '10px' }}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={policies.trainerVisibility === 'all'}
                                    onChange={() => updatePolicy('trainerVisibility', 'all')}
                                />
                                <div>
                                    <span className="policy-radio__label" style={{ fontSize: '0.8125rem' }}>All members</span>
                                    <p className="policy-radio__description" style={{ fontSize: '0.75rem', margin: 0 }}>Entire gym database</p>
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
