import React, { useState, useMemo } from 'react';
import {
    Bell, Users, DollarSign, AlertTriangle, Calendar,
    Package, Settings, FileText, Search, CheckCircle,
    Star, Trash2, Archive, Eye, Clock, TrendingUp,
    UserPlus, CreditCard, AlertCircle, Dumbbell
} from 'lucide-react';
import './OwnerNotifications.css';

// Notification Types for Owner
type NotificationType =
    | 'payment'
    | 'alert'
    | 'member'
    | 'trainer'
    | 'schedule'
    | 'inventory'
    | 'system'
    | 'report';

type NotificationPriority = 'urgent' | 'high' | 'normal';

interface Notification {
    id: number;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    time: string;
    read: boolean;
    starred: boolean;
    meta?: {
        amount?: string;
        memberName?: string;
        trainerName?: string;
    };
}

// Mock data for owner notifications
const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'payment',
        priority: 'urgent',
        title: 'Daily Revenue Milestone',
        message: 'Today\'s revenue has crossed ₹50,000! You\'re up 23% from last week.',
        time: '5 min ago',
        read: false,
        starred: true,
        meta: { amount: '₹52,450' }
    },
    {
        id: 2,
        type: 'alert',
        priority: 'urgent',
        title: 'Low Stock Alert',
        message: 'Protein powder inventory is below minimum threshold. Only 3 units remaining.',
        time: '12 min ago',
        read: false,
        starred: false
    },
    {
        id: 3,
        type: 'member',
        priority: 'high',
        title: '5 New Member Signups',
        message: 'Five new members joined today. Welcome them with onboarding emails.',
        time: '1 hour ago',
        read: false,
        starred: false,
        meta: { memberName: 'Priya, Rahul, Amit +2' }
    },
    {
        id: 4,
        type: 'trainer',
        priority: 'normal',
        title: 'Trainer Leave Request',
        message: 'Vikram Singh requested leave from Jan 25-27. 8 sessions need rescheduling.',
        time: '2 hours ago',
        read: true,
        starred: false,
        meta: { trainerName: 'Vikram Singh' }
    },
    {
        id: 5,
        type: 'schedule',
        priority: 'high',
        title: 'Class Overbooked',
        message: 'Morning Yoga class has 32 registrations but only 25 slots. Action needed.',
        time: '3 hours ago',
        read: false,
        starred: true
    },
    {
        id: 6,
        type: 'payment',
        priority: 'normal',
        title: '12 Pending Renewals',
        message: 'Members with subscriptions expiring this week. Send renewal reminders.',
        time: '4 hours ago',
        read: true,
        starred: false,
        meta: { amount: '₹84,000 potential' }
    },
    {
        id: 7,
        type: 'report',
        priority: 'normal',
        title: 'Weekly Report Ready',
        message: 'Your weekly performance report is ready. Revenue up 15%, attendance up 8%.',
        time: 'Yesterday',
        read: true,
        starred: false
    },
    {
        id: 8,
        type: 'inventory',
        priority: 'normal',
        title: 'Equipment Maintenance Due',
        message: '3 treadmills are due for monthly maintenance this week.',
        time: 'Yesterday',
        read: true,
        starred: false
    },
    {
        id: 9,
        type: 'system',
        priority: 'normal',
        title: 'System Update Complete',
        message: 'The payment gateway has been updated. All transactions are secure.',
        time: '2 days ago',
        read: true,
        starred: false
    }
];

const OwnerNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Get icon for notification type
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'payment': return <DollarSign size={22} />;
            case 'alert': return <AlertTriangle size={22} />;
            case 'member': return <Users size={22} />;
            case 'trainer': return <Dumbbell size={22} />;
            case 'schedule': return <Calendar size={22} />;
            case 'inventory': return <Package size={22} />;
            case 'system': return <Settings size={22} />;
            case 'report': return <FileText size={22} />;
            default: return <Bell size={22} />;
        }
    };

    // Filter notifications
    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (filter === 'unread' && n.read) return false;
            if (filter === 'starred' && !n.starred) return false;
            if (typeFilter !== 'all' && n.type !== typeFilter) return false;
            if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [notifications, filter, typeFilter, searchQuery]);

    // Counts
    const unreadCount = notifications.filter(n => !n.read).length;
    const starredCount = notifications.filter(n => n.starred).length;
    const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

    // Actions
    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const toggleStar = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="owner-notif">
            {/* Header */}
            <div className="owner-notif__header">
                <div className="owner-notif__header-content">
                    <div className="owner-notif__title-section">
                        <h1>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className={`owner-notif__badge ${urgentCount > 0 ? 'owner-notif__badge--urgent' : ''}`}>
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <div className="owner-notif__header-stats">
                        <div className="owner-notif__header-stat">
                            <span className="owner-notif__header-stat-value">{unreadCount}</span>
                            <span className="owner-notif__header-stat-label">Unread</span>
                        </div>
                        <div className="owner-notif__header-stat">
                            <span className="owner-notif__header-stat-value">{urgentCount}</span>
                            <span className="owner-notif__header-stat-label">Urgent</span>
                        </div>
                        <div className="owner-notif__header-stat">
                            <span className="owner-notif__header-stat-value">{starredCount}</span>
                            <span className="owner-notif__header-stat-label">Starred</span>
                        </div>
                    </div>

                    <div className="owner-notif__header-actions">
                        <button className="owner-notif__action-btn">
                            <Settings size={16} />
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="owner-notif__content">
                {/* Toolbar */}
                <div className="owner-notif__toolbar">
                    <div className="owner-notif__toolbar-left">
                        <div className="owner-notif__search">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="owner-notif__filter-tabs">
                            <button
                                className={`owner-notif__filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`owner-notif__filter-tab ${filter === 'unread' ? 'active' : ''}`}
                                onClick={() => setFilter('unread')}
                            >
                                Unread
                                {unreadCount > 0 && <span className="count">{unreadCount}</span>}
                            </button>
                            <button
                                className={`owner-notif__filter-tab ${filter === 'starred' ? 'active' : ''}`}
                                onClick={() => setFilter('starred')}
                            >
                                Starred
                            </button>
                        </div>

                        <select
                            className="owner-notif__type-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="payment">💰 Revenue</option>
                            <option value="alert">⚠️ Alerts</option>
                            <option value="member">👥 Members</option>
                            <option value="trainer">🏋️ Trainers</option>
                            <option value="schedule">📅 Schedule</option>
                            <option value="inventory">📦 Inventory</option>
                            <option value="report">📊 Reports</option>
                            <option value="system">⚙️ System</option>
                        </select>
                    </div>

                    <div className="owner-notif__toolbar-right">
                        <button
                            className="owner-notif__mark-all"
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                        >
                            <CheckCircle size={16} />
                            Mark all read
                        </button>
                    </div>
                </div>

                {/* Notification List */}
                <div className="owner-notif__list">
                    {filteredNotifications.length === 0 ? (
                        <div className="owner-notif__empty">
                            <Bell size={48} />
                            <p>No notifications</p>
                            <span>You're all caught up!</span>
                        </div>
                    ) : (
                        filteredNotifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`owner-notif__item ${!notif.read ? 'owner-notif__item--unread' : ''} ${notif.starred ? 'owner-notif__item--starred' : ''}`}
                                onClick={() => markAsRead(notif.id)}
                            >
                                <div className={`owner-notif__icon owner-notif__icon--${notif.type}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="owner-notif__info">
                                    <div className="owner-notif__item-header">
                                        <div className="owner-notif__title-row">
                                            <h4>{notif.title}</h4>
                                            {notif.priority === 'urgent' && (
                                                <span className="owner-notif__urgent-tag">
                                                    <AlertCircle size={10} /> Urgent
                                                </span>
                                            )}
                                        </div>
                                        <span className="owner-notif__time">{notif.time}</span>
                                    </div>

                                    <p className="owner-notif__message">{notif.message}</p>

                                    {notif.meta && (
                                        <div className="owner-notif__meta">
                                            {notif.meta.amount && (
                                                <span className="amount">
                                                    <DollarSign size={12} /> {notif.meta.amount}
                                                </span>
                                            )}
                                            {notif.meta.memberName && (
                                                <span>
                                                    <Users size={12} /> {notif.meta.memberName}
                                                </span>
                                            )}
                                            {notif.meta.trainerName && (
                                                <span>
                                                    <Dumbbell size={12} /> {notif.meta.trainerName}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="owner-notif__item-actions" onClick={e => e.stopPropagation()}>
                                    <button
                                        className={`owner-notif__btn owner-notif__btn--star ${notif.starred ? 'active' : ''}`}
                                        onClick={() => toggleStar(notif.id)}
                                        title={notif.starred ? 'Unstar' : 'Star'}
                                    >
                                        <Star size={16} fill={notif.starred ? '#F59E0B' : 'none'} />
                                    </button>
                                    <button
                                        className="owner-notif__btn owner-notif__btn--danger"
                                        onClick={() => deleteNotification(notif.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerNotifications;
