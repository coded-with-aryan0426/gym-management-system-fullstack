import React from 'react'

export interface ClassData {
    id: number
    name: string
    trainer: string
    trainerAvatar?: string
    startTime: string
    endTime: string
    date: string
    capacity: number
    enrolled: number
    status: 'Available' | 'Full' | 'Cancelled'
    room?: string
    type?: string
}

interface ClassCardProps {
    classData: ClassData
    onClick?: () => void
    onEdit?: (classData: ClassData) => void
    onCancel?: (classData: ClassData) => void
    onMarkAttendance?: (classData: ClassData) => void
    isPast?: boolean
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick, onEdit, onCancel, onMarkAttendance, isPast = false }) => {
    const { name, trainer, startTime, endTime, capacity, enrolled, status, room } = classData
    const fillPercent = capacity > 0 ? Math.min((enrolled / capacity) * 100, 100) : 0
    const capacityColor = fillPercent >= 100 ? 'var(--color-red)' : fillPercent >= 80 ? 'var(--color-amber)' : 'var(--color-emerald)'

    const getStatusColor = () => {
        switch (status) {
            case 'Available':
                return 'var(--color-emerald)'
            case 'Full':
                return 'var(--color-amber)'
            case 'Cancelled':
                return 'var(--color-red)'
            default:
                return 'var(--text-tertiary)'
        }
    }

    const getStatusBgColor = () => {
        switch (status) {
            case 'Available':
                return 'rgba(16, 185, 129, 0.1)'
            case 'Full':
                return 'rgba(245, 158, 11, 0.1)'
            case 'Cancelled':
                return 'rgba(239, 68, 68, 0.1)'
            default:
                return 'var(--bg-tertiary)'
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEdit?.(classData)
    }

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation()
        onCancel?.(classData)
    }

    return (
        <div
            className={`class-card ${isPast ? 'class-card--past' : ''} ${status === 'Cancelled' ? 'class-card--cancelled' : ''}`}
            onClick={onClick}
            style={{ '--status-color': getStatusColor() } as React.CSSProperties}
        >
            {/* Status Border */}
            <div className="class-card__border" />

            {/* Main Content */}
            <div className="class-card__content">
                {/* Time */}
                <div className="class-card__time">
                    {startTime} - {endTime}
                </div>

                {/* Class Info */}
                <div className="class-card__info">
                    <div className="class-card__name">{name}</div>
                    <div className="class-card__meta">
                        <span className="class-card__trainer">
                            <span className="trainer-avatar">{trainer.charAt(0)}</span>
                            {trainer}
                        </span>
                        {room && <span className="class-card__room">• {room}</span>}
                    </div>
                </div>

                {/* Capacity & Status */}
                <div className="class-card__right">
                    <div className="class-card__capacity">
                        <div className="capacity-bar-wrapper">
                            <div className="capacity-bar-bg">
                                <div
                                    className="capacity-bar-fill"
                                    style={{ width: `${fillPercent}%`, backgroundColor: capacityColor }}
                                />
                            </div>
                            <span className="capacity-text">
                                <span className="capacity-current">{enrolled}</span>
                                <span className="capacity-divider">/</span>
                                <span className="capacity-max">{capacity}</span>
                            </span>
                        </div>
                    </div>
                    <div
                        className="class-card__status"
                        style={{
                            backgroundColor: getStatusBgColor(),
                            color: getStatusColor(),
                        }}
                    >
                        {status}
                    </div>
                </div>

                {/* Actions (visible on hover) */}
                <div className="class-card__actions">
                    {onMarkAttendance && status !== 'Cancelled' && !isPast && (
                        <button
                            className="class-card__action-btn class-card__action-btn--attendance"
                            title="Mark Attendance"
                            onClick={(e) => { e.stopPropagation(); onMarkAttendance(classData); }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </button>
                    )}
                    <button
                        className="class-card__action-btn"
                        title="Edit"
                        onClick={handleEdit}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    {status !== 'Cancelled' && (
                        <button
                            className="class-card__action-btn class-card__action-btn--danger"
                            title="Cancel Class"
                            onClick={handleCancel}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClassCard

