import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, BarChart, Bar
} from 'recharts';
import {
    Scale, Activity, TrendingDown, TrendingUp, Dumbbell, User,
    Target, Trophy, Plus, ChevronRight, Flame, Award, Medal,
    Camera, Calendar, Timer, Zap, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
import './MyProgress.css';

// Achievement icon mapping
const achievementIcons: Record<string, React.ReactNode> = {
    streak: <Flame size={24} color="var(--macos-warning)" />,
    classes: <Dumbbell size={24} color="var(--macos-success)" />,
    goal: <Target size={24} color="var(--macos-accent)" />,
    trophy: <Trophy size={24} color="var(--macos-purple)" />
};

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
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const MyProgress: React.FC = () => {
    const [notes, setNotes] = useState<ProgressNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('weight');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        // Set mock data for development
        const mockNotes: ProgressNote[] = [
            {
                id: 1,
                note: 'Great progress on squats! Increased weight from 135lbs to 155lbs with good form. Continue focusing on depth.',
                createdAt: '2025-12-22',
                trainer: { userId: 1, fullName: 'John Smith' }
            },
            {
                id: 2,
                note: 'Completed initial assessment. Current fitness level: Intermediate. Starting 12-week muscle building program.',
                createdAt: '2025-12-15',
                trainer: { userId: 1, fullName: 'John Smith' }
            }
        ];
        setNotes(mockNotes);
        setLoading(false);
    }, [user?.id]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Chart Data
    const chartData = [
        { date: 'Oct', weight: 85, bodyFat: 22, muscle: 58, volume: 1200 },
        { date: 'Nov', weight: 83.5, bodyFat: 21, muscle: 59, volume: 1500 },
        { date: 'Dec', weight: 81, bodyFat: 19.5, muscle: 61, volume: 1800 },
        { date: 'Jan', weight: 78, bodyFat: 18, muscle: 62.5, volume: 2200 }
    ];

    // Simulated Heatmap Data (last 30 days)
    const heatmapData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        intensity: Math.floor(Math.random() * 5)
    }));

    // Stats
    const stats = {
        currentWeight: 78,
        startWeight: 85,
        goalWeight: 75,
        bodyFat: 18,
        startBodyFat: 22,
        muscleMass: 62.5,
        bmi: 22.4,
        streak: 12,
        totalWorkouts: 48,
        caloriesBurned: '24.5k'
    };

    // Personal Bests
    const personalBests = [
        { exercise: 'Bench Press', weight: '185 lbs', date: 'Jan 15' },
        { exercise: 'Deadlift', weight: '315 lbs', date: 'Jan 22' },
        { exercise: 'Squat', weight: '245 lbs', date: 'Jan 10' }
    ];

    // Active Goals
    const activeGoals = [
        { id: 1, title: 'Weight Target', current: 78, target: 75, progress: 70, unit: 'kg' },
        { id: 2, title: 'Muscle Gain', current: 62.5, target: 65, progress: 45, unit: 'kg' }
    ];

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'weight', label: 'Weight', icon: <Scale size={14} /> },
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

    return (
        <motion.div
            className="macos-page progress-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Redesigned Hero Journey Section */}
            <motion.section className="progress-hero" variants={itemVariants}>
                <div className="progress-hero__content">
                    <div className="progress-hero__header">
                        <div className="progress-hero__badge">Transformation Journey</div>
                        <h1 className="macos-heading-xl">You're making incredible progress, {user?.fullName?.split(' ')[0]}!</h1>
                        <p className="macos-text-md">You've reached 85% of your monthly fitness goal. Keep the momentum going!</p>
                    </div>
                    
                    <div className="progress-hero__actions">
                        <button className="macos-btn macos-btn--primary">
                            <Plus size={16} /> Log Metric
                        </button>
                        <button className="macos-btn macos-btn--secondary">
                            <Camera size={16} /> Progress Photo
                        </button>
                    </div>
                </div>

                <div className="progress-hero__stats">
                    <div className="journey-ring">
                        <svg viewBox="0 0 100 100">
                            <circle className="journey-ring__bg" cx="50" cy="50" r="45" />
                            <motion.circle 
                                className="journey-ring__fill" 
                                cx="50" cy="50" r="45" 
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * 0.85) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="journey-ring__text">
                            <span className="value">85%</span>
                            <span className="label">Monthly Goal</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* High Density Bento Stats */}
            <motion.div className="bento-grid bento-grid--4col" variants={itemVariants}>
                <motion.div className="glass-card glass-card--md progress-stat-bento" whileHover={{ y: -4 }}>
                    <div className="progress-stat-bento__icon icon--orange">
                        <Flame size={20} />
                    </div>
                    <div className="progress-stat-bento__content">
                        <div className="value">{stats.streak}</div>
                        <div className="label">Day Streak</div>
                        <div className="sub-label">Top 5% this month</div>
                    </div>
                </motion.div>

                <motion.div className="glass-card glass-card--md progress-stat-bento" whileHover={{ y: -4 }}>
                    <div className="progress-stat-bento__icon icon--blue">
                        <Scale size={20} />
                    </div>
                    <div className="progress-stat-bento__content">
                        <div className="value">{stats.currentWeight}<span>kg</span></div>
                        <div className="label">Weight</div>
                        <div className="change positive">-{stats.startWeight - stats.currentWeight}kg total</div>
                    </div>
                </motion.div>

                <motion.div className="glass-card glass-card--md progress-stat-bento" whileHover={{ y: -4 }}>
                    <div className="progress-stat-bento__icon icon--purple">
                        <Dumbbell size={20} />
                    </div>
                    <div className="progress-stat-bento__content">
                        <div className="value">{stats.muscleMass}<span>kg</span></div>
                        <div className="label">Muscle Mass</div>
                        <div className="change positive">+1.2kg gain</div>
                    </div>
                </motion.div>

                <motion.div className="glass-card glass-card--md progress-stat-bento" whileHover={{ y: -4 }}>
                    <div className="progress-stat-bento__icon icon--green">
                        <Zap size={20} />
                    </div>
                    <div className="progress-stat-bento__content">
                        <div className="value">{stats.caloriesBurned}</div>
                        <div className="label">Calories</div>
                        <div className="sub-label">Energy spent</div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Interactive Data Exploration Section */}
            <motion.section className="glass-card glass-card--lg main-chart-section" variants={itemVariants}>
                <div className="section-header-compact">
                    <div className="tabs-pill">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="time-filter">
                        <button className="filter-btn active">30D</button>
                        <button className="filter-btn">90D</button>
                        <button className="filter-btn">1Y</button>
                    </div>
                </div>

                <div className="chart-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '320px', width: '100%' }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                {activeTab === 'weight' ? (
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                        <Tooltip 
                                            contentStyle={{ background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={3} fill="url(#colorWeight)" />
                                    </AreaChart>
                                ) : activeTab === 'bodyFat' ? (
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip 
                                            contentStyle={{ background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="bodyFat" stroke="#34C759" strokeWidth={3} fill="url(#colorFat)" />
                                    </AreaChart>
                                ) : activeTab === 'strength' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ background: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="volume" fill="#AF52DE" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <div className="consistency-heatmap">
                                        <div className="heatmap-grid">
                                            {heatmapData.map(d => (
                                                <div 
                                                    key={d.day} 
                                                    className={`heatmap-cell intensity-${d.intensity}`}
                                                    title={`Day ${d.day}: Intensity ${d.intensity}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="heatmap-labels">
                                            <span>Less</span>
                                            <div className="intensity-1" />
                                            <div className="intensity-2" />
                                            <div className="intensity-3" />
                                            <div className="intensity-4" />
                                            <span>More</span>
                                        </div>
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.section>

            {/* Secondary Grid: Strength & Goals */}
            <motion.div className="bento-grid bento-grid--3col" variants={itemVariants}>
                {/* Personal Bests */}
                <motion.div className="glass-card glass-card--md pb-card">
                    <div className="card-header">
                        <Trophy size={18} color="var(--macos-warning)" />
                        <h3>Personal Bests</h3>
                    </div>
                    <div className="pb-list">
                        {personalBests.map((pb, idx) => (
                            <div key={idx} className="pb-item">
                                <div className="pb-item__info">
                                    <span className="exercise">{pb.exercise}</span>
                                    <span className="date">{pb.date}</span>
                                </div>
                                <div className="pb-item__value">{pb.weight}</div>
                            </div>
                        ))}
                    </div>
                    <button className="macos-btn macos-btn--ghost full-width">View Lift Library</button>
                </motion.div>

                {/* Goals Progress */}
                <motion.div className="glass-card glass-card--md goals-card">
                    <div className="card-header">
                        <Target size={18} color="var(--macos-accent)" />
                        <h3>Active Goals</h3>
                    </div>
                    <div className="goals-list-compact">
                        {activeGoals.map(goal => (
                            <div key={goal.id} className="goal-item-compact">
                                <div className="goal-info">
                                    <span>{goal.title}</span>
                                    <span className="percentage">{goal.progress}%</span>
                                </div>
                                <div className="mini-progress-bar">
                                    <motion.div 
                                        className="fill" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <div className="goal-target">
                                    {goal.current}{goal.unit} / {goal.target}{goal.unit}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Trainer Feedback Preview */}
                <motion.div className="glass-card glass-card--md trainer-insight-card">
                    <div className="card-header">
                        <Heart size={18} color="#FF2D55" />
                        <h3>Trainer Feedback</h3>
                    </div>
                    <div className="insight-content">
                        <div className="insight-profile">
                            <div className="avatar-placeholder">JS</div>
                            <div>
                                <div className="name">John Smith</div>
                                <div className="time">2 days ago</div>
                            </div>
                        </div>
                        <p className="note">"{notes[0]?.note.substring(0, 80)}..."</p>
                        <button className="macos-btn macos-btn--primary full-width">Read Full Note</button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom Section: Milestones */}
            <motion.section className="glass-card glass-card--md milestones-strip" variants={itemVariants}>
                <div className="milestones-track">
                    <div className="milestone completed">
                        <div className="icon"><Medal size={16} /></div>
                        <span>Started Journey</span>
                    </div>
                    <div className="milestone completed">
                        <div className="icon"><Medal size={16} /></div>
                        <span>First 10 Workouts</span>
                    </div>
                    <div className="milestone active">
                        <div className="icon"><Medal size={16} /></div>
                        <span>30 Day Streak</span>
                        <div className="progress-dot" />
                    </div>
                    <div className="milestone upcoming">
                        <div className="icon"><Medal size={16} /></div>
                        <span>Strength Mastery</span>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default MyProgress;
