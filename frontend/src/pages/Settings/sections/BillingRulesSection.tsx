"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { showToast } from "../../../utils/showToast"
import {
    CreditCard,
    Save,
    Loader2,
    Info,
    Receipt,
    Ban,
    Percent,
    Clock,
    IndianRupee,
    Calendar,
    Bell
} from "lucide-react"
import api from "../../../services/api"

interface BillingSettings {
    currency: string
    taxEnabled: boolean
    taxPercentage: number
    lateFeeEnabled: boolean
    lateFeeAmount: number
    gracePeriodDays: number
    invoicePrefix: string
    autoInvoiceEnabled: boolean
    paymentReminderDays: number[]
    allowPartialPayments: boolean
}

const BillingRulesSection: React.FC = () => {
    const [settings, setSettings] = useState<BillingSettings>({
        currency: 'INR',
        taxEnabled: true,
        taxPercentage: 18,
        lateFeeEnabled: false,
        lateFeeAmount: 50,
        gracePeriodDays: 3,
        invoicePrefix: 'GYM-',
        autoInvoiceEnabled: true,
        paymentReminderDays: [3, 1],
        allowPartialPayments: false,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalSettings, setOriginalSettings] = useState<BillingSettings | null>(null)

    useEffect(() => {
        fetchBillingSettings()
    }, [])

    const fetchBillingSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/gym')
            if (response.data) {
                const fetched = response.data
                const billingSettings: BillingSettings = {
                    currency: fetched.currency || 'INR',
                    taxEnabled: fetched.taxEnabled === 'true' || fetched.taxEnabled === true,
                    taxPercentage: parseInt(fetched.taxPercentage) || 18,
                    lateFeeEnabled: fetched.lateFeeEnabled === 'true' || fetched.lateFeeEnabled === true,
                    lateFeeAmount: parseInt(fetched.lateFeeAmount) || 50,
                    gracePeriodDays: parseInt(fetched.gracePeriodDays) || 3,
                    invoicePrefix: fetched.invoicePrefix || 'GYM-',
                    autoInvoiceEnabled: fetched.autoInvoiceEnabled === 'true' || fetched.autoInvoiceEnabled === true,
                    paymentReminderDays: Array.isArray(fetched.paymentReminderDays)
                        ? fetched.paymentReminderDays
                        : (fetched.paymentReminderDays ? fetched.paymentReminderDays.split(',').map(Number) : [3, 1]),
                    allowPartialPayments: fetched.allowPartialPayments === 'true' || fetched.allowPartialPayments === true,
                }
                setSettings(billingSettings)
                setOriginalSettings(billingSettings)
            }
        } catch (error) {
            console.error('Failed to fetch billing settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = <K extends keyof BillingSettings>(key: K, value: BillingSettings[K]) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings))
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put('/settings/gym', settings)
            setOriginalSettings(settings)
            setHasChanges(false)
            showToast("Billing settings saved successfully", "success")
        } catch (error) {
            showToast("Failed to save billing settings", "error")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading billing configuration...</span>
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
                            Configure taxes, late fees, and invoicing preferences
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
                        <IndianRupee size={16} />
                        <h4 className="form-group__title">Currency & Tax</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">System Currency</label>
                            <select
                                className="dense-input"
                                value={settings.currency}
                                onChange={(e) => updateSetting('currency', e.target.value)}
                            >
                                <option value="INR">INR (₹) - Indian Rupee</option>
                                <option value="USD">USD ($) - US Dollar</option>
                                <option value="GBP">GBP (£) - British Pound</option>
                                <option value="EUR">EUR (€) - Euro</option>
                            </select>
                        </div>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Percent size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Enable Tax (GST/VAT)</span>
                                <span className="policy-toggle-row__hint">Automatically apply tax to all membership fees</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.taxEnabled ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('taxEnabled', !settings.taxEnabled)}
                        />
                    </div>

                    {settings.taxEnabled && (
                        <div className="form-grid" style={{ marginLeft: '40px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Tax Percentage (%)</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={settings.taxPercentage}
                                    onChange={(e) => updateSetting('taxPercentage', parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Clock size={16} />
                        <h4 className="form-group__title">Late Fees & Grace Period</h4>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Ban size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Apply Late Fees</span>
                                <span className="policy-toggle-row__hint">Charge members for overdue payments</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.lateFeeEnabled ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('lateFeeEnabled', !settings.lateFeeEnabled)}
                        />
                    </div>

                    {settings.lateFeeEnabled && (
                        <div className="form-grid" style={{ marginLeft: '40px' }}>
                            <div className="field-wrapper">
                                <label className="field-label">Late Fee Amount (₹)</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={settings.lateFeeAmount}
                                    onChange={(e) => updateSetting('lateFeeAmount', parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label className="field-label">Grace Period (Days)</label>
                                <input
                                    type="number"
                                    className="dense-input"
                                    value={settings.gracePeriodDays}
                                    onChange={(e) => updateSetting('gracePeriodDays', parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Receipt size={16} />
                        <h4 className="form-group__title">Invoicing Preferences</h4>
                    </div>

                    <div className="form-grid">
                        <div className="field-wrapper">
                            <label className="field-label">Invoice Prefix</label>
                            <input
                                type="text"
                                className="dense-input"
                                value={settings.invoicePrefix}
                                onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                                placeholder="e.g. GYM-"
                            />
                        </div>
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Calendar size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Auto-Generate Invoices</span>
                                <span className="policy-toggle-row__hint">Generate invoice PDF when payment is recorded</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.autoInvoiceEnabled ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('autoInvoiceEnabled', !settings.autoInvoiceEnabled)}
                        />
                    </div>

                    <div className="policy-toggle-row">
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Percent size={16} />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Allow Partial Payments</span>
                                <span className="policy-toggle-row__hint">Members can pay fees in installments</span>
                            </div>
                        </div>
                        <button
                            className={`policy-toggle ${settings.allowPartialPayments ? 'policy-toggle--active' : ''}`}
                            onClick={() => updateSetting('allowPartialPayments', !settings.allowPartialPayments)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group__header">
                        <Bell size={16} />
                        <h4 className="form-group__title">Payment Notifications</h4>
                    </div>

                    <div className="policy-toggle-row" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <div className="policy-toggle-row__info">
                            <div className="policy-toggle-row__icon">
                                <Info size={16} color="var(--settings-accent-amber)" />
                            </div>
                            <div className="policy-toggle-row__text">
                                <span className="policy-toggle-row__label">Global Billing Alerts</span>
                                <span className="policy-toggle-row__hint">
                                    Reminder intervals are managed in the <strong>Notifications</strong> section.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingRulesSection
