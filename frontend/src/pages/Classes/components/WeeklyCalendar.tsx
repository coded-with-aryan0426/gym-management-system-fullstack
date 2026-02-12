import React, { useRef, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, isBefore, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarX, MapPin, User, Users } from 'lucide-react';
import type { ClassData } from './index';

interface WeeklyCalendarProps {
    currentDate: Date;
    classes: ClassData[];
    onClassClick: (classData: ClassData) => void;
    onTimeSlotClick: (date: Date, hour: number) => void;
}

const CLASS_TYPE_COLORS_LIGHT: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    yoga: { bg: '#d1fae5', border: '#10b981', text: '#065f46', dot: '#10b981' },
    hiit: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
    cardio: { bg: '#ffedd5', border: '#f97316', text: '#9a3412', dot: '#f97316' },
    strength: { bg: '#ede9fe', border: '#a855f7', text: '#5b21b6', dot: '#a855f7' },
    pilates: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', dot: '#ec4899' },
    crossfit: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
    general: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
};

const CLASS_TYPE_COLORS_DARK: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    yoga: { bg: 'rgba(16, 185, 129, 0.25)', border: '#34d399', text: '#6ee7b7', dot: '#34d399' },
    hiit: { bg: 'rgba(239, 68, 68, 0.25)', border: '#f87171', text: '#fca5a5', dot: '#f87171' },
    cardio: { bg: 'rgba(249, 115, 22, 0.25)', border: '#fb923c', text: '#fdba74', dot: '#fb923c' },
    strength: { bg: 'rgba(168, 85, 247, 0.25)', border: '#c084fc', text: '#d8b4fe', dot: '#c084fc' },
    pilates: { bg: 'rgba(236, 72, 153, 0.25)', border: '#f472b6', text: '#f9a8d4', dot: '#f472b6' },
    crossfit: { bg: 'rgba(245, 158, 11, 0.25)', border: '#fbbf24', text: '#fcd34d', dot: '#fbbf24' },
    general: { bg: 'rgba(59, 130, 246, 0.25)', border: '#60a5fa', text: '#93c5fd', dot: '#60a5fa' },
};

