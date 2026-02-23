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
import { saveAvatar } from "../../hooks/useAvatarStore"
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
        });

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

        // Persist avatar — dispatches storage event so ALL tabs/windows update instantly
        saveAvatar(localMember.userId, editForm.avatarId)

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

  // Maps icon name strings (from DB) → emoji
  const resolveIconName = (iconName: string | undefined): string => {
    if (!iconName) return ''
    const n = iconName.toLowerCase().trim()
    const map: Record<string, string> = {
      dumbbell: '🏋️', barbell: '🏋️', weight: '🏋️',
      star: '⭐', stars: '⭐', sparkle: '✨', sparkles: '✨',
      crown: '👑', king: '👑', trophy: '🏆',
      gem: '💎', diamond: '💎', jewel: '💎',
      'graduation-cap': '🎓', graduation: '🎓', student: '🎓', mortarboard: '🎓',
      building: '🏢', office: '🏢', corporate: '🏢', company: '🏢',
      fire: '🔥', flame: '🔥',
      lightning: '⚡', bolt: '⚡', zap: '⚡',
      heart: '❤️', love: '❤️',
      shield: '🛡️', lock: '🔒',
      rocket: '🚀',
      leaf: '🌿', nature: '🌿',
      sun: '☀️', moon: '🌙',
      medal: '🏅', award: '🏅', badge: '🏅',
      running: '🏃', runner: '🏃',
      swimming: '🏊', swim: '🏊',
      yoga: '🧘', zen: '🧘',
      boxing: '🥊', fight: '🥊',
      bike: '🚴', cycling: '🚴',
      infinity: '∞', unlimited: '∞',
    }
    // exact match first
    if (map[n]) return map[n]
    // partial match
    for (const [key, emoji] of Object.entries(map)) {
      if (n.includes(key)) return emoji
    }
    return iconName // fallback: show raw text shouldn't happen now
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

  // ── helpers used inside JSX ──
  const memberInitials = localMember.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const joinDateDisplay = (() => {
    const d = (localMember as any).joinDate || localMember.createdAt
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return '—' }
  })()
  const memberIdDisplay = `#${String(localMember.userId).padStart(5, '0')}`
  const statusRaw = ((localMember as any).membershipStatus || (localMember as any).status || 'Inactive') as string
  const statusLower = statusRaw.toLowerCase()

  // current-plan helpers (shared between header and membership tab)
  const planName = getPlanForMember()
  const hasPlan = planName && planName !== 'No Plan' && planName !== 'None'

  const startDateStr = (localMember as any)?.startDate || (localMember as any)?.membershipStartDate || (localMember as any)?.planStartDate
  const endDateStr   = (localMember as any)?.endDate   || (localMember as any)?.membershipEndDate   || (localMember as any)?.planEndDate
  let progressPercent = 0, daysLeft: number | null = null, totalDays: number | null = null, isExpired = false
  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr).getTime(), end = new Date(endDateStr).getTime(), now = Date.now()
    totalDays = Math.ceil((end - start) / 86400000)
    daysLeft  = Math.ceil((end - now) / 86400000)
    isExpired = daysLeft < 0
    progressPercent = totalDays > 0 ? Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100))) : 0
  } else if (daysRemaining !== null) {
    daysLeft = daysRemaining; isExpired = daysLeft <= 0
  }
  const progressColor = isExpired ? '#ef4444' : daysLeft !== null && daysLeft <= 7 ? '#f59e0b' : '#22c55e'
  const fmtDate = (s: string) => { try { return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return s } }

  // Derive duration label from actual dates (never stale unlike planDuration string)
  const durationFromDays = (days: number): { chip: string; full: string } => {
    if (days >= 365 && days % 365 === 0) { const n = days / 365; return { chip: `${n}y`, full: `${n} Year${n !== 1 ? 's' : ''}` } }
    if (days >= 28) { const n = Math.round(days / 30); return { chip: `${n}mo`, full: `${n} Month${n !== 1 ? 's' : ''}` } }
    if (days >= 7 && days % 7 === 0) { const n = days / 7; return { chip: `${n}w`, full: `${n} Week${n !== 1 ? 's' : ''}` } }
    return { chip: `${days}d`, full: `${days} Day${days !== 1 ? 's' : ''}` }
  }
  const durationLabels = totalDays != null && totalDays > 0 ? durationFromDays(totalDays) : null
  const durationChip = durationLabels?.chip ?? ''
  const durationFull = durationLabels?.full ?? ''

  const modalContent = (
    <Editable id="member-action-modal">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mam-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="mam"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >

                {/* ══════════════════════════════════════════════
                    HEADER — full-width member identity strip
                ══════════════════════════════════════════════ */}
                <div className="mam-header">
                    {/* Avatar — uses Avatar component to handle custom upload + dicebear + initials */}
                    <div className="mam-header__avatar-wrap">
                        <Avatar
                            name={localMember.fullName}
                            avatarId={editForm.avatarId || localStorage.getItem(`avatar_${localMember.userId}`) || (localMember as any).avatarId || undefined}
                          userId={localMember.userId}
                          size="lg"
                          className="mam-header__avatar-img"
                        />
                    <span className={`mam-header__status-dot mam-header__status-dot--${statusLower}`} />
                  </div>

                {/* Identity block */}
                <div className="mam-header__identity">
                  <div className="mam-header__name-row">
                    <h2 className="mam-header__name">{localMember.fullName}</h2>
                    <span className={`mam-header__status-pill mam-header__status-pill--${statusLower}`}>{statusRaw}</span>
                  </div>
                  <div className="mam-header__meta-row">
                    <span className="mam-header__meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      {localMember.email}
                    </span>
                    {(localMember as any).phoneNumber && (
                      <span className="mam-header__meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 16.19 19.79 19.79 0 0 1 1.83 7.52 2 2 0 0 1 3.81 5.36h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 12a16 16 0 0 0 5.91 5.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {(localMember as any).phoneNumber}
                      </span>
                    )}
                    <span className="mam-header__meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Joined {joinDateDisplay}
                    </span>
                    <span className="mam-header__id-chip">{memberIdDisplay}</span>
                  </div>
                </div>

                {/* Plan + Days strip */}
                <div className="mam-header__plan-strip">
                  {hasPlan ? (
                    <>
                      <span className={`member-plan-badge ${getPlanBadgeClass(planName)}`}>
                        <span className="plan-icon">{getPlanIcon(planName)}</span>
                        {planName}
                        {durationChip && <span className="mam-header__dur-chip">{durationChip}</span>}
                      </span>
                      {daysLeft !== null && (
                        <div className={`mam-header__days ${isExpired ? 'mam-header__days--expired' : daysLeft <= 7 ? 'mam-header__days--warn' : 'mam-header__days--ok'}`}>
                          <span className="mam-header__days-num">{Math.abs(daysLeft)}</span>
                          <span className="mam-header__days-label">{isExpired ? 'overdue' : 'days left'}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="mam-header__no-plan">No active plan</span>
                  )}
                </div>

                {/* Quick stats */}
                <div className="mam-header__stats">
                  <div className="mam-header__stat">
                    <span className="mam-header__stat-val">{transactions.length || '—'}</span>
                    <span className="mam-header__stat-lbl">Payments</span>
                  </div>
                  <div className="mam-header__stat">
                    <span className="mam-header__stat-val">{checkIns.length || '—'}</span>
                    <span className="mam-header__stat-lbl">Visits</span>
                  </div>
                  <div className="mam-header__stat">
                    <span className="mam-header__stat-val">{assignedTrainers.length}</span>
                    <span className="mam-header__stat-lbl">Trainers</span>
                  </div>
                </div>

                {/* Close */}
                <button className="mam-header__close" onClick={onClose} title="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* ══════════════════════════════════════════════
                  BODY — sidebar nav + content panel
              ══════════════════════════════════════════════ */}
              <div className="mam-body">

                {/* ── Sidebar Nav ── */}
                <nav className="mam-nav">
                  <div className="mam-nav__group">
                    <span className="mam-nav__group-label">Member</span>
                    {([
                      { id: 'profile'  as TabType, label: 'Edit Profile',       color: '#6366f1',
                        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                      { id: 'renew'    as TabType, label: 'Membership',         color: '#10b981',
                        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg> },
                      { id: 'trainers' as TabType, label: 'Trainers',           color: '#f59e0b', badge: assignedTrainers.length,
                        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                    ] as any[]).map((tab: any) => (
                      <button key={tab.id}
                        className={`mam-nav__item ${activeTab === tab.id ? 'mam-nav__item--active' : ''}`}
                        style={{ '--nav-color': tab.color } as any}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <span className="mam-nav__icon">{tab.icon}</span>
                        <span className="mam-nav__label">{tab.label}</span>
                        {tab.badge !== undefined && <span className="mam-nav__badge">{tab.badge}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="mam-nav__group">
                    <span className="mam-nav__group-label">History</span>
                    {([
                      { id: 'payments'   as TabType, label: 'Payments',    color: '#3b82f6', badge: transactions.length || undefined,
                        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                      { id: 'attendance' as TabType, label: 'Attendance',  color: '#06b6d4', badge: checkIns.length || undefined,
                        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M9 14l2 2 4-4"/></svg> },
                    ] as any[]).map((tab: any) => (
                      <button key={tab.id}
                        className={`mam-nav__item ${activeTab === tab.id ? 'mam-nav__item--active' : ''}`}
                        style={{ '--nav-color': tab.color } as any}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <span className="mam-nav__icon">{tab.icon}</span>
                        <span className="mam-nav__label">{tab.label}</span>
                        {tab.badge !== undefined && <span className="mam-nav__badge">{tab.badge}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="mam-nav__group">
                    <span className="mam-nav__group-label">Actions</span>
                    <button
                      className={`mam-nav__item ${activeTab === 'message' ? 'mam-nav__item--active' : ''}`}
                      style={{ '--nav-color': '#8b5cf6' } as any}
                      onClick={() => setActiveTab('message')}
                    >
                      <span className="mam-nav__icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </span>
                      <span className="mam-nav__label">Message</span>
                    </button>
                    <button
                      className={`mam-nav__item mam-nav__item--danger ${activeTab === 'delete' ? 'mam-nav__item--active' : ''}`}
                      style={{ '--nav-color': '#ef4444' } as any}
                      onClick={() => setActiveTab('delete')}
                    >
                      <span className="mam-nav__icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </span>
                      <span className="mam-nav__label">Delete</span>
                    </button>
                  </div>
                </nav>

                {/* ── Content Panel ── */}
                <div className="mam-panel">
                  <AnimatePresence mode="wait">

                    {/* ─── PROFILE TAB ─── */}
                    {activeTab === 'profile' && (
                      <motion.div key="profile" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                        {/* Avatar Picker Popup */}
                        <AnimatePresence>
                          {showAvatarPicker && (
                            <motion.div className="mam-overlay" style={{ zIndex: 1100 }}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              onClick={() => setShowAvatarPicker(false)}
                            >
                              <motion.div className="avatar-picker-modal"
                                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="avatar-picker-modal__header">
                                  <h5>Choose Avatar</h5>
                                  <button className="avatar-picker-modal__close" onClick={() => setShowAvatarPicker(false)}>×</button>
                                </div>
                                <AvatarPicker selectedId={editForm.avatarId} userId={localMember?.userId} variant="member"
                                  onSelect={(id) => { setEditForm(prev => ({ ...prev, avatarId: id })); setShowAvatarPicker(false); showToast.success('Avatar selected!') }} />
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* ── Section: Basic Info ── */}
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              <span>Basic Info</span>
                            </div>
                            <button type="button" className="mam-btn mam-btn--ghost mam-btn--sm" onClick={() => setShowAvatarPicker(true)}>
                              Change Avatar
                            </button>
                          </div>
                          <div className="mam-section__body">
                            <div className="mam-form-grid">
                              <div className="mam-field">
                                <label className="mam-label">Full Name</label>
                                <div className="mam-input-wrap">
                                  <input type="text" value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && isEditFormValid() && handleSaveProfile()}
                                    className={`mam-input ${editForm.fullName.length > 0 ? (isValidFullName(editForm.fullName) ? 'mam-input--valid' : 'mam-input--invalid') : ''}`}
                                    placeholder="Member full name"
                                  />
                                  <ValidationIcon show={editForm.fullName.length > 0} isValid={isValidFullName(editForm.fullName)} />
                                </div>
                              </div>
                              <div className="mam-field">
                                <label className="mam-label">Email Address</label>
                                <div className="mam-input-wrap">
                                  <input type="email" value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && isEditFormValid() && handleSaveProfile()}
                                    className={`mam-input ${editForm.email.length > 0 ? (isValidEmail(editForm.email) ? 'mam-input--valid' : 'mam-input--invalid') : ''}`}
                                    placeholder="email@example.com"
                                  />
                                  <ValidationIcon show={editForm.email.length > 0} isValid={isValidEmail(editForm.email)} />
                                </div>
                              </div>
                              <div className="mam-field">
                                <label className="mam-label">Phone</label>
                                <div className="mam-input-wrap">
                                  <input type="text" value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && isEditFormValid() && handleSaveProfile()}
                                    className={`mam-input ${editForm.phone.length > 0 ? (isValidPhone(editForm.phone) ? 'mam-input--valid' : 'mam-input--invalid') : ''}`}
                                    placeholder="+91 98765 43210"
                                  />
                                  <ValidationIcon show={editForm.phone.length > 0} isValid={isValidPhone(editForm.phone)} />
                                </div>
                              </div>
                              <div className="mam-field">
                                <label className="mam-label">Join Date</label>
                                <input type="date" value={editForm.joinDate}
                                  onChange={(e) => setEditForm({ ...editForm, joinDate: e.target.value })}
                                  className="mam-input"
                                />
                              </div>
                            </div>
                            <div className="mam-section__foot">
                              <button className="mam-btn mam-btn--primary" onClick={handleSaveProfile} disabled={!isEditFormValid()}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Save Profile
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Section: Emergency Contact ── */}
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 16.19 19.79 19.79 0 0 1 1.83 7.52 2 2 0 0 1 3.81 5.36h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 12a16 16 0 0 0 5.91 5.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                              <span>Emergency Contact</span>
                            </div>
                          </div>
                          <div className="mam-section__body">
                            <div className="mam-form-grid">
                              <div className="mam-field">
                                <label className="mam-label">Contact Name</label>
                                <input type="text" value={emergencyForm.emergencyContactName}
                                  onChange={(e) => setEmergencyForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                                  className="mam-input" placeholder="Full name" />
                              </div>
                              <div className="mam-field">
                                <label className="mam-label">Phone Number</label>
                                <div className="mam-input-wrap">
                                  <input type="tel" inputMode="numeric" value={emergencyForm.emergencyContactPhone}
                                    onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                                    onKeyDown={(e) => { const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','+','-',' ']; if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault() }}
                                    className={`mam-input ${emergencyForm.emergencyContactPhone.length > 0 ? (isValidEmergencyPhone(emergencyForm.emergencyContactPhone) ? 'mam-input--valid' : 'mam-input--invalid') : ''}`}
                                    placeholder="+91 98765 43210" maxLength={15} />
                                  <ValidationIcon show={emergencyForm.emergencyContactPhone.length > 0} isValid={isValidEmergencyPhone(emergencyForm.emergencyContactPhone)} />
                                </div>
                              </div>
                              <div className="mam-field mam-field--full">
                                <label className="mam-label">Relationship</label>
                                <select value={emergencyForm.emergencyContactRelation}
                                  onChange={(e) => setEmergencyForm(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                                  className="mam-input mam-select">
                                  <option value="">Select relationship</option>
                                  <option value="Spouse">Spouse</option>
                                  <option value="Parent">Parent</option>
                                  <option value="Sibling">Sibling</option>
                                  <option value="Friend">Friend</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="mam-section__foot">
                              <button className="mam-btn mam-btn--secondary mam-btn--sm" onClick={handleSaveEmergency}
                                disabled={emergencyForm.emergencyContactPhone.length > 0 && !isValidEmergencyPhone(emergencyForm.emergencyContactPhone)}>
                                Save Emergency Contact
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Section: Health Info ── */}
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                              <span>Health & Goals</span>
                            </div>
                          </div>
                          <div className="mam-section__body">
                            <div className="mam-field mam-field--full">
                              <label className="mam-label">Health Notes / Medical Conditions</label>
                              <textarea value={healthForm.healthNotes}
                                onChange={(e) => setHealthForm(prev => ({ ...prev, healthNotes: e.target.value }))}
                                className="mam-input mam-textarea" rows={2} placeholder="Allergies, conditions, medications..." />
                            </div>
                            <div className="mam-field mam-field--full" style={{ marginTop: 10 }}>
                              <label className="mam-label">Fitness Goals</label>
                              <textarea value={healthForm.fitnessGoals}
                                onChange={(e) => setHealthForm(prev => ({ ...prev, fitnessGoals: e.target.value }))}
                                className="mam-input mam-textarea" rows={2} placeholder="Weight loss, muscle gain, endurance..." />
                            </div>
                            <div className="mam-section__foot">
                              <button className="mam-btn mam-btn--secondary mam-btn--sm" onClick={handleSaveHealth}>Save Health Info</button>
                            </div>
                          </div>
                        </div>

                        {/* ── Section: Staff Notes ── */}
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                              <span>Staff Notes</span>
                              {memberNotes.length > 0 && <span className="mam-nav__badge">{memberNotes.length}</span>}
                            </div>
                          </div>
                          <div className="mam-section__body">
                            <div className="mam-notes-add">
                              <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                className="mam-input" placeholder="Add a note and press Enter..." />
                              <button className="mam-btn mam-btn--primary mam-btn--sm" onClick={handleAddNote} disabled={!newNote.trim()}>Add</button>
                            </div>
                            <div className="mam-notes-list">
                              {notesLoading && <p className="mam-empty-hint">Loading notes...</p>}
                              {!notesLoading && memberNotes.length === 0 && <p className="mam-empty-hint">No notes yet</p>}
                              {memberNotes.map((note: any, i: number) => (
                                <div key={i} className="mam-note">
                                  <div className="mam-note__head">
                                    <span className="mam-note__author">{note.author || 'Admin'}</span>
                                    <span className="mam-note__date">{note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</span>
                                  </div>
                                  <p className="mam-note__body">{note.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── MEMBERSHIP TAB ─── */}
                    {activeTab === 'renew' && (
                      <motion.div key="renew" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                          {/* Current plan status card */}
                          <div className={`mam-current-plan ${isExpired ? 'mam-current-plan--expired' : !hasPlan ? 'mam-current-plan--none' : ''}`}>
                            <div className="mam-current-plan__left">
                              {/* Left: plan name + dates */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span className="mam-current-plan__label">Current Plan</span>
                                <div className="mam-current-plan__name-row">
                                  {hasPlan ? (
                                    <span className={`member-plan-badge ${getPlanBadgeClass(planName)}`}>
                                      <span className="plan-icon">{getPlanIcon(planName)}</span>
                                      {planName}
                                    </span>
                                  ) : (
                                    <span className="mam-current-plan__none">No active plan</span>
                                  )}
                                  {durationFull && (
                                    <span className="mam-current-plan__dur">{durationFull}</span>
                                  )}
                                </div>
                                {(startDateStr || endDateStr) && (
                                  <div className="mam-current-plan__dates">
                                    {startDateStr && <span>{fmtDate(startDateStr)}</span>}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    {endDateStr && <span className={isExpired ? 'mam-current-plan__date--expired' : ''}>{fmtDate(endDateStr)}</span>}
                                    {totalDays && <span className="mam-current-plan__total">({totalDays}d total)</span>}
                                  </div>
                                )}
                              </div>
                              {/* Right: days block */}
                              {hasPlan && daysLeft !== null && (
                                <div className={`mam-current-plan__days-block ${isExpired ? 'mam-current-plan__days-block--expired' : daysLeft <= 7 ? 'mam-current-plan__days-block--warn' : ''}`}>
                                  <span className="mam-current-plan__days-num">{Math.abs(daysLeft)}</span>
                                  <span className="mam-current-plan__days-label">{isExpired ? 'overdue' : 'days left'}</span>
                                </div>
                              )}
                            </div>
                            {hasPlan && progressPercent > 0 && (
                              <div className="mam-current-plan__progress">
                                <div className="mam-current-plan__progress-track">
                                  <div className="mam-current-plan__progress-fill" style={{ width: `${progressPercent}%`, background: progressColor }} />
                                </div>
                                <span className="mam-current-plan__progress-label">{progressPercent}% used</span>
                              </div>
                            )}
                          </div>

                        {/* Plan selection */}
                        <div className="mam-section" style={{ marginTop: 16 }}>
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                              <span>Select Plan</span>
                            </div>
                          </div>
                          <div className="mam-section__body">
                            {tieredPlansLoading ? (
                              <div className="mam-plans-skeleton">
                                {[1,2,3].map(i => <div key={i} className="mam-plan-skeleton-card" />)}
                              </div>
                            ) : tieredPlans.length === 0 ? (
                              <div className="mam-empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                <p>No plans available</p>
                                <span>Create membership plans in Settings</span>
                              </div>
                            ) : (
                              <div className="mam-plans-grid">
                                {tieredPlans.map((plan: any) => {
                                  const isSel = selectedPlanId === plan.planId
                                  const isCurrent = plan.planName === getPlanForMember()
                                  const activeVars = (plan.variants || []).filter((v: any) => v.isActive !== false)
                                  const lowestPrice = activeVars.length > 0 ? Math.min(...activeVars.map((v: any) => v.price)) : 0
                                  const catColors: Record<string, string> = { STANDARD: '#3B82F6', PREMIUM: '#8B5CF6', VIP: '#F59E0B', CORPORATE: '#10B981', STUDENT: '#6366F1', CUSTOM: '#EC4899' }
                                  const catColor = plan.category ? (catColors[plan.category] || '#6366F1') : undefined
                                  const accentColor = plan.planColor || '#6366f1'
                                  return (
                                    <div key={plan.planId}
                                      className={`mam-plan-card ${isSel ? 'mam-plan-card--selected' : ''} ${isCurrent ? 'mam-plan-card--current' : ''} ${plan.isRecommended ? 'mam-plan-card--recommended' : ''}`}
                                      style={{ '--plan-color': accentColor } as any}
                                      onClick={() => { setSelectedPlanId(plan.planId); const pop = activeVars.find((v: any) => v.isPopular); setSelectedVariantId((pop || activeVars[0])?.variantId || null) }}
                                    >
                                      {isCurrent && <span className="mam-plan-card__current-badge">Current</span>}
                                      {plan.isRecommended && !isCurrent && <span className="mam-plan-card__rec-badge">Recommended</span>}
                                        <div className="mam-plan-card__icon-name">
                                          <span className="mam-plan-card__icon">
                                            {plan.iconName ? resolveIconName(plan.iconName) : getPlanIcon(plan.planName)}
                                          </span>
                                          <h5 className="mam-plan-card__name">{plan.planName}</h5>
                                        </div>
                                      {plan.category && (
                                        <span className="mam-plan-card__cat" style={{ color: catColor, borderColor: catColor }}>
                                          {plan.category.charAt(0) + plan.category.slice(1).toLowerCase()}
                                        </span>
                                      )}
                                      {plan.description && <p className="mam-plan-card__desc">{plan.description}</p>}
                                      <div className="mam-plan-card__price">
                                        <span className="mam-plan-card__price-from">from</span>
                                        <span className="mam-plan-card__price-val">₹{lowestPrice.toLocaleString()}</span>
                                      </div>
                                      {activeVars.length > 0 && (
                                        <div className="mam-plan-card__dur-chips">
                                          {activeVars.slice(0, 4).map((v: any) => (
                                            <span key={v.variantId} className="mam-plan-card__dur-chip">
                                              {v.durationValue}{v.durationUnit?.[0]?.toLowerCase() || 'm'}
                                            </span>
                                          ))}
                                          {activeVars.length > 4 && <span className="mam-plan-card__dur-chip mam-plan-card__dur-chip--more">+{activeVars.length - 4}</span>}
                                        </div>
                                      )}
                                      {plan.features && plan.features.filter((f: any) => f.isIncluded).length > 0 && (
                                        <ul className="mam-plan-card__features">
                                          {plan.features.filter((f: any) => f.isIncluded).slice(0, 3).map((f: any, fi: number) => (
                                            <li key={f.featureId || fi}>✓ {f.name}</li>
                                          ))}
                                        </ul>
                                      )}
                                      {plan.memberCount != null && (
                                        <div className="mam-plan-card__members">
                                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                          {plan.memberCount} member{plan.memberCount !== 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Duration segmented picker */}
                            {selectedPlan && (
                              <div className="mam-duration-section">
                                <label className="mam-label" style={{ marginBottom: 10, display: 'block' }}>Select Duration for <strong>{selectedPlan.planName}</strong></label>
                                <div className="mam-duration-grid">
                                  {(selectedPlan.variants || []).filter((v: any) => v.isActive !== false).map((variant: any) => {
                                    const isVarSel = selectedVariantId === variant.variantId
                                    const durLabel = variant.durationValue + ' ' + (variant.durationUnit || 'MONTHS').toLowerCase().replace(/s$/, '') + (variant.durationValue > 1 ? 's' : '')
                                    return (
                                      <button key={variant.variantId}
                                        className={`mam-duration-card ${isVarSel ? 'mam-duration-card--selected' : ''} ${variant.isPopular ? 'mam-duration-card--popular' : ''}`}
                                        style={{ '--plan-color': selectedPlan.planColor || '#6366f1' } as any}
                                        onClick={() => setSelectedVariantId(variant.variantId)}
                                      >
                                        {variant.isPopular && <span className="mam-duration-card__popular">Popular</span>}
                                        <span className="mam-duration-card__dur">{durLabel}</span>
                                        <span className="mam-duration-card__price">₹{Number(variant.price).toLocaleString()}</span>
                                        {variant.discountPercent > 0 && (
                                          <span className="mam-duration-card__discount">{variant.discountPercent}% off</span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {selectedVariant && (
                              <div className="mam-renew-summary">
                                <div className="mam-renew-summary__row"><span>Plan</span><span>{selectedPlan?.planName}</span></div>
                                <div className="mam-renew-summary__row"><span>Duration</span><span>{selectedVariant.durationValue} {(selectedVariant.durationUnit || 'MONTHS').toLowerCase()}</span></div>
                                {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                                  <div className="mam-renew-summary__row mam-renew-summary__row--strike"><span>Original</span><s>₹{Number(selectedVariant.originalPrice).toLocaleString()}</s></div>
                                )}
                                {selectedVariant.includedPTSessions > 0 && (
                                  <div className="mam-renew-summary__row"><span>PT Sessions</span><span>{selectedVariant.includedPTSessions}</span></div>
                                )}
                                <div className="mam-renew-summary__row mam-renew-summary__row--total"><span>Total</span><span>₹{Number(selectedVariant.price).toLocaleString()}</span></div>
                              </div>
                            )}

                            {/* CTA */}
                            <div className="mam-section__foot" style={{ marginTop: 16 }}>
                              {selectedPlan?.planName === getPlanForMember() ? (
                                <button className="mam-btn mam-btn--primary mam-btn--wide" onClick={() => handleRenewAndPay(false)} disabled={!selectedPlanId || !selectedVariantId || isRenewing}>
                                  {isRenewing ? 'Processing...' : 'Extend Current Plan'}
                                </button>
                              ) : (
                                <button className="mam-btn mam-btn--upgrade mam-btn--wide" onClick={() => handleRenewAndPay(true)} disabled={!selectedPlanId || !selectedVariantId || isRenewing}>
                                  {isRenewing ? 'Processing...' : getPlanForMember() === 'No Plan' ? 'Activate Plan' : 'Upgrade / Change Plan'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── PAYMENTS TAB ─── */}
                    {activeTab === 'payments' && (
                      <motion.div key="payments" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                              <span>Payment History</span>
                            </div>
                          </div>
                          <div className="mam-section__body">
                            {/* Stat chips */}
                            {transactions.length > 0 && (
                              <div className="mam-stat-row">
                                <div className="mam-stat-chip">
                                  <span className="mam-stat-chip__val">{transactions.length}</span>
                                  <span className="mam-stat-chip__lbl">Total Txns</span>
                                </div>
                                <div className="mam-stat-chip">
                                  <span className="mam-stat-chip__val">
                                    ₹{transactions.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0).toLocaleString()}
                                  </span>
                                  <span className="mam-stat-chip__lbl">Total Paid</span>
                                </div>
                                <div className="mam-stat-chip">
                                  <span className="mam-stat-chip__val">
                                    {transactions.filter((t: any) => { const d = new Date(t.dateTime); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).length}
                                  </span>
                                  <span className="mam-stat-chip__lbl">This Month</span>
                                </div>
                              </div>
                            )}
                            {transactionsLoading ? (
                              <div className="mam-empty"><p>Loading payments...</p></div>
                            ) : transactions.length === 0 ? (
                              <div className="mam-empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                <p>No payment records found</p><span>Payments will appear here when recorded</span>
                              </div>
                            ) : (
                              <div className="mam-txn-list">
                                {transactions.map((tx: any, i: number) => (
                                  <div key={tx.transactionId || i} className="mam-txn">
                                    <div className={`mam-txn__icon ${tx.type === 'INCOME' ? 'mam-txn__icon--in' : 'mam-txn__icon--out'}`}>
                                      {tx.type === 'INCOME'
                                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>}
                                    </div>
                                    <div className="mam-txn__info">
                                      <span className="mam-txn__desc">{tx.description || tx.category || 'Payment'}</span>
                                      <span className="mam-txn__date">{tx.dateTime ? new Date(tx.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                                    </div>
                                    <div className="mam-txn__right">
                                      <span className={`mam-txn__amount ${tx.type === 'INCOME' ? 'mam-txn__amount--pos' : 'mam-txn__amount--neg'}`}>
                                        {tx.type === 'INCOME' ? '+' : '-'}₹{Math.abs(Number(tx.amount) || 0).toLocaleString()}
                                      </span>
                                      <span className={`mam-txn__status mam-txn__status--${(tx.status || '').toLowerCase()}`}>{tx.status || 'Completed'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── ATTENDANCE TAB ─── */}
                    {activeTab === 'attendance' && (
                      <motion.div key="attendance" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M9 14l2 2 4-4"/></svg>
                              <span>Attendance History</span>
                            </div>
                          </div>
                          <div className="mam-section__body">
                            {/* Stat chips */}
                            <div className="mam-stat-row">
                              <div className="mam-stat-chip">
                                <span className="mam-stat-chip__val">{checkIns.length}</span>
                                <span className="mam-stat-chip__lbl">Total Visits</span>
                              </div>
                              <div className="mam-stat-chip">
                                <span className="mam-stat-chip__val">
                                  {checkIns.filter((c: any) => { const d = new Date(c.checkInTime), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).length}
                                </span>
                                <span className="mam-stat-chip__lbl">This Month</span>
                              </div>
                              <div className="mam-stat-chip">
                                <span className="mam-stat-chip__val">
                                  {(() => { const durs = checkIns.filter((c: any) => c.checkOutTime).map((c: any) => (new Date(c.checkOutTime).getTime() - new Date(c.checkInTime).getTime()) / 60000); return durs.length > 0 ? `${Math.round(durs.reduce((a: number, b: number) => a + b, 0) / durs.length)}m` : '—' })()}
                                </span>
                                <span className="mam-stat-chip__lbl">Avg Duration</span>
                              </div>
                            </div>

                            {checkInsLoading ? (
                              <div className="mam-empty"><p>Loading attendance...</p></div>
                            ) : checkIns.length === 0 ? (
                              <div className="mam-empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <p>No check-in records found</p><span>Check-ins will appear here</span>
                              </div>
                            ) : (
                              <div className="mam-checkin-list">
                                {checkIns.slice(0, 50).map((ci: any, i: number) => {
                                  const inTime = new Date(ci.checkInTime)
                                  const outTime = ci.checkOutTime ? new Date(ci.checkOutTime) : null
                                  const dur = outTime ? Math.round((outTime.getTime() - inTime.getTime()) / 60000) : null
                                  return (
                                    <div key={ci.checkInId || i} className="mam-checkin">
                                      <div className="mam-checkin__date-col">
                                        <span className="mam-checkin__weekday">{inTime.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="mam-checkin__day">{inTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                      <div className="mam-checkin__times">
                                        <span className="mam-checkin__in">↑ {inTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                        {outTime && <span className="mam-checkin__out">↓ {outTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>}
                                      </div>
                                      {dur !== null && <span className="mam-checkin__dur">{dur}m</span>}
                                      <span className={`mam-checkin__status mam-checkin__status--${(ci.status || 'present').replace(/\s+/g,'-').toLowerCase()}`}>{ci.status || 'Present'}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── TRAINERS TAB ─── */}
                    {activeTab === 'trainers' && (
                      <motion.div key="trainers" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                              <span>Assigned Trainers</span>
                              {assignedTrainers.length > 0 && <span className="mam-nav__badge">{assignedTrainers.length}</span>}
                            </div>
                            <div style={{ position: 'relative' }}>
                              <button className={`mam-btn mam-btn--secondary mam-btn--sm ${showTrainerSearch ? 'mam-btn--active' : ''}`}
                                onClick={() => setShowTrainerSearch(!showTrainerSearch)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Add Trainer
                              </button>
                              <AnimatePresence>
                                {showTrainerSearch && (
                                  <motion.div className="mam-trainer-popover"
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="mam-trainer-popover__head">
                                      <span>Search Trainers</span>
                                      <button className="mam-trainer-popover__close" onClick={() => setShowTrainerSearch(false)}>×</button>
                                    </div>
                                    <input type="text" className="mam-input" placeholder="Type name..." value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Escape' && setShowTrainerSearch(false)} autoFocus
                                      style={{ margin: '8px 12px', width: 'calc(100% - 24px)' }} />
                                    <div className="mam-trainer-popover__list">
                                      {isSearching && <div className="mam-trainer-popover__hint">Searching...</div>}
                                      {!isSearching && (() => {
                                        const unassigned = availableTrainers.filter(t => !assignedTrainers.some(a => a.userId === t.userId))
                                        if (unassigned.length === 0) return <div className="mam-trainer-popover__hint">{availableTrainers.length > 0 ? 'All matching trainers are assigned.' : searchQuery ? 'No trainers found' : 'Start typing to search'}</div>
                                        return unassigned.map(trainer => (
                                          <div key={trainer.userId} className="mam-trainer-popover__item" onClick={() => handleAddTrainer(trainer)}>
                                            <div className="mam-trainer-popover__avatar">{trainer.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)}</div>
                                            <div>
                                              <div className="mam-trainer-popover__name">{trainer.fullName}</div>
                                              <div className="mam-trainer-popover__email">{trainer.email}</div>
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
                          <div className="mam-section__body">
                            {assignedTrainers.length === 0 ? (
                              <div className="mam-empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                <p>No trainers assigned</p><span>Click "Add Trainer" to assign one</span>
                              </div>
                            ) : (
                              <div className="mam-trainer-list">
                                {assignedTrainers.map(trainer => (
                                  <div key={trainer.userId} className="mam-trainer">
                                    <div className="mam-trainer__avatar">{trainer.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)}</div>
                                    <div className="mam-trainer__info">
                                      <span className="mam-trainer__name">{trainer.fullName}</span>
                                      <span className="mam-trainer__role">Personal Trainer</span>
                                    </div>
                                    <button className="mam-btn mam-btn--ghost mam-btn--sm mam-btn--danger" onClick={() => handleRemoveTrainer(trainer.userId)}>Remove</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── MESSAGE TAB ─── */}
                    {activeTab === 'message' && (
                      <motion.div key="message" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="mam-section">
                          <div className="mam-section__head">
                            <div className="mam-section__title-row">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              <span>Send Message</span>
                            </div>
                          </div>
                          <div className="mam-section__body">
                            <div className="mam-compose">
                              <div className="mam-compose__row">
                                <span className="mam-compose__lbl">To</span>
                                <span className="mam-compose__recipient">
                                  <span className="mam-compose__tag">{localMember.fullName} <span className="mam-compose__email">&lt;{localMember.email}&gt;</span></span>
                                </span>
                              </div>
                              <div className="mam-compose__row">
                                <span className="mam-compose__lbl">Subject</span>
                                <input type="text" value={messageForm.subject}
                                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                  className="mam-compose__input" placeholder="Message subject..." />
                              </div>
                              <div className="mam-compose__body-wrap">
                                <textarea value={messageForm.body}
                                  onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSendMessage() } }}
                                  className="mam-compose__textarea" placeholder="Write your message..." />
                                <span className="mam-compose__hint">⌘ + Enter to send</span>
                              </div>
                            </div>
                            <div className="mam-section__foot">
                              <button className="mam-btn mam-btn--primary" onClick={handleSendMessage} disabled={!messageForm.body.trim()}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                Send Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── DELETE TAB ─── */}
                    {activeTab === 'delete' && (
                      <motion.div key="delete" className="mam-tab"
                        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="mam-danger-zone">
                          <div className="mam-danger-zone__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                          </div>
                          <h4 className="mam-danger-zone__title">Delete Member Profile</h4>
                          <p className="mam-danger-zone__body">
                            You are about to permanently delete <strong>{localMember.fullName}</strong>'s profile, including all payment history, attendance records, and personal data.
                          </p>
                          <p className="mam-danger-zone__warning">This action is irreversible and cannot be undone.</p>
                          <div className="mam-danger-zone__actions">
                            <button className="mam-btn mam-btn--secondary" onClick={() => setActiveTab('profile')}>
                              Cancel, keep member
                            </button>
                            <button className="mam-btn mam-btn--danger" onClick={handleDeleteMember} disabled={isDeleting}>
                              {isDeleting
                                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mam-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Deleting...</>
                                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Permanently Delete</>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>{/* /mam-panel */}
              </div>{/* /mam-body */}
            </motion.div>{/* /mam */}
          </motion.div>
        )}
      </AnimatePresence>
    </Editable>
  )

  if (typeof document === 'undefined') return null

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedMemberActionModal
