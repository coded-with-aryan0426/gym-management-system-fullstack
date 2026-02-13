"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types/user"
import api from "../../services/api"
import { showToast } from "../../utils/toast"
import AvatarPicker from "../ui/AvatarPicker"
import { getAvatarUrl } from "../ui/Avatar"
import Editable from "../editor/Editable"
import "./TrainerActionModal.css"

// ============================================================================
// Types
// ============================================================================

type TabType = "profile" | "members" | "specializations" | "schedule" | "salary" | "attendance" | "performance" | "notes" | "message" | "delete"

interface TrainerDetailsDTO {
  userId?: number
  name?: string
  email?: string
  phone?: string
  role?: string
  employeeId?: string
  dob?: string
  gender?: string
  bloodType?: string
  address?: string
  altPhone?: string
  joiningDate?: string
  department?: string
  reportingTo?: string
  bio?: string
  instagram?: string
  linkedin?: string
  emergencyName?: string
  emergencyPhone?: string
  bankName?: string
  accountNo?: string
  ifsc?: string
  shift?: string
  experienceYears?: number
  specializations?: string[]
  certifications?: CertificationDTO[]
  availability?: AvailabilityDTO[]
  skills?: SkillDTO[]
  documents?: DocumentDTO[]
  stats?: {
    rating: number
    reviews: number
    activeMembers: number
    sessionsMonth?: number
    attendance?: number
    earnings?: number
  }
}

interface CertificationDTO {
  name: string
  issuer: string
  year: string
  valid: boolean
  expires: string
}

