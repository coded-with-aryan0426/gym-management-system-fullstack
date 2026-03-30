import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Users, IndianRupee, AlertTriangle, Calendar,
    Package, Settings, FileText, Search, CheckCheck,
    Star, Trash2, Archive, Clock, TrendingUp,
    UserPlus, CreditCard, AlertCircle, Dumbbell, Inbox,
    ChevronRight, Filter, X, Check, MoreHorizontal,
    RefreshCw, ExternalLink,
    Zap, Eye, ArchiveRestore,
    ChevronDown, Mail, MailOpen, BellRing, Activity,
    BellOff, Sparkles, ArrowRight, ChevronUp, Heart,
    MessageSquare, BarChart3, Megaphone, Info, Volume2,
    Wifi, WifiOff, CircleDot, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi, type NotificationData, type NotificationStats } from '../../api/notificationApi';
import './OwnerNotifications.css';

const CATEGORIES: Record<string, { icon: any; label: string; color: string; bg: string; desc: string }> = {
    PAYMENT: { icon: IndianRupee, label: 'Payments', color: '#34C759', bg: 'rgba(52,199,89,0.12)', desc: 'Revenue & billing updates' },
    MEMBERSHIP: { icon: CreditCard, label: 'Memberships', color: '#007AFF', bg: 'rgba(0,122,255,0.12)', desc: 'Renewals & expirations' },
    BOOKING: { icon: Calendar, label: 'Bookings', color: '#5856D6', bg: 'rgba(88,86,214,0.12)', desc: 'Class & session bookings' },
    SCHEDULE: { icon: Clock, label: 'Schedule', color: '#AF52DE', bg: 'rgba(175,82,222,0.12)', desc: 'Timetable changes' },
    MEMBER: { icon: Users, label: 'Members', color: '#007AFF', bg: 'rgba(0,122,255,0.12)', desc: 'Signups & activity' },
    TRAINER: { icon: Dumbbell, label: 'Trainers', color: '#AF52DE', bg: 'rgba(175,82,222,0.12)', desc: 'Leave & assignments' },
    INVENTORY: { icon: Package, label: 'Inventory', color: '#FF9500', bg: 'rgba(255,149,0,0.12)', desc: 'Stock & equipment' },
    ANNOUNCEMENT: { icon: Megaphone, label: 'Announcements', color: '#FF2D55', bg: 'rgba(255,45,85,0.12)', desc: 'System broadcasts' },
    REPORT: { icon: BarChart3, label: 'Reports', color: '#5AC8FA', bg: 'rgba(90,200,250,0.12)', desc: 'Generated reports' },
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

const GYM_NOTIFICATION_TIPS = [
    { icon: CreditCard, title: 'Membership Alerts', desc: 'Get notified when memberships are about to expire so you can follow up with renewals.', color: '#007AFF' },
    { icon: IndianRupee, title: 'Payment Tracking', desc: 'Receive instant alerts for successful payments, failed transactions, and overdue invoices.', color: '#34C759' },
    { icon: Users, title: 'Member Activity', desc: 'Stay informed about new sign-ups, check-ins, and members who haven\'t visited recently.', color: '#5856D6' },
    { icon: Dumbbell, title: 'Trainer Updates', desc: 'Track trainer leave requests, schedule changes, and session completion reports.', color: '#AF52DE' },
    { icon: Package, title: 'Inventory Alerts', desc: 'Never run out of supplies. Get notified when equipment needs maintenance or stock is low.', color: '#FF9500' },
    { icon: AlertTriangle, title: 'Critical Alerts', desc: 'Immediate notifications for emergencies, system issues, or policy violations.', color: '#FF3B30' },
];

// Maps a notification to the best deep-link route + tab
const getDeepLink = (notif: NotificationData, meta: any): { path: string; tab?: string; label: string } | null => {
    const t = notif.type?.toUpperCase();
    // NOTE: deliberately NOT using notif.link — it points to staff routes
    switch (t) {
        case 'PAYMENT':
            if (meta?.memberId) return { path: `/members/${meta.memberId}`, tab: 'payments', label: 'View Payment' };
            return { path: '/financials', tab: 'payments', label: 'View in Financials' };
        case 'MEMBERSHIP':
            if (meta?.memberId) return { path: `/members/${meta.memberId}`, tab: 'payments', label: 'View Membership' };
            return { path: '/members', label: 'View Members' };
        case 'BOOKING':
            if (meta?.memberId) return { path: `/members/${meta.memberId}`, tab: 'sessions', label: 'View Bookings' };
            return { path: '/classes', label: 'View Bookings' };
        case 'SCHEDULE':
            return { path: '/classes', label: 'View Schedule' };
        case 'MEMBER':
            if (meta?.memberId) return { path: `/members/${meta.memberId}`, tab: 'overview', label: 'View Member Profile' };
            return { path: '/members', label: 'View Members' };
        case 'TRAINER':
            if (meta?.trainerId) return { path: `/trainers/${meta.trainerId}`, tab: 'overview', label: 'View Trainer Profile' };
            return { path: '/trainers', label: 'View Trainers' };
        case 'INVENTORY':
            return { path: '/equipment', label: 'View Equipment' };
        case 'REPORT':
            return { path: '/financials', label: 'View Reports' };
        case 'ALERT':
        case 'SYSTEM':
            return { path: '/dashboard', label: 'Go to Dashboard' };
        default:
            return null;
    }
};

const MSG_TRUNCATE = 120;

const OwnerNotifications: React.FC = () => {
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

    // Inline expanded card
    const [expandedId, setExpandedId] = useState<number | null>(null);
    // Detail modal (three-dot)
    const [detailNotif, setDetailNotif] = useState<NotificationData | null>(null);

    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const bulkRef = useRef<HTMLDivElement>(null);
    const fetchErrorShownRef = useRef(false);

    const ALL_SECTIONS = ['views', 'categories', 'priority'];
    const STORAGE_KEY = 'on_sidebar_open_section';

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
            fetchErrorShownRef.current = false;
        } catch (err) {
            setLiveConnected(false);
            if (!fetchErrorShownRef.current) {
                toast.error('Could not load notifications right now. Retrying automatically.');
                fetchErrorShownRef.current = true;
            }
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

    // Close detail modal on Escape
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
        const path = link.tab ? `${link.path}?tab=${link.tab}` : link.path;
        navigate(path, { state: { fromNotif: notif.id } });
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

    const renderDetailModal = () => {
        if (!detailNotif) return null;
        const cat = getCategory(detailNotif.type);
        const pri = getPriority(detailNotif.priority);
        const meta = parseMeta(detailNotif.metaData);
        const deepLink = getDeepLink(detailNotif, meta);

        const metaFields = meta ? [
            meta.amount && { icon: IndianRupee, label: 'Amount', value: meta.amount, color: '#34C759' },
            meta.memberName && { icon: Users, label: 'Member', value: meta.memberName, color: '#007AFF' },
            meta.trainerName && { icon: Dumbbell, label: 'Trainer', value: meta.trainerName, color: '#AF52DE' },
            meta.className && { icon: Calendar, label: 'Class', value: meta.className, color: '#5856D6' },
            meta.planName && { icon: CreditCard, label: 'Plan', value: meta.planName, color: '#007AFF' },
            meta.sessionTime && { icon: Clock, label: 'Session Time', value: meta.sessionTime, color: '#007AFF' },
            meta.expiryDate && { icon: AlertTriangle, label: 'Expiry', value: meta.expiryDate, color: '#FF3B30' },
            meta.discount && { icon: Megaphone, label: 'Discount', value: meta.discount, color: '#FF2D55' },
        ].filter(Boolean) : [];

        return (
            <AnimatePresence>
                <motion.div
                    className="on-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                        {/* Modal header */}
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
                                <button
                                    className={`on-detail-act ${detailNotif.isStarred ? 'starred' : ''}`}
                                    onClick={() => handleToggleStar(detailNotif.id)}
                                    title={detailNotif.isStarred ? 'Unstar' : 'Star'}
                                >
                                    <Star size={14} fill={detailNotif.isStarred ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    className="on-detail-act"
                                    onClick={() => viewFilter === 'archived' ? handleUnarchive(detailNotif.id) : handleArchive(detailNotif.id)}
                                    title={viewFilter === 'archived' ? 'Restore' : 'Archive'}
                                >
                                    {viewFilter === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                </button>
                                <button className="on-detail-act on-detail-act--danger" onClick={() => handleDelete(detailNotif.id)} title="Delete">
                                    <Trash2 size={14} />
                                </button>
                                <button className="on-modal__close" onClick={() => setDetailNotif(null)}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Modal body */}
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
                                    <button
                                        className="on-modal__goto-btn"
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
                            <h3 className="on-toolbar__view-label">
                                {activeFilterLabel}
                                <span className="on-toolbar__count">{filteredNotifications.length}</span>
                            </h3>

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
                                            <Search size={10} />"{searchQuery}"
                                            <button onClick={() => setSearchQuery('')}><X size={10} /></button>
                                        </span>
                                    )}
                                    <button className="on-filter-clear-all" onClick={clearAllFilters}>Clear all</button>
                                </div>
                            )}
                            <span className="on-result-count">
                                {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Full-width list (no split) */}
                    <div className="on-list__scroll">
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
                                         'As your gym operates, notifications will appear here to keep you informed about everything important.'}
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
                                            {GYM_NOTIFICATION_TIPS.map((tip, i) => (
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
                            grouped.map(group => (
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
                                                const isExpanded = expandedId === notif.id;
                                                const isLong = notif.message.length > MSG_TRUNCATE;

                                                return (
                                                    <motion.div
                                                        key={notif.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                                        className={`on-item ${!notif.isRead ? 'unread' : ''} ${isExpanded ? 'expanded' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                                                        onClick={() => handleCardClick(notif)}
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

                                                            <p className="on-item__msg">
                                                                {isExpanded || !isLong
                                                                    ? notif.message
                                                                    : notif.message.slice(0, MSG_TRUNCATE) + '…'}
                                                            </p>

                                                            {isLong && (
                                                                <button
                                                                    className="on-item__show-more"
                                                                    onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : notif.id); }}
                                                                >
                                                                    {isExpanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> Show more</>}
                                                                </button>
                                                            )}

                                                              <div className="on-item__tags">
                                                                  <span className="on-tag" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
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

                                                              {(() => {
                                                                  const deepLink = getDeepLink(notif, meta);
                                                                  return deepLink ? (
                                                                      <button
                                                                          className="on-item__goto"
                                                                          onClick={e => { e.stopPropagation(); handleDeepLink(notif, meta); }}
                                                                      >
                                                                          <ExternalLink size={11} />
                                                                          {deepLink.label}
                                                                          <ArrowRight size={11} />
                                                                      </button>
                                                                  ) : null;
                                                              })()}
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
                                                                <button className="on-item-act" onClick={e => { e.stopPropagation(); handleUnarchive(notif.id); }} title="Restore">
                                                                    <ArchiveRestore size={13} />
                                                                </button>
                                                            ) : (
                                                                <button className="on-item-act" onClick={e => { e.stopPropagation(); handleArchive(notif.id); }} title="Archive">
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
                                                            <button
                                                                className="on-item-act on-item-act--detail"
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

            {/* Detail modal */}
            {renderDetailModal()}
        </div>
    );
};

export default OwnerNotifications;
