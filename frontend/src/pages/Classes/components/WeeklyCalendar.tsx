import React, { useRef, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, isBefore, startOfDay } from 'date-fns';
import { CalendarX, MapPin, User } from 'lucide-react';
import type { ClassData } from './index';

interface WeeklyCalendarProps {
    currentDate: Date;
    classes: ClassData[];
    onClassClick: (classData: ClassData) => void;
    onTimeSlotClick: (date: Date, hour: number) => void;
}

const TYPE_COLORS_DARK: Record<string, { bg: string; border: string; text: string }> = {
    yoga:     { bg: 'rgba(16,185,129,0.22)',  border: '#34d399', text: '#6ee7b7' },
    hiit:     { bg: 'rgba(239,68,68,0.22)',   border: '#f87171', text: '#fca5a5' },
    cardio:   { bg: 'rgba(249,115,22,0.22)',  border: '#fb923c', text: '#fdba74' },
    strength: { bg: 'rgba(168,85,247,0.22)',  border: '#c084fc', text: '#d8b4fe' },
    pilates:  { bg: 'rgba(236,72,153,0.22)',  border: '#f472b6', text: '#f9a8d4' },
    crossfit: { bg: 'rgba(245,158,11,0.22)',  border: '#fbbf24', text: '#fcd34d' },
    general:  { bg: 'rgba(59,130,246,0.22)',  border: '#60a5fa', text: '#93c5fd' },
};

