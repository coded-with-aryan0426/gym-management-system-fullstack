import React, { useEffect, useState } from 'react';
import './Trainer.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const TrainerNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/notifications/user/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.id]);

    const markAsRead = async (notificationId: number) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                );
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`/api/notifications/user/${user.id}/read-all`, {
                method: 'PUT',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'SCHEDULE':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>;
            case 'MEMBER':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
            case 'SYSTEM':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33" /></svg>;
            default:
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' || !n.isRead
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="trainer-dashboard">
                <h1 className="trainer-page-title">Notifications</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="trainer-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="trainer-page-title" style={{ marginBottom: '4px' }}>
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                marginLeft: '12px',
                                padding: '4px 10px',
                                background: 'var(--color-crimson, #DC2626)',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'white',
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: filter === 'all' ? 'var(--color-crimson, #DC2626)' : 'var(--bg-tertiary)',
                            color: filter === 'all' ? 'white' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: filter === 'unread' ? 'var(--color-crimson, #DC2626)' : 'var(--bg-tertiary)',
                            color: filter === 'unread' ? 'white' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Unread
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-primary)',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="trainer-empty-state">
                    <div className="trainer-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <h3 className="trainer-empty-state__title">No Notifications</h3>
                    <p className="trainer-empty-state__text">
                        {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You have no notifications yet.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                            style={{
                                display: 'flex',
                                gap: '16px',
                                padding: '16px 20px',
                                background: notification.isRead ? 'var(--bg-secondary)' : 'rgba(220, 38, 38, 0.05)',
                                border: `1px solid ${notification.isRead ? 'var(--border-primary)' : 'rgba(220, 38, 38, 0.2)'}`,
                                borderRadius: '12px',
                                cursor: notification.isRead ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: notification.isRead ? 'var(--bg-tertiary)' : 'rgba(220, 38, 38, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: notification.isRead ? 'var(--text-tertiary)' : 'var(--color-crimson, #DC2626)',
                                flexShrink: 0,
                            }}>
                                {getTypeIcon(notification.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: notification.isRead ? 500 : 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px',
                                }}>
                                    {notification.title}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    {notification.message}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                    {formatDate(notification.createdAt)}
                                </div>
                            </div>
                            {!notification.isRead && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--color-crimson, #DC2626)',
                                    flexShrink: 0,
                                    marginTop: '6px',
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrainerNotifications;
