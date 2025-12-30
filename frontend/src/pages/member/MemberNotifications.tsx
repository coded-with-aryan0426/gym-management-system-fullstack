import React, { useEffect, useState } from 'react';
import './Member.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const MemberNotifications: React.FC = () => {
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
            case 'MEMBERSHIP':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
            case 'BOOKING':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>;
            case 'TRAINER':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /></svg>;
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
            <div className="member-dashboard">
                <h1 className="member-page-title">Notifications</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="member-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="member-page-title" style={{ marginBottom: '4px' }}>
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                marginLeft: '12px',
                                padding: '4px 10px',
                                background: '#10B981',
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
                            background: filter === 'all' ? '#10B981' : 'var(--bg-tertiary)',
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
                            background: filter === 'unread' ? '#10B981' : 'var(--bg-tertiary)',
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
                <div className="member-empty-state">
                    <div className="member-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <h3 className="member-empty-state__title">No Notifications</h3>
                    <p className="member-empty-state__text">
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
                                background: notification.isRead ? 'var(--bg-secondary)' : 'rgba(16, 185, 129, 0.05)',
                                border: `1px solid ${notification.isRead ? 'var(--border-primary)' : 'rgba(16, 185, 129, 0.2)'}`,
                                borderRadius: '12px',
                                cursor: notification.isRead ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: notification.isRead ? 'var(--bg-tertiary)' : 'rgba(16, 185, 129, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: notification.isRead ? 'var(--text-tertiary)' : '#10B981',
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
                                    background: '#10B981',
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

export default MemberNotifications;
