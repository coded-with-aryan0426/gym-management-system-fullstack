import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, Activity, Bell, FileText, MessageSquare, TrendingUp, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';

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
        setData({
            trainerName: 'John',
            assignedMembers: 12,
            todaysClasses: 3,
            upcomingSessions: 5,
            attendanceRate: 94
        });
    }, []);

    if (!data) return <div className="p-4 text-sm text-gray-500">Loading...</div>;

    const stats = [
        { label: 'Members', value: data.assignedMembers, change: '+2', icon: Users, color: '#4F46E5', onClick: () => navigate('/trainer/members') },
        { label: 'Classes', value: data.todaysClasses, sub: 'Next: 9:00 AM', icon: Calendar, color: '#10B981', onClick: () => navigate('/trainer/classes') },
        { label: 'Sessions', value: data.upcomingSessions, sub: 'This Week', icon: Clock, color: '#F59E0B', onClick: () => navigate('/trainer/schedule') },
        { label: 'Attendance', value: `${data.attendanceRate}%`, change: '+3%', icon: Activity, color: '#EF4444', onClick: () => navigate('/trainer/reports') },
    ];

    const schedule = [
        { time: '9:00 AM', title: 'Yoga Class', room: 'Room A', enrolled: 8 },
        { time: '11:00 AM', title: 'HIIT Session', room: 'Studio 2', enrolled: 12 },
        { time: '2:00 PM', title: 'Personal Training', room: 'Gym Floor', enrolled: 1 },
    ];

    const activities = [
        { text: 'Sarah Wilson booked Yoga class', time: '2h ago', type: 'success' },
        { text: 'Mike Johnson cancelled session', time: '4h ago', type: 'danger' },
        { text: 'Progress note added for David Lee', time: 'Yesterday', type: 'info' },
    ];

    const quickActions = [
        { icon: Bell, label: 'Notification', color: '#4F46E5', path: '/trainer/notifications' },
        { icon: FileText, label: 'Progress Note', color: '#10B981', path: '/trainer/progress-notes' },
        { icon: Calendar, label: 'Schedule', color: '#F59E0B', path: '/trainer/schedule' },
        { icon: MessageSquare, label: 'Message', color: '#3B82F6', path: '/trainer/messages' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Compact Header */}
            <div className="px-4 py-3 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                <div className="flex items-center justify-between max-w-[1200px] mx-auto">
                    <div>
                        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                            Welcome back, {data.trainerName}
                        </h1>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Here's your overview for today
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/trainer/schedule')}
                        className="h-8 px-3 bg-[#4F46E5] text-white rounded-md text-xs font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        New Session
                    </button>
                </div>
            </div>

            <div className="p-4 max-w-[1200px] mx-auto">
                {/* Stats Grid - 4 Column Compact */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {stats.map((stat, idx) => (
                        <button
                            key={idx}
                            onClick={stat.onClick}
                            className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg p-3 text-left hover:border-[var(--sidebar-hover)] transition-all group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div 
                                    className="w-8 h-8 rounded-md flex items-center justify-center"
                                    style={{ background: `${stat.color}15` }}
                                >
                                    <stat.icon size={16} style={{ color: stat.color }} />
                                </div>
                                {stat.change && (
                                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <div className="text-xl font-bold text-[var(--text-primary)] leading-none mb-0.5">
                                {stat.value}
                            </div>
                            <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                                {stat.label}
                                {stat.sub && <span className="opacity-60">• {stat.sub}</span>}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Content - 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Schedule & Activity */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Today's Schedule */}
                        <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--sidebar-border)]">
                                <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                                    Today's Schedule
                                </h2>
                                <button 
                                    onClick={() => navigate('/trainer/schedule')}
                                    className="text-[11px] font-medium text-[#4F46E5] hover:underline flex items-center gap-0.5"
                                >
                                    View All <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="divide-y divide-[var(--sidebar-border)]">
                                {schedule.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-3 py-2.5 hover:bg-[var(--sidebar-hover)] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-[#4F46E5]/10 flex items-center justify-center text-lg">
                                                {idx === 0 ? '🧘' : idx === 1 ? '💪' : '🏋️'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--text-primary)]">
                                                    {item.time} - {item.title}
                                                </div>
                                                <div className="text-[11px] text-[var(--text-tertiary)]">
                                                    {item.room} • {item.enrolled} joined
                                                </div>
                                            </div>
                                        </div>
                                        <button className="h-7 px-2.5 text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--sidebar-border)] rounded hover:bg-[var(--sidebar-hover)] transition-colors">
                                            Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden">
                            <div className="px-3 py-2 border-b border-[var(--sidebar-border)]">
                                <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                                    Recent Activity
                                </h2>
                            </div>
                            <div className="p-3">
                                <div className="relative pl-4">
                                    <div className="absolute left-[7px] top-1 bottom-1 w-px bg-[var(--sidebar-border)]" />
                                    <div className="space-y-3">
                                        {activities.map((activity, idx) => (
                                            <div key={idx} className="relative flex gap-3 items-start">
                                                <div 
                                                    className={`absolute -left-[4px] w-2.5 h-2.5 rounded-full border-2 border-[var(--sidebar-bg)] ${
                                                        activity.type === 'success' ? 'bg-emerald-500' : 
                                                        activity.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                                                    }`} 
                                                />
                                                <div className="ml-3 flex-1 min-w-0">
                                                    <p className="text-xs text-[var(--text-primary)]">{activity.text}</p>
                                                    <p className="text-[10px] text-[var(--text-tertiary)]">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-4">
                        {/* Quick Actions Grid */}
                        <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden">
                            <div className="px-3 py-2 border-b border-[var(--sidebar-border)]">
                                <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="p-2 grid grid-cols-2 gap-1.5">
                                {quickActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(action.path)}
                                        className="flex flex-col items-center gap-1.5 p-3 rounded-md hover:bg-[var(--sidebar-hover)] transition-colors group"
                                    >
                                        <div 
                                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                                            style={{ background: `${action.color}15` }}
                                        >
                                            <action.icon size={18} style={{ color: action.color }} />
                                        </div>
                                        <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden">
                            <div className="px-3 py-2 border-b border-[var(--sidebar-border)]">
                                <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                                    This Week
                                </h2>
                            </div>
                            <div className="p-3 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[var(--text-tertiary)]">Sessions Completed</span>
                                    <span className="text-xs font-semibold text-[var(--text-primary)]">18/20</span>
                                </div>
                                <div className="h-1.5 bg-[var(--sidebar-border)] rounded-full overflow-hidden">
                                    <div className="h-full w-[90%] bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full" />
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs text-[var(--text-tertiary)]">Client Retention</span>
                                    <span className="text-xs font-semibold text-emerald-500">96%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[var(--text-tertiary)]">Avg. Rating</span>
                                    <span className="text-xs font-semibold text-amber-500">4.9 ⭐</span>
                                </div>
                            </div>
                        </div>

                        {/* Reports Link */}
                        <button
                            onClick={() => navigate('/trainer/reports')}
                            className="w-full flex items-center justify-between p-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg hover:border-[#4F46E5]/30 transition-colors group"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
                                    <TrendingUp size={16} className="text-[#4F46E5]" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-medium text-[var(--text-primary)]">View Reports</div>
                                    <div className="text-[10px] text-[var(--text-tertiary)]">Detailed analytics</div>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-[var(--text-tertiary)] group-hover:text-[#4F46E5] transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
