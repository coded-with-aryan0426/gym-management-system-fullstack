import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
    Scale, Activity, TrendingDown, TrendingUp, Dumbbell, User,
    Target, Trophy, Plus, ChevronRight, Flame, Award, Medal
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

type TabType = 'weight' | 'bodyFat' | 'measurements' | 'strength';

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
        { date: 'Oct', weight: 85, bodyFat: 22 },
        { date: 'Nov', weight: 83.5, bodyFat: 21 },
        { date: 'Dec', weight: 81, bodyFat: 19.5 },
        { date: 'Jan', weight: 78, bodyFat: 18 }
    ];

    // Stats
    const stats = {
        currentWeight: 78,
        startWeight: 85,
        goalWeight: 75,
        bodyFat: 18,
        startBodyFat: 22,
        muscleMass: 62.5,
        bmi: 22.4
    };

    // Active Goals
    const activeGoals = [
        { id: 1, title: 'Reach 75kg Weight', current: 78, target: 75, progress: 70 },
        { id: 2, title: 'Attend 20 Classes', current: 12, target: 20, progress: 60 }
    ];

    // Achievements
    const achievements = [
        { id: 1, iconType: 'streak', title: '7 Day Streak', date: 'Today' },
        { id: 2, iconType: 'classes', title: '10 Classes Attended', date: 'Dec 20' },
        { id: 3, iconType: 'goal', title: 'First Goal Completed', date: 'Dec 15' },
        { id: 4, iconType: 'trophy', title: 'Perfect Attendance', date: 'Nov 30' }
    ];

    const tabs: { id: TabType; label: string }[] = [
        { id: 'weight', label: 'Weight' },
        { id: 'bodyFat', label: 'Body Fat' },
        { id: 'measurements', label: 'Measurements' },
        { id: 'strength', label: 'Strength' }
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

    const weightProgress = Math.round(((stats.startWeight - stats.currentWeight) / (stats.startWeight - stats.goalWeight)) * 100);

    return (
        <motion.div
            className="macos-page progress-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="progress__header" variants={itemVariants}>
                <div>
                    <h1 className="macos-heading-xl">My Progress</h1>
                    <p className="macos-text-md">Track your fitness journey and achievements</p>
                </div>
                <button className="macos-btn macos-btn--primary">
                    <Plus size={16} /> Log Entry
                </button>
            </motion.header>

            {/* Current Stats */}
            <motion.div className="bento-grid bento-grid--4col" variants={itemVariants}>
                <motion.div className="glass-card glass-card--md progress__stat-card" whileHover={{ y: -2 }}>
                    <div className="progress__stat-icon progress__stat-icon--blue">
                        <Scale size={20} />
                    </div>
                    <div className="progress__stat-value">{stats.currentWeight}<span>kg</span></div>
                    <div className="progress__stat-label">Current Weight</div>
                    <div className="progress__stat-change progress__stat-change--positive">
                        <TrendingDown size={14} /> -{stats.startWeight - stats.currentWeight}kg
                    </div>
                </motion.div>

                <motion.div className="glass-card glass-card--md progress__stat-card" whileHover={{ y: -2 }}>
                    <div className="progress__stat-icon progress__stat-icon--green">
                        <Activity size={20} />
                    </div>
                    <div className="progress__stat-value">{stats.bodyFat}<span>%</span></div>
                    <div className="progress__stat-label">Body Fat</div>
                    <div className="progress__stat-change progress__stat-change--positive">
                        <TrendingDown size={14} /> -{stats.startBodyFat - stats.bodyFat}%
                    </div>
                </motion.div>

                <motion.div className="glass-card glass-card--md progress__stat-card" whileHover={{ y: -2 }}>
                    <div className="progress__stat-icon progress__stat-icon--purple">
                        <Dumbbell size={20} />
                    </div>
                    <div className="progress__stat-value">{stats.muscleMass}<span>kg</span></div>
                    <div className="progress__stat-label">Muscle Mass</div>
                    <div className="progress__stat-change progress__stat-change--positive">
                        <TrendingUp size={14} /> +1.2kg
                    </div>
                </motion.div>

                <motion.div className="glass-card glass-card--md progress__stat-card" whileHover={{ y: -2 }}>
                    <div className="progress__stat-icon progress__stat-icon--orange">
                        <Target size={20} />
                    </div>
                    <div className="progress__stat-value">{stats.bmi}</div>
                    <div className="progress__stat-label">BMI Score</div>
                    <span className="macos-badge macos-badge--green">Healthy</span>
                </motion.div>
            </motion.div>

            {/* Chart Section */}
            <motion.section className="glass-card glass-card--lg progress__chart-section" variants={itemVariants}>
                <div className="progress__chart-header">
                    <h2 className="macos-heading-md">Progress Chart</h2>
                    <div className="progress__chart-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`progress__chart-tab ${activeTab === tab.id ? 'progress__chart-tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="progress__chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.section>

            {/* Two Column Grid */}
            <motion.div className="bento-grid bento-grid--2col" variants={itemVariants}>
                {/* Goals */}
                <motion.div className="glass-card glass-card--lg">
                    <div className="macos-section-header" style={{ marginBottom: 'var(--space-5)' }}>
                        <h3 className="macos-heading-md">
                            <Target size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            Active Goals
                        </h3>
                    </div>
                    <div className="progress__goals-list">
                        {activeGoals.map((goal) => (
                            <div key={goal.id} className="progress__goal-item">
                                <div className="progress__goal-header">
                                    <span className="progress__goal-title">{goal.title}</span>
                                    <span className="macos-badge macos-badge--green">On Track</span>
                                </div>
                                <div className="macos-progress" style={{ marginTop: '8px' }}>
                                    <div className="macos-progress__fill macos-progress__fill--blue" style={{ width: `${goal.progress}%` }} />
                                </div>
                                <div className="progress__goal-stats">
                                    <span>Current: {goal.current}</span>
                                    <span>Target: {goal.target}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Achievements */}
                <motion.div className="glass-card glass-card--lg">
                    <div className="macos-section-header" style={{ marginBottom: 'var(--space-5)' }}>
                        <h3 className="macos-heading-md">
                            <Trophy size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            Achievements
                        </h3>
                    </div>
                    <div className="progress__achievements-grid">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className="progress__achievement-item">
                                <span className="progress__achievement-icon">{achievementIcons[achievement.iconType] || <Award size={24} />}</span>
                                <div>
                                    <div className="progress__achievement-title">{achievement.title}</div>
                                    <div className="progress__achievement-date">{achievement.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Trainer Notes */}
            <motion.section variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Trainer Notes</h2>
                    <button className="macos-section-link">View All <ChevronRight size={16} /></button>
                </div>
                <div className="glass-card glass-card--md">
                    {notes.length === 0 ? (
                        <div className="macos-empty-state">
                            <div className="macos-empty-state__icon"><User size={24} /></div>
                            <div className="macos-empty-state__title">No notes yet</div>
                            <div className="macos-empty-state__text">Your trainer hasn't added any notes</div>
                        </div>
                    ) : (
                        <div className="macos-timeline">
                            {notes.map((note) => (
                                <div key={note.id} className="macos-timeline-item">
                                    <div className="macos-timeline-item__dot macos-timeline-item__dot--blue" />
                                    <div className="macos-timeline-item__content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span className="macos-heading-sm">{note.trainer.fullName}</span>
                                            <span className="macos-text-xs">{formatDate(note.createdAt)}</span>
                                        </div>
                                        <p className="macos-text-md">{note.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.section>
        </motion.div>
    );
};

export default MyProgress;
