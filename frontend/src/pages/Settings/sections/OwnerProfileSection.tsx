"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { 
  Info, 
  Save, 
  X, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  AlertCircle,
  Check
} from "lucide-react"
import api from "../../../services/api"

interface OwnerProfile {
  legalName: string
  gymName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  taxId: string
  businessType: string
}

interface ValidationErrors {
  [key: string]: string
}

const OwnerProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<OwnerProfile>({
    legalName: "",
    gymName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    taxId: "",
    businessType: "sole_proprietor",
  })
  const [originalProfile, setOriginalProfile] = useState<OwnerProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      let loaded: OwnerProfile = {
        legalName: "",
        gymName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        taxId: "",
        businessType: "sole_proprietor",
      }

      // Try loading from backend first
      try {
        const response = await api.get('/settings')
        if (response.data) {
          const s = response.data
          loaded.legalName = s.ownerLegalName || ""
          loaded.gymName = s.gymName || ""
          loaded.email = s.ownerEmail || ""
          loaded.phone = s.ownerPhone || ""
          loaded.address = s.gymAddress || ""
          loaded.city = s.gymCity || ""
          loaded.state = s.gymState || ""
          loaded.zipCode = s.gymZipCode || ""
          loaded.taxId = s.taxId || ""
          loaded.businessType = s.businessType || "sole_proprietor"
        }
      } catch {
        // Fallback to localStorage if backend unavailable
        const userData = localStorage.getItem("user")
        const gymData = localStorage.getItem("activeGym")

        if (userData) {
          const user = JSON.parse(userData)
          loaded.legalName = user.fullName || ""
          loaded.email = user.email || ""
          loaded.phone = user.phone || ""
        }

        if (gymData) {
          const gym = JSON.parse(gymData)
          loaded.gymName = gym.name || ""
          loaded.address = gym.address || ""
          loaded.city = gym.city || ""
          loaded.state = gym.state || ""
          loaded.zipCode = gym.zipCode || ""
          loaded.taxId = gym.taxId || ""
          loaded.businessType = gym.businessType || "sole_proprietor"
        }
      }

      setProfile(loaded)
      setOriginalProfile(loaded)
    } catch (err) {
      console.error("Failed to load profile:", err)
      toast.error("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'legalName':
        if (!value.trim()) return "Legal name is required"
        if (value.length < 2) return "Name must be at least 2 characters"
        break
      case 'gymName':
        if (!value.trim()) return "Gym name is required"
        break
      case 'email':
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Invalid email format"
        break
      case 'phone':
        if (value && !/^[\d\s+\-()]{10,}$/.test(value.replace(/\s/g, ''))) {
          return "Invalid phone number"
        }
        break
    }
    return ""
  }

  const handleInputChange = (field: keyof OwnerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const hasChanges = () => {
    if (!originalProfile) return false
    return JSON.stringify(profile) !== JSON.stringify(originalProfile)
  }

  const isValid = () => {
    const requiredFields: (keyof OwnerProfile)[] = ['legalName', 'gymName', 'email']
    for (const field of requiredFields) {
      const error = validateField(field, profile[field])
      if (error) return false
    }
    return true
  }

  const handleSave = async () => {
    const newErrors: ValidationErrors = {}
    const requiredFields: (keyof OwnerProfile)[] = ['legalName', 'gymName', 'email']
    
    for (const field of requiredFields) {
      const error = validateField(field, profile[field])
      if (error) newErrors[field] = error
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the validation errors")
      return
    }

    setIsSaving(true)
    try {
      // Save to backend
      await api.put('/settings', {
        ownerLegalName: profile.legalName,
        gymName: profile.gymName,
        ownerEmail: profile.email,
        ownerPhone: profile.phone,
        gymAddress: profile.address,
        gymCity: profile.city,
        gymState: profile.state,
        gymZipCode: profile.zipCode,
        taxId: profile.taxId,
        businessType: profile.businessType,
      })

      // Also update localStorage for other components that read from it
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        user.fullName = profile.legalName
        user.email = profile.email
        user.phone = profile.phone
        localStorage.setItem("user", JSON.stringify(user))
      }

      const gymData = localStorage.getItem("activeGym")
      if (gymData) {
        const gym = JSON.parse(gymData)
        gym.name = profile.gymName
        gym.address = profile.address
        gym.city = profile.city
        gym.state = profile.state
        gym.zipCode = profile.zipCode
        gym.taxId = profile.taxId
        gym.businessType = profile.businessType
        localStorage.setItem("activeGym", JSON.stringify(gym))
      }

      setOriginalProfile({ ...profile })
      toast.success("Profile updated successfully")
      
      const auditLog = JSON.parse(localStorage.getItem("auditLog") || "[]")
      auditLog.unshift({
        id: Date.now().toString(),
        action: "Profile Updated",
        target: profile.gymName,
        user: profile.legalName,
        role: "Owner",
        timestamp: new Date().toLocaleString(),
        details: "Owner profile information updated"
      })
      localStorage.setItem("auditLog", JSON.stringify(auditLog.slice(0, 100)))
      
    } catch (err) {
      console.error("Failed to save profile:", err)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile })
      setErrors({})
    }
  }

  if (isLoading) {
    return (
      <div className="settings-section">
        <div className="settings-section__loading">
          <div className="settings-section__loading-spinner" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon">
            <User size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">Owner Profile</h2>
            <p className="settings-section__description">
              Legal identity for billing, data ownership, and accountability
            </p>
          </div>
        </div>
        <div className="settings-section__actions">
          {hasChanges() && (
            <>
              <div className="unsaved-indicator">
                <span className="unsaved-indicator__dot" />
                Unsaved changes
              </div>
              <button
                className="settings-section__cancel-btn"
                onClick={handleCancel}
              >
                <X size={14} />
                Cancel
              </button>
              <button
                className="settings-save-btn"
                onClick={handleSave}
                disabled={isSaving || !isValid()}
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <User size={16} />
            <h4 className="form-group__title">Identity</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper">
              <label className="field-label">
                Legal Owner Name
                <span className="field-label__required">*</span>
                <div className="info-icon" data-tooltip="Name on legal documents and billing invoices">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="text"
                className={`dense-input ${errors.legalName ? 'dense-input--error' : ''}`}
                value={profile.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="John Doe"
              />
              {errors.legalName && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  {errors.legalName}
                </div>
              )}
            </div>

            <div className="field-wrapper">
              <label className="field-label">
                Business / Gym Name
                <span className="field-label__required">*</span>
                <div className="info-icon" data-tooltip="Displayed to members and on receipts">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="text"
                className={`dense-input ${errors.gymName ? 'dense-input--error' : ''}`}
                value={profile.gymName}
                onChange={(e) => handleInputChange('gymName', e.target.value)}
                placeholder="FitZone Gym"
              />
              {errors.gymName && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  {errors.gymName}
                </div>
              )}
            </div>

            <div className="field-wrapper">
              <label className="field-label">
                Business Type
                <div className="info-icon" data-tooltip="Legal structure of your business">
                  <Info size={14} />
                </div>
              </label>
              <select
                className="dense-input"
                value={profile.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
              >
                <option value="sole_proprietor">Sole Proprietor</option>
                <option value="partnership">Partnership</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="field-wrapper">
              <label className="field-label">
                Tax ID / GST Number
                <div className="info-icon" data-tooltip="For invoicing and tax compliance">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="text"
                className="dense-input"
                value={profile.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="GST/VAT Number"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <h4 className="form-group__title">
            <Mail size={14} className="form-group__title-icon" />
            Communication
          </h4>
          <div className="form-grid">
            <div className="field-wrapper">
              <label className="field-label">
                Primary Email
                <span className="field-label__required">*</span>
                <div className="info-icon" data-tooltip="Used for billing notifications and account recovery">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="email"
                className={`dense-input ${errors.email ? 'dense-input--error' : ''}`}
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="owner@gym.com"
              />
              {errors.email && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="field-wrapper">
              <label className="field-label">
                Recovery Phone
                <div className="info-icon" data-tooltip="Backup contact for critical account issues">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="tel"
                className={`dense-input ${errors.phone ? 'dense-input--error' : ''}`}
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  {errors.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <h4 className="form-group__title">
            <MapPin size={14} className="form-group__title-icon" />
            Business Address
          </h4>
          <div className="form-grid">
            <div className="field-wrapper field-wrapper--full">
              <label className="field-label">
                Street Address
                <div className="info-icon" data-tooltip="Physical location of your gym">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="text"
                className="dense-input"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Fitness Street"
              />
            </div>

            <div className="field-wrapper">
              <label className="field-label">City</label>
              <input
                type="text"
                className="dense-input"
                value={profile.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Mumbai"
              />
            </div>

            <div className="field-wrapper">
              <label className="field-label">State</label>
              <input
                type="text"
                className="dense-input"
                value={profile.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Maharashtra"
              />
            </div>

            <div className="field-wrapper">
              <label className="field-label">ZIP / Postal Code</label>
              <input
                type="text"
                className="dense-input"
                value={profile.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="400001"
              />
            </div>
          </div>
        </div>

        <div className="policy-note">
          <div className="policy-note__icon">
            <Info size={16} />
          </div>
          <span>
            <strong>Data Privacy:</strong> Your business information is encrypted and stored securely. 
            This data is used for billing, invoicing, and compliance purposes only.
          </span>
        </div>
      </div>
    </div>
  )
}

export default OwnerProfileSection
