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
    Wifi, WifiOff, CircleDot, IndianRupee, Target, Award
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

const MSG_TRUNCATE = 120;

const getDeepLink = (notif: NotificationData, meta: any): { path: string; hash?: string; label: string } | null => {
    const t = notif.type?.toUpperCase();
    if (notif.link) return { path: notif.link, label: 'Go to linked page' };
    switch (t) {
        case 'MEMBERSHIP':
            return { path: '/member/membership', label: 'View My Membership' };
        case 'BOOKING':
            return { path: '/member/bookings', label: 'View My Bookings' };
        case 'SCHEDULE':
            return { path: '/member/classes', label: 'View Classes' };
        case 'PAYMENT':
            return { path: '/member/membership', hash: 'payments', label: 'View Payment History' };
        case 'TRAINER':
            return { path: '/member/trainer', label: 'View My Trainer' };
        case 'ACHIEVEMENT':
            return { path: '/member/progress', hash: 'achievements', label: 'View Achievements' };
        case 'OFFER':
            return { path: '/member/membership', hash: 'offers', label: 'View Offers' };
        case 'ALERT':
        case 'SYSTEM':
            return { path: '/member', label: 'Go to Dashboard' };
        default:
            return null;
    }
};

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

    // Inline expand + detail modal (replaces side panel)
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [detailNotif, setDetailNotif] = useState<NotificationData | null>(null);

    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const bulkRef = useRef<HTMLDivElement>(null);

    const LS_KEY = 'mn_sidebar_open_section';
    const ALL_SECTIONS = ['views', 'categories', 'priority'];

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) {
                const openSection = JSON.parse(saved) as string | null;
                return new Set(ALL_SECTIONS.filter(s => s !== openSection));
            }
        } catch { /* ignore */ }
        // Default: only 'views' is open, rest collapsed
        return new Set<string>(['categories', 'priority']);
    });
    const [mobileSidebar, setMobileSidebar] = useState(false);

    const toggleSection = (key: string) => {
        setCollapsedSections(prev => {
            let next: Set<string>;
            if (prev.has(key)) {
                // section is currently COLLAPSED → open it, close all others
                next = new Set(ALL_SECTIONS.filter(s => s !== key));
                localStorage.setItem(LS_KEY, JSON.stringify(key));
            } else {
                // section is currently OPEN → collapse it (all closed)
                next = new Set(ALL_SECTIONS);
                localStorage.setItem(LS_KEY, JSON.stringify(null));
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

    const handleDeepLink = (notif: NotificationData, meta: any) => {
        const link = getDeepLink(notif, meta);
        if (!link) return;
        setDetailNotif(null);
        const path = link.hash ? `${link.path}?section=${link.hash}` : link.path;
        navigate(path, { state: { scrollTo: link.hash, fromNotif: notif.id } });
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

    const renderDetailModal = () => {
        if (!detailNotif) return null;
        const cat = getCategory(detailNotif.type);
        const pri = getPriority(detailNotif.priority);
        const meta = parseMeta(detailNotif.metadata);
        const deepLink = getDeepLink(detailNotif, meta);
        const metaFields = meta ? [
            meta.planName && { icon: CreditCard, label: 'Plan', value: meta.planName, color: '#007AFF' },
            meta.trainerName && { icon: Dumbbell, label: 'Trainer', value: meta.trainerName, color: '#FF9500' },
            meta.className && { icon: Calendar, label: 'Class', value: meta.className, color: '#5856D6' },
            meta.amount && { icon: IndianRupee, label: 'Amount', value: meta.amount, color: '#34C759' },
            meta.sessionTime && { icon: Clock, label: 'Session', value: meta.sessionTime, color: '#AF52DE' },
            meta.achievement && { icon: Trophy, label: 'Achievement', value: meta.achievement, color: '#FFD60A' },
            meta.discount && { icon: Tag, label: 'Discount', value: meta.discount, color: '#FF2D55' },
            meta.expiryDate && { icon: AlertTriangle, label: 'Expiry', value: meta.expiryDate, color: '#FF3B30' },
        ].filter(Boolean) : [];
        return (
            <AnimatePresence>
                <motion.div
                    className="on-modal-overlay"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setDetailNotif(null)}
                >
                    <motion.div
                        className="on-modal"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="on-modal__header" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)` }}>
                            <div className="on-modal__header-icon" style={{ background: cat.bg, color: cat.color }}>
                                <cat.icon size={22} />
                            </div>
                            <div className="on-modal__header-info">
                                <div className="on-modal__badges">
                                    <span className="on-modal__badge" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                                    <span className="on-modal__badge" style={{ background: pri.bg, color: pri.color }}>
                                        <pri.icon size={9} /> {pri.label}
                                    </span>
                                    {!detailNotif.isRead && <span className="on-modal__badge on-modal__badge--unread">Unread</span>}
                                </div>
                                <div className="on-modal__timestamp">
                                    <Clock size={11} />
                                    <span>{formatFullDate(detailNotif.createdAt)}</span>
                                </div>
                            </div>
                            <div className="on-modal__header-acts">
                                <button className={`on-detail-act ${detailNotif.isStarred ? 'starred' : ''}`} onClick={() => handleToggleStar(detailNotif.id)}>
                                    <Star size={14} fill={detailNotif.isStarred ? '#FFD60A' : 'none'} />
                                </button>
                                <button className="on-detail-act" onClick={() => viewFilter === 'archived' ? handleUnarchive(detailNotif.id) : handleArchive(detailNotif.id)}>
                                    {viewFilter === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                </button>
                                <button className="on-detail-act on-detail-act--danger" onClick={() => handleDelete(detailNotif.id)}>
                                    <Trash2 size={14} />
                                </button>
                                <button className="on-modal__close" onClick={() => setDetailNotif(null)}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="on-modal__body">
                            <h2 className="on-modal__title">{detailNotif.title}</h2>
                            <p className="on-modal__message">{detailNotif.message}</p>
                            {metaFields.length > 0 && (
                                <>
                                    <div className="on-modal__divider" />
                                    <div className="on-modal__meta-label"><Info size={12} /> Additional Details</div>
                                    <div className="on-modal__meta-grid">
                                        {metaFields.map((f: any, i) => (
                                            <div className="on-modal__meta-card" key={i}>
                                                <div className="on-modal__meta-icon" style={{ background: `${f.color}18`, color: f.color }}>
                                                    <f.icon size={13} />
                                                </div>
                                                <div className="on-modal__meta-text">
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
                                    <div className="on-modal__divider" />
                                    <button className="on-modal__goto-btn" onClick={() => handleDeepLink(detailNotif, meta)}>
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
        <>
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
                  <div className="on-content">
                      {/* Toolbar */}
                      <div className="on-toolbar">
                          <div className="on-toolbar__left">
                              <span className="on-toolbar__view-label">
                                  {activeFilterLabel}
                                  <span className="on-toolbar__count">{filteredNotifications.length}</span>
                              </span>
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
                                                          <button onClick={() => handleBulkAction('read')}><MailOpen size={14} /> Mark as Read</button>
                                                          <button onClick={() => handleBulkAction('unread')}><Mail size={14} /> Mark as Unread</button>
                                                          <button onClick={() => handleBulkAction('star')}><Star size={14} /> Star Selected</button>
                                                          <button onClick={() => handleBulkAction('archive')}><Archive size={14} /> Archive Selected</button>
                                                          <div className="on-bulk-divider" />
                                                          <button className="danger" onClick={() => handleBulkAction('delete')}><Trash2 size={14} /> Delete Selected</button>
                                                      </motion.div>
                                                  )}
                                              </AnimatePresence>
                                          </div>
                                      )}
                                  </>
                              )}
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

                      {/* Full-width list */}
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
                                              const pri = getPriority(n.priority);
                                              const meta = parseMeta(n.metadata);
                                              const isChecked = selectedIds.has(n.id);
                                              const isExpanded = expandedId === n.id;
                                              const isLong = n.message.length > MSG_TRUNCATE;

                                              return (
                                                  <motion.div
                                                      key={n.id}
                                                      className={`on-item ${!n.isRead ? 'unread' : ''} ${isExpanded ? 'expanded' : ''} ${n.isStarred ? 'starred' : ''} ${n.priority === 'urgent' ? 'urgent' : ''} ${isChecked ? 'checked' : ''}`}
                                                      onClick={() => handleCardClick(n)}
                                                      layout
                                                      initial={{ opacity: 0, y: 8 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      transition={{ duration: 0.15 }}
                                                  >
                                                      {selectMode && (
                                                          <div className={`on-item__check ${isChecked ? 'checked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleSelect(n.id); }}>
                                                              {isChecked && <Check size={10} />}
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

                                                          <p className="on-item__msg">
                                                              {isExpanded || !isLong
                                                                  ? n.message
                                                                  : n.message.slice(0, MSG_TRUNCATE) + '…'}
                                                          </p>

                                                          {isLong && (
                                                              <button
                                                                  className="on-item__show-more"
                                                                  onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : n.id); }}
                                                              >
                                                                  {isExpanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> Show more</>}
                                                              </button>
                                                          )}

                                                          <div className="on-item__tags">
                                                              <span className="on-tag" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                                                              {(n.priority === 'urgent' || n.priority === 'high') && (
                                                                  <span className="on-tag" style={{ background: pri.bg, color: pri.color }}>
                                                                      <pri.icon size={8} /> {pri.label}
                                                                  </span>
                                                              )}
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
                                                          <button
                                                              className="on-item-act on-item-act--detail"
                                                              onClick={e => openDetail(e, n)}
                                                              title="More details"
                                                          >
                                                              <MoreHorizontal size={13} />
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
                    </div>{/* closes on-content */}
                </div>{/* closes on-body */}
            </div>{/* closes on-page */}

            {/* Detail modal */}
            {renderDetailModal()}
        </>
    );
};

export default MemberNotifications;

