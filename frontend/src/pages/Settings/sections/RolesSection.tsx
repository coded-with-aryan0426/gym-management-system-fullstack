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
    Lock,
    ShieldCheck,
    UserCircle,
    Eye,
    Settings,
    Database,
    CreditCard
} from "lucide-react"
import api from "../../../services/api"

interface Permission {
    key: string
    label: string
    description: string
    icon: React.ReactNode
}

interface RolePermissions {
    [role: string]: {
        [permission: string]: boolean
    }
}

const permissions: Permission[] = [
    { key: 'createMembers', label: 'Create Members', description: 'Add new members to the system', icon: <UserCircle size={14} /> },
    { key: 'editMembers', label: 'Edit Members', description: 'Modify member profiles and plans', icon: <Settings size={14} /> },
    { key: 'deleteMembers', label: 'Delete Members', description: 'Remove members from the system', icon: <Shield size={14} /> },
    { key: 'editPlans', label: 'Edit Plans', description: 'Create and modify membership plans', icon: <Database size={14} /> },
    { key: 'markCashPayments', label: 'Mark Cash Payments', description: 'Record cash transactions', icon: <CreditCard size={14} /> },
    { key: 'applyDiscounts', label: 'Apply Discounts', description: 'Give discounts on memberships', icon: <CreditCard size={14} /> },
    { key: 'viewRevenue', label: 'View Revenue', description: 'Access financial reports', icon: <Eye size={14} /> },
    { key: 'manageStaff', label: 'Manage Staff', description: 'Add, edit, or remove staff accounts', icon: <ShieldCheck size={14} /> },
]

const roles = ['Owner', 'Manager', 'Staff', 'Trainer', 'Member']

const RolesSection: React.FC = () => {
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
        Owner: {
            createMembers: true, editMembers: true, deleteMembers: true, editPlans: true,
            markCashPayments: true, applyDiscounts: true, viewRevenue: true, manageStaff: true,
        },
        Manager: {
            createMembers: true, editMembers: true, deleteMembers: true, editPlans: true,
            markCashPayments: true, applyDiscounts: true, viewRevenue: true, manageStaff: false,
        },
        Staff: {
            createMembers: true, editMembers: true, deleteMembers: false, editPlans: false,
            markCashPayments: false, applyDiscounts: false, viewRevenue: false, manageStaff: false,
        },
        Trainer: {
            createMembers: false, editMembers: false, deleteMembers: false, editPlans: false,
            markCashPayments: false, applyDiscounts: false, viewRevenue: false, manageStaff: false,
        },
        Member: {
            createMembers: false, editMembers: false, deleteMembers: false, editPlans: false,
            markCashPayments: false, applyDiscounts: false, viewRevenue: false, manageStaff: false,
        },
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalPermissions, setOriginalPermissions] = useState<RolePermissions | null>(null)

    useEffect(() => {
        fetchPermissions()
    }, [])

    const fetchPermissions = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/settings')
            if (response.data && response.data.rolesAndPermissions) {
                const fetched = typeof response.data.rolesAndPermissions === 'string' 
                    ? JSON.parse(response.data.rolesAndPermissions)
                    : response.data.rolesAndPermissions
                setRolePermissions(fetched)
                setOriginalPermissions(fetched)
            } else {
                setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)))
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error)
            setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)))
        } finally {
            setLoading(false)
        }
    }

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
            await api.put('/api/settings', { rolesAndPermissions: JSON.stringify(rolePermissions) })
            setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)))
            setHasChanges(false)
            toast.success("Role permissions saved successfully")
        } catch (error) {
            toast.error("Failed to save permissions")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading permissions matrix...</span>
                </div>
            </div>
        )
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
                            Access control matrix for different user roles
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
                            <span className="permissions-matrix__permission-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={16} color="var(--settings-accent-green)" />
                                System Capabilities
                            </span>
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
                                <span className="permissions-matrix__permission-name">
                                    {permission.label}
                                </span>
                                <span className="permissions-matrix__permission-desc">
                                    {permission.description}
                                </span>
                            </div>
                            {roles.map(role => (
                                <div key={role} className="permissions-matrix__cell">
                                    <button
                                        className={`permissions-matrix__toggle ${rolePermissions[role]?.[permission.key] ? 'permissions-matrix__toggle--active' : ''}`}
                                        onClick={() => togglePermission(role, permission.key)}
                                        disabled={role === 'Owner'}
                                    >
                                        {rolePermissions[role]?.[permission.key] ? <Check size={16} /> : <Minus size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="policy-toggle-row" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon">
                            <Info size={16} color="var(--settings-accent-blue)" />
                        </div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Security Enforcement</span>
                            <span className="policy-toggle-row__hint">
                                Permissions for the <strong>Owner</strong> role are hardcoded and cannot be modified.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RolesSection
