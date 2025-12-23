import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface ScheduleHeaderProps {
    totalClasses: number
    capacityPercent: number
    dateRange: string
    onPrevWeek: () => void
    onNextWeek: () => void
    onDateSelect: (date: Date) => void
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
    totalClasses,
    capacityPercent,
    dateRange,
    onPrevWeek,
    onNextWeek,
    onDateSelect
}) => {
    return (
        <div className="schedule-header">
            <div className="schedule-header__left">
                <h1 className="schedule-header__title">Class Schedule</h1>
                <div className="schedule-header__controls">
                    <div className="nav-buttons">
                        <button onClick={onPrevWeek} className="nav-btn" aria-label="Previous week">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={onNextWeek} className="nav-btn" aria-label="Next week">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="date-display">
                        <span className="schedule-header__date">{dateRange}</span>
                        <div className="date-picker-wrapper">
                            <CalendarIcon size={16} className="calendar-icon" />
                            <input
                                type="date"
                                className="date-input"
                                onChange={(e) => {
                                    if (e.target.valueAsDate) {
                                        onDateSelect(e.target.valueAsDate);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
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
