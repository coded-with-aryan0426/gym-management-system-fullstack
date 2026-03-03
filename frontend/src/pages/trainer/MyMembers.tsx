import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Search, Filter, MessageSquare, Calendar, ChevronDown, Grid, List,
    TrendingUp, Clock, Users, Download, Target, ArrowUpDown, AlertTriangle,
    Zap, Star, Activity, Shield, X, ChevronRight, Mail, Phone,
    Dumbbell, BarChart2, FileText, AlertCircle
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { trainerApi } from '../../services/trainerApi';
import chatApi from '../../services/chatApi';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import TrainerRequestPanel, { type TrainerRequestData } from './TrainerRequestPanel';
import './MyMembers.css';

// ── Goal → color palette ────────────────────────────────────────────────────
const GOAL_COLORS: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    'Weight Loss': { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', icon: <TrendingUp size={10} /> },
    'Muscle Gain': { bg: 'rgba(168,85,247,0.12)', color: '#A855F7', icon: <Zap size={10} /> },
    'Endurance': { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', icon: <Activity size={10} /> },
    'Rehabilitation': { bg: 'rgba(16,185,129,0.12)', color: '#10B981', icon: <Shield size={10} /> },
    'Flexibility': { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', icon: <Star size={10} /> },
};
const getGoalStyle = (goal: string) =>
    GOAL_COLORS[goal] ?? { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8', icon: <Target size={10} /> };

// ── Deterministic avatar gradient ───────────────────────────────────────────
const AVATAR_GRADIENTS = [
    ['#EF4444', '#F97316'], ['#8B5CF6', '#EC4899'], ['#3B82F6', '#06B6D4'],
    ['#10B981', '#84CC16'], ['#F59E0B', '#EF4444'], ['#06B6D4', '#8B5CF6'],
];
const getAvatarGradient = (name: string) => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

// ── At-risk: not seen in 7+ days ────────────────────────────────────────────
const isAtRisk = (lastSession: string): boolean => {
    if (!lastSession || lastSession === 'Never') return true;
    if (lastSession === 'Today') return false;
    const date = new Date(lastSession);
    if (isNaN(date.getTime())) return false;
    return (Date.now() - date.getTime()) / 86400000 >= 7;
};

// ── Member detail panel ─────────────────────────────────────────────────────
interface MemberDetailPanelProps {
    member: any;
    onClose: () => void;
    onViewNotes: () => void;
    onMessage: () => void;
}

const MemberDetailPanel: React.FC<MemberDetailPanelProps> = ({ member, onClose, onViewNotes, onMessage }) => {
    const [g1, g2] = getAvatarGradient(member.name);
    const goalStyle = getGoalStyle(member.goal);
    const risk = isAtRisk(member.lastSession);

    return (
        <div className="mm__panel-overlay" onClick={onClose}>
            <div className="mm__panel" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="mm__panel-header" style={{ background: `linear-gradient(135deg,${g1}22,${g2}11)`, borderBottom: `1px solid ${g1}33` }}>
                    <button className="mm__panel-close" onClick={onClose}><X size={16} /></button>
                    <div className="mm__panel-avatar" style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                        {member.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="mm__panel-name">{member.name}</h2>
                    <p className="mm__panel-plan">{member.plan}</p>
                    <div className="mm__panel-badges">
                        <span className={`mm__panel-status mm__panel-status--${member.status.toLowerCase()}`}>
                            <span className="mm__panel-status-dot" />{member.status}
                        </span>
                        {risk && (
                            <span className="mm__panel-atrisk">
                                <AlertCircle size={10} /> At Risk
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="mm__panel-stats">
                    {[
                        { label: 'Classes', value: member.stats?.classes ?? '—', color: g1 },
                        { label: 'Weight', value: member.stats?.weight ?? '—', color: g2 },
                        { label: 'PT Sessions', value: member.stats?.pt ?? '—', color: '#8b5cf6' },
                    ].map(s => (
                        <div key={s.label} className="mm__panel-stat">
                            <span className="mm__panel-stat-val" style={{ color: s.color }}>{s.value}</span>
                            <span className="mm__panel-stat-lbl">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Info section */}
                <div className="mm__panel-section">
                    <h4 className="mm__panel-section-title">Member Info</h4>
                    <div className="mm__panel-info-rows">
                        {member.email && (
                            <div className="mm__panel-info-row">
                                <Mail size={13} />
                                <span>{member.email}</span>
                            </div>
                        )}
                        {member.phone && (
                            <div className="mm__panel-info-row">
                                <Phone size={13} />
                                <span>{member.phone}</span>
                            </div>
                        )}
                        <div className="mm__panel-info-row">
                            <Target size={13} />
                            <span className="mm__panel-goal-chip" style={{ background: goalStyle.bg, color: goalStyle.color }}>
                                {goalStyle.icon}&nbsp;{member.goal}
                            </span>
                        </div>
                        <div className="mm__panel-info-row">
                            <Clock size={13} />
                            <span>Last session: <strong>{member.lastSession || '—'}</strong></span>
                        </div>
                        <div className="mm__panel-info-row">
                            <Calendar size={13} />
                            <span>
                                {member.daysLeft > 0 ? `${member.daysLeft} days left on membership` : 'Membership expired'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Membership progress */}
                <div className="mm__panel-section">
                    <h4 className="mm__panel-section-title">Membership</h4>
                    <div className="mm__panel-progress-bar">
                        <div
                            className="mm__panel-progress-fill"
                            style={{
                                width: `${Math.min(100, Math.round(((member.daysLeft ?? 0) / 30) * 100))}%`,
                                background: `linear-gradient(90deg,${g1},${g2})`,
                            }}
                        />
                    </div>
                    <div className="mm__panel-progress-labels">
                        <span>{member.daysLeft > 0 ? `${member.daysLeft} days remaining` : 'Expired'}</span>
                        <span>{Math.min(100, Math.round(((member.daysLeft ?? 0) / 30) * 100))}%</span>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="mm__panel-actions">
                    <button className="mm__panel-btn mm__panel-btn--primary" style={{ background: `linear-gradient(135deg,${g1},${g2})` }} onClick={onViewNotes}>
                        <FileText size={14} /> View Progress Notes
                    </button>
                    <button className="mm__panel-btn mm__panel-btn--ghost" onClick={onMessage}>
                        <MessageSquare size={14} /> Send Message
                    </button>
                    <button className="mm__panel-btn mm__panel-btn--ghost" onClick={() => { }}>
                        <Dumbbell size={14} /> Assign Workout
                    </button>
                    <button className="mm__panel-btn mm__panel-btn--ghost" onClick={() => { }}>
                        <BarChart2 size={14} /> View Reports
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main component ──────────────────────────────────────────────────────────
const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'lastSession' | 'daysLeft' | 'attendance'>('name');
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pending trainer requests
    const [pendingRequests, setPendingRequests] = useState<TrainerRequestData[]>([]);
    const [activeRequestPanel, setActiveRequestPanel] = useState<TrainerRequestData | null>(null);
    const [showRequestsView, setShowRequestsView] = useState(false);

    useEffect(() => {
        loadMembers();
        // Auto-open pending requests panel if navigated from a notification
        const openRequests = searchParams.get('tab') === 'requests' || (location.state as any)?.openRequests;
        if (openRequests) {
            setShowRequestsView(true);
            loadPendingRequests();
        } else {
            loadPendingRequests();
        }
    }, []);

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

    const loadPendingRequests = async () => {
        try {
            const res = await api.get('/trainer-requests/incoming');
            setPendingRequests(res.data || []);
        } catch {
            // silently ignore — not critical
        }
    };

    const stats = useMemo(() => {
        const activeCount = members.filter(m => m.status === 'ACTIVE').length;
        const atRiskCount = members.filter(m => isAtRisk(m.lastSession)).length;
        const expiringSoon = members.filter(m => m.daysLeft > 0 && m.daysLeft <= 7).length;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions = members.filter(m => m.lastSession === todayStr || m.lastSession === 'Today').length;
        return { activeCount, atRiskCount, expiringSoon, todaySessions, total: members.length };
    }, [members]);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || m.status === filter.toUpperCase();
        if (quickFilter === 'at-risk')
            return matchesSearch && matchesFilter && isAtRisk(m.lastSession);
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
            if (sortBy === 'lastSession') {
                const dA = a.lastSession === 'Today' ? 0 : new Date(a.lastSession).getTime() || 0;
                const dB = b.lastSession === 'Today' ? 0 : new Date(b.lastSession).getTime() || 0;
                return dB - dA; // most recent first
            }
            if (sortBy === 'attendance') return (b.stats?.classes ?? 0) - (a.stats?.classes ?? 0);
            return 0;
        });
    }, [filteredMembers, sortBy]);

    const toggleQuickFilter = (f: string) => setQuickFilter(prev => prev === f ? null : f);

    const handleMessage = useCallback(async (member: any) => {
        try {
            const memberId = member.id || member.userId;
            const conversation = await chatApi.startPrivateChat(memberId);
            navigate('/trainer/messages', { state: { activeConversationId: conversation.conversationId } });
        } catch { showToast.error('Could not start chat. Please try again.'); }
    }, [navigate]);

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Plan', 'Classes', 'Last Session'];
        const rows = sortedMembers.map(m =>
            [m.name, m.email, m.phone, m.status, m.plan, m.stats?.classes, m.lastSession]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'my-members.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const getMembershipProgress = (daysLeft: number) =>
        !daysLeft || daysLeft <= 0 ? 0 : Math.min(100, Math.round((daysLeft / 30) * 100));

    return (
        <div className="mm">
            {/* ── TOPBAR ── */}
            <div className="mm__topbar">
                <div className="mm__title-block">
                    <div className="mm__title-icon"><Users size={18} /></div>
                    <div>
                        <h1 className="mm__title">My Members</h1>
                        <p className="mm__subtitle">Track and manage your assigned clients</p>
                    </div>
                </div>

                <div className="mm__stat-pills">
                    {[
                        { label: 'Total', value: stats.total, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: '#6366f1', icon: <Users size={13} /> },
                        { label: 'Active', value: stats.activeCount, gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: '#10b981', icon: <Activity size={13} /> },
                        { label: 'At Risk', value: stats.atRiskCount, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: '#f59e0b', icon: <AlertTriangle size={13} /> },
                        { label: 'Expiring', value: stats.expiringSoon, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', glow: '#ef4444', icon: <Clock size={13} /> },
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

                <button className="mm__export-btn" onClick={handleExport}>
                    <Download size={13} /><span>Export CSV</span>
                </button>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="mm__filterbar">
                <div className="mm__quick-filters">
                        {[
                            { key: 'today', icon: <Calendar size={12} />, label: "Today's Sessions", count: stats.todaySessions, accent: '#3B82F6' },
                            { key: 'at-risk', icon: <AlertTriangle size={12} />, label: 'At Risk (7+ days)', count: stats.atRiskCount, accent: '#F59E0B' },
                            { key: 'expiring-soon', icon: <TrendingUp size={12} />, label: 'Expiring Soon', count: stats.expiringSoon, accent: '#EF4444' },
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
                        {/* Pending Requests button */}
                          <button
                              className={`mm__qbtn ${showRequestsView ? 'mm__qbtn--active' : ''}`}
                              style={showRequestsView ? { '--qbtn-accent': '#AF52DE' } as any : {}}
                              onClick={() => {
                                  const next = !showRequestsView;
                                  setShowRequestsView(next);
                                  if (next) loadPendingRequests();
                              }}
                          >
                            <span className="mm__qbtn-icon" style={{ color: '#AF52DE' }}><Users size={12} /></span>
                            <span>Pending Requests</span>
                            {pendingRequests.length > 0 && (
                                <span className="mm__qbtn-badge" style={{ background: 'rgba(175,82,222,0.2)', color: '#AF52DE', fontWeight: 700 }}>
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>

                <div className="mm__controls">
                    <div className="mm__search">
                        <Search size={14} className="mm__search-icon" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && <button className="mm__search-clear" onClick={() => setSearchQuery('')}>×</button>}
                    </div>
                    <div className="mm__select-wrap">
                        <Filter size={13} className="mm__select-icon" />
                        <select value={filter} onChange={e => setFilter(e.target.value)}>
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <ChevronDown size={12} className="mm__select-arrow" />
                    </div>
                    <div className="mm__view-toggle">
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid view"><Grid size={14} /></button>
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="List view"><List size={14} /></button>
                    </div>
                </div>
            </div>

            {/* ── PENDING REQUESTS PANEL ── */}
            {showRequestsView && (
                <div style={{ margin: '0 0 16px', background: 'rgba(175,82,222,0.06)', border: '1px solid rgba(175,82,222,0.2)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#AF52DE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={14} /> Pending Requests ({pendingRequests.length})
                        </span>
                        <button onClick={loadPendingRequests} style={{ fontSize: '11px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px 6px' }}>Refresh</button>
                    </div>
                    {pendingRequests.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center', padding: '12px' }}>No pending requests right now.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {pendingRequests.map(req => (
                                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#AF52DE,#5856D6)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                                        {(req.member.name || 'M').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--macos-text-primary, #fff)', marginBottom: '2px' }}>{req.member.name}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {req.memberMessage || 'No message'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveRequestPanel(req)}
                                        style={{ padding: '6px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#AF52DE,#5856D6)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                                    >
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── SORT BAR ── */}
            <div className="mm__sort-bar">
                <span className="mm__results-count">
                    <span className="mm__results-num">{sortedMembers.length}</span> members
                    {quickFilter && <span className="mm__filter-tag">filtered</span>}
                </span>
                <div className="mm__sort-select">
                    <ArrowUpDown size={12} />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                        <option value="name">Sort: Name A–Z</option>
                        <option value="lastSession">Sort: Last Visit</option>
                        <option value="daysLeft">Sort: Expiry</option>
                        <option value="attendance">Sort: Attendance</option>
                    </select>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="mm__content">
                {loading ? (
                    <div className="mm__loading"><div className="mm__spinner" /><span>Loading members…</span></div>
                ) : error ? (
                    <div className="mm__error"><AlertTriangle size={28} /><p>{error}</p></div>
                ) : sortedMembers.length === 0 ? (
                    <div className="mm__empty">
                        <div className="mm__empty-icon"><Users size={36} /></div>
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
                            const atRisk = isAtRisk(member.lastSession);
                            return (
                                <div
                                    key={member.id}
                                    className={`mmc ${isActive ? 'mmc--active' : 'mmc--inactive'} ${atRisk ? 'mmc--at-risk' : ''}`}
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <div className="mmc__accent" style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

                                    <div className="mmc__head">
                                        <div className="mmc__avatar" style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="mmc__head-right">
                                            <span className={`mmc__status mmc__status--${member.status.toLowerCase()}`}>
                                                <span className="mmc__status-dot" />{member.status}
                                            </span>
                                            {atRisk && (
                                                <span className="mmc__at-risk-badge">
                                                    <AlertCircle size={9} /> At Risk
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mmc__info">
                                        <h3 className="mmc__name">{member.name}</h3>
                                        <p className="mmc__plan">{member.plan}</p>
                                    </div>

                                    <div className="mmc__tags">
                                        <span className="mmc__goal-tag" style={{ background: goalStyle.bg, color: goalStyle.color }}>
                                            {goalStyle.icon}{member.goal}
                                        </span>
                                        <span className="mmc__session-tag"><Clock size={10} />{member.lastSession}</span>
                                    </div>

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

                                    <div className="mmc__divider" />

                                    <div className="mmc__stats">
                                        {[
                                            { label: 'Classes', value: member.stats?.classes, color: g1 },
                                            { label: 'Weight', value: member.stats?.weight, color: g2 },
                                            { label: 'PT', value: member.stats?.pt, color: '#8b5cf6' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="mmc__stat">
                                                <span className="mmc__stat-val" style={{ color }}>{value}</span>
                                                <span className="mmc__stat-lbl">{label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mmc__actions" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="mmc__btn-primary"
                                            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
                                            onClick={() => setSelectedMember(member)}
                                        >
                                            <ChevronRight size={13} /> View Profile
                                        </button>
                                        <button className="mmc__btn-icon" onClick={() => handleMessage(member)} title="Message">
                                            <MessageSquare size={14} />
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
                            const atRisk = isAtRisk(member.lastSession);
                            return (
                                <div
                                    key={member.id}
                                    className={`mml ${isActive ? 'mml--active' : 'mml--inactive'} ${atRisk ? 'mml--at-risk' : ''}`}
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <div className="mml__left-bar" style={{ background: `linear-gradient(180deg,${g1},${g2})` }} />
                                    <div className="mml__avatar" style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="mml__info">
                                        <span className="mml__name">
                                            {member.name}
                                            {atRisk && <span className="mml__at-risk-badge"><AlertCircle size={9} /> At Risk</span>}
                                        </span>
                                        <span className="mml__sub">{member.email}</span>
                                    </div>
                                    <span className="mml__goal" style={{ background: goalStyle.bg, color: goalStyle.color }}>
                                        {goalStyle.icon}{member.goal}
                                    </span>
                                    <span className="mml__session"><Clock size={11} />{member.lastSession}</span>
                                    <span className={`mml__status mml__status--${member.status.toLowerCase()}`}>
                                        <span className="mml__status-dot" />{member.status}
                                    </span>
                                    <div className="mml__stats">
                                        <div className="mml__stat"><span className="mml__stat-val" style={{ color: g1 }}>{member.stats?.classes}</span><span className="mml__stat-lbl">Classes</span></div>
                                        <div className="mml__stat"><span className="mml__stat-val" style={{ color: g2 }}>{member.stats?.weight}</span><span className="mml__stat-lbl">Weight</span></div>
                                        <div className="mml__stat"><span className="mml__stat-val" style={{ color: '#8b5cf6' }}>{member.stats?.pt}</span><span className="mml__stat-lbl">PT</span></div>
                                    </div>
                                    <div className="mml__actions" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="mml__btn-primary"
                                            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
                                            onClick={() => setSelectedMember(member)}
                                        ><ChevronRight size={12} /> View</button>
                                        <button className="mml__btn-icon" onClick={() => handleMessage(member)} title="Message">
                                            <MessageSquare size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── MEMBER DETAIL PANEL ── */}
            {selectedMember && (
                <MemberDetailPanel
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onViewNotes={() => {
                        setSelectedMember(null);
                        navigate('/trainer/progress-notes', { state: { filterMember: selectedMember.name } });
                    }}
                    onMessage={() => {
                        setSelectedMember(null);
                        handleMessage(selectedMember);
                    }}
                />
            )}

            {/* ── TRAINER REQUEST PANEL ── */}
            {activeRequestPanel && (
                <TrainerRequestPanel
                    request={activeRequestPanel}
                    onClose={() => setActiveRequestPanel(null)}
                onResolved={(requestId, newStatus) => {
                        loadPendingRequests();
                        if (newStatus === 'ACCEPTED') {
                            loadMembers();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default MyMembers;
