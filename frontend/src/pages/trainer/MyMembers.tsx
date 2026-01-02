import React, { useState } from 'react';
import { Search, Grid, List, Download, MoreVertical, MessageSquare, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyMembers: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('All');

    // Mock Data based on Spec
    const members = [
        { id: 1, name: 'Sarah Wilson', status: 'ACTIVE', plan: 'Premium Monthly', daysLeft: 25, stats: { classes: 18, weight: '78kg', pt: '6/12' } },
        { id: 2, name: 'Mike Johnson', status: 'INACTIVE', plan: 'Basic Monthly', daysLeft: 0, stats: { classes: 5, weight: '92kg', pt: '0/0' } },
        { id: 3, name: 'Emma Davis', status: 'ACTIVE', plan: 'Yearly Pro', daysLeft: 200, stats: { classes: 42, weight: '65kg', pt: '12/20' } },
        { id: 4, name: 'James Wilson', status: 'ACTIVE', plan: 'Premium Monthly', daysLeft: 12, stats: { classes: 8, weight: '82kg', pt: '2/10' } },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-2">My Assigned Members (12)</h1>
                <p className="text-sm font-normal text-gray-500">Track progress and communicate with your members</p>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full">
                {/* Filter & Search Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                    {/* Left Section */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="w-full md:w-[320px] h-10 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="h-10 pl-4 pr-8 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer min-w-[140px]"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden h-10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-11 flex items-center justify-center border-r border-gray-200 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-11 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <button className="h-10 px-5 flex items-center gap-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {members.map(member => (
                            <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-[280px] flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`h-6 px-2.5 rounded-full text-[11px] font-bold tracking-wide flex items-center ${member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {member.status}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-[13px] text-gray-500 mb-3">{member.plan} • {member.daysLeft} days left</p>
                                    <div className="h-px bg-gray-100 mb-3" />
                                    <div className="flex justify-between text-center mb-4">
                                        <div className="flex-1">
                                            <div className="text-xl font-bold text-gray-900 leading-tight">{member.stats.classes}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">CLASSES</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xl font-bold text-gray-900 leading-tight">{member.stats.weight}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">WEIGHT</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xl font-bold text-gray-900 leading-tight">{member.stats.pt}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">PT</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button className="flex-1 h-9 bg-indigo-600 text-white rounded-md text-[13px] font-medium hover:bg-indigo-700 transition-colors border-0">
                                        View Profile
                                    </button>
                                    <button className="flex-1 h-9 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-[13px] font-medium hover:bg-gray-100 transition-colors">
                                        Message
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="flex flex-col gap-3">
                        {members.map(member => (
                            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer h-[88px]">
                                <img src={`https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {member.plan}
                                    </div>
                                </div>
                                <div className="w-[200px] hidden md:flex items-center justify-between text-center px-4 border-l border-r border-gray-100 h-10">
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{member.stats.classes}</div>
                                        <div className="text-[10px] text-gray-400">CLASSES</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{member.stats.weight}</div>
                                        <div className="text-[10px] text-gray-400">WEIGHT</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{member.stats.pt}</div>
                                        <div className="text-[10px] text-gray-400">PT</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200">
                                        <MessageSquare size={16} />
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200">
                                        <MoreVertical size={16} />
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
