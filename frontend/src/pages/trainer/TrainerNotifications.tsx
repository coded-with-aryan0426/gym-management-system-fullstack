import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Users, IndianRupee, AlertTriangle, Calendar,
    Settings, Search, CheckCheck,
    Star, Trash2, Archive, Clock, TrendingUp,
    CreditCard, AlertCircle, Dumbbell, Inbox,
    ChevronRight, Filter, X, Check, MoreHorizontal,
    RefreshCw, ExternalLink,
    Zap, Eye, ArchiveRestore,
    ChevronDown, Mail, MailOpen, BellOff,
    ArrowRight, MessageSquare, Info,
    CircleDot, Sparkles, Target, Award, Heart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi, type NotificationData, type NotificationStats } from '../../api/notificationApi';
import '../Dashboard/OwnerNotifications.css';

// Trainer-specific categories
const CATEGORIES: Record<string, { icon: any; label: string; color: string; bg: string; desc: string }> = {
    BOOKING: { icon: Calendar, label: 'Bookings', color: '#5856D6', bg: 'rgba(88,86,214,0.12)', desc: 'Session bookings & cancellations' },
    SCHEDULE: { icon: Clock, label: 'Schedule', color: '#007AFF', bg: 'rgba(0,122,255,0.12)', desc: 'Timetable & shift changes' },
    MEMBER: { icon: Users, label: 'Clients', color: '#AF52DE', bg: 'rgba(175,82,222,0.12)', desc: 'Client updates & activity' },
    PAYMENT: { icon: IndianRupee, label: 'Earnings', color: '#34C759', bg: 'rgba(52,199,89,0.12)', desc: 'Payout & commission updates' },
    MESSAGE: { icon: MessageSquare, label: 'Messages', color: '#007AFF', bg: 'rgba(0,122,255,0.12)', desc: 'Direct messages & chats' },
    ACHIEVEMENT: { icon: Award, label: 'Achievements', color: '#FF9500', bg: 'rgba(255,149,0,0.12)', desc: 'Goals & milestones' },
    PROGRESS: { icon: TrendingUp, label: 'Progress', color: '#5AC8FA', bg: 'rgba(90,200,250,0.12)', desc: 'Client progress reports' },
    ALERT: { icon: AlertTriangle, label: 'Alerts', color: '#FF3B30', bg: 'rgba(255,59,48,0.12)', desc: 'Critical warnings' },
    SYSTEM: { icon: Settings, label: 'System', color: '#8E8E93', bg: 'rgba(142,142,147,0.12)', desc: 'System updates' },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
    urgent: { color: '#FF3B30', bg: 'rgba(255,59,48,0.15)', label: 'Urgent', icon: Zap },
    high: { color: '#FF9500', bg: 'rgba(255,149,0,0.12)', label: 'High', icon: AlertTriangle },
    normal: { color: '#8E8E93', bg: 'rgba(142,142,147,0.08)', label: 'Normal', icon: Bell },
    low: { color: '#636366', bg: 'rgba(99,99,102,0.08)', label: 'Low', icon: BellOff },
};

type ViewFilter = 'all' | 'unread' | 'starred' | 'archived';

const TRAINER_NOTIFICATION_TIPS = [
    { icon: Calendar, title: 'Session Bookings', desc: 'Get notified instantly when clients book, reschedule, or cancel training sessions.', color: '#5856D6' },
    { icon: IndianRupee, title: 'Earnings Updates', desc: 'Track your payouts, commissions, and bonus earnings in real time.', color: '#34C759' },
    { icon: Users, title: 'Client Activity', desc: 'Stay informed when new clients are assigned or existing clients update their goals.', color: '#AF52DE' },
    { icon: Clock, title: 'Schedule Changes', desc: 'Receive alerts for shift changes, class reassignments, and timetable updates.', color: '#007AFF' },
    { icon: TrendingUp, title: 'Client Progress', desc: 'Get updates when clients hit milestones, complete programs, or need attention.', color: '#5AC8FA' },
    { icon: AlertTriangle, title: 'Important Alerts', desc: 'Immediate notifications for emergencies, policy changes, or urgent matters.', color: '#FF3B30' },
];

const TrainerNotifications: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.userId;

    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [liveConnected, setLiveConnected] = useState(true);

    const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectMode, setSelectMode] = useState(false);

    const [selectedNotif, setSelectedNotif] = useState<NotificationData | null>(null);

    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const bulkRef = useRef<HTMLDivElement>(null);

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
    const [mobileSidebar, setMobileSidebar] = useState(false);

    const toggleSection = (key: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const fetchData = useCallback(async (showRefresh = false) => {
        if (!userId) return;
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            if (typeFilter) {
                const data = await notificationApi.getByType(userId, typeFilter);
                setNotifications(data);
            } else {
                const data = await notificationApi.getUserNotifications(userId, viewFilter);
                setNotifications(data);
            }
            const statsData = await notificationApi.getStats(userId);
            setStats(statsData);
            setLiveConnected(true);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setLiveConnected(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, viewFilter, typeFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        const interval = setInterval(() => fetchData(), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setShowBulkMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
            }
            if (priorityFilter && n.priority !== priorityFilter) return false;
            return true;
        });
    }, [notifications, searchQuery, priorityFilter]);

    const grouped = useMemo(() => {
        const now = new Date();
        const groups: { label: string; items: NotificationData[] }[] = [
            { label: 'Today', items: [] },
            { label: 'Yesterday', items: [] },
            { label: 'This Week', items: [] },
            { label: 'Earlier', items: [] },
        ];
        filteredNotifications.forEach(n => {
            const d = new Date(n.createdAt);
            const diffMs = now.getTime() - d.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays < 1 && d.getDate() === now.getDate()) groups[0].items.push(n);
            else if (diffDays < 2) groups[1].items.push(n);
            else if (diffDays < 7) groups[2].items.push(n);
            else groups[3].items.push(n);
        });
        return groups.filter(g => g.items.length > 0);
    }, [filteredNotifications]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            if (stats) setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
        } catch { toast.error('Failed'); }
    };

    const handleToggleStar = async (id: number) => {
        try {
            await notificationApi.toggleStar(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n));
        } catch { toast.error('Failed'); }
    };

    const handleArchive = async (id: number) => {
        try {
            await notificationApi.archive(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (selectedNotif?.id === id) setSelectedNotif(null);
            toast.success('Archived');
            fetchData(true);
        } catch { toast.error('Failed'); }
    };

    const handleUnarchive = async (id: number) => {
        try {
            await notificationApi.unarchive(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (selectedNotif?.id === id) setSelectedNotif(null);
            toast.success('Restored');
            fetchData(true);
        } catch { toast.error('Failed'); }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (selectedNotif?.id === id) setSelectedNotif(null);
            toast.success('Deleted');
            fetchData(true);
        } catch { toast.error('Failed'); }
    };

    const handleMarkAllRead = async () => {
        if (!userId) return;
        try {
            await notificationApi.markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            if (stats) setStats({ ...stats, unread: 0 });
            toast.success('All marked as read');
        } catch { toast.error('Failed'); }
    };

    const handleBulkAction = async (action: string) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        try {
            await notificationApi.bulkAction(action, ids);
            setSelectedIds(new Set());
            setSelectMode(false);
            setShowBulkMenu(false);
            toast.success(`${action} completed for ${ids.length} items`);
            fetchData(true);
        } catch { toast.error('Bulk action failed'); }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === filteredNotifications.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    };

    const openNotif = (n: NotificationData) => {
        setSelectedNotif(n);
        if (!n.isRead) handleMarkAsRead(n.id);
    };

    const getCategory = (type: string) => CATEGORIES[type?.toUpperCase()] || CATEGORIES.SYSTEM;
    const getPriority = (p: string) => PRIORITY_CONFIG[p] || PRIORITY_CONFIG.normal;

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const parseMeta = (metaStr?: string) => {
        if (!metaStr) return null;
        try { return JSON.parse(metaStr); } catch { return null; }
    };

    const activeFilterLabel = useMemo(() => {
        if (typeFilter) return getCategory(typeFilter).label;
        if (viewFilter === 'unread') return 'Unread';
        if (viewFilter === 'starred') return 'Starred';
        if (viewFilter === 'archived') return 'Archived';
        return 'All Notifications';
    }, [viewFilter, typeFilter]);

    const hasActiveFilters = typeFilter || priorityFilter || searchQuery;

    const clearAllFilters = () => {
        setSearchQuery('');
        setTypeFilter(null);
        setPriorityFilter(null);
        setViewFilter('all');
    };

    const renderSidebarContent = () => (
        <>
            <div className="on-sidebar__section">
                <button className="on-sidebar__heading" onClick={() => toggleSection('views')}>
                    <Eye size={11} />
                    <span>Views</span>
                    {collapsedSections.has('views') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('views') && (
                    <nav className="on-nav">
                        {[
                            { key: 'all' as ViewFilter, icon: Inbox, label: 'All Inbox', count: stats?.total, color: '#007AFF' },
                            { key: 'unread' as ViewFilter, icon: Mail, label: 'Unread', count: stats?.unread, color: '#FF3B30' },
                            { key: 'starred' as ViewFilter, icon: Star, label: 'Starred', count: stats?.starred, color: '#FFCC00' },
                            { key: 'archived' as ViewFilter, icon: Archive, label: 'Archived', count: stats?.archived, color: '#8E8E93' },
                        ].map(item => (
                            <button
                                key={item.key}
                                className={`on-nav-btn ${viewFilter === item.key && !typeFilter ? 'active' : ''}`}
                                onClick={() => { setViewFilter(item.key); setTypeFilter(null); setPriorityFilter(null); setMobileSidebar(false); }}
                            >
                                <div className="on-nav-icon" style={{ color: viewFilter === item.key && !typeFilter ? item.color : undefined }}>
                                    <item.icon size={14} />
                                </div>
                                <span className="on-nav-label">{item.label}</span>
                                {item.count !== undefined && item.count > 0 && (
                                    <span className={`on-nav-count ${item.key === 'unread' && item.count > 0 ? 'on-nav-count--alert' : ''}`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                )}
            </div>

            <div className="on-sidebar__divider" />

            <div className="on-sidebar__section">
                <button className="on-sidebar__heading" onClick={() => toggleSection('categories')}>
                    <Filter size={11} />
                    <span>Categories</span>
                    {collapsedSections.has('categories') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('categories') && (
                    <nav className="on-nav">
                        {Object.entries(CATEGORIES).map(([key, cat]) => {
                            const count = stats?.typeCounts?.[key] || stats?.typeCounts?.[key.toLowerCase()] || 0;
                            return (
                                <button
                                    key={key}
                                    className={`on-nav-btn ${typeFilter === key ? 'active' : ''}`}
                                    onClick={() => {
                                        setTypeFilter(typeFilter === key ? null : key);
                                        setViewFilter('all');
                                        setPriorityFilter(null);
                                        setMobileSidebar(false);
                                    }}
                                >
                                    <div className="on-nav-cat-icon" style={{ background: cat.bg, color: cat.color }}>
                                        <cat.icon size={12} />
                                    </div>
                                    <span className="on-nav-label">{cat.label}</span>
                                    {count > 0 && <span className="on-nav-count">{count}</span>}
                                </button>
                            );
                        })}
                    </nav>
                )}
            </div>

            <div className="on-sidebar__divider" />

            <div className="on-sidebar__section">
                <button className="on-sidebar__heading" onClick={() => toggleSection('priority')}>
                    <Zap size={11} />
                    <span>Priority</span>
                    {collapsedSections.has('priority') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('priority') && (
                    <nav className="on-nav">
                        {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
                            <button
                                key={key}
                                className={`on-nav-btn ${priorityFilter === key ? 'active' : ''}`}
                                onClick={() => { setPriorityFilter(priorityFilter === key ? null : key); setMobileSidebar(false); }}
                            >
                                <div className="on-nav-priority-dot" style={{ background: p.color }}>
                                    <p.icon size={9} />
                                </div>
                                <span className="on-nav-label">{p.label}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </>
    );

    return (
        <div className="on-page">
            <header className="on-header">
                <div className="on-header__row">
                    <div className="on-header__left">
                        <div className="on-header__icon-wrap">
                            <Bell size={18} />
                            {stats && stats.unread > 0 && (
                                <span className="on-header__badge">{stats.unread > 99 ? '99+' : stats.unread}</span>
                            )}
                        </div>
                        <div className="on-header__text">
                            <h1>Notifications</h1>
                            <div className="on-header__meta">
                                <span className={`on-header__live ${liveConnected ? 'connected' : 'disconnected'}`}>
                                    <CircleDot size={7} />
                                    {liveConnected ? 'Live' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {stats && (
                        <div className="on-stats-strip">
                            {[
                                { key: 'all', icon: Inbox, num: stats.total, label: 'Total', color: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
                                { key: 'unread', icon: Mail, num: stats.unread, label: 'Unread', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
                                { key: 'urgent', icon: Zap, num: stats.urgent, label: 'Urgent', color: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
                                { key: 'starred', icon: Star, num: stats.starred, label: 'Starred', color: '#FFCC00', bg: 'rgba(255,204,0,0.12)' },
                                { key: 'archived', icon: Archive, num: stats.archived, label: 'Archived', color: '#8E8E93', bg: 'rgba(142,142,147,0.1)' },
                            ].map(s => (
                                <motion.button
                                    key={s.key}
                                    className={`on-stat-card ${viewFilter === s.key && !typeFilter ? 'active' : ''} ${s.key === 'urgent' && priorityFilter === 'urgent' ? 'active' : ''}`}
                                    onClick={() => {
                                        if (s.key === 'urgent') { setViewFilter('all'); setTypeFilter(null); setPriorityFilter('urgent'); }
                                        else { setViewFilter(s.key as ViewFilter); setTypeFilter(null); setPriorityFilter(null); }
                                    }}
                                    whileHover={{ y: -1, scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <div className="on-stat-icon" style={{ background: s.bg, color: s.color }}>
                                        <s.icon size={13} />
                                    </div>
                                    <div className="on-stat-info">
                                        <span className="on-stat-num" style={s.num > 0 ? { color: s.color } : undefined}>{s.num}</span>
                                        <span className="on-stat-label">{s.label}</span>
                                    </div>
                                    {s.key === 'unread' && s.num > 0 && <div className="on-stat-pulse" style={{ background: s.color }} />}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    <div className="on-header__right">
                        <div className="on-search-box">
                            <Search size={13} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="on-search-clear" onClick={() => setSearchQuery('')}>
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        <button
                            className={`on-header-btn ${refreshing ? 'spinning' : ''}`}
                            onClick={() => fetchData(true)}
                            title="Refresh"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <button className="on-header-btn" onClick={handleMarkAllRead} title="Mark all read">
                            <CheckCheck size={14} />
                        </button>
                        <button className="on-header-btn on-header-btn--mobile-filter" onClick={() => setMobileSidebar(!mobileSidebar)} title="Filters">
                            <Filter size={14} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="on-body">
                <aside className="on-sidebar">
                    {renderSidebarContent()}
                </aside>

                <AnimatePresence>
                    {mobileSidebar && (
                        <>
                            <motion.div
                                className="on-mobile-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileSidebar(false)}
                            />
                            <motion.aside
                                className="on-mobile-sidebar"
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            >
                                <div className="on-mobile-sidebar__header">
                                    <h3>Filters</h3>
                                    <button onClick={() => setMobileSidebar(false)}><X size={16} /></button>
                                </div>
                                {renderSidebarContent()}
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                <div className="on-content">
                    <div className="on-toolbar">
                        <div className="on-toolbar__left">
                            <h3 className="on-toolbar__view-label">{activeFilterLabel}</h3>

                            <button
                                className={`on-toolbar-btn ${selectMode ? 'active' : ''}`}
                                onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                            >
                                {selectMode ? <X size={13} /> : <Check size={13} />}
                                <span>{selectMode ? 'Cancel' : 'Select'}</span>
                            </button>

                            {selectMode && (
                                <>
                                    <button className="on-toolbar-btn" onClick={selectAll}>
                                        <CheckCheck size={13} />
                                        <span>{selectedIds.size === filteredNotifications.length ? 'Deselect' : 'All'}</span>
                                    </button>
                                    {selectedIds.size > 0 && (
                                        <div className="on-bulk-wrap" ref={bulkRef}>
                                            <button className="on-toolbar-btn on-toolbar-btn--accent" onClick={() => setShowBulkMenu(!showBulkMenu)}>
                                                <MoreHorizontal size={13} />
                                                <span>Actions ({selectedIds.size})</span>
                                                <ChevronDown size={11} />
                                            </button>
                                            <AnimatePresence>
                                                {showBulkMenu && (
                                                    <motion.div
                                                        className="on-bulk-menu"
                                                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <button onClick={() => handleBulkAction('read')}>
                                                            <MailOpen size={14} /> Mark as Read
                                                        </button>
                                                        <button onClick={() => handleBulkAction('unread')}>
                                                            <Mail size={14} /> Mark as Unread
                                                        </button>
                                                        <button onClick={() => handleBulkAction('star')}>
                                                            <Star size={14} /> Star Selected
                                                        </button>
                                                        <button onClick={() => handleBulkAction('archive')}>
                                                            <Archive size={14} /> Archive Selected
                                                        </button>
                                                        <div className="on-bulk-divider" />
                                                        <button className="danger" onClick={() => handleBulkAction('delete')}>
                                                            <Trash2 size={14} /> Delete Selected
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="on-toolbar__right">
                            {hasActiveFilters && (
                                <div className="on-active-filters">
                                    {typeFilter && (
                                        <span className="on-filter-chip" style={{ background: `${getCategory(typeFilter).color}15`, color: getCategory(typeFilter).color }}>
                                            {getCategory(typeFilter).label}
                                            <button onClick={() => setTypeFilter(null)}><X size={10} /></button>
                                        </span>
                                    )}
                                    {priorityFilter && (
                                        <span className="on-filter-chip" style={{ background: `${getPriority(priorityFilter).color}15`, color: getPriority(priorityFilter).color }}>
                                            {getPriority(priorityFilter).label}
                                            <button onClick={() => setPriorityFilter(null)}><X size={10} /></button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="on-filter-chip">
                                            <Search size={10} />
                                            "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')}><X size={10} /></button>
                                        </span>
                                    )}
                                    <button className="on-filter-clear-all" onClick={clearAllFilters}>
                                        Clear all
                                    </button>
                                </div>
                            )}
                            <span className="on-result-count">
                                {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="on-split">
                        <div className={`on-list ${selectedNotif ? 'has-detail' : ''}`}>
                            {loading ? (
                                <div className="on-loading">
                                    <div className="on-loading__spinner" />
                                    <p>Loading notifications...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="on-empty">
                                    <div className="on-empty__hero">
                                        <div className="on-empty__icon-ring">
                                            <div className="on-empty__icon-inner">
                                                {viewFilter === 'starred' ? <Star size={32} /> :
                                                 viewFilter === 'archived' ? <Archive size={32} /> :
                                                 viewFilter === 'unread' ? <CheckCheck size={32} /> :
                                                 searchQuery ? <Search size={32} /> :
                                                 <Bell size={32} />}
                                            </div>
                                            <div className="on-empty__ring-pulse" />
                                        </div>
                                        <h2>
                                            {searchQuery
                                                ? `No results for "${searchQuery}"`
                                                : viewFilter === 'archived'
                                                    ? 'No archived notifications'
                                                    : viewFilter === 'starred'
                                                        ? 'No starred notifications'
                                                        : viewFilter === 'unread'
                                                            ? 'You\'re all caught up!'
                                                            : 'No notifications yet'}
                                        </h2>
                                        <p>
                                            {searchQuery
                                                ? 'Try a different search term or clear your filters.'
                                                : viewFilter === 'unread'
                                                    ? 'Great job! You\'ve read all your notifications.'
                                                    : viewFilter !== 'all'
                                                        ? `You have no ${viewFilter} notifications right now.`
                                                        : 'As you train clients and manage sessions, notifications will appear here to keep you informed.'}
                                        </p>
                                        {hasActiveFilters && (
                                            <button className="on-empty__clear-btn" onClick={clearAllFilters}>
                                                <X size={14} /> Clear all filters
                                            </button>
                                        )}
                                    </div>

                                    {!hasActiveFilters && viewFilter === 'all' && (
                                        <div className="on-empty__tips">
                                            <div className="on-empty__tips-header">
                                                <Sparkles size={14} />
                                                <span>What notifications will you receive?</span>
                                            </div>
                                            <div className="on-empty__tips-grid">
                                                {TRAINER_NOTIFICATION_TIPS.map((tip, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="on-empty__tip-card"
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.07, duration: 0.35 }}
                                                    >
                                                        <div className="on-empty__tip-icon" style={{ background: `${tip.color}18`, color: tip.color }}>
                                                            <tip.icon size={18} />
                                                        </div>
                                                        <div className="on-empty__tip-text">
                                                            <strong>{tip.title}</strong>
                                                            <span>{tip.desc}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="on-list__scroll">
                                    {grouped.map(group => (
                                        <div key={group.label} className="on-group">
                                            <div className="on-group__header">
                                                <span className="on-group__label">{group.label}</span>
                                                <span className="on-group__count">{group.items.length}</span>
                                                <div className="on-group__line" />
                                            </div>
                                            <div className="on-group__items">
                                                <AnimatePresence>
                                                    {group.items.map(notif => {
                                                        const cat = getCategory(notif.type);
                                                        const pri = getPriority(notif.priority);
                                                        const meta = parseMeta(notif.metaData);
                                                        const isSelected = selectedIds.has(notif.id);
                                                        const isActive = selectedNotif?.id === notif.id;

                                                        return (
                                                            <motion.div
                                                                key={notif.id}
                                                                layout
                                                                initial={{ opacity: 0, y: 6 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, x: -20, height: 0 }}
                                                                className={`on-item ${!notif.isRead ? 'unread' : ''} ${isActive ? 'active' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                                                                onClick={() => selectMode ? toggleSelect(notif.id) : openNotif(notif)}
                                                            >
                                                                {selectMode && (
                                                                    <div className={`on-item__check ${isSelected ? 'checked' : ''}`}>
                                                                        {isSelected && <Check size={10} />}
                                                                    </div>
                                                                )}

                                                                {!notif.isRead && <div className="on-item__unread-dot" />}

                                                                <div className="on-item__icon" style={{ background: cat.bg, color: cat.color }}>
                                                                    <cat.icon size={16} />
                                                                </div>

                                                                <div className="on-item__body">
                                                                    <div className="on-item__row1">
                                                                        <span className="on-item__title">{notif.title}</span>
                                                                        <span className="on-item__time">{formatTime(notif.createdAt)}</span>
                                                                    </div>
                                                                    <p className="on-item__msg">{notif.message}</p>
                                                                    <div className="on-item__tags">
                                                                        <span className="on-tag" style={{ background: cat.bg, color: cat.color }}>
                                                                            {cat.label}
                                                                        </span>
                                                                        {(notif.priority === 'urgent' || notif.priority === 'high') && (
                                                                            <span className="on-tag" style={{ background: pri.bg, color: pri.color }}>
                                                                                <pri.icon size={8} /> {pri.label}
                                                                            </span>
                                                                        )}
                                                                        {meta?.amount && (
                                                                            <span className="on-tag on-tag--money">
                                                                                <IndianRupee size={8} /> {meta.amount}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="on-item__actions">
                                                                    <button
                                                                        className={`on-item-act ${notif.isStarred ? 'starred' : ''}`}
                                                                        onClick={e => { e.stopPropagation(); handleToggleStar(notif.id); }}
                                                                        title={notif.isStarred ? 'Unstar' : 'Star'}
                                                                    >
                                                                        <Star size={13} fill={notif.isStarred ? 'currentColor' : 'none'} />
                                                                    </button>
                                                                    {viewFilter === 'archived' ? (
                                                                        <button
                                                                            className="on-item-act"
                                                                            onClick={e => { e.stopPropagation(); handleUnarchive(notif.id); }}
                                                                            title="Restore"
                                                                        >
                                                                            <ArchiveRestore size={13} />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="on-item-act"
                                                                            onClick={e => { e.stopPropagation(); handleArchive(notif.id); }}
                                                                            title="Archive"
                                                                        >
                                                                            <Archive size={13} />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="on-item-act on-item-act--danger"
                                                                        onClick={e => { e.stopPropagation(); handleDelete(notif.id); }}
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {selectedNotif && (
                                <motion.div
                                    className="on-detail"
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 24 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                >
                                    <div className="on-detail__header">
                                        <button className="on-detail__close" onClick={() => setSelectedNotif(null)}>
                                            <X size={15} />
                                        </button>
                                        <span className="on-detail__header-title">Details</span>
                                        <div className="on-detail__header-actions">
                                            {!selectedNotif.isRead && (
                                                <button className="on-detail-act" onClick={() => handleMarkAsRead(selectedNotif.id)} title="Mark as read">
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            <button
                                                className={`on-detail-act ${selectedNotif.isStarred ? 'starred' : ''}`}
                                                onClick={() => handleToggleStar(selectedNotif.id)}
                                            >
                                                <Star size={14} fill={selectedNotif.isStarred ? 'currentColor' : 'none'} />
                                            </button>
                                            <button className="on-detail-act" onClick={() => handleArchive(selectedNotif.id)}>
                                                <Archive size={14} />
                                            </button>
                                            <button className="on-detail-act on-detail-act--danger" onClick={() => handleDelete(selectedNotif.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="on-detail__body">
                                        {(() => {
                                            const cat = getCategory(selectedNotif.type);
                                            const pri = getPriority(selectedNotif.priority);
                                            const meta = parseMeta(selectedNotif.metaData);
                                            return (
                                                <>
                                                    <div className="on-detail__banner" style={{ background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)` }}>
                                                        <div className="on-detail__banner-icon" style={{ background: cat.bg, color: cat.color }}>
                                                            <cat.icon size={24} />
                                                        </div>
                                                        <div className="on-detail__banner-badges">
                                                            <span className="on-detail__cat-badge" style={{ background: cat.bg, color: cat.color }}>
                                                                {cat.label}
                                                            </span>
                                                            <span className="on-detail__pri-badge" style={{ background: pri.bg, color: pri.color }}>
                                                                <pri.icon size={9} /> {pri.label}
                                                            </span>
                                                            {!selectedNotif.isRead && (
                                                                <span className="on-detail__unread-badge">Unread</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="on-detail__content">
                                                        <h2 className="on-detail__title">{selectedNotif.title}</h2>
                                                        <div className="on-detail__timestamp">
                                                            <Clock size={12} />
                                                            <span>{formatFullDate(selectedNotif.createdAt)}</span>
                                                        </div>

                                                        <div className="on-detail__divider" />

                                                        <div className="on-detail__message">
                                                            {selectedNotif.message}
                                                        </div>

                                                        {meta && Object.keys(meta).length > 0 && (
                                                            <>
                                                                <div className="on-detail__divider" />
                                                                <div className="on-detail__meta-section">
                                                                    <h4><Info size={12} /> Additional Details</h4>
                                                                    <div className="on-detail__meta-grid">
                                                                        {meta.amount && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(52,199,89,0.1)', color: '#34C759' }}>
                                                                                    <IndianRupee size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Amount</span>
                                                                                    <span className="value">{meta.amount}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.memberName && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(0,122,255,0.1)', color: '#007AFF' }}>
                                                                                    <Users size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Client</span>
                                                                                    <span className="value">{meta.memberName}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.trainerName && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(175,82,222,0.1)', color: '#AF52DE' }}>
                                                                                    <Dumbbell size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Trainer</span>
                                                                                    <span className="value">{meta.trainerName}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.className && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(88,86,214,0.1)', color: '#5856D6' }}>
                                                                                    <Calendar size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Class</span>
                                                                                    <span className="value">{meta.className}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.sessionTime && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(0,122,255,0.1)', color: '#007AFF' }}>
                                                                                    <Clock size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Session Time</span>
                                                                                    <span className="value">{meta.sessionTime}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.clientGoal && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(255,149,0,0.1)', color: '#FF9500' }}>
                                                                                    <Target size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Goal</span>
                                                                                    <span className="value">{meta.clientGoal}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}

                                                        {selectedNotif.link && (
                                                            <>
                                                                <div className="on-detail__divider" />
                                                                <button
                                                                    className="on-detail__link-btn"
                                                                    onClick={() => navigate(selectedNotif.link!)}
                                                                >
                                                                    <ExternalLink size={14} />
                                                                    View Full Details
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerNotifications;
