import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Users, DollarSign, AlertTriangle, Calendar,
    Package, Settings, FileText, Search, CheckCheck,
    Star, Trash2, Archive, Eye, Clock, TrendingUp,
    UserPlus, CreditCard, AlertCircle, Dumbbell, Inbox,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
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
    archived: boolean;
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
        archived: false,
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
        starred: false,
        archived: false
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
        archived: false,
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
        archived: false,
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
        starred: true,
        archived: false
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
        archived: false,
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
        starred: false,
        archived: false
    },
    {
        id: 8,
        type: 'inventory',
        priority: 'normal',
        title: 'Equipment Maintenance Due',
        message: '3 treadmills are due for monthly maintenance this week.',
        time: 'Yesterday',
        read: true,
        starred: false,
        archived: false
    },
    {
        id: 9,
        type: 'system',
        priority: 'normal',
        title: 'System Update Complete',
        message: 'The payment gateway has been updated. All transactions are secure.',
        time: '2 days ago',
        read: true,
        starred: false,
        archived: false
    }
];

const OwnerNotifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Get icon for notification type
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'payment': return DollarSign;
            case 'alert': return AlertTriangle;
            case 'member': return Users;
            case 'trainer': return Dumbbell;
            case 'schedule': return Calendar;
            case 'inventory': return Package;
            case 'system': return Settings;
            case 'report': return FileText;
            default: return Bell;
        }
    };

    const getTypeColor = (type: NotificationType, priority: string) => {
        if (priority === 'urgent' || priority === 'high') return { color: "#FF3B30", bg: "rgba(255, 59, 48, 0.12)" };
        switch (type) {
            case 'payment': return { color: "#34C759", bg: "rgba(52, 199, 89, 0.12)" };
            case 'member': return { color: "#007AFF", bg: "rgba(0, 122, 255, 0.12)" };
            case 'trainer': return { color: "#AF52DE", bg: "rgba(175, 82, 222, 0.12)" };
            case 'schedule': return { color: "#5856D6", bg: "rgba(88, 86, 214, 0.12)" };
            case 'inventory': return { color: "#FF9500", bg: "rgba(255, 149, 0, 0.12)" };
            default: return { color: "#8E8E93", bg: "rgba(142, 142, 147, 0.12)" };
        }
    };

    // Filter notifications
    const filteredAndSearched = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 n.message.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (filter === "unread" && n.read) return false;
            if (filter === "starred" && !n.starred) return false;
            if (filter === "archived") return n.archived;
            if (!n.archived && filter === "archived") return false; // This is a bit redundant but safe
            if (filter !== "archived" && n.archived) return false;

            if (typeFilter !== 'all' && n.type !== typeFilter) return false;
            
            return true;
        });
    }, [notifications, filter, typeFilter, searchQuery]);

    const groupedNotifications = useMemo(() => {
        const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], Earlier: [] };
        filteredAndSearched.forEach(n => {
            if (n.time.includes('min') || n.time.includes('hour')) groups.Today.push(n);
            else if (n.time === 'Yesterday') groups.Yesterday.push(n);
            else groups.Earlier.push(n);
        });
        return groups;
    }, [filteredAndSearched]);

    // Counts
    const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
    const starredCount = notifications.filter(n => n.starred && !n.archived).length;
    const totalCount = notifications.filter(n => !n.archived).length;

    // Actions
    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const toggleStar = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
        toast.success("Updated");
    };

    const archiveNotification = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
        toast.success("Archived");
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Deleted");
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("All marked as read");
    };

    return (
        <div className="on-page">
            <header className="on-header">
                <div className="on-header__left">
                    <div className="on-header__title-group">
                        <div className="on-header__title-wrapper">
                            <h1 className="on-header__title">Notifications</h1>
                            {unreadCount > 0 && <span className="on-unread-pill">{unreadCount}</span>}
                        </div>
                        
                        <div className="on-header-stats">
                            <div className="on-h-stat">
                                <span className="value">{totalCount}</span>
                                <span className="label">Total</span>
                            </div>
                            <div className="on-h-stat">
                                <span className="value">{unreadCount}</span>
                                <span className="label">Unread</span>
                            </div>
                            <div className="on-h-stat">
                                <span className="value">{starredCount}</span>
                                <span className="label">Starred</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="on-header__actions">
                    <div className="on-search-bar">
                        <Search size={14} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="on-action-btn on-action-btn--primary" onClick={markAllRead}>
                        <CheckCheck size={16} />
                        <span>Mark all read</span>
                    </button>
                    <button className="on-icon-btn" onClick={() => navigate("/settings")}>
                        <Settings size={16} />
                    </button>
                </div>
            </header>

            <div className="on-layout">
                <aside className="on-sidebar">
                    <nav className="on-nav">
                        <button 
                            className={`on-nav-item ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            <Inbox size={16} />
                            <span>Inbox</span>
                            {unreadCount > 0 && <span className="on-nav-count">{unreadCount}</span>}
                        </button>
                        <button 
                            className={`on-nav-item ${filter === 'starred' ? 'active' : ''}`}
                            onClick={() => setFilter('starred')}
                        >
                            <Star size={16} />
                            <span>Starred</span>
                        </button>
                        <button 
                            className={`on-nav-item ${filter === 'archived' ? 'active' : ''}`}
                            onClick={() => setFilter('archived')}
                        >
                            <Archive size={16} />
                            <span>Archived</span>
                        </button>
                    </nav>

                    <div className="on-sidebar-divider" />

                    <div className="on-sidebar-section">
                        <span className="on-section-label">Categories</span>
                        <div className="on-category-list">
                            <button onClick={() => setTypeFilter('payment')} className={typeFilter === 'payment' ? 'active' : ''}>
                                <div className="on-cat-icon green"><DollarSign size={14} /></div>
                                <span>Revenue</span>
                            </button>
                            <button onClick={() => setTypeFilter('member')} className={typeFilter === 'member' ? 'active' : ''}>
                                <div className="on-cat-icon blue"><Users size={14} /></div>
                                <span>Members</span>
                            </button>
                            <button onClick={() => setTypeFilter('inventory')} className={typeFilter === 'inventory' ? 'active' : ''}>
                                <div className="on-cat-icon orange"><Package size={14} /></div>
                                <span>Inventory</span>
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="on-main">
                    <AnimatePresence mode="wait">
                        {filteredAndSearched.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="on-empty"
                            >
                                <div className="on-empty-circle">
                                    <Bell size={32} />
                                </div>
                                <h3>Clear for now</h3>
                                <p>No notifications found matching your filters.</p>
                                {filter !== 'all' && (
                                    <button onClick={() => setFilter('all')} className="on-clear-filter">
                                        Back to Inbox
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="on-scroll-area">
                                {Object.entries(groupedNotifications).map(([group, items]) => (
                                    items.length > 0 && (
                                        <div key={group} className="on-group">
                                            <h3 className="on-group-label">{group}</h3>
                                            <div className="on-items-stack">
                                                {items.map((notif) => {
                                                    const typeInfo = getTypeColor(notif.type, notif.priority);
                                                    const Icon = getIcon(notif.type);

                                                    return (
                                                        <motion.div
                                                            key={notif.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`on-card ${!notif.read ? 'unread' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                                                            onClick={() => {
                                                                if (!notif.read) markAsRead(notif.id);
                                                            }}
                                                        >
                                                            <div className="on-card-main">
                                                                <div className="on-card-icon-box" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                                                                    <Icon size={18} />
                                                                </div>
                                                                <div className="on-card-content">
                                                                    <div className="on-card-top">
                                                                        <span className="on-card-title">{notif.title}</span>
                                                                        <span className="on-card-time">{notif.time}</span>
                                                                    </div>
                                                                    <p className="on-card-msg">{notif.message}</p>
                                                                    {notif.meta && (
                                                                        <div className="on-card-meta">
                                                                            {notif.meta.amount && <span className="on-meta-pill green">{notif.meta.amount}</span>}
                                                                            {notif.meta.memberName && <span className="on-meta-pill blue">{notif.meta.memberName}</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="on-card-actions">
                                                                <button 
                                                                    className={`on-card-action-btn star ${notif.starred ? 'active' : ''}`}
                                                                    onClick={(e) => { e.stopPropagation(); toggleStar(notif.id); }}
                                                                >
                                                                    <Star size={14} fill={notif.starred ? "currentColor" : "none"} />
                                                                </button>
                                                                <button 
                                                                    className="on-card-action-btn archive"
                                                                    onClick={(e) => { e.stopPropagation(); archiveNotification(notif.id); }}
                                                                >
                                                                    <Archive size={14} />
                                                                </button>
                                                                <button 
                                                                    className="on-card-action-btn delete"
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

export default OwnerNotifications;
