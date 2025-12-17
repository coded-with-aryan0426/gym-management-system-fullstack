import React, { useState } from 'react';
import './RadialAttendance.css';

interface TimeSlot {
    time: string;
    attendance: number; // 0-100
}

interface DayData {
    day: string;
    shortDay: string;
    isWeekend: boolean;
    isToday: boolean;
    slots: TimeSlot[];
}

type ColorPalette = 'blue-orange' | 'purple-green';

interface RadialAttendanceProps {
    title: string;
    subtitle: string;
    colorPalette: ColorPalette;
}

const RadialAttendance: React.FC<RadialAttendanceProps> = ({ title, subtitle, colorPalette }) => {
    const [hoveredSlot, setHoveredSlot] = useState<{ day: string; time: string; attendance: number } | null>(null);

    // Get current day of week (0 = Sunday)
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0 format

    // Mock attendance data (randomized per instance)
    const days: DayData[] = [
        { day: 'Monday', shortDay: 'Mon', isWeekend: false, isToday: dayIndex === 0, slots: [] },
        { day: 'Tuesday', shortDay: 'Tue', isWeekend: false, isToday: dayIndex === 1, slots: [] },
        { day: 'Wednesday', shortDay: 'Wed', isWeekend: false, isToday: dayIndex === 2, slots: [] },
        { day: 'Thursday', shortDay: 'Thu', isWeekend: false, isToday: dayIndex === 3, slots: [] },
        { day: 'Friday', shortDay: 'Fri', isWeekend: false, isToday: dayIndex === 4, slots: [] },
        { day: 'Saturday', shortDay: 'Sat', isWeekend: true, isToday: dayIndex === 5, slots: [] },
        { day: 'Sunday', shortDay: 'Sun', isWeekend: true, isToday: dayIndex === 6, slots: [] },
    ].map(day => ({
        ...day,
        slots: [
            { time: '6-9 AM', attendance: Math.floor(Math.random() * 40) + 10 },
            { time: '9-12 PM', attendance: Math.floor(Math.random() * 30) + 5 },
            { time: '12-3 PM', attendance: Math.floor(Math.random() * 50) + 20 },
            { time: '3-6 PM', attendance: Math.floor(Math.random() * 60) + 30 },
            { time: '6-9 PM', attendance: Math.floor(Math.random() * 40) + 60 },
        ]
    }));

    const numSlots = 5;
    const numDays = 7;

    // SVG dimensions (larger for better visibility)
    const size = 360;
    const center = size / 2;
    const outerRadius = 155;
    const innerRadius = 50;
    const ringWidth = (outerRadius - innerRadius) / numSlots;

    // Calculate path for a segment
    const getSegmentPath = (dayIdx: number, slotIdx: number) => {
        const anglePerDay = (2 * Math.PI) / numDays;
        const startAngle = dayIdx * anglePerDay - Math.PI / 2;
        const endAngle = startAngle + anglePerDay;

        const innerR = innerRadius + slotIdx * ringWidth;
        const outerR = innerR + ringWidth - 2;

        const x1 = center + innerR * Math.cos(startAngle);
        const y1 = center + innerR * Math.sin(startAngle);
        const x2 = center + outerR * Math.cos(startAngle);
        const y2 = center + outerR * Math.sin(startAngle);
        const x3 = center + outerR * Math.cos(endAngle);
        const y3 = center + outerR * Math.sin(endAngle);
        const x4 = center + innerR * Math.cos(endAngle);
        const y4 = center + innerR * Math.sin(endAngle);

        const largeArc = anglePerDay > Math.PI ? 1 : 0;

        return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`;
    };

    // Color palette functions
    const getBlueOrangeColor = (attendance: number) => {
        if (attendance < 30) {
            const lightness = 20 + (attendance / 30) * 15;
            return `hsl(220, 70%, ${lightness}%)`;
        } else if (attendance < 60) {
            const progress = (attendance - 30) / 30;
            const hue = 200 - progress * 30;
            const lightness = 35 + progress * 10;
            return `hsl(${hue}, 65%, ${lightness}%)`;
        } else {
            const progress = (attendance - 60) / 40;
            const hue = 120 - progress * 90;
            const saturation = 70 + progress * 20;
            const lightness = 40 + progress * 10;
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
    };

    const getPurpleGreenColor = (attendance: number) => {
        if (attendance < 30) {
            // Low: Deep purple
            const lightness = 20 + (attendance / 30) * 15;
            return `hsl(280, 60%, ${lightness}%)`;
        } else if (attendance < 60) {
            // Medium: Purple to Violet
            const progress = (attendance - 30) / 30;
            const hue = 280 - progress * 40; // Purple to blue-violet
            const lightness = 35 + progress * 10;
            return `hsl(${hue}, 55%, ${lightness}%)`;
        } else {
            // High: Teal to Emerald Green
            const progress = (attendance - 60) / 40;
            const hue = 180 - progress * 40; // Cyan to green
            const saturation = 60 + progress * 20;
            const lightness = 40 + progress * 15;
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
    };

    const getIntensityColor = (attendance: number) => {
        return colorPalette === 'blue-orange'
            ? getBlueOrangeColor(attendance)
            : getPurpleGreenColor(attendance);
    };

    const getDayLabelPosition = (dayIdx: number) => {
        const anglePerDay = (2 * Math.PI) / numDays;
        const angle = dayIdx * anglePerDay + anglePerDay / 2 - Math.PI / 2;
        const labelRadius = outerRadius + 18;
        return {
            x: center + labelRadius * Math.cos(angle),
            y: center + labelRadius * Math.sin(angle),
        };
    };

    const highlightColor = colorPalette === 'blue-orange' ? 'var(--color-emerald)' : 'var(--color-blue)';

    return (
        <div className="radial-attendance radial-attendance--compact">
            <div className="radial-header">
                <h4 className="radial-title">{title}</h4>
                <span className="radial-subtitle">{subtitle}</span>
            </div>

            <div className="radial-chart-container radial-chart-container--compact">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Segments */}
                    {days.map((day, dayIdx) =>
                        day.slots.map((slot, slotIdx) => (
                            <path
                                key={`${dayIdx}-${slotIdx}`}
                                d={getSegmentPath(dayIdx, slotIdx)}
                                fill={getIntensityColor(slot.attendance)}
                                stroke="var(--bg-primary)"
                                strokeWidth="1"
                                className={`radial-segment ${day.isToday ? 'radial-segment--today' : ''}`}
                                onMouseEnter={() => setHoveredSlot({ day: day.day, time: slot.time, attendance: slot.attendance })}
                                onMouseLeave={() => setHoveredSlot(null)}
                            />
                        ))
                    )}

                    {/* Today highlight ring */}
                    {days.map((day, dayIdx) => {
                        if (!day.isToday) return null;
                        const anglePerDay = (2 * Math.PI) / numDays;
                        const startAngle = dayIdx * anglePerDay - Math.PI / 2;
                        const endAngle = startAngle + anglePerDay;
                        const arcRadius = outerRadius + 3;

                        const x1 = center + arcRadius * Math.cos(startAngle);
                        const y1 = center + arcRadius * Math.sin(startAngle);
                        const x2 = center + arcRadius * Math.cos(endAngle);
                        const y2 = center + arcRadius * Math.sin(endAngle);

                        return (
                            <path
                                key={`today-${dayIdx}`}
                                d={`M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 0 1 ${x2} ${y2}`}
                                fill="none"
                                stroke={highlightColor}
                                strokeWidth="3"
                                className="today-highlight-arc"
                            />
                        );
                    })}

                    {/* Center circle */}
                    <circle cx={center} cy={center} r={innerRadius - 4} fill="var(--bg-secondary)" />
                    <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="center-value-small">
                        {title.split(' ')[0]}
                    </text>

                    {/* Day labels */}
                    {days.map((day, idx) => {
                        const pos = getDayLabelPosition(idx);
                        return (
                            <text
                                key={day.day}
                                x={pos.x}
                                y={pos.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`day-label day-label--small ${day.isToday ? 'day-label--today' : ''} ${day.isWeekend ? 'day-label--weekend' : ''}`}
                            >
                                {day.shortDay}
                            </text>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredSlot && (
                    <div className="radial-tooltip radial-tooltip--compact">
                        <div className="tooltip-day">{hoveredSlot.day}</div>
                        <div className="tooltip-time">{hoveredSlot.time}</div>
                        <div className="tooltip-attendance">
                            <span className="attendance-value">{hoveredSlot.attendance}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RadialAttendance;
