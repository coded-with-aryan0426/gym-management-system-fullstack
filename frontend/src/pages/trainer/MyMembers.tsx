import React, { useState } from 'react';
import { Search, Grid, List, Download, MoreVertical, MessageSquare, ChevronDown, Filter, User, Dumbbell, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');

    const members = [
        { id: 1, name: 'Sarah Wilson', status: 'ACTIVE', plan: 'Premium', daysLeft: 25, stats: { classes: 18, weight: '78kg', pt: '6/12' } },
        { id: 2, name: 'Mike Johnson', status: 'INACTIVE', plan: 'Basic', daysLeft: 0, stats: { classes: 5, weight: '92kg', pt: '0/0' } },
        { id: 3, name: 'Emma Davis', status: 'ACTIVE', plan: 'Pro', daysLeft: 200, stats: { classes: 42, weight: '65kg', pt: '12/20' } },
        { id: 4, name: 'James Wilson', status: 'ACTIVE', plan: 'Premium', daysLeft: 12, stats: { classes: 8, weight: '82kg', pt: '2/10' } },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Compact Header */}
            <div className="px-4 py-3 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                <div className="flex items-center justify-between max-w-[1200px] mx-auto">
                    <div>
                        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                            My Members ({members.length})
                        </h1>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Track progress and communicate
                        </p>
                    </div>
                    <button className="h-8 px-3 border border-[var(--sidebar-border)] rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors flex items-center gap-1.5">
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            <div className="p-4 max-w-[1200px] mx-auto">
                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="w-[200px] h-8 pl-8 pr-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]"
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="h-8 pl-3 pr-7 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-xs text-[var(--text-secondary)] focus:outline-none appearance-none cursor-pointer"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" size={12} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex border border-[var(--sidebar-border)] rounded-md overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-[#4F46E5] text-white' : 'bg-[var(--sidebar-bg)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <Grid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-[#4F46E5] text-white' : 'bg-[var(--sidebar-bg)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {members.map(member => (
                            <div key={member.id} className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg p-3 hover:border-[#4F46E5]/30 transition-all group">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${member.name}&background=4F46E5&color=fff&size=64`} 
                                            alt={member.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{member.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-[10px] text-[var(--text-tertiary)]">{member.plan} • {member.daysLeft}d left</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-t border-[var(--sidebar-border)]">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <div className="text-sm font-semibold text-[var(--text-primary)]">{member.stats.classes}</div>
                                            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Classes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-semibold text-[var(--text-primary)]">{member.stats.weight}</div>
                                            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Weight</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-semibold text-[var(--text-primary)]">{member.stats.pt}</div>
                                            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">PT</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button className="flex-1 h-7 bg-[#4F46E5] text-white rounded text-[11px] font-medium hover:bg-[#4338CA] transition-colors">
                                        View
                                    </button>
                                    <button className="w-7 h-7 flex items-center justify-center border border-[var(--sidebar-border)] rounded text-[var(--text-tertiary)] hover:text-[#4F46E5] hover:border-[#4F46E5]/30 transition-colors">
                                        <MessageSquare size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-2">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center gap-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg p-3 hover:border-[#4F46E5]/30 transition-all">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${member.name}&background=4F46E5&color=fff&size=64`} 
                                        alt={member.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-[var(--text-primary)]">{member.name}</h3>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {member.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[var(--text-tertiary)]">{member.plan} • {member.daysLeft} days left</p>
                                </div>
                                <div className="hidden md:flex items-center gap-6 px-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">{member.stats.classes}</div>
                                        <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Classes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">{member.stats.weight}</div>
                                        <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Weight</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">{member.stats.pt}</div>
                                        <div className="text-[9px] text-[var(--text-tertiary)] uppercase">PT</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="h-7 px-3 bg-[#4F46E5] text-white rounded text-[11px] font-medium hover:bg-[#4338CA] transition-colors">
                                        View
                                    </button>
                                    <button className="w-7 h-7 flex items-center justify-center border border-[var(--sidebar-border)] rounded text-[var(--text-tertiary)] hover:bg-[var(--sidebar-hover)] transition-colors">
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyMembers;
