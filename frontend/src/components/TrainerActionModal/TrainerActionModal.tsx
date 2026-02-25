"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../services/api"
import type { User } from "../../types/user"
import { showToast } from "../../utils/showToast"
import "./StaffActionModal.css"

interface Customer {
  id: number
  name: string
  role: string
}

interface StaffActionModalProps {
  isOpen: boolean
  onClose: () => void
  staff: User | null
  onEditProfile: (staff: User) => void
  onScheduleSession: (staff: User) => void
  onMessageStaff: (staff: User) => void
}

const StaffActionModal: React.FC<StaffActionModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEditProfile,
  onScheduleSession,
  onMessageStaff,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<"edit" | "schedule" | "message" | null>(null)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)

  // Edit Profile form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  })

  // Schedule Session form state
  const [scheduleForm, setScheduleForm] = useState({
    memberName: "",
    date: "",
    time: "",
    duration: "60",
  })

  // Message form state
  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
  })

  // Assigned customers (loaded from API)
  const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([])
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  // Load assigned customers when modal opens
  useEffect(() => {
    if (isOpen && staff) {
      loadAssignedCustomers()
      loadAvailableCustomers()
    }
  }, [isOpen, staff])

  const loadAssignedCustomers = async () => {
    if (!staff) return
    setLoading(true)
    try {
      const customers = await api.getTrainerCustomers(staff.userId)
      setAssignedCustomers(
        customers
          .filter((c: User) => c.userId != null)          // ← guard: skip nulls
          .map((c: User) => ({
            id: c.userId,
            name: c.fullName || 'Unknown',
            role: "Customer"
          }))
      )
    } catch (err) {
      console.error('[Beta] Failed to load assigned customers:', err)
      setAssignedCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableCustomers = async () => {
    try {
      const allCustomers = await api.getUsers("CUSTOMER")
      setAvailableCustomers(
        allCustomers
          .filter((c: User) => c.userId != null)          // ← guard: skip nulls
          .map((c: User) => ({
            id: c.userId,
            name: c.fullName || 'Unknown',
            role: "Customer"
          }))
      )
    } catch (err) {
      console.error('[Beta] Failed to load available customers:', err)
      setAvailableCustomers([])
    }
  }

  const handleEditProfile = () => {
    if (staff) {
      setEditForm({
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phoneNumber || "+1 555 0100",
        notes: "",
      })
    }
    setActiveSubModal("edit")
  }

  const handleScheduleSession = () => {
    setActiveSubModal("schedule")
  }

  const handleMessageStaff = () => {
    setActiveSubModal("message")
    setMessageForm({ subject: "", body: "" })
  }

  const handleSaveProfile = async () => {
    if (staff) {
      try {
        await api.updateUser(staff.userId, {
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
        })
        onEditProfile({ ...staff, ...editForm })
      } catch (err) {
        console.error('[Beta] Failed to update profile:', err)
      }
    }
    setActiveSubModal(null)
  }

  const handleConfirmSchedule = () => {
    if (staff) {
      onScheduleSession(staff)
    }
    setActiveSubModal(null)
  }

  const handleSendMessage = () => {
    if (staff) {
      onMessageStaff(staff)
    }
    setActiveSubModal(null)
  }

  const handleRemoveCustomer = async (customerId: number) => {
    if (!staff) return
    try {
      await api.removeCustomerFromTrainer(staff.userId, customerId)
      await loadAssignedCustomers()                               // reload from DB
      showToast('Member removed from trainer', 'success')
    } catch (err) {
      console.error('[Beta] Failed to remove customer:', err)
      showToast('Failed to remove member', 'error')
    }
  }

  const handleAddCustomer = async (customer: Customer) => {
    if (!staff) return
    try {
      await api.assignCustomerToTrainer(staff.userId, customer.id)
      await loadAssignedCustomers()                               // reload from DB
      setShowCustomerSearch(false)
      showToast(`${customer.name} assigned to trainer`, 'success')
    } catch (err) {
      console.error('[Beta] Failed to assign customer:', err)
      showToast('Failed to assign member to trainer', 'error')
    }
  }


  const getRoleForStaff = () => staff?.roles?.[0]?.roleName || "TRAINER"
  const getStatusForStaff = () => "Active"

  if (!staff) return null

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
          <motion.div
            className="staff-action-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Modal Header */}
            <div className="staff-action-modal__header">
              <h2>Manage Staff: {staff.fullName}</h2>
              <button className="staff-action-modal__close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Staff Info Section */}
            <div className="staff-action-modal__info">
              <div className="staff-info__avatar">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.fullName}`} alt={staff.fullName} />
              </div>
              <div className="staff-info__details">
                <h3 className="staff-info__name">{staff.fullName}</h3>
                <span className="staff-info__role">{getRoleForStaff()}</span>
              </div>
              <span className={`staff-info__status staff-info__status--${getStatusForStaff().toLowerCase()}`}>
                {getStatusForStaff()}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="staff-action-modal__actions">
              <h4>Quick Actions</h4>
              <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={handleEditProfile}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
                <button className="quick-action-btn" onClick={handleScheduleSession}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Schedule Session</span>
                </button>
                <button className="quick-action-btn" onClick={handleMessageStaff}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Message Staff</span>
                </button>
              </div>
            </div>

            {/* Assigned Customers */}
            <div className="staff-action-modal__customers">
              <h4>Assigned Customers ({assignedCustomers.length})</h4>
              <div className="customers-list">
                {loading ? (
                  <div className="loading-text">Loading...</div>
                ) : assignedCustomers.length === 0 ? (
                  <div className="empty-text">No customers assigned</div>
                ) : (
                  assignedCustomers.map((customer) => (
                    <div key={customer.id} className="customer-item">
                      <div className="customer-item__info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="customer-item__name">{customer.name}</span>
                        <span className="customer-item__role">({customer.role})</span>
                      </div>
                      <button className="customer-item__remove" onClick={() => handleRemoveCustomer(customer.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Customer Section */}
              <div className="add-customer-section">
                <button className="add-customer-btn" onClick={() => setShowCustomerSearch(!showCustomerSearch)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Customer
                </button>

                {showCustomerSearch && (
                  <div className="customer-search">
                    <select
                      className="customer-search__select"
                      onChange={(e) => {
                        const customer = availableCustomers.find((c) => c.id === Number(e.target.value))
                        if (customer) handleAddCustomer(customer)
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Search customers...
                      </option>
                      {availableCustomers
                        .filter((c) => !assignedCustomers.find((ac) => ac.id === c.id))
                        .map((customer, idx) => (
                          <option key={customer.id ?? `fallback-${idx}`} value={customer.id}>
                            {customer.name} ({customer.role})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="staff-action-modal__footer">
              <button className="btn btn--secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>

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
                    <h3>Edit Profile: {staff.fullName}</h3>
                    <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="sub-modal__body">
                    <div className="form-group">
                      <label>Profile Photo</label>
                      <div className="photo-upload">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.fullName}`}
                          alt={staff.fullName}
                          className="photo-upload__preview"
                        />
                        <button className="photo-upload__btn">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Upload
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="form-textarea"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                      Cancel
                    </button>
                    <button className="btn btn--primary" onClick={handleSaveProfile}>
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule Session Sub-Modal */}
          <AnimatePresence>
            {activeSubModal === "schedule" && (
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
                    <h3>Schedule Session: {staff.fullName}</h3>
                    <button className="sub-modal__close" onClick={() => setActiveSubModal(null)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="sub-modal__body">
                    <div className="form-group">
                      <label>Member Name</label>
                      <input
                        type="text"
                        value={scheduleForm.memberName}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, memberName: e.target.value })}
                        className="form-input"
                        placeholder="Enter member name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={scheduleForm.date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={scheduleForm.time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <select
                        value={scheduleForm.duration}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                        className="form-select"
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                      </select>
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                      Cancel
                    </button>
                    <button className="btn btn--primary" onClick={handleConfirmSchedule}>
                      Schedule Session
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Staff Sub-Modal */}
          <AnimatePresence>
            {activeSubModal === "message" && (
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
                    <h3>Message Staff: {staff.fullName}</h3>
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
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default StaffActionModal
