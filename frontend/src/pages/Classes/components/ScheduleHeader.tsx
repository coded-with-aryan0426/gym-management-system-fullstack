import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

export interface InlineStat {
    label: string
    value: string | number
    icon?: React.ReactNode
    color?: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'cyan'
    live?: number
    progress?: number
}

interface ScheduleHeaderProps {
    dateRange: string
    onPrevWeek: () => void
    onNextWeek: () => void
    onDateSelect: (date: Date) => void
    inlineStats?: InlineStat[]
    children?: React.ReactNode
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
    dateRange,
    onPrevWeek,
    onNextWeek,
    onDateSelect,
    inlineStats,
    children
}) => {
    return (
        <div className="schedule-header">
            <div className="header-left-group">
                <h1 className="schedule-header__title">Class Schedule</h1>
                
                {inlineStats && inlineStats.length > 0 && (
                    <div className="inline-stats-strip">
                        {inlineStats.map((stat, index) => (
                            <div 
                                key={index} 
                                className={`inline-stat inline-stat--${stat.color || 'blue'}`}
                            >
                                {stat.icon && <span className="inline-stat__icon">{stat.icon}</span>}
                                <span className="inline-stat__value">{stat.value}</span>
                                <span className="inline-stat__label">{stat.label}</span>
                                {stat.live && (
                                    <span className="inline-stat__live">
                                        <span className="live-pulse"></span>
                                        {stat.live} live
                                    </span>
                                )}
                                {stat.progress !== undefined && (
                                    <div className="inline-stat__progress">
                                        <div 
                                            className="inline-stat__progress-fill" 
                                            style={{ width: `${Math.min(stat.progress, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

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
