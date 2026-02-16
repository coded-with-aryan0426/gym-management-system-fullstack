import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';

interface ProgressSummary {
    currentWeight: number | null;
    startWeight: number | null;
    goalWeight: number | null;
    bodyFat: number | null;
    startBodyFat: number | null;
    muscleMass: number | null;
    startMuscleMass: number | null;
    streak: number;
    longestStreak: number;
    totalCaloriesBurned: number;
    totalWorkouts: number;
    workoutsThisMonth: number;
    avgWorkoutDuration: number;
    workoutsThisWeek: number;
    consistencyRate: number;
    firstEntryDate?: string;
}

const OverviewTab: React.FC = () => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);
    
    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!memberId) return;
            
            try {
                setLoading(true);
                const summaryData = await memberProgressApi.getSummary(memberId);
                setSummary(summaryData);
            } catch (error) {
                console.error('Error fetching summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [memberId]);

    if (loading) {
        return (
            <div className="overview-loading">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                </motion.div>
                <span>Loading overview...</span>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="overview-empty">
                <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    <h3>No progress data yet</h3>
                    <p>Start logging your progress to see your overview here</p>
                </div>
            </div>
        );
    }

    const weightChange = summary.currentWeight && summary.startWeight 
        ? summary.currentWeight - summary.startWeight 
        : 0;
    const muscleChange = summary.muscleMass && summary.startMuscleMass 
        ? summary.muscleMass - summary.startMuscleMass 
        : 0;
    const bodyFatChange = summary.bodyFat && summary.startBodyFat 
        ? summary.bodyFat - summary.startBodyFat 
        : 0;

    const heightInMeters = user?.height ? user.height / 100 : null;
    const bmiValue = summary.currentWeight && heightInMeters 
        ? (summary.currentWeight / (heightInMeters * heightInMeters)).toFixed(1) 
        : null;

    return (
        <motion.div className="overview-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            {/* Summary Banner */}
            {(weightChange !== 0 || muscleChange !== 0 || summary.streak > 0) && (
                <motion.div className="summary-banner" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="summary-banner__content">
                        <div className="summary-banner__main">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
                                <path d="M6.38 13a17.89 17.89 0 0 0 .62-5 17.9 17.9 0 0 0-3.62 1.18"/>
                                <path d="M3.93 7.17a10 10 0 0 0 2.1-1.13"/>
                                <path d="M12 3v4"/>
                                <path d="M3 12h4"/>
                                <path d="M21 12h-4"/>
                                <path d="M12 18v4"/>
                                <path d="M20.83 8.83a10 10 0 0 0-1.13-2.1"/>
                            </svg>
                            <span>
                                {weightChange !== 0 || muscleChange !== 0 ? (
                                    <><strong>Great progress!</strong> You've {weightChange < 0 ? `lost ${Math.abs(weightChange).toFixed(1)}kg` : ''}{weightChange < 0 && muscleChange > 0 ? ' and ' : ''}{muscleChange > 0 ? `gained ${muscleChange.toFixed(1)}kg muscle` : ''}{summary.firstEntryDate ? ` since ${new Date(summary.firstEntryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</>
                                ) : (
                                    <><strong>Keep going!</strong> {summary.streak > 0 ? `You're on a ${summary.streak} day streak!` : 'Start logging your progress today.'}</>
                                )}
                            </span>
                        </div>
                        <div className="summary-banner__stats">
                            <div className="mini-stat">
                                <span className="mini-stat__value">{summary.streak}</span>
                                <span className="mini-stat__label">Day Streak</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat__value">{summary.workoutsThisWeek}/7</span>
                                <span className="mini-stat__label">This Week</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat__value">{Math.round(summary.consistencyRate || 0)}%</span>
                                <span className="mini-stat__label">Consistency</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Top Stats Row */}
            <motion.div className="stats-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stat-card stat-card--weight clickable">
                    <div className="stat-card__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="5" r="3"/>
                            <path d="M6.5 8a6.5 6.5 0 1 0 11 0Z"/>
                        </svg>
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{summary.currentWeight ?? '--'}<span>kg</span></div>
                        <div className="stat-card__label">Current Weight</div>
                        <div className="stat-card__detail">
                            {summary.goalWeight ? `Goal: ${summary.goalWeight}kg (${Math.abs((summary.currentWeight ?? 0) - summary.goalWeight).toFixed(1)}kg to go)` : 'Set a goal to track progress'}
                        </div>
                    </div>
                    <div className="stat-card__right">
                        {weightChange !== 0 && (
                            <div className={`stat-card__trend ${weightChange <= 0 ? 'positive' : 'negative'}`}>
                                {weightChange <= 0 ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                )}
                                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card stat-card--bodyfat clickable">
                    <div className="stat-card__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3-9L9 21l-3-9H2"/>
                        </svg>
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{summary.bodyFat ?? '--'}<span>%</span></div>
                        <div className="stat-card__label">Body Fat</div>
                        <div className="stat-card__detail">
                            {summary.startBodyFat ? `Started at ${summary.startBodyFat}% (${Math.abs(bodyFatChange).toFixed(1)}% lost)` : 'Log your first measurement'}
                        </div>
                    </div>
                    <div className="stat-card__right">
                        {bodyFatChange !== 0 && (
                            <div className={`stat-card__trend ${bodyFatChange <= 0 ? 'positive' : 'negative'}`}>
                                {bodyFatChange <= 0 ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                )}
                                {bodyFatChange}%
                            </div>
                        )}
                        {summary.bodyFat && (
                            <div className="stat-card__category">
                                {summary.bodyFat < 15 ? 'Athletic' : summary.bodyFat < 20 ? 'Fit' : summary.bodyFat < 25 ? 'Average' : 'Above Average'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card stat-card--muscle clickable">
                    <div className="stat-card__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 12h12"/>
                            <path d="M6 16h12"/>
                            <path d="M6 20h12"/>
                            <path d="M6 8h12"/>
                            <path d="M6 4h12"/>
                        </svg>
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{summary.muscleMass ?? '--'}<span>kg</span></div>
                        <div className="stat-card__label">Muscle Mass</div>
                        <div className="stat-card__detail">
                            {summary.muscleMass && summary.currentWeight ? `${((summary.muscleMass / summary.currentWeight) * 100).toFixed(0)}% of total body weight` : 'Log your first measurement'}
                        </div>
                    </div>
                    <div className="stat-card__right">
                        {muscleChange !== 0 && (
                            <div className={`stat-card__trend ${muscleChange >= 0 ? 'positive' : 'negative'}`}>
                                {muscleChange >= 0 ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                    </svg>
                                )}
                                +{muscleChange.toFixed(1)}kg
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card stat-card--bmi">
                    <div className="stat-card__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <div className="stat-card__body">
                        <div className="stat-card__value">{bmiValue ?? '--'}</div>
                        <div className="stat-card__label">BMI</div>
                        <div className="stat-card__detail">Category: {bmiValue ? (parseFloat(bmiValue) < 18.5 ? 'Underweight' : parseFloat(bmiValue) < 25 ? 'Normal' : parseFloat(bmiValue) < 30 ? 'Overweight' : 'Obese') : 'N/A'}</div>
                    </div>
                    <div className="stat-card__right">
                        {bmiValue && (
                            <div className={`bmi-indicator ${parseFloat(bmiValue) < 18.5 ? 'underweight' : parseFloat(bmiValue) < 25 ? 'healthy' : parseFloat(bmiValue) < 30 ? 'overweight' : 'obese'}`}>
                                {parseFloat(bmiValue) < 18.5 ? 'Underweight' : parseFloat(bmiValue) < 25 ? 'Healthy' : parseFloat(bmiValue) < 30 ? 'Overweight' : 'Obese'}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Three Column Grid */}
            <motion.div className="three-col-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {/* Personal Bests */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="7"/>
                            <polyline points="14 22 14 16 8 16 8 22"/>
                        </svg>
                        <h3>Personal Records</h3>
                        <button className="panel-add-btn" onClick={() => {/* Open log PR modal */}}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                    <div className="pb-list">
                        {/* This would be populated with actual PRs from context/state */}
                        <div className="pb-item">
                            <div className="pb-item__left">
                                <span className="pb-category-badge" data-category="push">P</span>
                                <div className="pb-item__info">
                                    <span className="pb-exercise">Bench Press</span>
                                    <span className="pb-date">Jan 15, 2024</span>
                                </div>
                            </div>
                            <div className="pb-item__right">
                                <span className="pb-weight">185 lbs</span>
                                <span className="pb-improvement">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 17l5-5 5 5"/>
                                    </svg>
                                    +5
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="panel-btn">
                        View All PRs (0)
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </div>

                {/* Weekly Summary */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <h3>This Week</h3>
                    </div>
                    <div className="weekly-summary">
                        <div className="weekly-summary__ring">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                                <circle
                                    cx="50" cy="50" r="45" fill="none"
                                    stroke="#007AFF" strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(summary.consistencyRate || 0) * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="weekly-summary__ring-value">
                                <span className="ring-percent">{Math.round(summary.consistencyRate || 0)}%</span>
                                <span className="ring-label">Complete</span>
                            </div>
                        </div>
                        <div className="weekly-summary__stats">
                            <div className="weekly-stat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <span>{summary.avgWorkoutDuration} min</span>
                                <span className="weekly-stat__label">Avg Session</span>
                            </div>
                            <div className="weekly-stat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-3"/>
                                    <path d="M10 22V12a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3Z"/>
                                    <path d="M7 22h10"/>
                                    <path d="M12 22v-5"/>
                                </svg>
                                <span>{summary.totalCaloriesBurned}</span>
                                <span className="weekly-stat__label">Calories</span>
                            </div>
                            <div className="weekly-stat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 4h4l2 4h6"/>
                                    <path d="M11 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                    <path d="M20 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                    <path d="M4 16h16"/>
                                </svg>
                                <span>{summary.totalWorkouts}</span>
                                <span className="weekly-stat__label">Total Workouts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trainer Feedback */}
                <div className="panel-card">
                    <div className="panel-card__header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <h3>Trainer Notes</h3>
                        <span className="notes-count">0</span>
                    </div>
                    <div className="trainer-feedback">
                        <div className="empty-feedback">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                            <p>No notes from your trainer yet</p>
                        </div>
                    </div>
                    <button className="panel-btn panel-btn--primary">
                        Read All Notes
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OverviewTab;