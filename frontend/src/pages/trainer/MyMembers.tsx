import React, { useState } from 'react';
import { 
    Search, Grid, List, Download, MoreVertical, MessageSquare, 
    ChevronDown, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MyMembers.css';

const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const members = [
        { id: 1, name: 'Sarah Wilson', email: 'sarah@email.com', phone: '+1 555-1234', status: 'ACTIVE', plan: 'Premium Monthly', daysLeft: 25, stats: { classes: 18, weight: '78kg', pt: '6/12' } },
        { id: 2, name: 'Mike Johnson', email: 'mike@email.com', phone: '+1 555-5678', status: 'INACTIVE', plan: 'Basic', daysLeft: 0, stats: { classes: 5, weight: '92kg', pt: '0/0' } },
        { id: 3, name: 'Emma Davis', email: 'emma@email.com', phone: '+1 555-9012', status: 'ACTIVE', plan: 'Pro Annual', daysLeft: 200, stats: { classes: 42, weight: '65kg', pt: '12/20' } },
        { id: 4, name: 'James Wilson', email: 'james@email.com', phone: '+1 555-3456', status: 'ACTIVE', plan: 'Premium Monthly', daysLeft: 12, stats: { classes: 8, weight: '82kg', pt: '2/10' } },
    ];

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || m.status === filter.toUpperCase();
        return matchesSearch && matchesFilter;
    });

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
                <button className="my-members__export-btn">
                    <Download size={12} />
                    Export
                </button>
            </div>

            <div className="my-members__content">
                <div className="my-members__filter-bar">
                    <div className="my-members__filters-left">
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
                    </div>
                    <div className="my-members__filters-right">
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
                    </div>
                </div>

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
                                    </div>
                                    <span className={`member-card__status member-card__status--${member.status.toLowerCase()}`}>
                                        {member.status}
                                    </span>
                                </div>
                                <div className="member-card__info">
                                    <h3>{member.name}</h3>
                                    <p>{member.plan} • {member.daysLeft > 0 ? `${member.daysLeft}d left` : 'Expired'}</p>
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
                                    <button className="member-card__btn member-card__btn--primary">View Profile</button>
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
                                    <button className="member-list-item__btn member-list-item__btn--primary">View</button>
                                    <button className="member-list-item__btn member-list-item__btn--icon">
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredMembers.length === 0 && (
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
