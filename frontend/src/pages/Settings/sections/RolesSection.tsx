"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Shield, 
    Info, 
    Check, 
    Minus, 
    Save, 
    Loader2,
    Users,
    Lock,
    Unlock,
    UserCircle,
    ShieldCheck
} from "lucide-react"
import api from "../../../services/api"

interface Permission {
    key: string
    label: string
    description: string
}

interface RolePermissions {
    [role: string]: {
        [permission: string]: boolean
    }
}

const permissions: Permission[] = [
    { key: 'createMembers', label: 'Create Members', description: 'Add new members to the system' },
    { key: 'editMembers', label: 'Edit Members', description: 'Modify member profiles and plans' },
    { key: 'deleteMembers', label: 'Delete Members', description: 'Remove members from the system' },
    { key: 'editPlans', label: 'Edit Plans', description: 'Create and modify membership plans' },
    { key: 'markCashPayments', label: 'Mark Cash Payments', description: 'Record cash transactions' },
    { key: 'applyDiscounts', label: 'Apply Discounts', description: 'Give discounts on memberships' },
    { key: 'viewRevenue', label: 'View Revenue', description: 'Access financial reports' },
    { key: 'manageStaff', label: 'Manage Staff', description: 'Add, edit, or remove staff accounts' },
    { key: 'viewOwnProfile', label: 'View Own Profile', description: 'View personal membership details' },
    { key: 'bookSessions', label: 'Book Sessions', description: 'Schedule PT sessions and classes' },
    { key: 'viewSchedule', label: 'View Schedule', description: 'See class schedules and bookings' },
]

const roles = ['Owner', 'Manager', 'Staff', 'Trainer', 'Member']

const RolesSection: React.FC = () => {
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
        Owner: {
            createMembers: true, editMembers: true, deleteMembers: true, editPlans: true,
            markCashPayments: true, applyDiscounts: true, viewRevenue: true, manageStaff: true,
            viewOwnProfile: true, bookSessions: true, viewSchedule: true,
        },
        Manager: {
            createMembers: true, editMembers: true, deleteMembers: true, editPlans: true,
            markCashPayments: true, applyDiscounts: true, viewRevenue: true, manageStaff: false,
            viewOwnProfile: true, bookSessions: true, viewSchedule: true,
        },
        Staff: {
            createMembers: true, editMembers: true, deleteMembers: false, editPlans: false,
            markCashPayments: false, applyDiscounts: false, viewRevenue: false, manageStaff: false,
            viewOwnProfile: true, bookSessions: true, viewSchedule: true,
        },
        Trainer: {
            createMembers: false, editMembers: false, deleteMembers: false, editPlans: false,
            markCashPayments: false, applyDiscounts: false, viewRevenue: false, manageStaff: false,
            viewOwnProfile: true, bookSessions: true, viewSchedule: true,
        },
        Member: {
            createMembers: false, editMembers: false, deleteMembers: false, editPlans: false,
            markCashPayments: false, applyDiscounts: false, viewRevenue: false, manageStaff: false,
            viewOwnProfile: true, bookSessions: true, viewSchedule: true,
        },
    })
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalPermissions, setOriginalPermissions] = useState<RolePermissions | null>(null)

    useEffect(() => {
        setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)))
    }, [])

    const togglePermission = (role: string, permission: string) => {
        if (role === 'Owner') {
            toast.error("Owner permissions are globally locked")
            return
        }

        setRolePermissions(prev => {
            const updated = {
                ...prev,
                [role]: {
                    ...prev[role],
                    [permission]: !prev[role][permission]
                }
            }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalPermissions))
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            // In a real app, we'd send this to the backend
            await api.put('/settings', { rolesAndPermissions: rolePermissions })
            setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)))
            setHasChanges(false)
            toast.success("Role permissions updated successfully")
        } catch (error) {
            console.error('Failed to save permissions:', error)
            toast.error("Failed to save permissions")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Roles & Permissions</h2>
                        <p className="settings-section__description">
                            Manage access control and feature visibility for each role
                        </p>
                    </div>
                </div>
                {hasChanges && (
                    <button 
                        className="settings-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            <div className="settings-section__content">
                <div className="permissions-matrix">
                    <div className="permissions-matrix__header">
                        <div className="permissions-matrix__cell permissions-matrix__cell--label">
                            <ShieldCheck size={16} style={{ marginRight: '8px', color: 'var(--settings-accent-green)' }} />
                            Feature / Permission
                        </div>
                        {roles.map(role => (
                            <div key={role} className="permissions-matrix__cell permissions-matrix__cell--role">
                                {role === 'Owner' && <Lock size={10} style={{ marginRight: '4px' }} />}
                                {role}
                            </div>
                        ))}
                    </div>

                    {permissions.map(permission => (
                        <div key={permission.key} className="permissions-matrix__row">
                            <div className="permissions-matrix__cell permissions-matrix__cell--label">
                                <span className="permissions-matrix__permission-name">{permission.label}</span>
                                <span className="permissions-matrix__permission-desc">{permission.description}</span>
                            </div>
                            {roles.map(role => (
                                <div key={role} className="permissions-matrix__cell">
                                    <button
                                        className={`permissions-matrix__toggle ${rolePermissions[role][permission.key] ? 'permissions-matrix__toggle--active' : ''}`}
                                        onClick={() => togglePermission(role, permission.key)}
                                        disabled={role === 'Owner'}
                                        title={role === 'Owner' ? 'Owner permissions are locked' : `Toggle ${permission.label} for ${role}`}
                                    >
                                        {rolePermissions[role][permission.key] ? <Check size={16} /> : <Minus size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="policy-note">
                    <div className="policy-note__icon"><Info size={16} /></div>
                    <div className="policy-note__text">
                        <p><strong>Security Note:</strong> Permissions for the <strong>Owner</strong> role are hardcoded for security and cannot be modified. Any changes to other roles will take effect upon next user login.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RolesSection
