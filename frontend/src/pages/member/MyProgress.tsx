import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, BarChart, Bar, ReferenceLine,
    RadialBarChart, RadialBar, Cell, PieChart, Pie
} from 'recharts';
import {
    Activity, Dumbbell, Target, Trophy, Plus, Flame, Medal,
    Camera, Calendar, Zap, Heart, TrendingUp, TrendingDown,
    Clock, ChevronRight, X, Check, Edit3, Ruler, Scale as ScaleIcon,
    AlertCircle, Info, ChevronDown, ChevronUp, History, BarChart3,
    Award, Sparkles, ArrowRight, Timer, Percent
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

interface ProgressEntry {
    id: number;
    date: string;
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    chest?: number;
    waist?: number;
    arms?: number;
    legs?: number;
    hips?: number;
    shoulders?: number;
    notes?: string;
}

interface PersonalBest {
    id: number;
    exercise: string;
    weight: number;
    reps?: number;
    unit: string;
    date: string;
    previousBest?: number;
    category: 'push' | 'pull' | 'legs' | 'core' | 'cardio';
}

interface Goal {
    id: number;
    title: string;
    type: 'weight' | 'muscle' | 'bodyFat' | 'strength' | 'endurance';
    startValue: number;
    currentValue: number;
    targetValue: number;
    unit: string;
    startDate: string;
    targetDate?: string;
    weeklyTarget?: number;
}

interface WorkoutLog {
    id: number;
    date: string;
    duration: number;
    caloriesBurned: number;
    type: string;
    exercises: number;
}

type TabType = 'weight' | 'bodyFat' | 'strength' | 'consistency' | 'measurements';
type ModalType = 'logProgress' | 'logWorkout' | 'createGoal' | 'photoUpload' | 'history' | null;

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
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('30D');
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [expandedGoal, setExpandedGoal] = useState<number | null>(null);

    const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
    const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

    const [newProgress, setNewProgress] = useState({
        weight: '',
        bodyFat: '',
        muscleMass: '',
        chest: '',
        waist: '',
        arms: '',
        legs: '',
        hips: '',
        shoulders: '',
        notes: ''
    });

    const [newWorkout, setNewWorkout] = useState({
        exercise: '',
        weight: '',
        reps: '',
        unit: 'lbs',
        category: 'push' as PersonalBest['category'],
        notes: ''
    });

    const [newGoal, setNewGoal] = useState({
        title: '',
        type: 'weight' as Goal['type'],
        currentValue: '',
        targetValue: '',
        unit: 'kg',
        targetDate: '',
        weeklyTarget: ''
    });

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const mockNotes: ProgressNote[] = [
            {
                id: 1,
                note: 'Great progress on squats! Increased weight from 135lbs to 155lbs with good form. Keep focusing on depth and maintaining a straight back. Your consistency is paying off!',
                createdAt: '2025-12-22',
                trainer: { userId: 1, fullName: 'John Smith' }
            },
            {
                id: 2,
                note: 'Excellent improvement in endurance. Your cardio sessions show a 15% increase in stamina over the last month.',
                createdAt: '2025-12-15',
                trainer: { userId: 1, fullName: 'John Smith' }
            }
        ];

        const mockEntries: ProgressEntry[] = [
            { id: 1, date: '2025-11-01', weight: 85, bodyFat: 22, muscleMass: 58, chest: 102, waist: 88, arms: 35, legs: 58, hips: 98, shoulders: 115 },
            { id: 2, date: '2025-11-08', weight: 84.2, bodyFat: 21.5, muscleMass: 58.5, chest: 102.5, waist: 87, arms: 35.2, legs: 58.2, hips: 97.5, shoulders: 115.5 },
            { id: 3, date: '2025-11-15', weight: 83.5, bodyFat: 21, muscleMass: 59, chest: 103, waist: 86, arms: 35.5, legs: 58.5, hips: 97, shoulders: 116 },
            { id: 4, date: '2025-11-22', weight: 82.8, bodyFat: 20.5, muscleMass: 59.5, chest: 103.2, waist: 85, arms: 35.8, legs: 58.8, hips: 96.5, shoulders: 116.5 },
            { id: 5, date: '2025-11-29', weight: 82, bodyFat: 20, muscleMass: 60, chest: 103.5, waist: 84.5, arms: 36, legs: 59, hips: 96, shoulders: 117 },
            { id: 6, date: '2025-12-06', weight: 81, bodyFat: 19.5, muscleMass: 60.5, chest: 104, waist: 83.5, arms: 36.3, legs: 59.3, hips: 95.5, shoulders: 117.5 },
            { id: 7, date: '2025-12-13', weight: 80, bodyFat: 19, muscleMass: 61, chest: 104.5, waist: 82.5, arms: 36.6, legs: 59.6, hips: 95, shoulders: 118 },
            { id: 8, date: '2025-12-20', weight: 79, bodyFat: 18.5, muscleMass: 61.5, chest: 105, waist: 81.5, arms: 36.9, legs: 60, hips: 94.5, shoulders: 118.5 },
            { id: 9, date: '2025-12-27', weight: 78, bodyFat: 18, muscleMass: 62, chest: 105.5, waist: 81, arms: 37, legs: 60.3, hips: 94, shoulders: 119 }
        ];

        const mockPBs: PersonalBest[] = [
            { id: 1, exercise: 'Bench Press', weight: 185, reps: 5, unit: 'lbs', date: '2025-12-20', previousBest: 175, category: 'push' },
            { id: 2, exercise: 'Deadlift', weight: 315, reps: 3, unit: 'lbs', date: '2025-12-22', previousBest: 295, category: 'pull' },
            { id: 3, exercise: 'Squat', weight: 245, reps: 5, unit: 'lbs', date: '2025-12-18', previousBest: 225, category: 'legs' },
            { id: 4, exercise: 'Pull-ups', weight: 25, reps: 8, unit: 'lbs', date: '2025-12-15', previousBest: 15, category: 'pull' },
            { id: 5, exercise: 'Overhead Press', weight: 135, reps: 5, unit: 'lbs', date: '2025-12-10', previousBest: 125, category: 'push' }
        ];

        const mockGoals: Goal[] = [
            { id: 1, title: 'Weight Loss Goal', type: 'weight', startValue: 85, currentValue: 78, targetValue: 75, unit: 'kg', startDate: '2025-11-01', targetDate: '2026-02-01', weeklyTarget: 0.5 },
            { id: 2, title: 'Build Muscle Mass', type: 'muscle', startValue: 58, currentValue: 62, targetValue: 65, unit: 'kg', startDate: '2025-11-01', targetDate: '2026-03-01', weeklyTarget: 0.3 },
            { id: 3, title: 'Reduce Body Fat', type: 'bodyFat', startValue: 22, currentValue: 18, targetValue: 15, unit: '%', startDate: '2025-11-01', targetDate: '2026-04-01', weeklyTarget: 0.25 }
        ];

        const mockWorkouts: WorkoutLog[] = [
            { id: 1, date: '2025-12-27', duration: 65, caloriesBurned: 420, type: 'Strength', exercises: 8 },
            { id: 2, date: '2025-12-26', duration: 45, caloriesBurned: 380, type: 'Cardio', exercises: 4 },
            { id: 3, date: '2025-12-25', duration: 0, caloriesBurned: 0, type: 'Rest', exercises: 0 },
            { id: 4, date: '2025-12-24', duration: 55, caloriesBurned: 350, type: 'Upper Body', exercises: 7 },
            { id: 5, date: '2025-12-23', duration: 60, caloriesBurned: 400, type: 'Lower Body', exercises: 6 },
            { id: 6, date: '2025-12-22', duration: 50, caloriesBurned: 320, type: 'Full Body', exercises: 9 },
            { id: 7, date: '2025-12-21', duration: 40, caloriesBurned: 450, type: 'HIIT', exercises: 5 }
        ];

        setNotes(mockNotes);
        setProgressEntries(mockEntries);
        setPersonalBests(mockPBs);
        setGoals(mockGoals);
        setWorkoutLogs(mockWorkouts);
        setLoading(false);
    }, [user?.id]);

    const getLatestEntry = () => progressEntries[progressEntries.length - 1] || null;
    const getFirstEntry = () => progressEntries[0] || null;
    const getPreviousEntry = () => progressEntries[progressEntries.length - 2] || null;

    const calculateChange = (current: number | undefined, start: number | undefined) => {
        if (!current || !start) return { value: 0, percent: 0 };
        const value = current - start;
        const percent = ((value / start) * 100);
        return { value: Number(value.toFixed(1)), percent: Number(percent.toFixed(1)) };
    };

    const calculateWeeklyAverage = (key: keyof ProgressEntry) => {
        if (progressEntries.length < 2) return 0;
        const first = progressEntries[0][key] as number;
        const last = progressEntries[progressEntries.length - 1][key] as number;
        const weeks = progressEntries.length - 1;
        return ((last - first) / weeks).toFixed(2);
    };

    const getProjectedDate = (goal: Goal) => {
        const remaining = Math.abs(goal.targetValue - goal.currentValue);
        const weeklyRate = goal.weeklyTarget || 0.5;
        const weeksNeeded = remaining / weeklyRate;
        const projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + weeksNeeded * 7);
        return projectedDate;
    };

    const latest = getLatestEntry();
    const first = getFirstEntry();
    const previous = getPreviousEntry();

    const stats = {
        currentWeight: latest?.weight || 78,
        startWeight: first?.weight || 85,
        previousWeight: previous?.weight || 79,
        goalWeight: 75,
        bodyFat: latest?.bodyFat || 18,
        startBodyFat: first?.bodyFat || 22,
        previousBodyFat: previous?.bodyFat || 18.5,
        muscleMass: latest?.muscleMass || 62,
        startMuscleMass: first?.muscleMass || 58,
        previousMuscleMass: previous?.muscleMass || 61.5,
        streak: 12,
        longestStreak: 18,
        caloriesBurned: workoutLogs.reduce((sum, w) => sum + w.caloriesBurned, 0),
        totalWorkouts: 48,
        thisMonthWorkouts: 18,
        avgWorkoutDuration: Math.round(workoutLogs.filter(w => w.duration > 0).reduce((sum, w) => sum + w.duration, 0) / workoutLogs.filter(w => w.duration > 0).length),
        workoutsThisWeek: workoutLogs.filter(w => w.duration > 0).length
    };

    const weightChange = calculateChange(stats.currentWeight, stats.startWeight);
    const muscleChange = calculateChange(stats.muscleMass, stats.startMuscleMass);
    const bodyFatChange = calculateChange(stats.bodyFat, stats.startBodyFat);
    const weeklyWeightChange = calculateChange(stats.currentWeight, stats.previousWeight);

    const bmiValue = (stats.currentWeight / (1.75 * 1.75)).toFixed(1);
    const bmiCategory = parseFloat(bmiValue) < 18.5 ? 'Underweight' : parseFloat(bmiValue) < 25 ? 'Normal' : parseFloat(bmiValue) < 30 ? 'Overweight' : 'Obese';

    const heatmapData = Array.from({ length: 35 }, (_, i) => {
        const date = new Date(Date.now() - (34 - i) * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return {
            day: i + 1,
            intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            isWeekend
        };
    });

    const weeklyActivity = [
        { day: 'Mon', value: 65, active: true, type: 'Strength' },
        { day: 'Tue', value: 45, active: true, type: 'Cardio' },
        { day: 'Wed', value: 0, active: false, type: 'Rest' },
        { day: 'Thu', value: 55, active: true, type: 'Upper' },
        { day: 'Fri', value: 60, active: true, type: 'Lower' },
        { day: 'Sat', value: 50, active: true, type: 'Full Body' },
        { day: 'Sun', value: 0, active: false, type: 'Rest' }
    ];

    const consistencyRate = Math.round((workoutLogs.filter(w => w.duration > 0).length / 7) * 100);

    const WeightIcon = ({ size = 14 }: { size?: number }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"/>
            <path d="M6.5 8a6.5 6.5 0 1 0 11 0Z"/>
        </svg>
    );

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'weight', label: 'Weight', icon: <WeightIcon size={14} /> },
        { id: 'bodyFat', label: 'Body Composition', icon: <Activity size={14} /> },
        { id: 'measurements', label: 'Measurements', icon: <Ruler size={14} /> },
        { id: 'strength', label: 'Strength', icon: <Dumbbell size={14} /> },
        { id: 'consistency', label: 'Activity', icon: <Calendar size={14} /> }
    ];

    const chartData = progressEntries.map((entry, index) => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: entry.date,
        weight: entry.weight,
        bodyFat: entry.bodyFat,
        muscle: entry.muscleMass,
        chest: entry.chest,
        waist: entry.waist,
        arms: entry.arms,
        legs: entry.legs,
        volume: 1200 + (index * 180),
        leanMass: entry.weight && entry.bodyFat ? (entry.weight * (1 - entry.bodyFat / 100)).toFixed(1) : 0
    }));

    const bodyCompositionData = [
        { name: 'Muscle', value: stats.muscleMass, color: '#AF52DE' },
        { name: 'Fat', value: stats.currentWeight * (stats.bodyFat / 100), color: '#FF9F0A' },
        { name: 'Other', value: stats.currentWeight - stats.muscleMass - (stats.currentWeight * stats.bodyFat / 100), color: '#007AFF' }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const dataKey = payload[0].dataKey;
        const value = payload[0].value;
        const prevIndex = chartData.findIndex(d => d.date === label) - 1;
        const prevValue = prevIndex >= 0 ? chartData[prevIndex][dataKey as keyof typeof chartData[0]] : null;
        const change = prevValue ? (value - (prevValue as number)).toFixed(2) : null;

        const getUnit = () => {
            if (dataKey === 'bodyFat') return '%';
            if (dataKey === 'volume') return ' lbs';
            return ' kg';
        };

        return (
            <div className="custom-tooltip">
                <div className="tooltip-date">{data.fullDate}</div>
                <div className="tooltip-value">
                    <span className="tooltip-metric">
                        {dataKey === 'weight' ? 'Weight' : 
                         dataKey === 'bodyFat' ? 'Body Fat' : 
                         dataKey === 'muscle' ? 'Muscle Mass' :
                         dataKey === 'leanMass' ? 'Lean Mass' : 'Volume'}
                    </span>
                    <span className="tooltip-number">{value}{getUnit()}</span>
                </div>
                {change && Number(change) !== 0 && (
                    <div className={`tooltip-change ${
                        (dataKey === 'weight' || dataKey === 'bodyFat') 
                            ? (Number(change) < 0 ? 'positive' : 'negative')
                            : (Number(change) > 0 ? 'positive' : 'negative')
                    }`}>
                        {Number(change) > 0 ? '+' : ''}{change}{getUnit()} from previous
                    </div>
                )}
            </div>
        );
    };

    const handleLogProgress = () => {
        if (!newProgress.weight && !newProgress.bodyFat && !newProgress.muscleMass) {
            alert('Please enter at least one measurement');
            return;
        }

        const newEntry: ProgressEntry = {
            id: progressEntries.length + 1,
            date: new Date().toISOString().split('T')[0],
            weight: newProgress.weight ? parseFloat(newProgress.weight) : latest?.weight,
            bodyFat: newProgress.bodyFat ? parseFloat(newProgress.bodyFat) : latest?.bodyFat,
            muscleMass: newProgress.muscleMass ? parseFloat(newProgress.muscleMass) : latest?.muscleMass,
            chest: newProgress.chest ? parseFloat(newProgress.chest) : latest?.chest,
            waist: newProgress.waist ? parseFloat(newProgress.waist) : latest?.waist,
            arms: newProgress.arms ? parseFloat(newProgress.arms) : latest?.arms,
            legs: newProgress.legs ? parseFloat(newProgress.legs) : latest?.legs,
            hips: newProgress.hips ? parseFloat(newProgress.hips) : latest?.hips,
            shoulders: newProgress.shoulders ? parseFloat(newProgress.shoulders) : latest?.shoulders,
            notes: newProgress.notes || undefined
        };
        setProgressEntries([...progressEntries, newEntry]);
        setNewProgress({ weight: '', bodyFat: '', muscleMass: '', chest: '', waist: '', arms: '', legs: '', hips: '', shoulders: '', notes: '' });
        setActiveModal(null);
    };

    const handleLogWorkout = () => {
        if (!newWorkout.exercise || !newWorkout.weight) return;

        const existingPB = personalBests.find(pb => pb.exercise.toLowerCase() === newWorkout.exercise.toLowerCase());
        const newWeight = parseFloat(newWorkout.weight);

        if (!existingPB || newWeight > existingPB.weight) {
            const newPB: PersonalBest = {
                id: personalBests.length + 1,
                exercise: newWorkout.exercise,
                weight: newWeight,
                reps: newWorkout.reps ? parseInt(newWorkout.reps) : undefined,
                unit: newWorkout.unit,
                date: new Date().toISOString().split('T')[0],
                previousBest: existingPB?.weight,
                category: newWorkout.category
            };

            if (existingPB) {
                setPersonalBests(personalBests.map(pb =>
                    pb.id === existingPB.id ? { ...newPB, id: existingPB.id } : pb
                ));
            } else {
                setPersonalBests([...personalBests, newPB]);
            }
        }

        setNewWorkout({ exercise: '', weight: '', reps: '', unit: 'lbs', category: 'push', notes: '' });
        setActiveModal(null);
    };

    const handleCreateGoal = () => {
        if (!newGoal.title || !newGoal.currentValue || !newGoal.targetValue) return;

        const goal: Goal = {
            id: goals.length + 1,
            title: newGoal.title,
            type: newGoal.type,
            startValue: parseFloat(newGoal.currentValue),
            currentValue: parseFloat(newGoal.currentValue),
            targetValue: parseFloat(newGoal.targetValue),
            unit: newGoal.unit,
            startDate: new Date().toISOString().split('T')[0],
            targetDate: newGoal.targetDate || undefined,
            weeklyTarget: newGoal.weeklyTarget ? parseFloat(newGoal.weeklyTarget) : undefined
        };

        setGoals([...goals, goal]);
        setNewGoal({ title: '', type: 'weight', currentValue: '', targetValue: '', unit: 'kg', targetDate: '', weeklyTarget: '' });
        setActiveModal(null);
    };

    const measurementComparison = [
        { label: 'Chest', current: latest?.chest || 105.5, start: first?.chest || 102, unit: 'cm', ideal: '104-110', good: true },
        { label: 'Waist', current: latest?.waist || 81, start: first?.waist || 88, unit: 'cm', ideal: '< 94', good: true },
        { label: 'Arms', current: latest?.arms || 37, start: first?.arms || 35, unit: 'cm', ideal: '36-40', good: true },
        { label: 'Legs', current: latest?.legs || 60.3, start: first?.legs || 58, unit: 'cm', ideal: '58-65', good: true },
        { label: 'Hips', current: latest?.hips || 94, start: first?.hips || 98, unit: 'cm', ideal: '< 102', good: true },
        { label: 'Shoulders', current: latest?.shoulders || 119, start: first?.shoulders || 115, unit: 'cm', ideal: '> 115', good: true }
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
            className="macos-page progress-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Quick Actions Bar */}
            <motion.div className="quick-actions-bar" variants={itemVariants}>
                <button className="quick-action-btn primary" onClick={() => setActiveModal('logProgress')}>
                    <Plus size={16} />
                    Log Progress
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('logWorkout')}>
                    <Dumbbell size={16} />
                    Log PR
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('createGoal')}>
                    <Target size={16} />
                    New Goal
                </button>
                <button className="quick-action-btn" onClick={() => setActiveModal('photoUpload')}>
                    <Camera size={16} />
                    Progress Photo
                </button>
                <button className="quick-action-btn history-btn" onClick={() => setActiveModal('history')}>
                    <History size={16} />
                    History
                </button>
            </motion.div>

            {/* Summary Banner */}
            <motion.div className="summary-banner" variants={itemVariants}>
                <div className="summary-banner__content">
                    <div className="summary-banner__main">
                        <Sparkles size={20} />
                        <span>
                            <strong>Great progress!</strong> You've lost {Math.abs(weightChange.value)}kg and gained {muscleChange.value}kg muscle in 8 weeks
                        </span>
                    </div>
                    <div className="summary-banner__stats">
                        <div className="mini-stat">
                            <span className="mini-stat__value">{stats.streak}</span>
                            <span className="mini-stat__label">Day Streak</span>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-stat__value">{stats.workoutsThisWeek}/7</span>
                            <span className="mini-stat__label">This Week</span>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-stat__value">{consistencyRate}%</span>
                            <span className="mini-stat__label">Consistency</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Top Stats Row */}
            <motion.div className="stats-row" variants={itemVariants}>
                <div className="stat-card stat-card--weight clickable" onClick={() => setActiveModal('logProgress')}>
                    <div className="stat-card__icon">
                        <WeightIcon size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.currentWeight}<span>kg</span></div>
                        <div className="stat-card__label">Current Weight</div>
                        <div className="stat-card__detail">
                            Goal: {stats.goalWeight}kg ({Math.abs(stats.currentWeight - stats.goalWeight).toFixed(1)}kg to go)
                        </div>
                    </div>
                    <div className="stat-card__right">
                        <div className={`stat-card__trend ${weightChange.value <= 0 ? 'positive' : 'negative'}`}>
                            {weightChange.value <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                            {weightChange.value > 0 ? '+' : ''}{weightChange.value}kg
                        </div>
                        <div className="stat-card__sub">
                            {weeklyWeightChange.value > 0 ? '+' : ''}{weeklyWeightChange.value}kg this week
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card--bodyfat clickable" onClick={() => setActiveModal('logProgress')}>
                    <div className="stat-card__icon">
                        <Percent size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.bodyFat}<span>%</span></div>
                        <div className="stat-card__label">Body Fat</div>
                        <div className="stat-card__detail">
                            Started at {stats.startBodyFat}% ({Math.abs(bodyFatChange.value)}% lost)
                        </div>
                    </div>
                    <div className="stat-card__right">
                        <div className={`stat-card__trend ${bodyFatChange.value <= 0 ? 'positive' : 'negative'}`}>
                            {bodyFatChange.value <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                            {bodyFatChange.value}%
                        </div>
                        <div className="stat-card__category">
                            {stats.bodyFat < 15 ? 'Athletic' : stats.bodyFat < 20 ? 'Fit' : stats.bodyFat < 25 ? 'Average' : 'Above Average'}
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card--muscle clickable" onClick={() => setActiveModal('logProgress')}>
                    <div className="stat-card__icon">
                        <Dumbbell size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{stats.muscleMass}<span>kg</span></div>
                        <div className="stat-card__label">Muscle Mass</div>
                        <div className="stat-card__detail">
                            {((stats.muscleMass / stats.currentWeight) * 100).toFixed(0)}% of total body weight
                        </div>
                    </div>
                    <div className="stat-card__right">
                        <div className={`stat-card__trend ${muscleChange.value >= 0 ? 'positive' : 'negative'}`}>
                            {muscleChange.value >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            +{muscleChange.value}kg
                        </div>
                        <div className="stat-card__sub">
                            {calculateWeeklyAverage('muscleMass')}kg/week avg
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card--bmi">
                    <div className="stat-card__icon">
                        <BarChart3 size={20} />
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{bmiValue}</div>
                        <div className="stat-card__label">BMI</div>
                        <div className="stat-card__detail">Category: {bmiCategory}</div>
                    </div>
                    <div className="stat-card__right">
                        <div className={`bmi-indicator ${bmiCategory.toLowerCase()}`}>
                            {bmiCategory}
                        </div>
                    </div>
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
                        {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((range) => (
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

                {/* Detailed Chart Stats Summary */}
                <div className="chart-stats-summary">
                    {activeTab === 'weight' && (
                        <>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Starting Weight</span>
                                <span className="chart-stat-value">{stats.startWeight} kg</span>
                                <span className="chart-stat-date">Nov 1, 2025</span>
                            </div>
                            <div className="chart-stat highlight-stat">
                                <span className="chart-stat-label">Current Weight</span>
                                <span className="chart-stat-value highlight">{stats.currentWeight} kg</span>
                                <span className="chart-stat-date">Today</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Goal Weight</span>
                                <span className="chart-stat-value goal-value">{stats.goalWeight} kg</span>
                                <span className="chart-stat-date">{Math.abs(stats.currentWeight - stats.goalWeight).toFixed(1)}kg remaining</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Total Lost</span>
                                <span className={`chart-stat-value ${weightChange.value <= 0 ? 'positive' : 'negative'}`}>
                                    {weightChange.value > 0 ? '+' : ''}{weightChange.value} kg
                                </span>
                                <span className="chart-stat-date">{Math.abs(weightChange.percent)}% change</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Avg Weekly Loss</span>
                                <span className="chart-stat-value">{Math.abs(parseFloat(calculateWeeklyAverage('weight')))} kg</span>
                                <span className="chart-stat-date">per week</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Est. Goal Date</span>
                                <span className="chart-stat-value">{getProjectedDate(goals[0] || { targetValue: 75, currentValue: 78, weeklyTarget: 0.5 } as Goal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span className="chart-stat-date">at current pace</span>
                            </div>
                        </>
                    )}
                    {activeTab === 'bodyFat' && (
                        <>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Starting Body Fat</span>
                                <span className="chart-stat-value">{stats.startBodyFat}%</span>
                                <span className="chart-stat-date">{(stats.startWeight * stats.startBodyFat / 100).toFixed(1)}kg fat mass</span>
                            </div>
                            <div className="chart-stat highlight-stat">
                                <span className="chart-stat-label">Current Body Fat</span>
                                <span className="chart-stat-value highlight">{stats.bodyFat}%</span>
                                <span className="chart-stat-date">{(stats.currentWeight * stats.bodyFat / 100).toFixed(1)}kg fat mass</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Lean Body Mass</span>
                                <span className="chart-stat-value">{(stats.currentWeight * (1 - stats.bodyFat / 100)).toFixed(1)} kg</span>
                                <span className="chart-stat-date">{(100 - stats.bodyFat)}% of body</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Fat Lost</span>
                                <span className={`chart-stat-value positive`}>
                                    {Math.abs(bodyFatChange.value)}%
                                </span>
                                <span className="chart-stat-date">{((stats.startWeight * stats.startBodyFat / 100) - (stats.currentWeight * stats.bodyFat / 100)).toFixed(1)}kg actual</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Category</span>
                                <span className="chart-stat-value">
                                    {stats.bodyFat < 10 ? 'Essential' : stats.bodyFat < 15 ? 'Athletic' : stats.bodyFat < 20 ? 'Fitness' : stats.bodyFat < 25 ? 'Average' : 'Above Avg'}
                                </span>
                                <span className="chart-stat-date">Male standard</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Muscle-to-Fat Ratio</span>
                                <span className="chart-stat-value">{(stats.muscleMass / (stats.currentWeight * stats.bodyFat / 100)).toFixed(1)}:1</span>
                                <span className="chart-stat-date">muscle per fat</span>
                            </div>
                        </>
                    )}
                    {activeTab === 'measurements' && (
                        <>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Waist Change</span>
                                <span className="chart-stat-value positive">-{Math.abs((latest?.waist || 81) - (first?.waist || 88))} cm</span>
                                <span className="chart-stat-date">{first?.waist}cm → {latest?.waist}cm</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Chest Growth</span>
                                <span className="chart-stat-value positive">+{((latest?.chest || 105.5) - (first?.chest || 102)).toFixed(1)} cm</span>
                                <span className="chart-stat-date">{first?.chest}cm → {latest?.chest}cm</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Arm Growth</span>
                                <span className="chart-stat-value positive">+{((latest?.arms || 37) - (first?.arms || 35)).toFixed(1)} cm</span>
                                <span className="chart-stat-date">{first?.arms}cm → {latest?.arms}cm</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Waist-to-Hip Ratio</span>
                                <span className="chart-stat-value">{((latest?.waist || 81) / (latest?.hips || 94)).toFixed(2)}</span>
                                <span className="chart-stat-date">{((latest?.waist || 81) / (latest?.hips || 94)) < 0.9 ? 'Healthy' : 'At Risk'}</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Shoulder-to-Waist</span>
                                <span className="chart-stat-value">{((latest?.shoulders || 119) / (latest?.waist || 81)).toFixed(2)}</span>
                                <span className="chart-stat-date">{((latest?.shoulders || 119) / (latest?.waist || 81)) > 1.4 ? 'V-Taper' : 'Improving'}</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Entries Logged</span>
                                <span className="chart-stat-value">{progressEntries.length}</span>
                                <span className="chart-stat-date">measurements</span>
                            </div>
                        </>
                    )}
                    {activeTab === 'strength' && (
                        <>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Total PRs</span>
                                <span className="chart-stat-value highlight">{personalBests.length}</span>
                                <span className="chart-stat-date">personal records</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Best Bench</span>
                                <span className="chart-stat-value">{personalBests.find(p => p.exercise === 'Bench Press')?.weight || 0} lbs</span>
                                <span className="chart-stat-date">{personalBests.find(p => p.exercise === 'Bench Press')?.reps || 0} reps</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Best Squat</span>
                                <span className="chart-stat-value">{personalBests.find(p => p.exercise === 'Squat')?.weight || 0} lbs</span>
                                <span className="chart-stat-date">{personalBests.find(p => p.exercise === 'Squat')?.reps || 0} reps</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Best Deadlift</span>
                                <span className="chart-stat-value">{personalBests.find(p => p.exercise === 'Deadlift')?.weight || 0} lbs</span>
                                <span className="chart-stat-date">{personalBests.find(p => p.exercise === 'Deadlift')?.reps || 0} reps</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Big 3 Total</span>
                                <span className="chart-stat-value">
                                    {(personalBests.find(p => p.exercise === 'Bench Press')?.weight || 0) +
                                     (personalBests.find(p => p.exercise === 'Squat')?.weight || 0) +
                                     (personalBests.find(p => p.exercise === 'Deadlift')?.weight || 0)} lbs
                                </span>
                                <span className="chart-stat-date">combined</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Avg Session</span>
                                <span className="chart-stat-value">{stats.avgWorkoutDuration} min</span>
                                <span className="chart-stat-date">duration</span>
                            </div>
                        </>
                    )}
                    {activeTab === 'consistency' && (
                        <>
                            <div className="chart-stat highlight-stat">
                                <span className="chart-stat-label">Current Streak</span>
                                <span className="chart-stat-value highlight">{stats.streak} days</span>
                                <span className="chart-stat-date">Keep it up!</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Longest Streak</span>
                                <span className="chart-stat-value">{stats.longestStreak} days</span>
                                <span className="chart-stat-date">personal best</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">This Month</span>
                                <span className="chart-stat-value">{stats.thisMonthWorkouts}</span>
                                <span className="chart-stat-date">workouts</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Total Workouts</span>
                                <span className="chart-stat-value">{stats.totalWorkouts}</span>
                                <span className="chart-stat-date">all time</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Consistency Rate</span>
                                <span className="chart-stat-value">{consistencyRate}%</span>
                                <span className="chart-stat-date">this week</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Calories Burned</span>
                                <span className="chart-stat-value">{(stats.caloriesBurned / 1000).toFixed(1)}k</span>
                                <span className="chart-stat-date">this week</span>
                            </div>
                        </>
                    )}
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
                                <div className="activity-container">
                                    <div className="weekly-bars">
                                        <h4>This Week's Activity</h4>
                                        <div className="week-bar-grid">
                                            {weeklyActivity.map((day, i) => (
                                                <div key={day.day} className="week-bar-item">
                                                    <div className="week-bar-wrapper">
                                                        <motion.div
                                                            className={`week-bar ${day.active ? 'active' : 'rest'}`}
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${day.active ? Math.max(day.value, 20) : 10}%` }}
                                                            transition={{ delay: i * 0.1 }}
                                                        />
                                                    </div>
                                                    <span className="week-bar-day">{day.day}</span>
                                                    <span className="week-bar-type">{day.type}</span>
                                                    {day.active && <span className="week-bar-mins">{day.value}m</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="heatmap-section">
                                        <h4>Last 5 Weeks</h4>
                                        <div className="heatmap-grid">
                                            {heatmapData.map((d, i) => (
                                                <motion.div
                                                    key={d.day}
                                                    className={`heatmap-cell intensity-${d.intensity}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: i * 0.015 }}
                                                    title={`${d.date}: ${d.intensity === 0 ? 'Rest day' : `Intensity ${d.intensity}/4`}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="heatmap-legend">
                                            <span>Rest</span>
                                            <div className="legend-cells">
                                                {[0, 1, 2, 3, 4].map(i => (
                                                    <div key={i} className={`legend-cell intensity-${i}`} />
                                                ))}
                                            </div>
                                            <span>Intense</span>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'measurements' ? (
                                <div className="measurements-chart-container">
                                    <div className="measurements-visual">
                                        {measurementComparison.map((m, i) => {
                                            const change = m.current - m.start;
                                            const isGood = m.label === 'Waist' || m.label === 'Hips' ? change < 0 : change > 0;
                                            return (
                                                <motion.div
                                                    key={m.label}
                                                    className="measurement-row"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                >
                                                    <div className="measurement-row__label">{m.label}</div>
                                                    <div className="measurement-row__bar-container">
                                                        <div className="measurement-row__bar-bg">
                                                            <motion.div
                                                                className="measurement-row__bar-start"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(m.start / 130) * 100}%` }}
                                                                transition={{ delay: i * 0.1 + 0.2 }}
                                                            />
                                                            <motion.div
                                                                className={`measurement-row__bar-current ${isGood ? 'good' : 'bad'}`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(m.current / 130) * 100}%` }}
                                                                transition={{ delay: i * 0.1 + 0.4 }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="measurement-row__values">
                                                        <span className="measurement-row__current">{m.current}{m.unit}</span>
                                                        <span className={`measurement-row__change ${isGood ? 'positive' : 'negative'}`}>
                                                            {change > 0 ? '+' : ''}{change.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="measurement-row__ideal">
                                                        <span>Ideal: {m.ideal}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : activeTab === 'bodyFat' ? (
                                <div className="body-composition-chart">
                                    <div className="composition-main">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#34C759" stopOpacity={0.3} />
                                                        <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="muscleGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#AF52DE" stopOpacity={0.3} />
                                                        <stop offset="100%" stopColor="#AF52DE" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="bodyFat" name="Body Fat %" stroke="#34C759" strokeWidth={2.5} fill="url(#fatGradient)" dot={{ fill: '#34C759', strokeWidth: 0, r: 4 }} />
                                                <Area type="monotone" dataKey="muscle" name="Muscle Mass" stroke="#AF52DE" strokeWidth={2.5} fill="url(#muscleGradient)" dot={{ fill: '#AF52DE', strokeWidth: 0, r: 4 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="composition-pie">
                                        <h5>Current Composition</h5>
                                        <div className="pie-legend">
                                            {bodyCompositionData.map((item) => (
                                                <div key={item.name} className="pie-legend-item">
                                                    <span className="pie-dot" style={{ background: item.color }}></span>
                                                    <span>{item.name}: {item.value.toFixed(1)}kg</span>
                                                </div>
                                            ))}
                                        </div>
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
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(value) => `${value}kg`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <ReferenceLine y={stats.goalWeight} stroke="#30D158" strokeDasharray="5 5" label={{ value: `Goal: ${stats.goalWeight}kg`, position: 'right', fill: '#30D158', fontSize: 10 }} />
                                            <ReferenceLine y={stats.startWeight} stroke="#FF9F0A" strokeDasharray="3 3" label={{ value: `Start: ${stats.startWeight}kg`, position: 'right', fill: '#FF9F0A', fontSize: 10 }} />
                                            <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={2.5} fill="url(#weightGradient)" dot={{ fill: '#007AFF', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#007AFF' }} />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={chartData} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value} lbs`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="volume" fill="#AF52DE" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.section>

            {/* Goals Section - Enhanced */}
            <motion.section className="goals-section-enhanced" variants={itemVariants}>
                <div className="section-header">
                    <div className="section-title">
                        <Target size={18} />
                        <h3>Active Goals</h3>
                        <span className="goal-count">{goals.length} goals</span>
                    </div>
                    <button className="section-action" onClick={() => setActiveModal('createGoal')}>
                        <Plus size={14} />
                        New Goal
                    </button>
                </div>
                <div className="goals-grid">
                    {goals.map(goal => {
                        const totalChange = Math.abs(goal.targetValue - goal.startValue);
                        const currentChange = Math.abs(goal.currentValue - goal.startValue);
                        const progress = Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
                        const remaining = Math.abs(goal.targetValue - goal.currentValue);
                        const projectedDate = getProjectedDate(goal);
                        const isOnTrack = goal.targetDate ? projectedDate <= new Date(goal.targetDate) : true;
                        const isExpanded = expandedGoal === goal.id;

                        return (
                            <motion.div 
                                key={goal.id} 
                                className={`goal-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                                layout
                            >
                                <div className="goal-card__header">
                                    <div className="goal-card__icon" style={{ 
                                        background: goal.type === 'weight' ? 'rgba(0, 122, 255, 0.15)' : 
                                                   goal.type === 'muscle' ? 'rgba(175, 82, 222, 0.15)' : 
                                                   'rgba(48, 209, 88, 0.15)',
                                        color: goal.type === 'weight' ? '#007AFF' : 
                                               goal.type === 'muscle' ? '#AF52DE' : '#30D158'
                                    }}>
                                        {goal.type === 'weight' ? <WeightIcon size={16} /> : 
                                         goal.type === 'muscle' ? <Dumbbell size={16} /> : 
                                         <Activity size={16} />}
                                    </div>
                                    <div className="goal-card__info">
                                        <span className="goal-card__title">{goal.title}</span>
                                        <span className="goal-card__type">{goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal</span>
                                    </div>
                                    <div className="goal-card__percent">{Math.round(progress)}%</div>
                                </div>

                                <div className="goal-card__progress">
                                    <div className="goal-progress-bar">
                                        <motion.div
                                            className="goal-progress-bar__fill"
                                            style={{ 
                                                background: goal.type === 'weight' ? '#007AFF' : 
                                                           goal.type === 'muscle' ? '#AF52DE' : '#30D158'
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                        />
                                        <div className="goal-progress-bar__markers">
                                            <span style={{ left: '0%' }}>{goal.startValue}</span>
                                            <span style={{ left: `${progress}%` }} className="current-marker">{goal.currentValue}</span>
                                            <span style={{ left: '100%' }}>{goal.targetValue}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="goal-card__stats">
                                    <div className="goal-stat">
                                        <span className="goal-stat__label">Remaining</span>
                                        <span className="goal-stat__value">{remaining.toFixed(1)} {goal.unit}</span>
                                    </div>
                                    <div className="goal-stat">
                                        <span className="goal-stat__label">Weekly Target</span>
                                        <span className="goal-stat__value">{goal.weeklyTarget || 0.5} {goal.unit}/wk</span>
                                    </div>
                                    <div className="goal-stat">
                                        <span className="goal-stat__label">Est. Completion</span>
                                        <span className={`goal-stat__value ${isOnTrack ? 'on-track' : 'behind'}`}>
                                            {projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {goal.targetDate && (
                                    <div className={`goal-card__status ${isOnTrack ? 'on-track' : 'behind'}`}>
                                        {isOnTrack ? (
                                            <>
                                                <Check size={12} />
                                                <span>On track to meet deadline</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={12} />
                                                <span>Behind schedule - increase effort</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="goal-card__expand">
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* Three Column Grid */}
            <motion.div className="three-col-grid" variants={itemVariants}>
                {/* Personal Bests */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <Trophy size={18} className="icon-gold" />
                        <h3>Personal Records</h3>
                        <button className="panel-add-btn" onClick={() => setActiveModal('logWorkout')}>
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="pb-list">
                        {personalBests.slice(0, 4).map((pb) => (
                            <div key={pb.id} className="pb-item">
                                <div className="pb-item__left">
                                    <span className="pb-category-badge" data-category={pb.category}>
                                        {pb.category.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="pb-item__info">
                                        <span className="pb-exercise">{pb.exercise}</span>
                                        <span className="pb-date">
                                            {new Date(pb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {pb.reps && ` · ${pb.reps} reps`}
                                        </span>
                                    </div>
                                </div>
                                <div className="pb-item__right">
                                    <span className="pb-weight">{pb.weight} {pb.unit}</span>
                                    {pb.previousBest && (
                                        <span className="pb-improvement">
                                            <TrendingUp size={10} />
                                            +{pb.weight - pb.previousBest}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="panel-btn">
                        View All PRs ({personalBests.length})
                        <ChevronRight size={14} />
                    </button>
                </div>

                {/* Weekly Summary */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <Calendar size={18} className="icon-blue" />
                        <h3>This Week</h3>
                    </div>
                    <div className="weekly-summary">
                        <div className="weekly-summary__ring">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r="45" fill="none" 
                                    stroke="#007AFF" strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${consistencyRate * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="weekly-summary__ring-value">
                                <span className="ring-percent">{consistencyRate}%</span>
                                <span className="ring-label">Complete</span>
                            </div>
                        </div>
                        <div className="weekly-summary__stats">
                            <div className="weekly-stat">
                                <Timer size={14} />
                                <span>{workoutLogs.filter(w => w.duration > 0).reduce((s, w) => s + w.duration, 0)} min</span>
                                <span className="weekly-stat__label">Total Time</span>
                            </div>
                            <div className="weekly-stat">
                                <Flame size={14} />
                                <span>{stats.caloriesBurned}</span>
                                <span className="weekly-stat__label">Calories</span>
                            </div>
                            <div className="weekly-stat">
                                <Dumbbell size={14} />
                                <span>{workoutLogs.filter(w => w.exercises > 0).reduce((s, w) => s + w.exercises, 0)}</span>
                                <span className="weekly-stat__label">Exercises</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trainer Feedback */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <Heart size={18} className="icon-pink" />
                        <h3>Trainer Notes</h3>
                        <span className="notes-count">{notes.length}</span>
                    </div>
                    <div className="trainer-feedback">
                        {notes.slice(0, 1).map(note => (
                            <div key={note.id} className="feedback-item">
                                <div className="trainer-profile">
                                    <div className="trainer-avatar">
                                        {note.trainer.fullName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="trainer-info">
                                        <span className="trainer-name">{note.trainer.fullName}</span>
                                        <span className="trainer-time">
                                            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <p className="feedback-text">"{note.note.substring(0, 150)}..."</p>
                            </div>
                        ))}
                    </div>
                    <button className="panel-btn panel-btn--primary">
                        Read All Notes
                        <ChevronRight size={14} />
                    </button>
                </div>
            </motion.div>

            {/* Milestones Timeline */}
            <motion.section className="milestones-section" variants={itemVariants}>
                <div className="section-header">
                    <div className="section-title">
                        <Award size={18} />
                        <h3>Achievement Timeline</h3>
                    </div>
                </div>
                <div className="milestones-track">
                    <div className="milestone-line" />
                    <div className="milestone completed">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>Started Journey</span>
                        <span className="milestone-date">Nov 1</span>
                    </div>
                    <div className="milestone completed">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>First 5kg Lost</span>
                        <span className="milestone-date">Nov 22</span>
                    </div>
                    <div className="milestone completed">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>10 Workouts</span>
                        <span className="milestone-date">Nov 28</span>
                    </div>
                    <div className="milestone active">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>Under 80kg</span>
                        <div className="milestone__pulse" />
                    </div>
                    <div className="milestone upcoming">
                        <div className="milestone__icon"><Medal size={16} /></div>
                        <span>Goal Weight</span>
                        <span className="milestone-date">75kg</span>
                    </div>
                </div>
            </motion.section>

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'logProgress' && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            className="modal-content modal-large"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Log Today's Progress</h2>
                                <button className="modal-close" onClick={() => setActiveModal(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-tip">
                                    <Info size={14} />
                                    <span>Tip: Log your progress at the same time each day for accurate tracking. Morning measurements are most consistent.</span>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Body Metrics</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`Last: ${stats.currentWeight}kg`}
                                                value={newProgress.weight}
                                                onChange={e => setNewProgress({ ...newProgress, weight: e.target.value })}
                                            />
                                            <span className="form-hint">Step on scale first thing in morning</span>
                                        </div>
                                        <div className="form-group">
                                            <label>Body Fat (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`Last: ${stats.bodyFat}%`}
                                                value={newProgress.bodyFat}
                                                onChange={e => setNewProgress({ ...newProgress, bodyFat: e.target.value })}
                                            />
                                            <span className="form-hint">Use smart scale or calipers</span>
                                        </div>
                                        <div className="form-group">
                                            <label>Muscle Mass (kg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`Last: ${stats.muscleMass}kg`}
                                                value={newProgress.muscleMass}
                                                onChange={e => setNewProgress({ ...newProgress, muscleMass: e.target.value })}
                                            />
                                            <span className="form-hint">From smart scale reading</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Body Measurements (cm)</h4>
                                    <p className="form-section-desc">Measure at the widest/largest point for each area</p>
                                    <div className="form-grid six-col">
                                        <div className="form-group">
                                            <label>Chest</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`${latest?.chest || ''}`}
                                                value={newProgress.chest}
                                                onChange={e => setNewProgress({ ...newProgress, chest: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Waist</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`${latest?.waist || ''}`}
                                                value={newProgress.waist}
                                                onChange={e => setNewProgress({ ...newProgress, waist: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hips</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`${latest?.hips || ''}`}
                                                value={newProgress.hips}
                                                onChange={e => setNewProgress({ ...newProgress, hips: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Arms</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`${latest?.arms || ''}`}
                                                value={newProgress.arms}
                                                onChange={e => setNewProgress({ ...newProgress, arms: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Legs</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`${latest?.legs || ''}`}
                                                value={newProgress.legs}
                                                onChange={e => setNewProgress({ ...newProgress, legs: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Shoulders</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder={`${latest?.shoulders || ''}`}
                                                value={newProgress.shoulders}
                                                onChange={e => setNewProgress({ ...newProgress, shoulders: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Notes (Optional)</h4>
                                    <textarea
                                        placeholder="How are you feeling? Any observations about your progress?"
                                        value={newProgress.notes}
                                        onChange={e => setNewProgress({ ...newProgress, notes: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button className="btn-primary" onClick={handleLogProgress}>
                                    <Check size={16} />
                                    Save Progress
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {activeModal === 'logWorkout' && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Log Personal Record</h2>
                                <button className="modal-close" onClick={() => setActiveModal(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Exercise Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Bench Press, Squat, Deadlift"
                                        value={newWorkout.exercise}
                                        onChange={e => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newWorkout.category}
                                        onChange={e => setNewWorkout({ ...newWorkout, category: e.target.value as PersonalBest['category'] })}
                                    >
                                        <option value="push">Push (Chest, Shoulders, Triceps)</option>
                                        <option value="pull">Pull (Back, Biceps)</option>
                                        <option value="legs">Legs (Quads, Hamstrings, Glutes)</option>
                                        <option value="core">Core (Abs, Obliques)</option>
                                        <option value="cardio">Cardio / Endurance</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group flex-2">
                                        <label>Weight</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 185"
                                            value={newWorkout.weight}
                                            onChange={e => setNewWorkout({ ...newWorkout, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Unit</label>
                                        <select
                                            value={newWorkout.unit}
                                            onChange={e => setNewWorkout({ ...newWorkout, unit: e.target.value })}
                                        >
                                            <option value="lbs">lbs</option>
                                            <option value="kg">kg</option>
                                        </select>
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Reps</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 5"
                                            value={newWorkout.reps}
                                            onChange={e => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Notes (optional)</label>
                                    <textarea
                                        placeholder="How did it feel? Any form notes?"
                                        value={newWorkout.notes}
                                        onChange={e => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button className="btn-primary" onClick={handleLogWorkout}>
                                    <Check size={16} />
                                    Log PR
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {activeModal === 'createGoal' && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Create New Goal</h2>
                                <button className="modal-close" onClick={() => setActiveModal(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Goal Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Reach 75kg, Build 5kg Muscle"
                                        value={newGoal.title}
                                        onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Goal Type</label>
                                    <select
                                        value={newGoal.type}
                                        onChange={e => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                                    >
                                        <option value="weight">Weight Loss/Gain</option>
                                        <option value="muscle">Muscle Mass</option>
                                        <option value="bodyFat">Body Fat Percentage</option>
                                        <option value="strength">Strength (Lift Weight)</option>
                                        <option value="endurance">Endurance</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Current Value</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder={`e.g., ${stats.currentWeight}`}
                                            value={newGoal.currentValue}
                                            onChange={e => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Target Value</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 75"
                                            value={newGoal.targetValue}
                                            onChange={e => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select
                                            value={newGoal.unit}
                                            onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="lbs">lbs</option>
                                            <option value="%">%</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Weekly Target (optional)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 0.5"
                                            value={newGoal.weeklyTarget}
                                            onChange={e => setNewGoal({ ...newGoal, weeklyTarget: e.target.value })}
                                        />
                                        <span className="form-hint">How much change per week</span>
                                    </div>
                                    <div className="form-group">
                                        <label>Target Date (optional)</label>
                                        <input
                                            type="date"
                                            value={newGoal.targetDate}
                                            onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button className="btn-primary" onClick={handleCreateGoal}>
                                    <Check size={16} />
                                    Create Goal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {activeModal === 'photoUpload' && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Add Progress Photo</h2>
                                <button className="modal-close" onClick={() => setActiveModal(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="photo-upload-zone">
                                    <Camera size={48} />
                                    <p>Click or drag to upload a progress photo</p>
                                    <span>JPG, PNG up to 10MB</span>
                                    <input type="file" accept="image/*" />
                                </div>
                                <div className="photo-tips">
                                    <h4>Tips for Progress Photos</h4>
                                    <ul>
                                        <li>Use consistent lighting and background</li>
                                        <li>Take photos at the same time of day</li>
                                        <li>Wear similar clothing for comparison</li>
                                        <li>Include front, side, and back views</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button className="btn-primary">
                                    <Check size={16} />
                                    Upload Photo
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {activeModal === 'history' && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            className="modal-content modal-large"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Progress History</h2>
                                <button className="modal-close" onClick={() => setActiveModal(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="history-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Weight</th>
                                                <th>Body Fat</th>
                                                <th>Muscle</th>
                                                <th>Waist</th>
                                                <th>Chest</th>
                                                <th>Arms</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...progressEntries].reverse().map((entry, i) => {
                                                const prev = progressEntries[progressEntries.length - i - 2];
                                                return (
                                                    <tr key={entry.id}>
                                                        <td>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                                        <td>
                                                            {entry.weight}kg
                                                            {prev && entry.weight && prev.weight && (
                                                                <span className={entry.weight < prev.weight ? 'change-positive' : entry.weight > prev.weight ? 'change-negative' : ''}>
                                                                    {entry.weight < prev.weight ? ' ↓' : entry.weight > prev.weight ? ' ↑' : ''}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>{entry.bodyFat}%</td>
                                                        <td>{entry.muscleMass}kg</td>
                                                        <td>{entry.waist}cm</td>
                                                        <td>{entry.chest}cm</td>
                                                        <td>{entry.arms}cm</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
                                <button className="btn-primary">
                                    Export Data
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyProgress;
