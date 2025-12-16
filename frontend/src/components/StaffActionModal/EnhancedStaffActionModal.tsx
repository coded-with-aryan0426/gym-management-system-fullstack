"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types/user"
import api from "../../services/api"
import { showToast } from "../../utils/toast"
import "./StaffActionModal.css"

// ============================================================================
// Types
// ============================================================================

type TabType = "profile" | "members" | "schedule" | "performance" | "message" | "delete"

interface EnhancedStaffActionModalProps {
  isOpen: boolean
  onClose: () => void
  staff: User | null
  onEditProfile?: (staff: User) => void
  onScheduleSession?: (staff: User) => void
  onMessageStaff?: (staff: User) => void
  onDeleteStaff?: (staffId: number) => void
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

const EnhancedStaffActionModal: React.FC<EnhancedStaffActionModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEditProfile,
  onDeleteStaff,
  onUpdate,
}) => {
  // ============================================================================
  // State
  // ============================================================================

  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [localStaff, setLocalStaff] = useState<User | null>(null)

  // Edit Profile Form
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "TRAINER",
    specialization: [] as string[],
    joinDate: "",
    status: "Active",
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

  // Initialize form when staff changes
  useEffect(() => {
    if (isOpen && staff) {
      setLocalStaff(staff)
      setActiveTab("profile")
      setEditForm({
        fullName: staff.fullName || "",
        email: staff.email || "",
        phone: staff.phoneNumber || "",
        role: staff.roles?.[0]?.roleName || "TRAINER",
        specialization: [],
        joinDate: staff.createdAt ? new Date(staff.createdAt).toISOString().split('T')[0] : "",
        status: "Active",
      })
      loadAssignedMembers()
    }
  }, [isOpen, staff])

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
    if (!showMemberSearch || !staff) return

    const timeoutId = setTimeout(() => {
      searchMembers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, showMemberSearch, staff])

  // ============================================================================
  // API Handlers
  // ============================================================================

  const loadAssignedMembers = useCallback(async () => {
    if (!staff) return

    try {
      const members = await api.getTrainerCustomers(staff.userId)
      setAssignedMembers(members)
    } catch (error) {
      console.error('[StaffActionModal] Failed to load assigned members:', error)
      setAssignedMembers([])
    }
  }, [staff])

  const searchMembers = async (query: string) => {
    if (!staff) return

    try {
      setIsSearching(true)
      const members = await api.searchUsers('CUSTOMER', query)
      setAvailableMembers(members)
    } catch (error) {
      console.error('[StaffActionModal] Search failed:', error)
      setAvailableMembers([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!staff || !isFormValid) return

    setIsSaving(true)
    try {
      const updatedStaff = await api.updateUser(staff.userId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phone,
      })

      setLocalStaff(prev => prev ? { ...prev, ...updatedStaff } : prev)
      showToast.success("Profile updated successfully")
      onEditProfile?.(updatedStaff)
      onUpdate?.()
      // Modal stays open!
    } catch (error: any) {
      showToast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMember = async (member: User) => {
    if (!staff) return

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
      await api.assignCustomerToTrainer(staff.userId, member.userId)
      showToast.success(`${member.fullName} assigned successfully`)
    } catch (error: any) {
      // Revert on failure
      setAssignedMembers(prev => prev.filter(m => m.userId !== member.userId))
      showToast.error(error.message || "Failed to assign member")
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!staff) return

    const memberToRemove = assignedMembers.find(m => m.userId === memberId)
    if (!memberToRemove) return

    // Optimistic update
    setAssignedMembers(prev => prev.filter(m => m.userId !== memberId))

    try {
      await api.removeCustomerFromTrainer(staff.userId, memberId)
      showToast.success("Member removed successfully")
    } catch (error: any) {
      // Revert on failure
      setAssignedMembers(prev => [...prev, memberToRemove])
      showToast.error(error.message || "Failed to remove member")
    }
  }

  const handleSendMessage = async () => {
    if (!staff || !messageForm.subject || !messageForm.body) return

    setIsSendingMessage(true)
    try {
      // Simulate sending (replace with real API)
      await new Promise(resolve => setTimeout(resolve, 500))
      showToast.success(`Message sent to ${staff.fullName}`)
      setMessageForm({ subject: "", body: "" })
    } catch (error: any) {
      showToast.error(error.message || "Failed to send message")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleDeleteStaff = async () => {
    if (!staff) return

    setIsDeleting(true)
    try {
      await api.deleteUser(staff.userId)
      showToast.success(`${staff.fullName} has been deleted`)
      onDeleteStaff?.(staff.userId)
      onUpdate?.()
      onClose()
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete staff member")
    } finally {
      setIsDeleting(false)
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  if (!staff || !localStaff) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="staff-action-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* External Close Button */}
          <button
            className="staff-action-modal__close-external"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <motion.div
            className="staff-action-modal staff-action-modal--redesigned"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ============================================================
                Profile Header
               ============================================================ */}
            <div className="staff-action-modal__profile-header">
              <div className="profile-header__avatar">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStaff.fullName}`}
                  alt={localStaff.fullName}
                />
              </div>
              <div className="profile-header__info">
                <h2 className="profile-header__name">{localStaff.fullName}</h2>
                <div className="profile-header__meta">
                  <span className="role-badge role-badge--trainer">
                    {editForm.role}
                  </span>
                  <span className={`status-badge status-badge--${editForm.status.toLowerCase()}`}>
                    <span className="status-dot"></span>
                    {editForm.status}
                  </span>
                </div>
                <p className="profile-header__email">{localStaff.email}</p>
              </div>
              <div className="profile-header__stats">
                <div className="stat-item">
                  <span className="stat-value">{assignedMembers.length}</span>
                  <span className="stat-label">Members</span>
                </div>
              </div>
            </div>

            {/* ============================================================
                Content Grid (Nav + Panel)
               ============================================================ */}
            <div className="staff-action-modal__content-grid">
              {/* Left Navigation Column */}
              <div className="staff-action-modal__nav-column">
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
                    <span>Delete Staff</span>
                  </button>
                </nav>
              </div>

              {/* Right Content Panel */}
              <div className="staff-action-modal__content-panel">
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
                      <h4 className="content-panel__title">Edit Profile</h4>
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

                        {/* Row 3: Join Date + Status */}
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
                      className="content-panel content-panel--constrained"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="content-panel__title">Performance & Stats</h4>
                      <div className="content-panel__body">
                        <div className="performance-grid">
                          <div className="performance-card">
                            <span className="performance-card__value">{assignedMembers.length}</span>
                            <span className="performance-card__label">Total Members</span>
                          </div>
                          <div className="performance-card">
                            <span className="performance-card__value">{assignedMembers.length}</span>
                            <span className="performance-card__label">Active Members</span>
                          </div>
                          <div className="performance-card">
                            <span className="performance-card__value">92%</span>
                            <span className="performance-card__label">Attendance Rate</span>
                          </div>
                          <div className="performance-card">
                            <span className="performance-card__value">88%</span>
                            <span className="performance-card__label">Session Completion</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Message Panel ========== */}
                  {activeTab === "message" && (
                    <motion.div
                      key="message"
                      className="content-panel content-panel--constrained"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="content-panel__title">Message Trainer</h4>
                      <div className="content-panel__body">
                        <div className="form-group">
                          <label>Subject</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter subject..."
                            value={messageForm.subject}
                            onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                            disabled={isSendingMessage}
                          />
                        </div>
                        <div className="form-group">
                          <label>Message</label>
                          <textarea
                            className="form-textarea"
                            rows={6}
                            placeholder="Write your message..."
                            value={messageForm.body}
                            onChange={(e) => setMessageForm(prev => ({ ...prev, body: e.target.value }))}
                            disabled={isSendingMessage}
                            onKeyDown={(e) => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                handleSendMessage()
                              }
                            }}
                          />
                          <span className="hint-text">Ctrl/Cmd + Enter to send</span>
                        </div>
                        <div className="form-actions">
                          <button
                            className="btn btn--primary"
                            onClick={handleSendMessage}
                            disabled={isSendingMessage || !messageForm.subject || !messageForm.body}
                          >
                            {isSendingMessage ? "Sending..." : "Send Message"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ========== Delete Panel ========== */}
                  {activeTab === "delete" && (
                    <motion.div
                      key="delete"
                      className="content-panel content-panel--constrained content-panel--danger"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="content-panel__title content-panel__title--danger">Delete Staff</h4>
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
                          <p>You are about to permanently delete <strong>{localStaff.fullName}</strong>.</p>
                          <p className="delete-warning__note">This action cannot be undone.</p>
                        </div>
                        <div className="delete-actions">
                          <button className="btn btn--secondary" onClick={() => setActiveTab("profile")}>
                            Cancel
                          </button>
                          <button
                            className="btn btn--danger"
                            onClick={handleDeleteStaff}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete Staff'}
                          </button>
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

export default EnhancedStaffActionModal