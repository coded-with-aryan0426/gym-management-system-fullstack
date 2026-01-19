import React, { useState, useMemo, useEffect } from 'react';
import {
    Bell, Calendar, User, CheckCircle, Info,
    Trash2, X, ChevronDown, Settings, MessageSquare,
    TrendingUp, Clock, Star, Award, Target,
    AlertTriangle, DollarSign, Filter,
    Archive,
    Eye, Search
} from 'lucide-react';
import './TrainerNotifications.css';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api/notificationApi';

// UI Interfaces (mapped from API)
type NotificationType = 'booking' | 'cancellation' | 'member' | 'progress' | 'payment' |
    'reminder' | 'system' | 'achievement' | 'request' | 'message' | 'schedule';

type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

interface NotificationAction {
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: string;
}

interface Notification {
    id: number;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    time: string;
    timestamp: Date;
    read: boolean;
    starred: boolean;
    archived: boolean;
    sender?: {
        name: string;
        avatar: string;
    };
    actions?: NotificationAction[];
    meta?: {
        date?: string;
        time?: string;
        location?: string;
        amount?: string;
        goal?: string;
    };
    link?: string;
    groupId?: string;
}

interface NotificationGroup {
    id: string;
    label: string;
    notifications: Notification[];
}

const TrainerNotifications: React.FC = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch notifications
    useEffect(() => {
        if (!user?.userId) return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                // Determine API filter based on UI filter
                let apiFilter: 'all' | 'unread' | 'starred' | 'archived' = 'all';
                if (filter === 'starred') apiFilter = 'starred';
                if (filter === 'archived') apiFilter = 'archived';

                const data = await notificationApi.getUserNotifications(Number(user.userId), apiFilter);

                // Transform API data to UI model
                const mapped: Notification[] = data.map(n => {
                    let meta = {};
                    let actions: NotificationAction[] = [];
                    try {
                        if (n.metaData) meta = JSON.parse(n.metaData);
                        if (n.actionData) actions = JSON.parse(n.actionData);
                    } catch (e) {
                        console.error("Error parsing JSON", e);
                    }

                    // Calculate relative time
                    const date = new Date(n.createdAt);
                    const diff = Date.now() - date.getTime();
                    let timeString = '';
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);

                    if (minutes < 60) timeString = `${minutes} minutes ago`;
                    else if (hours < 24) timeString = `${hours} hours ago`;
                    else if (days < 2) timeString = 'Yesterday';
                    else timeString = `${days} days ago`;

                    // Determine Group ID
                    let groupId = 'earlier';
                    if (days === 0) groupId = 'today';
                    else if (days === 1) groupId = 'yesterday';

                    return {
                        id: n.id,
                        type: (n.type as NotificationType) || 'system',
                        priority: (n.priority as NotificationPriority) || 'normal',
                        title: n.title,
                        message: n.message,
                        time: timeString,
                        timestamp: date,
                        read: n.isRead,
                        starred: n.isStarred,
                        archived: n.isArchived,
                        sender: n.senderId ? {
                            name: `User ${n.senderId}`, // Placeholder until we have user lookup
                            avatar: `https://ui-avatars.com/api/?name=User+${n.senderId}&background=random`
                        } : undefined,
                        actions: actions,
                        meta: meta,
                        link: n.link,
                        groupId: groupId
                    };
                });

                setNotifications(mapped);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.userId, filter]); // Refetch when main filter category changes

    const [notificationSettings, setNotificationSettings] = useState({
        bookings: true,
        cancellations: true,
        messages: true,
        achievements: true,
        reminders: true,
        system: false,
        payments: true,
        sound: true,
        email: true,
        push: true
    });

    const getIcon = (type: NotificationType) => {
        const icons: Record<NotificationType, React.ReactNode> = {
            booking: <Calendar size={18} />,
            cancellation: <X size={18} />,
            member: <User size={18} />,
            progress: <TrendingUp size={18} />,
            payment: <DollarSign size={18} />,
            reminder: <Clock size={18} />,
            system: <Info size={18} />,
            achievement: <Award size={18} />,
            request: <Target size={18} />,
            message: <MessageSquare size={18} />,
            schedule: <Calendar size={18} />
        };
        return icons[type] || <Bell size={18} />;
    };

    const getTypeClass = (type: NotificationType) => {
        const classes: Record<NotificationType, string> = {
            booking: 'trainer-notif__icon--booking',
            cancellation: 'trainer-notif__icon--cancellation',
            member: 'trainer-notif__icon--member',
            progress: 'trainer-notif__icon--progress',
            payment: 'trainer-notif__icon--payment',
            reminder: 'trainer-notif__icon--reminder',
            system: 'trainer-notif__icon--system',
            achievement: 'trainer-notif__icon--achievement',
            request: 'trainer-notif__icon--request',
            message: 'trainer-notif__icon--message',
            schedule: 'trainer-notif__icon--schedule'
        };
        return classes[type] || '';
    };

    const getPriorityClass = (priority: NotificationPriority) => {
        return `trainer-notif__priority--${priority}`;
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (filter === 'unread' && n.read) return false;
            // API handles starred/archived fetching, but we might double check or handle 'all' view filtering
            if (filter === 'all' && n.archived) return false; // Hide archived in All view

            if (typeFilter !== 'all' && n.type !== typeFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return n.title.toLowerCase().includes(query) ||
                    n.message.toLowerCase().includes(query) ||
                    n.sender?.name.toLowerCase().includes(query);
            }
            return true;
        });
    }, [notifications, filter, typeFilter, searchQuery]);

    const groupedNotifications = useMemo(() => {
        const groups: NotificationGroup[] = [
            { id: 'today', label: 'Today', notifications: [] },
            { id: 'yesterday', label: 'Yesterday', notifications: [] },
            { id: 'earlier', label: 'Earlier', notifications: [] }
        ];

        filteredNotifications.forEach(n => {
            const group = groups.find(g => g.id === n.groupId);
            if (group) {
                group.notifications.push(n);
            } else {
                groups[2].notifications.push(n); // Default to earlier
            }
        });

        return groups.filter(g => g.notifications.length > 0);
    }, [filteredNotifications]);

    const stats = useMemo(() => ({
        total: notifications.filter(n => !n.archived).length,
        unread: notifications.filter(n => !n.read && !n.archived).length,
        urgent: notifications.filter(n => n.priority === 'urgent' && !n.read && !n.archived).length,
        starred: notifications.filter(n => n.starred && !n.archived).length
    }), [notifications]);

    const markAllRead = async () => {
        if (!user?.userId) return;
        try {
            await notificationApi.markAllAsRead(Number(user.userId));
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const toggleStar = async (id: number) => {
        try {
            await notificationApi.toggleStar(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
        } catch (error) {
            console.error("Failed to toggle star", error);
        }
    };

    const archiveNotification = async (id: number) => {
        try {
            await notificationApi.archive(id);
            if (filter !== 'archived') {
                setNotifications(notifications.filter(n => n.id !== id));
            } else {
                setNotifications(notifications.map(n => n.id === id ? { ...n, archived: true, read: true } : n));
            }
        } catch (error) {
            console.error("Failed to archive", error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await notificationApi.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleAction = (notifId: number, action: string) => {
        console.log(`Action: ${action} for notification ${notifId}`);
        // Here we would implement specific action logic (e.g. navigation, modal opening)
        // For now, we assume actions imply handling, so we mark as read
        markAsRead(notifId);
    };

    const toggleSelectNotification = (id: number) => {
        setSelectedNotifications(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const bulkMarkRead = async () => {
        try {
            await notificationApi.bulkAction('read', selectedNotifications);
            setNotifications(notifications.map(n =>
                selectedNotifications.includes(n.id) ? { ...n, read: true } : n
            ));
            setSelectedNotifications([]);
        } catch (error) {
            console.error("Failed bulk read", error);
        }
    };

    const bulkArchive = async () => {
        try {
            await notificationApi.bulkAction('archive', selectedNotifications);
            if (filter !== 'archived') {
                setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
            } else {
                setNotifications(notifications.map(n =>
                    selectedNotifications.includes(n.id) ? { ...n, archived: true, read: true } : n
                ));
            }
            setSelectedNotifications([]);
        } catch (error) {
            console.error("Failed bulk archive", error);
        }
    };

    const bulkDelete = async () => {
        try {
            await notificationApi.bulkAction('delete', selectedNotifications);
            setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
            setSelectedNotifications([]);
        } catch (error) {
            console.error("Failed bulk delete", error);
        }
    };

    const notificationTypes: { value: NotificationType | 'all'; label: string }[] = [
        { value: 'all', label: 'All Types' },
        { value: 'booking', label: 'Bookings' },
        { value: 'cancellation', label: 'Cancellations' },
        { value: 'message', label: 'Messages' },
        { value: 'achievement', label: 'Achievements' },
        { value: 'request', label: 'Requests' },
        { value: 'progress', label: 'Progress' },
        { value: 'reminder', label: 'Reminders' },
        { value: 'payment', label: 'Payments' },
        { value: 'system', label: 'System' }
    ];

    return (
        <div className="trainer-notif">
            <div className="trainer-notif__header">
                <div className="trainer-notif__header-content">
                    <div className="trainer-notif__title-section">
                        <h1>Notifications</h1>
                        {stats.unread > 0 && (
                            <span className="trainer-notif__badge">{stats.unread} new</span>
                        )}
                        {stats.urgent > 0 && (
                            <span className="trainer-notif__badge trainer-notif__badge--urgent">
                                <AlertTriangle size={12} /> {stats.urgent} urgent
                            </span>
                        )}
                    </div>

                    <div className="trainer-notif__header-stats">
                        <div className="trainer-notif__header-stat">
                            <span className="trainer-notif__header-stat-value">{stats.total}</span>
                            <span className="trainer-notif__header-stat-label">Total</span>
                        </div>
                        <div className="trainer-notif__header-stat">
                            <span className="trainer-notif__header-stat-value">{stats.unread}</span>
                            <span className="trainer-notif__header-stat-label">Unread</span>
                        </div>
                        <div className="trainer-notif__header-stat">
                            <span className="trainer-notif__header-stat-value">{stats.starred}</span>
                            <span className="trainer-notif__header-stat-label">Starred</span>
                        </div>
                    </div>

                    <div className="trainer-notif__header-actions">
                        <button
                            className="trainer-notif__settings-btn"
                            onClick={() => setShowSettings(!showSettings)}
                            title="Notification Settings"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="trainer-notif__content">
                <div className="trainer-notif__toolbar">
                    <div className="trainer-notif__toolbar-left">
                        <div className="trainer-notif__search">
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="trainer-notif__filter-toggle">
                            <button
                                className={filter === 'all' ? 'active' : ''}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={filter === 'unread' ? 'active' : ''}
                                onClick={() => setFilter('unread')}
                            >
                                Unread
                                {stats.unread > 0 && <span>{stats.unread}</span>}
                            </button>
                            <button
                                className={filter === 'starred' ? 'active' : ''}
                                onClick={() => setFilter('starred')}
                            >
                                <Star size={12} />
                            </button>
                            <button
                                className={filter === 'archived' ? 'active' : ''}
                                onClick={() => setFilter('archived')}
                            >
                                <Archive size={12} />
                            </button>
                        </div>

                        <div className="trainer-notif__type-filter">
                            <Filter size={12} />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
                            >
                                {notificationTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} />
                        </div>
                    </div>

                    <div className="trainer-notif__toolbar-right">
                        {selectedNotifications.length > 0 ? (
                            <div className="trainer-notif__bulk-actions">
                                <span>{selectedNotifications.length} selected</span>
                                <button onClick={bulkMarkRead} title="Mark as read">
                                    <Eye size={14} />
                                </button>
                                <button onClick={bulkArchive} title="Archive">
                                    <Archive size={14} />
                                </button>
                                <button onClick={bulkDelete} className="danger" title="Delete">
                                    <Trash2 size={14} />
                                </button>
                                <button onClick={() => setSelectedNotifications([])} title="Clear selection">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                className="trainer-notif__mark-all"
                                onClick={markAllRead}
                                disabled={stats.unread === 0}
                            >
                                <CheckCircle size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div className="trainer-notif__list">
                    {loading ? (
                        <div className="trainer-notif__empty">
                            <p>Loading notifications...</p>
                        </div>
                    ) : groupedNotifications.length === 0 ? (
                        <div className="trainer-notif__empty">
                            <Bell size={48} />
                            <p>No notifications</p>
                            <span>
                                {filter === 'unread' ? 'You\'re all caught up!' :
                                    filter === 'starred' ? 'No starred notifications' :
                                        filter === 'archived' ? 'No archived notifications' :
                                            'No notifications to show'}
                            </span>
                        </div>
                    ) : (
                        groupedNotifications.map(group => (
                            <div key={group.id} className="trainer-notif__group">
                                <h3 className="trainer-notif__group-label">{group.label}</h3>
                                {group.notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`trainer-notif__item ${!notif.read ? 'trainer-notif__item--unread' : ''} ${notif.starred ? 'trainer-notif__item--starred' : ''} ${selectedNotifications.includes(notif.id) ? 'trainer-notif__item--selected' : ''} ${getPriorityClass(notif.priority)}`}
                                    >
                                        <div className="trainer-notif__checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notif.id)}
                                                onChange={() => toggleSelectNotification(notif.id)}
                                            />
                                        </div>

                                        {notif.sender ? (
                                            <div className="trainer-notif__avatar">
                                                <img src={notif.sender.avatar} alt={notif.sender.name} />
                                                <div className={`trainer-notif__type-badge ${getTypeClass(notif.type)}`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`trainer-notif__icon ${getTypeClass(notif.type)}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                        )}

                                        <div className="trainer-notif__info" onClick={() => markAsRead(notif.id)}>
                                            <div className="trainer-notif__item-header">
                                                <div className="trainer-notif__title-row">
                                                    <h4>{notif.title}</h4>
                                                    {notif.priority === 'urgent' && (
                                                        <span className="trainer-notif__urgent-tag">
                                                            <AlertTriangle size={10} /> Urgent
                                                        </span>
                                                    )}
                                                    {notif.priority === 'high' && (
                                                        <span className="trainer-notif__high-tag">High Priority</span>
                                                    )}
                                                </div>
                                                <span className="trainer-notif__time">{notif.time}</span>
                                            </div>
                                            <p className="trainer-notif__message">{notif.message}</p>

                                            {notif.meta && (
                                                <div className="trainer-notif__meta">
                                                    {notif.meta.date && (
                                                        <span><Calendar size={11} /> {notif.meta.date}</span>
                                                    )}
                                                    {notif.meta.time && (
                                                        <span><Clock size={11} /> {notif.meta.time}</span>
                                                    )}
                                                    {notif.meta.location && (
                                                        <span><Target size={11} /> {notif.meta.location}</span>
                                                    )}
                                                    {notif.meta.amount && (
                                                        <span className="trainer-notif__amount">
                                                            <DollarSign size={11} /> {notif.meta.amount}
                                                        </span>
                                                    )}
                                                    {notif.meta.goal && (
                                                        <span className="trainer-notif__goal">
                                                            <Award size={11} /> {notif.meta.goal}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {notif.actions && notif.actions.length > 0 && (
                                                <div className="trainer-notif__actions">
                                                    {notif.actions.map((action, i) => (
                                                        <button
                                                            key={i}
                                                            className={`trainer-notif__action-btn trainer-notif__action-btn--${action.type}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAction(notif.id, action.action);
                                                            }}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="trainer-notif__item-actions">
                                            <button
                                                className={`trainer-notif__star-btn ${notif.starred ? 'active' : ''}`}
                                                onClick={() => toggleStar(notif.id)}
                                                title={notif.starred ? 'Unstar' : 'Star'}
                                            >
                                                <Star size={14} fill={notif.starred ? 'currentColor' : 'none'} />
                                            </button>
                                            {!notif.read && (
                                                <button
                                                    className="trainer-notif__btn"
                                                    onClick={() => markAsRead(notif.id)}
                                                    title="Mark as read"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            <button
                                                className="trainer-notif__btn"
                                                onClick={() => archiveNotification(notif.id)}
                                                title="Archive"
                                            >
                                                <Archive size={14} />
                                            </button>
                                            <button
                                                className="trainer-notif__btn trainer-notif__btn--danger"
                                                onClick={() => deleteNotification(notif.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {filteredNotifications.length > 10 && (
                    <button className="trainer-notif__load-more">
                        Load More Notifications
                    </button>
                )}
            </div>

            {showSettings && (
                <div className="trainer-notif__settings-modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="trainer-notif__settings-modal" onClick={e => e.stopPropagation()}>
                        <div className="trainer-notif__settings-header">
                            <h2>Notification Settings</h2>
                            <button onClick={() => setShowSettings(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="trainer-notif__settings-body">
                            <div className="trainer-notif__settings-section">
                                <h3>Notification Types</h3>
                                <p>Choose which notifications you want to receive</p>
                                <div className="trainer-notif__settings-list">
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <Calendar size={16} />
                                            <span>Session Bookings</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.bookings}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, bookings: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <X size={16} />
                                            <span>Cancellations</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.cancellations}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, cancellations: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <MessageSquare size={16} />
                                            <span>Messages</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.messages}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, messages: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <Award size={16} />
                                            <span>Member Achievements</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.achievements}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, achievements: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <Clock size={16} />
                                            <span>Reminders</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.reminders}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, reminders: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <DollarSign size={16} />
                                            <span>Payments & Commission</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.payments}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, payments: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <Info size={16} />
                                            <span>System Updates</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.system}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, system: e.target.checked }))}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="trainer-notif__settings-footer">
                            <button className="trainer-notif__save-btn" onClick={() => setShowSettings(false)}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerNotifications;
