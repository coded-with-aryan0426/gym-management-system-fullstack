import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

    if (loading) {
        return (
            <div className="goals-loading">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                </motion.div>
                <span>Loading goals...</span>
            </div>
        );
    }

    const getGoalIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'weight': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="3"/>
                    <path d="M6.5 8a6.5 6.5 0 1 0 11 0Z"/>
                </svg>
            );
            case 'muscle': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 12h12"/>
                    <path d="M6 16h12"/>
                    <path d="M6 20h12"/>
                    <path d="M6 8h12"/>
                    <path d="M6 4h12"/>
                </svg>
            );
            case 'bodyfat': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3-9L9 21l-3-9H2"/>
                </svg>
            );
            case 'strength': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 4h4l2 4h6"/>
                    <path d="M11 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    <path d="M20 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    <path d="M4 16h16"/>
                </svg>
            );
            case 'endurance': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            );
            default: return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
            );
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return '#22c55e';
        if (progress >= 75) return '#3b82f6';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <motion.div className="goals-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            <div className="goals-header">
                <div className="goals-header__left">
                    <h2>Your Goals</h2>
                    <p>Track your progress and stay motivated</p>
                </div>
                <div className="goals-header__stats">
                    <div className="goal-stats">
                        <span className="stat-label">Active Goals</span>
                        <span className="stat-value">{goals.filter(g => g.isActive).length}</span>
                    </div>
                    <div className="goal-stats">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{goals.filter(g => !g.isActive && g.progress >= 100).length}</span>
                    </div>
                </div>
            </div>

            <div className="goals-grid">
                {goals.length === 0 ? (
                    <div className="empty-goals">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <h3>No goals yet</h3>
                        <p>Set your first goal to start tracking progress</p>
                        <button className="btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Create Goal
                        </button>
                    </div>
                ) : (
                    goals.map((goal) => (
                        <motion.div
                            key={goal.id}
                            className={`goal-card ${goal.isActive ? 'active' : 'completed'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="goal-card__header">
                                <div className="goal-icon">
                                    {getGoalIcon(goal.goalType)}
                                </div>
                                <div className="goal-info">
                                    <h3>{goal.title}</h3>
                                    <div className="goal-meta">
                                        <span className="goal-type">{goal.goalType}</span>
                                        <span className="goal-date">Started {new Date(goal.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="goal-actions">
                                    <button className="goal-action-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    <button className="goal-action-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="goal-progress">
                                <div className="progress-header">
                                    <div className="progress-labels">
                                        <span className="progress-start">{goal.startValue} {goal.unit}</span>
                                        <span className="progress-current">{goal.currentValue} {goal.unit}</span>
                                        <span className="progress-target">{goal.targetValue} {goal.unit}</span>
                                    </div>
                                    <div className="progress-percentage">
                                        <span style={{ color: getProgressColor(goal.progress) }}>
                                            {Math.round(goal.progress)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ 
                                            width: `${Math.min(goal.progress, 100)}%`,
                                            backgroundColor: getProgressColor(goal.progress)
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="goal-details">
                                <div className="goal-detail-item">
                                    <span className="detail-label">Progress</span>
                                    <span className="detail-value">
                                        {Math.round(goal.currentValue - goal.startValue)} {goal.unit} 
                                        {goal.currentValue > goal.startValue ? 'gained' : goal.currentValue < goal.startValue ? 'lost' : 'no change'}
                                    </span>
                                </div>
                                {goal.weeklyTarget && (
                                    <div className="goal-detail-item">
                                        <span className="detail-label">Weekly Target</span>
                                        <span className="detail-value">{goal.weeklyTarget} {goal.unit}/week</span>
                                    </div>
                                )}
                                {goal.targetDate && (
                                    <div className="goal-detail-item">
                                        <span className="detail-label">Target Date</span>
                                        <span className="detail-value">{new Date(goal.targetDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="goal-footer">
                                <button className="btn-secondary btn-sm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v20"/>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                    </svg>
                                    Update Progress
                                </button>
                                <button className="btn-primary btn-sm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/>
                                        <polyline points="16 16 12 12 16 8"/>
                                        <line x1="12" y1="12" x2="22" y2="12"/>
                                    </svg>
                                    View Details
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