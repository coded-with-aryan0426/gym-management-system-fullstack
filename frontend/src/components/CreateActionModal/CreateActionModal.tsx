"use client"

import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
    X, User, Phone, Mail, Calendar, CreditCard, Clock, Check,
    Sparkles, UserPlus, Dumbbell, Briefcase, Building2,
} from "lucide-react"
import api from "../../services/api"
import membershipPlanApi from "../../services/membershipPlanApi"
import type { MembershipPlan, PlanVariant } from "../../types/membershipPackage"
import { useMembers } from "../../contexts/MembersContext"
import { useTrainers } from "../../contexts/TrainerContext"
import "./CreateActionModal.css"
import ConfirmDialog from "../ui/ConfirmDialog"

interface CreateActionModalProps {
    isOpen: boolean
    onClose: () => void
    initialView?: ViewType
}

type ViewType = "memberForm" | "staffForm" | "trainerForm"

const PLAN_COLORS = [
    '#DC2626', '#10B981', '#64748B', '#8B5CF6',
    '#F59E0B', '#EC4899', '#06B6D4', '#84CC16',
]

const TRAINER_TYPES = [
    { value: "Gym Trainer", label: "🏋️ Gym Trainer", desc: "General fitness & gym floor" },
    { value: "Personal Trainer", label: "🎯 Personal Trainer", desc: "1-on-1 personalised PT sessions" },
    { value: "Member Manager", label: "👥 Member Manager", desc: "Manages member relations & renewals" },
    { value: "Other", label: "✏️ Other", desc: "Custom — specify below" },
]

const STAFF_ROLES = [
    { value: "RECEPTIONIST", label: "🗂️ Receptionist", desc: "Front desk & visitor management" },
    { value: "FLOOR_MANAGER", label: "🏢 Floor Manager", desc: "Oversees gym floor operations" },
    { value: "MAINTENANCE", label: "🔧 Maintenance", desc: "Equipment & facility upkeep" },
    { value: "CLEANING", label: "🧹 Housekeeping", desc: "Cleanliness & hygiene" },
    { value: "OPERATIONS", label: "⚙️ Operations", desc: "Day-to-day operations" },
    { value: "SALES", label: "💼 Sales", desc: "Membership sales & renewals" },
    { value: "ADMIN", label: "🛡️ Admin", desc: "Administrative tasks" },
    { value: "TRAINER", label: "🏋️ Trainer", desc: "Fitness trainer on staff payroll" },
    { value: "OTHER", label: "✏️ Other", desc: "Custom role — specify below" },
]

const DEPARTMENTS = [
    "Front Desk", "Fitness Floor", "Personal Training", "Sales",
    "Operations", "Maintenance", "Housekeeping", "Administration", "Management",
]

const emptyForm = () => ({
    fullName: "",
    email: "",
    phoneNumber: "",
    startDate: new Date().toISOString().slice(0, 16),  // YYYY-MM-DDTHH:MM for datetime-local
    // trainer
    trainerType: "",
    customTrainerType: "",
    // staff
    staffRole: "",
    customStaffRole: "",
    department: "",
    customDepartment: "",
})

