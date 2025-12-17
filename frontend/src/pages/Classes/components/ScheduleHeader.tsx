import React from 'react'

interface ScheduleHeaderProps {
    totalClasses: number
    capacityPercent: number
    dateRange: string
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ totalClasses, capacityPercent, dateRange }) => {
    return (
        <div className="schedule-header">
            <div className="schedule-header__left">
                <h1 className="schedule-header__title">Class Schedule</h1>
                <span className="schedule-header__date">{dateRange}</span>
            </div>
            <div className="schedule-header__right">
                <div className="schedule-header__stat">
                    <span className="stat-value">{totalClasses}</span>
                    <span className="stat-label">Classes</span>
                </div>
                <div className="schedule-header__stat">
                    <span className="stat-value">{capacityPercent}%</span>
                    <span className="stat-label">Capacity</span>
                </div>
            </div>
        </div>
    )
}

export default ScheduleHeader
