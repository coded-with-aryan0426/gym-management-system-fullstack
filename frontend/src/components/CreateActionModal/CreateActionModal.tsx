"use client"

import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Users, UserPlus, UserCheck, Calendar, CalendarPlus, Package, X, ChevronLeft } from "lucide-react"
import api, { membershipPackageApi } from "../../services/api"
import type { MembershipPackageDTO } from "../../types/membershipPackage"
import { useMembers } from "../../contexts/MembersContext"
import { useTrainers } from "../../contexts/TrainerContext"
import "./CreateActionModal.css"

import ConfirmDialog from "../ui/ConfirmDialog"

interface CreateActionModalProps {
    isOpen: boolean
    onClose: () => void
}

type ViewType = "main" | "user" | "event" | "memberForm" | "staffForm"

const CreateActionModal: React.FC<CreateActionModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate()
    const [view, setView] = useState<ViewType>("main")
    const [loading, setLoading] = useState(false)
    const [fetchingPlans, setFetchingPlans] = useState(false)
    const [availablePlans, setAvailablePlans] = useState<MembershipPackageDTO[]>([])

    // Confirmation Dialog State
    const [showConfirm, setShowConfirm] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        packageId: "",
        duration: "1",
        startDate: new Date().toISOString().split('T')[0],
    })

    // Get refresh functions from contexts
    const { refreshMembers } = useMembers()
    const { refreshTrainers: refreshStaff } = useTrainers()

    // Determine draft key based on view
    const getDraftKey = (currentView: ViewType) => {
        if (currentView === "memberForm") return "member_form_draft"
        if (currentView === "staffForm") return "trainer_form_draft"
        return null
    }

    // Check if form has data
    const hasUnsavedData = () => {
        return (
            formData.fullName ||
            formData.email ||
            formData.phoneNumber ||
            (formData.password && formData.password.length > 0)
        )
    }

    // Load draft when switching views
    useEffect(() => {
        const key = getDraftKey(view)
        if (key) {
            const saved = localStorage.getItem(key)
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    setFormData(prev => ({ ...prev, ...parsed }))
                    toast.success("Resumed your previous draft", { icon: "📝" })
                } catch (e) {
                    localStorage.removeItem(key)
                }
            }
        }
    }, [view])

    // Save draft on change
    useEffect(() => {
        const key = getDraftKey(view)
        if (key && isOpen) {
            // Only save if there's actual data to save
            if (hasUnsavedData()) {
                localStorage.setItem(key, JSON.stringify(formData))
            }
        }
    }, [formData, view, isOpen])

    // Reset when modal opens (if not resuming logic, but here we want to KEEP drafts if they exist)
    // We only reset view to main, but don't clear formData immediately unless it was a fresh open without draft?
    // Actually, simple logic: On open, if we are in main, fine. If we go to form, we load draft.
    // So this useEffect below might need adjustment.
    useEffect(() => {
        if (isOpen) {
            setView("main")
            // We DON'T reset formData here because we want to load it when they click "Member" or "Trainer"
            // But we should reset it if they start fresh? 
            // Let's reset it here to be safe, BUT the load logic in the other useEffect will override it if draft exists.
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                password: "",
                packageId: "",
                duration: "1",
                startDate: new Date().toISOString().split('T')[0],
            })
        }
    }, [isOpen])

    // Fetch plans... (existing useEffect)

    // ... (handleChange existing)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === "phoneNumber") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
            setFormData(prev => ({ ...prev, [name]: digitsOnly }))
            return
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const clearDrafts = () => {
        localStorage.removeItem("member_form_draft")
        localStorage.removeItem("trainer_form_draft")
    }

    const handleCloseRequest = () => {
        const isForm = view === "memberForm" || view === "staffForm"
        if (isForm && hasUnsavedData()) {
            setShowConfirm(true)
        } else {
            onClose()
        }
    }

    const discardAndClose = () => {
        const key = getDraftKey(view)
        if (key) localStorage.removeItem(key)
        setShowConfirm(false)
        setFormData({
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            packageId: "",
            duration: "1",
            startDate: new Date().toISOString().split('T')[0],
        })
        onClose()
    }

    const handleBack = () => {
        // If going back from form, we just save draft automatically (already done by useEffect). 
        // We don't need to confirm on "Back" necessarily, only on "Close".
        // But maybe user expects "Back" to clear? Usually back keeps state in wizards.
        if (view === "memberForm" || view === "staffForm") {
            setView("user")
        } else if (view === "user" || view === "event") {
            setView("main")
        }
    }

    const handleEventNavigation = (path: string) => {
        navigate(path)
        onClose() // Direct navigation doesn't need confirmation usually? Or should we warn?
        // Assuming navigation is intentional and safe to leave draft (or we can clear it)
        setView("main")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const isMember = view === "memberForm"
        const role = isMember ? "CUSTOMER" : "TRAINER"

        // Validation
        if (!formData.fullName.trim()) {
            toast.error("Full Name is required")
            return
        }
        if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
            toast.error("Phone number must be exactly 10 digits")
            return
        }
        if (!formData.email) {
            toast.error("Email is required")
            return
        }
        // Password validation only if NOT member and NOT trainer (i.e. other staff if any, or just safety)
        // Since we only have Member/Trainer in this modal, we can skip password validation for both if we default it.
        // But for safety, let's say if it matches neither (which shouldn't happen), we check.
        // Actually, logic: Trainer & Member get default "12345678".

        if (isMember && !formData.packageId) {
            toast.error("Please select a membership plan")
            return
        }

        setLoading(true)
        try {
            const payload: Record<string, unknown> = {
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                username: isMember ? formData.phoneNumber : formData.email,
                password: "12345678", // Default for both Member and Trainer
                roles: [{ roleId: 0, roleName: role }],
                joinDate: formData.startDate // Send start date as joinDate for all
            }

            if (isMember) {
                payload.startDate = formData.startDate
                payload.duration = parseInt(formData.duration)
                payload.packageId = parseInt(formData.packageId)
            }

            await api.createUser(payload as any)
            toast.success(`${isMember ? "Member" : "Trainer"} created successfully`)

            // Clear draft on success
            const draftKey = isMember ? "member_form_draft" : "trainer_form_draft"
            localStorage.removeItem(draftKey)

            // Refresh appropriate context
            if (isMember) {
                refreshMembers()
                navigate("/members")
            } else {
                refreshStaff()
                navigate("/staff")
            }

            onClose()
            setView("main")
        } catch (err: any) {
            console.error("Failed to create user:", err)
            toast.error(err.response?.data?.message || "Failed to create user")
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        switch (view) {
            case "main": return "Create New..."
            case "user": return "New User Account"
            case "event": return "Schedule Event"
            case "memberForm": return "Add New Member"
            case "staffForm": return "Add New Trainer"
        }
    }

    const isFormView = view === "memberForm" || view === "staffForm"

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="create-action-overlay" onClick={handleCloseRequest}>
                    <motion.div
                        className={`create-action-modal ${isFormView ? 'create-action-modal--form' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="create-action-header">
                            <div className="create-action-title">
                                {view !== "main" && (
                                    <button className="create-action-back" onClick={handleBack}>
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <h3>{getTitle()}</h3>
                            </div>
                            <button className="create-action-close" onClick={handleCloseRequest}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="create-action-body">
                            {/* ... Content remains same ... */}
                            <AnimatePresence mode="wait">
                                {/* MAIN VIEW */}
                                {view === "main" && (
                                    <motion.div
                                        key="main"
                                        className="create-action-grid"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <button className="create-card" onClick={() => setView("user")}>
                                            <div className="create-card__icon">
                                                <Users size={40} />
                                            </div>
                                            <div className="create-card__content">
                                                <h4>New User</h4>
                                                <p>Create a member or trainer account</p>
                                            </div>
                                        </button>

                                        <button className="create-card" onClick={() => setView("event")}>
                                            <div className="create-card__icon">
                                                <Calendar size={40} />
                                            </div>
                                            <div className="create-card__content">
                                                <h4>New Event</h4>
                                                <p>Schedule a class or PT session</p>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}

                                {/* USER SELECTION VIEW */}
                                {view === "user" && (
                                    <motion.div
                                        key="user"
                                        className="create-action-grid"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <button className="create-card" onClick={() => setView("memberForm")}>
                                            <div className="create-card__icon create-card__icon--blue">
                                                <UserPlus size={40} />
                                            </div>
                                            <div className="create-card__content">
                                                <h4>Add Member</h4>
                                                <p>Register a new gym member</p>
                                            </div>
                                        </button>

                                        <button className="create-card" onClick={() => setView("staffForm")}>
                                            <div className="create-card__icon create-card__icon--orange">
                                                <UserCheck size={40} />
                                            </div>
                                            <div className="create-card__content">
                                                <h4>Add Trainer</h4>
                                                <p>Onboard a new trainer</p>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}

                                {/* EVENT SELECTION VIEW */}
                                {view === "event" && (
                                    <motion.div
                                        key="event"
                                        className="create-action-grid"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <button className="create-card" onClick={() => handleEventNavigation("/classes?action=create")}>
                                            <div className="create-card__icon create-card__icon--purple">
                                                <CalendarPlus size={40} />
                                            </div>
                                            <div className="create-card__content">
                                                <h4>Schedule Class</h4>
                                                <p>Create a new group class</p>
                                            </div>
                                        </button>

                                        <button className="create-card" onClick={() => handleEventNavigation("/settings?tab=packages")}>
                                            <div className="create-card__icon create-card__icon--green">
                                                <Package size={40} />
                                            </div>
                                            <div className="create-card__content">
                                                <h4>Create Plan</h4>
                                                <p>Define a new membership package</p>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}

                                {/* MEMBER FORM VIEW */}
                                {view === "memberForm" && (
                                    <motion.form
                                        key="memberForm"
                                        className="create-action-form"
                                        onSubmit={handleSubmit}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number * (10 digits)</label>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={formData.startDate}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Membership Plan *</label>
                                                <select
                                                    name="packageId"
                                                    value={formData.packageId}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    disabled={fetchingPlans}
                                                    required
                                                >
                                                    <option value="">Select a plan</option>
                                                    {availablePlans
                                                        .filter((plan, index, self) =>
                                                            index === self.findIndex(p => p.packageName === plan.packageName)
                                                        )
                                                        .map(plan => (
                                                            <option key={plan.packageId} value={plan.packageId}>
                                                                {plan.packageName} - ₹{plan.price}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Duration *</label>
                                                <select
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    required
                                                >
                                                    <option value="1">1 Month</option>
                                                    <option value="3">3 Months</option>
                                                    <option value="6">6 Months</option>
                                                    <option value="12">12 Months</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}

                                {/* STAFF FORM VIEW */}
                                {view === "staffForm" && (
                                    <motion.form
                                        key="staffForm"
                                        className="create-action-form"
                                        onSubmit={handleSubmit}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="Jane Smith"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number * (10 digits)</label>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="jane@gym.com"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={formData.startDate}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="create-action-footer">
                            {isFormView ? (
                                <>
                                    <button className="btn-cancel" onClick={handleBack} disabled={loading}>
                                        Back
                                    </button>
                                    <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                        {loading ? "Creating..." : `Create ${view === "memberForm" ? "Member" : "Staff"}`}
                                    </button>
                                </>
                            ) : (
                                <button className="btn-cancel" onClick={handleCloseRequest}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showConfirm}
                title="Unsaved Changes"
                message="You have unsaved changes in the form. Are you sure you want to discard them? Your draft is saved if you choose to cancel."
                confirmText="Discard & Close"
                cancelText="Keep Editing"
                onConfirm={discardAndClose}
                onCancel={() => setShowConfirm(false)}
            />
        </AnimatePresence>
    )

    return ReactDOM.createPortal(modalContent, document.body)
}

export default CreateActionModal
