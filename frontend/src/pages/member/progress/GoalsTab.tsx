import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, Trash2, Edit3, Plus, CheckCircle2, AlertCircle, ChevronRight, Scale, Activity, Zap, Dumbbell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';

interface Goal {
    id: number;
    title: string;
    goalType: string;
    startValue: number;
    currentValue: number;
    targetValue: number;
    unit: string;
    startDate: string;
    targetDate: string | null;
    weeklyTarget: number | null;
    isActive: boolean;
    progress: number;
}

const GoalsTab: React.FC = () => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);
    
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGoals = async () => {
            if (!memberId) return;
            
            try {
                setLoading(true);
                const goalsData = await memberProgressApi.getGoals(memberId);
                setGoals(goalsData);
            } catch (error) {
                console.error('Error fetching goals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, [memberId]);

    const getGoalIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'weight': return <Scale size={18} />;
            case 'muscle': return <Zap size={18} />;
            case 'bodyfat': return <Activity size={18} />;
            case 'strength': return <Dumbbell size={18} />;
            default: return <Target size={18} />;
        }
    };

    const getStatusColor = (goal: Goal) => {
        if (!goal.isActive) return 'status-completed';
        const progress = Math.min(100, Math.max(0, goal.progress));
        if (progress >= 75) return 'status-on-track';
        if (progress >= 40) return 'status-progressing';
        return 'status-starting';
    };

    if (loading) {
        return (
            <div className="goals-loading">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Activity size={24} />
                </motion.div>
                <span>Loading your goals...</span>
            </div>
        );
    }

    return (
        <motion.div className="goals-tab-v2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="goals-tab-header">
                <div className="header-text">
                    <h2>Progress Goals</h2>
                    <p>You have {goals.filter(g => g.isActive).length} active goals currently</p>
                </div>
                <button className="add-goal-btn">
                    <Plus size={16} /> Create New Goal
                </button>
            </div>

            <div className="goals-grid-v2">
                {goals.length === 0 ? (
                    <div className="empty-goals-v2">
                        <div className="empty-icon-wrapper">
                            <Target size={48} />
                        </div>
                        <h3>No goals set yet</h3>
                        <p>Setting goals is the first step to achieving them. What do you want to achieve?</p>
                        <button className="btn-primary-v2">Get Started</button>
                    </div>
                ) : (
                    goals.map((goal, idx) => (
                        <motion.div 
                            key={`goal-${idx}-${goal.id ?? ''}`} 
                            className={`goal-card-v2 ${getStatusColor(goal)}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="goal-card-header">
                                <div className="goal-type-badge">
                                    {getGoalIcon(goal.goalType)}
                                    <span>{goal.goalType}</span>
                                </div>
                                <div className="goal-actions-mini">
                                    <button className="icon-btn-mini"><Edit3 size={14} /></button>
                                    <button className="icon-btn-mini delete"><Trash2 size={14} /></button>
                                </div>
                            </div>

                            <div className="goal-card-body">
                                <h3 className="goal-title">{goal.title}</h3>
                                
                                <div className="goal-progress-main">
                                    <div className="progress-stats">
                                        <div className="stat-group">
                                            <span className="stat-label">Current</span>
                                            <span className="stat-value">{goal.currentValue} <small>{goal.unit}</small></span>
                                        </div>
                                        <div className="progress-visual">
                                            <span className="percent-text">{Math.round(goal.progress)}%</span>
                                        </div>
                                        <div className="stat-group text-right">
                                            <span className="stat-label">Target</span>
                                            <span className="stat-value">{goal.targetValue} <small>{goal.unit}</small></span>
                                        </div>
                                    </div>
                                    
                                    <div className="goal-progress-bar">
                                        <div className="bar-bg">
                                            <motion.div 
                                                className="bar-fill" 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="goal-details-grid">
                                    <div className="detail-item">
                                        <TrendingUp size={12} />
                                        <span>{Math.abs(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit} to go</span>
                                    </div>
                                    {goal.targetDate && (
                                        <div className="detail-item">
                                            <Calendar size={12} />
                                            <span>Ends {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="goal-card-footer">
                                {goal.isActive ? (
                                    <div className="goal-status on-track">
                                        <CheckCircle2 size={14} />
                                        <span>On Track</span>
                                    </div>
                                ) : (
                                    <div className="goal-status completed">
                                        <Trophy size={14} />
                                        <span>Goal Achieved</span>
                                    </div>
                                )}
                                <button className="update-btn">
                                    Update <ChevronRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default GoalsTab;