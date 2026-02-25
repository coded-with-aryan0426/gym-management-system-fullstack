import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Filter, MessageSquare, Calendar, ChevronDown, Grid, List,
    TrendingUp, Clock, Users, Download, Target, ArrowUpDown, AlertTriangle,
    Zap, Star, Activity, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../../services/trainerApi';
import chatApi from '../../services/chatApi';
import './MyMembers.css';

// Goal → color palette
const GOAL_COLORS: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    'Weight Loss':   { bg: 'rgba(239,68,68,0.12)',   color: '#EF4444', icon: <TrendingUp size={10}/> },
    'Muscle Gain':   { bg: 'rgba(168,85,247,0.12)',  color: '#A855F7', icon: <Zap size={10}/> },
    'Endurance':     { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6', icon: <Activity size={10}/> },
    'Rehabilitation':{ bg: 'rgba(16,185,129,0.12)',  color: '#10B981', icon: <Shield size={10}/> },
    'Flexibility':   { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', icon: <Star size={10}/> },
};

const getGoalStyle = (goal: string) =>
    GOAL_COLORS[goal] ?? { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8', icon: <Target size={10}/> };

// Deterministic avatar gradient from name
const AVATAR_GRADIENTS = [
    ['#EF4444','#F97316'], ['#8B5CF6','#EC4899'], ['#3B82F6','#06B6D4'],
    ['#10B981','#84CC16'], ['#F59E0B','#EF4444'], ['#06B6D4','#8B5CF6'],
];
const getAvatarGradient = (name: string) => {
    const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
};

const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'lastSession' | 'daysLeft'>('name');

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { loadMembers(); }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const data = await trainerApi.getMyMembers();
            setMembers(data);
        } catch (err) {
            console.error('Failed to fetch members:', err);
            setError('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    function getDaysLeft(dateStr: string): number {
        if (!dateStr || dateStr === 'Never') return 999;
        if (dateStr === 'Today') return 0;
        if (dateStr === 'Yesterday') return 1;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 999;
        const diffTime = Math.abs(new Date().getTime() - date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const stats = useMemo(() => {
        const activeCount   = members.filter(m => m.status === 'ACTIVE').length;
        const needsAttention= members.filter(m => m.status === 'INACTIVE' || getDaysLeft(m.lastSession) > 14).length;
        const expiringSoon  = members.filter(m => m.daysLeft > 0 && m.daysLeft <= 7).length;
        const todayStr      = new Date().toISOString().split('T')[0];
        const todaySessions = members.filter(m => m.lastSession === todayStr || m.lastSession === 'Today').length;
        return { activeCount, needsAttention, expiringSoon, todaySessions, total: members.length };
    }, [members]);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || m.status === filter.toUpperCase();
        if (quickFilter === 'needs-attention')
            return matchesSearch && matchesFilter && (m.status === 'INACTIVE' || getDaysLeft(m.lastSession) > 14);
        if (quickFilter === 'expiring-soon')
            return matchesSearch && matchesFilter && m.daysLeft > 0 && m.daysLeft <= 7;
        if (quickFilter === 'today') {
            const todayStr = new Date().toISOString().split('T')[0];
            return matchesSearch && matchesFilter && (m.lastSession === todayStr || m.lastSession === 'Today');
        }
        return matchesSearch && matchesFilter;
    });

    const sortedMembers = useMemo(() => {
        return [...filteredMembers].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'daysLeft') return (a.daysLeft ?? 999) - (b.daysLeft ?? 999);
            if (sortBy === 'lastSession') return getDaysLeft(a.lastSession) - getDaysLeft(b.lastSession);
            return 0;
        });
    }, [filteredMembers, sortBy]);

    const toggleQuickFilter = (f: string) => setQuickFilter(prev => prev === f ? null : f);

    const handleMessage = async (member: any) => {
        try {
            const memberId = member.id || member.userId;
            const conversation = await chatApi.startPrivateChat(memberId);
            navigate('/trainer/messages', { state: { activeConversationId: conversation.conversationId } });
        } catch { alert('Could not start chat. Please try again.'); }
    };

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Plan', 'Classes', 'Last Session'];
        const rows = sortedMembers.map(m =>
            [m.name, m.email, m.phone, m.status, m.plan, m.stats.classes, m.lastSession]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'my-members.csv'; a.click();
    };

    // Membership progress bar (0-100)
    const getMembershipProgress = (daysLeft: number) => {
        if (!daysLeft || daysLeft <= 0) return 0;
        const total = 30; // assume monthly plan
        return Math.min(100, Math.round((daysLeft / total) * 100));
    };

    return (
        <div className="mm">
            {/* ── TOPBAR: title + stats + export all in one row ── */}
            <div className="mm__topbar">
                {/* Left: icon + title + subtitle */}
                <div className="mm__title-block">
                    <div className="mm__title-icon"><Users size={18}/></div>
                    <div>
                        <h1 className="mm__title">My Members</h1>
                        <p className="mm__subtitle">Track and manage your assigned clients</p>
                    </div>
                </div>

                {/* Centre: 4 inline stat pills */}
                <div className="mm__stat-pills">
                    {[
                        { label: 'Total Members', value: stats.total,          gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: '#6366f1',  icon: <Users size={13}/> },
                        { label: 'Active',        value: stats.activeCount,    gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: '#10b981',  icon: <Activity size={13}/> },
                        { label: 'At Risk',       value: stats.needsAttention, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: '#f59e0b',  icon: <AlertTriangle size={13}/> },
                        { label: 'Expiring Soon', value: stats.expiringSoon,   gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', glow: '#ef4444',  icon: <Clock size={13}/> },
                    ].map(({ label, value, gradient, glow, icon }) => (
                        <div key={label} className="mm__stat-pill" style={{ '--pill-glow': glow } as any}>
                            <div className="mm__stat-pill-icon" style={{ background: gradient }}>{icon}</div>
                            <div className="mm__stat-pill-body">
                                <span className="mm__stat-pill-val">{value}</span>
                                <span className="mm__stat-pill-lbl">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: export button */}
                <button className="mm__export-btn" onClick={handleExport}>
                    <Download size={13}/>
                    <span>Export CSV</span>
                </button>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="mm__filterbar">
                {/* Quick filter pills */}
                <div className="mm__quick-filters">
                    {[
                        { key: 'today',           icon: <Calendar size={12}/>,   label: "Today's Sessions", count: stats.todaySessions,  accent: '#3B82F6' },
                        { key: 'needs-attention', icon: <Clock size={12}/>,      label: 'Needs Attention',  count: stats.needsAttention, accent: '#F59E0B' },
                        { key: 'expiring-soon',   icon: <TrendingUp size={12}/>, label: 'Expiring Soon',    count: stats.expiringSoon,   accent: '#EF4444' },
                    ].map(({ key, icon, label, count, accent }) => (
                        <button
                            key={key}
                            className={`mm__qbtn ${quickFilter === key ? 'mm__qbtn--active' : ''}`}
                            style={quickFilter === key ? { '--qbtn-accent': accent } as any : {}}
                            onClick={() => toggleQuickFilter(key)}
                        >
                            <span className="mm__qbtn-icon" style={{ color: accent }}>{icon}</span>
                            <span>{label}</span>
                            {count > 0 && (
                                <span className="mm__qbtn-badge" style={{ background: `${accent}22`, color: accent }}>{count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search + controls */}
                <div className="mm__controls">
                    <div className="mm__search">
                        <Search size={14} className="mm__search-icon"/>
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="mm__search-clear" onClick={() => setSearchQuery('')}>×</button>
                        )}
                    </div>
                    <div className="mm__select-wrap">
                        <Filter size={13} className="mm__select-icon"/>
                        <select value={filter} onChange={e => setFilter(e.target.value)}>
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <ChevronDown size={12} className="mm__select-arrow"/>
                    </div>
                    <div className="mm__view-toggle">
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid view">
                            <Grid size={14}/>
                        </button>
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="List view">
                            <List size={14}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── SORT BAR ── */}
            <div className="mm__sort-bar">
                <span className="mm__results-count">
                    <span className="mm__results-num">{sortedMembers.length}</span> members
                    {quickFilter && <span className="mm__filter-tag">filtered</span>}
                </span>
                <div className="mm__sort-select">
                    <ArrowUpDown size={12}/>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                        <option value="name">Sort: Name</option>
                        <option value="lastSession">Sort: Last Session</option>
                        <option value="daysLeft">Sort: Days Left</option>
                    </select>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="mm__content">
                {loading ? (
                    <div className="mm__loading">
                        <div className="mm__spinner"/>
                        <span>Loading members…</span>
                    </div>
                ) : error ? (
                    <div className="mm__error">
                        <AlertTriangle size={28}/>
                        <p>{error}</p>
                    </div>
                ) : sortedMembers.length === 0 ? (
                    <div className="mm__empty">
                        <div className="mm__empty-icon"><Users size={36}/></div>
                        <p className="mm__empty-title">No members found</p>
                        <p className="mm__empty-sub">Try adjusting your search or filters</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="mm__grid">
                        {sortedMembers.map(member => {
                            const [g1, g2] = getAvatarGradient(member.name);
                            const goalStyle = getGoalStyle(member.goal);
                            const progress = getMembershipProgress(member.daysLeft);
                            const isActive = member.status === 'ACTIVE';
                            return (
                                <div key={member.id} className={`mmc ${isActive ? 'mmc--active' : 'mmc--inactive'}`}>
                                    {/* Card top accent */}
                                    <div className="mmc__accent" style={{ background: `linear-gradient(90deg,${g1},${g2})` }}/>

                                    <div className="mmc__head">
                                        <div className="mmc__avatar" style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`mmc__status mmc__status--${member.status.toLowerCase()}`}>
                                            <span className="mmc__status-dot"/>
                                            {member.status}
                                        </span>
                                    </div>

                                    <div className="mmc__info">
                                        <h3 className="mmc__name">{member.name}</h3>
                                        <p className="mmc__plan">{member.plan}</p>
                                    </div>

                                    <div className="mmc__tags">
                                        <span className="mmc__goal-tag" style={{ background: goalStyle.bg, color: goalStyle.color }}>
                                            {goalStyle.icon}
                                            {member.goal}
                                        </span>
                                        <span className="mmc__session-tag">
                                            <Clock size={10}/>
                                            {member.lastSession}
                                        </span>
                                    </div>

                                    {/* Membership progress */}
                                    <div className="mmc__progress-wrap">
                                        <div className="mmc__progress-label">
                                            <span>{member.daysLeft > 0 ? `${member.daysLeft} days left` : 'Expired'}</span>
                                            <span className="mmc__progress-pct">{progress}%</span>
                                        </div>
                                        <div className="mmc__progress-bar">
                                            <div
                                                className="mmc__progress-fill"
                                                style={{
                                                    width: `${progress}%`,
                                                    background: progress > 50
                                                        ? `linear-gradient(90deg,${g1},${g2})`
                                                        : progress > 20
                                                        ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                                                        : 'linear-gradient(90deg,#ef4444,#dc2626)',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mmc__divider"/>

                                    <div className="mmc__stats">
                                        {[
                                            { label: 'Classes', value: member.stats.classes, color: g1 },
                                            { label: 'Weight',  value: member.stats.weight,  color: g2 },
                                            { label: 'PT',      value: member.stats.pt,       color: '#8b5cf6' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="mmc__stat">
                                                <span className="mmc__stat-val" style={{ color }}>{value}</span>
                                                <span className="mmc__stat-lbl">{label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mmc__actions">
                                        <button
                                            className="mmc__btn-primary"
                                            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
                                            onClick={() => alert(`Viewing profile for ${member.name}`)}
                                        >
                                            View Profile
                                        </button>
                                        <button className="mmc__btn-icon" onClick={() => handleMessage(member)} title="Message">
                                            <MessageSquare size={14}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mm__list">
                        {sortedMembers.map(member => {
                            const [g1, g2] = getAvatarGradient(member.name);
                            const goalStyle = getGoalStyle(member.goal);
                            const isActive = member.status === 'ACTIVE';
                            return (
                                <div key={member.id} className={`mml ${isActive ? 'mml--active' : 'mml--inactive'}`}>
                                    <div className="mml__left-bar" style={{ background: `linear-gradient(180deg,${g1},${g2})` }}/>
                                    <div className="mml__avatar" style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="mml__info">
                                        <span className="mml__name">{member.name}</span>
                                        <span className="mml__sub">{member.email}</span>
                                    </div>
                                    <span className="mml__goal" style={{ background: goalStyle.bg, color: goalStyle.color }}>
                                        {goalStyle.icon}{member.goal}
                                    </span>
                                    <span className="mml__session"><Clock size={11}/>{member.lastSession}</span>
                                    <span className={`mml__status mml__status--${member.status.toLowerCase()}`}>
                                        <span className="mml__status-dot"/>{member.status}
                                    </span>
                                    <div className="mml__stats">
                                        <div className="mml__stat"><span className="mml__stat-val" style={{ color: g1 }}>{member.stats.classes}</span><span className="mml__stat-lbl">Classes</span></div>
                                        <div className="mml__stat"><span className="mml__stat-val" style={{ color: g2 }}>{member.stats.weight}</span><span className="mml__stat-lbl">Weight</span></div>
                                        <div className="mml__stat"><span className="mml__stat-val" style={{ color: '#8b5cf6' }}>{member.stats.pt}</span><span className="mml__stat-lbl">PT</span></div>
                                    </div>
                                    <div className="mml__actions">
                                        <button
                                            className="mml__btn-primary"
                                            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
                                            onClick={() => alert(`Viewing profile for ${member.name}`)}
                                        >View</button>
                                        <button className="mml__btn-icon" onClick={() => handleMessage(member)} title="Message">
                                            <MessageSquare size={13}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMembers;
