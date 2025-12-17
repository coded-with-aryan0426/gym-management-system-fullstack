"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

interface MembershipPolicy {
    freezeAllowanceDays: number
    allowTransfer: boolean
    cancellationNoticeDays: number
    cancellationFee: number
    defaultDurationMonths: number
    expiryReminderDays: number[]
}

const MembershipPoliciesSection: React.FC = () => {
    const [policies, setPolicies] = useState<MembershipPolicy>({
        freezeAllowanceDays: 30,
        allowTransfer: false,
        cancellationNoticeDays: 7,
        cancellationFee: 500,
        defaultDurationMonths: 1,
        expiryReminderDays: [7, 3, 1],
    })

    const updatePolicy = <K extends keyof MembershipPolicy>(key: K, value: MembershipPolicy[K]) => {
        setPolicies(prev => ({ ...prev, [key]: value }))
        toast.success("Policy updated")
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Membership Policies</h2>
                    <p className="settings-section__description">
                        Rules for freezes, transfers, and cancellations
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                {/* Limits & Defaults */}
                <div className="form-group">
                    <h4 className="form-group__title">Limits & Defaults</h4>
                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Default Duration
                                <div className="info-icon" data-tooltip="Pre-selected duration for new memberships">
                                    <Info />
                                </div>
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

                        <div className="field-wrapper">
                            <label className="field-label">
                                Freeze Allowance (Yearly)
                                <div className="info-icon" data-tooltip="Max freeze days per year per member">
                                    <Info />
                                </div>
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
                    </div>
                </div>

                {/* Transfer & Cancellation */}
                <div className="form-group">
                    <h4 className="form-group__title">Transfer & Cancellation</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Allow Transfer
                                <div className="info-icon" data-tooltip="Members can transfer remaining days to another person">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowTransfer ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowTransfer', !policies.allowTransfer)}
                        />
                    </div>

                    <div className="form-grid" style={{ marginTop: '12px' }}>
                        <div className="field-wrapper">
                            <label className="field-label">
                                Cancellation Notice (Days)
                                <div className="info-icon" data-tooltip="Days notice required before cancellation">
                                    <Info />
                                </div>
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.cancellationNoticeDays}
                                onChange={(e) => updatePolicy('cancellationNoticeDays', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </div>

                        <div className="field-wrapper">
                            <label className="field-label">
                                Cancellation Fee (₹)
                                <div className="info-icon" data-tooltip="Fee charged for early cancellation">
                                    <Info />
                                </div>
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

                {/* Reminders */}
                <div className="form-group">
                    <h4 className="form-group__title">Expiry Reminders</h4>
                    <div className="field-wrapper">
                        <label className="field-label">
                            Send reminders at (days before expiry)
                        </label>
                        <div className="reminder-tags">
                            {policies.expiryReminderDays.map(day => (
                                <span key={day} className="reminder-tag">
                                    {day} days
                                    <button onClick={() => {
                                        updatePolicy('expiryReminderDays', policies.expiryReminderDays.filter(d => d !== day))
                                    }}>×</button>
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
