import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Calendar, Trash2, Edit3, Plus, CheckCircle2, AlertCircle, ChevronRight, Scale, Activity, Zap, Dumbbell, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi, MemberGoalDTO } from '../../services/api';
import toast from 'react-hot-toast';

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
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [formData, setFormData] = useState<MemberGoalDTO>({
        title: '',
        goalType: 'WEIGHT',
        targetValue: 0,
        unit: 'kg',
        targetDate: '',
        startValue: 0,
        currentValue: 0
    });

    useEffect(() => {
        fetchGoals();
    }, [memberId]);

    const fetchGoals = async () => {
        if (!memberId) return;
        
        try {
            setLoading(true);
            const goalsData = await memberProgressApi.getGoals(memberId);
            setGoals(goalsData);
        } catch (error) {
            console.error('Error fetching goals:', error);
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberId) return;
        
        try {
            if (editingGoal) {
                await memberProgressApi.updateGoal(memberId, editingGoal.id, formData);
                toast.success('Goal updated successfully!');
            } else {
                await memberProgressApi.createGoal(memberId, formData);
                toast.success('Goal created successfully!');
            }
            setShowModal(false);
            resetForm();
            fetchGoals();
        } catch (error) {
            console.error('Error saving goal:', error);
            toast.error('Failed to save goal');
        }
    };

    const handleDelete = async (goalId: number) => {
        if (!memberId || !confirm('Delete this goal?')) return;
        
        try {
            await memberProgressApi.deleteGoal(memberId, goalId);
            toast.success('Goal deleted');
            fetchGoals();
        } catch (error) {
            console.error('Error deleting goal:', error);
            toast.error('Failed to delete goal');
        }
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            goalType: goal.goalType,
            targetValue: goal.targetValue,
            unit: goal.unit,
            targetDate: goal.targetDate || '',
            startValue: goal.startValue,
            currentValue: goal.currentValue
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            goalType: 'WEIGHT',
            targetValue: 0,
            unit: 'kg',
            targetDate: '',
            startValue: 0,
            currentValue: 0
        });
        setEditingGoal(null);
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

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
                <button className="add-goal-btn" onClick={openModal}>
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
                        <button className="btn-primary-v2" onClick={openModal}>Get Started</button>
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
                                    <button className="icon-btn-mini" onClick={() => handleEdit(goal)}><Edit3 size={14} /></button>
                                    <button className="icon-btn-mini delete" onClick={() => handleDelete(goal.id)}><Trash2 size={14} /></button>
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

            {/* Goal Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label>Goal Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="e.g., Lose 10kg, Build Muscle"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Goal Type *</label>
                                        <select
                                            value={formData.goalType}
                                            onChange={(e) => setFormData({...formData, goalType: e.target.value})}
                                            required
                                        >
                                            <option value="WEIGHT">Weight Loss/Gain</option>
                                            <option value="MUSCLE">Muscle Gain</option>
                                            <option value="BODYFAT">Body Fat Reduction</option>
                                            <option value="STRENGTH">Strength Improvement</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Unit *</label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            required
                                        >
                                            <option value="kg">kg</option>
                                            <option value="lbs">lbs</option>
                                            <option value="%">%</option>
                                            <option value="reps">reps</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Value</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.startValue || ''}
                                            onChange={(e) => setFormData({...formData, startValue: Number(e.target.value)})}
                                            placeholder="70"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Target Value *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.targetValue || ''}
                                            onChange={(e) => setFormData({...formData, targetValue: Number(e.target.value)})}
                                            placeholder="65"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Current Value</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.currentValue || ''}
                                        onChange={(e) => setFormData({...formData, currentValue: Number(e.target.value)})}
                                        placeholder="68"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Target Date</label>
                                    <input
                                        type="date"
                                        value={formData.targetDate}
                                        onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingGoal ? 'Update Goal' : 'Create Goal'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GoalsTab;