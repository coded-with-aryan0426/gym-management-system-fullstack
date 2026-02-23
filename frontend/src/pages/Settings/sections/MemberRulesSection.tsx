import { useState, useEffect } from 'react'
import { FiUsers, FiClock, FiDollarSign, FiShield, FiActivity, FiUserCheck, FiAlertCircle, FiGift } from 'react-icons/fi'
import api from '../../../services/api'

interface MemberSettings {
  // Registration & Onboarding
  requirePhoneVerification: boolean
  requireEmailVerification: boolean
  requireEmergencyContact: boolean
  requireHealthDeclaration: boolean
  requirePhotoId: boolean
  minAge: number
  maxAge: number
  allowGuestRegistration: boolean
  trialPeriodDays: number
  welcomeEmailEnabled: boolean
  orientationRequired: boolean

  // Check-in & Access
  checkInMethod: string
  allowMultipleCheckInsPerDay: boolean
  maxCheckInsPerDay: number
  checkInCooldownMinutes: number
  requireCheckOut: boolean
  autoCheckOutHours: number
  allowGuestCheckIn: boolean
  guestCheckInLimit: number
  peakHourRestrictions: boolean
  peakHourStart: string
  peakHourEnd: string

  // Booking & Classes
  maxActiveBookings: number
  bookingWindowDays: number
  cancellationWindowHours: number
  noShowPenaltyEnabled: boolean
  noShowPenaltyAmount: number
  maxNoShowsPerMonth: number
  noShowSuspensionDays: number
  waitlistEnabled: boolean
  waitlistAutoEnroll: boolean
  maxWaitlistPerClass: number

  // Account & Behavior
  maxFamilyMembers: number
  familyDiscountPercent: number
  referralBonusEnabled: boolean
  referralBonusAmount: number
  referralBonusType: string
  loyaltyPointsEnabled: boolean
  pointsPerVisit: number
  pointsPerReferral: number
  pointsRedemptionRate: number

  // Communication Preferences
  allowSmsNotifications: boolean
  allowEmailNotifications: boolean
  allowPushNotifications: boolean
  marketingOptInDefault: boolean
  birthdayGreetingsEnabled: boolean
  inactivityAlertDays: number
  inactivityFollowUpEnabled: boolean

  // Suspension & Compliance
  autoSuspendOnPaymentFailure: boolean
  paymentGracePeriodDays: number
  maxPaymentRetries: number
  suspensionWarningDays: number
  requireWaiverSigning: boolean
  waiverExpiryMonths: number
  covidDeclarationRequired: boolean
  memberCodeOfConductRequired: boolean
}

const defaultSettings: MemberSettings = {
  // Registration & Onboarding
  requirePhoneVerification: true,
  requireEmailVerification: true,
  requireEmergencyContact: true,
  requireHealthDeclaration: false,
  requirePhotoId: false,
  minAge: 16,
  maxAge: 80,
  allowGuestRegistration: false,
  trialPeriodDays: 7,
  welcomeEmailEnabled: true,
  orientationRequired: false,

  // Check-in & Access
  checkInMethod: 'qr_code',
  allowMultipleCheckInsPerDay: true,
  maxCheckInsPerDay: 2,
  checkInCooldownMinutes: 60,
  requireCheckOut: false,
  autoCheckOutHours: 4,
  allowGuestCheckIn: true,
  guestCheckInLimit: 2,
  peakHourRestrictions: false,
  peakHourStart: '17:00',
  peakHourEnd: '20:00',

  // Booking & Classes
  maxActiveBookings: 5,
  bookingWindowDays: 14,
  cancellationWindowHours: 4,
  noShowPenaltyEnabled: true,
  noShowPenaltyAmount: 100,
  maxNoShowsPerMonth: 3,
  noShowSuspensionDays: 7,
  waitlistEnabled: true,
  waitlistAutoEnroll: true,
  maxWaitlistPerClass: 10,

  // Account & Behavior
  maxFamilyMembers: 4,
  familyDiscountPercent: 15,
  referralBonusEnabled: true,
  referralBonusAmount: 500,
  referralBonusType: 'credit',
  loyaltyPointsEnabled: true,
  pointsPerVisit: 10,
  pointsPerReferral: 100,
  pointsRedemptionRate: 1,

  // Communication Preferences
  allowSmsNotifications: true,
  allowEmailNotifications: true,
  allowPushNotifications: true,
  marketingOptInDefault: false,
  birthdayGreetingsEnabled: true,
  inactivityAlertDays: 14,
  inactivityFollowUpEnabled: true,

  // Suspension & Compliance
  autoSuspendOnPaymentFailure: true,
  paymentGracePeriodDays: 7,
  maxPaymentRetries: 3,
  suspensionWarningDays: 3,
  requireWaiverSigning: true,
  waiverExpiryMonths: 12,
  covidDeclarationRequired: false,
  memberCodeOfConductRequired: true
}

