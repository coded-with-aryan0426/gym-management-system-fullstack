"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types/user"
import type { Relationship } from "../../types/modalEnhancement"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { relationshipFilterService, enhancedApi } from "../../services"
import { useRealTimeData, useOptimisticUpdates, useMicroInteractions } from "../../hooks"
import { showToast } from "../../utils/toast"
import Avatar from "../ui/Avatar"
import AvatarPicker from "../ui/AvatarPicker"
import { getAvatarUrl } from "../ui/Avatar"
import "./MemberActionModal.css"
import Editable from "../editor/Editable"

interface Trainer {
  id: number
  name: string
  role: string
}

interface EnhancedMemberActionModalProps {
  isOpen: boolean
  onClose: () => void
  member: User | null
  onEditProfile: (member: User) => void
  onRenewPlan: (member: User, packageId: number, amount: number, customDuration?: number, skipTransaction?: boolean) => void
  onSendMessage: (member: User) => void
  realTimeEnabled?: boolean
  optimisticUpdates?: boolean
}

const EnhancedMemberActionModal: React.FC<EnhancedMemberActionModalProps> = ({
  isOpen,
  onClose,
  member,
  onEditProfile,
  onRenewPlan,
  onSendMessage,
  realTimeEnabled = true,
  optimisticUpdates = true,
}) => {
  // Debug log to confirm enhanced modal is being used
  console.log('🚀 EnhancedMemberActionModal loaded!', { member, isOpen });

    // Active tab state for dynamic right panel
    type TabType = "profile" | "payments" | "attendance" | "renew" | "message" | "trainers" | "delete";
    const [activeTab, setActiveTab] = useState<TabType>("profile")

  const { user: authUser } = useAuth()
  const activeGymId = authUser?.activeGymId

  // Local member state for real-time updates (stays open after save)
  const [localMember, setLocalMember] = useState<User | null>(member)

  // Sync localMember when member prop changes (when modal opens with new member)
  useEffect(() => {
    if (member) {
      setLocalMember(member)
    }
  }, [member?.userId])

  // Legacy sub-modal state (will be replaced by tab system)
  const [activeSubModal, setActiveSubModal] = useState<"edit" | "renew" | "message" | null>(null)
  const [showTrainerSearch, setShowTrainerSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Real-time data hook - TEMPORARILY DISABLED to fix infinite refresh
  const {
    userData,
    isLoading: isRealTimeLoading,
    isConnected,
    error: realTimeError,
    refetch
  } = useRealTimeData({
    userId: member?.userId || 0,
    enabled: false, // Disabled to prevent infinite refresh
    onError: (error) => {
      console.error('[EnhancedMemberActionModal] Real-time data error:', error);
      showToast.error(`Real-time connection error: ${error.message}`);
    }
  });

  // Optimistic updates hook - SIMPLIFIED to prevent infinite refresh
  const {
    performUpdate,
    revertUpdate,
    isOperationPending
  } = {
    performUpdate: (operation: any) => `operation_${Date.now()}`,
    revertUpdate: (operationId: string) => { },
    isOperationPending: (key: string) => false
  };

  // Micro-interactions hook - SIMPLIFIED to prevent infinite refresh
  const {
    triggerHover,
    showLoading,
    showSuccess,
    showError,
    clearLoading,
    isLoading,
    successStates
  } = {
    triggerHover: (element: any) => { },
    showLoading: (key: string) => { },
    showSuccess: (message: string) => showToast.success(message),
    showError: (error: any) => showToast.error(error.message || 'Operation failed'),
    clearLoading: (key: string) => { },
    isLoading: (key: string) => false,
    successStates: {} as any
  };

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    joinDate: "",
    notes: "",
    avatarId: null as string | null,
  })

  // Avatar Picker Popup
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // Tiered plan renewal state
  const [tieredPlans, setTieredPlans] = useState<any[]>([])
  const [tieredPlansLoading, setTieredPlansLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [isRenewing, setIsRenewing] = useState(false)

  // Derived: selected plan & variant objects
  const selectedPlan = tieredPlans.find((p: any) => p.planId === selectedPlanId) || null
  const selectedVariant = selectedPlan?.variants?.find((v: any) => v.variantId === selectedVariantId) || null

  // Load tiered plans when renew tab opens
  useEffect(() => {
    if (activeTab === "renew") {
      setTieredPlansLoading(true)
      api.getActiveTieredPlans()
        .then((plans: any[]) => {
          setTieredPlans(plans)
          // Auto-select recommended plan, or first plan
          const recommended = plans.find((p: any) => p.isRecommended)
          const defaultPlan = recommended || plans[0]
          if (defaultPlan) {
            setSelectedPlanId(defaultPlan.planId)
            // Auto-select popular variant, or first active variant
            const variants = defaultPlan.variants?.filter((v: any) => v.isActive !== false) || []
            const popular = variants.find((v: any) => v.isPopular)
            const defaultVariant = popular || variants[0]
            if (defaultVariant) setSelectedVariantId(defaultVariant.variantId)
          }
        })
        .catch((err: any) => {
          console.error('[EnhancedMemberActionModal] Failed to load tiered plans:', err)
          setTieredPlans([])
        })
        .finally(() => setTieredPlansLoading(false))
    }
  }, [activeTab])

  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
  })

  // Assigned trainers state
    const [assignedTrainers, setAssignedTrainers] = useState<User[]>([])

    // Payment history state
    const [transactions, setTransactions] = useState<any[]>([])
    const [transactionsLoading, setTransactionsLoading] = useState(false)

    // Attendance/check-in state
    const [checkIns, setCheckIns] = useState<any[]>([])
    const [checkInsLoading, setCheckInsLoading] = useState(false)

    // Notes state
    const [memberNotes, setMemberNotes] = useState<any[]>([])
    const [notesLoading, setNotesLoading] = useState(false)
    const [newNote, setNewNote] = useState("")

    // Emergency contact form state
    const [emergencyForm, setEmergencyForm] = useState({
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    })

    // Health info form state
    const [healthForm, setHealthForm] = useState({
      healthNotes: '',
      fitnessGoals: '',
    })

  // Load assigned trainers using real API
  const loadAssignedTrainers = useCallback(async () => {
    if (!member) return

    try {
      // Use the real API to get customer's trainers
      const trainers = await api.getCustomerTrainers(member.userId);
      setAssignedTrainers(trainers);
    } catch (error) {
      console.error('[EnhancedMemberActionModal] Failed to load trainers:', error)
    }
  }, [member?.userId])

  // Search for available trainers using real API
  const searchAvailableTrainers = useCallback(async (query: string) => {
    if (!member) return

    try {
      setIsSearching(true)

      // Use the real API to search for trainers
      const trainers = await api.searchUsers('TRAINER', query);
      setAvailableTrainers(trainers);
    } catch (error) {
      console.error('[EnhancedMemberActionModal] Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [member?.userId])

  // Debounced search effect
  useEffect(() => {
    if (!showTrainerSearch) return

    const timeoutId = setTimeout(() => {
      searchAvailableTrainers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, showTrainerSearch, searchAvailableTrainers])

    // Load initial data
    useEffect(() => {
      if (isOpen && member) {
        loadAssignedTrainers()

        // Initialize form data
        setEditForm({
          fullName: member.fullName,
          email: member.email,
          phone: member.phoneNumber || "+91 98765 43210",
          joinDate: (((member as any).joinDate || member.createdAt || "") as string).split('T')[0],
          notes: "",
          avatarId: member.userId ? (localStorage.getItem(`avatar_${member.userId}`) || (member as any).avatarId || null) : null,
        })

        // Initialize emergency contact form
        setEmergencyForm({
          emergencyContactName: (member as any).emergencyContactName || '',
          emergencyContactPhone: (member as any).emergencyContactPhone || '',
          emergencyContactRelation: (member as any).emergencyContactRelation || '',
        })

        // Initialize health form
        setHealthForm({
          healthNotes: (member as any).healthNotes || '',
          fitnessGoals: (member as any).fitnessGoals || '',
        })
      }
    }, [isOpen, member?.userId, loadAssignedTrainers])

    // Load payment history when tab opens
    useEffect(() => {
      if (activeTab === 'payments' && member) {
        setTransactionsLoading(true)
        api.getMemberPayments(member.userId)
          .then(data => setTransactions(Array.isArray(data) ? data : []))
          .catch(() => setTransactions([]))
          .finally(() => setTransactionsLoading(false))
      }
    }, [activeTab, member?.userId])

    // Load attendance when tab opens
    useEffect(() => {
      if (activeTab === 'attendance' && member) {
        setCheckInsLoading(true)
        api.getMemberAttendance(member.userId)
          .then(data => setCheckIns(Array.isArray(data) ? data : []))
          .catch(() => setCheckIns([]))
          .finally(() => setCheckInsLoading(false))
      }
    }, [activeTab, member?.userId])

    // Load notes
    useEffect(() => {
      if (isOpen && member) {
        setNotesLoading(true)
        api.getMemberNotes(member.userId)
          .then(data => setMemberNotes(Array.isArray(data) ? data : []))
          .catch(() => setMemberNotes([]))
          .finally(() => setNotesLoading(false))
      }
    }, [isOpen, member?.userId])

    // Add a new note (persists to backend)
      const handleAddNote = async () => {
        if (!newNote.trim() || !member) return
        try {
          const noteDTO = {
            content: newNote.trim(),
            category: 'General',
            sessionType: 'Note',
          }
            const saved = await api.createMemberNote(member.userId, noteDTO)
          // Add to local state with returned data or fallback
          const note = saved || {
            content: newNote.trim(),
            author: 'Admin',
            createdAt: new Date().toISOString(),
          }
          setMemberNotes(prev => [note, ...prev])
          setNewNote('')
          showToast.success('Note added')
        } catch (error) {
          console.error('Failed to save note:', error)
          // Still add locally as fallback
          const note = {
            content: newNote.trim(),
            author: 'Admin',
            createdAt: new Date().toISOString(),
          }
          setMemberNotes(prev => [note, ...prev])
          setNewNote('')
          showToast.warning?.('Note added locally (save failed)') || showToast.success('Note added')
        }
      }

    // Save emergency contact
    const handleSaveEmergency = async () => {
      if (!localMember) return
      try {
        await api.updateUser(localMember.userId, {
          emergencyContactName: emergencyForm.emergencyContactName,
          emergencyContactPhone: emergencyForm.emergencyContactPhone,
          emergencyContactRelation: emergencyForm.emergencyContactRelation,
        })
        // Update local state so data persists across tab switches
        setLocalMember(prev => prev ? { ...prev, ...emergencyForm } as any : prev)
        showToast.success('Emergency contact saved')
      } catch {
        showToast.error('Failed to save emergency contact')
      }
    }

    // Save health info
    const handleSaveHealth = async () => {
      if (!localMember) return
      try {
        await api.updateUser(localMember.userId, {
          healthNotes: healthForm.healthNotes,
          fitnessGoals: healthForm.fitnessGoals,
        })
        // Update local state so data persists across tab switches
        setLocalMember(prev => prev ? { ...prev, ...healthForm } as any : prev)
        showToast.success('Health info saved')
      } catch {
        showToast.error('Failed to save health info')
      }
    }

    // Phone input formatter - only allow digits, spaces, +, and hyphens
    const handleEmergencyPhoneChange = (value: string) => {
      // Strip non-phone characters
      const cleaned = value.replace(/[^0-9+\-\s]/g, '')
      setEmergencyForm(prev => ({ ...prev, emergencyContactPhone: cleaned }))
    }

    // Emergency phone validation
    const isValidEmergencyPhone = (phone: string) => {
      if (!phone.trim()) return true // empty is ok (optional)
      const digitsOnly = phone.replace(/[\s\-+]/g, '').replace(/^91/, '')
      return /^[0-9]{10}$/.test(digitsOnly)
    }

  // Handle trainer assignment - SIMPLIFIED to prevent infinite refresh
  const handleAddTrainer = async (trainer: User) => {
    if (!member) return

    // Check if trainer is already assigned
    const isAlreadyAssigned = assignedTrainers.some(t => t.userId === trainer.userId)
    if (isAlreadyAssigned) {
      showError('Trainer is already assigned to this member')
      return
    }

    try {
      // Optimistically add trainer to the list
      setAssignedTrainers(prev => [...prev, trainer])
      setShowTrainerSearch(false)
      setSearchQuery("")

      // Perform actual assignment
      await api.assignCustomerToTrainer(trainer.userId, member.userId)

      showSuccess('Trainer assigned successfully')
    } catch (error) {
      // Revert optimistic update on failure
      setAssignedTrainers(prev => prev.filter(t => t.userId !== trainer.userId))
      showError('Failed to assign trainer')
    }
  }

  // Handle trainer removal - SIMPLIFIED to prevent infinite refresh
  const handleRemoveTrainer = async (trainerId: number) => {
    if (!member) return

    const trainerToRemove = assignedTrainers.find(t => t.userId === trainerId)
    if (!trainerToRemove) return

    try {
      // Optimistically remove trainer from the list
      setAssignedTrainers(prev => prev.filter(t => t.userId !== trainerId))

      // Perform actual removal
      await api.removeCustomerFromTrainer(trainerId, member.userId)

      showSuccess('Trainer removed successfully')
    } catch (error) {
      // Revert optimistic update on failure
      setAssignedTrainers(prev => [...prev, trainerToRemove])
      showError('Failed to remove trainer')
    }
  }

  // Handle profile editing
  const handleEditProfile = () => {
    if (member) {
      setEditForm({
        fullName: member.fullName,
        email: member.email,
        phone: member.phoneNumber || "+91 98765 43210",
        joinDate: (((member as any).joinDate || member.createdAt || "") as string).split('T')[0],
        notes: "",
        avatarId: member.userId ? (localStorage.getItem(`avatar_${member.userId}`) || (member as any).avatarId || null) : null,
      })
    }
    setActiveSubModal("edit")
  }

  const handleSaveProfile = async () => {
    if (!localMember) return

    try {
      showLoading('save-profile')

      // Create a properly typed member object for the callback and local state
      const updatedMember: any = {
        ...localMember, // Use localMember as base
        ...editForm,
        // Map phone to backend field
        phone: editForm.phone,
        // Map joinDate to backend field if changed
        joinDate: editForm.joinDate
      };

      // Remove frontend-only fields
      delete updatedMember.phoneNumber;

      // Persist avatar to localStorage
      if (editForm.avatarId) {
        localStorage.setItem(`avatar_${localMember.userId}`, editForm.avatarId)
      } else {
        localStorage.removeItem(`avatar_${localMember.userId}`)
      }

      console.log('Sending update payload:', updatedMember)
      const savedUser = await api.updateUser(localMember.userId, updatedMember)

      // Update local state for immediate UI refresh (keep modal open)
      setLocalMember({ ...updatedMember, createdAt: editForm.joinDate ? `${editForm.joinDate}T00:00:00` : localMember.createdAt })

      // Notify parent component
      onEditProfile(updatedMember)

      showToast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast.error("Failed to update profile")
    } finally {
      clearLoading('save-profile')
    }
  }

  // Other handlers
  const handleRenewPlan = () => setActiveSubModal("renew")
  const handleMessageMember = () => {
    setActiveSubModal("message")
    setMessageForm({ subject: "", body: "" })
  }

  const handleRenewAndPay = async (isUpgrade: boolean = false) => {
    if (!localMember || !selectedPlanId || !selectedVariantId || !selectedVariant) return

    try {
      setIsRenewing(true)
      const result = await api.renewMembershipWithPlan(
        localMember.userId,
        selectedPlanId,
        selectedVariantId,
        activeGymId,
        isUpgrade
      )

      // Update local member state for real-time display
      const updatedMemberData = localMember ? {
        ...localMember,
        planName: result.planName || selectedPlan?.planName || 'Active Plan',
        status: 'Active',
        membershipStatus: 'Active',
        endDate: result.endDate,
        membershipEndDate: result.endDate,
      } as User : null;

      setLocalMember(updatedMemberData)

      // Notify parent component to refresh the list
      if (updatedMemberData) {
        onEditProfile(updatedMemberData);
      }

      showSuccess('Plan renewed successfully!')
    } catch (error: any) {
      console.error('Renewal failed:', error)
      showToast.error(error?.response?.data?.error || 'Failed to renew membership')
    } finally {
      setIsRenewing(false)
    }
  }

    const handleSendMessage = async () => {
      if (!localMember) return

      try {
        showLoading('send-message')

          // Send message via backend notification API
          await api.sendMemberMessage(localMember.userId, {
            subject: messageForm.subject || `Message to ${localMember.fullName}`,
            body: messageForm.body,
          })

        onSendMessage(localMember)
        showSuccess(`Message sent to ${localMember.fullName}`)
        setMessageForm({ subject: '', body: '' })
      } catch (error) {
        showError({
          code: 'MESSAGE_SEND_FAILED',
          message: 'Failed to send message',
          recoverable: true,
          retryable: true
        })
      } finally {
        clearLoading('send-message')
      }
    }

  // Plan badge helpers (consistent with MemberList)
  const getPlanIcon = (planName: string | undefined) => {
    const plan = (planName || '').toLowerCase()
    if (plan.includes('platinum') || plan.includes('elite')) return '👑'
    if (plan.includes('premium') || plan.includes('vip')) return '💎'
    if (plan.includes('gold')) return '⭐'
    if (plan.includes('standard')) return '🏅'
    if (plan.includes('corporate')) return '🏢'
    if (plan.includes('student')) return '🎓'
    if (plan.includes('basic') || plan.includes('starter')) return '📦'
    if (!planName || plan === 'no plan') return ''
    return '🏋️'
  }

  const getPlanBadgeClass = (planName: string | undefined) => {
    const plan = (planName || '').toLowerCase()
    if (!planName || plan === 'no plan') return 'member-plan--none'
    if (plan.includes('platinum') || plan.includes('elite')) return 'member-plan--platinum'
    if (plan.includes('premium') || plan.includes('vip')) return 'member-plan--premium'
    if (plan.includes('gold')) return 'member-plan--gold'
    if (plan.includes('corporate')) return 'member-plan--corporate'
    if (plan.includes('student')) return 'member-plan--student'
    if (plan.includes('standard')) return 'member-plan--standard'
    if (plan.includes('basic') || plan.includes('starter')) return 'member-plan--basic'
    return 'member-plan--default'
  }

  // Helper functions
    const getPlanForMember = () => {
      // Use the actual planName from the local member data for real-time updates
      return (localMember as any)?.planName || (localMember as any)?.membershipPlanName || "No Plan"
    }

  const getStatusForMember = () => {
    // Use the actual status from the local member data for real-time updates
    // Prioritize membershipStatus if available, then status
    return (localMember as any)?.membershipStatus || (localMember as any)?.status || "Active"
  }

  // Validation helper functions
  const isValidFullName = (name: string) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim())
  }

  const isValidEmail = (email: string) => {
    // Comprehensive email validation: local@domain.tld (2-6 char TLD)
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,6})+$/
    return emailRegex.test(email.trim())
  }

  const isValidPhone = (phone: string) => {
    // Allow 10 digits, optionally with +91 prefix or spaces
    const digitsOnly = phone.replace(/[\s\-+]/g, '').replace(/^91/, '')
    return /^[0-9]{10}$/.test(digitsOnly)
  }

  const isEditFormValid = () => {
    return isValidFullName(editForm.fullName) &&
      isValidEmail(editForm.email) &&
      isValidPhone(editForm.phone)
  }

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

  // Handle member deletion
  const handleDeleteMember = async () => {
    if (!member) return

    try {
      setIsDeleting(true)
      await api.deleteUser(member.userId)
      showSuccess(`${member.fullName} has been deleted`)
      setShowDeleteConfirm(false)
      onClose()
      // Trigger a refresh of the member list (handled by parent component)
      window.location.reload()
    } catch (error) {
      showError('Failed to delete member')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate days remaining from membership end date
  const calculateDaysRemaining = (): number | null => {
    if (!localMember) return null

    // If no plan is assigned, don't show remaining days
    const currentPlan = (localMember as any)?.planName
    if (!currentPlan || currentPlan === "No Plan" || currentPlan === "None") return null

    // Try to get end date from various possible sources
    const endDateStr = (localMember as any).endDate ||
      (localMember as any).membershipEndDate ||
      (localMember as any).planEndDate

    if (!endDateStr) return null

    const endDate = new Date(endDateStr)
    const today = new Date()
    
    // Normalize to midnight for accurate day difference
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(endDate)
    targetDate.setHours(0, 0, 0, 0)

    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  const daysRemaining = calculateDaysRemaining()

  if (!member || !localMember) return null

  const modalContent =
    <>
      <Editable id="member-action-modal">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="member-action-overlay"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal Content Wrapper */}
              <motion.div
                className="member-action-modal member-action-modal--redesigned"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Profile Header - Premium Enterprise Design */}
                  <div className="member-action-modal__profile-header">
                    <div className="profile-header__avatar">
                      {editForm.avatarId ? (
                        <img src={getAvatarUrl(editForm.avatarId) || ''} alt={localMember.fullName} />
                      ) : (
                        <div className="avatar-initials" style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, var(--color-crimson), #b91c1c)',
                          color: 'white', fontWeight: 700, fontSize: '18px',
                        }}>
                          {localMember.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="profile-header__info">
                      <h2 className="profile-header__name">{localMember.fullName}</h2>
                      <p className="profile-header__email">{localMember.email}</p>
                    </div>

                      <div className="profile-header__meta">
                          <span className={`member-plan-badge ${getPlanBadgeClass(getPlanForMember())}`}>
                            <span className="plan-icon">{getPlanIcon(getPlanForMember())}</span>
                            {getPlanForMember()}
                          </span>
                          <div className={`modal-status-badge modal-status-badge--${(localMember.status || localMember.membershipStatus || 'Inactive').toLowerCase()}`}>
                            <span className="modal-status-badge__dot"></span>
                            {localMember.status || localMember.membershipStatus || 'Inactive'}
                          </div>
                        </div>

                    <div className="profile-header__stats">
                      <div className="stat-item">
                        <span className="stat-value">{assignedTrainers.length}</span>
                        <span className="stat-label">Trainers</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{daysRemaining !== null ? daysRemaining : '—'}</span>
                        <span className="stat-label">Days Left</span>
                      </div>
                    </div>

                    <button className="member-action-modal__close-inline" onClick={onClose}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                {/* Two-Column Content Layout with Dynamic Panels */}
                <div className="member-action-modal__content-grid">
                    {/* Left Column: Tab Navigation */}
                    <div className="member-action-modal__nav-column">
                      <nav className="side-panel-nav">
                        <span className="side-panel-nav__label">General</span>
                          {([
                            { id: "profile" as TabType, label: "Edit Profile", icon: "profile" },
                            { id: "renew" as TabType, label: "Membership Plan", icon: "renew" },
                            { id: "trainers" as TabType, label: "Assigned Trainers", icon: "trainers", badge: assignedTrainers.length },
                          ] as const).map(tab => (

                          <button key={tab.id}
                            className={`side-panel-nav__item ${activeTab === tab.id ? "side-panel-nav__item--active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <div className="nav-icon-wrap">
                              {tab.id === "profile" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                              {tab.id === "renew" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>}
                              {tab.id === "trainers" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                            </div>
                            <span>{tab.label}</span>
                            {'badge' in tab && tab.badge !== undefined && <span className="nav-badge">{tab.badge}</span>}
                          </button>
                        ))}

                        <div className="side-panel-nav__divider" />
                        <span className="side-panel-nav__label">History</span>
                        {([
                          { id: "payments" as TabType, label: "Payment History", icon: "payments" },
                          { id: "attendance" as TabType, label: "Attendance", icon: "attendance", badge: checkIns.length > 0 ? checkIns.length : undefined },
                        ] as const).map(tab => (
                          <button key={tab.id}
                            className={`side-panel-nav__item ${activeTab === tab.id ? "side-panel-nav__item--active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <div className="nav-icon-wrap">
                              {tab.id === "payments" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                              {tab.id === "attendance" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><path d="M9 14l2 2 4-4" /></svg>}
                            </div>
                            <span>{tab.label}</span>
                            {'badge' in tab && tab.badge !== undefined && <span className="nav-badge">{tab.badge}</span>}
                          </button>
                        ))}

                        <div className="side-panel-nav__divider" />
                        <span className="side-panel-nav__label">Communication</span>
                        <button
                          className={`side-panel-nav__item ${activeTab === "message" ? "side-panel-nav__item--active" : ""}`}
                          onClick={() => setActiveTab("message")}>
                          <div className="nav-icon-wrap">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </div>
                          <span>Message Member</span>
                        </button>

                        <button
                          className={`side-panel-nav__item side-panel-nav__item--danger ${activeTab === "delete" ? "side-panel-nav__item--active" : ""}`}
                          onClick={() => setActiveTab("delete")}>
                          <div className="nav-icon-wrap">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </div>
                          <span>Delete Member</span>
                        </button>
                      </nav>
                    </div>

                  {/* Right Column: Dynamic Content Panel */}
                  <div className="member-action-modal__content-panel">
                    <AnimatePresence mode="wait">
                      {/* Profile Edit Panel */}
                      {activeTab === "profile" && (
                        <motion.div
                          key="profile"
                          className="content-panel"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="content-panel__header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 className="content-panel__title" style={{ margin: 0 }}>Edit Profile</h4>
                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => setShowAvatarPicker(true)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              Choose Avatar
                            </button>
                          </div>

                          {/* Avatar Picker Popup Modal */}
                          <AnimatePresence>
                            {showAvatarPicker && (
                              <motion.div
                                className="member-action-overlay" /* reusing existing overlay class but z-index might need handling or just use nested div */
                                style={{ zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.5)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAvatarPicker(false)}
                              >
                                <motion.div
                                  className="avatar-picker-modal"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="avatar-picker-modal__header">
                                    <h5>Choose Member Avatar</h5>
                                    <button
                                      className="avatar-picker-modal__close"
                                      onClick={() => setShowAvatarPicker(false)}
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <AvatarPicker
                                    selectedId={editForm.avatarId}
                                    userId={localMember?.userId}
                                    variant="member"
                                    onSelect={(id) => {
                                      setEditForm(prev => ({ ...prev, avatarId: id }))
                                      setShowAvatarPicker(false)
                                      showToast.success("Avatar selected!")
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="content-panel__body">
                            <div className="form-row-2-col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Full Name</label>
                                <div className="input-with-validation">
                                  <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && isEditFormValid() && handleSaveProfile()}
                                    className={`form-input ${editForm.fullName.length > 0 ? (isValidFullName(editForm.fullName) ? 'input--valid' : 'input--invalid') : ''}`}
                                  />
                                  <ValidationIcon show={editForm.fullName.length > 0} isValid={isValidFullName(editForm.fullName)} />
                                </div>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Email</label>
                                <div className="input-with-validation">
                                  <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && isEditFormValid() && handleSaveProfile()}
                                    className={`form-input ${editForm.email.length > 0 ? (isValidEmail(editForm.email) ? 'input--valid' : 'input--invalid') : ''}`}
                                  />
                                  <ValidationIcon show={editForm.email.length > 0} isValid={isValidEmail(editForm.email)} />
                                </div>
                              </div>
                            </div>

                            <div className="form-row-2-col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Phone</label>
                                <div className="input-with-validation">
                                  <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && isEditFormValid() && handleSaveProfile()}
                                    className={`form-input ${editForm.phone.length > 0 ? (isValidPhone(editForm.phone) ? 'input--valid' : 'input--invalid') : ''}`}
                                  />
                                  <ValidationIcon show={editForm.phone.length > 0} isValid={isValidPhone(editForm.phone)} />
                                </div>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Join Date</label>
                                <input
                                  type="date"
                                  value={editForm.joinDate}
                                  onChange={(e) => setEditForm({ ...editForm, joinDate: e.target.value })}
                                  className="form-input"
                                />
                              </div>
                            </div>
                            </div>
                            <div className="form-actions">
                              <button
                                className="btn btn--primary"
                                onClick={handleSaveProfile}
                                disabled={!isEditFormValid()}
                              >
                                Save Changes
                              </button>
                            </div>

                              {/* Emergency Contact Section */}
                              <div className="profile-section">
                                <h5 className="profile-section__title">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  Emergency Contact
                                </h5>
                                <div className="form-row-2-col">
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Contact Name</label>
                                    <input
                                      type="text"
                                      value={emergencyForm.emergencyContactName}
                                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                                      className="form-input"
                                      placeholder="Emergency contact name"
                                    />
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Contact Phone</label>
                                    <div className="input-with-validation">
                                      <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={emergencyForm.emergencyContactPhone}
                                        onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                                        onKeyDown={(e) => {
                                          // Block letters and special chars except allowed keys
                                          const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '+', '-', ' ']
                                          if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                                            e.preventDefault()
                                          }
                                        }}
                                        className={`form-input ${emergencyForm.emergencyContactPhone.length > 0 ? (isValidEmergencyPhone(emergencyForm.emergencyContactPhone) ? 'input--valid' : 'input--invalid') : ''}`}
                                        placeholder="+91 98765 43210"
                                        maxLength={15}
                                      />
                                      <ValidationIcon show={emergencyForm.emergencyContactPhone.length > 0} isValid={isValidEmergencyPhone(emergencyForm.emergencyContactPhone)} />
                                    </div>
                                  </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0, marginTop: 8 }}>
                                  <label>Relationship</label>
                                  <select
                                    value={emergencyForm.emergencyContactRelation}
                                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                                    className="form-select"
                                  >
                                    <option value="">Select relationship</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                                <div className="form-actions" style={{ marginTop: 8 }}>
                                  <button
                                    className="btn btn--secondary btn--sm"
                                    onClick={handleSaveEmergency}
                                    disabled={emergencyForm.emergencyContactPhone.length > 0 && !isValidEmergencyPhone(emergencyForm.emergencyContactPhone)}
                                  >
                                    Save Emergency Contact
                                  </button>
                                </div>
                              </div>

                            {/* Health Information Section */}
                            <div className="profile-section">
                              <h5 className="profile-section__title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                                Health Information
                              </h5>
                              <div className="form-group" style={{ marginBottom: 8 }}>
                                <label>Health Notes / Medical Conditions</label>
                                <textarea
                                  value={healthForm.healthNotes}
                                  onChange={(e) => setHealthForm(prev => ({ ...prev, healthNotes: e.target.value }))}
                                  className="form-input"
                                  rows={2}
                                  placeholder="Allergies, conditions, medications..."
                                  style={{ resize: 'vertical', minHeight: 50 }}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fitness Goals</label>
                                <textarea
                                  value={healthForm.fitnessGoals}
                                  onChange={(e) => setHealthForm(prev => ({ ...prev, fitnessGoals: e.target.value }))}
                                  className="form-input"
                                  rows={2}
                                  placeholder="Weight loss, muscle gain, endurance..."
                                  style={{ resize: 'vertical', minHeight: 50 }}
                                />
                              </div>
                              <div className="form-actions" style={{ marginTop: 8 }}>
                                <button className="btn btn--secondary btn--sm" onClick={handleSaveHealth}>
                                  Save Health Info
                                </button>
                              </div>
                            </div>

                            {/* Notes Section */}
                            <div className="profile-section">
                              <h5 className="profile-section__title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                Staff Notes
                                <span className="nav-badge" style={{ marginLeft: 6 }}>{memberNotes.length}</span>
                              </h5>
                              <div className="notes-add-row">
                                <input
                                  type="text"
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                  className="form-input"
                                  placeholder="Add a note..."
                                />
                                <button className="btn btn--primary btn--sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                                  Add
                                </button>
                              </div>
                              <div className="notes-list">
                                {memberNotes.length === 0 && !notesLoading && (
                                  <p className="notes-empty">No notes yet</p>
                                )}
                                {memberNotes.map((note, i) => (
                                  <div key={i} className="note-item">
                                    <div className="note-item__header">
                                      <span className="note-item__author">{note.author || 'Admin'}</span>
                                      <span className="note-item__date">
                                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                                      </span>
                                    </div>
                                    <p className="note-item__content">{note.content}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Payment History Panel */}
                        {activeTab === "payments" && (
                          <motion.div
                            key="payments"
                            className="content-panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h4 className="content-panel__title">Payment History</h4>
                            <div className="content-panel__body">
                              {transactionsLoading ? (
                                <div className="empty-state"><p>Loading payments...</p></div>
                              ) : transactions.length === 0 ? (
                                <div className="empty-state">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                  </svg>
                                  <p>No payment records found</p>
                                  <span>Payments will appear here when recorded</span>
                                </div>
                              ) : (
                                <div className="transactions-list">
                                  {transactions.map((tx, i) => (
                                    <div key={tx.transactionId || i} className="transaction-item">
                                      <div className="transaction-item__left">
                                        <span className={`transaction-item__icon ${tx.type === 'INCOME' ? 'transaction-item__icon--income' : 'transaction-item__icon--expense'}`}>
                                          {tx.type === 'INCOME' ? '+' : '-'}
                                        </span>
                                        <div className="transaction-item__info">
                                          <span className="transaction-item__desc">{tx.description || tx.category || 'Payment'}</span>
                                          <span className="transaction-item__date">
                                            {tx.dateTime ? new Date(tx.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="transaction-item__right">
                                        <span className={`transaction-item__amount ${tx.type === 'INCOME' ? 'transaction-item__amount--positive' : 'transaction-item__amount--negative'}`}>
                                          {tx.type === 'INCOME' ? '+' : '-'}₹{Math.abs(Number(tx.amount) || 0).toLocaleString()}
                                        </span>
                                        <span className={`transaction-item__status transaction-item__status--${(tx.status || '').toLowerCase()}`}>
                                          {tx.status || 'Completed'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* Attendance / Check-in History Panel */}
                        {activeTab === "attendance" && (
                          <motion.div
                            key="attendance"
                            className="content-panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h4 className="content-panel__title">Attendance History</h4>
                            <div className="content-panel__body">
                              {/* Attendance summary */}
                              <div className="attendance-summary">
                                <div className="attendance-stat">
                                  <span className="attendance-stat__value">{checkIns.length}</span>
                                  <span className="attendance-stat__label">Total Visits</span>
                                </div>
                                <div className="attendance-stat">
                                  <span className="attendance-stat__value">
                                    {checkIns.filter(c => {
                                      const d = new Date(c.checkInTime)
                                      const now = new Date()
                                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                                    }).length}
                                  </span>
                                  <span className="attendance-stat__label">This Month</span>
                                </div>
                                <div className="attendance-stat">
                                  <span className="attendance-stat__value">
                                    {checkIns.length > 0 ? (() => {
                                      const durations = checkIns
                                        .filter(c => c.checkOutTime)
                                        .map(c => (new Date(c.checkOutTime).getTime() - new Date(c.checkInTime).getTime()) / (1000 * 60))
                                      return durations.length > 0 ? `${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)}m` : '—'
                                    })() : '—'}
                                  </span>
                                  <span className="attendance-stat__label">Avg Duration</span>
                                </div>
                              </div>

                              {checkInsLoading ? (
                                <div className="empty-state"><p>Loading attendance...</p></div>
                              ) : checkIns.length === 0 ? (
                                <div className="empty-state">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                  <p>No check-in records found</p>
                                  <span>Check-ins will appear here</span>
                                </div>
                              ) : (
                                <div className="checkins-list">
                                  {checkIns.slice(0, 50).map((ci, i) => {
                                    const inTime = new Date(ci.checkInTime)
                                    const outTime = ci.checkOutTime ? new Date(ci.checkOutTime) : null
                                    const duration = outTime ? Math.round((outTime.getTime() - inTime.getTime()) / (1000 * 60)) : null
                                    return (
                                      <div key={ci.checkInId || i} className="checkin-item">
                                        <div className="checkin-item__date">
                                          <span className="checkin-item__day">{inTime.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                          <span className="checkin-item__full-date">{inTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="checkin-item__times">
                                          <span className="checkin-item__in">In: {inTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                          {outTime && (
                                            <span className="checkin-item__out">Out: {outTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                          )}
                                        </div>
                                        {duration !== null && (
                                          <span className="checkin-item__duration">{duration}m</span>
                                        )}
                                        <span className={`checkin-item__status checkin-item__status--${(ci.status || '').replace(/\s+/g, '-').toLowerCase()}`}>
                                          {ci.status || 'check-in'}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* Renew Plan Panel */}
                      {activeTab === "renew" && (
                        <motion.div
                          key="renew"
                          className="content-panel"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                              <h4 className="content-panel__title">Membership Management</h4>
                              <div className="content-panel__body">

                              {/* Current plan info */}
                                <div className="current-plan-info">
                                  <span className="current-plan-label">Current Plan</span>
                                  <span className={`member-plan-badge ${getPlanBadgeClass(getPlanForMember())}`}>
                                    <span className="plan-icon">{getPlanIcon(getPlanForMember())}</span>
                                    {getPlanForMember()}
                                  </span>
                                </div>

                              {tieredPlansLoading ? (
                                <div className="empty-state"><p>Loading plans...</p></div>
                              ) : tieredPlans.length === 0 ? (
                                <div className="empty-state">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                  </svg>
                                  <p>No membership plans available</p>
                                  <span>Create plans in Settings to enable renewals</span>
                                </div>
                              ) : (
                                <>
                                  {/* Plan Selection Cards */}
                                  <div className="renew-plans-grid">
                                    {tieredPlans.map((plan: any) => {
                                      const isSelected = selectedPlanId === plan.planId
                                      const activeVariants = (plan.variants || []).filter((v: any) => v.isActive !== false)
                                      const lowestPrice = activeVariants.length > 0
                                        ? Math.min(...activeVariants.map((v: any) => v.price))
                                        : 0
                                      return (
                                        <div
                                          key={plan.planId}
                                          className={`renew-plan-card ${isSelected ? 'renew-plan-card--selected' : ''} ${plan.isRecommended ? 'renew-plan-card--recommended' : ''}`}
                                          onClick={() => {
                                            setSelectedPlanId(plan.planId)
                                            // Auto-select popular or first variant
                                            const popular = activeVariants.find((v: any) => v.isPopular)
                                            setSelectedVariantId((popular || activeVariants[0])?.variantId || null)
                                          }}
                                          style={{ borderColor: isSelected ? (plan.planColor || '#6C63FF') : undefined }}
                                        >
                                          {plan.isRecommended && (
                                            <span className="renew-plan-card__badge" style={{ background: plan.planColor || '#6C63FF' }}>Recommended</span>
                                          )}
                                          <div className="renew-plan-card__header" style={{ color: plan.planColor || '#6C63FF' }}>
                                              <span className="renew-plan-card__icon">
                                                {getPlanIcon(plan.planName)}
                                              </span>
                                              <h5 className="renew-plan-card__name">{plan.planName}</h5>
                                            </div>
                                          {plan.description && (
                                            <p className="renew-plan-card__desc">{plan.description}</p>
                                          )}
                                          <div className="renew-plan-card__price">
                                            <span className="renew-plan-card__price-from">from</span>
                                            <span className="renew-plan-card__price-value">₹{lowestPrice.toLocaleString()}</span>
                                          </div>
                                          {/* Plan features */}
                                          {plan.features && plan.features.length > 0 && (
                                            <ul className="renew-plan-card__features">
                                              {plan.features.slice(0, 4).map((f: any, i: number) => (
                                                <li key={f.featureId || i} className={f.isIncluded ? 'included' : 'excluded'}>
                                                  {f.isIncluded ? '✓' : '✗'} {f.name}
                                                </li>
                                              ))}
                                              {plan.features.length > 4 && (
                                                <li className="more">+{plan.features.length - 4} more</li>
                                              )}
                                            </ul>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>

                                  {/* Variant (Duration) Picker */}
                                  {selectedPlan && (
                                    <div className="renew-variant-section">
                                      <label className="renew-variant-label">Select Duration</label>
                                      <div className="renew-variant-pills">
                                        {(selectedPlan.variants || [])
                                          .filter((v: any) => v.isActive !== false)
                                          .map((variant: any) => {
                                            const isVarSelected = selectedVariantId === variant.variantId
                                            const durationLabel = variant.durationValue + ' ' + (variant.durationUnit || 'MONTHS').toLowerCase().replace(/s$/, '') + (variant.durationValue > 1 ? 's' : '')
                                            return (
                                              <button
                                                key={variant.variantId}
                                                className={`renew-variant-pill ${isVarSelected ? 'renew-variant-pill--selected' : ''} ${variant.isPopular ? 'renew-variant-pill--popular' : ''}`}
                                                onClick={() => setSelectedVariantId(variant.variantId)}
                                              >
                                                <span className="renew-variant-pill__duration">{durationLabel}</span>
                                                <span className="renew-variant-pill__price">₹{Number(variant.price).toLocaleString()}</span>
                                                {variant.discountPercent > 0 && (
                                                  <span className="renew-variant-pill__discount">{variant.discountPercent}% off</span>
                                                )}
                                                {variant.isPopular && <span className="renew-variant-pill__popular-tag">Popular</span>}
                                              </button>
                                            )
                                          })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Selected variant summary */}
                                  {selectedVariant && (
                                    <div className="renew-summary">
                                      <div className="renew-summary__row">
                                        <span>Plan</span>
                                        <span>{selectedPlan?.planName}</span>
                                      </div>
                                      <div className="renew-summary__row">
                                        <span>Duration</span>
                                        <span>{selectedVariant.durationValue} {(selectedVariant.durationUnit || 'MONTHS').toLowerCase()}</span>
                                      </div>
                                      {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                                        <div className="renew-summary__row renew-summary__row--discount">
                                          <span>Original Price</span>
                                          <span className="renew-summary__strikethrough">₹{Number(selectedVariant.originalPrice).toLocaleString()}</span>
                                        </div>
                                      )}
                                      {selectedVariant.includedPTSessions > 0 && (
                                        <div className="renew-summary__row">
                                          <span>Included PT Sessions</span>
                                          <span>{selectedVariant.includedPTSessions}</span>
                                        </div>
                                      )}
                                      <div className="renew-summary__row renew-summary__row--total">
                                        <span>Total Amount</span>
                                        <span className="renew-summary__total">₹{Number(selectedVariant.price).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                              <div className="form-actions">
                                {selectedPlan?.planName === getPlanForMember() ? (
                                  <button
                                    className="btn btn--primary btn-renew-wide"
                                    onClick={() => handleRenewAndPay(false)}
                                    disabled={!selectedPlanId || !selectedVariantId || isRenewing}
                                  >
                                    {isRenewing ? 'Processing...' : 'Extend Current Plan'}
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn--primary btn-renew-wide"
                                    onClick={() => handleRenewAndPay(true)}
                                    disabled={!selectedPlanId || !selectedVariantId || isRenewing}
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                                  >
                                    {isRenewing ? 'Processing...' : getPlanForMember() === 'No Plan' ? 'Activate Plan' : 'Upgrade / Change Plan'}
                                  </button>
                                )}
                              </div>

                        </motion.div>
                      )}

                      {/* Message Panel */}
                      {activeTab === "message" && (
                        <motion.div
                          key="message"
                          className="content-panel"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h4 className="content-panel__title">Send Message</h4>
                          <div className="message-compose">
                            {/* Recipient Row - macOS Mail style */}
                            <div className="message-compose__row">
                              <span className="message-compose__label">To:</span>
                              <div className="message-compose__recipient">
                                <span className="recipient-tag">
                                  {localMember.fullName}
                                  <span className="recipient-email">&lt;{localMember.email}&gt;</span>
                                </span>
                              </div>
                            </div>

                            {/* Subject Row */}
                            <div className="message-compose__row">
                              <span className="message-compose__label">Subject:</span>
                              <input
                                type="text"
                                value={messageForm.subject}
                                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="message-compose__input"
                                placeholder="Enter subject..."
                              />
                            </div>

                            {/* Message Body */}
                            <div className="message-compose__body">
                              <textarea
                                value={messageForm.body}
                                onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault()
                                    handleSendMessage()
                                  }
                                }}
                                className="message-compose__textarea"
                                placeholder="Write your message here..."
                              />
                              <span className="message-compose__hint">⌘ + Enter to send</span>
                            </div>
                          </div>
                          <div className="form-actions">
                            <button className="btn btn--primary" onClick={handleSendMessage}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                              Send
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Assigned Trainers Panel */}
                      {activeTab === "trainers" && (
                        <motion.div
                          key="trainers"
                          className="content-panel"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Header Row: Title + Add Button */}
                          <div className="trainers-header">
                            <h4 className="trainers-header__title">
                              Assigned Trainers
                              <span className="trainers-count">{assignedTrainers.length}</span>
                            </h4>
                            <div className="trainers-header__action">
                              <button
                                className={`add-trainer-btn ${showTrainerSearch ? 'add-trainer-btn--active' : ''}`}
                                onClick={() => setShowTrainerSearch(!showTrainerSearch)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Trainer
                              </button>

                              {/* Floating Popover Panel */}
                              <AnimatePresence>
                                {showTrainerSearch && (
                                  <motion.div
                                    className="trainer-popover"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="trainer-popover__header">
                                      <span>Search Trainers</span>
                                      <button
                                        className="trainer-popover__close"
                                        onClick={() => setShowTrainerSearch(false)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      className="trainer-popover__input"
                                      placeholder="Type trainer name..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Escape' && setShowTrainerSearch(false)}
                                      autoFocus
                                    />
                                    <div className="trainer-popover__results">
                                      {isSearching && (
                                        <div className="trainer-popover__loading">Searching...</div>
                                      )}

                                      {!isSearching && (() => {
                                        // MEMOIZED FILTERING: Filter out trainers that are already assigned
                                        // Using useMemo here would be ideal if this block was its own component, 
                                        // but for now we rely on the fact that this is fast enough for <1000 items.
                                        // The LAG issue is likely mostly due to re-renders.

                                        const unassignedTrainers = availableTrainers.filter(
                                          trainer => !assignedTrainers.some(assigned => assigned.userId === trainer.userId)
                                        );

                                        if (unassignedTrainers.length === 0) {
                                          if (availableTrainers.length > 0) {
                                            return <div className="trainer-popover__empty">All matching trainers are already assigned.</div>;
                                          } else if (searchQuery.length > 0) {
                                            return <div className="trainer-popover__empty">No trainers found</div>;
                                          }
                                          return null;
                                        }

                                        return unassignedTrainers.map((trainer) => (
                                          <div
                                            key={trainer.userId}
                                            className="trainer-popover__item"
                                            onClick={() => {
                                              handleAddTrainer(trainer)
                                              // Close immediately - optimistically handled
                                            }}
                                          >
                                            <div className="trainer-popover__avatar">
                                              {trainer.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div className="trainer-popover__info">
                                              <span className="trainer-popover__name">{trainer.fullName}</span>
                                              <span className="trainer-popover__email">{trainer.email}</span>
                                            </div>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Scrollable Trainers List */}
                          <div className="content-panel__body">
                            <div className="trainers-list">
                              {assignedTrainers.length === 0 ? (
                                <div className="empty-state">
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                  <p>No trainers assigned yet</p>
                                  <span>Click "Add Trainer" to assign one</span>
                                </div>
                              ) : (
                                assignedTrainers.map((trainer) => (
                                  <div key={trainer.userId} className="trainer-item">
                                    <div className="trainer-item__info">
                                      <div className="trainer-item__avatar">
                                        {trainer.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                      </div>
                                      <div>
                                        <span className="trainer-item__name">{trainer.fullName}</span>
                                        <span className="trainer-item__role">Personal Trainer</span>
                                      </div>
                                    </div>
                                    <button
                                      className="trainer-item__remove"
                                      onClick={() => handleRemoveTrainer(trainer.userId)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Delete Profile Panel */}
                      {activeTab === "delete" && (
                        <motion.div
                          key="delete"
                          className="content-panel content-panel--danger"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h4 className="content-panel__title content-panel__title--danger">Delete Profile</h4>
                          <div className="content-panel__body">
                            <div className="delete-warning">
                              <div className="delete-warning__icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                              </div>
                              <h5>Are you sure?</h5>
                              <p>You are about to permanently delete <strong>{localMember.fullName}</strong>.</p>
                              <p className="delete-warning__note">This action cannot be undone.</p>
                            </div>
                            <div className="delete-actions">
                              <button className="btn btn--secondary" onClick={() => setActiveTab("profile")}>
                                Cancel
                              </button>
                              <button
                                className="btn btn--danger"
                                onClick={handleDeleteMember}
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Deleting...' : 'Delete Member'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Sub-modals remain the same but with loading states */}
              {/* Edit Profile Sub-Modal */}
              <AnimatePresence>
                {activeSubModal === "edit" && (
                  <motion.div
                    className="sub-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveSubModal(null)}
                  >
                    <motion.div
                      className="sub-modal"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, scale: 0.95, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    >
                      <div className="sub-modal__header">
                        <h3>Edit Profile: {member.fullName}</h3>
                        <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      <div className="sub-modal__body">
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                            className="form-input"
                            disabled={isLoading('save-profile')}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="form-input"
                            disabled={isLoading('save-profile')}
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="form-input"
                            disabled={isLoading('save-profile')}
                          />
                        </div>
                      </div>
                      <div className="sub-modal__footer">
                        <button
                          className="btn btn--secondary"
                          onClick={() => setActiveSubModal(null)}
                          disabled={isLoading('save-profile')}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn--primary"
                          onClick={handleSaveProfile}
                          disabled={isLoading('save-profile')}
                        >
                          {isLoading('save-profile') ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other sub-modals (renew, message) remain the same */}
            </motion.div>
          )}
        </AnimatePresence>

          {/* Legacy Renew Sub-Modal removed - using tiered plan tab instead */}

        {/* Message Member Sub-Modal */}
        <AnimatePresence>
          {
            activeSubModal === "message" && (
              <motion.div
                className="sub-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveSubModal(null)}
              >
                <motion.div
                  className="sub-modal"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                >
                  <div className="sub-modal__header">
                    <h3>Message Member: {member.fullName}</h3>
                    <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="sub-modal__body">
                    <div className="form-group">
                      <label>Subject</label>
                      <input
                        type="text"
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        className="form-input"
                        placeholder="Enter subject..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Message Body</label>
                      <textarea
                        value={messageForm.body}
                        onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                        className="form-textarea"
                        rows={6}
                        placeholder="Write your message..."
                      />
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button className="btn btn--primary" onClick={handleSendMessage}>
                      Send Message
                    </button>
                    <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )
          }
        </AnimatePresence >
      </Editable>
    </>


  if (typeof document === 'undefined') return null

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedMemberActionModal
