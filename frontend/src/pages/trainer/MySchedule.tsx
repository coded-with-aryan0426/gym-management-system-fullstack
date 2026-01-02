import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Filter, Calendar } from 'lucide-react';

const MySchedule: React.FC = () => {
    // Mock Data
    const [currentMonth, setCurrentMonth] = useState('March 2024');

    // Mock events for Month View
    const events = [
        { id: 1, title: 'Yoga Class', date: 25, type: 'class', time: '9:00 AM' },
        { id: 2, title: 'PT: Sarah', date: 25, type: 'pt', time: '1:00 PM' },
        { id: 3, title: 'HIIT', date: 27, type: 'class', time: '7:00 AM' },
        { id: 4, title: 'PT: Mike', date: 28, type: 'pt', time: '2:00 PM' },
        { id: 5, title: 'Cardio', date: 29, type: 'class', time: '6:00 PM' },
        { id: 6, title: 'Staff Meeting', date: 30, type: 'meeting', time: '10:00 AM' },
    ];

    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
    const startDayOffset = 1; // e.g. Monday start

    const getEventTypeStyles = (type: string) => {
        switch (type) {
            case 'class': return 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500';
            case 'pt': return 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500';
            case 'meeting': return 'bg-amber-50 text-amber-700 border-l-2 border-amber-500';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">My Schedule</h1>
                    <p className="text-sm font-normal text-gray-500">Your weekly training schedule</p>
                </div>
                <button className="h-10 px-5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <RefreshCw size={16} /> Sync to Calendar
                </button>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full">
                {/* Calendar Controls */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                    {/* View Toggle */}
                    <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden h-9">
                        <button className="px-4 text-sm font-medium bg-white text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200">Day</button>
                        <button className="px-4 text-sm font-medium bg-white text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200">Week</button>
                        <button className="px-4 text-sm font-medium bg-[#EEF2FF] text-[#4F46E5] font-semibold transition-colors">Month</button>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-4">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-[18px] font-bold text-gray-900 text-center min-w-[140px]">{currentMonth}</span>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                        <button className="px-4 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ml-2">
                            Today
                        </button>
                    </div>

                    {/* Filter */}
                    <button className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                {/* Month View Calendar */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
                        {/* Empty slots for start offset */}
                        {Array.from({ length: startDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30 p-2 min-h-[120px]"></div>
                        ))}

                        {/* Actual Days */}
                        {daysInMonth.map(day => {
                            const dayEvents = events.filter(e => e.date === day);
                            return (
                                <div key={day} className="border-b border-r border-gray-100 p-2 min-h-[120px] relative hover:bg-gray-50/50 transition-colors group">
                                    <div className={`text-sm font-medium mb-2 ${day === 25 ? 'w-7 h-7 bg-[#4F46E5] text-white rounded-full flex items-center justify-center' : 'text-gray-700 pl-1'}`}>
                                        {day}
                                    </div>
                                    <div className="space-y-1.5">
                                        {dayEvents.map(event => (
                                            <div key={event.id} className={`text-xs p-1.5 rounded-md truncate cursor-pointer hover:opacity-80 font-medium ${getEventTypeStyles(event.type)}`}>
                                                {event.time} {event.title}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Add Button on Hover */}
                                    <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gray-100 text-gray-400 hover:bg-[#4F46E5] hover:text-white items-center justify-center hidden group-hover:flex transition-colors text-lg leading-none pb-0.5">
                                        +
                                    </button>
                                </div>
                            );
                        })}

                        {/* Trailing empty slots to complete grid (optional, filling to 35 or 42) */}
                        {Array.from({ length: 35 - (daysInMonth.length + startDayOffset) }).map((_, i) => (
                            <div key={`trailing-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30 p-2 min-h-[120px]"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySchedule;
