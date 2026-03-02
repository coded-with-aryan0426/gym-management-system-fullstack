import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import { 
    Scale, Activity, Target, Dumbbell, Camera, MessageSquare, 
    Flame, Calendar, Clock, Plus, 
    Info, CheckCircle2, AlertCircle, TrendingUp, Sparkles, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';
import './MyProgress.css';
import PRHistoryModal from './components/PRHistoryModal';
import './PRHistoryStyles.css';

interface ProgressSummary {
    currentWeight: number | null;
    startWeight: number | null;
    goalWeight: number | null;
    currentBmi: number | null;
    bmiCategory: string | null;
    // API returns these as currentBodyFat / currentMuscleMass
    currentBodyFat: number | null;
    startBodyFat: number | null;
    currentMuscleMass: number | null;
    startMuscleMass: number | null;
    // API returns currentStreak
    currentStreak: number;
    longestStreak: number;
    totalCaloriesBurned: number;
    totalWorkouts: number;
    workoutsThisMonth: number;
    avgWorkoutDuration: number;
    workoutsThisWeek: number;
    consistencyRate: number;
    firstEntryDate?: string;
    topPersonalBests?: any[];
}

const OverviewTab: React.FC<{ timeRange?: string }> = ({ timeRange = '30D' }) => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);
    
    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPRModalOpen, setIsPRModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!memberId) return;
            
            try {
                setLoading(true);
                const [summaryData, metricsData, goalsData] = await Promise.all([
                    memberProgressApi.getSummary(memberId),
                    memberProgressApi.getMetrics(memberId, timeRange),
                    memberProgressApi.getGoals(memberId)
                ]);
                
                setSummary(summaryData as unknown as ProgressSummary);
                
                // Process and sort metrics
                const processedMetrics = (metricsData || [])
                    .filter((m: any) => m.weight !== null || m.bodyFat !== null)
                    .sort((a: any, b: any) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
                
                setMetrics(processedMetrics);
                setGoals((goalsData || []).filter((g: any) => g.isActive));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [memberId, timeRange]);

    if (loading) {
        return (
            <div className="overview-loading">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Activity size={24} />
                </motion.div>
                <span>Loading your dashboard...</span>
            </div>
        );
    }

    if (!summary) return null;

    const weightChange = summary.currentWeight && summary.startWeight ? summary.currentWeight - summary.startWeight : 0;
    const totalLost = weightChange < 0 ? Math.abs(weightChange).toFixed(1) : "0";
    const percentChange = summary.startWeight ? ((weightChange / summary.startWeight) * 100).toFixed(1) : "0";
    
    // Improved BMI Logic
    const heightInMeters = user?.height ? user.height / 100 : null;
    const calculatedBmi = summary.currentWeight && heightInMeters ? (summary.currentWeight / (heightInMeters * heightInMeters)) : null;
    const bmiValue = summary.currentBmi || calculatedBmi;
    
    const getBmiCategory = (bmi: number) => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };
    
    const bmiCategory = summary.bmiCategory || (bmiValue ? getBmiCategory(bmiValue) : 'Not set');

    const bmiTrendData = metrics
        .filter(m => m.bmi || (m.weight && heightInMeters))
        .map(m => ({
            date: new Date(m.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            bmi: m.bmi || (m.weight / (heightInMeters! * heightInMeters!))
        }));

    // Insight Logic
    const topGoal = goals[0];
    const goalProgress = topGoal 
        ? (topGoal.targetValue !== topGoal.startValue 
            ? Math.min(100, Math.max(0, ((topGoal.currentValue - topGoal.startValue) / (topGoal.targetValue - topGoal.startValue)) * 100))
            : 0)
        : null;
    
    const remainingToGoal = topGoal ? (100 - (goalProgress || 0)).toFixed(1) : null;

    return (
        <motion.div className="overview-tab-v2" initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}>
            
            {/* Top Stat Summary Grid */}
            <div className="dashboard-grid stats-summary-grid">
                <div className="summary-card">
                    <div className="summary-card__top">
                        <div className="summary-card__icon weight"><Scale size={18} /></div>
                        <div className="summary-card__info">
                            <span className="label">Starting Weight</span>
                            <span className="value">{summary.startWeight?.toFixed(1) || '--'} <small>kg</small></span>
                            <span className="date">{summary.firstEntryDate ? new Date(summary.firstEntryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}</span>
                        </div>
                    </div>
                </div>
                <div className="summary-card highlight">
                    <div className="summary-card__top">
                        <div className="summary-card__icon current"><Activity size={18} /></div>
                        <div className="summary-card__info">
                            <span className="label">Current Weight</span>
                            <span className="value">{summary.currentWeight?.toFixed(1) || '--'} <small>kg</small></span>
                            <span className="date">Today</span>
                        </div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__top">
                        <div className="summary-card__icon goal"><Target size={18} /></div>
                        <div className="summary-card__info">
                            <span className="label">Goal Weight</span>
                            <span className="value">{summary.goalWeight?.toFixed(1) || '--'} <small>kg</small></span>
                            <span className="detail">{(summary.currentWeight && summary.goalWeight) ? `${Math.abs(summary.currentWeight - summary.goalWeight).toFixed(1)}kg remaining` : 'Set a goal'}</span>
                        </div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__top">
                        <div className="summary-card__icon loss"><Flame size={18} /></div>
                        <div className="summary-card__info">
                            <span className="label">Total Lost</span>
                            <span className="value text-emerald-500">{weightChange < 0 ? '-' : ''}{totalLost} <small>kg</small></span>
                            <span className="detail">{percentChange}% change</span>
                        </div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__top">
                        <div className="summary-card__icon pace"><Clock size={18} /></div>
                        <div className="summary-card__info">
                            <span className="label">Avg Weekly Loss</span>
                            <span className="value">0.4 <small>kg</small></span>
                            <span className="detail">per week</span>
                        </div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__top">
                        <div className="summary-card__icon date"><Calendar size={18} /></div>
                        <div className="summary-card__info">
                            <span className="label">Est. Goal Date</span>
                            <span className="value">Jun 4</span>
                            <span className="detail">at current pace</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-main-layout">
                {/* Left Column - 2/3 width */}
                <div className="dashboard-column-main">
                    
                    {/* Weight & Body Comp Graph Section */}
                    <div className="dashboard-section chart-section">
                        <div className="section-header">
                            <h3>Weight & Body Composition</h3>
                            <div className="header-actions">
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="dot weight"></span> Weight</span>
                                    <span className="legend-item"><span className="dot fat"></span> Body Fat</span>
                                </div>
                            </div>
                        </div>
                        <div className="main-chart-container">
                            {metrics.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={metrics.map(m => ({
                                        ...m,
                                        date: new Date(m.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }))}>
                                        <defs>
                                            <linearGradient id="colorWeightMain" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} dy={10} />
                                        <YAxis yAxisId="left" orientation="left" stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} domain={[0, 'dataMax + 5']} />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                                            itemStyle={{fontSize: '12px'}}
                                        />
                                        <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeightMain)" animationDuration={1000} />
                                        <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#a855f7" strokeWidth={2} dot={{r: 4, fill: '#a855f7'}} animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart-placeholder">
                                    <Activity size={48} opacity={0.2} />
                                    <p>No historical data to display</p>
                                    <span style={{fontSize: '12px', opacity: 0.5}}>Start logging your metrics to see trends</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-row-grid">
                        {/* Active Goals */}
                        <div className="dashboard-section goals-section">
                            <div className="section-header">
                                <h3>Active Goals</h3>
                                <span className="count-badge">{goals.length} goals</span>
                            </div>
                            <div className="goals-list">
                                {goals.length > 0 ? goals.map((goal, idx) => {
                                    const progress = goal.targetValue !== goal.startValue 
                                        ? Math.min(100, Math.max(0, ((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100))
                                        : 0;
                                    
                                    return (
                                        <div className="goal-item-mini" key={idx}>
                                            <div className="goal-info">
                                                <span className="goal-title">{goal.title}</span>
                                                <span className="goal-type">{goal.goalType} Goal</span>
                                            </div>
                                            <div className="goal-progress-container">
                                                <div className="goal-meta">
                                                    <span className="percent">{Math.round(progress)}%</span>
                                                    <span className="remaining">{Math.abs(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit} remaining</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
                                                </div>
                                                <div className="goal-status-text warning">
                                                    <AlertCircle size={10} /> Behind schedule - increase effort
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="empty-section-state">
                                        <Plus size={20} />
                                        <p>Set a new goal</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BMI Trend */}
                        <div className="dashboard-section bmi-section">
                            <div className="section-header">
                                <h3>BMI Trend</h3>
                                <div className="bmi-badge" style={{
                                    backgroundColor: bmiCategory === 'Healthy' || bmiCategory === 'Normal' ? 'rgba(16, 185, 129, 0.1)' : 
                                                   bmiCategory === 'Underweight' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: bmiCategory === 'Healthy' || bmiCategory === 'Normal' ? '#10b981' : 
                                           bmiCategory === 'Underweight' ? '#3b82f6' : '#f59e0b'
                                }}>
                                    {bmiCategory}
                                </div>
                            </div>
                            <div className="bmi-content-v2">
                                <div className="bmi-main-display">
                                    <div className="bmi-value-large">
                                        <span className="number">{bmiValue?.toFixed(1) || '--'}</span>
                                        <span className="label">Current BMI</span>
                                    </div>
                                    {!user?.height && (
                                        <div className="bmi-warning">
                                            <AlertCircle size={12} />
                                            <span>Set height in profile for accuracy</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bmi-trend-mini-chart">
                                    {bmiTrendData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height={80}>
                                            <LineChart data={bmiTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <Tooltip 
                                                    contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px'}}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="bmi" 
                                                    stroke="#10b981" 
                                                    strokeWidth={2} 
                                                    dot={false}
                                                    animationDuration={1500}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="bmi-no-trend">
                                            <TrendingUp size={24} opacity={0.2} />
                                            <span>Insufficient data for trend</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bmi-scale-mini">
                                    <div className="scale-markers">
                                        <div className="marker" style={{left: '0%'}}>15</div>
                                        <div className="marker" style={{left: '25%'}}>20</div>
                                        <div className="marker" style={{left: '50%'}}>25</div>
                                        <div className="marker" style={{left: '75%'}}>30</div>
                                        <div className="marker" style={{left: '100%'}}>35</div>
                                    </div>
                                    <div className="scale-bar">
                                        <div className="bar-segment blue" style={{width: '23.3%'}}></div>
                                        <div className="bar-segment green" style={{width: '32.5%'}}></div>
                                        <div className="bar-segment orange" style={{width: '25%'}}></div>
                                        <div className="bar-segment red" style={{width: '19.2%'}}></div>
                                        {bmiValue && (
                                            <motion.div 
                                                className="bmi-pointer" 
                                                initial={{ left: '0%' }}
                                                animate={{ left: `${Math.min(100, Math.max(0, ((bmiValue - 15) / 20) * 100))}%` }}
                                                transition={{ duration: 1, type: 'spring' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Records - Dense Grid */}
                    <div className="dashboard-section pr-section">
                        <div className="section-header">
                            <h3>Personal Records</h3>
                            <button className="text-btn" onClick={() => setIsPRModalOpen(true)}>View All PRs</button>
                        </div>
                        <div className="pr-dense-grid">
                            {summary.topPersonalBests && summary.topPersonalBests.length > 0 ? (
                                summary.topPersonalBests.slice(0, 4).map((pb: any, idx: number) => (
                                    <div className="pr-card-mini" key={idx}>
                                        <div className={`pr-icon ${pb.category?.toLowerCase() || 'push'}`}>
                                            {pb.exercise.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="pr-details">
                                            <span className="exercise">{pb.exercise}</span>
                                            <span className="stat">{pb.reps ? `${pb.reps} reps · ` : ''}{pb.weightValue} {pb.unit || 'kg'}</span>
                                            <span className="date">{new Date(pb.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-pr-state">
                                    <p>No PRs recorded yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <PRHistoryModal 
                        isOpen={isPRModalOpen}
                        onClose={() => setIsPRModalOpen(false)}
                        memberId={memberId}
                    />
                </div>

                {/* Right Column - 1/3 width */}
                <div className="dashboard-column-side">
                    
                    {/* Visual Progress */}
                    <div className="dashboard-section photos-section">
                        <div className="section-header">
                            <h3>Visual Progress</h3>
                            <button className="text-btn">Gallery</button>
                        </div>
                        <div className="photo-preview-card">
                            <div className="photo-placeholder">
                                <Camera size={24} opacity={0.3} />
                                <div className="photo-badge">Today</div>
                            </div>
                            <button className="add-photo-btn-inline">
                                <Plus size={16} /> Add Photo
                            </button>
                        </div>
                    </div>

                    {/* Weekly Insight Section (Improved UI) */}
                    <div className="dashboard-section insight-section-v2">
                        <div className="section-header">
                            <h3>Weekly Insight</h3>
                            <Sparkles size={16} color="#FFD700" />
                        </div>
                        
                        <div className="insight-card-premium">
                            {topGoal ? (
                                <div className="goal-insight-pills">
                                    <p className="insight-message">
                                        You're <span className="highlight">{remainingToGoal}%</span> away from your <span className="goal-name">{topGoal.title}</span> goal!
                                    </p>
                                    <div className="insight-progress-mini">
                                        <div className="bar-bg">
                                            <div className="bar-fill" style={{ width: `${goalProgress}%` }}></div>
                                        </div>
                                        <span className="percent-label">{Math.round(goalProgress || 0)}% complete</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="insight-message">Set a fitness goal to see progress insights!</p>
                            )}

                            <div className="insight-stats-grid">
                                <div className="insight-stat-box streak">
                                    <div className="icon-wrapper">
                                        <Zap size={18} fill="#FF9500" color="#FF9500" />
                                        <motion.div 
                                            className="glow-pulse"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>
                                    <div className="stat-info">
                                        <span className="value">{summary.currentStreak || 0} Day</span>
                                        <span className="label">Streak</span>
                                    </div>
                                </div>
                                <div className="insight-stat-box consistency">
                                    <div className="ring-container-mini">
                                        <svg viewBox="0 0 36 36" className="circular-chart-mini">
                                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="circle" strokeDasharray={`${summary.consistencyRate || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                        <span className="ring-value">{Math.round(summary.consistencyRate || 0)}%</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="value">{summary.workoutsThisWeek || 0}/7</span>
                                        <span className="label">This Week</span>
                                    </div>
                                </div>
                            </div>

                            <div className="weekly-activity-dots">
                                <span className="dots-label">Activity Status</span>
                                <div className="dots-container">
                                    {[...Array(7)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`activity-dot ${i < (summary.workoutsThisWeek || 0) ? 'active' : ''}`}
                                            title={`Day ${i+1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trainer Notes */}
                    <div className="dashboard-section notes-section">
                        <div className="section-header">
                            <h3>Trainer Notes</h3>
                            <button className="icon-btn"><MessageSquare size={16} /></button>
                        </div>
                        <div className="notes-preview">
                            <div className="empty-notes">
                                <p>No new notes to read</p>
                            </div>
                            <button className="panel-btn-dense">Read All Notes</button>
                        </div>
                    </div>

                    {/* Achievement Timeline */}
                    <div className="dashboard-section timeline-section">
                        <div className="section-header">
                            <h3>Achievements</h3>
                        </div>
                        <div className="achievement-timeline-mini">
                            <div className="timeline-item-mini reached">
                                <div className="dot"><CheckCircle2 size={12} /></div>
                                <div className="content">
                                    <span className="title">Member Since</span>
                                    <span className="date">{summary.firstEntryDate ? new Date(summary.firstEntryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '--'}</span>
                                </div>
                            </div>
                            <div className="timeline-item-mini reached">
                                <div className="dot"><CheckCircle2 size={12} /></div>
                                <div className="content">
                                    <span className="title">Total Workouts</span>
                                    <span className="date">{summary.totalWorkouts || 0} reached</span>
                                </div>
                            </div>
                            <div className="timeline-item-mini current">
                                <div className="dot"></div>
                                <div className="content">
                                    <span className="title">Next Milestone</span>
                                    <span className="target">{goals.length > 0 ? goals[0].title : 'Set a goal'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default OverviewTab;
