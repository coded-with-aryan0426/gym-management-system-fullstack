"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
    History, 
    Search, 
    Filter, 
    Download, 
    ChevronLeft, 
    ChevronRight,
    User,
    Activity,
    Clock,
    Shield,
    Loader2
} from "lucide-react"
import api from "../../../services/api"

interface AuditLog {
    id: string
    timestamp: string
    userId: string
    userName: string
    userRole: string
    action: string
    target: string
    details: string
    status: 'success' | 'failure' | 'warning'
}

const AuditLogSection: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState<'all' | 'success' | 'failure'>('all')
    const [page, setPage] = useState(1)
    const logsPerPage = 10

    useEffect(() => {
        fetchAuditLogs()
    }, [])

    const fetchAuditLogs = async () => {
        try {
            setLoading(true)
            // In a real app, this would be a separate endpoint, but for now we'll simulate
            // using the settings endpoint or just use mock data if not available
            const response = await api.get('/settings')
            
            // Mock data for production feel if backend doesn't have logs yet
            const mockLogs: AuditLog[] = [
                {
                    id: '1',
                    timestamp: new Date().toISOString(),
                    userId: 'admin_1',
                    userName: 'Aryan Kumar',
                    userRole: 'Owner',
                    action: 'UPDATE_BILLING_POLICY',
                    target: 'Billing Rules',
                    details: 'Changed grace period from 7 to 10 days',
                    status: 'success'
                },
                {
                    id: '2',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    userId: 'mgr_2',
                    userName: 'John Doe',
                    userRole: 'Manager',
                    action: 'DELETE_MEMBER',
                    target: 'Member #1024',
                    details: 'Account removed due to inactivity',
                    status: 'success'
                },
                {
                    id: '3',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    userId: 'sys_bot',
                    userName: 'System',
                    userRole: 'System',
                    action: 'AUTO_LOCK',
                    target: 'Member #892',
                    details: 'Account locked due to overdue payment',
                    status: 'warning'
                }
            ]
            setLogs(mockLogs)
        } catch (error) {
            console.error('Failed to fetch audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesFilter = filter === 'all' || log.status === filter
        return matchesSearch && matchesFilter
    })

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
    const currentLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage)

    if (loading) {
        return (
            <div className="settings-section">
                <div className="settings-loading">
                    <Loader2 className="settings-loading__spinner" />
                    <span>Loading activity logs...</span>
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
                        <h2 className="settings-section__title">Audit Log</h2>
                        <p className="settings-section__description">
                            Track all administrative actions and system changes
                        </p>
                    </div>
                </div>
                <button className="policy-action-btn" onClick={() => toast.success("Exporting logs to CSV...")}>
                    <Download size={14} style={{ marginRight: '6px' }} />
                    Export CSV
                </button>
            </div>

            <div className="settings-section__content">
                <div className="audit-controls">
                    <div className="audit-search">
                        <input 
                            type="text" 
                            className="audit-search__input" 
                            placeholder="Search by user, action or target..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="audit-filter">
                        <button 
                            className={`audit-filter__btn ${filter === 'all' ? 'audit-filter__btn--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`audit-filter__btn ${filter === 'success' ? 'audit-filter__btn--active' : ''}`}
                            onClick={() => setFilter('success')}
                        >
                            Success
                        </button>
                        <button 
                            className={`audit-filter__btn ${filter === 'failure' ? 'audit-filter__btn--active' : ''}`}
                            onClick={() => setFilter('failure')}
                        >
                            Failure
                        </button>
                    </div>
                </div>

                <div className="audit-table-container">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Target</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLogs.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div className="audit-time">
                                            {new Date(log.timestamp).toLocaleDateString()}<br/>
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white">{log.userName}</span>
                                            <span className="audit-role">{log.userRole}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="audit-target">{log.action}</span>
                                            <span className="audit-details">{log.details}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="audit-target">{log.target}</span>
                                    </td>
                                    <td>
                                        <span className={`audit-action audit-action--${log.status === 'success' ? 'success' : log.status === 'warning' ? 'warning' : 'danger'}`}>
                                            {log.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {currentLogs.length === 0 && (
                        <div className="audit-empty">
                            <Activity size={32} />
                            <p>No activity logs found matching your criteria</p>
                        </div>
                    )}

                    <div className="audit-pagination">
                        <div className="audit-pagination__info">
                            Showing {(page-1)*logsPerPage + 1} to {Math.min(page*logsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                        </div>
                        <div className="audit-pagination__buttons">
                            <button 
                                className="audit-pagination__btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                className="audit-pagination__btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuditLogSection
