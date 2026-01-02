import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Activity, ArrowUp, ArrowDown, Download, Calendar as CalendarIcon } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import ContentCard from '../../components/shared/ContentCard';
import './Trainer.css';

const TrainerReports: React.FC = () => {
    const [dateRange, setDateRange] = useState('Last 30 Days');

    // Mock Data
    const sessionsData = [
        { name: 'Mon', sessions: 4 },
        { name: 'Tue', sessions: 6 },
        { name: 'Wed', sessions: 5 },
        { name: 'Thu', sessions: 7 },
        { name: 'Fri', sessions: 4 },
        { name: 'Sat', sessions: 8 },
        { name: 'Sun', sessions: 2 },
    ];

    const progressData = [
        { month: 'Jan', weight: 80, strength: 100 },
        { month: 'Feb', weight: 79, strength: 110 },
        { month: 'Mar', weight: 78, strength: 115 },
        { month: 'Apr', weight: 77.5, strength: 125 },
        { month: 'May', weight: 77, strength: 130 },
        { month: 'Jun', weight: 76, strength: 135 },
    ];

    const distributionData = [
        { name: 'Strength', value: 45, color: '#6366F1' },
        { name: 'Cardio', value: 25, color: '#10B981' },
        { name: 'HIIT', value: 20, color: '#F59E0B' },
        { name: 'Yoga', value: 10, color: '#EC4899' },
    ];

    const stats = [
        { label: 'Total Sessions', value: '42', change: '+12%', trend: 'up', icon: <Calendar size={20} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Active Clients', value: '18', change: '+3', trend: 'up', icon: <Users size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Completion Rate', value: '94%', change: '-1%', trend: 'down', icon: <Activity size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Avg Feedback', value: '4.8', change: '+0.2', trend: 'up', icon: <TrendingUp size={20} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="trainer-dashboard fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <PageHeader
                    title="Performance Reports"
                    subtitle="Analyze your training effectiveness and client progress"
                />
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-white transition-colors">
                        <CalendarIcon size={16} />
                        <span>{dateRange}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-white transition-colors">
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-zinc-500">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Sessions Chart */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Sessions Overview</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sessionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                                />
                                <Bar dataKey="sessions" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Client Progress Trends */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Client Progress Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="strength" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorStrength)" name="Avg Strength" />
                                <Area type="monotone" dataKey="weight" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" name="Avg Weight" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Session Distribution */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Session Type Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[250px] w-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-white">42</span>
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Total</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            {distributionData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-zinc-300 text-sm">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                            ></div>
                                        </div>
                                        <span className="text-zinc-400 text-sm font-medium w-8 text-right">{item.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Top Performing Clients</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group">
                                <div className="font-bold text-zinc-500 w-4">#{i}</div>
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {['JS', 'MW', 'DL', 'AK'][i - 1]}
                                </div>
                                <div className="flex-grow">
                                    <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                                        {['John Smith', 'Mike Wilson', 'David Lee', 'Anna Kim'][i - 1]}
                                    </div>
                                    <div className="text-xs text-zinc-500">{[12, 10, 9, 8][i - 1]} Sessions • +{[5, 4, 3, 3][i - 1]}% Improvement</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-500 text-sm font-bold">9{8 - i}%</div>
                                    <div className="text-[10px] text-zinc-600 uppercase">Consistency</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerReports;