const isDarkMode = () => {
    const root = document.documentElement;
    return root.classList.contains('theme-dark') ||
        root.getAttribute('data-theme') === 'dark' ||
        document.body.classList.contains('dark-mode') ||
        (!root.classList.contains('theme-light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
};

const getTypeColor = (type: string) => {
    const colors = isDarkMode() ? CLASS_TYPE_COLORS_DARK : CLASS_TYPE_COLORS_LIGHT;
    return colors[type?.toLowerCase()] || colors.general;
};

const getCapacityGrade = (enrolled: number, capacity: number) => {
    if (capacity === 0) return { label: 'N/A', color: '#94a3b8', className: 'grade-na' };
    const pct = (enrolled / capacity) * 100;
    if (pct >= 100) return { label: 'FULL', color: '#ef4444', className: 'grade-full' };
    if (pct >= 80) return { label: 'Almost Full', color: '#f59e0b', className: 'grade-almost' };
    if (pct >= 50) return { label: 'Filling Up', color: '#3b82f6', className: 'grade-filling' };
    return { label: 'Available', color: '#10b981', className: 'grade-available' };
};

const isClassActive = (cls: ClassData) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    if (cls.date !== today) return false;
    const [startH, startM] = cls.startTime.split(':').map(Number);
    const [endH, endM] = cls.endTime.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= (startH * 60 + startM) && nowMins <= (endH * 60 + endM);
};

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    currentDate,
    classes,
    onClassClick,
    onTimeSlotClick
}) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM
    const gridRef = useRef<HTMLDivElement>(null);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timeLineTop = (currentHour - 6) * 80 + (currentMinute / 60) * 80;

    // Auto-scroll to current time on mount
    useEffect(() => {
        if (gridRef.current && currentHour >= 6) {
            const scrollTarget = Math.max(0, (currentHour - 7) * 80);
            gridRef.current.scrollTop = scrollTarget;
        }
    }, []);

    const getDurationLabel = (startTime: string, endTime: string) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationMins = (endH * 60 + endM) - (startH * 60 + startM);
        if (durationMins >= 60) {
            const h = Math.floor(durationMins / 60);
            const m = durationMins % 60;
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
        }
        return `${durationMins}m`;
    };

    return (
        <div className="weekly-calendar">
            {/* Sticky Day Headers */}
            <div className="cal-header-row">
                <div className="cal-time-gutter-header">
                    <span className="time-gutter-label">TIME</span>
                </div>
                {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayClasses = classes.filter(c => c.date === dayStr);
                    const isToday = isSameDay(day, now);
                    const isPastDay = isBefore(day, startOfDay(now)) && !isToday;
                    return (
                        <div
                            key={dayStr}
                            className={`cal-day-header ${isToday ? 'cal-day-header--today' : ''} ${isPastDay ? 'cal-day-header--past' : ''}`}
                        >
                            <span className="cal-day-name">{format(day, 'EEE')}</span>
                            <span className={`cal-day-num ${isToday ? 'cal-day-num--today' : ''}`}>
                                {format(day, 'd')}
                            </span>
                            {dayClasses.length > 0 && (
                                <span className={`cal-day-count ${isToday ? 'cal-day-count--today' : ''}`}>
                                    {dayClasses.length} class{dayClasses.length > 1 ? 'es' : ''}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Scrollable Grid */}
            <div className="cal-grid-scroll" ref={gridRef}>
                <div className="cal-grid-inner">
                    {/* Time Gutter */}
                    <div className="cal-time-gutter">
                        {timeSlots.map(hour => (
                            <div key={hour} className="cal-time-slot">
                                <span className="cal-time-text">
                                    {format(new Date(2000, 0, 1, hour), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map((day) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayClasses = classes.filter(c => c.date === dayStr);
                        const isToday = isSameDay(day, now);
                        const isPastDay = isBefore(day, startOfDay(now)) && !isToday;

                        return (
                            <div
                                key={dayStr}
                                className={`cal-day-col ${isToday ? 'cal-day-col--today' : ''} ${isPastDay ? 'cal-day-col--past' : ''}`}
                            >
                                {/* Grid cells */}
                                {timeSlots.map(hour => (
                                    <div
                                        key={hour}
                                        className={`cal-cell ${isToday ? 'cal-cell--today' : ''}`}
                                        onClick={() => !isPastDay && onTimeSlotClick(day, hour)}
                                    >
                                        {!isPastDay && (
                                            <div className="cal-cell-hover-indicator">+</div>
                                        )}
                                    </div>
                                ))}

                                {/* Events */}
                                {dayClasses.map(cls => {
                                    const [startH, startM] = cls.startTime.split(':').map(Number);
                                    const [endH, endM] = cls.endTime.split(':').map(Number);
                                    const startMinutes = startH * 60 + startM;
                                    const endMinutes = endH * 60 + endM;
                                    const durationMinutes = endMinutes - startMinutes;

                                    const top = ((startMinutes - 360) / 60) * 80;
                                    const height = Math.max((durationMinutes / 60) * 80, 36);
                                    const typeColor = getTypeColor(cls.type);
                                    const grade = getCapacityGrade(cls.enrolled, cls.capacity);
                                    const active = isClassActive(cls);
                                    const capacityPct = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0;

                                    return (
                                        <motion.div
                                            key={cls.id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02, zIndex: 25 }}
                                            transition={{ duration: 0.2 }}
                                            className={`cal-event ${active ? 'cal-event--active' : ''} ${grade.className}`}
                                            onClick={(e) => { e.stopPropagation(); onClassClick(cls); }}
                                            style={{
                                                top: `${top}px`,
                                                height: `${height}px`,
                                                '--event-bg': typeColor.bg,
                                                '--event-border': typeColor.border,
                                                '--event-text': typeColor.text,
                                                '--event-dot': typeColor.dot,
                                            } as React.CSSProperties}
                                        >
                                            {/* Active pulse ring */}
                                            {active && <div className="cal-event__pulse" />}

                                            {/* Capacity grade badge */}
                                            {grade.className === 'grade-full' && (
                                                <span className="cal-event__badge cal-event__badge--full">FULL</span>
                                            )}
                                            {grade.className === 'grade-almost' && (
                                                <span className="cal-event__badge cal-event__badge--warn">FEW LEFT</span>
                                            )}

                                            <div className="cal-event__content">
                                                {/* Row 1: Time + Duration */}
                                                <div className="cal-event__top-row">
                                                    <span className="cal-event__time">
                                                        {cls.startTime} – {cls.endTime}
                                                    </span>
                                                    {height > 44 && (
                                                        <span className="cal-event__duration">{getDurationLabel(cls.startTime, cls.endTime)}</span>
                                                    )}
                                                </div>

                                                {/* Row 2: Title */}
                                                <span className="cal-event__title">{cls.name || 'Untitled Class'}</span>

                                                {/* Row 3: Trainer + Room (only if enough space) */}
                                                {height > 56 && (
                                                    <div className="cal-event__meta">
                                                        <span className="cal-event__trainer">
                                                            <User size={10} />
                                                            {cls.trainer}
                                                        </span>
                                                        {cls.room && (
                                                            <span className="cal-event__room">
                                                                <MapPin size={10} />
                                                                {cls.room}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Row 4: Capacity bar (only if enough space) */}
                                                {height > 76 && (
                                                    <div className="cal-event__capacity">
                                                        <div className="cal-event__cap-bar">
                                                            <div
                                                                className="cal-event__cap-fill"
                                                                style={{
                                                                    width: `${Math.min(capacityPct, 100)}%`,
                                                                    backgroundColor: grade.color,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="cal-event__cap-text" style={{ color: grade.color }}>
                                                            {cls.enrolled}/{cls.capacity}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Current time line */}
                                {isToday && currentHour >= 6 && currentHour <= 20 && (
                                    <div className="cal-now-line" style={{ top: `${timeLineTop}px` }}>
                                        <div className="cal-now-dot" />
                                        <div className="cal-now-line-bar" />
                                    </div>
                                )}

                                {/* Empty state for days without classes */}
                                {dayClasses.length === 0 && !isPastDay && (
                                    <div className="cal-day-empty">
                                        <CalendarX size={16} />
                                        <span>No classes</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
