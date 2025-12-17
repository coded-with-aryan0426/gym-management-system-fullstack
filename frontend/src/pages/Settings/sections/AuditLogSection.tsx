"use client"

import type React from "react"
import { useState } from "react"

interface AuditEntry {
    id: string
    action: string
    target: string
    user: string
    role: string
    timestamp: string
    details: string
}

const AuditLogSection: React.FC = () => {
    const [filter, setFilter] = useState('')

    const [auditLog] = useState<AuditEntry[]>([
        {
            id: '1',
            action: 'Member Created',
            target: 'Rahul Sharma',
            user: 'Admin User',
            role: 'Owner',
            timestamp: '2024-12-17 09:30 AM',
            details: 'Created with Premium 12-month plan'
        },
        {
            id: '2',
            action: 'Payment Recorded',
            target: 'Priya Patel',
            user: 'Front Desk',
            role: 'Staff',
            timestamp: '2024-12-17 10:15 AM',
            details: 'Cash payment ₹5,000'
        },
        {
            id: '3',
            action: 'Plan Changed',
            target: 'Amit Kumar',
            user: 'Admin User',
            role: 'Owner',
            timestamp: '2024-12-17 11:00 AM',
            details: 'Basic → Premium upgrade'
        },
        {
            id: '4',
            action: 'Member Deleted',
            target: 'Vikram Singh',
            user: 'Admin User',
            role: 'Owner',
            timestamp: '2024-12-16 04:30 PM',
            details: 'Requested by member'
        },
        {
            id: '5',
            action: 'Discount Applied',
            target: 'Neha Gupta',
            user: 'Manager',
            role: 'Manager',
            timestamp: '2024-12-16 02:00 PM',
            details: '20% discount on annual plan'
        },
        {
            id: '6',
            action: 'Staff Added',
            target: 'Arjun Trainer',
            user: 'Admin User',
            role: 'Owner',
            timestamp: '2024-12-15 11:30 AM',
            details: 'Added as Trainer'
        },
    ])

    const filteredLog = auditLog.filter(entry =>
        entry.action.toLowerCase().includes(filter.toLowerCase()) ||
        entry.target.toLowerCase().includes(filter.toLowerCase()) ||
        entry.user.toLowerCase().includes(filter.toLowerCase())
    )

    const getActionColor = (action: string): string => {
        if (action.includes('Created') || action.includes('Added')) return 'audit-action--success'
        if (action.includes('Deleted')) return 'audit-action--danger'
        if (action.includes('Changed') || action.includes('Applied')) return 'audit-action--warning'
        return 'audit-action--info'
    }

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <div>
                    <h2 className="settings-section__title">Audit Logs</h2>
                    <p className="settings-section__description">
                        Complete trail of who did what and when
                    </p>
                </div>
            </div>

            <div className="settings-section__content">
                {/* Search */}
                <div className="audit-search">
                    <input
                        type="text"
                        className="audit-search__input"
                        placeholder="Search by action, target, or user..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                {/* Audit Table */}
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
                            {filteredLog.map(entry => (
                                <tr key={entry.id}>
                                    <td>
                                        <span className={`audit-action ${getActionColor(entry.action)}`}>
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
                        <p>No audit entries match your search</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuditLogSection
