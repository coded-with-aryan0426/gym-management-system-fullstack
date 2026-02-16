import React from 'react'
import ClassCard, { type ClassData } from './ClassCard'

interface DaySectionProps {
    date: Date
    classes: ClassData[]
    isToday?: boolean
    onClassClick?: (classData: ClassData) => void
    onEdit?: (classData: ClassData) => void
    onCancel?: (classData: ClassData) => void
    onMarkAttendance?: (classData: ClassData) => void
}

const DaySection: React.FC<DaySectionProps> = ({
    date,
    classes,
    isToday = false,
    onClassClick,
    onEdit,
    onCancel,
    onMarkAttendance,
}) => {
    const formatDate = (d: Date) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
        return d.toLocaleDateString('en-US', options)
    }

    const isPastClass = (classDate: Date, endTime: string) => {
        const now = new Date()
        const [hours, minutes] = endTime.split(':').map(Number)
        const classEnd = new Date(classDate)
        classEnd.setHours(hours, minutes, 0, 0)
        return classEnd < now
    }

    // Sort classes by start time
    const sortedClasses = [...classes].sort((a, b) => {
        const timeA = a.startTime.replace(':', '')
        const timeB = b.startTime.replace(':', '')
        return parseInt(timeA) - parseInt(timeB)
    })

    return (
        <div className={`day-section ${isToday ? 'day-section--today' : ''}`}>
            {/* Day Header */}
            <div className="day-section__header">
                <span className="day-section__date">
                    {isToday ? 'Today' : formatDate(date)}
                </span>
                <span className="day-section__count">
                    {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                </span>
            </div>

            {/* Class Cards */}
            <div className="day-section__list">
                {sortedClasses.length > 0 ? (
                    sortedClasses.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            classData={cls}
                            isPast={isPastClass(date, cls.endTime)}
                            onClick={() => onClassClick?.(cls)}
                            onEdit={onEdit}
                            onCancel={onCancel}
                            onMarkAttendance={onMarkAttendance}
                        />
                    ))
                ) : (
                    <div className="day-section__empty">
                        <span>No classes scheduled</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DaySection

