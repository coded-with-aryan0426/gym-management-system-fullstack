import React from 'react';
import { motion } from 'framer-motion';
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

    const getStatusStyles = (status: MaintenanceStatus) => {
        const colors: Record<string, string> = {
            COMPLETED: 'var(--modal-success)',
            SCHEDULED: 'var(--accent-primary)',
            OVERDUE: 'var(--modal-danger)',
            CANCELLED: 'var(--text-secondary)'
        };
        const bgs: Record<string, string> = {
            COMPLETED: 'var(--modal-success-bg)',
            SCHEDULED: 'var(--modal-info-bg)',
            OVERDUE: 'var(--modal-danger-bg)',
            CANCELLED: 'var(--bg-surface-secondary)'
        };
        return { color: colors[status] || 'var(--text-secondary)', bg: bgs[status] || 'var(--bg-surface-secondary)' };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 h-[500px]"
        >
            <div className="eq-card h-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden">
                <div className="eq-calendar h-full p-2">
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
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onNavigate('PREV')} className="p-2 hover:bg-[var(--bg-surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><ChevronLeft size={16} /></button>
                                        <button onClick={() => onNavigate('NEXT')} className="p-2 hover:bg-[var(--bg-surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><ChevronRight size={16} /></button>
                                        <span className="text-sm font-bold text-[var(--text-primary)] ml-2">{label}</span>
                                    </div>
                                    <div className="flex bg-[var(--bg-surface-secondary)] rounded-lg p-1 border border-[var(--border-color)]">
                                        {['month', 'week', 'day'].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => onView(v as any)}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${view === v ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        }}
                        eventPropGetter={event => {
                            const statusStyles = getStatusStyles(event.status);
                            return {
                                style: {
                                    backgroundColor: statusStyles.bg,
                                    border: `1px solid ${statusStyles.color}`,
                                    borderRadius: '6px',
                                    color: statusStyles.color,
                                    fontSize: '10px',
                                    padding: '2px 8px',
                                    fontWeight: '700',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }
                            };
                        }}
                    />
                </div>
            </div>

            {/* CALENDAR THEME STYLES */}
            <style>{`
                .eq-calendar .rbc-calendar { background: transparent; font-family: inherit; }
                .eq-calendar .rbc-header { background: var(--bg-surface-secondary); border-color: var(--border-color) !important; padding: 12px 4px; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
                .eq-calendar .rbc-month-view { border-color: var(--border-color); background: var(--bg-surface); border-radius: 12px; overflow: hidden; }
                .eq-calendar .rbc-month-row { border-color: var(--border-color); }
                .eq-calendar .rbc-day-bg { background: var(--bg-surface); border-color: var(--border-color) !important; transition: background 0.2s; }
                .eq-calendar .rbc-day-bg:hover { background: var(--bg-surface-secondary); }
                .eq-calendar .rbc-day-bg.rbc-today { background: var(--bg-surface-secondary); }
                .eq-calendar .rbc-day-bg.rbc-off-range-bg { background: var(--bg-primary); opacity: 0.5; }
                .eq-calendar .rbc-date-cell { padding: 8px 10px; color: var(--text-secondary); font-size: 12px; font-weight: 500; }
                .eq-calendar .rbc-date-cell.rbc-now { color: var(--accent-primary); font-weight: 800; }
                .eq-calendar .rbc-date-cell.rbc-off-range { color: var(--text-secondary); opacity: 0.3; }
                .eq-calendar .rbc-row-segment { padding: 2px 4px; }
                .eq-calendar .rbc-event { padding: 4px 8px !important; font-size: 11px !important; border-radius: 6px !important; }
                .eq-calendar .rbc-show-more { background: transparent; color: var(--accent-primary); font-size: 11px; font-weight: 600; padding: 4px; }
                .eq-calendar .rbc-time-view, .eq-calendar .rbc-time-header, .eq-calendar .rbc-time-content { background: var(--bg-surface); border-color: var(--border-color); }
                .eq-calendar .rbc-timeslot-group { border-color: var(--border-color); }
                .eq-calendar .rbc-time-slot { color: var(--text-secondary); font-size: 11px; }
                .eq-calendar .rbc-current-time-indicator { background: var(--accent-primary); height: 2px; }
                .eq-calendar .rbc-row-bg { background: var(--bg-surface); }
                .eq-calendar .rbc-allday-cell { background: var(--bg-surface); border-color: var(--border-color); }
            `}</style>
        </motion.div>
    );
};
