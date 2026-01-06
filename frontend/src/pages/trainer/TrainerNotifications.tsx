import React, { useState, useMemo } from 'react';
import { 
    Bell, Calendar, User, CheckCircle, AlertCircle, Info, 
    Trash2, Check, X, ChevronDown, Settings, MessageSquare,
    Dumbbell, TrendingUp, Clock, Star, Award, Target,
    AlertTriangle, DollarSign, Users, Zap, Heart, Filter,
    ChevronRight, MoreVertical, BellOff, Volume2, Archive,
    RefreshCw, ExternalLink, Eye, EyeOff, Search, Download
} from 'lucide-react';
import './TrainerNotifications.css';

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
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            type: 'booking',
            priority: 'high',
            title: 'New PT Session Booked',
            message: 'Sarah Wilson booked a Personal Training session with you.',
            time: '2 minutes ago',
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            read: false,
            starred: false,
            archived: false,
            sender: {
                name: 'Sarah Wilson',
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=DC2626&color=fff'
            },
            actions: [
                { label: 'Confirm', type: 'primary', action: 'confirm' },
                { label: 'Reschedule', type: 'secondary', action: 'reschedule' }
            ],
            meta: {
                date: 'Tomorrow',
                time: '9:00 AM - 10:00 AM',
                location: 'Training Room A'
            },
            groupId: 'today'
        },
        {
            id: 2,
            type: 'cancellation',
            priority: 'urgent',
            title: 'Session Cancelled',
            message: 'Mike Johnson has cancelled his PT session scheduled for today. Reason: Feeling unwell.',
            time: '15 minutes ago',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            read: false,
            starred: false,
            archived: false,
            sender: {
                name: 'Mike Johnson',
                avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3B82F6&color=fff'
            },
            actions: [
                { label: 'Offer Reschedule', type: 'primary', action: 'reschedule' },
                { label: 'Acknowledge', type: 'secondary', action: 'acknowledge' }
            ],
            meta: {
                date: 'Today',
                time: '2:00 PM - 3:00 PM'
            },
            groupId: 'today'
        },
        {
            id: 3,
            type: 'achievement',
            priority: 'normal',
            title: 'Member Achievement!',
            message: 'Emma Davis has reached her weight loss goal of losing 10kg! Consider updating her program.',
            time: '1 hour ago',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            read: false,
            starred: true,
            archived: false,
            sender: {
                name: 'Emma Davis',
                avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=10B981&color=fff'
            },
            actions: [
                { label: 'Send Congrats', type: 'primary', action: 'message' },
                { label: 'Update Program', type: 'secondary', action: 'program' }
            ],
            meta: {
                goal: '-10kg achieved'
            },
            groupId: 'today'
        },
        {
            id: 4,
            type: 'request',
            priority: 'high',
            title: 'Program Update Request',
            message: 'James Wilson is requesting a new workout program focused on muscle building.',
            time: '2 hours ago',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: false,
            starred: false,
            archived: false,
            sender: {
                name: 'James Wilson',
                avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=F59E0B&color=fff'
            },
            actions: [
                { label: 'Create Program', type: 'primary', action: 'create' },
                { label: 'Message', type: 'secondary', action: 'message' }
            ],
            groupId: 'today'
        },
        {
            id: 5,
            type: 'reminder',
            priority: 'normal',
            title: 'Upcoming Session',
            message: 'Reminder: You have a PT session with David Lee in 30 minutes.',
            time: '30 minutes ago',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            read: true,
            starred: false,
            archived: false,
            sender: {
                name: 'David Lee',
                avatar: 'https://ui-avatars.com/api/?name=David+Lee&background=8B5CF6&color=fff'
            },
            meta: {
                date: 'Today',
                time: '3:00 PM - 4:00 PM',
                location: 'Main Gym Floor'
            },
            link: '/trainer/schedule',
            groupId: 'today'
        },
        {
            id: 6,
            type: 'progress',
            priority: 'normal',
            title: 'Progress Check Due',
            message: 'Lisa Chen is due for her monthly progress assessment. Last check was 30 days ago.',
            time: '3 hours ago',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            read: true,
            starred: false,
            archived: false,
            sender: {
                name: 'Lisa Chen',
                avatar: 'https://ui-avatars.com/api/?name=Lisa+Chen&background=EC4899&color=fff'
            },
            actions: [
                { label: 'Schedule Check', type: 'primary', action: 'schedule' },
                { label: 'View History', type: 'secondary', action: 'history' }
            ],
            groupId: 'today'
        },
        {
            id: 7,
            type: 'message',
            priority: 'normal',
            title: 'New Message',
            message: '"Hey coach, can we discuss my diet plan after tomorrow\'s session?"',
            time: '5 hours ago',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            read: true,
            starred: false,
            archived: false,
            sender: {
                name: 'Sarah Wilson',
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=DC2626&color=fff'
            },
            actions: [
                { label: 'Reply', type: 'primary', action: 'reply' }
            ],
            link: '/trainer/messages',
            groupId: 'today'
        },
        {
            id: 8,
            type: 'schedule',
            priority: 'low',
            title: 'Schedule Updated',
            message: 'Your weekly schedule has been updated by the admin. You have 2 new class assignments.',
            time: 'Yesterday',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            read: true,
            starred: false,
            archived: false,
            actions: [
                { label: 'View Schedule', type: 'primary', action: 'view' }
            ],
            link: '/trainer/schedule',
            groupId: 'yesterday'
        },
        {
            id: 9,
            type: 'member',
            priority: 'normal',
            title: 'New Member Assigned',
            message: 'Tom Richards has been assigned to you. He\'s a beginner looking to improve overall fitness.',
            time: 'Yesterday',
            timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
            read: true,
            starred: false,
            archived: false,
            sender: {
                name: 'Tom Richards',
                avatar: 'https://ui-avatars.com/api/?name=Tom+Richards&background=6366F1&color=fff'
            },
            actions: [
                { label: 'View Profile', type: 'primary', action: 'profile' },
                { label: 'Send Welcome', type: 'secondary', action: 'welcome' }
            ],
            groupId: 'yesterday'
        },
        {
            id: 10,
            type: 'payment',
            priority: 'normal',
            title: 'Commission Credited',
            message: 'Your commission of $450 for March PT sessions has been credited to your account.',
            time: '2 days ago',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
            read: true,
            starred: true,
            archived: false,
            meta: {
                amount: '$450.00'
            },
            actions: [
                { label: 'View Details', type: 'secondary', action: 'details' }
            ],
            groupId: 'earlier'
        },
        {
            id: 11,
            type: 'system',
            priority: 'low',
            title: 'App Update Available',
            message: 'A new version of the trainer app is available with improved scheduling features.',
            time: '3 days ago',
            timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
            read: true,
            starred: false,
            archived: false,
            groupId: 'earlier'
        }
    ]);

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
            if (filter === 'starred' && !n.starred) return false;
            if (filter === 'archived' && !n.archived) return false;
            if (filter !== 'archived' && n.archived) return false;
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

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const toggleStar = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
    };

    const archiveNotification = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, archived: true, read: true } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const handleAction = (notifId: number, action: string) => {
        console.log(`Action: ${action} for notification ${notifId}`);
        markAsRead(notifId);
    };

    const toggleSelectNotification = (id: number) => {
        setSelectedNotifications(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const bulkMarkRead = () => {
        setNotifications(notifications.map(n => 
            selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        ));
        setSelectedNotifications([]);
    };

    const bulkArchive = () => {
        setNotifications(notifications.map(n => 
            selectedNotifications.includes(n.id) ? { ...n, archived: true, read: true } : n
        ));
        setSelectedNotifications([]);
    };

    const bulkDelete = () => {
        setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
        setSelectedNotifications([]);
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
                    {groupedNotifications.length === 0 ? (
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

                            <div className="trainer-notif__settings-section">
                                <h3>Delivery Methods</h3>
                                <p>How would you like to receive notifications</p>
                                <div className="trainer-notif__settings-list">
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <Volume2 size={16} />
                                            <span>Sound</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={notificationSettings.sound}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, sound: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <Bell size={16} />
                                            <span>Push Notifications</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={notificationSettings.push}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, push: e.target.checked }))}
                                        />
                                    </label>
                                    <label className="trainer-notif__setting-item">
                                        <div className="trainer-notif__setting-info">
                                            <MessageSquare size={16} />
                                            <span>Email Notifications</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={notificationSettings.email}
                                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, email: e.target.checked }))}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="trainer-notif__settings-footer">
                            <button className="trainer-notif__settings-cancel" onClick={() => setShowSettings(false)}>
                                Cancel
                            </button>
                            <button className="trainer-notif__settings-save" onClick={() => setShowSettings(false)}>
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerNotifications;
