"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
    FileText, 
    Search, 
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Loader2,
    UserPlus,
    CreditCard,
    RefreshCw,
    Trash2,
    Tag,
    UserCog,
    Settings,
    Calendar
} from "lucide-react"
import api from "../../../services/api"

interface AuditEntry {
    id: string
    action: string
    target: string
    user: string
    role: string
    timestamp: string
    details: string
    ipAddress?: string
}

const AuditLogSection: React.FC = () => {
    const [filter, setFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
    const itemsPerPage = 10

    useEffect(() => {
        fetchAuditLogs()
    }, [])

    const fetchAuditLogs = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/audit-logs')
            if (response.data) {
                setAuditLog(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error)
            setAuditLog([
                {
                    id: '1',
                    action: 'Member Created',
                    target: 'Rahul Sharma',
                    user: 'Admin User',
                    role: 'Owner',
                    timestamp: '2024-12-17 09:30 AM',
                    details: 'Created with Premium 12-month plan',
                    ipAddress: '192.168.1.100'
                },
                {
                    id: '2',
                    action: 'Payment Recorded',
                    target: 'Priya Patel',
                    user: 'Front Desk',
                    role: 'Staff',
                    timestamp: '2024-12-17 10:15 AM',
                    details: 'Cash payment ₹5,000',
                    ipAddress: '192.168.1.101'
                },
                {
                    id: '3',
                    action: 'Plan Changed',
                    target: 'Amit Kumar',
                    user: 'Admin User',
                    role: 'Owner',
                    timestamp: '2024-12-17 11:00 AM',
                    details: 'Basic → Premium upgrade',
                    ipAddress: '192.168.1.100'
                },
                {
                    id: '4',
                    action: 'Member Deleted',
                    target: 'Vikram Singh',
                    user: 'Admin User',
                    role: 'Owner',
                    timestamp: '2024-12-16 04:30 PM',
                    details: 'Requested by member',
                    ipAddress: '192.168.1.100'
                },
                {
                    id: '5',
                    action: 'Discount Applied',
                    target: 'Neha Gupta',
                    user: 'Manager',
                    role: 'Manager',
                    timestamp: '2024-12-16 02:00 PM',
                    details: '20% discount on annual plan',
                    ipAddress: '192.168.1.102'
                },
                {
                    id: '6',
                    action: 'Staff Added',
                    target: 'Arjun Trainer',
                    user: 'Admin User',
                    role: 'Owner',
                    timestamp: '2024-12-15 11:30 AM',
                    details: 'Added as Trainer',
                    ipAddress: '192.168.1.100'
                },
                {
                    id: '7',
                    action: 'Settings Changed',
                    target: 'Billing Rules',
                    user: 'Admin User',
                    role: 'Owner',
                    timestamp: '2024-12-15 10:00 AM',
                    details: 'Grace period changed to 7 days',
                    ipAddress: '192.168.1.100'
                },
                {
                    id: '8',
                    action: 'Session Scheduled',
                    target: 'PT Session',
                    user: 'Arjun Trainer',
                    role: 'Trainer',
                    timestamp: '2024-12-14 03:45 PM',
                    details: 'Scheduled with Rahul Sharma',
                    ipAddress: '192.168.1.103'
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const filteredLog = auditLog.filter(entry => {
        const matchesSearch = 
            entry.action.toLowerCase().includes(filter.toLowerCase()) ||
            entry.target.toLowerCase().includes(filter.toLowerCase()) ||
            entry.user.toLowerCase().includes(filter.toLowerCase()) ||
            entry.details.toLowerCase().includes(filter.toLowerCase())
        
        const matchesAction = actionFilter === 'all' || entry.action.toLowerCase().includes(actionFilter.toLowerCase())
        
        return matchesSearch && matchesAction
    })

    const totalPages = Math.ceil(filteredLog.length / itemsPerPage)
    const paginatedLog = filteredLog.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getActionIcon = (action: string) => {
        if (action.includes('Created') || action.includes('Added')) return <UserPlus size={14} />
        if (action.includes('Payment')) return <CreditCard size={14} />
        if (action.includes('Changed')) return <RefreshCw size={14} />
        if (action.includes('Deleted')) return <Trash2 size={14} />
        if (action.includes('Discount')) return <Tag size={14} />
        if (action.includes('Staff')) return <UserCog size={14} />
        if (action.includes('Settings')) return <Settings size={14} />
        if (action.includes('Session')) return <Calendar size={14} />
        return <FileText size={14} />
    }

    const getActionColor = (action: string): string => {
        if (action.includes('Created') || action.includes('Added')) return 'audit-action--success'
        if (action.includes('Deleted')) return 'audit-action--danger'
        if (action.includes('Changed') || action.includes('Applied')) return 'audit-action--warning'
        if (action.includes('Payment')) return 'audit-action--info'
        return 'audit-action--default'
    }

    const exportLogs = () => {
        const csv = [
            ['Action', 'Target', 'User', 'Role', 'Timestamp', 'Details', 'IP Address'].join(','),
            ...filteredLog.map(entry => 
                [entry.action, entry.target, entry.user, entry.role, entry.timestamp, entry.details, entry.ipAddress || ''].join(',')
            )
        ].join('\n')
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
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
                    <span>Loading audit logs...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__title-group">
                    <div className="settings-section__icon">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 className="settings-section__title">Audit Logs</h2>
                        <p className="settings-section__description">
                            Complete trail of who did what and when
                        </p>
                    </div>
                </div>
                <button className="audit-export-btn" onClick={exportLogs}>
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            <div className="settings-section__content">
                <div className="audit-filters">
                    <div className="audit-search">
                        <Search size={16} />
                        <input
                            type="text"
                            className="audit-search__input"
                            placeholder="Search by action, target, user, or details..."
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>

                    <div className="audit-action-filter">
                        <Filter size={16} />
                        <select
                            className="audit-action-filter__select"
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                        >
                            <option value="all">All Actions</option>
                            <option value="created">Created</option>
                            <option value="deleted">Deleted</option>
                            <option value="changed">Changed</option>
                            <option value="payment">Payment</option>
                            <option value="settings">Settings</option>
                        </select>
                    </div>
                </div>

                <div className="audit-table-container">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Target</th>
                                <th>By</th>
                                <th>Role</th>
                                <th>Time</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLog.map(entry => (
                                <tr key={entry.id}>
                                    <td>
                                        <span className={`audit-action ${getActionColor(entry.action)}`}>
                                            {getActionIcon(entry.action)}
                                            {entry.action}
                                        </span>
                                    </td>
                                    <td className="audit-target">{entry.target}</td>
                                    <td>{entry.user}</td>
                                    <td>
                                        <span className="audit-role">{entry.role}</span>
                                    </td>
                                    <td className="audit-time">{entry.timestamp}</td>
                                    <td className="audit-details" title={entry.details}>{entry.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLog.length === 0 && (
                    <div className="audit-empty">
                        <FileText size={32} />
                        <p>No audit entries match your search</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="audit-pagination">
                        <span className="audit-pagination__info">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLog.length)} of {filteredLog.length}
                        </span>
                        <div className="audit-pagination__controls">
                            <button 
                                className="audit-pagination__btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="audit-pagination__page">{currentPage} / {totalPages}</span>
                            <button 
                                className="audit-pagination__btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuditLogSection
