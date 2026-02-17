"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types/user"
import "./MemberActionModal.css"

interface Trainer {
  id: number
  name: string
  role: string
}

interface MemberActionModalProps {
  isOpen: boolean
  onClose: () => void
  member: User | null
  onEditProfile: (member: User) => void
  onRenewPlan: (member: User, packageId?: number, amount?: number) => void
  onSendMessage: (member: User) => void
}

const MemberActionModal: React.FC<MemberActionModalProps> = ({
  isOpen,
  onClose,
  member,
  onEditProfile,
  onRenewPlan,
  onSendMessage,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<"edit" | "renew" | "message" | null>(null)
  const [showTrainerSearch, setShowTrainerSearch] = useState(false)

  // Renew Plan form state
  const [availablePackages, setAvailablePackages] = useState<any[]>([])
  const [renewForm, setRenewForm] = useState({
    packageId: 0,
    amount: "0",
  })

  // Load packages when submodal opens
  useEffect(() => {
    if (activeSubModal === "renew") {
      import("../../services/api").then(module => {
        module.default.getPackages(true).then(pkgs => {
          setAvailablePackages(pkgs)
          if (pkgs.length > 0) {
            setRenewForm({
              packageId: pkgs[0].packageId,
              amount: String(pkgs[0].price)
            })
          }
        })
      })
    }
  }, [activeSubModal])

  // Edit Profile form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  })

  // Message form state
  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
  })

  // Assigned trainers
  const [assignedTrainers, setAssignedTrainers] = useState<Trainer[]>([
    { id: 1, name: "Mike Tyson", role: "Trainer" },
    { id: 2, name: "Rocky Balboa", role: "Trainer" },
  ])

  const availableTrainers: Trainer[] = [
    { id: 3, name: "Jim Halpert", role: "Trainer" },
    { id: 4, name: "Dwight Schrute", role: "Trainer" },
    { id: 5, name: "Michael Scott", role: "Trainer" },
  ]

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

  const handleRenewPlan = () => {
    setActiveSubModal("renew")
  }

  const handleMessageMember = () => {
    setActiveSubModal("message")
    setMessageForm({ subject: "", body: "" })
  }

  const handleSaveProfile = () => {
    if (member) {
      onEditProfile({ ...member, ...editForm })
    }
    setActiveSubModal(null)
  }

  const handleRenewAndPay = () => {
    if (member && renewForm.packageId) {
      onRenewPlan(member, renewForm.packageId, Number(renewForm.amount))
    }
    setActiveSubModal(null)
  }

  const handleSendMessage = () => {
    if (member) {
      onSendMessage(member)
    }
    setActiveSubModal(null)
  }

  const handleRemoveTrainer = (trainerId: number) => {
    setAssignedTrainers(assignedTrainers.filter((t) => t.id !== trainerId))
  }

  const handleAddTrainer = (trainer: Trainer) => {
    setAssignedTrainers([...assignedTrainers, trainer])
    setShowTrainerSearch(false)
  }

  const getPlanForMember = () => (member as any)?.plan || "Gold Plan"
  const getStatusForMember = () => (member as any)?.status || "Active"

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
              <button className="member-action-modal__close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Member Info Section */}
            <div className="member-action-modal__info">
              <div className="member-info__avatar">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fullName}`} alt={member.fullName} />
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
                <button className="quick-action-btn" onClick={handleEditProfile}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
                <button className="quick-action-btn" onClick={handleRenewPlan}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  <span>Renew Plan</span>
                </button>
                <button className="quick-action-btn" onClick={handleMessageMember}>
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
              <h4>Assigned Trainers ({assignedTrainers.length})</h4>
              <div className="trainers-list">
                {assignedTrainers.map((trainer) => (
                  <div key={trainer.id} className="trainer-item">
                    <div className="trainer-item__info">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="trainer-item__name">{trainer.name}</span>
                      <span className="trainer-item__role">({trainer.role})</span>
                    </div>
                    <button className="trainer-item__remove" onClick={() => handleRemoveTrainer(trainer.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Trainer Section */}
              <div className="add-trainer-section">
                <button className="add-trainer-btn" onClick={() => setShowTrainerSearch(!showTrainerSearch)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Trainer
                </button>

                {showTrainerSearch && (
                  <div className="trainer-search">
                    <select
                      className="trainer-search__select"
                      onChange={(e) => {
                        const trainer = availableTrainers.find((t) => t.id === Number(e.target.value))
                        if (trainer) handleAddTrainer(trainer)
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Search trainers...
                      </option>
                      {availableTrainers
                        .filter((t) => !assignedTrainers.find((at) => at.id === t.id))
                        .map((trainer) => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.name} ({trainer.role})
                          </option>
                        ))}
                    </select>
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
                      <label>Profile Photo</label>
                      <div className="photo-upload">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fullName}`}
                          alt={member.fullName}
                          className="photo-upload__preview"
                        />
                        <button className="photo-upload__btn">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
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

          {/* Renew Plan Sub-Modal */}
          <AnimatePresence>
            {activeSubModal === "renew" && (
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
                          if (pkg) {
                            setRenewForm({
                              packageId: pid,
                              amount: String(pkg.price)
                            })
                          }
                        }}
                        className="form-select"
                      >
                        <option value={0} disabled>Select a plan</option>
                        {availablePackages.map(pkg => (
                          <option key={pkg.packageId} value={pkg.packageId}>
                            {pkg.packageName || pkg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <input
                        type="text"
                        className="form-input"
                        value={availablePackages.find(p => p.packageId === renewForm.packageId)?.durationMonths ? availablePackages.find(p => p.packageId === renewForm.packageId)?.durationMonths + " Months" : "1 Month"}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Amount</label>
                      <input
                        type="text"
                        value={`₹${renewForm.amount}`}
                        readOnly
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="sub-modal__footer">
                    <button className="btn btn--secondary" onClick={() => setActiveSubModal(null)}>
                      Cancel
                    </button>
                    <button className="btn btn--primary" onClick={handleRenewAndPay}>
                      Renew & Pay
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Member Sub-Modal */}
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
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default MemberActionModal
