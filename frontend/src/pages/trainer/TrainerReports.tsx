import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Activity, ArrowUp, ArrowDown, Download, Calendar as CalendarIcon } from 'lucide-react';

const TrainerReports: React.FC = () => {
    const [dateRange] = useState('Last 30 Days');

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
        { label: 'Total Sessions', value: '42', change: '+12%', trend: 'up', icon: <Calendar size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Clients', value: '18', change: '+3', trend: 'up', icon: <Users size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Completion Rate', value: '94%', change: '-1%', trend: 'down', icon: <Activity size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Feedback', value: '4.8', change: '+0.2', trend: 'up', icon: <TrendingUp size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">Performance Reports</h1>
                    <p className="text-sm font-normal text-gray-500">Analyze your training effectiveness and client progress</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm">
                        <CalendarIcon size={16} />
                        <span>{dateRange}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm">
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {stat.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Weekly Sessions Chart */}
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Sessions Overview</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sessionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#111827' }}
                                        cursor={{ fill: '#F3F4F6', opacity: 0.5 }}
                                    />
                                    <Bar dataKey="sessions" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Client Progress Trends */}
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Client Progress Trends</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="strength" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorStrength)" name="Avg Strength" />
                                    <Area type="monotone" dataKey="weight" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" name="Avg Weight" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Session Distribution */}
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Session Type Distribution</h3>
                        <div className="flex flex-col md:flex-row items-center gap-12">
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
                                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-gray-900">42</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-5">
                                {distributionData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-gray-700 text-sm font-medium">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                                ></div>
                                            </div>
                                            <span className="text-gray-500 text-sm font-semibold w-8 text-right">{item.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Clients</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                    <div className="font-bold text-gray-400 w-4">#{i}</div>
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        {['JS', 'MW', 'DL', 'AK'][i - 1]}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-bold text-gray-900 text-sm group-hover:text-[#4F46E5] transition-colors">
                                            {['John Smith', 'Mike Wilson', 'David Lee', 'Anna Kim'][i - 1]}
                                        </div>
                                        <div className="text-xs text-gray-500">{[12, 10, 9, 8][i - 1]} Sessions • +{[5, 4, 3, 3][i - 1]}% Improvement</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-emerald-600 text-sm font-bold">9{8 - i}%</div>
                                        <div className="text-[10px] text-gray-400 uppercase">Consistency</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerReports;
