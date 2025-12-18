"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    CreditCard, 
    DollarSign, 
    Clock, 
    Lock, 
    RefreshCw, 
    AlertTriangle,
    Info,
    Save,
    Loader2,
    Percent,
    Banknote,
    Calendar,
    ShieldAlert
} from "lucide-react"
import api from "../../../services/api"

interface BillingPolicy {
    allowCashPayments: boolean
    allowPartialPayments: boolean
    gracePeriodDays: number
    autoLockOverdue: boolean
    autoRenewMemberships: boolean
    lateFeeEnabled: boolean
    lateFeeAmount: number
    lateFeeType: 'fixed' | 'percentage'
    minimumPaymentPercent: number
    paymentReminderDays: number
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
        minimumPaymentPercent: 50,
        paymentReminderDays: 3,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalPolicies, setOriginalPolicies] = useState<BillingPolicy | null>(null)

    useEffect(() => {
        fetchBillingPolicies()
    }, [])

    const fetchBillingPolicies = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/gym-settings')
            if (response.data) {
                const settings = response.data
                const billingSettings: BillingPolicy = {
                    allowCashPayments: settings.allowCashPayments ?? true,
                    allowPartialPayments: settings.allowPartialPayments ?? false,
                    gracePeriodDays: settings.gracePeriodDays ?? 7,
                    autoLockOverdue: settings.autoLockOverdue ?? true,
                    autoRenewMemberships: settings.autoRenewMemberships ?? false,
                    lateFeeEnabled: settings.lateFeeEnabled ?? false,
                    lateFeeAmount: settings.lateFeeAmount ?? 100,
                    lateFeeType: settings.lateFeeType ?? 'fixed',
                    minimumPaymentPercent: settings.minimumPaymentPercent ?? 50,
                    paymentReminderDays: settings.paymentReminderDays ?? 3,
                }
                setPolicies(billingSettings)
                setOriginalPolicies(billingSettings)
            }
        } catch (error) {
            console.error('Failed to fetch billing policies:', error)
        } finally {
            setLoading(false)
        }
    }

    const updatePolicy = <K extends keyof BillingPolicy>(key: K, value: BillingPolicy[K]) => {
        setPolicies(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPolicies))
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put('/api/gym-settings', policies)
            setOriginalPolicies(policies)
            setHasChanges(false)
            toast.success("Billing policies saved successfully")
        } catch (error) {
            toast.error("Failed to save billing policies")
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading billing settings...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Billing & Payment Rules</h2>
                        <p className="settings-section__description">
                            Control how payments are collected and processed
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
                        <Banknote size={16} />
                        <h4 className="form-group__title">Payment Methods</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <DollarSign size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Cash Payments</span>
                                <span className="policy-toggle-row__hint">Staff can record cash payments manually</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowCashPayments ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowCashPayments', !policies.allowCashPayments)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Percent size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Partial Payments</span>
                                <span className="policy-toggle-row__hint">Members can pay in installments</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.allowPartialPayments ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('allowPartialPayments', !policies.allowPartialPayments)}
                        />
                    </div>

                    {policies.allowPartialPayments && (
                        <div className="form-grid" style={{ marginTop: '12px', marginLeft: '40px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">
                                    Minimum Payment (%)
                                    <div className="info-tooltip" title="Minimum percentage required for partial payment">
                                        <Info size={14} />
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={policies.minimumPaymentPercent}
                                    onChange={(e) => updatePolicy('minimumPaymentPercent', parseInt(e.target.value) || 0)}
                                    min={10}
                                    max={90}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <ShieldAlert size={16} />
                        <h4 className="form-group__title">Overdue Policy</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">
                                <Clock size={14} />
                                Grace Period (Days)
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

                        <div className="field-wrapper">
                            <label className="field-label">
                                <Calendar size={14} />
                                Reminder Before (Days)
                            </label>
                            <input
                                type="number"
                                className="dense-input"
                                value={policies.paymentReminderDays}
                                onChange={(e) => updatePolicy('paymentReminderDays', parseInt(e.target.value) || 0)}
                                min={1}
                                max={14}
                            />
                        </div>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Lock size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Auto-lock Overdue Accounts</span>
                                <span className="policy-toggle-row__hint">Restrict gym access after grace period ends</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.autoLockOverdue ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('autoLockOverdue', !policies.autoLockOverdue)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <RefreshCw size={16} />
                        <h4 className="form-group__title">Renewal & Fees</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <RefreshCw size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Auto-Renew Memberships</span>
                                <span className="policy-toggle-row__hint">Automatically charge on expiry</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.autoRenewMemberships ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('autoRenewMemberships', !policies.autoRenewMemberships)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <AlertTriangle size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Enable Late Fees</span>
                                <span className="policy-toggle-row__hint">Charge additional fee for overdue payments</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${policies.lateFeeEnabled ? 'policy-toggle--active' : ''}`}
                            onClick={() => updatePolicy('lateFeeEnabled', !policies.lateFeeEnabled)}
                        />
                    </div>

                    {policies.lateFeeEnabled && (
                        <div className="form-grid" style={{ marginTop: '12px', marginLeft: '40px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Fee Type</label>
                                <select
                                    className="dense-input"
                                    value={policies.lateFeeType}
                                    onChange={(e) => updatePolicy('lateFeeType', e.target.value as 'fixed' | 'percentage')}
                                >
                                    <option value="fixed">Fixed Amount (₹)</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>
                            <div className="field-wrapper">
                                <label className="field-label">
                                    {policies.lateFeeType === 'fixed' ? 'Amount (₹)' : 'Percentage (%)'}
                                </label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={policies.lateFeeAmount}
                                    onChange={(e) => updatePolicy('lateFeeAmount', parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BillingRulesSection
