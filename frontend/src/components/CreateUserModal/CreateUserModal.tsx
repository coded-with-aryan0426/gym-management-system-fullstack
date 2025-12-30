"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import api, { membershipPackageApi } from "../../services/api"
import type { MembershipPackageDTO } from "../../types/membershipPackage"
import { Button } from "../ui"
import "./CreateUserModal.css"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialRole?: "CUSTOMER" | "TRAINER" | "STAFF"
}

type ModalStep = "CATEGORY" | "ROLE" | "FORM" | "SCHEDULE_PLACEHOLDER"

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess, initialRole }) => {
  const [loading, setLoading] = useState(false)
  const [fetchingPlans, setFetchingPlans] = useState(false)
  const [step, setStep] = useState<ModalStep>("CATEGORY")
  const [role, setRole] = useState<"CUSTOMER" | "TRAINER" | "STAFF" | null>(null)
  const [availablePlans, setAvailablePlans] = useState<MembershipPackageDTO[]>([])

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    packageId: "",
    duration: "1", // 1, 3, 6, or 12 months
    startDate: new Date().toISOString().split('T')[0],
  })

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setRole(initialRole)
        setStep("FORM")
      } else {
        setRole(null)
        setStep("CATEGORY")
      }
      setFormData({
        username: "",
        password: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        packageId: "",
        duration: "1",
        startDate: new Date().toISOString().split('T')[0],
      })
    }
  }, [isOpen, initialRole])

  // Fetch plans when role is set to CUSTOMER
  useEffect(() => {
    if (role === "CUSTOMER") {
      setFetchingPlans(true)
      membershipPackageApi.getPackages(true)
        .then(plans => setAvailablePlans(plans))
        .catch(err => {
          console.error("Failed to fetch plans", err)
          setAvailablePlans([
            { packageId: 1, packageName: "Gold Plan", price: 99, durationDays: 30, includedPTSessions: 4, isActive: true },
            { packageId: 2, packageName: "Silver Plan", price: 49, durationDays: 30, includedPTSessions: 2, isActive: true },
            { packageId: 3, packageName: "Platinum Plan", price: 149, durationDays: 30, includedPTSessions: 8, isActive: true }
          ])
        })
        .finally(() => setFetchingPlans(false))
    }
  }, [role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Phone number: only allow digits and limit to 10
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Validation helpers
  const isValidFullName = (name: string) => name.trim().length >= 2
  const isValidPhone = (phone: string) => phone.length === 10

  // Comprehensive email validation:
  // - Local part: letters, numbers, dots, hyphens, underscores (no consecutive dots, no start/end with dot)
  // - Domain: letters, numbers, hyphens (no start/end with hyphen)
  // - TLD: 2-6 letters only (com, org, co.in, etc.)
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,6})+$/
    return emailRegex.test(email)
  }
  const isValidPassword = (password: string) => password.length >= 6

  // Validation Icon Component
  const ValidationIcon = ({ isValid, show }: { isValid: boolean; show: boolean }) => {
    if (!show) return null
    return isValid ? (
      <span className="validation-icon validation-icon--valid" title="Valid">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    ) : (
      <span className="validation-icon validation-icon--invalid" title="Invalid">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    )
  }

  const handleCategorySelect = (category: "USER" | "SCHEDULE") => {
    if (category === "USER") {
      setStep("ROLE")
    } else {
      setStep("SCHEDULE_PLACEHOLDER")
    }
  }

  const handleRoleSelect = (selectedRole: "CUSTOMER" | "TRAINER") => {
    setRole(selectedRole)
    setStep("FORM")
  }

  const handleBack = () => {
    if (step === "FORM") {
      // If user entered via initialRole (e.g., Add Member button), close modal instead of showing internal steps
      if (initialRole) {
        onClose()
        return
      }
      setStep("ROLE")
    } else if (step === "ROLE") {
      setStep("CATEGORY")
    } else if (step === "SCHEDULE_PLACEHOLDER") {
      setStep("CATEGORY")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role) return

    // V1 Pivot: Auto-generate credentials for Members
    let effectiveFormData = { ...formData };
    if (role === "CUSTOMER") {
      // Validate phone: exactly 10 digits
      if (!effectiveFormData.phoneNumber || effectiveFormData.phoneNumber.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }
      // Validate email: mandatory
      if (!effectiveFormData.email) {
        toast.error("Email is required");
        return;
      }
      // Use Phone as Username and Password (or some default)
      effectiveFormData.username = effectiveFormData.phoneNumber;
      effectiveFormData.password = "12345678"; // Default password since they don't login
    } else {
      // Staff validation
      // Auto-set username to email if not provided (since there's no username field for staff)
      if (!effectiveFormData.username && effectiveFormData.email) {
        effectiveFormData.username = effectiveFormData.email;
      }

      if (!effectiveFormData.username || !effectiveFormData.password || !effectiveFormData.email) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    if (!effectiveFormData.fullName) {
      toast.error("Full Name is required")
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        ...effectiveFormData,
        roles: [{ roleId: 0, roleName: role }],
      }

      // Add customer-specific fields
      if (role === "CUSTOMER") {
        payload.startDate = effectiveFormData.startDate;
        payload.duration = parseInt(effectiveFormData.duration);
      }

      if (role === "CUSTOMER" && formData.packageId) {
        payload.packageId = parseInt(formData.packageId)
      }

      await api.createUser(payload as any)
      toast.success(`${role === "CUSTOMER" ? "Member" : "Trainer"} created successfully`)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Failed to create user:", err)
      toast.error(err.response?.data?.message || "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getTitle = () => {
    switch (step) {
      case "CATEGORY": return "Create New..."
      case "ROLE": return "Select User Type"
      case "FORM": return `Add New ${role === "CUSTOMER" ? "Member" : "Trainer"}`
      case "SCHEDULE_PLACEHOLDER": return "Schedule Event"
    }
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="create-user-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`create-user-modal ${step !== "FORM" ? "create-user-modal--selection" : ""}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="create-user-modal__header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                {getTitle()}
              </h2>
              <button className="create-user-modal__close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {step === "CATEGORY" && (
              <div className="create-user-modal__selection">
                <div className="selection-grid">
                  <div className="selection-card" onClick={() => handleCategorySelect("USER")}>
                    <div className="selection-card__icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="selection-card__label">New User</span>
                    <span className="selection-card__desc">Create a member or trainer account</span>
                  </div>
                  <div className="selection-card" onClick={() => handleCategorySelect("SCHEDULE")}>
                    <div className="selection-card__icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <span className="selection-card__label">New Event</span>
                    <span className="selection-card__desc">Schedule a class or PT session</span>
                  </div>
                </div>
              </div>
            )}

            {step === "ROLE" && (
              <div className="create-user-modal__selection">
                <div className="selection-grid">
                  <div className="selection-card" onClick={() => handleRoleSelect("CUSTOMER")}>
                    <div className="selection-card__icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="selection-card__label">New Member</span>
                    <span className="selection-card__desc">Add a gym member</span>
                  </div>
                  <div className="selection-card" onClick={() => handleRoleSelect("TRAINER")}>
                    <div className="selection-card__icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </div>
                    <span className="selection-card__label">New Trainer</span>
                    <span className="selection-card__desc">Add a new trainer</span>
                  </div>
                </div>
              </div>
            )}

            {step === "SCHEDULE_PLACEHOLDER" && (
              <div className="create-user-modal__body">
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: "1rem" }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>Event scheduling coming soon!</p>
                </div>
              </div>
            )}

            {step === "FORM" && (
              <form className="create-user-modal__body" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <div className="input-with-validation">
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" placeholder="John Doe" required />
                      <ValidationIcon show={formData.fullName.length > 0} isValid={isValidFullName(formData.fullName)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone Number * (10 digits)</label>
                    <div className="input-with-validation">
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="9876543210"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        required
                      />
                      <ValidationIcon show={formData.phoneNumber.length > 0} isValid={isValidPhone(formData.phoneNumber)} />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <div className="input-with-validation">
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="john@example.com" required />
                      <ValidationIcon show={formData.email.length > 0} isValid={isValidEmail(formData.email)} />
                    </div>
                  </div>

                  {/* Start Date beside Email for Members */}
                  {role === "CUSTOMER" && (
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="form-input" />
                    </div>
                  )}

                  {/* V1: Staff/Trainer still needs credentials */}
                  {role !== "CUSTOMER" && (
                    <div className="form-group">
                      <label>Password * (min 6 chars)</label>
                      <div className="input-with-validation">
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="••••••••" required />
                        <ValidationIcon show={formData.password.length > 0} isValid={isValidPassword(formData.password)} />
                      </div>
                    </div>
                  )}
                </div>

                {role === "CUSTOMER" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Membership Plan *</label>
                      <select name="packageId" value={formData.packageId} onChange={handleChange} className="form-input" disabled={fetchingPlans} required>
                        <option value="">Select a plan</option>
                        {/* Remove duplicates by filtering unique plan names */}
                        {availablePlans
                          .filter((plan, index, self) =>
                            index === self.findIndex(p => p.packageName === plan.packageName)
                          )
                          .map(plan => (
                            <option key={plan.packageId} value={plan.packageId}>{plan.packageName} - ₹{plan.price}</option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Duration *</label>
                      <select name="duration" value={formData.duration} onChange={handleChange} className="form-input" required>
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Payment Status and Address removed as per requirements */}
              </form>
            )}

            <div className="create-user-modal__footer">
              <div>
                {step !== "CATEGORY" && (
                  <Button variant="secondary" onClick={handleBack} disabled={loading}>Back</Button>
                )}
              </div>
              <div className="button-group">
                <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                {step === "FORM" && (
                  <Button onClick={handleSubmit} disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default CreateUserModal
