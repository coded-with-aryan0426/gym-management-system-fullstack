"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types/user"
import type { Relationship } from "../../types/modalEnhancement"
import api from "../../services/api"
import { relationshipFilterService, enhancedApi } from "../../services"
import { useRealTimeData, useOptimisticUpdates, useMicroInteractions } from "../../hooks"
import { showToast } from "../../utils/toast"
import "./MemberActionModal.css"

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
  type TabType = "profile" | "renew" | "message" | "trainers" | "delete";
  const [activeTab, setActiveTab] = useState<TabType>("profile")

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
  })

  const [renewForm, setRenewForm] = useState({
    packageId: 0,
    amount: "0",
    customDuration: "1",
    markAsPaid: true,
  })
  const [availablePackages, setAvailablePackages] = useState<any[]>([])

  // Load packages when renew tab opens
  useEffect(() => {
    // Check for both tab system and legacy submodal
    if (activeTab === "renew" || activeSubModal === "renew") {
      console.log('[EnhancedMemberActionModal] Loading packages for renew...')
      api.getPackages(true).then(pkgs => {
        console.log('[EnhancedMemberActionModal] Loaded packages:', pkgs)
        // Filter out yearly/long-term plans, keep only monthly (base) plans
        const basePlans = pkgs.filter((p: any) => (p.durationDays || 30) <= 31)
        console.log('[EnhancedMemberActionModal] Base plans:', basePlans)

        setAvailablePackages(basePlans)
        if (basePlans.length > 0) {
          setRenewForm({
            packageId: basePlans[0].packageId,
            amount: String(basePlans[0].price),
            customDuration: "1",
            markAsPaid: true,
          })
        }
      }).catch(err => {
        console.error('[EnhancedMemberActionModal] Failed to load packages:', err)
      })
    }
  }, [activeTab, activeSubModal])

  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
  })

  // Assigned trainers state
  const [assignedTrainers, setAssignedTrainers] = useState<User[]>([])

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
        joinDate: (member.joinDate || member.createdAt || "").split('T')[0],
        notes: "",
      })
    }
  }, [isOpen, member?.userId, loadAssignedTrainers])

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
        joinDate: (member.joinDate || member.createdAt || "").split('T')[0],
        notes: "",
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

  const handleRenewAndPay = () => {
    if (localMember && renewForm.packageId) {
      // Find selected package for updating local state
      const selectedPkg = availablePackages.find(p => p.packageId === renewForm.packageId)

      onRenewPlan(
        localMember,
        renewForm.packageId,
        Number(renewForm.amount),
        Number(renewForm.customDuration),
        false // skipTransaction = false (always record the transaction)
      )

      // Update local member state for real-time display
      if (selectedPkg) {
        // Calculate new end date for immediate UI update
        const months = Number(renewForm.customDuration)
        const newEndDate = new Date()
        newEndDate.setMonth(newEndDate.getMonth() + months)

        setLocalMember(prev => prev ? {
          ...prev,
          planName: selectedPkg.packageName || selectedPkg.name,
          status: 'Active',
          // Update end date so "Days Left" recalculates immediately
          endDate: newEndDate.toISOString(),
          membershipEndDate: newEndDate.toISOString()
        } as User : null)
      }

      // Keep modal open
      showSuccess('Plan renewed successfully')
    }
  }

  const handleSendMessage = async () => {
    if (!localMember) return

    try {
      showLoading('send-message')

      // Simulate message sending (in real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSendMessage(localMember)
      // Keep modal open - don't close sub-modal
      showSuccess(`Message sent to ${localMember.fullName}`)
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

  // Helper functions
  const getPlanForMember = () => {
    // Use the actual planName from the local member data for real-time updates
    return (localMember as any)?.planName || "No Plan"
  }

  const getStatusForMember = () => {
    // Use the actual status from the local member data for real-time updates
    return (localMember as any)?.status || "Active"
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

    // Try to get end date from various possible sources
    const endDateStr = (localMember as any).endDate ||
      (localMember as any).membershipEndDate ||
      (localMember as any).planEndDate

    if (!endDateStr) {
      // If no end date, calculate from join date + 30 days as default
      const joinDateStr = localMember.joinDate || localMember.createdAt
      if (joinDateStr) {
        const joinDate = new Date(joinDateStr)
        const defaultEndDate = new Date(joinDate)
        defaultEndDate.setDate(defaultEndDate.getDate() + 30) // Assume 30 day plan
        const today = new Date()
        const diffTime = defaultEndDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return Math.max(0, diffDays)
      }
      return null
    }

    const endDate = new Date(endDateStr)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const daysRemaining = calculateDaysRemaining()

  if (!member || !localMember) return null

  const modalContent =
    <>
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
            {/* External Close Button - Outside Modal */}
            <button className="member-action-modal__close-external" onClick={onClose}>
              <svg width="24\" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <motion.div
              className="member-action-modal member-action-modal--redesigned"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Member Info Header - Compact with Stats */}
              <div className="member-action-modal__profile-header">
                <div className="profile-header__avatar">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localMember.fullName}`} alt={localMember.fullName} />
                </div>
                <div className="profile-header__info">
                  <h2 className="profile-header__name">{localMember.fullName}</h2>
                  <div className="profile-header__meta">
                    <span className="plan-badge plan-badge--member">{getPlanForMember()}</span>
                    <span className={`status-badge status-badge--${getStatusForMember().toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {getStatusForMember()}
                    </span>
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
              </div>

              {/* Two-Column Content Layout with Dynamic Panels */}
              <div className="member-action-modal__content-grid">
                {/* Left Column: Tab Navigation */}
                <div className="member-action-modal__nav-column">
                  <nav className="side-panel-nav">
                    <button
                      className={`side-panel-nav__item ${activeTab === "profile" ? "side-panel-nav__item--active" : ""}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>

                    <button
                      className={`side-panel-nav__item ${activeTab === "renew" ? "side-panel-nav__item--active" : ""}`}
                      onClick={() => setActiveTab("renew")}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                      </svg>
                      <span>Renew Plan</span>
                    </button>

                    <button
                      className={`side-panel-nav__item ${activeTab === "message" ? "side-panel-nav__item--active" : ""}`}
                      onClick={() => setActiveTab("message")}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>Message Member</span>
                    </button>

                    <button
                      className={`side-panel-nav__item ${activeTab === "trainers" ? "side-panel-nav__item--active" : ""}`}
                      onClick={() => setActiveTab("trainers")}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Assigned Trainers</span>
                      <span className="nav-badge">{assignedTrainers.length}</span>
                    </button>

                    <button
                      className={`side-panel-nav__item side-panel-nav__item--danger ${activeTab === "delete" ? "side-panel-nav__item--active" : ""}`}
                      onClick={() => setActiveTab("delete")}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      <span>Delete Profile</span>
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
                        className="content-panel content-panel--constrained"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h4 className="content-panel__title">Edit Profile</h4>
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
                      </motion.div>
                    )}

                    {/* Renew Plan Panel */}
                    {activeTab === "renew" && (
                      <motion.div
                        key="renew"
                        className="content-panel content-panel--constrained"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h4 className="content-panel__title">Renew Plan</h4>
                        <div className="content-panel__body">
                          <div className="current-plan-info">
                            <span className="current-plan-label">Current Plan</span>
                            <span className="current-plan-name">{getPlanForMember()}</span>
                          </div>

                          <div className="form-row-2-col">
                            <div className="form-group">
                              <label>Select New Plan</label>
                              <select
                                value={renewForm.packageId}
                                onChange={(e) => {
                                  const pid = Number(e.target.value)
                                  const pkg = availablePackages.find(p => p.packageId === pid)
                                  const duration = renewForm.customDuration || "1"
                                  const basePrice = pkg ? Number(pkg.price) : 0
                                  const months = Number(duration)
                                  let discount = 1
                                  if (months >= 12) discount = 0.85
                                  else if (months >= 6) discount = 0.90
                                  else if (months >= 3) discount = 0.95
                                  const finalPrice = Math.round(basePrice * months * discount)
                                  setRenewForm(prev => ({ ...prev, packageId: pid, amount: String(finalPrice) }))
                                }}
                                className="form-select"
                              >
                                <option value={0} disabled>Select a plan</option>
                                {availablePackages.map(pkg => (
                                  <option key={pkg.packageId} value={pkg.packageId}>
                                    {pkg.packageName || pkg.name} - ₹{pkg.price}/month
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Duration</label>
                              <select
                                className="form-select"
                                value={renewForm.customDuration}
                                onChange={(e) => {
                                  const duration = e.target.value
                                  const pkg = availablePackages.find(p => p.packageId === renewForm.packageId)
                                  const monthlyPrice = pkg ? Number(pkg.price) : 0
                                  const months = Number(duration)
                                  let discount = 1
                                  if (months >= 12) discount = 0.85
                                  else if (months >= 6) discount = 0.90
                                  else if (months >= 3) discount = 0.95
                                  const finalPrice = Math.round(monthlyPrice * months * discount)
                                  setRenewForm(prev => ({ ...prev, customDuration: duration, amount: String(finalPrice) }))
                                }}
                              >
                                {[1, 2, 3, 6, 8, 12, 24, 36].map(month => (
                                  <option key={month} value={month}>{month} Month{month > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="renew-action-container">
                            <label className="renew-total-label">Total Amount</label>
                            <div className="renew-amount-wrapper">
                              <span className="renew-amount-value">
                                ₹{renewForm.amount || '0'}
                              </span>
                              {renewForm.packageId > 0 && Number(renewForm.customDuration) >= 3 && (
                                <span className="renew-discount-badge">
                                  {Number(renewForm.customDuration) >= 12 ? '15% OFF' :
                                    Number(renewForm.customDuration) >= 6 ? '10% OFF' : '5% OFF'}
                                </span>
                              )}
                            </div>
                            <button
                              className="btn btn--primary btn-renew-wide"
                              onClick={handleRenewAndPay}
                              disabled={!renewForm.packageId || renewForm.packageId === 0}
                            >
                              Renew Plan
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Message Panel */}
                    {activeTab === "message" && (
                      <motion.div
                        key="message"
                        className="content-panel content-panel--constrained"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h4 className="content-panel__title">Send Message</h4>
                        <div className="content-panel__body">
                          <div className="form-group">
                            <label>Subject</label>
                            <input
                              type="text"
                              value={messageForm.subject}
                              onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="form-input"
                              placeholder="Enter subject..."
                            />
                          </div>
                          <div className="form-group">
                            <label>Message <span className="hint-text">(Ctrl+Enter to send)</span></label>
                            <textarea
                              value={messageForm.body}
                              onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                  e.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                              className="form-textarea"
                              placeholder="Type your message..."
                              rows={5}
                            />
                          </div>
                          <button className="btn btn--primary" onClick={handleSendMessage}>
                            Send Message
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
                        className="content-panel content-panel--constrained content-panel--danger"
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

      {/* Renew Plan Sub-Modal */}
      <AnimatePresence>
        {
          activeSubModal === "renew" && (
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
                  <h3>Renew Plan: {member.fullName}</h3>
                  <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="sub-modal__body">
                  <div className="current-plan-info">
                    <span className="current-plan-label">Current Plan</span>
                    <span className="current-plan-name">{getPlanForMember()}</span>
                    <span className="current-plan-expiry">Expires: Dec 31, 2025</span>
                  </div>

                  <div className="form-group">
                    <label>Select New Plan</label>
                    <select
                      value={renewForm.packageId}
                      onChange={(e) => {
                        const pid = Number(e.target.value)
                        const pkg = availablePackages.find(p => p.packageId === pid)
                        const duration = renewForm.customDuration || "1"

                        const basePrice = pkg ? Number(pkg.price) : 0
                        const months = Number(duration)

                        let discount = 1
                        if (months >= 12) discount = 0.85
                        else if (months >= 6) discount = 0.90
                        else if (months >= 3) discount = 0.95

                        const finalPrice = Math.round(basePrice * months * discount)

                        setRenewForm(prev => ({
                          ...prev,
                          packageId: pid,
                          amount: String(finalPrice),
                        }))
                      }}
                      className="form-select"
                    >
                      <option value={0} disabled>Select a plan</option>
                      {availablePackages.map(pkg => (
                        <option key={pkg.packageId} value={pkg.packageId}>
                          {pkg.packageName || pkg.name} - ₹{pkg.price}/month
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration & Pricing</label>
                    <div className="duration-select-container">
                      <select
                        className="form-select"
                        value={renewForm.customDuration}
                        onChange={(e) => {
                          const duration = e.target.value
                          const pkg = availablePackages.find(p => p.packageId === renewForm.packageId)

                          // We are now only using monthly base plans, so pkg.price IS the monthly price
                          const monthlyPrice = pkg ? Number(pkg.price) : 0

                          const months = Number(duration)

                          // Calculate price with bulk discount
                          let discount = 1
                          if (months >= 12) discount = 0.85
                          else if (months >= 6) discount = 0.90
                          else if (months >= 3) discount = 0.95

                          const finalPrice = Math.round(monthlyPrice * months * discount)

                          setRenewForm(prev => ({
                            ...prev,
                            customDuration: duration,
                            amount: String(finalPrice)
                          }))
                        }}
                      >
                        {[1, 2, 3, 6, 8, 12, 24, 36].map(month => (
                          <option key={month} value={month}>{month} Month{month > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={renewForm.markAsPaid}
                        onChange={(e) => setRenewForm(prev => ({ ...prev, markAsPaid: e.target.checked }))}
                      />
                      <span>Mark as Paid (Create Transaction)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Total Amount</label>
                    <input
                      type="text"
                      value={`₹${renewForm.amount}`}
                      readOnly
                      className="form-input"
                    />
                    {renewForm.customDuration && Number(renewForm.customDuration) >= 3 && (
                      <span className="price-hint">
                        Includes {Number(renewForm.customDuration) >= 12 ? '15%' : Number(renewForm.customDuration) >= 6 ? '10%' : '5%'} bulk discount
                      </span>
                    )}
                  </div>
                </div>
                <div className="sub-modal__footer">
                  <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                    Cancel
                  </button>
                  <button className="btn btn--primary" onClick={handleRenewAndPay}>
                    {renewForm.markAsPaid ? "Renew & Pay" : "Renew Only"}
                  </button>
                </div>
              </motion.div>

            </motion.div>
          )
        }
      </AnimatePresence >

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
    </>


  if (typeof document === 'undefined') return null

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedMemberActionModal