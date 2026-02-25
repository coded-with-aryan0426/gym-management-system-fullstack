import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MaintenanceStatus } from '../../../../types/equipmentMaintenance';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface MaintenanceScheduleProps {
    calendarEvents: any[];
}

export const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ calendarEvents }) => {
    const localizer = momentLocalizer(moment);

    const getStatusColor = (status: MaintenanceStatus) => {
        const c: Record<string, string> = { COMPLETED: '#22c55e', SCHEDULED: '#64748b', OVERDUE: '#ef4444', CANCELLED: 'var(--text-secondary)' };
        return c[status] || 'var(--text-secondary)';
    };

    return (
        <div className="h-[460px]">
            <div className="eq-calendar h-full">
                <BigCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    popup
                    components={{
                        toolbar: ({ label, onNavigate, onView, view }) => (
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-color)]">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-[var(--bg-surface-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><ChevronLeft size={14} /></button>
                                    <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-[var(--bg-surface-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><ChevronRight size={14} /></button>
                                    <span className="text-xs font-bold text-[var(--text-primary)] ml-2">{label}</span>
                                </div>
                                <div className="eq-tab-bar">
                                    {['month', 'week', 'day'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => onView(v as any)}
                                            className={`eq-tab-btn text-[10px] px-3 py-1 ${view === v ? 'eq-tab-btn--active' : ''}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    }}
                    eventPropGetter={event => ({
                        style: {
                            backgroundColor: `${getStatusColor(event.status)}15`,
                            border: `1px solid ${getStatusColor(event.status)}`,
                            borderRadius: '4px',
                            color: getStatusColor(event.status),
                            fontSize: '10px',
                            padding: '1px 6px',
                            fontWeight: '700',
                        }
                    })}
                />
            </div>

            <style>{`
                .eq-calendar .rbc-calendar { background: transparent; font-family: inherit; }
                .eq-calendar .rbc-header { background: var(--bg-surface-secondary); border-color: var(--border-color) !important; padding: 8px 4px; font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; }
                .eq-calendar .rbc-month-view { border-color: var(--border-color); background: var(--bg-surface); border-radius: 8px; overflow: hidden; }
                .eq-calendar .rbc-month-row { border-color: var(--border-color); }
                .eq-calendar .rbc-day-bg { background: var(--bg-surface); border-color: var(--border-color) !important; }
                .eq-calendar .rbc-day-bg:hover { background: var(--bg-surface-secondary); }
                .eq-calendar .rbc-day-bg.rbc-today { background: var(--bg-surface-secondary); }
                .eq-calendar .rbc-day-bg.rbc-off-range-bg { background: var(--bg-primary); opacity: 0.5; }
                .eq-calendar .rbc-date-cell { padding: 4px 6px; color: var(--text-secondary); font-size: 11px; font-weight: 500; }
                .eq-calendar .rbc-date-cell.rbc-now { color: var(--accent-primary); font-weight: 800; }
                .eq-calendar .rbc-date-cell.rbc-off-range { color: var(--text-secondary); opacity: 0.3; }
                .eq-calendar .rbc-row-segment { padding: 1px 3px; }
                .eq-calendar .rbc-event { padding: 2px 6px !important; font-size: 10px !important; border-radius: 4px !important; }
                .eq-calendar .rbc-show-more { background: transparent; color: var(--accent-primary); font-size: 10px; font-weight: 600; padding: 2px; }
                .eq-calendar .rbc-time-view, .eq-calendar .rbc-time-header, .eq-calendar .rbc-time-content { background: var(--bg-surface); border-color: var(--border-color); }
                .eq-calendar .rbc-timeslot-group { border-color: var(--border-color); }
                .eq-calendar .rbc-time-slot { color: var(--text-secondary); font-size: 10px; }
                .eq-calendar .rbc-current-time-indicator { background: var(--accent-primary); height: 2px; }
                .eq-calendar .rbc-row-bg { background: var(--bg-surface); }
                .eq-calendar .rbc-allday-cell { background: var(--bg-surface); border-color: var(--border-color); }
            `}</style>
        </div>
    );
};
