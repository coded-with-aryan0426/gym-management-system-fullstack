import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface ScheduleHeaderProps {
    dateRange: string
    onPrevWeek: () => void
    onNextWeek: () => void
    onDateSelect: (date: Date) => void
    children?: React.ReactNode
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
    dateRange,
    onPrevWeek,
    onNextWeek,
    onDateSelect,
    children
}) => {
    return (
        <div className="schedule-header">
            <div className="header-left-group">
                <h1 className="schedule-header__title">Class Schedule</h1>
                <div className="divider-vertical"></div>

                <div className="date-controls">
                    <div className="nav-buttons">
                        <button onClick={onPrevWeek} className="nav-btn" aria-label="Previous week">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={onNextWeek} className="nav-btn" aria-label="Next week">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <span className="schedule-header__date">{dateRange}</span>
                    <div className="date-picker-wrapper">
                        <CalendarIcon size={14} className="calendar-icon" />
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

            {children && (
                <div className="header-right-group">
                    {children}
                </div>
            )}
        </div>
    )
}

export default ScheduleHeader
