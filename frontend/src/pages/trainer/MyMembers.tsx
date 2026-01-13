
import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Filter, MoreVertical, MessageSquare, Calendar, ChevronDown, Grid, List, TrendingUp, Clock, Users, Download, Target, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../../services/trainerApi';
import chatApi from '../../services/chatApi';
import './MyMembers.css';

const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    useEffect(() => {
        loadMembers();
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

    const stats = useMemo(() => {
        const activeCount = members.filter(m => m.status === 'ACTIVE').length;
        const needsAttention = members.filter(m => m.status === 'INACTIVE' || getDaysLeft(m.lastSession) > 14).length;
        const expiringSoon = members.filter(m => m.daysLeft > 0 && m.daysLeft <= 7).length;

        // Count today sessions based on lastSession date string match
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions = members.filter(m => m.lastSession === todayStr || m.lastSession === 'Today').length;

        return { activeCount, needsAttention, expiringSoon, todaySessions, total: members.length };
    }, [members]);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || m.status === filter.toUpperCase();

        if (quickFilter === 'needs-attention') {
            return matchesSearch && matchesFilter && (m.status === 'INACTIVE' || getDaysLeft(m.lastSession) > 14);
        }
        if (quickFilter === 'expiring-soon') {
            return matchesSearch && matchesFilter && m.daysLeft > 0 && m.daysLeft <= 7;
        }
        if (quickFilter === 'today') {
            const todayStr = new Date().toISOString().split('T')[0];
            return matchesSearch && matchesFilter && (m.lastSession === todayStr || m.lastSession === 'Today');
        }

        return matchesSearch && matchesFilter;
    });

    const toggleQuickFilter = (filterName: string) => {
        setQuickFilter(prev => prev === filterName ? null : filterName);
    };

    // Helper to parse "2 days ago" or YYYY-MM-DD
    function getDaysLeft(dateStr: string): number {
        if (!dateStr || dateStr === 'Never') return 999;
        if (dateStr === 'Today') return 0;
        if (dateStr === 'Yesterday') return 1;

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 999; // Parse failed

        const diffTime = Math.abs(new Date().getTime() - date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const handleMessage = async (member: any) => {
        try {
            const memberId = member.id || member.userId; // Handle both potential DTO formats
            // Start or get existing conversion
            const conversation = await chatApi.startPrivateChat(memberId);
            // Navigate to messages with conversation active
            navigate('/trainer/messages', {
                state: {
                    activeConversationId: conversation.conversationId
                }
            });
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Could not start chat. Please try again.');
        }
    };

    const handleViewProfile = (member: any) => {
        alert(`Viewing profile for ${member.name}`);
    };

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Plan', 'Classes', 'Last Session'];
        const rows = filteredMembers.map(m =>
            [m.name, m.email, m.phone, m.status, m.plan, m.stats.classes, m.lastSession]
        );
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-members.csv';
        a.click();
    };

    return (
        <div className="my-members">
            <div className="my-members__header">
                <div className="my-members__title-section">
                    <h1>My Members</h1>
                    <span className="my-members__count-badge">
                        <Users size={10} />
                        {members.length}
                    </span>
                </div>

                <div className="my-members__quick-filters">
                    <button
                        className={`my-members__quick-btn ${quickFilter === 'today' ? 'my-members__quick-btn--active' : ''} `}
                        onClick={() => toggleQuickFilter('today')}
                    >
                        <Calendar size={12} />
                        <span>Today's Sessions</span>
                        {stats.todaySessions > 0 && <span className="my-members__quick-count">{stats.todaySessions}</span>}
                    </button>
                    <button
                        className={`my-members__quick-btn ${quickFilter === 'needs-attention' ? 'my-members__quick-btn--active' : ''} `}
                        onClick={() => toggleQuickFilter('needs-attention')}
                    >
                        <Clock size={12} />
                        <span>Needs Attention</span>
                        {stats.needsAttention > 0 && <span className="my-members__quick-count my-members__quick-count--warning">{stats.needsAttention}</span>}
                    </button>
                    <button
                        className={`my-members__quick-btn ${quickFilter === 'expiring-soon' ? 'my-members__quick-btn--active' : ''} `}
                        onClick={() => toggleQuickFilter('expiring-soon')}
                    >
                        <TrendingUp size={12} />
                        <span>Expiring Soon</span>
                        {stats.expiringSoon > 0 && <span className="my-members__quick-count my-members__quick-count--warning">{stats.expiringSoon}</span>}
                    </button>
                </div>

                <div className="my-members__search-section">
                    <div className="my-members__search">
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="my-members__filter-dropdown">
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <ChevronDown size={12} />
                    </div>
                    <div className="my-members__view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={14} />
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={14} />
                        </button>
                    </div>
                    <button className="my-members__export-btn" onClick={handleExport}>
                        <Download size={12} />
                        Export
                    </button>
                </div>
            </div>

            <div className="my-members__content">
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-zinc-500">
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
                        Loading members...
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64 text-red-400">
                        <Target size={24} className="mr-2" /> {error}
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="my-members__empty">
                        <Users size={32} />
                        <p>No members found</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' && (
                            <div className="my-members__grid">
                                {filteredMembers.map(member => (
                                    <div key={member.id} className="member-card">
                                        <div className="member-card__header">
                                            <div className="member-card__avatar">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${member.name}&background=DC2626&color=fff&size=48`}
                                                    alt={member.name}
                                                />
                                            </div >
                                            <span className={`member-card__status member-card__status--${member.status.toLowerCase()}`}>
                                                {member.status}
                                            </span>
                                        </div >
                                        <div className="member-card__info">
                                            <h3>{member.name}</h3>
                                            <p>{member.plan} • {member.daysLeft > 0 ? `${member.daysLeft}d left` : 'Expired'}</p>
                                        </div>
                                        <div className="member-card__meta">
                                            <span className="member-card__goal">
                                                <Target size={10} />
                                                {member.goal}
                                            </span>
                                            <span className="member-card__last-session">
                                                <Clock size={10} />
                                                {member.lastSession}
                                            </span>
                                        </div>
                                        <div className="member-card__divider" />
                                        <div className="member-card__stats">
                                            <div className="member-card__stat">
                                                <span className="member-card__stat-value">{member.stats.classes}</span>
                                                <span className="member-card__stat-label">Classes</span>
                                            </div>
                                            <div className="member-card__stat">
                                                <span className="member-card__stat-value">{member.stats.weight}</span>
                                                <span className="member-card__stat-label">Weight</span>
                                            </div>
                                            <div className="member-card__stat">
                                                <span className="member-card__stat-value">{member.stats.pt}</span>
                                                <span className="member-card__stat-label">PT</span>
                                            </div>
                                        </div>
                                        <div className="member-card__actions">
                                            <button className="member-card__btn member-card__btn--primary" onClick={() => handleViewProfile(member)}>View Profile</button>
                                            <button className="member-card__btn member-card__btn--icon" onClick={() => handleMessage(member)}>
                                                <MessageSquare size={12} />
                                            </button>
                                        </div>
                                    </div >
                                ))}
                            </div >
                        )}

                        {
                            viewMode === 'list' && (
                                <div className="my-members__list">
                                    {filteredMembers.map(member => (
                                        <div key={member.id} className="member-list-item">
                                            <div className="member-list-item__avatar">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${member.name}&background=DC2626&color=fff&size=40`}
                                                    alt={member.name}
                                                />
                                            </div>
                                            <div className="member-list-item__info">
                                                <h3>{member.name}</h3>
                                                <p>{member.email} • {member.phone}</p>
                                            </div>
                                            <div className="member-list-item__meta">
                                                <span className="member-list-item__goal">
                                                    <Target size={10} />
                                                    {member.goal}
                                                </span>
                                                <span className="member-list-item__last-session">
                                                    <Clock size={10} />
                                                    {member.lastSession}
                                                </span>
                                            </div>
                                            <span className={`member-list-item__status member-list-item__status--${member.status.toLowerCase()}`}>
                                                {member.status}
                                            </span>
                                            <div className="member-list-item__stats">
                                                <div className="member-list-item__stat">
                                                    <span className="member-list-item__stat-value">{member.stats.classes}</span>
                                                    <span className="member-list-item__stat-label">Classes</span>
                                                </div>
                                                <div className="member-list-item__stat">
                                                    <span className="member-list-item__stat-value">{member.stats.weight}</span>
                                                    <span className="member-list-item__stat-label">Weight</span>
                                                </div>
                                            </div>
                                            <div className="member-list-item__actions">
                                                <button className="member-list-item__btn member-list-item__btn--primary" onClick={() => handleViewProfile(member)}>View</button>
                                                <button className="member-list-item__btn member-list-item__btn--icon" onClick={() => handleMessage(member)}>
                                                    <MoreVertical size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyMembers;