interface AvailabilityDTO {
  day: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface SkillDTO {
  name: string
  category: string
  level: string
  isPrimary: boolean
}

interface DocumentDTO {
  name: string
  type: string
  url: string
  verified: boolean
}

interface CompensationRule {
  id?: number
  perSessionRate: string
  perHourRate: string
  perClassRate: string
  perAttendeeRate: string
  commissionPercent: string
  effectiveFrom: string
  effectiveTo: string
  isActive: boolean
  createdAt?: string
}

interface AttendanceRecord {
  id: number
  checkInTime: string
  checkOutTime: string | null
  status: string
}

interface AttendanceSummary {
  totalDays: number
  presentDays: number
  absentDays: number
  attendancePercent: number
}

interface EnhancedTrainerActionModalProps {
  isOpen: boolean
  onClose: () => void
  trainer: User | null
  onEditProfile?: (trainer: User) => void
  onScheduleSession?: (trainer: User) => void
  onMessageTrainer?: (trainer: User) => void
  onDeleteTrainer?: (trainerId: number) => void
  onUpdate?: () => void
}

// ============================================================================
// Validation Icon Component
// ============================================================================

const ValidationIcon: React.FC<{ isValid: boolean | null }> = ({ isValid }) => {
  if (isValid === null) return null
  return (
    <span className={`validation-icon ${isValid ? 'validation-icon--valid' : 'validation-icon--invalid'}`}>
      {isValid ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </span>
  )
}

// ============================================================================
// Constants
// ============================================================================

const SPECIALIZATION_OPTIONS = [
  "Weight Training", "CrossFit", "Yoga", "Pilates", "HIIT",
  "Cardio", "Zumba", "Boxing", "Swimming", "Functional Training",
  "Rehabilitation", "Nutrition", "Calisthenics", "Martial Arts", "Dance Fitness"
]

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const DEFAULT_AVAILABILITY: AvailabilityDTO[] = DAYS_OF_WEEK.map(day => ({
  day,
  startTime: "06:00",
  endTime: "14:00",
  isAvailable: day !== "Sunday"
}))

// ============================================================================
// Main Component
// ============================================================================

const EnhancedTrainerActionModal: React.FC<EnhancedTrainerActionModalProps> = ({
  isOpen,
  onClose,
  trainer,
  onEditProfile,
  onDeleteTrainer,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [localTrainer, setLocalTrainer] = useState<User | null>(null)
  const [trainerDetails, setTrainerDetails] = useState<TrainerDetailsDTO | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Edit Profile Form
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "TRAINER",
    joinDate: "",
    leavingDate: "",
    status: "Active",
    avatarId: null as string | null,
    // Emergency contact
    emergencyName: "",
    emergencyPhone: "",
    // Contract details
    employeeId: "",
    department: "",
    shift: "",
    address: "",
    bio: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Specializations & Certifications
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [certifications, setCertifications] = useState<CertificationDTO[]>([])
  const [showAddCert, setShowAddCert] = useState(false)
  const [newCert, setNewCert] = useState<CertificationDTO>({ name: "", issuer: "", year: "", valid: true, expires: "" })

  // Schedule / Availability
  const [availability, setAvailability] = useState<AvailabilityDTO[]>(DEFAULT_AVAILABILITY)

  // Assigned Members
  const [assignedMembers, setAssignedMembers] = useState<User[]>([])
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [availableMembers, setAvailableMembers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Message Form
  const [messageForm, setMessageForm] = useState({ subject: "", body: "" })
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Delete
  const [isDeleting, setIsDeleting] = useState(false)

  // Avatar Picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // Salary & Compensation
  const [compensationRules, setCompensationRules] = useState<CompensationRule[]>([])
  const [showAddCompensation, setShowAddCompensation] = useState(false)
  const [newCompensation, setNewCompensation] = useState<Partial<CompensationRule>>({
    perSessionRate: "", perHourRate: "", commissionPercent: "", effectiveFrom: new Date().toISOString().split('T')[0],
  })
  const [compensationLoading, setCompensationLoading] = useState(false)

  // Attendance
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [attendanceDays, setAttendanceDays] = useState(30)
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  // Owner Notes
  const [ownerNotes, setOwnerNotes] = useState("")
  const [savedNotes, setSavedNotes] = useState("")

  // ============================================================================
  // Derived State & Validation
  // ============================================================================

  const validation = useMemo(() => ({
    fullName: editForm.fullName.length >= 2 ? true : editForm.fullName.length === 0 ? null : false,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email) ? true : editForm.email.length === 0 ? null : false,
    phone: editForm.phone.length >= 10 ? true : editForm.phone.length === 0 ? null : false,
  }), [editForm.fullName, editForm.email, editForm.phone])

  const isFormValid = validation.fullName === true && validation.email === true

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    if (isOpen && trainer) {
      setLocalTrainer(trainer)
      setActiveTab("profile")

      const savedAvatarId = localStorage.getItem(`avatar_${trainer.userId}`)

      setEditForm({
        fullName: trainer.fullName || "",
        email: trainer.email || "",
        phone: trainer.phoneNumber || (trainer as any).phone || "",
        role: trainer.roles?.[0]?.roleName || "TRAINER",
        joinDate: trainer.createdAt ? new Date(trainer.createdAt).toISOString().split('T')[0] : "",
        leavingDate: (trainer as any).leavingDate || "",
        status: (trainer as any).status || "Active",
        avatarId: savedAvatarId || (trainer as any).avatarId || null,
        emergencyName: "",
        emergencyPhone: "",
        employeeId: "",
        department: "",
        shift: "",
        address: "",
        bio: "",
      })
      loadAssignedMembers()
      loadTrainerDetails()
    }
  }, [isOpen, trainer])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!showMemberSearch || !trainer) return
    const timeoutId = setTimeout(() => { searchMembers(searchQuery) }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, showMemberSearch, trainer])

  // ============================================================================
  // API Handlers
  // ============================================================================

  const loadTrainerDetails = useCallback(async () => {
    if (!trainer) return
    setDetailsLoading(true)
    try {
      const details: TrainerDetailsDTO = await api.getTrainerDetails(trainer.userId)
      setTrainerDetails(details)

      // Populate form fields from details
      setEditForm(prev => ({
        ...prev,
        emergencyName: details.emergencyName || "",
        emergencyPhone: details.emergencyPhone || "",
        employeeId: details.employeeId || "",
        department: details.department || "",
        shift: details.shift || "",
        address: details.address || "",
        bio: details.bio || "",
        phone: details.phone || prev.phone,
      }))

      // Populate specializations
      setSelectedSpecs(details.specializations || [])

      // Populate certifications
      setCertifications(details.certifications || [])

      // Populate availability
      if (details.availability && details.availability.length > 0) {
        setAvailability(details.availability)
      } else {
      setAvailability(DEFAULT_AVAILABILITY)
    }

    // Load saved notes from localStorage
    const savedOwnerNotes = localStorage.getItem(`trainer_notes_${trainer.userId}`)
    if (savedOwnerNotes) {
      setOwnerNotes(savedOwnerNotes)
      setSavedNotes(savedOwnerNotes)
    } else {
      setOwnerNotes("")
      setSavedNotes("")
    }
  } catch (error) {
      console.error('[TrainerModal] Failed to load details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }, [trainer])

  const loadAssignedMembers = useCallback(async () => {
    if (!trainer) return
    try {
      const members = await api.getTrainerCustomers(trainer.userId)
      setAssignedMembers(members)
    } catch (error) {
      console.error('[TrainerModal] Failed to load assigned members:', error)
      setAssignedMembers([])
    }
  }, [trainer])

    const searchMembers = async (query: string) => {
      if (!trainer) return
      try {
        setIsSearching(true)
        const members = await api.searchUsers('CUSTOMER', query)
        setAvailableMembers(members)
      } catch (error) {
        console.error('[TrainerModal] Search failed:', error)
        setAvailableMembers([])
      } finally {
        setIsSearching(false)
      }
    }

    const loadCompensation = useCallback(async () => {
      if (!trainer) return
      setCompensationLoading(true)
      try {
        const rules = await api.getTrainerCompensation(trainer.userId)
        setCompensationRules(rules || [])
      } catch (error) {
        console.error('[TrainerModal] Failed to load compensation:', error)
        setCompensationRules([])
      } finally {
        setCompensationLoading(false)
      }
    }, [trainer])

    const loadAttendance = useCallback(async (days: number = 30) => {
      if (!trainer) return
      setAttendanceLoading(true)
      try {
        const data = await api.getTrainerAttendance(trainer.userId, days)
        setAttendanceRecords(data.records || [])
        setAttendanceSummary(data.summary || null)
      } catch (error) {
        console.error('[TrainerModal] Failed to load attendance:', error)
        setAttendanceRecords([])
        setAttendanceSummary(null)
      } finally {
        setAttendanceLoading(false)
      }
    }, [trainer])

  const handleSaveProfile = async () => {
    if (!trainer || !isFormValid) return
    setIsSaving(true)
    try {
      if (editForm.avatarId !== null) {
        localStorage.setItem(`avatar_${trainer.userId}`, editForm.avatarId)
      } else {
        localStorage.removeItem(`avatar_${trainer.userId}`)
      }

      const updatedTrainer = await api.updateUser(trainer.userId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
        avatarId: editForm.avatarId ?? undefined,
      })

      // Also update trainer details (emergency contact, contract, etc.)
      await api.updateTrainerDetails(trainer.userId, {
        name: editForm.fullName,
        phone: editForm.phone,
        emergencyName: editForm.emergencyName,
        emergencyPhone: editForm.emergencyPhone,
        employeeId: editForm.employeeId,
        department: editForm.department,
        shift: editForm.shift,
        address: editForm.address,
        bio: editForm.bio,
      })

      const trainerWithAvatar = { ...updatedTrainer, avatarId: editForm.avatarId ?? undefined }
      setLocalTrainer(prev => prev ? { ...prev, ...trainerWithAvatar } : prev)
      showToast.success("Profile updated successfully")
      onEditProfile?.(trainerWithAvatar)
      onUpdate?.()
    } catch (error: any) {
      showToast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSpecializations = async () => {
    if (!trainer) return
    setIsSaving(true)
    try {
      await api.updateTrainerDetails(trainer.userId, {
        specializations: selectedSpecs,
        certifications: certifications,
      })
      showToast.success("Specializations & certifications saved")
      onUpdate?.()
    } catch (error: any) {
      showToast.error(error.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSchedule = async () => {
    if (!trainer) return
    setIsSaving(true)
    try {
      await api.updateTrainerDetails(trainer.userId, {
        availability: availability,
      })
      showToast.success("Schedule saved")
      onUpdate?.()
    } catch (error: any) {
      showToast.error(error.message || "Failed to save schedule")
    } finally {
      setIsSaving(false)
    }
  }

    const handleAddCertification = () => {
      if (!newCert.name || !newCert.issuer) return
      setCertifications(prev => [...prev, { ...newCert }])
      setNewCert({ name: "", issuer: "", year: "", valid: true, expires: "" })
      setShowAddCert(false)
    }

    const handleRemoveCertification = (index: number) => {
      setCertifications(prev => prev.filter((_, i) => i !== index))
    }

    const handleAddCompensationRule = async () => {
      if (!trainer) return
      setIsSaving(true)
      try {
        await api.createCompensationRule(trainer.userId, {
          perSessionRate: newCompensation.perSessionRate || null,
          perHourRate: newCompensation.perHourRate || null,
          perClassRate: newCompensation.perClassRate || null,
          perAttendeeRate: newCompensation.perAttendeeRate || null,
          commissionPercent: newCompensation.commissionPercent || null,
          effectiveFrom: newCompensation.effectiveFrom || new Date().toISOString().split('T')[0],
          effectiveTo: newCompensation.effectiveTo || null,
        })
        showToast.success("Compensation rule added")
        setShowAddCompensation(false)
        setNewCompensation({ perSessionRate: "", perHourRate: "", commissionPercent: "", effectiveFrom: new Date().toISOString().split('T')[0] })
        loadCompensation()
      } catch (error: any) {
        showToast.error(error.message || "Failed to add compensation rule")
      } finally {
        setIsSaving(false)
      }
    }

    const handleDeleteCompensationRule = async (ruleId: number) => {
      if (!trainer) return
      try {
        await api.deleteCompensationRule(trainer.userId, ruleId)
        showToast.success("Compensation rule deleted")
        loadCompensation()
      } catch (error: any) {
        showToast.error(error.message || "Failed to delete")
      }
    }

    const handleSaveNotes = () => {
      if (!trainer) return
      localStorage.setItem(`trainer_notes_${trainer.userId}`, ownerNotes)
      setSavedNotes(ownerNotes)
      showToast.success("Notes saved")
    }

  const handleAddMember = async (member: User) => {
    if (!trainer) return
    if (assignedMembers.some(m => m.userId === member.userId)) {
      showToast.error("Member is already assigned to this trainer")
      return
    }
    setAssignedMembers(prev => [...prev, member])
    setShowMemberSearch(false)
    setSearchQuery("")
    try {
      await api.assignCustomerToTrainer(trainer.userId, member.userId)
      showToast.success(`${member.fullName} assigned successfully`)
    } catch (error: any) {
      setAssignedMembers(prev => prev.filter(m => m.userId !== member.userId))
      showToast.error(error.message || "Failed to assign member")
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!trainer) return
    const memberToRemove = assignedMembers.find(m => m.userId === memberId)
    if (!memberToRemove) return
    setAssignedMembers(prev => prev.filter(m => m.userId !== memberId))
    try {
      await api.removeCustomerFromTrainer(trainer.userId, memberId)
      showToast.success("Member removed successfully")
    } catch (error: any) {
      setAssignedMembers(prev => [...prev, memberToRemove])
      showToast.error(error.message || "Failed to remove member")
    }
  }

  const handleSendMessage = async () => {
    if (!trainer || !messageForm.subject || !messageForm.body) return
    setIsSendingMessage(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      showToast.success(`Message sent to ${trainer.fullName}`)
      setMessageForm({ subject: "", body: "" })
    } catch (error: any) {
      showToast.error(error.message || "Failed to send message")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleDeleteTrainer = async () => {
    if (!trainer) return
    setIsDeleting(true)
    try {
      await api.deleteUser(trainer.userId)
      showToast.success(`${trainer.fullName} has been deleted`)
      onDeleteTrainer?.(trainer.userId)
      onUpdate?.()
      onClose()
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete trainer")
    } finally {
      setIsDeleting(false)
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  if (!trainer || !localTrainer) return null

  const stats = trainerDetails?.stats

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trainer-action-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Editable id="trainer-action-modal" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
          <motion.div
            className="trainer-action-modal trainer-action-modal--redesigned"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Profile Header */}
            <div className="trainer-action-modal__profile-header">
              <div className="profile-header__avatar">
                {editForm.avatarId ? (
                  <img src={getAvatarUrl(editForm.avatarId) || ''} alt={localTrainer.fullName} />
                ) : (
                  <div className="avatar-initials" style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--color-crimson), #b91c1c)',
                    color: 'white', fontWeight: 700, fontSize: '18px'
                  }}>
                    {localTrainer.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>

              <div className="profile-header__info">
                <h2 className="profile-header__name">{localTrainer.fullName}</h2>
                <p className="profile-header__email">{localTrainer.email}</p>
              </div>

              <div className="profile-header__meta">
                <span className="role-badge role-badge--trainer">{editForm.role}</span>
                <span className={`status-badge status-badge--${editForm.status.toLowerCase().replace(' ', '-')}`}>
                  <span className="status-dot"></span>
                  {editForm.status}
                </span>
                {selectedSpecs.length > 0 && (
                  <span className="role-badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {selectedSpecs[0]}{selectedSpecs.length > 1 ? ` +${selectedSpecs.length - 1}` : ''}
                  </span>
                )}
              </div>

              <div className="profile-header__stats">
                <div className="stat-item">
                  <span className="stat-value">{assignedMembers.length}</span>
                  <span className="stat-label">Members</span>
                </div>
                {stats && stats.rating > 0 && (
                  <div className="stat-item">
                    <span className="stat-value">{stats.rating}</span>
                    <span className="stat-label">Rating</span>
                  </div>
                )}
              </div>

              <button className="trainer-action-modal__close-inline" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content Grid */}
            <div className="trainer-action-modal__content-grid">
              {/* Left Navigation */}
                <div className="trainer-action-modal__nav-column">
                  <nav className="side-panel-nav">
                    <span className="side-panel-nav__label">General</span>
                    {([
                      { id: "profile" as TabType, label: "Edit Profile", icon: "profile" },
                      { id: "members" as TabType, label: "Assigned Members", icon: "members", badge: assignedMembers.length },
                      { id: "specializations" as TabType, label: "Specializations", icon: "award" },
                      { id: "schedule" as TabType, label: "Schedule", icon: "calendar" },
                    ] as const).map(tab => (
                      <button key={tab.id}
                        className={`side-panel-nav__item ${activeTab === tab.id ? "side-panel-nav__item--active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}>
                        <div className="nav-icon-wrap">
                          {tab.id === "profile" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                          {tab.id === "members" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                          {tab.id === "specializations" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>}
                          {tab.id === "schedule" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                        </div>
                        <span>{tab.label}</span>
                        {'badge' in tab && tab.badge !== undefined && <span className="nav-badge">{tab.badge}</span>}
                      </button>
                    ))}

                    <div className="side-panel-nav__divider" />
                    <span className="side-panel-nav__label">Operations</span>
                    {([
                      { id: "salary" as TabType, label: "Salary & Pay", icon: "salary" },
                      { id: "attendance" as TabType, label: "Attendance", icon: "attendance" },
                      { id: "performance" as TabType, label: "Performance", icon: "chart" },
                    ] as const).map(tab => (
                      <button key={tab.id}
                        className={`side-panel-nav__item ${activeTab === tab.id ? "side-panel-nav__item--active" : ""}`}
                        onClick={() => {
                          setActiveTab(tab.id)
                          if (tab.id === "salary" && compensationRules.length === 0 && !compensationLoading) loadCompensation()
                          if (tab.id === "attendance" && attendanceRecords.length === 0 && !attendanceLoading) loadAttendance(attendanceDays)
                        }}>
                        <div className="nav-icon-wrap">
                          {tab.id === "salary" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                          {tab.id === "attendance" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><path d="M9 14l2 2 4-4" /></svg>}
                          {tab.id === "performance" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                        </div>
                        <span>{tab.label}</span>
                      </button>
                    ))}

                    <div className="side-panel-nav__divider" />
                    <span className="side-panel-nav__label">Communication</span>
                    {([
                      { id: "notes" as TabType, label: "Owner Notes", icon: "notes" },
                      { id: "message" as TabType, label: "Message", icon: "mail" },
                    ] as const).map(tab => (
                      <button key={tab.id}
                        className={`side-panel-nav__item ${activeTab === tab.id ? "side-panel-nav__item--active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}>
                        <div className="nav-icon-wrap">
                          {tab.id === "notes" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
                          {tab.id === "message" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                        </div>
                        <span>{tab.label}</span>
                      </button>
                    ))}

                    <button
                      className={`side-panel-nav__item side-panel-nav__item--danger ${activeTab === "delete" ? "side-panel-nav__item--active" : ""}`}
                      onClick={() => setActiveTab("delete")}>
                      <div className="nav-icon-wrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </div>
                      <span>Delete Trainer</span>
                    </button>
                  </nav>
                </div>

              {/* Right Content Panel */}
              <div className="trainer-action-modal__content-panel">
                <AnimatePresence mode="wait">
                  {/* ========== Edit Profile ========== */}
                  {activeTab === "profile" && (
                    <motion.div key="profile" className="content-panel content-panel--constrained"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="content-panel__header">
                        <h4 className="content-panel__title">Edit Profile</h4>
                        <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowAvatarPicker(true)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                          Choose Avatar
                        </button>
                      </div>

                      {/* Avatar Picker */}
                      <AnimatePresence>
                        {showAvatarPicker && (
                          <motion.div className="avatar-picker-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAvatarPicker(false)}>
                            <motion.div className="avatar-picker-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                              <div className="avatar-picker-modal__header">
                                <h5>Choose Your Avatar</h5>
                                <button className="avatar-picker-modal__close" onClick={() => setShowAvatarPicker(false)}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                              <AvatarPicker selectedId={editForm.avatarId} userId={trainer?.userId}
                                onSelect={(id) => { setEditForm(prev => ({ ...prev, avatarId: id })); setShowAvatarPicker(false); showToast.success("Avatar selected!") }} />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="content-panel__body">
                        {/* Row 1: Full Name + Email */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-with-validation">
                              <input type="text" className={`form-input ${validation.fullName === true ? 'input--valid' : validation.fullName === false ? 'input--invalid' : ''}`}
                                value={editForm.fullName} onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))} disabled={isSaving} />
                              <ValidationIcon isValid={validation.fullName} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <div className="input-with-validation">
                              <input type="email" className={`form-input ${validation.email === true ? 'input--valid' : validation.email === false ? 'input--invalid' : ''}`}
                                value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} disabled={isSaving} />
                              <ValidationIcon isValid={validation.email} />
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Phone + Role */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Phone</label>
                            <div className="input-with-validation">
                              <input type="tel" className={`form-input ${validation.phone === true ? 'input--valid' : validation.phone === false ? 'input--invalid' : ''}`}
                                value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} disabled={isSaving} />
                              <ValidationIcon isValid={validation.phone} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Role</label>
                            <select className="form-select" value={editForm.role} onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))} disabled={isSaving}>
                              <option value="TRAINER">Trainer</option>
                              <option value="SENIOR_TRAINER">Senior Trainer</option>
                              <option value="HEAD_COACH">Head Coach</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 3: Employee ID + Department */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Employee ID</label>
                            <input type="text" className="form-input" value={editForm.employeeId}
                              onChange={(e) => setEditForm(prev => ({ ...prev, employeeId: e.target.value }))} disabled={isSaving} placeholder="e.g. EMP-001" />
                          </div>
                          <div className="form-group">
                            <label>Department</label>
                            <select className="form-select" value={editForm.department}
                              onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))} disabled={isSaving}>
                              <option value="">Select Department</option>
                              <option value="Personal Training">Personal Training</option>
                              <option value="Group Classes">Group Classes</option>
                              <option value="Swimming">Swimming</option>
                              <option value="Yoga & Wellness">Yoga & Wellness</option>
                              <option value="Strength & Conditioning">Strength & Conditioning</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 4: Join Date + Shift */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Join Date</label>
                            <input type="date" className="form-input" value={editForm.joinDate}
                              onChange={(e) => setEditForm(prev => ({ ...prev, joinDate: e.target.value }))} disabled={isSaving} />
                          </div>
                          <div className="form-group">
                            <label>Shift</label>
                            <select className="form-select" value={editForm.shift}
                              onChange={(e) => setEditForm(prev => ({ ...prev, shift: e.target.value }))} disabled={isSaving}>
                              <option value="">Select Shift</option>
                              <option value="Morning (6AM-2PM)">Morning (6AM-2PM)</option>
                              <option value="Afternoon (2PM-10PM)">Afternoon (2PM-10PM)</option>
                              <option value="Full Day (6AM-10PM)">Full Day (6AM-10PM)</option>
                              <option value="Split Shift">Split Shift</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 5: Status + Address */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Status</label>
                            <select className="form-select" value={editForm.status}
                              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))} disabled={isSaving}>
                              <option value="Active">Active</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Left">Left</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Address</label>
                            <input type="text" className="form-input" value={editForm.address}
                              onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} disabled={isSaving} placeholder="Enter address" />
                          </div>
                        </div>

                        {/* Emergency Contact Section */}
                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
                          <h5 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                            </svg>
                            Emergency Contact
                          </h5>
                          <div className="form-row-2-col">
                            <div className="form-group">
                              <label>Contact Name</label>
                              <input type="text" className="form-input" value={editForm.emergencyName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, emergencyName: e.target.value }))} disabled={isSaving} placeholder="Full name" />
                            </div>
                            <div className="form-group">
                              <label>Contact Phone</label>
                              <input type="tel" className="form-input" value={editForm.emergencyPhone}
                                onChange={(e) => setEditForm(prev => ({ ...prev, emergencyPhone: e.target.value }))} disabled={isSaving} placeholder="Phone number" />
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <div style={{ marginTop: 20 }}>
                          <div className="form-group">
                            <label>Bio</label>
                            <textarea className="form-input" style={{ minHeight: 80, resize: 'vertical' }}
                              value={editForm.bio} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                              disabled={isSaving} placeholder="Brief bio about the trainer..." />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button className="btn btn--primary" onClick={handleSaveProfile} disabled={isSaving || !isFormValid}>
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Assigned Members ========== */}
                  {activeTab === "members" && (
                    <motion.div key="members" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="trainers-header">
                        <h4 className="trainers-header__title">
                          Assigned Members
                          <span className="trainers-count">{assignedMembers.length}</span>
                        </h4>
                        <div className="trainers-header__action">
                          <button className={`add-trainer-btn ${showMemberSearch ? 'add-trainer-btn--active' : ''}`}
                            onClick={() => setShowMemberSearch(!showMemberSearch)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Member
                          </button>
                          <AnimatePresence>
                            {showMemberSearch && (
                              <motion.div className="trainer-popover" initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()}>
                                <div className="trainer-popover__header">
                                  <span>Search Members</span>
                                  <button className="trainer-popover__close" onClick={() => setShowMemberSearch(false)}>x</button>
                                </div>
                                <input type="text" className="trainer-popover__input" placeholder="Type member name..."
                                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Escape' && setShowMemberSearch(false)} autoFocus />
                                <div className="trainer-popover__results">
                                  {isSearching && <div className="trainer-popover__loading">Searching...</div>}
                                  {!isSearching && (() => {
                                    const unassigned = availableMembers.filter(m => !assignedMembers.some(a => a.userId === m.userId))
                                    if (unassigned.length === 0) {
                                      return availableMembers.length > 0
                                        ? <div className="trainer-popover__empty">All matching members are already assigned.</div>
                                        : searchQuery.length > 0 ? <div className="trainer-popover__empty">No members found</div> : null
                                    }
                                    return unassigned.map(member => (
                                      <div key={member.userId} className="trainer-popover__item" onClick={() => handleAddMember(member)}>
                                        <div className="trainer-popover__avatar">{member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                                        <div className="trainer-popover__info">
                                          <span className="trainer-popover__name">{member.fullName}</span>
                                          <span className="trainer-popover__email">{member.email}</span>
                                        </div>
                                      </div>
                                    ))
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="content-panel__body">
                        <div className="trainers-list">
                          {assignedMembers.length === 0 ? (
                            <div className="empty-state">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                              </svg>
                              <p>No members assigned yet</p>
                              <span>Click "Add Member" to assign one</span>
                            </div>
                          ) : (
                            assignedMembers.map(member => (
                              <div key={member.userId} className="trainer-item">
                                <div className="trainer-item__info">
                                  <div className="trainer-item__avatar">{member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                                  <div>
                                    <span className="trainer-item__name">{member.fullName}</span>
                                    <span className="trainer-item__role">Member</span>
                                  </div>
                                </div>
                                <button className="trainer-item__remove" onClick={() => handleRemoveMember(member.userId)}>Remove</button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Specializations & Certifications ========== */}
                  {activeTab === "specializations" && (
                    <motion.div key="specializations" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h4 className="content-panel__title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                        Specializations & Certifications
                      </h4>
                      <div className="content-panel__body">
                        {/* Specializations Tags */}
                        <div style={{ marginBottom: 24 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                            Specializations
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {SPECIALIZATION_OPTIONS.map(spec => {
                              const isSelected = selectedSpecs.includes(spec)
                              return (
                                <button key={spec} onClick={() => {
                                  setSelectedSpecs(prev => isSelected ? prev.filter(s => s !== spec) : [...prev, spec])
                                }} style={{
                                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  border: isSelected ? '1.5px solid var(--color-crimson)' : '1px solid var(--border-primary)',
                                  background: isSelected ? 'rgba(220,38,38,0.1)' : 'var(--bg-tertiary)',
                                  color: isSelected ? 'var(--color-crimson)' : 'var(--text-secondary)',
                                  transition: 'all 0.15s ease',
                                }}>
                                  {isSelected && '✓ '}{spec}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Certifications */}
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Certifications</label>
                            <button className="btn btn--secondary btn--sm" onClick={() => setShowAddCert(!showAddCert)}>
                              + Add Certification
                            </button>
                          </div>

                          {/* Add certification form */}
                          <AnimatePresence>
                            {showAddCert && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                                <div className="form-row-2-col">
                                  <div className="form-group">
                                    <label>Certificate Name</label>
                                    <input type="text" className="form-input" value={newCert.name} placeholder="e.g. ACE Personal Trainer"
                                      onChange={(e) => setNewCert(prev => ({ ...prev, name: e.target.value }))} />
                                  </div>
                                  <div className="form-group">
                                    <label>Issuing Body</label>
                                    <input type="text" className="form-input" value={newCert.issuer} placeholder="e.g. ACE, NASM, ISSA"
                                      onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))} />
                                  </div>
                                </div>
                                <div className="form-row-2-col" style={{ marginTop: 12 }}>
                                  <div className="form-group">
                                    <label>Year Obtained</label>
                                    <input type="text" className="form-input" value={newCert.year} placeholder="e.g. 2023"
                                      onChange={(e) => setNewCert(prev => ({ ...prev, year: e.target.value }))} />
                                  </div>
                                  <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input type="date" className="form-input" value={newCert.expires}
                                      onChange={(e) => setNewCert(prev => ({ ...prev, expires: e.target.value }))} />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                                  <button className="btn btn--secondary btn--sm" onClick={() => setShowAddCert(false)}>Cancel</button>
                                  <button className="btn btn--primary btn--sm" onClick={handleAddCertification}
                                    disabled={!newCert.name || !newCert.issuer}>Add</button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Certifications list */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {certifications.length === 0 ? (
                              <div className="empty-state">
                                <p>No certifications added</p>
                                <span>Add certifications to track qualifications</span>
                              </div>
                            ) : (
                              certifications.map((cert, index) => {
                                const isExpired = cert.expires && new Date(cert.expires) < new Date()
                                const isExpiringSoon = cert.expires && !isExpired && new Date(cert.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                return (
                                  <div key={index} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                                    borderRadius: 12, transition: 'all 0.2s'
                                  }}>
                                    <div>
                                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cert.name}</div>
                                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                        {cert.issuer} {cert.year && `| ${cert.year}`} {cert.expires && `| Expires: ${cert.expires}`}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{
                                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6,
                                        background: isExpired ? 'rgba(239,68,68,0.1)' : isExpiringSoon ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                                        color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#22c55e',
                                      }}>
                                        {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                                      </span>
                                      <button onClick={() => handleRemoveCertification(index)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '4px 8px' }}>
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>

                        <div className="form-actions">
                          <button className="btn btn--primary" onClick={handleSaveSpecializations} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Specializations"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Schedule & Availability ========== */}
                  {activeTab === "schedule" && (
                    <motion.div key="schedule" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h4 className="content-panel__title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Weekly Schedule & Availability
                      </h4>
                      <div className="content-panel__body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {availability.map((slot, index) => (
                            <div key={slot.day} style={{
                              display: 'grid', gridTemplateColumns: '120px 1fr 1fr auto', gap: 12, alignItems: 'center',
                              padding: '14px 16px', background: slot.isAvailable ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                              border: '1px solid var(--border-primary)', borderRadius: 12,
                              opacity: slot.isAvailable ? 1 : 0.6, transition: 'all 0.2s'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" checked={slot.isAvailable}
                                  onChange={(e) => {
                                    const updated = [...availability]
                                    updated[index] = { ...updated[index], isAvailable: e.target.checked }
                                    setAvailability(updated)
                                  }}
                                  style={{ width: 16, height: 16, accentColor: 'var(--color-crimson)' }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{slot.day.slice(0, 3)}</span>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <input type="time" className="form-input" value={slot.startTime}
                                  onChange={(e) => {
                                    const updated = [...availability]
                                    updated[index] = { ...updated[index], startTime: e.target.value }
                                    setAvailability(updated)
                                  }}
                                  disabled={!slot.isAvailable}
                                  style={{ padding: '8px 12px', fontSize: 13 }} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <input type="time" className="form-input" value={slot.endTime}
                                  onChange={(e) => {
                                    const updated = [...availability]
                                    updated[index] = { ...updated[index], endTime: e.target.value }
                                    setAvailability(updated)
                                  }}
                                  disabled={!slot.isAvailable}
                                  style={{ padding: '8px 12px', fontSize: 13 }} />
                              </div>
                              <span style={{
                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6,
                                background: slot.isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                                color: slot.isAvailable ? '#22c55e' : '#6b7280',
                              }}>
                                {slot.isAvailable ? 'Available' : 'Off'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="form-actions">
                          <button className="btn btn--primary" onClick={handleSaveSchedule} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Schedule"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Performance ========== */}
                  {activeTab === "performance" && (
                    <motion.div key="performance" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h4 className="content-panel__title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        Performance & Stats
                      </h4>
                      <div className="content-panel__body">
                        {/* Stats Cards */}
                        <div className="performance-stats-grid">
                          <div className="perf-stat-card perf-stat-card--primary">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">{assignedMembers.length}</span>
                              <span className="perf-stat-card__label">Active Members</span>
                            </div>
                          </div>

                          <div className="perf-stat-card perf-stat-card--success">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">{stats?.rating || 0}</span>
                              <span className="perf-stat-card__label">Avg Rating ({stats?.reviews || 0} reviews)</span>
                            </div>
                          </div>

                          <div className="perf-stat-card perf-stat-card--info">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">{selectedSpecs.length}</span>
                              <span className="perf-stat-card__label">Specializations</span>
                            </div>
                          </div>

                          <div className="perf-stat-card perf-stat-card--warning">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">{certifications.length}</span>
                              <span className="perf-stat-card__label">Certifications</span>
                            </div>
                          </div>
                        </div>

                        {/* Specializations Summary */}
                        {selectedSpecs.length > 0 && (
                          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                            <h5 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, margin: 0 }}>Specialization Areas</h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                              {selectedSpecs.map(spec => (
                                <span key={spec} style={{
                                  padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600,
                                  background: 'rgba(220,38,38,0.08)', color: 'var(--color-crimson)',
                                  border: '1px solid rgba(220,38,38,0.15)'
                                }}>{spec}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Schedule Summary */}
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 16, padding: 20 }}>
                          <h5 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: 12 }}>Weekly Availability</h5>
                          <div className="availability-grid">
                            {availability.map(slot => (
                              <div key={slot.day} className={`availability-day ${!slot.isAvailable ? 'availability-day--off' : ''}`}>
                                <div className="availability-day__name">{slot.day.slice(0, 3)}</div>
                                <div className="availability-day__hours">
                                  {slot.isAvailable ? `${slot.startTime} - ${slot.endTime}` : 'Off'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Salary & Compensation ========== */}
                  {activeTab === "salary" && (
                    <motion.div key="salary" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="content-panel__header">
                        <h4 className="content-panel__title">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          Salary & Compensation
                        </h4>
                        <button className="btn btn--primary btn--sm" onClick={() => setShowAddCompensation(!showAddCompensation)}>
                          + Add Rate
                        </button>
                      </div>
                      <div className="content-panel__body">
                        {/* Add compensation form */}
                        <AnimatePresence>
                          {showAddCompensation && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                              <div className="form-row-2-col">
                                <div className="form-group">
                                  <label>Per Session Rate</label>
                                  <input type="number" className="form-input" value={newCompensation.perSessionRate || ''} placeholder="e.g. 500"
                                    onChange={(e) => setNewCompensation(prev => ({ ...prev, perSessionRate: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                  <label>Per Hour Rate</label>
                                  <input type="number" className="form-input" value={newCompensation.perHourRate || ''} placeholder="e.g. 800"
                                    onChange={(e) => setNewCompensation(prev => ({ ...prev, perHourRate: e.target.value }))} />
                                </div>
                              </div>
                              <div className="form-row-2-col" style={{ marginTop: 12 }}>
                                <div className="form-group">
                                  <label>Per Class Rate</label>
                                  <input type="number" className="form-input" value={newCompensation.perClassRate || ''} placeholder="e.g. 1000"
                                    onChange={(e) => setNewCompensation(prev => ({ ...prev, perClassRate: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                  <label>Commission %</label>
                                  <input type="number" className="form-input" value={newCompensation.commissionPercent || ''} placeholder="e.g. 10"
                                    onChange={(e) => setNewCompensation(prev => ({ ...prev, commissionPercent: e.target.value }))} />
                                </div>
                              </div>
                              <div className="form-row-2-col" style={{ marginTop: 12 }}>
                                <div className="form-group">
                                  <label>Effective From</label>
                                  <input type="date" className="form-input" value={newCompensation.effectiveFrom || ''}
                                    onChange={(e) => setNewCompensation(prev => ({ ...prev, effectiveFrom: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                  <label>Effective To (optional)</label>
                                  <input type="date" className="form-input" value={newCompensation.effectiveTo || ''}
                                    onChange={(e) => setNewCompensation(prev => ({ ...prev, effectiveTo: e.target.value }))} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                                <button className="btn btn--secondary btn--sm" onClick={() => setShowAddCompensation(false)}>Cancel</button>
                                <button className="btn btn--primary btn--sm" onClick={handleAddCompensationRule} disabled={isSaving}>
                                  {isSaving ? "Adding..." : "Add Rule"}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Rules list */}
                        {compensationLoading ? (
                          <div className="empty-state"><p>Loading compensation data...</p></div>
                        ) : compensationRules.length === 0 ? (
                          <div className="empty-state">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <p>No compensation rules set</p>
                            <span>Click "Add Rate" to define payment structure</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {compensationRules.map((rule) => (
                              <div key={rule.id} style={{
                                padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                                borderRadius: 12, transition: 'all 0.2s',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6,
                                      background: rule.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                                      color: rule.isActive ? '#22c55e' : '#6b7280',
                                    }}>{rule.isActive ? 'Active' : 'Inactive'}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                      From {rule.effectiveFrom}{rule.effectiveTo ? ` to ${rule.effectiveTo}` : ' (ongoing)'}
                                    </span>
                                  </div>
                                  <button onClick={() => rule.id && handleDeleteCompensationRule(rule.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                    Remove
                                  </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px' }}>
                                  {rule.perSessionRate && (
                                    <div><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Per Session</span>
                                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{rule.perSessionRate}</div></div>
                                  )}
                                  {rule.perHourRate && (
                                    <div><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Per Hour</span>
                                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{rule.perHourRate}</div></div>
                                  )}
                                  {rule.perClassRate && (
                                    <div><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Per Class</span>
                                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{rule.perClassRate}</div></div>
                                  )}
                                  {rule.commissionPercent && (
                                    <div><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Commission</span>
                                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{rule.commissionPercent}%</div></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Attendance ========== */}
                  {activeTab === "attendance" && (
                    <motion.div key="attendance" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="content-panel__header">
                        <h4 className="content-panel__title">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                            <path d="M9 14l2 2 4-4" />
                          </svg>
                          Attendance Log
                        </h4>
                        <select className="form-select" value={attendanceDays} style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                          onChange={(e) => { const d = Number(e.target.value); setAttendanceDays(d); loadAttendance(d) }}>
                          <option value={7}>Last 7 days</option>
                          <option value={30}>Last 30 days</option>
                          <option value={90}>Last 90 days</option>
                        </select>
                      </div>
                      <div className="content-panel__body">
                        {/* Summary Cards */}
                        {attendanceSummary && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                            <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 12, textAlign: 'center' }}>
                              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{attendanceSummary.presentDays}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Present</div>
                            </div>
                            <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 12, textAlign: 'center' }}>
                              <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{attendanceSummary.absentDays}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Absent</div>
                            </div>
                            <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 12, textAlign: 'center' }}>
                              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{attendanceSummary.totalDays}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Total Days</div>
                            </div>
                            <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 12, textAlign: 'center' }}>
                              <div style={{
                                fontSize: 20, fontWeight: 800,
                                color: attendanceSummary.attendancePercent >= 80 ? '#22c55e' : attendanceSummary.attendancePercent >= 50 ? '#f59e0b' : '#ef4444'
                              }}>{attendanceSummary.attendancePercent}%</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Rate</div>
                            </div>
                          </div>
                        )}

                        {/* Records list */}
                        {attendanceLoading ? (
                          <div className="empty-state"><p>Loading attendance data...</p></div>
                        ) : attendanceRecords.length === 0 ? (
                          <div className="empty-state">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                            </svg>
                            <p>No attendance records found</p>
                            <span>Check-in data will appear here</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {attendanceRecords.slice(0, 20).map((record) => {
                              const checkIn = new Date(record.checkInTime)
                              const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null
                              const duration = checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) * 10) / 10 : null
                              return (
                                <div key={record.id} style={{
                                  display: 'grid', gridTemplateColumns: '120px 1fr 1fr auto', gap: 12, alignItems: 'center',
                                  padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 10,
                                }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    In: {checkIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {checkOut ? `Out: ${checkOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Still in'}
                                  </span>
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                                    background: record.status === 'checked-out' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                                    color: record.status === 'checked-out' ? '#22c55e' : '#3b82f6',
                                  }}>
                                    {duration ? `${duration}h` : 'Active'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Owner Notes ========== */}
                  {activeTab === "notes" && (
                    <motion.div key="notes" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h4 className="content-panel__title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Owner Notes
                        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 8 }}>
                          (Private - only visible to you)
                        </span>
                      </h4>
                      <div className="content-panel__body">
                        <textarea
                          className="form-input"
                          style={{ minHeight: 200, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                          value={ownerNotes}
                          onChange={(e) => setOwnerNotes(e.target.value)}
                          placeholder="Write private notes about this trainer... (e.g., performance observations, verbal agreements, feedback from members)"
                        />
                        {savedNotes !== ownerNotes && (
                          <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 8 }}>Unsaved changes</div>
                        )}
                        <div className="form-actions">
                          <button className="btn btn--primary" onClick={handleSaveNotes} disabled={savedNotes === ownerNotes}>
                            {savedNotes === ownerNotes ? "Saved" : "Save Notes"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Message ========== */}
                  {activeTab === "message" && (
                    <motion.div key="message" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h4 className="content-panel__title">Send Message</h4>
                      <div className="message-compose">
                        <div className="message-compose__row">
                          <span className="message-compose__label">To:</span>
                          <div className="message-compose__recipient">
                            <span className="recipient-tag">
                              {localTrainer.fullName}
                              <span className="recipient-email">&lt;{localTrainer.email}&gt;</span>
                            </span>
                          </div>
                        </div>
                        <div className="message-compose__row">
                          <span className="message-compose__label">Subject:</span>
                          <input type="text" value={messageForm.subject}
                            onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="message-compose__input" placeholder="Enter subject..." disabled={isSendingMessage} />
                        </div>
                        <div className="message-compose__body">
                          <textarea value={messageForm.body}
                            onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSendMessage() } }}
                            className="message-compose__textarea" placeholder="Write your message here..." disabled={isSendingMessage} />
                          <span className="message-compose__hint">Cmd + Enter to send</span>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button className="btn btn--primary" onClick={handleSendMessage}
                          disabled={isSendingMessage || !messageForm.subject || !messageForm.body}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          {isSendingMessage ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Delete ========== */}
                  {activeTab === "delete" && (
                    <motion.div key="delete" className="content-panel"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="content-panel__body">
                        <div className="delete-zone">
                          <div className="delete-user-preview">
                            <div className="delete-user-preview__avatar">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localTrainer.fullName}`} alt={localTrainer.fullName} />
                            </div>
                            <div className="delete-user-preview__info">
                              <span className="delete-user-preview__name">{localTrainer.fullName}</span>
                              <span className="delete-user-preview__role">{editForm.role}</span>
                            </div>
                          </div>
                          <motion.div className="delete-warning-icon" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 300 }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </motion.div>
                          <div className="delete-warning-text">
                            <h5 className="delete-warning-text__title">This action is permanent</h5>
                            <p className="delete-warning-text__desc">Deleting this trainer will remove all associated data.</p>
                          </div>
                          <div className="delete-consequences">
                            {["Member assignments will be removed", "Schedule data will be deleted", "Performance history will be lost", "Certifications & documents will be deleted"].map(text => (
                              <div key={text} className="delete-consequence">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>{text}</span>
                              </div>
                            ))}
                          </div>
                          <div className="delete-zone__actions">
                            <button className="btn btn--secondary btn--large" onClick={() => setActiveTab("profile")}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                              </svg>
                              Go Back
                            </button>
                            <button className="btn btn--danger btn--large" onClick={handleDeleteTrainer} disabled={isDeleting}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </Editable>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedTrainerActionModal
