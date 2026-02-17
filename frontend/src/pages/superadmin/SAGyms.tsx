import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Building2, X, Users, DollarSign,
    Calendar, Download, UserCog, Pause, Play,
    TrendingUp, TrendingDown, Activity, Clock, MapPin,
    Zap, CheckCircle2, Plus, AlertTriangle, Mail, Send
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const MOCK_GYMS = [
    {
        id: 1, name: 'FitZone Elite', owner: 'Rahul Sharma', email: 'rahul@fitzone.com', plan: 'Enterprise', status: 'active',
        members: 342, trainers: 12, revenue: 12400, city: 'Mumbai', state: 'Maharashtra', created: '2024-01-15',
        lastActive: '2 min ago', healthScore: 94, retentionRate: 87, avgSessionDuration: '1h 12m',
        growth: +8.3, classesPerWeek: 45, equipmentCount: 78,
        revenueHistory: [
            { m: 'Sep', v: 9800 }, { m: 'Oct', v: 10200 }, { m: 'Nov', v: 11100 },
            { m: 'Dec', v: 11800 }, { m: 'Jan', v: 12100 }, { m: 'Feb', v: 12400 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 290 }, { m: 'Oct', v: 305 }, { m: 'Nov', v: 318 },
            { m: 'Dec', v: 325 }, { m: 'Jan', v: 334 }, { m: 'Feb', v: 342 }
        ],
        peakHours: [
            { h: '6am', v: 24 }, { h: '8am', v: 68 }, { h: '10am', v: 42 }, { h: '12pm', v: 35 },
            { h: '4pm', v: 56 }, { h: '6pm', v: 85 }, { h: '8pm', v: 72 }, { h: '10pm', v: 28 }
        ],
        recentActivity: [
            { action: 'New member registered', detail: 'Priya Kapoor — Annual Plan', time: '5 min ago' },
            { action: 'Payment received', detail: '₹4,999 — Membership renewal', time: '22 min ago' },
            { action: 'Class created', detail: 'HIIT Bootcamp — Mon/Wed/Fri 7AM', time: '1 hr ago' },
            { action: 'Trainer assigned', detail: 'Vikram → Strength Training batch', time: '3 hr ago' },
        ],
        features: ['Online Booking', 'Payment Gateway', 'Progress Tracking', 'Class Schedule', 'QR Check-in'],
    },
    {
        id: 2, name: 'PowerHouse Gym', owner: 'Priya Patel', email: 'priya@powerhouse.com', plan: 'Pro', status: 'active',
        members: 189, trainers: 6, revenue: 7800, city: 'Delhi', state: 'Delhi', created: '2024-03-22',
        lastActive: '15 min ago', healthScore: 82, retentionRate: 74, avgSessionDuration: '58m',
        growth: +5.1, classesPerWeek: 28, equipmentCount: 52,
        revenueHistory: [
            { m: 'Sep', v: 6200 }, { m: 'Oct', v: 6500 }, { m: 'Nov', v: 6900 },
            { m: 'Dec', v: 7100 }, { m: 'Jan', v: 7500 }, { m: 'Feb', v: 7800 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 152 }, { m: 'Oct', v: 160 }, { m: 'Nov', v: 168 },
            { m: 'Dec', v: 174 }, { m: 'Jan', v: 182 }, { m: 'Feb', v: 189 }
        ],
        peakHours: [
            { h: '6am', v: 18 }, { h: '8am', v: 45 }, { h: '10am', v: 30 }, { h: '12pm', v: 22 },
            { h: '4pm', v: 38 }, { h: '6pm', v: 62 }, { h: '8pm', v: 55 }, { h: '10pm', v: 20 }
        ],
        recentActivity: [
            { action: 'Equipment maintenance', detail: 'Treadmill #3 — scheduled service', time: '1 hr ago' },
            { action: 'Payment failed', detail: 'Amit Singh — card declined', time: '4 hr ago' },
        ],
        features: ['Online Booking', 'Payment Gateway', 'Class Schedule'],
    },
    {
        id: 3, name: 'IronForge', owner: 'Amit Singh', email: 'amit@ironforge.com', plan: 'Enterprise', status: 'active',
        members: 524, trainers: 18, revenue: 21500, city: 'Bangalore', state: 'Karnataka', created: '2023-11-08',
        lastActive: '1 min ago', healthScore: 97, retentionRate: 91, avgSessionDuration: '1h 25m',
        growth: +12.7, classesPerWeek: 62, equipmentCount: 120,
        revenueHistory: [
            { m: 'Sep', v: 16800 }, { m: 'Oct', v: 17500 }, { m: 'Nov', v: 18200 },
            { m: 'Dec', v: 19100 }, { m: 'Jan', v: 20400 }, { m: 'Feb', v: 21500 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 430 }, { m: 'Oct', v: 452 }, { m: 'Nov', v: 470 },
            { m: 'Dec', v: 488 }, { m: 'Jan', v: 508 }, { m: 'Feb', v: 524 }
        ],
        peakHours: [
            { h: '6am', v: 42 }, { h: '8am', v: 95 }, { h: '10am', v: 65 }, { h: '12pm', v: 48 },
            { h: '4pm', v: 72 }, { h: '6pm', v: 110 }, { h: '8pm', v: 98 }, { h: '10pm', v: 45 }
        ],
        recentActivity: [
            { action: 'Milestone reached', detail: '500+ active members 🎉', time: '2 days ago' },
            { action: 'New trainer onboarded', detail: 'Deepak Joshi — CrossFit specialist', time: '3 days ago' },
        ],
        features: ['Online Booking', 'Payment Gateway', 'Progress Tracking', 'Class Schedule', 'QR Check-in', 'Messaging', 'Reports Export'],
    },
    {
        id: 4, name: 'FlexFit Studio', owner: 'Neha Gupta', email: 'neha@flexfit.com', plan: 'Starter', status: 'suspended',
        members: 45, trainers: 2, revenue: 0, city: 'Pune', state: 'Maharashtra', created: '2024-06-10',
        lastActive: '2 days ago', healthScore: 28, retentionRate: 42, avgSessionDuration: '35m',
        growth: -15.2, classesPerWeek: 8, equipmentCount: 18,
        revenueHistory: [
            { m: 'Sep', v: 1800 }, { m: 'Oct', v: 1500 }, { m: 'Nov', v: 1200 },
            { m: 'Dec', v: 800 }, { m: 'Jan', v: 400 }, { m: 'Feb', v: 0 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 68 }, { m: 'Oct', v: 62 }, { m: 'Nov', v: 58 },
            { m: 'Dec', v: 55 }, { m: 'Jan', v: 50 }, { m: 'Feb', v: 45 }
        ],
        peakHours: [
            { h: '6am', v: 3 }, { h: '8am', v: 8 }, { h: '10am', v: 5 }, { h: '12pm', v: 4 },
            { h: '4pm', v: 6 }, { h: '6pm', v: 12 }, { h: '8pm', v: 10 }, { h: '10pm', v: 3 }
        ],
        recentActivity: [
            { action: 'Account suspended', detail: 'Payment overdue — 3 months', time: '2 days ago' },
        ],
        features: ['Online Booking'],
    },
    {
        id: 5, name: 'Muscle Factory', owner: 'Vikram Reddy', email: 'vikram@muscle.com', plan: 'Pro', status: 'active',
        members: 267, trainers: 9, revenue: 9200, city: 'Hyderabad', state: 'Telangana', created: '2024-02-28',
        lastActive: '8 min ago', healthScore: 88, retentionRate: 80, avgSessionDuration: '1h 05m',
        growth: +6.8, classesPerWeek: 35, equipmentCount: 65,
        revenueHistory: [
            { m: 'Sep', v: 7200 }, { m: 'Oct', v: 7600 }, { m: 'Nov', v: 8000 },
            { m: 'Dec', v: 8400 }, { m: 'Jan', v: 8800 }, { m: 'Feb', v: 9200 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 220 }, { m: 'Oct', v: 232 }, { m: 'Nov', v: 240 },
            { m: 'Dec', v: 248 }, { m: 'Jan', v: 258 }, { m: 'Feb', v: 267 }
        ],
        peakHours: [
            { h: '6am', v: 22 }, { h: '8am', v: 55 }, { h: '10am', v: 35 }, { h: '12pm', v: 28 },
            { h: '4pm', v: 45 }, { h: '6pm', v: 72 }, { h: '8pm', v: 60 }, { h: '10pm', v: 25 }
        ],
        recentActivity: [
            { action: 'New class launched', detail: 'Boxing Fundamentals — Tue/Thu', time: '1 day ago' },
            { action: 'Payment received', detail: '₹9,200 monthly subscription', time: '2 days ago' },
        ],
        features: ['Online Booking', 'Payment Gateway', 'Progress Tracking', 'Class Schedule'],
    },
    {
        id: 6, name: 'CrossTrain Hub', owner: 'Ananya Joshi', email: 'ananya@crosstrain.com', plan: 'Enterprise', status: 'active',
        members: 412, trainers: 15, revenue: 18700, city: 'Chennai', state: 'Tamil Nadu', created: '2023-09-14',
        lastActive: '30 sec ago', healthScore: 95, retentionRate: 89, avgSessionDuration: '1h 18m',
        growth: +10.4, classesPerWeek: 54, equipmentCount: 95,
        revenueHistory: [
            { m: 'Sep', v: 14200 }, { m: 'Oct', v: 15000 }, { m: 'Nov', v: 15800 },
            { m: 'Dec', v: 16500 }, { m: 'Jan', v: 17600 }, { m: 'Feb', v: 18700 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 340 }, { m: 'Oct', v: 358 }, { m: 'Nov', v: 372 },
            { m: 'Dec', v: 385 }, { m: 'Jan', v: 398 }, { m: 'Feb', v: 412 }
        ],
        peakHours: [
            { h: '6am', v: 35 }, { h: '8am', v: 82 }, { h: '10am', v: 55 }, { h: '12pm', v: 40 },
            { h: '4pm', v: 65 }, { h: '6pm', v: 98 }, { h: '8pm', v: 85 }, { h: '10pm', v: 38 }
        ],
        recentActivity: [
            { action: 'Revenue milestone', detail: 'Annual revenue crossed ₹2L mark', time: '1 day ago' },
            { action: 'Feature enabled', detail: 'QR Check-in activated', time: '3 days ago' },
        ],
        features: ['Online Booking', 'Payment Gateway', 'Progress Tracking', 'Class Schedule', 'QR Check-in', 'Messaging'],
    },
    {
        id: 7, name: 'Zen Fitness', owner: 'Karan Malhotra', email: 'karan@zen.com', plan: 'Starter', status: 'trial',
        members: 23, trainers: 2, revenue: 0, city: 'Jaipur', state: 'Rajasthan', created: '2025-01-05',
        lastActive: '1 hr ago', healthScore: 62, retentionRate: 65, avgSessionDuration: '45m',
        growth: 0, classesPerWeek: 12, equipmentCount: 22,
        revenueHistory: [
            { m: 'Sep', v: 0 }, { m: 'Oct', v: 0 }, { m: 'Nov', v: 0 },
            { m: 'Dec', v: 0 }, { m: 'Jan', v: 0 }, { m: 'Feb', v: 0 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 0 }, { m: 'Oct', v: 0 }, { m: 'Nov', v: 0 },
            { m: 'Dec', v: 0 }, { m: 'Jan', v: 8 }, { m: 'Feb', v: 23 }
        ],
        peakHours: [
            { h: '6am', v: 2 }, { h: '8am', v: 6 }, { h: '10am', v: 4 }, { h: '12pm', v: 3 },
            { h: '4pm', v: 5 }, { h: '6pm', v: 8 }, { h: '8pm', v: 7 }, { h: '10pm', v: 2 }
        ],
        recentActivity: [
            { action: 'Trial started', detail: '14-day free trial — Day 6', time: '6 days ago' },
        ],
        features: ['Online Booking'],
    },
    {
        id: 8, name: 'Peak Performance', owner: 'Sanjay Kumar', email: 'sanjay@peak.com', plan: 'Pro', status: 'active',
        members: 156, trainers: 5, revenue: 6100, city: 'Kolkata', state: 'West Bengal', created: '2024-08-19',
        lastActive: '20 min ago', healthScore: 76, retentionRate: 72, avgSessionDuration: '52m',
        growth: +3.4, classesPerWeek: 22, equipmentCount: 40,
        revenueHistory: [
            { m: 'Sep', v: 4800 }, { m: 'Oct', v: 5100 }, { m: 'Nov', v: 5400 },
            { m: 'Dec', v: 5600 }, { m: 'Jan', v: 5900 }, { m: 'Feb', v: 6100 }
        ],
        memberGrowth: [
            { m: 'Sep', v: 120 }, { m: 'Oct', v: 128 }, { m: 'Nov', v: 135 },
            { m: 'Dec', v: 140 }, { m: 'Jan', v: 148 }, { m: 'Feb', v: 156 }
        ],
        peakHours: [
            { h: '6am', v: 12 }, { h: '8am', v: 32 }, { h: '10am', v: 22 }, { h: '12pm', v: 18 },
            { h: '4pm', v: 28 }, { h: '6pm', v: 48 }, { h: '8pm', v: 40 }, { h: '10pm', v: 15 }
        ],
        recentActivity: [
            { action: 'Feedback received', detail: '4.2★ average rating this month', time: '1 day ago' },
        ],
        features: ['Online Booking', 'Payment Gateway', 'Class Schedule'],
    },
];

type Gym = typeof MOCK_GYMS[0];

const SAGyms: React.FC = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [detailTab, setDetailTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [suspendGym, setSuspendGym] = useState<Gym | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showCommsModal, setShowCommsModal] = useState(false);
    const [commsTarget, setCommsTarget] = useState<Gym | null>(null);
    const [exportFormat, setExportFormat] = useState('csv');

    const filtered = MOCK_GYMS.filter(g => {
        const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
            g.owner.toLowerCase().includes(search.toLowerCase()) ||
            g.city.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || g.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totals = useMemo(() => ({
        gyms: MOCK_GYMS.length,
        active: MOCK_GYMS.filter(g => g.status === 'active').length,
        members: MOCK_GYMS.reduce((s, g) => s + g.members, 0),
        revenue: MOCK_GYMS.reduce((s, g) => s + g.revenue, 0),
    }), []);

    const statusColor = (s: string) => s === 'active' ? 'green' : s === 'suspended' ? 'red' : 'amber';
    const planColor = (p: string) => p === 'Enterprise' ? 'violet' : p === 'Pro' ? 'blue' : 'gray';
    const healthColor = (h: number) => h >= 85 ? '#22c55e' : h >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="sa">
            <header className="sa__header">
                <div className="sa__header-left">
                    <h1>Gym Management</h1>
                    <p>{totals.gyms} gyms · {totals.members.toLocaleString()} total members · ${totals.revenue.toLocaleString()}/mo revenue</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowExportModal(true)}><Download size={14} /> Export</button>
                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Gym</button>
                </div>
            </header>

            {/* Summary KPIs */}
            <div className="sa__kpi-row">
                {[
                    { label: 'Total Gyms', value: String(totals.gyms), color: 'blue', icon: Building2 },
                    { label: 'Active', value: String(totals.active), color: 'emerald', icon: CheckCircle2 },
                    { label: 'Total Members', value: totals.members.toLocaleString(), color: 'violet', icon: Users },
                    { label: 'Platform Revenue', value: `$${totals.revenue.toLocaleString()}`, color: 'cyan', icon: DollarSign },
                ].map((kpi, i) => (
                    <motion.div key={kpi.label} className={`sa__kpi sa__kpi--${kpi.color}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className="sa__kpi-icon"><kpi.icon size={18} /></div>
                        <div className="sa__kpi-body">
                            <div className="sa__kpi-label">{kpi.label}</div>
                            <div className="sa__kpi-value">{kpi.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="sa__toolbar">
                <div className="sa__search">
                    <Search size={14} />
                    <input placeholder="Search gyms, owners, cities..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'active', 'trial', 'suspended'].map(f => (
                    <button key={f} className={`sa__filter ${statusFilter === f ? 'sa__filter--active' : ''}`} onClick={() => setStatusFilter(f)}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="sa__card" style={{ padding: 0, overflow: 'auto' }}>
                <table className="sa__table">
                    <thead>
                        <tr>
                            <th>Gym Name</th>
                            <th>Owner</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Health</th>
                            <th>Members</th>
                            <th>Rev/mo</th>
                            <th>Growth</th>
                            <th>Last Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(gym => (
                            <tr key={gym.id} onClick={() => { setSelectedGym(gym); setDetailTab('overview'); }}>
                                <td style={{ fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Building2 size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                        <div>
                                            <div>{gym.name}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                                                <MapPin size={8} style={{ marginRight: 2 }} />{gym.city}, {gym.state}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: 12 }}>{gym.owner}</td>
                                <td><span className={`sa__badge sa__badge--${planColor(gym.plan)}`}>{gym.plan}</span></td>
                                <td><span className={`sa__badge sa__badge--${statusColor(gym.status)}`}>{gym.status}</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--bg-active)' }}>
                                            <div style={{ width: `${gym.healthScore}%`, height: '100%', borderRadius: 2, background: healthColor(gym.healthScore) }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: healthColor(gym.healthScore) }}>{gym.healthScore}</span>
                                    </div>
                                </td>
                                <td>{gym.members.toLocaleString()}</td>
                                <td>${gym.revenue.toLocaleString()}</td>
                                <td>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: gym.growth >= 0 ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {gym.growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {gym.growth > 0 ? '+' : ''}{gym.growth}%
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{gym.lastActive}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="sa__pagination" style={{ padding: '12px 14px' }}>
                    <span className="sa__pagination-info">Showing {filtered.length} of {MOCK_GYMS.length} gyms</span>
                </div>
            </div>

            {/* Popup Modal */}
            <AnimatePresence>
                {selectedGym && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGym(null)}>
                        <motion.div
                            className="sa__modal sa__modal--wide"
                            initial={{ opacity: 0, scale: 0.92, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 30 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Building2 size={18} color="#fff" />
                                        </div>
                                        <div>
                                            <div className="sa__modal-title">{selectedGym.name}</div>
                                            <div className="sa__modal-subtitle">
                                                <MapPin size={10} style={{ marginRight: 2 }} />{selectedGym.city}, {selectedGym.state} · Since {selectedGym.created} · <span className={`sa__badge sa__badge--${planColor(selectedGym.plan)}`} style={{ marginLeft: 4 }}>{selectedGym.plan}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="sa__modal-close" onClick={() => setSelectedGym(null)}><X size={16} /></button>
                            </div>

                            {/* Tabs */}
                            <div className="sa__modal-tabs">
                                {(['overview', 'analytics', 'activity'] as const).map(tab => (
                                    <button key={tab} className={`sa__modal-tab ${detailTab === tab ? 'sa__modal-tab--active' : ''}`} onClick={() => setDetailTab(tab)}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="sa__modal-body">
                                {detailTab === 'overview' && (
                                    <>
                                        {/* Health Banner */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: `${healthColor(selectedGym.healthScore)}08`, borderRadius: 14, marginBottom: 20, border: `1px solid ${healthColor(selectedGym.healthScore)}20` }}>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${healthColor(selectedGym.healthScore)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: healthColor(selectedGym.healthScore) }}>
                                                {selectedGym.healthScore}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Health Score</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    {selectedGym.healthScore >= 85 ? 'Excellent — gym is thriving' : selectedGym.healthScore >= 60 ? 'Good — room for improvement' : 'At risk — needs attention'}
                                                </div>
                                            </div>
                                            <span className={`sa__badge sa__badge--${statusColor(selectedGym.status)}`}>{selectedGym.status}</span>
                                        </div>

                                        {/* 6-Stat Grid */}
                                        <div className="sa__modal-stat-grid">
                                            {[
                                                { label: 'Members', value: selectedGym.members, icon: Users, color: '#3b82f6' },
                                                { label: 'Trainers', value: selectedGym.trainers, icon: Zap, color: '#8b5cf6' },
                                                { label: 'Revenue/mo', value: `$${selectedGym.revenue.toLocaleString()}`, icon: DollarSign, color: '#10b981' },
                                                { label: 'Retention', value: `${selectedGym.retentionRate}%`, icon: TrendingUp, color: '#22c55e' },
                                                { label: 'Avg Session', value: selectedGym.avgSessionDuration, icon: Clock, color: '#f59e0b' },
                                                { label: 'Classes/wk', value: selectedGym.classesPerWeek, icon: Calendar, color: '#06b6d4' },
                                            ].map(stat => (
                                                <div key={stat.label} className="sa__modal-stat">
                                                    <div className="sa__modal-stat-label"><stat.icon size={10} style={{ color: stat.color }} />{stat.label}</div>
                                                    <div className="sa__modal-stat-value">{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Two-column: Owner Info + Features */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div>
                                                <div className="sa__modal-section-title">Owner Details</div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Name</span><span className="sa__stat-value">{selectedGym.owner}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Email</span><span className="sa__stat-value" style={{ fontSize: 11 }}>{selectedGym.email}</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Equipment</span><span className="sa__stat-value">{selectedGym.equipmentCount} items</span></div>
                                                <div className="sa__stat-row"><span className="sa__stat-label">Growth</span><span style={{ fontSize: 12, fontWeight: 600, color: selectedGym.growth >= 0 ? '#22c55e' : '#ef4444' }}>{selectedGym.growth > 0 ? '+' : ''}{selectedGym.growth}%</span></div>
                                            </div>
                                            <div>
                                                <div className="sa__modal-section-title">Active Features ({selectedGym.features.length})</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                    {selectedGym.features.map(f => (
                                                        <span key={f} className="sa__badge sa__badge--blue" style={{ fontSize: 10 }}>{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {detailTab === 'analytics' && (
                                    <>
                                        {/* Two chart columns */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                            <div>
                                                <div className="sa__modal-section-title">Revenue Trend (6mo)</div>
                                                <div style={{ height: 160 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={selectedGym.revenueHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="mRevG" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                            <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#mRevG)" dot={false} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="sa__modal-section-title">Member Growth</div>
                                                <div style={{ height: 160 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={selectedGym.memberGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="mMemG" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                            <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#mMemG)" dot={false} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Peak Hours full width */}
                                        <div className="sa__modal-section-title">Peak Usage Hours</div>
                                        <div style={{ height: 140 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={selectedGym.peakHours} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                    <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                                    <Bar dataKey="v" radius={[4, 4, 0, 0]} barSize={28}>
                                                        {selectedGym.peakHours.map((entry, i) => (
                                                            <Cell key={i} fill={entry.v > 70 ? '#ef4444' : entry.v > 40 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.7} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}

                                {detailTab === 'activity' && (
                                    <>
                                        <div className="sa__modal-section-title">Recent Activity</div>
                                        {selectedGym.recentActivity.map((act, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: 10, marginBottom: 4 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 5, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{act.action}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{act.detail}</div>
                                                </div>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>{act.time}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm"><UserCog size={14} /> Impersonate</button>
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => { setCommsTarget(selectedGym); setShowCommsModal(true); }}><Mail size={14} /> Email Owner</button>
                                {selectedGym.status === 'active' ? (
                                    <button className="sa__btn sa__btn--danger sa__btn--sm" onClick={() => { setSuspendGym(selectedGym); setSelectedGym(null); }}><Pause size={14} /> Suspend</button>
                                ) : (
                                    <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => { setSuspendGym(selectedGym); setSelectedGym(null); }}><Play size={14} /> Activate</button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Add Gym Modal ── */}
                {showAddModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Add New Gym</div><div className="sa__modal-subtitle">Register a new gym on the platform</div></div>
                                <button className="sa__modal-close" onClick={() => setShowAddModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                {[{ label: 'Gym Name', placeholder: 'e.g. FitZone Elite', type: 'text' }, { label: 'Owner Name', placeholder: 'e.g. Rahul Sharma', type: 'text' }, { label: 'Owner Email', placeholder: 'e.g. owner@gym.com', type: 'email' }, { label: 'City', placeholder: 'e.g. Mumbai', type: 'text' }].map((f, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                                        <input type={f.type} placeholder={f.placeholder} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                                    </div>
                                ))}
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</label>
                                    <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                                        <option value="starter">Starter</option>
                                        <option value="pro">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowAddModal(false)}><Plus size={14} /> Create Gym</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Suspend / Activate Confirmation ── */}
                {suspendGym && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSuspendGym(null)}>
                        <motion.div className="sa__modal" style={{ width: 480 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" style={{ background: suspendGym.status === 'active' ? 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' : 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)' }} />
                                <div><div className="sa__modal-title">{suspendGym.status === 'active' ? 'Suspend' : 'Activate'} {suspendGym.name}?</div></div>
                                <button className="sa__modal-close" onClick={() => setSuspendGym(null)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ padding: '14px 18px', background: `rgba(${suspendGym.status === 'active' ? '239,68,68' : '34,197,94'}, 0.06)`, borderRadius: 14, marginBottom: 16, border: `1px solid rgba(${suspendGym.status === 'active' ? '239,68,68' : '34,197,94'}, 0.15)` }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: suspendGym.status === 'active' ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <AlertTriangle size={14} /> {suspendGym.status === 'active' ? 'This will restrict gym access' : 'This will restore gym access'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {suspendGym.status === 'active' ? 'Members and trainers will lose access. Billing will be paused.' : 'Members and trainers will regain access. Billing will resume.'}
                                    </div>
                                </div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Gym</span><span className="sa__stat-value">{suspendGym.name}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Owner</span><span className="sa__stat-value">{suspendGym.owner}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Affected Members</span><span className="sa__stat-value">{suspendGym.members}</span></div>
                                <div className="sa__stat-row"><span className="sa__stat-label">Monthly Revenue</span><span className="sa__stat-value">${suspendGym.revenue.toLocaleString()}</span></div>
                                {suspendGym.status === 'active' && (
                                    <div style={{ marginTop: 14 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</label>
                                        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
                                            <option value="">Select reason...</option>
                                            <option value="payment">Payment Overdue</option>
                                            <option value="violation">Terms Violation</option>
                                            <option value="request">Owner Request</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setSuspendGym(null)}>Cancel</button>
                                <button className={`sa__btn sa__btn--${suspendGym.status === 'active' ? 'danger' : 'primary'} sa__btn--sm`} onClick={() => setSuspendGym(null)}>
                                    {suspendGym.status === 'active' ? <><Pause size={14} /> Suspend</> : <><Play size={14} /> Activate</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Export Modal ── */}
                {showExportModal && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportModal(false)}>
                        <motion.div className="sa__modal" style={{ width: 440 }} initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Export Gym Data</div></div>
                                <button className="sa__modal-close" onClick={() => setShowExportModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Format</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {['csv', 'pdf', 'json'].map(f => (
                                            <button key={f} className={`sa__btn ${exportFormat === f ? 'sa__btn--primary' : 'sa__btn--ghost'} sa__btn--sm`} onClick={() => setExportFormat(f)} style={{ flex: 1 }}>{f.toUpperCase()}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Include</label>
                                    {['Gym Details', 'Owner Info', 'Financial Data', 'Member Stats', 'Health Scores', 'Activity Log'].map(item => (
                                        <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} /> {item}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowExportModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowExportModal(false)}><Download size={14} /> Export {exportFormat.toUpperCase()}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Communications Modal ── */}
                {showCommsModal && commsTarget && (
                    <motion.div className="sa__modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommsModal(false)}>
                        <motion.div className="sa__modal" initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 28, stiffness: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="sa__modal-header">
                                <div className="sa__modal-header-banner" />
                                <div><div className="sa__modal-title">Email {commsTarget.owner}</div><div className="sa__modal-subtitle">{commsTarget.email} · {commsTarget.name}</div></div>
                                <button className="sa__modal-close" onClick={() => setShowCommsModal(false)}><X size={16} /></button>
                            </div>
                            <div className="sa__modal-body">
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</label>
                                    <input type="text" placeholder="e.g. Important update about your gym" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Template</label>
                                    <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
                                        <option value="">Custom message</option>
                                        <option value="payment">Payment Reminder</option>
                                        <option value="feature">New Feature Announcement</option>
                                        <option value="welcome">Welcome / Onboarding</option>
                                        <option value="maintenance">Maintenance Notice</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
                                    <textarea placeholder="Write your message..." rows={5} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                                </div>
                            </div>
                            <div className="sa__modal-footer">
                                <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={() => setShowCommsModal(false)}>Cancel</button>
                                <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={() => setShowCommsModal(false)}><Send size={14} /> Send Email</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SAGyms;
