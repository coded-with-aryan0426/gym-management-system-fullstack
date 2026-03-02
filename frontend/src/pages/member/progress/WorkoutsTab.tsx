import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';

interface Workout {
    id: number;
    exercise: string;
    weightValue: number;
    reps: number;
    unit: string;
    recordDate: string;
    category: string;
    notes: string;
    pbValue: number;
    pbDate: string;
    improvement: number;
}

const WorkoutsTab: React.FC = () => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);
    
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchWorkouts = async () => {
            if (!memberId) return;
            
            try {
                setLoading(true);
                const workoutsData = await memberProgressApi.getWorkouts(memberId);
                setWorkouts(workoutsData);
            } catch (error) {
                console.error('Error fetching workouts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, [memberId]);

    const getCategoryName = (category: string) => {
        const categories: Record<string, string> = {
            push: 'Push (Chest, Shoulders, Triceps)',
            pull: 'Pull (Back, Biceps)',
            legs: 'Legs (Quads, Hamstrings, Glutes)',
            core: 'Core (Abs, Obliques)',
            cardio: 'Cardio / Endurance'
        };
        return categories[category] || category;
    };

    const getWorkoutIcon = (category: string) => {
        switch (category) {
            case 'push': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            );
            case 'pull': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
            );
            case 'legs': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 4h4l2 4h6"/>
                    <path d="M11 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    <path d="M20 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    <path d="M4 16h16"/>
                </svg>
            );
            case 'core': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
            );
            case 'cardio': return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <polyline points="3 9 12 15 15 12 21 18"/>
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

    const getImprovementIcon = (improvement: number) => {
        if (improvement > 0) {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            );
        } else if (improvement < 0) {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
            );
        } else {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                </svg>
            );
        }
    };

    const getImprovementColor = (improvement: number) => {
        if (improvement > 0) return '#22c55e';
        if (improvement < 0) return '#ef4444';
        return '#6b7280';
    };

    const filteredWorkouts = selectedCategory === 'all' 
        ? workouts 
        : workouts.filter(w => w.category === selectedCategory);

    return (
        <motion.div className="workouts-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            <div className="workouts-header">
                <div className="workouts-header__left">
                    <h2>Workout History</h2>
                    <p>Track your strength progress and personal records</p>
                </div>
                <div className="workouts-header__actions">
                    <div className="category-filters">
                        <label>Filter by Category</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                            <option value="all">All Categories</option>
                            <option value="push">Push</option>
                            <option value="pull">Pull</option>
                            <option value="legs">Legs</option>
                            <option value="core">Core</option>
                            <option value="cardio">Cardio</option>
                        </select>
                    </div>
                    <button className="btn-primary btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Log Workout
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="workouts-loading">
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                    </motion.div>
                    <span>Loading workouts...</span>
                </div>
            ) : (
                <div className="workouts-grid">
                    {filteredWorkouts.length === 0 ? (
                        <div className="empty-workouts">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            <h3>No workouts yet</h3>
                            <p>Start logging your workouts to track progress</p>
                            <button className="btn-primary">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Log First Workout
                            </button>
                        </div>
                    ) : (
                        filteredWorkouts.map((workout, wi) => (
                            <motion.div
                                key={`workout-${wi}-${workout.id ?? ''}`}
                                className="workout-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="workout-card__header">
                                    <div className="workout-icon">
                                        {getWorkoutIcon(workout.category)}
                                    </div>
                                    <div className="workout-info">
                                        <h3>{workout.exercise}</h3>
                                        <div className="workout-meta">
                                            <span className="workout-category">{getCategoryName(workout.category)}</span>
                                            <span className="workout-date">{new Date(workout.recordDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="workout-actions">
                                        <button className="workout-action-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button className="workout-action-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="workout-details">
                                    <div className="workout-detail">
                                        <span className="detail-label">Weight</span>
                                        <span className="detail-value">{workout.weightValue} {workout.unit}</span>
                                    </div>
                                    <div className="workout-detail">
                                        <span className="detail-label">Reps</span>
                                        <span className="detail-value">{workout.reps}</span>
                                    </div>
                                    {workout.pbValue && (
                                        <div className="workout-detail">
                                            <span className="detail-label">PB</span>
                                            <span className="detail-value">{workout.pbValue} {workout.unit}</span>
                                        </div>
                                    )}
                                    {workout.improvement && (
                                        <div className="workout-detail">
                                            <span className="detail-label">Improvement</span>
                                            <span className="detail-value" style={{ color: getImprovementColor(workout.improvement) }}>
                                                {getImprovementIcon(workout.improvement)}
                                                {workout.improvement > 0 ? '+' : ''}{workout.improvement} {workout.unit}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {workout.notes && (
                                    <div className="workout-notes">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                        </svg>
                                        <span>{workout.notes}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default WorkoutsTab;