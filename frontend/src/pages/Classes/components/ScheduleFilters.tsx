import React from 'react'

interface ScheduleFiltersProps {
    selectedDay: 'today' | 'week' | 'custom'
    onDayChange: (day: 'today' | 'week' | 'custom') => void
    classType: string
    onClassTypeChange: (type: string) => void
    trainer: string
    onTrainerChange: (trainer: string) => void
    status: string
    onStatusChange: (status: string) => void
    classTypes: string[]
    trainers: string[]
    onAddClass?: () => void
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
    selectedDay,
    onDayChange,
    classType,
    onClassTypeChange,
    trainer,
    onTrainerChange,
    status,
    onStatusChange,
    classTypes,
    trainers,
    onAddClass,
}) => {
    return (
        <div className="schedule-filters">
            {/* Day Selector */}
            <div className="schedule-filters__tabs">
                <button
                    className={`filter-tab ${selectedDay === 'today' ? 'filter-tab--active' : ''}`}
                    onClick={() => onDayChange('today')}
                >
                    Today
                </button>
                <button
                    className={`filter-tab ${selectedDay === 'week' ? 'filter-tab--active' : ''}`}
                    onClick={() => onDayChange('week')}
                >
                    This Week
                </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="schedule-filters__dropdowns">
                <select
                    className="filter-select"
                    value={classType}
                    onChange={(e) => onClassTypeChange(e.target.value)}
                >
                    <option value="All">All Types</option>
                    {classTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={trainer}
                    onChange={(e) => onTrainerChange(e.target.value)}
                >
                    <option value="All">All Trainers</option>
                    {trainers.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Add Class Button */}
            <button className="schedule-filters__add-btn" onClick={onAddClass}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Class
            </button>
        </div>
    )
}

export default ScheduleFilters
