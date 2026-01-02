import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List as ListIcon, Clock, MapPin, Users, Download, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyClasses: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week');

    // Mock Date Navigation
    const [currentDateRange, setCurrentDateRange] = useState('March 25-31, 2024');

    // Mock Data for Calendar
    const classes = [
        { id: 1, title: 'Yoga Class', startTime: '09:00', duration: 60, day: 'Mon', room: 'Room A', enrolled: '8/15', status: 'Upcoming' },
        { id: 2, title: 'HIIT', startTime: '07:00', duration: 60, day: 'Wed', room: 'Studio 2', enrolled: '12/20', status: 'Completed' },
        { id: 3, title: 'Cardio Blast', startTime: '18:00', duration: 60, day: 'Fri', room: 'Main Floor', enrolled: '15/20', status: 'Upcoming' },
        // Overlapping example
        { id: 4, title: 'Pilates', startTime: '09:00', duration: 60, day: 'Mon', room: 'Room B', enrolled: '5/10', status: 'Cancelled' }, // Same slot for demo logic (logic should handle or overlap) - Spec doesn't strictly define overlap handling but absolute positioning implies potential overlap.
    ];

    const days = ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30', 'Sun 31'];
    const times = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];

    const getPositionStyle = (startTime: string, duration: number) => {
        const startHour = parseInt(startTime.split(':')[0]);
        // 6 AM is index 0. So 9 AM is index 3.
        const offsetHours = startHour - 6;
        const top = offsetHours * 60;
        const height = duration; // 1 min = 1px approximately based on 60px/hr? Spec says 60px height for 60 mins. Yes.
        return { top: `${top}px`, height: `${height}px` };
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'bg-[#EEF2FF] border-l-[3px] border-l-[#4F46E5] text-[#4F46E5]';
            case 'In Progress': return 'bg-[#D1FAE5] border-l-[3px] border-l-[#10B981] text-[#065F46]';
            case 'Completed': return 'bg-[#F3F4F6] border-l-[3px] border-l-[#9CA3AF] text-[#6B7280]';
            case 'Cancelled': return 'bg-[#FEE2E2] border-l-[3px] border-l-[#EF4444] text-[#991B1B]';
            default: return 'bg-white border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">My Classes (5 Active)</h1>
                    <p className="text-sm font-normal text-gray-500">Manage your assigned classes and track attendance</p>
                </div>
                <button className="h-10 px-5 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338CA] transition-colors flex items-center gap-2">
                    Schedule New <Plus size={16} />
                </button>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full">
                {/* Calendar View Toggle Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 my-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                    {/* Left: View Selector */}
                    <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden h-9">
                        <button onClick={() => setViewMode('week')} className={`px-4 text-sm font-medium border-r border-gray-200 transition-colors ${viewMode === 'week' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-white text-gray-500'}`}>Week View</button>
                        <button onClick={() => setViewMode('month')} className={`px-4 text-sm font-medium border-r border-gray-200 transition-colors ${viewMode === 'month' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-white text-gray-500'}`}>Month View</button>
                        <button onClick={() => setViewMode('list')} className={`px-4 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-white text-gray-500'}`}>List</button>
                    </div>

                    {/* Center: Date Nav */}
                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"><ChevronLeft size={16} /></button>
                        <span className="text-[15px] font-semibold text-gray-900 min-w-[160px] text-center">{currentDateRange}</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"><ChevronRight size={16} /></button>
                    </div>

                    {/* Right: Filter & Actions */}
                    <div className="flex gap-3">
                        <button className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
                            All Classes <ChevronDown size={14} />
                        </button>
                        <button className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                {/* Week View Calendar */}
                {viewMode === 'week' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 overflow-x-auto shadow-sm">
                        {/* Day Headers */}
                        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-4 border-b-2 border-gray-200 pb-4 min-w-[1000px]">
                            <div className="text-center text-[13px] font-semibold text-gray-500 uppercase flex items-end justify-center">Time</div>
                            {days.map((day, i) => (
                                <div key={i} className={`text-center py-2 rounded-lg ${i === 2 ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-gray-500'}`}>
                                    <div className="text-[13px] font-semibold uppercase">{day.split(' ')[0]}</div>
                                    <div className="text-lg font-bold">{day.split(' ')[1]}</div>
                                </div>
                            ))}
                        </div>

                        {/* Time Grid */}
                        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-4 min-w-[1000px] relative mt-4">
                            {/* Time Column */}
                            <div className="flex flex-col">
                                {times.map(time => (
                                    <div key={time} className="h-[60px] text-[12px] text-gray-400 font-medium text-right pr-4 pt-2 border-b border-gray-50">
                                        {time}
                                    </div>
                                ))}
                            </div>

                            {/* Days Columns */}
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                // Find classes for this day
                                const dayName = days[dayIndex].split(' ')[0]; // e.g., 'Mon'
                                const dayClasses = classes.filter(c => c.day.startsWith(dayName));

                                return (
                                    <div key={dayIndex} className="relative border-l border-gray-50 h-[960px]"> {/* 16 hours * 60px */}
                                        {/* Grid Lines */}
                                        {times.map((_, i) => (
                                            <div key={i} className="h-[60px] border-b border-gray-50 w-full absolute top-0 left-0" style={{ top: i * 60 }} />
                                        ))}

                                        {/* Class Cards */}
                                        {dayClasses.map((cls, idx) => {
                                            const style = getPositionStyle(cls.startTime, cls.duration);
                                            const statusClass = getStatusStyle(cls.status);
                                            // Handle overlap strictly by offsetting width if needed (simplified for now as full width)

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`absolute w-[calc(100%-8px)] left-1 rounded-md p-2 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all z-10 overflow-hidden ${statusClass}`}
                                                    style={{ ...style }}
                                                >
                                                    <div className="text-[13px] font-semibold mb-0.5 truncate">{cls.title}</div>
                                                    <div className="text-[11px] opacity-80 mb-1 flex items-center gap-1">
                                                        <Clock size={10} /> {cls.startTime} - {parseInt(cls.startTime.split(':')[0]) + 1}:00
                                                    </div>
                                                    <div className="text-[11px] opacity-70 truncate flex items-center gap-1">
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
                    <div className="h-[600px] flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400">
                        Month View Placeholder (Standard Calendar Grid)
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="space-y-3">
                        {classes.map(cls => (
                            <div key={cls.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors cursor-pointer flex justify-between items-center group">
                                <div>
                                    <h3 className="text-gray-900 font-bold group-hover:text-[#4F46E5] transition-colors">{cls.title}</h3>
                                    <div className="text-gray-500 text-sm mt-1 flex gap-3">
                                        <span className="flex items-center gap-1"><CalendarIcon size={14} /> {cls.day}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {cls.startTime}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {cls.room}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(cls.status).split(' ')[0]} ${getStatusStyle(cls.status).split(' ').pop()}`}>
                                    {cls.status}
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
