"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
    History, 
    Search, 
    Download, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Loader2,
    Calendar,
    User,
    Activity,
    Info
} from "lucide-react"
import api from "../../../services/api"

interface AuditLogEntry {
    id: string
    timestamp: string
    userId: string
    userName: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
    entity: string
    details: string
    ipAddress: string
}

interface BackendAuditLog {
    id: number
    action: string
    target: string
    userName: string
    userRole: string
    details: string
    ipAddress: string
    timestamp: string
    userId: number | null
}

const AuditLogSection: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL')
    const [page, setPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        fetchAuditLogs()
    }, [])

    const fetchAuditLogs = async () => {
        try {
            setLoading(true)
            
            // Try to fetch from backend API first
            try {
                const response = await api.get('/audit-logs')
                if (response.data && response.data.length > 0) {
                    const mappedLogs: AuditLogEntry[] = response.data.map((log: BackendAuditLog) => ({
                        id: String(log.id),
                        timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
                        userId: log.userId ? String(log.userId) : 'unknown',
                        userName: log.userName || 'Unknown User',
                        action: mapAction(log.action),
                        entity: log.target || 'System',
                        details: log.details || log.action || '',
                        ipAddress: log.ipAddress || '-',
                    }))
                    setLogs(mappedLogs)
                    return
                }
            } catch (apiError) {
                console.log('Backend audit logs not available, falling back to localStorage')
            }
            
            // Fallback to localStorage
            const storedLogs = JSON.parse(localStorage.getItem("auditLog") || "[]")
            
            if (storedLogs.length > 0) {
                const mappedLogs: AuditLogEntry[] = storedLogs.map((log: any, index: number) => ({
                    id: log.id || String(index),
                    timestamp: log.timestamp || new Date().toLocaleString(),
                    userId: log.user || 'unknown',
                    userName: log.user || 'Unknown User',
                    action: mapAction(log.action),
                    entity: log.target || 'System',
                    details: log.details || log.action || '',
                    ipAddress: log.ipAddress || '-',
                }))
                setLogs(mappedLogs)
                
                // Sync localStorage logs to backend (optional - background sync)
                syncLogsToBackend(storedLogs)
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error)
        } finally {
            setLoading(false)
        }
    }
    
    const syncLogsToBackend = async (localLogs: any[]) => {
        try {
            const logsToSync = localLogs.map((log: any) => ({
                action: log.action || 'UPDATE',
                target: log.target || 'System',
                userName: log.user || 'Unknown',
                userRole: log.role || 'OWNER',
                details: log.details || log.action || '',
                ipAddress: log.ipAddress || null,
                timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString()
            }))
            
            await api.post('/audit-logs/batch', logsToSync)
            // Clear localStorage after successful sync
            localStorage.removeItem("auditLog")
        } catch (error) {
            // Silently fail - logs remain in localStorage for next sync attempt
            console.log('Background sync to backend failed, logs kept in localStorage')
        }
    }

    const mapAction = (action: string): 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' => {
        const lower = (action || '').toLowerCase()
        if (lower.includes('creat') || lower.includes('add')) return 'CREATE'
        if (lower.includes('delet') || lower.includes('remov') || lower.includes('terminat')) return 'DELETE'
        if (lower.includes('login') || lower.includes('logged in')) return 'LOGIN'
        if (lower.includes('logout') || lower.includes('logged out') || lower.includes('sign out')) return 'LOGOUT'
        return 'UPDATE'
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.userName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filter === 'ALL' || log.action === filter
        return matchesSearch && matchesFilter
    })

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    const getActionBadgeClass = (action: string) => {
        switch (action) {
            case 'CREATE': return 'audit-badge--create'
            case 'UPDATE': return 'audit-badge--update'
            case 'DELETE': return 'audit-badge--delete'
            default: return ''
        }
    }

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address']
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                log.timestamp,
                log.userName,
                log.action,
                log.entity,
                `"${log.details}"`,
                log.ipAddress
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Analyzing system logs...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <History size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">System Audit Log</h2>
                        <p className="settings-section__description">
                            Track all administrative actions and security events
                        </p>
                    </div>
                </div>
                <button 
                    className="settings-save-btn" 
                    style={{ background: 'transparent', border: '1px solid var(--settings-border)', color: 'var(--settings-text-secondary)' }}
                    onClick={exportToCSV}
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            <div className="settings-section__content">
                <div className="audit-controls" style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                    <div className="field-wrapper" style={{ flex: 1 }}>
                        <div className="reminder-input-row">
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--settings-text-tertiary)' }} />
                                <input
                                    type="text"
                                    className="dense-input"
                                    placeholder="Search logs by user or activity..."
                                    style={{ paddingLeft: '40px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="dense-input" 
                                style={{ width: '160px' }}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <option value="ALL">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--settings-border)' }}>
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length > 0 ? paginatedLogs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} color="var(--settings-text-tertiary)" />
                                            {log.timestamp}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={14} color="var(--settings-accent-blue)" />
                                            {log.userName}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`audit-badge ${getActionBadgeClass(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={14} color="var(--settings-text-tertiary)" />
                                            {log.entity}
                                        </div>
                                    </td>
                                    <td>{log.details}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--settings-text-tertiary)' }}>
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="audit-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--settings-text-tertiary)' }}>
                        Showing {paginatedLogs.length} of {filteredLogs.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="reminder-add-btn" 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            className="reminder-add-btn"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="policy-toggle-row" style={{ background: 'rgba(255, 255, 255, 0.03)', borderStyle: 'dashed' }}>
                    <div className="policy-toggle-row__info">
                        <div className="policy-toggle-row__icon">
                            <Info size={16} />
                        </div>
                        <div className="policy-toggle-row__text">
                            <span className="policy-toggle-row__label">Data Retention</span>
                            <span className="policy-toggle-row__hint">
                                Audit logs are kept for 90 days. Contact system administrator for older records.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuditLogSection
