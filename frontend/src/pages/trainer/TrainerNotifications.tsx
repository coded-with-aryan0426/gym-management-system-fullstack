import React, { useEffect, useState } from 'react';
import { Bell, Check, Clock, Calendar, MessageSquare, Info, X } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { toast } from 'react-hot-toast';
import './Trainer.css';

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
            case 'schedule': return 'bg-indigo-500/10 text-indigo-500';
            case 'member': return 'bg-emerald-500/10 text-emerald-500';
            case 'message': return 'bg-amber-500/10 text-amber-500';
            case 'system': return 'bg-red-500/10 text-red-500';
            default: return 'bg-zinc-800 text-zinc-400';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        if (filter === 'system') return n.type === 'system';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return <div className="p-8 text-white">Loading notifications...</div>;

    return (
        <div className="trainer-dashboard fade-in">
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="Notifications"
                    subtitle="Stay updated with your schedule and member activities"
                />
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                    >
                        <Check size={16} />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-1">
                {['All', 'Unread', 'System'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab.toLowerCase() as any)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === tab.toLowerCase()
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                    >
                        {tab}
                        {tab === 'Unread' && unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                            <Bell size={24} />
                        </div>
                        <h3 className="text-white font-medium mb-1">No notifications found</h3>
                        <p className="text-zinc-500 text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`group relative flex gap-4 p-5 rounded-xl border transition-all ${notification.isRead
                                    ? 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                                    : 'bg-zinc-900 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                                }`}
                        >
                            {!notification.isRead && (
                                <div className="absolute top-5 right-5 w-2 h-2 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50"></div>
                            )}

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                                {getTypeIcon(notification.type)}
                            </div>

                            <div className="flex-grow pr-8">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold ${notification.isRead ? 'text-zinc-300' : 'text-white'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-zinc-500 whitespace-nowrap flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                                        <Clock size={12} />
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                                    {notification.message}
                                </p>

                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-xs font-medium text-zinc-500 hover:text-red-400 hover:underline"
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
    );
};

export default TrainerNotifications;
