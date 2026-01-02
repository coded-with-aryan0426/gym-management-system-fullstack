import React, { useEffect, useState } from 'react';
import { Bell, Check, Clock, Calendar, MessageSquare, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'schedule' | 'member' | 'system' | 'message';
    isRead: boolean;
    createdAt: string;
}

const TrainerNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'system'>('all');

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setNotifications([
                { id: 1, title: 'New Class Assigned', message: 'You have been assigned to "Yoga Flow" on Mon, Mar 25 at 9:00 AM.', type: 'schedule', isRead: false, createdAt: new Date().toISOString() },
                { id: 2, title: 'Member Cancellation', message: 'Sarah Wilson cancelled her PT session on Tue, Mar 26.', type: 'schedule', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
                { id: 3, title: 'New Message', message: 'David Lee sent you a message regarding his diet plan.', type: 'message', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
                { id: 4, title: 'System Maintenance', message: 'The platform will be down for maintenance on Sunday at 2 AM.', type: 'system', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
                { id: 5, title: 'Member Goal Reached', message: 'Michael Chen hit his weight goal! Send him a congratulatory message.', type: 'member', isRead: false, createdAt: new Date(Date.now() - 200000).toISOString() },
            ]);
            setLoading(false);
        }, 500);
    }, [user?.id]);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        toast.success('Marked as read');
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification removed');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'schedule': return <Calendar size={20} />;
            case 'member': return <Bell size={20} />;
            case 'message': return <MessageSquare size={20} />;
            case 'system': return <Info size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'schedule': return 'bg-indigo-50 text-indigo-600';
            case 'member': return 'bg-emerald-50 text-emerald-600';
            case 'message': return 'bg-amber-50 text-amber-600';
            case 'system': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        if (filter === 'system') return n.type === 'system';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return <div className="p-8 text-gray-500 text-center">Loading notifications...</div>;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900 mb-1">Notifications</h1>
                        <p className="text-sm font-normal text-gray-500">Stay updated with your schedule and member activities</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        >
                            <Check size={16} />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
                    {['All', 'Unread', 'System'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab.toLowerCase() as any)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === tab.toLowerCase()
                                ? 'border-[#4F46E5] text-[#4F46E5]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {tab === 'Unread' && unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Bell size={24} />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">No notifications found</h3>
                            <p className="text-gray-500 text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`group relative flex gap-4 p-5 rounded-xl border transition-all ${notification.isRead
                                    ? 'bg-white border-gray-200 hover:border-gray-300'
                                    : 'bg-indigo-50/50 border-indigo-100 shadow-sm'
                                    }`}
                            >
                                {!notification.isRead && (
                                    <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-[#4F46E5] rounded-full shadow-sm"></div>
                                )}

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                                    {getTypeIcon(notification.type)}
                                </div>

                                <div className="flex-grow pr-8">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-semibold text-base ${notification.isRead ? 'text-gray-900' : 'text-[#4F46E5]'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1 group-hover:text-gray-500 transition-colors">
                                            <Clock size={12} />
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed mb-3 ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                                        {notification.message}
                                    </p>

                                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerNotifications;
