"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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
    X,
    RefreshCw,
    ChevronDown,
    ChevronRight
} from "lucide-react"
import api from "../../../services/api"

interface PermissionDef {
    key: string
    label: string
    description: string
    category: string
}

interface PermissionMatrix {
    [role: string]: {
        [permission: string]: boolean
    }
}

interface PermissionChange {
    role: string
    permission: string
    permissionLabel: string
    action: 'GRANTED' | 'REVOKED'
}

interface PermissionsResponse {
    roles: string[]
    permissions: PermissionDef[]
    matrix: PermissionMatrix
}

const RolesSection: React.FC = () => {
    const [roles, setRoles] = useState<string[]>([])
    const [permissions, setPermissions] = useState<PermissionDef[]>([])
    const [matrix, setMatrix] = useState<PermissionMatrix>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalMatrix, setOriginalMatrix] = useState<PermissionMatrix>({})
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingChanges, setPendingChanges] = useState<PermissionChange[]>([])
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
    const [initializing, setInitializing] = useState(false)

    useEffect(() => {
        fetchPermissions()
    }, [])

    const fetchPermissions = async () => {
        try {
            setLoading(true)
            const response = await api.get<PermissionsResponse>('/settings/permissions')
            if (response.data) {
                setRoles(response.data.roles || [])
                setPermissions(response.data.permissions || [])
                setMatrix(response.data.matrix || {})
                setOriginalMatrix(JSON.parse(JSON.stringify(response.data.matrix || {})))
                
                // Expand all categories by default
                const categories = new Set(response.data.permissions?.map(p => p.category) || [])
                setExpandedCategories(categories)
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error)
            toast.error("Failed to load permissions")
        } finally {
            setLoading(false)
        }
    }

    const initializePermissions = async () => {
        try {
            setInitializing(true)
            await api.post('/settings/permissions/initialize')
            toast.success("Default permissions initialized")
            await fetchPermissions()
        } catch (error) {
            console.error('Failed to initialize permissions:', error)
            toast.error("Failed to initialize permissions")
        } finally {
            setInitializing(false)
        }
    }

    const togglePermission = (role: string, permission: string) => {
        if (role === 'OWNER') {
            toast.error("Owner permissions cannot be modified")
            return
        }

        setMatrix(prev => {
            const updated = {
                ...prev,
                [role]: {
                    ...prev[role],
                    [permission]: !prev[role]?.[permission]
                }
            }
            setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalMatrix))
            return updated
        })
    }

    const calculateChanges = (): PermissionChange[] => {
        const changes: PermissionChange[] = []
        
        for (const role of roles) {
            if (role === 'OWNER') continue
            
            for (const perm of permissions) {
                const current = matrix[role]?.[perm.key] || false
                const original = originalMatrix[role]?.[perm.key] || false
                
                if (current !== original) {
                    changes.push({
                        role,
                        permission: perm.key,
                        permissionLabel: perm.label,
                        action: current ? 'GRANTED' : 'REVOKED'
                    })
                }
            }
        }
        
        return changes
    }

    const handleSaveClick = () => {
        const changes = calculateChanges()
        if (changes.length === 0) {
            toast("No changes to save")
            return
        }
        setPendingChanges(changes)
        setShowConfirmModal(true)
    }

    const handleConfirmSave = async () => {
        try {
            setSaving(true)
            const response = await api.put('/settings/permissions', matrix)
            
            if (response.data?.success) {
                setOriginalMatrix(JSON.parse(JSON.stringify(matrix)))
                setHasChanges(false)
                setShowConfirmModal(false)
                
                const changeCount = response.data.changeCount || pendingChanges.length
                toast.success(`${changeCount} permission${changeCount !== 1 ? 's' : ''} updated successfully`)
            } else {
                toast.error(response.data?.error || "Failed to save permissions")
            }
        } catch (error) {
            console.error('Failed to save permissions:', error)
            toast.error("Failed to save permissions")
        } finally {
            setSaving(false)
        }
    }

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            if (next.has(category)) {
                next.delete(category)
            } else {
                next.add(category)
            }
            return next
        })
    }

    // Group permissions by category
    const groupedPermissions = useMemo(() => {
        const groups: { [category: string]: PermissionDef[] } = {}
        for (const perm of permissions) {
            if (!groups[perm.category]) {
                groups[perm.category] = []
            }
            groups[perm.category].push(perm)
        }
        return groups
    }, [permissions])

    const categories = useMemo(() => Object.keys(groupedPermissions), [groupedPermissions])

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

    // Check if permissions are empty (need initialization)
    const needsInitialization = permissions.length === 0 || 
        Object.values(matrix).every(rolePerms => 
            Object.values(rolePerms).every(v => !v)
        )

    return (
        <div className="settings-section" style={{ "--section-accent": "#f59e0b" } as React.CSSProperties}>
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Roles & Permissions</h2>
                        <p className="settings-section__description">
                            Access control matrix for different user roles
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {needsInitialization && (
                        <button 
                            className="settings-save-btn"
                            onClick={initializePermissions}
                            disabled={initializing}
                            style={{ background: 'var(--settings-accent-blue)' }}
                        >
                            {initializing ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                            {initializing ? 'Initializing...' : 'Initialize Defaults'}
                        </button>
                    )}
                    {hasChanges && (
                        <button 
                            className="settings-save-btn"
                            onClick={handleSaveClick}
                            disabled={saving}
                        >
                            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>

            <div className="settings-section__content">
                {/* Role Headers */}
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
                                {role === 'OWNER' && <Lock size={10} style={{ marginRight: '4px' }} />}
                                {role}
                            </div>
                        ))}
                    </div>

                    {/* Grouped Permissions */}
                    {categories.map(category => (
                        <div key={category} className="permissions-category">
                            <div 
                                className="permissions-category__header"
                                onClick={() => toggleCategory(category)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: 'rgba(59, 130, 246, 0.05)',
                                    borderBottom: '1px solid var(--settings-border)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    color: 'var(--settings-text-primary)'
                                }}
                            >
                                {expandedCategories.has(category) ? 
                                    <ChevronDown size={14} /> : 
                                    <ChevronRight size={14} />
                                }
                                {category}
                                <span style={{ 
                                    fontSize: '11px', 
                                    color: 'var(--settings-text-muted)',
                                    fontWeight: 400 
                                }}>
                                    ({groupedPermissions[category].length} permissions)
                                </span>
                            </div>

                            {expandedCategories.has(category) && groupedPermissions[category].map(permission => (
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
                                                className={`permissions-matrix__toggle ${matrix[role]?.[permission.key] ? 'permissions-matrix__toggle--active' : ''}`}
                                                onClick={() => togglePermission(role, permission.key)}
                                                disabled={role === 'OWNER'}
                                            >
                                                {matrix[role]?.[permission.key] ? <Check size={16} /> : <Minus size={14} />}
                                            </button>
                                        </div>
                                    ))}
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
                                Changes take effect immediately for all users with the affected roles.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'var(--settings-card-bg)',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: 'var(--settings-text-primary)', fontSize: '18px' }}>
                                Confirm Permission Changes
                            </h3>
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    color: 'var(--settings-text-muted)'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: 'var(--settings-text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                            The following {pendingChanges.length} permission{pendingChanges.length !== 1 ? 's' : ''} will be updated:
                        </p>

                        <div style={{ 
                            maxHeight: '300px', 
                            overflow: 'auto',
                            border: '1px solid var(--settings-border)',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            {pendingChanges.map((change, idx) => (
                                <div 
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        borderBottom: idx < pendingChanges.length - 1 ? '1px solid var(--settings-border)' : 'none',
                                        background: change.action === 'GRANTED' 
                                            ? 'rgba(34, 197, 94, 0.05)' 
                                            : 'rgba(239, 68, 68, 0.05)'
                                    }}
                                >
                                    <div>
                                        <div style={{ 
                                            fontWeight: 600, 
                                            color: 'var(--settings-text-primary)',
                                            fontSize: '13px',
                                            marginBottom: '2px'
                                        }}>
                                            {change.permissionLabel}
                                        </div>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: 'var(--settings-text-muted)' 
                                        }}>
                                            Role: {change.role}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        background: change.action === 'GRANTED' 
                                            ? 'rgba(34, 197, 94, 0.15)' 
                                            : 'rgba(239, 68, 68, 0.15)',
                                        color: change.action === 'GRANTED' 
                                            ? 'var(--settings-accent-green)' 
                                            : 'var(--settings-accent-red)'
                                    }}>
                                        {change.action}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{ 
                            background: 'rgba(245, 158, 11, 0.1)', 
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '13px', 
                                color: 'var(--settings-text-primary)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <Info size={16} color="rgb(245, 158, 11)" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <span>
                                    These changes will affect all users with the modified roles. 
                                    They will take effect immediately upon saving.
                                </span>
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--settings-border)',
                                    background: 'transparent',
                                    color: 'var(--settings-text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--settings-accent-green)',
                                    color: 'white',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                                {saving ? 'Saving...' : 'Confirm & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RolesSection
