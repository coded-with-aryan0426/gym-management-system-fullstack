import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, Activity, Bell, FileText, MessageSquare, TrendingUp, ChevronRight } from 'lucide-react';

interface DashboardData {
    trainerName: string;
    assignedMembers: number;
    todaysClasses: number;
    upcomingSessions: number;
    attendanceRate: number;
}

const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        // Mock data matching spec context
        setData({
            trainerName: 'John',
            assignedMembers: 12,
            todaysClasses: 3,
            upcomingSessions: 5,
            attendanceRate: 94
        });
    }, []);

    if (!data) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header - Height 80px, Padding 24px, Border Bottom */}
            <div className="h-[80px] px-6 flex flex-col justify-center border-b border-gray-200 bg-white mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 leading-[1.2] mb-1">
                    Welcome back, {data.trainerName}! 👋
                </h1>
                <p className="text-sm font-normal text-gray-500">
                    Here's what's happening with your members today
                </p>
            </div>

            <div className="px-6 pb-6 max-w-[1400px] mx-auto w-full">
                {/* Stats Grid - 4 Columns, Gap 20px */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Card 1: Assigned Members */}
                    <div className="h-[136px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/trainer/members')}>
                        <div className="flex flex-col h-full justify-between">
                            <div className="w-12 h-12 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center mb-3">
                                <Users size={24} className="text-[#4F46E5]" />
                            </div>
                            <div>
                                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">
                                    {data.assignedMembers}
                                </div>
                                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    Assigned Members
                                    <span className="text-xs text-emerald-500 font-medium ml-1 flex items-center">
                                        +2 this week
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Today's Classes */}
                    <div className="h-[136px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/trainer/classes')}>
                        <div className="flex flex-col h-full justify-between">
                            <div className="w-12 h-12 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center mb-3">
                                <Calendar size={24} className="text-[#4F46E5]" />
                            </div>
                            <div>
                                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">
                                    {data.todaysClasses}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    Today's Classes <span className="text-xs text-gray-400 ml-1">Next: 9:00 AM</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Upcoming Sessions */}
                    <div className="h-[136px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/trainer/schedule')}>
                        <div className="flex flex-col h-full justify-between">
                            <div className="w-12 h-12 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center mb-3">
                                <Clock size={24} className="text-[#4F46E5]" />
                            </div>
                            <div>
                                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">
                                    {data.upcomingSessions}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    Upcoming Sessions <span className="text-xs text-gray-400 ml-1">This Week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Attendance Rate */}
                    <div className="h-[136px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/trainer/reports')}>
                        <div className="flex flex-col h-full justify-between">
                            <div className="w-12 h-12 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center mb-3">
                                <Activity size={24} className="text-[#4F46E5]" />
                            </div>
                            <div>
                                <div className="text-[32px] font-bold text-gray-900 leading-none mb-1">
                                    {data.attendanceRate}%
                                </div>
                                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    Attendance Rate
                                    <span className="text-xs text-emerald-500 font-medium ml-1">
                                        +3%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[20px] font-semibold text-gray-900">Today's Schedule</h2>
                        <button
                            onClick={() => navigate('/trainer/schedule')}
                            className="text-sm font-medium text-[#4F46E5] hover:underline"
                        >
                            View All &gt;
                        </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {[
                            { time: '9:00 AM', title: 'Yoga Class', room: 'Room A', enrolled: 8, icon: '🧘' },
                            { time: '11:00 AM', title: 'HIIT Session', room: 'Studio 2', enrolled: 12, icon: '💪' },
                            { time: '2:00 PM', title: 'Personal Training', room: 'Gym Floor', enrolled: 1, icon: '🏋️' }
                        ].map((item, index) => (
                            <div key={index} className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between min-h-[80px]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-xl">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-base font-semibold text-gray-900">
                                            {item.time} - {item.title}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {item.room} • {item.enrolled} members joined
                                        </div>
                                    </div>
                                </div>
                                <button className="h-9 px-4 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[20px] font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            {/* Activity List to handle in future updates or reuse existing logic if robust */}
                            <div className="space-y-6 relative pl-2">
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                {[
                                    { text: 'Sarah Wilson booked your Yoga class', time: '2 hours ago', icon: '✅' },
                                    { text: 'Mike Johnson cancelled session', time: '4 hours ago', icon: '❌' },
                                    { text: 'Added progress note for David Lee', time: 'Yesterday', icon: '📝' }
                                ].map((activity, i) => (
                                    <div key={i} className="relative flex gap-4 items-start">
                                        <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm shadow-sm">
                                            {activity.icon}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium text-sm">{activity.text}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[20px] font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
                            <button onClick={() => navigate('/trainer/notifications')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                                <Bell size={20} className="text-[#4F46E5] group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 font-medium text-sm">Send Notification</span>
                            </button>
                            <button onClick={() => navigate('/trainer/progress-notes')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                                <FileText size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 font-medium text-sm">Add Progress Note</span>
                            </button>
                            <button onClick={() => navigate('/trainer/schedule')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                                <Calendar size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 font-medium text-sm">Schedule Session</span>
                            </button>
                            <button onClick={() => navigate('/trainer/reports')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                                <TrendingUp size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 font-medium text-sm">View Reports</span>
                            </button>
                            <button onClick={() => navigate('/trainer/messages')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                                <MessageSquare size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 font-medium text-sm">Message Member</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
