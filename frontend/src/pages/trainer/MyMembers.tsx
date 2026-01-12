import React, { useState, useMemo, useEffect } from 'react';
import { 
    Search, Grid, List, Download, MoreVertical, MessageSquare, 
    ChevronDown, Users, Clock, TrendingUp, Target, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import trainerApi from '../../services/trainerApi';
import type { TrainerMemberDetail } from '../../services/trainerApi';
import './MyMembers.css';

const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [members, setMembers] = useState<TrainerMemberDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const response = await trainerApi.getMyMembersPaginated({
                    page,
                    size: 12,
                    q: searchQuery,
                    status: filter.toLowerCase() as any
                });
                setMembers(response.items || []);
                setTotalPages(response.totalPages || 0);
            } catch (err) {
                console.error('Failed to fetch members:', err);
                setMembers([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchMembers, 300);
        return () => clearTimeout(debounceTimer);
    }, [page, searchQuery, filter]);

    const stats = useMemo(() => {
        const membersList = Array.isArray(members) ? members : [];
        const activeCount = membersList.filter(m => m && (m.status === 'active' || m.status === 'ACTIVE')).length;
        const todaySessions = 0; 
        const needsAttention = membersList.filter(m => m && m.status === 'at-risk').length;
        const expiringSoon = membersList.filter(m => m && m.expiryDays !== undefined && m.expiryDays > 0 && m.expiryDays <= 7).length;
        return { activeCount, needsAttention, expiringSoon, todaySessions, total: membersList.length };
    }, [members]);

    const filteredMembers = useMemo(() => {
        const membersList = Array.isArray(members) ? members : [];
        if (!quickFilter) return membersList;
        
        if (quickFilter === 'needs-attention') {
            return membersList.filter(m => m && m.status === 'at-risk');
        }
        if (quickFilter === 'expiring-soon') {
            return membersList.filter(m => m && m.expiryDays !== undefined && m.expiryDays > 0 && m.expiryDays <= 7);
        }
        
        return membersList;
    }, [members, quickFilter]);

    const toggleQuickFilter = (filterName: string) => {
        setQuickFilter(prev => prev === filterName ? null : filterName);
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
                        className={`my-members__quick-btn ${quickFilter === 'today' ? 'my-members__quick-btn--active' : ''}`}
                        onClick={() => toggleQuickFilter('today')}
                    >
                        <Calendar size={12} />
                        <span>Today's Sessions</span>
                        {stats.todaySessions > 0 && <span className="my-members__quick-count">{stats.todaySessions}</span>}
                    </button>
                    <button 
                        className={`my-members__quick-btn ${quickFilter === 'needs-attention' ? 'my-members__quick-btn--active' : ''}`}
                        onClick={() => toggleQuickFilter('needs-attention')}
                    >
                        <Clock size={12} />
                        <span>Needs Attention</span>
                        {stats.needsAttention > 0 && <span className="my-members__quick-count my-members__quick-count--warning">{stats.needsAttention}</span>}
                    </button>
                    <button 
                        className={`my-members__quick-btn ${quickFilter === 'expiring-soon' ? 'my-members__quick-btn--active' : ''}`}
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
                    <button className="my-members__export-btn">
                        <Download size={12} />
                        Export
                    </button>
                </div>
            </div>

            <div className="my-members__content">
                {loading ? (
                    <div className="my-members__loading">
                        <div className="loader"></div>
                        <p>Loading members...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' && (
                            <div className="my-members__grid">
                                {filteredMembers.map(member => (
                                    <div key={member.userId} className="member-card">
                                        <div className="member-card__header">
                                            <div className="member-card__avatar">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${member.fullName}&background=DC2626&color=fff&size=48`}
                                                    alt={member.fullName}
                                                />
                                            </div>
                                            <span className={`member-card__status member-card__status--${(member.status || 'active').toLowerCase()}`}>
                                                {member.status || 'Active'}
                                            </span>
                                        </div>
                                        <div className="member-card__info">
                                            <h3>{member.fullName}</h3>
                                            <p>{member.plan || 'Standard'} • {member.expiryDays !== undefined ? (member.expiryDays > 0 ? `${member.expiryDays}d left` : 'Expired') : 'N/A'}</p>
                                        </div>
                                        <div className="member-card__meta">
                                            <span className="member-card__goal">
                                                <Target size={10} />
                                                {member.goal || 'Fitness'}
                                            </span>
                                            <span className="member-card__last-session">
                                                <Clock size={10} />
                                                {member.lastVisit ? format(parseISO(member.lastVisit), 'MMM d') : 'No visit'}
                                            </span>
                                        </div>
                                        <div className="member-card__divider" />
                                        <div className="member-card__stats">
                                            <div className="member-card__stat">
                                                <span className="member-card__stat-value">{member.stats?.classes || 0}</span>
                                                <span className="member-card__stat-label">Classes</span>
                                            </div>
                                            <div className="member-card__stat">
                                                <span className="member-card__stat-value">{member.stats?.weight || '--'}</span>
                                                <span className="member-card__stat-label">Weight</span>
                                            </div>
                                            <div className="member-card__stat">
                                                <span className="member-card__stat-value">{member.stats?.ptSessions || '0/0'}</span>
                                                <span className="member-card__stat-label">PT</span>
                                            </div>
                                        </div>
                                        <div className="member-card__actions">
                                            <button className="member-card__btn member-card__btn--primary" onClick={() => navigate(`/trainer/members/${member.userId}`)}>View Profile</button>
                                            <button className="member-card__btn member-card__btn--icon">
                                                <MessageSquare size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {viewMode === 'list' && (
                            <div className="my-members__list">
                                {filteredMembers.map(member => (
                                    <div key={member.userId} className="member-list-item">
                                        <div className="member-list-item__avatar">
                                            <img 
                                                src={`https://ui-avatars.com/api/?name=${member.fullName}&background=DC2626&color=fff&size=40`}
                                                alt={member.fullName}
                                            />
                                        </div>
                                        <div className="member-list-item__info">
                                            <h3>{member.fullName}</h3>
                                            <p>{member.email} • {member.phoneNumber || 'No phone'}</p>
                                        </div>
                                        <div className="member-list-item__meta">
                                            <span className="member-list-item__goal">
                                                <Target size={10} />
                                                {member.goal || 'Fitness'}
                                            </span>
                                            <span className="member-list-item__last-session">
                                                <Clock size={10} />
                                                {member.lastVisit ? format(parseISO(member.lastVisit), 'MMM d') : 'No visit'}
                                            </span>
                                        </div>
                                        <span className={`member-list-item__status member-list-item__status--${(member.status || 'active').toLowerCase()}`}>
                                            {member.status || 'Active'}
                                        </span>
                                        <div className="member-list-item__stats">
                                            <div className="member-list-item__stat">
                                                <span className="member-list-item__stat-value">{member.stats?.classes || 0}</span>
                                                <span className="member-list-item__stat-label">Classes</span>
                                            </div>
                                            <div className="member-list-item__stat">
                                                <span className="member-list-item__stat-value">{member.stats?.weight || '--'}</span>
                                                <span className="member-list-item__stat-label">Weight</span>
                                            </div>
                                        </div>
                                        <div className="member-list-item__actions">
                                            <button className="member-list-item__btn member-list-item__btn--primary" onClick={() => navigate(`/trainer/members/${member.userId}`)}>View</button>
                                            <button className="member-list-item__btn member-list-item__btn--icon">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!loading && filteredMembers.length === 0 && (
                    <div className="my-members__empty">
                        <Users size={32} />
                        <p>No members found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMembers;
