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
