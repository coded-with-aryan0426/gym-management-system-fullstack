import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { trainerApi, type TrainerMember } from '../../services/trainerApi';
import './CreateSessionModal.css';

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
    initialTime?: number; // hour (0-23)
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
    isOpen, onClose, onSuccess, initialDate, initialTime
}) => {
    const [members, setMembers] = useState<TrainerMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Form State
    const [memberId, setMemberId] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [duration, setDuration] = useState<number>(60);
    const [notes, setNotes] = useState<string>('');
    const [isRecurring, setIsRecurring] = useState(false);

    // Application State
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchMembers();

            // Set initial values if provided
            if (initialDate) {
                setDate(initialDate.toISOString().split('T')[0]);

                if (initialTime !== undefined) {
                    // Format hour to HH:00
                    const h = initialTime < 10 ? `0${initialTime}` : `${initialTime}`;
                    setTime(`${h}:00`);
                }
            } else {
                // Default to today
                const today = new Date();
                setDate(today.toISOString().split('T')[0]);
            }
        }
    }, [isOpen, initialDate, initialTime]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const data = await trainerApi.getAssignedMembers();
            setMembers(data);
        } catch (err) {
            console.error('Failed to load members', err);
            setError('Failed to load members list');
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (!memberId) throw new Error('Please select a member');
            if (!date) throw new Error('Please select a date');
            if (!time) throw new Error('Please select a time');

            const sessionDateTime = `${date}T${time}:00`;
            const selectedDate = new Date(sessionDateTime);
            const now = new Date();

            if (selectedDate < now) {
                throw new Error('Cannot schedule sessions in the past');
            }

            await trainerApi.createPTSession({
                memberId: parseInt(memberId),
                sessionDate: sessionDateTime,
                durationMinutes: duration,
                notes,
                isRecurring
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to create session:', err);
            setError(err.message || 'Failed to create session');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Schedule PT Session</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="modal-error-banner">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="create-session-form">
                        <div className="form-group">
                            <label><User size={14} /> Member</label>
                            <select
                                value={memberId}
                                onChange={e => setMemberId(e.target.value)}
                                disabled={loadingMembers}
                                required
                            >
                                <option value="">Select a member...</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Calendar size={14} /> Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><Clock size={14} /> Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <div className="duration-options">
                                {[30, 45, 60, 90].map(mins => (
                                    <button
                                        type="button"
                                        key={mins}
                                        className={`duration-chip ${duration === mins ? 'active' : ''}`}
                                        onClick={() => setDuration(mins)}
                                    >
                                        {mins} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FileText size={14} /> Notes</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Session focus, goals, or preparation instructions..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={e => setIsRecurring(e.target.checked)}
                                />
                                Recurring Session (Weekly)
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-save" disabled={submitting}>
                                {submitting ? 'Scheduling...' : 'Schedule Session'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSessionModal;
