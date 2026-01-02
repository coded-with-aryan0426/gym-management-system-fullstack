import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Filter, Plus } from 'lucide-react';
import './TrainerSchedule.css';

const MySchedule: React.FC = () => {
    const [currentMonth] = useState('March 2024');
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');

    const events = [
        { id: 1, title: 'Yoga Class', date: 25, type: 'class', time: '9:00 AM' },
        { id: 2, title: 'PT: Sarah', date: 25, type: 'pt', time: '1:00 PM' },
        { id: 3, title: 'HIIT', date: 27, type: 'class', time: '7:00 AM' },
        { id: 4, title: 'PT: Mike', date: 28, type: 'pt', time: '2:00 PM' },
        { id: 5, title: 'Cardio', date: 29, type: 'class', time: '6:00 PM' },
        { id: 6, title: 'Staff Meeting', date: 30, type: 'meeting', time: '10:00 AM' },
    ];

    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
    const startDayOffset = 5;

    const getEventTypeClass = (type: string) => {
        switch (type) {
            case 'class': return 'trainer-schedule__event--class';
            case 'pt': return 'trainer-schedule__event--pt';
            case 'meeting': return 'trainer-schedule__event--meeting';
            default: return '';
        }
    };

    return (
        <div className="trainer-schedule">
            <div className="trainer-schedule__header">
                <div className="trainer-schedule__header-content">
                    <div className="trainer-schedule__title-section">
                        <h1>My Schedule</h1>
                        <p>Your training schedule and appointments</p>
                    </div>
                    <button className="trainer-schedule__sync-btn">
                        <RefreshCw size={16} />
                        Sync to Calendar
                    </button>
                </div>
            </div>

            <div className="trainer-schedule__content">
                <div className="trainer-schedule__toolbar">
                    <div className="trainer-schedule__view-toggle">
                        <button 
                            className={viewMode === 'day' ? 'active' : ''}
                            onClick={() => setViewMode('day')}
                        >
                            Day
                        </button>
                        <button 
                            className={viewMode === 'week' ? 'active' : ''}
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </button>
                        <button 
                            className={viewMode === 'month' ? 'active' : ''}
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </button>
                    </div>

                    <div className="trainer-schedule__date-nav">
                        <button className="trainer-schedule__nav-btn">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="trainer-schedule__date-text">{currentMonth}</span>
                        <button className="trainer-schedule__nav-btn">
                            <ChevronRight size={18} />
                        </button>
                        <button className="trainer-schedule__today-btn">Today</button>
                    </div>

                    <button className="trainer-schedule__filter-btn">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>

                <div className="trainer-schedule__calendar">
                    <div className="trainer-schedule__weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="trainer-schedule__weekday">{day}</div>
                        ))}
                    </div>

                    <div className="trainer-schedule__days">
                        {Array.from({ length: startDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="trainer-schedule__day trainer-schedule__day--empty" />
                        ))}

                        {daysInMonth.map(day => {
                            const dayEvents = events.filter(e => e.date === day);
                            const isToday = day === 25;
                            
                            return (
                                <div key={day} className="trainer-schedule__day">
                                    <div className={`trainer-schedule__day-number ${isToday ? 'trainer-schedule__day-number--today' : ''}`}>
                                        {day}
                                    </div>
                                    <div className="trainer-schedule__day-events">
                                        {dayEvents.map(event => (
                                            <div 
                                                key={event.id} 
                                                className={`trainer-schedule__event ${getEventTypeClass(event.type)}`}
                                            >
                                                {event.time} {event.title}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="trainer-schedule__add-btn">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            );
                        })}

                        {Array.from({ length: Math.max(0, 35 - (daysInMonth.length + startDayOffset)) }).map((_, i) => (
                            <div key={`trailing-${i}`} className="trainer-schedule__day trainer-schedule__day--empty" />
                        ))}
                    </div>
                </div>

                <div className="trainer-schedule__legend">
                    <div className="trainer-schedule__legend-item">
                        <span className="trainer-schedule__legend-dot trainer-schedule__legend-dot--class" />
                        Classes
                    </div>
                    <div className="trainer-schedule__legend-item">
                        <span className="trainer-schedule__legend-dot trainer-schedule__legend-dot--pt" />
                        Personal Training
                    </div>
                    <div className="trainer-schedule__legend-item">
                        <span className="trainer-schedule__legend-dot trainer-schedule__legend-dot--meeting" />
                        Meetings
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySchedule;
