import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, BarChart, Bar
} from 'recharts';
import {
    Activity, Dumbbell, Target, Trophy, Plus, Flame, Medal,
    Camera, Calendar, Zap, Heart, TrendingUp, TrendingDown, Droplets,
    Clock, ChevronRight, CircleUser
} from 'lucide-react';
import '../../styles/macos-member.css';
import './MyProgress.css';

interface ProgressNote {
    id: number;
    note: string;
    createdAt: string;
    trainer: {
        userId: number;
        fullName: string;
        avatarId?: string;
    };
}

type TabType = 'weight' | 'bodyFat' | 'strength' | 'consistency';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
};

const MyProgress: React.FC = () => {
    const [notes, setNotes] = useState<ProgressNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('weight');
    const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y'>('30D');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const mockNotes: ProgressNote[] = [
            {
                id: 1,
                note: 'Great progress on squats! Increased weight from 135lbs to 155lbs with good form.',
                createdAt: '2025-12-22',
                trainer: { userId: 1, fullName: 'John Smith' }
            }
        ];
        setNotes(mockNotes);
        setLoading(false);
    }, [user?.id]);

    const chartData = [
        { date: 'W1', weight: 85, bodyFat: 22, muscle: 58, volume: 1200 },
        { date: 'W2', weight: 84.2, bodyFat: 21.5, muscle: 58.5, volume: 1350 },
        { date: 'W3', weight: 83.5, bodyFat: 21, muscle: 59, volume: 1500 },
        { date: 'W4', weight: 82, bodyFat: 20, muscle: 60, volume: 1700 },
        { date: 'W5', weight: 81, bodyFat: 19.5, muscle: 61, volume: 1800 },
        { date: 'W6', weight: 79.5, bodyFat: 18.5, muscle: 61.8, volume: 2000 },
        { date: 'W7', weight: 78, bodyFat: 18, muscle: 62.5, volume: 2200 }
    ];

    const heatmapData = Array.from({ length: 28 }, (_, i) => ({
        day: i + 1,
        intensity: Math.floor(Math.random() * 5)
    }));

    const stats = {
        currentWeight: 78,
        startWeight: 85,
        goalWeight: 75,
        bodyFat: 18,
        startBodyFat: 22,
        muscleMass: 62.5,
        streak: 12,
        caloriesBurned: '24.5k',
        waterIntake: 2.4,
        activeMinutes: 156
    };

    const personalBests = [
        { exercise: 'Bench Press', weight: '185 lbs', date: 'Jan 15', icon: '🏋️' },
        { exercise: 'Deadlift', weight: '315 lbs', date: 'Jan 22', icon: '💪' },
        { exercise: 'Squat', weight: '245 lbs', date: 'Jan 10', icon: '🦵' }
    ];

    const activeGoals = [
        { id: 1, title: 'Weight Target', current: 78, target: 75, unit: 'kg', color: '#007AFF' },
        { id: 2, title: 'Muscle Gain', current: 62.5, target: 65, unit: 'kg', color: '#AF52DE' }
    ];

    const weeklyActivity = [
        { day: 'Mon', value: 45, active: true },
        { day: 'Tue', value: 60, active: true },
        { day: 'Wed', value: 0, active: false },
        { day: 'Thu', value: 75, active: true },
        { day: 'Fri', value: 30, active: true },
        { day: 'Sat', value: 90, active: true },
        { day: 'Sun', value: 0, active: false }
    ];

    const WeightIcon = ({ size = 14 }: { size?: number }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"/>
            <path d="M6.5 8a6.5 6.5 0 1 0 11 0Z"/>
        </svg>
    );

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'weight', label: 'Weight', icon: <WeightIcon size={14} /> },
        { id: 'bodyFat', label: 'Body Fat', icon: <Activity size={14} /> },
        { id: 'strength', label: 'Strength', icon: <Dumbbell size={14} /> },
        { id: 'consistency', label: 'Consistency', icon: <Calendar size={14} /> }
    ];

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Activity size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    const weightChange = stats.startWeight - stats.currentWeight;
    const goalProgress = Math.round(((stats.startWeight - stats.currentWeight) / (stats.startWeight - stats.goalWeight)) * 100);

    return (
        <motion.div
            className="macos-page progress-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Top Stats Row - Compact Horizontal Cards */}
            <motion.div className="stats-row" variants={itemVariants}>
                <div className="stat-card stat-card--streak">
                    <div className="stat-card__icon">
                        <Flame size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.streak}</div>
                        <div className="stat-card__label">Day Streak</div>
                    </div>
                    <div className="stat-card__badge">Top 5%</div>
                </div>

                <div className="stat-card stat-card--weight">
                    <div className="stat-card__icon">
                        <WeightIcon size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.currentWeight}<span>kg</span></div>
                        <div className="stat-card__label">Weight</div>
                    </div>
                    <div className="stat-card__trend positive">
                        <TrendingDown size={14} />
                        -{weightChange}kg
                    </div>
                </div>

                <div className="stat-card stat-card--muscle">
                    <div className="stat-card__icon">
                        <Dumbbell size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.muscleMass}<span>kg</span></div>
                        <div className="stat-card__label">Muscle Mass</div>
                    </div>
                    <div className="stat-card__trend positive">
                        <TrendingUp size={14} />
                        +1.2kg
                    </div>
                </div>

                <div className="stat-card stat-card--calories">
                    <div className="stat-card__icon">
                        <Zap size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.caloriesBurned}</div>
                        <div className="stat-card__label">Calories</div>
                    </div>
                    <div className="stat-card__sub">Energy spent</div>
                </div>
            </motion.div>

            {/* Main Chart Section */}
            <motion.section className="chart-section" variants={itemVariants}>
                <div className="chart-section__header">
                    <div className="chart-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`chart-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="time-filters">
                        {(['30D', '90D', '1Y'] as const).map((range) => (
                            <button
                                key={range}
                                className={`time-filter ${timeRange === range ? 'active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-container">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="chart-inner"
                        >
                            {activeTab === 'consistency' ? (
                                <div className="heatmap-container">
                                    <div className="heatmap-weeks">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <span key={day} className="heatmap-day-label">{day}</span>
                                        ))}
                                    </div>
                                    <div className="heatmap-grid">
                                        {heatmapData.map((d, i) => (
                                            <motion.div
                                                key={d.day}
                                                className={`heatmap-cell intensity-${d.intensity}`}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                            />
                                        ))}
                                    </div>
                                    <div className="heatmap-legend">
                                        <span>Less</span>
                                        <div className="legend-cells">
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <div key={i} className={`legend-cell intensity-${i}`} />
                                            ))}
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    {activeTab === 'weight' ? (
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#007AFF" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis hide domain={['dataMin - 3', 'dataMax + 2']} />
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }}
                                                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                                            />
                                            <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={2.5} fill="url(#weightGradient)" dot={{ fill: '#007AFF', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#007AFF' }} />
                                        </AreaChart>
                                    ) : activeTab === 'bodyFat' ? (
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#34C759" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                            <Area type="monotone" dataKey="bodyFat" stroke="#34C759" strokeWidth={2.5} fill="url(#fatGradient)" dot={{ fill: '#34C759', strokeWidth: 0, r: 3 }} />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={chartData} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                            <Bar dataKey="volume" fill="#AF52DE" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.section>

            {/* Three Column Grid */}
            <motion.div className="three-col-grid" variants={itemVariants}>
                {/* Personal Bests */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <Trophy size={18} className="icon-gold" />
                        <h3>Personal Bests</h3>
                    </div>
                    <div className="pb-list">
                        {personalBests.map((pb, idx) => (
                            <div key={idx} className="pb-item">
                                <div className="pb-item__left">
                                    <span className="pb-emoji">{pb.icon}</span>
                                    <div className="pb-item__info">
                                        <span className="pb-exercise">{pb.exercise}</span>
                                        <span className="pb-date">{pb.date}</span>
                                    </div>
                                </div>
                                <span className="pb-weight">{pb.weight}</span>
                            </div>
                        ))}
                    </div>
                    <button className="panel-btn">
                        View Lift Library
                        <ChevronRight size={14} />
                    </button>
                </div>

                {/* Active Goals */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <Target size={18} className="icon-blue" />
                        <h3>Active Goals</h3>
                    </div>
                    <div className="goals-list">
                        {activeGoals.map(goal => {
                            const progress = Math.round(((goal.current - (goal.id === 1 ? stats.startWeight : 58)) / (goal.target - (goal.id === 1 ? stats.startWeight : 58))) * 100);
                            return (
                                <div key={goal.id} className="goal-item">
                                    <div className="goal-item__header">
                                        <span className="goal-title">{goal.title}</span>
                                        <span className="goal-percent">{Math.min(100, Math.max(0, goal.id === 1 ? goalProgress : 64))}%</span>
                                    </div>
                                    <div className="goal-bar">
                                        <motion.div
                                            className="goal-bar__fill"
                                            style={{ background: goal.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, Math.max(0, goal.id === 1 ? goalProgress : 64))}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                        />
                                    </div>
                                    <div className="goal-values">
                                        {goal.current}{goal.unit} / {goal.target}{goal.unit}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trainer Feedback */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <Heart size={18} className="icon-pink" />
                        <h3>Trainer Feedback</h3>
                    </div>
                    <div className="trainer-feedback">
                        <div className="trainer-profile">
                            <div className="trainer-avatar">JS</div>
                            <div className="trainer-info">
                                <span className="trainer-name">John Smith</span>
                                <span className="trainer-time">2 days ago</span>
                            </div>
                        </div>
                        <p className="feedback-text">"{notes[0]?.note || 'No feedback yet'}"</p>
                        <button className="panel-btn panel-btn--primary">
                            Read Full Note
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Milestones Timeline */}
            <motion.section className="milestones-section" variants={itemVariants}>
                <div className="milestones-track">
                    <div className="milestone-line" />
                    <div className="milestone completed">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>Started Journey</span>
                    </div>
                    <div className="milestone completed">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>First 10 Workouts</span>
                    </div>
                    <div className="milestone active">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>30 Day Streak</span>
                        <div className="milestone__pulse" />
                    </div>
                    <div className="milestone upcoming">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>Strength Mastery</span>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default MyProgress;
