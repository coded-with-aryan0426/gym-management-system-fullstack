"use client"

import React, { useState, useEffect, useMemo } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { X, ChevronLeft, User, Phone, Mail, Calendar, CreditCard, Clock, Check } from "lucide-react"
import api from "../../services/api"
import membershipPlanApi from "../../services/membershipPlanApi"
import type { MembershipPackageDTO } from "../../types/membershipPackage"
import { useMembers } from "../../contexts/MembersContext"
import { useTrainers } from "../../contexts/TrainerContext"
import "./CreateActionModal.css"

import ConfirmDialog from "../ui/ConfirmDialog"

interface CreateActionModalProps {
    isOpen: boolean
    onClose: () => void
    initialView?: ViewType
}

type ViewType = "memberForm" | "staffForm"

type PlanGroup = {
    name: string
    plans: MembershipPackageDTO[]
}

const CreateActionModal: React.FC<CreateActionModalProps> = ({ isOpen, onClose, initialView = "memberForm" }) => {
    const navigate = useNavigate()
    const [view, setView] = useState<ViewType>(initialView)
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Membership plans
    const [membershipPlans, setMembershipPlans] = useState<MembershipPackageDTO[]>([])
    const [loadingPlans, setLoadingPlans] = useState(false)
    const [selectedPlanName, setSelectedPlanName] = useState<string>("")

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        packageId: "",
        startDate: new Date().toISOString().split('T')[0],
    })

    const { refreshMembers } = useMembers()
    const { refreshTrainers: refreshStaff } = useTrainers()

    // Fetch membership plans
    useEffect(() => {
        if (isOpen && view === "memberForm") {
            fetchPlans()
        }
    }, [isOpen, view])

    const fetchPlans = async () => {
        setLoadingPlans(true)
        try {
            const response = await membershipPlanApi.getPlansForAssignment()
            setMembershipPlans(response.data)
        } catch (err) {
            console.error("Failed to fetch plans:", err)
            toast.error("Failed to load membership plans")
        } finally {
            setLoadingPlans(false)
        }
    }

    const planGroups = useMemo<PlanGroup[]>(() => {
        const grouped = new Map<string, MembershipPackageDTO[]>()
        membershipPlans.forEach((plan) => {
            const name = plan.packageName?.trim() || "Plan"
            if (!grouped.has(name)) {
                grouped.set(name, [])
            }
            grouped.get(name)?.push(plan)
        })

        return Array.from(grouped.entries()).map(([name, plans]) => ({
            name,
            plans: [...plans].sort((a, b) => (a.durationDays || 0) - (b.durationDays || 0))
        }))
    }, [membershipPlans])

    const selectedGroup = planGroups.find((group) => group.name === selectedPlanName)
    const durationOptions = selectedGroup?.plans ?? []
    const selectedPlan = membershipPlans.find(p => p.packageId.toString() === formData.packageId)

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setView(initialView)
            setSelectedPlanName("")
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                packageId: "",
                startDate: new Date().toISOString().split('T')[0],
            })
        }
    }, [isOpen, initialView])

    const hasUnsavedData = () => {
        return formData.fullName || formData.email || formData.phoneNumber
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === "phoneNumber") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
            setFormData(prev => ({ ...prev, [name]: digitsOnly }))
            return
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePlanNameSelect = (name: string) => {
        setSelectedPlanName(name)
        setFormData(prev => ({ ...prev, packageId: "" }))
    }

    const handleDurationSelect = (plan: MembershipPackageDTO) => {
        setFormData(prev => ({ ...prev, packageId: plan.packageId.toString() }))
    }

    const handleCloseRequest = () => {
        if (hasUnsavedData()) {
            setShowConfirm(true)
        } else {
            onClose()
        }
    }

    const discardAndClose = () => {
        setShowConfirm(false)
        setSelectedPlanName("")
        setFormData({
            fullName: "",
            email: "",
            phoneNumber: "",
            packageId: "",
            startDate: new Date().toISOString().split('T')[0],
        })
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const isMember = view === "memberForm"
        const role = isMember ? "CUSTOMER" : "TRAINER"

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
        if (isMember && !formData.packageId) {
            toast.error("Please select a membership plan and duration")
            return
        }

        setLoading(true)
        try {
            const payload: Record<string, unknown> = {
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                username: isMember ? formData.phoneNumber : formData.email,
                password: "12345678",
                roles: [{ roleId: 0, roleName: role }],
                joinDate: formData.startDate
            }

            if (isMember) {
                payload.startDate = formData.startDate
                payload.packageId = parseInt(formData.packageId)
            }

            await api.createUser(payload as any)
            toast.success(`${isMember ? "Member" : "Trainer"} created successfully`)

            if (isMember) {
                refreshMembers()
                navigate("/members")
            } else {
                refreshStaff()
                navigate("/staff")
            }

            onClose()
        } catch (err: any) {
            console.error("Failed to create user:", err)
            toast.error(err.response?.data?.message || "Failed to create user")
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => view === "memberForm" ? "Add New Member" : "Add New Trainer"

    const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

    const formatDuration = (days: number) => {
        if (days >= 365) {
            const years = Math.floor(days / 365)
            return `${years} Year${years > 1 ? 's' : ''}`
        }
        if (days >= 30) {
            const months = Math.floor(days / 30)
            return `${months} Month${months > 1 ? 's' : ''}`
        }
        return `${days} Day${days > 1 ? 's' : ''}`
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="cam-overlay" onClick={handleCloseRequest}>
                    <motion.div
                        className="cam-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="cam-header">
                            <div className="cam-header__left">
                                <button className="cam-back" onClick={handleCloseRequest}>
                                    <ChevronLeft size={18} />
                                </button>
                                <h2 className="cam-title">{getTitle()}</h2>
                            </div>
                            <button className="cam-close" onClick={handleCloseRequest}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="cam-body">
                            <AnimatePresence mode="wait">
                                {view === "memberForm" && (
                                    <motion.form
                                        key="memberForm"
                                        className="cam-form"
                                        onSubmit={handleSubmit}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {/* Personal Info Section */}
                                        <div className="cam-section">
                                            <div className="cam-section__header">
                                                <User size={14} />
                                                <span>Personal Information</span>
                                            </div>
                                            <div className="cam-grid">
                                                <div className="cam-field">
                                                    <label className="cam-label">Full Name</label>
                                                    <div className="cam-input-wrap">
                                                        <User size={14} className="cam-input-icon" />
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                            placeholder="Enter full name"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Phone Number</label>
                                                    <div className="cam-input-wrap">
                                                        <Phone size={14} className="cam-input-icon" />
                                                        <input
                                                            type="tel"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                            placeholder="10 digit number"
                                                            maxLength={10}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Email Address</label>
                                                    <div className="cam-input-wrap">
                                                        <Mail size={14} className="cam-input-icon" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                            placeholder="email@example.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Start Date</label>
                                                    <div className="cam-input-wrap">
                                                        <Calendar size={14} className="cam-input-icon" />
                                                        <input
                                                            type="date"
                                                            name="startDate"
                                                            value={formData.startDate}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Membership Name Section */}
                                        <div className="cam-section">
                                            <div className="cam-section__header">
                                                <CreditCard size={14} />
                                                <span>Membership Name</span>
                                            </div>
                                            {loadingPlans ? (
                                                <div className="cam-plans-loading">
                                                    <div className="cam-spinner" />
                                                    <span>Loading plans...</span>
                                                </div>
                                            ) : planGroups.length === 0 ? (
                                                <div className="cam-plans-empty">No membership plans available</div>
                                            ) : (
                                                <div className="cam-plans">
                                                    {planGroups.map((group) => (
                                                        <button
                                                            key={group.name}
                                                            type="button"
                                                            className={`cam-plan-card ${selectedPlanName === group.name ? 'cam-plan-card--selected' : ''}`}
                                                            onClick={() => handlePlanNameSelect(group.name)}
                                                        >
                                                            <div className="cam-plan-card__check">
                                                                {selectedPlanName === group.name && <Check size={12} />}
                                                            </div>
                                                            <div className="cam-plan-card__info">
                                                                <span className="cam-plan-card__name">{group.name}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Duration Section */}
                                        <div className="cam-section">
                                            <div className="cam-section__header">
                                                <Clock size={14} />
                                                <span>Duration & Price</span>
                                            </div>
                                            {selectedPlanName ? (
                                                <div className="cam-duration-grid cam-duration-grid--plans">
                                                    {durationOptions.map((plan) => (
                                                        <button
                                                            key={plan.packageId}
                                                            type="button"
                                                            className={`cam-duration-btn cam-duration-btn--card ${formData.packageId === plan.packageId.toString() ? 'cam-duration-btn--selected' : ''}`}
                                                            onClick={() => handleDurationSelect(plan)}
                                                        >
                                                            <span className="cam-duration-btn__label">{formatDuration(plan.durationDays)}</span>
                                                            <span className="cam-duration-btn__price">{formatPrice(plan.price)}</span>
                                                            {formData.packageId === plan.packageId.toString() && <Check size={12} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="cam-duration-empty">Select a membership name to view durations</div>
                                            )}
                                        </div>

                                        {/* Summary */}
                                        {selectedPlan && (
                                            <div className="cam-summary">
                                                <div className="cam-summary__row">
                                                    <span>Plan</span>
                                                    <span>{selectedPlan.packageName}</span>
                                                </div>
                                                <div className="cam-summary__row">
                                                    <span>Duration</span>
                                                    <span>{formatDuration(selectedPlan.durationDays)}</span>
                                                </div>
                                                <div className="cam-summary__row cam-summary__row--total">
                                                    <span>Total</span>
                                                    <span>{formatPrice(selectedPlan.price)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.form>
                                )}

                                {view === "staffForm" && (
                                    <motion.form
                                        key="staffForm"
                                        className="cam-form"
                                        onSubmit={handleSubmit}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="cam-section">
                                            <div className="cam-section__header">
                                                <User size={14} />
                                                <span>Trainer Information</span>
                                            </div>
                                            <div className="cam-grid">
                                                <div className="cam-field">
                                                    <label className="cam-label">Full Name</label>
                                                    <div className="cam-input-wrap">
                                                        <User size={14} className="cam-input-icon" />
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                            placeholder="Enter full name"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Phone Number</label>
                                                    <div className="cam-input-wrap">
                                                        <Phone size={14} className="cam-input-icon" />
                                                        <input
                                                            type="tel"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                            placeholder="10 digit number"
                                                            maxLength={10}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Email Address</label>
                                                    <div className="cam-input-wrap">
                                                        <Mail size={14} className="cam-input-icon" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                            placeholder="email@example.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Join Date</label>
                                                    <div className="cam-input-wrap">
                                                        <Calendar size={14} className="cam-input-icon" />
                                                        <input
                                                            type="date"
                                                            name="startDate"
                                                            value={formData.startDate}
                                                            onChange={handleChange}
                                                            className="cam-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="cam-footer">
                            <button type="button" className="cam-btn cam-btn--cancel" onClick={handleCloseRequest} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="cam-btn cam-btn--submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="cam-spinner cam-spinner--sm" />
                                        Creating...
                                    </>
                                ) : (
                                    `Create ${view === "memberForm" ? "Member" : "Trainer"}`
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showConfirm}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to discard them?"
                confirmText="Discard"
                cancelText="Keep Editing"
                onConfirm={discardAndClose}
                onCancel={() => setShowConfirm(false)}
            />
        </AnimatePresence>
    )

    return ReactDOM.createPortal(modalContent, document.body)
}

export default CreateActionModal
