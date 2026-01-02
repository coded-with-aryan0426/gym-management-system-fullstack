import React, { useState, useRef } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { useClickOutside } from '../../../hooks'

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
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    useClickOutside(popoverRef, () => setIsOpen(false), isOpen)

    const activeCount = [
        classType !== 'All',
        trainer !== 'All',
        status !== 'All'
    ].filter(Boolean).length

    return (
        <div className="schedule-filters">
            <div className="schedule-filters__container">
                <div className="filter-wrapper" ref={popoverRef}>
                    <button
                        className={`filter-toggle-btn ${isOpen ? 'active' : ''} ${activeCount > 0 ? 'has-filters' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Filter size={16} />
                        <span>Filter</span>
                        {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
                        <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="filter-popover">
                            <div className="filter-section">
                                <h4 className="filter-section__title">View</h4>
                                <div className="filter-segment-control">
                                    <button
                                        className={`segment-btn ${selectedDay === 'today' ? 'active' : ''}`}
                                        onClick={() => onDayChange('today')}
                                    >
                                        Today
                                    </button>
                                    <button
                                        className={`segment-btn ${selectedDay === 'week' ? 'active' : ''}`}
                                        onClick={() => onDayChange('week')}
                                    >
                                        This Week
                                    </button>
                                </div>
                            </div>

                            <div className="filter-divider" />

                            <div className="filter-section">
                                <h4 className="filter-section__title">Filters</h4>
                                <div className="filter-group">
                                    <label>Type</label>
                                    <div className="select-wrapper">
                                        <select
                                            value={classType}
                                            onChange={(e) => onClassTypeChange(e.target.value)}
                                        >
                                            <option value="All">All Types</option>
                                            {classTypes.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="select-arrow" />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>Trainer</label>
                                    <div className="select-wrapper">
                                        <select
                                            value={trainer}
                                            onChange={(e) => onTrainerChange(e.target.value)}
                                        >
                                            <option value="All">All Trainers</option>
                                            {trainers.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="select-arrow" />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>Status</label>
                                    <div className="select-wrapper">
                                        <select
                                            value={status}
                                            onChange={(e) => onStatusChange(e.target.value)}
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Available">Available</option>
                                            <option value="Full">Full</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <ChevronDown size={14} className="select-arrow" />
                                    </div>
                                </div>
                            </div>

                            {(activeCount > 0 || selectedDay !== 'today') && (
                                <div className="filter-actions">
                                    <button
                                        className="reset-btn"
                                        onClick={() => {
                                            onDayChange('today')
                                            onClassTypeChange('All')
                                            onTrainerChange('All')
                                            onStatusChange('All')
                                        }}
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <button className="schedule-filters__add-btn" onClick={onAddClass}>
                <span>Add Class</span>
                <div className="btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </div>
            </button>
        </div>
    )
}

export default ScheduleFilters
