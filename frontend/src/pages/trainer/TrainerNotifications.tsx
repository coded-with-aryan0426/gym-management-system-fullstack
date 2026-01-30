import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Calendar, User, CheckCheck, Info,
    Trash2, X, Settings, MessageSquare,
    TrendingUp, Clock, Star, Award, Target,
    AlertTriangle, DollarSign, Filter,
    Archive, Search, ArrowRight, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './TrainerNotifications.css';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api/notificationApi';

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
    link?: string;
    groupId?: string;
}

const TrainerNotifications: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user?.userId) return;
        try {
            const data = await notificationApi.getUserNotifications(Number(user.userId), filter);
            const mapped: Notification[] = data.map(n => ({
                id: n.id,
                type: (n.type as NotificationType) || 'system',
                priority: (n.priority as NotificationPriority) || 'normal',
                title: n.title,
                message: n.message,
                time: formatDate(n.createdAt),
                timestamp: new Date(n.createdAt),
                read: n.isRead,
                starred: n.isStarred,
                archived: n.isArchived,
                link: n.link,
                groupId: getGroupId(n.createdAt)
            }));
            setNotifications(mapped);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.userId, filter]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const getGroupId = (dateStr: string) => {
        const date = new Date(dateStr).toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (date === today) return 'Today';
        if (date === yesterday) return 'Yesterday';
        return 'Earlier';
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'booking':
            case 'schedule': return Calendar;
            case 'cancellation': return X;
            case 'member': return User;
            case 'progress': return TrendingUp;
            case 'payment': return DollarSign;
            case 'reminder': return Clock;
            case 'achievement': return Award;
            case 'request': return Target;
            case 'message': return MessageSquare;
            default: return Bell;
        }
    };

    const getTypeColor = (type: NotificationType, priority: string) => {
        if (priority === 'urgent' || priority === 'high') return { color: "#FF3B30", bg: "rgba(255, 59, 48, 0.12)" };
        switch (type) {
            case 'booking':
            case 'schedule': return { color: "#007AFF", bg: "rgba(0, 122, 255, 0.12)" };
            case 'payment': return { color: "#34C759", bg: "rgba(52, 199, 89, 0.12)" };
            case 'achievement': return { color: "#FF9500", bg: "rgba(255, 149, 0, 0.12)" };
            case 'message': return { color: "#AF52DE", bg: "rgba(175, 82, 222, 0.12)" };
            default: return { color: "#8E8E93", bg: "rgba(142, 142, 147, 0.12)" };
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const toggleStar = async (id: number) => {
        try {
            await notificationApi.toggleStar(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const archiveNotification = async (id: number) => {
        try {
            await notificationApi.archive(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Archived");
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await notificationApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Deleted");
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const markAllRead = async () => {
        if (!user?.userId) return;
        try {
            await notificationApi.markAllAsRead(Number(user.userId));
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const filteredAndSearched = useMemo(() => {
        return notifications
            .filter(n => {
                const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     n.message.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;
                if (typeFilter !== 'all' && n.type !== typeFilter) return false;
                return true;
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [notifications, searchQuery, typeFilter]);

    const groupedNotifications = useMemo(() => {
        const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], Earlier: [] };
        filteredAndSearched.forEach(n => {
            if (n.groupId && groups[n.groupId]) groups[n.groupId].push(n);
            else groups.Earlier.push(n);
        });
        return groups;
    }, [filteredAndSearched]);

    const stats = useMemo(() => ({
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        starred: notifications.filter(n => n.starred).length
    }), [notifications]);

    return (
        <div className="tn-page">
            <header className="tn-header">
                <div className="tn-header__left">
                    <div className="tn-header__title-group">
                        <div className="tn-header__title-wrapper">
                            <h1 className="tn-header__title">Notifications</h1>
                            {stats.unread > 0 && <span className="tn-unread-pill">{stats.unread}</span>}
                        </div>
                        
                        <div className="tn-header-stats">
                            <div className="tn-h-stat">
                                <span className="value">{stats.total}</span>
                                <span className="label">Total</span>
                            </div>
                            <div className="tn-h-stat">
                                <span className="value">{stats.unread}</span>
                                <span className="label">Unread</span>
                            </div>
                            <div className="tn-h-stat">
                                <span className="value">{stats.starred}</span>
                                <span className="label">Starred</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="tn-header__actions">
                    <div className="tn-search-bar">
                        <Search size={14} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="tn-action-btn tn-action-btn--primary" onClick={markAllRead}>
                        <CheckCheck size={16} />
                        <span>Mark all read</span>
                    </button>
                    <button className="tn-icon-btn" onClick={() => navigate("/trainer/settings")}>
                        <Settings size={16} />
                    </button>
                </div>
            </header>

            <div className="tn-layout">
                <aside className="tn-sidebar">
                    <nav className="tn-nav">
                        <button 
                            className={`tn-nav-item ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            <Inbox size={16} />
                            <span>Inbox</span>
                            {stats.unread > 0 && <span className="tn-nav-count">{stats.unread}</span>}
                        </button>
                        <button 
                            className={`tn-nav-item ${filter === 'starred' ? 'active' : ''}`}
                            onClick={() => setFilter('starred')}
                        >
                            <Star size={16} />
                            <span>Starred</span>
                        </button>
                        <button 
                            className={`tn-nav-item ${filter === 'archived' ? 'active' : ''}`}
                            onClick={() => setFilter('archived')}
                        >
                            <Archive size={16} />
                            <span>Archived</span>
                        </button>
                    </nav>

                    <div className="tn-sidebar-divider" />

                    <div className="tn-sidebar-section">
                        <span className="tn-section-label">Categories</span>
                        <div className="tn-category-list">
                            <button onClick={() => setTypeFilter('booking')} className={typeFilter === 'booking' ? 'active' : ''}>
                                <div className="tn-cat-icon blue"><Calendar size={14} /></div>
                                <span>Bookings</span>
                            </button>
                            <button onClick={() => setTypeFilter('payment')} className={typeFilter === 'payment' ? 'active' : ''}>
                                <div className="tn-cat-icon green"><DollarSign size={14} /></div>
                                <span>Payments</span>
                            </button>
                            <button onClick={() => setTypeFilter('message')} className={typeFilter === 'message' ? 'active' : ''}>
                                <div className="tn-cat-icon purple"><MessageSquare size={14} /></div>
                                <span>Messages</span>
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="tn-main">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div className="tn-loading">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="tn-skeleton" />
                                ))}
                            </div>
                        ) : filteredAndSearched.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="tn-empty"
                            >
                                <div className="tn-empty-circle">
                                    <Bell size={32} />
                                </div>
                                <h3>Clear for now</h3>
                                <p>No notifications found matching your filters.</p>
                                {filter !== 'all' && (
                                    <button onClick={() => setFilter('all')} className="tn-clear-filter">
                                        Back to Inbox
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="tn-scroll-area">
                                {Object.entries(groupedNotifications).map(([group, items]) => (
                                    items.length > 0 && (
                                        <div key={group} className="tn-group">
                                            <h3 className="tn-group-label">{group}</h3>
                                            <div className="tn-items-stack">
                                                {items.map((notif) => {
                                                    const typeInfo = getTypeColor(notif.type, notif.priority);
                                                    const Icon = getIcon(notif.type);

                                                    return (
                                                        <motion.div
                                                            key={notif.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`tn-card ${!notif.read ? 'unread' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                                                            onClick={() => {
                                                                if (!notif.read) markAsRead(notif.id);
                                                                if (notif.link) navigate(notif.link);
                                                            }}
                                                        >
                                                            <div className="tn-card-main">
                                                                <div className="tn-card-icon-box" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                                                                    <Icon size={18} />
                                                                </div>
                                                                <div className="tn-card-content">
                                                                    <div className="tn-card-top">
                                                                        <span className="tn-card-title">{notif.title}</span>
                                                                        <span className="tn-card-time">{notif.time}</span>
                                                                    </div>
                                                                    <p className="tn-card-msg">{notif.message}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="tn-card-actions">
                                                                <button 
                                                                    className={`tn-card-action-btn star ${notif.starred ? 'active' : ''}`}
                                                                    onClick={(e) => { e.stopPropagation(); toggleStar(notif.id); }}
                                                                >
                                                                    <Star size={14} fill={notif.starred ? "currentColor" : "none"} />
                                                                </button>
                                                                <button 
                                                                    className="tn-card-action-btn archive"
                                                                    onClick={(e) => { e.stopPropagation(); archiveNotification(notif.id); }}
                                                                >
                                                                    <Archive size={14} />
                                                                </button>
                                                                <button 
                                                                    className="tn-card-action-btn delete"
                                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default TrainerNotifications;