const CreateActionModal: React.FC<CreateActionModalProps> = ({
    isOpen,
    onClose,
    initialView = "memberForm",
}) => {
    const navigate = useNavigate()
    const [view, setView] = useState<ViewType>(initialView)
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

    const [tieredPlans, setTieredPlans] = useState<MembershipPlan[]>([])
    const [loadingPlans, setLoadingPlans] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)

    const [formData, setFormData] = useState(emptyForm())

    const { refreshMembers } = useMembers()
    const { refreshTrainers } = useTrainers()

    const selectedPlan = tieredPlans.find(p => p.planId === selectedPlanId)
    const selectedVariant = selectedPlan?.variants?.find(v => v.variantId === selectedVariantId)

    // Fetch plans for member form
    useEffect(() => {
        if (isOpen && view === "memberForm") {
            setLoadingPlans(true)
            membershipPlanApi.getActiveTieredPlans()
                .then(r => setTieredPlans(r.data))
                .catch(() => toast.error("Failed to load membership plans"))
                .finally(() => setLoadingPlans(false))
        }
    }, [isOpen, view])

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setView(initialView)
            setSelectedPlanId(null)
            setSelectedVariantId(null)
            setCurrentStep(1)
            setFormData(emptyForm())
        }
    }, [isOpen, initialView])

    // Progress steps for member form
    useEffect(() => {
        if (view !== "memberForm") return
        if (selectedVariantId) setCurrentStep(3)
        else if (selectedPlanId) setCurrentStep(2)
        else if (formData.fullName && formData.phoneNumber && formData.email) setCurrentStep(2)
        else setCurrentStep(1)
    }, [formData, selectedPlanId, selectedVariantId, view])

    const hasUnsavedData = () => formData.fullName || formData.email || formData.phoneNumber

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === "phoneNumber") {
            setFormData(prev => ({ ...prev, phoneNumber: value.replace(/\D/g, "").slice(0, 10) }))
            return
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCloseRequest = () => {
        if (hasUnsavedData()) setShowConfirm(true)
        else onClose()
    }

    const discardAndClose = () => {
        setShowConfirm(false)
        setSelectedPlanId(null)
        setSelectedVariantId(null)
        setFormData(emptyForm())
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // ── Validation ──────────────────────────────────────────────
        if (!formData.fullName.trim()) return toast.error("Full Name is required")
        if (formData.phoneNumber.length !== 10) return toast.error("Phone number must be exactly 10 digits")
        if (!formData.email) return toast.error("Email is required")

        // RFC 5322-inspired email format check
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(formData.email.trim())) return toast.error("Please enter a valid email address")

        // Duplicate email check before hitting the server
        const emailAlreadyExists = await api.checkEmailExists(formData.email.trim())
        if (emailAlreadyExists) return toast.error("An account with this email already exists")

        if (view === "memberForm" && !selectedVariantId)
            return toast.error("Please select a membership plan and duration")

        if (view === "trainerForm") {
            if (!formData.trainerType) return toast.error("Please select a trainer type")
            if (formData.trainerType === "Other" && !formData.customTrainerType.trim())
                return toast.error("Please specify the trainer type")
        }

        if (view === "staffForm") {
            if (!formData.staffRole) return toast.error("Please select a staff role")
            if (formData.staffRole === "OTHER" && !formData.customStaffRole.trim())
                return toast.error("Please specify the staff role")
        }

        // ── Build payload ────────────────────────────────────────────
        setLoading(true)
        try {
            let role: string
            let jobTitleValue: string | undefined
            let departmentValue: string | undefined

            if (view === "memberForm") {
                role = "CUSTOMER"
            } else if (view === "trainerForm") {
                role = "TRAINER"
                jobTitleValue = formData.trainerType === "Other"
                    ? formData.customTrainerType.trim()
                    : formData.trainerType
            } else {
                // staffForm
                role = formData.staffRole === "TRAINER" ? "TRAINER" : "STAFF"
                const matched = STAFF_ROLES.find(r => r.value === formData.staffRole)
                const labelText = matched ? matched.label.replace(/^\S+\s/, "") : formData.staffRole
                jobTitleValue = formData.staffRole === "OTHER"
                    ? formData.customStaffRole.trim()
                    : labelText
                departmentValue = formData.department === "Other"
                    ? formData.customDepartment.trim() || undefined
                    : formData.department || undefined
            }

            const payload: Record<string, unknown> = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber,
                username: view === "memberForm" ? formData.phoneNumber : formData.email.trim(),
                password: "12345678",
                roles: [{ roleId: 0, roleName: role }],
                joinDate: formData.startDate,
                ...(jobTitleValue && { jobTitle: jobTitleValue }),
                ...(departmentValue && { department: departmentValue }),
            }

            if (view === "memberForm" && selectedVariant) {
                payload.startDate = formData.startDate.split('T')[0]   // backward compat date
                payload.startDateTime = formData.startDate               // precise timestamp
                payload.planId = selectedPlanId
                payload.variantId = selectedVariantId
                payload.packageId = selectedVariantId
            }

            await api.createUser(payload as any)

            const label = view === "memberForm" ? "Member" : view === "staffForm" ? "Staff member" : "Trainer"
            toast.success(`${label} created successfully!`)

            if (view === "memberForm") {
                refreshMembers()
                navigate("/members")
            } else {
                refreshTrainers()
                navigate(view === "staffForm" ? "/staff" : "/trainers")
            }

            onClose()
        } catch (err: any) {
            console.error("Failed to create user:", err)
            toast.error(err?.response?.data?.message || "Failed to create user")
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        if (view === "memberForm") return "Add New Member"
        if (view === "staffForm") return "Add New Staff"
        return "Add New Trainer"
    }

    const getSubtitle = () => {
        if (view === "memberForm") return "Register a new gym member with their membership plan"
        if (view === "staffForm") return "Add a new staff member to your gym team"
        return "Add a new trainer to your team"
    }

    const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`
    const formatDuration = (days: number) => {
        if (days >= 365) { const y = Math.floor(days / 365); return `${y} Year${y > 1 ? "s" : ""}` }
        if (days >= 30) { const m = Math.floor(days / 30); return `${m} Month${m > 1 ? "s" : ""}` }
        return `${days} Day${days > 1 ? "s" : ""}`
    }

    // ── JSX ──────────────────────────────────────────────────────────
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="cam-overlay" onClick={handleCloseRequest}>
                    <motion.div
                        className="cam-modal cam-modal--premium"
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="cam-header cam-header--premium">
                            <div className="cam-header__bg" />
                            <div className="cam-header__content">
                                <div className="cam-header__icon-wrap">
                                    {view === "staffForm"
                                        ? <Briefcase size={20} />
                                        : view === "trainerForm"
                                            ? <Dumbbell size={20} />
                                            : <UserPlus size={20} />}
                                </div>
                                <div className="cam-header__text">
                                    <h2 className="cam-title">{getTitle()}</h2>
                                    <p className="cam-subtitle">{getSubtitle()}</p>
                                </div>
                            </div>
                            <button className="cam-close" onClick={handleCloseRequest}><X size={16} /></button>
                        </div>

                        {/* Progress (member only) */}
                        {view === "memberForm" && (
                            <div className="cam-progress">
                                {[
                                    { label: "Personal Info", step: 1 },
                                    { label: "Select Plan", step: 2 },
                                    { label: "Duration", step: 3 },
                                ].map((s, i, arr) => (
                                    <React.Fragment key={s.step}>
                                        <div className={`cam-progress__step ${currentStep >= s.step ? "cam-progress__step--active" : ""} ${currentStep > s.step ? "cam-progress__step--complete" : ""}`}>
                                            <div className="cam-progress__circle">
                                                {currentStep > s.step ? <Check size={10} /> : s.step}
                                            </div>
                                            <span>{s.label}</span>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className={`cam-progress__line ${currentStep > s.step ? "cam-progress__line--filled" : ""}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        {/* Body */}
                        <div className="cam-body">
                            <AnimatePresence mode="wait">

                                {/* ── MEMBER FORM ─────────────────────────────── */}
                                {view === "memberForm" && (
                                    <motion.form key="memberForm" className="cam-form" onSubmit={handleSubmit}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                        <motion.div className="cam-section cam-section--premium"
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0 }}>
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon"><User size={14} /></div>
                                                <span>Personal Information</span>
                                            </div>
                                            <div className="cam-grid">
                                                <div className="cam-field">
                                                    <label className="cam-label">Full Name</label>
                                                    <div className="cam-input-wrap">
                                                        <User size={14} className="cam-input-icon" />
                                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="cam-input" placeholder="Enter full name" required />
                                                        {formData.fullName && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Phone Number</label>
                                                    <div className="cam-input-wrap">
                                                        <Phone size={14} className="cam-input-icon" />
                                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="cam-input" placeholder="10 digit number" maxLength={10} required />
                                                        {formData.phoneNumber.length === 10 && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Email Address</label>
                                                    <div className="cam-input-wrap">
                                                        <Mail size={14} className="cam-input-icon" />
                                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="cam-input" placeholder="email@example.com" required />
                                                        {formData.email.includes("@") && formData.email.includes(".") && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Start Date & Time</label>
                                                    <div className="cam-input-wrap">
                                                        <Calendar size={14} className="cam-input-icon" />
                                                        <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="cam-input" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Plans */}
                                        <motion.div className="cam-section cam-section--premium cam-section--plans"
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon cam-section__icon--accent"><CreditCard size={14} /></div>
                                                <span>Select Membership Plan</span>
                                                {selectedPlan && <span className="cam-section__badge">{selectedPlan.planName}</span>}
                                            </div>
                                            {loadingPlans ? (
                                                <div className="cam-plans-loading"><div className="cam-spinner" /><span>Loading plans…</span></div>
                                            ) : tieredPlans.length === 0 ? (
                                                <div className="cam-plans-empty">
                                                    <Sparkles size={24} />
                                                    <span>No membership plans available</span>
                                                    <p>Create plans in Membership Management first</p>
                                                </div>
                                            ) : (
                                                <div className="cam-plans-grid">
                                                    {tieredPlans.map((plan, index) => (
                                                        <button key={plan.planId} type="button"
                                                            className={`cam-plan-card cam-plan-card--premium ${selectedPlanId === plan.planId ? "cam-plan-card--selected" : ""}`}
                                                            onClick={() => { setSelectedPlanId(plan.planId!); setSelectedVariantId(null) }}
                                                            style={{ "--plan-color": PLAN_COLORS[index % PLAN_COLORS.length] } as React.CSSProperties}>
                                                            <div className="cam-plan-card__color-bar" />
                                                            <div className="cam-plan-card__content">
                                                                <div className="cam-plan-card__header">
                                                                    <span className="cam-plan-card__name">{plan.planName}</span>
                                                                    <div className="cam-plan-card__check">{selectedPlanId === plan.planId && <Check size={14} />}</div>
                                                                </div>
                                                                <div className="cam-plan-card__meta">
                                                                    <span className="cam-plan-card__count">{plan.variants?.length || 0} duration{(plan.variants?.length || 0) !== 1 ? "s" : ""}</span>
                                                                    <span className="cam-plan-card__price">From {formatPrice(Math.min(...(plan.variants?.map(v => v.price) || [0])))}</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Duration */}
                                        <AnimatePresence>
                                            {selectedPlan && (selectedPlan.variants?.length ?? 0) > 0 && (
                                                <motion.div className="cam-section cam-section--premium cam-section--duration"
                                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                                    <div className="cam-section__header">
                                                        <div className="cam-section__icon cam-section__icon--emerald"><Clock size={14} /></div>
                                                        <span>Select Duration</span>
                                                        {selectedVariant && <span className="cam-section__badge cam-section__badge--emerald">{formatDuration(selectedVariant.durationDays)}</span>}
                                                    </div>
                                                    <div className="cam-duration-grid cam-duration-grid--premium">
                                                        {selectedPlan.variants!.map(variant => {
                                                            const planColor = PLAN_COLORS[tieredPlans.findIndex(p => p.planId === selectedPlanId) % PLAN_COLORS.length]
                                                            return (
                                                                <button key={variant.variantId} type="button"
                                                                    className={`cam-duration-card ${selectedVariantId === variant.variantId ? "cam-duration-card--selected" : ""}`}
                                                                    onClick={() => setSelectedVariantId(variant.variantId ?? null)}
                                                                    style={{ "--plan-color": planColor } as React.CSSProperties}>
                                                                    <div className="cam-duration-card__duration">{formatDuration(variant.durationDays)}</div>
                                                                    <div className="cam-duration-card__price">{formatPrice(variant.price)}</div>
                                                                    {variant.includedPTSessions > 0 && <div className="cam-duration-card__pt">+{variant.includedPTSessions} PT Sessions</div>}
                                                                    {selectedVariantId === variant.variantId && <div className="cam-duration-card__check"><Check size={14} /></div>}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Summary */}
                                        <AnimatePresence>
                                            {selectedVariant && (
                                                <motion.div className="cam-summary cam-summary--premium"
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                                    <div className="cam-summary__header"><Sparkles size={14} /><span>Order Summary</span></div>
                                                    <div className="cam-summary__body">
                                                        <div className="cam-summary__row"><span>Member</span><span>{formData.fullName || "Not entered"}</span></div>
                                                        <div className="cam-summary__row"><span>Plan</span><span>{selectedPlan?.planName}</span></div>
                                                        <div className="cam-summary__row"><span>Duration</span><span>{formatDuration(selectedVariant.durationDays)}</span></div>
                                                        {selectedVariant.includedPTSessions > 0 && (
                                                            <div className="cam-summary__row"><span>PT Sessions</span><span>{selectedVariant.includedPTSessions} sessions included</span></div>
                                                        )}
                                                        <div className="cam-summary__divider" />
                                                        <div className="cam-summary__row cam-summary__row--total"><span>Total Amount</span><span>{formatPrice(selectedVariant.price)}</span></div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.form>
                                )}

                                {/* ── TRAINER FORM ─────────────────────────────── */}
                                {view === "trainerForm" && (
                                    <motion.form key="trainerForm" className="cam-form" onSubmit={handleSubmit}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                        {/* Personal Info */}
                                        <div className="cam-section cam-section--premium">
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon"><User size={14} /></div>
                                                <span>Trainer Information</span>
                                            </div>
                                            <div className="cam-grid">
                                                <div className="cam-field">
                                                    <label className="cam-label">Full Name</label>
                                                    <div className="cam-input-wrap">
                                                        <User size={14} className="cam-input-icon" />
                                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="cam-input" placeholder="Enter full name" required />
                                                        {formData.fullName && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Phone Number</label>
                                                    <div className="cam-input-wrap">
                                                        <Phone size={14} className="cam-input-icon" />
                                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="cam-input" placeholder="10 digit number" maxLength={10} required />
                                                        {formData.phoneNumber.length === 10 && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Email Address</label>
                                                    <div className="cam-input-wrap">
                                                        <Mail size={14} className="cam-input-icon" />
                                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="cam-input" placeholder="email@example.com" required />
                                                        {formData.email.includes("@") && formData.email.includes(".") && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Join Date</label>
                                                    <div className="cam-input-wrap">
                                                        <Calendar size={14} className="cam-input-icon" />
                                                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="cam-input" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trainer Type */}
                                        <div className="cam-section cam-section--premium">
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon cam-section__icon--accent"><Dumbbell size={14} /></div>
                                                <span>Trainer Type</span>
                                                {formData.trainerType && formData.trainerType !== "Other" && (
                                                    <span className="cam-section__badge">{formData.trainerType}</span>
                                                )}
                                            </div>
                                            <div className="cam-trainer-types">
                                                {TRAINER_TYPES.map(type => (
                                                    <button key={type.value} type="button"
                                                        className={`cam-type-card ${formData.trainerType === type.value ? "cam-type-card--selected" : ""}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, trainerType: type.value, customTrainerType: "" }))}>
                                                        <span className="cam-type-card__label">{type.label}</span>
                                                        <span className="cam-type-card__desc">{type.desc}</span>
                                                        {formData.trainerType === type.value && <Check size={12} className="cam-type-card__check" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <AnimatePresence>
                                                {formData.trainerType === "Other" && (
                                                    <motion.div className="cam-field cam-field--mt"
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}>
                                                        <label className="cam-label">Specify Trainer Type</label>
                                                        <div className="cam-input-wrap">
                                                            <Dumbbell size={14} className="cam-input-icon" />
                                                            <input type="text" name="customTrainerType" value={formData.customTrainerType} onChange={handleChange}
                                                                className="cam-input" placeholder="e.g. Yoga Instructor, CrossFit Coach…" autoFocus />
                                                            {formData.customTrainerType.trim() && <Check size={14} className="cam-input-check" />}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.form>
                                )}

                                {/* ── STAFF FORM ───────────────────────────────── */}
                                {view === "staffForm" && (
                                    <motion.form key="staffForm" className="cam-form" onSubmit={handleSubmit}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                        {/* Personal Info */}
                                        <div className="cam-section cam-section--premium">
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon"><User size={14} /></div>
                                                <span>Staff Information</span>
                                            </div>
                                            <div className="cam-grid">
                                                <div className="cam-field">
                                                    <label className="cam-label">Full Name</label>
                                                    <div className="cam-input-wrap">
                                                        <User size={14} className="cam-input-icon" />
                                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="cam-input" placeholder="Enter full name" required />
                                                        {formData.fullName && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Phone Number</label>
                                                    <div className="cam-input-wrap">
                                                        <Phone size={14} className="cam-input-icon" />
                                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="cam-input" placeholder="10 digit number" maxLength={10} required />
                                                        {formData.phoneNumber.length === 10 && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Email Address</label>
                                                    <div className="cam-input-wrap">
                                                        <Mail size={14} className="cam-input-icon" />
                                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="cam-input" placeholder="email@example.com" required />
                                                        {formData.email.includes("@") && formData.email.includes(".") && <Check size={14} className="cam-input-check" />}
                                                    </div>
                                                </div>
                                                <div className="cam-field">
                                                    <label className="cam-label">Join Date</label>
                                                    <div className="cam-input-wrap">
                                                        <Calendar size={14} className="cam-input-icon" />
                                                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="cam-input" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Staff Role */}
                                        <div className="cam-section cam-section--premium">
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon cam-section__icon--accent"><Briefcase size={14} /></div>
                                                <span>Staff Role</span>
                                                {formData.staffRole && formData.staffRole !== "OTHER" && (
                                                    <span className="cam-section__badge">
                                                        {STAFF_ROLES.find(r => r.value === formData.staffRole)?.label.replace(/^\S+\s/, "") ?? formData.staffRole}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="cam-trainer-types cam-staff-roles">
                                                {STAFF_ROLES.map(role => (
                                                    <button key={role.value} type="button"
                                                        className={`cam-type-card ${formData.staffRole === role.value ? "cam-type-card--selected" : ""}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, staffRole: role.value, customStaffRole: "" }))}>
                                                        <span className="cam-type-card__label">{role.label}</span>
                                                        <span className="cam-type-card__desc">{role.desc}</span>
                                                        {formData.staffRole === role.value && <Check size={12} className="cam-type-card__check" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <AnimatePresence>
                                                {formData.staffRole === "OTHER" && (
                                                    <motion.div className="cam-field cam-field--mt"
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}>
                                                        <label className="cam-label">Specify Role</label>
                                                        <div className="cam-input-wrap">
                                                            <Briefcase size={14} className="cam-input-icon" />
                                                            <input type="text" name="customStaffRole" value={formData.customStaffRole} onChange={handleChange}
                                                                className="cam-input" placeholder="e.g. Security Guard, Physiotherapist…" autoFocus />
                                                            {formData.customStaffRole.trim() && <Check size={14} className="cam-input-check" />}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Department */}
                                        <div className="cam-section cam-section--premium">
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon cam-section__icon--emerald"><Building2 size={14} /></div>
                                                <span>Department <span className="cam-label--optional">(optional)</span></span>
                                                {formData.department && formData.department !== "Other" && (
                                                    <span className="cam-section__badge cam-section__badge--emerald">{formData.department}</span>
                                                )}
                                            </div>
                                            <div className="cam-dept-grid">
                                                {[...DEPARTMENTS, "Other"].map(dept => (
                                                    <button key={dept} type="button"
                                                        className={`cam-dept-chip ${formData.department === dept ? "cam-dept-chip--selected" : ""}`}
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            department: prev.department === dept ? "" : dept,
                                                            customDepartment: "",
                                                        }))}>
                                                        {dept}
                                                        {formData.department === dept && <Check size={10} />}
                                                    </button>
                                                ))}
                                            </div>
                                            <AnimatePresence>
                                                {formData.department === "Other" && (
                                                    <motion.div className="cam-field cam-field--mt"
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}>
                                                        <label className="cam-label">Specify Department</label>
                                                        <div className="cam-input-wrap">
                                                            <Building2 size={14} className="cam-input-icon" />
                                                            <input type="text" name="customDepartment" value={formData.customDepartment} onChange={handleChange}
                                                                className="cam-input" placeholder="e.g. Yoga Studio, Spa…" autoFocus />
                                                            {formData.customDepartment.trim() && <Check size={14} className="cam-input-check" />}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.form>
                                )}

                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="cam-footer cam-footer--premium">
                            <button type="button" className="cam-btn cam-btn--cancel" onClick={handleCloseRequest} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="cam-btn cam-btn--submit cam-btn--premium" onClick={handleSubmit}
                                disabled={loading || (view === "memberForm" && !selectedVariantId)}>
                                {loading ? (
                                    <><div className="cam-spinner cam-spinner--sm" />Creating…</>
                                ) : (
                                    <><UserPlus size={16} />
                                        Create {view === "memberForm" ? "Member" : view === "staffForm" ? "Staff" : "Trainer"}</>
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
