import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CreditCard, Calendar, User, Dumbbell, Trophy,
    Check, CheckCheck, Trash2, Settings, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
import './MemberNotifications.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

type FilterType = 'all' | 'unread';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

const MemberNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        // Mock data for development
        const mockNotifications: Notification[] = [
            { id: 1, title: 'Class Reminder', message: 'Your Yoga class starts in 1 hour. Room A at 9:00 AM.', type: 'BOOKING', isRead: false, createdAt: new Date().toISOString() },
            { id: 2, title: 'Payment Successful', message: 'Your monthly membership payment of $99.99 was processed.', type: 'MEMBERSHIP', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 3, title: 'New Achievement!', message: 'Congratulations! You unlocked the "7 Day Streak" badge. 🔥', type: 'ACHIEVEMENT', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 4, title: 'Trainer Message', message: 'John Smith: Great progress on your squats today! Keep it up.', type: 'TRAINER', isRead: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 5, title: 'Membership Expiring Soon', message: 'Your Premium Monthly plan expires in 7 days. Renew now to continue.', type: 'MEMBERSHIP', isRead: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 6, title: 'Class Cancelled', message: 'HIIT Training on Jan 5 has been cancelled. We apologize for the inconvenience.', type: 'BOOKING', isRead: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() }
        ];
        setNotifications(mockNotifications);
        setLoading(false);
    }, [user?.id]);

    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        toast.success('Marked as read');
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
    };

    const deleteNotification = (notificationId: number) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('Notification deleted');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 5) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTypeInfo = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'MEMBERSHIP':
                return { icon: CreditCard, color: 'var(--macos-accent)', bg: 'rgba(0, 122, 255, 0.12)' };
            case 'BOOKING':
                return { icon: Calendar, color: 'var(--macos-success)', bg: 'rgba(52, 199, 89, 0.12)' };
            case 'TRAINER':
                return { icon: User, color: 'var(--macos-purple)', bg: 'rgba(175, 82, 222, 0.12)' };
            case 'ACHIEVEMENT':
                return { icon: Trophy, color: 'var(--macos-warning)', bg: 'rgba(255, 149, 0, 0.12)' };
            case 'GYM':
                return { icon: Dumbbell, color: 'var(--macos-pink)', bg: 'rgba(255, 45, 85, 0.12)' };
            default:
                return { icon: Bell, color: 'var(--macos-text-secondary)', bg: 'var(--macos-bg-glass)' };
        }
    };

    // Group notifications by date
    const groupByDate = (notifs: Notification[]) => {
        const groups: { [key: string]: Notification[] } = {};
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        notifs.forEach(n => {
            const dateStr = new Date(n.createdAt).toDateString();
            let label = dateStr;
            if (dateStr === today) label = 'Today';
            else if (dateStr === yesterday) label = 'Yesterday';
            else label = new Date(n.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

            if (!groups[label]) groups[label] = [];
            groups[label].push(n);
        });
        return groups;
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' || !n.isRead
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const groupedNotifications = groupByDate(filteredNotifications);

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Bell size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="macos-page notifications-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="notifications__header" variants={itemVariants}>
                <div>
                    <h1 className="macos-heading-xl">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="notifications__badge">{unreadCount}</span>
                        )}
                    </h1>
                    <p className="macos-text-md">Stay updated on your gym activity</p>
                </div>
                <button className="macos-btn macos-btn--ghost">
                    <Settings size={18} />
                </button>
            </motion.header>

            {/* Filter Bar */}
            <motion.div className="notifications__toolbar" variants={itemVariants}>
                <div className="notifications__filters">
                    <button
                        className={`notifications__filter-pill ${filter === 'all' ? 'notifications__filter-pill--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`notifications__filter-pill ${filter === 'unread' ? 'notifications__filter-pill--active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                        {unreadCount > 0 && <span className="notifications__filter-count">{unreadCount}</span>}
                    </button>
                </div>
                {unreadCount > 0 && (
                    <button className="macos-btn macos-btn--secondary macos-btn--sm" onClick={markAllAsRead}>
                        <CheckCheck size={16} /> Mark all read
                    </button>
                )}
            </motion.div>

            {/* Notifications List */}
            <AnimatePresence mode="wait">
                {filteredNotifications.length === 0 ? (
                    <motion.div
                        key="empty"
                        className="glass-card glass-card--lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="macos-empty-state">
                            <div className="macos-empty-state__icon"><Bell size={28} /></div>
                            <div className="macos-empty-state__title">
                                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                            </div>
                            <div className="macos-empty-state__text">
                                {filter === 'unread' ? 'You have no unread notifications' : 'When you receive notifications, they will appear here'}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="list" className="notifications__list">
                        {Object.entries(groupedNotifications).map(([date, notifs]) => (
                            <div key={date} className="notifications__group">
                                <div className="notifications__group-label">{date}</div>
                                {notifs.map((notification, index) => {
                                    const typeInfo = getTypeInfo(notification.type);
                                    const Icon = typeInfo.icon;

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            className={`glass-card notifications__item ${!notification.isRead ? 'notifications__item--unread' : ''}`}
                                            variants={itemVariants}
                                            whileHover={{ x: 4 }}
                                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                                        >
                                            <div
                                                className="notifications__item-icon"
                                                style={{ background: typeInfo.bg, color: typeInfo.color }}
                                            >
                                                <Icon size={20} />
                                            </div>

                                            <div className="notifications__item-content">
                                                <div className="notifications__item-title">{notification.title}</div>
                                                <div className="notifications__item-message">{notification.message}</div>
                                                <div className="notifications__item-time">{formatDate(notification.createdAt)}</div>
                                            </div>

                                            <div className="notifications__item-actions">
                                                {!notification.isRead && (
                                                    <div className="notifications__unread-dot" />
                                                )}
                                                <button
                                                    className="notifications__action-btn"
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Stats */}
            <motion.div className="notifications__stats glass-card glass-card--md" variants={itemVariants}>
                <div className="notifications__stat">
                    <span className="notifications__stat-value">{notifications.length}</span>
                    <span className="notifications__stat-label">Total</span>
                </div>
                <div className="notifications__stat">
                    <span className="notifications__stat-value" style={{ color: 'var(--macos-accent)' }}>{unreadCount}</span>
                    <span className="notifications__stat-label">Unread</span>
                </div>
                <div className="notifications__stat">
                    <span className="notifications__stat-value" style={{ color: 'var(--macos-success)' }}>{notifications.length - unreadCount}</span>
                    <span className="notifications__stat-label">Read</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MemberNotifications;
