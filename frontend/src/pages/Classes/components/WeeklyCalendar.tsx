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
            {/* Header Row (Days) */}
            <div className="calendar-header">
                <div className="time-column-header"></div> {/* Spacer for time column */}
                {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                        <div key={day.toString()} className={`day-column-header ${isToday ? 'today' : ''}`}>
                            <div className="day-name">{format(day, 'EEE')}</div>
                            <div className="day-number">{format(day, 'd')}</div>
                        </div>
                    );
                })}
            </div>

            {/* Grid */}
            <div className="calendar-grid-container">
                {/* Time Labels Column */}
                <div className="time-column">
                    {timeSlots.map(hour => (
                        <div key={hour} className="time-label">
                            <span>{format(new Date().setHours(hour, 0), 'h aa')}</span>
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayClasses = classes.filter(c => c.date === dayStr);

                    return (
                        <div key={day.toString()} className="day-column">
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
                                        className="calendar-event"
                                        onClick={(e) => { e.stopPropagation(); onClassClick(cls); }}
                                        style={{
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            backgroundColor: getEventColor(cls.type),
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
                    );
                })}
            </div>
        </div>
    );
};

// Helper for dynamic colors based on class type
const getEventColor = (type: string) => {
    switch (type) {
        case 'Yoga': return 'rgba(52, 199, 89, 0.15)'; // Green
        case 'HIIT': return 'rgba(255, 59, 48, 0.15)'; // Red
        case 'Cardio': return 'rgba(255, 149, 0, 0.15)'; // Orange
        case 'Strength': return 'rgba(88, 86, 214, 0.15)'; // Purple
        case 'Pilates': return 'rgba(175, 82, 222, 0.15)'; // Pink
        default: return 'rgba(10, 132, 255, 0.15)'; // Blue
    }
};
