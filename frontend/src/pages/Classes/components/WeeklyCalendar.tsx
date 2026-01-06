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
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isCurrentWeek = weekDays.some(day => isSameDay(day, now));
    const timeLineTop = (currentHour - 6) * 60 + currentMinute;

    const getCapacityStatus = (enrolled: number, capacity: number) => {
        const percent = capacity > 0 ? (enrolled / capacity) * 100 : 0;
        if (percent >= 100) return 'full';
        if (percent >= 80) return 'almost-full';
        if (percent >= 50) return 'filling';
        return 'available';
    };

    const getDurationLabel = (startTime: string, endTime: string) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationMins = (endH * 60 + endM) - (startH * 60 + startM);
        return durationMins >= 60 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60 > 0 ? `${durationMins % 60}m` : ''}`.trim() : `${durationMins}m`;
    };

    return (
        <div className="weekly-calendar">
            <div className="calendar-grid-container">
                <div className="calendar-grid-inner">
                    <div className="time-column">
                        <div className="time-column-header">
                            <span className="time-header-label">Time</span>
                        </div>
                        {timeSlots.map(hour => (
                            <div key={hour} className="time-label">
                                <span>{format(new Date().setHours(hour, 0), 'h aa')}</span>
                            </div>
                        ))}
                    </div>

                    {weekDays.map((day) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayClasses = classes.filter(c => c.date === dayStr);
                        const isToday = isSameDay(day, new Date());
                        const isPast = day < new Date() && !isToday;

                        return (
                            <div key={day.toString()} className={`day-column ${isPast ? 'day-column--past' : ''}`}>
                                <div className={`day-column-header ${isToday ? 'today' : ''}`}>
                                    <div className="day-name">{format(day, 'EEE')}</div>
                                    <div className="day-number">{format(day, 'd')}</div>
                                    {dayClasses.length > 0 && (
                                        <div className="day-class-count">{dayClasses.length} classes</div>
                                    )}
                                </div>

                                <div className="day-slots-container">
                                    {timeSlots.map(hour => (
                                        <div
                                            key={hour}
                                            className="grid-cell"
                                            onClick={() => onTimeSlotClick(day, hour)}
                                        />
                                    ))}

                                    {dayClasses.map(cls => {
                                        const [startH, startM] = cls.startTime.split(':').map(Number);
                                        const [endH, endM] = cls.endTime.split(':').map(Number);

                                        const startMinutes = (startH * 60) + startM;
                                        const endMinutes = (endH * 60) + endM;
                                        const durationMinutes = endMinutes - startMinutes;

                                        const top = (startMinutes - (6 * 60));
                                        const height = durationMinutes;
                                        const capacityStatus = getCapacityStatus(cls.enrolled, cls.capacity);
                                        const capacityPercent = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0;

                                        return (
                                            <motion.div
                                                key={cls.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.02, zIndex: 20 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                className={`calendar-event calendar-event--premium event-type-${cls.type.toLowerCase()} capacity-${capacityStatus}`}
                                                onClick={(e) => { e.stopPropagation(); onClassClick(cls); }}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                }}
                                            >
                                                <div className="event-content">
                                                    <div className="event-header">
                                                        <div className="event-time">{cls.startTime}</div>
                                                        <div className="event-duration">{getDurationLabel(cls.startTime, cls.endTime)}</div>
                                                    </div>
                                                    <div className="event-title">{cls.name}</div>
                                                    {height > 50 && (
                                                        <div className="event-details">
                                                            <span className="event-trainer">{cls.trainer}</span>
                                                            <span className="event-room">{cls.room}</span>
                                                        </div>
                                                    )}
                                                    {height > 70 && (
                                                        <div className="event-capacity">
                                                            <div className="capacity-bar">
                                                                <div 
                                                                    className="capacity-bar__fill" 
                                                                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="capacity-text">{cls.enrolled}/{cls.capacity}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {capacityStatus === 'full' && (
                                                    <div className="event-badge event-badge--full">FULL</div>
                                                )}
                                                {capacityStatus === 'almost-full' && (
                                                    <div className="event-badge event-badge--almost">FEW LEFT</div>
                                                )}
                                            </motion.div>
                                        );
                                    })}

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
