import React from 'react';
import { X, Dumbbell, ExternalLink, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Exercise {
    name: string;
    sets?: number | string;
    reps?: number | string;
    weight?: number | string;
    restTime?: number | string;
    notes?: string;
}

interface WorkoutPlanPayload {
    planId?: number;
    title?: string;
    description?: string;
    exerciseCount?: number;
    exercises?: Exercise[];
}

interface WorkoutPlanViewModalProps {
    payload: WorkoutPlanPayload;
    onClose: () => void;
}

const WorkoutPlanViewModal: React.FC<WorkoutPlanViewModalProps> = ({ payload, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isTrainer = user?.role === 'TRAINER' || user?.role === 'ADMIN' || user?.role === 'OWNER';
    const exercises = payload.exercises ?? [];

    const handleStartWorkout = () => {
        if (payload.planId) {
            navigate(`/member/workouts/${payload.planId}`);
        }
        onClose();
    };

    const handleEditPlan = () => {
        if (payload.planId) {
            navigate(`/trainer/workout-plans/${payload.planId}/edit`);
        }
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal--workout-view">
                {/* Header */}
                <div className="modal__header">
                    <div className="modal__header-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                        <Dumbbell size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 className="modal__title">{payload.title || 'Workout Plan'}</h2>
                        {payload.description && (
                            <p className="modal__subtitle">{payload.description}</p>
                        )}
                    </div>
                    <button className="modal__close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* Body */}
                <div className="modal__body">
                    {exercises.length === 0 ? (
                        <div className="modal__empty">
                            <Dumbbell size={32} style={{ opacity: 0.3 }} />
                            <p>No exercise details included in this plan.</p>
                        </div>
                    ) : (
                        <div className="workout-view__table-wrap">
                            <table className="workout-view__table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Exercise</th>
                                        <th>Sets</th>
                                        <th>Reps</th>
                                        <th>Weight</th>
                                        <th>Rest</th>
                                        {exercises.some(e => e.notes) && <th>Notes</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {exercises.map((ex, i) => (
                                        <tr key={i}>
                                            <td className="workout-view__num">{i + 1}</td>
                                            <td className="workout-view__name">{ex.name}</td>
                                            <td>{ex.sets ?? '—'}</td>
                                            <td>{ex.reps ?? '—'}</td>
                                            <td>{ex.weight ?? '—'}</td>
                                            <td>{ex.restTime ? `${ex.restTime}s` : '—'}</td>
                                            {exercises.some(e => e.notes) && (
                                                <td className="workout-view__notes">{ex.notes ?? ''}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p className="workout-view__count">
                        {exercises.length > 0
                            ? `${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`
                            : payload.exerciseCount
                            ? `${payload.exerciseCount} exercises`
                            : null}
                    </p>
                </div>

                {/* Footer */}
                <div className="modal__footer">
                    <button className="btn btn--ghost" onClick={onClose}>Close</button>
                    {isTrainer ? (
                        <button
                            className="btn btn--secondary"
                            onClick={handleEditPlan}
                            disabled={!payload.planId}
                            title={!payload.planId ? 'Plan ID not available' : undefined}
                        >
                            <Edit2 size={14} style={{ marginRight: 6 }} />
                            Edit Plan
                        </button>
                    ) : (
                        <button
                            className="btn btn--primary"
                            onClick={handleStartWorkout}
                            disabled={!payload.planId}
                            title={!payload.planId ? 'Plan ID not available' : undefined}
                        >
                            <ExternalLink size={14} style={{ marginRight: 6 }} />
                            Start Workout
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlanViewModal;
