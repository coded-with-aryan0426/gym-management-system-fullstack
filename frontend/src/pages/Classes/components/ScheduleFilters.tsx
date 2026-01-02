import React, { useState, useRef } from 'react'
import { Filter, ChevronDown, Clock, Calendar, Users, UserPlus, TrendingUp, Dumbbell, Zap } from 'lucide-react'
import { useClickOutside } from '../../../hooks'

export interface ClassStats {
    todayTotal: number
    todayEnrolled: number
    todayCapacity: number
    todayOccupancy: number
    weekTotal: number
    weekEnrolled: number
    weekCapacity: number
    occupancyRate: number
    upcomingToday: number
    inProgressNow: number
    availableSpots: number
    fullClasses: number
    uniqueTrainers: number
    mostPopularType: string
}

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
    stats?: ClassStats
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
    stats,
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
            {stats && (
                <div className="utility-stats-bar">
                    <div className="utility-stat utility-stat--live">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--emerald">
                            <Clock size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value">{stats.todayTotal}</span>
                            <span className="utility-stat__label">Today</span>
                        </div>
                        {stats.inProgressNow > 0 && (
                            <div className="utility-stat__badge utility-stat__badge--live">
                                <span className="live-dot"></span>
                                {stats.inProgressNow} Live
                            </div>
                        )}
                    </div>

                    <div className="utility-stat-divider" />

                    <div className="utility-stat">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--blue">
                            <Calendar size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value">{stats.weekTotal}</span>
                            <span className="utility-stat__label">This Week</span>
                        </div>
                    </div>

                    <div className="utility-stat-divider" />

                    <div className="utility-stat">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--violet">
                            <Users size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value">{stats.occupancyRate}%</span>
                            <span className="utility-stat__label">Occupancy</span>
                        </div>
                        <div className="utility-stat__progress">
                            <div 
                                className="utility-stat__progress-fill utility-stat__progress-fill--violet" 
                                style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="utility-stat-divider" />

                    <div className="utility-stat">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--amber">
                            <UserPlus size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value">{stats.availableSpots}</span>
                            <span className="utility-stat__label">Spots Open</span>
                        </div>
                    </div>

                    <div className="utility-stat-divider" />

                    <div className="utility-stat">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--rose">
                            <TrendingUp size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value">{stats.fullClasses}</span>
                            <span className="utility-stat__label">Full Classes</span>
                        </div>
                    </div>

                    <div className="utility-stat-divider" />

                    <div className="utility-stat">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--cyan">
                            <Dumbbell size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value">{stats.uniqueTrainers}</span>
                            <span className="utility-stat__label">Trainers</span>
                        </div>
                    </div>

                    <div className="utility-stat-divider" />

                    <div className="utility-stat">
                        <div className="utility-stat__icon-wrap utility-stat__icon-wrap--indigo">
                            <Zap size={14} />
                        </div>
                        <div className="utility-stat__content">
                            <span className="utility-stat__value utility-stat__value--text">{stats.mostPopularType}</span>
                            <span className="utility-stat__label">Top Class</span>
                        </div>
                    </div>
                </div>
            )}

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
