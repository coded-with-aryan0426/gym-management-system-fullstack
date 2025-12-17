"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"

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

    const togglePermission = (role: string, permission: string) => {
        if (role === 'Owner') {
            toast.error("Owner permissions cannot be modified")
            return
        }

        setRolePermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permission]: !prev[role][permission]
            }
        }))
        toast.success(`Permission updated for ${role}`)
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div>
                    <h2 className="settings-section__title">Roles & Permissions</h2>
                    <p className="settings-section__description">
                        Define what each role can and cannot do
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                <div className="permissions-matrix">
                    <div className="permissions-matrix__header">
                        <div className="permissions-matrix__cell permissions-matrix__cell--label">Permission</div>
                        {roles.map(role => (
                            <div key={role} className="permissions-matrix__cell permissions-matrix__cell--role">
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
                                    >
                                        {rolePermissions[role][permission.key] ? '✓' : '—'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="policy-note">
                    <div style={{ minWidth: '16px', paddingTop: '2px' }}><Info size={14} /></div>
                    <span>
                        <strong>Note:</strong> Owner permissions are locked. Changes take effect immediately.
                    </span>
                </div>
            </div>
        </div>
    )
}

export default RolesSection
