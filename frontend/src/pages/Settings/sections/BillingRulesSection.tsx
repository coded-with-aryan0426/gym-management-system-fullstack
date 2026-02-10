"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
    Bell,
    Wallet,
    RefreshCw,
    Plus,
    X,
    Banknote,
    Smartphone,
    Building2,
    AlertTriangle,
    Gift,
    Calculator,
    FileText,
    Check,
    DollarSign,
    PoundSterling,
    Euro
} from "lucide-react"
import api from "../../../services/api"

interface BillingSettings {
    id?: number
    gymId?: number
    currency: string
    currencySymbol: string
    taxEnabled: boolean
    taxPercentage: number
    taxName: string
    taxNumber: string
    lateFeeEnabled: boolean
    lateFeeAmount: number
    lateFeeType: string
    lateFeePercentage: number
    gracePeriodDays: number
    maxLateFeeAmount: number | null
    invoicePrefix: string
    autoInvoiceEnabled: boolean
    invoiceNotes: string
    invoiceFooter: string
    nextInvoiceNumber?: number
    allowPartialPayments: boolean
    minPartialPaymentPercentage: number
    allowOnlinePayments: boolean
    allowCashPayments: boolean
    allowBankTransfer: boolean
    allowCardPayments: boolean
    allowUpiPayments: boolean
    paymentReminderEnabled: boolean
    paymentReminderDays: number[]
    overdueReminderEnabled: boolean
    overdueReminderDays: number[]
    refundPolicyEnabled: boolean
    refundPeriodDays: number
    refundPercentage: number
    refundDeductionAmount: number
    autoDiscountEnabled: boolean
    earlyPaymentDiscountPercentage: number
    earlyPaymentDays: number
    prorateEnabled: boolean
    prorateMethod: string
}

interface ChangeItem {
    field: string
    oldValue: string
    newValue: string
}

const defaultSettings: BillingSettings = {
    currency: 'INR',
    currencySymbol: '₹',
    taxEnabled: false,
    taxPercentage: 18,
    taxName: 'GST',
    taxNumber: '',
    lateFeeEnabled: false,
    lateFeeAmount: 50,
    lateFeeType: 'FIXED',
    lateFeePercentage: 5,
    gracePeriodDays: 3,
    maxLateFeeAmount: null,
    invoicePrefix: 'GYM-',
    autoInvoiceEnabled: true,
    invoiceNotes: '',
    invoiceFooter: '',
    allowPartialPayments: false,
    minPartialPaymentPercentage: 25,
    allowOnlinePayments: true,
    allowCashPayments: true,
    allowBankTransfer: true,
    allowCardPayments: true,
    allowUpiPayments: true,
    paymentReminderEnabled: true,
    paymentReminderDays: [7, 3, 1],
    overdueReminderEnabled: true,
    overdueReminderDays: [1, 3, 7],
    refundPolicyEnabled: false,
    refundPeriodDays: 7,
    refundPercentage: 100,
    refundDeductionAmount: 0,
    autoDiscountEnabled: false,
    earlyPaymentDiscountPercentage: 5,
    earlyPaymentDays: 5,
    prorateEnabled: true,
    prorateMethod: 'DAILY',
}

const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', icon: IndianRupee },
    { code: 'USD', symbol: '$', name: 'US Dollar', icon: DollarSign },
    { code: 'GBP', symbol: '£', name: 'British Pound', icon: PoundSterling },
    { code: 'EUR', symbol: '€', name: 'Euro', icon: Euro },
]

