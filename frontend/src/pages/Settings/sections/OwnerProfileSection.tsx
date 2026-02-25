"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "../../../contexts/AuthContext"
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
  const { updateUser } = useAuth()
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

        // Try loading from dedicated owner-profile endpoint
        try {
          const response = await api.get('/settings/gym/owner-profile')
          if (response.data) {
            const s = response.data
            loaded.legalName = s.ownerName || ""
            loaded.gymName = s.gymName || ""
            loaded.email = s.email || ""
            loaded.phone = s.phone || ""
            loaded.address = s.address || ""
            loaded.city = s.city || ""
            loaded.state = s.state || ""
            loaded.zipCode = s.zipCode || ""
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
          }
        }

        // Always try to load gym name from localStorage as fallback
        // This ensures the gym name is populated even if backend doesn't have it
        const gymData = localStorage.getItem("activeGym")
        if (gymData && !loaded.gymName) {
          const gym = JSON.parse(gymData)
          loaded.gymName = gym.name || loaded.gymName
          loaded.address = loaded.address || gym.address || ""
          loaded.city = loaded.city || gym.city || ""
          loaded.state = loaded.state || gym.state || ""
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
        if (value && value.trim() !== '') {
          // Remove all non-digit characters for validation
          const digitsOnly = value.replace(/\D/g, '')
          // Indian phone: 10 digits, or +91 followed by 10 digits (total 12 digits)
          if (digitsOnly.length !== 10 && !(digitsOnly.length === 12 && digitsOnly.startsWith('91'))) {
            return "Phone must be 10 digits (or +91 prefix)"
          }
          // Check if starts with valid digit (6-9 for Indian mobiles)
          const mainNumber = digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly
          if (!/^[6-9]/.test(mainNumber)) {
            return "Phone must start with 6-9"
          }
        }
        break
    }
    return ""
  }

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')
    
    if (digits.length === 0) return ''
    
    // Handle +91 prefix
    if (digits.startsWith('91') && digits.length > 2) {
      const mainNumber = digits.slice(2)
      if (mainNumber.length <= 5) {
        return `+91 ${mainNumber}`
      } else if (mainNumber.length <= 10) {
        return `+91 ${mainNumber.slice(0, 5)} ${mainNumber.slice(5)}`
      } else {
        return `+91 ${mainNumber.slice(0, 5)} ${mainNumber.slice(5, 10)}`
      }
    }
    
    // Handle 10-digit Indian numbers
    if (digits.length <= 5) {
      return digits
    } else if (digits.length <= 10) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`
    } else {
      return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`
    }
  }

  const handleInputChange = (field: keyof OwnerProfile, value: string) => {
    let formattedValue = value
    
    // Apply phone formatting for phone field
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value)
    }
    
    setProfile(prev => ({ ...prev, [field]: formattedValue }))
    const error = validateField(field, formattedValue)
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

    // Debug: Log profile data before sending
    console.log("Profile data before save:", {
      gymName: profile.gymName,
      gymNameLength: profile.gymName?.length,
      gymNameTrimmed: profile.gymName?.trim(),
      isGymNameEmpty: !profile.gymName || profile.gymName.trim().length === 0
    })

    setIsSaving(true)
    try {
        // Prepare data for backend
        const requestData = {
          ownerName: profile.legalName,
          gymName: profile.gymName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
          taxId: profile.taxId,
          businessType: profile.businessType,
          // Add gym-specific fields that backend expects
          gymPhone: profile.phone, // Backend expects gymPhone for gym phone
          gymEmail: profile.email, // Backend expects gymEmail for gym email
        }
        
        // Debug: Log the request data
        console.log("Sending profile update request:", JSON.stringify(requestData, null, 2))
        
        // Save to backend via owner-profile endpoint
        await api.put('/settings/gym/owner-profile', requestData)

      // Update auth context so sidebar and all components reflect changes immediately
      updateUser({
        fullName: profile.legalName,
        email: profile.email,
        phone: profile.phone,
      })

        const gymData = localStorage.getItem("activeGym")
        if (gymData) {
          const gym = JSON.parse(gymData)
          gym.name = profile.gymName
          gym.address = profile.address
          gym.city = profile.city
          gym.state = profile.state
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
      
    } catch (err: any) {
      console.error("Failed to save profile:", err)
      
      // Enhanced error logging for debugging
      if (err.response) {
        console.error("Error response:", err.response)
        console.error("Error status:", err.response.status)
        console.error("Error data:", err.response.data)
        console.error("Error headers:", err.response.headers)
        
        // Show more specific error message
        const errorMessage = err.response.data?.message || 
                           err.response.data?.error || 
                           `Server error: ${err.response.status} ${err.response.statusText}`
        toast.error(`Failed to update profile: ${errorMessage}`)
      } else if (err.request) {
        console.error("Error request:", err.request)
        toast.error("Failed to update profile: No response from server")
      } else {
        console.error("Error message:", err.message)
        toast.error(`Failed to update profile: ${err.message}`)
      }
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
    <div className="settings-section settings-section--blue">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
            <div className="settings-section__icon settings-section__icon--blue">
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
            <div className="form-group__header">
              <Mail size={16} />
              <h4 className="form-group__title">Communication</h4>
            </div>
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
                placeholder="98765 43210 or +91 98765 43210"
                maxLength={16}
              />
              {errors.phone && (
                <div className="field-error">
                  <AlertCircle size={12} />
                  {errors.phone}
                </div>
              )}
              {!errors.phone && profile.phone && (
                <div className="field-hint">
                  <Check size={12} />
                  Valid phone number
                </div>
              )}
            </div>
          </div>
        </div>

          <div className="form-group">
            <div className="form-group__header">
              <MapPin size={16} />
              <h4 className="form-group__title">Business Address</h4>
            </div>
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
