import React, { useState } from 'react';
import { 
    Bell, Calendar, User, CheckCircle, AlertCircle, Info, 
    Trash2, Check, X, ChevronDown, Settings
} from 'lucide-react';
import './TrainerNotifications.css';

interface Notification {
    id: number;
    type: 'booking' | 'member' | 'system' | 'alert';
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionable?: boolean;
}

const TrainerNotifications: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, type: 'booking', title: 'New Class Booking', message: 'Sarah Wilson booked your Yoga class for tomorrow at 9:00 AM', time: '5 minutes ago', read: false, actionable: true },
        { id: 2, type: 'alert', title: 'Session Cancelled', message: 'Mike Johnson cancelled his PT session scheduled for today', time: '1 hour ago', read: false },
        { id: 3, type: 'member', title: 'New Member Assigned', message: 'Emma Davis has been assigned to you. Welcome her to the team!', time: '3 hours ago', read: false, actionable: true },
        { id: 4, type: 'system', title: 'Schedule Updated', message: 'Your weekly schedule has been updated by the admin', time: 'Yesterday', read: true },
        { id: 5, type: 'booking', title: 'PT Session Reminder', message: 'Reminder: You have a PT session with James Wilson at 2:00 PM', time: 'Yesterday', read: true },
        { id: 6, type: 'member', title: 'Progress Goal Achieved', message: 'David Lee achieved his weight loss goal! Consider updating his program.', time: '2 days ago', read: true },
    ]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Calendar size={20} />;
            case 'member': return <User size={20} />;
            case 'alert': return <AlertCircle size={20} />;
            case 'system': return <Info size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getTypeClass = (type: string) => {
        switch (type) {
            case 'booking': return 'trainer-notif__icon--booking';
            case 'member': return 'trainer-notif__icon--member';
            case 'alert': return 'trainer-notif__icon--alert';
            case 'system': return 'trainer-notif__icon--system';
            default: return '';
        }
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.read) 
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="trainer-notif">
            <div className="trainer-notif__header">
                <div className="trainer-notif__header-content">
                    <div className="trainer-notif__title-section">
                        <h1>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="trainer-notif__badge">{unreadCount} new</span>
                        )}
                    </div>
                    <div className="trainer-notif__header-actions">
                        <button className="trainer-notif__settings-btn">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="trainer-notif__content">
                <div className="trainer-notif__toolbar">
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
                            Unread ({unreadCount})
                        </button>
                    </div>
                    <button 
                        className="trainer-notif__mark-all"
                        onClick={markAllRead}
                        disabled={unreadCount === 0}
                    >
                        <CheckCircle size={14} />
                        Mark all as read
                    </button>
                </div>

                <div className="trainer-notif__list">
                    {filteredNotifications.length === 0 ? (
                        <div className="trainer-notif__empty">
                            <Bell size={48} />
                            <p>No notifications</p>
                            <span>You're all caught up!</span>
                        </div>
                    ) : (
                        filteredNotifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`trainer-notif__item ${!notif.read ? 'trainer-notif__item--unread' : ''}`}
                            >
                                <div className={`trainer-notif__icon ${getTypeClass(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="trainer-notif__info">
                                    <div className="trainer-notif__item-header">
                                        <h3>{notif.title}</h3>
                                        <span className="trainer-notif__time">{notif.time}</span>
                                    </div>
                                    <p>{notif.message}</p>
                                    {notif.actionable && !notif.read && (
                                        <div className="trainer-notif__actions">
                                            <button className="trainer-notif__action-btn trainer-notif__action-btn--primary">
                                                <Check size={14} /> Accept
                                            </button>
                                            <button className="trainer-notif__action-btn trainer-notif__action-btn--secondary">
                                                <X size={14} /> Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="trainer-notif__item-actions">
                                    {!notif.read && (
                                        <button 
                                            className="trainer-notif__btn"
                                            onClick={() => markAsRead(notif.id)}
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button 
                                        className="trainer-notif__btn trainer-notif__btn--danger"
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

export default TrainerNotifications;
