"use client"

import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { X, ChevronLeft } from "lucide-react"
import api, { membershipPackageApi } from "../../services/api"
import type { MembershipPackageDTO } from "../../types/membershipPackage"
import { useMembers } from "../../contexts/MembersContext"
import { useTrainers } from "../../contexts/TrainerContext"
import "./CreateActionModal.css"

import ConfirmDialog from "../ui/ConfirmDialog"
import Editable from "../editor/Editable"
import MembershipAssignment from "../membership/MembershipAssignment"

interface CreateActionModalProps {
    isOpen: boolean
    onClose: () => void
    initialView?: ViewType
}

type ViewType = "memberForm" | "staffForm"

const CreateActionModal: React.FC<CreateActionModalProps> = ({ isOpen, onClose, initialView = "memberForm" }) => {
    const navigate = useNavigate()
    const [view, setView] = useState<ViewType>(initialView)
    const [loading, setLoading] = useState(false)
    const [fetchingPlans, setFetchingPlans] = useState(false)
    const [availablePlans, setAvailablePlans] = useState<MembershipPackageDTO[]>([])

    // Confirmation Dialog State
    const [showConfirm, setShowConfirm] = useState(false)

    // Selected membership ID state
    const [selectedMembershipId, setSelectedMembershipId] = useState<number | undefined>(undefined)

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
            setView(initialView)
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
            setSelectedMembershipId(undefined)
        }
    }, [isOpen, initialView])

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

    // Handle membership selection from our enhanced component
    const handleMembershipSelect = (membershipId: number) => {
        setSelectedMembershipId(membershipId)
        setFormData(prev => ({ ...prev, packageId: membershipId.toString() }))
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
        setSelectedMembershipId(undefined)
        onClose()
    }

    const handleBack = () => {
        // Since we now only have form views, Back should close the modal
        handleCloseRequest()
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
        } catch (err: any) {
            console.error("Failed to create user:", err)
            toast.error(err.response?.data?.message || "Failed to create user")
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        return view === "memberForm" ? "Add New Member" : "Add New Trainer"
    }

    const isFormView = view === "memberForm" || view === "staffForm"

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="create-action-overlay" onClick={handleCloseRequest}>
                    <Editable id="create-action-modal" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
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
                                <button className="create-action-back" onClick={handleBack}>
                                    <ChevronLeft size={20} />
                                </button>
                                <h3>{getTitle()}</h3>
                            </div>
                            <button className="create-action-close" onClick={handleCloseRequest}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="create-action-body">
                            <AnimatePresence mode="wait">

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
                                                {/* Enhanced Membership Assignment Component */}
                                                <MembershipAssignment
                                                    memberId={undefined}
                                                    onMembershipSelect={handleMembershipSelect}
                                                    selectedMembershipId={selectedMembershipId}
                                                    mode="selection"
                                                />
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
                            <button className="btn-cancel" onClick={handleBack} disabled={loading}>
                                Cancel
                            </button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Creating..." : `Create ${view === "memberForm" ? "Member" : "Trainer"}`}
                            </button>
                        </div>
                    </motion.div>
                    </Editable>
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