const BillingRulesSection: React.FC = () => {
    const [settings, setSettings] = useState<BillingSettings>(defaultSettings)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalSettings, setOriginalSettings] = useState<BillingSettings | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingChanges, setPendingChanges] = useState<ChangeItem[]>([])
    const [activeTab, setActiveTab] = useState<'currency' | 'fees' | 'invoice' | 'payments' | 'reminders' | 'refunds' | 'discounts'>('currency')
    const [newReminderDay, setNewReminderDay] = useState<number>(0)
    const [newOverdueDay, setNewOverdueDay] = useState<number>(0)

    useEffect(() => {
        fetchBillingSettings()
    }, [])

    const fetchBillingSettings = async () => {
        try {
            setLoading(true)
            const response = await api.get('/settings/gym')
            if (response.data) {
                const data = response.data
                
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
                
                const billingSettings: BillingSettings = {
                    currency: data.currency || 'INR',
                    currencySymbol: data.currencySymbol || '₹',
                    taxEnabled: parseBoolean(data.taxEnabled),
                    taxPercentage: parseNumber(data.taxPercentage, 18),
                    taxName: data.taxName || 'GST',
                    taxNumber: data.taxNumber || '',
                    lateFeeEnabled: parseBoolean(data.lateFeeEnabled),
                    lateFeeAmount: parseNumber(data.lateFeeAmount, 50),
                    lateFeeType: data.lateFeeType || 'FIXED',
                    lateFeePercentage: parseNumber(data.lateFeePercentage, 5),
                    gracePeriodDays: parseNumber(data.gracePeriodDays, 3),
                    maxLateFeeAmount: data.maxLateFeeAmount ? parseNumber(data.maxLateFeeAmount, 0) : null,
                    invoicePrefix: data.invoicePrefix || 'GYM-',
                    autoInvoiceEnabled: parseBoolean(data.autoInvoiceEnabled ?? true),
                    invoiceNotes: data.invoiceNotes || '',
                    invoiceFooter: data.invoiceFooter || '',
                    nextInvoiceNumber: parseNumber(data.nextInvoiceNumber, 1),
                    allowPartialPayments: parseBoolean(data.allowPartialPayments),
                    minPartialPaymentPercentage: parseNumber(data.minPartialPaymentPercentage, 25),
                    allowOnlinePayments: parseBoolean(data.allowOnlinePayments ?? true),
                    allowCashPayments: parseBoolean(data.allowCashPayments ?? true),
                    allowBankTransfer: parseBoolean(data.allowBankTransfer ?? true),
                    allowCardPayments: parseBoolean(data.allowCardPayments ?? true),
                    allowUpiPayments: parseBoolean(data.allowUpiPayments ?? true),
                    paymentReminderEnabled: parseBoolean(data.paymentReminderEnabled ?? true),
                    paymentReminderDays: parseArray(data.paymentReminderDays, [7, 3, 1]),
                    overdueReminderEnabled: parseBoolean(data.overdueReminderEnabled ?? true),
                    overdueReminderDays: parseArray(data.overdueReminderDays, [1, 3, 7]),
                    refundPolicyEnabled: parseBoolean(data.refundPolicyEnabled),
                    refundPeriodDays: parseNumber(data.refundPeriodDays, 7),
                    refundPercentage: parseNumber(data.refundPercentage, 100),
                    refundDeductionAmount: parseNumber(data.refundDeductionAmount, 0),
                    autoDiscountEnabled: parseBoolean(data.autoDiscountEnabled),
                    earlyPaymentDiscountPercentage: parseNumber(data.earlyPaymentDiscountPercentage, 5),
                    earlyPaymentDays: parseNumber(data.earlyPaymentDays, 5),
                    prorateEnabled: parseBoolean(data.prorateEnabled ?? true),
                    prorateMethod: data.prorateMethod || 'DAILY',
                }
                setSettings(billingSettings)
                setOriginalSettings(billingSettings)
            }
        } catch (error: any) {
            console.error('Failed to fetch billing settings:', error)
            setOriginalSettings(defaultSettings)
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = useCallback(<K extends keyof BillingSettings>(key: K, value: BillingSettings[K]) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value }
            
            // Auto-update currency symbol when currency changes
            if (key === 'currency') {
                const currency = currencies.find(c => c.code === value)
                if (currency) {
                    updated.currencySymbol = currency.symbol
                }
            }
            
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings))
            return updated
        })
    }, [originalSettings])

    const formatFieldName = (field: string): string => {
        const fieldNames: Record<string, string> = {
            currency: 'Currency',
            currencySymbol: 'Currency Symbol',
            taxEnabled: 'Tax Enabled',
            taxPercentage: 'Tax Percentage',
            taxName: 'Tax Name',
            taxNumber: 'Tax Number',
            lateFeeEnabled: 'Late Fee Enabled',
            lateFeeAmount: 'Late Fee Amount',
            lateFeeType: 'Late Fee Type',
            lateFeePercentage: 'Late Fee Percentage',
            gracePeriodDays: 'Grace Period Days',
            maxLateFeeAmount: 'Max Late Fee Amount',
            invoicePrefix: 'Invoice Prefix',
            autoInvoiceEnabled: 'Auto Invoice',
            invoiceNotes: 'Invoice Notes',
            invoiceFooter: 'Invoice Footer',
            allowPartialPayments: 'Partial Payments',
            minPartialPaymentPercentage: 'Min Partial Payment %',
            allowOnlinePayments: 'Online Payments',
            allowCashPayments: 'Cash Payments',
            allowBankTransfer: 'Bank Transfer',
            allowCardPayments: 'Card Payments',
            allowUpiPayments: 'UPI Payments',
            paymentReminderEnabled: 'Payment Reminders',
            paymentReminderDays: 'Reminder Days',
            overdueReminderEnabled: 'Overdue Reminders',
            overdueReminderDays: 'Overdue Days',
            refundPolicyEnabled: 'Refund Policy',
            refundPeriodDays: 'Refund Period',
            refundPercentage: 'Refund Percentage',
            refundDeductionAmount: 'Refund Deduction',
            autoDiscountEnabled: 'Auto Discount',
            earlyPaymentDiscountPercentage: 'Early Payment Discount %',
            earlyPaymentDays: 'Early Payment Days',
            prorateEnabled: 'Proration',
            prorateMethod: 'Proration Method',
        }
        return fieldNames[field] || field
    }

    const formatValue = (key: string, value: any): string => {
        if (value === null || value === undefined) return 'Not set'
        if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
        if (Array.isArray(value)) return value.join(', ') + ' days'
        if (key.includes('Percentage') || key.includes('percentage')) return `${value}%`
        if (key.includes('Amount') || key.includes('amount')) return `${settings.currencySymbol}${value}`
        if (key.includes('Days') || key.includes('days')) return `${value} days`
        return String(value)
    }

    const calculateChanges = (): ChangeItem[] => {
        if (!originalSettings) return []
        
        const changes: ChangeItem[] = []
        const keys = Object.keys(settings) as (keyof BillingSettings)[]
        
        keys.forEach(key => {
            const oldVal = originalSettings[key]
            const newVal = settings[key]
            
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
            
            // Convert to string key-value format for GymSettings endpoint
            const settingsToSave = {
                currency: settings.currency,
                currencySymbol: settings.currencySymbol,
                taxEnabled: String(settings.taxEnabled),
                taxPercentage: String(settings.taxPercentage),
                taxName: settings.taxName,
                taxNumber: settings.taxNumber,
                lateFeeEnabled: String(settings.lateFeeEnabled),
                lateFeeAmount: String(settings.lateFeeAmount),
                lateFeeType: settings.lateFeeType,
                lateFeePercentage: String(settings.lateFeePercentage),
                gracePeriodDays: String(settings.gracePeriodDays),
                maxLateFeeAmount: settings.maxLateFeeAmount ? String(settings.maxLateFeeAmount) : '',
                invoicePrefix: settings.invoicePrefix,
                autoInvoiceEnabled: String(settings.autoInvoiceEnabled),
                invoiceNotes: settings.invoiceNotes,
                invoiceFooter: settings.invoiceFooter,
                allowPartialPayments: String(settings.allowPartialPayments),
                minPartialPaymentPercentage: String(settings.minPartialPaymentPercentage),
                allowOnlinePayments: String(settings.allowOnlinePayments),
                allowCashPayments: String(settings.allowCashPayments),
                allowBankTransfer: String(settings.allowBankTransfer),
                allowCardPayments: String(settings.allowCardPayments),
                allowUpiPayments: String(settings.allowUpiPayments),
                paymentReminderEnabled: String(settings.paymentReminderEnabled),
                paymentReminderDays: settings.paymentReminderDays.join(','),
                overdueReminderEnabled: String(settings.overdueReminderEnabled),
                overdueReminderDays: settings.overdueReminderDays.join(','),
                refundPolicyEnabled: String(settings.refundPolicyEnabled),
                refundPeriodDays: String(settings.refundPeriodDays),
                refundPercentage: String(settings.refundPercentage),
                refundDeductionAmount: String(settings.refundDeductionAmount),
                autoDiscountEnabled: String(settings.autoDiscountEnabled),
                earlyPaymentDiscountPercentage: String(settings.earlyPaymentDiscountPercentage),
                earlyPaymentDays: String(settings.earlyPaymentDays),
                prorateEnabled: String(settings.prorateEnabled),
                prorateMethod: settings.prorateMethod,
            }
            
            await api.put('/settings/gym', settingsToSave)
            
            setOriginalSettings({ ...settings })
            setHasChanges(false)
            showToast("Billing settings saved successfully", "success")
        } catch (error: any) {
            console.error('Failed to save billing settings:', error)
            showToast(error.response?.data?.message || "Failed to save billing settings", "error")
        } finally {
            setSaving(false)
        }
    }

    const addReminderDay = (type: 'payment' | 'overdue') => {
        const day = type === 'payment' ? newReminderDay : newOverdueDay
        if (day <= 0 || day > 30) {
            showToast("Please enter a valid day (1-30)", "error")
            return
        }
        
        const key = type === 'payment' ? 'paymentReminderDays' : 'overdueReminderDays'
        const currentDays = settings[key]
        
        if (currentDays.includes(day)) {
            showToast("This day is already added", "error")
            return
        }
        
        const newDays = [...currentDays, day].sort((a, b) => type === 'payment' ? b - a : a - b)
        updateSetting(key, newDays)
        
        if (type === 'payment') setNewReminderDay(0)
        else setNewOverdueDay(0)
    }

    const removeReminderDay = (type: 'payment' | 'overdue', day: number) => {
        const key = type === 'payment' ? 'paymentReminderDays' : 'overdueReminderDays'
        const newDays = settings[key].filter(d => d !== day)
        updateSetting(key, newDays)
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

    const tabs = [
        { id: 'currency', label: 'Currency & Tax', icon: IndianRupee },
        { id: 'fees', label: 'Late Fees', icon: Ban },
        { id: 'invoice', label: 'Invoicing', icon: Receipt },
        { id: 'payments', label: 'Payment Methods', icon: Wallet },
        { id: 'reminders', label: 'Reminders', icon: Bell },
        { id: 'refunds', label: 'Refunds', icon: RefreshCw },
        { id: 'discounts', label: 'Discounts & Proration', icon: Gift },
    ]

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
                            Configure taxes, payment methods, invoicing, and billing policies
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
                {/* Currency & Tax Tab */}
                {activeTab === 'currency' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <IndianRupee size={16} />
                                <h4 className="form-group__title">Currency Settings</h4>
                            </div>

                            <div className="form-grid form-grid--2col">
                                <div className="field-wrapper">
                                    <label className="field-label">System Currency</label>
                                    <select
                                        className="dense-input"
                                        value={settings.currency}
                                        onChange={(e) => updateSetting('currency', e.target.value)}
                                    >
                                        {currencies.map(curr => (
                                            <option key={curr.code} value={curr.code}>
                                                {curr.code} ({curr.symbol}) - {curr.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="field-hint">Currency used for all transactions</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Currency Symbol</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={settings.currencySymbol}
                                        onChange={(e) => updateSetting('currencySymbol', e.target.value)}
                                        maxLength={5}
                                    />
                                    <span className="field-hint">Symbol displayed in invoices</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Percent size={16} />
                                <h4 className="form-group__title">Tax Configuration</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Percent size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Tax (GST/VAT)</span>
                                        <span className="policy-toggle-row__hint">Automatically apply tax to all membership fees and services</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.taxEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('taxEnabled', !settings.taxEnabled)}
                                />
                            </div>

                            {settings.taxEnabled && (
                                <div className="form-grid form-grid--3col" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                    <div className="field-wrapper">
                                        <label className="field-label">Tax Name</label>
                                        <input
                                            type="text"
                                            className="dense-input"
                                            value={settings.taxName}
                                            onChange={(e) => updateSetting('taxName', e.target.value)}
                                            placeholder="e.g. GST, VAT"
                                        />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Tax Percentage (%)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={settings.taxPercentage}
                                            onChange={(e) => updateSetting('taxPercentage', parseFloat(e.target.value) || 0)}
                                            min={0}
                                            max={100}
                                            step={0.01}
                                        />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Tax Registration Number</label>
                                        <input
                                            type="text"
                                            className="dense-input"
                                            value={settings.taxNumber || ''}
                                            onChange={(e) => updateSetting('taxNumber', e.target.value)}
                                            placeholder="e.g. GSTIN"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Late Fees Tab */}
                {activeTab === 'fees' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Clock size={16} />
                                <h4 className="form-group__title">Late Fee Configuration</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Ban size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Apply Late Fees</span>
                                        <span className="policy-toggle-row__hint">Charge members for overdue payments after grace period</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.lateFeeEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('lateFeeEnabled', !settings.lateFeeEnabled)}
                                />
                            </div>

                            {settings.lateFeeEnabled && (
                                <>
                                    <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                        <div className="field-wrapper">
                                            <label className="field-label">Late Fee Type</label>
                                            <select
                                                className="dense-input"
                                                value={settings.lateFeeType}
                                                onChange={(e) => updateSetting('lateFeeType', e.target.value)}
                                            >
                                                <option value="FIXED">Fixed Amount</option>
                                                <option value="PERCENTAGE">Percentage of Due Amount</option>
                                            </select>
                                        </div>
                                        {settings.lateFeeType === 'FIXED' ? (
                                            <div className="field-wrapper">
                                                <label className="field-label">Late Fee Amount ({settings.currencySymbol})</label>
                                                <input
                                                    type="number"
                                                    className="dense-input"
                                                    value={settings.lateFeeAmount}
                                                    onChange={(e) => updateSetting('lateFeeAmount', parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                />
                                            </div>
                                        ) : (
                                            <div className="field-wrapper">
                                                <label className="field-label">Late Fee Percentage (%)</label>
                                                <input
                                                    type="number"
                                                    className="dense-input"
                                                    value={settings.lateFeePercentage}
                                                    onChange={(e) => updateSetting('lateFeePercentage', parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    max={100}
                                                    step={0.1}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '8px' }}>
                                        <div className="field-wrapper">
                                            <label className="field-label">Grace Period (Days)</label>
                                            <input
                                                type="number"
                                                className="dense-input"
                                                value={settings.gracePeriodDays}
                                                onChange={(e) => updateSetting('gracePeriodDays', parseInt(e.target.value) || 0)}
                                                min={0}
                                                max={30}
                                            />
                                            <span className="field-hint">Days after due date before late fee applies</span>
                                        </div>
                                        <div className="field-wrapper">
                                            <label className="field-label">Maximum Late Fee ({settings.currencySymbol})</label>
                                            <input
                                                type="number"
                                                className="dense-input"
                                                value={settings.maxLateFeeAmount || ''}
                                                onChange={(e) => updateSetting('maxLateFeeAmount', e.target.value ? parseFloat(e.target.value) : null)}
                                                min={0}
                                                placeholder="No limit"
                                            />
                                            <span className="field-hint">Leave empty for no cap</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Invoicing Tab */}
                {activeTab === 'invoice' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Receipt size={16} />
                                <h4 className="form-group__title">Invoice Settings</h4>
                            </div>

                            <div className="form-grid form-grid--2col">
                                <div className="field-wrapper">
                                    <label className="field-label">Invoice Prefix</label>
                                    <input
                                        type="text"
                                        className="dense-input"
                                        value={settings.invoicePrefix}
                                        onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                                        placeholder="e.g. GYM-, INV-"
                                    />
                                    <span className="field-hint">Prefix for invoice numbers (e.g. {settings.invoicePrefix}0001)</span>
                                </div>
                                <div className="field-wrapper">
                                    <label className="field-label">Next Invoice Number</label>
                                    <input
                                        type="text"
                                        className="dense-input dense-input--readonly"
                                        value={settings.invoicePrefix + String(settings.nextInvoiceNumber || 1).padStart(4, '0')}
                                        readOnly
                                    />
                                    <span className="field-hint">Preview of next invoice number</span>
                                </div>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Auto-Generate Invoices</span>
                                        <span className="policy-toggle-row__hint">Automatically create invoice when payment is recorded</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.autoInvoiceEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('autoInvoiceEnabled', !settings.autoInvoiceEnabled)}
                                />
                            </div>

                            <div className="field-wrapper" style={{ marginTop: '16px' }}>
                                <label className="field-label">Default Invoice Notes</label>
                                <textarea
                                    className="dense-input dense-input--textarea"
                                    value={settings.invoiceNotes || ''}
                                    onChange={(e) => updateSetting('invoiceNotes', e.target.value)}
                                    placeholder="Notes to appear on invoices (e.g. payment terms, thank you message)"
                                    rows={3}
                                />
                            </div>

                            <div className="field-wrapper" style={{ marginTop: '16px' }}>
                                <label className="field-label">Invoice Footer</label>
                                <textarea
                                    className="dense-input dense-input--textarea"
                                    value={settings.invoiceFooter || ''}
                                    onChange={(e) => updateSetting('invoiceFooter', e.target.value)}
                                    placeholder="Footer text (e.g. company address, terms & conditions)"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Methods Tab */}
                {activeTab === 'payments' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Wallet size={16} />
                                <h4 className="form-group__title">Accepted Payment Methods</h4>
                            </div>

                            <div className="payment-methods-grid">
                                <div className="policy-toggle-row">
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <Banknote size={16} />
                                        </div>
                                        <div className="policy-toggle-row__text">
                                            <span className="policy-toggle-row__label">Cash Payments</span>
                                            <span className="policy-toggle-row__hint">Accept cash at the counter</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`policy-toggle ${settings.allowCashPayments ? 'policy-toggle--active' : ''}`}
                                        onClick={() => updateSetting('allowCashPayments', !settings.allowCashPayments)}
                                    />
                                </div>

                                <div className="policy-toggle-row">
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <CreditCard size={16} />
                                        </div>
                                        <div className="policy-toggle-row__text">
                                            <span className="policy-toggle-row__label">Card Payments</span>
                                            <span className="policy-toggle-row__hint">Credit/Debit cards</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`policy-toggle ${settings.allowCardPayments ? 'policy-toggle--active' : ''}`}
                                        onClick={() => updateSetting('allowCardPayments', !settings.allowCardPayments)}
                                    />
                                </div>

                                <div className="policy-toggle-row">
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <Smartphone size={16} />
                                        </div>
                                        <div className="policy-toggle-row__text">
                                            <span className="policy-toggle-row__label">UPI Payments</span>
                                            <span className="policy-toggle-row__hint">Google Pay, PhonePe, Paytm, etc.</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`policy-toggle ${settings.allowUpiPayments ? 'policy-toggle--active' : ''}`}
                                        onClick={() => updateSetting('allowUpiPayments', !settings.allowUpiPayments)}
                                    />
                                </div>

                                <div className="policy-toggle-row">
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <Building2 size={16} />
                                        </div>
                                        <div className="policy-toggle-row__text">
                                            <span className="policy-toggle-row__label">Bank Transfer</span>
                                            <span className="policy-toggle-row__hint">NEFT/RTGS/IMPS transfers</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`policy-toggle ${settings.allowBankTransfer ? 'policy-toggle--active' : ''}`}
                                        onClick={() => updateSetting('allowBankTransfer', !settings.allowBankTransfer)}
                                    />
                                </div>

                                <div className="policy-toggle-row">
                                    <div className="policy-toggle-row__info">
                                        <div className="policy-toggle-row__icon">
                                            <Wallet size={16} />
                                        </div>
                                        <div className="policy-toggle-row__text">
                                            <span className="policy-toggle-row__label">Online Payments</span>
                                            <span className="policy-toggle-row__hint">Payment gateway integration</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`policy-toggle ${settings.allowOnlinePayments ? 'policy-toggle--active' : ''}`}
                                        onClick={() => updateSetting('allowOnlinePayments', !settings.allowOnlinePayments)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Calculator size={16} />
                                <h4 className="form-group__title">Partial Payments</h4>
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

                            {settings.allowPartialPayments && (
                                <div className="field-wrapper" style={{ marginLeft: '40px', marginTop: '16px', maxWidth: '300px' }}>
                                    <label className="field-label">Minimum Partial Payment (%)</label>
                                    <input
                                        type="number"
                                        className="dense-input"
                                        value={settings.minPartialPaymentPercentage}
                                        onChange={(e) => updateSetting('minPartialPaymentPercentage', parseFloat(e.target.value) || 0)}
                                        min={1}
                                        max={100}
                                    />
                                    <span className="field-hint">Minimum % of total amount required per payment</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reminders Tab */}
                {activeTab === 'reminders' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Bell size={16} />
                                <h4 className="form-group__title">Payment Due Reminders</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Bell size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Payment Reminders</span>
                                        <span className="policy-toggle-row__hint">Send reminders before payment is due</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.paymentReminderEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('paymentReminderEnabled', !settings.paymentReminderEnabled)}
                                />
                            </div>

                            {settings.paymentReminderEnabled && (
                                <div className="reminder-days-config" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                    <label className="field-label">Reminder Days (Before Due Date)</label>
                                    <div className="reminder-tags">
                                        {settings.paymentReminderDays.map(day => (
                                            <span key={day} className="reminder-tag">
                                                {day} day{day !== 1 ? 's' : ''} before
                                                <button onClick={() => removeReminderDay('payment', day)}>
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
                                            max={30}
                                            style={{ width: '80px' }}
                                        />
                                        <button 
                                            className="add-reminder-btn"
                                            onClick={() => addReminderDay('payment')}
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <AlertTriangle size={16} />
                                <h4 className="form-group__title">Overdue Payment Reminders</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Overdue Reminders</span>
                                        <span className="policy-toggle-row__hint">Send reminders after payment is overdue</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.overdueReminderEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('overdueReminderEnabled', !settings.overdueReminderEnabled)}
                                />
                            </div>

                            {settings.overdueReminderEnabled && (
                                <div className="reminder-days-config" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                    <label className="field-label">Reminder Days (After Due Date)</label>
                                    <div className="reminder-tags">
                                        {settings.overdueReminderDays.map(day => (
                                            <span key={day} className="reminder-tag reminder-tag--overdue">
                                                {day} day{day !== 1 ? 's' : ''} after
                                                <button onClick={() => removeReminderDay('overdue', day)}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="reminder-add">
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={newOverdueDay || ''}
                                            onChange={(e) => setNewOverdueDay(parseInt(e.target.value) || 0)}
                                            placeholder="Days"
                                            min={1}
                                            max={30}
                                            style={{ width: '80px' }}
                                        />
                                        <button 
                                            className="add-reminder-btn"
                                            onClick={() => addReminderDay('overdue')}
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Refunds Tab */}
                {activeTab === 'refunds' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <RefreshCw size={16} />
                                <h4 className="form-group__title">Refund Policy</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <RefreshCw size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Refund Policy</span>
                                        <span className="policy-toggle-row__hint">Allow refunds for cancelled memberships</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.refundPolicyEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('refundPolicyEnabled', !settings.refundPolicyEnabled)}
                                />
                            </div>

                            {settings.refundPolicyEnabled && (
                                <div className="form-grid form-grid--3col" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                    <div className="field-wrapper">
                                        <label className="field-label">Refund Window (Days)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={settings.refundPeriodDays}
                                            onChange={(e) => updateSetting('refundPeriodDays', parseInt(e.target.value) || 0)}
                                            min={0}
                                            max={365}
                                        />
                                        <span className="field-hint">Days from purchase to request refund</span>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Refund Percentage (%)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={settings.refundPercentage}
                                            onChange={(e) => updateSetting('refundPercentage', parseFloat(e.target.value) || 0)}
                                            min={0}
                                            max={100}
                                        />
                                        <span className="field-hint">% of payment to refund</span>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Processing Fee ({settings.currencySymbol})</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={settings.refundDeductionAmount}
                                            onChange={(e) => updateSetting('refundDeductionAmount', parseFloat(e.target.value) || 0)}
                                            min={0}
                                        />
                                        <span className="field-hint">Flat fee deducted from refund</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Discounts & Proration Tab */}
                {activeTab === 'discounts' && (
                    <div className="settings-tab-content">
                        <div className="form-group">
                            <div className="form-group__header">
                                <Gift size={16} />
                                <h4 className="form-group__title">Early Payment Discount</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Gift size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Early Payment Discount</span>
                                        <span className="policy-toggle-row__hint">Offer discount for payments made before due date</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.autoDiscountEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('autoDiscountEnabled', !settings.autoDiscountEnabled)}
                                />
                            </div>

                            {settings.autoDiscountEnabled && (
                                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '16px' }}>
                                    <div className="field-wrapper">
                                        <label className="field-label">Discount Percentage (%)</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={settings.earlyPaymentDiscountPercentage}
                                            onChange={(e) => updateSetting('earlyPaymentDiscountPercentage', parseFloat(e.target.value) || 0)}
                                            min={0}
                                            max={100}
                                            step={0.5}
                                        />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Days Before Due Date</label>
                                        <input
                                            type="number"
                                            className="dense-input"
                                            value={settings.earlyPaymentDays}
                                            onChange={(e) => updateSetting('earlyPaymentDays', parseInt(e.target.value) || 0)}
                                            min={1}
                                            max={30}
                                        />
                                        <span className="field-hint">Payment must be {settings.earlyPaymentDays}+ days early</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="form-group__header">
                                <Calculator size={16} />
                                <h4 className="form-group__title">Membership Proration</h4>
                            </div>

                            <div className="policy-toggle-row">
                                <div className="policy-toggle-row__info">
                                    <div className="policy-toggle-row__icon">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="policy-toggle-row__text">
                                        <span className="policy-toggle-row__label">Enable Proration</span>
                                        <span className="policy-toggle-row__hint">Calculate pro-rated fees for mid-cycle changes</span>
                                    </div>
                                </div>
                                <button
                                    className={`policy-toggle ${settings.prorateEnabled ? 'policy-toggle--active' : ''}`}
                                    onClick={() => updateSetting('prorateEnabled', !settings.prorateEnabled)}
                                />
                            </div>

                            {settings.prorateEnabled && (
                                <div className="field-wrapper" style={{ marginLeft: '40px', marginTop: '16px', maxWidth: '300px' }}>
                                    <label className="field-label">Proration Method</label>
                                    <select
                                        className="dense-input"
                                        value={settings.prorateMethod}
                                        onChange={(e) => updateSetting('prorateMethod', e.target.value)}
                                    >
                                        <option value="DAILY">Daily (most accurate)</option>
                                        <option value="WEEKLY">Weekly</option>
                                    </select>
                                    <span className="field-hint">How to calculate partial period fees</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <div className="confirm-dialog__header">
                            <h3>Confirm Billing Changes</h3>
                            <button onClick={() => setShowConfirmDialog(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="confirm-dialog__body">
                            <p className="confirm-dialog__message">
                                You are about to update the following billing settings:
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
                                <span>These changes will affect all future transactions and invoices.</span>
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

export default BillingRulesSection
