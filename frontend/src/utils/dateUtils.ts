import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parse } from 'date-fns';

export const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return { start, end };
};

export const getWeekDates = (date: Date) => {
    const { start, end } = getWeekRange(date);
    return eachDayOfInterval({ start, end });
};

export const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'h:mm a');
};

export const formatTime24 = (date: Date | string) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm');
};

export const parseSessionDate = (dateStr: string, timeStr: string) => {
    return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
};

export const calculateEndTime = (startTime: Date, durationMinutes: number) => {
    return new Date(startTime.getTime() + durationMinutes * 60000);
};

export const isToday = (date: Date) => {
    return isSameDay(date, new Date());
};

export const formatMonthYear = (date: Date) => {
    return format(date, 'MMMM yyyy');
};

export const getWeekdayIndex = (date: Date) => {
    let day = date.getDay(); // 0 is Sunday
    return day === 0 ? 6 : day - 1; // Map to 0 (Mon) - 6 (Sun)
};

export const formatShortDate = (date: Date) => {
    return format(date, 'MMM d');
};

export const generateDateSequence = (period: string): string[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'week') {
        const start = addDays(today, -6);
        return eachDayOfInterval({ start, end: today }).map(d => d.toISOString().split('T')[0]);
    }

    // month/custom: last 30 days — complete calendar days, no gaps
    const start = addDays(today, -29);
    return eachDayOfInterval({ start, end: today }).map(d => d.toISOString().split('T')[0]);
};

export const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getDaysInMonth = (year: number, month: number): number => {
    const NORMAL_MONTHS: Record<number, number> = {
        0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30,
        6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11: 31
    };
    if (month === 1 && isLeapYear(year)) return 29;
    return NORMAL_MONTHS[month] ?? 30;
};

export interface CalendarDay {
    date: Date;
    dateStr: string;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    monthLabel: string;
}

export const generateCalendarSequence = (
    year: number,
    month: number,
    startDay: number = 10,
    endDay: number = 8
): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const daysInCurrentMonth = getDaysInMonth(year, month);
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let d = startDay; d <= daysInCurrentMonth; d++) {
        const date = new Date(year, month, d);
        days.push({
            date,
            dateStr: date.toISOString().split('T')[0],
            dayOfMonth: d,
            isCurrentMonth: true,
            monthLabel: format(date, 'MMM d')
        });
    }

    for (let d = 1; d <= endDay; d++) {
        const date = new Date(nextYear, nextMonth, d);
        days.push({
            date,
            dateStr: date.toISOString().split('T')[0],
            dayOfMonth: d,
            isCurrentMonth: false,
            monthLabel: format(date, 'MMM d')
        });
    }

    return days;
};

export interface DataPoint {
    date: string;
    value?: number;
    revenue?: number;
    expenses?: number;
    [key: string]: unknown;
}

export const alignDataToCalendar = (
    data: DataPoint[],
    calendarDays: CalendarDay[]
): (CalendarDay & { data: Partial<Record<string, number>> })[] => {
    const dataMap = new Map<string, Partial<Record<string, number>>>();
    data.forEach(item => {
        const raw = (item as any);
         const key = String(raw.date || raw.name || raw.day || raw.label || '').split('T')[0];
        if (!key) return;
        const existing = dataMap.get(key) || {};
        Object.entries(item).forEach(([k, v]) => {
            if (k !== 'date' && k !== 'name' && k !== 'day' && k !== 'label') {
                existing[k] = Number(v) || 0;
            }
        });
        dataMap.set(key, existing);
    });

    return calendarDays.map(day => ({
        ...day,
        data: dataMap.get(day.dateStr) || {}
    }));
};
