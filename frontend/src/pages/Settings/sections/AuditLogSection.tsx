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
            // Mocking audit logs for now as there's no dedicated endpoint yet
            // In a real app: const response = await api.get('/api/audit-logs')
            setTimeout(() => {
                const mockLogs: AuditLogEntry[] = [
                    { id: '1', timestamp: '2024-03-18 10:45:22', userId: 'admin', userName: 'John Doe', action: 'UPDATE', entity: 'Gym Settings', details: 'Updated Billing Rules', ipAddress: '192.168.1.1' },
                    { id: '2', timestamp: '2024-03-18 09:30:15', userId: 'manager', userName: 'Sarah Smith', action: 'CREATE', entity: 'Member', details: 'Added Mike Johnson', ipAddress: '192.168.1.5' },
                    { id: '3', timestamp: '2024-03-17 16:20:00', userId: 'admin', userName: 'John Doe', action: 'DELETE', entity: 'Plan', details: 'Removed Gold Package', ipAddress: '192.168.1.1' },
                    { id: '4', timestamp: '2024-03-17 14:15:33', userId: 'staff', userName: 'Alex Brown', action: 'UPDATE', entity: 'Member', details: 'Renewed membership for Jane Doe', ipAddress: '192.168.1.12' },
                    { id: '5', timestamp: '2024-03-17 08:00:05', userId: 'admin', userName: 'John Doe', action: 'UPDATE', entity: 'Roles', details: 'Modified Manager permissions', ipAddress: '192.168.1.1' },
                ]
                setLogs(mockLogs)
                setLoading(false)
            }, 800)
        } catch (error) {
            console.error('Failed to fetch audit logs:', error)
            setLoading(false)
        }
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
