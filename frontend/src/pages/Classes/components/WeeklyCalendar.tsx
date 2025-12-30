import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import type { ClassData } from './index';

interface WeeklyCalendarProps {
    currentDate: Date;
    classes: ClassData[];
    onClassClick: (classData: ClassData) => void;
    onTimeSlotClick: (date: Date, hour: number) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    currentDate,
    classes,
    onClassClick,
    onTimeSlotClick
}) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

    // Get current time line position
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isCurrentWeek = weekDays.some(day => isSameDay(day, now));
    const timeLineTop = (currentHour - 6) * 60 + currentMinute; // pixels from top (1h = 60px)

    return (
        <div className="weekly-calendar">
            <div className="calendar-grid-container">
                <div className="calendar-grid-inner">
                    {/* Time Column (Sticky Header + Labels) */}
                    <div className="time-column">
                        <div className="time-column-header sticky-header">
                            <span className="time-header-label">Time</span>
                        </div>
                        {timeSlots.map(hour => (
                            <div key={hour} className="time-label">
                                <span>{format(new Date().setHours(hour, 0), 'h aa')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns (Sticky Header + Slots) */}
                    {weekDays.map((day) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayClasses = classes.filter(c => c.date === dayStr);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div key={day.toString()} className="day-column">
                                <div className={`day-column-header sticky-header ${isToday ? 'today' : ''}`}>
                                    <div className="day-name">{format(day, 'EEE')}</div>
                                    <div className="day-number">{format(day, 'd')}</div>
                                </div>

                                <div className="day-slots-container">
                                    {/* Grid Lines (1 hour blocks) */}
                                    {timeSlots.map(hour => (
                                        <div
                                            key={hour}
                                            className="grid-cell"
                                            onClick={() => onTimeSlotClick(day, hour)}
                                        />
                                    ))}

                                    {/* Classes Events */}
                                    {dayClasses.map(cls => {
                                        const [startH, startM] = cls.startTime.split(':').map(Number);
                                        const [endH, endM] = cls.endTime.split(':').map(Number);

                                        const startMinutes = (startH * 60) + startM;
                                        const endMinutes = (endH * 60) + endM;
                                        const durationMinutes = endMinutes - startMinutes;

                                        // 6 AM is 0px
                                        const top = (startMinutes - (6 * 60)); // 1 min = 1px height
                                        const height = durationMinutes;

                                        return (
                                            <motion.div
                                                key={cls.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.02, zIndex: 10 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                className={`calendar-event event-type-${cls.type.toLowerCase()}`}
                                                onClick={(e) => { e.stopPropagation(); onClassClick(cls); }}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                }}
                                            >
                                                <div className="event-content">
                                                    <div className="event-time">{cls.startTime} - {cls.endTime}</div>
                                                    <div className="event-title">{cls.name}</div>
                                                    <div className="event-meta">
                                                        <span>{cls.trainer}</span>
                                                        {height > 45 && <span> • {cls.room}</span>}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {/* Current Time Line */}
                                    {isSameDay(day, now) && currentHour >= 6 && currentHour <= 22 && (
                                        <div
                                            className="current-time-line"
                                            style={{ top: `${timeLineTop}px` }}
                                        >
                                            <div className="time-dot" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
