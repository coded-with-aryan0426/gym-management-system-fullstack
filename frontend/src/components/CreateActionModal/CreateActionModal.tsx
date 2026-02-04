"use client"

import React, { useState, useEffect, useMemo } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { X, ChevronLeft, ChevronDown, User, Phone, Mail, Calendar, CreditCard, Clock, Check, Sparkles, UserPlus, Crown } from "lucide-react"
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

type ViewType = "memberForm" | "staffForm"

// Premium color palette for plan groups
const PLAN_COLORS = [
    '#DC2626', // Crimson
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
];

const CreateActionModal: React.FC<CreateActionModalProps> = ({ isOpen, onClose, initialView = "memberForm" }) => {
    const navigate = useNavigate()
    const [view, setView] = useState<ViewType>(initialView)
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

    // Tiered membership plans
    const [tieredPlans, setTieredPlans] = useState<MembershipPlan[]>([])
    const [loadingPlans, setLoadingPlans] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        startDate: new Date().toISOString().split('T')[0],
    })

    const { refreshMembers } = useMembers()
    const { refreshTrainers: refreshStaff } = useTrainers()

    // Selected plan and variant
    const selectedPlan = tieredPlans.find(p => p.planId === selectedPlanId)
    const selectedVariant = selectedPlan?.variants?.find(v => v.variantId === selectedVariantId)

    // Fetch tiered membership plans
    useEffect(() => {
        if (isOpen && view === "memberForm") {
            fetchTieredPlans()
        }
    }, [isOpen, view])

    const fetchTieredPlans = async () => {
        setLoadingPlans(true)
        try {
            const response = await membershipPlanApi.getActiveTieredPlans()
            setTieredPlans(response.data)
        } catch (err) {
            console.error("Failed to fetch tiered plans:", err)
            toast.error("Failed to load membership plans")
        } finally {
            setLoadingPlans(false)
        }
    }

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setView(initialView)
            setSelectedPlanId(null)
            setSelectedVariantId(null)
            setCurrentStep(1)
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                startDate: new Date().toISOString().split('T')[0],
            })
        }
    }, [isOpen, initialView])

    // Update step based on form completion
    useEffect(() => {
        if (view === "memberForm") {
            if (selectedVariantId) {
                setCurrentStep(3)
            } else if (selectedPlanId) {
                setCurrentStep(2)
            } else if (formData.fullName && formData.phoneNumber && formData.email) {
                setCurrentStep(2)
            } else {
                setCurrentStep(1)
            }
        }
    }, [formData, selectedPlanId, selectedVariantId, view])

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

    const handlePlanSelect = (planId: number) => {
        setSelectedPlanId(planId)
        setSelectedVariantId(null)
    }

    const handleVariantSelect = (variant: PlanVariant) => {
        setSelectedVariantId(variant.variantId ?? null)
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
        setSelectedPlanId(null)
        setSelectedVariantId(null)
        setFormData({
            fullName: "",
            email: "",
            phoneNumber: "",
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
        if (isMember && !selectedVariantId) {
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

            if (isMember && selectedVariant) {
                payload.startDate = formData.startDate
                // Use variantId as packageId for backend compatibility
                payload.packageId = selectedVariantId
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
                        className="cam-modal cam-modal--premium"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Premium Header with Gradient */}
                        <div className="cam-header cam-header--premium">
                            <div className="cam-header__bg" />
                            <div className="cam-header__content">
                                <div className="cam-header__icon-wrap">
                                    <UserPlus size={22} />
                                </div>
                                <div className="cam-header__text">
                                    <h2 className="cam-title">{getTitle()}</h2>
                                    <p className="cam-subtitle">
                                        {view === "memberForm" 
                                            ? "Register a new gym member with their membership plan" 
                                            : "Add a new trainer to your team"}
                                    </p>
                                </div>
                            </div>
                            <button className="cam-close" onClick={handleCloseRequest}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Progress Steps (Member Form Only) */}
                        {view === "memberForm" && (
                            <div className="cam-progress">
                                <div className={`cam-progress__step ${currentStep >= 1 ? 'cam-progress__step--active' : ''} ${currentStep > 1 ? 'cam-progress__step--complete' : ''}`}>
                                    <div className="cam-progress__circle">
                                        {currentStep > 1 ? <Check size={10} /> : '1'}
                                    </div>
                                    <span>Personal Info</span>
                                </div>
                                <div className={`cam-progress__line ${currentStep > 1 ? 'cam-progress__line--filled' : ''}`} />
                                <div className={`cam-progress__step ${currentStep >= 2 ? 'cam-progress__step--active' : ''} ${currentStep > 2 ? 'cam-progress__step--complete' : ''}`}>
                                    <div className="cam-progress__circle">
                                        {currentStep > 2 ? <Check size={10} /> : '2'}
                                    </div>
                                    <span>Select Plan</span>
                                </div>
                                <div className={`cam-progress__line ${currentStep > 2 ? 'cam-progress__line--filled' : ''}`} />
                                <div className={`cam-progress__step ${currentStep >= 3 ? 'cam-progress__step--active' : ''}`}>
                                    <div className="cam-progress__circle">3</div>
                                    <span>Duration</span>
                                </div>
                            </div>
                        )}

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
                                        <motion.div 
                                            className="cam-section cam-section--premium"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0 }}
                                        >
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon">
                                                    <User size={14} />
                                                </div>
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
                                                        {formData.fullName && (
                                                            <Check size={14} className="cam-input-check" />
                                                        )}
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
                                                        {formData.phoneNumber.length === 10 && (
                                                            <Check size={14} className="cam-input-check" />
                                                        )}
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
                                                        {formData.email.includes('@') && formData.email.includes('.') && (
                                                            <Check size={14} className="cam-input-check" />
                                                        )}
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
                                        </motion.div>

                                        {/* Membership Plans Section - Tiered Cards */}
                                        <motion.div 
                                            className="cam-section cam-section--premium cam-section--plans"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                        >
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon cam-section__icon--accent">
                                                    <CreditCard size={14} />
                                                </div>
                                                <span>Select Membership Plan</span>
                                                {selectedPlan && (
                                                    <span className="cam-section__badge">{selectedPlan.planName}</span>
                                                )}
                                            </div>
                                            
                                            {loadingPlans ? (
                                                <div className="cam-plans-loading">
                                                    <div className="cam-spinner" />
                                                    <span>Loading plans...</span>
                                                </div>
                                            ) : tieredPlans.length === 0 ? (
                                                <div className="cam-plans-empty">
                                                    <Sparkles size={24} />
                                                    <span>No membership plans available</span>
                                                    <p>Create plans in Membership Management first</p>
                                                </div>
                                            ) : (
                                                <div className="cam-plans-grid">
                                                    {tieredPlans.map((plan, index) => (
                                                        <button
                                                            key={plan.planId}
                                                            type="button"
                                                            className={`cam-plan-card cam-plan-card--premium ${selectedPlanId === plan.planId ? "cam-plan-card--selected" : ""}`}
                                                            onClick={() => handlePlanSelect(plan.planId!)}
                                                            style={{ '--plan-color': PLAN_COLORS[index % PLAN_COLORS.length] } as React.CSSProperties}
                                                        >
                                                            <div className="cam-plan-card__color-bar" />
                                                            <div className="cam-plan-card__content">
                                                                <div className="cam-plan-card__header">
                                                                    <span className="cam-plan-card__name">{plan.planName}</span>
                                                                    <div className="cam-plan-card__check">
                                                                        {selectedPlanId === plan.planId && <Check size={14} />}
                                                                    </div>
                                                                </div>
                                                                <div className="cam-plan-card__meta">
                                                                    <span className="cam-plan-card__count">
                                                                        {plan.variants?.length || 0} duration{(plan.variants?.length || 0) !== 1 ? 's' : ''}
                                                                    </span>
                                                                    <span className="cam-plan-card__price">
                                                                        From {formatPrice(Math.min(...(plan.variants?.map(v => v.price) || [0])))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    </div>
                                                )}
                                        </motion.div>

                                        {/* Duration Section - Variant Cards */}
                                        <AnimatePresence>
                                            {selectedPlan && selectedPlan.variants && selectedPlan.variants.length > 0 && (
                                                <motion.div
                                                    className="cam-section cam-section--premium cam-section--duration"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    <div className="cam-section__header">
                                                        <div className="cam-section__icon cam-section__icon--emerald">
                                                            <Clock size={14} />
                                                        </div>
                                                        <span>Select Duration</span>
                                                        {selectedVariant && (
                                                            <span className="cam-section__badge cam-section__badge--emerald">
                                                                {formatDuration(selectedVariant.durationDays)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="cam-duration-grid cam-duration-grid--premium">
                                                        {selectedPlan.variants.map((variant) => {
                                                            const planIndex = tieredPlans.findIndex(p => p.planId === selectedPlanId)
                                                            const planColor = PLAN_COLORS[planIndex % PLAN_COLORS.length]
                                                            return (
                                                                <button
                                                                    key={variant.variantId}
                                                                    type="button"
                                                                    className={`cam-duration-card ${selectedVariantId === variant.variantId ? "cam-duration-card--selected" : ""}`}
                                                                    onClick={() => handleVariantSelect(variant)}
                                                                    style={{ '--plan-color': planColor } as React.CSSProperties}
                                                                >
                                                                    <div className="cam-duration-card__duration">
                                                                        {formatDuration(variant.durationDays)}
                                                                    </div>
                                                                    <div className="cam-duration-card__price">
                                                                        {formatPrice(variant.price)}
                                                                    </div>
                                                                    {variant.includedPTSessions > 0 && (
                                                                        <div className="cam-duration-card__pt">
                                                                            +{variant.includedPTSessions} PT Sessions
                                                                        </div>
                                                                    )}
                                                                    {selectedVariantId === variant.variantId && (
                                                                        <div className="cam-duration-card__check">
                                                                            <Check size={14} />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Summary - Premium */}
                                        <AnimatePresence>
                                            {selectedVariant && (
                                                <motion.div
                                                    className="cam-summary cam-summary--premium"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                >
                                                    <div className="cam-summary__header">
                                                        <Sparkles size={14} />
                                                        <span>Order Summary</span>
                                                    </div>
                                                    <div className="cam-summary__body">
                                                        <div className="cam-summary__row">
                                                            <span>Member</span>
                                                            <span>{formData.fullName || 'Not entered'}</span>
                                                        </div>
                                                        <div className="cam-summary__row">
                                                            <span>Plan</span>
                                                            <span>{selectedPlan?.planName}</span>
                                                        </div>
                                                        <div className="cam-summary__row">
                                                            <span>Duration</span>
                                                            <span>{formatDuration(selectedVariant.durationDays)}</span>
                                                        </div>
                                                        {selectedVariant.includedPTSessions > 0 && (
                                                            <div className="cam-summary__row">
                                                                <span>PT Sessions</span>
                                                                <span>{selectedVariant.includedPTSessions} sessions included</span>
                                                            </div>
                                                        )}
                                                        <div className="cam-summary__divider" />
                                                        <div className="cam-summary__row cam-summary__row--total">
                                                            <span>Total Amount</span>
                                                            <span>{formatPrice(selectedVariant.price)}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
                                        <div className="cam-section cam-section--premium">
                                            <div className="cam-section__header">
                                                <div className="cam-section__icon">
                                                    <User size={14} />
                                                </div>
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
                                                        {formData.fullName && (
                                                            <Check size={14} className="cam-input-check" />
                                                        )}
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
                                                        {formData.phoneNumber.length === 10 && (
                                                            <Check size={14} className="cam-input-check" />
                                                        )}
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
                                                        {formData.email.includes('@') && formData.email.includes('.') && (
                                                            <Check size={14} className="cam-input-check" />
                                                        )}
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

                        {/* Premium Footer */}
                        <div className="cam-footer cam-footer--premium">
                            <button type="button" className="cam-btn cam-btn--cancel" onClick={handleCloseRequest} disabled={loading}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="cam-btn cam-btn--submit cam-btn--premium" 
                                onClick={handleSubmit} 
                                disabled={loading || (view === "memberForm" && !selectedVariantId)}
                            >
                                {loading ? (
                                    <>
                                        <div className="cam-spinner cam-spinner--sm" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        Create {view === "memberForm" ? "Member" : "Trainer"}
                                    </>
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