type TabType = 'registration' | 'checkin' | 'booking' | 'account' | 'communication' | 'compliance'

const MemberRulesSection = () => {
  const [settings, setSettings] = useState<MemberSettings>(defaultSettings)
  const [originalSettings, setOriginalSettings] = useState<MemberSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<TabType>('registration')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/gym')
      const data = response.data as Record<string, string>

      const loadedSettings: MemberSettings = {
        // Registration & Onboarding
        requirePhoneVerification: data.memberRequirePhoneVerification === 'true',
        requireEmailVerification: data.memberRequireEmailVerification === 'true',
        requireEmergencyContact: data.memberRequireEmergencyContact === 'true',
        requireHealthDeclaration: data.memberRequireHealthDeclaration === 'true',
        requirePhotoId: data.memberRequirePhotoId === 'true',
        minAge: parseInt(data.memberMinAge) || 16,
        maxAge: parseInt(data.memberMaxAge) || 80,
        allowGuestRegistration: data.memberAllowGuestRegistration === 'true',
        trialPeriodDays: parseInt(data.memberTrialPeriodDays) || 7,
        welcomeEmailEnabled: data.memberWelcomeEmailEnabled !== 'false',
        orientationRequired: data.memberOrientationRequired === 'true',

        // Check-in & Access
        checkInMethod: data.memberCheckInMethod || 'qr_code',
        allowMultipleCheckInsPerDay: data.memberAllowMultipleCheckInsPerDay !== 'false',
        maxCheckInsPerDay: parseInt(data.memberMaxCheckInsPerDay) || 2,
        checkInCooldownMinutes: parseInt(data.memberCheckInCooldownMinutes) || 60,
        requireCheckOut: data.memberRequireCheckOut === 'true',
        autoCheckOutHours: parseInt(data.memberAutoCheckOutHours) || 4,
        allowGuestCheckIn: data.memberAllowGuestCheckIn !== 'false',
        guestCheckInLimit: parseInt(data.memberGuestCheckInLimit) || 2,
        peakHourRestrictions: data.memberPeakHourRestrictions === 'true',
        peakHourStart: data.memberPeakHourStart || '17:00',
        peakHourEnd: data.memberPeakHourEnd || '20:00',

        // Booking & Classes
        maxActiveBookings: parseInt(data.memberMaxActiveBookings) || 5,
        bookingWindowDays: parseInt(data.memberBookingWindowDays) || 14,
        cancellationWindowHours: parseInt(data.memberCancellationWindowHours) || 4,
        noShowPenaltyEnabled: data.memberNoShowPenaltyEnabled !== 'false',
        noShowPenaltyAmount: parseInt(data.memberNoShowPenaltyAmount) || 100,
        maxNoShowsPerMonth: parseInt(data.memberMaxNoShowsPerMonth) || 3,
        noShowSuspensionDays: parseInt(data.memberNoShowSuspensionDays) || 7,
        waitlistEnabled: data.memberWaitlistEnabled !== 'false',
        waitlistAutoEnroll: data.memberWaitlistAutoEnroll !== 'false',
        maxWaitlistPerClass: parseInt(data.memberMaxWaitlistPerClass) || 10,

        // Account & Behavior
        maxFamilyMembers: parseInt(data.memberMaxFamilyMembers) || 4,
        familyDiscountPercent: parseInt(data.memberFamilyDiscountPercent) || 15,
        referralBonusEnabled: data.memberReferralBonusEnabled !== 'false',
        referralBonusAmount: parseInt(data.memberReferralBonusAmount) || 500,
        referralBonusType: data.memberReferralBonusType || 'credit',
        loyaltyPointsEnabled: data.memberLoyaltyPointsEnabled !== 'false',
        pointsPerVisit: parseInt(data.memberPointsPerVisit) || 10,
        pointsPerReferral: parseInt(data.memberPointsPerReferral) || 100,
        pointsRedemptionRate: parseFloat(data.memberPointsRedemptionRate) || 1,

        // Communication Preferences
        allowSmsNotifications: data.memberAllowSmsNotifications !== 'false',
        allowEmailNotifications: data.memberAllowEmailNotifications !== 'false',
        allowPushNotifications: data.memberAllowPushNotifications !== 'false',
        marketingOptInDefault: data.memberMarketingOptInDefault === 'true',
        birthdayGreetingsEnabled: data.memberBirthdayGreetingsEnabled !== 'false',
        inactivityAlertDays: parseInt(data.memberInactivityAlertDays) || 14,
        inactivityFollowUpEnabled: data.memberInactivityFollowUpEnabled !== 'false',

        // Suspension & Compliance
        autoSuspendOnPaymentFailure: data.memberAutoSuspendOnPaymentFailure !== 'false',
        paymentGracePeriodDays: parseInt(data.memberPaymentGracePeriodDays) || 7,
        maxPaymentRetries: parseInt(data.memberMaxPaymentRetries) || 3,
        suspensionWarningDays: parseInt(data.memberSuspensionWarningDays) || 3,
        requireWaiverSigning: data.memberRequireWaiverSigning !== 'false',
        waiverExpiryMonths: parseInt(data.memberWaiverExpiryMonths) || 12,
        covidDeclarationRequired: data.memberCovidDeclarationRequired === 'true',
        memberCodeOfConductRequired: data.memberCodeOfConductRequired !== 'false'
      }

      setSettings(loadedSettings)
      setOriginalSettings(loadedSettings)
    } catch (error) {
      console.error('Failed to fetch member settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof MemberSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }

  const getChanges = () => {
    const changes: { field: string; oldValue: string; newValue: string }[] = []

    const fieldLabels: Record<string, string> = {
      requirePhoneVerification: 'Require Phone Verification',
      requireEmailVerification: 'Require Email Verification',
      requireEmergencyContact: 'Require Emergency Contact',
      requireHealthDeclaration: 'Require Health Declaration',
      requirePhotoId: 'Require Photo ID',
      minAge: 'Minimum Age',
      maxAge: 'Maximum Age',
      allowGuestRegistration: 'Allow Guest Registration',
      trialPeriodDays: 'Trial Period (Days)',
      welcomeEmailEnabled: 'Welcome Email',
      orientationRequired: 'Orientation Required',
      checkInMethod: 'Check-in Method',
      allowMultipleCheckInsPerDay: 'Allow Multiple Check-ins',
      maxCheckInsPerDay: 'Max Check-ins Per Day',
      checkInCooldownMinutes: 'Check-in Cooldown (Minutes)',
      requireCheckOut: 'Require Check-out',
      autoCheckOutHours: 'Auto Check-out (Hours)',
      allowGuestCheckIn: 'Allow Guest Check-in',
      guestCheckInLimit: 'Guest Check-in Limit',
      peakHourRestrictions: 'Peak Hour Restrictions',
      peakHourStart: 'Peak Hour Start',
      peakHourEnd: 'Peak Hour End',
      maxActiveBookings: 'Max Active Bookings',
      bookingWindowDays: 'Booking Window (Days)',
      cancellationWindowHours: 'Cancellation Window (Hours)',
      noShowPenaltyEnabled: 'No-Show Penalty',
      noShowPenaltyAmount: 'No-Show Penalty Amount',
      maxNoShowsPerMonth: 'Max No-Shows Per Month',
      noShowSuspensionDays: 'No-Show Suspension (Days)',
      waitlistEnabled: 'Waitlist Enabled',
      waitlistAutoEnroll: 'Auto-enroll from Waitlist',
      maxWaitlistPerClass: 'Max Waitlist Per Class',
      maxFamilyMembers: 'Max Family Members',
      familyDiscountPercent: 'Family Discount (%)',
      referralBonusEnabled: 'Referral Bonus',
      referralBonusAmount: 'Referral Bonus Amount',
      referralBonusType: 'Referral Bonus Type',
      loyaltyPointsEnabled: 'Loyalty Points',
      pointsPerVisit: 'Points Per Visit',
      pointsPerReferral: 'Points Per Referral',
      pointsRedemptionRate: 'Points Redemption Rate',
      allowSmsNotifications: 'SMS Notifications',
      allowEmailNotifications: 'Email Notifications',
      allowPushNotifications: 'Push Notifications',
      marketingOptInDefault: 'Marketing Opt-in Default',
      birthdayGreetingsEnabled: 'Birthday Greetings',
      inactivityAlertDays: 'Inactivity Alert (Days)',
      inactivityFollowUpEnabled: 'Inactivity Follow-up',
      autoSuspendOnPaymentFailure: 'Auto-Suspend on Payment Failure',
      paymentGracePeriodDays: 'Payment Grace Period (Days)',
      maxPaymentRetries: 'Max Payment Retries',
      suspensionWarningDays: 'Suspension Warning (Days)',
      requireWaiverSigning: 'Require Waiver Signing',
      waiverExpiryMonths: 'Waiver Expiry (Months)',
      covidDeclarationRequired: 'COVID Declaration Required',
      memberCodeOfConductRequired: 'Code of Conduct Required'
    }

    Object.keys(settings).forEach(key => {
      const field = key as keyof MemberSettings
      if (settings[field] !== originalSettings[field]) {
        const formatValue = (val: unknown): string => {
          if (typeof val === 'boolean') return val ? 'Enabled' : 'Disabled'
          if (field === 'checkInMethod') {
            const methods: Record<string, string> = {
              'qr_code': 'QR Code',
              'fingerprint': 'Fingerprint',
              'card': 'Access Card',
              'pin': 'PIN Code',
              'face': 'Face Recognition'
            }
            return methods[val as string] || String(val)
          }
          if (field === 'referralBonusType') {
            return val === 'credit' ? 'Account Credit' : val === 'discount' ? 'Discount' : 'Cash'
          }
          return String(val)
        }
        changes.push({
          field: fieldLabels[field] || field,
          oldValue: formatValue(originalSettings[field]),
          newValue: formatValue(settings[field])
        })
      }
    })

    return changes
  }

  const handleSave = () => {
    if (hasChanges()) {
      setShowConfirmDialog(true)
    }
  }

  const confirmSave = async () => {
    setSaving(true)
    try {
      const payload: Record<string, string> = {
        memberRequirePhoneVerification: String(settings.requirePhoneVerification),
        memberRequireEmailVerification: String(settings.requireEmailVerification),
        memberRequireEmergencyContact: String(settings.requireEmergencyContact),
        memberRequireHealthDeclaration: String(settings.requireHealthDeclaration),
        memberRequirePhotoId: String(settings.requirePhotoId),
        memberMinAge: String(settings.minAge),
        memberMaxAge: String(settings.maxAge),
        memberAllowGuestRegistration: String(settings.allowGuestRegistration),
        memberTrialPeriodDays: String(settings.trialPeriodDays),
        memberWelcomeEmailEnabled: String(settings.welcomeEmailEnabled),
        memberOrientationRequired: String(settings.orientationRequired),
        memberCheckInMethod: settings.checkInMethod,
        memberAllowMultipleCheckInsPerDay: String(settings.allowMultipleCheckInsPerDay),
        memberMaxCheckInsPerDay: String(settings.maxCheckInsPerDay),
        memberCheckInCooldownMinutes: String(settings.checkInCooldownMinutes),
        memberRequireCheckOut: String(settings.requireCheckOut),
        memberAutoCheckOutHours: String(settings.autoCheckOutHours),
        memberAllowGuestCheckIn: String(settings.allowGuestCheckIn),
        memberGuestCheckInLimit: String(settings.guestCheckInLimit),
        memberPeakHourRestrictions: String(settings.peakHourRestrictions),
        memberPeakHourStart: settings.peakHourStart,
        memberPeakHourEnd: settings.peakHourEnd,
        memberMaxActiveBookings: String(settings.maxActiveBookings),
        memberBookingWindowDays: String(settings.bookingWindowDays),
        memberCancellationWindowHours: String(settings.cancellationWindowHours),
        memberNoShowPenaltyEnabled: String(settings.noShowPenaltyEnabled),
        memberNoShowPenaltyAmount: String(settings.noShowPenaltyAmount),
        memberMaxNoShowsPerMonth: String(settings.maxNoShowsPerMonth),
        memberNoShowSuspensionDays: String(settings.noShowSuspensionDays),
        memberWaitlistEnabled: String(settings.waitlistEnabled),
        memberWaitlistAutoEnroll: String(settings.waitlistAutoEnroll),
        memberMaxWaitlistPerClass: String(settings.maxWaitlistPerClass),
        memberMaxFamilyMembers: String(settings.maxFamilyMembers),
        memberFamilyDiscountPercent: String(settings.familyDiscountPercent),
        memberReferralBonusEnabled: String(settings.referralBonusEnabled),
        memberReferralBonusAmount: String(settings.referralBonusAmount),
        memberReferralBonusType: settings.referralBonusType,
        memberLoyaltyPointsEnabled: String(settings.loyaltyPointsEnabled),
        memberPointsPerVisit: String(settings.pointsPerVisit),
        memberPointsPerReferral: String(settings.pointsPerReferral),
        memberPointsRedemptionRate: String(settings.pointsRedemptionRate),
        memberAllowSmsNotifications: String(settings.allowSmsNotifications),
        memberAllowEmailNotifications: String(settings.allowEmailNotifications),
        memberAllowPushNotifications: String(settings.allowPushNotifications),
        memberMarketingOptInDefault: String(settings.marketingOptInDefault),
        memberBirthdayGreetingsEnabled: String(settings.birthdayGreetingsEnabled),
        memberInactivityAlertDays: String(settings.inactivityAlertDays),
        memberInactivityFollowUpEnabled: String(settings.inactivityFollowUpEnabled),
        memberAutoSuspendOnPaymentFailure: String(settings.autoSuspendOnPaymentFailure),
        memberPaymentGracePeriodDays: String(settings.paymentGracePeriodDays),
        memberMaxPaymentRetries: String(settings.maxPaymentRetries),
        memberSuspensionWarningDays: String(settings.suspensionWarningDays),
        memberRequireWaiverSigning: String(settings.requireWaiverSigning),
        memberWaiverExpiryMonths: String(settings.waiverExpiryMonths),
        memberCovidDeclarationRequired: String(settings.covidDeclarationRequired),
        memberCodeOfConductRequired: String(settings.memberCodeOfConductRequired)
      }

      await api.put('/settings/gym', payload)
      setOriginalSettings(settings)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Failed to save member settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'registration' as TabType, label: 'Registration', icon: FiUserCheck },
    { id: 'checkin' as TabType, label: 'Check-in & Access', icon: FiClock },
    { id: 'booking' as TabType, label: 'Booking & Classes', icon: FiActivity },
    { id: 'account' as TabType, label: 'Account & Rewards', icon: FiGift },
    { id: 'communication' as TabType, label: 'Communication', icon: FiUsers },
    { id: 'compliance' as TabType, label: 'Compliance', icon: FiShield }
  ]

  if (loading) {
    return <div className="settings-loading">Loading member rules...</div>
  }

  return (
    <div className="settings-section" style={{ "--section-accent": "#8b5cf6" } as React.CSSProperties}>
      <div className="settings-section-header">
        <div className="settings-section-title">
          <FiUsers className="section-icon" />
          <div>
            <h2>Member Rules</h2>
            <p>Configure member registration, access control, booking policies, and compliance requirements</p>
          </div>
        </div>
        {hasChanges() && (
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === 'registration' && (
          <div className="settings-grid">
            <div className="setting-group">
              <h3>Verification Requirements</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Phone Verification</label>
                  <span className="setting-description">Require phone number verification via OTP</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requirePhoneVerification}
                    onChange={e => handleChange('requirePhoneVerification', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Email Verification</label>
                  <span className="setting-description">Require email address verification</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={e => handleChange('requireEmailVerification', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Emergency Contact</label>
                  <span className="setting-description">Require emergency contact information</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requireEmergencyContact}
                    onChange={e => handleChange('requireEmergencyContact', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Health Declaration</label>
                  <span className="setting-description">Require health declaration form during registration</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requireHealthDeclaration}
                    onChange={e => handleChange('requireHealthDeclaration', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Photo ID</label>
                  <span className="setting-description">Require government-issued photo ID upload</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requirePhotoId}
                    onChange={e => handleChange('requirePhotoId', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-group">
              <h3>Age Restrictions</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Minimum Age</label>
                  <input
                    type="number"
                    value={settings.minAge}
                    onChange={e => handleChange('minAge', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Age</label>
                  <input
                    type="number"
                    value={settings.maxAge}
                    onChange={e => handleChange('maxAge', parseInt(e.target.value) || 0)}
                    min="0"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className="setting-group">
              <h3>Onboarding</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Allow Guest Registration</label>
                  <span className="setting-description">Allow non-members to register online without staff assistance</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowGuestRegistration}
                    onChange={e => handleChange('allowGuestRegistration', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group">
                <label>Trial Period (Days)</label>
                <input
                  type="number"
                  value={settings.trialPeriodDays}
                  onChange={e => handleChange('trialPeriodDays', parseInt(e.target.value) || 0)}
                  min="0"
                  max="30"
                />
                <span className="input-hint">Number of free trial days for new members (0 to disable)</span>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Welcome Email</label>
                  <span className="setting-description">Send welcome email with gym information upon registration</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.welcomeEmailEnabled}
                    onChange={e => handleChange('welcomeEmailEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Orientation Required</label>
                  <span className="setting-description">New members must complete gym orientation before full access</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.orientationRequired}
                    onChange={e => handleChange('orientationRequired', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="settings-grid">
            <div className="setting-group">
              <h3>Check-in Method</h3>
              <div className="form-group">
                <label>Primary Check-in Method</label>
                <select
                  value={settings.checkInMethod}
                  onChange={e => handleChange('checkInMethod', e.target.value)}
                >
                  <option value="qr_code">QR Code Scan</option>
                  <option value="fingerprint">Fingerprint Scanner</option>
                  <option value="card">Access Card / Key Fob</option>
                  <option value="pin">PIN Code</option>
                  <option value="face">Face Recognition</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <h3>Check-in Controls</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Allow Multiple Check-ins</label>
                  <span className="setting-description">Allow members to check in multiple times per day</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowMultipleCheckInsPerDay}
                    onChange={e => handleChange('allowMultipleCheckInsPerDay', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.allowMultipleCheckInsPerDay && (
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label>Max Check-ins Per Day</label>
                    <input
                      type="number"
                      value={settings.maxCheckInsPerDay}
                      onChange={e => handleChange('maxCheckInsPerDay', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cooldown Between Check-ins (Minutes)</label>
                    <input
                      type="number"
                      value={settings.checkInCooldownMinutes}
                      onChange={e => handleChange('checkInCooldownMinutes', parseInt(e.target.value) || 0)}
                      min="0"
                      max="480"
                    />
                  </div>
                </div>
              )}
              <div className="setting-row">
                <div className="setting-info">
                  <label>Require Check-out</label>
                  <span className="setting-description">Members must check out when leaving the gym</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requireCheckOut}
                    onChange={e => handleChange('requireCheckOut', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group">
                <label>Auto Check-out After (Hours)</label>
                <input
                  type="number"
                  value={settings.autoCheckOutHours}
                  onChange={e => handleChange('autoCheckOutHours', parseInt(e.target.value) || 1)}
                  min="1"
                  max="24"
                />
                <span className="input-hint">Automatically check out members after this duration</span>
              </div>
            </div>

            <div className="setting-group">
              <h3>Guest Access</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Allow Guest Check-in</label>
                  <span className="setting-description">Members can bring guests to the gym</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowGuestCheckIn}
                    onChange={e => handleChange('allowGuestCheckIn', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.allowGuestCheckIn && (
                <div className="form-group">
                  <label>Guest Limit Per Visit</label>
                  <input
                    type="number"
                    value={settings.guestCheckInLimit}
                    onChange={e => handleChange('guestCheckInLimit', parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                </div>
              )}
            </div>

            <div className="setting-group">
              <h3>Peak Hour Restrictions</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Enable Peak Hour Restrictions</label>
                  <span className="setting-description">Limit certain membership tiers during peak hours</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.peakHourRestrictions}
                    onChange={e => handleChange('peakHourRestrictions', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.peakHourRestrictions && (
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label>Peak Hour Start</label>
                    <input
                      type="time"
                      value={settings.peakHourStart}
                      onChange={e => handleChange('peakHourStart', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Peak Hour End</label>
                    <input
                      type="time"
                      value={settings.peakHourEnd}
                      onChange={e => handleChange('peakHourEnd', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="settings-grid">
            <div className="setting-group">
              <h3>Booking Limits</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Max Active Bookings</label>
                  <input
                    type="number"
                    value={settings.maxActiveBookings}
                    onChange={e => handleChange('maxActiveBookings', parseInt(e.target.value) || 1)}
                    min="1"
                    max="20"
                  />
                  <span className="input-hint">Maximum upcoming class bookings per member</span>
                </div>
                <div className="form-group">
                  <label>Booking Window (Days)</label>
                  <input
                    type="number"
                    value={settings.bookingWindowDays}
                    onChange={e => handleChange('bookingWindowDays', parseInt(e.target.value) || 1)}
                    min="1"
                    max="60"
                  />
                  <span className="input-hint">How far in advance members can book</span>
                </div>
              </div>
              <div className="form-group">
                <label>Cancellation Window (Hours)</label>
                <input
                  type="number"
                  value={settings.cancellationWindowHours}
                  onChange={e => handleChange('cancellationWindowHours', parseInt(e.target.value) || 0)}
                  min="0"
                  max="72"
                />
                <span className="input-hint">Minimum hours before class to cancel without penalty</span>
              </div>
            </div>

            <div className="setting-group">
              <h3>No-Show Policy</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Enable No-Show Penalty</label>
                  <span className="setting-description">Charge penalty for missed class bookings</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.noShowPenaltyEnabled}
                    onChange={e => handleChange('noShowPenaltyEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.noShowPenaltyEnabled && (
                <>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>No-Show Penalty Amount (₹)</label>
                      <input
                        type="number"
                        value={settings.noShowPenaltyAmount}
                        onChange={e => handleChange('noShowPenaltyAmount', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Max No-Shows Per Month</label>
                      <input
                        type="number"
                        value={settings.maxNoShowsPerMonth}
                        onChange={e => handleChange('maxNoShowsPerMonth', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Suspension Duration (Days)</label>
                    <input
                      type="number"
                      value={settings.noShowSuspensionDays}
                      onChange={e => handleChange('noShowSuspensionDays', parseInt(e.target.value) || 0)}
                      min="0"
                      max="30"
                    />
                    <span className="input-hint">Booking suspension after exceeding max no-shows (0 to disable)</span>
                  </div>
                </>
              )}
            </div>

            <div className="setting-group">
              <h3>Waitlist</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Enable Waitlist</label>
                  <span className="setting-description">Allow members to join waitlist for full classes</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.waitlistEnabled}
                    onChange={e => handleChange('waitlistEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.waitlistEnabled && (
                <>
                  <div className="setting-row">
                    <div className="setting-info">
                      <label>Auto-Enroll from Waitlist</label>
                      <span className="setting-description">Automatically enroll when spot opens</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.waitlistAutoEnroll}
                        onChange={e => handleChange('waitlistAutoEnroll', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Max Waitlist Per Class</label>
                    <input
                      type="number"
                      value={settings.maxWaitlistPerClass}
                      onChange={e => handleChange('maxWaitlistPerClass', parseInt(e.target.value) || 1)}
                      min="1"
                      max="50"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="settings-grid">
            <div className="setting-group">
              <h3>Family Membership</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Max Family Members</label>
                  <input
                    type="number"
                    value={settings.maxFamilyMembers}
                    onChange={e => handleChange('maxFamilyMembers', parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                  <span className="input-hint">Maximum members per family account</span>
                </div>
                <div className="form-group">
                  <label>Family Discount (%)</label>
                  <input
                    type="number"
                    value={settings.familyDiscountPercent}
                    onChange={e => handleChange('familyDiscountPercent', parseInt(e.target.value) || 0)}
                    min="0"
                    max="50"
                  />
                  <span className="input-hint">Discount for additional family members</span>
                </div>
              </div>
            </div>

            <div className="setting-group">
              <h3>Referral Program</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Enable Referral Bonus</label>
                  <span className="setting-description">Reward members for successful referrals</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.referralBonusEnabled}
                    onChange={e => handleChange('referralBonusEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.referralBonusEnabled && (
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label>Referral Bonus Amount (₹)</label>
                    <input
                      type="number"
                      value={settings.referralBonusAmount}
                      onChange={e => handleChange('referralBonusAmount', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bonus Type</label>
                    <select
                      value={settings.referralBonusType}
                      onChange={e => handleChange('referralBonusType', e.target.value)}
                    >
                      <option value="credit">Account Credit</option>
                      <option value="discount">Membership Discount</option>
                      <option value="cash">Cash Payout</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="setting-group">
              <h3>Loyalty Points Program</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Enable Loyalty Points</label>
                  <span className="setting-description">Members earn points for activities</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.loyaltyPointsEnabled}
                    onChange={e => handleChange('loyaltyPointsEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.loyaltyPointsEnabled && (
                <>
                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label>Points Per Visit</label>
                      <input
                        type="number"
                        value={settings.pointsPerVisit}
                        onChange={e => handleChange('pointsPerVisit', parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Points Per Referral</label>
                      <input
                        type="number"
                        value={settings.pointsPerReferral}
                        onChange={e => handleChange('pointsPerReferral', parseInt(e.target.value) || 0)}
                        min="0"
                        max="1000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Redemption Rate (₹/Point)</label>
                      <input
                        type="number"
                        value={settings.pointsRedemptionRate}
                        onChange={e => handleChange('pointsRedemptionRate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  <span className="input-hint">Points can be redeemed for discounts or free services</span>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="settings-grid">
            <div className="setting-group">
              <h3>Notification Channels</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>SMS Notifications</label>
                  <span className="setting-description">Allow members to receive SMS notifications</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowSmsNotifications}
                    onChange={e => handleChange('allowSmsNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Email Notifications</label>
                  <span className="setting-description">Allow members to receive email notifications</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowEmailNotifications}
                    onChange={e => handleChange('allowEmailNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Push Notifications</label>
                  <span className="setting-description">Allow members to receive push notifications (mobile app)</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowPushNotifications}
                    onChange={e => handleChange('allowPushNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-group">
              <h3>Marketing & Engagement</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Marketing Opt-in Default</label>
                  <span className="setting-description">Default marketing preference for new members</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.marketingOptInDefault}
                    onChange={e => handleChange('marketingOptInDefault', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Birthday Greetings</label>
                  <span className="setting-description">Send automated birthday wishes to members</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.birthdayGreetingsEnabled}
                    onChange={e => handleChange('birthdayGreetingsEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-group">
              <h3>Inactivity Alerts</h3>
              <div className="form-group">
                <label>Inactivity Alert After (Days)</label>
                <input
                  type="number"
                  value={settings.inactivityAlertDays}
                  onChange={e => handleChange('inactivityAlertDays', parseInt(e.target.value) || 1)}
                  min="1"
                  max="90"
                />
                <span className="input-hint">Send alert to members after this many days of inactivity</span>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Inactivity Follow-up</label>
                  <span className="setting-description">Send follow-up communications for inactive members</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.inactivityFollowUpEnabled}
                    onChange={e => handleChange('inactivityFollowUpEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="settings-grid">
            <div className="setting-group">
              <h3>Payment & Suspension</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Auto-Suspend on Payment Failure</label>
                  <span className="setting-description">Automatically suspend membership when payment fails</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoSuspendOnPaymentFailure}
                    onChange={e => handleChange('autoSuspendOnPaymentFailure', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.autoSuspendOnPaymentFailure && (
                <div className="form-grid form-grid-3">
                  <div className="form-group">
                    <label>Grace Period (Days)</label>
                    <input
                      type="number"
                      value={settings.paymentGracePeriodDays}
                      onChange={e => handleChange('paymentGracePeriodDays', parseInt(e.target.value) || 0)}
                      min="0"
                      max="30"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Payment Retries</label>
                    <input
                      type="number"
                      value={settings.maxPaymentRetries}
                      onChange={e => handleChange('maxPaymentRetries', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Suspension Warning (Days)</label>
                    <input
                      type="number"
                      value={settings.suspensionWarningDays}
                      onChange={e => handleChange('suspensionWarningDays', parseInt(e.target.value) || 1)}
                      min="1"
                      max="14"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="setting-group">
              <h3>Legal & Waivers</h3>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Require Waiver Signing</label>
                  <span className="setting-description">Members must sign liability waiver</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requireWaiverSigning}
                    onChange={e => handleChange('requireWaiverSigning', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.requireWaiverSigning && (
                <div className="form-group">
                  <label>Waiver Expiry (Months)</label>
                  <input
                    type="number"
                    value={settings.waiverExpiryMonths}
                    onChange={e => handleChange('waiverExpiryMonths', parseInt(e.target.value) || 0)}
                    min="0"
                    max="60"
                  />
                  <span className="input-hint">Months until waiver needs to be re-signed (0 for never)</span>
                </div>
              )}
              <div className="setting-row">
                <div className="setting-info">
                  <label>COVID Declaration Required</label>
                  <span className="setting-description">Require COVID health declaration before check-in</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.covidDeclarationRequired}
                    onChange={e => handleChange('covidDeclarationRequired', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <label>Code of Conduct Required</label>
                  <span className="setting-description">Members must agree to code of conduct</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.memberCodeOfConductRequired}
                    onChange={e => handleChange('memberCodeOfConductRequired', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <FiAlertCircle className="confirm-icon" />
              <h3>Confirm Changes</h3>
            </div>
            <div className="confirm-dialog-body">
              <p>You are about to save the following changes to member rules:</p>
              <div className="changes-list">
                <div className="changes-summary">
                  {getChanges().length} setting{getChanges().length !== 1 ? 's' : ''} will be modified
                </div>
                {getChanges().map((change, index) => (
                  <div key={index} className="change-item">
                    <span className="change-field">{change.field}</span>
                    <div className="change-values">
                      <span className="old-value">{change.oldValue}</span>
                      <span className="arrow">→</span>
                      <span className="new-value">{change.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="confirm-dialog-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirmDialog(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={confirmSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberRulesSection
