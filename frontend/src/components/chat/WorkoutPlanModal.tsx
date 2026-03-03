import React, { useState, useEffect } from 'react';
import { X, Dumbbell, ChevronRight, Loader } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import { showToast } from '../../utils/toast';

interface WorkoutPlanModalProps {
    onClose: () => void;
}

interface WorkoutPlan {
    id: number;
    name: string;
    description?: string;
    exerciseCount?: number;
    updatedAt?: string;
    exercises?: any[];
}

const WorkoutPlanModal: React.FC<WorkoutPlanModalProps> = ({ onClose }) => {
    const { activeConversation, sendMessage } = useChat();
    const { user } = useAuth();
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<WorkoutPlan | null>(null);
    const [sending, setSending] = useState(false);

    // Get the member (other participant) from active conversation
    const getMemberId = () => {
        if (!activeConversation) return null;
        const currentUserId = user?.userId || Number(user?.id);
        const other = activeConversation.participants?.find(
            (p: any) => Number(p.userId) !== currentUserId
        );
        return other?.userId ?? null;
    };

    useEffect(() => {
        const memberId = getMemberId();
        if (!memberId) { setLoading(false); return; }

        setLoading(true);
        // Try member-specific plans first, fall back to trainer's own plans
        apiClient.get(`/members/${memberId}/workout-plans`)
            .then(res => {
                const data = res.data?.data ?? res.data ?? [];
                setPlans(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                // Fall back to trainer's plans
                apiClient.get(`/trainer/workout-plans`)
                    .then(res => {
                        const data = res.data?.data ?? res.data ?? [];
                        setPlans(Array.isArray(data) ? data : []);
                    })
                    .catch(() => setPlans([]))
                    .finally(() => setLoading(false));
            })
            .finally(() => setLoading(false));
    }, [activeConversation]);

    const handleSend = async () => {
        if (!selected) return;
        setSending(true);
        try {
            const payload = JSON.stringify({
                planId: selected.id,
                title: selected.name,
                description: selected.description,
                exerciseCount: selected.exerciseCount ?? selected.exercises?.length ?? 0,
                exercises: selected.exercises ?? [],
            });
            await sendMessage(`Shared workout plan: ${selected.name}`, 'WORKOUT_PLAN', payload);
            showToast.success('Workout plan sent!');
            onClose();
        } catch {
            showToast.error('Failed to send workout plan');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal--sm">
                <div className="modal__header">
                    <div className="modal__header-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                        <Dumbbell size={18} />
                    </div>
                    <h2 className="modal__title">Share Workout Plan</h2>
                    <button className="modal__close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="modal__body">
                    {loading ? (
                        <div className="modal__loading">
                            <Loader size={24} className="spin" />
                            <span>Loading plans...</span>
                        </div>
                    ) : plans.length === 0 ? (
                        <p className="modal__empty">No workout plans found.</p>
                    ) : (
                        <div className="plan-list">
                            {plans.map(plan => (
                                <button
                                    key={plan.id}
                                    className={`plan-item ${selected?.id === plan.id ? 'plan-item--selected' : ''}`}
                                    onClick={() => setSelected(plan)}
                                >
                                    <div className="plan-item__info">
                                        <span className="plan-item__name">{plan.name}</span>
                                        {plan.description && (
                                            <span className="plan-item__desc">{plan.description}</span>
                                        )}
                                        {(plan.exerciseCount != null || plan.exercises?.length) && (
                                            <span className="plan-item__meta">
                                                {plan.exerciseCount ?? plan.exercises?.length} exercises
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="plan-item__arrow" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn--primary"
                        disabled={!selected || sending}
                        onClick={handleSend}
                    >
                        {sending ? 'Sending...' : 'Send Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlanModal;
