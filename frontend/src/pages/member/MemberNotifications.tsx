import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CreditCard, Calendar, User, Dumbbell, Trophy,
    Check, CheckCheck, Trash2, Settings, Filter, ChevronRight,
    Gift, Clock, AlertTriangle, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './MemberNotifications.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    action?: { label: string; path: string };
}

type FilterType = 'all' | 'unread' | 'membership' | 'booking' | 'achievement';

const MemberNotifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, title: 'Class Reminder', message: 'Your Yoga class starts in 1 hour. Room A at 9:00 AM.', type: 'BOOKING', isRead: false, createdAt: new Date().toISOString(), action: { label: 'View Class', path: '/member/bookings' } },
        { id: 2, title: 'Payment Successful', message: 'Your monthly membership payment of ₹2,999 was processed successfully.', type: 'MEMBERSHIP', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), action: { label: 'View Receipt', path: '/member/membership' } },
        { id: 3, title: 'New Achievement!', message: 'Congratulations! You unlocked the "7 Day Streak" badge.', type: 'ACHIEVEMENT', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 4, title: 'Trainer Feedback', message: 'John Smith left feedback on your progress: "Great improvement on form!"', type: 'TRAINER', isRead: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), action: { label: 'View Progress', path: '/member/progress' } },
        { id: 5, title: 'Membership Expiring', message: 'Your Premium plan expires in 7 days. Renew now to keep your benefits.', type: 'MEMBERSHIP', isRead: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), action: { label: 'Renew Now', path: '/member/membership' } },
        { id: 6, title: 'Class Cancelled', message: 'HIIT Training on Jan 5 has been cancelled. Your slot has been freed.', type: 'BOOKING', isRead: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 7, title: 'Special Offer!', message: 'Get 20% off on PT sessions this week. Limited time offer!', type: 'PROMO', isRead: true, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
        { id: 8, title: 'Workout Streak', message: 'You\'re on a 5-day workout streak! Keep going!', type: 'ACHIEVEMENT', isRead: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    ]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [showFilters, setShowFilters] = useState(false);

    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All marked as read');
    };

    const deleteNotification = (notificationId: number) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('Notification deleted');
    };

    const clearAll = () => {
        setNotifications([]);
        toast.success('All notifications cleared');
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
                return { icon: CreditCard, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.12)', gradient: 'linear-gradient(135deg, #007AFF, #0055FF)' };
            case 'BOOKING':
                return { icon: Calendar, color: '#34C759', bg: 'rgba(52, 199, 89, 0.12)', gradient: 'linear-gradient(135deg, #34C759, #28A745)' };
            case 'TRAINER':
                return { icon: User, color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.12)', gradient: 'linear-gradient(135deg, #AF52DE, #9B30FF)' };
            case 'ACHIEVEMENT':
                return { icon: Trophy, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.12)', gradient: 'linear-gradient(135deg, #FF9500, #FF7700)' };
            case 'PROMO':
                return { icon: Gift, color: '#FF2D55', bg: 'rgba(255, 45, 85, 0.12)', gradient: 'linear-gradient(135deg, #FF2D55, #FF1744)' };
            case 'GYM':
                return { icon: Dumbbell, color: '#5856D6', bg: 'rgba(88, 86, 214, 0.12)', gradient: 'linear-gradient(135deg, #5856D6, #4A47CC)' };
            case 'URGENT':
                return { icon: AlertTriangle, color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.12)', gradient: 'linear-gradient(135deg, #FF3B30, #FF1744)' };
            default:
                return { icon: Bell, color: '#8E8E93', bg: 'rgba(142, 142, 147, 0.12)', gradient: 'linear-gradient(135deg, #8E8E93, #636366)' };
        }
    };

    const groupByDate = (notifs: Notification[]) => {
        const groups: { [key: string]: Notification[] } = {};
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        notifs.forEach(n => {
            const dateStr = new Date(n.createdAt).toDateString();
            let label = dateStr;
            if (dateStr === today) label = 'Today';
            else if (dateStr === yesterday) label = 'Yesterday';
            else label = new Date(n.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            if (!groups[label]) groups[label] = [];
            groups[label].push(n);
        });
        return groups;
    };

    const filterOptions: { id: FilterType; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: <Bell size={14} /> },
        { id: 'unread', label: 'Unread', icon: <Zap size={14} /> },
        { id: 'membership', label: 'Membership', icon: <CreditCard size={14} /> },
        { id: 'booking', label: 'Bookings', icon: <Calendar size={14} /> },
        { id: 'achievement', label: 'Achievements', icon: <Trophy size={14} /> },
    ];

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        if (filter === 'membership') return n.type === 'MEMBERSHIP';
        if (filter === 'booking') return n.type === 'BOOKING';
        if (filter === 'achievement') return n.type === 'ACHIEVEMENT';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const groupedNotifications = groupByDate(filteredNotifications);

    return (
        <div className="mn-page">
            <div className="mn-header">
                <div className="mn-header__left">
                    <h1 className="mn-header__title">
                        Notifications
                        {unreadCount > 0 && <span className="mn-header__badge">{unreadCount}</span>}
                    </h1>
                    <p className="mn-header__subtitle">Stay updated with your gym activity</p>
                </div>
                <div className="mn-header__actions">
                    <button className="mn-icon-btn" onClick={() => navigate('/member/settings')} title="Settings">
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            <div className="mn-toolbar">
                <div className="mn-filters">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.id}
                            className={`mn-filter-btn ${filter === opt.id ? 'mn-filter-btn--active' : ''}`}
                            onClick={() => setFilter(opt.id)}
                        >
                            {opt.icon}
                            <span>{opt.label}</span>
                            {opt.id === 'unread' && unreadCount > 0 && (
                                <span className="mn-filter-btn__count">{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="mn-toolbar__actions">
                    {unreadCount > 0 && (
                        <button className="mn-action-btn" onClick={markAllAsRead}>
                            <CheckCheck size={16} />
                            <span>Mark all read</span>
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button className="mn-action-btn mn-action-btn--danger" onClick={clearAll}>
                            <Trash2 size={16} />
                            <span>Clear all</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="mn-content">
                <AnimatePresence mode="wait">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="mn-empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="mn-empty__icon">
                                <Bell size={32} />
                            </div>
                            <h3 className="mn-empty__title">
                                {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                            </h3>
                            <p className="mn-empty__text">
                                {filter === 'unread'
                                    ? 'You have read all your notifications'
                                    : 'Notifications will appear here'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="list" className="mn-list">
                            {Object.entries(groupedNotifications).map(([date, notifs]) => (
                                <div key={date} className="mn-group">
                                    <div className="mn-group__header">
                                        <Clock size={12} />
                                        <span>{date}</span>
                                    </div>
                                    <div className="mn-group__items">
                                        {notifs.map((notification) => {
                                            const typeInfo = getTypeInfo(notification.type);
                                            const Icon = typeInfo.icon;

                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    className={`mn-item ${!notification.isRead ? 'mn-item--unread' : ''}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    whileHover={{ x: 4 }}
                                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                                >
                                                    <div className="mn-item__indicator" style={{ background: typeInfo.gradient }} />
                                                    
                                                    <div className="mn-item__icon" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                                                        <Icon size={18} />
                                                    </div>

                                                    <div className="mn-item__content">
                                                        <div className="mn-item__header">
                                                            <span className="mn-item__title">{notification.title}</span>
                                                            <span className="mn-item__time">{formatDate(notification.createdAt)}</span>
                                                        </div>
                                                        <p className="mn-item__message">{notification.message}</p>
                                                        {notification.action && (
                                                            <button
                                                                className="mn-item__action"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(notification.action!.path);
                                                                }}
                                                                style={{ color: typeInfo.color }}
                                                            >
                                                                {notification.action.label}
                                                                <ChevronRight size={14} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="mn-item__actions">
                                                        {!notification.isRead && <div className="mn-item__dot" />}
                                                        <button
                                                            className="mn-item__delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mn-stats">
                <div className="mn-stat">
                    <span className="mn-stat__value">{notifications.length}</span>
                    <span className="mn-stat__label">Total</span>
                </div>
                <div className="mn-stat">
                    <span className="mn-stat__value" style={{ color: '#007AFF' }}>{unreadCount}</span>
                    <span className="mn-stat__label">Unread</span>
                </div>
                <div className="mn-stat">
                    <span className="mn-stat__value" style={{ color: '#34C759' }}>{notifications.length - unreadCount}</span>
                    <span className="mn-stat__label">Read</span>
                </div>
            </div>
        </div>
    );
};

export default MemberNotifications;
