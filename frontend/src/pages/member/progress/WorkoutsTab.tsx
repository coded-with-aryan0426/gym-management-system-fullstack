import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { memberProgressApi } from '../../../services/api';
import type { WorkoutLogDTO } from '../../../services/api';
import { FiCalendar, FiClock, FiActivity, FiZap, FiTrash2 } from 'react-icons/fi';

const WorkoutsTab: React.FC = () => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);

    const [workouts, setWorkouts] = useState<WorkoutLogDTO[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: number) => {
        if (!memberId) return;
        if (window.confirm('Are you sure you want to delete this workout log?')) {
            try {
                await memberProgressApi.deleteWorkout(memberId, id);
                setWorkouts(workouts.filter(w => w.id !== id));
            } catch (error) {
                console.error('Error deleting workout:', error);
            }
        }
    };

    if (loading) {
        return <div className="loading-state">Loading workouts...</div>;
    }

    if (workouts.length === 0) {
        return (
            <div className="empty-state">
                <h3>No workouts logged yet</h3>
                <p>Start logging your workouts to track your history.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="workouts-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="workouts-list">
                {workouts.map((workout) => (
                    <motion.div
                        key={workout.id}
                        className="workout-card"
                        layout
                    >
                        <div className="workout-card__header">
                            <div className="workout-info">
                                <h3>{workout.workoutType || 'Workout'}</h3>
                                <span className="workout-date">
                                    <FiCalendar /> {workout.workoutDate ? new Date(workout.workoutDate).toLocaleDateString() : 'Unknown Date'}
                                </span>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={() => workout.id && handleDelete(workout.id)}
                            >
                                <FiTrash2 />
                            </button>
                        </div>

                        <div className="workout-card__stats">
                            <div className="stat-item">
                                <FiClock />
                                <span>{workout.durationMinutes || 0} min</span>
                                <label>Duration</label>
                            </div>
                            <div className="stat-item">
                                <FiActivity />
                                <span>{workout.caloriesBurned || 0}</span>
                                <label>Calories</label>
                            </div>
                            {workout.intensityLevel && (
                                <div className="stat-item">
                                    <FiZap />
                                    <span>{workout.intensityLevel}/10</span>
                                    <label>Intensity</label>
                                </div>
                            )}
                        </div>

                        {workout.notes && (
                            <div className="workout-notes">
                                <p>{workout.notes}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default WorkoutsTab;