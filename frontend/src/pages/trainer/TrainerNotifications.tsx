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
    CircleDot, Sparkles, Target, Award, Heart, Activity, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi, type NotificationData, type NotificationStats } from '../../api/notificationApi';
import './TrainerNotifications.css';

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

const getDeepLink = (notif: NotificationData, meta: any): { path: string; hash?: string; label: string } | null => {
    const t = notif.type?.toUpperCase();
    if (notif.link) return { path: notif.link, label: 'Go to linked page' };
    switch (t) {
        case 'BOOKING':
            return { path: '/trainer/schedule', hash: 'sessions', label: 'View My Schedule' };
        case 'SCHEDULE':
            return { path: '/trainer/schedule', label: 'View Schedule' };
        case 'MEMBER':
            if (meta?.memberId) return { path: `/trainer/members`, hash: `member-${meta.memberId}`, label: 'View Client' };
            return { path: '/trainer/members', label: 'View My Clients' };
        case 'PAYMENT':
            return { path: '/trainer', hash: 'earnings', label: 'View Earnings' };
        case 'MESSAGE':
            return { path: '/trainer/messages', label: 'Open Messages' };
        case 'ACHIEVEMENT':
        case 'PROGRESS':
            if (meta?.memberId) return { path: `/trainer/members`, hash: `progress-${meta.memberId}`, label: 'View Client Progress' };
            return { path: '/trainer/progress-notes', label: 'View Progress Notes' };
        case 'ALERT':
        case 'SYSTEM':
            return { path: '/trainer', label: 'Go to Dashboard' };
        default:
            return null;
    }
};

