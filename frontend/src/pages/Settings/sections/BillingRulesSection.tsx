"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

interface BillingPolicy {
    allowCashPayments: boolean
    allowPartialPayments: boolean
    gracePeriodDays: number
    autoLockOverdue: boolean
    autoRenewMemberships: boolean
    lateFeeEnabled: boolean
    lateFeeAmount: number
    lateFeeType: 'fixed' | 'percentage'
}

const BillingRulesSection: React.FC = () => {
    const [policies, setPolicies] = useState<BillingPolicy>({
        allowCashPayments: true,
        allowPartialPayments: false,
        gracePeriodDays: 7,
        autoLockOverdue: true,
        autoRenewMemberships: false,
        lateFeeEnabled: false,
        lateFeeAmount: 100,
        lateFeeType: 'fixed',
    })

    const updatePolicy = <K extends keyof BillingPolicy>(key: K, value: BillingPolicy[K]) => {
        setPolicies(prev => ({ ...prev, [key]: value }))
        toast.success("Policy updated")
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Billing & Payment Rules</h2>
                    <p className="settings-section__description">
                        Control how payments are collected and processed
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                {/* Method & Terms */}
                <div className="form-group">
                    <h4 className="form-group__title">Methods & Terms</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Allow Cash Payments
                                <div className="info-icon" data-tooltip="Staff can record cash payments. Disable to enforce digital-only payments.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowCashPayments ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowCashPayments', !policies.allowCashPayments)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Allow Partial Payments
                                <div className="info-icon" data-tooltip="Members can pay in installments. Remaining balance tracked automatically.">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowPartialPayments ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowPartialPayments', !policies.allowPartialPayments)}
                        />
                    </div>
                </div>

                {/* Grace Period & Auto-Lock */}
                <div className="form-group">
                    <h4 className="form-group__title">Overdue Policy</h4>
                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                Grace Period (Days)
                                <div className="info-icon" data-tooltip="Days after expiry before lockout">
                                    <Info />
                                </div>
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.gracePeriodDays}
                                onChange={(e) => updatePolicy('gracePeriodDays', parseInt(e.target.value) || 0)}
                                min={0}
                                max={30}
                            />
                        </div>

                        <div className="field-wrapper" style={{ justifyContent: 'flex-end' }}>
                            <div className="policy-toggle-row" style={{ border: 'none', padding: 0 }}>
                                <div className="policy-toggle-row__info">
                                    <span className="policy-toggle-row__label">
                                        Auto-lock Overdue
                                        <div className="info-icon" data-tooltip="Automatically restrict gym access after grace period ends">
                                            <Info />
                                        </div>
                                    </span>
                                </div>
                                <button
                                    className={`policy-toggle ${policies.autoLockOverdue ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updatePolicy('autoLockOverdue', !policies.autoLockOverdue)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Renewal & Fees */}
                <div className="form-group">
                    <h4 className="form-group__title">Renewal & Fees</h4>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Auto-Renew Memberships
                                <div className="info-icon" data-tooltip="Automatically charge saved payment method on expiry">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${policies.autoRenewMemberships ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('autoRenewMemberships', !policies.autoRenewMemberships)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <span className="policy-toggle-row__label">
                                Enable Late Fees
                                <div className="info-icon" data-tooltip="Charge additional fee for overdue payments">
                                    <Info />
                                </div>
                            </span>
                        </div>
                        <button
                            className={`policy-toggle ${policies.lateFeeEnabled ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('lateFeeEnabled', !policies.lateFeeEnabled)}
                        />
                    </div>

                    {policies.lateFeeEnabled && (
                        <div className="form-grid" style={{ marginTop: '12px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Fee Amount</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        className="dense-input"
                                        style={{ width: '60px' }}
                                        value={policies.lateFeeType}
                                        onChange={(e) => updatePolicy('lateFeeType', e.target.value as 'fixed' | 'percentage')}
                                    >
                                        <option value="fixed">₹</option>
                                        <option value="percentage">%</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={policies.lateFeeAmount}
                                        onChange={(e) => updatePolicy('lateFeeAmount', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BillingRulesSection
