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
    const { refreshStaff } = useTrainers()

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setView("main")
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

    // Fetch plans when entering member form
    useEffect(() => {
        if (view === "memberForm") {
            setFetchingPlans(true)
            membershipPackageApi.getPackages(true)
                .then(plans => setAvailablePlans(plans))
                .catch(err => {
                    console.error("Failed to fetch plans", err)
                    setAvailablePlans([
                        { packageId: 1, packageName: "Gold Plan", price: 99, durationDays: 30, includedPTSessions: 4, isActive: true },
                        { packageId: 2, packageName: "Silver Plan", price: 49, durationDays: 30, includedPTSessions: 2, isActive: true },
                    ])
                })
                .finally(() => setFetchingPlans(false))
        }
    }, [view])

    if (typeof document === "undefined") return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === "phoneNumber") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
            setFormData(prev => ({ ...prev, [name]: digitsOnly }))
            return
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleBack = () => {
        if (view === "memberForm" || view === "staffForm") {
            setView("user")
        } else if (view === "user" || view === "event") {
            setView("main")
        }
    }

    const handleEventNavigation = (path: string) => {
        navigate(path)
        onClose()
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
        if (!isMember && (!formData.password || formData.password.length < 6)) {
            toast.error("Password must be at least 6 characters")
            return
        }
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
                password: isMember ? "12345678" : formData.password,
                roles: [{ roleId: 0, roleName: role }],
            }

            if (isMember) {
                payload.startDate = formData.startDate
                payload.duration = parseInt(formData.duration)
                payload.packageId = parseInt(formData.packageId)
            }

            await api.createUser(payload as any)
            toast.success(`${isMember ? "Member" : "Staff"} created successfully`)

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
            case "staffForm": return "Add New Staff"
        }
    }

    const isFormView = view === "memberForm" || view === "staffForm"

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="create-action-overlay" onClick={onClose}>
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
                            <button className="create-action-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="create-action-body">
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
                                                <p>Create a member or staff account</p>
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
                                                <h4>Add Staff</h4>
                                                <p>Onboard a trainer or employee</p>
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
                                                <label>Password * (min 6 chars)</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="••••••••"
                                                    required
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
                                <button className="btn-cancel" onClick={onClose}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return ReactDOM.createPortal(modalContent, document.body)
}

export default CreateActionModal
