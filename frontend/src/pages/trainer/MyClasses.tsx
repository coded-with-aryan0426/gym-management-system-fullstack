import React, { useState } from 'react';
import { 
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
    List, Clock, MapPin, Users, Download, ChevronDown, MoreVertical
} from 'lucide-react';
import './MyClasses.css';

const MyClasses: React.FC = () => {
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week');
    const [currentDateRange] = useState('March 25-31, 2024');

    const classes = [
        { id: 1, title: 'Yoga Class', startTime: '09:00', duration: 60, day: 'Mon', room: 'Room A', enrolled: '8/15', status: 'Upcoming' },
        { id: 2, title: 'HIIT', startTime: '07:00', duration: 60, day: 'Wed', room: 'Studio 2', enrolled: '12/20', status: 'Completed' },
        { id: 3, title: 'Cardio Blast', startTime: '18:00', duration: 60, day: 'Fri', room: 'Main Floor', enrolled: '15/20', status: 'Upcoming' },
        { id: 4, title: 'Pilates', startTime: '11:00', duration: 60, day: 'Mon', room: 'Room B', enrolled: '5/10', status: 'Cancelled' },
        { id: 5, title: 'Strength Training', startTime: '14:00', duration: 90, day: 'Tue', room: 'Gym Floor', enrolled: '6/8', status: 'Upcoming' },
    ];

    const days = ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30', 'Sun 31'];
    const times = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];

    const getPositionStyle = (startTime: string, duration: number) => {
        const startHour = parseInt(startTime.split(':')[0]);
        const offsetHours = startHour - 6;
        const top = offsetHours * 60;
        const height = duration;
        return { top: `${top}px`, height: `${height}px` };
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'my-classes__event--upcoming';
            case 'In Progress': return 'my-classes__event--progress';
            case 'Completed': return 'my-classes__event--completed';
            case 'Cancelled': return 'my-classes__event--cancelled';
            default: return '';
        }
    };

    return (
        <div className="my-classes">
            <div className="my-classes__header">
                <div className="my-classes__header-content">
                    <div className="my-classes__title-section">
                        <h1>My Classes ({classes.length} Active)</h1>
                        <p>Manage your assigned classes and track attendance</p>
                    </div>
                    <button className="my-classes__add-btn">
                        <Plus size={16} />
                        Schedule New
                    </button>
                </div>
            </div>

            <div className="my-classes__content">
                <div className="my-classes__toolbar">
                    <div className="my-classes__view-toggle">
                        <button 
                            className={viewMode === 'week' ? 'active' : ''} 
                            onClick={() => setViewMode('week')}
                        >
                            Week View
                        </button>
                        <button 
                            className={viewMode === 'month' ? 'active' : ''} 
                            onClick={() => setViewMode('month')}
                        >
                            Month View
                        </button>
                        <button 
                            className={viewMode === 'list' ? 'active' : ''} 
                            onClick={() => setViewMode('list')}
                        >
                            <List size={14} />
                            List
                        </button>
                    </div>

                    <div className="my-classes__date-nav">
                        <button className="my-classes__date-btn"><ChevronLeft size={16} /></button>
                        <span className="my-classes__date-text">{currentDateRange}</span>
                        <button className="my-classes__date-btn"><ChevronRight size={16} /></button>
                    </div>

                    <div className="my-classes__filters">
                        <button className="my-classes__filter-btn">
                            All Classes <ChevronDown size={14} />
                        </button>
                        <button className="my-classes__export-btn">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                {viewMode === 'week' && (
                    <div className="my-classes__calendar">
                        <div className="my-classes__calendar-header">
                            <div className="my-classes__time-col">Time</div>
                            {days.map((day, i) => (
                                <div key={i} className={`my-classes__day-col ${i === 2 ? 'my-classes__day-col--today' : ''}`}>
                                    <span className="my-classes__day-name">{day.split(' ')[0]}</span>
                                    <span className="my-classes__day-num">{day.split(' ')[1]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="my-classes__calendar-body">
                            <div className="my-classes__time-labels">
                                {times.map(time => (
                                    <div key={time} className="my-classes__time-slot">{time}</div>
                                ))}
                            </div>

                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayName = days[dayIndex].split(' ')[0];
                                const dayClasses = classes.filter(c => c.day.startsWith(dayName));

                                return (
                                    <div key={dayIndex} className="my-classes__day-column">
                                        {times.map((_, i) => (
                                            <div key={i} className="my-classes__grid-cell" />
                                        ))}
                                        {dayClasses.map((cls, idx) => {
                                            const style = getPositionStyle(cls.startTime, cls.duration);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`my-classes__event ${getStatusClass(cls.status)}`}
                                                    style={style}
                                                >
                                                    <div className="my-classes__event-title">{cls.title}</div>
                                                    <div className="my-classes__event-time">
                                                        <Clock size={10} /> {cls.startTime}
                                                    </div>
                                                    <div className="my-classes__event-meta">
                                                        <MapPin size={10} /> {cls.room} • <Users size={10} /> {cls.enrolled}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {viewMode === 'month' && (
                    <div className="my-classes__month-placeholder">
                        <CalendarIcon size={48} />
                        <p>Month View</p>
                        <span>Coming soon - Full calendar grid view</span>
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="my-classes__list">
                        {classes.map(cls => (
                            <div key={cls.id} className="my-classes__list-item">
                                <div className="my-classes__list-info">
                                    <h3>{cls.title}</h3>
                                    <div className="my-classes__list-meta">
                                        <span><CalendarIcon size={14} /> {cls.day}</span>
                                        <span><Clock size={14} /> {cls.startTime}</span>
                                        <span><MapPin size={14} /> {cls.room}</span>
                                        <span><Users size={14} /> {cls.enrolled}</span>
                                    </div>
                                </div>
                                <div className="my-classes__list-actions">
                                    <span className={`my-classes__status my-classes__status--${cls.status.toLowerCase().replace(' ', '-')}`}>
                                        {cls.status}
                                    </span>
                                    <button className="my-classes__more-btn">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyClasses;