const MSG_TRUNCATE = 120;

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

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [detailNotif, setDetailNotif] = useState<NotificationData | null>(null);

    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const bulkRef = useRef<HTMLDivElement>(null);

    const ALL_SECTIONS = ['views', 'categories', 'priority'];
    const STORAGE_KEY = 'tn_sidebar_open_section';

    const getInitialCollapsed = (): Set<string> => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const openSection = JSON.parse(saved) as string | null;
                return new Set(ALL_SECTIONS.filter(s => s !== openSection));
            }
        } catch {}
        return new Set(['categories', 'priority']);
    };

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(getInitialCollapsed);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    const toggleSection = (key: string) => {
        setCollapsedSections(prev => {
            let next: Set<string>;
            if (prev.has(key)) {
                next = new Set(ALL_SECTIONS.filter(s => s !== key));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(key));
            } else {
                next = new Set(ALL_SECTIONS);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(null));
            }
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

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetailNotif(null); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
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
            if (detailNotif?.id === id) setDetailNotif(null);
            toast.success('Archived');
            fetchData(true);
        } catch { toast.error('Failed'); }
    };

    const handleUnarchive = async (id: number) => {
        try {
            await notificationApi.unarchive(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (detailNotif?.id === id) setDetailNotif(null);
            toast.success('Restored');
            fetchData(true);
        } catch { toast.error('Failed'); }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (detailNotif?.id === id) setDetailNotif(null);
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

    const handleCardClick = (n: NotificationData) => {
        if (selectMode) { toggleSelect(n.id); return; }
        setExpandedId(prev => prev === n.id ? null : n.id);
        if (!n.isRead) handleMarkAsRead(n.id);
    };

    const openDetail = (e: React.MouseEvent, n: NotificationData) => {
        e.stopPropagation();
        setDetailNotif(n);
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

    const handleDeepLink = (notif: NotificationData, meta: any) => {
        const link = getDeepLink(notif, meta);
        if (!link) return;
        setDetailNotif(null);
        const path = link.hash ? `${link.path}?section=${link.hash}` : link.path;
        navigate(path, { state: { scrollTo: link.hash, fromNotif: notif.id } });
    };

    const renderSidebarContent = () => (
        <>
            <div className="tn-sidebar__section">
                <button className="tn-sidebar__heading" onClick={() => toggleSection('views')}>
                    <Eye size={11} />
                    <span>Views</span>
                    {collapsedSections.has('views') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('views') && (
                    <nav className="tn-nav">
                        {[
                            { key: 'all' as ViewFilter, icon: Inbox, label: 'All Inbox', count: stats?.total, color: '#007AFF' },
                            { key: 'unread' as ViewFilter, icon: Mail, label: 'Unread', count: stats?.unread, color: '#FF3B30' },
                            { key: 'starred' as ViewFilter, icon: Star, label: 'Starred', count: stats?.starred, color: '#FFCC00' },
                            { key: 'archived' as ViewFilter, icon: Archive, label: 'Archived', count: stats?.archived, color: '#8E8E93' },
                        ].map(item => (
                            <button
                                key={item.key}
                                className={`tn-nav-btn ${viewFilter === item.key && !typeFilter ? 'active' : ''}`}
                                onClick={() => { setViewFilter(item.key); setTypeFilter(null); setPriorityFilter(null); setMobileSidebar(false); }}
                            >
                                <div className="tn-nav-icon" style={{ color: viewFilter === item.key && !typeFilter ? item.color : undefined }}>
                                    <item.icon size={14} />
                                </div>
                                <span className="tn-nav-label">{item.label}</span>
                                {item.count !== undefined && item.count > 0 && (
                                    <span className={`tn-nav-count ${item.key === 'unread' && item.count > 0 ? 'tn-nav-count--alert' : ''}`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                )}
            </div>

            <div className="tn-sidebar__divider" />

            <div className="tn-sidebar__section">
                <button className="tn-sidebar__heading" onClick={() => toggleSection('categories')}>
                    <Filter size={11} />
                    <span>Categories</span>
                    {collapsedSections.has('categories') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('categories') && (
                    <nav className="tn-nav">
                        {Object.entries(CATEGORIES).map(([key, cat]) => {
                            const count = stats?.typeCounts?.[key] || stats?.typeCounts?.[key.toLowerCase()] || 0;
                            return (
                                <button
                                    key={key}
                                    className={`tn-nav-btn ${typeFilter === key ? 'active' : ''}`}
                                    onClick={() => {
                                        setTypeFilter(typeFilter === key ? null : key);
                                        setViewFilter('all');
                                        setPriorityFilter(null);
                                        setMobileSidebar(false);
                                    }}
                                >
                                    <div className="tn-nav-cat-icon" style={{ background: cat.bg, color: cat.color }}>
                                        <cat.icon size={12} />
                                    </div>
                                    <span className="tn-nav-label">{cat.label}</span>
                                    {count > 0 && <span className="tn-nav-count">{count}</span>}
                                </button>
                            );
                        })}
                    </nav>
                )}
            </div>

            <div className="tn-sidebar__divider" />

            <div className="tn-sidebar__section">
                <button className="tn-sidebar__heading" onClick={() => toggleSection('priority')}>
                    <Zap size={11} />
                    <span>Priority</span>
                    {collapsedSections.has('priority') ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsedSections.has('priority') && (
                    <nav className="tn-nav">
                        {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
                            <button
                                key={key}
                                className={`tn-nav-btn ${priorityFilter === key ? 'active' : ''}`}
                                onClick={() => { setPriorityFilter(priorityFilter === key ? null : key); setMobileSidebar(false); }}
                            >
                                <div className="tn-nav-priority-dot" style={{ background: p.color }}>
                                    <p.icon size={9} />
                                </div>
                                <span className="tn-nav-label">{p.label}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </>
    );

    const renderDetailModal = () => {
        if (!detailNotif) return null;
        const cat = getCategory(detailNotif.type);
        const pri = getPriority(detailNotif.priority);
        const meta = parseMeta(detailNotif.metaData);
        const deepLink = getDeepLink(detailNotif, meta);

        const metaFields = meta ? [
            meta.amount && { icon: IndianRupee, label: 'Amount', value: meta.amount, color: '#34C759' },
            meta.memberName && { icon: Users, label: 'Client', value: meta.memberName, color: '#AF52DE' },
            meta.className && { icon: Calendar, label: 'Class', value: meta.className, color: '#5856D6' },
            meta.sessionTime && { icon: Clock, label: 'Session Time', value: meta.sessionTime, color: '#007AFF' },
            meta.clientGoal && { icon: Target, label: 'Goal', value: meta.clientGoal, color: '#FF9500' },
            meta.achievement && { icon: Award, label: 'Achievement', value: meta.achievement, color: '#FFD60A' },
        ].filter(Boolean) : [];

        return (
            <AnimatePresence>
                <motion.div
                    className="tn-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setDetailNotif(null)}
                >
                    <motion.div
                        className="tn-modal"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="tn-modal__header" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)` }}>
                            <div className="tn-modal__header-icon" style={{ background: cat.bg, color: cat.color }}>
                                <cat.icon size={22} />
                            </div>
                            <div className="tn-modal__header-info">
                                <div className="tn-modal__badges">
                                    <span className="tn-modal__badge" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                                    <span className="tn-modal__badge" style={{ background: pri.bg, color: pri.color }}>
                                        <pri.icon size={9} /> {pri.label}
                                    </span>
                                    {!detailNotif.isRead && <span className="tn-modal__badge tn-modal__badge--unread">Unread</span>}
                                </div>
                                <div className="tn-modal__timestamp">
                                    <Clock size={11} />
                                    <span>{formatFullDate(detailNotif.createdAt)}</span>
                                </div>
                            </div>
                            <div className="tn-modal__header-acts">
                                <button
                                    className={`tn-detail-act ${detailNotif.isStarred ? 'starred' : ''}`}
                                    onClick={() => handleToggleStar(detailNotif.id)}
                                    title={detailNotif.isStarred ? 'Unstar' : 'Star'}
                                >
                                    <Star size={14} fill={detailNotif.isStarred ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    className="tn-detail-act"
                                    onClick={() => viewFilter === 'archived' ? handleUnarchive(detailNotif.id) : handleArchive(detailNotif.id)}
                                >
                                    {viewFilter === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                </button>
                                <button className="tn-detail-act tn-detail-act--danger" onClick={() => handleDelete(detailNotif.id)}>
                                    <Trash2 size={14} />
                                </button>
                                <button className="tn-modal__close" onClick={() => setDetailNotif(null)}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="tn-modal__body">
                            <h2 className="tn-modal__title">{detailNotif.title}</h2>
                            <p className="tn-modal__message">{detailNotif.message}</p>

                            {metaFields.length > 0 && (
                                <>
                                    <div className="tn-modal__divider" />
                                    <div className="tn-modal__meta-label"><Info size={12} /> Additional Details</div>
                                    <div className="tn-modal__meta-grid">
                                        {metaFields.map((f: any, i) => (
                                            <div className="tn-modal__meta-card" key={i}>
                                                <div className="tn-modal__meta-icon" style={{ background: `${f.color}18`, color: f.color }}>
                                                    <f.icon size={13} />
                                                </div>
                                                <div className="tn-modal__meta-text">
                                                    <span className="label">{f.label}</span>
                                                    <span className="value">{f.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {deepLink && (
                                <>
                                    <div className="tn-modal__divider" />
                                    <button
                                        className="tn-modal__goto-btn"
                                        onClick={() => handleDeepLink(detailNotif, meta)}
                                    >
                                        <ExternalLink size={14} />
                                        {deepLink.label}
                                        <ArrowRight size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="tn-page">
            <header className="tn-header">
                <div className="tn-header__row">
                    <div className="tn-header__left">
                        <div className="tn-header__icon-wrap">
                            <Bell size={18} />
                            {stats && stats.unread > 0 && (
                                <span className="tn-header__badge">{stats.unread > 99 ? '99+' : stats.unread}</span>
                            )}
                        </div>
                        <div className="tn-header__text">
                            <h1>Notifications</h1>
                            <div className="tn-header__meta">
                                <span className={`tn-header__live ${liveConnected ? 'connected' : 'disconnected'}`}>
                                    <CircleDot size={7} />
                                    {liveConnected ? 'Live' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {stats && (
                        <div className="tn-stats-strip">
                            {[
                                { key: 'all', icon: Inbox, num: stats.total, label: 'Total', color: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
                                { key: 'unread', icon: Mail, num: stats.unread, label: 'Unread', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
                                { key: 'urgent', icon: Zap, num: stats.urgent, label: 'Urgent', color: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
                                { key: 'starred', icon: Star, num: stats.starred, label: 'Starred', color: '#FFCC00', bg: 'rgba(255,204,0,0.12)' },
                                { key: 'archived', icon: Archive, num: stats.archived, label: 'Archived', color: '#8E8E93', bg: 'rgba(142,142,147,0.1)' },
                            ].map(s => (
                                <motion.button
                                    key={s.key}
                                    className={`tn-stat-card ${viewFilter === s.key && !typeFilter ? 'active' : ''} ${s.key === 'urgent' && priorityFilter === 'urgent' ? 'active' : ''}`}
                                    onClick={() => {
                                        if (s.key === 'urgent') { setViewFilter('all'); setTypeFilter(null); setPriorityFilter('urgent'); }
                                        else { setViewFilter(s.key as ViewFilter); setTypeFilter(null); setPriorityFilter(null); }
                                    }}
                                    whileHover={{ y: -1, scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <div className="tn-stat-icon" style={{ background: s.bg, color: s.color }}>
                                        <s.icon size={13} />
                                    </div>
                                    <div className="tn-stat-info">
                                        <span className="tn-stat-num" style={s.num > 0 ? { color: s.color } : undefined}>{s.num}</span>
                                        <span className="tn-stat-label">{s.label}</span>
                                    </div>
                                    {s.key === 'unread' && s.num > 0 && <div className="tn-stat-pulse" style={{ background: s.color }} />}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    <div className="tn-header__right">
                        <div className="tn-search-box">
                            <Search size={13} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="tn-search-clear" onClick={() => setSearchQuery('')}>
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        <button className={`tn-header-btn ${refreshing ? 'spinning' : ''}`} onClick={() => fetchData(true)} title="Refresh">
                            <RefreshCw size={14} />
                        </button>
                        <button className="tn-header-btn" onClick={handleMarkAllRead} title="Mark all read">
                            <CheckCheck size={14} />
                        </button>
                        <button className="tn-header-btn tn-header-btn--mobile-filter" onClick={() => setMobileSidebar(!mobileSidebar)} title="Filters">
                            <Filter size={14} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="tn-body">
                <aside className="tn-sidebar">
                    {renderSidebarContent()}
                </aside>

                <AnimatePresence>
                    {mobileSidebar && (
                        <>
                            <motion.div
                                className="tn-mobile-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileSidebar(false)}
                            />
                            <motion.aside
                                className="tn-mobile-sidebar"
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            >
                                <div className="tn-mobile-sidebar__header">
                                    <h3>Filters</h3>
                                    <button onClick={() => setMobileSidebar(false)}><X size={16} /></button>
                                </div>
                                {renderSidebarContent()}
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                <div className="tn-content">
                    <div className="tn-toolbar">
                        <div className="tn-toolbar__left">
                            <h3 className="tn-toolbar__view-label">
                                {activeFilterLabel}
                                <span className="tn-toolbar__count">{filteredNotifications.length}</span>
                            </h3>

                            <button
                                className={`tn-toolbar-btn ${selectMode ? 'active' : ''}`}
                                onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                            >
                                {selectMode ? <X size={13} /> : <Check size={13} />}
                                <span>{selectMode ? 'Cancel' : 'Select'}</span>
                            </button>

                            {selectMode && (
                                <>
                                    <button className="tn-toolbar-btn" onClick={selectAll}>
                                        <CheckCheck size={13} />
                                        <span>{selectedIds.size === filteredNotifications.length ? 'Deselect' : 'All'}</span>
                                    </button>
                                    {selectedIds.size > 0 && (
                                        <div className="tn-bulk-wrap" ref={bulkRef}>
                                            <button className="tn-toolbar-btn tn-toolbar-btn--accent" onClick={() => setShowBulkMenu(!showBulkMenu)}>
                                                <MoreHorizontal size={13} />
                                                <span>Actions ({selectedIds.size})</span>
                                                <ChevronDown size={11} />
                                            </button>
                                            <AnimatePresence>
                                                {showBulkMenu && (
                                                    <motion.div
                                                        className="tn-bulk-menu"
                                                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <button onClick={() => handleBulkAction('read')}><MailOpen size={14} /> Mark as Read</button>
                                                        <button onClick={() => handleBulkAction('unread')}><Mail size={14} /> Mark as Unread</button>
                                                        <button onClick={() => handleBulkAction('star')}><Star size={14} /> Star Selected</button>
                                                        <button onClick={() => handleBulkAction('archive')}><Archive size={14} /> Archive Selected</button>
                                                        <div className="tn-bulk-divider" />
                                                        <button className="danger" onClick={() => handleBulkAction('delete')}><Trash2 size={14} /> Delete Selected</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="tn-toolbar__right">
                            {hasActiveFilters && (
                                <div className="tn-active-filters">
                                    {typeFilter && (
                                        <span className="tn-filter-chip" style={{ background: `${getCategory(typeFilter).color}15`, color: getCategory(typeFilter).color }}>
                                            {getCategory(typeFilter).label}
                                            <button onClick={() => setTypeFilter(null)}><X size={10} /></button>
                                        </span>
                                    )}
                                    {priorityFilter && (
                                        <span className="tn-filter-chip" style={{ background: `${getPriority(priorityFilter).color}15`, color: getPriority(priorityFilter).color }}>
                                            {getPriority(priorityFilter).label}
                                            <button onClick={() => setPriorityFilter(null)}><X size={10} /></button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="tn-filter-chip">
                                            <Search size={10} />"{searchQuery}"
                                            <button onClick={() => setSearchQuery('')}><X size={10} /></button>
                                        </span>
                                    )}
                                    <button className="tn-filter-clear-all" onClick={clearAllFilters}>Clear all</button>
                                </div>
                            )}
                            <span className="tn-result-count">
                                {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="tn-list__scroll">
                        {loading ? (
                            <div className="tn-loading">
                                <div className="tn-loading__spinner" />
                                <p>Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="tn-empty">
                                <div className="tn-empty__hero">
                                    <div className="tn-empty__icon-ring">
                                        <div className="tn-empty__icon-inner">
                                            {viewFilter === 'starred' ? <Star size={32} /> :
                                             viewFilter === 'archived' ? <Archive size={32} /> :
                                             viewFilter === 'unread' ? <CheckCheck size={32} /> :
                                             searchQuery ? <Search size={32} /> :
                                             <Bell size={32} />}
                                        </div>
                                        <div className="tn-empty__ring-pulse" />
                                    </div>
                                    <h2>
                                        {searchQuery ? `No results for "${searchQuery}"` :
                                         viewFilter === 'archived' ? 'No archived notifications' :
                                         viewFilter === 'starred' ? 'No starred notifications' :
                                         viewFilter === 'unread' ? "You're all caught up!" :
                                         'No notifications yet'}
                                    </h2>
                                    <p>
                                        {searchQuery ? 'Try a different search term or clear your filters.' :
                                         viewFilter === 'unread' ? "Great job! You've read all your notifications." :
                                         viewFilter !== 'all' ? `You have no ${viewFilter} notifications right now.` :
                                         'As you train clients and manage sessions, notifications will appear here to keep you informed.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button className="tn-empty__clear-btn" onClick={clearAllFilters}>
                                            <X size={14} /> Clear all filters
                                        </button>
                                    )}
                                </div>

                                {!hasActiveFilters && viewFilter === 'all' && (
                                    <div className="tn-empty__tips">
                                        <div className="tn-empty__tips-header">
                                            <Sparkles size={14} />
                                            <span>What notifications will you receive?</span>
                                        </div>
                                        <div className="tn-empty__tips-grid">
                                            {TRAINER_NOTIFICATION_TIPS.map((tip, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="tn-empty__tip-card"
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.07, duration: 0.35 }}
                                                >
                                                    <div className="tn-empty__tip-icon" style={{ background: `${tip.color}18`, color: tip.color }}>
                                                        <tip.icon size={18} />
                                                    </div>
                                                    <div className="tn-empty__tip-text">
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
                            grouped.map(group => (
                                <div key={group.label} className="tn-group">
                                    <div className="tn-group__header">
                                        <span className="tn-group__label">{group.label}</span>
                                        <span className="tn-group__count">{group.items.length}</span>
                                        <div className="tn-group__line" />
                                    </div>
                                    <div className="tn-group__items">
                                        <AnimatePresence>
                                            {group.items.map(notif => {
                                                const cat = getCategory(notif.type);
                                                const pri = getPriority(notif.priority);
                                                const meta = parseMeta(notif.metaData);
                                                const isSelected = selectedIds.has(notif.id);
                                                const isExpanded = expandedId === notif.id;
                                                const isLong = notif.message.length > MSG_TRUNCATE;

                                                return (
                                                    <motion.div
                                                        key={notif.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                                        className={`tn-item ${!notif.isRead ? 'unread' : ''} ${isExpanded ? 'expanded' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                                                        onClick={() => handleCardClick(notif)}
                                                    >
                                                        {selectMode && (
                                                            <div className={`tn-item__check ${isSelected ? 'checked' : ''}`}>
                                                                {isSelected && <Check size={10} />}
                                                            </div>
                                                        )}

                                                        {!notif.isRead && <div className="tn-item__unread-dot" />}

                                                        <div className="tn-item__icon" style={{ background: cat.bg, color: cat.color }}>
                                                            <cat.icon size={16} />
                                                        </div>

                                                        <div className="tn-item__body">
                                                            <div className="tn-item__row1">
                                                                <span className="tn-item__title">{notif.title}</span>
                                                                <span className="tn-item__time">{formatTime(notif.createdAt)}</span>
                                                            </div>

                                                            <p className="tn-item__msg">
                                                                {isExpanded || !isLong
                                                                    ? notif.message
                                                                    : notif.message.slice(0, MSG_TRUNCATE) + '…'}
                                                            </p>

                                                            {isLong && (
                                                                <button
                                                                    className="tn-item__show-more"
                                                                    onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : notif.id); }}
                                                                >
                                                                    {isExpanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> Show more</>}
                                                                </button>
                                                            )}

                                                            <div className="tn-item__tags">
                                                                <span className="tn-tag" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                                                                {(notif.priority === 'urgent' || notif.priority === 'high') && (
                                                                    <span className="tn-tag" style={{ background: pri.bg, color: pri.color }}>
                                                                        <pri.icon size={8} /> {pri.label}
                                                                    </span>
                                                                )}
                                                                {meta?.amount && (
                                                                    <span className="tn-tag tn-tag--money">
                                                                        <IndianRupee size={8} /> {meta.amount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="tn-item__actions">
                                                            <button
                                                                className={`tn-item-act ${notif.isStarred ? 'starred' : ''}`}
                                                                onClick={e => { e.stopPropagation(); handleToggleStar(notif.id); }}
                                                                title={notif.isStarred ? 'Unstar' : 'Star'}
                                                            >
                                                                <Star size={13} fill={notif.isStarred ? 'currentColor' : 'none'} />
                                                            </button>
                                                            {viewFilter === 'archived' ? (
                                                                <button className="tn-item-act" onClick={e => { e.stopPropagation(); handleUnarchive(notif.id); }} title="Restore">
                                                                    <ArchiveRestore size={13} />
                                                                </button>
                                                            ) : (
                                                                <button className="tn-item-act" onClick={e => { e.stopPropagation(); handleArchive(notif.id); }} title="Archive">
                                                                    <Archive size={13} />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="tn-item-act tn-item-act--danger"
                                                                onClick={e => { e.stopPropagation(); handleDelete(notif.id); }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                            <button
                                                                className="tn-item-act tn-item-act--detail"
                                                                onClick={e => openDetail(e, notif)}
                                                                title="More details"
                                                            >
                                                                <MoreHorizontal size={13} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {renderDetailModal()}
        </div>
    );
};

export default TrainerNotifications;