const TYPE_COLORS_LIGHT: Record<string, { bg: string; border: string; text: string }> = {
    yoga:     { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    hiit:     { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    cardio:   { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
    strength: { bg: '#ede9fe', border: '#a855f7', text: '#5b21b6' },
    pilates:  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
    crossfit: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    general:  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
};

const isDark = () =>
    document.documentElement.classList.contains('theme-dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    document.body.classList.contains('dark-mode');

const getColor = (type: string) => {
    const map = isDark() ? TYPE_COLORS_DARK : TYPE_COLORS_LIGHT;
    return map[type?.toLowerCase()] || map.general;
};

const capColor = (enrolled: number, capacity: number) => {
    if (capacity === 0) return '#94a3b8';
    const p = (enrolled / capacity) * 100;
    if (p >= 100) return '#ef4444';
    if (p >= 80)  return '#f59e0b';
    return '#10b981';
};

const isActive = (cls: ClassData) => {
    const now = new Date();
    if (cls.date !== format(now, 'yyyy-MM-dd')) return false;
    const [sh, sm] = cls.startTime.split(':').map(Number);
    const [eh, em] = cls.endTime.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= sh * 60 + sm && mins <= eh * 60 + em;
};

const fmtTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hh = h % 12 || 12;
    return m > 0 ? `${hh}:${String(m).padStart(2,'0')}${ampm}` : `${hh}${ampm}`;
};

const ROW_H = 56;
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6am–8pm

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ currentDate, classes, onClassClick, onTimeSlotClick }) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const gridRef   = useRef<HTMLDivElement>(null);
    const now       = new Date();
    const nowMins   = now.getHours() * 60 + now.getMinutes();
    const nowTop    = (now.getHours() - 6) * ROW_H + (now.getMinutes() / 60) * ROW_H;

    useEffect(() => {
        if (gridRef.current && now.getHours() >= 6) {
            gridRef.current.scrollTop = Math.max(0, (now.getHours() - 8) * ROW_H);
        }
    }, []);

    return (
        <div className="wcal">
            {/* ── Day header row ── */}
            <div className="wcal__head">
                <div className="wcal__gutter-head" />
                {weekDays.map(day => {
                    const str = format(day, 'yyyy-MM-dd');
                    const count = classes.filter(c => c.date === str).length;
                    const today = isSameDay(day, now);
                    const past  = isBefore(day, startOfDay(now)) && !today;
                    return (
                        <div key={str} className={`wcal__day-head ${today ? 'is-today' : ''} ${past ? 'is-past' : ''}`}>
                            <span className="wcal__day-name">{format(day, 'EEE')}</span>
                            <span className={`wcal__day-num ${today ? 'today-pill' : ''}`}>{format(day, 'd')}</span>
                            {count > 0 && <span className={`wcal__day-count ${today ? 'today-count' : ''}`}>{count}</span>}
                        </div>
                    );
                })}
            </div>

            {/* ── Scrollable grid ── */}
            <div className="wcal__scroll" ref={gridRef}>
                <div className="wcal__inner">
                    {/* Time gutter */}
                    <div className="wcal__gutter">
                        {HOURS.map(h => (
                            <div key={h} className="wcal__gutter-slot">
                                <span className="wcal__time-label">{format(new Date(2000,0,1,h), 'h a')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map(day => {
                        const dayStr   = format(day, 'yyyy-MM-dd');
                        const dayCls   = classes.filter(c => c.date === dayStr);
                        const today    = isSameDay(day, now);
                        const pastDay  = isBefore(day, startOfDay(now)) && !today;

                        return (
                            <div key={dayStr} className={`wcal__col ${today ? 'is-today' : ''} ${pastDay ? 'is-past' : ''}`}>
                                {/* Click cells */}
                                {HOURS.map(h => (
                                    <div
                                        key={h}
                                        className="wcal__cell"
                                        onClick={() => !pastDay && onTimeSlotClick(day, h)}
                                    />
                                ))}

                                {/* Events */}
                                {dayCls.map(cls => {
                                    const [sh, sm] = cls.startTime.split(':').map(Number);
                                    const [eh, em] = cls.endTime.split(':').map(Number);
                                    const durMins  = (eh * 60 + em) - (sh * 60 + sm);
                                    const top    = ((sh * 60 + sm - 360) / 60) * ROW_H;
                                    const height = Math.max((durMins / 60) * ROW_H, 26);
                                    const color  = getColor(cls.type);
                                    const active = isActive(cls);
                                    const pct    = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0;
                                    const isFull = pct >= 100;

                                    return (
                                        <div
                                            key={cls.id}
                                            className={`wcal__event ${active ? 'wcal__event--live' : ''}`}
                                            onClick={e => { e.stopPropagation(); onClassClick(cls); }}
                                            style={{
                                                top: `${top}px`,
                                                height: `${height}px`,
                                                background: color.bg,
                                                borderLeftColor: color.border,
                                                color: color.text,
                                            }}
                                        >
                                            {/* Always visible: time + name */}
                                            <div className="wcal__ev-time">{fmtTime(cls.startTime)}</div>
                                            <div className="wcal__ev-name">{cls.name || 'Class'}</div>

                                            {/* Trainer + room — only if ≥ 64px */}
                                            {height >= 64 && (
                                                <div className="wcal__ev-meta">
                                                    <User size={9} />
                                                    <span>{cls.trainer.split(' ')[0]}</span>
                                                    {cls.room && <><MapPin size={9} /><span>{cls.room}</span></>}
                                                </div>
                                            )}

                                            {/* Capacity pill — only if ≥ 84px */}
                                            {height >= 84 && (
                                                <div className="wcal__ev-cap" style={{ color: capColor(cls.enrolled, cls.capacity) }}>
                                                    {cls.enrolled}/{cls.capacity}
                                                </div>
                                            )}

                                            {/* FULL badge */}
                                            {isFull && <span className="wcal__ev-full">FULL</span>}
                                            {active && <span className="wcal__ev-live-dot" />}
                                        </div>
                                    );
                                })}

                                {/* Now line */}
                                {today && now.getHours() >= 6 && now.getHours() <= 20 && (
                                    <div className="wcal__now-line" style={{ top: `${nowTop}px` }}>
                                        <div className="wcal__now-dot" />
                                        <div className="wcal__now-bar" />
                                    </div>
                                )}

                                {/* Empty */}
                                {dayCls.length === 0 && !pastDay && (
                                    <div className="wcal__empty">
                                        <CalendarX size={14} />
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
