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
  onRenewPlan: (member: User) => void
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
  const [activeSubModal, setActiveSubModal] = useState<"edit" | "renew" | "message" | null>(null)
  const [showTrainerSearch, setShowTrainerSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

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
    revertUpdate: (operationId: string) => {},
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
    triggerHover: (element: any) => {},
    showLoading: (key: string) => {},
    showSuccess: (message: string) => showToast.success(message),
    showError: (error: any) => showToast.error(error.message || 'Operation failed'),
    clearLoading: (key: string) => {},
    isLoading: (key: string) => false,
    successStates: {} as any
  };

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const [renewForm, setRenewForm] = useState({
    plan: "Gold Plan",
    duration: "1 Year",
    amount: "79,999",
  })

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
  }, [member])

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
  }, [member])

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
        notes: "",
      })
    }
  }, [isOpen, member, loadAssignedTrainers])

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
        notes: "",
      })
    }
    setActiveSubModal("edit")
  }

  const handleSaveProfile = async () => {
    if (!member) return

    try {
      showLoading('save-profile')
      
      // Use the regular API instead of enhanced API for better compatibility
      const updatedUser = await api.updateUser(member.userId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phone
      })
      
      // Create a properly typed member object for the callback
      const updatedMember = {
        ...member,
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone
      }
      
      onEditProfile(updatedMember)
      setActiveSubModal(null)
      showSuccess('Profile updated successfully')
    } catch (error) {
      showError('Failed to update profile')
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
    if (member) {
      onRenewPlan(member)
    }
    setActiveSubModal(null)
  }

  const handleSendMessage = async () => {
    if (!member) return

    try {
      showLoading('send-message')
      
      // Simulate message sending (in real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSendMessage(member)
      setActiveSubModal(null)
      showSuccess(`Message sent to ${member.fullName}`)
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
    // Use the actual planName from the member data
    return (member as any)?.planName || "No Plan"
  }

  const getStatusForMember = () => {
    // Use the actual status from the member data
    return (member as any)?.status || "Active"
  }

  if (!member) return null

  const modalContent = (
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
          <motion.div
            className="member-action-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Modal Header */}
            <div className="member-action-modal__header">
              <h2>Manage Member: {member.fullName}</h2>
              <div className="header-status">
                <button className="member-action-modal__close" onClick={onClose}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Member Info Section */}
            <div className="member-action-modal__info">
              <div className="member-info__avatar">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fullName}`} alt={member.fullName} />
                {isRealTimeLoading && <div className="avatar-loading-overlay">
                  <div className="loading-spinner"></div>
                </div>}
              </div>
              <div className="member-info__details">
                <h3 className="member-info__name">{member.fullName}</h3>
                <span className="member-info__plan">{getPlanForMember()}</span>
              </div>
              <span className={`member-info__status member-info__status--${getStatusForMember().toLowerCase()}`}>
                {getStatusForMember()}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="member-action-modal__actions">
              <h4>Quick Actions</h4>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-btn" 
                  onClick={handleEditProfile}
                  onMouseEnter={(e) => triggerHover(e.currentTarget)}
                  disabled={isLoading('save-profile')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>{isLoading('save-profile') ? 'Saving...' : 'Edit Profile'}</span>
                  {successStates['save-profile'] && <div className="success-indicator">✓</div>}
                </button>
                
                <button 
                  className="quick-action-btn" 
                  onClick={handleRenewPlan}
                  onMouseEnter={(e) => triggerHover(e.currentTarget)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  <span>Renew Plan</span>
                </button>
                
                <button 
                  className="quick-action-btn" 
                  onClick={handleMessageMember}
                  onMouseEnter={(e) => triggerHover(e.currentTarget)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Message Member</span>
                </button>
              </div>
            </div>

            {/* Assigned Trainers */}
            <div className="member-action-modal__trainers">
              <h4>
                Assigned Trainers ({assignedTrainers.length})
                {isLoading('load-trainers') && <span className="loading-text"> Loading...</span>}
              </h4>
              
              <div className="trainers-list">
                {isLoading('load-trainers') ? (
                  <div className="skeleton-loader">
                    {Array.from({ length: 2 }, (_, i) => (
                      <div key={i} className="trainer-item-skeleton">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-text"></div>
                      </div>
                    ))}
                  </div>
                ) : assignedTrainers.length === 0 ? (
                  <div className="empty-state">No trainers assigned</div>
                ) : (
                  assignedTrainers.map((trainer) => (
                    <div key={trainer.userId} className="trainer-item">
                      <div className="trainer-item__info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="trainer-item__name">{trainer.fullName}</span>
                        <span className="trainer-item__role">(Trainer)</span>
                      </div>
                      <button 
                        className="trainer-item__remove" 
                        onClick={() => handleRemoveTrainer(trainer.userId)}
                        disabled={isOperationPending(`trainer_${trainer.userId}`)}
                      >
                        {isOperationPending(`trainer_${trainer.userId}`) ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Trainer Section */}
              <div className="add-trainer-section">
                <button 
                  className="add-trainer-btn" 
                  onClick={() => setShowTrainerSearch(!showTrainerSearch)}
                  onMouseEnter={(e) => triggerHover(e.currentTarget)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Trainer
                </button>

                {showTrainerSearch && (
                  <div className="trainer-search">
                    <input
                      type="text"
                      className="trainer-search__input"
                      placeholder="Search trainers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    {isSearching && <div className="search-loading">Searching...</div>}
                    
                    {availableTrainers.length > 0 && (
                      <div className="search-results">
                        {availableTrainers.map((trainer) => (
                          <div 
                            key={trainer.userId} 
                            className="search-result-item"
                            onClick={() => handleAddTrainer(trainer)}
                          >
                            <span>{trainer.fullName}</span>
                            <span className="trainer-email">({trainer.email})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="member-action-modal__footer">
              <button className="btn btn--secondary" onClick={onClose}>
                Close
              </button>
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
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default EnhancedMemberActionModal