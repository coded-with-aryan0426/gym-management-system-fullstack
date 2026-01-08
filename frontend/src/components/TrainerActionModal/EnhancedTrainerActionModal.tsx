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
import "./TrainerActionModal.css"

// ============================================================================
// Types
// ============================================================================

type TabType = "profile" | "members" | "schedule" | "performance" | "message" | "delete"

interface EnhancedTrainerActionModalProps {
  isOpen: boolean
  onClose: () => void
  trainer: User | null
  onEditProfile?: (trainer: User) => void
  onScheduleSession?: (trainer: User) => void
  onMessageTrainer?: (trainer: User) => void
  onDeleteTrainer?: (trainerId: number) => void
  onUpdate?: () => void // Callback to refresh parent data
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
  // ============================================================================
  // State
  // ============================================================================

  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [localTrainer, setLocalTrainer] = useState<User | null>(null)

  // Edit Profile Form
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "TRAINER",
    specialization: [] as string[],
    joinDate: "",
    leavingDate: "", // When trainer leaves the gym
    status: "Active",
    avatarId: null as string | null,
  })
  const [isSaving, setIsSaving] = useState(false)

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

  // Avatar Picker Popup
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

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

  // Initialize form when trainer changes
  useEffect(() => {
    if (isOpen && trainer) {
      setLocalTrainer(trainer)
      setActiveTab("profile")

      // Load avatarId from localStorage as fallback (until DB column is added)
      const savedAvatarId = localStorage.getItem(`avatar_${trainer.userId}`)

      setEditForm({
        fullName: trainer.fullName || "",
        email: trainer.email || "",
        phone: trainer.phoneNumber || (trainer as any).phone || "",
        role: trainer.roles?.[0]?.roleName || "TRAINER",
        specialization: [],
        joinDate: trainer.createdAt ? new Date(trainer.createdAt).toISOString().split('T')[0] : "",
        leavingDate: (trainer as any).leavingDate || "",
        status: "Active",
        avatarId: savedAvatarId || (trainer as any).avatarId || null,
      })
      loadAssignedMembers()
    }
  }, [isOpen, trainer])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Debounced member search
  useEffect(() => {
    if (!showMemberSearch || !trainer) return

    const timeoutId = setTimeout(() => {
      searchMembers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, showMemberSearch, trainer])

  // ============================================================================
  // API Handlers
  // ============================================================================

  const loadAssignedMembers = useCallback(async () => {
    if (!trainer) return

    try {
      const members = await api.getTrainerCustomers(trainer.userId)
      setAssignedMembers(members)
    } catch (error) {
      console.error('[TrainerActionModal] Failed to load assigned members:', error)
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
      console.error('[TrainerActionModal] Search failed:', error)
      setAvailableMembers([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!trainer || !isFormValid) return

    setIsSaving(true)
    try {
      // Save avatar to localStorage as fallback (until DB column is added)
      if (editForm.avatarId !== null) {
        localStorage.setItem(`avatar_${trainer.userId}`, editForm.avatarId)
      } else {
        localStorage.removeItem(`avatar_${trainer.userId}`)
      }

      // Send all editable fields to backend
      const updatedTrainer = await api.updateUser(trainer.userId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phone,
        status: editForm.status,
        leavingDate: editForm.leavingDate || undefined,
        avatarId: editForm.avatarId || undefined,
      })

      // Merge avatarId into response (in case backend doesn't return it yet)
      const trainerWithAvatar = { ...updatedTrainer, avatarId: editForm.avatarId || undefined }
      setLocalTrainer(prev => prev ? { ...prev, ...trainerWithAvatar } : prev)
      showToast.success("Profile updated successfully")
      onEditProfile?.(trainerWithAvatar)
      onUpdate?.()
      // Modal stays open!
    } catch (error: any) {
      showToast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMember = async (member: User) => {
    if (!trainer) return

    // Check for duplicates
    if (assignedMembers.some(m => m.userId === member.userId)) {
      showToast.error("Member is already assigned to this trainer")
      return
    }

    // Optimistic update
    setAssignedMembers(prev => [...prev, member])
    setShowMemberSearch(false)
    setSearchQuery("")

    try {
      await api.assignCustomerToTrainer(trainer.userId, member.userId)
      showToast.success(`${member.fullName} assigned successfully`)
    } catch (error: any) {
      // Revert on failure
      setAssignedMembers(prev => prev.filter(m => m.userId !== member.userId))
      showToast.error(error.message || "Failed to assign member")
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!trainer) return

    const memberToRemove = assignedMembers.find(m => m.userId === memberId)
    if (!memberToRemove) return

    // Optimistic update
    setAssignedMembers(prev => prev.filter(m => m.userId !== memberId))

    try {
      await api.removeCustomerFromTrainer(trainer.userId, memberId)
      showToast.success("Member removed successfully")
    } catch (error: any) {
      // Revert on failure
      setAssignedMembers(prev => [...prev, memberToRemove])
      showToast.error(error.message || "Failed to remove member")
    }
  }

  const handleSendMessage = async () => {
    if (!trainer || !messageForm.subject || !messageForm.body) return

    setIsSendingMessage(true)
    try {
      // Simulate sending (replace with real API)
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
      showToast.error(error.message || "Failed to delete trainer member")
    } finally {
      setIsDeleting(false)
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  if (!trainer || !localTrainer) return null

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
          {/* Modal Content Wrapper */}
          <motion.div
            className="trainer-action-modal trainer-action-modal--redesigned"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ============================================================
                  Profile Header - Matching Member Modal Layout
                 ============================================================ */}
            <div className="trainer-action-modal__profile-header">
              <div className="profile-header__avatar">
                {editForm.avatarId ? (
                  <img
                    src={getAvatarUrl(editForm.avatarId) || ''}
                    alt={localTrainer.fullName}
                  />
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

              {/* Name + Email (left) */}
              <div className="profile-header__info">
                <h2 className="profile-header__name">{localTrainer.fullName}</h2>
                <p className="profile-header__email">{localTrainer.email}</p>
              </div>

              {/* Badges (center) */}
              <div className="profile-header__meta">
                <span className="role-badge role-badge--trainer">
                  {editForm.role}
                </span>
                <span className={`status-badge status-badge--${editForm.status.toLowerCase().replace(' ', '-')}`}>
                  <span className="status-dot"></span>
                  {editForm.status}
                </span>
              </div>

              {/* Stats (right) */}
              <div className="profile-header__stats">
                <div className="stat-item">
                  <span className="stat-value">{assignedMembers.length}</span>
                  <span className="stat-label">Members</span>
                </div>
              </div>

              {/* Close Button */}
              <button className="trainer-action-modal__close-inline" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ============================================================
                Content Grid (Nav + Panel)
               ============================================================ */}
            <div className="trainer-action-modal__content-grid">
              {/* Left Navigation Column */}
              <div className="trainer-action-modal__nav-column">
                <nav className="side-panel-nav">
                  <button
                    className={`side-panel-nav__item ${activeTab === "profile" ? "side-panel-nav__item--active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>

                  <button
                    className={`side-panel-nav__item ${activeTab === "members" ? "side-panel-nav__item--active" : ""}`}
                    onClick={() => setActiveTab("members")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Assigned Members</span>
                    <span className="nav-badge">{assignedMembers.length}</span>
                  </button>

                  <button
                    className={`side-panel-nav__item ${activeTab === "schedule" ? "side-panel-nav__item--active" : ""}`}
                    onClick={() => setActiveTab("schedule")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Schedule</span>
                  </button>

                  <button
                    className={`side-panel-nav__item ${activeTab === "performance" ? "side-panel-nav__item--active" : ""}`}
                    onClick={() => setActiveTab("performance")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>Performance</span>
                  </button>

                  <button
                    className={`side-panel-nav__item ${activeTab === "message" ? "side-panel-nav__item--active" : ""}`}
                    onClick={() => setActiveTab("message")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>Message</span>
                  </button>

                  <button
                    className={`side-panel-nav__item side-panel-nav__item--danger ${activeTab === "delete" ? "side-panel-nav__item--active" : ""}`}
                    onClick={() => setActiveTab("delete")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete Trainer</span>
                  </button>
                </nav>
              </div>

              {/* Right Content Panel */}
              <div className="trainer-action-modal__content-panel">
                <AnimatePresence mode="wait">
                  {/* ========== Edit Profile Panel ========== */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      className="content-panel content-panel--constrained"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="content-panel__header">
                        <h4 className="content-panel__title">Edit Profile</h4>
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
                            className="avatar-picker-overlay"
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
                                <h5>Choose Your Avatar</h5>
                                <button
                                  className="avatar-picker-modal__close"
                                  onClick={() => setShowAvatarPicker(false)}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                              <AvatarPicker
                                selectedId={editForm.avatarId}
                                userId={trainer?.userId}
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
                        {/* Row 1: Full Name + Email */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-with-validation">
                              <input
                                type="text"
                                className={`form-input ${validation.fullName === true ? 'input--valid' : validation.fullName === false ? 'input--invalid' : ''}`}
                                value={editForm.fullName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                                disabled={isSaving}
                              />
                              <ValidationIcon isValid={validation.fullName} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <div className="input-with-validation">
                              <input
                                type="email"
                                className={`form-input ${validation.email === true ? 'input--valid' : validation.email === false ? 'input--invalid' : ''}`}
                                value={editForm.email}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                disabled={isSaving}
                              />
                              <ValidationIcon isValid={validation.email} />
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Phone + Role */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Phone</label>
                            <div className="input-with-validation">
                              <input
                                type="tel"
                                className={`form-input ${validation.phone === true ? 'input--valid' : validation.phone === false ? 'input--invalid' : ''}`}
                                value={editForm.phone}
                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                disabled={isSaving}
                              />
                              <ValidationIcon isValid={validation.phone} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Role</label>
                            <select
                              className="form-select"
                              value={editForm.role}
                              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                              disabled={isSaving}
                            >
                              <option value="TRAINER">Trainer</option>
                              <option value="SENIOR_TRAINER">Senior Trainer</option>
                              <option value="HEAD_COACH">Head Coach</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 3: Join Date + Leaving Date */}
                        <div className="form-row-2-col">
                          <div className="form-group">
                            <label>Join Date</label>
                            <input
                              type="date"
                              className="form-input"
                              value={editForm.joinDate}
                              onChange={(e) => setEditForm(prev => ({ ...prev, joinDate: e.target.value }))}
                              disabled={isSaving}
                            />
                          </div>
                          <div className="form-group">
                            <label>Leaving Date</label>
                            <input
                              type="date"
                              className="form-input"
                              value={editForm.leavingDate}
                              onChange={(e) => setEditForm(prev => ({ ...prev, leavingDate: e.target.value }))}
                              disabled={isSaving}
                              placeholder="Leave empty if still active"
                            />
                            <span className="form-hint">Leave empty if still active</span>
                          </div>
                        </div>

                        {/* Row 4: Status */}
                        <div className="form-row-1-col">
                          <div className="form-group">
                            <label>Status</label>
                            <select
                              className="form-select"
                              value={editForm.status}
                              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                              disabled={isSaving}
                            >
                              <option value="Active">Active</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Left">Left</option>
                            </select>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="form-actions">
                          <button
                            className="btn btn--primary"
                            onClick={handleSaveProfile}
                            disabled={isSaving || !isFormValid}
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Assigned Members Panel ========== */}
                  {activeTab === "members" && (
                    <motion.div
                      key="members"
                      className="content-panel"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="trainers-header">
                        <h4 className="trainers-header__title">
                          Assigned Members
                          <span className="trainers-count">{assignedMembers.length}</span>
                        </h4>
                        <div className="trainers-header__action">
                          <button
                            className={`add-trainer-btn ${showMemberSearch ? 'add-trainer-btn--active' : ''}`}
                            onClick={() => setShowMemberSearch(!showMemberSearch)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Member
                          </button>

                          {/* Floating Popover */}
                          <AnimatePresence>
                            {showMemberSearch && (
                              <motion.div
                                className="trainer-popover"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="trainer-popover__header">
                                  <span>Search Members</span>
                                  <button
                                    className="trainer-popover__close"
                                    onClick={() => setShowMemberSearch(false)}
                                  >
                                    ×
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  className="trainer-popover__input"
                                  placeholder="Type member name..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Escape' && setShowMemberSearch(false)}
                                  autoFocus
                                />
                                <div className="trainer-popover__results">
                                  {isSearching && (
                                    <div className="trainer-popover__loading">Searching...</div>
                                  )}
                                  {!isSearching && (() => {
                                    const unassignedMembers = availableMembers.filter(
                                      m => !assignedMembers.some(assigned => assigned.userId === m.userId)
                                    )

                                    if (unassignedMembers.length === 0) {
                                      if (availableMembers.length > 0) {
                                        return <div className="trainer-popover__empty">All matching members are already assigned.</div>
                                      } else if (searchQuery.length > 0) {
                                        return <div className="trainer-popover__empty">No members found</div>
                                      }
                                      return null
                                    }

                                    return unassignedMembers.map((member) => (
                                      <div
                                        key={member.userId}
                                        className="trainer-popover__item"
                                        onClick={() => handleAddMember(member)}
                                      >
                                        <div className="trainer-popover__avatar">
                                          {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
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

                      {/* Members List */}
                      <div className="content-panel__body">
                        <div className="trainers-list">
                          {assignedMembers.length === 0 ? (
                            <div className="empty-state">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              <p>No members assigned yet</p>
                              <span>Click "Add Member" to assign one</span>
                            </div>
                          ) : (
                            assignedMembers.map((member) => (
                              <div key={member.userId} className="trainer-item">
                                <div className="trainer-item__info">
                                  <div className="trainer-item__avatar">
                                    {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <div>
                                    <span className="trainer-item__name">{member.fullName}</span>
                                    <span className="trainer-item__role">Member</span>
                                  </div>
                                </div>
                                <button
                                  className="trainer-item__remove"
                                  onClick={() => handleRemoveMember(member.userId)}
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

                  {/* ========== Schedule Panel ========== */}
                  {activeTab === "schedule" && (
                    <motion.div
                      key="schedule"
                      className="content-panel content-panel--constrained"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="content-panel__title">Schedule & Availability</h4>
                      <div className="content-panel__body">
                        <div className="schedule-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <p>Schedule management coming soon</p>
                          <span>Weekly availability grid will be displayed here</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Performance Panel ========== */}
                  {activeTab === "performance" && (
                    <motion.div
                      key="performance"
                      className="content-panel"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="content-panel__title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        Performance & Stats
                      </h4>
                      <div className="content-panel__body">
                        {/* Stats Cards - 4 Column Grid */}
                        <div className="performance-stats-grid">
                          <div className="perf-stat-card perf-stat-card--primary">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">{assignedMembers.length}</span>
                              <span className="perf-stat-card__label">Total Members</span>
                            </div>
                          </div>

                          <div className="perf-stat-card perf-stat-card--success">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">92%</span>
                              <span className="perf-stat-card__label">Attendance</span>
                            </div>
                          </div>

                          <div className="perf-stat-card perf-stat-card--info">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">48</span>
                              <span className="perf-stat-card__label">Sessions/Mo</span>
                            </div>
                          </div>

                          <div className="perf-stat-card perf-stat-card--warning">
                            <div className="perf-stat-card__icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>
                            <div className="perf-stat-card__content">
                              <span className="perf-stat-card__value">4.8</span>
                              <span className="perf-stat-card__label">Rating</span>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Activity Chart */}
                        <div className="performance-chart-section">
                          <div className="performance-chart__header">
                            <h5 className="performance-chart__title">Weekly Activity</h5>
                            <span className="performance-chart__period">Last 7 days</span>
                          </div>
                          <div className="performance-bar-chart">
                            {[
                              { day: 'Mon', sessions: 6, max: 8 },
                              { day: 'Tue', sessions: 8, max: 8 },
                              { day: 'Wed', sessions: 5, max: 8 },
                              { day: 'Thu', sessions: 7, max: 8 },
                              { day: 'Fri', sessions: 8, max: 8 },
                              { day: 'Sat', sessions: 4, max: 8 },
                              { day: 'Sun', sessions: 2, max: 8 },
                            ].map((item, index) => (
                              <div key={item.day} className="bar-chart__column">
                                <div className="bar-chart__bar-container">
                                  <motion.div
                                    className="bar-chart__bar"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.sessions / item.max) * 100}%` }}
                                    transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                                  />
                                </div>
                                <span className="bar-chart__value">{item.sessions}</span>
                                <span className="bar-chart__label">{item.day}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress Rings */}
                        <div className="performance-progress-section">
                          <div className="progress-ring-card">
                            <div className="progress-ring" style={{ '--progress': '88' } as React.CSSProperties}>
                              <svg viewBox="0 0 100 100">
                                <circle className="progress-ring__bg" cx="50" cy="50" r="40" />
                                <circle className="progress-ring__fill" cx="50" cy="50" r="40" />
                              </svg>
                              <span className="progress-ring__value">88%</span>
                            </div>
                            <span className="progress-ring__label">Session Completion</span>
                          </div>

                          <div className="progress-ring-card">
                            <div className="progress-ring" style={{ '--progress': '95' } as React.CSSProperties}>
                              <svg viewBox="0 0 100 100">
                                <circle className="progress-ring__bg" cx="50" cy="50" r="40" />
                                <circle className="progress-ring__fill progress-ring__fill--success" cx="50" cy="50" r="40" />
                              </svg>
                              <span className="progress-ring__value">95%</span>
                            </div>
                            <span className="progress-ring__label">Member Retention</span>
                          </div>

                          <div className="progress-ring-card">
                            <div className="progress-ring" style={{ '--progress': '72' } as React.CSSProperties}>
                              <svg viewBox="0 0 100 100">
                                <circle className="progress-ring__bg" cx="50" cy="50" r="40" />
                                <circle className="progress-ring__fill progress-ring__fill--warning" cx="50" cy="50" r="40" />
                              </svg>
                              <span className="progress-ring__value">72%</span>
                            </div>
                            <span className="progress-ring__label">Goal Progress</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Message Panel ========== */}
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
                              {localTrainer.fullName}
                              <span className="recipient-email">&lt;{localTrainer.email}&gt;</span>
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
                            disabled={isSendingMessage}
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
                            disabled={isSendingMessage}
                          />
                          <span className="message-compose__hint">⌘ + Enter to send</span>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn btn--primary"
                          onClick={handleSendMessage}
                          disabled={isSendingMessage || !messageForm.subject || !messageForm.body}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          {isSendingMessage ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Delete Panel ========== */}
                  {activeTab === "delete" && (
                    <motion.div
                      key="delete"
                      className="content-panel"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="content-panel__body">
                        {/* Danger Zone Card */}
                        <div className="delete-zone">
                          {/* User Preview Card */}
                          <div className="delete-user-preview">
                            <div className="delete-user-preview__avatar">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localTrainer.fullName}`}
                                alt={localTrainer.fullName}
                              />
                            </div>
                            <div className="delete-user-preview__info">
                              <span className="delete-user-preview__name">{localTrainer.fullName}</span>
                              <span className="delete-user-preview__role">{editForm.role}</span>
                            </div>
                          </div>

                          {/* Warning Icon */}
                          <motion.div
                            className="delete-warning-icon"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                          >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </motion.div>

                          {/* Warning Text */}
                          <div className="delete-warning-text">
                            <h5 className="delete-warning-text__title">This action is permanent</h5>
                            <p className="delete-warning-text__desc">
                              Deleting this trainer member will remove all associated data.
                            </p>
                          </div>

                          {/* Consequences List */}
                          <div className="delete-consequences">
                            <div className="delete-consequence">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Member assignments will be removed</span>
                            </div>
                            <div className="delete-consequence">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Schedule data will be deleted</span>
                            </div>
                            <div className="delete-consequence">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Performance history will be lost</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="delete-zone__actions">
                            <button
                              className="btn btn--secondary btn--large"
                              onClick={() => setActiveTab("profile")}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                              </svg>
                              Go Back
                            </button>
                            <button
                              className="btn btn--danger btn--large"
                              onClick={handleDeleteTrainer}
                              disabled={isDeleting}
                            >
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
        </motion.div>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedTrainerActionModal