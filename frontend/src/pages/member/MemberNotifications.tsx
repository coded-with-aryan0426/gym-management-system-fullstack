import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Users, CreditCard, AlertTriangle, Calendar,
    Settings, Search, CheckCheck,
    Star, Trash2, Archive, Clock, TrendingUp,
    AlertCircle, Trophy, Inbox,
    ChevronRight, Filter, X, Check, MoreHorizontal,
    RefreshCw, ExternalLink,
    Zap, Eye, ArchiveRestore,
    ChevronDown, Mail, MailOpen, BellRing, Activity,
    BellOff, Sparkles, ArrowRight, ChevronUp, Heart,
    MessageSquare, Dumbbell, Info, Tag,
    Wifi, WifiOff, CircleDot, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi, type NotificationData, type NotificationStats } from '../../api/notificationApi';
import '../Dashboard/OwnerNotifications.css';

// Member-specific categories
const CATEGORIES: Record<string, { icon: any; label: string; color: string; bg: string; desc: string }> = {
    MEMBERSHIP: { icon: CreditCard, label: 'Membership', color: '#007AFF', bg: 'rgba(0,122,255,0.12)', desc: 'Plan renewals & upgrades' },
    BOOKING: { icon: Calendar, label: 'Bookings', color: '#5856D6', bg: 'rgba(88,86,214,0.12)', desc: 'Class bookings & sessions' },
    SCHEDULE: { icon: Clock, label: 'Schedule', color: '#AF52DE', bg: 'rgba(175,82,222,0.12)', desc: 'Class timings & changes' },
    PAYMENT: { icon: IndianRupee, label: 'Payments', color: '#34C759', bg: 'rgba(52,199,89,0.12)', desc: 'Receipts & billing' },
    TRAINER: { icon: Dumbbell, label: 'Trainer', color: '#FF9500', bg: 'rgba(255,149,0,0.12)', desc: 'Trainer updates & assignments' },
    ACHIEVEMENT: { icon: Trophy, label: 'Achievements', color: '#FFD60A', bg: 'rgba(255,214,10,0.12)', desc: 'Goals & milestones' },
    OFFER: { icon: Tag, label: 'Offers', color: '#FF2D55', bg: 'rgba(255,45,85,0.12)', desc: 'Promotions & discounts' },
    ALERT: { icon: AlertTriangle, label: 'Alerts', color: '#FF3B30', bg: 'rgba(255,59,48,0.12)', desc: 'Important warnings' },
    SYSTEM: { icon: Settings, label: 'System', color: '#8E8E93', bg: 'rgba(142,142,147,0.12)', desc: 'System updates' },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
    urgent: { color: '#FF3B30', bg: 'rgba(255,59,48,0.15)', label: 'Urgent', icon: Zap },
    high: { color: '#FF9500', bg: 'rgba(255,149,0,0.12)', label: 'High', icon: AlertTriangle },
    normal: { color: '#8E8E93', bg: 'rgba(142,142,147,0.08)', label: 'Normal', icon: Bell },
    low: { color: '#636366', bg: 'rgba(99,99,102,0.08)', label: 'Low', icon: BellOff },
};

type ViewFilter = 'all' | 'unread' | 'starred' | 'archived';

const MEMBER_NOTIFICATION_TIPS = [
    { icon: CreditCard, title: 'Membership Updates', desc: 'Get notified about plan renewals, upgrades, and membership status changes.', color: '#007AFF' },
    { icon: Calendar, title: 'Class Bookings', desc: 'Instant alerts when your booked classes are confirmed, rescheduled, or cancelled.', color: '#5856D6' },
    { icon: IndianRupee, title: 'Payment Receipts', desc: 'Track your payment history, invoices, and billing reminders.', color: '#34C759' },
    { icon: Dumbbell, title: 'Trainer Updates', desc: 'Stay informed when your trainer is assigned, changed, or sends you a message.', color: '#FF9500' },
    { icon: Trophy, title: 'Achievement Milestones', desc: 'Celebrate when you hit fitness goals, streaks, or earn new badges.', color: '#FFD60A' },
    { icon: Tag, title: 'Promotions & Offers', desc: 'Never miss exclusive deals, referral rewards, and seasonal discounts.', color: '#FF2D55' },
];

const MemberNotifications: React.FC = () => {
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

    // Sidebar content (shared desktop + mobile)
    const renderSidebarContent = () => (
        <>
            {/* Views */}
            <div className="on-sidebar__section">
                <button className="on-sidebar__heading" onClick={() => toggleSection('views')}>
                    <Eye size={11} />
                    <span>Views</span>
                    {collapsedSections.has('views') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('views') && (
                    <nav className="on-nav">
                        {[
                            { key: 'all' as ViewFilter, icon: Inbox, label: 'All', count: stats?.total },
                            { key: 'unread' as ViewFilter, icon: Mail, label: 'Unread', count: stats?.unread },
                            { key: 'starred' as ViewFilter, icon: Star, label: 'Starred', count: stats?.starred },
                            { key: 'archived' as ViewFilter, icon: Archive, label: 'Archived', count: stats?.archived },
                        ].map(v => (
                            <button
                                key={v.key}
                                className={`on-nav-btn ${viewFilter === v.key && !typeFilter ? 'active' : ''}`}
                                onClick={() => { setViewFilter(v.key); setTypeFilter(null); setMobileSidebar(false); }}
                            >
                                <v.icon size={14} className="on-nav-icon" />
                                <span className="on-nav-label">{v.label}</span>
                                {(v.count ?? 0) > 0 && (
                                    <span className={`on-nav-count ${v.key === 'unread' && (v.count ?? 0) > 0 ? 'on-nav-count--alert' : ''}`}>
                                        {v.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                )}
            </div>

            <div className="on-sidebar__divider" />

            {/* Categories */}
            <div className="on-sidebar__section">
                <button className="on-sidebar__heading" onClick={() => toggleSection('categories')}>
                    <Filter size={11} />
                    <span>Categories</span>
                    {collapsedSections.has('categories') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('categories') && (
                    <nav className="on-nav">
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                            <button
                                key={key}
                                className={`on-nav-btn ${typeFilter === key ? 'active' : ''}`}
                                onClick={() => { setTypeFilter(typeFilter === key ? null : key); setMobileSidebar(false); }}
                            >
                                <span className="on-nav-cat-icon" style={{ background: cat.bg, color: cat.color }}>
                                    <cat.icon size={12} />
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span className="on-nav-label">{cat.label}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>{cat.desc}</span>
                                </div>
                            </button>
                        ))}
                    </nav>
                )}
            </div>

            <div className="on-sidebar__divider" />

            {/* Priority */}
            <div className="on-sidebar__section">
                <button className="on-sidebar__heading" onClick={() => toggleSection('priority')}>
                    <AlertCircle size={11} />
                    <span>Priority</span>
                    {collapsedSections.has('priority') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('priority') && (
                    <nav className="on-nav">
                        {Object.entries(PRIORITY_CONFIG).map(([key, pri]) => (
                            <button
                                key={key}
                                className={`on-nav-btn ${priorityFilter === key ? 'active' : ''}`}
                                onClick={() => { setPriorityFilter(priorityFilter === key ? null : key); setMobileSidebar(false); }}
                            >
                                <span className="on-nav-priority-dot" style={{ background: pri.color }} />
                                <span className="on-nav-label">{pri.label}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </>
    );

    return (
        <div className="on-page">
            {/* Header */}
            <div className="on-header">
                <div className="on-header__row">
                    <div className="on-header__left">
                        <div className="on-header__icon-wrap">
                            <Bell size={22} />
                        </div>
                        <div className="on-header__text">
                            <h1>Notifications</h1>
                            <div className="on-header__meta">
                                <span className={`on-header__badge ${liveConnected ? 'connected' : 'disconnected'}`}>
                                    {liveConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                                    {liveConnected ? 'Live' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="on-header__right">
                        <button className="on-header-btn" onClick={() => fetchData(true)} title="Refresh">
                            <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
                        </button>
                        <button className="on-header-btn" onClick={handleMarkAllRead} title="Mark all read">
                            <CheckCheck size={15} />
                        </button>
                        <button className="on-header-btn" onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }} title="Select mode">
                            {selectMode ? <X size={15} /> : <Check size={15} />}
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="on-stats-strip">
                    {[
                        { icon: Bell, label: 'Total', value: stats?.total ?? 0, color: '#007AFF' },
                        { icon: Mail, label: 'Unread', value: stats?.unread ?? 0, color: '#FF9500' },
                        { icon: Star, label: 'Starred', value: stats?.starred ?? 0, color: '#FFD60A' },
                        { icon: Archive, label: 'Archived', value: stats?.archived ?? 0, color: '#8E8E93' },
                    ].map((s, i) => (
                        <div className="on-stat-card" key={i}>
                            <div className="on-stat-icon" style={{ color: s.color }}>
                                <s.icon size={14} />
                                {s.label === 'Unread' && (s.value > 0) && <span className="on-stat-pulse" />}
                            </div>
                            <div className="on-stat-info">
                                <span className="on-stat-num">{s.value}</span>
                                <span className="on-stat-label">{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="on-body">
                {/* Mobile filter button */}
                <button className="on-header-btn on-header-btn--mobile-filter" onClick={() => setMobileSidebar(true)}>
                    <Filter size={16} />
                    Filters
                    {hasActiveFilters && <span className="on-mobile-filter-dot" />}
                </button>

                {/* Mobile sidebar overlay */}
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
                            <motion.div
                                className="on-mobile-sidebar"
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            >
                                <div className="on-mobile-sidebar__header">
                                    <h3>Filters</h3>
                                    <button onClick={() => setMobileSidebar(false)}><X size={18} /></button>
                                </div>
                                {renderSidebarContent()}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Desktop sidebar */}
                <div className="on-sidebar">
                    {renderSidebarContent()}
                </div>

                {/* Main content */}
                <div className={`on-content ${selectedNotif ? 'has-detail' : ''}`}>
                    {/* Toolbar */}
                    <div className="on-toolbar">
                        <div className="on-toolbar__left">
                            {selectMode && (
                                <button className="on-toolbar-btn" onClick={selectAll}>
                                    {selectedIds.size === filteredNotifications.length ? <CheckCheck size={13} /> : <Check size={13} />}
                                </button>
                            )}
                            <span className="on-toolbar__view-label">
                                <Check size={11} />
                                {activeFilterLabel}
                                <span className="on-result-count">{filteredNotifications.length}</span>
                            </span>
                        </div>
                        <div className="on-toolbar__right">
                            <div className="on-search-box">
                                <Search size={13} />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="on-search-clear" onClick={() => setSearchQuery('')}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="on-active-filters">
                            {typeFilter && (() => {
                                const cat = getCategory(typeFilter);
                                return (
                                    <span className="on-filter-chip" style={{ background: cat.bg, color: cat.color }}>
                                        <cat.icon size={11} /> {cat.label}
                                        <button onClick={() => setTypeFilter(null)}><X size={10} /></button>
                                    </span>
                                );
                            })()}
                            {priorityFilter && (() => {
                                const pri = getPriority(priorityFilter);
                                return (
                                    <span className="on-filter-chip" style={{ background: pri.bg, color: pri.color }}>
                                        <pri.icon size={11} /> {pri.label}
                                        <button onClick={() => setPriorityFilter(null)}><X size={10} /></button>
                                    </span>
                                );
                            })()}
                            {searchQuery && (
                                <span className="on-filter-chip">
                                    <Search size={11} /> "{searchQuery}"
                                    <button onClick={() => setSearchQuery('')}><X size={10} /></button>
                                </span>
                            )}
                            <button className="on-filter-clear-all" onClick={clearAllFilters}>Clear all</button>
                        </div>
                    )}

                    {/* Bulk actions bar */}
                    {selectMode && selectedIds.size > 0 && (
                        <div className="on-bulk-wrap">
                            <span>{selectedIds.size} selected</span>
                            <div className="on-bulk-divider" />
                            <button className="on-toolbar-btn" onClick={() => handleBulkAction('read')}>
                                <MailOpen size={13} /> Read
                            </button>
                            <button className="on-toolbar-btn" onClick={() => handleBulkAction('star')}>
                                <Star size={13} /> Star
                            </button>
                            <button className="on-toolbar-btn" onClick={() => handleBulkAction('archive')}>
                                <Archive size={13} /> Archive
                            </button>
                            <div className="on-bulk-divider" />
                            <div ref={bulkRef} style={{ position: 'relative' }}>
                                <button className="on-toolbar-btn" onClick={() => setShowBulkMenu(!showBulkMenu)}>
                                    <MoreHorizontal size={13} />
                                </button>
                                {showBulkMenu && (
                                    <div className="on-bulk-menu">
                                        <button onClick={() => handleBulkAction('unread')}>
                                            <Mail size={13} /> Mark unread
                                        </button>
                                        <button onClick={() => handleBulkAction('unstar')}>
                                            <Star size={13} /> Remove star
                                        </button>
                                        <button className="danger" onClick={() => handleBulkAction('delete')}>
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Split view */}
                    <div className="on-split">
                        {/* List */}
                        <div className="on-list__scroll">
                            {loading ? (
                                <div className="on-loading">
                                    <div className="on-loading__spinner" />
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="on-empty">
                                    <div className="on-empty__hero">
                                        <div className="on-empty__icon-ring">
                                            <div className="on-empty__ring-pulse" />
                                            <div className="on-empty__icon-inner">
                                                <Bell size={28} />
                                            </div>
                                        </div>
                                        <Sparkles size={14} className="on-empty__sparkle on-empty__sparkle--1" style={{ color: '#FFD60A' }} />
                                        <Sparkles size={10} className="on-empty__sparkle on-empty__sparkle--2" style={{ color: '#5856D6' }} />
                                    </div>
                                    <h3>You're all caught up!</h3>
                                    <p>When something needs your attention, it'll show up here</p>

                                    {hasActiveFilters && (
                                        <button className="on-empty__clear-btn" onClick={clearAllFilters}>
                                            <X size={14} /> Clear filters
                                        </button>
                                    )}

                                    <div className="on-empty__tips">
                                        <h4 className="on-empty__tips-header">
                                            <Sparkles size={13} /> What you'll see here
                                        </h4>
                                        <div className="on-empty__tips-grid">
                                            {MEMBER_NOTIFICATION_TIPS.map((tip, i) => (
                                                <div className="on-empty__tip-card" key={i}>
                                                    <div className="on-empty__tip-icon" style={{ background: `${tip.color}15`, color: tip.color }}>
                                                        <tip.icon size={16} />
                                                    </div>
                                                    <div className="on-empty__tip-text">
                                                        <strong>{tip.title}</strong>
                                                        <span>{tip.desc}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                grouped.map((group, gi) => (
                                    <div className="on-group" key={gi}>
                                        <div className="on-group__header">
                                            <span className="on-group__label">{group.label}</span>
                                            <span className="on-group__line" />
                                            <span className="on-group__count">{group.items.length}</span>
                                        </div>
                                        <div className="on-group__items">
                                            {group.items.map(n => {
                                                const cat = getCategory(n.type);
                                                const CatIcon = cat.icon;
                                                const isSelected = selectedNotif?.id === n.id;
                                                const isChecked = selectedIds.has(n.id);

                                                return (
                                                    <motion.div
                                                        key={n.id}
                                                        className={`on-item ${!n.isRead ? 'unread' : ''} ${isSelected ? 'active' : ''} ${n.isStarred ? 'starred' : ''} ${n.priority === 'urgent' ? 'urgent' : ''} ${isChecked ? 'checked' : ''}`}
                                                        onClick={() => selectMode ? toggleSelect(n.id) : openNotif(n)}
                                                        layout
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        {selectMode && (
                                                            <div className="on-item__check" onClick={(e) => { e.stopPropagation(); toggleSelect(n.id); }}>
                                                                {isChecked ? <CheckCheck size={14} /> : <CircleDot size={14} />}
                                                            </div>
                                                        )}

                                                        {!n.isRead && <div className="on-item__unread-dot" />}

                                                        <div className="on-item__icon" style={{ background: cat.bg, color: cat.color }}>
                                                            <CatIcon size={15} />
                                                        </div>

                                                        <div className="on-item__body">
                                                            <div className="on-item__row1">
                                                                <span className="on-item__title">{n.title}</span>
                                                                <span className="on-item__time">{formatTime(n.createdAt)}</span>
                                                            </div>
                                                            <div className="on-item__msg">{n.message}</div>
                                                            <div className="on-item__tags">
                                                                <span className="on-tag" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                                                                {!n.isRead && <span className="on-tag on-tag--unread">New</span>}
                                                            </div>
                                                        </div>

                                                        <div className="on-item__actions">
                                                            <button
                                                                className={`on-item-act ${n.isStarred ? 'starred' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); handleToggleStar(n.id); }}
                                                                title={n.isStarred ? 'Unstar' : 'Star'}
                                                            >
                                                                <Star size={13} fill={n.isStarred ? '#FFD60A' : 'none'} />
                                                            </button>
                                                            {viewFilter === 'archived' ? (
                                                                <button className="on-item-act" onClick={(e) => { e.stopPropagation(); handleUnarchive(n.id); }} title="Restore">
                                                                    <ArchiveRestore size={13} />
                                                                </button>
                                                            ) : (
                                                                <button className="on-item-act" onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }} title="Archive">
                                                                    <Archive size={13} />
                                                                </button>
                                                            )}
                                                            <button className="on-item-act on-item-act--danger" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} title="Delete">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Detail panel */}
                        <AnimatePresence>
                            {selectedNotif && (
                                <motion.div
                                    className="on-detail"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                >
                                    <div className="on-detail__header">
                                        <span className="on-detail__header-title">Details</span>
                                        <div className="on-detail__header-actions">
                                            <button
                                                className={`on-detail-act ${selectedNotif.isStarred ? 'starred' : ''}`}
                                                onClick={() => handleToggleStar(selectedNotif.id)}
                                            >
                                                <Star size={14} fill={selectedNotif.isStarred ? '#FFD60A' : 'none'} />
                                            </button>
                                            {viewFilter === 'archived' ? (
                                                <button className="on-detail-act" onClick={() => handleUnarchive(selectedNotif.id)}>
                                                    <ArchiveRestore size={14} />
                                                </button>
                                            ) : (
                                                <button className="on-detail-act" onClick={() => handleArchive(selectedNotif.id)}>
                                                    <Archive size={14} />
                                                </button>
                                            )}
                                            <button className="on-detail-act on-detail-act--danger" onClick={() => handleDelete(selectedNotif.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                            <button className="on-detail__close" onClick={() => setSelectedNotif(null)}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="on-detail__body">
                                        {(() => {
                                            const cat = getCategory(selectedNotif.type);
                                            const pri = getPriority(selectedNotif.priority);
                                            const meta = parseMeta(selectedNotif.metadata);

                                            return (
                                                <>
                                                    <div className="on-detail__banner" style={{ background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}08)` }}>
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
                                                                        {meta.planName && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(0,122,255,0.1)', color: '#007AFF' }}>
                                                                                    <CreditCard size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Plan</span>
                                                                                    <span className="value">{meta.planName}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.trainerName && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(255,149,0,0.1)', color: '#FF9500' }}>
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
                                                                        {meta.sessionTime && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(175,82,222,0.1)', color: '#AF52DE' }}>
                                                                                    <Clock size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Session</span>
                                                                                    <span className="value">{meta.sessionTime}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.achievement && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(255,214,10,0.1)', color: '#FFD60A' }}>
                                                                                    <Trophy size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Achievement</span>
                                                                                    <span className="value">{meta.achievement}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.discount && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(255,45,85,0.1)', color: '#FF2D55' }}>
                                                                                    <Tag size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Discount</span>
                                                                                    <span className="value">{meta.discount}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {meta.expiryDate && (
                                                                            <div className="on-detail__meta-card">
                                                                                <div className="on-detail__meta-card-icon" style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}>
                                                                                    <AlertTriangle size={14} />
                                                                                </div>
                                                                                <div className="on-detail__meta-card-text">
                                                                                    <span className="label">Expiry</span>
                                                                                    <span className="value">{meta.expiryDate}</span>
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

export default MemberNotifications;
